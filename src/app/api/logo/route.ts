import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const anthropicKey = process.env.VIRALSCOPE_AI_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!anthropicKey || !openaiKey) {
    return NextResponse.json({ error: "API Keys no configuradas" }, { status: 500 });
  }

  const { nombreCanal, nicho, estilo, colores, tipo, angulo, audiencia, pilares } = await req.json();
  // tipo: "logo" | "banner" | "ambos"

  const anthropic = new Anthropic({ apiKey: anthropicKey });
  const openai = new OpenAI({ apiKey: openaiKey });

  // Step 1: Claude generates optimized DALL-E prompts
  const promptMsg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Eres un director creativo experto en branding para YouTube. Genera prompts de DALL-E 3 altamente creativos y ESPECÍFICOS AL NICHO para el canal "${nombreCanal}".

DATOS DEL CANAL:
- Nombre: "${nombreCanal}"
- Nicho: ${nicho}
- Estilo visual: ${estilo || "moderno y profesional"}
- Paleta de colores del nicho: ${colores || "elige colores que representen visualmente el nicho (NO morado/rosa genérico a menos que el nicho lo justifique)"}
- Tipo: ${tipo}
${angulo ? `- Ángulo único del canal: ${angulo}` : ""}
${audiencia ? `- Audiencia objetivo: ${audiencia}` : ""}
${pilares ? `- Pilares de contenido: ${pilares}` : ""}

REGLAS DE COLOR POR NICHO (ejemplos):
- Cocina/Gastronomía → rojos cálidos, naranjas, dorado, crema, marrón chocolate
- Finanzas/Dinero → verde esmeralda, dorado, azul marino, negro
- Tecnología/IA → azul eléctrico, cyan neón, negro, plateado
- Fitness/Salud → naranja energético, verde lima, negro, blanco
- Gaming → rojo neón, negro, verde eléctrico, púrpura oscuro
- Desarrollo Personal → azul confianza, dorado, blanco, turquesa
- Viajes → azul cielo, arena, verde tropical, coral
- Crypto/Web3 → naranja bitcoin, azul blockchain, negro, plateado
- USA los colores del parámetro "paletaColores" si está disponible

REGLAS CRÍTICAS para los prompts:
- JAMÁS uses imágenes de stock fotográfico, personas reales o poses corporativas genéricas
- El logo debe ser un símbolo gráfico ORIGINAL e icónico relacionado al nicho (como grandes marcas)
- El banner debe ser una obra de arte digital cinematográfica y temática
- Usa metáforas visuales ESPECÍFICAS del nicho: cocina → ingredientes artísticos; fitness → energía cinética; tech → circuitos/neuronas
- Incluye elementos de profundidad: gradientes, luces volumétricas, partículas, efectos de brillo
- Estilo artístico: ilustración vectorial/digital art, NO fotografía realista
- Para el banner: composición diagonal dinámica, incluye el nombre del canal como texto

Responde SOLO con JSON (sin markdown ni backticks):
{
  "logo_prompt": "Prompt ultra-específico para logo YouTube 1:1. Estructura: [Tipo de arte] de [símbolo concreto del nicho], estilo [artístico específico], paleta [colores específicos del nicho con tonos], iluminación [tipo], fondo oscuro con acentos del nicho, sin texto, icónico",
  "banner_prompt": "Prompt ultra-específico para banner YouTube 16:9. Incluye: composición diagonal dinámica, [elementos visuales del nicho], texto '${nombreCanal}' en tipografía moderna, paleta [colores del nicho], efectos de luz y profundidad, atmósfera temática del nicho, arte digital"
}`
    }]
  });

  const promptText = promptMsg.content[0].type === "text" ? promptMsg.content[0].text.trim() : "";
  let prompts: { logo_prompt: string; banner_prompt: string };

  try {
    const clean = promptText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    prompts = JSON.parse(clean);
  } catch {
    return NextResponse.json({ error: "Error generando prompts" }, { status: 500 });
  }

  const results: { logo?: string; banner?: string } = {};

  // Step 2: Generate images with DALL-E 3
  if (tipo === "logo" || tipo === "ambos") {
    try {
      const logoRes = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompts.logo_prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
      });
      results.logo = logoRes.data?.[0]?.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generando logo";
      return NextResponse.json({ error: `Logo: ${msg}` }, { status: 500 });
    }
  }

  if (tipo === "banner" || tipo === "ambos") {
    try {
      const bannerRes = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompts.banner_prompt,
        n: 1,
        size: "1792x1024",
        quality: "standard",
        style: "vivid",
      });
      results.banner = bannerRes.data?.[0]?.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generando banner";
      return NextResponse.json({ error: `Banner: ${msg}` }, { status: 500 });
    }
  }

  return NextResponse.json({ ...results, prompts });
}
