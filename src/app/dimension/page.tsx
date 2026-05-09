"use client";

import { useState } from "react";
import GlobalNav from "@/components/GlobalNav";
import { Copy, ExternalLink, Download, Loader2, ImageOff } from "lucide-react";

type Mode = "canal" | "video" | "manual";

interface HistoryItem {
  id: string;
  estilo: string;
  prompt: string;
  analisis: string;
  imageUrl?: string;
  loading?: boolean;
  error?: string;
  createdAt: Date;
}

const ESTILO_COLORS: Record<string, string> = {
  "Hyper-realistic Cinematic": "bg-teal-500/20 text-teal-300 border-teal-500/30",
  "3D Digital Illustration": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "Cinematic Unreal Engine 5 Render": "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

function getEstiloColor(estilo: string): string {
  return (
    ESTILO_COLORS[estilo] ||
    "bg-slate-500/20 text-slate-300 border-slate-500/30"
  );
}

export default function DimensionPage() {
  const [mode, setMode] = useState<Mode>("canal");
  const [input, setInput] = useState("");
  const [nicho, setNicho] = useState("");
  const [instruccion, setInstruccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const modeLabels: Record<Mode, string> = {
    canal: "URL o nombre del canal",
    video: "URL del video viral",
    manual: "Describe la miniatura que quieres",
  };

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dimension", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: mode, input: input.trim(), nicho, instruccion }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Error generando prompts");
        return;
      }
      const newItems: HistoryItem[] = data.prompts.map(
        (p: { estilo: string; prompt: string; analisis: string; seed: string }) => ({
          id: p.seed,
          estilo: p.estilo,
          prompt: p.prompt,
          analisis: p.analisis,
          createdAt: new Date(),
        })
      );
      setHistory((prev) => [...newItems, ...prev]);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateImage(item: HistoryItem) {
    setHistory((prev) =>
      prev.map((h) =>
        h.id === item.id ? { ...h, loading: true, error: undefined } : h
      )
    );
    try {
      const res = await fetch("/api/miniatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: item.estilo,
          prompt: item.prompt,
          nicho: nicho || "general",
          estilo: "impactante",
          variaciones: 1,
        }),
      });
      const data = await res.json();
      const url =
        data.url ||
        data.imageUrl ||
        data.images?.[0]?.url ||
        data.images?.[0] ||
        "";
      if (!url) {
        throw new Error(data.error || "No se obtuvo URL de imagen");
      }
      setHistory((prev) =>
        prev.map((h) =>
          h.id === item.id ? { ...h, loading: false, imageUrl: url } : h
        )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error generando imagen";
      setHistory((prev) =>
        prev.map((h) =>
          h.id === item.id ? { ...h, loading: false, error: msg } : h
        )
      );
    }
  }

  async function handleCopy(item: HistoryItem) {
    await navigator.clipboard.writeText(item.prompt);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 2000);
  }

  const MODES: { id: Mode; label: string }[] = [
    { id: "canal", label: "📺 Por Canal" },
    { id: "video", label: "🎬 Por Video" },
    { id: "manual", label: "✏️ Manual" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GlobalNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left sidebar ── */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-24 rounded-2xl bg-slate-800/60 border border-slate-700/50 p-6 flex flex-col gap-5">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  <span
                    style={{
                      background: "linear-gradient(135deg, #a78bfa, #ec4899)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Dimension
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Generador de prompts de miniaturas IA
                </p>
              </div>

              {/* Mode tabs */}
              <div className="flex rounded-xl bg-slate-900/60 p-1 gap-1">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex-1 text-xs py-2 px-1 rounded-lg font-medium transition-all ${
                      mode === m.id
                        ? "bg-violet-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Main input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {modeLabels[mode]}
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    mode === "canal"
                      ? "https://youtube.com/@canal o @canal"
                      : mode === "video"
                      ? "https://youtube.com/watch?v=..."
                      : "ej: gana dinero con IA en 2025..."
                  }
                  className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleGenerate()}
                />
              </div>

              {/* Nicho */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Nicho (opcional)
                </label>
                <input
                  type="text"
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  placeholder="ej: finanzas, gaming, motivación..."
                  className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-colors"
                />
              </div>

              {/* Instrucción adicional */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Instrucción adicional (opcional)
                </label>
                <textarea
                  value={instruccion}
                  onChange={(e) => setInstruccion(e.target.value)}
                  placeholder="ej: fondo negro, texto rojo, cara expresiva..."
                  rows={3}
                  className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-colors resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !input.trim()}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: loading
                    ? "rgba(139,92,246,0.4)"
                    : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(124,58,237,0.4)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generando prompts...
                  </>
                ) : (
                  "✨ Generar prompts"
                )}
              </button>
            </div>
          </aside>

          {/* ── Right main ── */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                Historial{" "}
                {history.length > 0 && (
                  <span className="text-sm font-normal text-slate-500">
                    ({history.length} prompts)
                  </span>
                )}
              </h2>
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">✨</div>
                <p className="text-slate-400 text-lg font-medium">
                  Genera tus primeros prompts ✨
                </p>
                <p className="text-slate-600 text-sm mt-2">
                  Elige un modo e ingresa una URL o tema para empezar
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((item) => (
                  <HistoryCard
                    key={item.id}
                    item={item}
                    copied={copied}
                    onCopy={handleCopy}
                    onCreateImage={handleCreateImage}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function HistoryCard({
  item,
  copied,
  onCopy,
  onCreateImage,
}: {
  item: HistoryItem;
  copied: string | null;
  onCopy: (item: HistoryItem) => void;
  onCreateImage: (item: HistoryItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 overflow-hidden flex flex-col">
      {/* Image area */}
      <div className="relative aspect-video bg-slate-900/60 overflow-hidden">
        {item.loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
            <span className="text-xs text-slate-500">Generando imagen...</span>
          </div>
        ) : item.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.estilo}
              className="w-full h-full object-cover"
            />
            {/* Overlay actions */}
            <div className="absolute top-2 right-2 flex gap-1.5">
              <a
                href={item.imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 transition-colors text-white/80 hover:text-white"
                title="Descargar imagen"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
              <a
                href={item.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 transition-colors text-white/80 hover:text-white"
                title="Abrir en nueva pestaña"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
            <ImageOff className="w-6 h-6 text-slate-600" />
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-lg border ${getEstiloColor(item.estilo)}`}
            >
              {item.estilo}
            </span>
          </div>
        )}
        {item.error && !item.loading && (
          <div className="absolute bottom-0 inset-x-0 bg-red-900/80 px-3 py-1.5">
            <p className="text-xs text-red-300 truncate">{item.error}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Estilo badge */}
        {!item.imageUrl && !item.loading && (
          <span
            className={`self-start text-xs font-semibold px-2 py-0.5 rounded-lg border hidden ${getEstiloColor(item.estilo)}`}
          >
            {item.estilo}
          </span>
        )}
        {(item.imageUrl || item.loading) && (
          <span
            className={`self-start text-xs font-semibold px-2 py-0.5 rounded-lg border ${getEstiloColor(item.estilo)}`}
          >
            {item.estilo}
          </span>
        )}

        {/* Analisis */}
        <p className="text-xs text-slate-400 leading-relaxed">{item.analisis}</p>

        {/* Prompt text */}
        <div className="flex-1">
          <p
            className={`text-xs text-slate-300 leading-relaxed ${
              expanded ? "" : "line-clamp-3"
            }`}
          >
            {item.prompt}
          </p>
          {item.prompt.length > 160 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-violet-400 hover:text-violet-300 mt-1 transition-colors"
            >
              {expanded ? "Ver menos" : "Ver más"}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2 border-t border-slate-700/40">
          <button
            onClick={() => onCopy(item)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 transition-colors text-slate-200"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied === item.id ? "¡Copiado!" : "Copiar prompt"}
          </button>
          <button
            onClick={() => onCreateImage(item)}
            disabled={item.loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: item.loading
                ? "rgba(236,72,153,0.3)"
                : "linear-gradient(135deg, #ec4899, #f97316)",
              boxShadow: item.loading ? "none" : "0 2px 12px rgba(236,72,153,0.3)",
            }}
          >
            {item.loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>🎨</span>
                Crear imagen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
