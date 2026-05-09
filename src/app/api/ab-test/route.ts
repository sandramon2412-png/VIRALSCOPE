import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export interface ThumbnailScore {
  ctr_estimado: number;
  contraste: number;
  texto: number;
  emocion: number;
  composicion: number;
  color: number;
  cara: number;
  fortalezas: string[];
  debilidades: string[];
}

export interface ABResult {
  ganadora: "A" | "B" | "empate";
  confianza: number;
  thumbnail_a: ThumbnailScore;
  thumbnail_b: ThumbnailScore;
  razon: string;
  recomendacion: string;
}

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

function parseImageInput(input: string): { base64: string; mediaType: ImageMediaType } {
  const dataUriMatch = input.match(/^data:(image\/\w+);base64,(.+)$/);
  if (dataUriMatch) {
    const mt = dataUriMatch[1] as ImageMediaType;
    return { base64: dataUriMatch[2], mediaType: mt };
  }
  // Plain base64 — assume JPEG
  return { base64: input, mediaType: "image/jpeg" };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });
  }

  let imageA: string, imageB: string, nicho: string, titulo: string;
  try {
    const body = await req.json();
    imageA = body.imageA;
    imageB = body.imageB;
    nicho = body.nicho || "general";
    titulo = body.titulo || "";
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  if (!imageA || !imageB) {
    return NextResponse.json({ error: "Se requieren ambas imágenes (imageA e imageB)" }, { status: 400 });
  }

  const a = parseImageInput(imageA);
  const b = parseImageInput(imageB);

  const client = new Anthropic({ apiKey });

  const prompt = `Analiza estas dos miniaturas de YouTube para un video de ${nicho} titulado '${titulo || "sin título"}'.

Evalúa cada una en las siguientes dimensiones (escala 0-10):
- contraste: ¿Los elementos se distinguen claramente del fondo?
- texto: ¿El texto es legible, conciso y bien posicionado? (0 si no hay texto)
- emocion: ¿Transmite una emoción clara y fuerte en menos de 0.5 segundos?
- composicion: ¿Hay un punto focal claro y buena organización visual?
- color: ¿Los colores son llamativos y apropiados para el nicho?
- cara: ¿Hay una cara expresiva y legible? (0 si no hay cara)

Para cada miniatura también identifica:
- fortalezas: lista de 2-4 puntos fuertes específicos
- debilidades: lista de 1-3 puntos débiles específicos
- ctr_estimado: puntuación general del 0 al 10 prediciendo CTR relativo

Predice cuál tendrá mayor CTR (A o B), tu nivel de confianza (0-100) y por qué.

Responde ÚNICAMENTE con este JSON (sin texto extra, sin markdown):
{
  "ganadora": "A" | "B" | "empate",
  "confianza": 75,
  "thumbnail_a": {
    "ctr_estimado": 7.5,
    "contraste": 8,
    "texto": 6,
    "emocion": 7,
    "composicion": 8,
    "color": 7,
    "cara": 9,
    "fortalezas": ["..."],
    "debilidades": ["..."]
  },
  "thumbnail_b": {
    "ctr_estimado": 6.0,
    "contraste": 6,
    "texto": 5,
    "emocion": 5,
    "composicion": 6,
    "color": 7,
    "cara": 0,
    "fortalezas": ["..."],
    "debilidades": ["..."]
  },
  "razon": "Explicación de por qué una miniatura ganó sobre la otra",
  "recomendacion": "Consejo específico y accionable para mejorar la miniatura ganadora o crear una versión aún mejor"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Miniatura A:",
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: a.mediaType,
                data: a.base64,
              },
            },
            {
              type: "text",
              text: "Miniatura B:",
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: b.mediaType,
                data: b.base64,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let result: ABResult;
    try {
      result = JSON.parse(cleaned) as ABResult;
    } catch {
      return NextResponse.json(
        { error: "La IA devolvió un formato inesperado", raw },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
