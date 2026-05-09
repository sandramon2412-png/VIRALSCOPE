"use client";
import { useState } from "react";
import Link from "next/link";
import NavAuth from "@/components/NavAuth";
import {
  Mic, Copy, Check, ArrowLeft, Sparkles, RefreshCw,
  AlertTriangle, ChevronDown, ChevronUp, Download, Filter,
  Zap, Clock, TrendingUp, MessageSquare,
  HelpCircle, BarChart2, BookOpen, Flame, Gem, User, Trophy, Pin
} from "lucide-react";

interface Hook {
  hook: string;
  categoria: string;
  por_que_funciona: string;
  duracion_segundos: number;
  nivel_impacto: number;
}

const CATEGORIAS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ElementType; desc: string }> = {
  "PREGUNTA DIRECTA": {
    color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30",
    icon: HelpCircle, desc: "Golpea un dolor o deseo con pregunta"
  },
  "DATO IMPACTANTE": {
    color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30",
    icon: BarChart2, desc: "Estadística sorprendente que para el scroll"
  },
  "HISTORIA CORTA": {
    color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30",
    icon: BookOpen, desc: "Tensión narrativa en 2 frases"
  },
  "AFIRMACIÓN POLÉMICA": {
    color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30",
    icon: Flame, desc: "Desafía la creencia popular"
  },
  "PROMESA DE VALOR": {
    color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30",
    icon: Gem, desc: "Beneficio claro en X tiempo"
  },
  "IDENTIFICACIÓN": {
    color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/30",
    icon: User, desc: "El espectador se ve reflejado"
  },
  "CLIFFHANGER": {
    color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30",
    icon: Zap, desc: "Empieza en medio de la acción"
  },
  "DESAFÍO": {
    color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30",
    icon: Trophy, desc: "Reta directamente al espectador"
  },
};

function getImpactColor(nivel: number) {
  if (nivel >= 90) return "from-green-500 to-emerald-400";
  if (nivel >= 75) return "from-yellow-500 to-amber-400";
  return "from-orange-500 to-red-400";
}

const NICHOS = [
  "Finanzas personales", "Fitness y salud", "Tecnología", "Emprendimiento",
  "Marketing digital", "Desarrollo personal", "Gaming", "Cocina y recetas",
  "Viajes", "Educación", "Relaciones", "Entretenimiento", "Criptomonedas",
  "Bienes raíces", "Productividad", "Moda y belleza", "Negocios online",
  "Programación", "Psicología", "Motivación"
];

export default function HooksPage() {
  const [nicho, setNicho] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [cantidad, setCantidad] = useState(20);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filterCategoria, setFilterCategoria] = useState("all");
  const [copiedAll, setCopiedAll] = useState(false);

  async function handleGenerar() {
    if (!nicho) {
      setError("Por favor selecciona un nicho.");
      return;
    }
    setLoading(true);
    setError("");
    setHooks([]);
    setExpandedIndex(null);
    setFilterCategoria("all");

    try {
      const res = await fetch("/api/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicho, tipo, cantidad }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHooks(data.hooks || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error generando hooks");
    } finally {
      setLoading(false);
    }
  }

  function copyHook(hook: string, index: number) {
    navigator.clipboard.writeText(hook);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function copyAll() {
    const text = filteredHooks.map((h, i) => `${i + 1}. [${h.categoria}]\n"${h.hook}"\n`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  function downloadHooks() {
    const content = filteredHooks.map((h, i) =>
      `${i + 1}. [${h.categoria}] Impacto: ${h.nivel_impacto}/100\n"${h.hook}"\nPor qué funciona: ${h.por_que_funciona}\nDuración: ~${h.duracion_segundos}s\n`
    ).join("\n---\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hooks-${nicho.replace(/\s+/g, "-")}.txt`;
    a.click();
  }

  const categoriasList = [...new Set(hooks.map(h => h.categoria))].sort();
  const filteredHooks = filterCategoria === "all" ? hooks : hooks.filter(h => h.categoria === filterCategoria);
  const avgImpact = hooks.length ? Math.round(hooks.reduce((a, b) => a + b.nivel_impacto, 0) / hooks.length) : 0;
  const avgDuracion = hooks.length ? Math.round(hooks.reduce((a, b) => a + b.duracion_segundos, 0) / hooks.length) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
              <ArrowLeft size={16} />
              <span>Volver</span>
            </Link>
            <div className="w-px h-5 bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Mic size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-none">Banco de Hooks</h1>
                <p className="text-xs text-white/40 leading-none mt-0.5">Primeros 30 segundos que retienen</p>
              </div>
            </div>
          </div>
          <NavAuth />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-1.5 mb-4">
            <Sparkles size={14} className="text-pink-400" />
            <span className="text-pink-400 text-xs font-medium">El 70% de los espectadores decide en los primeros 30 segundos</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">
            Hooks que{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              enganchan al instante
            </span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            8 tipos de hooks psicológicamente probados. Los creadores con millones de vistas los usan todos.
          </p>
        </div>

        {/* Categorías preview */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-8">
          {Object.entries(CATEGORIAS_CONFIG).map(([cat, cfg]) => (
            <div key={cat} className={`${cfg.bg} border ${cfg.border} rounded-xl p-3 text-center`}>
              <div className="flex justify-center mb-1"><cfg.icon size={18} style={{ color: "#a78bfa" }} /></div>
              <p className={`text-[10px] font-bold ${cfg.color} leading-tight`}>{cat.split(" ").join("\n")}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">🎯 Nicho *</label>
              <select
                value={nicho}
                onChange={e => setNicho(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
              >
                <option value="" className="bg-gray-900">Seleccionar nicho</option>
                {NICHOS.map(n => (
                  <option key={n} value={n} className="bg-gray-900">{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">📁 Tipo de hook</label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
              >
                <option value="todos" className="bg-gray-900">Todos los tipos</option>
                {Object.keys(CATEGORIAS_CONFIG).map(cat => (
                  <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">🔢 Cantidad</label>
              <div className="flex gap-2">
                {[10, 20, 30].map(n => (
                  <button
                    key={n}
                    onClick={() => setCantidad(n)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                      cantidad === n
                        ? "bg-pink-500/20 border-pink-500/50 text-pink-300"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-white/30"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <button
            onClick={handleGenerar}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Generando banco de hooks...
              </>
            ) : (
              <>
                <Mic size={20} />
                Generar {cantidad} Hooks para {nicho || "tu nicho"}
              </>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
                <div className="h-5 bg-white/10 rounded w-full mb-2" />
                <div className="h-5 bg-white/10 rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {hooks.length > 0 && !loading && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-pink-400">{hooks.length}</div>
                <div className="text-xs text-white/50 mt-1">Hooks generados</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className={`text-2xl font-black ${avgImpact >= 80 ? "text-green-400" : "text-yellow-400"}`}>{avgImpact}/100</div>
                <div className="text-xs text-white/50 mt-1">Impacto promedio</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-blue-400">{avgDuracion}s</div>
                <div className="text-xs text-white/50 mt-1">Duración promedio</div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-white/40" />
                <button
                  onClick={() => setFilterCategoria("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterCategoria === "all" ? "bg-white/20 text-white" : "bg-white/5 text-white/50 hover:text-white"
                  }`}
                >
                  Todos ({hooks.length})
                </button>
                {categoriasList.map(cat => {
                  const cfg = CATEGORIAS_CONFIG[cat] || { icon: Pin, color: "text-white/60", bg: "bg-white/5", border: "border-white/10" };
                  const count = hooks.filter(h => h.categoria === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setFilterCategoria(cat)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        filterCategoria === cat
                          ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                          : "bg-white/5 border-transparent text-white/50 hover:text-white"
                      }`}
                    >
                      <cfg.icon size={11} style={{ color: "#a78bfa" }} /> {cat} ({count})
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyAll}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs transition-all"
                >
                  {copiedAll ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  Copiar todos
                </button>
                <button
                  onClick={downloadHooks}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs transition-all"
                >
                  <Download size={12} />
                  Descargar
                </button>
              </div>
            </div>

            {/* Hooks list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHooks.map((hook, index) => {
                const originalIndex = hooks.indexOf(hook);
                const cfg = CATEGORIAS_CONFIG[hook.categoria] || {
                  icon: Pin, color: "text-white/60", bg: "bg-white/5",
                  border: "border-white/10", desc: ""
                };
                const isExpanded = expandedIndex === originalIndex;

                return (
                  <div
                    key={originalIndex}
                    className={`bg-white/5 border rounded-xl transition-all ${
                      isExpanded ? "border-white/30" : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="p-4">
                      {/* Category badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                          <cfg.icon size={11} style={{ color: "#a78bfa" }} /> {hook.categoria}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs text-white/40">
                            <Clock size={11} />
                            ~{hook.duracion_segundos}s
                          </span>
                          <div className={`px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r ${getImpactColor(hook.nivel_impacto)} text-white`}>
                            {hook.nivel_impacto}
                          </div>
                        </div>
                      </div>

                      {/* Hook text */}
                      <p className="text-white font-medium text-sm leading-relaxed mb-3">
                        "{hook.hook}"
                      </p>

                      {/* Impact bar */}
                      <div className="mb-3">
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getImpactColor(hook.nivel_impacto)} rounded-full`}
                            style={{ width: `${hook.nivel_impacto}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                          className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
                        >
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {isExpanded ? "Ocultar" : "Ver análisis"}
                        </button>
                        <button
                          onClick={() => copyHook(hook.hook, originalIndex)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white/70 hover:text-white transition-all"
                        >
                          {copiedIndex === originalIndex
                            ? <><Check size={12} className="text-green-400" /> Copiado</>
                            : <><Copy size={12} /> Copiar</>
                          }
                        </button>
                      </div>
                    </div>

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-white/10 pt-3">
                        <div className="flex items-start gap-2">
                          <Zap size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Por qué retiene al espectador</p>
                            <p className="text-sm text-white/70">{hook.por_que_funciona}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-start gap-2">
                          <MessageSquare size={14} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
                          <div>
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Estrategia</p>
                            <p className={`text-xs ${cfg.color}`}>{cfg.desc}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pro tips */}
            <div className="mt-8 bg-gradient-to-r from-pink-500/5 to-purple-500/5 border border-pink-500/20 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-pink-400" />
                Cómo usar los hooks correctamente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl mb-2">⏱️</div>
                  <h4 className="text-sm font-bold text-white mb-1">Primeros 3 segundos</h4>
                  <p className="text-xs text-white/50">El hook debe aparecer inmediatamente. Sin intros largas, sin música de 10 segundos. Di la frase de golpe.</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">🔁</div>
                  <h4 className="text-sm font-bold text-white mb-1">Promesa → Cumplimiento</h4>
                  <p className="text-xs text-white/50">Asegúrate de que el video CUMPLE lo que promete el hook. Si no, el watch time cae y el algoritmo te penaliza.</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">🧪</div>
                  <h4 className="text-sm font-bold text-white mb-1">A/B con el mismo video</h4>
                  <p className="text-xs text-white/50">Graba 2-3 versiones del hook para el mismo video y úsalas en distintas publicaciones para ver cuál retiene más.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleGenerar}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all"
              >
                <RefreshCw size={16} />
                Regenerar hooks
              </button>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && hooks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 flex items-center justify-center mx-auto mb-4">
              <Mic size={36} className="text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Tu banco de hooks personal</h3>
            <p className="text-white/40 max-w-md mx-auto text-sm mb-8">
              Genera decenas de hooks para tu nicho. Úsalos en tus videos, shorts y reels para maximizar el tiempo de retención.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto">
              {Object.entries(CATEGORIAS_CONFIG).map(([cat, cfg]) => (
                <div key={cat} className={`${cfg.bg} border ${cfg.border} rounded-xl p-3`}>
                  <div className="mb-1"><cfg.icon size={16} style={{ color: "#a78bfa" }} /></div>
                  <p className={`text-[10px] font-bold ${cfg.color} mb-1`}>{cat}</p>
                  <p className="text-[9px] text-white/30 leading-tight">{cfg.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
