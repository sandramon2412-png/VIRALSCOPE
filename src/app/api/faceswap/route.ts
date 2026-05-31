import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

const REPLICATE_API_KEY     = process.env.REPLICATE_API_KEY;
const REPLICATE_VERSION     = "278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34";

async function createPrediction(targetBase64: string, faceBase64: string): Promise<string> {
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${REPLICATE_API_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "wait=60",
    },
    body: JSON.stringify({
      version: REPLICATE_VERSION,
      input: {
        target_image: targetBase64,
        swap_image:   faceBase64,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Replicate error: ${res.status} — ${text}`);
  }

  const data = await res.json();

  // "Prefer: wait" devuelve el resultado directo si termina en <60s
  if (data.status === "succeeded" && data.output) {
    return data.output;
  }

  // Si no terminó, hacemos polling
  if (data.id) {
    return await pollPrediction(data.id);
  }

  throw new Error("Respuesta inesperada de Replicate");
}

async function pollPrediction(predictionId: string, timeoutMs = 90000): Promise<string> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    await new Promise(r => setTimeout(r, 2500));

    const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { "Authorization": `Bearer ${REPLICATE_API_KEY}` },
    });

    if (!res.ok) continue;

    const data = await res.json();

    if (data.status === "succeeded" && data.output) return data.output;
    if (data.status === "failed") throw new Error(data.error ?? "Replicate: procesamiento fallido");
  }

  throw new Error("Timeout esperando resultado de Replicate (90s)");
}

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mime = res.headers.get("content-type") ?? "image/png";
  return `data:${mime};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  if (!REPLICATE_API_KEY) {
    return NextResponse.json(
      { error: "REPLICATE_API_KEY no configurada en variables de entorno" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { thumbnailBase64, faceBase64 } = body;

    if (!thumbnailBase64 || !faceBase64) {
      return NextResponse.json({ error: "Faltan imágenes" }, { status: 400 });
    }

    // Replicate acepta base64 directamente como data URI
    const outputUrl = await createPrediction(thumbnailBase64, faceBase64);

    // Convertimos la URL de salida a base64 para devolverla al cliente
    const resultBase64 = await urlToBase64(outputUrl);

    return NextResponse.json({ imageBase64: resultBase64, method: "replicate" });

  } catch (err: unknown) {
    console.error("[faceswap] error:", err);
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
