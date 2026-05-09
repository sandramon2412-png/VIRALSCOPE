import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 90;

export interface VideoPlan {
  titulo: string;
  descripcion: string;
  hook: string;
}

export interface CrearCanalResult {
  angulos: { titulo: string; descripcion: string }[];
  nombres: { nombre: string; razon: string; handle: string }[];
  descripcionCanal: string;
  palabrasClave: string[];
  pilares: string[];
  audiencia: string;
  gancho: string;
  paletaColores: string;
  bioRedes: string;
  guionTrailer: string;
  planContenido: VideoPlan[];
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });
  }

  let tipo: string, nicho: string, angulo: string, faceless: boolean,
    idioma: string, canalRef: string;
  try {
    const body = await req.json();
    tipo = body.tipo || "cero";
    nicho = body.nicho || "";
    angulo = body.angulo || "";
    faceless = !!body.faceless;
    idioma = body.idioma || "español";
    canalRef = body.canalRef || "";
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const contexto = tipo === "emular" && canalRef
    ? `El usuario quiere emular un canal similar a: ${canalRef}`
    : tipo === "cero"
    ? `El usuario quiere crear un canal desde cero${angulo ? ` con el ángulo: "${angulo}"` : ""}`
    : `Canal de referencia: ${canalRef}`;

  const tipoCanal = faceless ? "Faceless (sin mostrar rostro, voz en off o animaciones)" : "Canal con presencia personal";

  const prompt = `Eres el estratega #1 de YouTube en Latinoamérica. Has lanzado más de 500 canales exitosos.

MISIÓN: Diseñar la identidad COMPLETA de un nuevo canal de YouTube.

DATOS DEL PROYECTO:
- Tipo de inicio: ${tipo}
- Nicho/Temática: ${nicho || "sin especificar"}
- Tipo de canal: ${tipoCanal}
- Idioma principal: ${idioma}
- Contexto: ${contexto}

Genera TODO lo siguiente:

1. 4 ángulos de contenido únicos y atractivos para ese nicho
2. 5 nombres de canal creativos, memorables y únicos
3. Descripción optimizada para YouTube (máximo 1000 caracteres)
4. 10 palabras clave SEO
5. 3 pilares de contenido
6. Audiencia objetivo en 1 línea
7. Gancho poderoso para el trailer
8. Paleta de colores específica del nicho (ej: "verde esmeralda, dorado cálido y crema" para cocina saludable; "azul eléctrico, negro y plateado" para tecnología). NO usar morado/rosa genérico a menos que el nicho lo justifique.
9. Bio optimizada para Instagram/TikTok/Twitter (máximo 150 caracteres, con emojis relevantes al nicho)
10. Guión completo del video de presentación/trailer del canal (60-90 segundos, en ${idioma}, que enganche desde el primer segundo)
11. Plan de contenido con los primeros 8 videos: títulos virales, descripción breve y hook de apertura

Responde ÚNICAMENTE con este JSON exacto (sin markdown, sin texto extra):
{
  "angulos": [
    { "titulo": "Título del ángulo", "descripcion": "Descripción de 1-2 líneas" },
    { "titulo": "Ángulo 2", "descripcion": "Descripción 2" },
    { "titulo": "Ángulo 3", "descripcion": "Descripción 3" },
    { "titulo": "Ángulo 4", "descripcion": "Descripción 4" }
  ],
  "nombres": [
    { "nombre": "NombreCanal1", "razon": "Por qué este nombre funciona", "handle": "@nombrecanal1" },
    { "nombre": "NombreCanal2", "razon": "Razón 2", "handle": "@nombrecanal2" },
    { "nombre": "NombreCanal3", "razon": "Razón 3", "handle": "@nombrecanal3" },
    { "nombre": "NombreCanal4", "razon": "Razón 4", "handle": "@nombrecanal4" },
    { "nombre": "NombreCanal5", "razon": "Razón 5", "handle": "@nombrecanal5" }
  ],
  "descripcionCanal": "Descripción completa del canal de hasta 1000 caracteres, optimizada para SEO",
  "palabrasClave": ["clave1", "clave2", "clave3", "clave4", "clave5", "clave6", "clave7", "clave8", "clave9", "clave10"],
  "pilares": ["Pilar 1", "Pilar 2", "Pilar 3"],
  "audiencia": "Descripción de audiencia en 1 línea",
  "gancho": "Gancho poderoso para el trailer",
  "paletaColores": "color1, color2 y color3 (colores específicos del nicho)",
  "bioRedes": "Bio para redes sociales máximo 150 caracteres con emojis relevantes",
  "guionTrailer": "Guión completo del video de presentación (60-90 segundos). Incluye pausas, énfasis y llamada a la acción final.",
  "planContenido": [
    { "titulo": "Título viral del video 1", "descripcion": "De qué trata el video en 1-2 oraciones", "hook": "Frase de apertura ganadora para este video" },
    { "titulo": "Video 2", "descripcion": "Descripción 2", "hook": "Hook 2" },
    { "titulo": "Video 3", "descripcion": "Descripción 3", "hook": "Hook 3" },
    { "titulo": "Video 4", "descripcion": "Descripción 4", "hook": "Hook 4" },
    { "titulo": "Video 5", "descripcion": "Descripción 5", "hook": "Hook 5" },
    { "titulo": "Video 6", "descripcion": "Descripción 6", "hook": "Hook 6" },
    { "titulo": "Video 7", "descripcion": "Descripción 7", "hook": "Hook 7" },
    { "titulo": "Video 8", "descripcion": "Descripción 8", "hook": "Hook 8" }
  ]
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data: CrearCanalResult = JSON.parse(cleanText);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error generando la identidad del canal" }, { status: 500 });
  }
}
