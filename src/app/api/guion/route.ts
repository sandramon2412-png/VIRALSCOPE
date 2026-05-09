import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 120;

interface TimestampEntry {
  tiempo: string;
  titulo: string;
  descripcion: string;
}

interface TimestampsResult {
  timestamps: TimestampEntry[];
  descripcionYT: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey || apiKey === "TU_ANTHROPIC_API_KEY_AQUI") {
    return new Response(JSON.stringify({ error: "Anthropic API Key no configurada" }), { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Cuerpo inválido" }), { status: 400 });
  }

  // Handle timestamps mode
  if (body.modo === "timestamps") {
    const guionText = body.guion as string;
    const duracionText = body.duracion as string;
    const esFaceless = body.faceless !== false;

    if (!guionText || !duracionText) {
      return new Response(JSON.stringify({ error: "Faltan campos: guion y duracion son requeridos" }), { status: 400 });
    }

    const client = new Anthropic({ apiKey });

    const timestampPrompt = `Eres un experto en YouTube SEO y estructura de video. Analiza el siguiente guion y genera timestamps/capítulos para YouTube.

GUION:
${guionText.slice(0, 8000)}

DURACIÓN DEL VIDEO: ${duracionText}
ESTILO: ${esFaceless ? "Faceless (140 WPM)" : "En cámara (155 WPM)"}

INSTRUCCIONES:
1. Identifica las secciones principales del guion: HOOK, INTRO/INTRIGA, SECCIÓN 1, SECCIÓN 2, CTA INTERMEDIO, SECCIÓN 3, CIERRE, CTA FINAL
2. Calcula el tiempo aproximado de cada sección basándote en la cantidad de palabras y WPM (${esFaceless ? "140" : "155"} palabras/minuto)
3. El primer timestamp SIEMPRE es "00:00"
4. Genera títulos de capítulos que sean SEO-friendly, descriptivos y que generen curiosidad (máximo 40 caracteres)
5. Genera una descripción de YouTube completa con los timestamps embebidos al inicio

Responde ÚNICAMENTE con JSON válido en este formato exacto (sin markdown, sin backticks):
{
  "timestamps": [
    {
      "tiempo": "00:00",
      "titulo": "Introducción",
      "descripcion": "Una línea describiendo este capítulo"
    }
  ],
  "descripcionYT": "Descripción completa de YouTube con timestamps al inicio, luego el texto descriptivo del video, y hashtags relevantes al final"
}`;

    try {
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [{ role: "user", content: timestampPrompt }],
      });

      const rawText = response.content[0].type === "text" ? response.content[0].text : "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No se pudo parsear el JSON de timestamps");
      }
      const result: TimestampsResult = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ error: "Error generando timestamps" }), { status: 500 });
    }
  }

  // Default: streaming guion generation
  let titulo: string, nicho: string, formato: string, duracion: string, faceless: boolean;
  titulo = body.titulo as string;
  nicho = body.nicho as string;
  formato = body.formato as string;
  duracion = body.duracion as string;
  faceless = body.faceless !== false;

  // Calcular palabras objetivo según duración
  // Soporte para segundos: "60 seg", "90 seg" y para minutos: "5 min", "10 min"
  function parseDuracionAMinutos(dur: string): number {
    const val = parseInt(dur) || 10;
    const lower = dur.toLowerCase();
    if (lower.includes("seg") || lower.includes("sec") || lower.endsWith("s")) {
      return val / 60; // convertir segundos a minutos
    }
    return val; // ya está en minutos
  }

  const durMinutos = parseDuracionAMinutos(duracion);
  const esCorto = durMinutos <= 1.5; // Shorts / videos muy cortos (≤90 seg)
  const wpmFaceless = 140;
  const wpmCamara = 155;
  const wpm = faceless ? wpmFaceless : wpmCamara;
  const palabrasObjetivo = Math.round(durMinutos * wpm);

  const client = new Anthropic({ apiKey });

  const prompt = esCorto
    ? `Eres el mejor guionista de Shorts/Reels hispanohablante. Escribes guiones ultra-compactos que enganchan en el primer segundo y retienen el 80%+ de los espectadores.

INFORMACIÓN DEL SHORT/REEL:
- Título/Tema: ${titulo}
- Nicho: ${nicho}
- Duración objetivo: ${duracion} (≈ ${palabrasObjetivo} palabras a ${wpm} WPM)
- Estilo: ${faceless ? "Narración en off" : "Presentador en cámara"}

REGLAS DE ORO PARA SHORTS (${duracion}):
- Los primeros 2 segundos son TODO — pattern interrupt inmediato
- Sin introducción, sin "Hola", sin contexto innecesario
- Cada oración debe ganarse la siguiente
- Loop infinito: el final conecta con el inicio para rewatches
- Valor inmediato: en Shorts no hay tiempo para construir expectativa

ESTRUCTURA PARA ${duracion}:
[HOOK 0-3 SEG]: Frase de impacto que para el scroll
[CONTENIDO]: El valor directo, concreto, sin relleno
[CIERRE/LOOP]: Frase final que invita a ver de nuevo o a seguir

ESCRIBE EL GUION COMPLETO (≈${palabrasObjetivo} palabras EXACTAS — ni más ni menos):
Cada palabra debe contar. Sin secciones largas. Sin repetición. Listo para grabar.`

    : `Eres el mejor guionista de YouTube hispanohablante. Has estudiado los patrones de retención de más de 1,000 videos virales. Entiendes que la retención promedio objetivo es 60%+ y que un guion bien estructurado logra 3.2x más AVD que uno improvisado.

DATOS DE RETENCIÓN QUE DEBES APLICAR:
- El 33% abandona en los primeros 30 segundos sin hook → la apertura es sagrada
- Pattern interrupt cada 60-90 segundos evita el "modo piloto automático"
- Los Open Loops aumentan watch time 32% (Efecto Zeigarnik)
- El CTA a mitad del video (55-75% del total) convierte 20-35% más que al final
- La Regla del 3: el cerebro procesa y recuerda contenido en grupos de 3
- Estructura 10/80/10: 10% hook, 80% valor, 10% cierre/CTA
- Transición potente = Callback (lo anterior) + Bridge (conexión) + Tease (lo que viene)
- Para canales faceless: usa "tú" cada 2-3 oraciones para sustituir el contacto visual

INFORMACIÓN DEL VIDEO:
- Título: ${titulo}
- Nicho: ${nicho}
- Formato: ${formato}
- Duración objetivo: ${duracion} (≈ ${palabrasObjetivo} palabras a ${wpm} WPM)
- Estilo: ${faceless ? "Narración en off (faceless — NUNCA en primera persona con cara, narración pura)" : "Presentador en cámara"}

ESCRIBE EL GUION COMPLETO siguiendo esta estructura obligatoria:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[HOOK] [0:00 - 0:30] ← SAGRADO, NO NEGOCIABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estructura: Pattern Interrupt (0-3s) + Promesa Específica (3-15s) + Stakes (15-25s) + Open Loop Macro (25-30s)
- Abre con la situación de máxima tensión o la afirmación más polémica
- NO empieces con "Hola", "Bienvenidos", "En este video vamos a"
- Establece el MACRO LOOP: "Y al final de este video te voy a mostrar [algo específico]..."
- La promesa del hook DEBE cumplirse antes del 80% del video
[PI: Pattern interrupt visual recomendado aquí]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[INTRIGA] [0:30 - 1:30]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Construye contexto y credibilidad (sin intro genérica de canal)
- Abre el LOOP SECUNDARIO 1: tease de algo específico que viene en 3-4 minutos
- Establece por qué ESTE espectador ESPECÍFICAMENTE necesita ver esto completo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SECCIÓN 1] [1:30 - ${Math.round(durMinutos * 0.35)}:00]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estructura interna: Setup → Desarrollo → Mini-payoff → Bridge
[PI] (a los ~3 minutos): usa una de estas técnicas:
  • Pregunta directa al espectador
  • Analogía inesperada
  • Dato o estadística sorprendente
  • Escalada de importancia ("pero esto no es lo más importante...")
TRANSICIÓN: [Callback] + [Bridge] + [Tease de sección 2]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SECCIÓN 2] [${Math.round(durMinutos * 0.35)}:00 - ${Math.round(durMinutos * 0.65)}:00]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estructura interna: Setup → Desarrollo → Mini-payoff → Bridge
[PI] aquí obligatorio — el medio del video es donde más abandono ocurre
Cierra el LOOP SECUNDARIO 1 aquí, abre LOOP SECUNDARIO 2
TRANSICIÓN potente hacia sección 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[CTA INTERMEDIO] [${Math.round(durMinutos * 0.6)}:00 - ${Math.round(durMinutos * 0.65)}:00]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Posición: 60-65% del video total — convierte 20-35% más que al final
NO dices "suscríbete" a secas — lo enmarcas como beneficio para el espectador:
"Si este tipo de contenido te ayuda, suscríbete — publico [frecuencia] exactamente sobre [tema específico]."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SECCIÓN 3 — LA MÁS VALIOSA] [${Math.round(durMinutos * 0.65)}:00 - ${Math.round(durMinutos * 0.85)}:00]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Guarda tu insight MÁS IMPACTANTE para aquí — es la recompensa por quedarse
Cierra el LOOP SECUNDARIO 2
[PI] obligatorio — "Lo que viene ahora es la razón por la que hice este video..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[CIERRE DEL MACRO LOOP + SÍNTESIS] [${Math.round(durMinutos * 0.85)}:00 - ${Math.round(durMinutos * 0.92)}:00]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Entrega la resolución del Macro Loop prometida en el hook
- 1 frase de síntesis que encuadra todo en una idea más grande
- El espectador debe sentir que el tiempo valió la pena

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[CTA FINAL] [${Math.round(durMinutos * 0.92)}:00 - ${durMinutos}:00]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3 elementos obligatorios:
1. Bridge al siguiente video (específico, no genérico): "El siguiente paso lógico es [tema concreto] — hice un video que cubre exactamente eso"
2. Like: "Si esto te ahorró [tiempo/dinero/errores], un like le dice al algoritmo que más personas necesitan verlo"
3. Suscripción enmarcada como valor: "[beneficio específico] si te suscribes"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REGLAS DE ESCRITURA PARA ${faceless ? "CANAL FACELESS" : "PRESENTADOR EN CÁMARA"}:
${faceless ? `
✅ Usa "tú" y "te" cada 2-3 oraciones — reemplaza el contacto visual
✅ Inserta [PAUSA] cada 8-10 oraciones — esencial para narración en off
✅ Inserta [VISUAL: descripción específica] cada 30-45 segundos de narración
✅ Oraciones cortas (máximo 20 palabras) — más fáciles de narrar con ritmo
✅ Lenguaje sensorial: "imagina que estás sentado frente a tu computadora a las 11pm..."
✅ Usa tiempo presente para inmersión: "Estás mirando tu cuenta y ves..."
❌ NUNCA: referencias a "como pueden ver en pantalla" sin especificar qué visual
❌ NUNCA: chistes o referencias que requieran expresión facial para funcionar
` : `
✅ Incluye indicaciones de energía: (con entusiasmo), (pausar, mirar a cámara)
✅ Escribe para hablar, no para leer — frases naturales en voz alta
✅ Pausa dramática antes de puntos clave: "[PAUSA] — esto es lo importante."
✅ Marcadores de postura: (levantarse), (inclinarse hacia la cámara), (señalar)
`}

MARCADORES OBLIGATORIOS — INSÉRTALOS INLINE EN EL GUION:
Usa estos marcadores dentro del texto del guion en los momentos apropiados:

[EMOCIÓN: CURIOSIDAD] — cuando introduces una pregunta o misterio
[EMOCIÓN: SORPRESA] — cuando revelas algo inesperado
[EMOCIÓN: MIEDO] — cuando describes un problema o riesgo
[EMOCIÓN: ESPERANZA] — cuando ofreces la solución
[EMOCIÓN: URGENCIA] — cuando creas FOMO o escasez
[EMOCIÓN: VALIDACIÓN] — cuando haces sentir al espectador comprendido
[CAMBIO DE CLIP] — donde debe cortar a otro clip/imagen/b-roll
[EFECTO: nombre] — efecto de sonido específico (ej: [EFECTO: campanada], [EFECTO: música tensa])
[PAUSA DRAMÁTICA] — donde el narrador debe hacer silencio de 1-2 segundos
[DATO EN PANTALLA: texto] — texto que debe aparecer en pantalla como overlay
[OPEN LOOP] — donde abres una promesa que se cerrará más adelante
[CIERRE LOOP] — donde resuelves un open loop anterior
[CTA SUAVE] — donde insertas call-to-action no intrusivo (like, suscripción)

Ejemplo de uso correcto:
"¿Sabías que el 90% de los YouTubers fracasan en los primeros 3 meses? [EMOCIÓN: MIEDO] [DATO EN PANTALLA: 90% fracasan antes de los 90 días] Pero hay una razón específica que nadie te está contando... [EMOCIÓN: CURIOSIDAD] [OPEN LOOP] [CAMBIO DE CLIP] Y antes de que termines este video, vas a saber exactamente cómo no ser parte de esa estadística."

Distribuye al menos 15-20 marcadores a lo largo del guion completo.

FORMATO DE SALIDA:
- Guion en texto corrido, listo para leer/narrar
- Tiempos aproximados entre corchetes [0:00]
- Encabezados de sección en MAYÚSCULAS con la línea separadora
- [PI] marcado donde debe ocurrir el pattern interrupt
- [PAUSA] y [VISUAL: descripción] integrados en el texto
- Escribe el guion COMPLETO — cada frase lista para pronunciar, no un esquema

Extensión objetivo: ≈ ${palabrasObjetivo} palabras (${duracion} a ${wpm} WPM)`;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const claudeStream = await client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 6000,
          messages: [{ role: "user", content: prompt }],
        });

        for await (const chunk of claudeStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        console.error(err);
        controller.enqueue(encoder.encode("\n\nError generando el guion."));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
