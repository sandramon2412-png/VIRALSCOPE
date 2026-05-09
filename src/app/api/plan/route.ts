import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 120;

export interface VideoIdea {
  numero: number;
  titulo: string;
  hook: string;
  formato: string;
  duracionIdeal: string;
  porque: string;
  semana: number;
  busquedasMes: string;
  competencia: string;
}

export interface PlanMeta {
  type: "meta";
  nicho: string;
  resumen: string;
  estrategia: string;
  frecuenciaRecomendada: string;
  patronTitulos: string;
  consejosGenerales: string[];
}

export interface PlanVideo {
  type: "video";
  numero: number;
  titulo: string;
  hook: string;
  formato: string;
  duracionIdeal: string;
  porque: string;
  semana: number;
  busquedasMes: string;
  competencia: string;
}

export type PlanChunk = PlanMeta | PlanVideo;

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey || apiKey === "TU_ANTHROPIC_API_KEY_AQUI") {
    return new Response(JSON.stringify({ error: "Anthropic API Key no configurada" }), { status: 500 });
  }

  let nicho: string, canalNombre: string, faceless: boolean, idioma: string, duracionPref: string, incluyeShorts: boolean;
  try {
    const body = await req.json();
    nicho = body.nicho;
    canalNombre = body.canalNombre || "Mi Canal";
    faceless = body.faceless ?? true;
    idioma = body.idioma || "español";
    duracionPref = body.duracionPref || "mixto";
    incluyeShorts = body.incluyeShorts ?? false;
  } catch {
    return new Response(JSON.stringify({ error: "Cuerpo inválido" }), { status: 400 });
  }

  const DURACION_MAP: Record<string, string> = {
    "mixto": "Mezcla estratégica: 4-6 videos cortos (5-8 min), 12-15 videos medianos (8-12 min), 6-8 videos largos (15-20 min) y 3-5 evergreen largos (20-30 min). Varía el formato para mantener la autoridad temática.",
    "shorts": "TODOS los videos son Shorts/Reels verticales de máximo 60 segundos. Usa formato vertical 9:16. Adapta hooks, contenido y CTAs para el formato corto. Genera 30 Shorts con temas de alto impacto en pocos segundos.",
    "cortos": "Todos los videos de 5 a 8 minutos de duración. Formato rápido, denso en valor, ideal para retención alta. Estructura: hook (30s) + valor directo (4-6 min) + CTA (30s).",
    "medianos": "Todos los videos de 8 a 12 minutos de duración. El formato óptimo para el algoritmo de YouTube: suficiente para monetización y autoridad, sin perder retención. Estructura: hook + 2-3 secciones + CTA.",
    "largos": "Todos los videos de 15 a 20 minutos de duración. Formato authority/pillar, ideal para establecer el canal como referente. Incluye más secciones, ejemplos y profundidad.",
    "muy-largos": "Todos los videos de 25 a 40 minutos de duración. Formato deep-dive/masterclass. Solo para canales de autoridad donde la audiencia busca contenido exhaustivo. Ideal para nichos educativos o técnicos.",
  };

  const duracionInstruccion = DURACION_MAP[duracionPref] || DURACION_MAP["mixto"];
  const shortsExtra = incluyeShorts && duracionPref !== "shorts"
    ? "\nADEMÁS: Intercala 5 videos de tipo Shorts/Reels (≤60 segundos, formato vertical 9:16) distribuidos estratégicamente en el plan. Márcalos con formato 'Short/Reel' y duracionIdeal '≤60 seg'."
    : "";

  const client = new Anthropic({ apiKey });

  const prompt = `Eres el mejor estratega de contenido de YouTube del mundo hispanohablante. Conoces la diferencia entre un plan genérico y un plan que realmente hace crecer canales. Has estudiado el algoritmo, la psicología del clic y la estrategia de topical authority.

FRAMEWORK ESTRATÉGICO QUE DEBES APLICAR:

**PILLAR + CLUSTER (autoridad temática):**
El algoritmo categoriza canales por tema. Si publicas contenido coherente alrededor de 2-3 pilares, YouTube te recomienda sistemáticamente a más personas interesadas en esos temas.
- Pillar: Video comprensivo (15-30+ min) que cubre un tema principal completamente
- Cluster: Videos específicos (8-12 min) que profundizan en subtemas del pillar
- El canal debe tener 2-3 pilares con 3-5 clusters cada uno

**SECUENCIA DE CRECIMIENTO PROBADA:**
- Videos 1-8 (SEED): Búsqueda alta, competencia baja. Construyen la base de datos del canal. El algoritmo necesita 10-15 videos para entender a qué audiencia recomendarte.
- Videos 9-18 (AUTHORITY): Long-form comprensivo. Establecen al canal como referente. Convierten viewers en suscriptores.
- Videos 19-25 (VIRAL): Alta compartibilidad, formato sorprendente, explota el algoritmo de sugeridos.
- Videos 26-30 (EVERGREEN): Contenido que genera views durante años. Pilar principal del canal.

**TITULOS CON ALTA CTR (aplicar a cada video):**
- Primeros 45 caracteres = toda la propuesta de valor (mobile-first)
- Una palabra en MAYÚSCULAS para jerarquía visual
- Los números aumentan CTR 20-30%
- El Information Gap Theory: el título crea una brecha que solo el video cierra
- Fórmulas de mayor CTR: "Lo Que NADIE Te Dice sobre X", "X Errores que Están [consecuencia]", "Sobreviví/Hice X y Esto PASÓ"

**HOOKS DE APERTURA (3 primeras líneas de cada video):**
- 0-5s: Pattern interrupt — empieza en el momento de máxima tensión
- 5-15s: Promesa específica con número o resultado concreto
- 15-30s: Stakes + Open Loop Macro ("y al final te mostraré...")
- NUNCA: "Hola a todos, bienvenidos a mi canal"

**MERCADO HISPANOHABLANTE:**
El mercado en español tiene menos saturación que en inglés en casi todos los nichos. Keywords que son imposibles en inglés pueden dominarse en español con 10-15 videos bien optimizados.

DATOS DEL CANAL:
- Nicho: ${nicho}
- Canal: ${canalNombre}
- Formato: ${faceless ? "Faceless (sin mostrar la cara) — narración en off" : "Con presentador en cámara"}
- Idioma: ${idioma}

INSTRUCCIONES DE FORMATO — MUY IMPORTANTE:
Responde con objetos JSON separados por saltos de línea (NDJSON). Cada línea es un JSON independiente.

LÍNEA 1 — El objeto meta del plan:
{"type":"meta","nicho":"...","resumen":"Análisis específico del nicho ${nicho} con su nivel de saturación en español, las 2-3 oportunidades más grandes y por qué este canal puede crecer","estrategia":"Estrategia pillar+cluster específica para ${nicho}: cuáles son los pilares recomendados y cómo se interrelacionan","frecuenciaRecomendada":"Frecuencia con justificación: qué necesita el algoritmo en este nicho específico","patronTitulos":"El patrón de títulos más efectivo PARA ESTE NICHO ESPECÍFICO con ejemplo concreto","consejosGenerales":["Consejo específico #1 basado en el nicho ${nicho}","Consejo específico #2","Consejo #3 sobre thumbnails para este nicho","Consejo #4 sobre SEO en español para ${nicho}","Consejo #5 sobre monetización en este nicho"]}

LÍNEAS 2-31 — Un JSON por video (30 en total):
{"type":"video","numero":1,"titulo":"Título con hasta 55 chars y una palabra en MAYÚSCULAS (fórmula de alta CTR)","hook":"Los primeros 15-20 segundos EXACTOS: Pattern interrupt → promesa específica → open loop. Listo para narrar.","formato":"Tutorial | Lista | Historia | Caso de Estudio | Comparativa | Investigación | Documental","duracionIdeal":"8-12 minutos","porque":"Por qué este video específico funciona en el algoritmo en este momento: keyword opportunity + formato + hook psychology","semana":1,"busquedasMes":"45,000 búsquedas/mes","competencia":"Baja"}

DISTRIBUCIÓN ESTRATÉGICA DE LOS 30 VIDEOS:
- Videos 1-8: SEED — Keywords con búsqueda alta y competencia baja en español. Temas evergreen del nicho. Construyen la señal temática del canal.
- Videos 9-18: AUTHORITY — Videos más largos (12-20 min), comprensivos, pilares del canal. Los que convierten viewers en suscriptores.
- Videos 19-25: VIRAL — Formatos sorprendentes, curiosity gap extremo, alta compartibilidad. Diseñados para sugeridos.
- Videos 26-30: EVERGREEN — Contenido que genera views durante 2-5 años. Responden preguntas que SIEMPRE buscarán.

PREFERENCIA DE DURACIÓN DEL CANAL:
${duracionInstruccion}${shortsExtra}

DISTRIBUCIÓN EN SEMANAS: 12 semanas, 2-3 videos por semana.
- Semanas 1-4: 2 videos/semana (seed)
- Semanas 5-8: 2-3 videos/semana (authority + seed)
- Semanas 9-12: 3 videos/semana (viral + evergreen + seed)

CALIDAD OBLIGATORIA DE CADA CAMPO:
- "titulo": DEBE tener una palabra en MAYÚSCULAS, DEBE tener ≤55 caracteres idealmente, DEBE usar una fórmula de alta CTR
- "hook": DEBE ser texto específico listo para narrar, NO una descripción de lo que debería decir
- "porque": DEBE mencionar el keyword target Y el tipo de tráfico esperado (búsqueda vs sugeridos)
- "busquedasMes": Estimación realista para el mercado hispanohablante (10K-500K)
- "competencia": Basado en la saturación REAL en español, no en inglés
- "duracionIdeal": DEBE respetar la preferencia de duración indicada arriba. Si es un Short, escribe "≤60 seg". Si es formato mixto, varía los tiempos según la fase del video.

No incluyas NINGÚN texto fuera de los JSON. Solo líneas JSON válidas.`;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const stream = await client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 10000,
          messages: [{ role: "user", content: prompt }],
        });

        let buffer = "";

        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            buffer += chunk.delta.text;

            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                JSON.parse(trimmed);
                controller.enqueue(encoder.encode(trimmed + "\n"));
              } catch {
                // línea incompleta, ignorar
              }
            }
          }
        }

        const trimmed = buffer.trim();
        if (trimmed) {
          try {
            JSON.parse(trimmed);
            controller.enqueue(encoder.encode(trimmed + "\n"));
          } catch {
            // ignorar
          }
        }
      } catch (err) {
        console.error(err);
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "error", message: "Error generando el plan" }) + "\n")
        );
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
