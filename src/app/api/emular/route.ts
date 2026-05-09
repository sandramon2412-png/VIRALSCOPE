import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CanalInfo, CanalVideo, CanalAnalysis } from "@/lib/canal-types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey || apiKey === "TU_ANTHROPIC_API_KEY_AQUI") {
    return NextResponse.json({ error: "Anthropic API Key no configurada" }, { status: 500 });
  }

  let canal: CanalInfo;
  let videos: CanalVideo[];
  try {
    const body = await req.json();
    canal = body.canal;
    videos = body.videos;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const topVideos = videos.slice(0, 6).map(v =>
    `- "${v.titulo}" → ${v.vistas.toLocaleString()} vistas | Outlier: ${v.outlierScore}x | Duración: ${v.duracion}`
  ).join("\n");

  const prompt = `Eres un estratega experto en YouTube con 10 años de experiencia analizando canales virales.

Analiza este canal de YouTube y dame un plan completo para emular su estrategia:

**Canal:** ${canal.nombre}
**Handle:** ${canal.handle}
**Suscriptores:** ${canal.suscriptores.toLocaleString()}
**Total vistas:** ${canal.totalVistas.toLocaleString()}
**Total videos:** ${canal.totalVideos}
**País:** ${canal.pais}
**Promedio vistas últimos 10 videos:** ${canal.avgViewsUltimos10.toLocaleString()}
**Descripción del canal:** ${canal.descripcion}

**Top videos más virales:**
${topVideos}

Responde ÚNICAMENTE con este JSON (sin texto extra, sin markdown):
{
  "nicho": "Nicho principal del canal en 2-3 palabras",
  "subnicho": "Sub-nicho específico",
  "estilo": "Descripción del estilo de contenido en 1 oración",
  "frecuenciaIdeal": "Ej: 2-3 videos por semana",
  "formatosDominantes": ["formato1", "formato2", "formato3"],
  "patronTitulos": "Patrón que usan en sus títulos (ej: preguntas, listas, secretos, números)",
  "fortalezas": ["fortaleza1", "fortaleza2", "fortaleza3"],
  "debilidades": ["debilidad1", "debilidad2"],
  "estrategiaEmulacion": [
    "Paso concreto 1 para replicar su estrategia",
    "Paso concreto 2",
    "Paso concreto 3",
    "Paso concreto 4",
    "Paso concreto 5"
  ],
  "planAccion": [
    "Semana 1: acción específica",
    "Semana 2-4: acción específica",
    "Mes 2: acción específica",
    "Mes 3+: acción específica"
  ],
  "dificultadCompetir": 7,
  "oportunidad": "Descripción de la oportunidad de mercado en 2 oraciones",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "tiempoEstimadoResultados": "Ej: 3-6 meses para primeros 1,000 suscriptores"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "No se pudo parsear la respuesta de IA" }, { status: 500 });
    }

    const analysis: CanalAnalysis = JSON.parse(jsonMatch[0]);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al analizar con IA" }, { status: 500 });
  }
}
