import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function POST(req: NextRequest) {
  try {
    if (!client) return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    const { title, summary } = await req.json();

    const SYSTEM = `Summarize medical topics for laypeople.
Be accurate; include what it is, common symptoms/causes, and when to seek care.
No diagnoses or treatment plans. Keep to ~6–8 lines.`;

    const r = await client.chat.completions.create({
      model: "gpt-4o-mini", temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Topic: ${title}\nWikipedia summary:\n${summary}\nWrite the lay summary.` }
      ],
    });
    return NextResponse.json({ ai: r.choices?.[0]?.message?.content ?? "" });
  } catch (e:any) { return NextResponse.json({ error: String(e.message||e) }, { status: 500 }); }
}
