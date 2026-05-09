"use client";

import React, { useState } from "react";
import { Loader2, Copy, Check, Download, Hash, Sparkles } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";

interface HashtagWithVolume {
  tag: string;
  volumen: "Alto" | "Medio" | "Bajo";
}

interface HashtagResult {
  principales: HashtagWithVolume[];
  nicho: HashtagWithVolume[];
  tendencia: HashtagWithVolume[];
  longtail: HashtagWithVolume[];
  descripcionOptimizada: string;
}

const EJEMPLOS = [
  "finanzas",
  "productividad",
  "gaming",
  "fitness",
  "cocina",
  "tecnología",
  "motivación",
  "viajes",
];

const IDIOMAS = [
  { value: "ES", label: "ES — Español" },
  { value: "EN", label: "EN — English" },
  { value: "PT", label: "PT — Português" },
];

function VolumenBadge({ volumen }: { volumen: "Alto" | "Medio" | "Bajo" }) {
  const styles: Record<string, string> = {
    Alto: "bg-green-500/15 text-green-400 border border-green-500/25",
    Medio: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
    Bajo: "bg-slate-500/15 text-slate-400 border border-slate-500/25",
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${styles[volumen]}`}>
      {volumen}
    </span>
  );
}

function HashtagPill({
  tag,
  volumen,
  colorClass,
}: {
  tag: string;
  volumen: "Alto" | "Medio" | "Bajo";
  colorClass: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(`#${tag}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${colorClass} group`}
    >
      <span className="text-sm font-medium flex-1">#{tag}</span>
      <VolumenBadge volumen={volumen} />
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
        title="Copiar"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

interface SectionProps {
  title: string;
  subtitle: string;
  emoji: string;
  tags: HashtagWithVolume[];
  pillColor: string;
  headerColor: string;
}

function HashtagSection({ title, subtitle, emoji, tags, pillColor, headerColor }: SectionProps) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className={`px-5 py-3 border-b border-slate-700/50 flex items-center justify-between`}>
        <div>
          <span className={`text-sm font-semibold ${headerColor}`}>
            {emoji} {title}
          </span>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <span className="text-xs text-slate-600 font-mono">{tags.length} tags</span>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {tags.map((t, i) => (
          <HashtagPill key={i} tag={t.tag} volumen={t.volumen} colorClass={pillColor} />
        ))}
      </div>
    </div>
  );
}

export default function HashtagsPage() {
  const [tema, setTema] = useState("");
  const [nicho, setNicho] = useState("");
  const [idioma, setIdioma] = useState("ES");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HashtagResult | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  async function handleGenerar() {
    if (!tema.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, nicho, idioma, cantidad: 30 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }
      const data = await res.json();
      setResult(data.hashtags);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  function getAllHashtags(): string {
    if (!result) return "";
    const all = [
      ...result.principales,
      ...result.nicho,
      ...result.tendencia,
      ...result.longtail,
    ];
    return all.map((t) => `#${t.tag}`).join(" ");
  }

  function handleCopyAll() {
    navigator.clipboard.writeText(getAllHashtags());
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  function handleCopyDesc() {
    if (!result) return;
    navigator.clipboard.writeText(result.descripcionOptimizada);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  }

  function handleExport() {
    if (!result) return;
    const lines = [
      "=== HASHTAGS PRINCIPALES (Alto volumen) ===",
      result.principales.map((t) => `#${t.tag} [${t.volumen}]`).join("\n"),
      "",
      "=== HASHTAGS DE NICHO ===",
      result.nicho.map((t) => `#${t.tag} [${t.volumen}]`).join("\n"),
      "",
      "=== HASHTAGS DE TENDENCIA ===",
      result.tendencia.map((t) => `#${t.tag} [${t.volumen}]`).join("\n"),
      "",
      "=== HASHTAGS LONG-TAIL ===",
      result.longtail.map((t) => `#${t.tag} [${t.volumen}]`).join("\n"),
      "",
      "=== TODOS LOS HASHTAGS ===",
      getAllHashtags(),
      "",
      "=== DESCRIPCIÓN OPTIMIZADA ===",
      result.descripcionOptimizada,
    ].join("\n");

    const safeTema = tema.slice(0, 30).replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-").toLowerCase() || "hashtags";
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hashtags-${safeTema}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Hash className="w-3.5 h-3.5" />
            30 hashtags organizados por categoría y volumen
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Generador de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Hashtags
            </span>{" "}
            para YouTube
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            30 hashtags organizados por categoría y volumen para maximizar el alcance de tu video
          </p>
        </div>

        {/* Input card */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Configurar generador
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">
                ¿De qué trata tu video? <span className="text-red-400">*</span>
              </label>
              <input
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Ej: cómo ganar dinero con IA en 2024"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                onKeyDown={(e) => { if (e.key === "Enter") handleGenerar(); }}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">
                Tu nicho (finanzas, gaming, etc.)
              </label>
              <input
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                placeholder="Ej: finanzas personales"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Idioma</label>
              <select
                value={idioma}
                onChange={(e) => setIdioma(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
              >
                {IDIOMAS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex items-end justify-start sm:justify-end">
              <button
                onClick={handleGenerar}
                disabled={loading || !tema.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? "rgba(109,40,217,0.5)"
                    : "linear-gradient(135deg, #7c3aed, #ec4899)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Hash className="w-4 h-4" />
                    Generar Hashtags
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick examples */}
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500">Ejemplos rápidos:</span>
            {EJEMPLOS.map((ej) => (
              <button
                key={ej}
                onClick={() => setTema(ej)}
                className="text-xs px-3 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-slate-400 hover:text-white hover:border-purple-500 transition-colors"
              >
                {ej}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Quick actions bar */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-400 font-semibold">Acciones rápidas:</span>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 text-xs bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 px-4 py-2 rounded-xl transition-colors font-medium"
              >
                {copiedAll ? (
                  <><Check className="w-3.5 h-3.5 text-green-400" /> Copiado</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copiar todos</>
                )}
              </button>
              <button
                onClick={handleCopyDesc}
                className="flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-xl transition-colors font-medium"
              >
                {copiedDesc ? (
                  <><Check className="w-3.5 h-3.5 text-green-400" /> Copiada</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copiar descripción</>
                )}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 px-4 py-2 rounded-xl transition-colors font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar .txt
              </button>
              <span className="ml-auto text-xs text-slate-500">
                {result.principales.length + result.nicho.length + result.tendencia.length + result.longtail.length} hashtags generados
              </span>
            </div>

            {/* 4 categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <HashtagSection
                title="Principales"
                subtitle="Alto volumen, máxima visibilidad"
                emoji="🔵"
                tags={result.principales}
                pillColor="bg-blue-500/8 border-blue-500/20 text-blue-100 hover:border-blue-500/40"
                headerColor="text-blue-400"
              />
              <HashtagSection
                title="De Nicho"
                subtitle="Audiencia específica y comprometida"
                emoji="🟣"
                tags={result.nicho}
                pillColor="bg-purple-500/8 border-purple-500/20 text-purple-100 hover:border-purple-500/40"
                headerColor="text-purple-400"
              />
              <HashtagSection
                title="Tendencia"
                subtitle="Aprovecha el momentum viral"
                emoji="🟠"
                tags={result.tendencia}
                pillColor="bg-orange-500/8 border-orange-500/20 text-orange-100 hover:border-orange-500/40"
                headerColor="text-orange-400"
              />
              <HashtagSection
                title="Long-tail"
                subtitle="Menor competencia, más fácil posicionar"
                emoji="🟢"
                tags={result.longtail}
                pillColor="bg-green-500/8 border-green-500/20 text-green-100 hover:border-green-500/40"
                headerColor="text-green-400"
              />
            </div>

            {/* Tips section */}
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <span>💡</span> Consejos de uso
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  YouTube permite máximo 60 hashtags pero recomienda 3-5 en el título y 15 en la descripción
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  Los hashtags del título aparecen encima del video (muy visibles) — úsalos con cuidado
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  Prioriza los hashtags de <span className="text-purple-400 font-medium">NICHO</span> sobre los <span className="text-blue-400 font-medium">PRINCIPALES</span> para canales nuevos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  Los <span className="text-green-400 font-medium">LONG-TAIL</span> tienen menos competencia y son más fáciles de posicionar en el corto plazo
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <Hash className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">Los hashtags aparecerán aquí</p>
            <p className="text-slate-600 text-xs max-w-xs">
              Ingresa el tema de tu video y pulsa &quot;Generar Hashtags&quot; para empezar.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
