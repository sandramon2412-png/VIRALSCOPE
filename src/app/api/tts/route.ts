import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === "TU_ELEVENLABS_API_KEY_AQUI") {
    return NextResponse.json({ error: "ElevenLabs API Key no configurada. Agrégala en .env.local" }, { status: 500 });
  }

  let texto: string, voiceId: string;
  try {
    const body = await req.json();
    texto = body.texto;
    voiceId = body.voiceId || "pNInz6obpgDQGcFmaJgB"; // voz Adam (neutral, español)
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  // Limpiar el guion — solo dejar el texto hablado
  const textoLimpio = texto
    .replace(/\[\d+:\d+(?::\d+)?\]/g, "")          // quita tiempos [0:00]
    .replace(/\(.*?\)/g, "")                          // quita indicaciones (visuales en paréntesis)
    .replace(/\*\*(.*?)\*\*/g, "$1")                  // quita negritas **texto**
    .replace(/^#{1,3}\s+.+$/gm, "")                   // quita títulos ## Sección
    .replace(/^[A-ZÁÉÍÓÚÑ\s]{4,}$/gm, "")            // quita líneas en MAYÚSCULAS (secciones)
    .replace(/^[-*•]\s+/gm, "")                       // quita viñetas
    .replace(/\n{3,}/g, "\n\n")                       // colapsa líneas vacías múltiples
    .trim();

  // Limitar a 5000 caracteres para el plan gratuito
  const textoLimitado = textoLimpio.slice(0, 5000);

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: textoLimitado,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.detail?.message || "Error de ElevenLabs" }, { status: 400 });
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "attachment; filename=guion.mp3",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error generando el audio" }, { status: 500 });
  }
}
