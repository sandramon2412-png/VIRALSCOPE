import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export interface AnalisisMiniatura {
  puntuacionGeneral: number; // 0-100
  ctrEstimado: "Muy Bajo" | "Bajo" | "Medio" | "Alto" | "Muy Alto";
  categorias: {
    contraste: { puntuacion: number; comentario: string };
    emocion: { puntuacion: number; comentario: string };
    texto: { puntuacion: number; comentario: string };
    composicion: { puntuacion: number; comentario: string };
    color: { puntuacion: number; comentario: string };
    cara: { puntuacion: number; comentario: string };
  };
  fortalezas: string[];
  problemas: string[];
  mejoras: string[];
  veredicto: string;
  comparacionNicho: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });
  }

  let imageBase64: string, nicho: string, titulo: string;
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64; // base64 con o sin data URI prefix
    nicho = body.nicho || "general";
    titulo = body.titulo || "";
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  if (!imageBase64) {
    return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
  }

  // Limpiar el data URI si viene con prefijo
  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  // Detectar tipo de imagen desde el prefijo
  const mediaTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
  const mediaType = (mediaTypeMatch?.[1] || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  const client = new Anthropic({ apiKey });

  const prompt = `Eres el experto #1 mundial en optimización de miniaturas de YouTube. Has analizado más de 100,000 miniaturas y sabes exactamente qué hace que una miniatura genere clicks.

CONTEXTO DEL VIDEO:
- Nicho: ${nicho}
- Título del video: ${titulo || "No especificado"}

Analiza esta miniatura de YouTube con criterios científicos de CTR (Click-Through Rate). Evalúa cada aspecto del 0 al 100.

CRITERIOS A EVALUAR:

1. **CONTRASTE** (0-100): ¿Los elementos principales se distinguen claramente del fondo? ¿Hay suficiente contraste para verse en miniaturas pequeñas de 120px?

2. **EMOCIÓN** (0-100): ¿Transmite una emoción clara y fuerte? Las mejores miniaturas tienen emoción reconocible en menos de 0.5 segundos. ¿El espectador siente algo al verla?

3. **TEXTO** (0-100): ¿El texto (si existe) es legible en tamaño pequeño? ¿Es conciso? ¿Complementa la imagen sin saturarla? Si no hay texto, ¿la imagen comunica sola?

4. **COMPOSICIÓN** (0-100): ¿Los elementos están bien organizados? ¿Hay un punto focal claro? ¿Sigue la regla de los tercios? ¿La vista del espectador va al elemento más importante primero?

5. **COLOR** (0-100): ¿Los colores son saturados y llamativos sin ser desagradables? ¿Contrasta con el fondo blanco de YouTube? ¿Los colores comunican la emoción correcta para el nicho?

6. **CARA/EXPRESIÓN** (0-100): Si hay una cara, ¿la expresión es exagerada y claramente legible? ¿Los ojos están visibles y expresivos? Si no hay cara, ¿funciona igualmente bien?

CRITERIOS ESPECIALES PARA CTR ALTO:
- Las miniaturas con cara humana expresiva tienen 38% más CTR promedio
- El contraste extremo entre foreground y background aumenta CTR 22%
- Los colores naranja, rojo y amarillo tienen más atención visual
- El texto debe tener máximo 3-4 palabras para ser legible como thumbnail
- El "curiosity gap" visual: la miniatura debe crear una pregunta en la mente del espectador

Responde ÚNICAMENTE con este JSON exacto (sin markdown):
{
  "puntuacionGeneral": 75,
  "ctrEstimado": "Alto",
  "categorias": {
    "contraste": { "puntuacion": 80, "comentario": "Descripción específica de lo que ves en la imagen" },
    "emocion": { "puntuacion": 70, "comentario": "Descripción específica de lo que ves en la imagen" },
    "texto": { "puntuacion": 65, "comentario": "Descripción específica de lo que ves en la imagen" },
    "composicion": { "puntuacion": 75, "comentario": "Descripción específica de lo que ves en la imagen" },
    "color": { "puntuacion": 80, "comentario": "Descripción específica de lo que ves en la imagen" },
    "cara": { "puntuacion": 60, "comentario": "Descripción específica de lo que ves en la imagen" }
  },
  "fortalezas": [
    "Fortaleza específica con evidencia visual concreta de lo que ves",
    "Fortaleza 2",
    "Fortaleza 3"
  ],
  "problemas": [
    "Problema específico con evidencia visual concreta",
    "Problema 2"
  ],
  "mejoras": [
    "Mejora concreta y accionable #1 que aumentaría el CTR",
    "Mejora concreta #2",
    "Mejora concreta #3"
  ],
  "veredicto": "Veredicto de 2-3 oraciones: qué tan bien funcionaría esta miniatura en YouTube, comparado con el promedio del nicho ${nicho}, y cuál es el cambio más urgente",
  "comparacionNicho": "Cómo se compara esta miniatura con el estilo típico del nicho ${nicho}: qué hace diferente, si sigue los patrones del nicho o se destaca"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
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

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data: AnalisisMiniatura = JSON.parse(cleanText);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error analizando la miniatura" }, { status: 500 });
  }
}
