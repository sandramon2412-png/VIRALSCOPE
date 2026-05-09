import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey) return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });

  const { nicho, tipo, cantidad } = await req.json();

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 3500,
    messages: [{
      role: "user",
      content: `Eres el experto #1 en retención de YouTube del mundo hispanohablante. Has estudiado la neurociencia detrás del engagement y sabes exactamente qué hace que alguien se quede viendo un video.

DATOS CIENTÍFICOS QUE DEBES APLICAR:
- El 33% de los espectadores abandona en los primeros 30 segundos si no hay un hook poderoso
- El 20% se va en los primeros 10 segundos con openers lentos ("hola a todos, bienvenidos...")
- Videos con 65%+ de retención en el primer minuto tienen 58% más de AVD (Average View Duration)
- Los Open Loops aumentan el watch time un 32% (Efecto Zeigarnik: el cerebro no puede ignorar lo incompleto)
- Un pattern interrupt en los primeros 5 segundos aumenta la retención un 23%
- La ventana de atención crítica: 0-5s (captura), 5-15s (promesa), 15-30s (apuestas/stakes)
- Un hook LAYERED (que combina 2+ arquetipos) logra 70-85% de retención vs 60% de un solo arquetipo

NICHO: ${nicho}
TIPO DE CONTENIDO PREFERIDO: ${tipo || "todos"}
CANTIDAD A GENERAR: ${cantidad || 20}

ARQUETIPOS DE HOOKS (usa cada uno en proporciones equitativas):

1. **BOLD CLAIM** — Afirmación que desafía la creencia popular. Activa disonancia cognitiva.
   Framework: "[Lo opuesto de lo esperado]. Te voy a demostrar por qué."
   Fórmula española: "Lo que todos creen sobre [tema] es MENTIRA. Y te lo voy a demostrar."

2. **CURIOSITY GAP** — Brecha de información que el cerebro exige cerrar (Loewenstein).
   Framework: "[Cosa específica] que [resultado inesperado] — y la mayoría no sabe que existe."
   Fórmula española: "Hay una [estrategia/método/error] en [tema] que el 99% de la gente nunca descubre."

3. **PATTERN INTERRUPT** — Rompe la expectativa en los primeros 3 segundos.
   Framework: Empieza con algo visual/auditivo inesperado + afirmación contradictoria.
   Fórmula española: "[Situación absurda o extrema relacionada con el tema]. Déjame explicarte."

4. **OPEN LOOP** — Historia o pregunta que solo se resuelve al final. Efecto Zeigarnik.
   Framework: "Antes de mostrarte [tema], necesito contarte [historia sin resolver]. Lo entenderás al final."
   Fórmula española: "Al final de este video te voy a mostrar [algo específico intrigante]. Pero primero..."

5. **DIRECT PROMISE** — Valor concreto y específico desde el primer segundo.
   Framework: "En [tiempo], sabrás exactamente cómo [resultado específico]. Sin [obstáculo común]."
   Fórmula española: "En los próximos [X] minutos vas a aprender [resultado específico] — sin [excusa típica]."

6. **SHOCKING STATISTIC** — Dato que reenmarca una situación familiar de forma impactante.
   Framework: "[% o número impactante]. Aquí está lo que eso significa para ti."
   Fórmula española: "El [X]% de las personas que [acción del nicho] comete este error. Y probablemente tú también."

7. **IN MEDIA RES** — Empieza en el momento de máxima tensión de la historia, sin contexto.
   Framework: [Describe la crisis en presente, máxima tensión] → luego explica cómo llegaste ahí.
   Fórmula española: "Tenía [situación desesperada]. [Fecha/contexto]. Lo que hice después cambió todo."

8. **MISTAKE REVEAL** — Identifica un error que el espectador probablemente ya está cometiendo.
   Framework: "La razón por la que [resultado negativo] no es [causa que creen]. Es [causa real]."
   Fórmula española: "Si llevas tiempo intentando [acción del nicho] y no funciona, es por esta razón."

9. **CONTRARIAN** — Desafía directamente el consenso establecido.
   Framework: "Todos te dicen que [consejo popular]. Están equivocados. Aquí está lo que realmente funciona."
   Fórmula española: "Lo que todos los [expertos/gurús] te enseñan sobre [tema] te está haciendo daño."

10. **SOCIAL PROOF + AUTHORITY** — Credibilidad a través de resultados o experiencia específica.
    Framework: "He [logro específico con números]. El error más común que veo es [acción concreta]."
    Fórmula española: "Después de [X años/logro numérico específico] en [nicho], descubrí que..."

HOOKS LAYERED (combina 2 arquetipos para máxima retención):
Incluye al menos 4 hooks que combinen 2 arquetipos. Ejemplos:
- Bold Claim + Open Loop: Afirmación polémica → "y al final te voy a demostrar exactamente por qué"
- Pattern Interrupt + Direct Promise: Situación inesperada → valor concreto inmediato
- Shocking Stat + Mistake Reveal: Dato impactante → "y si estás haciendo [X], ese dato te afecta directamente"

ERRORES FATALES A EVITAR (NUNCA generes estos):
❌ "Hola a todos, bienvenidos a mi canal..."
❌ "En el video de hoy vamos a hablar de..."
❌ "Antes de empezar no olvides suscribirte..."
❌ Contexto o historia de fondo ANTES de establecer las apuestas
❌ Promesas vagas: "te enseñaré algo importante" (en cambio: "te enseñaré el método exacto que...")

REGLA DE ORO: El hook DEBE hacer una promesa específica que el video pueda cumplir honestamente. Un CTR alto con retención baja destruye el canal en el algoritmo.

Responde ÚNICAMENTE con este JSON exacto (sin markdown):
{
  "hooks": [
    {
      "hook": "El texto exacto del hook (1-4 oraciones, listo para decirse en voz alta)",
      "arquetipo": "BOLD CLAIM | CURIOSITY GAP | PATTERN INTERRUPT | OPEN LOOP | DIRECT PROMISE | SHOCKING STATISTIC | IN MEDIA RES | MISTAKE REVEAL | CONTRARIAN | SOCIAL PROOF | LAYERED (A+B)",
      "mecanismo_psicologico": "El principio científico/psicológico que lo hace funcionar",
      "por_que_retiene": "Por qué este hook mantiene al espectador en los primeros 30s",
      "duracion_segundos": 15,
      "nivel_impacto": 90,
      "tipo_emocion": "Curiosidad | Miedo | Urgencia | Identificación | Asombro | Deseo",
      "apertura_loop": true
    }
  ]
}

Ordena por nivel_impacto de mayor a menor. Que los hooks sean ESPECÍFICOS para el nicho de ${nicho}.
Los hooks en español deben sonar naturales al hablarlos, no como texto escrito.`
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
