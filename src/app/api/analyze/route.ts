import { NextRequest, NextResponse } from "next/server";

// Ensure Node runtime (not edge) for FormData file handling
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  // For now we won't read/parse, just simulate OCR + parsing.
  // Later: send to FastAPI OCR and parse labs.
  const mock = {
    extracted: [
      { name: "Hemoglobin", value: 13.2, unit: "g/dL", ref_low: 13, ref_high: 17, interpretation: "Within ref" },
      { name: "WBC", value: 11.4, unit: "x10^9/L", ref_low: 4, ref_high: 11, interpretation: "Slightly high" },
      { name: "Platelets", value: 250, unit: "x10^9/L", ref_low: 150, ref_high: 400, interpretation: "Normal" },
    ],
    summary:
      "Most values appear within reference ranges. White cell count is mildly elevated; correlate with symptoms (fever, sore throat). This is informational only, not a diagnosis.",
    cautions: [
      "This is not a medical diagnosis.",
      "If you have severe symptoms (e.g., chest pain, shortness of breath), seek urgent care.",
    ],
  };

  return NextResponse.json(mock, { status: 200 });
}
