import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

const PEXELS_KEY = process.env.PEXELS_API_KEY;
const AI_KEY    = process.env.VIRALSCOPE_AI_KEY;

export async function POST(req: NextRequest) {
  if (!PEXELS_KEY) return NextResponse.json({ error: "PEXELS_API_KEY no configurada" }, { status: 503 });
  if (!AI_KEY)    return NextResponse.json({ error: "AI key no configurada" }, { status: 503 });

  const { tema } = await req.json();
  if (!tema) return NextResponse.json({ error: "Falta tema" }, { status: 400 });

  // ── 1. Claude genera 5 keywords en inglés para Pexels ──────────────────────
  const client = new Anthropic({ apiKey: AI_KEY });
  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 80,
    messages: [{
      role: "user",
      content: `Topic: "${tema}"\nGive me 5 diverse English keywords for stock photo search. One per line, no numbering, no extra text. Make them visually distinct from each other and relevant to the topic.`,
    }],
  });

  const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
  const keywords = raw.split("\n").map(k => k.trim()).filter(Boolean).slice(0, 5);
  if (!keywords.length) return NextResponse.json({ error: "No se pudieron generar keywords" }, { status: 500 });

  // ── 2. Buscar 1 foto por keyword (paralelo) ────────────────────────────────
  const searchResults = await Promise.allSettled(
    keywords.map(kw =>
      fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(kw)}&per_page=3&orientation=portrait`,
        { headers: { Authorization: PEXELS_KEY } }
      )
        .then(r => r.ok ? r.json() : Promise.reject(`Pexels ${r.status}`))
        .then((d: { photos?: Array<{ src: { large: string; medium: string } }> }) => {
          const p = d.photos?.[0];
          return p?.src?.large || p?.src?.medium || null;
        })
    )
  );

  const photoUrls = searchResults
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled" && !!r.value)
    .map(r => r.value);

  if (!photoUrls.length) return NextResponse.json({ error: "No se encontraron fotos en Pexels" }, { status: 502 });

  // ── 3. Descargar cada foto en el servidor y convertir a base64 (paralelo) ──
  //    El cliente recibe data URLs → sin CORS, sin proxy, funciona siempre con canvas
  const downloadResults = await Promise.allSettled(
    photoUrls.map(async url => {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 ViralScope" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const ct  = res.headers.get("content-type") || "image/jpeg";
      return `data:${ct};base64,${buf.toString("base64")}`;
    })
  );

  const images = downloadResults
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
    .map(r => r.value);

  if (!images.length) return NextResponse.json({ error: "No se pudieron descargar las imágenes" }, { status: 502 });

  return NextResponse.json({ images, keywords });
}
