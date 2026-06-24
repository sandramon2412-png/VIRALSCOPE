import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function GET(req: NextRequest) {
  if (!PEXELS_API_KEY) {
    return NextResponse.json({ error: "PEXELS_API_KEY no configurada" }, { status: 503 });
  }

  const query = req.nextUrl.searchParams.get("q") ?? "nature";
  const perPage = Math.min(parseInt(req.nextUrl.searchParams.get("n") ?? "5"), 10);

  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait&size=medium`,
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
