"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Wand2,
  Search,
  Video,
  Zap,
  Film,
  Clapperboard,
  Mic,
  Type,
  Layers,
  Paintbrush,
  Lightbulb,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────── */

interface Prompt {
  title: string;
  tool: string;
  category: string;
  prompt: string;
  tip: string;
}

/* ── Data ──────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  { id: "all", label: "Todos", icon: <Layers size={14} /> },
  { id: "intro", label: "Intros & Outros", icon: <Clapperboard size={14} /> },
  { id: "transitions", label: "Transiciones", icon: <Zap size={14} /> },
  { id: "broll", label: "B-Roll con IA", icon: <Film size={14} /> },
  { id: "text", label: "Texto & Motion", icon: <Type size={14} /> },
  { id: "color", label: "Color & Estilo", icon: <Paintbrush size={14} /> },
  { id: "audio", label: "Audio & Voz", icon: <Mic size={14} /> },
  { id: "shorts", label: "Shorts & Reels", icon: <Video size={14} /> },
];

const PROMPTS: Prompt[] = [
  // Intros & Outros
  {
    title: "Intro Cinematic con Logo",
    tool: "Runway ML / Pika",
    category: "intro",
    prompt: `Genera un video de 5 segundos: fondo oscuro con partículas doradas flotando suavemente. Un logo minimalista blanco aparece desde el centro con un efecto de escala suave (0.8 a 1.0). Subtle lens flare cuando el logo alcanza tamaño completo. Ambient light cálida. Estilo: premium, luxury branding. Resolución 1920x1080, 30fps.`,
    tip: "Reemplaza 'logo minimalista blanco' con la descripción de tu logo real.",
  },
  {
    title: "Intro Energética para Gaming",
    tool: "Runway ML",
    category: "intro",
    prompt: `Video de 4 segundos: explosión de colores neón (morado, cyan, rosa) desde el centro de una pantalla negra. Glitch effects rápidos. Partículas de energía digital volando. El texto del canal aparece con efecto typewriter glitch. Estilo: cyberpunk gaming, high energy. Motion blur en las partículas. 1920x1080, 60fps.`,
    tip: "Usa esta intro para canales de gaming, tech o cualquier contenido de alta energía.",
  },
  {
    title: "Outro con Call to Action",
    tool: "CapCut / Editor manual",
    category: "intro",
    prompt: `Instrucciones para editor: Crear pantalla final de 15 segundos. Fondo: gradiente oscuro (slate-900 a slate-950). Lado izquierdo: espacio para end screen de YouTube (video sugerido). Lado derecho: texto "SUSCRÍBETE" con animación pulse, icono de campana animada, botón rojo de suscripción con hover effect. Abajo: redes sociales con iconos. Música: fade out del video principal.`,
    tip: "Deja espacio para los elementos de pantalla final de YouTube Studio.",
  },

  // Transiciones
  {
    title: "Transición Whip Pan",
    tool: "CapCut / Premiere",
    category: "transitions",
    prompt: `Instrucciones para editor: Entre cada escena, aplicar transición whip pan horizontal de 0.3 segundos. Motion blur al 80%. El clip saliente se mueve rápidamente hacia la derecha, el entrante viene desde la izquierda. Agregar sonido swoosh sutil. Timing: usar en cambios de tema o ubicación, NO entre cada corte.`,
    tip: "No abuses de las transiciones — úsalas solo en cambios de sección.",
  },
  {
    title: "Zoom Punch Transition",
    tool: "CapCut / Premiere / DaVinci",
    category: "transitions",
    prompt: `Instrucciones para editor: Transición de zoom punch para enfatizar datos importantes. Frame final del clip A: zoom in rápido (1.0 a 1.5x en 3 frames). Frame inicial del clip B: zoom out rápido (1.5x a 1.0 en 3 frames). Total: 6 frames (~0.2 segundos). Agregar sonido de impacto sutil. Usar para: revelar datos, estadísticas, momentos wow.`,
    tip: "Perfecto para videos de finanzas, datos curiosos o reacciones.",
  },
  {
    title: "Transición Morph / Match Cut",
    tool: "Runway ML / Pika",
    category: "transitions",
    prompt: `Genera una transición de 2 segundos donde un objeto (ej: taza de café) se transforma suavemente en otro objeto similar (ej: moneda). Movimiento fluido, sin cortes bruscos. Estilo fotorealista. La cámara se mantiene fija, solo el objeto cambia. Iluminación consistente durante toda la transición. Fondo desenfocado.`,
    tip: "Los match cuts funcionan mejor con objetos de forma similar.",
  },

  // B-Roll con IA
  {
    title: "B-Roll Ciudad Nocturna",
    tool: "Runway ML / Pika / Sora",
    category: "broll",
    prompt: `Genera un clip de 4 segundos: vista aérea de una ciudad moderna de noche. Luces de edificios brillando, tráfico en movimiento con light trails. Movimiento de cámara: drone shot descendiendo lentamente con ligero pan a la derecha. Estilo: cinematic, color grading teal & orange. Aspecto ratio 16:9. Calidad cinematográfica 4K.`,
    tip: "Ideal como B-Roll para videos de finanzas, negocios o motivación.",
  },
  {
    title: "B-Roll Naturaleza Calm",
    tool: "Runway ML / Pika",
    category: "broll",
    prompt: `Genera un clip de 5 segundos: close-up de hojas verdes con gotas de rocío, luz dorada del amanecer filtrándose entre las hojas. Movimiento suave de las hojas con brisa ligera. Profundidad de campo corta (bokeh en el fondo). Color grading: tonos cálidos, saturación natural. Movimiento de cámara: dolly in sutil. Estilo: documental naturaleza.`,
    tip: "Perfecto para videos de salud, bienestar, meditación o lifestyle.",
  },
  {
    title: "B-Roll Tecnología",
    tool: "Runway ML",
    category: "broll",
    prompt: `Genera un clip de 4 segundos: manos escribiendo en un teclado iluminado con RGB. Pantalla de código/datos fuera de foco en el fondo con reflejo en lentes. Ambiente oscuro, luz azul/morada dominante. Close-up con rack focus del teclado a la pantalla. Estilo: tech corporate, moderno. Grain cinematográfico sutil.`,
    tip: "B-Roll universal para cualquier video de tecnología o programación.",
  },
  {
    title: "B-Roll Dinero / Finanzas",
    tool: "Runway ML / Pika",
    category: "broll",
    prompt: `Genera un clip de 4 segundos: gráficos de trading subiendo en una pantalla, reflejados en unos lentes. Ambiente oscuro con luz verde de las gráficas iluminando el rostro parcialmente visible. Movimiento: slow dolly in. Números y datos en la pantalla moviéndose en real-time. Estilo: Wall Street, premium, dramático.`,
    tip: "Combina con narración sobre inversiones o datos financieros.",
  },

  // Texto & Motion Graphics
  {
    title: "Título Animado Lower Third",
    tool: "CapCut / After Effects",
    category: "text",
    prompt: `Instrucciones para editor: Crear lower third animado. Posición: esquina inferior izquierda. Línea 1: Nombre/Título (fuente bold, 24px, blanco). Línea 2: Subtítulo (fuente regular, 14px, slate-400). Fondo: rectángulo con esquinas redondeadas, gradiente violet-600 a pink-500, opacidad 90%. Animación entrada: slide in desde la izquierda (0.4s, ease-out). Duración visible: 4 segundos. Animación salida: fade out (0.3s).`,
    tip: "Usa para presentar invitados, fuentes o cambios de tema.",
  },
  {
    title: "Subtítulos Estilo TikTok",
    tool: "CapCut Auto Captions",
    category: "text",
    prompt: `Instrucciones para editor: Subtítulos centrados en pantalla, posición: 70% desde arriba. Fuente: Montserrat ExtraBold, 32px. Color texto: blanco con outline negro 2px. Palabra clave resaltada: amarillo (#FBBF24) o verde (#22C55E). Máximo 6 palabras por línea. Animación: word-by-word highlight (cada palabra se ilumina al ser pronunciada). Fondo: sombra difusa oscura detrás del texto. NO usar caja/rectángulo de fondo.`,
    tip: "Los subtítulos aumentan la retención un 40% — especialmente en Shorts.",
  },
  {
    title: "Dato Numérico Animado",
    tool: "After Effects / CapCut",
    category: "text",
    prompt: `Instrucciones para editor: Número grande centrado que cuenta desde 0 hasta el número final (ej: $50,000). Fuente: Space Grotesk Bold, 80px, blanco. Animación: counter up de 1.5 segundos con ease-out. Al llegar al número final: sutil scale bounce (1.0 → 1.05 → 1.0). Debajo: label descriptivo en 14px, slate-400. Efecto: partículas doradas sutiles al completarse.`,
    tip: "Perfecto para revelar cifras de ingresos, estadísticas o resultados.",
  },

  // Color & Estilo
  {
    title: "Color Grading Cinematic",
    tool: "DaVinci Resolve / Premiere",
    category: "color",
    prompt: `Instrucciones para colorista: Estilo Orange & Teal cinematic. Sombras: push hacia teal/cyan (H: 190, S: +15). Highlights: push hacia naranja cálido (H: 35, S: +10). Contraste: +15. Saturación global: -5 (ligeramente desaturado). Blacks: levantar ligeramente (lift +0.02) para look "milky". Skin tones: proteger con qualifier, mantener naturales. Grain: agregar film grain al 8%. Vignette: sutil, opacidad 20%.`,
    tip: "El look teal & orange es el más popular en YouTube — funciona para casi todo.",
  },
  {
    title: "Estilo Dark Moody",
    tool: "DaVinci Resolve / LightRoom",
    category: "color",
    prompt: `Instrucciones para colorista: Estilo dark & moody para contenido dramático. Exposición: -0.5 stops. Contraste: +25. Highlights: bajar -30. Shadows: bajar -20. Blacks: crush parcial (-15). Temperatura: ligeramente fría (5800K). Tint: +5 hacia magenta. Saturación: -15 global. Luminance de azules: -20. Split toning: sombras azul oscuro, highlights ámbar sutil. Film grain: 12%.`,
    tip: "Ideal para videos de terror, true crime, finanzas serias o storytelling dramático.",
  },
  {
    title: "Estilo Bright & Clean",
    tool: "CapCut / Premiere",
    category: "color",
    prompt: `Instrucciones para colorista: Estilo limpio y luminoso para contenido educativo/lifestyle. Exposición: +0.3. Contraste: +10. Highlights: +15 (bright but not blown). Shadows: levantar +20. Whites: +10. Temperatura: cálida (6200K). Saturación: +8 global. Vibrance: +12. Claridad: +10. Sin grain. Sin vignette. Skin tones: cálidos y saludables. Look final: limpio, profesional, amigable.`,
    tip: "Perfecto para tutoriales, vlogs, cocina y contenido educativo.",
  },

  // Audio & Voz
  {
    title: "Voz en Off con ElevenLabs",
    tool: "ElevenLabs",
    category: "audio",
    prompt: `Configuración de voz IA: Voz masculina/femenina profesional en español latino neutro. Estabilidad: 0.65 (natural pero consistente). Similaridad: 0.78. Estilo: narrador documental, tono confiado pero accesible. Velocidad: 1.0x (ajustar a 0.95x para contenido educativo, 1.1x para contenido energético). Post-procesado: compresor ligero, de-esser, EQ: cut bajo 80Hz, boost presencia 3-5kHz.`,
    tip: "Graba primero tu voz real y clona con ElevenLabs para mantener tu identidad.",
  },
  {
    title: "Sound Design Layers",
    tool: "Editor de audio / CapCut",
    category: "audio",
    prompt: `Instrucciones para editor de audio: Estructura de capas para video profesional. Capa 1 (Base): Música de fondo -18dB a -22dB. Capa 2 (Voz): Narración/diálogo -6dB a -3dB, comprimida. Capa 3 (SFX): Efectos de transición (swoosh, whoosh) -12dB. Capa 4 (Ambiente): Room tone o ambient sutil -24dB. Capa 5 (Puntos): Risers y hits para momentos clave -10dB. Ducking: música baja automáticamente -6dB cuando hay voz. Fade in/out: 0.5 segundos en cada corte de música.`,
    tip: "Las capas de audio son lo que separa un video amateur de uno profesional.",
  },

  // Shorts & Reels
  {
    title: "Estructura Short Viral",
    tool: "CapCut / Premiere",
    category: "shorts",
    prompt: `Instrucciones para editor — Short de 30-60 segundos: HOOK (0-3s): Zoom in dramático a la cara/texto, pregunta impactante. DESARROLLO (3-45s): Cortes cada 2-3 segundos MAX. Zoom ins sutiles (1.0→1.15x) en puntos clave. Subtítulos estilo TikTok (palabra por palabra). B-roll cada 5-8 segundos para mantener visual fresh. CIERRE (últimos 5s): Call to action + loop back (que conecte con el inicio para replay). Aspecto: 9:16. Pacing: rápido, sin pausas largas. Música: trending sound o beat energético.`,
    tip: "El loop (conectar final con inicio) aumenta las reproducciones exponencialmente.",
  },
  {
    title: "Short Educativo (Dato Curioso)",
    tool: "CapCut",
    category: "shorts",
    prompt: `Instrucciones para editor — Short educativo 45s: HOOK (0-2s): "¿Sabías que..." con texto grande en pantalla + zoom in. DATO 1 (2-12s): Imagen/video de apoyo + subtítulo resaltado + zoom sutil. DATO 2 (12-25s): Cambio de visual + nueva imagen + efecto pop en número clave. DATO 3 (25-38s): Revelación más impactante + B-roll dramatic. CIERRE (38-45s): "Sígueme para más" + logo. Transiciones: corte directo con zoom (sin transiciones fancy). Subtítulos: centrales, fuente bold, palabra clave en color.`,
    tip: "Los shorts educativos con datos curiosos tienen las mejores tasas de compartir.",
  },
];

/* ── Component ─────────────────────────────────────────────────────────── */

export default function PromptsEdicionPage() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const filtered = PROMPTS.filter((p) => {
    if (selectedCat !== "all" && p.category !== selectedCat) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.tool.toLowerCase().includes(q) ||
      p.prompt.toLowerCase().includes(q)
    );
  });

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Wand2 size={20} className="text-pink-400" />
              Prompts de Edición
            </h1>
            <p className="text-xs text-slate-400">
              {PROMPTS.length} prompts para editores humanos e IA (Runway, Pika, CapCut)
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Buscar prompt por nombre, herramienta o contenido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-pink-500/50 transition-colors"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedCat === cat.id
                  ? "bg-pink-600 text-white"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Prompts */}
        <div className="space-y-4">
          {filtered.map((p, i) => (
            <div
              key={p.title}
              className="bg-slate-900/60 border border-slate-800/50 rounded-xl overflow-hidden hover:border-pink-500/20 transition-colors"
            >
              {/* Card header */}
              <div className="px-4 pt-4 pb-2 flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{p.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400 font-medium">
                      {p.tool}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {CATEGORIES.find((c) => c.id === p.category)?.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(p.prompt, i)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    copiedIdx === i
                      ? "bg-green-600/20 text-green-400"
                      : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80"
                  }`}
                >
                  {copiedIdx === i ? (
                    <>
                      <Check size={12} /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copiar
                    </>
                  )}
                </button>
              </div>

              {/* Prompt text */}
              <div className="px-4 pb-3">
                <pre className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-slate-950/60 rounded-lg p-3 border border-slate-800/30">
                  {p.prompt}
                </pre>
              </div>

              {/* Tip */}
              <div className="px-4 pb-4">
                <p className="text-[11px] text-amber-400/80 flex items-start gap-1.5">
                  <Lightbulb size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#a78bfa" }} />
                  <span>{p.tip}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Wand2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              No se encontraron prompts para &quot;{search}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
