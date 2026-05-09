import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

interface HashtagWithVolume {
  tag: string;
  volumen: "Alto" | "Medio" | "Bajo";
}

interface HashtagResult {
  principales: HashtagWithVolume[];
  nicho: HashtagWithVolume[];
  tendencia: HashtagWithVolume[];
  longtail: HashtagWithVolume[];
  descripcionOptimizada: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey || apiKey === "TU_ANTHROPIC_API_KEY_AQUI") {
    return new Response(JSON.stringify({ error: "Anthropic API Key no configurada" }), { status: 500 });
  }

  let tema: string, nicho: string, idioma: string, cantidad: number;
  try {
    const body = await req.json();
    tema = body.tema || "";
    nicho = body.nicho || "";
    idioma = body.idioma || "ES";
    cantidad = body.cantidad || 30;
  } catch {
    return new Response(JSON.stringify({ error: "Cuerpo inválido" }), { status: 400 });
  }

  if (!tema.trim()) {
    return new Response(JSON.stringify({ error: "El campo 'tema' es requerido" }), { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const prompt = `Eres un experto en SEO de YouTube y estrategia de hashtags. Genera hashtags optimizados para YouTube en idioma ${idioma === "ES" ? "español" : idioma === "EN" ? "inglés" : "portugués"}.

TEMA DEL VIDEO: ${tema}
NICHO: ${nicho || "General"}
CANTIDAD TOTAL SOLICITADA: ${cantidad}

INSTRUCCIONES:
- Genera hashtags reales y relevantes que la gente realmente busca en YouTube
- Para "volumen": "Alto" = hashtag muy genérico con millones de búsquedas, "Medio" = nicho moderado con cientos de miles, "Bajo" = específico con decenas de miles pero menos competencia
- Los hashtags NO deben incluir el símbolo #, lo pondrá la interfaz
- Los hashtags de tendencia deben ser virales y de actualidad relacionados con el tema
- Los longtail deben ser frases de 3-5 palabras específicas
- La descripcionOptimizada debe ser una descripción completa de YouTube con los top 15 hashtags al final en formato #hashtag

Responde ÚNICAMENTE con JSON válido (sin markdown, sin backticks):
{
  "principales": [
    {"tag": "nombrehashtag", "volumen": "Alto"},
    {"tag": "nombrehashtag", "volumen": "Alto"},
    {"tag": "nombrehashtag", "volumen": "Alto"},
    {"tag": "nombrehashtag", "volumen": "Medio"},
    {"tag": "nombrehashtag", "volumen": "Medio"}
  ],
  "nicho": [
    {"tag": "hashtagnicho1", "volumen": "Medio"},
    {"tag": "hashtagnicho2", "volumen": "Medio"},
    {"tag": "hashtagnicho3", "volumen": "Bajo"},
    {"tag": "hashtagnicho4", "volumen": "Bajo"},
    {"tag": "hashtagnicho5", "volumen": "Medio"},
    {"tag": "hashtagnicho6", "volumen": "Bajo"},
    {"tag": "hashtagnicho7", "volumen": "Medio"},
    {"tag": "hashtagnicho8", "volumen": "Bajo"},
    {"tag": "hashtagnicho9", "volumen": "Medio"},
    {"tag": "hashtagnicho10", "volumen": "Bajo"}
  ],
  "tendencia": [
    {"tag": "trendinghashtag1", "volumen": "Alto"},
    {"tag": "trendinghashtag2", "volumen": "Alto"},
    {"tag": "trendinghashtag3", "volumen": "Medio"},
    {"tag": "trendinghashtag4", "volumen": "Medio"},
    {"tag": "trendinghashtag5", "volumen": "Bajo"}
  ],
  "longtail": [
    {"tag": "longtailhashtag uno", "volumen": "Bajo"},
    {"tag": "longtailhashtag dos", "volumen": "Bajo"},
    {"tag": "longtailhashtag tres", "volumen": "Bajo"},
    {"tag": "longtailhashtag cuatro", "volumen": "Bajo"},
    {"tag": "longtailhashtag cinco", "volumen": "Bajo"},
    {"tag": "longtailhashtag seis", "volumen": "Bajo"},
    {"tag": "longtailhashtag siete", "volumen": "Bajo"},
    {"tag": "longtailhashtag ocho", "volumen": "Bajo"},
    {"tag": "longtailhashtag nueve", "volumen": "Bajo"},
    {"tag": "longtailhashtag diez", "volumen": "Bajo"}
  ],
  "descripcionOptimizada": "Descripción atractiva del video (2-3 párrafos sobre el tema: ${tema}). Explica qué aprenderá el espectador. Incluye una llamada a la acción para suscribirse.\\n\\n⏰ TIMESTAMPS\\n00:00 Introducción\\n\\n📌 En este video:\\n• Punto clave 1\\n• Punto clave 2\\n• Punto clave 3\\n\\n#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 #hashtag6 #hashtag7 #hashtag8 #hashtag9 #hashtag10 #hashtag11 #hashtag12 #hashtag13 #hashtag14 #hashtag15"
}`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se pudo parsear la respuesta JSON");
    }
    const result: HashtagResult = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify({ hashtags: result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Error generando hashtags" }), { status: 500 });
  }
}
