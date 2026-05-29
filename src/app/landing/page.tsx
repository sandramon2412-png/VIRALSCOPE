"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Flame, TrendingUp, Search, Zap, Brain, Video,
  Mic, Image, DollarSign, Star, Check, ChevronDown,
  ArrowRight, Play, BarChart3, Target, Sparkles,
  Users, PlayCircle, Shield, Clock, X, Cpu, Crosshair,
  Type, Swords,
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Search,
    gradient: "from-orange-500 to-red-500",
    glow: "rgba(249,115,22,0.15)",
    title: "Outlier Score™",
    desc: "Detecta videos que superan 5x, 10x o 50x el promedio del canal. Encuentra ideas ganadoras antes que la competencia.",
    tag: null,
  },
  {
    icon: TrendingUp,
    gradient: "from-red-500 to-orange-500",
    glow: "rgba(239,68,68,0.15)",
    title: "Trending Topics",
    desc: "Descubre los videos más virales de cualquier nicho en los últimos 7, 30 o 90 días. Con RPM estimado por video.",
    tag: "Hot",
  },
  {
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-600",
    glow: "rgba(139,92,246,0.15)",
    title: "Crear Canal con IA",
    desc: "6 puntos de entrada: desde cero, emula un canal exitoso, analiza outliers. Genera nombre, logo y banner automáticamente.",
    tag: "Nuevo",
  },
  {
    icon: Zap,
    gradient: "from-yellow-500 to-orange-500",
    glow: "rgba(234,179,8,0.15)",
    title: "Crear Contenido",
    desc: "Wizard 5 pasos: Título con CTR Score → Hook → Guión → SEO → Miniatura. Exporta todo en PDF con un clic.",
    tag: "Pro",
  },
  {
    icon: Brain,
    gradient: "from-pink-500 to-rose-600",
    glow: "rgba(236,72,153,0.15)",
    title: "Análisis IA del Viral",
    desc: "Claude IA analiza por qué cada video explotó: el hook, el título, el formato. Copia la fórmula exacta.",
    tag: null,
  },
  {
    icon: Image,
    gradient: "from-cyan-500 to-blue-600",
    glow: "rgba(6,182,212,0.15)",
    title: "Dimension — Miniaturas IA",
    desc: "Genera prompts DALL-E para miniaturas de alto CTR. 3 estilos: Cinematic, 3D, Unreal Engine. Historial guardado.",
    tag: "Nuevo",
  },
  {
    icon: BarChart3,
    gradient: "from-emerald-500 to-teal-600",
    glow: "rgba(16,185,129,0.15)",
    title: "Kanban de Producción",
    desc: "Pipeline completo: Ideas → Guión → Grabación → Edición → Programado → Publicado. Auto-guardado local.",
    tag: "Nuevo",
  },
  {
    icon: Users,
    gradient: "from-blue-500 to-indigo-600",
    glow: "rgba(59,130,246,0.15)",
    title: "Top Channels",
    desc: "Ranking de canales que más crecen en tu nicho. Analiza su estrategia y emúlalos con un clic.",
    tag: "NEW",
  },
  {
    icon: DollarSign,
    gradient: "from-green-500 to-emerald-600",
    glow: "rgba(34,197,94,0.15)",
    title: "Calculadora de Ingresos",
    desc: "6 fuentes de monetización: AdSense, patrocinios, afiliados, membresías, Super Thanks y productos digitales.",
    tag: null,
  },
  {
    icon: Target,
    gradient: "from-indigo-500 to-violet-600",
    glow: "rgba(99,102,241,0.15)",
    title: "TOP 100 Nichos",
    desc: "100 nichos curados con RPM real, competencia, tendencia y clasificación Long Form / Short Form.",
    tag: "TOP",
  },
  {
    icon: Mic,
    gradient: "from-violet-600 to-purple-700",
    glow: "rgba(124,58,237,0.15)",
    title: "Generador de Hooks",
    desc: "10 arquetipos de hooks científicamente probados. Pattern Interrupt, Open Loop, Bold Claim y más.",
    tag: null,
  },
  {
    icon: Video,
    gradient: "from-slate-500 to-slate-600",
    glow: "rgba(100,116,139,0.15)",
    title: "Guión Completo con IA",
    desc: "Estructura ganadora de retención: Hook → Intro → 3 Desarrollos → CTA → Cierre. Streaming en tiempo real.",
    tag: null,
  },
];

const COMPARISON = [
  { feature: "Base de nichos con RPM real", vs: [true, true, false, false] },
  { feature: "Análisis de competencia cruzada", vs: [true, false, false, false] },
  { feature: "Títulos virales con fórmulas", vs: [true, false, false, false] },
  { feature: "Banco de hooks (8 tipos)", vs: [true, false, false, false] },
  { feature: "Outlier Score™ (viralidad)", vs: [true, false, false, false] },
  { feature: "Plan editorial 30 videos", vs: [true, false, false, false] },
  { feature: "Branding completo con IA", vs: [true, true, false, false] },
  { feature: "Miniaturas con IA", vs: [true, true, false, true] },
  { feature: "Guiones + Voz IA", vs: [true, true, false, false] },
  { feature: "Calculadora de ingresos", vs: [true, false, false, false] },
  { feature: "100% en español", vs: [true, true, false, false] },
  { feature: "Precio mensual", vs: ["$12", "$27", "$49", "$16"] },
];

const TOOLS_HEADERS = ["ViralScope", "Competidor A", "VidIQ", "Canva Pro"];

const TESTIMONIALS = [
  {
    name: "Carlos M.",
    handle: "@carlosfinanzasmx",
    subs: "48K subs",
    avatar: "CM",
    gradient: "from-violet-500 to-purple-600",
    text: "Encontré un video con Outlier Score de 80x. Copié el formato y llegué a 200K vistas. La herramienta se pagó sola en el primer mes.",
    stars: 5,
  },
  {
    name: "Andrea R.",
    handle: "@andreamotivacion",
    subs: "122K subs",
    avatar: "AR",
    gradient: "from-pink-500 to-rose-500",
    text: "Los títulos virales me ahorraron horas de prueba y error. El plan de 30 videos cambió cómo opero mi canal completamente.",
    stars: 5,
  },
  {
    name: "Diego F.",
    handle: "@diegofacelesstv",
    subs: "31K subs",
    avatar: "DF",
    gradient: "from-orange-500 to-amber-500",
    text: "Tenía 0 ideas. Usé el explorador de nichos, encontré uno con RPM de $18 y baja competencia. En 3 meses moneticé.",
    stars: 5,
  },
];

const FAQS = [
  {
    q: "¿Qué es el Outlier Score™?",
    a: "Es nuestra métrica exclusiva que compara las vistas de un video vs el promedio de su canal. Un score de 10x significa que tiene 10 veces más vistas. Identifica ideas que YA funcionaron, no suposiciones.",
  },
  {
    q: "¿En qué se diferencia de otras herramientas como VidIQ?",
    a: "Otras plataformas son buenas pero no tienen: Outlier Score, generador de títulos con 12 fórmulas psicológicas, banco de hooks, análisis de competencia cruzada ni plan editorial de 30 videos. ViralScope es la suite más completa en español.",
  },
  {
    q: "¿Para qué tipo de creadores es?",
    a: "Para creadores que quieren crecer de forma inteligente: canales faceless, finanzas, motivación, tecnología, educación. Si quieres estrategia basada en datos en lugar de intuición, ViralScope es para ti.",
  },
  {
    q: "¿El generador de guiones y voz es bueno?",
    a: "El guion lo genera Claude (Anthropic), el modelo más avanzado del mercado. La voz usa ElevenLabs, la tecnología preferida por youtubers profesionales de canales faceless. Calidad notablemente superior a TTS genérico.",
  },
  {
    q: "¿Necesito conocimientos técnicos?",
    a: "Para nada. ViralScope es punto y clic: buscas un tema, ves los resultados, pides el análisis. Todo visual, todo en español. Si puedes usar YouTube, puedes usar ViralScope.",
  },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: "radial-gradient(130% 130% at 0% 0%, #1a1428, #0b0914 70%)",
        border: open ? "1px solid rgba(139,92,246,0.35)" : "1px solid rgba(139,92,246,0.15)",
      }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors"
      >
        <span className="text-white/85 font-medium text-sm pr-4">{q}</span>
        <ChevronDown
          className="w-4 h-4 text-white/40 shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "" }}
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-white/50 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── APP SHOWCASE COMPONENT ──────────────────────────────────────────────────

const SHOWCASE_TABS = [
  {
    id: "buscador",
    icon: Search,
    label: "Buscador viral",
    desc: "Encuentra videos que explotan con el Outlier Score",
    preview: "buscador",
  },
  {
    id: "nichos",
    icon: TrendingUp,
    label: "Nichos rentables",
    desc: "45+ nichos con RPM real y nivel de competencia",
    preview: "nichos",
  },
  {
    id: "titulos",
    icon: Type,
    label: "Títulos virales",
    desc: "12 fórmulas psicológicas probadas por millones de views",
    preview: "titulos",
  },
  {
    id: "hooks",
    icon: Mic,
    label: "Banco de hooks",
    desc: "8 tipos de hooks para retener en los primeros 30s",
    preview: "hooks",
  },
  {
    id: "competencia",
    icon: Swords,
    label: "Competencia",
    desc: "Compara hasta 4 canales y encuentra sus gaps",
    preview: "competencia",
  },
];

const THUMB_VIDEOS = [
  {
    title: "Cómo ahorré $10,000 en 6 meses sin sacrificar nada",
    score: "47.3x", scoreColor: "#ef4444",
    views: "2.1M", ago: "hace 3 meses", why: "Número específico + tiempo",
    channel: "FinanzasLibres", dur: "14:32",
    c1: "#1e3a5f", c2: "#0f1e3a", c3: "#ef4444", textColor: "#fbbf24",
  },
  {
    title: "El error financiero que comete el 90% de la gente",
    score: "23.8x", scoreColor: "#f97316",
    views: "891K", ago: "hace 1 mes", why: "Miedo + identificación",
    channel: "DineroInteligente", dur: "11:18",
    c1: "#3b1f00", c2: "#1f1000", c3: "#f97316", textColor: "#fff",
  },
  {
    title: "Invierte $100 al mes y retírate con $1,000,000",
    score: "18.2x", scoreColor: "#eab308",
    views: "654K", ago: "hace 5 meses", why: "Promesa de valor directa",
    channel: "InversorPro", dur: "18:45",
    c1: "#0a2540", c2: "#051525", c3: "#22d3ee", textColor: "#22d3ee",
  },
  {
    title: "Lo que los ricos saben y nadie más te va a decir",
    score: "31.5x", scoreColor: "#f97316",
    views: "1.3M", ago: "hace 2 semanas", why: "Secreto revelado",
    channel: "MenteMillonaria", dur: "22:07",
    c1: "#2d0f3d", c2: "#150820", c3: "#ec4899", textColor: "#f9a8d4",
  },
  {
    title: "Gané $5,000 extra trabajando solo 2 horas al día",
    score: "28.9x", scoreColor: "#ef4444",
    views: "1.1M", ago: "hace 1 mes", why: "Resultado + poco esfuerzo",
    channel: "LibertadFinanciera", dur: "16:20",
    c1: "#0f2d1a", c2: "#071509", c3: "#22c55e", textColor: "#86efac",
  },
  {
    title: "El sistema exacto que me hizo millonario a los 28",
    score: "22.1x", scoreColor: "#eab308",
    views: "780K", ago: "hace 4 meses", why: "Historia + sistema",
    channel: "RiquezaReal", dur: "25:11",
    c1: "#2d2400", c2: "#181300", c3: "#eab308", textColor: "#fde68a",
  },
];

function FakeThumbnail({ v }: { v: typeof THUMB_VIDEOS[0] }) {
  return (
    <div className="aspect-video rounded-lg relative overflow-hidden"
      style={{ background: `linear-gradient(145deg, ${v.c1} 0%, ${v.c2} 100%)` }}>
      {/* Geometric accent stripe */}
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: v.c3 }} />
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      {/* Glow blob */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-40"
        style={{ background: v.c3 }} />
      {/* Score badge top-right */}
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black text-white"
        style={{ background: v.scoreColor }}>
        {v.score}
      </div>
      {/* Bold title text bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }}>
        <p className="text-[9px] font-black leading-tight line-clamp-2"
          style={{ color: v.textColor, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
          {v.title.toUpperCase()}
        </p>
      </div>
      {/* Duration */}
      <div className="absolute bottom-2 right-2 text-[8px] font-bold text-white px-1.5 py-0.5 rounded"
        style={{ background: "rgba(0,0,0,0.8)" }}>{v.dur}</div>
    </div>
  );
}

function BuscadorPreview() {
  return (
    <div className="p-5">
      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.3)", color: "rgba(255,255,255,0.5)" }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#a78bfa" }} />
          finanzas personales 2025
        </div>
        <div className="px-5 py-3 rounded-xl text-sm font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}>
          Analizar →
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {THUMB_VIDEOS.map((v, i) => (
          <div key={i} className="rounded-xl overflow-hidden"
            style={{ background: "radial-gradient(120% 120% at 0% 0%, #1c1630, #0b0914 70%)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <FakeThumbnail v={v} />
            <div className="p-2.5">
              <p className="text-[10px] font-semibold mb-1 leading-tight line-clamp-2" style={{ color: "rgba(255,255,255,0.9)" }}>{v.title}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>{v.channel} · {v.views} vistas</p>
                  <p className="text-[8px] italic" style={{ color: "rgba(255,255,255,0.25)" }}>{v.why}</p>
                </div>
                <span className="text-[10px] font-black text-white px-1.5 py-0.5 rounded-md flex-shrink-0 ml-1" style={{ background: v.scoreColor }}>
                  {v.score}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NichosPreview() {
  const nichos = [
    { cat: "Finanzas", name: "Personal Finance", rpm: "$15-40", minVis: "$1500", tend: "Estable", comp: "alta", faceless: true },
    { cat: "Finanzas", name: "Trading Forex", rpm: "$10-25", minVis: "$1000", tend: "Estable", comp: "media", faceless: true },
    { cat: "Tecnología", name: "IA para Empresas", rpm: "$10-22", minVis: "$1000", tend: "↑ Subiendo", comp: "baja", faceless: true },
    { cat: "Salud", name: "Pérdida de Peso", rpm: "$8-18", minVis: "$800", tend: "Estable", comp: "alta", faceless: true },
  ];
  const compColor: Record<string, string> = { alta: "#ef4444", media: "#f97316", baja: "#22c55e" };
  return (
    <div className="p-5">
      <div className="flex gap-3 mb-4">
        <div className="rounded-xl px-3 py-2 text-xs flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
          <span>Categoría: Todas</span>
        </div>
        <div className="rounded-xl px-3 py-2 text-xs flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
          <span>Competencia: Todas</span>
        </div>
        <div className="rounded-xl px-3 py-2 text-xs flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
          <span>Solo Faceless</span>
        </div>
        <div className="ml-auto rounded-xl px-3 py-2 text-xs font-bold" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}>
          Mayor RPM ↓
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {nichos.map((n, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: "radial-gradient(120% 120% at 0% 0%, #1c1630, #0b0914 70%)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#a78bfa" }}>{n.cat}</p>
                <p className="text-sm font-bold text-white">{n.name}</p>
              </div>
              <div className="flex gap-1">
                {n.faceless && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa" }}>Faceless</span>}
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white" style={{ background: compColor[n.comp] }}>{n.comp}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[{ l: "RPM USD", v: n.rpm, c: "#22c55e" }, { l: "Min/100K vis", v: n.minVis, c: "#22c55e" }, { l: "Tendencia", v: n.tend, c: n.tend.includes("↑") ? "#22c55e" : "rgba(255,255,255,0.5)" }].map(m => (
                <div key={m.l}>
                  <p className="text-[9px] mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{m.l}</p>
                  <p className="text-xs font-bold" style={{ color: m.c }}>{m.v}</p>
                </div>
              ))}
            </div>
            <button className="w-full text-[10px] py-1.5 rounded-lg font-bold" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
              Buscar videos →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TitulosPreview() {
  const titulos = [
    { titulo: "Cómo ahorré $10,000 en solo 6 meses (método exacto)", formula: "Número específico", emocion: "Curiosidad", score: 94, color: "#8b5cf6" },
    { titulo: "El ERROR que te mantiene broke (y cómo evitarlo)", formula: "Error común", emocion: "Miedo", score: 91, color: "#ef4444" },
    { titulo: "Hice $5,000 extras sin dejar mi trabajo — esto fue lo que hice", formula: "Historia personal", emocion: "Esperanza", score: 88, color: "#22c55e" },
    { titulo: "Lo que nadie te dice sobre invertir en bolsa", formula: "Secreto revelado", emocion: "Curiosidad", score: 86, color: "#8b5cf6" },
    { titulo: "¿Por qué SIGUES sin dinero? (respuesta honesta)", formula: "Pregunta directa", emocion: "Miedo", score: 83, color: "#ef4444" },
    { titulo: "El sistema de $100/día que cualquiera puede copiar", formula: "Promesa de valor", emocion: "Codicia", score: 90, color: "#f97316" },
  ];
  const emocionColor: Record<string, string> = { Curiosidad: "#8b5cf6", Miedo: "#ef4444", Esperanza: "#22c55e", Codicia: "#f97316" };
  return (
    <div className="p-5">
      <div className="flex gap-2 mb-4 flex-wrap">
        {["Todos", "Curiosidad", "Miedo", "Esperanza", "Codicia"].map((e, i) => (
          <span key={e} className="text-[10px] px-3 py-1 rounded-full font-bold cursor-pointer"
            style={i === 0
              ? { background: "linear-gradient(135deg, #8b5cf6, #ec4899)", color: "#fff" }
              : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {e}
          </span>
        ))}
        <span className="ml-auto text-[10px] px-3 py-1 rounded-full" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
          Copiar todos
        </span>
      </div>
      <div className="space-y-2">
        {titulos.map((t, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl p-3"
            style={{ background: "radial-gradient(120% 120% at 0% 0%, #1c1630, #0b0914 70%)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
              style={{ background: t.color }}>{i + 1}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white leading-tight truncate">{t.titulo}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: `${emocionColor[t.emocion]}22`, color: emocionColor[t.emocion] }}>{t.emocion}</span>
                <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{t.formula}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs font-black text-white">{t.score}</p>
                <div className="w-12 h-1 rounded-full mt-0.5" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-1 rounded-full" style={{ width: `${t.score}%`, background: t.color }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HooksPreview() {
  const hooks = [
    { cat: "PREGUNTA DIRECTA", hook: "¿Por qué llevas años trabajando y sigues sin dinero?", dur: "4s", impacto: 95, color: "#8b5cf6" },
    { cat: "DATO IMPACTANTE", hook: "El 73% de las personas que ganan más de $5,000 al mes hacen esto cada mañana.", dur: "6s", impacto: 92, color: "#ec4899" },
    { cat: "HISTORIA CORTA", hook: "Hace 2 años tenía $0 en mi cuenta. Hoy te voy a contar exactamente qué cambié.", dur: "7s", impacto: 88, color: "#f97316" },
    { cat: "CLIFFHANGER", hook: "Lo que estoy a punto de decirte va a cambiar cómo ves el dinero para siempre...", dur: "5s", impacto: 90, color: "#06b6d4" },
  ];
  return (
    <div className="p-5">
      <div className="grid grid-cols-4 gap-2 mb-4">
        {["PREGUNTA", "DATO", "HISTORIA", "AFIRMACIÓN", "PROMESA", "IDENTIFICACIÓN", "CLIFFHANGER", "DESAFÍO"].map((c, i) => (
          <div key={c} className="rounded-lg p-2 text-center text-[9px] font-bold"
            style={i < 2
              ? { background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.35)", color: "#a78bfa" }
              : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}>
            {c}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {hooks.map((h, i) => (
          <div key={i} className="rounded-xl p-3"
            style={{ background: "radial-gradient(120% 120% at 0% 0%, #1c1630, #0b0914 70%)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: `${h.color}22`, color: h.color }}>{h.cat}</span>
              <span className="text-[9px] ml-auto" style={{ color: "rgba(255,255,255,0.3)" }}>~{h.dur}</span>
            </div>
            <p className="text-[11px] text-white leading-tight mb-2">&ldquo;{h.hook}&rdquo;</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="h-1 rounded-full" style={{ width: `${h.impacto}%`, background: h.color }} />
              </div>
              <span className="text-[9px] font-black text-white">{h.impacto}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetenciaPreview() {
  const canales = [
    { name: "FinanzasLibres", subs: "250K", seo: 82, eng: 74, cons: 91, color: "#8b5cf6" },
    { name: "DineroFácilTV", subs: "89K", seo: 61, eng: 88, cons: 65, color: "#ec4899" },
    { name: "InversorPro", subs: "430K", seo: 94, eng: 62, cons: 78, color: "#f97316" },
  ];
  return (
    <div className="p-5">
      <div className="grid grid-cols-3 gap-3 mb-4">
        {canales.map((c, i) => (
          <div key={i} className="rounded-xl p-3" style={{ background: "radial-gradient(120% 120% at 0% 0%, #1c1630, #0b0914 70%)", border: `1px solid ${c.color}33` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: `${c.color}33`, border: `1px solid ${c.color}55` }} />
              <div>
                <p className="text-[10px] font-bold text-white">{c.name}</p>
                <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{c.subs} subs</p>
              </div>
            </div>
            {[{ l: "SEO", v: c.seo }, { l: "Engagement", v: c.eng }, { l: "Consistencia", v: c.cons }].map(m => (
              <div key={m.l} className="mb-1.5">
                <div className="flex justify-between text-[9px] mb-0.5">
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>{m.l}</span>
                  <span className="font-bold text-white">{m.v}</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-1 rounded-full" style={{ width: `${m.v}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="rounded-xl p-4" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <p className="text-[10px] font-bold mb-2 flex items-center gap-1" style={{ color: "#a78bfa" }}><Sparkles size={10} /> Oportunidades detectadas por IA</p>
        <div className="space-y-1.5">
          {[
            "InversorPro tiene SEO excelente pero bajo engagement — sus títulos no enganchan",
            "DineroFácilTV tiene alto engagement pero publica muy poco — hay gap de frecuencia",
            "Ninguno cubre 'inversión para principiantes' con Shorts — oportunidad directa",
          ].map((op, i) => (
            <div key={i} className="flex gap-2 text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
              <span style={{ color: "#22c55e" }}>→</span> {op}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppShowcase() {
  const [active, setActive] = useState(SHOWCASE_TABS[0].id);
  const tab = SHOWCASE_TABS.find(t => t.id === active)!;
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>LA APP POR DENTRO</p>
          <h2 className="text-4xl font-black text-white mb-3">
            Ve lo que puedes hacer{" "}
            <span style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              hoy mismo
            </span>
          </h2>
          <p className="text-white/45 text-base max-w-xl mx-auto">Explora las herramientas antes de registrarte. Todo esto te espera adentro.</p>
        </div>

        {/* Tab selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SHOWCASE_TABS.map(t => {
            const TabIcon = t.icon;
            return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full font-semibold transition-all"
              style={active === t.id
                ? { background: "linear-gradient(135deg, #8b5cf6, #ec4899)", color: "#fff", boxShadow: "0 4px 20px rgba(139,92,246,0.35)" }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <TabIcon size={13} />
              {t.label}
            </button>
            );
          })}
        </div>

        {/* App window mockup */}
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(236,72,153,0.25), rgba(249,115,22,0.2))", padding: "1.5px" }}>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#0a0812" }}>
            {/* Browser bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#100d1c" }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: "rgba(239,68,68,0.5)" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "rgba(234,179,8,0.5)" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "rgba(34,197,94,0.5)" }} />
              </div>
              {/* Nav tabs */}
              <div className="flex gap-1 flex-1 overflow-x-auto">
                {SHOWCASE_TABS.map(t => {
                  const BTabIcon = t.icon;
                  return (
                  <div key={t.id} className="flex items-center gap-1 px-3 py-1 rounded-md text-[11px] whitespace-nowrap flex-shrink-0"
                    style={active === t.id
                      ? { background: "rgba(139,92,246,0.2)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }
                      : { color: "rgba(255,255,255,0.3)" }}>
                    <BTabIcon size={10} />
                    {t.label}
                  </div>
                  );
                })}
              </div>
              <div className="flex-shrink-0 text-[11px] px-3 py-1 rounded-md font-bold text-white"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}>
                viralscope.app
              </div>
            </div>

            {/* Tab description bar */}
            <div className="flex items-center gap-3 px-5 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.04)", background: "#0d0a1a" }}>
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#a78bfa" }} />
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>{tab.desc}</p>
            </div>

            {/* Preview content */}
            <div style={{ minHeight: "400px" }}>
              {active === "buscador" && <BuscadorPreview />}
              {active === "nichos" && <NichosPreview />}
              {active === "titulos" && <TitulosPreview />}
              {active === "hooks" && <HooksPreview />}
              {active === "competencia" && <CompetenciaPreview />}
            </div>
          </div>
        </div>

        {/* CTA under showcase */}
        <div className="text-center mt-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl transition-all text-base"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)", boxShadow: "0 8px 32px rgba(139,92,246,0.35)" }}
          >
            <Zap className="w-4 h-4" />
            Acceder gratis a todas las herramientas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────

const HLS_SRC = "https://stream.mux.com/BuGGTsiXq1T00WUb8qfURrHkTCbhrkfFLSv4uAOZzdhw.m3u8";

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let hlsInstance: import("hls.js").default | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = HLS_SRC;
      video.play().catch(() => {});
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (!Hls.isSupported()) return;
        hlsInstance = new Hls({ autoStartLoad: true, startLevel: -1 });
        hlsInstance.loadSource(HLS_SRC);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      });
    }
    return () => { hlsInstance?.destroy(); };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#08060f", color: "#fff" }}>

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 px-4 py-3">
        <div
          className="max-w-6xl mx-auto rounded-full flex items-center justify-between gap-4 px-5 h-12"
          style={{
            background: "linear-gradient(135deg, rgba(29,22,45,0.88), rgba(12,8,22,0.85))",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(139,92,246,0.22)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)"
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)" }}>
              <Flame className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-base" style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ViralScope
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            {[["#funciones", "Funciones"], ["#comparacion", "Comparar"], ["#precios", "Precios"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} className="px-3 py-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/8 transition-all text-sm">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors hidden sm:block">
              Iniciar sesión
            </Link>
            <Link
              href="/login"
              className="text-sm font-bold px-4 py-2 rounded-full text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                boxShadow: "0 4px 16px rgba(139,92,246,0.35)"
              }}
            >
              Empezar gratis →
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-12 pb-20 px-4 overflow-hidden">
        {/* Video de fondo HLS (Mux) */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        />
        {/* Overlay oscuro con gradiente para mantener legibilidad */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(to bottom, rgba(8,6,15,0.72) 0%, rgba(8,6,15,0.60) 50%, rgba(8,6,15,0.85) 100%)",
          zIndex: 1
        }} />
        {/* Glow orbs encima del video */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
          <div className="absolute top-0 left-1/3 w-[700px] h-[500px] rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(ellipse, #7c3aed 0%, #db2777 50%, transparent 70%)" }} />
          <div className="absolute top-40 right-10 w-72 h-72 rounded-full blur-3xl opacity-10"
            style={{ background: "#f97316" }} />
          <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full blur-3xl opacity-8"
            style={{ background: "#8b5cf6" }} />
        </div>

        <div className="relative max-w-6xl mx-auto" style={{ zIndex: 3 }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* ── LEFT: Text ── */}
            <div className="flex flex-col items-start">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.12))",
                  border: "1px solid rgba(139,92,246,0.3)"
                }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
                <span style={{ background: "linear-gradient(135deg, #c4b5fd, #f9a8d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  12 herramientas con IA · 100% en español
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-6">
                La suite{" "}
                <span style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  #1 en YouTube
                </span>
                <br />
                <span className="text-white/90">para creadores</span>
              </h1>

              <p className="text-white/50 text-lg max-w-xl mb-10 leading-relaxed">
                Encuentra videos virales, genera títulos que disparan el CTR, crea hooks irresistibles y analiza a tu competencia.{" "}
                <span className="text-white/75 font-medium">Todo con IA. Todo en español.</span>
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl transition-all text-base"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)",
                    boxShadow: "0 8px 32px rgba(139,92,246,0.4)"
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(236,72,153,0.5)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(139,92,246,0.4)"; }}
                >
                  <Zap className="w-4 h-4" />
                  Empezar gratis ahora
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 font-semibold px-8 py-4 rounded-2xl transition-all text-base text-white/70 hover:text-white"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.4)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                  <Play className="w-4 h-4" style={{ color: "#a78bfa" }} />
                  Ver demo en vivo
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-5 text-xs text-white/35">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />Sin tarjeta de crédito</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />+2,000 creadores</span>
                <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />4.9/5 valoración</span>
              </div>
            </div>

            {/* ── RIGHT: Floating animated product visuals ── */}
            <div className="relative h-[480px] hidden lg:block">

              {/* Central card — main app UI */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] float-slow"
                style={{
                  background: "radial-gradient(130% 130% at 0% 0%, #1e1535, #0b0914 70%)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  borderRadius: "20px",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.15)",
                  padding: "16px"
                }}>
                {/* Mini search bar */}
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <Search className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>finanzas personales...</span>
                  <div className="ml-auto px-2 py-0.5 rounded-lg text-[10px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}>IA</div>
                </div>
                {/* Result rows */}
                {[
                  { title: "Cómo ahorré $10,000 en 6 meses", score: "47.3x", color: "#ef4444", views: "2.1M" },
                  { title: "El error que te tiene quebrado", score: "23.8x", color: "#f97316", views: "891K" },
                  { title: "Invierte $100 y haz $1,000", score: "18.2x", color: "#eab308", views: "654K" },
                ].map((v, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl p-2 mb-1.5"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.05)" }}>
                      <PlayCircle className="w-4 h-4" style={{ color: "#a78bfa" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{v.title}</p>
                      <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{v.views} vistas</p>
                    </div>
                    <span className="text-[10px] font-black text-white px-1.5 py-0.5 rounded-md flex-shrink-0"
                      style={{ background: v.color }}>{v.score}</span>
                  </div>
                ))}
              </div>

              {/* Floating badge — Outlier Score */}
              <div className="absolute top-6 right-4 float-fast score-glow rounded-2xl px-4 py-3"
                style={{
                  background: "radial-gradient(130% 130% at 0% 0%, #2a1010, #0f0a0a 70%)",
                  border: "1px solid rgba(239,68,68,0.35)",
                }}>
                <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "rgba(239,68,68,0.7)" }}>Outlier Score</p>
                <p className="text-3xl font-black text-white leading-none">47.3<span className="text-base">x</span></p>
                <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>viral potencial</p>
              </div>

              {/* Floating nicho tags */}
              <div className="absolute top-10 left-0 float-medium flex flex-col gap-1.5">
                {["Finanzas", "Gaming", "Fitness"].map((tag, i) => (
                  <div key={i} className="rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: "rgba(139,92,246,0.12)",
                      border: "1px solid rgba(139,92,246,0.25)",
                      color: "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(10px)"
                    }}>{tag}</div>
                ))}
              </div>

              {/* Floating AI analysis card */}
              <div className="absolute bottom-14 right-2 float-reverse rounded-2xl px-4 py-3 w-[160px]"
                style={{
                  background: "radial-gradient(130% 130% at 100% 100%, #1a1030, #0b0914 70%)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  backdropFilter: "blur(12px)"
                }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3 h-3" style={{ color: "#a78bfa" }} />
                  <span className="text-[10px] font-bold" style={{ color: "#a78bfa" }}>Análisis IA</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "SEO", val: 87, color: "#8b5cf6" },
                    { label: "CTR", val: 94, color: "#ec4899" },
                    { label: "Retención", val: 78, color: "#f97316" },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-[9px] mb-0.5">
                        <span style={{ color: "rgba(255,255,255,0.45)" }}>{m.label}</span>
                        <span className="font-bold text-white">{m.val}</span>
                      </div>
                      <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className="h-1 rounded-full" style={{ width: `${m.val}%`, background: m.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating hook card */}
              <div className="absolute bottom-2 left-4 float-slow rounded-2xl px-4 py-3 w-[190px]"
                style={{
                  background: "radial-gradient(130% 130% at 0% 100%, #111828, #0b0914 70%)",
                  border: "1px solid rgba(249,115,22,0.25)",
                }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Zap className="w-3 h-3" style={{ color: "#f97316" }} />
                  <span className="text-[10px] font-bold" style={{ color: "#f97316" }}>Hook generado</span>
                </div>
                <p className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.6)" }}>
                  &ldquo;Lo que nadie te dice sobre el dinero va a cambiar tu vida...&rdquo;
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1 flex-1 rounded-full" style={{ background: "rgba(249,115,22,0.25)" }}>
                    <div className="h-1 rounded-full w-[92%]" style={{ background: "#f97316" }} />
                  </div>
                  <span className="text-[9px] font-bold" style={{ color: "#f97316" }}>92</span>
                </div>
              </div>

              {/* Glow behind */}
              <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20"
                  style={{ background: "#8b5cf6" }} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── APP SHOWCASE ── */}
      <AppShowcase />

      {/* ── STATS ── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl p-6"
            style={{
              background: "radial-gradient(130% 130% at 0% 0%, #1a1430, #0b0914 70%)",
              border: "1px solid rgba(139,92,246,0.2)"
            }}
          >
            {[
              { num: "500+", label: "Nichos analizados", Icon: Target },
              { num: "100K+", label: "Videos indexados", Icon: PlayCircle },
              { num: "RPM real", label: "Por nicho", Icon: DollarSign },
              { num: "6", label: "Fuentes de ingresos", Icon: BarChart3 },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-1"><s.Icon size={20} style={{ color: "#a78bfa" }} /></div>
                <div className="text-3xl font-black text-white mb-1"
                  style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {s.num}
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funciones" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>Funcionalidades</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Todo lo que necesitas para{" "}
              <span style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                dominar YouTube
              </span>
            </h2>
            <p className="text-white/45 max-w-xl mx-auto">
              12 herramientas integradas. Sin cambiar de app, sin pagar por separado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 relative"
                  style={{
                    background: "radial-gradient(130% 130% at 0% 0%, #1e1530, #0b0914 70%)",
                    border: "1px solid rgba(139,92,246,0.15)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)"
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.4)";
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${f.glow}, inset 0 0 0 1px rgba(255,255,255,0.06)`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.15)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "inset 0 0 0 1px rgba(255,255,255,0.04)";
                  }}
                >
                  {f.tag && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>
                      {f.tag}
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: "#1c1208", border: "1px solid rgba(249,115,22,0.4)" }}>
                    <Icon size={18} style={{ color: "#f97316" }} />
                  </div>
                  <h3 className="font-bold text-white mb-1.5">{f.title}</h3>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)", lineHeight: "1.6" }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FLUJO COMPLETO ── */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3">
            De idea a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              publicar en minutos
            </span>
          </h2>
          <p className="text-white/40">El flujo completo de producción sin salir de la app</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {[
            { n: "1", label: "Descubre", sub: "Buscador viral + Trending", Icon: Search, href: "/" },
            { n: "2", label: "Planifica", sub: "Crear Canal con IA", Icon: Sparkles, href: "/crear-canal" },
            { n: "3", label: "Crea", sub: "Título + Hook + Guión", Icon: Type, href: "/titulos" },
            { n: "4", label: "Diseña", sub: "Miniatura + Dimension", Icon: Image, href: "/miniatura" },
            { n: "5", label: "Publica", sub: "Kanban + SEO", Icon: Check, href: "/kanban" },
          ].map((step, i) => (
            <div key={step.n} className="flex items-center gap-4">
              <Link
                href={step.href}
                className="flex flex-col items-center text-center p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-violet-500/40 hover:bg-white/[0.06] transition-all w-32 group"
              >
                <div className="flex justify-center mb-2"><step.Icon size={24} style={{ color: "#a78bfa" }} /></div>
                <div className="text-white font-bold text-sm">{step.label}</div>
                <div className="text-white/40 text-[11px] mt-0.5">{step.sub}</div>
              </Link>
              {i < 4 && (
                <div className="hidden sm:block text-white/20 text-2xl">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#f472b6" }}>Proceso</p>
            <h2 className="text-4xl font-black">De 0 a canal listo en{" "}
              <span style={{ background: "linear-gradient(135deg, #ec4899, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                minutos
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Busca tu nicho", desc: "Escribe cualquier tema y ViralScope detecta videos con Outlier Score alto — los que ya viralizaron y pueden repetirse.", color: "#f97316", glow: "rgba(249,115,22,0.2)" },
              { num: "02", title: "La IA analiza el porqué", desc: "Claude analiza el hook, título, formato y algoritmo de cada viral. Recibes la fórmula exacta para replicar ese éxito.", color: "#8b5cf6", glow: "rgba(139,92,246,0.2)" },
              { num: "03", title: "Ejecuta con datos", desc: "Genera títulos, hooks, plan de 30 videos, guiones, voz IA y miniaturas. Todo listo para publicar.", color: "#ec4899", glow: "rgba(236,72,153,0.2)" },
            ].map((step) => (
              <div key={step.num} className="relative rounded-2xl p-6 text-center"
                style={{
                  background: "radial-gradient(130% 130% at 50% 0%, #1a1230, #0b0914 70%)",
                  border: `1px solid ${step.glow}`,
                }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black"
                  style={{ background: `${step.glow}`, border: `1px solid ${step.color}40`, color: step.color }}>
                  {step.num}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)", lineHeight: "1.7" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section id="comparacion" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#fb923c" }}>Comparación real</p>
            <h2 className="text-4xl font-black mb-4">¿Por qué pagar más por menos?</h2>
            <p style={{ color: "rgba(255,255,255,0.45)" }}>Compara con las herramientas más populares del mercado</p>
          </div>

          <div className="overflow-x-auto rounded-2xl"
            style={{ border: "1px solid rgba(139,92,246,0.2)", background: "radial-gradient(130% 130% at 0% 0%, #1a1430, #0b0914 70%)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left px-5 py-4 text-white/40 font-medium">Funcionalidad</th>
                  {TOOLS_HEADERS.map((h, i) => (
                    <th key={h} className={`px-4 py-4 font-bold text-center ${i === 0 ? "text-white" : "text-white/40"}`}>
                      {i === 0 ? (
                        <span style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          {h}
                        </span>
                      ) : h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < COMPARISON.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.65)" }}>{row.feature}</td>
                    {row.vs.map((v, j) => (
                      <td key={j} className="px-4 py-3.5 text-center">
                        {typeof v === "boolean" ? (
                          v ? (
                            <Check size={16} className="mx-auto" style={{ color: j === 0 ? "#a78bfa" : "#22c55e" }} />
                          ) : (
                            <X size={16} className="mx-auto" style={{ color: "rgba(255,255,255,0.15)" }} />
                          )
                        ) : (
                          <span className={`font-bold text-xs ${j === 0 ? "" : "text-white/50"}`}
                            style={j === 0 ? { background: "linear-gradient(135deg, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : {}}>
                            {v}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>Creadores reales</p>
            <h2 className="text-4xl font-black">Lo que dicen los que ya crecieron</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl p-5"
                style={{
                  background: "radial-gradient(130% 130% at 0% 0%, #1a1430, #0b0914 70%)",
                  border: "1px solid rgba(139,92,246,0.15)",
                }}>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.stars)].map((_, i) => <Star key={i} size={12} fill="#eab308" style={{ color: "#eab308" }} />)}
                </div>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.65)", lineHeight: "1.7" }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: "#1c1208", border: "1px solid rgba(249,115,22,0.4)", color: "#f97316" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{t.handle} · {t.subs}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="precios" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#fb923c" }}>Precios</p>
            <h2 className="text-4xl font-black mb-4">Empieza gratis, escala cuando quieras</h2>
            <p style={{ color: "rgba(255,255,255,0.45)" }}>Sin contratos. Cancela cuando quieras.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Free */}
            <div className="rounded-2xl p-6"
              style={{
                background: "radial-gradient(130% 130% at 0% 0%, #1a1430, #0b0914 70%)",
                border: "1px solid rgba(255,255,255,0.08)"
              }}>
              <p className="text-sm text-white/50 mb-1">Gratis</p>
              <div className="text-4xl font-black text-white mb-1">$0</div>
              <p className="text-xs text-white/35 mb-6">para siempre</p>
              <div className="space-y-2.5 mb-6">
                {["10 búsquedas diarias", "Outlier Score™", "Explorador de nichos", "Calculadora de ingresos", "1 análisis IA por día"].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <Check size={14} className="text-green-500 flex-shrink-0" />{f}
                  </div>
                ))}
                {["Plan de 30 videos", "Generador de títulos virales", "Banco de hooks", "Miniaturas DALL-E 3"].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/25">
                    <X size={14} className="flex-shrink-0" />{f}
                  </div>
                ))}
              </div>
              <Link href="/login"
                className="block text-center py-3 rounded-xl font-bold text-white/70 hover:text-white transition-colors text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                Empezar gratis
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: "radial-gradient(130% 130% at 0% 0%, #2e1060, #140b2e 70%)",
                border: "1.5px solid rgba(139,92,246,0.5)",
                boxShadow: "0 0 40px rgba(139,92,246,0.2)"
              }}>
              <div className="absolute top-4 right-4 text-[11px] font-black px-3 py-1 rounded-full"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)", color: "white" }}>
                <span className="flex items-center gap-1"><Sparkles size={10} /> Más popular</span>
              </div>
              <p className="text-sm mb-1" style={{ color: "#a78bfa" }}>Pro</p>
              <div className="text-4xl font-black text-white mb-1">$12</div>
              <p className="text-xs mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>/mes · o $99/año (ahorras 31%)</p>
              <div className="space-y-2.5 mb-6">
                {[
                  "Todo lo del plan Gratis",
                  "Búsquedas ilimitadas",
                  "Plan de 30 videos con IA",
                  "12 títulos virales con fórmulas",
                  "Banco de hooks (8 tipos)",
                  "Análisis de competencia cruzada",
                  "Branding completo con IA",
                  "Miniaturas con DALL-E 3",
                  "Guiones completos + Voz IA",
                  "Guardado en la nube",
                  "Soporte prioritario",
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/80">
                    <Check size={14} style={{ color: "#a78bfa", flexShrink: 0 }} />{f}
                  </div>
                ))}
              </div>
              <Link href="/login"
                className="block text-center py-3.5 rounded-xl font-bold text-white transition-all text-sm"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)",
                  boxShadow: "0 4px 20px rgba(139,92,246,0.4)"
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(236,72,153,0.5)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(139,92,246,0.4)"; }}>
                Empezar 7 días gratis →
              </Link>
              <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                <span className="flex items-center justify-center gap-1"><Shield size={10} /> Garantía 7 días · Cancela cuando quieras</span>
              </p>
            </div>
          </div>

          {/* Value comparison */}
          <div className="mt-6 rounded-2xl p-5 text-center"
            style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <p className="text-sm text-white/50">
              Lo que pagarías por separado:{" "}
              <span className="text-white/70">VidIQ ($49) + Canva Pro ($16) + ChatGPT ($20) + otras herramientas ($27) = </span>
              <span className="line-through text-white/40">$112/mes</span>
              {"  →  "}
              <span className="font-black" style={{ color: "#a78bfa" }}>Con ViralScope: $12/mes todo incluido</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>FAQ</p>
            <h2 className="text-4xl font-black">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(ellipse, #7c3aed 0%, #db2777 50%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="mb-6 flex justify-center">
            <img
              src="https://i.imgur.com/eHctT0n.jpeg"
              alt="ViralScope"
              className="w-24 h-24 rounded-2xl object-cover float-slow"
              style={{ boxShadow: "0 8px 32px rgba(139,92,246,0.4)", transition: "transform 0.3s ease, box-shadow 0.3s ease", cursor: "pointer" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.15) rotate(-4deg)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(236,72,153,0.6)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(139,92,246,0.4)";
              }}
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            ¿Listo para ir viral?
          </h2>
          <p className="text-xl mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
            Únete a +2,000 creadores que ya usan ViralScope para crecer en YouTube con datos reales.
          </p>
          <Link
            href="/crear-canal"
            className="inline-flex items-center gap-2 text-white font-black px-10 py-5 rounded-2xl text-lg transition-all"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)",
              boxShadow: "0 8px 40px rgba(139,92,246,0.45)"
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 60px rgba(236,72,153,0.55)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(139,92,246,0.45)"; }}
          >
            <Zap className="w-5 h-5" />
            Empezar gratis ahora
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Sin tarjeta de crédito · Acceso inmediato · Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t px-4 py-10" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)" }}>
              <Flame className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black" style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ViralScope
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            <Link href="/" className="hover:text-white transition-colors">App</Link>
            <Link href="/landing#precios" className="hover:text-white transition-colors">Precios</Link>
            <Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            © 2026 ViralScope · Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
