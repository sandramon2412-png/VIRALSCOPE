import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function GET(req: NextRequest) {
  if (!PEXELS_API_KEY) {
    return NextResponse.json({ error: "PEXELS_API_KEY no configurada" }, { status: 503 });
  }

  const query   = req.nextUrl.searchParams.get("q") ?? "nature";
  const perPage = Math.min(parseInt(req.nextUrl.searchParams.get("n") ?? "5"), 10);
  const type    = req.nextUrl.searchParams.get("type") ?? "video";

  // ── Fotos ─────────────────────────────────────────────────────────────────
  if (type === "photo") {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!res.ok) return NextResponse.json({ error: `Pexels ${res.status}` }, { status: 502 });

    const data = await res.json() as {
      photos: Array<{ id: number; src: { large2x: string; large: string; medium: string }; }>;
    };

    const photos = data.photos.map(p => ({
      id: p.id,
      url: p.src.large || p.src.medium,  // evitar large2x (3-5MB); large=940px es suficiente
      thumb: p.src.medium,
    })).filter(p => p.url);

    return NextResponse.json({ photos });
  }

  // ── Videos ────────────────────────────────────────────────────────────────
  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait&size=small`,
    { headers: { Authorization: PEXELS_API_KEY } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: `Pexels ${res.status}` }, { status: 502 });
  }

  const data = await res.json() as {
    videos: Array<{
      id: number;
      duration: number;
      video_files: Array<{ link: string; quality: string; width: number; height: number }>;
      image: string;
    }>;
  };

  // Preferir 480p–720p: suficiente calidad pero mucho menos peso para ffmpeg.wasm
  const videos = data.videos.map(v => {
    const hd = v.video_files
      .filter(f => f.height <= 720 && f.height >= 360)
      .sort((a, b) => b.height - a.height)[0]
      ?? v.video_files.sort((a, b) => a.height - b.height)[0];
    return {
      id: v.id,
      duration: v.duration,
      url: hd?.link ?? v.video_files[0]?.link,
      thumb: v.image,
    };
  }).filter(v => v.url);

  return NextResponse.json({ videos });
}
