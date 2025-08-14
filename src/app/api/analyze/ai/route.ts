import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { LabValue } from "../../../../lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type In = { raw_text: string; values: LabValue[] };

const SYSTEM = `You are a careful medical explainer for laypeople.
Do NOT give a diagnosis. Summarize patterns in labs, flag highs/lows,
and list cautions. Return strict JSON with keys: summary, risk_level, insights, cautions.
risk_level must be one of: low | moderate | high. Keep language concise.`;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const body = (await req.json()) as In;
    const prompt = {
      raw_text: (body.raw_text || "").slice(0, 20000),
      values: (body.values || []).slice(0, 200),
      schema: {
        summary: "string",
        risk_level: "low|moderate|high",
        insights: [{ name: "string", comment: "string" }],
        cautions: ["string"]
      }
    };

    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Analyze the following and return VALID JSON only.\n${JSON.stringify(prompt)}` }
      ],
    });

    const text = resp.choices?.[0]?.message?.content || "{}";
    return NextResponse.json(JSON.parse(text));
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
