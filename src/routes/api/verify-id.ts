import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

type OcrExtract = {
  detected_name: string | null;
  detected_nid: string | null;
  detected_dob: string | null;
  name_match: boolean;
  nid_match: boolean;
  confidence: number;
  reasoning: string;
};

async function runGeminiOcr(
  apiKey: string,
  imageUrls: string[],
  expectedName: string,
  expectedNid: string,
): Promise<OcrExtract> {
  const content: Array<Record<string, unknown>> = [
    {
      type: "text",
      text: `You are an ID verification OCR system. Extract data from the provided Tanzanian National ID image(s) and compare against the expected values.

Expected name: "${expectedName}"
Expected NID number: "${expectedNid}" (20 digits)

Return ONLY a JSON object (no markdown, no code fences) with EXACTLY these keys:
{
  "detected_name": "<full name from ID or null>",
  "detected_nid": "<20-digit NID number from ID or null>",
  "detected_dob": "<date of birth YYYY-MM-DD or null>",
  "name_match": <true if detected name reasonably matches expected (allow word reordering, accents, case)>,
  "nid_match": <true if detected NID equals expected NID exactly>,
  "confidence": <integer 0-100>,
  "reasoning": "<one short sentence>"
}`,
    },
    ...imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
  ];

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content }],
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OCR gateway ${resp.status}: ${text.slice(0, 200)}`);
  }
  const json = await resp.json();
  const raw = String(json?.choices?.[0]?.message?.content ?? "")
    .replace(/```json|```/g, "")
    .trim();
  return JSON.parse(raw) as OcrExtract;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const Route = createFileRoute("/api/verify-id")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const auth = request.headers.get("authorization") ?? "";
          const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
          if (!token) return new Response("Unauthorized", { status: 401, headers: CORS });

          const SUPABASE_URL = process.env.SUPABASE_URL!;
          const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY!;
          if (!LOVABLE_API_KEY) return new Response("AI key missing", { status: 500, headers: CORS });

          const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          });

          const { data: claims, error: cErr } = await supabase.auth.getClaims(token);
          if (cErr || !claims?.claims?.sub) {
            return new Response("Invalid token", { status: 401, headers: CORS });
          }
          const userId = claims.claims.sub as string;

          const body = (await request.json()) as {
            nid_front_url?: string;
            nid_back_url?: string;
            selfie_url?: string;
            expected_name?: string;
            expected_nid?: string;
          };

          if (!body.nid_front_url || !body.expected_name || !body.expected_nid) {
            return Response.json({ error: "Missing required fields" }, { status: 400, headers: CORS });
          }
          if (!/^\d{20}$/.test(body.expected_nid)) {
            return Response.json({ error: "expected_nid must be 20 digits" }, { status: 400, headers: CORS });
          }

          const { data: profile, error: pErr } = await supabase
            .from("profiles")
            .select("ocr_attempts, verification_status")
            .eq("id", userId)
            .single();
          if (pErr) throw pErr;

          if ((profile as { verification_status?: string }).verification_status === "approved") {
            return Response.json({ status: "approved", message: "Already verified." }, { headers: CORS });
          }

          const attempts = ((profile as { ocr_attempts?: number }).ocr_attempts ?? 0) + 1;
          const images = [body.nid_front_url];
          if (body.nid_back_url) images.push(body.nid_back_url);
          if (body.selfie_url) images.push(body.selfie_url);

          let ocr: OcrExtract;
          try {
            ocr = await runGeminiOcr(LOVABLE_API_KEY, images, body.expected_name, body.expected_nid);
          } catch (e) {
            await supabase
              .from("profiles")
              .update({ ocr_attempts: attempts, ocr_data: { error: String(e) } } as never)
              .eq("id", userId);
            return Response.json(
              { status: "error", message: "OCR service failed. Please try again.", attempts, max_attempts: 3 },
              { status: 200, headers: CORS },
            );
          }

          const passed = ocr.nid_match && ocr.name_match && ocr.confidence >= 75;
          let nextStatus: "approved" | "pending" = "pending";
          let message = "";

          if (passed) {
            nextStatus = "approved";
            message = "Identity verified successfully! You can now request property viewings.";
          } else if (attempts >= 3) {
            message =
              "Automatic verification couldn't confirm your ID after 3 attempts. Your account is pending admin review — you can browse listings while we verify your ID manually (24–48h).";
          } else {
            message = `Verification did not pass (attempt ${attempts}/3). ${
              !ocr.nid_match ? "ID number doesn't match. " : ""
            }${!ocr.name_match ? "Name doesn't match. " : ""}Please re-upload clearer photos.`;
          }

          const patch = {
            ocr_attempts: attempts,
            ocr_data: { ...ocr, attempt: attempts },
            verification_status: nextStatus,
            nid_front_url: body.nid_front_url,
            nid_back_url: body.nid_back_url ?? null,
            ...(nextStatus === "approved" ? { verified_at: new Date().toISOString() } : {}),
          };
          const { error: uErr } = await supabase
            .from("profiles")
            .update(patch as never)
            .eq("id", userId);
          if (uErr) throw uErr;

          return Response.json(
            {
              status: nextStatus,
              passed,
              message,
              attempts,
              max_attempts: 3,
              confidence: ocr.confidence,
              detected: { name: ocr.detected_name, nid: ocr.detected_nid },
            },
            { headers: CORS },
          );
        } catch (e) {
          console.error("verify-id error", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "Server error" },
            { status: 500, headers: CORS },
          );
        }
      },
    },
  },
});
