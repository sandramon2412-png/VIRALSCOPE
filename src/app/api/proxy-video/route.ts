import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const ALLOWED_HOSTS = [
  "videos.pexels.com",
  "player.vimeo.com",
  "vimeocdn.com",
  "cdn.coverr.co",
];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Falta url" }, { status: 400 });

  let parsed: URL;
  try { parsed = new URL(url); } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.some(h => parsed.hostname.endsWith(h))) {
    return NextResponse.json({ error: "Host no permitido" }, { status: 403 });
  }

  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return NextResponse.json({ error: `Upstream ${res.status}` }, { status: 502 });

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "video/mp4",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
