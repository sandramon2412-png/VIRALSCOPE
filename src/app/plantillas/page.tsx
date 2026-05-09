"use client";

import React, { useState } from "react";
import Link from "next/link";
import GlobalNav from "@/components/GlobalNav";
import { X, Copy, Check, Hash, BookOpen, FileText, Film, Zap, Swords, Eye, Search, Sun, MessageCircle, Trophy, Newspaper, Clock, Flame, Layout, Ruler, Mic, Lightbulb, Target } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EstructuraItem {
  tiempo: string;
  seccion: string;
  descripcion: string;
  ejemplo: string;
}

interface Plantilla {
  id: string;
  nombre: string;
  categoria: string;
  icon: React.ElementType;
  duracion: string;
  dificultad: "Principiante" | "Intermedio" | "Avanzado";
  viralPot: "Muy Alto" | "Alto" | "Medio";
  descripcion: string;
  estructura: EstructuraItem[];
  hooks: string[];
  consejos: string[];
  nichoIdeal: string[];
}

// ─── Templates Data ───────────────────────────────────────────────────────────

const PLANTILLAS: Plantilla[] = [
  {
    id: "listicle-top10",
    nombre: "Top 10 — El clásico viral",
    categoria: "Listicle",
    icon: Hash,
    duracion: "8-12 min",
    dificultad: "Principiante",
    viralPot: "Muy Alto",
    descripcion: "El formato más reproducido de YouTube. Funciona en cualquier nicho.",
    estructura: [
      { tiempo: "0:00-0:30", seccion: "HOOK", descripcion: "Revela el #1 o el más sorprendente al inicio para crear curiosidad", ejemplo: "'El número 1 de esta lista va a cambiar cómo piensas sobre el dinero para siempre...'" },
      { tiempo: "0:30-1:00", seccion: "INTRO", descripcion: "Presenta el tema y crea expectativa con el Open Loop", ejemplo: "'En este video vas a descubrir los 10 errores que están destruyendo tus finanzas, y el último es el que NADIE te dice...'" },
      { tiempo: "1:00-7:00", seccion: "LISTA", descripcion: "Del #10 al #2, guardando el mejor para el final. Cada item: problema → solución → ejemplo real", ejemplo: "'#10: [item]. La mayoría de personas cree que... pero la realidad es que... Por ejemplo...'" },
      { tiempo: "7:00-8:30", seccion: "EL MEJOR (#1)", descripcion: "El más sorprendente o controversial. Dale más tiempo que los otros", ejemplo: "'Y el #1, el que más me pidieron que incluyera...'" },
      { tiempo: "8:30-9:00", seccion: "CTA + CIERRE", descripcion: "Cierra el Open Loop inicial, like + suscripción + siguiente video", ejemplo: "'¿Recuerdas que al inicio te dije que el #1 cambiaría todo? Pues...'" },
    ],
    hooks: ["'Los X [tema] que DESTRUYEN tu [objetivo] (y cómo evitarlos)'", "'X cosas sobre [tema] que el 99% no sabe'", "'Rank de los mejores/peores X de [año]'"],
    consejos: ["Pon el número en el thumbnail", "El #1 siempre en el título", "Haz la lista de forma descendente o aleatoria para mantener la tensión"],
    nichoIdeal: ["Finanzas", "Salud", "Productividad", "Tecnología"],
  },
  {
    id: "tutorial-paso-a-paso",
    nombre: "Tutorial Paso a Paso",
    categoria: "Tutorial",
    icon: BookOpen,
    duracion: "10-20 min",
    dificultad: "Principiante",
    viralPot: "Alto",
    descripcion: "El formato con mayor retención. La gente lo guarda y lo vuelve a ver.",
    estructura: [
      { tiempo: "0:00-0:45", seccion: "HOOK + PROMESA", descripcion: "Muestra el resultado final PRIMERO. Luego explica que vas a enseñar cómo llegar ahí", ejemplo: "'Mira esto: [resultado]. En los próximos 15 minutos voy a mostrarte exactamente cómo hacerlo desde cero, paso a paso.'" },
      { tiempo: "0:45-1:30", seccion: "INTRO", descripcion: "Quién eres, por qué eres creíble para enseñar esto, qué van a lograr", ejemplo: "Presenta tu experiencia o resultado personal relacionado con el tema" },
      { tiempo: "1:30-14:00", seccion: "LOS PASOS", descripcion: "Cada paso con: título claro + explicación + demostración visual + error común a evitar", ejemplo: "'Paso 1: [nombre]. Esto es lo que la mayoría hace mal...'" },
      { tiempo: "14:00-15:00", seccion: "RESUMEN + CTA", descripcion: "Recap rápido de los pasos, próximo video relacionado, like si funcionó", ejemplo: "'Ya tienes todo lo que necesitas para [resultado]. Si te funcionó, deja un like...'" },
    ],
    hooks: ["'Cómo [logro] en [tiempo] (sin [obstáculo común])'", "'El método exacto que usé para [resultado]'", "'Tutorial completo de [tema] para principiantes'"],
    consejos: ["Muestra el resultado final en el thumbnail", "Añade timestamps/capítulos", "Crea una versión corta (Short) con el paso más sorprendente"],
    nichoIdeal: ["Tech", "Cocina", "Fitness", "Finanzas", "Arte"],
  },
  {
    id: "historia-personal",
    nombre: "Historia Personal / Storytime",
    categoria: "Historia",
    icon: FileText,
    duracion: "12-25 min",
    dificultad: "Intermedio",
    viralPot: "Muy Alto",
    descripcion: "El formato con mayor engagement y comentarios. Las historias conectan emocionalmente.",
    estructura: [
      { tiempo: "0:00-0:45", seccion: "HOOK EMOCIONAL", descripcion: "Empieza en el momento de mayor tensión de la historia, luego retrocede", ejemplo: "'Estaba a punto de perder todo lo que había construido en 3 años...'" },
      { tiempo: "0:45-2:00", seccion: "CONTEXTO", descripcion: "¿Quién eras antes? ¿Cuál era tu situación? Genera empatía", ejemplo: "Describe tu situación inicial: dónde vivías, qué hacías, tu estado emocional" },
      { tiempo: "2:00-15:00", seccion: "LA HISTORIA", descripcion: "El viaje: obstáculos, fracasos, momentos de duda, el punto de quiebre, la solución", ejemplo: "Narra cronológicamente con detalles sensoriales y emociones reales" },
      { tiempo: "15:00-18:00", seccion: "EL APRENDIZAJE", descripcion: "¿Qué aprendiste? ¿Qué harías diferente? La lección aplicable para el espectador", ejemplo: "'Lo que aprendí de todo esto es que [lección universal]...'" },
      { tiempo: "18:00-19:00", seccion: "CTA", descripcion: "Conecta la historia con el siguiente video, pide que compartan si les ayudó", ejemplo: "'Si tu historia se parece a la mía, comparte este video con alguien que lo necesite...'" },
    ],
    hooks: ["'Cómo [evento dramático] cambió mi vida para siempre'", "'La verdad sobre mi [fracaso/éxito] que nunca conté'", "'De [situación negativa] a [situación positiva] en [tiempo]'"],
    consejos: ["Tu cara en el thumbnail con emoción intensa", "El momento más dramático en el título", "Comenta algo vulnerable — genera más engagement"],
    nichoIdeal: ["Motivacional", "Finanzas personales", "Salud", "Emprendimiento"],
  },
  {
    id: "documental-mini",
    nombre: "Mini Documental",
    categoria: "Documental",
    icon: Film,
    duracion: "15-30 min",
    dificultad: "Avanzado",
    viralPot: "Muy Alto",
    descripcion: "El formato que construye autoridad y genera suscriptores más leales.",
    estructura: [
      { tiempo: "0:00-1:00", seccion: "APERTURA CINEMATOGRÁFICA", descripcion: "Plano impactante + narración en voz en off que plantea la gran pregunta del documental", ejemplo: "'¿Qué pasaría si todo lo que te enseñaron sobre [tema] fuera una mentira?'" },
      { tiempo: "1:00-3:00", seccion: "PRESENTACIÓN DEL TEMA", descripcion: "Datos sorprendentes que establecen por qué esto importa ahora mismo", ejemplo: "Estadísticas, noticias recientes, contexto histórico brevemente narrado" },
      { tiempo: "3:00-20:00", seccion: "DESARROLLO", descripcion: "3-5 'capítulos' con transiciones claras. Mezcla entrevistas, datos, animaciones y tu perspectiva", ejemplo: "Capítulo 1: [subtema] — Capítulo 2: [subtema] — etc." },
      { tiempo: "20:00-25:00", seccion: "CONCLUSIÓN + TU OPINIÓN", descripcion: "Cierra la pregunta inicial, da tu perspectiva personal, call to debate en comentarios", ejemplo: "'Después de investigar todo esto, mi conclusión es que...'" },
      { tiempo: "25:00-26:00", seccion: "CTA", descripcion: "Invita a suscribirse para la parte 2 o el próximo documental", ejemplo: "'Si quieres ver la segunda parte, suscríbete para que te llegue cuando salga...'" },
    ],
    hooks: ["'La verdad que nadie investiga sobre [tema]'", "'¿Por qué [fenómeno] está destruyendo [sector]?'", "'Investigué [tema] por [tiempo] y lo que encontré me sorprendió'"],
    consejos: ["Música de fondo cinematográfica marcará la diferencia", "Usa b-roll (imágenes de apoyo) para evitar hablar a cámara todo el tiempo", "Los comentarios con opinión fuertes generan debate viral"],
    nichoIdeal: ["Noticias", "Historia", "Economía", "Ciencia", "Sociedad"],
  },
  {
    id: "motivacional",
    nombre: "Video Motivacional",
    categoria: "Motivacional",
    icon: Zap,
    duracion: "5-15 min",
    dificultad: "Principiante",
    viralPot: "Muy Alto",
    descripcion: "Se comparte masivamente. El formato favorito para crecer rápido en YouTube.",
    estructura: [
      { tiempo: "0:00-0:30", seccion: "GANCHO EMOCIONAL", descripcion: "Una afirmación polémica o una verdad incómoda que genere impacto inmediato", ejemplo: "'La mayoría de personas trabaja toda su vida para hacerse pobre lentamente...'" },
      { tiempo: "0:30-1:30", seccion: "EL PROBLEMA", descripcion: "Describe el dolor o la frustración que siente tu audiencia. Hazlos sentir que los entiendes", ejemplo: "'Sé lo que es levantarte cada día sintiéndote atrapado en una vida que no elegiste...'" },
      { tiempo: "1:30-8:00", seccion: "LA SOLUCIÓN / LOS PRINCIPIOS", descripcion: "3-5 principios o cambios de mentalidad. Cada uno con historia + lección + acción concreta", ejemplo: "Principio 1: [título]. Historia breve → lección → lo que debes hacer hoy." },
      { tiempo: "8:00-9:30", seccion: "EL RETO", descripcion: "Un desafío concreto para los próximos 7-30 días. Acción simple pero poderosa", ejemplo: "'Tu reto de esta semana es [acción específica]. ¿Quién se compromete? Dilo en los comentarios.'" },
      { tiempo: "9:30-10:00", seccion: "CIERRE PODEROSO", descripcion: "Una frase memorable que resuma toda la enseñanza del video", ejemplo: "'No importa dónde estás hoy. Lo único que importa es la dirección en la que te mueves.'" },
    ],
    hooks: ["'Deja de [hábito autodestructivo] si quieres cambiar tu vida'", "'La única razón por la que no has logrado [meta] todavía'", "'Lo que los exitosos hacen diferente (y nadie te enseña)'"],
    consejos: ["Música épica de fondo aumenta un 40% el watch time", "Las frases cortas y poderosas son las que se citan en comentarios", "Pide a la audiencia que escriban su compromiso en comentarios — dispara el engagement"],
    nichoIdeal: ["Desarrollo personal", "Emprendimiento", "Finanzas", "Fitness mental"],
  },
  {
    id: "comparacion-ab",
    nombre: "Comparación A vs B",
    categoria: "Comparación",
    icon: Swords,
    duracion: "8-15 min",
    dificultad: "Principiante",
    viralPot: "Alto",
    descripcion: "Genera debate y comentarios naturalmente. Los espectadores se 'ubican' en un bando.",
    estructura: [
      { tiempo: "0:00-0:45", seccion: "HOOK + PREMISA", descripcion: "Plantea el debate de forma que todos tengan opinión formada. Anuncia que vas a dar el veredicto definitivo", ejemplo: "'Todo el mundo tiene una opinión sobre esto. Hoy voy a darte los datos reales para que decidas tú mismo.'" },
      { tiempo: "0:45-1:30", seccion: "CRITERIOS DE COMPARACIÓN", descripcion: "Explica con qué criterios vas a comparar (costo, resultados, tiempo, etc.)", ejemplo: "'Voy a comparar ambas opciones en 4 categorías: precio, efectividad, facilidad y resultados a largo plazo.'" },
      { tiempo: "1:30-6:00", seccion: "OPCIÓN A", descripcion: "Todo sobre la primera opción: pros, contras, para quién es ideal, datos reales", ejemplo: "Presenta A con sus ventajas y limitaciones de forma honesta y sin sesgo" },
      { tiempo: "6:00-10:00", seccion: "OPCIÓN B", descripcion: "Todo sobre la segunda opción con la misma profundidad", ejemplo: "Presenta B con sus ventajas y limitaciones de forma honesta y sin sesgo" },
      { tiempo: "10:00-12:00", seccion: "VEREDICTO + TU RECOMENDACIÓN", descripcion: "Da tu conclusión pero no de forma absoluta — crea matices según el perfil del espectador", ejemplo: "'Si eres [perfil A], elige esto. Si eres [perfil B], elige esto otro. Y si...'" },
      { tiempo: "12:00-12:30", seccion: "CTA AL DEBATE", descripcion: "Pregunta directa a los comentarios para generar debate", ejemplo: "'¿Con cuál te quedas tú? Dime en los comentarios y por qué.'" },
    ],
    hooks: ["'[A] vs [B]: ¿Cuál es MEJOR en [año]? (La respuesta te va a sorprender)'", "'La verdad que nadie te dice sobre [A] vs [B]'", "'Probé [A] y [B] durante [tiempo]: esto es lo que pasó'"],
    consejos: ["Thumbnail dividido en dos con los logos/imágenes de cada opción", "No declares un ganador absoluto — la ambigüedad genera más comentarios", "Responde los primeros 20 comentarios para avivar el debate"],
    nichoIdeal: ["Tech", "Finanzas", "Fitness", "Videojuegos", "Cocina"],
  },
  {
    id: "reaccion-analisis",
    nombre: "Reacción / Análisis",
    categoria: "Reacción",
    icon: Eye,
    duracion: "10-20 min",
    dificultad: "Principiante",
    viralPot: "Alto",
    descripcion: "Aprovecha el contenido viral existente para crear tu perspectiva de valor.",
    estructura: [
      { tiempo: "0:00-0:30", seccion: "HOOK", descripcion: "Por qué reaccionas a ESTO específicamente. Qué tiene de especial o polémico", ejemplo: "'Esto se hizo viral con 50 millones de vistas y hay algo muy importante que nadie notó...'" },
      { tiempo: "0:30-1:30", seccion: "CONTEXTO", descripcion: "Quién es el creador/empresa, qué está pasando, por qué es relevante para tu audiencia", ejemplo: "Proporciona el contexto que tu audiencia necesita para entender la reacción" },
      { tiempo: "1:30-12:00", seccion: "REACCIÓN + ANÁLISIS", descripcion: "Pausa frecuente para añadir tu perspectiva experta. No solo reacciones: ANALIZA y ENSEÑA", ejemplo: "'Aquí [pausa]. Lo que acaban de hacer es [análisis experto]. La razón es que...'" },
      { tiempo: "12:00-14:00", seccion: "MI VEREDICTO", descripcion: "Tu postura final: ¿estás de acuerdo? ¿Qué harías diferente? ¿Qué aprendes tú de esto?", ejemplo: "'Mi conclusión es que [veredicto]. Y lo que todos deberían aprender de esto es...'" },
      { tiempo: "14:00-15:00", seccion: "CTA", descripcion: "Pide opinión a la audiencia, siguiente video similar, suscripción", ejemplo: "'¿Estás de acuerdo con mi análisis? Dime tu opinión en comentarios.'" },
    ],
    hooks: ["'Reacciono al video más viral sobre [tema] (hay algo que nadie vio)'", "'Analizando la estrategia de [persona/empresa] que nadie explica'", "'Por qué [video/contenido viral] es [adjetivo fuerte] — análisis completo'"],
    consejos: ["Añade tu perspectiva experta cada 60-90 segundos mínimo", "El valor está en tu análisis, no en la reacción en sí", "Elige contenido que ya sea tendencia para el SEO gratuito"],
    nichoIdeal: ["Finanzas", "Emprendimiento", "Tech", "Entretenimiento", "Deportes"],
  },
  {
    id: "investigacion-expose",
    nombre: "Investigación / Exposé",
    categoria: "Investigación",
    icon: Search,
    duracion: "15-35 min",
    dificultad: "Avanzado",
    viralPot: "Muy Alto",
    descripcion: "El formato que más se comparte en redes. Genera autoridad máxima si tienes datos sólidos.",
    estructura: [
      { tiempo: "0:00-1:00", seccion: "DECLARACIÓN FUERTE", descripcion: "Empieza con la conclusión más impactante de tu investigación. Luego promete mostrar las pruebas", ejemplo: "'Lo que estoy a punto de mostrarte es información que [empresa/persona] no quiere que sepas.'" },
      { tiempo: "1:00-3:00", seccion: "¿POR QUÉ INVESTIGÉ ESTO?", descripcion: "Tu motivación personal y cómo encontraste esta información. Humaniza la investigación", ejemplo: "'Todo empezó cuando noté algo extraño en [lugar/situación]...'" },
      { tiempo: "3:00-25:00", seccion: "LA EVIDENCIA", descripcion: "Presentación ordenada de cada hallazgo con fuentes visibles. De menor a mayor impacto", ejemplo: "Hallazgo 1 → Evidencia → Implicaciones. Hallazgo 2... etc." },
      { tiempo: "25:00-28:00", seccion: "LA IMAGEN COMPLETA", descripcion: "Conecta todos los hallazgos en una narrativa coherente. El patrón que emerge", ejemplo: "'Cuando unes todos estos puntos, el patrón que aparece es claro: [conclusión]'" },
      { tiempo: "28:00-30:00", seccion: "QUÉ HACER CON ESTO", descripcion: "Acción concreta que puede tomar el espectador. No dejes la investigación en el aire", ejemplo: "'Ahora que sabes esto, lo que te recomiendo hacer es [acción específica]...'" },
    ],
    hooks: ["'Investigué [tema] y lo que encontré es preocupante'", "'La verdad detrás de [empresa/persona/industria] que nadie investiga'", "'[X] años investigando [tema]: esto es lo que descubrí'"],
    consejos: ["Muestra capturas de pantalla y fuentes en tiempo real para credibilidad", "El tono debe ser informativo, no sensacionalista", "Cita tus fuentes en la descripción — esto diferencia el periodismo del clickbait"],
    nichoIdeal: ["Economía", "Política", "Tech", "Salud", "Medio ambiente"],
  },
  {
    id: "dia-en-mi-vida",
    nombre: "Día en Mi Vida",
    categoria: "Historia",
    icon: Sun,
    duracion: "10-20 min",
    dificultad: "Principiante",
    viralPot: "Medio",
    descripcion: "El formato más fácil de grabar. Funciona especialmente bien en canales personales.",
    estructura: [
      { tiempo: "0:00-0:30", seccion: "HOOK DE CONTEXTO", descripcion: "¿Qué tiene de especial este día? No todos los días son iguales — ¿por qué ver este?", ejemplo: "'Hoy es el día más importante de los últimos 6 meses de mi vida...'" },
      { tiempo: "0:30-1:00", seccion: "SETUP", descripcion: "La promesa del día: qué van a ver, qué van a aprender, qué hace único a este día", ejemplo: "'Acompáñame en este día en que voy a [actividad especial] por primera vez...'" },
      { tiempo: "1:00-15:00", seccion: "EL DÍA", descripcion: "Secuencia cronológica con transiciones dinámicas. Incluye momentos espontáneos y reflexiones", ejemplo: "Mañana → Actividad principal → Momento imprevisto → Reflexión del día" },
      { tiempo: "15:00-17:00", seccion: "REFLEXIÓN FINAL", descripcion: "¿Qué aprendiste hoy? ¿Qué haría diferente? La lección del día que el espectador puede aplicar", ejemplo: "'Lo que hoy me enseñó es que [lección]. Y si pudieras hacer algo mañana...'" },
      { tiempo: "17:00-18:00", seccion: "CTA", descripcion: "Próximo video, suscripción, pregunta del día en comentarios", ejemplo: "'¿Cómo fue TU día de hoy? Cuéntame en los comentarios.'" },
    ],
    hooks: ["'Un día en mi vida como [descripción de vida aspiracional]'", "'24 horas siendo [persona/profesión/estilo de vida]'", "'Lo que nadie te muestra del día a día de [situación]'"],
    consejos: ["La autenticidad gana sobre la producción perfecta", "Incluye un momento de error o fracaso — hace el contenido más humano", "Usa timelapse para las partes aburridas"],
    nichoIdeal: ["Lifestyle", "Emprendimiento", "Fitness", "Viajes", "Estudio"],
  },
  {
    id: "qa-preguntas",
    nombre: "Q&A — Preguntas y Respuestas",
    categoria: "Historia",
    icon: MessageCircle,
    duracion: "8-20 min",
    dificultad: "Principiante",
    viralPot: "Medio",
    descripcion: "Construye comunidad y fideliza a tu audiencia. Ideal para canales con seguidores activos.",
    estructura: [
      { tiempo: "0:00-0:30", seccion: "INTRO", descripcion: "Agradece las preguntas, menciona cuántas llegaron, selecciona las más interesantes o polémicas", ejemplo: "'Recibí más de 500 preguntas y seleccioné las 15 más votadas y las más polémicas...'" },
      { tiempo: "0:30-14:00", seccion: "LAS PREGUNTAS", descripcion: "Responde de forma honesta y directa. Agrupa por tema si hay muchas similares", ejemplo: "Pregunta en pantalla → Respuesta concisa → Opinión personal si aplica" },
      { tiempo: "14:00-15:00", seccion: "PREGUNTA BOMBA", descripcion: "Termina con la pregunta más personal o polémica — genera debate máximo", ejemplo: "'Y la pregunta que más me incomodó fue esta...'" },
      { tiempo: "15:00-16:00", seccion: "CTA + PRÓXIMA RONDA", descripcion: "Invita a la próxima ronda de preguntas, like, suscripción", ejemplo: "'Si quieres participar en el próximo Q&A, deja tu pregunta en los comentarios con #Q&A'" },
    ],
    hooks: ["'Respondiendo las preguntas que nadie se atreve a hacer'", "'Q&A: respondo TODO (incluyendo las preguntas incómodas)'", "'Me preguntaron [pregunta polémica] y esto es lo que pienso'"],
    consejos: ["Pon las preguntas en pantalla con texto para mejorar retención", "Responde primero las preguntas más generales, termina con las más personales", "Guarda las mejores preguntas para hacer un video completo sobre ese tema"],
    nichoIdeal: ["Lifestyle", "Emprendimiento", "Fitness", "Entretenimiento"],
  },
  {
    id: "reto-challenge",
    nombre: "Reto / Challenge",
    categoria: "Historia",
    icon: Trophy,
    duracion: "8-15 min",
    dificultad: "Intermedio",
    viralPot: "Muy Alto",
    descripcion: "El formato más repetible. Cada reto es un video. Los desafíos extremos se viralizan solos.",
    estructura: [
      { tiempo: "0:00-0:45", seccion: "EL RETO", descripcion: "Explica el reto con claridad. ¿Cuáles son las reglas? ¿Qué pasa si fallas?", ejemplo: "'Las reglas son simples: [regla 1], [regla 2]. Si fallo, [consecuencia dramática].'" },
      { tiempo: "0:45-1:30", seccion: "POR QUÉ HAGO ESTO", descripcion: "Tu motivación. ¿Qué quieres probar? ¿Qué apostaste? La narrativa que hace al espectador querer verte ganar", ejemplo: "'Lo hago porque quiero demostrar que [creencia]. Muchos dicen que es imposible...'" },
      { tiempo: "1:30-11:00", seccion: "EL DESARROLLO", descripcion: "Muestra los momentos más difíciles, los puntos de quiebre, las tentaciones de rendirse", ejemplo: "Día 1 → El primer obstáculo → El punto más difícil → La superación" },
      { tiempo: "11:00-12:30", seccion: "EL RESULTADO", descripcion: "¿Lo lograste? Muestra el resultado de forma dramática. El suspense hasta el último momento", ejemplo: "Construye suspense antes de revelar si lo lograste o no" },
      { tiempo: "12:30-13:30", seccion: "LO QUE APRENDÍ", descripcion: "La lección que el espectador puede aplicar sin hacer el reto. El valor educativo", ejemplo: "'Hacer este reto me enseñó que [lección que todos pueden aplicar]...'" },
    ],
    hooks: ["'[X] días comiendo/haciendo/viviendo [desafío extremo]'", "'Intenté [reto imposible] y esto pasó'", "'El reto más difícil de mi vida: [descripción]'"],
    consejos: ["El thumbnail debe mostrar el momento de mayor tensión o el resultado", "Los retos de [X] días tienen estructura natural — fácil de grabar", "Cuando falles, muéstralo — la autenticidad del fracaso también viraliza"],
    nichoIdeal: ["Fitness", "Finanzas", "Productividad", "Lifestyle", "Entretenimiento"],
  },
  {
    id: "noticias-actualidad",
    nombre: "Noticias / Actualidad",
    categoria: "Investigación",
    icon: Newspaper,
    duracion: "5-15 min",
    dificultad: "Intermedio",
    viralPot: "Alto",
    descripcion: "El formato con más tráfico de búsqueda. Si llegas primero, llevas todo el volumen.",
    estructura: [
      { tiempo: "0:00-0:30", seccion: "LA NOTICIA", descripcion: "Presenta el hecho con los datos más impactantes. Sin rodeos.", ejemplo: "'Acaba de pasar algo que va a afectar a [X millones] de personas: [dato concreto].'" },
      { tiempo: "0:30-1:00", seccion: "POR QUÉ IMPORTA", descripcion: "Conecta la noticia directamente con la vida de tu audiencia. ¿Cómo les afecta esto HOY?", ejemplo: "'Esto te afecta directamente porque [razón concreta y personal].'" },
      { tiempo: "1:00-8:00", seccion: "CONTEXTO + ANÁLISIS", descripcion: "El trasfondo de la noticia. ¿Por qué pasó? ¿Quién está detrás? ¿Cuáles son las implicaciones?", ejemplo: "Explica el contexto histórico y los factores que llevaron a este momento" },
      { tiempo: "8:00-9:30", seccion: "LO QUE NADIE DICE", descripcion: "Tu perspectiva única. El ángulo que los medios masivos no cubren o minimizan", ejemplo: "'Lo que los medios no están contando es que [perspectiva alternativa con datos].'" },
      { tiempo: "9:30-10:00", seccion: "QUÉ HACER AHORA", descripcion: "Acción concreta para el espectador. Sin esto, la noticia no tiene utilidad", ejemplo: "'Basado en todo esto, lo que te recomiendo hacer es [acción específica].'" },
    ],
    hooks: ["'Lo que acaba de pasar con [tema] y nadie está explicando bien'", "'[Noticia] — esto es lo que significa para ti'", "'URGENTE: [noticia] — lo que necesitas saber'"],
    consejos: ["Publica en las primeras 2-4 horas de que salga la noticia para capturar el tráfico", "El título debe incluir el nombre exacto de lo que la gente busca", "Actualiza la descripción con links a noticias para credibilidad"],
    nichoIdeal: ["Economía", "Tecnología", "Crypto", "Política", "Salud"],
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

const CATEGORIAS = [
  "Todos",
  "Listicle",
  "Tutorial",
  "Historia",
  "Documental",
  "Motivacional",
  "Comparación",
  "Reacción",
  "Investigación",
];

const DIFICULTAD_COLOR: Record<Plantilla["dificultad"], string> = {
  Principiante: "text-green-400 bg-green-500/15 border-green-500/30",
  Intermedio: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30",
  Avanzado: "text-red-400 bg-red-500/15 border-red-500/30",
};

const VIRAL_COLOR: Record<Plantilla["viralPot"], string> = {
  "Muy Alto": "text-purple-400",
  Alto: "text-blue-400",
  Medio: "text-white/50",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlantillasPage() {
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [plantillaAbierta, setPlantillaAbierta] = useState<Plantilla | null>(null);
  const [copiedHook, setCopiedHook] = useState<number | null>(null);

  const filtradas =
    categoriaActiva === "Todos"
      ? PLANTILLAS
      : PLANTILLAS.filter((p) => p.categoria === categoriaActiva);

  function handleCopyHook(hook: string, idx: number) {
    navigator.clipboard.writeText(hook);
    setCopiedHook(idx);
    setTimeout(() => setCopiedHook(null), 2000);
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.10) 0%, transparent 50%), #0a0814",
      }}
    >
      <GlobalNav />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black mb-3 flex items-center justify-center gap-3">
            <Layout size={32} style={{ color: "#a78bfa" }} /> Plantillas de Videos
          </h1>
          <p className="text-white/55 text-base max-w-2xl mx-auto">
            Estructuras probadas para los formatos más virales de YouTube
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                categoriaActiva === cat
                  ? "text-white"
                  : "text-white/50 hover:text-white"
              }`}
              style={
                categoriaActiva === cat
                  ? {
                      background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                      boxShadow: "0 2px 12px rgba(139,92,246,0.4)",
                    }
                  : {
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtradas.map((p) => {
            const PIcon = p.icon;
            return (
            <div
              key={p.id}
              className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:scale-[1.01]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{ background: "rgba(167,139,250,0.12)" }}>
                    <PIcon size={20} style={{ color: "#a78bfa" }} />
                  </div>
                  <h3 className="font-bold text-base mt-1 leading-tight">{p.nombre}</h3>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full border font-medium"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}
                  >
                    {p.categoria}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${DIFICULTAD_COLOR[p.dificultad]}`}>
                    {p.dificultad}
                  </span>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-white/50"><Clock size={11} /> {p.duracion}</span>
                <span className={`flex items-center gap-1 font-semibold ${VIRAL_COLOR[p.viralPot]}`}>
                  <Flame size={11} /> Viral: {p.viralPot}
                </span>
              </div>

              <p className="text-white/55 text-sm leading-relaxed flex-1">{p.descripcion}</p>

              <button
                onClick={() => setPlantillaAbierta(p)}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white/90 transition-all hover:text-white"
                style={{
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.3)",
                }}
              >
                Ver plantilla completa
              </button>
            </div>
          ); })}
        </div>
      </main>

      {/* Modal */}
      {plantillaAbierta && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPlantillaAbierta(null);
          }}
        >
          <div
            className="w-full max-w-3xl rounded-2xl my-8"
            style={{
              background: "linear-gradient(135deg, rgba(25,20,40,0.99), rgba(12,10,22,0.98))",
              border: "1px solid rgba(139,92,246,0.3)",
            }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-3">
                  {(() => { const MI = plantillaAbierta.icon; return <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.12)" }}><MI size={22} style={{ color: "#a78bfa" }} /></div>; })()}
                  <div>
                    <h2 className="font-black text-xl">{plantillaAbierta.nombre}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-purple-400">
                        {plantillaAbierta.categoria}
                      </span>
                      <span className="text-white/30">·</span>
                      <span className="inline-flex items-center gap-1 text-xs text-white/50">
                        <Clock size={11} /> {plantillaAbierta.duracion}
                      </span>
                      <span className="text-white/30">·</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${VIRAL_COLOR[plantillaAbierta.viralPot]}`}>
                        <Flame size={11} /> Viral: {plantillaAbierta.viralPot}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPlantillaAbierta(null)}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Estructura */}
              <div>
                <h3 className="font-bold text-base mb-3 text-purple-300 flex items-center gap-2">
                  <Ruler size={15} style={{ color: "#a78bfa" }} /> Estructura del video
                </h3>
                <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "rgba(139,92,246,0.1)" }}>
                        <th className="text-left px-4 py-2.5 text-white/60 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Tiempo</th>
                        <th className="text-left px-4 py-2.5 text-white/60 font-semibold text-xs uppercase tracking-wider">Sección</th>
                        <th className="text-left px-4 py-2.5 text-white/60 font-semibold text-xs uppercase tracking-wider">Descripción</th>
                        <th className="text-left px-4 py-2.5 text-white/60 font-semibold text-xs uppercase tracking-wider">Ejemplo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plantillaAbierta.estructura.map((e, i) => (
                        <tr
                          key={i}
                          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                        >
                          <td className="px-4 py-3 text-purple-400 font-mono text-xs whitespace-nowrap align-top">
                            {e.tiempo}
                          </td>
                          <td className="px-4 py-3 font-bold text-xs text-white align-top whitespace-nowrap">
                            {e.seccion}
                          </td>
                          <td className="px-4 py-3 text-white/65 text-xs align-top">
                            {e.descripcion}
                          </td>
                          <td className="px-4 py-3 text-white/40 text-xs italic align-top">
                            {e.ejemplo || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hooks */}
              <div>
                <h3 className="font-bold text-base mb-3 text-purple-300 flex items-center gap-2">
                  <Mic size={15} style={{ color: "#a78bfa" }} /> Hooks de título probados
                </h3>
                <div className="space-y-2">
                  {plantillaAbierta.hooks.map((hook, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <p className="flex-1 text-sm text-white/75 italic">{hook}</p>
                      <button
                        onClick={() => handleCopyHook(hook, i)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors flex-shrink-0"
                        title="Copiar"
                      >
                        {copiedHook === i ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consejos */}
              <div>
                <h3 className="font-bold text-base mb-3 text-purple-300 flex items-center gap-2">
                  <Lightbulb size={15} style={{ color: "#a78bfa" }} /> Consejos PRO
                </h3>
                <ul className="space-y-2">
                  {plantillaAbierta.consejos.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-purple-400 mt-0.5 flex-shrink-0">✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nichos */}
              <div>
                <h3 className="font-bold text-base mb-3 text-purple-300 flex items-center gap-2">
                  <Target size={15} style={{ color: "#a78bfa" }} /> Nichos ideales
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plantillaAbierta.nichoIdeal.map((n) => (
                    <span
                      key={n}
                      className="px-3 py-1 rounded-full text-sm text-purple-300"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2">
                <Link
                  href={`/crear-contenido?nicho=${encodeURIComponent(plantillaAbierta.nichoIdeal[0] || "")}`}
                  onClick={() => setPlantillaAbierta(null)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                    boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
                  }}
                >
                  🚀 Crear video con esta plantilla
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
