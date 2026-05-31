import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const maxDuration = 120;

const REPLICATE_MODEL = "fofr/face-swap-with-ideogram";

function base64ToBlob(dataUri: string): Blob {
  const match = dataUri.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!match) throw new Error("Formato de imagen inválido");
  const mimeType = match[1];
  const bytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  return new Blob([new Uint8Array(bytes)], { type: mimeType });
}

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mime = res.headers.get("content-type") ?? "image/png";
  return `data:${mime};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.REPLICATE_API_KEY;
  if (!apiKey) {
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

    const replicate = new Replicate({ auth: apiKey });

    // El SDK de Replicate sube los Blobs automáticamente a la Files API
    const faceBlob = base64ToBlob(faceBase64);
    const targetBlob = base64ToBlob(thumbnailBase64);

    const output = await replicate.run(REPLICATE_MODEL as `${string}/${string}`, {
      input: {
        character_image: faceBlob,
        target_image: targetBlob,
      },
    });

    // output es una URL o array de URLs
    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);
    if (!outputUrl || outputUrl === "null" || outputUrl === "undefined") {
      throw new Error("El modelo no devolvió una imagen");
    }

    const resultBase64 = await urlToBase64(outputUrl);

    return NextResponse.json({ imageBase64: resultBase64, method: "replicate" });

  } catch (err: unknown) {
    console.error("[faceswap] error:", err);
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
