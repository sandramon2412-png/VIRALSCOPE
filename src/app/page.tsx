"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, TrendingUp, Loader2, AlertCircle, Flame, Bookmark, Check,
  Zap, Mic, BarChart2, Image, Calculator,
  Sparkles, Target, PlayCircle, X, ArrowLeft,
  Rocket, Tv2, LayoutGrid, MonitorPlay
} from "lucide-react";
import VideoCard from "@/components/VideoCard";
import GlobalNav from "@/components/GlobalNav";
import AlertaNotification from "@/components/AlertaNotification";
import WelcomeBanner from "@/components/WelcomeBanner";
import { useGuardar } from "@/hooks/useGuardar";
import { SearchResponse } from "@/lib/types";

const SUGGESTED = [
  "finanzas personales 2024",
  "canal faceless español",
  "videos virales motivación",
  "youtube automatico",
  "inteligencia artificial tutoriales",
  "nichos rentables youtube",
];

const TOOLS = [
  {
    href: "/titulos",
    icon: Zap,
    label: "Títulos Virales",
    desc: "12 títulos con fórmulas probadas",
    tag: "Popular"
  },
  {
    href: "/hooks",
    icon: Mic,
    label: "Banco de Hooks",
    desc: "Primeros 30s que retienen",
    tag: null
  },
  {
    href: "/branding",
    icon: Sparkles,
    label: "Branding con IA",
    desc: "Nombre, slogan, paleta, voz de marca",
    tag: "Nuevo"
  },
  {
    href: "/competencia",
    icon: BarChart2,
    label: "Análisis de Competencia",
    desc: "Compara hasta 4 canales",
    tag: null
  },
  {
    href: "/emular",
    icon: Target,
    label: "Emular Canal",
    desc: "Replica y supera cualquier canal",
    tag: "Hot"
  },
  {
    href: "/logo",
    icon: Image,
    label: "Logo + Banner",
    desc: "Foto de perfil y banner con DALL-E 3",
    tag: "Nuevo"
  },
  {
    href: "/plan",
    icon: Target,
    label: "Plan de Contenido",
    desc: "30 videos con estrategia completa",
    tag: null
  },
  {
    href: "/canal",
    icon: PlayCircle,
    label: "Análisis de Canal",
    desc: "Auditoría completa de tu canal",
    tag: null
  },
  {
    href: "/miniatura",
    icon: Image,
    label: "Miniatura con IA",
    desc: "Genera thumbnails con DALL-E 3",
    tag: null
  },
  {
    href: "/calculadora",
    icon: Calculator,
    label: "Calculadora de Ingresos",
    desc: "Proyección real de ganancias",
    tag: null
  },
  {
    href: "/nichos",
    icon: TrendingUp,
    label: "Nichos Rentables",
    desc: "Los mejores nichos del momento",
    tag: null
  },
];

const RESULTS_PER_PAGE = 12;

const ENTRY_OPTIONS = [
  { id: "cero",      icon: Rocket,      label: "Desde cero",         desc: "No tengo canal aún" },
  { id: "canal",     icon: Tv2,         label: "Ya tengo canal",      desc: "Quiero optimizarlo" },
  { id: "emular",    icon: Target,      label: "Emular un canal",     desc: "Basarme en uno exitoso" },
  { id: "video",     icon: Zap,         label: "Outlier por Video",   desc: "Tengo un video viral de referencia" },
  { id: "miniatura", icon: Image,       label: "Por Miniatura",       desc: "Me inspiré en una miniatura" },
  { id: "outlier",   icon: BarChart2,   label: "Outlier por Canal",   desc: "Analizar un canal completo" },
] as const;

const TIPO_OPTIONS = [
  { id: "personal", icon: PlayCircle,   label: "Personal", desc: "Aparezco en cámara" },
  { id: "faceless", icon: MonitorPlay,  label: "Faceless",  desc: "Sin mostrar mi rostro" },
  { id: "marca",    icon: LayoutGrid,   label: "Marca",     desc: "Canal de empresa o proyecto" },
] as const;

const NICHO_OPTIONS = [
  "Finanzas", "IA y Tech", "Fitness", "Productividad",
  "Gaming",   "Cocina",    "Viajes",  "Negocios",
  "Arte",     "Redes Sociales", "Bienestar", "Curiosidades",
];

type EntryId = typeof ENTRY_OPTIONS[number]["id"];
type TipoId  = typeof TIPO_OPTIONS[number]["id"];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { guardar, guardando, guardado, isLoggedIn } = useGuardar();

  // Onboarding wizard state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<EntryId | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<TipoId | null>(null);
  const [selectedNicho, setSelectedNicho] = useState<string | null>(null);

  function openOnboarding() {
    setStep(1);
    setSelectedEntry(null);
    setSelectedTipo(null);
    setSelectedNicho(null);
    setShowOnboarding(true);
  }

  function closeOnboarding() {
    setShowOnboarding(false);
  }

  function handleEntrySelect(id: EntryId) {
    setSelectedEntry(id);
    setStep(2);
  }

  function handleTipoSelect(id: TipoId) {
    setSelectedTipo(id);
    setStep(3);
  }

  function handleFinish() {
    if (!selectedEntry || !selectedTipo || !selectedNicho) return;
    closeOnboarding();
    const params = new URLSearchParams({
      entry: selectedEntry,
      tipo:  selectedTipo,
      nicho: selectedNicho,
    });
    router.push(`/crear-canal?${params.toString()}`);
  }

  // Video background
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const src = "https://stream.mux.com/BuGGTsiXq1T00WUb8qfURrHkTCbhrkfFLSv4uAOZzdhw.m3u8";

    let hlsInstance: import("hls.js").default | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari — soporta HLS nativo
      video.src = src;
      video.play().catch(() => {});
    } else {
      // Chrome, Firefox, Edge — usar HLS.js
      import("hls.js").then(({ default: Hls }) => {
        if (!Hls.isSupported()) return;
        hlsInstance = new Hls({ autoStartLoad: true, startLevel: -1 });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      });
    }

    return () => {
      hlsInstance?.destroy();
    };
  }, []);

  // Paginate results
  const totalPages = results ? Math.ceil(results.videos.length / RESULTS_PER_PAGE) : 0;
  const paginatedVideos = results
    ? results.videos.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE)
    : [];

  async function handleSearch(q?: string) {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setPage(1);
    if (q) setQuery(q);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&maxResults=24`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0812] text-white">
      <GlobalNav />
      <WelcomeBanner />

      {/* ── Hero con video de fondo ── */}
      <section className="relative overflow-hidden flex items-center justify-center min-h-[440px] md:min-h-[520px]">
        {/* Video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,8,18,0.55) 0%, rgba(10,8,18,0.75) 70%, #0a0812 100%)" }} />
        {/* Contenido */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 py-16 md:py-24 space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))",
              border: "1px solid rgba(139,92,246,0.4)",
              backdropFilter: "blur(8px)"
            }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Outlier Score · 9 herramientas con IA · 100% en español
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-xl">
            La suite definitiva para{" "}
            <br className="hidden sm:block" />
            <span style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              dominar YouTube
            </span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-base drop-shadow">
            Encuentra videos virales, genera títulos irresistibles, crea hooks que retienen y analiza a tu competencia. Todo con IA.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">

        {/* Search bar with gradient glow border */}
        <div className="max-w-2xl mx-auto mb-4">
          <div className="flex gap-2 p-1 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)",
              padding: "1.5px"
            }}>
            <div className="flex gap-2 flex-1 rounded-2xl px-1 py-1"
              style={{ background: "#13101f" }}>
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Escribe cualquier nicho o tema..."
                  className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)",
                  boxShadow: loading || !query.trim() ? "none" : "0 4px 20px rgba(236,72,153,0.4)"
                }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Analizar →
              </button>
            </div>
          </div>
        </div>

        {/* Crear Canal CTA */}
        {!results && !loading && (
          <div className="max-w-2xl mx-auto mb-6 text-center">
            <Link
              href="/crear-canal"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 hover:border-violet-400/50 transition-all"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              Crear canal con IA — empieza desde cero o emula uno exitoso
              <PlayCircle className="w-4 h-4 text-violet-400" />
            </Link>
          </div>
        )}

        {/* Suggested searches */}
        {!results && !loading && (
          <div className="max-w-2xl mx-auto mb-12">
            <p className="text-xs text-white/30 mb-2 text-center">Búsquedas populares</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white px-3 py-1.5 rounded-full transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold text-sm">Error</p>
              <p className="text-red-300/80 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-white/50 text-sm">Buscando videos y calculando Outlier Scores...</p>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="font-bold text-lg">
                  Resultados para{" "}
                  <span className="text-orange-400">&ldquo;{results.query}&rdquo;</span>
                </h2>
                <p className="text-white/40 text-sm">
                  {results.totalResults} videos · ordenados por Outlier Score
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-3 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Explosivo
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Alto
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Medio
                  </span>
                </div>
                {isLoggedIn && (
                  <button
                    onClick={() => guardar("busqueda", results!.query, { query: results!.query, totalResults: results!.totalResults })}
                    disabled={guardando || guardado}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 border-white/10 bg-white/5 hover:bg-white/10 text-white/60"
                  >
                    {guardado ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                    {guardado ? "Guardado" : guardando ? "Guardando..." : "Guardar"}
                  </button>
                )}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="text-center text-xs text-white/30 mb-4">
                Página {page} de {totalPages} · Mostrando {(page - 1) * RESULTS_PER_PAGE + 1}–{Math.min(page * RESULTS_PER_PAGE, results.videos.length)} de {results.videos.length} videos
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {paginatedVideos.map((video) => (
                <VideoCard key={video.id} video={video} searchQuery={query} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mb-16">
                <button
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold transition-all"
                >
                  ← Anterior
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                        p === page
                          ? "text-white"
                          : "text-white/40 hover:text-white hover:bg-white/8"
                      }`}
                      style={p === page ? { background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)" } : {}}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold transition-all"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}

        {/* Tools section — always visible */}
        {!loading && (
          <div className={results ? "pt-4 border-t border-white/10" : ""}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black mb-2">
                {results ? "Más herramientas" : "Todas las herramientas"}
              </h2>
              <p className="text-white/40 text-sm">9 herramientas con IA para dominar YouTube</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group relative rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: "radial-gradient(130% 130% at 0% 0%, #1e1530, #0b0914 70%)",
                      border: "1px solid rgba(139,92,246,0.18)",
                      backdropFilter: "blur(10px)",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)"
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.4)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(139,92,246,0.15), inset 0 0 0 1px rgba(255,255,255,0.06)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.18)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "inset 0 0 0 1px rgba(255,255,255,0.04)";
                    }}
                  >
                    {tool.tag && (
                      <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>
                        {tool.tag}
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200"
                      style={{ background: "#1c1208", border: "1px solid rgba(249,115,22,0.4)" }}>
                      <Icon size={18} style={{ color: "#f97316" }} />
                    </div>
                    <h3 className="font-bold text-white mb-1">{tool.label}</h3>
                    <p className="text-sm text-white/40">{tool.desc}</p>
                    <div className="mt-3 text-xs font-semibold text-white/30 group-hover:text-white/60 transition-colors flex items-center gap-1">
                      Abrir herramienta →
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats footer */}
        {!results && !loading && (
          <div className="mt-16 pt-8 border-t border-white/5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { Icon: Rocket,     value: "9",    label: "Herramientas con IA" },
                { Icon: BarChart2,  value: "100%", label: "En español" },
                { Icon: Target,     value: "12",   label: "Fórmulas de títulos" },
                { Icon: Zap,        value: "30s",  label: "Resultados en segundos" },
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-center"><stat.Icon size={20} style={{ color: "#a78bfa" }} /></div>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {results && (
        <AlertaNotification
          query={query}
          videos={results.videos.map(v => ({
            id: v.id,
            title: v.title,
            outlierScore: v.outlierScore,
            channelTitle: v.channelTitle,
          }))}
        />
      )}

      {/* ── Floating "Crear mi canal" button ── */}
      <button
        onClick={openOnboarding}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm text-white shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
          boxShadow: "0 4px 24px rgba(139,92,246,0.5)",
        }}
      >
        <Sparkles className="w-4 h-4" />
        Crear mi canal
      </button>

      {/* ── Onboarding wizard modal ── */}
      {showOnboarding && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(2,0,10,0.82)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeOnboarding(); }}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl p-6 text-white"
            style={{
              background: "#0d0b18",
              border: "1px solid rgba(139,92,246,0.25)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
            }}
          >
            {/* Close button */}
            <button
              onClick={closeOnboarding}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className="rounded-full transition-all"
                  style={{
                    width:  s === step ? 20 : 8,
                    height: 8,
                    background: s === step
                      ? "linear-gradient(135deg,#8b5cf6,#ec4899)"
                      : s < step
                        ? "rgba(139,92,246,0.5)"
                        : "rgba(255,255,255,0.12)",
                  }}
                />
              ))}
            </div>

            {/* Back link (steps 2-4) */}
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1 text-sm text-white/40 hover:text-white/70 mb-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Atrás
              </button>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <>
                <h2 className="text-xl font-black mb-1">¿Cómo quieres empezar?</h2>
                <p className="text-white/40 text-sm mb-5">Elige la mejor opción para tu situación</p>
                <div className="grid grid-cols-2 gap-3">
                  {ENTRY_OPTIONS.map((opt) => {
                    const EntryIcon = opt.icon;
                    return (
                    <button
                      key={opt.id}
                      onClick={() => handleEntrySelect(opt.id)}
                      className="flex flex-col items-start gap-1 p-4 rounded-xl text-left transition-all hover:-translate-y-0.5"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(139,92,246,0.2)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.12)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.5)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.2)";
                      }}
                    >
                      <EntryIcon size={20} style={{ color: "#a78bfa" }} />
                      <span className="font-bold text-sm text-white">{opt.label}</span>
                      <span className="text-xs text-white/40 leading-snug">{opt.desc}</span>
                    </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <>
                <h2 className="text-xl font-black mb-1">Tipo de canal</h2>
                <p className="text-white/40 text-sm mb-5">¿Cómo aparecerás en tu canal?</p>
                <div className="flex flex-col gap-3">
                  {TIPO_OPTIONS.map((opt) => {
                    const TipoIcon = opt.icon;
                    return (
                    <button
                      key={opt.id}
                      onClick={() => handleTipoSelect(opt.id)}
                      className="flex items-center gap-4 p-5 rounded-xl text-left transition-all hover:-translate-y-0.5"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(139,92,246,0.2)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.12)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.5)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.2)";
                      }}
                    >
                      <TipoIcon size={24} style={{ color: "#a78bfa" }} />
                      <div>
                        <div className="font-bold text-white">{opt.label}</div>
                        <div className="text-sm text-white/40">{opt.desc}</div>
                      </div>
                    </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <>
                <h2 className="text-xl font-black mb-1">Elige tu temática</h2>
                <p className="text-white/40 text-sm mb-5">¿Sobre qué será tu canal?</p>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {NICHO_OPTIONS.map((nicho) => (
                    <button
                      key={nicho}
                      onClick={() => setSelectedNicho(nicho)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: selectedNicho === nicho
                          ? "linear-gradient(135deg,rgba(139,92,246,0.35),rgba(236,72,153,0.35))"
                          : "rgba(255,255,255,0.05)",
                        border: selectedNicho === nicho
                          ? "1px solid rgba(139,92,246,0.7)"
                          : "1px solid rgba(255,255,255,0.08)",
                        color: selectedNicho === nicho ? "#e9d5ff" : "rgba(255,255,255,0.55)",
                      }}
                    >
                      {nicho}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { if (selectedNicho) setStep(4); }}
                  disabled={!selectedNicho}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                    boxShadow: selectedNicho ? "0 4px 20px rgba(139,92,246,0.4)" : "none",
                  }}
                >
                  Continuar →
                </button>
              </>
            )}

            {/* ── STEP 4 ── */}
            {step === 4 && selectedEntry && selectedTipo && selectedNicho && (
              <>
                <h2 className="text-xl font-black mb-1">¡Listo para empezar!</h2>
                <p className="text-white/40 text-sm mb-5">Resumen de tu configuración</p>
                <div
                  className="rounded-xl p-4 space-y-3 mb-5"
                  style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}
                >
                  {/* Entry summary */}
                  {(() => {
                    const e = ENTRY_OPTIONS.find(o => o.id === selectedEntry)!;
                    const EIcon = e.icon;
                    return (
                      <div className="flex items-center gap-3">
                        <EIcon size={20} style={{ color: "#a78bfa" }} />
                        <div>
                          <div className="text-xs text-white/40">Punto de partida</div>
                          <div className="font-semibold text-sm text-white">{e.label}</div>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="border-t border-white/5" />
                  {/* Tipo summary */}
                  {(() => {
                    const t = TIPO_OPTIONS.find(o => o.id === selectedTipo)!;
                    const TIcon = t.icon;
                    return (
                      <div className="flex items-center gap-3">
                        <TIcon size={20} style={{ color: "#a78bfa" }} />
                        <div>
                          <div className="text-xs text-white/40">Tipo de canal</div>
                          <div className="font-semibold text-sm text-white">{t.label}</div>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="border-t border-white/5" />
                  {/* Nicho summary */}
                  <div className="flex items-center gap-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: "linear-gradient(135deg,rgba(139,92,246,0.3),rgba(236,72,153,0.3))",
                        border: "1px solid rgba(139,92,246,0.5)",
                        color: "#e9d5ff",
                      }}
                    >
                      {selectedNicho}
                    </span>
                    <div className="text-xs text-white/40">Temática</div>
                  </div>
                </div>
                <button
                  onClick={handleFinish}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-white transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg,#8b5cf6,#ec4899,#f97316)",
                    boxShadow: "0 6px 28px rgba(139,92,246,0.45)",
                  }}
                >
                  <Rocket className="w-4 h-4" />
                  Crear mi canal ahora →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
