import { NextRequest, NextResponse } from "next/server";
type Severity = "low" | "moderate" | "high";
type Interaction = { pair: [string,string]; severity: Severity; note: string };
type MedsCheckRequest = { meds: string[] };
type MedsCheckResponse = { interactions: Interaction[]; disclaimer: string };

export const runtime = "nodejs"; export const dynamic = "force-dynamic";

const RULES: Record<string, { with: string; severity: Severity; note: string }[]> = {
  ibuprofen: [
    { with: "warfarin", severity: "high", note: "Bleeding risk increases." },
    { with: "aspirin",  severity: "moderate", note: "GI bleeding/ulcer risk." },
  ],
  metformin: [{ with: "alcohol", severity: "moderate", note: "Lactic acidosis risk may increase." }],
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MedsCheckRequest;
    const meds = (body?.meds || []).map(m=>m.toLowerCase().trim()).filter(Boolean);
    if (!meds.length) return NextResponse.json({ error: "No meds" }, { status: 400 });

    const seen = new Set<string>(); const interactions: Interaction[] = [];
    for (const a of meds) for (const r of RULES[a] || []) if (meds.includes(r.with)) {
      const key = [a, r.with].sort().join("|");
      if (!seen.has(key)) { seen.add(key); interactions.push({ pair: [a, r.with].sort() as [string,string], severity: r.severity, note: r.note }); }
    }

    const res: MedsCheckResponse = { interactions, disclaimer: "Education only. Confirm with a pharmacist/clinician." };
    return NextResponse.json(res);
  } catch (e:any) { return NextResponse.json({ error: String(e.message||e) }, { status: 500 }); }
}
