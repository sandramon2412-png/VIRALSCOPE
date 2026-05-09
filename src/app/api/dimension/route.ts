import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export interface DimensionResult {
  prompts: {
    estilo: string;
    prompt: string;
    analisis: string;
    seed: string;
  }[];
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey) return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });

  const body = await req.json();
  const { modo, input, nicho, instruccion } = body;

  const client = new Anthropic({ apiKey });

  const contexto =
    modo === "canal"
      ? `Canal de YouTube: ${input}`
      : modo === "video"
      ? `Video de YouTube: ${input}`
      : `Tema/instrucción: ${input}`;

  const prompt = `Eres el experto #1 mundial en miniaturas de YouTube virales con alto CTR. Has analizado más de 100,000 miniaturas.

CONTEXTO: ${contexto}
NICHO: ${nicho || "general"}
${instruccion ? `INSTRUCCIÓN ADICIONAL: ${instruccion}` : ""}

Genera 3 prompts de DALL-E 3 para miniaturas de YouTube. Cada uno debe tener un estilo visual completamente diferente.

REGLAS PARA MINIATURAS DE ALTO CTR:
- Contraste extremo entre foreground y fondo
- Máximo 4 palabras de texto en la imagen (en MAYÚSCULAS, con colores contrastantes)
- Si incluye cara humana: expresión exagerada, ojos bien visibles
- Colores saturados (naranja, rojo, amarillo tienen más atención visual)
- Funciona bien en miniatura pequeña (120px)
- El "curiosity gap" visual: debe crear una pregunta en la mente del espectador

Responde SOLO con este JSON exacto (sin markdown):
{
  "prompts": [
    {
      "estilo": "Hyper-realistic Cinematic",
      "prompt": "Prompt detallado en inglés para DALL-E 3. Mínimo 80 palabras. Muy específico sobre composición, iluminación, colores, texto visible en la imagen.",
      "analisis": "Por qué esta miniatura generaría alto CTR (1-2 líneas en español)"
    },
    {
      "estilo": "3D Digital Illustration",
      "prompt": "Prompt diferente, estilo 3D/ilustración digital. Mínimo 80 palabras.",
      "analisis": "Análisis de CTR (1-2 líneas)"
    },
    {
      "estilo": "Cinematic Unreal Engine 5 Render",
      "prompt": "Prompt fotorrealista estilo Unreal Engine. Mínimo 80 palabras.",
      "analisis": "Análisis de CTR (1-2 líneas)"
    }
  ]
}`;

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });
    const text =
      msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const data = JSON.parse(
      text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
    );
    const result: DimensionResult = {
      prompts: data.prompts.map(
        (p: { estilo: string; prompt: string; analisis: string }) => ({
          ...p,
          seed: Math.random().toString(36).slice(2, 10),
        })
      ),
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error generando prompts" }, { status: 500 });
  }
}
