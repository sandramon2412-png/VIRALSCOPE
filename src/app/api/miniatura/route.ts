import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export const maxDuration = 120;

const ESTILOS_MAP: Record<string, string> = {
  impactante:   "dramatic cinematic lighting, deep shadows, vivid high-contrast colors, intense atmosphere, HDR",
  minimalista:  "clean soft studio lighting, neutral background, minimal elegant composition, lots of negative space",
  oscuro:       "dark moody atmosphere, deep shadows, neon rim lighting, chiaroscuro, cinematic noir",
  llamativo:    "vibrant saturated neon colors, high energy dynamic lighting, bold explosive palette, pop-art energy",
  profesional:  "clean three-point studio lighting, corporate professional, deep blue and white, polished authoritative",
  mrbeast:      "hyperrealistic over-saturated colors, extreme close-up face reaction expression, bright vivid background, high-key lighting, maximum saturation, viral YouTube style",
  faceless:     "cinematic product or concept shot, no humans or faces, dramatic studio lighting, clean premium aesthetic",
  finanzas:     "dramatic gold and green tones, stacked money, financial charts going up, premium luxury aesthetic",
  motivacion:   "epic sunset or sunrise silhouette, dramatic sky, lone figure on mountain peak, golden hour cinematic",
  gaming:       "dramatic video game battle scene, neon lighting, action particles, explosive energy, cinematic gaming aesthetic",
};

const NICHO_VISUAL: Record<string, string> = {
  finanzas:       "stacked crisp hundred-dollar bills, glowing green upward stock chart on laptop screen, golden coins, financial graphs with sharp upward arrows",
  inversiones:    "glowing candlestick stock chart trending upward, laptop showing portfolio gains, gold bars and coins, green financial dashboard",
  negocios:       "sleek modern office, laptop with business metrics dashboard, briefcase, glass skyscraper background at night",
  marketing:      "glowing smartphone showing social media analytics growing, colorful campaign visuals, upward arrow engagement metrics",
  tecnologia:     "sleek futuristic tech device floating on dark background, electric blue rim light, holographic UI elements, circuit patterns",
  "inteligencia artificial": "glowing neural network web of light nodes, humanoid robot head with visible circuitry, blue-white holographic AI brain visualization",
  ia:             "glowing neural network web of light nodes, humanoid robot head with visible circuitry, blue-white holographic AI brain visualization",
  crypto:         "glowing golden Bitcoin coin floating in dark space, blockchain network visualization, green market chart, digital particles",
  motivacion:     "lone powerful silhouette standing on mountain summit at golden hour, epic vast landscape, arms raised in triumph, sunburst behind",
  "desarrollo personal": "bright road stretching toward glowing horizon, open book radiating golden light, staircase of light ascending upward",
  gaming:         "dramatic cinematic video game battle scene, glowing armored warrior with epic weapon, particle effects and ember sparks flying",
  viajes:         "breathtaking aerial view of turquoise ocean meeting dramatic cliffs, golden sunset, tiny figure against vast epic scenery",
  cocina:         "beautifully plated gourmet dish with steam rising dramatically, overhead shot, warm food photography lighting on dark surface",
  salud:          "vibrant fresh colorful vegetables and fruits in dramatic overhead composition, clean minimal aesthetic, green and white palette",
  educacion:      "open glowing book with golden light particles rising from pages, clean study desk, warm soft academic lighting",
  "true crime":   "dark mysterious crime scene tape, dramatic shadows, single spotlight beam, ominous dark atmosphere",
  historia:       "ancient dramatic ruins under dramatic stormy sky, vintage sepia-tinted atmosphere, epic historical setting",
};

const INTENSIDAD_MAP: Record<number, string> = {
  1: "subtle moderate tones, balanced exposure, natural color grading, soft contrast",
  2: "slightly boosted colors, moderate contrast, clean vivid palette",
  3: "high contrast dramatic lighting, vivid saturated colors, bold visual impact",
  4: "very high contrast, heavily saturated neon-like colors, intense dramatic atmosphere",
  5: "extreme over-the-top maximum saturation, ultra vivid hyper-intense colors, maximum contrast, explosive visual energy",
};

const TEXTO_ESPACIO_MAP: Record<string, string> = {
  izquierda: "Leave the LEFT THIRD of the image as a clean simple area with minimal detail suitable for overlaying bold text — all key visual subject matter placed on the right two-thirds",
  derecha:   "Leave the RIGHT THIRD of the image as a clean simple area with minimal detail suitable for overlaying bold text — all key visual subject matter placed on the left two-thirds",
  abajo:     "Leave the BOTTOM QUARTER of the image as a clean darker area with minimal detail suitable for overlaying bold text — all key visual subject matter in the upper three-quarters",
  ninguno:   "",
};

const FORMATO_SIZE: Record<string, "1792x1024" | "1024x1024" | "1024x1792"> = {
  landscape: "1792x1024",
  square:    "1024x1024",
  portrait:  "1024x1792",
};

function getNichoVisual(nicho: string): string {
  const lower = nicho.toLowerCase();
  for (const key of Object.keys(NICHO_VISUAL)) {
    if (lower.includes(key)) return NICHO_VISUAL[key];
  }
  return "dramatic cinematic scene that directly and literally represents the video topic with strong visual metaphors";
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function analyzeYouTubeThumbnail(
  videoId: string,
  anthropic: Anthropic
): Promise<string> {
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const res = await fetch(thumbUrl);
  if (!res.ok) throw new Error("No se pudo obtener la miniatura del video");
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mediaType = "image/jpeg";

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    messages: [{
      role: "user",
      content: [
        {
          type: "image",
          source: { type: "base64", media_type: mediaType, data: base64 },
        },
        {
          type: "text",
          text: `Analyze this YouTube thumbnail and describe its visual style in detail for DALL-E 3 reproduction. Focus on:
1. Color palette (dominant colors, contrast level)
2. Lighting style (dramatic, soft, neon, natural, etc.)
3. Composition (close-up, wide shot, layout)
4. Visual mood and energy
5. Background style
6. Key visual elements (objects, symbols, atmosphere)

Output ONLY a concise visual style description (40-60 words) in English that can be used as a DALL-E 3 style reference. No commentary, just the style description.`,
        },
      ],
    }],
  });

  return message.content[0].type === "text" ? message.content[0].text.trim() : "";
}

async function generatePrompt(
  titulo: string,
  nicho: string,
  estiloDesc: string,
  nichoVisual: string,
  intensidadDesc: string,
  textoEspacioDesc: string,
  anthropic: Anthropic,
  variation: number,
  conCara: boolean = false
): Promise<string> {

  // 5 proven thumbnail psychology formulas — one per variation
  const variationFormulas = [
    {
      cameraAngle: "medium shot, subject on left third, clean negative space on right for text",
      formula: "CURIOSITY GAP",
      formulaDetail: "Visually imply a secret being revealed or hidden knowledge exposed. Show the tantalizing outcome without fully revealing it — the viewer MUST click to find out.",
    },
    {
      cameraAngle: "extreme close-up, centered, 85mm portrait lens, razor-sharp focus, blurred bokeh background",
      formula: "BEFORE vs AFTER / CONTRAST",
      formulaDetail: "Show the dramatic transformation or paradox — ordinary vs extraordinary, poor vs wealthy, weak vs powerful. Create maximum visual tension through contrast.",
    },
    {
      cameraAngle: "dramatic low angle looking upward, subject fills 70% of frame, epic sky or environment behind",
      formula: "AUTHORITY & SCALE",
      formulaDetail: "Make the subject feel massive, powerful and aspirational. The viewer should feel small. Create awe and deep desire for what the subject represents.",
    },
    {
      cameraAngle: "diagonal split composition, two contrasting halves divided by light or color",
      formula: "SHOCK & PATTERN INTERRUPT",
      formulaDetail: "Show something unexpected, paradoxical or counterintuitive about the title. What would make someone physically stop scrolling? Use visual irony or impossible juxtaposition.",
    },
    {
      cameraAngle: "wide establishing shot, overhead or bird's eye view, full-frame subject with epic depth",
      formula: "CONCRETE PROOF",
      formulaDetail: "Make abstract concepts physical and tangible. Show stacks of money, rising charts, quantities, specific objects — concrete visual proof of the result or promise.",
    },
  ];

  const { cameraAngle, formula, formulaDetail } = variationFormulas[variation % variationFormulas.length];
  const textoEspacioInstruction = textoEspacioDesc ? `\nTEXT SPACE REQUIREMENT: ${textoEspacioDesc}` : "";

  // Face rules based on research: "DSLR photo" beats "photorealistic", physical emotion description beats vague emotion words
  const faceRule = conCara
    ? `FACE: MUST include ONE person with a clearly visible front-facing human face showing a STRONG emotion physically described (eyes wide open, jaw dropped, eyebrows raised — or mouth open in shock/excitement). Face must be prominent, close-up enough for face-swap. This is REQUIRED.`
    : `FACES: NO human faces. NO text, words or letters anywhere in the image.`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 450,
    messages: [
      {
        role: "user",
        content: `You are an expert YouTube thumbnail creator who has studied the top 0.1% viral thumbnails. You know that DALL-E 3 requires SENTENCE-BASED prompts (not keyword lists) and responds best to camera/lens references for photorealism.

VIDEO TITLE TO VISUALIZE: "${titulo}"
NICHE: ${nicho}
NICHE VISUAL ELEMENTS: ${nichoVisual}
VISUAL STYLE: ${estiloDesc}
VISUAL INTENSITY: ${intensidadDesc}
CAMERA/COMPOSITION: ${cameraAngle}
THUMBNAIL FORMULA: ${formula} — ${formulaDetail}${textoEspacioInstruction}

RULES FOR YOUR DALL-E 3 PROMPT:
1. Use the 6-part structure: [IMAGE TYPE] + [SUBJECT+EMOTION physical detail] + [SCENE/CONTEXT] + [LIGHTING: direction, color, mood] + [CAMERA: mm lens, aperture, angle] + [QUALITY: HDR, 8K, 16:9]
2. Write in full descriptive SENTENCES — DALL-E 3 is conversational, NOT keyword-based
3. For realism always write "DSLR photograph" or "cinematic photo shot on 85mm" — NEVER just "photorealistic"
4. Describe lighting specifically: "dramatic side lighting in electric blue", "overhead golden spotlight casting deep shadows" — never just "good lighting"
5. Include ONLY 3-5 key visual elements — DALL-E drops extras
6. Apply the ${formula} formula — every element must serve the click psychology
7. ${faceRule}
8. End with: "16:9 aspect ratio, YouTube thumbnail composition"
9. Write 75-95 words maximum

Output ONLY the raw DALL-E 3 prompt. No explanations, no preamble.`,
      }
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text.trim() : "";
}

async function refinePrompt(
  originalPrompt: string,
  editInstruction: string,
  anthropic: Anthropic
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 450,
    messages: [{
      role: "user",
      content: `You are an expert DALL-E 3 prompt engineer who specializes in viral YouTube thumbnails. Apply the user's edit instruction to the original prompt while preserving or strengthening the click-through psychology.

ORIGINAL PROMPT:
${originalPrompt}

USER EDIT INSTRUCTION:
${editInstruction}

DALL-E 3 PROMPT RULES:
- Write in full descriptive SENTENCES (DALL-E 3 is conversational, not keyword-based)
- Keep camera/lens references for realism: "DSLR photograph", "shot on 85mm lens, f/1.8"
- Describe lighting specifically: direction, color, mood (never vague)
- Describe emotions PHYSICALLY if faces are present ("eyes wide, jaw dropped" not just "shocked")
- Maintain or strengthen the viral click psychology
- 75-95 words maximum, English only
- End with "16:9 aspect ratio, YouTube thumbnail composition"
- Output ONLY the refined raw DALL-E 3 prompt, nothing else.`,
    }],
  });

  return message.content[0].type === "text" ? message.content[0].text.trim() : originalPrompt;
}

export async function POST(req: NextRequest) {
  const anthropicKey = process.env.VIRALSCOPE_AI_KEY;
  const openaiKey    = process.env.OPENAI_API_KEY;

  if (!anthropicKey || anthropicKey === "TU_ANTHROPIC_API_KEY_AQUI") {
    return NextResponse.json({ error: "Anthropic API Key no configurada" }, { status: 500 });
  }
  if (!openaiKey || openaiKey === "TU_OPENAI_API_KEY_AQUI") {
    return NextResponse.json({ error: "OpenAI API Key no configurada" }, { status: 500 });
  }

  let titulo: string,
      nicho: string,
      estilo: string,
      variaciones: number,
      youtubeUrl: string,
      editPrompt: string,
      formato: string,
      textoEspacio: string,
      intensidad: number,
      existingPrompts: string[],
      conCara: boolean;

  try {
    const body      = await req.json();
    titulo          = body.titulo || "";
    nicho           = body.nicho || "general";
    estilo          = body.estilo || "impactante";
    variaciones     = Math.min(Math.max(Number(body.variaciones) || 1, 1), 5);
    youtubeUrl      = body.youtubeUrl || "";
    editPrompt      = body.editPrompt || "";
    formato         = body.formato || "landscape";
    textoEspacio    = body.textoEspacio || "ninguno";
    intensidad      = Math.min(Math.max(Number(body.intensidad) || 3, 1), 5);
    existingPrompts = Array.isArray(body.existingPrompts) ? body.existingPrompts : [];
    conCara         = !!(body.conCara);
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const anthropic        = new Anthropic({ apiKey: anthropicKey });
  const openai           = new OpenAI({ apiKey: openaiKey });
  const nichoVisual      = getNichoVisual(nicho);
  const intensidadDesc   = INTENSIDAD_MAP[intensidad] || INTENSIDAD_MAP[3];
  const textoEspacioDesc = TEXTO_ESPACIO_MAP[textoEspacio] || "";
  const dalleSize        = FORMATO_SIZE[formato] || "1792x1024";

  try {
    let estiloDesc = ESTILOS_MAP[estilo] || ESTILOS_MAP.impactante;

    // Si tiene URL de YouTube, analizar su miniatura para clonar el estilo
    if (youtubeUrl.trim()) {
      const videoId = extractYouTubeId(youtubeUrl.trim());
      if (!videoId) {
        return NextResponse.json({ error: "URL de YouTube inválida" }, { status: 400 });
      }
      try {
        const analyzedStyle = await analyzeYouTubeThumbnail(videoId, anthropic);
        estiloDesc = analyzedStyle + ", " + estiloDesc;
      } catch {
        // Si falla el análisis, continúa con el estilo normal
      }
    }

    let prompts: string[];

    if (editPrompt.trim() && existingPrompts.length > 0) {
      // Modo refinamiento: Claude toma los prompts existentes + instrucción de edición
      // y genera versiones mejoradas. Si el nro de variaciones es mayor, genera nuevos extra.
      const toRefine = existingPrompts.slice(0, variaciones);
      const refinePromises = toRefine.map((p: string) =>
        refinePrompt(p, editPrompt, anthropic)
      );

      // Si se piden más variaciones que prompts existentes, generar el resto nuevo
      const extraCount = Math.max(0, variaciones - toRefine.length);
      const extraPromises = Array.from({ length: extraCount }, (_, i) =>
        generatePrompt(titulo, nicho, estiloDesc, nichoVisual, intensidadDesc, textoEspacioDesc, anthropic, toRefine.length + i, conCara)
      );

      prompts = await Promise.all([...refinePromises, ...extraPromises]);
    } else {
      // Modo normal: generar N prompts nuevos en paralelo
      const promptPromises = Array.from({ length: variaciones }, (_, i) =>
        generatePrompt(titulo, nicho, estiloDesc, nichoVisual, intensidadDesc, textoEspacioDesc, anthropic, i, conCara)
      );
      prompts = await Promise.all(promptPromises);
    }

    // Generar N imágenes con DALL-E 3 en paralelo
    const imagePromises = prompts.map(promptText =>
      openai.images.generate({
        model:   "dall-e-3",
        prompt:  promptText,
        n:       1,
        size:    dalleSize,
        quality: "standard",
        style:   "vivid",
      })
    );
    const imageResponses = await Promise.all(imagePromises);

    const images = imageResponses.map((r, i) => ({
      url:    r.data?.[0]?.url || "",
      prompt: prompts[i],
    })).filter(img => img.url);

    if (images.length === 0) {
      return NextResponse.json({ error: "DALL-E 3 no devolvió imágenes" }, { status: 500 });
    }

    return NextResponse.json({ images });

  } catch (err: unknown) {
    console.error("[miniatura] error:", err);
    const msg = err instanceof Error ? err.message : "Error generando miniatura";
    if (msg.includes("billing") || msg.includes("quota") || msg.includes("insufficient")) {
      return NextResponse.json({ error: "Créditos de OpenAI insuficientes. Recarga en platform.openai.com/billing" }, { status: 402 });
    }
    if (msg.includes("content_policy") || msg.includes("safety")) {
      return NextResponse.json({ error: "DALL-E rechazó el prompt. Intenta con un título diferente." }, { status: 400 });
    }
    return NextResponse.json({ error: `Error: ${msg}` }, { status: 500 });
  }
}
