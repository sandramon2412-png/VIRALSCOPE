import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey) return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });

  const { comentarios, nicho, videoTitulo } = await req.json();

  if (!comentarios || comentarios.trim().length === 0) {
    return NextResponse.json({ error: "No se proporcionaron comentarios" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `Eres un experto en análisis de audiencia de YouTube y estrategia de contenido. Analiza los siguientes comentarios de un video de YouTube y extrae insights accionables para el creador de contenido.

DATOS DEL VIDEO:
- Título del video: ${videoTitulo || "No especificado"}
- Nicho: ${nicho || "No especificado"}

COMENTARIOS A ANALIZAR:
${comentarios}

Analiza profundamente estos comentarios y responde ÚNICAMENTE con este JSON exacto (sin markdown, sin explicaciones adicionales):
{
  "sentimiento": {
    "positivo": 65,
    "neutro": 20,
    "negativo": 15,
    "emocionPrincipal": "Curiosidad"
  },
  "ideasDeContenido": [
    {
      "idea": "Descripción clara de la idea de contenido extraída de los comentarios",
      "tipo": "pregunta",
      "frecuencia": 5,
      "prioridad": "Alta"
    }
  ],
  "preguntasFrecuentes": [
    "¿Pregunta frecuente 1?",
    "¿Pregunta frecuente 2?",
    "¿Pregunta frecuente 3?",
    "¿Pregunta frecuente 4?",
    "¿Pregunta frecuente 5?"
  ],
  "palabrasClave": ["palabra1", "palabra2", "palabra3", "palabra4", "palabra5", "palabra6", "palabra7", "palabra8"],
  "resumen": "Resumen de 2-3 oraciones que describe el estado general de los comentarios, el engagement y la respuesta de la audiencia.",
  "recomendacion": "Descripción específica del próximo video que deberías crear basándote en lo que pide la audiencia."
}

REGLAS:
- sentimiento: los tres porcentajes deben sumar exactamente 100
- emocionPrincipal: debe ser una de: "Curiosidad", "Gratitud", "Frustración", "Entusiasmo", "Confusión", "Inspiración", "Escepticismo", "Admiración"
- ideasDeContenido: mínimo 4, máximo 8 ideas ordenadas por prioridad (Alta primero)
- tipo de idea: debe ser exactamente "pregunta", "sugerencia", "queja" o "elogio"
- prioridad: debe ser exactamente "Alta", "Media" o "Baja"
- preguntasFrecuentes: exactamente 5 preguntas que aparecen o se infieren de los comentarios
- palabrasClave: entre 6 y 12 términos más mencionados o relevantes
- resumen: máximo 3 oraciones, en español, orientado al creador
- recomendacion: 1-2 oraciones concretas sobre qué video crear a continuación`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

  try {
    const cleanText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const data = JSON.parse(cleanText);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Error procesando respuesta de IA" },
      { status: 500 }
    );
  }
}
