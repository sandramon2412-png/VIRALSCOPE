import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRALSCOPE_AI_KEY;
  if (!apiKey) return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });

  const { tema, nicho, tipo } = await req.json();

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2500,
    messages: [{
      role: "user",
      content: `Eres el mejor estratega de títulos de YouTube del mundo hispanohablante. Has estudiado más de 10,000 videos virales y entiendes la psicología detrás del clic.

DATOS CLAVE QUE DEBES APLICAR:
- El 70%+ del tráfico de YouTube es MÓVIL — los primeros 45-47 caracteres son todo lo que el usuario ve
- La "Quality CTR" penaliza clickbait: el título DEBE reflejar honestamente el contenido
- El cerebro responde MÁS al miedo de perder que al deseo de ganar (Loss Aversion - Kahneman)
- Los números aumentan el CTR un 20-30% vs títulos sin números
- Una sola palabra en MAYÚSCULAS crea jerarquía visual sin parecer spam (técnica de Luisito Comunica)
- El "Information Gap Theory" (Loewenstein): el cerebro exige resolución cuando detecta una brecha de conocimiento
- Usa SIEMPRE el registro informal "tú" — crea cercanía y supera al formal en CTR
- JAMÁS empieces con "En este video...", "Hola a todos..." o el nombre del canal

INFORMACIÓN DEL VIDEO:
- Tema/idea: ${tema}
- Nicho: ${nicho}
- Tipo de canal: ${tipo || "faceless"}

GENERA 12 TÍTULOS usando estas fórmulas probadas (una por fórmula):

1. **SURVIVAL/EXTREMO**: "[Sobreviví/Hice] + [X tiempo/condición extrema] + [resultado inesperado]"
   → Ejemplo: "Sobreviví 30 Días con $5 al Día en Nueva York"

2. **CONOCIMIENTO OCULTO**: "Lo Que NADIE Te Dice Sobre [tema específico]"
   → Ejemplo: "Lo Que NADIE Te Dice Antes de Invertir en Criptomonedas"

3. **ERROR FATAL**: "[X] Errores Que [Están + consecuencia negativa]"
   → Ejemplo: "7 Errores de Inversión Que Están DESTRUYENDO Tu Futuro"

4. **CONTRA-NARRATIVA**: "Por Qué NO Deberías [creencia popular] (La Verdad)"
   → Ejemplo: "Por Qué NO Deberías Ahorrar Dinero en 2025 (La Verdad)"

5. **TRANSFORMACIÓN PERSONAL**: "[Hice X] Por [Y tiempo] Y ESTO Pasó"
   → Ejemplo: "No Toqué Mi Teléfono por 30 Días y Mi Vida CAMBIÓ"

6. **INSIDER/AUTORIDAD**: "[Credencial] REVELA: [afirmación específica y sorprendente]"
   → Ejemplo: "Ex-Empleado de Google REVELA Cómo Funciona el Algoritmo"

7. **URGENCIA/FOMO**: "Deja de [acción común] Antes de Que Sea Tarde (Esto Es URGENTE)"
   → Ejemplo: "Deja de Ahorrar en el Banco Antes de Que Sea Tarde"

8. **NÚMERO + PROMESA EXTREMA**: "[Gané/Perdí/Gasté] $[cantidad específica] en [contexto impactante]"
   → Ejemplo: "Gasté $10,000 en el Peor Negocio de Mi Vida (Lo Que Aprendí)"

9. **CURIOSITY GAP CON DEMOSTRATIVO**: "Esto [Cambió/Destruyó/Transformó] Mi [área de vida] Para Siempre"
   → Ejemplo: "Esto Cambió Mi Relación con el Dinero Para Siempre"

10. **COMPARATIVA DEFINITIVA**: "[A] vs [B]: La Verdad Que Nadie ADMITE"
    → Ejemplo: "Invertir en Acciones vs Bienes Raíces: La Verdad Que Nadie ADMITE"

11. **CONFESIÓN/ARREPENTIMIENTO**: "Cometí el Error de [acción] y Me Costó [consecuencia específica]"
    → Ejemplo: "Cometí el Error de Confiar en Este Broker y Perdí $5,000"

12. **LOCALIZACIÓN + SUPERLATIVO**: "[Encontré/Visité] El [MÁS + superlativo] de [lugar/categoría]"
    → Ejemplo: "Encontré el Canal de YouTube MÁS RENTABLE de América Latina"

REGLAS DE CALIDAD:
- El keyword principal debe aparecer en los primeros 3-5 palabras del título
- Longitud óptima: 47-55 caracteres (máximo 60)
- Una sola palabra en MAYÚSCULAS por título (no el título completo)
- El par emoción-promesa: miedo de perder ALGO + esperanza de ganar ALGO
- El título debe poder cumplirse honestamente dentro del video

Responde ÚNICAMENTE con este JSON exacto:
{
  "titulos": [
    {
      "titulo": "El título exacto (47-60 caracteres idealmente)",
      "formula": "Nombre de la fórmula aplicada",
      "trigger_psicologico": "El mecanismo psicológico principal (ej: 'Information Gap', 'Loss Aversion', 'Authority Transfer')",
      "gancho": "Por qué este título genera el clic en 1 oración",
      "emocion_primaria": "Curiosidad | Miedo | Esperanza | Sorpresa | Codicia | Envidia",
      "caracteres": 52,
      "puntuacion": 88
    }
  ]
}

Ordena de mayor a menor puntuación. Puntuación basada en: fuerza del trigger (40%), claridad de promesa (30%), especificidad (20%), SEO (10%).`
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
