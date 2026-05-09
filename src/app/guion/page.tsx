"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  FileText,
  Copy,
  Check,
  Download,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Hash,
  Clock,
  MapPin,
} from "lucide-react";
import GlobalNav from "@/components/GlobalNav";

interface TimestampEntry {
  tiempo: string;
  titulo: string;
  descripcion: string;
}

interface TimestampsResult {
  timestamps: TimestampEntry[];
  descripcionYT: string;
}

const FORMATOS = [
  { value: "Educativo", label: "Educativo" },
  { value: "Tutorial", label: "Tutorial" },
  { value: "Historia", label: "Historia" },
  { value: "Entretenimiento", label: "Entretenimiento" },
  { value: "Motivacional", label: "Motivacional" },
  { value: "Documental", label: "Documental" },
];

const DURACIONES = [
  { value: "60 seg", label: "60 seg" },
  { value: "90 seg", label: "90 seg" },
  { value: "3 min", label: "3 min" },
  { value: "5 min", label: "5 min" },
  { value: "8 min", label: "8 min" },
  { value: "10 min", label: "10 min" },
  { value: "15 min", label: "15 min" },
  { value: "20 min", label: "20 min" },
];

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function renderGuionConMarcadores(text: string): React.ReactNode[] {
  // Regex that matches all marker types
  const markerRegex = /(\[EMOCIÓN:[^\]]+\]|\[CAMBIO DE CLIP\]|\[EFECTO:[^\]]+\]|\[PAUSA DRAMÁTICA\]|\[DATO EN PANTALLA:[^\]]+\]|\[OPEN LOOP\]|\[CIERRE LOOP\]|\[CTA SUAVE\])/g;

  const parts = text.split(markerRegex);
  return parts.map((part, i) => {
    if (!part) return null;

    if (/^\[EMOCIÓN:/.test(part)) {
      return (
        <span key={i} className="text-pink-400 font-bold text-xs bg-pink-500/10 px-1 rounded">
          {part}
        </span>
      );
    }
    if (part === "[CAMBIO DE CLIP]") {
      return (
        <span key={i} className="text-blue-400 font-bold text-xs bg-blue-500/10 px-1 rounded">
          {part}
        </span>
      );
    }
    if (/^\[EFECTO:/.test(part)) {
      return (
        <span key={i} className="text-amber-400 font-bold text-xs bg-amber-500/10 px-1 rounded">
          {part}
        </span>
      );
    }
    if (part === "[PAUSA DRAMÁTICA]") {
      return (
        <span key={i} className="text-red-400 font-bold text-xs bg-red-500/10 px-1 rounded">
          {part}
        </span>
      );
    }
    if (/^\[DATO EN PANTALLA:/.test(part)) {
      return (
        <span key={i} className="text-cyan-400 font-bold text-xs bg-cyan-500/10 px-1 rounded">
          {part}
        </span>
      );
    }
    if (part === "[OPEN LOOP]" || part === "[CIERRE LOOP]") {
      return (
        <span key={i} className="text-violet-400 font-bold text-xs bg-violet-500/10 px-1 rounded">
          {part}
        </span>
      );
    }
    if (part === "[CTA SUAVE]") {
      return (
        <span key={i} className="text-emerald-400 font-bold text-xs bg-emerald-500/10 px-1 rounded">
          {part}
        </span>
      );
    }

    // Plain text — preserve whitespace by splitting on newlines
    return (
      <span key={i} className="text-slate-300">
        {part}
      </span>
    );
  }).filter(Boolean) as React.ReactNode[];
}

function estimatedMinutes(words: number, faceless: boolean): number {
  const wpm = faceless ? 140 : 155;
  return Math.round((words / wpm) * 10) / 10;
}

function GuionContent() {
  const searchParams = useSearchParams();

  const [titulo, setTitulo] = useState("");
  const [nicho, setNicho] = useState("");
  const [hook, setHook] = useState("");
  const [formato, setFormato] = useState("Educativo");
  const [duracion, setDuracion] = useState("10 min");
  const [faceless, setFaceless] = useState(true);

  const [guion, setGuion] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [timestamps, setTimestamps] = useState<TimestampsResult | null>(null);
  const [loadingTimestamps, setLoadingTimestamps] = useState(false);
  const [copiedTimestamps, setCopiedTimestamps] = useState<"desc" | "lines" | null>(null);

  const outputRef = useRef<HTMLDivElement>(null);
  const fromCrearContenido = searchParams.get("from") === "crear-contenido";

  useEffect(() => {
    const t = searchParams.get("titulo");
    const n = searchParams.get("nicho");
    const h = searchParams.get("hook");
    const f = searchParams.get("faceless");

    if (t) setTitulo(decodeURIComponent(t));
    if (n) setNicho(decodeURIComponent(n));
    if (h) setHook(decodeURIComponent(h));
    if (f !== null) setFaceless(f !== "false" && f !== "0");
  }, [searchParams]);

  // Auto-scroll output as text streams in
  useEffect(() => {
    if (outputRef.current && loading) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [guion, loading]);

  async function handleGenerar() {
    if (!titulo.trim() || !nicho.trim()) return;
    setLoading(true);
    setDone(false);
    setError(null);
    setGuion("");

    try {
      const res = await fetch("/api/guion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, nicho, formato, duracion, faceless, hook: hook || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }

      if (!res.body) throw new Error("Sin respuesta del servidor");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        const chunk = decoder.decode(value, { stream: true });
        text += chunk;
        setGuion(text);
      }

      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!guion) return;
    navigator.clipboard.writeText(guion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExport() {
    if (!guion) return;
    const safeTitulo = titulo.slice(0, 40).replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-").toLowerCase() || "guion";
    const blob = new Blob([guion], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guion-${safeTitulo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleGenerarTimestamps() {
    if (!guion) return;
    setLoadingTimestamps(true);
    setTimestamps(null);
    try {
      const res = await fetch("/api/guion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "timestamps", guion, duracion, faceless }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }
      const data: TimestampsResult = await res.json();
      setTimestamps(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTimestamps(false);
    }
  }

  function handleCopyTimestampsDesc() {
    if (!timestamps) return;
    navigator.clipboard.writeText(timestamps.descripcionYT);
    setCopiedTimestamps("desc");
    setTimeout(() => setCopiedTimestamps(null), 2000);
  }

  function handleCopyTimestampsLines() {
    if (!timestamps) return;
    const lines = timestamps.timestamps.map(t => `${t.tiempo} ${t.titulo}`).join("\n");
    navigator.clipboard.writeText(lines);
    setCopiedTimestamps("lines");
    setTimeout(() => setCopiedTimestamps(null), 2000);
  }

  const wordCount = countWords(guion);
  const estMin = estimatedMinutes(wordCount, faceless);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {fromCrearContenido && (
            <Link
              href="/crear-contenido"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver a Crear Contenido
            </Link>
          )}
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <FileText className="w-3.5 h-3.5" />
            Guion optimizado para retención · estructura 10/80/10
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Generador de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">
              Guión
            </span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Genera un guión completo listo para narrar, con hooks, loops abiertos y CTAs en el momento óptimo.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
          {/* LEFT — Form panel */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 h-fit">
            <h2 className="text-sm font-semibold text-slate-300 mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Configurar guión
            </h2>

            <div className="space-y-4">
              {/* Título */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">
                  Título del video <span className="text-red-400">*</span>
                </label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Cómo gané $5,000 con IA en 30 días"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {/* Nicho */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">
                  Nicho <span className="text-red-400">*</span>
                </label>
                <input
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  placeholder="Ej: finanzas personales, IA, true crime..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {/* Hook */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">
                  Hook de apertura{" "}
                  <span className="text-slate-600">(opcional)</span>
                </label>
                <textarea
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="Si ya tienes un hook, pégalo aquí para que la IA lo use..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              {/* Formato */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Formato</label>
                <select
                  value={formato}
                  onChange={(e) => setFormato(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
                >
                  {FORMATOS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duración */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Duración objetivo</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {DURACIONES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuracion(d.value)}
                      className={`py-2 text-xs rounded-xl border transition-colors font-medium ${
                        duracion === d.value
                          ? "bg-violet-600 border-violet-500 text-white"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Faceless toggle */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Estilo</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFaceless(true)}
                    className={`flex-1 py-2.5 text-xs rounded-xl border transition-colors font-medium ${
                      faceless
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    🎙️ Faceless / Narración
                  </button>
                  <button
                    onClick={() => setFaceless(false)}
                    className={`flex-1 py-2.5 text-xs rounded-xl border transition-colors font-medium ${
                      !faceless
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    📹 En cámara
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleGenerar}
                disabled={loading || !titulo.trim() || !nicho.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? "rgba(109,40,217,0.5)"
                    : "linear-gradient(135deg, #7c3aed, #ec4899)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Escribiendo guión...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generar Guión
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT — Output panel */}
          <div className="flex flex-col gap-4">
            {/* Output header */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden flex-1 flex flex-col min-h-[600px]">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-violet-400" />
                    Guión generado
                    {loading && (
                      <span className="text-violet-400 animate-pulse ml-1">
                        escribiendo
                        <span className="inline-flex gap-0.5 ml-0.5">
                          <span className="animate-[bounce_1s_ease_infinite_0ms]">.</span>
                          <span className="animate-[bounce_1s_ease_infinite_150ms]">.</span>
                          <span className="animate-[bounce_1s_ease_infinite_300ms]">.</span>
                        </span>
                      </span>
                    )}
                  </span>

                  {guion && (
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {wordCount.toLocaleString()} palabras
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{estMin} min
                      </span>
                    </div>
                  )}
                </div>

                {guion && done && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar guión
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Exportar .txt
                    </button>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mx-5 mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300/80 text-sm">{error}</p>
                </div>
              )}

              {/* Guion output */}
              <div
                ref={outputRef}
                className="flex-1 overflow-y-auto p-5"
              >
                {!guion && !loading && !error && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                      <FileText className="w-7 h-7 text-violet-400" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-1">El guión aparecerá aquí</p>
                    <p className="text-slate-600 text-xs max-w-xs">
                      Rellena el formulario y pulsa &quot;Generar Guión&quot; para empezar.
                    </p>
                  </div>
                )}

                {loading && !guion && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-4" />
                    <p className="text-slate-400 text-sm">Escribiendo guión optimizado...</p>
                    <p className="text-slate-600 text-xs mt-1">Esto puede tardar 30-60 segundos</p>
                  </div>
                )}

                {guion && (
                  <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {renderGuionConMarcadores(guion)}
                    {loading && (
                      <span className="inline-block w-1.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                )}
              </div>

              {/* Marker legend */}
              {guion && (
                <div className="px-5 py-3 border-t border-slate-700/50 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                  <span>Leyenda:</span>
                  <span className="text-pink-400">🩷 Emoción</span>
                  <span className="text-blue-400">🔵 Corte de clip</span>
                  <span className="text-amber-400">🟡 Efecto</span>
                  <span className="text-red-400">🔴 Pausa</span>
                  <span className="text-cyan-400">🩵 Dato en pantalla</span>
                  <span className="text-violet-400">🟣 Loop</span>
                  <span className="text-emerald-400">🟢 CTA</span>
                </div>
              )}

              {/* Bottom CTA — Continuar en Crear Contenido */}
              {done && guion && (
                <div className="px-5 py-4 border-t border-slate-700/50 bg-slate-900/40">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="text-xs text-slate-500">
                      Guión completado · {wordCount.toLocaleString()} palabras · ~{estMin} min de video
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleGenerarTimestamps}
                        disabled={loadingTimestamps}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}
                      >
                        {loadingTimestamps ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5" />
                            Generar Timestamps
                          </>
                        )}
                      </button>
                      <Link
                        href={`/crear-contenido?titulo=${encodeURIComponent(titulo)}&nicho=${encodeURIComponent(nicho)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all text-white"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
                      >
                        Continuar en Crear Contenido →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps result card */}
            {timestamps && (
              <div className="bg-slate-800/60 border border-sky-500/30 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/50">
                  <span className="text-sm font-semibold text-sky-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Capítulos de YouTube
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyTimestampsDesc}
                      className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {copiedTimestamps === "desc" ? (
                        <><Check className="w-3.5 h-3.5 text-green-400" /> Copiado</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copiar para descripción</>
                      )}
                    </button>
                    <button
                      onClick={handleCopyTimestampsLines}
                      className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {copiedTimestamps === "lines" ? (
                        <><Check className="w-3.5 h-3.5 text-green-400" /> Copiado</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copiar solo timestamps</>
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="space-y-2">
                    {timestamps.timestamps.map((t, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="font-mono text-sky-400 text-sm font-bold min-w-[52px]">{t.tiempo}</span>
                        <div>
                          <span className="text-slate-200 text-sm font-medium">{t.titulo}</span>
                          {t.descripcion && (
                            <p className="text-slate-500 text-xs mt-0.5">{t.descripcion}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GuionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      }
    >
      <GuionContent />
    </Suspense>
  );
}
