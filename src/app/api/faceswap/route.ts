import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const REPLICATE_MODEL   = "fofr/face-swap-with-ideogram";

// Sube una imagen base64 a Replicate Files API y devuelve la URL pública
async function uploadImageToReplicate(base64DataUri: string): Promise<string> {
  // El flag 's' permite que '.' coincida con saltos de línea en el base64
  const match = base64DataUri.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) throw new Error("Formato de imagen inválido");

  const mimeType = match[1];
  const base64Data = match[2].replace(/\s/g, "");
  const bytes = new Uint8Array(Buffer.from(base64Data, "base64"));
  const blob = new Blob([bytes], { type: mimeType });

  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const filename = `image.${ext}`;

  const res = await fetch("https://api.replicate.com/v1/files", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${REPLICATE_API_KEY}`,
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
    body: blob,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error subiendo imagen: ${res.status} — ${text}`);
  }

  const data = await res.json();
  return data.urls?.get ?? data.url;
}

async function createPrediction(targetUrl: string, faceUrl: string): Promise<string> {
  const res = await fetch(`https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${REPLICATE_API_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "wait=60",
    },
    body: JSON.stringify({
      input: {
        character_image: faceUrl,
        target_image:    targetUrl,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Replicate error: ${res.status} — ${text}`);
  }

  const data = await res.json();

  if (data.status === "succeeded" && data.output) {
    return data.output;
  }

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

    // Subir imágenes a Replicate para obtener URLs públicas
    const [targetUrl, faceUrl] = await Promise.all([
      uploadImageToReplicate(thumbnailBase64),
      uploadImageToReplicate(faceBase64),
    ]);

    const outputUrl = await createPrediction(targetUrl, faceUrl);

    const resultBase64 = await urlToBase64(outputUrl);

    return NextResponse.json({ imageBase64: resultBase64, method: "replicate" });

  } catch (err: unknown) {
    console.error("[faceswap] error:", err);
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
