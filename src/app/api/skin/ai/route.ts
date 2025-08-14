import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No image" }, { status: 400 });
    }

    // file -> base64 data URL (for OpenAI image input)
    const buf = Buffer.from(await file.arrayBuffer());
    const b64 = buf.toString("base64");
    const dataUrl = `data:${file.type};base64,${b64}`;

    const SYSTEM = `You are a careful assistant for *skin image screening*. 
Return education-only information. DO NOT give a diagnosis.
Output STRICT JSON: {note:string, top:[{condition:string,confidence:number, description:string}]}.
confidence is 0..1. Include strong cautions for new/changing/bleeding/asymmetric lesions.`;

    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: "Screen this skin photo. Return JSON only." },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    });

    const json = resp.choices?.[0]?.message?.content || "{}";
    return NextResponse.json(JSON.parse(json));
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
