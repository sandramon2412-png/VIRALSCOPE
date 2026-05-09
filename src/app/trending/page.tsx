"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame, Search, Loader2, AlertCircle, TrendingUp,
  Eye, ThumbsUp, MessageCircle, Clock, ExternalLink,
  ChevronRight, Zap, Calendar, DollarSign, Plus, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatDate } from "@/lib/utils";
import OutlierBadge from "@/components/OutlierBadge";
import GlobalNav from "@/components/GlobalNav";
import type { TrendingVideo } from "@/app/api/trending/route";

const NICHOS_RAPIDOS = [
  "finanzas personales", "inteligencia artificial", "emprendimiento digital",
  "fitness en casa", "true crime", "motivación", "criptomonedas",
  "productividad", "marketing digital", "desarrollo personal",
  "cocina saludable", "viajes baratos", "programación", "bienes raíces",
];

const PERIODOS = [
  { value: "7d", label: "7 días", icon: "🔥" },
  { value: "30d", label: "30 días", icon: "📈" },
  { value: "90d", label: "90 días", icon: "📊" },
];

const IDIOMAS = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "pt", label: "Portugués" },
];

const RPM_MAP: Array<{ keywords: string[]; min: number; max: number }> = [
  { keywords: ["finanz", "invers", "bolsa", "dinero", "ahorro", "deuda", "presupuest"], min: 8, max: 18 },
  { keywords: ["crypto", "bitcoin", "ethereum", "blockchain", "defi", "nft"], min: 12, max: 25 },
  { keywords: ["software", "saas", "tecnolog", "programac", "codigo", "developer"], min: 6, max: 15 },
  { keywords: ["marketing", "emprendimiento", "negocio", "empresa", "startup"], min: 5, max: 14 },
  { keywords: ["salud", "medicina", "fitness", "gym", "ejercicio", "nutricion"], min: 4, max: 10 },
  { keywords: ["relacion", "amor", "pareja", "psicolog", "autoestima"], min: 3, max: 8 },
  { keywords: ["gaming", "gamer", "videojuego", "minecraft", "fortnite"], min: 1, max: 4 },
  { keywords: ["cocina", "receta", "comida", "gastronomia"], min: 2, max: 6 },
  { keywords: ["viaje", "turismo", "aventura", "vlog"], min: 3, max: 8 },
  { keywords: ["historia", "documental", "misterio", "crimen", "true crime"], min: 3, max: 8 },
  { keywords: ["inteligencia artificial", " ia ", "chatgpt", "openai", "machine learning"], min: 5, max: 14 },
  { keywords: ["bienes raices", "inmobili", "propiedad"], min: 8, max: 20 },
  { keywords: ["religion", "biblia", "fe", "dios", "profecias", "espiritual"], min: 4, max: 10 },
];

function estimateRPM(query: string): { min: number; max: number } | null {
  const q = query.toLowerCase();
  for (const entry of RPM_MAP) {
    if (entry.keywords.some(k => q.includes(k))) {
      return { min: entry.min, max: entry.max };
    }
  }
  return { min: 2, max: 6 };
}

function fmtEarnings(views: number, rpm: { min: number; max: number }): string {
  const per100k = views / 100000;
  const min = Math.round(rpm.min * per100k);
  const max = Math.round(rpm.max * per100k);
  if (max >= 1000) return `$${(min/1000).toFixed(1)}K–$${(max/1000).toFixed(1)}K`;
  return `$${min}–$${max}`;
}

function TrendingCard({ video, rank, nicho }: { video: TrendingVideo; rank: number; nicho: string }) {
  const isTop3 = rank <= 3;
  const rankColors = ["text-yellow-400", "text-slate-300", "text-amber-600"];

  return (
    <div className={cn(
      "bg-slate-800/60 border rounded-xl overflow-hidden transition-all hover:border-slate-500 group",
      isTop3 ? "border-violet-500/30" : "border-slate-700/50"
    )}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-900">
        {video.thumbnail && (
          <Image
            src={video.thumbnail}
            alt={video.titulo}
            fill
            className="object-cover"
            unoptimized
          />
        )}
        {/* Rank badge */}
        <div className={cn(
          "absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg",
          isTop3 ? "bg-slate-900/90" : "bg-slate-900/80"
        )}>
          <span className={isTop3 ? rankColors[rank - 1] : "text-slate-400"}>
            {rank}
          </span>
        </div>
        {/* Outlier badge */}
        <div className="absolute top-2 right-2">
          <OutlierBadge score={video.outlierScore} rating={video.viralityRating} size="sm" />
        </div>
        {/* Faceless detection */}
        {(() => {
          const text = (video.titulo || "").toLowerCase();
          const facelessKws = ["animac", "narraci", "faceless", "voz en off", "documental", "historia de", "misterio", "true crime", "motivaci", "curiosidades", "datos curiosos", "top 10", "explicado", "iceberg", "ia ", "inteligencia artificial"];
          const isFaceless = facelessKws.some(k => text.includes(k));
          if (!isFaceless) return null;
          return (
            <div className="absolute bottom-2 left-2">
              <span className="flex items-center gap-1 text-[10px] bg-violet-900/80 text-violet-300 border border-violet-500/40 rounded-full px-1.5 py-0.5 backdrop-blur-sm font-medium">
                <User className="w-2.5 h-2.5" /> Faceless
              </span>
            </div>
          );
        })()}
        {/* Duration */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
          {video.duracion}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="text-slate-100 text-sm font-semibold leading-tight line-clamp-2 group-hover:text-violet-300 transition-colors">
          {video.titulo}
        </h3>

        <p className="text-slate-500 text-xs">{video.canal}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatNumber(video.vistas)}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            {formatNumber(video.likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {formatNumber(video.comentarios)}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {formatDate(video.publicadoEn)}
          </span>
        </div>

        {/* Outlier context */}
        {video.avgCanalViews > 0 && (
          <div className="bg-slate-900/60 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-500">
            Promedio del canal:{" "}
            <span className="text-slate-300 font-semibold">{formatNumber(video.avgCanalViews)}</span>
            {" "}→ Este video:{" "}
            <span className={cn(
              "font-bold",
              video.outlierScore >= 10 ? "text-orange-400" :
              video.outlierScore >= 3 ? "text-green-400" :
              "text-slate-400"
            )}>
              {video.outlierScore}x
            </span>
          </div>
        )}

        {/* RPM estimate */}
        {(() => {
          const rpm = estimateRPM(nicho + " " + video.titulo);
          if (!rpm) return null;
          return (
            <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-800/30 rounded-lg px-2.5 py-1.5 text-[10px]">
              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                <DollarSign className="w-3 h-3" />
                {fmtEarnings(video.vistas, rpm)}
                <span className="text-emerald-700">est.</span>
              </div>
              <span className="text-slate-500">RPM ${rpm.min}–${rpm.max}</span>
            </div>
          );
        })()}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link
            href={`/crear-contenido?videoId=${video.id}&titulo=${encodeURIComponent(video.titulo)}&canal=${encodeURIComponent(video.canal)}&nicho=${encodeURIComponent(nicho)}&thumbnail=${encodeURIComponent(video.thumbnail || "")}`}
            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg text-white transition-colors"
            style={{ background: "linear-gradient(135deg, #ec4899, #f97316)" }}
          >
            <Plus className="w-3 h-3" /> Crear
          </Link>
          <a
            href={`https://youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Ver video
          </a>
          <Link
            href={`/?q=${encodeURIComponent(video.canal)}`}
            className="flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-300 transition-colors ml-auto"
          >
            Ver canal <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrendingPage() {
  const [nicho, setNicho] = useState("");
  const [periodo, setPeriodo] = useState("30d");
  const [idioma, setIdioma] = useState("es");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [lastNicho, setLastNicho] = useState("");

  async function handleBuscar(nichoOverride?: string) {
    const query = nichoOverride || nicho;
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setVideos([]);
    setLastNicho(query);
    if (nichoOverride) setNicho(nichoOverride);

    try {
      const params = new URLSearchParams({
        nicho: query,
        periodo,
        idioma,
        max: "20",
      });
      const res = await fetch(`/api/trending?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVideos(data.videos || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  // Stats del resultado
  const explosive = videos.filter(v => v.viralityRating === "explosive").length;
  const high = videos.filter(v => v.viralityRating === "high").length;
  const topVideo = videos[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Flame className="w-3.5 h-3.5" />
            Datos reales de YouTube · Actualizado en tiempo real
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Trending Topics{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              con Outlier Score
            </span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Descubre los videos que más están explotando en cualquier nicho. Calculamos cuántas veces supera cada video el promedio de su canal.
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 mb-6">
          {/* Search */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={nicho}
                onChange={e => setNicho(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleBuscar()}
                placeholder="Ej: finanzas personales, IA, true crime..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
            <button
              onClick={() => handleBuscar()}
              disabled={loading || !nicho.trim()}
              className="bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
              Ver trending
            </button>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-4">
            {/* Período */}
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Período</p>
              <div className="flex gap-1.5">
                {PERIODOS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPeriodo(p.value)}
                    className={cn(
                      "flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-colors",
                      periodo === p.value
                        ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                    )}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Idioma */}
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Idioma</p>
              <div className="flex gap-1.5">
                {IDIOMAS.map(i => (
                  <button
                    key={i.value}
                    onClick={() => setIdioma(i.value)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-lg border transition-colors",
                      idioma === i.value
                        ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                    )}
                  >
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Nichos rápidos */}
          <div className="mt-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Nichos populares</p>
            <div className="flex flex-wrap gap-1.5">
              {NICHOS_RAPIDOS.map(n => (
                <button
                  key={n}
                  onClick={() => handleBuscar(n)}
                  className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-2.5 py-1 rounded-full transition-colors capitalize"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300/80 text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-20 space-y-4">
            <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
            <p className="text-slate-400 text-sm">Buscando lo más viral en <span className="text-orange-400 font-semibold">{lastNicho}</span>...</p>
            <p className="text-slate-600 text-xs">Calculando Outlier Scores con datos reales de YouTube</p>
          </div>
        )}

        {/* Results */}
        {!loading && videos.length > 0 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-orange-400">{videos.length}</div>
                <div className="text-slate-500 text-xs mt-0.5">videos analizados</div>
              </div>
              <div className="bg-slate-800/60 border border-orange-500/20 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-orange-400">{explosive}</div>
                <div className="text-slate-500 text-xs mt-0.5">explosivos (10x+)</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-green-400">{high}</div>
                <div className="text-slate-500 text-xs mt-0.5">alto outlier (3x+)</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-violet-400 truncate">{topVideo?.outlierScore}x</div>
                <div className="text-slate-500 text-xs mt-0.5">mejor outlier score</div>
              </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                Trending en{" "}
                <span className="text-orange-400 capitalize">{lastNicho}</span>
                <span className="text-slate-600 text-sm font-normal">
                  · últimos {PERIODOS.find(p => p.value === periodo)?.label}
                </span>
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                Datos en tiempo real
              </div>
            </div>

            {/* Outlier legend */}
            <div className="flex flex-wrap gap-3 text-xs">
              {[
                { label: "Explosivo", range: "10x+", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
                { label: "Alto", range: "3-10x", color: "text-green-400 bg-green-500/10 border-green-500/20" },
                { label: "Medio", range: "1.5-3x", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                { label: "Normal", range: "<1.5x", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
              ].map(b => (
                <span key={b.label} className={cn("border rounded-full px-2.5 py-1 font-semibold", b.color)}>
                  {b.label} {b.range}
                </span>
              ))}
              <span className="text-slate-600 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Outlier Score = views del video ÷ promedio del canal
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video, i) => (
                <TrendingCard key={video.id} video={video} rank={i + 1} nicho={nicho} />
              ))}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-5 text-center">
              <p className="text-slate-300 text-sm font-semibold mb-1">
                ¿Encontraste algo interesante?
              </p>
              <p className="text-slate-500 text-xs mb-3">
                Genera un plan de 30 videos basado en estos temas o busca más información del nicho
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href={`/plan?nicho=${encodeURIComponent(lastNicho)}`}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  <Flame className="w-3.5 h-3.5" />
                  Plan de 30 videos con este nicho
                </Link>
                <Link
                  href={`/nichos`}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Ver RPM de este nicho
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && videos.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
              <Flame className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">¿Qué está explotando hoy?</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Elige un nicho y ve en tiempo real qué videos están superando el promedio de su canal. Encuentra los formatos y temas que el algoritmo está empujando.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
