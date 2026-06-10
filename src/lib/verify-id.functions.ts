import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const InputSchema = z.object({
  nid_front_url: z.string().url(),
  nid_back_url: z.string().url().optional(),
  selfie_url: z.string().url().optional(),
  expected_name: z.string().min(2).max(120),
  expected_nid: z.string().regex(/^\d{20}$/),
});

type OcrExtract = {
  detected_name: string | null;
  detected_nid: string | null;
  detected_dob: string | null;
  name_match: boolean;
  nid_match: boolean;
  confidence: number; // 0-100
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

Return ONLY a JSON object (no markdown, no fences) with EXACTLY these keys:
{
  "detected_name": "<full name from ID or null>",
  "detected_nid": "<20-digit NID number from ID or null>",
  "detected_dob": "<date of birth in YYYY-MM-DD if visible or null>",
  "name_match": <true if detected name reasonably matches expected (allow word reordering, accents, case)>,
  "nid_match": <true if detected NID equals expected NID exactly>,
  "confidence": <integer 0-100, your overall confidence the ID is genuine and matches>,
  "reasoning": "<one short sentence>"
}`,
    },
    ...imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
  ];

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content }],
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OCR gateway error ${resp.status}: ${text.slice(0, 300)}`);
  }
  const json = await resp.json();
  const raw = json?.choices?.[0]?.message?.content ?? "";
  const cleaned = String(raw).replace(/```json|```/g, "").trim();
  let parsed: OcrExtract;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("OCR response was not valid JSON: " + cleaned.slice(0, 200));
  }
  return parsed;
}

export const verifyIdentity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const { supabase, userId } = context;

    // Fetch current attempts
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("ocr_attempts, verification_status")
      .eq("id", userId)
      .single();
    if (pErr) throw pErr;

    if (profile.verification_status === "approved") {
      return { status: "approved", message: "Already verified.", attempts: profile.ocr_attempts };
    }

    const attempts = (profile.ocr_attempts ?? 0) + 1;

    const images = [data.nid_front_url];
    if (data.nid_back_url) images.push(data.nid_back_url);
    if (data.selfie_url) images.push(data.selfie_url);

    let ocr: OcrExtract;
    try {
      ocr = await runGeminiOcr(apiKey, images, data.expected_name, data.expected_nid);
    } catch (e) {
      await supabase
        .from("profiles")
        .update({ ocr_attempts: attempts, ocr_data: { error: String(e) } })
        .eq("id", userId);
      return {
        status: "error",
        message: "OCR service failed. Please try again.",
        attempts,
        max_attempts: 3,
      };
    }

    // Confidence tiers
    const passed =
      ocr.nid_match && ocr.name_match && ocr.confidence >= 75;
    let nextStatus: "approved" | "pending" | "rejected" = "pending";
    let message = "";

    if (passed) {
      nextStatus = "approved";
      message = "Identity verified successfully.";
    } else if (attempts >= 3) {
      // 3 trials → keep pending, admin review
      nextStatus = "pending";
      message =
        "Automatic verification failed after 3 attempts. Your account is pending admin review — you can browse listings while we verify your ID.";
    } else {
      nextStatus = "pending";
      message = `Verification did not pass (attempt ${attempts}/3). ${
        !ocr.nid_match ? "ID number doesn't match. " : ""
      }${!ocr.name_match ? "Name doesn't match. " : ""}Please re-upload clearer photos.`;
    }

    const updatePatch = {
      ocr_attempts: attempts,
      ocr_data: { ...ocr, attempt: attempts } as unknown,
      verification_status: nextStatus,
      nid_front_url: data.nid_front_url,
      nid_back_url: data.nid_back_url ?? null,
      ...(nextStatus === "approved" ? { verified_at: new Date().toISOString() } : {}),
    };

    const { error: uErr } = await supabase.from("profiles").update(updatePatch as never).eq("id", userId);
    if (uErr) throw uErr;

    return {
      status: nextStatus,
      passed,
      message,
      attempts,
      max_attempts: 3,
      confidence: ocr.confidence,
      detected: {
        name: ocr.detected_name,
        nid: ocr.detected_nid,
      },
    };
  });

const AdminInput = z.object({
  user_id: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().max(500).optional(),
});

export const adminSetVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AdminInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Verify admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    const patch = {
      verification_status: data.decision,
      rejection_reason: data.decision === "rejected" ? data.reason ?? null : null,
      ...(data.decision === "approved" ? { verified_at: new Date().toISOString() } : {}),
    };

    const { error } = await supabase.from("profiles").update(patch as never).eq("id", data.user_id);
    if (error) throw error;
    return { ok: true };
  });
