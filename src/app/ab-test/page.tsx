"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { TestTube2, Users, Zap, Lightbulb, Rocket } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import type { ABResult, ThumbnailScore } from "@/app/api/ab-test/route";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  id: string;
  date: string;
  thumbA: string;
  thumbB: string;
  ganadora: "A" | "B" | "empate";
  confianza: number;
}

const STORAGE_KEY = "viralscope-abtests";
const MAX_HISTORY = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface UploadZoneProps {
  label: "A" | "B";
  image: string | null;
  onFile: (base64: string) => void;
}

function UploadZone({ label, image, onFile }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const color = label === "A" ? "blue" : "purple";
  const borderColor = label === "A" ? "border-blue-500/60" : "border-purple-500/60";
  const bgBadge = label === "A" ? "bg-blue-600" : "bg-purple-600";
  const dragBg = label === "A" ? "bg-blue-500/10" : "bg-purple-500/10";

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const b64 = await fileToBase64(file);
        onFile(b64);
      }
    },
    [onFile]
  );

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const b64 = await fileToBase64(file);
        onFile(b64);
      }
    },
    [onFile]
  );

  // Suppress unused variable warning — color is used in className template below
  void color;

  return (
    <div className="flex-1 min-w-0">
      <div
        className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden
          ${dragging ? `${dragBg} ${borderColor}` : "border-slate-600 hover:border-slate-500"}
          ${image ? "border-solid" : ""}`}
        style={{ minHeight: 220 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {/* Badge */}
        <span className={`absolute top-3 left-3 z-10 ${bgBadge} text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg`}>
          {label}
        </span>

        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`Miniatura ${label}`}
            className="w-full h-full object-cover rounded-2xl"
            style={{ minHeight: 220, maxHeight: 260 }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${label === "A" ? "bg-blue-500/15" : "bg-purple-500/15"}`}>
              <svg className={`w-7 h-7 ${label === "A" ? "text-blue-400" : "text-purple-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-slate-300 font-medium">Sube miniatura {label}</p>
              <p className="text-slate-500 text-sm mt-1">Haz clic o arrastra la imagen aquí</p>
            </div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  );
}

interface MetricBarProps {
  label: string;
  value: number;
}

function MetricBar({ label, value }: MetricBarProps) {
  const pct = Math.round((value / 10) * 100);
  const color =
    pct >= 70 ? "from-green-500 to-emerald-400" :
    pct >= 45 ? "from-yellow-500 to-amber-400" :
    "from-red-500 to-rose-400";

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 text-xs w-24 shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-slate-300 text-xs font-mono w-6 text-right">{value}</span>
    </div>
  );
}

interface ThumbnailCardProps {
  label: "A" | "B";
  image: string;
  score: ThumbnailScore;
  isWinner: boolean;
}

function ThumbnailCard({ label, image, score, isWinner }: ThumbnailCardProps) {
  const isA = label === "A";
  const accentBorder = isA ? "border-blue-500/40" : "border-purple-500/40";
  const winnerGlow = "border-yellow-500/50 shadow-yellow-500/20 shadow-lg";
  const badgeBg = isA ? "bg-blue-600" : "bg-purple-600";

  return (
    <div className={`relative rounded-2xl border bg-slate-900/50 overflow-hidden transition-all
      ${isWinner ? winnerGlow : `${accentBorder} border-slate-700/50`}`}>

      {isWinner && (
        <div className="absolute top-3 right-3 z-10 bg-yellow-500 text-yellow-950 text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
          GANADORA
        </div>
      )}

      {/* Image */}
      <div className="relative">
        <span className={`absolute top-3 left-3 z-10 ${badgeBg} text-white text-xs font-black px-2.5 py-1 rounded-full`}>
          {label}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={`Thumbnail ${label}`} className="w-full object-cover" style={{ maxHeight: 180 }} />
      </div>

      <div className="p-4 space-y-4">
        {/* CTR score */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">CTR estimado</span>
          <div className="flex items-end gap-1">
            <span className={`text-3xl font-black ${isA ? "text-blue-400" : "text-purple-400"}`}>
              {score.ctr_estimado.toFixed(1)}
            </span>
            <span className="text-slate-500 text-sm mb-1">/10</span>
          </div>
        </div>

        {/* Metric bars */}
        <div className="space-y-2">
          <MetricBar label="Contraste" value={score.contraste} />
          <MetricBar label="Texto" value={score.texto} />
          <MetricBar label="Emoción" value={score.emocion} />
          <MetricBar label="Composición" value={score.composicion} />
          <MetricBar label="Color" value={score.color} />
          <MetricBar label="Cara" value={score.cara} />
        </div>

        {/* Strengths */}
        {score.fortalezas.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Fortalezas</p>
            <ul className="space-y-1">
              {score.fortalezas.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {score.debilidades.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Debilidades</p>
            <ul className="space-y-1">
              {score.debilidades.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

interface HistoryCardProps {
  entry: HistoryEntry;
}

function HistoryCard({ entry }: HistoryCardProps) {
  const badgeColor =
    entry.ganadora === "A" ? "bg-blue-600" :
    entry.ganadora === "B" ? "bg-purple-600" :
    "bg-slate-600";

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
      <div className="flex gap-1.5 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entry.thumbA} alt="A" className="w-14 h-9 rounded object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entry.thumbB} alt="B" className="w-14 h-9 rounded object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-xs">{entry.date}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`${badgeColor} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
            {entry.ganadora === "empate" ? "Empate" : entry.ganadora}
          </span>
          <span className="text-slate-500 text-xs">{entry.confianza}% confianza</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ABTestPage() {
  const [imageA, setImageA] = useState<string | null>(null);
  const [imageB, setImageB] = useState<string | null>(null);
  const [nicho, setNicho] = useState("");
  const [titulo, setTitulo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ABResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const canAnalyze = Boolean(imageA && imageB && !loading);

  const handleAnalyze = async () => {
    if (!imageA || !imageB) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageA, imageB, nicho, titulo }),
      });
      const data = await res.json() as ABResult & { error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Error desconocido");
        return;
      }
      setResult(data);

      // Save to history
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
        thumbA: imageA,
        thumbB: imageB,
        ganadora: data.ganadora,
        confianza: data.confianza,
      };
      const updated = [entry, ...loadHistory()].slice(0, MAX_HISTORY);
      saveHistory(updated);
      setHistory(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const winnerLabel =
    result?.ganadora === "A" ? "Miniatura A" :
    result?.ganadora === "B" ? "Miniatura B" :
    null;

  const winnerColor =
    result?.ganadora === "A" ? "text-blue-400" :
    result?.ganadora === "B" ? "text-purple-400" :
    "text-slate-300";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GlobalNav />

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2"><TestTube2 size={28} style={{ color: "#a78bfa" }} /> A/B Test de Miniaturas</h1>
          <p className="text-slate-400 text-lg">
            Sube 2 versiones de tu miniatura y la IA predice cuál generará más clics
          </p>
        </div>

        {/* Upload section */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-200">Sube tus miniaturas</h2>

          <div className="flex gap-4">
            <UploadZone label="A" image={imageA} onFile={setImageA} />
            <div className="flex items-center justify-center shrink-0">
              <span className="text-2xl font-black text-slate-600">VS</span>
            </div>
            <UploadZone label="B" image={imageB} onFile={setImageB} />
          </div>

          {/* Optional context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">¿Cuál es el nicho del video?</label>
              <input
                type="text"
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                placeholder="Ej: finanzas, gaming, motivación..."
                className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">¿Cuál es el título del video?</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Cómo ganar dinero con IA en 2025"
                className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="w-full py-3.5 rounded-xl font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={canAnalyze ? {
              background: "linear-gradient(135deg, #7c3aed, #a855f7, #9333ea)",
              boxShadow: "0 0 20px rgba(139,92,246,0.4)"
            } : { background: "rgba(100,100,120,0.3)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analizando con IA...
              </span>
            ) : "Analizar"}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {result && imageA && imageB && (
          <div className="space-y-6">

            {/* Winner announcement */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 text-center space-y-4">
              {result.ganadora === "empate" ? (
                <h2 className="text-3xl font-black text-slate-300 flex items-center justify-center gap-2"><Users size={24} style={{ color: "#a78bfa" }} /> Empate técnico</h2>
              ) : (
                <h2 className={`text-3xl font-black ${winnerColor} flex items-center justify-center gap-2`}>
                  <Zap size={24} style={{ color: "#a78bfa" }} /> {winnerLabel} gana
                </h2>
              )}

              {/* Confidence bar */}
              <div className="max-w-sm mx-auto space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Nivel de confianza</span>
                  <span className="text-slate-200 font-bold">{result.confianza}%</span>
                </div>
                <div className="h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-400 transition-all duration-1000"
                    style={{ width: `${result.confianza}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Side-by-side cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ThumbnailCard
                label="A"
                image={imageA}
                score={result.thumbnail_a}
                isWinner={result.ganadora === "A"}
              />
              <ThumbnailCard
                label="B"
                image={imageB}
                score={result.thumbnail_b}
                isWinner={result.ganadora === "B"}
              />
            </div>

            {/* Analysis card */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">¿Por qué ganó?</p>
                <p className="text-slate-200 leading-relaxed">{result.razon}</p>
              </div>
              <div className="h-px bg-slate-700/50" />
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1 flex items-center gap-1"><Lightbulb size={12} style={{ color: "#a78bfa" }} /> Recomendación</p>
                <p className="text-slate-200 leading-relaxed">{result.recomendacion}</p>
              </div>
              <div className="pt-1">
                <Link
                  href="/miniatura"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 16px rgba(139,92,246,0.3)" }}
                >
                  <Rocket size={14} /> Mejorar miniatura
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-400 uppercase tracking-widest">Historial reciente</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {history.map((entry) => (
                <HistoryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
