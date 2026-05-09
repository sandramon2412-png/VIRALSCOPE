import { NextRequest, NextResponse } from "next/server";
import { VideoResult } from "@/lib/types";

const YT_API = "https://www.googleapis.com/youtube/v3";

async function getChannelAvgViews(
  channelId: string,
  apiKey: string
): Promise<number> {
  try {
    const res = await fetch(
      `${YT_API}/search?part=id&channelId=${channelId}&maxResults=10&order=date&type=video&key=${apiKey}`
    );
    const data = await res.json();
    const videoIds: string[] = (data.items || []).map(
      (i: { id: { videoId: string } }) => i.id.videoId
    );
    if (videoIds.length === 0) return 0;

    const statsRes = await fetch(
      `${YT_API}/videos?part=statistics&id=${videoIds.join(",")}&key=${apiKey}`
    );
    const statsData = await statsRes.json();
    const views = (statsData.items || []).map((i: { statistics: { viewCount: string } }) =>
      parseInt(i.statistics.viewCount || "0")
    );
    return views.length > 0
      ? Math.round(views.reduce((a: number, b: number) => a + b, 0) / views.length)
      : 0;
  } catch {
    return 0;
  }
}

function calcOutlierScore(videoViews: number, channelAvg: number): number {
  if (channelAvg === 0) return 1;
  return Math.round((videoViews / channelAvg) * 10) / 10;
}

function getViralityRating(
  score: number
): VideoResult["viralityRating"] {
  if (score >= 10) return "explosive";
  if (score >= 3) return "high";
  if (score >= 1.5) return "medium";
  return "low";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const maxResults = parseInt(searchParams.get("maxResults") || "12");

  if (!query) {
    return NextResponse.json({ error: "Falta el parámetro q" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === "TU_YOUTUBE_API_KEY_AQUI") {
    return NextResponse.json(
      { error: "YouTube API Key no configurada. Edita el archivo .env.local" },
      { status: 500 }
    );
  }

  try {
    // 1. Buscar videos
    const searchRes = await fetch(
      `${YT_API}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&order=viewCount&regionCode=ES&relevanceLanguage=es&key=${apiKey}`
    );
    const searchData = await searchRes.json();

    if (searchData.error) {
      return NextResponse.json(
        { error: searchData.error.message },
        { status: 400 }
      );
    }

    const items = searchData.items || [];
    const videoIds = items.map((i: { id: { videoId: string } }) => i.id.videoId).join(",");

    // 2. Obtener estadísticas de los videos
    const statsRes = await fetch(
      `${YT_API}/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`
    );
    const statsData = await statsRes.json();

    // 3. Para cada video, obtener promedio del canal en paralelo
    const videosWithStats = statsData.items || [];
    const channelIds = [
      ...new Set(
        videosWithStats.map((v: { snippet: { channelId: string } }) => v.snippet.channelId as string)
      ),
    ] as string[];

    const channelAvgMap: Record<string, number> = {};
    await Promise.all(
      channelIds.map(async (cid) => {
        channelAvgMap[cid] = await getChannelAvgViews(cid, apiKey);
      })
    );

    const videos: VideoResult[] = videosWithStats.map(
      (v: {
        id: string;
        snippet: {
          title: string;
          channelTitle: string;
          channelId: string;
          publishedAt: string;
          description: string;
          thumbnails: { high?: { url: string }; default?: { url: string } };
        };
        statistics: {
          viewCount?: string;
          likeCount?: string;
          commentCount?: string;
        };
      }) => {
        const viewCount = parseInt(v.statistics.viewCount || "0");
        const channelAvg = channelAvgMap[v.snippet.channelId] || 0;
        const outlierScore = calcOutlierScore(viewCount, channelAvg);
        return {
          id: v.id,
          title: v.snippet.title,
          channelTitle: v.snippet.channelTitle,
          channelId: v.snippet.channelId,
          publishedAt: v.snippet.publishedAt,
          viewCount,
          likeCount: parseInt(v.statistics.likeCount || "0"),
          commentCount: parseInt(v.statistics.commentCount || "0"),
          thumbnail:
            v.snippet.thumbnails.high?.url ||
            v.snippet.thumbnails.default?.url ||
            "",
          description: v.snippet.description?.slice(0, 300) || "",
          channelAvgViews: channelAvg,
          outlierScore,
          viralityRating: getViralityRating(outlierScore),
        };
      }
    );

    // Ordenar por outlier score descendente
    videos.sort((a, b) => b.outlierScore - a.outlierScore);

    return NextResponse.json({
      videos,
      query,
      totalResults: videos.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error al buscar videos" },
      { status: 500 }
    );
  }
}
