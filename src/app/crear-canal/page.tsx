"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles, Loader2, ChevronRight, ChevronLeft, Check,
  Flame, Users, Video, Image as ImageIcon, TrendingUp,
  Copy, Download, RefreshCw, Star, Hash, Mic, Globe,
  Eye, DollarSign, Zap, ArrowRight, Play,
  Tv2, Target, BarChart3, EyeOff, Kanban, Cpu,
  FileText, Share2, CalendarDays, BookOpen, Clapperboard,
  MessageSquare, Palette,
} from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import { CrearCanalResult } from "@/app/api/crear-canal/route";
import { formatNumber } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EntryOption {
  id: string;
  icon: React.ElementType;
  label: string;
  sublabel: string;
  color: string;
  border: string;
}

interface ViralVideo {
  id: string;
  title: string;
  thumbnail: string;
  viewCount: number;
  channelTitle: string;
  publishedAt: string;
  likeCount: number;
  outlierScore: number;
  channelAvgViews: number;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const ENTRY_OPTIONS: EntryOption[] = [
  { id: "cero",      icon: Sparkles,   label: "Empezar desde cero",   sublabel: "Crea tu canal con IA de principio a fin",         color: "from-violet-500/20 to-purple-600/10",   border: "border-violet-500/30 hover:border-violet-400/60" },
  { id: "canal",     icon: Tv2,        label: "Ya tengo un canal",    sublabel: "Analiza y optimiza tu canal existente",            color: "from-blue-500/20 to-cyan-600/10",        border: "border-blue-500/30 hover:border-blue-400/60"   },
  { id: "emular",    icon: Target,     label: "Emular un canal",      sublabel: "Clona la estrategia de un canal exitoso",          color: "from-orange-500/20 to-amber-600/10",     border: "border-orange-500/30 hover:border-orange-400/60"},
  { id: "video",     icon: Play,       label: "Outlier por Video",    sublabel: "Crea un canal basado en un video viral",           color: "from-red-500/20 to-pink-600/10",         border: "border-red-500/30 hover:border-red-400/60"     },
  { id: "miniatura", icon: ImageIcon,  label: "Outlier por Miniatura",sublabel: "Encuentra canales similares por miniatura",        color: "from-pink-500/20 to-rose-600/10",        border: "border-pink-500/30 hover:border-pink-400/60"   },
  { id: "outlier",   icon: BarChart3,  label: "Outlier por Canal",    sublabel: "Analiza el outlier score de cualquier canal",      color: "from-emerald-500/20 to-teal-600/10",    border: "border-emerald-500/30 hover:border-emerald-400/60"},
];

const NICHOS_SUGERIDOS = [
  "Finanzas personales", "Relaciones y amor", "Desarrollo personal",
  "Tecnología e IA", "Fitness y salud", "Emprendimiento",
  "Crypto y blockchain", "Cocina saludable", "True crime",
  "Viajes y turismo", "Gaming", "Marketing digital",
];

const RPM_MAP: Record<string, { min: number; max: number }> = {
  "finanz": { min: 8, max: 18 }, "invers": { min: 8, max: 18 },
  "crypto": { min: 12, max: 25 }, "bitcoin": { min: 12, max: 25 },
  "relaci": { min: 3, max: 8 }, "amor": { min: 3, max: 8 },
  "softwa": { min: 6, max: 15 }, "ia ": { min: 5, max: 14 }, "tecnol": { min: 5, max: 14 },
  "market": { min: 5, max: 14 }, "empren": { min: 5, max: 14 },
  "salud": { min: 4, max: 10 }, "fitness": { min: 3, max: 8 },
  "gaming": { min: 1, max: 4 }, "true cr": { min: 3, max: 7 },
  "bienes": { min: 8, max: 20 },
};

function getDefaultRPM(nicho: string) {
  const q = nicho.toLowerCase();
  for (const [k, v] of Object.entries(RPM_MAP)) {
    if (q.includes(k)) return v;
  }
  return { min: 2, max: 6 };
}

function fmtEarnings(views: number, rpm: { min: number; max: number }) {
  const per100k = views / 100000;
  const min = Math.round(rpm.min * per100k);
  const max = Math.round(rpm.max * per100k);
  if (max < 1000) return `$${min}–$${max}`;
  return `$${(min / 1000).toFixed(1)}K–$${(max / 1000).toFixed(1)}K`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-700">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 28; const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" className="rotate-[-90deg]">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div className="text-center" style={{ marginTop: -48 }}>
        <div className="text-xl font-black" style={{ color }}>{score}</div>
      </div>
      <div style={{ marginTop: 18 }} className="text-xs text-slate-400 text-center">{label}</div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function CrearCanalPageContent() {
  const searchParams = useSearchParams();
  const entryParam   = searchParams.get("entry");
  const canalRefParam = searchParams.get("canalRef");
  const resumeParam  = searchParams.get("resume");
  const nombreParam  = searchParams.get("nombre");
  const handleParam  = searchParams.get("handle");
  const nichoParam   = searchParams.get("nicho");
  const facelessParam = searchParams.get("faceless");
  const logoParam    = searchParams.get("logoUrl");
  const bannerParam  = searchParams.get("bannerUrl");

  // Auth guard
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?from=/crear-canal");
    }
  }, [user, authLoading, router]);

  // Wizard state
  const [step, setStep]           = useState(0); // 0=entry, 1=config, 2=angulo, 3=nombres, 4=branding, 5=dashboard
  const [entry, setEntry]         = useState<string | null>(entryParam);
  const [faceless, setFaceless]   = useState(true);
  const [nicho, setNicho]         = useState("");
  const [canalRef, setCanalRef]   = useState(canalRefParam || "");

  useEffect(() => {
    if (resumeParam === "1" && nombreParam) {
      setSelectedNombre(nombreParam);
      setSelectedHandle(handleParam || "");
      if (nichoParam) setNicho(nichoParam);
      if (facelessParam !== null) setFaceless(facelessParam === "true");
      if (logoParam) setLogoUrl(decodeURIComponent(logoParam));
      if (bannerParam) setBannerUrl(decodeURIComponent(bannerParam));
      setStep(4);
    } else if (entryParam) {
      setStep(1);
    }
  }, []); // run once on mount

  const [idioma, setIdioma]       = useState("español");

  // Results
  const [aiResult, setAiResult]   = useState<CrearCanalResult | null>(null);
  const [selectedAngulo, setSelectedAngulo] = useState<string>("");
  const [selectedNombre, setSelectedNombre] = useState<string>("");
  const [selectedHandle, setSelectedHandle] = useState<string>("");

  // Auto-fetch viral videos when reaching step 4 if not already loaded
  useEffect(() => {
    if (step === 4 && viralVideos.length === 0 && !loadingVideos) {
      const query = nicho || selectedAngulo || canalRef;
      if (query) fetchViralVideos(query);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);


  // Branding
  const [logoUrl, setLogoUrl]     = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [loadingBanner, setLoadingBanner] = useState(false);
  const [errorLogo, setErrorLogo] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Videos
  const [viralVideos, setViralVideos] = useState<ViralVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Loading
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function downloadImage(url: string, filename: string) {
    try {
      const proxyUrl = `/api/download-image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
      const a = document.createElement("a");
      a.href = proxyUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(url, "_blank");
    }
  }

  function saveKanbanIfEmpty(nombre: string, result?: CrearCanalResult | null) {
    const data = result || aiResult;
    if (!data) return;
    const key = `kanban-${nombre}`;
    try {
      const existing = localStorage.getItem(key);
      const cols = existing ? JSON.parse(existing) : null;
      const hasCards = cols?.some((c: { cards: unknown[] }) => c.cards.length > 0);
      if (!hasCards) {
        const ideaCards = data.angulos.map(a => ({
          id: Math.random().toString(36).slice(2, 10),
          titulo: a.titulo,
          keywords: (data.palabrasClave || []).slice(0, 4).join(", "),
          hookReferencia: data.gancho || "",
          linkReferencia: "",
          guion: a.descripcion,
          fechaInicio: "",
          fechaFin: "",
          notas: (data.pilares || []).join(" · "),
        }));
        const newCols = [
          { id: "ideas",      label: "Ideas",      color: "border-yellow-500/30", dotColor: "bg-yellow-400",  cards: ideaCards },
          { id: "guion",      label: "Guión",      color: "border-blue-500/30",   dotColor: "bg-blue-400",    cards: [] },
          { id: "grabacion",  label: "Grabación",  color: "border-purple-500/30", dotColor: "bg-purple-400",  cards: [] },
          { id: "edicion",    label: "Edición",    color: "border-orange-500/30", dotColor: "bg-orange-400",  cards: [] },
          { id: "programado", label: "Programado", color: "border-cyan-500/30",   dotColor: "bg-cyan-400",    cards: [] },
          { id: "publicado",  label: "Publicado",  color: "border-green-500/30",  dotColor: "bg-green-400",   cards: [] },
        ];
        localStorage.setItem(key, JSON.stringify(newCols));
      }
    } catch {}
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleSelectEntry = (id: string) => {
    setEntry(id);
    setStep(1);
    setError(null);
  };

  const handleGenerarAngulos = async () => {
    if (!nicho.trim() && !canalRef.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/crear-canal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: entry, nicho, canalRef, faceless, idioma }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiResult(data);
      setStep(2);
      // Start loading videos in background
      fetchViralVideos(nicho || canalRef);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAngulo = async (angulo: string) => {
    setSelectedAngulo(angulo);
    // If we already have nombres from initial call, go to nombres step
    if (aiResult?.nombres?.length) {
      setStep(3);
      return;
    }
    // Otherwise regenerate with specific angulo
    setLoading(true);
    try {
      const res = await fetch("/api/crear-canal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: entry, nicho, angulo, canalRef, faceless, idioma }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiResult(data);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNombre = (nombre: string, handle: string) => {
    setSelectedNombre(nombre);
    setSelectedHandle(handle);
    setStep(4);
    // Save to projects list
    try {
      const saved = localStorage.getItem("viralscope-proyectos");
      const projects = saved ? JSON.parse(saved) : [];
      // Check if already exists (by name)
      const exists = projects.find((p: { nombre: string }) => p.nombre === nombre);
      if (!exists) {
        const newProject = {
          id: Math.random().toString(36).slice(2, 10),
          nombre,
          handle,
          nicho,
          faceless,
          creadoEn: new Date().toISOString(),
        };
        projects.unshift(newProject);
        localStorage.setItem("viralscope-proyectos", JSON.stringify(projects));
      }
    } catch {}
    // Pre-populate kanban with AI ideas immediately
    saveKanbanIfEmpty(nombre, aiResult);
    // Auto-generate logo & banner
    generateLogo(nombre);
    generateBanner(nombre);
  };

  const generateLogo = async (nombre: string) => {
    setLoadingLogo(true);
    setErrorLogo(null);
    setLogoUrl(null);
    try {
      const res = await fetch("/api/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreCanal: nombre,
          nicho,
          estilo: faceless ? "minimalista, moderno, sin rostros humanos" : "profesional, personal",
          colores: aiResult?.paletaColores || "",
          tipo: "logo",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      if (!data.logo) throw new Error("La API no devolvió imagen");
      setLogoUrl(data.logo);
      // Update project with logo URL
      try {
        const saved = localStorage.getItem("viralscope-proyectos");
        if (saved) {
          const projects = JSON.parse(saved);
          const idx = projects.findIndex((p: { nombre: string }) => p.nombre === nombre);
          if (idx >= 0) {
            projects[idx].logoUrl = data.logo;
            localStorage.setItem("viralscope-proyectos", JSON.stringify(projects));
          }
        }
      } catch {}
    } catch (e) {
      setErrorLogo(e instanceof Error ? e.message : "Error generando logo");
    } finally {
      setLoadingLogo(false);
    }
  };

  const generateBanner = async (nombre: string) => {
    setLoadingBanner(true);
    setErrorBanner(null);
    setBannerUrl(null);
    try {
      const res = await fetch("/api/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreCanal: nombre,
          nicho,
          estilo: faceless ? "minimalista, moderno, sin rostros humanos" : "profesional, personal",
          colores: aiResult?.paletaColores || "",
          tipo: "banner",
          angulo: selectedAngulo,
          audiencia: aiResult?.audiencia,
          pilares: aiResult?.pilares?.join(", "),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      if (!data.banner) throw new Error("La API no devolvió imagen");
      setBannerUrl(data.banner);
      // Update project with banner URL
      try {
        const saved = localStorage.getItem("viralscope-proyectos");
        if (saved) {
          const projects = JSON.parse(saved);
          const idx = projects.findIndex((p: { nombre: string }) => p.nombre === nombre);
          if (idx >= 0) {
            projects[idx].bannerUrl = data.banner;
            localStorage.setItem("viralscope-proyectos", JSON.stringify(projects));
          }
        }
      } catch {}
    } catch (e) {
      setErrorBanner(e instanceof Error ? e.message : "Error generando banner");
    } finally {
      setLoadingBanner(false);
    }
  };

  const fetchViralVideos = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoadingVideos(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&maxResults=9`);
      const data = await res.json();
      if (res.ok && data.videos) {
        setViralVideos(data.videos);
      }
    } catch {
      // Silent
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  const handleGoToDashboard = () => {
    saveKanbanIfEmpty(selectedNombre);
    router.push(`/kanban?canal=${encodeURIComponent(selectedNombre)}&nicho=${encodeURIComponent(nicho)}`);
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const rpm = getDefaultRPM(nicho || selectedAngulo);

  // Auth loading / redirect guard
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  STEP 0 — Entry points
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 0) return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Nuevo Proyecto de Canal
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3">
            ¿Cómo quieres{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400">
              empezar?
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Elige el punto de partida para crear tu proyecto de canal. La IA construirá todo lo que necesitas.
          </p>
        </div>

        {/* 6 entry option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {ENTRY_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleSelectEntry(opt.id)}
              className={`group relative text-left p-6 rounded-2xl border bg-gradient-to-br transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/40 ${opt.color} ${opt.border}`}
            >
              <div className="mb-4"><opt.icon size={32} style={{ color: "#a78bfa" }} /></div>
              <h3 className="font-bold text-white text-lg mb-1">{opt.label}</h3>
              <p className="text-slate-400 text-sm leading-snug">{opt.sublabel}</p>
              <ArrowRight className="absolute bottom-5 right-5 w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        {/* Info row */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Cpu,       label: "IA genera todo", sub: "Nombres, logo, banner y más" },
            { icon: TrendingUp, label: "Videos virales", sub: "Analiza el nicho en tiempo real" },
            { icon: Kanban,    label: "Kanban incluido", sub: "Organiza toda tu producción" },
          ].map(i => (
            <div key={i.label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-center mb-2"><i.icon size={22} style={{ color: "#a78bfa" }} /></div>
              <div className="font-semibold text-sm text-white">{i.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{i.sub}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  STEP 1 — Config (type + nicho + reference)
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 1) {
    const needsRef = entry === "canal" || entry === "emular" || entry === "video" || entry === "miniatura" || entry === "outlier";
    const opt = ENTRY_OPTIONS.find(o => o.id === entry)!;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <GlobalNav />
        <main className="max-w-2xl mx-auto px-4 py-12">
          {/* Back */}
          <button onClick={() => setStep(0)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-3"><opt.icon size={32} style={{ color: "#a78bfa" }} /></div>
            <h2 className="text-2xl font-black">{opt.label}</h2>
            <p className="text-slate-400 mt-1">{opt.sublabel}</p>
          </div>

          <div className="space-y-6">
            {/* Tipo de canal */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Tipo de canal</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: true,  icon: EyeOff, label: "Faceless", sub: "Sin mostrar tu rostro" },
                  { id: false, icon: Mic,    label: "Con presencia", sub: "Apareces en pantalla" },
                ].map(t => {
                  const TIcon = t.icon;
                  return (
                  <button
                    key={String(t.id)}
                    onClick={() => setFaceless(t.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      faceless === t.id
                        ? "border-violet-500 bg-violet-500/10 text-white"
                        : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <div className="mb-1"><TIcon size={20} style={{ color: "#a78bfa" }} /></div>
                    <div className="font-semibold text-sm">{t.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.sub}</div>
                  </button>
                  );
                })}
              </div>
            </div>

            {/* Nicho */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                {needsRef ? "Nicho o temática (opcional)" : "Nicho o temática *"}
              </label>
              <input
                type="text"
                value={nicho}
                onChange={e => setNicho(e.target.value)}
                placeholder="ej: finanzas personales, relaciones, fitness..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
              {/* Quick nicho pills */}
              <div className="flex flex-wrap gap-2 mt-3">
                {NICHOS_SUGERIDOS.map(n => (
                  <button
                    key={n}
                    onClick={() => setNicho(n)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      nicho === n
                        ? "border-violet-500 bg-violet-500/20 text-violet-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference URL (for non-cero entries) */}
            {needsRef && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  {entry === "canal"  ? "URL o nombre de tu canal" :
                   entry === "emular" ? "URL o nombre del canal a emular" :
                   entry === "video"  ? "URL del video viral" :
                   entry === "miniatura" ? "URL de la miniatura" :
                   "URL del canal para analizar outlier"}
                </label>
                <input
                  type="text"
                  value={canalRef}
                  onChange={e => setCanalRef(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            )}

            {/* Idioma */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Idioma del canal</label>
              <div className="flex gap-2">
                {["español", "inglés", "portugués"].map(l => (
                  <button
                    key={l}
                    onClick={() => setIdioma(l)}
                    className={`flex-1 py-2 text-sm rounded-xl border transition-colors capitalize ${
                      idioma === l
                        ? "border-violet-500 bg-violet-500/10 text-white"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {l === "español" ? "🇪🇸" : l === "inglés" ? "🇺🇸" : "🇧🇷"} {l}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            {/* CTA */}
            <button
              onClick={handleGenerarAngulos}
              disabled={loading || (!nicho.trim() && !canalRef.trim())}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)" }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando reporte personalizado...</> :
                <><Sparkles className="w-4 h-4" /> Analizar y generar sugerencias <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  STEP 2 — Choose content angle
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 2 && aiResult) return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Paso 2 de 4
          </div>
          <h2 className="text-2xl font-black mb-1">Elige el ángulo de tu canal</h2>
          <p className="text-slate-400 text-sm">La IA generó estos ángulos de contenido únicos para el nicho <strong className="text-white">{nicho}</strong></p>
        </div>

        <div className="space-y-3 mb-8">
          {aiResult.angulos.map((a, i) => (
            <button
              key={i}
              onClick={() => handleSelectAngulo(a.titulo)}
              className={`w-full text-left p-4 rounded-xl border transition-all hover:border-violet-500/50 hover:bg-violet-500/5 ${
                selectedAngulo === a.titulo ? "border-violet-500 bg-violet-500/10" : "border-slate-700 bg-slate-800/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-white text-sm mb-0.5">{a.titulo}</div>
                  <div className="text-slate-400 text-xs leading-relaxed">{a.descripcion}</div>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-0.5 ${selectedAngulo === a.titulo ? "text-violet-400" : "text-slate-600"}`} />
              </div>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-violet-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Generando nombres personalizados...
          </div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </main>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  STEP 3 — Choose channel name
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 3 && aiResult) return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Paso 3 de 4
          </div>
          <h2 className="text-2xl font-black mb-1">Elige el nombre del canal</h2>
          <p className="text-slate-400 text-sm">Ángulo seleccionado: <strong className="text-violet-300">{selectedAngulo}</strong></p>
        </div>

        {/* Channel name options */}
        <div className="space-y-3 mb-8">
          {aiResult.nombres.map((n, i) => (
            <button
              key={i}
              onClick={() => handleSelectNombre(n.nombre, n.handle)}
              className={`w-full text-left p-4 rounded-xl border transition-all hover:border-violet-500/50 hover:bg-violet-500/5 group ${
                selectedNombre === n.nombre ? "border-violet-500 bg-violet-500/10" : "border-slate-700 bg-slate-800/30"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-white">{n.nombre}</span>
                    <span className="text-xs text-slate-500">{n.handle}</span>
                  </div>
                  <div className="text-slate-400 text-xs">{n.razon}</div>
                </div>
                <Star className={`w-4 h-4 flex-shrink-0 ${selectedNombre === n.nombre ? "text-yellow-400 fill-yellow-400" : "text-slate-700 group-hover:text-slate-500"}`} />
              </div>
            </button>
          ))}
        </div>

        {/* Channel info preview */}
        {aiResult.descripcionCanal && (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Descripción generada</span>
              <CopyBtn text={aiResult.descripcionCanal} />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{aiResult.descripcionCanal}</p>
          </div>
        )}

        {/* Keywords */}
        {aiResult.palabrasClave?.length > 0 && (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Palabras clave SEO</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiResult.palabrasClave.map(k => (
                <span key={k} className="text-xs bg-slate-700/50 border border-slate-600/50 text-slate-300 px-2.5 py-1 rounded-full">#{k}</span>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-violet-400 text-sm mt-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Generando branding...
          </div>
        )}
      </main>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  STEP 4 — Branding (logo + banner + viral videos)
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 4) return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />
      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Back + progress */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setStep(3)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {["Inicio", "Config", "Ángulo", "Nombre", "Branding"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i <= 4 ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-600"}`}>
                  {i < 4 ? <Check className="w-3 h-3" /> : 5}
                </div>
                {i < 4 && <div className="w-6 h-px bg-slate-700" />}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Check className="w-3.5 h-3.5" /> Identidad de canal generada
          </div>
          <h2 className="text-3xl font-black">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">{selectedNombre}</span>
          </h2>
          <p className="text-slate-400 mt-1">{selectedHandle} · {faceless ? "Faceless" : "Canal personal"} · {nicho}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Logo */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4 text-violet-400" /> Logo / Foto de Perfil</h3>
              <div className="flex gap-2">
                <button onClick={() => generateLogo(selectedNombre)} disabled={loadingLogo}
                  className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-700">
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogo ? "animate-spin" : ""}`} />
                </button>
                {logoUrl && (
                  <button
                    onClick={() => downloadImage(logoUrl, `logo-${selectedNombre}.png`)}
                    className="p-1.5 text-slate-500 hover:text-green-400 transition-colors rounded-lg hover:bg-slate-700"
                    title="Descargar logo"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {loadingLogo ? (
              <div className="aspect-square rounded-xl bg-slate-900/80 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-500">Generando logo...</span>
                </div>
              </div>
            ) : logoUrl ? (
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-900">
                <Image src={logoUrl} alt="Logo" width={400} height={400} className="w-full h-full object-cover" unoptimized />
              </div>
            ) : errorLogo ? (
              <div className="aspect-square rounded-xl bg-red-950/30 border border-red-800/40 flex flex-col items-center justify-center gap-2 p-4">
                <p className="text-red-400 text-xs text-center">{errorLogo}</p>
                <button onClick={() => generateLogo(selectedNombre)} className="text-xs px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800/40 text-red-300 transition-colors flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" /> Reintentar
                </button>
              </div>
            ) : (
              <div className="aspect-square rounded-xl bg-slate-900/80 flex items-center justify-center border border-dashed border-slate-700">
                <div className="text-center text-slate-500">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Logo no generado</p>
                </div>
              </div>
            )}
          </div>

          {/* Banner */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" /> Banner del Canal</h3>
              <div className="flex gap-2">
                <button onClick={() => generateBanner(selectedNombre)} disabled={loadingBanner}
                  className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-700">
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingBanner ? "animate-spin" : ""}`} />
                </button>
                {bannerUrl && (
                  <button
                    onClick={() => downloadImage(bannerUrl, `banner-${selectedNombre}.png`)}
                    className="p-1.5 text-slate-500 hover:text-green-400 transition-colors rounded-lg hover:bg-slate-700"
                    title="Descargar banner"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {loadingBanner ? (
              <div className="aspect-video rounded-xl bg-slate-900/80 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-500">Generando banner...</span>
                </div>
              </div>
            ) : bannerUrl ? (
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                <Image src={bannerUrl} alt="Banner" width={800} height={450} className="w-full h-full object-cover" unoptimized />
              </div>
            ) : errorBanner ? (
              <div className="aspect-video rounded-xl bg-red-950/30 border border-red-800/40 flex flex-col items-center justify-center gap-2 p-4">
                <p className="text-red-400 text-xs text-center">{errorBanner}</p>
                <button onClick={() => generateBanner(selectedNombre)} className="text-xs px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800/40 text-red-300 transition-colors flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" /> Reintentar
                </button>
              </div>
            ) : (
              <div className="aspect-video rounded-xl bg-slate-900/80 flex items-center justify-center border border-dashed border-slate-700">
                <div className="text-center text-slate-500">
                  <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Banner no generado</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Strategy: pilares + audiencia + bio + descripcion */}
        {aiResult && (
          <div className="space-y-4 mb-8">
            {/* Pilares + Audiencia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pilares de contenido</span>
                </div>
                <div className="space-y-2">
                  {aiResult.pilares?.map((p, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                      <span className="text-slate-300 text-sm">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audiencia objetivo</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{aiResult.audiencia}</p>
                {aiResult.gancho && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="text-xs font-semibold text-violet-400 mb-1">Gancho para el trailer</div>
                    <p className="text-slate-200 text-sm italic">"{aiResult.gancho}"</p>
                  </div>
                )}
                {aiResult.paletaColores && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                      <Palette className="w-3.5 h-3.5" /> Paleta del canal
                    </div>
                    <p className="text-slate-300 text-sm">{aiResult.paletaColores}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción del canal */}
            {aiResult.descripcionCanal && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Descripción del canal (YouTube)</span>
                  </div>
                  <CopyBtn text={aiResult.descripcionCanal} />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{aiResult.descripcionCanal}</p>
              </div>
            )}

            {/* Bio redes sociales */}
            {aiResult.bioRedes && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bio para redes sociales</span>
                  </div>
                  <CopyBtn text={aiResult.bioRedes} />
                </div>
                <p className="text-slate-200 text-sm">{aiResult.bioRedes}</p>
                <p className="text-slate-500 text-xs mt-1">{aiResult.bioRedes.length} / 150 caracteres</p>
              </div>
            )}

            {/* Guión del trailer */}
            {aiResult.guionTrailer && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clapperboard className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Guión del video de presentación (Trailer)</span>
                  </div>
                  <CopyBtn text={aiResult.guionTrailer} />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{aiResult.guionTrailer}</p>
              </div>
            )}

            {/* Plan de contenido - 8 videos */}
            {aiResult.planContenido?.length > 0 && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan de contenido — Primeros 8 videos</span>
                </div>
                <div className="space-y-3">
                  {aiResult.planContenido.map((v, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/40">
                      <div className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-white text-sm leading-snug">{v.titulo}</p>
                          <CopyBtn text={v.titulo} />
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{v.descripcion}</p>
                        {v.hook && (
                          <div className="mt-1.5 flex items-start gap-1.5">
                            <MessageSquare className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                            <p className="text-violet-300 text-xs italic">"{v.hook}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Viral videos in niche */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-white">Videos virales en este nicho</h3>
            {loadingVideos && <Loader2 className="w-4 h-4 animate-spin text-orange-400" />}
            <span className="text-xs text-slate-500 ml-auto">Inspiración para tu contenido</span>
          </div>
          {viralVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {viralVideos.slice(0, 9).map(v => (
                <a
                  key={v.id}
                  href={`https://youtube.com/watch?v=${v.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden hover:border-orange-500/40 transition-all"
                >
                  <div className="relative aspect-video bg-slate-900">
                    {v.thumbnail && (
                      <Image src={v.thumbnail} alt={v.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {v.outlierScore > 2 && (
                      <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {v.outlierScore.toFixed(1)}x
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-slate-200 text-xs font-medium line-clamp-2 mb-2">{v.title}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatNumber(v.viewCount)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <DollarSign className="w-3 h-3" />
                        <span>{fmtEarnings(v.viewCount, rpm)}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : loadingVideos ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-slate-800/30 rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-slate-700/50" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-slate-700 rounded w-full" />
                    <div className="h-3 bg-slate-700 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              No se encontraron videos. <button onClick={() => fetchViralVideos(nicho)} className="text-violet-400 underline">Reintentar</button>
            </div>
          )}
        </div>

        {/* CTA — go to Kanban */}
        <div className="bg-gradient-to-r from-violet-900/30 to-pink-900/20 border border-violet-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white text-lg mb-1">¡Tu canal está listo! 🎉</h3>
            <p className="text-slate-400 text-sm">Descarga el logo y el banner, luego empieza a planificar tu contenido con el Kanban.</p>
          </div>
          <button
            onClick={handleGoToDashboard}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white whitespace-nowrap transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
          >
            <Zap className="w-4 h-4" /> Ir al Kanban <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  STEP 5 — Kanban (fallback screen if navigated directly)
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 5) return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        <Kanban size={56} style={{ color: "#a78bfa" }} className="mx-auto mb-4" />
        <h2 className="text-3xl font-black mb-3">Planificador Kanban</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Organiza todo tu pipeline de producción. Arrastra las tarjetas de Ideas → Publicado.
        </p>
        <button
          onClick={() => {
            saveKanbanIfEmpty(selectedNombre);
            router.push(`/kanban?canal=${encodeURIComponent(selectedNombre)}&nicho=${encodeURIComponent(nicho)}`);
          }}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)" }}
        >
          <Zap className="w-5 h-5" /> Abrir Kanban de {selectedNombre}
        </button>
      </main>
    </div>
  );

  return null;
}

export default function CrearCanalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CrearCanalPageContent />
    </Suspense>
  );
}
