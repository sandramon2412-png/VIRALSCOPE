import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { VideoResult, AnalysisResult } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey || apiKey === "TU_ANTHROPIC_API_KEY_AQUI") {
    return NextResponse.json(
      { error: "Anthropic API Key no configurada. Edita el archivo .env.local" },
      { status: 500 }
    );
  }

  let video: VideoResult;
  try {
    const body = await req.json();
    video = body.video;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const prompt = `Eres un experto en estrategia de contenido viral para YouTube.

Analiza este video viral de YouTube y dame un análisis profundo en JSON:

**Video:**
- Título: ${video.title}
- Canal: ${video.channelTitle}
- Vistas: ${video.viewCount.toLocaleString()}
- Likes: ${video.likeCount.toLocaleString()}
- Comentarios: ${video.commentCount.toLocaleString()}
- Promedio vistas del canal: ${video.channelAvgViews.toLocaleString()}
- Outlier Score: ${video.outlierScore}x (cuánto supera al promedio del canal)
- Descripción: ${video.description}

Responde ÚNICAMENTE con este JSON (sin texto extra):
{
  "whyViral": "Explicación de 2-3 oraciones de por qué este video se volvió viral",
  "niche": "Nombre del nicho específico",
  "competition": "baja" | "media" | "alta",
  "estimatedRPM": "Estimado en €, por ejemplo: €2-4",
  "facelessFriendly": true | false,
  "contentIdeas": ["idea 1", "idea 2", "idea 3", "idea 4", "idea 5"],
  "titleIdeas": ["título 1", "título 2", "título 3"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "difficulty": 7,
  "opportunity": 8
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "No se pudo parsear la respuesta de IA" },
        { status: 500 }
      );
    }

    const analysis: AnalysisResult = JSON.parse(jsonMatch[0]);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error al analizar con IA" },
      { status: 500 }
    );
  }
}
