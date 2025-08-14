import { NextRequest, NextResponse } from "next/server";
import type { SkinResponse } from "../../../lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No image" }, { status: 400 });
  }

  // TODO: later -> send to FastAPI /skin with the image
  const mock: SkinResponse = {
    top: [
      { condition: "Eczema (example)", confidence: 0.41, description: "Itchy, dry patches; worsens with irritants." },
      { condition: "Psoriasis (example)", confidence: 0.33, description: "Well‑defined plaques with silvery scales." },
      { condition: "Benign nevus (example)", confidence: 0.16, description: "Stable, symmetric mole." },
    ],
    note:
      "Screening only. If a lesion is new, changing, bleeding, or asymmetric with irregular borders, see a clinician promptly.",
  };
  return NextResponse.json(mock, { status: 200 });
}
