"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Flame, Loader2, AlertCircle, Sparkles, Calendar,
  Clock, Play, Lightbulb, ChevronDown, ChevronUp,
  Download, BookOpen, Target, Zap, FileText, Copy, Check, Volume2, TrendingUp, Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import NavAuth from "@/components/NavAuth";
import GlobalNav from "@/components/GlobalNav";
import { useGuardar } from "@/hooks/useGuardar";
import type { PlanMeta, PlanVideo, VideoIdea } from "@/app/api/plan/route";

const FORMATOS_COLOR: Record<string, string> = {
  "Tutorial": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Lista": "bg-green-500/10 text-green-400 border-green-500/20",
  "Historia": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Documental": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Review": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Short": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Reel": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "default": "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function getFormatoColor(formato: string) {
  for (const key of Object.keys(FORMATOS_COLOR)) {
    if (formato.toLowerCase().includes(key.toLowerCase())) return FORMATOS_COLOR[key];
  }
  return FORMATOS_COLOR["default"];
}

function getFaseLabel(numero: number): { label: string; color: string } {
  if (numero <= 5) return { label: "Anzuelo", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" };
  if (numero <= 15) return { label: "Autoridad", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" };
  if (numero <= 25) return { label: "Viral", color: "text-red-400 bg-red-400/10 border-red-400/20" };
  return { label: "Evergreen", color: "text-green-400 bg-green-400/10 border-green-400/20" };
}

function VideoCard({ video, isNew, nicho, faceless }: { video: VideoIdea; isNew?: boolean; nicho: string; faceless: boolean }) {
  const [open, setOpen] = useState(false);
  const [guion, setGuion] = useState("");
  const [loadingGuion, setLoadingGuion] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const fase = getFaseLabel(video.numero);

  async function handleGuion() {
    if (guion) return; // ya generado
    setLoadingGuion(true);
    setOpen(true);
    setGuion("");
    try {
      const res = await fetch("/api/guion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: video.titulo,
          nicho,
          formato: video.formato,
          duracion: video.duracionIdeal,
          faceless,
        }),
      });
      if (!res.body) throw new Error("Sin respuesta");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setGuion(prev => prev + decoder.decode(value, { stream: true }));
      }
    } catch {
      setGuion("Error generando el guion. Intenta de nuevo.");
    } finally {
      setLoadingGuion(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(guion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleAudio() {
    if (!guion || loadingAudio) return;
    setLoadingAudio(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: guion }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `guion-${video.titulo.slice(0, 30).replace(/\s+/g, "-")}.mp3`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error generando audio");
    } finally {
      setLoadingAudio(false);
    }
  }

  return (
    <div className={cn(
      "bg-slate-800/60 border rounded-xl overflow-hidden transition-all duration-300",
      isNew ? "border-violet-500/50 shadow-lg shadow-violet-500/10" : "border-slate-700/50 hover:border-slate-600"
    )}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 p-4 text-left">
        <span className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 text-sm font-bold flex items-center justify-center shrink-0">
          {video.numero}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-slate-100 font-medium text-sm leading-tight line-clamp-1">{video.titulo}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("text-[10px] border rounded-full px-2 py-0.5", fase.color)}>{fase.label}</span>
            <span className={cn("text-[10px] border rounded-full px-2 py-0.5", getFormatoColor(video.formato))}>{video.formato}</span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{video.duracionIdeal}</span>
            <span className="text-[10px] text-slate-500">Sem. {video.semana}</span>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-700/50 pt-3">

          {/* Búsquedas y competencia */}
          {(video.busquedasMes || video.competencia) && (
            <div className="flex gap-2 flex-wrap">
              {video.busquedasMes && (
                <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-2.5 py-1.5">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-[11px] text-green-300 font-semibold">{video.busquedasMes}</span>
                </div>
              )}
              {video.competencia && (
                <div className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border",
                  video.competencia === "Baja"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : video.competencia === "Media"
                    ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
                    : "bg-red-500/10 border-red-500/20 text-red-300"
                )}>
                  <span className="text-[11px] font-semibold">Competencia {video.competencia}</span>
                </div>
              )}
            </div>
          )}

          {/* Hook */}
          <div className="flex gap-2">
            <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Hook — primeros 15 segundos</p>
              <p className="text-slate-300 text-xs leading-relaxed italic">&ldquo;{video.hook}&rdquo;</p>
            </div>
          </div>

          {/* Por qué funciona */}
          <div className="flex gap-2">
            <Lightbulb className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Por qué va a funcionar</p>
              <p className="text-slate-300 text-xs leading-relaxed">{video.porque}</p>
            </div>
          </div>

          {/* Botón guion */}
          {!guion && !loadingGuion && (
            <button
              onClick={handleGuion}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Generar guion completo con IA
            </button>
          )}

          {/* Guion generándose */}
          {(loadingGuion || guion) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3 h-3" />
                  Guion completo
                  {loadingGuion && <Loader2 className="w-3 h-3 animate-spin text-violet-400" />}
                </p>
                {guion && !loadingGuion && (
                  <div className="flex items-center gap-2">
                    <button onClick={handleAudio} disabled={loadingAudio}
                      className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 disabled:opacity-50 transition-colors">
                      {loadingAudio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                      {loadingAudio ? "Generando..." : "Descargar MP3"}
                    </button>
                    <span className="text-slate-700">|</span>
                    <button onClick={handleCopy}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 transition-colors">
                      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-slate-900 rounded-xl p-4 max-h-96 overflow-y-auto">
                <pre className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {guion}
                  {loadingGuion && <span className="inline-block w-1 h-3 bg-violet-400 animate-pulse ml-0.5" />}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function groupBySemana(videos: VideoIdea[]) {
  const groups: Record<number, VideoIdea[]> = {};
  for (const v of videos) {
    if (!groups[v.semana]) groups[v.semana] = [];
    groups[v.semana].push(v);
  }
  return groups;
}

function exportPlan(meta: PlanMeta, videos: VideoIdea[]) {
  const lines: string[] = [
    `PLAN DE CONTENIDO: ${meta.nicho.toUpperCase()}`,
    "=".repeat(50), "",
    `RESUMEN: ${meta.resumen}`,
    `ESTRATEGIA: ${meta.estrategia}`,
    `FRECUENCIA: ${meta.frecuenciaRecomendada}`,
    `PATRÓN DE TÍTULOS: ${meta.patronTitulos}`, "",
    "CONSEJOS:", ...meta.consejosGenerales.map((c, i) => `${i + 1}. ${c}`), "",
    "=".repeat(50), "VIDEOS:", "",
  ];
  const groups = groupBySemana(videos);
  for (const semana of Object.keys(groups).map(Number).sort((a, b) => a - b)) {
    lines.push(`SEMANA ${semana}:`);
    for (const v of groups[semana]) {
      lines.push(`  ${v.numero}. ${v.titulo}`);
      lines.push(`     ${v.formato} | ${v.duracionIdeal}`);
      lines.push(`     Hook: "${v.hook}"`);
      lines.push(`     Por qué: ${v.porque}`);
      lines.push("");
    }
  }
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `plan-${meta.nicho.replace(/\s+/g, "-").toLowerCase()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

const DURACIONES = [
  { value: "mixto", label: "Mixto", desc: "Variado" },
  { value: "shorts", label: "Shorts", desc: "≤60 seg" },
  { value: "cortos", label: "Cortos", desc: "5-8 min" },
  { value: "medianos", label: "Medianos", desc: "8-12 min" },
  { value: "largos", label: "Largos", desc: "15-20 min" },
  { value: "muy-largos", label: "Muy largos", desc: "25-40 min" },
];

function PlanPageContent() {
  const [nicho, setNicho] = useState("");
  const [canalNombre, setCanalNombre] = useState("");
  const [faceless, setFaceless] = useState(true);
  const [idioma, setIdioma] = useState("español");
  const [duracionPref, setDuracionPref] = useState("mixto");
  const [incluyeShorts, setIncluyeShorts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PlanMeta | null>(null);
  const [videos, setVideos] = useState<VideoIdea[]>([]);
  const [newestVideoNum, setNewestVideoNum] = useState<number | null>(null);
  const [vistaActiva, setVistaActiva] = useState<"lista" | "semanas">("semanas");
  const [done, setDone] = useState(false);
  const { guardar, guardando, guardado, isLoggedIn } = useGuardar();
  const searchParams = useSearchParams();

  useEffect(() => {
    const nichoParam = searchParams.get("nicho");
    if (nichoParam) setNicho(decodeURIComponent(nichoParam));
  }, [searchParams]);

  async function handleGenerar() {
    if (!nicho.trim()) return;
    setLoading(true);
    setError(null);
    setMeta(null);
    setVideos([]);
    setNewestVideoNum(null);
    setDone(false);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicho, canalNombre, faceless, idioma, duracionPref, incluyeShorts }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json();
        throw new Error(data.error || "Error desconocido");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const chunk = JSON.parse(trimmed);
            if (chunk.type === "meta") {
              setMeta(chunk as PlanMeta);
              setLoading(false);
            } else if (chunk.type === "video") {
              const v = chunk as PlanVideo;
              const video: VideoIdea = {
                numero: v.numero,
                titulo: v.titulo,
                hook: v.hook,
                formato: v.formato,
                duracionIdeal: v.duracionIdeal,
                porque: v.porque,
                semana: v.semana,
                busquedasMes: v.busquedasMes || "",
                competencia: v.competencia || "",
              };
              setVideos(prev => [...prev, video]);
              setNewestVideoNum(v.numero);
            }
          } catch {
            // línea incompleta, ignorar
          }
        }
      }

      setDone(true);
      setNewestVideoNum(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setLoading(false);
    }
  }

  const NICHOS_SUGERIDOS = [
    "Finanzas personales", "Canal faceless motivación", "IA y tecnología",
    "Inversiones en bolsa", "Emprendimiento digital", "True crime español",
  ];

  const groups = groupBySemana(videos);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Calendar className="w-3.5 h-3.5" />
            30 videos · 12 semanas · Streaming en tiempo real
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Plan de Contenido{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">con IA</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            La IA genera los videos uno a uno en tiempo real. Verás cómo aparecen mientras se crean.
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Nicho del canal *</label>
              <input
                value={nicho}
                onChange={e => setNicho(e.target.value)}
                placeholder="Ej: finanzas personales, true crime, IA..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {NICHOS_SUGERIDOS.map(n => (
                  <button key={n} onClick={() => setNicho(n)}
                    className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded-full transition-colors">
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Nombre del canal (opcional)</label>
              <input
                value={canalNombre}
                onChange={e => setCanalNombre(e.target.value)}
                placeholder="Ej: Mi Canal de Finanzas"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Formato</label>
              <div className="flex gap-2">
                <button onClick={() => setFaceless(true)}
                  className={cn("flex-1 py-2 text-xs rounded-xl border transition-colors", faceless ? "bg-violet-600 border-violet-500 text-white" : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600")}>
                  Faceless
                </button>
                <button onClick={() => setFaceless(false)}
                  className={cn("flex-1 py-2 text-xs rounded-xl border transition-colors", !faceless ? "bg-violet-600 border-violet-500 text-white" : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600")}>
                  Con cámara
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Idioma</label>
              <select value={idioma} onChange={e => setIdioma(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500">
                <option value="español">Español</option>
                <option value="inglés">Inglés</option>
                <option value="español latino">Español Latino</option>
              </select>
            </div>
          </div>

          {/* Duración preferida */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-400">Duración preferida de videos</label>
              <button
                onClick={() => setIncluyeShorts(v => !v)}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors",
                  incluyeShorts
                    ? "bg-pink-600/20 border-pink-500/40 text-pink-300"
                    : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600"
                )}
              >
                <Play className="w-3 h-3" />
                {incluyeShorts ? "Incluyendo Shorts/Reels ✓" : "+ Incluir Shorts/Reels"}
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {DURACIONES.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDuracionPref(d.value)}
                  className={cn(
                    "flex flex-col items-center py-2 px-1 rounded-xl border text-center transition-colors",
                    duracionPref === d.value
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                  )}
                >
                  <span className="text-xs font-semibold">{d.label}</span>
                  <span className={cn("text-[10px] mt-0.5", duracionPref === d.value ? "text-violet-200" : "text-slate-600")}>{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerar}
            disabled={loading || !nicho.trim()}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Generando videos...</>
            ) : (
              <><Sparkles className="w-4 h-4" />Generar plan de 30 videos</>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300/80 text-sm">{error}</p>
          </div>
        )}

        {/* Resultados streaming */}
        {(meta || videos.length > 0) && (
          <div className="space-y-6">
            {/* Meta */}
            {meta && (
              <div className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-bold text-xl text-slate-100">{meta.nicho}</h2>
                    <p className="text-slate-400 text-sm mt-1">{meta.resumen}</p>
                  </div>
                  {done && (
                    <div className="flex gap-2 shrink-0">
                      {isLoggedIn && (
                        <button
                          onClick={() => guardar("plan", meta.nicho, { nicho: meta.nicho, resumen: meta.resumen, videos: videos.map(v => ({ numero: v.numero, titulo: v.titulo, semana: v.semana })) })}
                          disabled={guardando || guardado}
                          className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-2 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                          {guardado ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                          {guardado ? "Guardado" : guardando ? "..." : "Guardar"}
                        </button>
                      )}
                      <button onClick={() => exportPlan(meta, videos)}
                        className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                        <Download className="w-3.5 h-3.5" /> Exportar
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Frecuencia</p>
                    <p className="text-slate-200 text-sm font-semibold">{meta.frecuenciaRecomendada}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Patrón de títulos</p>
                    <p className="text-slate-200 text-sm font-semibold">{meta.patronTitulos}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Progreso</p>
                    <p className="text-slate-200 text-sm font-semibold">
                      {videos.length} / 30 videos {done ? "✓" : "generando..."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress bar */}
            {!done && videos.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-violet-400" />
                    Generando video {newestVideoNum}...
                  </span>
                  <span>{videos.length}/30</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${(videos.length / 30) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Fases */}
            {videos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { label: "Anzuelo", range: "1-5", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
                  { label: "Autoridad", range: "6-15", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
                  { label: "Viral", range: "16-25", color: "text-red-400 bg-red-400/10 border-red-400/20" },
                  { label: "Evergreen", range: "26-30", color: "text-green-400 bg-green-400/10 border-green-400/20" },
                ].map(f => (
                  <div key={f.label} className={cn("border rounded-xl py-2 px-3", f.color)}>
                    <div className="font-bold">{f.label}</div>
                    <div className="opacity-70">Videos {f.range}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Toggle vista */}
            {videos.length > 0 && (
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <Play className="w-4 h-4 text-violet-400" />
                  {videos.length} videos {done ? "generados" : "y contando..."}
                </h3>
                <div className="flex gap-1">
                  <button onClick={() => setVistaActiva("semanas")}
                    className={cn("text-xs px-3 py-1.5 rounded-lg transition-colors", vistaActiva === "semanas" ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>
                    Por semana
                  </button>
                  <button onClick={() => setVistaActiva("lista")}
                    className={cn("text-xs px-3 py-1.5 rounded-lg transition-colors", vistaActiva === "lista" ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>
                    Lista
                  </button>
                </div>
              </div>
            )}

            {vistaActiva === "semanas" && Object.keys(groups).length > 0 && (
              <div className="space-y-6">
                {Object.keys(groups).map(Number).sort((a, b) => a - b).map(semana => (
                  <div key={semana}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Semana {semana}</span>
                      <div className="flex-1 h-px bg-slate-800" />
                      <span className="text-xs text-slate-600">{groups[semana].length} videos</span>
                    </div>
                    <div className="space-y-2">
                      {groups[semana].map(v => (
                        <VideoCard key={v.numero} video={v} isNew={v.numero === newestVideoNum} nicho={nicho} faceless={faceless} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {vistaActiva === "lista" && (
              <div className="space-y-2">
                {videos.map(v => (
                  <VideoCard key={v.numero} video={v} isNew={v.numero === newestVideoNum} nicho={nicho} faceless={faceless} />
                ))}
              </div>
            )}

            {/* Consejos — solo cuando termina */}
            {done && meta && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                <h4 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-yellow-400" />
                  Consejos para este nicho
                </h4>
                <div className="space-y-3">
                  {meta.consejosGenerales.map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <Target className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                      <p className="text-slate-300 text-sm">{c}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PlanPageContent />
    </Suspense>
  );
}
