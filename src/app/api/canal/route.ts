import { NextRequest, NextResponse } from "next/server";
import { CanalInfo, CanalVideo } from "@/lib/canal-types";

const YT = "https://www.googleapis.com/youtube/v3";

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getViralityRating(score: number): CanalVideo["viralityRating"] {
  if (score >= 10) return "explosive";
  if (score >= 3) return "high";
  if (score >= 1.5) return "medium";
  return "low";
}

// Extrae el handle o ID del canal desde distintos formatos de URL
function parseChannelInput(input: string): { type: "handle" | "id" | "custom" | "query"; value: string } {
  const clean = input.trim().replace(/\/$/, "");

  // youtube.com/@handle
  const handleMatch = clean.match(/youtube\.com\/@([\w.-]+)/i);
  if (handleMatch) return { type: "handle", value: handleMatch[1] };

  // youtube.com/channel/UCxxxxxxx
  const idMatch = clean.match(/youtube\.com\/channel\/(UC[\w-]+)/i);
  if (idMatch) return { type: "id", value: idMatch[1] };

  // youtube.com/c/name or youtube.com/user/name
  const customMatch = clean.match(/youtube\.com\/(?:c|user)\/([\w.-]+)/i);
  if (customMatch) return { type: "custom", value: customMatch[1] };

  // @handle sin URL
  if (clean.startsWith("@")) return { type: "handle", value: clean.slice(1) };

  // UCxxxxx directo
  if (clean.startsWith("UC")) return { type: "id", value: clean };

  // Texto libre → buscar
  return { type: "query", value: clean };
}

async function resolveChannelId(input: string, apiKey: string): Promise<string | null> {
  const parsed = parseChannelInput(input);

  if (parsed.type === "id") return parsed.value;

  if (parsed.type === "handle") {
    const res = await fetch(
      `${YT}/channels?part=id&forHandle=${encodeURIComponent(parsed.value)}&key=${apiKey}`
    );
    const data = await res.json();
    return data.items?.[0]?.id || null;
  }

  // Para custom/query: buscar por nombre
  const res = await fetch(
    `${YT}/search?part=snippet&q=${encodeURIComponent(parsed.value)}&type=channel&maxResults=1&key=${apiKey}`
  );
  const data = await res.json();
  return data.items?.[0]?.id?.channelId || null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("canal");

  if (!input) return NextResponse.json({ error: "Falta el parámetro canal" }, { status: 400 });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === "TU_YOUTUBE_API_KEY_AQUI") {
    return NextResponse.json({ error: "YouTube API Key no configurada" }, { status: 500 });
  }

  try {
    // 1. Resolver el ID del canal
    const channelId = await resolveChannelId(input, apiKey);
    if (!channelId) {
      return NextResponse.json({ error: "Canal no encontrado. Intenta con la URL completa o el @handle." }, { status: 404 });
    }

    // 2. Info del canal
    const canalRes = await fetch(
      `${YT}/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${apiKey}`
    );
    const canalData = await canalRes.json();
    const ch = canalData.items?.[0];
    if (!ch) return NextResponse.json({ error: "Canal no encontrado" }, { status: 404 });

    const suscriptores = parseInt(ch.statistics.subscriberCount || "0");
    const totalVistas = parseInt(ch.statistics.viewCount || "0");
    const totalVideos = parseInt(ch.statistics.videoCount || "0");

    // 3. Top videos del canal (por vistas)
    const searchRes = await fetch(
      `${YT}/search?part=id&channelId=${channelId}&order=viewCount&maxResults=12&type=video&key=${apiKey}`
    );
    const searchData = await searchRes.json();
    const videoIds: string[] = (searchData.items || []).map(
      (i: { id: { videoId: string } }) => i.id.videoId
    ).filter(Boolean);

    if (videoIds.length === 0) {
      return NextResponse.json({ error: "No se encontraron videos en este canal" }, { status: 404 });
    }

    // 4. Stats de los videos
    const statsRes = await fetch(
      `${YT}/videos?part=statistics,snippet,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`
    );
    const statsData = await statsRes.json();

    // 5. Promedio de vistas últimos 10 videos
    const recentRes = await fetch(
      `${YT}/search?part=id&channelId=${channelId}&order=date&maxResults=10&type=video&key=${apiKey}`
    );
    const recentData = await recentRes.json();
    const recentIds: string[] = (recentData.items || []).map(
      (i: { id: { videoId: string } }) => i.id.videoId
    ).filter(Boolean);

    let avgViewsUltimos10 = 0;
    if (recentIds.length > 0) {
      const recentStatsRes = await fetch(
        `${YT}/videos?part=statistics&id=${recentIds.join(",")}&key=${apiKey}`
      );
      const recentStatsData = await recentStatsRes.json();
      const viewsList = (recentStatsData.items || []).map(
        (v: { statistics: { viewCount?: string } }) => parseInt(v.statistics.viewCount || "0")
      );
      avgViewsUltimos10 = viewsList.length > 0
        ? Math.round(viewsList.reduce((a: number, b: number) => a + b, 0) / viewsList.length)
        : 0;
    }

    const canalInfo: CanalInfo = {
      id: channelId,
      nombre: ch.snippet.title,
      handle: ch.snippet.customUrl || "",
      descripcion: ch.snippet.description?.slice(0, 500) || "",
      suscriptores,
      totalVideos,
      totalVistas,
      avatar: ch.snippet.thumbnails?.high?.url || ch.snippet.thumbnails?.default?.url || "",
      banner: ch.brandingSettings?.image?.bannerExternalUrl || "",
      fechaCreacion: ch.snippet.publishedAt,
      pais: ch.snippet.country || "Desconocido",
      avgViewsUltimos10,
    };

    const videos: CanalVideo[] = (statsData.items || []).map(
      (v: {
        id: string;
        snippet: { title: string; publishedAt: string; thumbnails: { high?: { url: string }; default?: { url: string } } };
        statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
        contentDetails: { duration: string };
      }) => {
        const vistas = parseInt(v.statistics.viewCount || "0");
        const outlierScore = avgViewsUltimos10 > 0
          ? Math.round((vistas / avgViewsUltimos10) * 10) / 10
          : 1;
        return {
          id: v.id,
          titulo: v.snippet.title,
          thumbnail: v.snippet.thumbnails.high?.url || v.snippet.thumbnails.default?.url || "",
          vistas,
          likes: parseInt(v.statistics.likeCount || "0"),
          comentarios: parseInt(v.statistics.commentCount || "0"),
          publicadoEn: v.snippet.publishedAt,
          outlierScore,
          viralityRating: getViralityRating(outlierScore),
          duracion: parseDuration(v.contentDetails.duration),
        };
      }
    ).sort((a: CanalVideo, b: CanalVideo) => b.outlierScore - a.outlierScore);

    return NextResponse.json({ canal: canalInfo, videos });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al analizar el canal" }, { status: 500 });
  }
}
