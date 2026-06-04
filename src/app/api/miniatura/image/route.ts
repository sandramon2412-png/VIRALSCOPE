import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ALLOWED_HOSTS = [
  "pollinations.ai",
  "oaidalleapiprodscus.blob.core.windows.net",
  "oaidalleapiprodeus.blob.core.windows.net",
  "dalleprodsec.blob.core.windows.net",
  "replicate.delivery",
  "pbxt.replicate.delivery",
];

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOSTS.some(h => hostname.endsWith(h));
}

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) {
    return new NextResponse("Missing url", { status: 400 });
  }

  let imageUrl: string;
  try {
    imageUrl = decodeURIComponent(u);
    const parsed = new URL(imageUrl);
    if (!isAllowedHost(parsed.hostname)) {
      return new NextResponse("Invalid host", { status: 400 });
    }
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  try {
    const imgRes = await fetch(imageUrl, {
      signal: AbortSignal.timeout(55000),
    });

    if (!imgRes.ok) {
      return new NextResponse("Error fetching image", { status: 502 });
    }

    const buffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") || "image/png";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return new NextResponse("Timeout fetching image", { status: 504 });
  }
}
