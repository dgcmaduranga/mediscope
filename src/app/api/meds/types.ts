import { NextRequest, NextResponse } from "next/server";
import type { MedsCheckRequest, MedsCheckResponse } from "../../../lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// tiny demo rule base
const RULES: Record<string, { with: string; severity: "low"|"moderate"|"high"; note: string }[]> = {
  "ibuprofen": [
    { with: "warfarin", severity: "high", note: "Bleeding risk increases." },
    { with: "aspirin", severity: "moderate", note: "GI bleeding/ulcer risk." },
  ],
  "metformin": [
    { with: "alcohol", severity: "moderate", note: "Lactic acidosis risk increases." },
  ],
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as MedsCheckRequest;
  if (!body?.meds?.length) return NextResponse.json({ error: "No meds" }, { status: 400 });

  const meds = body.meds.map((m) => m.toLowerCase().trim()).filter(Boolean);
  const seen = new Set<string>();
  const interactions: MedsCheckResponse["interactions"] = [];

  for (const a of meds) {
    const rules = RULES[a] || [];
    for (const r of rules) {
      if (meds.includes(r.with)) {
        const key = [a, r.with].sort().join("|");
        if (!seen.has(key)) {
          seen.add(key);
          interactions.push({ pair: [a, r.with].sort() as [string,string], severity: r.severity, note: r.note });
        }
      }
    }
  }

  return NextResponse.json({
    interactions,
    disclaimer: "This is informational only. Always confirm interactions with a pharmacist or clinician.",
  } satisfies MedsCheckResponse);
}
