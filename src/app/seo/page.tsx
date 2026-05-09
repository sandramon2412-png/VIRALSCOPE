"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";

interface KeywordResult {
  keyword: string;
  volumenEstimado: "Muy Alto" | "Alto" | "Medio" | "Bajo";
  totalResults: number;
  competencia: "Alta" | "Media" | "Baja";
  oportunidad: number;
  topVideoViews: number;
  cpc_estimado: string;
  sugerida: boolean;
}

type Idioma = "es" | "en" | "pt";

const QUICK_KEYWORDS = [
  "finanzas personales",
  "canal faceless",
  "inteligencia artificial",
  "cómo ganar dinero",
  "productividad",
  "crypto 2026",
  "meditación",
  "recetas fáciles",
];

const IDIOMAS: { value: Idioma; label: string; flag: string }[] = [
  { value: "es", label: "ES", flag: "🇪🇸" },
  { value: "en", label: "EN", flag: "🇺🇸" },
  { value: "pt", label: "PT", flag: "🇧🇷" },
];

function formatViews(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

function VolumenPill({
  v,
}: {
  v: "Muy Alto" | "Alto" | "Medio" | "Bajo";
}) {
  const styles: Record<string, string> = {
    "Muy Alto":
      "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    Alto: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    Medio: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    Bajo: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[v]}`}
    >
      {v}
    </span>
  );
}

function CompetenciaPill({ c }: { c: "Alta" | "Media" | "Baja" }) {
  const styles: Record<string, string> = {
    Baja: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    Media: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    Alta: "bg-red-500/20 text-red-300 border border-red-500/30",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[c]}`}
    >
      {c}
    </span>
  );
}

function OportunidadBar({ score }: { score: number }) {
  const color =
    score >= 70
      ? "from-emerald-500 to-emerald-400"
      : score >= 40
      ? "from-yellow-500 to-yellow-400"
      : "from-red-500 to-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-700/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-white/70 w-7 text-right">{score}</span>
    </div>
  );
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  // auto-dismiss
  setTimeout(onDone, 2000);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-purple-600 text-white text-sm px-5 py-2.5 rounded-full shadow-2xl shadow-purple-900/60 animate-bounce">
      {msg}
    </div>
  );
}

export default function SeoPage() {
  const [keyword, setKeyword] = useState("");
  const [idioma, setIdioma] = useState<Idioma>("es");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KeywordResult[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tipsOpen, setTipsOpen] = useState(true);

  const search = useCallback(
    async (kw?: string) => {
      const q = (kw ?? keyword).trim();
      if (!q) return;
      setLoading(true);
      setError(null);
      setResults(null);
      try {
        const res = await fetch(
          `/api/seo?keyword=${encodeURIComponent(q)}&idioma=${idioma}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error desconocido");
        setResults(data.keywords as KeywordResult[]);
        setQuery(data.query as string);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al consultar la API");
      } finally {
        setLoading(false);
      }
    },
    [keyword, idioma]
  );

  const handleQuick = (kw: string) => {
    setKeyword(kw);
    search(kw);
  };

  const copyKeyword = (kw: string) => {
    navigator.clipboard.writeText(kw).then(() => {
      setToast(`"${kw}" copiado`);
    });
  };

  // Find best opportunity keyword
  const bestKeyword =
    results && results.length > 0
      ? results.reduce((best, r) =>
          r.oportunidad > best.oportunidad ? r : best
        )
      : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GlobalNav />

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-3 tracking-tight flex items-center justify-center gap-3">
            <Search size={36} style={{ color: "#a78bfa" }} /> Investigación de Keywords SEO
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Encuentra las palabras clave perfectas para posicionar tus videos en
            YouTube
          </p>
        </div>

        {/* Search section */}
        <div className="max-w-2xl mx-auto mb-10">
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(15,12,30,0.80)",
              border: "1px solid rgba(139,92,246,0.25)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Escribe un tema, nicho o palabra clave..."
                className="flex-1 bg-slate-800/70 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-base focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Language selector */}
              <div className="flex gap-1.5">
                {IDIOMAS.map((id) => (
                  <button
                    key={id.value}
                    onClick={() => setIdioma(id.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      idioma === id.value
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700/60 text-slate-400 hover:bg-slate-600/60 hover:text-white"
                    }`}
                  >
                    {id.flag} {id.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => search()}
                disabled={loading || !keyword.trim()}
                className="ml-auto px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed, #a855f7, #6d28d9)",
                  boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
                }}
              >
                {loading ? "Analizando..." : "Investigar"}
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-3 mt-6 text-purple-400">
              <svg
                className="animate-spin w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span className="text-sm font-medium">
                Analizando keywords en YouTube...
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Quick start */}
        {!results && !loading && (
          <div className="mb-10">
            <p className="text-center text-slate-500 text-sm mb-3">
              Prueba con estas ideas:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  onClick={() => handleQuick(kw)}
                  className="px-4 py-2 rounded-full text-sm bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-purple-600/20 hover:border-purple-500/40 hover:text-white transition-all"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results table */}
        {results && results.length > 0 && (
          <div className="mb-8">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(15,12,30,0.60)",
                border: "1px solid rgba(100,80,180,0.20)",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left px-4 py-3 text-slate-400 font-semibold">
                        Keyword
                      </th>
                      <th className="text-center px-4 py-3 text-slate-400 font-semibold">
                        Volumen
                      </th>
                      <th className="text-center px-4 py-3 text-slate-400 font-semibold">
                        Competencia
                      </th>
                      <th className="text-left px-4 py-3 text-slate-400 font-semibold min-w-[150px]">
                        Oportunidad
                      </th>
                      <th className="text-right px-4 py-3 text-slate-400 font-semibold">
                        Top Video Views
                      </th>
                      <th className="text-right px-4 py-3 text-slate-400 font-semibold">
                        CPC Est.
                      </th>
                      <th className="text-center px-4 py-3 text-slate-400 font-semibold">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-800/60 hover:bg-white/3 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span
                            className={
                              !r.sugerida
                                ? "font-bold text-white"
                                : "text-slate-300"
                            }
                          >
                            {!r.sugerida && (
                              <span className="inline-block mr-1.5 text-purple-400 text-xs">
                                ★
                              </span>
                            )}
                            {r.keyword}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <VolumenPill v={r.volumenEstimado} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <CompetenciaPill c={r.competencia} />
                        </td>
                        <td className="px-4 py-3">
                          <OportunidadBar score={r.oportunidad} />
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300 font-mono text-xs">
                          {r.topVideoViews > 0
                            ? formatViews(r.topVideoViews)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-400 font-mono text-xs">
                          {r.cpc_estimado}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <a
                              href={`/?q=${encodeURIComponent(r.keyword)}`}
                              title="Buscar videos"
                              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 transition-colors text-xs"
                            >
                              🔍
                            </a>
                            <button
                              onClick={() => copyKeyword(r.keyword)}
                              title="Copiar keyword"
                              className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 hover:text-purple-300 transition-colors text-xs"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            {bestKeyword && (
              <div
                className="mt-4 rounded-2xl p-5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(16,185,129,0.08))",
                  border: "1px solid rgba(139,92,246,0.25)",
                }}
              >
                <h3 className="font-bold text-base mb-2">📊 Resumen</h3>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="text-slate-400">Mejor oportunidad: </span>
                    <span className="font-bold text-emerald-300">
                      {bestKeyword.keyword}
                    </span>
                    <span className="ml-1 text-slate-500">
                      (score {bestKeyword.oportunidad})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Keyword para "{query}": </span>
                    <span className="font-bold text-purple-300">
                      {bestKeyword.competencia === "Baja"
                        ? `✅ Excelente — baja competencia`
                        : bestKeyword.competencia === "Media"
                        ? `⚠️ Competencia media — usa long-tail`
                        : `🔴 Competencia alta — busca variantes`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips section */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(15,12,30,0.60)",
            border: "1px solid rgba(100,80,180,0.20)",
          }}
        >
          <button
            onClick={() => setTipsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors"
          >
            <span className="font-bold text-base">
              💡 Cómo usar las keywords
            </span>
            <span className="text-slate-500 text-sm">
              {tipsOpen ? "▲ Ocultar" : "▼ Mostrar"}
            </span>
          </button>
          {tipsOpen && (
            <div className="px-5 pb-5 border-t border-slate-700/40">
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="text-purple-400 font-bold">1.</span>
                  <span>
                    Incluye la keyword principal en el{" "}
                    <span className="text-white font-semibold">
                      TÍTULO del video
                    </span>{" "}
                    (primeras 3 palabras si es posible)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-400 font-bold">2.</span>
                  <span>
                    Repítela naturalmente 2-3 veces en la{" "}
                    <span className="text-white font-semibold">DESCRIPCIÓN</span>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-400 font-bold">3.</span>
                  <span>
                    Agrégala a las{" "}
                    <span className="text-white font-semibold">ETIQUETAS</span>{" "}
                    del video
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold">★</span>
                  <span>
                    Keywords con{" "}
                    <span className="text-emerald-300 font-semibold">
                      Competencia Baja + Volumen Medio
                    </span>{" "}
                    son el{" "}
                    <span className="text-white font-semibold">
                      punto dulce
                    </span>{" "}
                    para canales nuevos
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
