import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const REPLICATE_MODEL   = "fofr/face-swap-with-ideogram";

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Replicate respondió con texto no-JSON (${res.status}): ${text.slice(0, 300)}`); }
}

async function pollPrediction(predictionId: string, timeoutMs = 55000): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise(r => setTimeout(r, 3000));
    const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { "Authorization": `Bearer ${REPLICATE_API_KEY}` },
    });
    if (!res.ok) continue;
    const data = await safeJson(res) as Record<string, unknown>;
    if (data.status === "succeeded" && data.output) return String(data.output);
    if (data.status === "failed") throw new Error(`Modelo falló: ${data.error ?? "sin detalle"}`);
  }
  throw new Error("Timeout: el modelo tardó más de 55s");
}

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar resultado: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const mime = res.headers.get("content-type") ?? "image/png";
  return `data:${mime};base64,${Buffer.from(buffer).toString("base64")}`;
}

export async function POST(req: NextRequest) {
  if (!REPLICATE_API_KEY) {
    return NextResponse.json({ error: "REPLICATE_API_KEY no configurada" }, { status: 503 });
  }

  try {
    const { thumbnailBase64, faceBase64 } = await req.json();
    if (!thumbnailBase64 || !faceBase64) {
      return NextResponse.json({ error: "Faltan imágenes" }, { status: 400 });
    }

    // Replicate acepta data URIs base64 para imágenes < 256KB
    const res = await fetch(`https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "wait=55",
      },
      body: JSON.stringify({
        input: {
          character_image: faceBase64,
          target_image:    thumbnailBase64,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Replicate ${res.status}: ${text.slice(0, 300)}`);
    }

    const data = await safeJson(res) as Record<string, unknown>;

    let outputUrl: string;
    if (data.status === "succeeded" && data.output) {
      outputUrl = String(data.output);
    } else if (data.id) {
      outputUrl = await pollPrediction(String(data.id));
    } else {
      throw new Error(`Respuesta inesperada: ${JSON.stringify(data).slice(0, 200)}`);
    }

    const resultBase64 = await urlToBase64(outputUrl);
    return NextResponse.json({ imageBase64: resultBase64, method: "replicate" });

  } catch (err: unknown) {
    console.error("[faceswap]", err);
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
