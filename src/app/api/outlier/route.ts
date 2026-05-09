import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

function extractVideoId(url: string): string | null {
  // Handle youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Handle youtube.com/watch?v=ID
  const watchMatch = url.match(/youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Handle youtube.com/shorts/ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // Handle youtube.com/embed/ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Handle youtube.com/v/ID
  const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/);
  if (vMatch) return vMatch[1];

  return null;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export async function POST(req: NextRequest) {
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  const anthropicApiKey = process.env.VIRALSCOPE_AI_KEY;

  if (!youtubeApiKey) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY no configurada" }, { status: 500 });
  }
  if (!anthropicApiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 500 });
  }

  let videoUrl: string;
  let nicho: string | undefined;

  try {
    const body = await req.json();
    videoUrl = body.videoUrl;
    nicho = body.nicho;
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  if (!videoUrl || typeof videoUrl !== "string") {
    return NextResponse.json({ error: "videoUrl es requerido" }, { status: 400 });
  }

  const videoId = extractVideoId(videoUrl.trim());
  if (!videoId) {
    return NextResponse.json({ error: "URL de YouTube inválida. Por favor pega una URL válida de YouTube." }, { status: 400 });
  }

  // Step 2: Get video details from YouTube API
  let videoData: {
    title: string;
    description: string;
    channelTitle: string;
    channelId: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    publishedAt: string;
    tags: string[];
    thumbnail: string;
  };

  try {
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${youtubeApiKey}`
    );
    const videoJson = await videoRes.json();

    if (!videoJson.items || videoJson.items.length === 0) {
      return NextResponse.json({ error: "Video no encontrado. Verifica la URL." }, { status: 404 });
    }

    const item = videoJson.items[0];
    const snippet = item.snippet;
    const stats = item.statistics;

    const thumbnails = snippet.thumbnails;
    const thumbnail =
      thumbnails?.maxres?.url ||
      thumbnails?.standard?.url ||
      thumbnails?.high?.url ||
      thumbnails?.medium?.url ||
      thumbnails?.default?.url ||
      "";

    videoData = {
      title: snippet.title || "",
      description: snippet.description || "",
      channelTitle: snippet.channelTitle || "",
      channelId: snippet.channelId || "",
      viewCount: parseInt(stats?.viewCount || "0", 10),
      likeCount: parseInt(stats?.likeCount || "0", 10),
      commentCount: parseInt(stats?.commentCount || "0", 10),
      publishedAt: snippet.publishedAt || "",
      tags: snippet.tags || [],
      thumbnail,
    };
  } catch (err) {
    console.error("Error fetching video data:", err);
    return NextResponse.json({ error: "Error al obtener datos del video de YouTube" }, { status: 500 });
  }

  // Step 3: Get channel statistics for outlier score
  let outlierScore: number;
  try {
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${videoData.channelId}&key=${youtubeApiKey}`
    );
    const channelJson = await channelRes.json();

    if (!channelJson.items || channelJson.items.length === 0) {
      outlierScore = 1;
    } else {
      const channelStats = channelJson.items[0].statistics;
      const channelViewCount = parseInt(channelStats?.viewCount || "0", 10);
      const channelVideoCount = parseInt(channelStats?.videoCount || "1", 10);
      const channelAvgViews = channelVideoCount > 0 ? channelViewCount / channelVideoCount : 1;
      outlierScore = channelAvgViews > 0 ? videoData.viewCount / channelAvgViews : 1;
      outlierScore = Math.round(outlierScore * 10) / 10;
    }
  } catch (err) {
    console.error("Error fetching channel data:", err);
    outlierScore = 1;
  }

  // Step 4: Call Claude Haiku to generate the Kit de Clonación
  const client = new Anthropic({ apiKey: anthropicApiKey });

  const prompt = `Eres un experto en análisis de contenido viral en YouTube hispanohablante. Analiza este video y genera un Kit de Clonación completo.

**DATOS DEL VIDEO:**
- Título: ${videoData.title}
- Canal: ${videoData.channelTitle}
- Vistas: ${formatNumber(videoData.viewCount)} (${videoData.viewCount.toLocaleString()})
- Likes: ${formatNumber(videoData.likeCount)}
- Comentarios: ${formatNumber(videoData.commentCount)}
- Outlier Score: ${outlierScore}x (supera ${outlierScore}x el promedio del canal)
- Publicado: ${videoData.publishedAt}
- Descripción: ${videoData.description.slice(0, 500)}
- Tags: ${videoData.tags.slice(0, 10).join(", ")}
- Nicho (si aplica): ${nicho || "Por determinar"}

Responde ÚNICAMENTE con este JSON (sin texto extra, sin markdown):
{
  "analisis": {
    "formulaTitulo": "Descripción de la fórmula usada en el título, ej: Número + Promesa Específica + Urgencia",
    "estructuraHook": "Descripción de cómo abre el video en los primeros 30 segundos, basado en el título y descripción",
    "porQueViral": "2-3 oraciones explicando por qué este video fue viral: algoritmo + psicología",
    "emocionPrincipal": "Curiosidad | Miedo | Esperanza | Sorpresa | Codicia | Envidia | Orgullo",
    "patternInterrupt": "Qué elemento específico hace que el usuario deje de hacer scroll",
    "retencionEstrategia": "Por qué la gente sigue viendo el video (loops, promesas, estructura)"
  },
  "kit": {
    "titulosAdaptados": [
      {
        "titulo": "Título adaptado usando la misma fórmula pero con un ángulo diferente",
        "formula": "Nombre corto de la fórmula",
        "ctrScore": 85
      },
      {
        "titulo": "Segunda variación del título",
        "formula": "Nombre corto de la fórmula",
        "ctrScore": 78
      },
      {
        "titulo": "Tercera variación del título",
        "formula": "Nombre corto de la fórmula",
        "ctrScore": 72
      }
    ],
    "hookAdaptado": "Hook reescrito para un ángulo nuevo. Debe capturar atención en los primeros 3 segundos. Ejemplo: 'Lo que estás a punto de ver cambió completamente mi perspectiva sobre...'",
    "promptMiniatura": "Prompt detallado para DALL-E o Midjourney que recreate el estilo visual de la miniatura. Incluye: colores dominantes, expresión facial si aplica, texto en miniatura, composición, estilo visual",
    "nichoSugerido": "Nicho específico donde replicar este formato de video",
    "angulo": "Ángulo único y diferente para crear un video con la misma fórmula pero sin copiar el contenido"
  }
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "No se pudo parsear la respuesta de IA" }, { status: 500 });
    }

    const aiData = JSON.parse(jsonMatch[0]);

    const result = {
      video: {
        id: videoId,
        titulo: videoData.title,
        canal: videoData.channelTitle,
        views: videoData.viewCount,
        likes: videoData.likeCount,
        outlierScore,
        thumbnail: videoData.thumbnail,
        publishedAt: videoData.publishedAt,
      },
      analisis: aiData.analisis,
      kit: aiData.kit,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error with Claude API:", err);
    return NextResponse.json({ error: "Error al generar el análisis con IA" }, { status: 500 });
  }
}
