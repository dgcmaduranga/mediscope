import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

type Interaction = { pair: [string, string]; severity: "low"|"moderate"|"high"; note: string };

export async function POST(req: NextRequest) {
  try {
    if (!client) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }
    const { meds, interactions } = await req.json() as {
      meds: string[];
      interactions?: Interaction[];
    };

    const SYSTEM = `You are a medication safety educator for the public.
- Do NOT give medical advice or dosing.
- Explain in simple language why combinations might be risky.
- If rule-based interactions are provided, prioritize explaining those.
- If none are provided, give general cautions (alcohol, NSAIDs, blood thinners, serotonin syndrome, etc.).
- Always finish with a reminder to confirm with a pharmacist/clinician.
Return STRICT JSON with keys:
{
  "summary": "string (6-8 lines max)",
  "key_risks": ["string"],
  "general_advice": "string"
}`;

    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content:
            `User meds: ${JSON.stringify(meds)}\n` +
            `Rule interactions: ${JSON.stringify(interactions ?? [])}\n` +
            `Write the JSON now.`,
        },
      ],
    });

    const text = r.choices?.[0]?.message?.content || "{}";
    return NextResponse.json(JSON.parse(text));
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
