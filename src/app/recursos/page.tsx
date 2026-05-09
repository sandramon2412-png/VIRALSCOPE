"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Music,
  Type,
  Palette,
  Volume2,
  ExternalLink,
  Package,
  Sparkles,
  DollarSign,
  Gamepad2,
  Heart,
  BookOpen,
  Utensils,
  Dumbbell,
  TrendingUp,
  Briefcase,
  Camera,
  Film,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────── */

interface Resource {
  name: string;
  description: string;
  url: string;
  free: boolean;
}

interface ResourceCategory {
  category: string;
  icon: React.ReactNode;
  items: Resource[];
}

interface NichoPack {
  nicho: string;
  icon: React.ReactNode;
  color: string;
  colorPalette: string[];
  resources: ResourceCategory[];
}

/* ── Data ──────────────────────────────────────────────────────────────── */

const PACKS: NichoPack[] = [
  {
    nicho: "Finanzas & Negocios",
    icon: <DollarSign size={18} />,
    color: "#22c55e",
    colorPalette: ["#0F172A", "#1E293B", "#22C55E", "#F59E0B", "#FFFFFF"],
    resources: [
      {
        category: "Música",
        icon: <Music size={14} />,
        items: [
          { name: "Corporate Inspirational", description: "Música corporativa motivacional — perfecta para videos de negocios", url: "https://pixabay.com/music/search/corporate/", free: true },
          { name: "Ambient Focus", description: "Fondos ambient para narración de datos financieros", url: "https://pixabay.com/music/search/ambient%20corporate/", free: true },
          { name: "Epidemic Sound - Business", description: "Biblioteca premium de música para negocios", url: "https://www.epidemicsound.com/music/genres/corporate/", free: false },
        ],
      },
      {
        category: "Fuentes",
        icon: <Type size={14} />,
        items: [
          { name: "Space Grotesk", description: "Moderna y profesional, ideal para números y datos", url: "https://fonts.google.com/specimen/Space+Grotesk", free: true },
          { name: "Inter", description: "Ultra legible, perfecta para subtítulos y UI", url: "https://fonts.google.com/specimen/Inter", free: true },
          { name: "Playfair Display", description: "Elegante serif para títulos premium", url: "https://fonts.google.com/specimen/Playfair+Display", free: true },
        ],
      },
      {
        category: "Efectos de Sonido",
        icon: <Volume2 size={14} />,
        items: [
          { name: "Cash Register / Coins", description: "Sonido de dinero para transiciones de cifras", url: "https://pixabay.com/sound-effects/search/cash/", free: true },
          { name: "Notification Dings", description: "Alertas sutiles para resaltar datos", url: "https://pixabay.com/sound-effects/search/notification/", free: true },
          { name: "Whoosh Transitions", description: "Swoosh profesionales para cambios de escena", url: "https://pixabay.com/sound-effects/search/whoosh/", free: true },
        ],
      },
    ],
  },
  {
    nicho: "Gaming & Tech",
    icon: <Gamepad2 size={18} />,
    color: "#8b5cf6",
    colorPalette: ["#0A0A1A", "#1A1A3E", "#8B5CF6", "#06B6D4", "#F43F5E"],
    resources: [
      {
        category: "Música",
        icon: <Music size={14} />,
        items: [
          { name: "Electronic / EDM", description: "Beats energéticos para gameplays y highlights", url: "https://pixabay.com/music/search/electronic%20gaming/", free: true },
          { name: "Synthwave / Retro", description: "Estilo retro futurista para intros y montajes", url: "https://pixabay.com/music/search/synthwave/", free: true },
          { name: "Lo-fi Hip Hop", description: "Fondo relajado para reviews y unboxings", url: "https://pixabay.com/music/search/lofi/", free: true },
        ],
      },
      {
        category: "Fuentes",
        icon: <Type size={14} />,
        items: [
          { name: "Rajdhani", description: "Futurista y técnica, ideal para overlays de gaming", url: "https://fonts.google.com/specimen/Rajdhani", free: true },
          { name: "Orbitron", description: "Sci-fi geométrica para títulos de tech", url: "https://fonts.google.com/specimen/Orbitron", free: true },
          { name: "JetBrains Mono", description: "Monoespaciada perfecta para código y stats", url: "https://fonts.google.com/specimen/JetBrains+Mono", free: true },
        ],
      },
      {
        category: "Efectos de Sonido",
        icon: <Volume2 size={14} />,
        items: [
          { name: "8-bit / Retro SFX", description: "Sonidos retro para puntuaciones y achievements", url: "https://pixabay.com/sound-effects/search/8bit/", free: true },
          { name: "Glitch / Digital", description: "Efectos glitch para transiciones tech", url: "https://pixabay.com/sound-effects/search/glitch/", free: true },
          { name: "Explosions / Impact", description: "Impactos para highlights de gameplay", url: "https://pixabay.com/sound-effects/search/explosion/", free: true },
        ],
      },
    ],
  },
  {
    nicho: "Salud & Fitness",
    icon: <Dumbbell size={18} />,
    color: "#ef4444",
    colorPalette: ["#18181B", "#27272A", "#EF4444", "#F97316", "#FAFAFA"],
    resources: [
      {
        category: "Música",
        icon: <Music size={14} />,
        items: [
          { name: "Workout Motivation", description: "Música energética para rutinas de ejercicio", url: "https://pixabay.com/music/search/workout/", free: true },
          { name: "Calm Wellness", description: "Ambient relajante para contenido de salud mental", url: "https://pixabay.com/music/search/wellness%20calm/", free: true },
          { name: "Hip Hop Beats", description: "Beats urbanos para transformaciones y montajes", url: "https://pixabay.com/music/search/hip%20hop%20motivation/", free: true },
        ],
      },
      {
        category: "Fuentes",
        icon: <Type size={14} />,
        items: [
          { name: "Bebas Neue", description: "Bold condensada, perfecta para títulos de fitness", url: "https://fonts.google.com/specimen/Bebas+Neue", free: true },
          { name: "Oswald", description: "Fuerte y deportiva para overlays de ejercicios", url: "https://fonts.google.com/specimen/Oswald", free: true },
          { name: "Quicksand", description: "Amigable y limpia para tips de salud", url: "https://fonts.google.com/specimen/Quicksand", free: true },
        ],
      },
      {
        category: "Efectos de Sonido",
        icon: <Volume2 size={14} />,
        items: [
          { name: "Timer Beeps", description: "Sonidos de cuenta regresiva para rutinas", url: "https://pixabay.com/sound-effects/search/timer%20beep/", free: true },
          { name: "Heartbeat", description: "Latidos para transiciones dramáticas", url: "https://pixabay.com/sound-effects/search/heartbeat/", free: true },
          { name: "Achievement / Level Up", description: "Sonidos de logro para metas fitness", url: "https://pixabay.com/sound-effects/search/achievement/", free: true },
        ],
      },
    ],
  },
  {
    nicho: "Cocina & Recetas",
    icon: <Utensils size={18} />,
    color: "#f59e0b",
    colorPalette: ["#1C1917", "#292524", "#F59E0B", "#EA580C", "#FEF3C7"],
    resources: [
      {
        category: "Música",
        icon: <Music size={14} />,
        items: [
          { name: "Acoustic Happy", description: "Guitarra acústica alegre estilo Tasty / Bon Appétit", url: "https://pixabay.com/music/search/acoustic%20happy/", free: true },
          { name: "Jazz Café", description: "Jazz suave para recetas gourmet y restaurant style", url: "https://pixabay.com/music/search/jazz%20cafe/", free: true },
          { name: "Latin Kitchen", description: "Ritmos latinos para recetas tradicionales", url: "https://pixabay.com/music/search/latin%20acoustic/", free: true },
        ],
      },
      {
        category: "Fuentes",
        icon: <Type size={14} />,
        items: [
          { name: "Poppins", description: "Limpia y moderna, ideal para listados de ingredientes", url: "https://fonts.google.com/specimen/Poppins", free: true },
          { name: "Pacifico", description: "Script casual para títulos de recetas", url: "https://fonts.google.com/specimen/Pacifico", free: true },
          { name: "Lora", description: "Serif elegante para recetas gourmet", url: "https://fonts.google.com/specimen/Lora", free: true },
        ],
      },
      {
        category: "Efectos de Sonido",
        icon: <Volume2 size={14} />,
        items: [
          { name: "Sizzling / Frying", description: "Sonidos ASMR de cocina (sartén, aceite)", url: "https://pixabay.com/sound-effects/search/sizzle/", free: true },
          { name: "Chopping / Cutting", description: "Sonido de cuchillo cortando para montajes", url: "https://pixabay.com/sound-effects/search/chopping/", free: true },
          { name: "Pouring / Liquid", description: "Sonidos de vertido para salsas y bebidas", url: "https://pixabay.com/sound-effects/search/pouring/", free: true },
        ],
      },
    ],
  },
  {
    nicho: "Educación & Cultura",
    icon: <BookOpen size={18} />,
    color: "#3b82f6",
    colorPalette: ["#0F172A", "#1E3A5F", "#3B82F6", "#60A5FA", "#F8FAFC"],
    resources: [
      {
        category: "Música",
        icon: <Music size={14} />,
        items: [
          { name: "Inspiring Piano", description: "Piano inspiracional para documentales y explicaciones", url: "https://pixabay.com/music/search/inspiring%20piano/", free: true },
          { name: "Science / Discovery", description: "Música de descubrimiento estilo National Geographic", url: "https://pixabay.com/music/search/science%20discovery/", free: true },
          { name: "Minimal Background", description: "Fondo minimalista que no distrae de la narración", url: "https://pixabay.com/music/search/minimal%20background/", free: true },
        ],
      },
      {
        category: "Fuentes",
        icon: <Type size={14} />,
        items: [
          { name: "Merriweather", description: "Serif académica, excelente legibilidad", url: "https://fonts.google.com/specimen/Merriweather", free: true },
          { name: "Source Sans 3", description: "Sans-serif profesional para infografías", url: "https://fonts.google.com/specimen/Source+Sans+3", free: true },
          { name: "Caveat", description: "Estilo manuscrito para anotaciones y diagramas", url: "https://fonts.google.com/specimen/Caveat", free: true },
        ],
      },
      {
        category: "Efectos de Sonido",
        icon: <Volume2 size={14} />,
        items: [
          { name: "Page Turn", description: "Sonido de pasar página para transiciones educativas", url: "https://pixabay.com/sound-effects/search/page%20turn/", free: true },
          { name: "Pop / Appear", description: "Sonidos pop para aparición de datos y gráficos", url: "https://pixabay.com/sound-effects/search/pop/", free: true },
          { name: "Writing / Scribble", description: "Sonido de escritura para pizarra y anotaciones", url: "https://pixabay.com/sound-effects/search/writing/", free: true },
        ],
      },
    ],
  },
  {
    nicho: "Lifestyle & Vlogs",
    icon: <Heart size={18} />,
    color: "#ec4899",
    colorPalette: ["#FDF2F8", "#FCE7F3", "#EC4899", "#A855F7", "#1E1B2E"],
    resources: [
      {
        category: "Música",
        icon: <Music size={14} />,
        items: [
          { name: "Indie / Acoustic Feel Good", description: "Guitarra indie para vlogs cotidianos", url: "https://pixabay.com/music/search/indie%20vlog/", free: true },
          { name: "Lo-fi Chill", description: "Lo-fi beats relajados para day-in-my-life", url: "https://pixabay.com/music/search/lofi%20chill/", free: true },
          { name: "Tropical Pop", description: "Pop tropical para vlogs de viaje y verano", url: "https://pixabay.com/music/search/tropical%20pop/", free: true },
        ],
      },
      {
        category: "Fuentes",
        icon: <Type size={14} />,
        items: [
          { name: "DM Sans", description: "Moderna y aesthetic para subtítulos de vlog", url: "https://fonts.google.com/specimen/DM+Sans", free: true },
          { name: "Sacramento", description: "Script elegante para títulos aesthetic", url: "https://fonts.google.com/specimen/Sacramento", free: true },
          { name: "Nunito", description: "Redondeada y amigable para contenido lifestyle", url: "https://fonts.google.com/specimen/Nunito", free: true },
        ],
      },
      {
        category: "Efectos de Sonido",
        icon: <Volume2 size={14} />,
        items: [
          { name: "Camera Shutter", description: "Click de cámara para transiciones de foto", url: "https://pixabay.com/sound-effects/search/camera%20shutter/", free: true },
          { name: "Soft Transitions", description: "Transiciones suaves y airy para vlogs", url: "https://pixabay.com/sound-effects/search/soft%20transition/", free: true },
          { name: "Nature Ambience", description: "Ambiente natural (pájaros, viento, agua)", url: "https://pixabay.com/sound-effects/search/nature%20ambience/", free: true },
        ],
      },
    ],
  },
  {
    nicho: "Motivación & Desarrollo",
    icon: <TrendingUp size={18} />,
    color: "#14b8a6",
    colorPalette: ["#042F2E", "#134E4A", "#14B8A6", "#FCD34D", "#F0FDF4"],
    resources: [
      {
        category: "Música",
        icon: <Music size={14} />,
        items: [
          { name: "Epic Cinematic", description: "Orquestal épica para storytelling motivacional", url: "https://pixabay.com/music/search/epic%20cinematic/", free: true },
          { name: "Motivational Corporate", description: "Build-up inspiracional con drums y piano", url: "https://pixabay.com/music/search/motivational/", free: true },
          { name: "Dark Ambient Tension", description: "Tensión para momentos de struggle/challenge", url: "https://pixabay.com/music/search/dark%20tension/", free: true },
        ],
      },
      {
        category: "Fuentes",
        icon: <Type size={14} />,
        items: [
          { name: "Montserrat", description: "Bold y poderosa para frases motivacionales", url: "https://fonts.google.com/specimen/Montserrat", free: true },
          { name: "Anton", description: "Impact pesado para títulos que gritan", url: "https://fonts.google.com/specimen/Anton", free: true },
          { name: "Raleway", description: "Elegante y aspiracional para contenido premium", url: "https://fonts.google.com/specimen/Raleway", free: true },
        ],
      },
      {
        category: "Efectos de Sonido",
        icon: <Volume2 size={14} />,
        items: [
          { name: "Cinematic Boom / Hit", description: "Impacto dramático para frases clave", url: "https://pixabay.com/sound-effects/search/cinematic%20boom/", free: true },
          { name: "Riser / Build Up", description: "Tensión creciente para revelaciones", url: "https://pixabay.com/sound-effects/search/riser/", free: true },
          { name: "Crowd Cheering", description: "Audiencia celebrando para momentos de logro", url: "https://pixabay.com/sound-effects/search/crowd%20cheering/", free: true },
        ],
      },
    ],
  },
  {
    nicho: "Freelance & Marketing",
    icon: <Briefcase size={18} />,
    color: "#6366f1",
    colorPalette: ["#020617", "#1E1B4B", "#6366F1", "#818CF8", "#E0E7FF"],
    resources: [
      {
        category: "Música",
        icon: <Music size={14} />,
        items: [
          { name: "Modern Corporate", description: "Música corporativa moderna y no aburrida", url: "https://pixabay.com/music/search/modern%20corporate/", free: true },
          { name: "Tech Innovation", description: "Sonido tecnológico para demos de producto", url: "https://pixabay.com/music/search/technology%20innovation/", free: true },
          { name: "Upbeat Marketing", description: "Energía positiva para videos promocionales", url: "https://pixabay.com/music/search/upbeat%20marketing/", free: true },
        ],
      },
      {
        category: "Fuentes",
        icon: <Type size={14} />,
        items: [
          { name: "Plus Jakarta Sans", description: "Moderna y sofisticada para SaaS y tech", url: "https://fonts.google.com/specimen/Plus+Jakarta+Sans", free: true },
          { name: "Sora", description: "Geométrica moderna ideal para presentaciones", url: "https://fonts.google.com/specimen/Sora", free: true },
          { name: "Libre Baskerville", description: "Serif clásica para contenido de autoridad", url: "https://fonts.google.com/specimen/Libre+Baskerville", free: true },
        ],
      },
      {
        category: "Efectos de Sonido",
        icon: <Volume2 size={14} />,
        items: [
          { name: "Interface / UI Sounds", description: "Clicks y sonidos de interfaz para demos", url: "https://pixabay.com/sound-effects/search/interface/", free: true },
          { name: "Success / Complete", description: "Sonidos de éxito para checkmarks y logros", url: "https://pixabay.com/sound-effects/search/success/", free: true },
          { name: "Subtle Transitions", description: "Transiciones profesionales y limpias", url: "https://pixabay.com/sound-effects/search/transition/", free: true },
        ],
      },
    ],
  },
  {
    nicho: "Música & Entretenimiento",
    icon: <Music size={18} />,
    color: "#a855f7",
    colorPalette: ["#0A0014", "#1A0033", "#A855F7", "#E879F9", "#F5D0FE"],
    resources: [
      {
        category: "Música",
        icon: <Music size={14} />,
        items: [
          { name: "Cinematic Orchestra", description: "Orquestal dramática para reacciones y análisis musical", url: "https://pixabay.com/music/search/cinematic%20orchestra/", free: true },
          { name: "Lo-fi Beats", description: "Fondos relajados para rankings y listas", url: "https://pixabay.com/music/search/lofi%20beats/", free: true },
          { name: "Funk / Groove", description: "Ritmos groovy para contenido de entretenimiento", url: "https://pixabay.com/music/search/funk%20groove/", free: true },
        ],
      },
      {
        category: "Fuentes",
        icon: <Type size={14} />,
        items: [
          { name: "Righteous", description: "Retro bold, perfecta para títulos musicales", url: "https://fonts.google.com/specimen/Righteous", free: true },
          { name: "Rubik", description: "Moderna y versátil para overlays y listas", url: "https://fonts.google.com/specimen/Rubik", free: true },
          { name: "Press Start 2P", description: "Pixel art para rankings y contenido retro", url: "https://fonts.google.com/specimen/Press+Start+2P", free: true },
        ],
      },
      {
        category: "Efectos de Sonido",
        icon: <Volume2 size={14} />,
        items: [
          { name: "Drum Roll", description: "Redoble de tambor para reveals y rankings", url: "https://pixabay.com/sound-effects/search/drum%20roll/", free: true },
          { name: "Vinyl Scratch", description: "Scratch de vinilo para transiciones musicales", url: "https://pixabay.com/sound-effects/search/vinyl%20scratch/", free: true },
          { name: "Applause", description: "Aplausos para momentos de celebración", url: "https://pixabay.com/sound-effects/search/applause/", free: true },
        ],
      },
    ],
  },
  {
    nicho: "Negocios & Marketing",
    icon: <Briefcase size={18} />,
    color: "#6366f1",
    colorPalette: ["#020617", "#1E1B4B", "#6366F1", "#10B981", "#F0FDF4"],
    resources: [
      {
        category: "Música",
        icon: <Music size={14} />,
        items: [
          { name: "Corporate Presentation", description: "Música profesional para casos de estudio", url: "https://pixabay.com/music/search/corporate%20presentation/", free: true },
          { name: "Startup Energy", description: "Música energética y optimista para promos", url: "https://pixabay.com/music/search/startup%20energy/", free: true },
          { name: "Ambient Business", description: "Fondo sutil para webinars y tutoriales", url: "https://pixabay.com/music/search/ambient%20business/", free: true },
        ],
      },
      {
        category: "Fuentes",
        icon: <Type size={14} />,
        items: [
          { name: "Lexend", description: "Diseñada para máxima legibilidad en presentaciones", url: "https://fonts.google.com/specimen/Lexend", free: true },
          { name: "DM Serif Display", description: "Serif elegante para títulos de autoridad", url: "https://fonts.google.com/specimen/DM+Serif+Display", free: true },
          { name: "Work Sans", description: "Limpia y profesional para datos y estadísticas", url: "https://fonts.google.com/specimen/Work+Sans", free: true },
        ],
      },
      {
        category: "Efectos de Sonido",
        icon: <Volume2 size={14} />,
        items: [
          { name: "Cash Register", description: "Sonido de caja registradora para resultados de ventas", url: "https://pixabay.com/sound-effects/search/cash%20register/", free: true },
          { name: "Presentation Click", description: "Click sutil para transiciones de slides", url: "https://pixabay.com/sound-effects/search/click/", free: true },
          { name: "Achievement Bell", description: "Campana de logro para métricas y KPIs", url: "https://pixabay.com/sound-effects/search/achievement%20bell/", free: true },
        ],
      },
    ],
  },
];

/* ── Component ─────────────────────────────────────────────────────────── */

export default function RecursosPage() {
  const [search, setSearch] = useState("");
  const [selectedNicho, setSelectedNicho] = useState<string | null>(null);

  const filtered = PACKS.filter((p) => {
    if (selectedNicho && p.nicho !== selectedNicho) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.nicho.toLowerCase().includes(q) ||
      p.resources.some((r) =>
        r.items.some(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)
        )
      )
    );
  });

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
              <Package size={20} className="text-amber-400" />
              Pack de Recursos por Nicho
            </h1>
            <p className="text-xs text-slate-400">
              Música, fuentes, paletas y efectos de sonido gratuitos
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
              placeholder="Buscar recurso, fuente o estilo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedNicho(null)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                !selectedNicho
                  ? "bg-amber-600 text-white"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              Todos
            </button>
            {PACKS.map((p) => (
              <button
                key={p.nicho}
                onClick={() =>
                  setSelectedNicho(selectedNicho === p.nicho ? null : p.nicho)
                }
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  selectedNicho === p.nicho
                    ? "bg-amber-600 text-white"
                    : "bg-slate-800/60 text-slate-400 hover:text-white"
                }`}
              >
                {p.nicho.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Packs */}
        {filtered.map((pack) => (
          <section
            key={pack.nicho}
            className="bg-slate-900/40 border border-slate-800/50 rounded-2xl overflow-hidden"
          >
            {/* Pack header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{
                borderBottom: `1px solid ${pack.color}20`,
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="p-2 rounded-lg"
                  style={{ background: `${pack.color}20`, color: pack.color }}
                >
                  {pack.icon}
                </span>
                <div>
                  <h2 className="text-base font-bold">{pack.nicho}</h2>
                  <p className="text-xs text-slate-500">
                    {pack.resources.reduce((a, r) => a + r.items.length, 0)}{" "}
                    recursos gratuitos
                  </p>
                </div>
              </div>

              {/* CapCut link + Color Palette */}
              <div className="flex items-center gap-3">
                <a
                  href={`/plantillas-capcut?nicho=${encodeURIComponent(pack.nicho.split(" ")[0])}`}
                  className="hidden sm:flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg font-medium transition-colors bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 hover:text-violet-200"
                >
                  <Film size={12} />
                  Ver plantillas CapCut
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 mr-2 hidden sm:block">
                  Paleta:
                </span>
                {pack.colorPalette.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => navigator.clipboard.writeText(color)}
                    title={`Copiar ${color}`}
                    className="w-6 h-6 rounded-full border-2 border-slate-700 hover:scale-110 transition-transform cursor-pointer"
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>

            {/* Resource categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800/40">
              {pack.resources.map((cat) => (
                <div key={cat.category} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-slate-400">{cat.icon}</span>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                      {cat.category}
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {cat.items
                      .filter((item) => {
                        if (!search.trim()) return true;
                        const q = search.toLowerCase();
                        return (
                          item.name.toLowerCase().includes(q) ||
                          item.description.toLowerCase().includes(q)
                        );
                      })
                      .map((item) => (
                        <a
                          key={item.name}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                                  {item.name}
                                </span>
                                {item.free ? (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 font-medium">
                                    GRATIS
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-medium">
                                    PRO
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                            <ExternalLink
                              size={11}
                              className="text-slate-600 group-hover:text-amber-400 mt-0.5 flex-shrink-0 transition-colors"
                            />
                          </div>
                        </a>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              No se encontraron recursos para &quot;{search}&quot;
            </p>
          </div>
        )}

        {/* Footer tip */}
        <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Todos los recursos marcados como GRATIS son de uso libre
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Los recursos de Pixabay y Google Fonts son libres de derechos para uso comercial.
                Verifica la licencia específica de cada recurso antes de usarlo en contenido monetizado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
