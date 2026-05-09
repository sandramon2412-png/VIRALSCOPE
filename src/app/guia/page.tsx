"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  Zap, Search, TrendingUp, Flame, Trophy, Tv2, Swords, Bell,
  BarChart3, Type, Mic, Image, Palette, Sparkles, Box, FileText,
  CalendarDays, Target, Calculator, FolderOpen, Wand2, Kanban,
  BookOpen,
} from "lucide-react";
import GlobalNav from "@/components/GlobalNav";

// ── Types ─────────────────────────────────────────────────────────────────────

type PathId = "cero" | "crecer" | "producir" | "investigar";

interface PathCard {
  id: PathId;
  icon: React.ElementType;
  label: string;
}

interface StepLink {
  label: string;
  href: string;
}

interface Step {
  icon: string;
  title: string;
  desc: string;
  links: StepLink[];
  tip?: string;
}

interface Section {
  id: PathId;
  emoji: string;
  title: string;
  steps: Step[];
}

// ── Data ──────────────────────────────────────────────────────────────────────

const PATHS: PathCard[] = [
  { id: "cero",        icon: Wand2,      label: "Crear un canal desde cero" },
  { id: "crecer",      icon: TrendingUp, label: "Hacer crecer un canal existente" },
  { id: "producir",    icon: FileText,   label: "Producir más contenido, más rápido" },
  { id: "investigar",  icon: Search,     label: "Investigar nichos y competencia" },
];

const SECTIONS: Section[] = [
  {
    id: "cero",
    emoji: "🚀",
    title: "Crear un canal desde cero",
    steps: [
      {
        icon: "📈",
        title: "Elige tu nicho",
        desc: "Ve a **Nichos Rentables** y explora los TOP 100. Filtra por Long o Short, busca uno con RPM alto y competencia media o baja. Ese es tu punto de entrada.",
        links: [{ label: "Ver Nichos →", href: "/nichos" }],
        tip: "Los nichos de Finanzas, IA y Salud tienen el RPM más alto en español",
      },
      {
        icon: "🏆",
        title: "Investiga la competencia",
        desc: "Entra a **Top Channels** y busca los canales más exitosos de tu nicho. Estudia qué hacen bien. Luego usa **Outlier por Video** para analizar sus mejores videos.",
        links: [
          { label: "Top Channels →", href: "/top-channels" },
          { label: "Outlier por Video →", href: "/outlier" },
        ],
      },
      {
        icon: "✨",
        title: "Crea tu canal con IA",
        desc: "Ve a **Crear Canal con IA** y elige 'Desde cero' o 'Emular un canal'. La IA te dará nombres únicos, un ángulo diferenciador, tu logo y tu banner en minutos.",
        links: [{ label: "Crear Canal →", href: "/crear-canal" }],
        tip: "Activa el wizard desde el botón 'Crear mi canal' en la esquina inferior derecha de la pantalla principal",
      },
      {
        icon: "📅",
        title: "Planifica tus primeros 30 videos",
        desc: "Usa el **Plan de 30 Videos** para tener un mes completo de contenido estratégico. Luego pásalos al **Calendario** para asignarles fechas de publicación.",
        links: [
          { label: "Plan 30 Videos →", href: "/plan" },
          { label: "Calendario →", href: "/calendario" },
        ],
      },
      {
        icon: "🎬",
        title: "Produce tu primer video",
        desc: "Desde el **Buscador Viral**, haz clic en cualquier video del nicho y presiona '+ Crear Contenido'. En 5 pasos tendrás: título optimizado, hook, guión completo, SEO y miniatura.",
        links: [{ label: "Buscador Viral →", href: "/" }],
      },
    ],
  },
  {
    id: "crecer",
    emoji: "📈",
    title: "Hacer crecer un canal existente",
    steps: [
      {
        icon: "📊",
        title: "Conecta tu canal",
        desc: "Ve a **Mi Canal** y conecta tu cuenta de Google. Verás tu CTR real, impresiones, retención y tus 10 mejores videos. Esto te dice exactamente qué funciona.",
        links: [{ label: "Conectar Canal →", href: "/dashboard" }],
      },
      {
        icon: "⚔️",
        title: "Analiza a tu competencia",
        desc: "Usa **Análisis de Competencia** para comparar tu canal con hasta 3 competidores directos. Descubre en qué te superan y dónde tienes ventaja.",
        links: [{ label: "Ver Competencia →", href: "/competencia" }],
      },
      {
        icon: "🔥",
        title: "Encuentra los temas que explotan ahora",
        desc: "**Trending Topics** te muestra los videos con más vistas de los últimos 7 a 90 días en tu nicho. Haz clic en 'Crear' para producir tu versión inmediatamente.",
        links: [{ label: "Ver Trending →", href: "/trending" }],
      },
      {
        icon: "🖼️",
        title: "Mejora tus miniaturas",
        desc: "Sube tu miniatura actual a **Miniaturas IA** y recibe una puntuación de CTR del 0 al 100 con mejoras específicas: contraste, texto, emoción, composición.",
        links: [{ label: "Analizar Miniatura →", href: "/miniatura" }],
      },
      {
        icon: "🔔",
        title: "Configura alertas",
        desc: "En **Alertas** agrega las palabras clave de tu nicho. Cada vez que busques en ViralScope y encuentres un video viral que coincida, te notificamos automáticamente.",
        links: [{ label: "Crear Alerta →", href: "/alertas" }],
      },
    ],
  },
  {
    id: "producir",
    emoji: "🎬",
    title: "Producir más contenido, más rápido",
    steps: [
      {
        icon: "⚡",
        title: "El flujo completo en un clic",
        desc: "Busca un video viral en tu nicho → haz clic en **'+ Crear Contenido'** → en 5 pasos la IA te genera título, hook, guión, SEO y miniatura. Todo en menos de 10 minutos.",
        links: [{ label: "Empezar →", href: "/" }],
      },
      {
        icon: "📝",
        title: "Guiones con estructura científica",
        desc: "El **Generador de Guión** crea scripts con marcadores de producción: dónde cortar, qué emoción transmitir, cuándo hacer pausa. Los colores te guían durante la grabación.",
        links: [{ label: "Generar Guión →", href: "/guion" }],
        tip: "El guión incluye [CAMBIO DE CLIP], [EMOCIÓN: CURIOSIDAD], [DATO EN PANTALLA] y 10 marcadores más",
      },
      {
        icon: "📋",
        title: "Organiza tu producción",
        desc: "El **Kanban** es tu tablero de producción. Mueve cada video por: Ideas → Guión → Grabación → Edición → Programado → Publicado. Nunca pierdas el hilo de un video.",
        links: [{ label: "Abrir Kanban →", href: "/kanban" }],
      },
      {
        icon: "🎨",
        title: "Miniaturas profesionales sin diseñador",
        desc: "**Miniaturas IA** genera imágenes con DALL-E 3. **Dimension** crea prompts cinematográficos ultra-detallados. Y el **Face Swap** pone tu cara en cualquier miniatura con iluminación profesional.",
        links: [
          { label: "Miniaturas IA →", href: "/miniatura" },
          { label: "Dimension →", href: "/dimension" },
        ],
      },
    ],
  },
  {
    id: "investigar",
    emoji: "🔍",
    title: "Investigar nichos y competencia",
    steps: [
      {
        icon: "📈",
        title: "Encuentra nichos rentables",
        desc: "El **Buscador de Nichos** tiene 100 nichos curados con RPM estimado, nivel de saturación y si es viable hacerlo faceless. Los tabs TOP 100 Long y Short están ordenados por rentabilidad.",
        links: [{ label: "Ver Nichos →", href: "/nichos" }],
      },
      {
        icon: "⚡",
        title: "Analiza videos virales",
        desc: "**Outlier por Video**: pega cualquier URL de YouTube y obtén el kit completo de por qué ese video explotó, con la fórmula del título y 3 variaciones listas para usar.",
        links: [{ label: "Analizar Video →", href: "/outlier" }],
      },
      {
        icon: "🏆",
        title: "Estudia los mejores canales",
        desc: "**Top Channels** muestra los canales más grandes de cualquier nicho con datos reales: suscriptores, vistas, videos, crecimiento estimado. Haz clic en 'Emular' para copiar su estrategia.",
        links: [{ label: "Ver Top Channels →", href: "/top-channels" }],
      },
      {
        icon: "📺",
        title: "Analiza canales específicos",
        desc: "**Análisis de Canal**: escribe el nombre de cualquier canal y la IA lo disecciona: qué hace bien, su estrategia de contenido, y recomendaciones para que tú lo superes.",
        links: [{ label: "Analizar Canal →", href: "/canal" }],
      },
    ],
  },
];

const ALL_TOOLS = [
  { href: "/",            icon: Search,      label: "Buscador Viral" },
  { href: "/outlier",     icon: Zap,         label: "Outlier por Video" },
  { href: "/nichos",      icon: TrendingUp,  label: "Nichos Rentables" },
  { href: "/trending",    icon: Flame,       label: "Trending Topics" },
  { href: "/top-channels",icon: Trophy,      label: "Top Channels" },
  { href: "/canal",       icon: Tv2,         label: "Análisis de Canal" },
  { href: "/competencia", icon: Swords,      label: "Competencia" },
  { href: "/alertas",     icon: Bell,        label: "Alertas" },
  { href: "/dashboard",   icon: BarChart3,   label: "Mi Canal" },
  { href: "/titulos",     icon: Type,        label: "Títulos Virales" },
  { href: "/hooks",       icon: Mic,         label: "Banco de Hooks" },
  { href: "/miniatura",   icon: Image,       label: "Miniaturas IA" },
  { href: "/logo",        icon: Palette,     label: "Logo + Banner" },
  { href: "/branding",    icon: Sparkles,    label: "Branding con IA" },
  { href: "/dimension",   icon: Box,         label: "Dimension" },
  { href: "/guion",       icon: FileText,    label: "Generador de Guión" },
  { href: "/calendario",  icon: CalendarDays,label: "Calendario" },
  { href: "/plan",        icon: CalendarDays,label: "Plan 30 Videos" },
  { href: "/emular",      icon: Target,      label: "Emular Canal" },
  { href: "/calculadora", icon: Calculator,  label: "Calculadora" },
  { href: "/proyectos",   icon: FolderOpen,  label: "Mis Proyectos" },
  { href: "/crear-canal", icon: Wand2,       label: "Crear Canal con IA" },
  { href: "/kanban",      icon: Kanban,      label: "Kanban" },
];

// ── Helper: render bold markdown ──────────────────────────────────────────────

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="text-white font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function GuiaPage() {
  const [activeId, setActiveId] = useState<PathId | null>(null);

  const sectionRefs: Record<PathId, React.RefObject<HTMLDivElement | null>> = {
    cero:        useRef<HTMLDivElement>(null),
    crecer:      useRef<HTMLDivElement>(null),
    producir:    useRef<HTMLDivElement>(null),
    investigar:  useRef<HTMLDivElement>(null),
  };

  function selectPath(id: PathId) {
    setActiveId(id);
    const ref = sectionRefs[id];
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "#020b18" }}>
      <GlobalNav />

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-14">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight flex items-center justify-center gap-3">
            <BookOpen size={40} style={{ color: "#a78bfa" }} /> Guía de{" "}
            <span style={{
              background: "linear-gradient(135deg, #a78bfa, #f472b6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              ViralScope
            </span>
          </h1>
          <p className="text-white/50 max-w-xl mx-auto text-base">
            Todo lo que necesitas saber para dominar YouTube hispanohablante
          </p>
        </div>

        {/* ── Path selector ──────────────────────────────────────────────── */}
        <div>
          <p className="text-center text-sm text-white/40 mb-4 font-medium uppercase tracking-widest">
            ¿Cuál es tu objetivo?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PATHS.map((path) => {
              const isActive = activeId === path.id;
              return (
                <button
                  key={path.id}
                  onClick={() => selectPath(path.id)}
                  className="flex flex-col items-center gap-2 p-5 rounded-2xl text-center transition-all duration-200 hover:-translate-y-0.5 focus:outline-none"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.2))"
                      : "rgba(255,255,255,0.04)",
                    border: isActive
                      ? "1.5px solid rgba(139,92,246,0.7)"
                      : "1px solid rgba(255,255,255,0.09)",
                    boxShadow: isActive
                      ? "0 0 24px rgba(139,92,246,0.25), inset 0 0 0 1px rgba(255,255,255,0.05)"
                      : "none",
                  }}
                >
                  <path.icon size={28} style={{ color: "#a78bfa" }} />
                  <span
                    className="text-sm font-semibold leading-snug"
                    style={{ color: isActive ? "#e9d5ff" : "rgba(255,255,255,0.65)" }}
                  >
                    {path.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sections ───────────────────────────────────────────────────── */}
        {SECTIONS.map((section) => {
          const isHighlighted = activeId === section.id;
          return (
            <div
              key={section.id}
              ref={sectionRefs[section.id]}
              className="rounded-3xl p-6 sm:p-8 space-y-6 transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: isHighlighted
                  ? "1.5px solid rgba(139,92,246,0.55)"
                  : "1px solid rgba(255,255,255,0.07)",
                boxShadow: isHighlighted
                  ? "0 0 40px rgba(139,92,246,0.15)"
                  : "none",
              }}
            >
              {/* Section header */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {section.title}
                </h2>
                <div
                  className="h-0.5 w-16 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
                  }}
                />
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {section.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-2xl p-5"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {/* Step number */}
                    <div
                      className="absolute top-4 left-5 text-5xl font-black leading-none select-none pointer-events-none"
                      style={{
                        background: "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.12))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        lineHeight: 1,
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div className="pl-10 space-y-3">
                      {/* Icon + title */}
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{step.title}</h3>
                      </div>

                      {/* Description */}
                      <p className="text-white/55 text-sm leading-relaxed">
                        <RichText text={step.desc} />
                      </p>

                      {/* Link buttons */}
                      <div className="flex flex-wrap gap-2">
                        {step.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5"
                            style={{
                              background: "rgba(139,92,246,0.12)",
                              border: "1px solid rgba(139,92,246,0.3)",
                              color: "#c4b5fd",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.25)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.12)";
                            }}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>

                      {/* Tip */}
                      {step.tip && (
                        <div
                          className="rounded-xl p-3 text-sm"
                          style={{
                            background: "rgba(245,158,11,0.08)",
                            border: "1px solid rgba(245,158,11,0.25)",
                            color: "#fcd34d",
                          }}
                        >
                          {step.tip}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* ── Quick access grid ──────────────────────────────────────────── */}
        <div className="space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2"><Zap size={20} style={{ color: "#a78bfa" }} /> Atajos rápidos</h2>
            <p className="text-white/40 text-sm">Todas las herramientas de ViralScope</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {ALL_TOOLS.map((tool) => (
              <Link
                key={tool.href + tool.label}
                href={tool.href}
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl transition-all hover:-translate-y-0.5 group"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.1)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                }}
              >
                <tool.icon size={16} style={{ color: "#a78bfa" }} className="flex-shrink-0" />
                <span className="text-sm font-medium text-white/65 group-hover:text-white transition-colors truncate">
                  {tool.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
