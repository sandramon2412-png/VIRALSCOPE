"use client";

import { useState } from "react";
import Link from "next/link";
import GlobalNav from "@/components/GlobalNav";
import {
  Loader2,
  MessageSquare,
  Lightbulb,
  HelpCircle,
  Tag,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface IdeaContenido {
  idea: string;
  tipo: "pregunta" | "sugerencia" | "queja" | "elogio";
  frecuencia: number;
  prioridad: "Alta" | "Media" | "Baja";
}

interface ComentariosResult {
  sentimiento: {
    positivo: number;
    neutro: number;
    negativo: number;
    emocionPrincipal: string;
  };
  ideasDeContenido: IdeaContenido[];
  preguntasFrecuentes: string[];
  palabrasClave: string[];
  resumen: string;
  recomendacion: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<
  IdeaContenido["tipo"],
  { label: string; color: string; bg: string }
> = {
  pregunta: {
    label: "Pregunta",
    color: "text-blue-400",
    bg: "bg-blue-500/15 border-blue-500/30",
  },
  sugerencia: {
    label: "Sugerencia",
    color: "text-purple-400",
    bg: "bg-purple-500/15 border-purple-500/30",
  },
  queja: {
    label: "Queja",
    color: "text-red-400",
    bg: "bg-red-500/15 border-red-500/30",
  },
  elogio: {
    label: "Elogio",
    color: "text-green-400",
    bg: "bg-green-500/15 border-green-500/30",
  },
};

const PRIORIDAD_CONFIG: Record<
  IdeaContenido["prioridad"],
  { color: string; bg: string }
> = {
  Alta: { color: "text-red-400", bg: "bg-red-500/15 border-red-500/30" },
  Media: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/15 border-yellow-500/30",
  },
  Baja: {
    color: "text-green-400",
    bg: "bg-green-500/15 border-green-500/30",
  },
};

const EMOCION_EMOJI: Record<string, string> = {
  Curiosidad: "🔍",
  Gratitud: "❤️",
  Frustración: "😤",
  Entusiasmo: "🔥",
  Confusión: "🤔",
  Inspiración: "✨",
  Escepticismo: "🤨",
  Admiración: "🌟",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ComentariosPage() {
  const [comentarios, setComentarios] = useState("");
  const [videoTitulo, setVideoTitulo] = useState("");
  const [nicho, setNicho] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComentariosResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preguntasOpen, setPreguntasOpen] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const MAX_CHARS = 5000;

  async function handleAnalizar() {
    if (!comentarios.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comentarios, nicho, videoTitulo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error del servidor");
      setResult(data as ComentariosResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.10) 0%, transparent 50%), #0a0814",
      }}
    >
      <GlobalNav />

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            💬 Analizador de Comentarios con IA
          </h1>
          <p className="text-white/55 text-base max-w-2xl mx-auto">
            Pega los comentarios de cualquier video viral y la IA extrae ideas
            de contenido, preguntas frecuentes y sentimiento
          </p>
        </div>

        {/* Input section */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          {/* Comentarios textarea */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-white/70 mb-2">
              Comentarios del video
            </label>
            <textarea
              value={comentarios}
              onChange={(e) =>
                setComentarios(e.target.value.slice(0, MAX_CHARS))
              }
              placeholder="Pega aquí los comentarios del video (uno por línea o copiados directo de YouTube)..."
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none outline-none focus:ring-2 focus:ring-purple-500/50 transition"
              style={{
                minHeight: 200,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <div className="text-right text-xs text-white/30 mt-1">
              {comentarios.length}/{MAX_CHARS}
            </div>
          </div>

          {/* Video título + nicho */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">
                ¿Cuál es el título del video?
              </label>
              <input
                type="text"
                value={videoTitulo}
                onChange={(e) => setVideoTitulo(e.target.value)}
                placeholder="Ej: Los 10 errores que destruyen tu canal..."
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">
                Nicho del canal
              </label>
              <input
                type="text"
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                placeholder="Ej: Finanzas, Fitness, Tecnología..."
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>
          </div>

          {/* Tip */}
          <div
            className="rounded-xl px-4 py-3 mb-5 text-sm text-white/55"
            style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}
          >
            💡 <strong className="text-white/70">Cómo copiar comentarios:</strong> en YouTube,
            selecciona los comentarios visibles, copia y pega aquí. Con
            extensiones como{" "}
            <span className="text-purple-400">
              &apos;YouTube Comment Downloader&apos;
            </span>{" "}
            puedes exportarlos todos.
          </div>

          <button
            onClick={handleAnalizar}
            disabled={loading || !comentarios.trim()}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                loading || !comentarios.trim()
                  ? "rgba(139,92,246,0.3)"
                  : "linear-gradient(135deg, #8b5cf6, #ec4899)",
              boxShadow:
                !loading && comentarios.trim()
                  ? "0 4px 20px rgba(139,92,246,0.35)"
                  : "none",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analizando
                comentarios...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Analizar Comentarios
              </>
            )}
          </button>

          {error && (
            <p className="mt-3 text-red-400 text-sm text-center">{error}</p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Sentimiento */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  Sentimiento de la audiencia
                </h2>
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.35)" }}
                >
                  {EMOCION_EMOJI[result.sentimiento.emocionPrincipal] || "💬"}{" "}
                  {result.sentimiento.emocionPrincipal}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Positivo */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 font-semibold text-sm">😊 Positivo</span>
                    <span className="text-green-400 font-black text-xl">
                      {result.sentimiento.positivo}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-1000"
                      style={{ width: `${result.sentimiento.positivo}%` }}
                    />
                  </div>
                </div>
                {/* Neutro */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.2)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 font-semibold text-sm">😐 Neutro</span>
                    <span className="text-slate-400 font-black text-xl">
                      {result.sentimiento.neutro}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-500 transition-all duration-1000"
                      style={{ width: `${result.sentimiento.neutro}%` }}
                    />
                  </div>
                </div>
                {/* Negativo */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-400 font-semibold text-sm">😤 Negativo</span>
                    <span className="text-red-400 font-black text-xl">
                      {result.sentimiento.negativo}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-500 transition-all duration-1000"
                      style={{ width: `${result.sentimiento.negativo}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ideas de contenido */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <h2 className="font-bold text-lg flex items-center gap-2 mb-5">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Ideas de contenido extraídas
              </h2>
              <div className="space-y-3">
                {result.ideasDeContenido.map((idea, i) => {
                  const tipoCfg = TIPO_CONFIG[idea.tipo] || TIPO_CONFIG.sugerencia;
                  const priCfg = PRIORIDAD_CONFIG[idea.prioridad] || PRIORIDAD_CONFIG.Media;
                  return (
                    <div
                      key={i}
                      className="rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-white mb-2">
                          {idea.idea}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tipoCfg.color} ${tipoCfg.bg}`}
                          >
                            {tipoCfg.label}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priCfg.color} ${priCfg.bg}`}
                          >
                            {idea.prioridad}
                          </span>
                          <span className="text-xs text-white/40">
                            mencionado {idea.frecuencia} vece{idea.frecuencia !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/crear-contenido?titulo=${encodeURIComponent(idea.idea)}&nicho=${encodeURIComponent(nicho)}`}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 transition-colors hover:text-white"
                        style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}
                      >
                        ➕ Crear video sobre esto
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preguntas frecuentes */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(139,92,246,0.2)" }}
            >
              <button
                onClick={() => setPreguntasOpen(!preguntasOpen)}
                className="w-full flex items-center justify-between p-6 transition-colors hover:bg-white/5"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                  Preguntas frecuentes ({result.preguntasFrecuentes.length})
                </h2>
                {preguntasOpen ? (
                  <ChevronUp className="w-5 h-5 text-white/40" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40" />
                )}
              </button>

              {preguntasOpen && (
                <div
                  className="px-6 pb-6 space-y-3"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  {result.preguntasFrecuentes.map((q, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-blue-500/20 text-blue-400">
                          {i + 1}
                        </span>
                        <p className="text-sm text-white/80">{q}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleCopy(q, i + 100)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors"
                          title="Copiar"
                        >
                          {copiedIdx === i + 100 ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <Link
                          href={`/crear-contenido?titulo=${encodeURIComponent(q)}&nicho=${encodeURIComponent(nicho)}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 transition-colors hover:text-white"
                          style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}
                        >
                          ➕ Crear video
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Palabras clave */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-pink-400" />
                Palabras clave más mencionadas
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.palabrasClave.map((word, i) => {
                  const sizes = [
                    "text-xl font-black",
                    "text-lg font-bold",
                    "text-base font-semibold",
                    "text-sm font-medium",
                    "text-xs font-medium",
                  ];
                  const sizeCls = sizes[Math.min(i, sizes.length - 1)];
                  const opacity = Math.max(0.4, 1 - i * 0.07);
                  return (
                    <span
                      key={i}
                      className={`px-3 py-1.5 rounded-full ${sizeCls} text-purple-300`}
                      style={{
                        background: `rgba(139,92,246,${0.08 + (0.15 * (result.palabrasClave.length - i)) / result.palabrasClave.length})`,
                        border: "1px solid rgba(139,92,246,0.25)",
                        opacity,
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Resumen y Recomendación */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.10), rgba(236,72,153,0.08))",
                border: "1px solid rgba(139,92,246,0.3)",
              }}
            >
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Resumen y recomendación
              </h2>
              <p className="text-white/75 text-sm mb-5 leading-relaxed">
                {result.resumen}
              </p>
              <div
                className="rounded-xl p-4 mb-5"
                style={{
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.35)",
                }}
              >
                <p className="text-xs text-purple-300 font-semibold mb-1">
                  📝 Próximo video recomendado:
                </p>
                <p className="text-white font-semibold text-sm">
                  {result.recomendacion}
                </p>
              </div>
              <Link
                href={`/crear-contenido?titulo=${encodeURIComponent(result.recomendacion)}&nicho=${encodeURIComponent(nicho)}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                  boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
                }}
              >
                🚀 Crear este video
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
