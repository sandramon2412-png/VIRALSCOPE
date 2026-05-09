import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 90;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TituloContenido {
  titulo: string;
  ctrScore: number;
  seoScore: number;
  viralPot: "Muy Alto" | "Alto" | "Medio" | "Bajo";
  analisis: string;
  formula: string;
  emocion: string;
}

export interface HookContenido {
  hook: string;
  palabras: number;
  duracionSeg: number;
  arquetipo: string;
  analisis: string;
}

export interface SeoContenido {
  descripcion: string;
  tags: string[];
  hashtags: string[];
}

export interface MiniaturaPrompt {
  estilo: string;
  prompt: string;
  analisis: string;
}

// ─── Shared Anthropic client helper ──────────────────────────────────────────

function getClient(apiKey: string) {
  return new Anthropic({ apiKey });
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey) return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });

  const body = await req.json();
  const {
    paso,            // "titulos" | "hook" | "guion" | "seo" | "miniaturas"
    tituloRef,       // título del video de referencia
    canalRef,        // canal de referencia
    nicho,           // nicho detectado
    tituloElegido,   // título elegido en paso 1
    hookElegido,     // hook elegido en paso 2
    variacion,       // instrucción libre del usuario
    duracion,        // duración objetivo: "60 seg", "5 min", etc.
    faceless,        // boolean
  } = body;

  const client = getClient(apiKey);
  const contexto = `Video de referencia: "${tituloRef}" del canal ${canalRef || "desconocido"} en el nicho de ${nicho || "contenido general"}.`;

  // ── PASO 1: TÍTULOS ───────────────────────────────────────────────────────

  if (paso === "titulos") {
    const prompt = `Eres el estratega de títulos #1 de YouTube en español. ${contexto}

El usuario quiere crear un video inspirado en este video viral. Genera 5 títulos ORIGINALES (NO copies el título de referencia) que sigan la misma fórmula psicológica pero con ángulo propio.

${variacion ? `El usuario quiere: "${variacion}"` : ""}

Para cada título incluye puntuaciones reales y análisis breve.

Responde SOLO con este JSON (sin markdown):
{
  "titulos": [
    {
      "titulo": "Título original de 47-60 caracteres",
      "ctrScore": 8.5,
      "seoScore": 7.8,
      "viralPot": "Alto",
      "analisis": "1-2 líneas explicando qué hace funcionar este título psicológicamente",
      "formula": "Nombre de la fórmula (ej: Curiosity Gap + Urgencia)",
      "emocion": "Miedo | Curiosidad | Urgencia | Asombro | Esperanza"
    }
  ]
}

Ordena de mayor a menor ctrScore. viralPot puede ser: "Muy Alto", "Alto", "Medio", "Bajo".`;

    try {
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });
      const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
      const data = JSON.parse(text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
      return NextResponse.json(data);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Error generando títulos" }, { status: 500 });
    }
  }

  // ── PASO 2: HOOK ─────────────────────────────────────────────────────────

  if (paso === "hook") {
    const prompt = `Eres el experto #1 en hooks de YouTube en español. ${contexto}

Título elegido para el video: "${tituloElegido}"

${variacion ? `El usuario pidió: "${variacion}"` : "Genera el hook de apertura más poderoso posible."}

El hook debe:
- Durar entre 25-45 segundos cuando se dice en voz alta (140-180 palabras)
- Abrir con pattern interrupt en los primeros 3 segundos
- Establecer un Open Loop que solo se cierra al final del video
- NO empezar con "Hola", "Bienvenidos" ni presentaciones
- Usar "tú" para conectar directamente con el espectador

Responde SOLO con este JSON (sin markdown):
{
  "hooks": [
    {
      "hook": "El texto completo del hook listo para narrar en voz alta",
      "palabras": 145,
      "duracionSeg": 35,
      "arquetipo": "Pattern Interrupt + Open Loop",
      "analisis": "Por qué este hook retiene al espectador en los primeros 30 segundos"
    }
  ]
}

Genera 2 opciones de hook con estilos diferentes.`;

    try {
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      });
      const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
      const data = JSON.parse(text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
      return NextResponse.json(data);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Error generando hook" }, { status: 500 });
    }
  }

  // ── PASO 3: GUIÓN ────────────────────────────────────────────────────────

  if (paso === "guion") {
    // Parsear duración correctamente (segundos vs minutos)
    const durStr = (duracion as string) || "10 min";
    const durVal = parseInt(durStr) || 10;
    const durLower = durStr.toLowerCase();
    const durMinutos = durLower.includes("seg") || durLower.includes("sec") ? durVal / 60 : durVal;
    const esCorto = durMinutos <= 1.5;
    const wpm = faceless !== false ? 140 : 155;
    const palabrasObjetivo = Math.round(durMinutos * wpm);

    const prompt = esCorto
      ? `Eres el mejor guionista de Shorts/Reels hispanohablante. ${contexto}

Tema/Título: "${tituloElegido}"
Hook de apertura: "${hookElegido}"
Duración objetivo: ${durStr} (≈${palabrasObjetivo} palabras)
Tipo: ${faceless !== false ? "Narración en off" : "En cámara"}

${variacion ? `Indicación: "${variacion}"` : ""}

ESCRIBE el guión completo del Short (EXACTAMENTE ≈${palabrasObjetivo} palabras, ni más):
- Los primeros 2 segundos deben parar el scroll
- Valor inmediato sin introducción
- Final con loop o llamada a la acción

Responde SOLO con JSON (sin markdown):
{
  "guion": "El guión completo del short listo para narrar"
}`
      : `Eres el mejor guionista de YouTube hispanohablante. ${contexto}

Título: "${tituloElegido}"
Hook de apertura (ya aprobado): "${hookElegido}"
Tipo de canal: ${faceless !== false ? "Faceless — narración en off" : "Con presencia en cámara"}
Duración objetivo: ${durStr} (≈${palabrasObjetivo} palabras a ${wpm} WPM)

${variacion ? `Indicación adicional: "${variacion}"` : ""}

Escribe el guión completo (sin el hook, que ya está listo) con esta estructura proporcional a ${durStr}:
- INTRODUCCIÓN (contexto + promesa expandida)
- DESARROLLO 1 (primer bloque de valor con sub-puntos)
- DESARROLLO 2 (segundo bloque con revelación principal)
- DESARROLLO 3 (tercer bloque + giro/sorpresa)
- CTA A MITAD (60% del video, natural, no forzado)
- CIERRE + CTA FINAL

Usa marcadores [PAUSA], [ÉNFASIS], [B-ROLL: descripción] para el editor.
Para canal faceless: usa "tú" cada 2-3 oraciones.
EXTENSIÓN OBLIGATORIA: ≈${palabrasObjetivo} palabras (${durStr}).

Responde SOLO con este JSON (sin markdown):
{
  "guion": "El guión completo con saltos de línea y marcadores de sección usando \\n\\n para separar secciones"
}`;

    try {
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      });
      const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
      const data = JSON.parse(text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
      return NextResponse.json(data);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Error generando guión" }, { status: 500 });
    }
  }

  // ── PASO 4: SEO ──────────────────────────────────────────────────────────

  if (paso === "seo") {
    const prompt = `Eres el experto #1 en SEO de YouTube en español. ${contexto}

Título del video: "${tituloElegido}"
Nicho: ${nicho}

Genera la descripción optimizada de YouTube y las palabras clave.

Reglas de la descripción:
- Las primeras 2 líneas (antes del "ver más") deben ser el hook más potente con la keyword principal
- Longitud total: 500-700 palabras
- Incluir timestamp-friendly sections
- Terminar con CTA y redes sociales (usa placeholders como [INSTAGRAM])
- Incluir la keyword principal 3-5 veces de forma natural

Responde SOLO con este JSON (sin markdown):
{
  "descripcion": "La descripción completa de YouTube lista para copiar y pegar",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12", "tag13", "tag14", "tag15"],
  "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3", "#Hashtag4", "#Hashtag5"]
}`;

    try {
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });
      const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
      const data = JSON.parse(text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
      return NextResponse.json(data);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Error generando SEO" }, { status: 500 });
    }
  }

  // ── PASO 5: MINIATURAS ────────────────────────────────────────────────────

  if (paso === "miniaturas") {
    const prompt = `Eres el experto #1 en miniaturas de YouTube virales. ${contexto}

Título del video: "${tituloElegido}"
Nicho: ${nicho}

${variacion ? `El usuario pidió: "${variacion}"` : ""}

Genera 3 prompts DIFERENTES de DALL-E 3 para miniaturas de este video. Cada uno debe tener un estilo visual distinto pero todos deben:
- Tener altísimo contraste y saturación
- Incluir texto corto y legible (máx 4 palabras en la imagen)
- Crear curiosidad visual inmediata
- Funcionar en tamaño pequeño (120px)

Responde SOLO con este JSON (sin markdown):
{
  "miniaturas": [
    {
      "estilo": "Nombre del estilo (ej: Hyper-realistic Cinematic)",
      "prompt": "Prompt completo en inglés para DALL-E 3, muy detallado y específico, mínimo 80 palabras",
      "analisis": "Por qué esta miniatura generaría alto CTR en el nicho"
    }
  ]
}

Los 3 estilos deben ser muy diferentes entre sí (ej: fotorrealista, ilustración, arte digital).`;

    try {
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2500,
        messages: [{ role: "user", content: prompt }],
      });
      const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
      const data = JSON.parse(text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
      return NextResponse.json(data);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Error generando prompts de miniaturas" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Paso no reconocido" }, { status: 400 });
}
