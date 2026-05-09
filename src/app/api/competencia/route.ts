import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey) return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });

  const { canales, nicho } = await req.json();

  const client = new Anthropic({ apiKey });

  const canalesStr = canales.map((c: { nombre: string; suscriptores: string; videosXsemana: string; estilo: string }, i: number) =>
    `Canal ${i + 1}: "${c.nombre}" — ${c.suscriptores} suscriptores, ${c.videosXsemana} videos/semana, estilo: ${c.estilo}`
  ).join("\n");

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4500,
    messages: [{
      role: "user",
      content: `Eres el analista de canales de YouTube más experto del mercado hispanohablante. Conoces la diferencia entre métricas de vanidad (suscriptores) y métricas que importan (outlier score, engagement rate, views-to-subscriber ratio).

FRAMEWORK DE ANÁLISIS QUE DEBES APLICAR:

**MÉTRICAS REALES (no vanity metrics):**
- Views-to-Subscriber Ratio: Un video con 500K views en un canal de 50K subs (ratio 10x) es MEJOR señal que 1M views en canal de 5M subs (ratio 0.2x)
- Outlier Score: Videos que superan 3x+ el promedio del canal = tema/formato validado
- Engagement Rate saludable: 3-5% (comentarios + likes / 1000 views)
- CTR saludable: 4-6% promedio, 7%+ es fuerte

**ESTRATEGIA DE CONTENIDO (Pillar + Cluster):**
- Pillar: Video comprensivo sobre tema principal (genera autoridad temática)
- Cluster: Videos específicos sobre subtemas del pillar (capturan long-tail)
- La combinación es lo que hace que el algoritmo categorice y recomiende el canal

**ANÁLISIS DE GAPS DE CONTENIDO:**
- Temas cubiertos una sola vez sin seguimiento = oportunidad sin explotar
- Preguntas en comentarios sin respuesta en video = demanda sin satisfacer
- Formatos ausentes (si todos hacen tutoriales y nadie hace casos de estudio = gap)

**CLASIFICACIÓN DE VIDEOS:**
- Seed videos: búsqueda alta, competencia baja, establece autoridad temática
- Authority videos: largo plazo, comprensivos, convierten suscriptores
- Viral videos: alta compartibilidad, spikes de descubrimiento

**MERCADO ESPAÑOL vs INGLÉS:**
El nicho hispanohablante es sustancialmente menos saturado. Un tema muy competido en inglés puede tener solo 10-20 videos en español, con oportunidades directas de dominación.

NICHO ANALIZADO: ${nicho}
CANALES A ANALIZAR:
${canalesStr}

Responde ÚNICAMENTE con este JSON exacto (sin markdown):
{
  "resumen_nicho": {
    "estado": "Análisis del estado actual del nicho en 2-3 oraciones con saturación, oportunidades y tendencias",
    "saturacion": "Baja | Media | Alta",
    "oportunidad_hispanohablante": "Análisis específico de por qué el mercado en español tiene o no tiene oportunidad frente al inglés",
    "formato_dominante": "Qué formato de video domina el nicho y por qué"
  },
  "canales": [
    {
      "nombre": "nombre del canal",
      "tipo_contenido": "Educativo | Entretenimiento | Motivacional | Informativo | Mixto | Tutorial",
      "clasificacion_videos": "¿Principalmente Seed, Authority o Viral?",
      "estrategia_pillar_cluster": "¿Tiene estructura pillar+cluster? ¿Cuáles son sus pilares principales?",
      "fortalezas": ["fortaleza específica con evidencia", "fortaleza 2", "fortaleza 3"],
      "debilidades": ["debilidad con oportunidad explotable", "debilidad 2"],
      "gaps_contenido": ["Tema que el canal no cubre bien o no cubre", "gap 2"],
      "formula_titulos": "Patrón que usan en sus títulos (ej: 'número + promesa', 'curiosity gap', 'insider reveal')",
      "publico_objetivo": "Descripción específica del espectador típico de este canal",
      "puntuacion_seo": 75,
      "puntuacion_engagement": 80,
      "puntuacion_consistencia": 70,
      "outlier_estimado": "Basado en su ratio views/subs, ¿tienen videos que superan 3-5x su promedio?"
    }
  ],
  "comparativa": {
    "lider_autoridad_tematica": "Canal con mejor estructura pillar+cluster y por qué",
    "lider_engagement": "Canal con mejor engagement real (no solo views) y métrica específica",
    "lider_seo": "Canal con mejor optimización de búsquedas y por qué",
    "mas_copiable": "El canal más fácil de superar y por qué específicamente",
    "gap_formato": "Formato de video que NINGUNO está haciendo bien = oportunidad directa",
    "gap_tema": "Tema/subtema del nicho ${nicho} que ningún canal cubre de forma comprensiva"
  },
  "oportunidades": [
    {
      "titulo": "Nombre de la oportunidad específica",
      "descripcion": "Descripción detallada con el ángulo exacto a tomar",
      "tipo": "Seed | Authority | Viral",
      "dificultad": "Baja | Media | Alta",
      "impacto_potencial": "Bajo | Medio | Alto",
      "ejemplo_titulo": "Título específico de video que podría explotar esta oportunidad"
    }
  ],
  "estrategia_recomendada": {
    "posicionamiento": "Cómo diferenciarte de todos estos canales con un ángulo único",
    "pillar_principal": "El tema pillar más recomendado para construir autoridad temática",
    "clusters_iniciales": ["Subtema 1 para cluster", "Subtema 2", "Subtema 3"],
    "primeros_5_videos": [
      {"numero": 1, "tipo": "Seed", "enfoque": "Descripción específica del primer video"},
      {"numero": 2, "tipo": "Seed", "enfoque": "Descripción específica del segundo video"},
      {"numero": 3, "tipo": "Authority", "enfoque": "Descripción específica del tercer video"},
      {"numero": 4, "tipo": "Seed", "enfoque": "Descripción específica del cuarto video"},
      {"numero": 5, "tipo": "Viral", "enfoque": "Descripción específica del quinto video"}
    ],
    "frecuencia_recomendada": "Frecuencia con justificación basada en el nicho",
    "formato_ganadord": "El formato de video más recomendado para este nicho y por qué"
  },
  "palabras_clave_oportunidad": [
    {
      "keyword": "keyword específico en español",
      "competencia_estimada": "Baja | Media | Alta",
      "tipo_video": "Seed | Authority | Viral",
      "razon": "Por qué esta keyword es una oportunidad"
    }
  ]
}`
    }]
  });

  const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";

  try {
    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleanText);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Error procesando respuesta" }, { status: 500 });
  }
}
