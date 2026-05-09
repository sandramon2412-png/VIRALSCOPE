import { NextRequest, NextResponse } from "next/server";

const YT = "https://www.googleapis.com/youtube/v3";

export interface TrendingVideo {
  id: string;
  titulo: string;
  canal: string;
  canalId: string;
  thumbnail: string;
  vistas: number;
  likes: number;
  comentarios: number;
  publicadoEn: string;
  duracion: string;
  outlierScore: number;
  avgCanalViews: number;
  viralityRating: "explosive" | "high" | "medium" | "low";
}

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getViralityRating(score: number): TrendingVideo["viralityRating"] {
  if (score >= 10) return "explosive";
  if (score >= 3) return "high";
  if (score >= 1.5) return "medium";
  return "low";
}

function getPublishedAfter(periodo: string): string {
  const now = new Date();
  const days = periodo === "7d" ? 7 : periodo === "30d" ? 30 : 90;
  now.setDate(now.getDate() - days);
  return now.toISOString();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nicho = searchParams.get("nicho") || "";
  const periodo = searchParams.get("periodo") || "30d";
  const idioma = searchParams.get("idioma") || "es";
  const maxResults = Math.min(parseInt(searchParams.get("max") || "20"), 25);

  if (!nicho.trim()) {
    return NextResponse.json({ error: "Falta el parámetro nicho" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YouTube API Key no configurada" }, { status: 500 });
  }

  try {
    const publishedAfter = getPublishedAfter(periodo);

    // 1. Buscar videos del nicho en el período
    const searchRes = await fetch(
      `${YT}/search?part=id,snippet` +
      `&q=${encodeURIComponent(nicho)}` +
      `&type=video` +
      `&order=viewCount` +
      `&publishedAfter=${publishedAfter}` +
      `&relevanceLanguage=${idioma}` +
      `&maxResults=${maxResults}` +
      `&key=${apiKey}`
    );
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({ videos: [], nicho, periodo });
    }

    const videoIds: string[] = searchData.items
      .map((i: { id: { videoId?: string } }) => i.id.videoId)
      .filter(Boolean);

    // 2. Stats detalladas de los videos
    const statsRes = await fetch(
      `${YT}/videos?part=statistics,snippet,contentDetails` +
      `&id=${videoIds.join(",")}` +
      `&key=${apiKey}`
    );
    const statsData = await statsRes.json();

    if (!statsData.items || statsData.items.length === 0) {
      return NextResponse.json({ videos: [], nicho, periodo });
    }

    // 3. Obtener stats de cada canal para calcular Outlier Score
    const channelIds = [...new Set(
      statsData.items.map((v: { snippet: { channelId: string } }) => v.snippet.channelId)
    )] as string[];

    const channelRes = await fetch(
      `${YT}/channels?part=statistics` +
      `&id=${channelIds.join(",")}` +
      `&key=${apiKey}`
    );
    const channelData = await channelRes.json();

    // Mapa channelId → avg views
    const channelAvgMap: Record<string, number> = {};
    for (const ch of (channelData.items || [])) {
      const totalViews = parseInt(ch.statistics.viewCount || "0");
      const totalVideos = parseInt(ch.statistics.videoCount || "1");
      channelAvgMap[ch.id] = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;
    }

    // 4. Construir resultado
    const videos: TrendingVideo[] = statsData.items
      .map((v: {
        id: string;
        snippet: {
          title: string;
          channelTitle: string;
          channelId: string;
          thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
          publishedAt: string;
        };
        statistics: {
          viewCount?: string;
          likeCount?: string;
          commentCount?: string;
        };
        contentDetails: { duration: string };
      }) => {
        const vistas = parseInt(v.statistics.viewCount || "0");
        const avgCanalViews = channelAvgMap[v.snippet.channelId] || 1;
        const outlierScore = avgCanalViews > 0
          ? Math.round((vistas / avgCanalViews) * 10) / 10
          : 1;

        return {
          id: v.id,
          titulo: v.snippet.title,
          canal: v.snippet.channelTitle,
          canalId: v.snippet.channelId,
          thumbnail: v.snippet.thumbnails.high?.url || v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default?.url || "",
          vistas,
          likes: parseInt(v.statistics.likeCount || "0"),
          comentarios: parseInt(v.statistics.commentCount || "0"),
          publicadoEn: v.snippet.publishedAt,
          duracion: parseDuration(v.contentDetails.duration),
          outlierScore,
          avgCanalViews,
          viralityRating: getViralityRating(outlierScore),
        };
      })
      .sort((a: TrendingVideo, b: TrendingVideo) => b.outlierScore - a.outlierScore);

    return NextResponse.json({ videos, nicho, periodo, total: videos.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error obteniendo tendencias" }, { status: 500 });
  }
}
