import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const q = new URL(req.url).searchParams.get("q");
    if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.trim())}`, {
      headers: { "User-Agent": "CareLens/1.0 (educational)" }, cache: "no-store",
    });
    if (!r.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = await r.json();

    return NextResponse.json({
      title: data.title ?? q,
      url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(q.trim())}`,
      summary: data.extract ?? "No summary available.",
    });
  } catch (e:any) { return NextResponse.json({ error: String(e.message||e) }, { status: 500 }); }
}
