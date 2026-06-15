import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// ============== OCR ==============
type OcrFields = {
  detected_name: string | null;
  detected_id_number: string | null; // NIDA (landlord) or Reg No (student)
  detected_dob: string | null; // YYYY-MM-DD
  detected_institution: string | null;
  confidence: number; // 0-100
  raw_text: string | null;
};

async function runGeminiOcr(
  apiKey: string,
  imageUrls: string[],
  role: "landlord" | "student",
): Promise<OcrFields> {
  const prompt =
    role === "landlord"
      ? `You are an OCR engine for a Tanzanian National ID (NIDA) card.
Extract these fields exactly as printed on the card image(s):
- detected_name: full name (given + surname)
- detected_id_number: the 20-digit NIDA number (digits only, strip spaces/dashes)
- detected_dob: date of birth in YYYY-MM-DD
- detected_institution: null
- confidence: 0-100 integer (how clear the ID is)
- raw_text: the full OCR text you read (1-2 lines max)`
      : `You are an OCR engine for a University of Dar es Salaam (UDSM) Student ID card.
Extract these fields exactly as printed on the card image(s):
- detected_name: full student name
- detected_id_number: the student registration number as printed (e.g. "2023-04-12345" or "2023/04/12345")
- detected_dob: null (not on student card)
- detected_institution: the institution / university name printed on the card
- confidence: 0-100 integer
- raw_text: the full OCR text you read (1-2 lines max)`;

  const content: Array<Record<string, unknown>> = [
    {
      type: "text",
      text: `${prompt}

Return ONLY a JSON object with EXACTLY these keys: detected_name, detected_id_number, detected_dob, detected_institution, confidence, raw_text. Use null for missing values. No markdown, no commentary.`,
    },
    ...imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
  ];

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content }],
      response_format: { type: "json_object" },
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
  const parsed = JSON.parse(raw);
  return {
    detected_name: parsed.detected_name ?? null,
    detected_id_number: parsed.detected_id_number ?? null,
    detected_dob: parsed.detected_dob ?? null,
    detected_institution: parsed.detected_institution ?? null,
    confidence: Number(parsed.confidence) || 0,
    raw_text: parsed.raw_text ?? null,
  };
}

// ============== Rules ==============
type Rule = { name: string; passed: boolean; reason?: string };

function normName(s: string | null | undefined): string[] {
  if (!s) return [];
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

function nameMatchAtLeastTwo(detected: string | null, expected: string): Rule {
  const a = new Set(normName(detected));
  const b = normName(expected);
  const overlap = b.filter((t) => a.has(t)).length;
  return {
    name: "Name match (≥2 names)",
    passed: overlap >= 2,
    reason: overlap >= 2 ? undefined : `Found "${detected ?? "—"}" — expected "${expected}".`,
  };
}

function confidenceRule(c: number, threshold = 60): Rule {
  return {
    name: `OCR confidence ≥ ${threshold}%`,
    passed: c >= threshold,
    reason: c >= threshold ? undefined : `Confidence ${c}% — please upload a clearer photo.`,
  };
}

// --- Landlord rules ---
function validateLandlord(ocr: OcrFields, expected: { name: string; nid: string; dob: string }): Rule[] {
  const rules: Rule[] = [];
  rules.push(confidenceRule(ocr.confidence, 60));

  const digits = (ocr.detected_id_number ?? "").replace(/\D/g, "");
  rules.push({
    name: "NIDA number is 20 digits",
    passed: /^\d{20}$/.test(digits),
    reason: /^\d{20}$/.test(digits) ? undefined : `Detected "${ocr.detected_id_number ?? "—"}" — not a 20-digit NIDA number.`,
  });

  rules.push({
    name: "NIDA number matches input",
    passed: digits === expected.nid,
    reason: digits === expected.nid ? undefined : `Card shows ${digits || "—"}, you entered ${expected.nid}.`,
  });

  // First 8 digits = YYYYMMDD → must match expected DOB
  let dobFromNid: string | null = null;
  if (/^\d{20}$/.test(digits)) {
    const y = digits.slice(0, 4),
      m = digits.slice(4, 6),
      d = digits.slice(6, 8);
    const dt = new Date(`${y}-${m}-${d}`);
    if (!isNaN(dt.getTime())) dobFromNid = `${y}-${m}-${d}`;
  }
  rules.push({
    name: "First 8 digits of NIDA = your date of birth",
    passed: !!dobFromNid && dobFromNid === expected.dob,
    reason:
      dobFromNid === expected.dob
        ? undefined
        : `NID encodes DOB ${dobFromNid ?? "—"}, you entered ${expected.dob}.`,
  });

  rules.push(nameMatchAtLeastTwo(ocr.detected_name, expected.name));
  return rules;
}

// --- Student rules ---
function validateStudent(
  ocr: OcrFields,
  expected: { name: string; regno: string; university: string },
): Rule[] {
  const rules: Rule[] = [];
  rules.push(confidenceRule(ocr.confidence, 55));

  const inst = (ocr.detected_institution ?? "").toLowerCase();
  const isUdsm =
    inst.includes("dar es salaam") ||
    inst.includes("udsm") ||
    inst.includes("university of dar");
  rules.push({
    name: "Institution is University of Dar es Salaam",
    passed: isUdsm,
    reason: isUdsm ? undefined : `Card institution "${ocr.detected_institution ?? "—"}" is not UDSM.`,
  });

  rules.push(nameMatchAtLeastTwo(ocr.detected_name, expected.name));

  // Reg no format: e.g. 2023-04-12345  or 2023/04/12345 (year, programme/faculty code, serial)
  const detected = (ocr.detected_id_number ?? "").replace(/\s+/g, "").replace(/\//g, "-");
  const expectedNorm = expected.regno.replace(/\s+/g, "").replace(/\//g, "-");
  const regnoRe = /^(\d{4})[-](\d{1,3})[-](\d{3,6})$/;

  rules.push({
    name: "Reg number format (YYYY-NN-NNNNN)",
    passed: regnoRe.test(detected),
    reason: regnoRe.test(detected) ? undefined : `Detected "${ocr.detected_id_number ?? "—"}".`,
  });

  rules.push({
    name: "Reg number matches what you entered",
    passed: detected.toLowerCase() === expectedNorm.toLowerCase(),
    reason:
      detected.toLowerCase() === expectedNorm.toLowerCase()
        ? undefined
        : `Card shows ${detected || "—"}, you entered ${expected.regno}.`,
  });

  // Intake year must fall in window [currentYear-3, currentYear]
  const match = detected.match(regnoRe);
  const intakeYear = match ? Number(match[1]) : NaN;
  const currentYear = new Date().getFullYear();
  const validYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  rules.push({
    name: `Intake year within ${validYears[3]}–${currentYear}`,
    passed: validYears.includes(intakeYear),
    reason: validYears.includes(intakeYear)
      ? undefined
      : `Intake year ${isNaN(intakeYear) ? "—" : intakeYear} is outside allowed range.`,
  });

  return rules;
}

// ============== Handler ==============
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
          if (!LOVABLE_API_KEY)
            return new Response("AI key missing", { status: 500, headers: CORS });

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
            role: "landlord" | "student";
            id_front_url: string;
            id_back_url?: string;
            selfie_url?: string;
            expected_name: string;
            expected_nid?: string;
            expected_dob?: string;
            expected_regno?: string;
            expected_university?: string;
          };

          if (!body.role || !body.id_front_url || !body.expected_name) {
            return Response.json({ error: "Missing required fields" }, { status: 400, headers: CORS });
          }

          const { data: profile, error: pErr } = await supabase
            .from("profiles")
            .select("ocr_attempts, verification_status")
            .eq("id", userId)
            .single();
          if (pErr) throw pErr;

          if ((profile as { verification_status?: string }).verification_status === "approved") {
            return Response.json(
              { status: "approved", passed: true, message: "Already verified.", rules: [] },
              { headers: CORS },
            );
          }

          const MAX = 3;
          const attempts = ((profile as { ocr_attempts?: number }).ocr_attempts ?? 0) + 1;
          const images = [body.id_front_url];
          if (body.id_back_url) images.push(body.id_back_url);

          let ocr: OcrFields;
          try {
            ocr = await runGeminiOcr(LOVABLE_API_KEY, images, body.role);
          } catch (e) {
            await supabase
              .from("profiles")
              .update({ ocr_attempts: attempts, ocr_data: { error: String(e) } } as never)
              .eq("id", userId);
            return Response.json(
              {
                status: "error",
                passed: false,
                message: "OCR service failed. Please try again.",
                attempts,
                max_attempts: MAX,
                rules: [],
              },
              { status: 200, headers: CORS },
            );
          }

          // Run rules
          let rules: Rule[] = [];
          if (body.role === "landlord") {
            if (!body.expected_nid || !body.expected_dob) {
              return Response.json(
                { error: "expected_nid and expected_dob required for landlord" },
                { status: 400, headers: CORS },
              );
            }
            rules = validateLandlord(ocr, {
              name: body.expected_name,
              nid: body.expected_nid,
              dob: body.expected_dob,
            });
          } else {
            if (!body.expected_regno) {
              return Response.json(
                { error: "expected_regno required for student" },
                { status: 400, headers: CORS },
              );
            }
            rules = validateStudent(ocr, {
              name: body.expected_name,
              regno: body.expected_regno,
              university: body.expected_university ?? "University of Dar es Salaam",
            });
          }

          const passed = rules.every((r) => r.passed);
          let nextStatus: "approved" | "pending" = "pending";
          let message = "";

          if (passed) {
            nextStatus = "approved";
            message = "All checks passed — you are verified!";
          } else if (attempts >= MAX) {
            message = `Automatic verification couldn't confirm your ID after ${MAX} attempts. Your account has been sent to admin for manual review (24–48h). You can browse listings in the meantime.`;
          } else {
            const failed = rules.filter((r) => !r.passed).length;
            message = `${failed} check(s) didn't pass (attempt ${attempts}/${MAX}). Please review the details below and re-upload a clearer photo.`;
          }

          const patch: Record<string, unknown> = {
            ocr_attempts: attempts,
            ocr_data: { ocr, rules, attempt: attempts, role: body.role },
            verification_status: nextStatus,
            nid_front_url: body.id_front_url,
            nid_back_url: body.id_back_url ?? null,
          };
          if (body.role === "student") patch.student_id_url = body.id_front_url;
          if (nextStatus === "approved") patch.verified_at = new Date().toISOString();

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
              max_attempts: MAX,
              confidence: ocr.confidence,
              detected: ocr,
              rules,
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
