"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import GlobalNav from "@/components/GlobalNav";
import {
  Flame,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Eye,
  ThumbsUp,
  Calendar,
  Zap,
  Lightbulb,
  Target,
  ImageIcon,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Dna,
} from "lucide-react";

interface TituloAdaptado {
  titulo: string;
  formula: string;
  ctrScore: number;
}

interface OutlierKit {
  video: {
    id: string;
    titulo: string;
    canal: string;
    views: number;
    likes: number;
    outlierScore: number;
    thumbnail: string;
    publishedAt: string;
  };
  analisis: {
    formulaTitulo: string;
    estructuraHook: string;
    porQueViral: string;
    emocionPrincipal: string;
    patternInterrupt: string;
    retencionEstrategia: string;
  };
  kit: {
    titulosAdaptados: TituloAdaptado[];
    hookAdaptado: string;
    promptMiniatura: string;
    nichoSugerido: string;
    angulo: string;
  };
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
}

function getOutlierColor(score: number): string {
  if (score >= 3) return "text-green-400 bg-green-500/10 border-green-500/30";
  if (score >= 1.5) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  return "text-slate-400 bg-slate-500/10 border-slate-500/30";
}

function getEmocionColor(emocion: string): string {
  const map: Record<string, string> = {
    Curiosidad: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    Miedo: "text-red-400 bg-red-500/10 border-red-500/30",
    Esperanza: "text-green-400 bg-green-500/10 border-green-500/30",
    Sorpresa: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    Codicia: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    Envidia: "text-pink-400 bg-pink-500/10 border-pink-500/30",
    Orgullo: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  };
  return map[emocion] ?? "text-slate-400 bg-slate-500/10 border-slate-500/30";
}

function getCtrColor(score: number): string {
  if (score >= 85) return "from-green-500 to-emerald-400";
  if (score >= 70) return "from-yellow-500 to-amber-400";
  return "from-orange-500 to-red-400";
}

function OutlierContent() {
  const [videoUrl, setVideoUrl] = useState("");
  const [nicho, setNicho] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OutlierKit | null>(null);

  const [copiedHook, setCopiedHook] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedTitulo, setCopiedTitulo] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAnalizar() {
    if (!videoUrl.trim()) {
      setError("Por favor pega la URL del video viral.");
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/outlier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: videoUrl.trim(), nicho: nicho.trim() || undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data as OutlierKit);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al analizar el video");
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string, type: "hook" | "prompt" | number) {
    navigator.clipboard.writeText(text);
    if (type === "hook") {
      setCopiedHook(true);
      setTimeout(() => setCopiedHook(false), 2000);
    } else if (type === "prompt") {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else {
      setCopiedTitulo(type);
      setTimeout(() => setCopiedTitulo(null), 2000);
    }
  }

  const firstTitle = result?.kit.titulosAdaptados?.[0]?.titulo ?? "";
  const nichoParam = result?.kit.nichoSugerido ?? nicho;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GlobalNav />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 border border-orange-500/30 bg-orange-500/10">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-xs font-semibold tracking-wide">ANÁLISIS OUTLIER</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight flex items-center gap-3">
            <Flame size={40} style={{ color: "#a78bfa" }} /> Outlier{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #f472b6, #fb923c)" }}
            >
              por Video
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Pega cualquier video viral → obtén el kit completo para replicarlo
          </p>
        </div>

        {/* Input card */}
        <div
          className="rounded-2xl p-6 mb-8 border border-slate-700/50"
          style={{ background: "rgba(15,10,30,0.6)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              ref={inputRef}
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalizar()}
              placeholder="Pega la URL del video viral... (youtube.com/watch?v=... o youtu.be/...)"
              className="flex-1 bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-colors text-sm"
            />
            <input
              type="text"
              value={nicho}
              onChange={(e) => setNicho(e.target.value)}
              placeholder="Nicho (opcional)"
              className="md:w-48 bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-colors text-sm"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleAnalizar}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{
              background: loading
                ? "rgba(139,92,246,0.3)"
                : "linear-gradient(135deg, #8b5cf6, #ec4899)",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analizando video...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Analizar Video
              </>
            )}
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-6 border border-slate-700/50 animate-pulse"
                style={{ background: "rgba(15,10,30,0.6)" }}
              >
                <div className="h-40 bg-slate-800/60 rounded-xl mb-4" />
                <div className="h-4 bg-slate-800/60 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-800/60 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            {/* Two-column: Video info + Análisis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Left: Video info card */}
              <div
                className="rounded-2xl border border-slate-700/50 overflow-hidden"
                style={{ background: "rgba(15,10,30,0.6)", backdropFilter: "blur(12px)" }}
              >
                {result.video.thumbnail && (
                  <div className="relative w-full aspect-video bg-slate-900">
                    <Image
                      src={result.video.thumbnail}
                      alt={result.video.titulo}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-white font-bold text-base leading-snug mb-2 line-clamp-2">
                    {result.video.titulo}
                  </h2>
                  <p className="text-slate-400 text-sm mb-4">{result.video.canal}</p>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-300">
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold">{formatNumber(result.video.views)}</span>
                      <span className="text-slate-500">vistas</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-300">
                      <ThumbsUp className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold">{formatNumber(result.video.likes)}</span>
                      <span className="text-slate-500">likes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-400">{formatDate(result.video.publishedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold ${getOutlierColor(result.video.outlierScore)}`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      {result.video.outlierScore}x{" "}
                      {""}
                    </span>
                    <span className="text-slate-500 text-xs">Outlier Score</span>
                  </div>
                </div>
              </div>

              {/* Right: Análisis */}
              <div
                className="rounded-2xl border border-slate-700/50 p-5 flex flex-col gap-4"
                style={{ background: "rgba(15,10,30,0.6)", backdropFilter: "blur(12px)" }}
              >
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-400" />
                  Análisis de Viralidad
                </h3>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">¿Por qué fue viral?</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.analisis.porQueViral}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Fórmula del título</p>
                  <span className="inline-block bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono px-3 py-1.5 rounded-lg">
                    {result.analisis.formulaTitulo}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Estructura del hook</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.analisis.estructuraHook}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Emoción principal</p>
                    <span
                      className={`inline-block border px-3 py-1 rounded-full text-sm font-medium ${getEmocionColor(result.analisis.emocionPrincipal)}`}
                    >
                      {result.analisis.emocionPrincipal}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Pattern Interrupt</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.analisis.patternInterrupt}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Estrategia de retención</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.analisis.retencionEstrategia}</p>
                </div>
              </div>
            </div>

            {/* Kit de Clonación — full width */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: "rgba(10,5,25,0.8)",
                borderColor: "transparent",
                backgroundClip: "padding-box",
                boxShadow: "0 0 0 1px rgba(139,92,246,0.35), 0 0 40px rgba(139,92,246,0.08)",
              }}
            >
              {/* Gradient top border */}
              <div
                className="h-1 w-full"
                style={{ background: "linear-gradient(90deg, #8b5cf6, #ec4899, #fb923c)" }}
              />

              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-2"><Dna size={20} style={{ color: "#a78bfa" }} /> Kit de Clonación</h2>
                  <p className="text-slate-400 text-sm">
                    Usa estos elementos para crear tu propio video con la misma fórmula
                  </p>
                </div>

                {/* Niche & Angle info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Target className="w-3 h-3" /> Nicho sugerido
                    </p>
                    <p className="text-white font-semibold text-sm">{result.kit.nichoSugerido}</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" /> Ángulo único
                    </p>
                    <p className="text-white font-semibold text-sm">{result.kit.angulo}</p>
                  </div>
                </div>

                {/* Títulos adaptados */}
                <div className="mb-6">
                  <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    3 Títulos con la misma fórmula
                  </h3>
                  <div className="flex flex-col gap-3">
                    {result.kit.titulosAdaptados.map((t, i) => (
                      <div
                        key={i}
                        className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <p className="text-white font-semibold text-sm leading-snug flex-1">
                            {t.titulo}
                          </p>
                          <button
                            onClick={() => copyText(t.titulo, i)}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
                          >
                            {copiedTitulo === i ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            {copiedTitulo === i ? "Copiado" : "Usar título"}
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded font-mono">
                            {t.formula}
                          </span>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${getCtrColor(t.ctrScore)} rounded-full`}
                                style={{ width: `${t.ctrScore}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 font-medium w-12 text-right">
                              CTR {t.ctrScore}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Link
                            href={`/crear-contenido?titulo=${encodeURIComponent(t.titulo)}&nicho=${encodeURIComponent(nichoParam)}`}
                            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <ArrowRight className="w-3 h-3" />
                            Crear contenido con este título
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hook adaptado */}
                <div className="mb-6">
                  <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    Hook adaptado
                  </h3>
                  <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4">
                    <p className="text-slate-200 text-sm leading-relaxed italic mb-3">
                      &ldquo;{result.kit.hookAdaptado}&rdquo;
                    </p>
                    <button
                      onClick={() => copyText(result.kit.hookAdaptado, "hook")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
                    >
                      {copiedHook ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedHook ? "Copiado" : "Copiar hook"}
                    </button>
                  </div>
                </div>

                {/* Prompt miniatura */}
                <div className="mb-8">
                  <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-pink-400" />
                    Prompt para miniatura
                  </h3>
                  <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4">
                    <p className="text-slate-300 text-sm leading-relaxed font-mono text-xs mb-4 whitespace-pre-wrap">
                      {result.kit.promptMiniatura}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => copyText(result.kit.promptMiniatura, "prompt")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
                      >
                        {copiedPrompt ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedPrompt ? "Copiado" : "Copiar prompt"}
                      </button>
                      <Link
                        href="/miniatura"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-300 hover:text-pink-200 text-xs font-medium transition-all"
                      >
                        <ImageIcon className="w-3 h-3" />
                        Crear imagen →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* CTA big button */}
                <Link
                  href={`/crear-contenido?titulo=${encodeURIComponent(firstTitle)}&nicho=${encodeURIComponent(nichoParam)}`}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899, #fb923c)" }}
                >
                  <ExternalLink className="w-5 h-5" />
                  🚀 Crear contenido completo
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !result && !error && (
          <div className="text-center py-16">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20"
              style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))" }}
            >
              <Flame className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">¿Listo para clonar el éxito?</h3>
            <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
              Pega la URL de cualquier video viral y obtén el kit completo: análisis de viralidad,
              fórmulas de título, hook adaptado y prompt para tu miniatura.
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                { icon: "🔍", label: "Análisis de viralidad" },
                { icon: "📝", label: "3 títulos adaptados" },
                { icon: "🎙️", label: "Hook listo para usar" },
                { icon: "🖼️", label: "Prompt de miniatura" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-900/50 border border-slate-700/40 rounded-xl p-3 text-center"
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-xs text-slate-400 leading-tight">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OutlierPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      }
    >
      <OutlierContent />
    </Suspense>
  );
}
