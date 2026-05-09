import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey) return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });

  const { nicho, descripcion, faceless, idioma } = await req.json();

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: `Eres el mejor estratega de marca para canales de YouTube del mundo hispanohablante.

Crea una identidad de marca completa para este canal:
- Nicho: ${nicho}
- Descripción adicional: ${descripcion || "ninguna"}
- Formato: ${faceless ? "Canal faceless (sin mostrar la cara)" : "Canal con presentador en cámara"}
- Idioma principal: ${idioma || "español"}

Responde ÚNICAMENTE con este JSON exacto (sin markdown, sin explicaciones):
{
  "nombres": [
    {"nombre": "...", "razon": "por qué funciona este nombre", "dominio": "nombrecanal.com"},
    {"nombre": "...", "razon": "...", "dominio": "..."},
    {"nombre": "...", "razon": "...", "dominio": "..."},
    {"nombre": "...", "razon": "...", "dominio": "..."},
    {"nombre": "...", "razon": "...", "dominio": "..."}
  ],
  "slogan": "El slogan principal del canal (máx 8 palabras)",
  "descripcionCanal": "Descripción optimizada para el perfil de YouTube (máx 200 palabras, con keywords naturales)",
  "vozMarca": {
    "tono": "ej: Directo, motivador y sin rodeos",
    "personalidad": "ej: El mentor que ya lo logró y te enseña cómo",
    "evitar": "ej: Lenguaje corporativo, tecnicismos innecesarios, victimismo"
  },
  "pilares": [
    {"nombre": "Pilar 1", "descripcion": "De qué trata este pilar de contenido", "ejemplo": "Ejemplo de video"},
    {"nombre": "Pilar 2", "descripcion": "...", "ejemplo": "..."},
    {"nombre": "Pilar 3", "descripcion": "...", "ejemplo": "..."}
  ],
  "audiencia": {
    "edad": "ej: 22-35 años",
    "perfil": "Descripción del viewer ideal en 2 oraciones",
    "dolor": "El problema principal que tiene tu audiencia",
    "deseo": "Lo que tu audiencia quiere lograr"
  },
  "colores": [
    {"nombre": "Principal", "hex": "#hexcode", "uso": "para qué se usa"},
    {"nombre": "Secundario", "hex": "#hexcode", "uso": "..."},
    {"nombre": "Acento", "hex": "#hexcode", "uso": "..."}
  ],
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]
}`
    }]
  });

  const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";

  try {
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Error procesando respuesta de IA" }, { status: 500 });
  }
}
