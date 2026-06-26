import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key no configurada" }, { status: 500 });

  const { tema, duracion } = await req.json();
  if (!tema) return NextResponse.json({ error: "Falta tema" }, { status: 400 });

  // Calcular palabras objetivo
  const seg = parseInt(duracion) || 45;
  const palabras = Math.round((seg / 60) * 140);

  const client = new Anthropic({ apiKey });

  const prompt = `Eres un narrador profesional de videos cortos virales en español.

Escribe ÚNICAMENTE el texto que se dirá en voz alta en un Short de ${duracion} sobre: "${tema}"

REGLAS ABSOLUTAS — si las rompes el video falla:
- SOLO texto narrable. Cero corchetes, cero etiquetas, cero [HOOK], cero [PAUSA], cero indicaciones visuales
- Sin títulos de sección, sin headers, sin guiones estructurales
- Sin asteriscos, sin negritas, sin formato markdown
- Solo las palabras exactas que el narrador va a pronunciar
- Aproximadamente ${palabras} palabras
- Habla directo al espectador ("tú"), en español neutro, tono dinámico
- Empieza con una frase de impacto que para el scroll

Escribe solo el texto narrable:`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    if (!text) return NextResponse.json({ error: "Respuesta vacía" }, { status: 500 });

    return NextResponse.json({ voiceover: text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
