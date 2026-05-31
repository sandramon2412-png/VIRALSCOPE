import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const REPLICATE_MODEL   = "fofr/face-swap-with-ideogram";

async function pollPrediction(predictionId: string, timeoutMs = 90000): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise(r => setTimeout(r, 3000));
    const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { "Authorization": `Bearer ${REPLICATE_API_KEY}` },
    });
    if (!res.ok) continue;
    const data = await res.json();
    if (data.status === "succeeded" && data.output) return String(data.output);
    if (data.status === "failed") throw new Error(data.error ?? "Face swap fallido");
  }
  throw new Error("Timeout esperando resultado (90s)");
}

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
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

    // Replicate acepta data URIs base64 directamente como FileInput
    const res = await fetch(`https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "wait=60",
      },
      body: JSON.stringify({
        input: {
          character_image: faceBase64,
          target_image:    thumbnailBase64,
        },
      }),
    });

    const responseText = await res.text();
    if (!res.ok) {
      throw new Error(`Replicate ${res.status}: ${responseText.slice(0, 300)}`);
    }

    const data = JSON.parse(responseText);

    let outputUrl: string;
    if (data.status === "succeeded" && data.output) {
      outputUrl = Array.isArray(data.output) ? String(data.output[0]) : String(data.output);
    } else if (data.id) {
      outputUrl = await pollPrediction(data.id);
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
