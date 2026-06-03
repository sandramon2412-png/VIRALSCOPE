import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const REPLICATE_MODEL   = "fofr/face-swap-with-ideogram";


export async function POST(req: NextRequest) {
  if (!REPLICATE_API_KEY) {
    return NextResponse.json({ error: "REPLICATE_API_KEY no configurada" }, { status: 503 });
  }

  try {
    const { thumbnailBase64, faceBase64 } = await req.json();
    if (!thumbnailBase64 || !faceBase64) {
      return NextResponse.json({ error: "Faltan imágenes" }, { status: 400 });
    }

    // Iniciar predicción sin esperar resultado (evita timeout de Vercel)
    const res = await fetch(`https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          character_image: faceBase64,
          target_image:    thumbnailBase64,
        },
      }),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`Replicate ${res.status}: ${text.slice(0, 300)}`);

    let data: Record<string, unknown>;
    try { data = JSON.parse(text); }
    catch { throw new Error(`Replicate respondió texto no-JSON: ${text.slice(0, 200)}`); }

    if (!data.id) throw new Error(`Sin ID de predicción: ${JSON.stringify(data).slice(0, 200)}`);

    return NextResponse.json({ predictionId: data.id });

  } catch (err: unknown) {
    console.error("[faceswap POST]", err);
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!REPLICATE_API_KEY) {
    return NextResponse.json({ error: "REPLICATE_API_KEY no configurada" }, { status: 503 });
  }

  try {
    const predictionId = req.nextUrl.searchParams.get("id");
    if (!predictionId) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { "Authorization": `Bearer ${REPLICATE_API_KEY}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Replicate ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = await res.json() as Record<string, unknown>;
    const status = String(data.status ?? "");

    if (status === "succeeded" && data.output) {
      const outputUrl = Array.isArray(data.output) ? String(data.output[0]) : String(data.output);
      // Devolver la URL directamente — el cliente la muestra vía proxy
      return NextResponse.json({ status: "succeeded", outputUrl, method: "replicate" });
    }

    if (status === "failed") {
      throw new Error(`Modelo falló: ${data.error ?? "sin detalle"}`);
    }

    return NextResponse.json({ status });

  } catch (err: unknown) {
    console.error("[faceswap GET]", err);
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
