"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, Flame, Loader2, AlertCircle, Users, Eye, Video,
  Sparkles, TrendingUp, Target, Clock, Zap, ChevronRight,
  Globe, Star, BarChart3, Bookmark, Check,
} from "lucide-react";
import OutlierBadge from "@/components/OutlierBadge";
import { CanalInfo, CanalVideo, CanalAnalysis } from "@/lib/canal-types";
import { formatNumber, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import NavAuth from "@/components/NavAuth";
import GlobalNav from "@/components/GlobalNav";
import { useGuardar } from "@/hooks/useGuardar";

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-semibold text-slate-200">{value}/10</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}

function VideoMiniCard({ video }: { video: CanalVideo }) {
  return (
    <div className="flex gap-3 bg-slate-900/50 rounded-xl p-3 hover:bg-slate-900 transition-colors">
      <div className="relative w-24 h-14 shrink-0 bg-slate-800 rounded-lg overflow-hidden">
        {video.thumbnail && (
          <Image src={video.thumbnail} alt={video.titulo} fill className="object-cover" unoptimized />
        )}
        <div className="absolute bottom-1 right-1">
          <OutlierBadge score={video.outlierScore} rating={video.viralityRating} size="sm" />
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-xs text-slate-200 font-medium leading-tight line-clamp-2">{video.titulo}</p>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(video.vistas)}</span>
          <span>{video.duracion}</span>
          <span>{formatDate(video.publicadoEn)}</span>
        </div>
      </div>
    </div>
  );
}

function EmulationPanel({ analysis }: { analysis: CanalAnalysis }) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
          <Target className="w-5 h-5 text-violet-400 mx-auto mb-2" />
          <div className="text-slate-100 font-bold text-sm">{analysis.nicho}</div>
          <div className="text-slate-500 text-xs">{analysis.subnicho}</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
          <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <div className="text-slate-100 font-bold text-sm">{analysis.frecuenciaIdeal}</div>
          <div className="text-slate-500 text-xs">frecuencia ideal</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
          <div className="text-slate-100 font-bold text-sm">{analysis.tiempoEstimadoResultados}</div>
          <div className="text-slate-500 text-xs">tiempo estimado</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
          <BarChart3 className="w-5 h-5 text-orange-400 mx-auto mb-2" />
          <ScoreBar label="Dificultad de competir" value={analysis.dificultadCompetir} color="bg-orange-500" />
        </div>
      </div>

      {/* Estilo + patrón títulos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-400" /> Estilo del canal
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">{analysis.estilo}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {analysis.formatosDominantes.map(f => (
              <span key={f} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2.5 py-0.5">{f}</span>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-yellow-400" /> Patrón de títulos
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">{analysis.patronTitulos}</p>
          <div className="mt-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Oportunidad</p>
            <p className="text-slate-300 text-xs leading-relaxed">{analysis.oportunidad}</p>
          </div>
        </div>
      </div>

      {/* Fortalezas y debilidades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-green-400 mb-3">Fortalezas del canal</h4>
          <ul className="space-y-2">
            {analysis.fortalezas.map((f, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-300">
                <span className="text-green-400 shrink-0">✓</span>{f}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-red-400 mb-3">Puntos débiles (tu ventaja)</h4>
          <ul className="space-y-2">
            {analysis.debilidades.map((d, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-300">
                <span className="text-red-400 shrink-0">→</span>{d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Estrategia de emulación */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-violet-400" /> Estrategia de emulación (5 pasos)
        </h4>
        <div className="space-y-3">
          {analysis.estrategiaEmulacion.map((paso, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-slate-300 text-xs leading-relaxed pt-0.5">{paso}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plan de acción */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-blue-400" /> Plan de acción semana a semana
        </h4>
        <div className="space-y-3">
          {analysis.planAccion.map((accion, i) => (
            <div key={i} className="flex gap-3 pb-3 border-b border-slate-700/50 last:border-0 last:pb-0">
              <div className="w-1 bg-gradient-to-b from-violet-500 to-blue-500 rounded-full shrink-0" />
              <p className="text-slate-300 text-xs leading-relaxed">{accion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords */}
      <div>
        <p className="text-xs font-semibold text-slate-400 mb-2">Keywords del nicho</p>
        <div className="flex flex-wrap gap-2">
          {analysis.keywords.map(k => (
            <Link
              key={k}
              href={`/?q=${encodeURIComponent(k)}`}
              className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-3 py-1 hover:bg-violet-500/20 transition-colors flex items-center gap-1"
            >
              {k} <ChevronRight className="w-3 h-3" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CanalPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEmular, setLoadingEmular] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canal, setCanal] = useState<CanalInfo | null>(null);
  const [videos, setVideos] = useState<CanalVideo[]>([]);
  const [analysis, setAnalysis] = useState<CanalAnalysis | null>(null);
  const { guardar, guardando, guardado, isLoggedIn } = useGuardar();

  async function handleBuscar() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setCanal(null);
    setVideos([]);
    setAnalysis(null);

    try {
      const res = await fetch(`/api/canal?canal=${encodeURIComponent(input.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCanal(data.canal);
      setVideos(data.videos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmular() {
    if (!canal) return;
    setLoadingEmular(true);
    try {
      const res = await fetch("/api/emular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canal, videos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al analizar");
    } finally {
      setLoadingEmular(false);
    }
  }

  const EJEMPLOS = ["@juanlombana", "@luisitocomunica", "@midudev", "@vegetta777", "@destripandolahistoria"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Users className="w-3.5 h-3.5" />
            Analiza y emula cualquier canal
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Analizador de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">
              Canales de YouTube
            </span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Pega la URL o @handle de cualquier canal. La IA analiza su estrategia y te da un plan para emularlo.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                placeholder="@handle, youtube.com/@canal, o nombre del canal..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <button
              onClick={handleBuscar}
              disabled={loading || !input.trim()}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Analizar
            </button>
          </div>
          {!canal && !loading && (
            <div className="mt-3 flex flex-wrap gap-2">
              {EJEMPLOS.map(e => (
                <button key={e} onClick={() => { setInput(e); }}
                  className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300/80 text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
            <p className="text-slate-400 text-sm">Analizando canal y calculando Outlier Scores...</p>
          </div>
        )}

        {/* Results */}
        {canal && !loading && (
          <div className="space-y-6">
            {/* Canal header */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
              {canal.banner && (
                <div className="relative h-32 bg-slate-900">
                  <Image src={canal.banner} alt="banner" fill className="object-cover opacity-60" unoptimized />
                </div>
              )}
              <div className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {canal.avatar && (
                  <Image
                    src={canal.avatar}
                    alt={canal.nombre}
                    width={72}
                    height={72}
                    className="rounded-full border-2 border-slate-700"
                    unoptimized
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-100">{canal.nombre}</h2>
                    {isLoggedIn && (
                      <button
                        onClick={() => guardar("canal", canal.nombre, { nombre: canal.nombre, handle: canal.handle, suscriptores: canal.suscriptores, totalVideos: canal.totalVideos })}
                        disabled={guardando || guardado}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors disabled:opacity-50"
                      >
                        {guardado ? <Check className="w-3 h-3 text-green-400" /> : <Bookmark className="w-3 h-3" />}
                        {guardado ? "Guardado" : "Guardar"}
                      </button>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm">{canal.handle}</p>
                  {canal.pais !== "Desconocido" && (
                    <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3" />{canal.pais}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-slate-100 font-bold text-lg">{formatNumber(canal.suscriptores)}</div>
                    <div className="text-slate-500 text-xs flex items-center justify-center gap-1"><Users className="w-3 h-3" />subs</div>
                  </div>
                  <div>
                    <div className="text-slate-100 font-bold text-lg">{formatNumber(canal.totalVistas)}</div>
                    <div className="text-slate-500 text-xs flex items-center justify-center gap-1"><Eye className="w-3 h-3" />vistas</div>
                  </div>
                  <div>
                    <div className="text-slate-100 font-bold text-lg">{formatNumber(canal.totalVideos)}</div>
                    <div className="text-slate-500 text-xs flex items-center justify-center gap-1"><Video className="w-3 h-3" />videos</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Videos más virales */}
              <div>
                <h3 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  Top videos por Outlier Score
                </h3>
                <div className="space-y-2">
                  {videos.slice(0, 8).map(v => <VideoMiniCard key={v.id} video={v} />)}
                </div>
              </div>

              {/* Emular con IA */}
              <div>
                {!analysis ? (
                  <div className="bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px] gap-4">
                    <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200 text-lg mb-2">Emular estrategia con IA</h3>
                      <p className="text-slate-400 text-sm max-w-xs">
                        Claude analizará los {videos.length} videos del canal y te dará un plan completo para replicar su éxito.
                      </p>
                    </div>
                    <button
                      onClick={handleEmular}
                      disabled={loadingEmular}
                      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                      {loadingEmular ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Analizando con IA...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" />Emular este canal</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      Análisis de emulación
                    </h3>
                    <EmulationPanel analysis={analysis} />
                  </div>
                )}
              </div>
            </div>

            {/* Si ya hay analysis, moverlo debajo */}
            {analysis && (
              <div className="lg:hidden">
                <h3 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Análisis de emulación
                </h3>
                <EmulationPanel analysis={analysis} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
