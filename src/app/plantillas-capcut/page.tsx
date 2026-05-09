"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Search,
  Film,
  Sparkles,
  TrendingUp,
  Gamepad2,
  Heart,
  BookOpen,
  Utensils,
  Dumbbell,
  Music,
  DollarSign,
  Briefcase,
  Palette,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────── */

interface CapCutTemplate {
  name: string;
  description: string;
  style: string;
  searchTerm: string;
  tags: string[];
}

interface NichoSection {
  nicho: string;
  icon: React.ReactNode;
  color: string;
  templates: CapCutTemplate[];
}

/* ── Data ──────────────────────────────────────────────────────────────── */

const NICHOS: NichoSection[] = [
  {
    nicho: "Finanzas & Negocios",
    icon: <DollarSign size={18} />,
    color: "#22c55e",
    templates: [
      { name: "Dato Financiero Impactante", description: "Texto grande con números animados, fondo oscuro premium", style: "Informativo / Educativo", searchTerm: "finance data numbers animated", tags: ["finanzas", "datos", "educativo"] },
      { name: "Antes vs Después (Dinero)", description: "Split screen comparando situaciones financieras", style: "Comparativo", searchTerm: "before after split screen money", tags: ["finanzas", "comparación", "motivación"] },
      { name: "Top 5 Inversiones", description: "Lista animada con transiciones suaves y gráficos", style: "Listicle", searchTerm: "top 5 list animated", tags: ["finanzas", "lista", "inversiones"] },
      { name: "Storytelling Emprendedor", description: "Narración con fotos/video + subtítulos cinematic", style: "Narrativo", searchTerm: "business storytelling cinematic", tags: ["negocios", "storytelling", "motivación"] },
    ],
  },
  {
    nicho: "Gaming & Tech",
    icon: <Gamepad2 size={18} />,
    color: "#8b5cf6",
    templates: [
      { name: "Gameplay Highlights", description: "Cortes rápidos de mejores jugadas con zoom dinámico", style: "Action / Fast-paced", searchTerm: "gameplay highlights gaming", tags: ["gaming", "highlights", "acción"] },
      { name: "Review de Producto Tech", description: "Unboxing estilo minimalista con texto limpio", style: "Review / Unboxing", searchTerm: "unboxing review tech product", tags: ["tech", "review", "unboxing"] },
      { name: "Tutorial Setup Gaming", description: "Tour del setup con transiciones suaves y overlay", style: "Tutorial / Tour", searchTerm: "gaming setup tour", tags: ["gaming", "setup", "tutorial"] },
      { name: "Noticias Tech Flash", description: "Estilo noticiero rápido con lower thirds animados", style: "Noticias", searchTerm: "news flash lower third", tags: ["tech", "noticias", "rápido"] },
    ],
  },
  {
    nicho: "Salud & Fitness",
    icon: <Dumbbell size={18} />,
    color: "#ef4444",
    templates: [
      { name: "Rutina de Ejercicios", description: "Split en secciones con timer y nombre del ejercicio", style: "Tutorial / Rutina", searchTerm: "workout routine fitness timer", tags: ["fitness", "rutina", "ejercicio"] },
      { name: "Transformación Física", description: "Before/After con transición dramática y música épica", style: "Transformación", searchTerm: "fitness transformation before after", tags: ["fitness", "transformación", "motivación"] },
      { name: "Receta Saludable", description: "Overhead shot con ingredientes apareciendo + pasos", style: "Receta", searchTerm: "healthy recipe food", tags: ["salud", "receta", "comida"] },
      { name: "Tips de Nutrición", description: "Cards animadas con datos nutricionales y consejos", style: "Educativo", searchTerm: "nutrition tips health", tags: ["salud", "nutrición", "tips"] },
    ],
  },
  {
    nicho: "Cocina & Recetas",
    icon: <Utensils size={18} />,
    color: "#f59e0b",
    templates: [
      { name: "Receta Paso a Paso", description: "Vista cenital con ingredientes y pasos numerados", style: "Tutorial", searchTerm: "cooking recipe step by step", tags: ["cocina", "receta", "tutorial"] },
      { name: "Receta Rápida 60s", description: "Cortes veloces estilo Tasty con texto overlay", style: "Short / Rápido", searchTerm: "quick recipe food short", tags: ["cocina", "short", "rápido"] },
      { name: "Mukbang / Food Review", description: "Close-ups de comida con ASMR y reacción", style: "Review / ASMR", searchTerm: "mukbang food review asmr", tags: ["cocina", "mukbang", "review"] },
      { name: "Comparación de Recetas", description: "Side by side de dos versiones del mismo plato", style: "Comparativo", searchTerm: "food comparison side by side", tags: ["cocina", "comparación"] },
    ],
  },
  {
    nicho: "Educación & Cultura",
    icon: <BookOpen size={18} />,
    color: "#3b82f6",
    templates: [
      { name: "Dato Curioso Animado", description: "Texto grande con ilustraciones y transiciones pop", style: "Educativo / Viral", searchTerm: "fun fact education animated", tags: ["educación", "datos", "viral"] },
      { name: "Explicación con Pizarra", description: "Estilo whiteboard con dibujos apareciendo", style: "Explicativo", searchTerm: "whiteboard explainer animation", tags: ["educación", "explicación", "pizarra"] },
      { name: "Historia en 60 Segundos", description: "Narración con imágenes históricas y subtítulos", style: "Narrativo / Short", searchTerm: "history story short narration", tags: ["educación", "historia", "narrativo"] },
      { name: "Quiz Interactivo", description: "Pregunta → pausa → respuesta con efectos", style: "Interactivo", searchTerm: "quiz interactive question answer", tags: ["educación", "quiz", "interactivo"] },
    ],
  },
  {
    nicho: "Lifestyle & Vlogs",
    icon: <Heart size={18} />,
    color: "#ec4899",
    templates: [
      { name: "Day in My Life", description: "Montaje aesthetic con filtro cálido y música lofi", style: "Vlog / Aesthetic", searchTerm: "day in my life vlog aesthetic", tags: ["lifestyle", "vlog", "aesthetic"] },
      { name: "Get Ready With Me", description: "Secuencia de preparación con transiciones suaves", style: "GRWM", searchTerm: "get ready with me grwm", tags: ["lifestyle", "grwm", "belleza"] },
      { name: "Travel Montage", description: "Clips de viaje con map overlay y cinematic bars", style: "Travel / Cinematic", searchTerm: "travel montage cinematic vlog", tags: ["lifestyle", "viaje", "cinematic"] },
      { name: "Room Tour / Makeover", description: "Before/after de espacio con transición reveal", style: "Tour / Transformación", searchTerm: "room tour makeover before after", tags: ["lifestyle", "room", "makeover"] },
    ],
  },
  {
    nicho: "Música & Entretenimiento",
    icon: <Music size={18} />,
    color: "#a855f7",
    templates: [
      { name: "Lyric Video Animado", description: "Letras apareciendo con ritmo y efectos de glow", style: "Lyric Video", searchTerm: "lyric video music animated", tags: ["música", "lyrics", "animación"] },
      { name: "Reacción a Música", description: "Picture-in-picture con waveform y comentarios", style: "Reacción", searchTerm: "music reaction pip video", tags: ["música", "reacción", "pip"] },
      { name: "Beat Sync Edit", description: "Cortes sincronizados al beat con flash transitions", style: "Edit / Sync", searchTerm: "beat sync edit transitions", tags: ["música", "beat", "edit"] },
      { name: "Playlist Visual", description: "Carrusel de canciones con artwork y datos", style: "Playlist / Estático", searchTerm: "playlist music visual", tags: ["música", "playlist", "visual"] },
    ],
  },
  {
    nicho: "Motivación & Desarrollo",
    icon: <TrendingUp size={18} />,
    color: "#14b8a6",
    templates: [
      { name: "Cita Motivacional", description: "Frase con fondo cinematic y tipografía bold", style: "Motivacional", searchTerm: "motivational quote cinematic", tags: ["motivación", "citas", "inspiración"] },
      { name: "Historia de Éxito", description: "Narración tipo documental con fotos y datos", style: "Documental / Bio", searchTerm: "success story documentary", tags: ["motivación", "éxito", "historia"] },
      { name: "Hábitos Diarios", description: "Checklist animado con iconos y progreso", style: "Productividad", searchTerm: "daily habits checklist productivity", tags: ["motivación", "hábitos", "productividad"] },
      { name: "Mentalidad Ganadora", description: "Clips de acción + voz en off + subtítulos bold", style: "Motivacional / Intenso", searchTerm: "motivation mindset intense", tags: ["motivación", "mentalidad", "intenso"] },
    ],
  },
  {
    nicho: "Freelance & Creativos",
    icon: <Palette size={18} />,
    color: "#f97316",
    templates: [
      { name: "Portfolio Showcase", description: "Galería de trabajos con transiciones elegantes", style: "Portfolio", searchTerm: "portfolio showcase design", tags: ["freelance", "portfolio", "diseño"] },
      { name: "Speed Art / Timelapse", description: "Proceso creativo acelerado con música ambient", style: "Timelapse", searchTerm: "speed art timelapse creative", tags: ["freelance", "arte", "timelapse"] },
      { name: "Client Testimonial", description: "Testimonio con nombre, cargo y logo animado", style: "Testimonial", searchTerm: "client testimonial review", tags: ["freelance", "testimonio", "cliente"] },
      { name: "Tips de Diseño", description: "Do vs Don't con ejemplos visuales side by side", style: "Educativo / Comparativo", searchTerm: "design tips do dont comparison", tags: ["freelance", "diseño", "tips"] },
    ],
  },
  {
    nicho: "Negocios & Marketing",
    icon: <Briefcase size={18} />,
    color: "#6366f1",
    templates: [
      { name: "Caso de Estudio", description: "Datos + gráficos + resultado con estilo corporativo", style: "Caso de Estudio", searchTerm: "case study business corporate", tags: ["negocios", "caso", "marketing"] },
      { name: "Producto / Servicio Promo", description: "Presentación de producto con features animadas", style: "Promocional", searchTerm: "product promo marketing animated", tags: ["negocios", "producto", "promo"] },
      { name: "Behind the Scenes", description: "Día en la empresa con estilo casual y real", style: "BTS / Autenticidad", searchTerm: "behind the scenes office bts", tags: ["negocios", "bts", "empresa"] },
      { name: "Estadísticas Animadas", description: "Números que crecen con gráficos de barras/líneas", style: "Datos / Infografía", searchTerm: "statistics infographic data animated", tags: ["negocios", "estadísticas", "datos"] },
    ],
  },
];

/* ── Component ─────────────────────────────────────────────────────────── */

function resolveNichoFromURL(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const nichoParam = params.get("nicho");
  if (!nichoParam) return null;
  const match = NICHOS.find((n) =>
    n.nicho.toLowerCase().startsWith(nichoParam.toLowerCase())
  );
  return match ? match.nicho : null;
}

export default function PlantillasCapCutPage() {
  const [search, setSearch] = useState("");
  const [selectedNicho, setSelectedNicho] = useState<string | null>(resolveNichoFromURL);

  const filtered = NICHOS.filter((n) => {
    if (selectedNicho && n.nicho !== selectedNicho) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      n.nicho.toLowerCase().includes(q) ||
      n.templates.some(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q))
      )
    );
  });

  const totalTemplates = NICHOS.reduce((a, n) => a + n.templates.length, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Film size={20} className="text-violet-400" />
              Plantillas CapCut
            </h1>
            <p className="text-xs text-slate-400">
              {totalTemplates} plantillas organizadas por nicho
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Buscar plantilla, estilo o nicho..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedNicho(null)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                !selectedNicho
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              Todos
            </button>
            {NICHOS.map((n) => (
              <button
                key={n.nicho}
                onClick={() =>
                  setSelectedNicho(selectedNicho === n.nicho ? null : n.nicho)
                }
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  selectedNicho === n.nicho
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800/60 text-slate-400 hover:text-white"
                }`}
              >
                {n.nicho.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-violet-900/30 to-pink-900/30 border border-violet-700/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-violet-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-violet-300">
                ¿Cómo usar estas plantillas?
              </p>
              <p className="text-xs text-slate-400 mt-1">
                1. Elige la plantilla que mejor se ajuste a tu nicho y estilo.{" "}
                2. Haz clic en &quot;Abrir en CapCut&quot; para ir directo a la plantilla.{" "}
                3. Personaliza con tu contenido (texto, fotos, clips).{" "}
                4. Exporta y sube a YouTube.
              </p>
            </div>
          </div>
        </div>

        {/* Nichos Grid */}
        {filtered.map((nicho) => (
          <section key={nicho.nicho}>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: nicho.color }}>{nicho.icon}</span>
              <h2 className="text-base font-bold">{nicho.nicho}</h2>
              <span className="text-xs text-slate-500 ml-1">
                {nicho.templates.length} plantillas
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {nicho.templates
                .filter((t) => {
                  if (!search.trim()) return true;
                  const q = search.toLowerCase();
                  return (
                    t.name.toLowerCase().includes(q) ||
                    t.tags.some((tag) => tag.includes(q))
                  );
                })
                .map((template) => (
                  <div
                    key={template.name}
                    className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4 hover:border-violet-500/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
                        {template.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: `${nicho.color}20`,
                          color: nicho.color,
                        }}
                      >
                        {template.style}
                      </span>
                      <a
                        href="https://www.capcut.com/templates"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        Abrir CapCut
                        <ExternalLink size={11} />
                      </a>
                    </div>
                    {/* Search term to copy */}
                    <div className="flex items-center gap-1.5 bg-slate-800/60 rounded-lg px-2 py-1.5 group/copy cursor-pointer"
                      onClick={() => navigator.clipboard.writeText(template.searchTerm)}
                      title="Copiar término de búsqueda"
                    >
                      <Search size={10} className="text-slate-500 flex-shrink-0" />
                      <span className="text-[10px] text-slate-400 font-mono flex-1 truncate">{template.searchTerm}</span>
                      <span className="text-[9px] text-violet-400 opacity-0 group-hover/copy:opacity-100 transition-opacity flex-shrink-0">copiar</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-500"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Film size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              No se encontraron plantillas para &quot;{search}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
