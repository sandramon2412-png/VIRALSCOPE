"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye, ThumbsUp, TrendingUp, Sparkles,
  ChevronDown, ChevronUp, Loader2, DollarSign, User, Plus,
} from "lucide-react";
import OutlierBadge from "./OutlierBadge";
import AnalysisPanel from "./AnalysisPanel";
import { VideoResult, AnalysisResult } from "@/lib/types";
import { formatNumber, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Faceless detection ───────────────────────────────────────────────────────
const FACELESS_KEYWORDS = [
  "animac", "animat", "narraci", "narrat", "faceless", "sin rostro",
  "voz en off", "voice over", "documental", "documentary", "explicaci",
  "historia de", "the story", "misterio", "mystery", "true crime",
  "motivaci", "productividad", "productivity", "shorts", "resumen",
  "curiosidades", "datos curiosos", "fun facts", "tutorial", "cómo",
  "inteligencia artificial", "ia ", "ai ", "ranked", "top 10", "top 5",
  "explicado", "explained", "iceberg", "compilaci",
];

function detectFaceless(title: string, description: string): boolean {
  const text = (title + " " + description).toLowerCase();
  return FACELESS_KEYWORDS.some(k => text.includes(k));
}

// ─── RPM estimation ───────────────────────────────────────────────────────────
const RPM_MAP: Array<{ keywords: string[]; min: number; max: number }> = [
  { keywords: ["finanzas", "inversión", "bolsa", "dinero", "ahorro", "deuda", "presupuesto"], min: 8, max: 18 },
  { keywords: ["crypto", "bitcoin", "ethereum", "blockchain", "defi", "nft"], min: 12, max: 25 },
  { keywords: ["seguro", "legal", "abogado", "impuesto", "fiscal"], min: 12, max: 30 },
  { keywords: ["software", "programación", "código", "developer", "saas", "startup"], min: 6, max: 15 },
  { keywords: ["marketing", "seo", "publicidad", "ventas", "negocio", "emprendimiento"], min: 5, max: 14 },
  { keywords: ["salud", "médico", "doctor", "bienestar", "nutrición", "dieta"], min: 4, max: 10 },
  { keywords: ["fitness", "ejercicio", "gym", "entrenamiento", "musculación"], min: 3, max: 8 },
  { keywords: ["ia", "inteligencia artificial", "chatgpt", "openai", "tecnología", "tech"], min: 5, max: 14 },
  { keywords: ["gaming", "videojuego", "minecraft", "fortnite", "game"], min: 1, max: 4 },
  { keywords: ["viaje", "travel", "turismo", "destino", "aventura"], min: 3, max: 8 },
  { keywords: ["cocina", "receta", "comida", "gastronomía", "chef"], min: 2, max: 6 },
  { keywords: ["motivación", "desarrollo personal", "productividad", "hábito", "mentalidad"], min: 3, max: 9 },
  { keywords: ["true crime", "crimen", "misterio", "documental"], min: 3, max: 7 },
  { keywords: ["entretenimiento", "humor", "comedia", "challenge"], min: 1, max: 3 },
  { keywords: ["bienes raíces", "inmobiliaria", "hipoteca", "renta"], min: 8, max: 20 },
];

function estimateRPM(query: string): { min: number; max: number } | null {
  if (!query) return null;
  const q = query.toLowerCase();
  for (const entry of RPM_MAP) {
    if (entry.keywords.some(k => q.includes(k))) {
      return { min: entry.min, max: entry.max };
    }
  }
  return { min: 2, max: 6 }; // default
}

function estimateEarnings(views: number, rpm: { min: number; max: number }) {
  const per100k = views / 100000;
  const min = Math.round(rpm.min * per100k);
  const max = Math.round(rpm.max * per100k);
  if (min < 1000) return `$${min}-$${max}`;
  return `$${(min / 1000).toFixed(1)}K-$${(max / 1000).toFixed(1)}K`;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  video: VideoResult;
  searchQuery?: string;
}

export default function VideoCard({ video, searchQuery = "" }: Props) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (analysis) {
      setOpen((v) => !v);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data);
      setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-200">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-900">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            Sin imagen
          </div>
        )}
        <div className="absolute top-2 right-2">
          <OutlierBadge score={video.outlierScore} rating={video.viralityRating} size="sm" />
        </div>
        {detectFaceless(video.title, video.description) && (
          <div className="absolute top-2 left-2">
            <span className="flex items-center gap-1 text-xs bg-violet-900/80 text-violet-300 border border-violet-500/40 rounded-full px-2 py-0.5 backdrop-blur-sm font-medium">
              <User className="w-3 h-3" /> Faceless
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2">
          {video.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="truncate max-w-[60%]">{video.channelTitle}</span>
          <span>{formatDate(video.publishedAt)}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center bg-slate-900/50 rounded-lg py-2 px-1">
            <Eye className="w-3.5 h-3.5 text-blue-400 mb-1" />
            <span className="text-slate-100 font-semibold">{formatNumber(video.viewCount)}</span>
            <span className="text-slate-500">vistas</span>
          </div>
          <div className="flex flex-col items-center bg-slate-900/50 rounded-lg py-2 px-1">
            <ThumbsUp className="w-3.5 h-3.5 text-green-400 mb-1" />
            <span className="text-slate-100 font-semibold">{formatNumber(video.likeCount)}</span>
            <span className="text-slate-500">likes</span>
          </div>
          <div className="flex flex-col items-center bg-slate-900/50 rounded-lg py-2 px-1">
            <TrendingUp className="w-3.5 h-3.5 text-orange-400 mb-1" />
            <span className="text-slate-100 font-semibold">{formatNumber(video.channelAvgViews)}</span>
            <span className="text-slate-500">media canal</span>
          </div>
        </div>

        {/* RPM / Earnings estimate */}
        {(() => {
          const rpm = estimateRPM(searchQuery);
          if (!rpm) return null;
          const earningsStr = estimateEarnings(video.viewCount, rpm);
          return (
            <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-800/30 rounded-xl px-3 py-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <DollarSign className="w-3.5 h-3.5" />
                <span className="font-semibold">{earningsStr}</span>
                <span className="text-emerald-600">est. ganancias</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <User className="w-3 h-3" />
                <span>RPM ${rpm.min}–${rpm.max}</span>
              </div>
            </div>
          );
        })()}

        {/* Crear Contenido button */}
        <Link
          href={`/crear-contenido?videoId=${video.id}&titulo=${encodeURIComponent(video.title)}&canal=${encodeURIComponent(video.channelTitle)}&nicho=${encodeURIComponent(searchQuery)}&thumbnail=${encodeURIComponent(video.thumbnail || "")}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white text-sm font-semibold transition-colors"
          style={{ background: "linear-gradient(135deg, #ec4899, #f97316)" }}
        >
          <Plus className="w-4 h-4" />
          Crear Contenido
        </Link>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando con IA...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analizar con IA
              {analysis && (open ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />)}
            </>
          )}
        </button>

        {error && (
          <p className="text-red-400 text-xs text-center">{error}</p>
        )}

        {/* Analysis panel */}
        {analysis && open && <AnalysisPanel analysis={analysis} />}
      </div>
    </div>
  );
}
