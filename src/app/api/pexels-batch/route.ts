import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

const PEXELS_KEY = process.env.PEXELS_API_KEY;
const AI_KEY    = process.env.VIRALSCOPE_AI_KEY;

// Headers que Pexels CDN acepta para servir imágenes desde servidores externos
const CDN_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://www.pexels.com/",
  "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
};

export async function POST(req: NextRequest) {
  if (!PEXELS_KEY) return NextResponse.json({ error: "PEXELS_API_KEY no configurada" }, { status: 503 });
  if (!AI_KEY)    return NextResponse.json({ error: "AI key no configurada" }, { status: 503 });

  const { tema } = await req.json();
  if (!tema) return NextResponse.json({ error: "Falta tema" }, { status: 400 });

  // ── 1. Claude genera frases descriptivas en inglés para búsqueda en Pexels ──
  // Frases descriptivas dan mejores resultados que palabras sueltas
  const client = new Anthropic({ apiKey: AI_KEY });
  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [{
      role: "user",
      content: `Topic: "${tema}"

Generate 4 descriptive English phrases for searching stock photos on Pexels.
Rules:
- Each phrase must describe a VISUAL SCENE directly related to the topic
- Use 2-4 words per phrase, very concrete and visual
- No abstract concepts, no single words
- Each must be visually different from the others
- Output: one phrase per line, no numbers, no explanations

Example for "pilates body transformation":
woman doing pilates
fitness workout gym
healthy body exercise
person stretching yoga`,
    }],
  });

  const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
  const keywords = raw.split("\n").map(k => k.trim()).filter(Boolean).slice(0, 4);
  if (!keywords.length) return NextResponse.json({ error: "No se pudieron generar keywords" }, { status: 500 });

  // ── 2. Buscar 1 foto por frase en paralelo ─────────────────────────────────
  const searchResults = await Promise.allSettled(
    keywords.map(kw =>
      fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(kw)}&per_page=3&orientation=portrait`,
        { headers: { Authorization: PEXELS_KEY } }
      )
        .then(r => r.ok ? r.json() : Promise.reject(`Pexels search ${r.status}`))
        .then((d: { photos?: Array<{ src: { portrait: string; large: string; medium: string } }> }) => {
          const p = d.photos?.[0];
          // portrait = 800×1200px, peso ~200-300KB (perfecto para canvas 608×1080)
          return p?.src?.portrait || p?.src?.large || p?.src?.medium || null;
        })
    )
  );

  const photoUrls = searchResults
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled" && !!r.value)
    .map(r => r.value);

  if (!photoUrls.length) {
    return NextResponse.json({ error: "Pexels no devolvió resultados", keywords }, { status: 502 });
  }

  // ── 3. Descargar fotos en el servidor con headers correctos → base64 ───────
  //    El header Referer es crítico para que Pexels CDN sirva las imágenes
  const downloadResults = await Promise.allSettled(
    photoUrls.map(async url => {
      const res = await fetch(url, { headers: CDN_HEADERS });
      if (!res.ok) throw new Error(`CDN HTTP ${res.status} for ${url}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) throw new Error(`Imagen vacía (${buf.length} bytes)`);
      const ct = res.headers.get("content-type") || "image/jpeg";
      return `data:${ct};base64,${buf.toString("base64")}`;
    })
  );

  const images = downloadResults
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
    .map(r => r.value);

  // Errores de descarga para diagnóstico
  const errors = downloadResults
    .filter(r => r.status === "rejected")
    .map(r => (r as PromiseRejectedResult).reason?.toString?.() || "Unknown");

  if (!images.length) {
    return NextResponse.json({ error: "No se descargaron imágenes", keywords, photoUrls, errors }, { status: 502 });
  }

  return NextResponse.json({ images, keywords, count: images.length, errors });
}
