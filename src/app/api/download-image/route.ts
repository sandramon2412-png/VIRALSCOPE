import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") || "image.png";

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const imageRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to fetch image from source" }, { status: 502 });
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get("content-type") || "image/png";
    const safeFilename = filename.replace(/[^a-zA-Z0-9._\-]/g, "_");

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("download-image proxy error:", err);
    return NextResponse.json({ error: "Proxy fetch failed" }, { status: 500 });
  }
}
