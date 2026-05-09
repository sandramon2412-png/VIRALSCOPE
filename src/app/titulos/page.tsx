"use client";
import { useState } from "react";
import Link from "next/link";
import NavAuth from "@/components/NavAuth";
import {
  Zap, Copy, Check, Star, TrendingUp, Heart, AlertTriangle,
  Lightbulb, Target, ArrowLeft, Sparkles, ChevronDown, ChevronUp,
  BarChart2, RefreshCw, Download, Filter,
  Search, Unlock, XCircle, BookOpen, HelpCircle, Clock, Gem, Trophy,
  Eye, Hash, EyeOff, User, Pin,
} from "lucide-react";

interface Titulo {
  titulo: string;
  formula: string;
  gancho: string;
  puntuacion: number;
  emocion: string;
}

const EMOCIONES_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  "Curiosidad": { color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", icon: Search },
  "Miedo": { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: AlertTriangle },
  "Esperanza": { color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", icon: Sparkles },
  "Sorpresa": { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: Lightbulb },
  "Codicia": { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", icon: TrendingUp },
};

const FORMULAS_INFO: Record<string, React.ElementType> = {
  "Número específico": Hash,
  "Secreto revelado": Unlock,
  "Error común": XCircle,
  "Historia personal": BookOpen,
  "Pregunta provocadora": HelpCircle,
  "Urgencia/FOMO": Clock,
  "Contraintuitivo": RefreshCw,
  "Número + promesa": Gem,
  "Desafío": Trophy,
  "Autoridad + resultado": Target,
  "Comparación": BarChart2,
  "Curiosity gap": Eye,
};

function getScoreColor(score: number) {
  if (score >= 90) return "text-green-400";
  if (score >= 75) return "text-yellow-400";
  return "text-orange-400";
}

function getScoreBg(score: number) {
  if (score >= 90) return "from-green-500 to-emerald-500";
  if (score >= 75) return "from-yellow-500 to-amber-500";
  return "from-orange-500 to-red-500";
}

export default function TitulosPage() {
  const [tema, setTema] = useState("");
  const [nicho, setNicho] = useState("");
  const [tipo, setTipo] = useState("faceless");
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filterEmocion, setFilterEmocion] = useState<string>("all");
  const [copiedAll, setCopiedAll] = useState(false);

  const nichos = [
    "Finanzas personales", "Fitness y salud", "Tecnología", "Emprendimiento",
    "Marketing digital", "Desarrollo personal", "Gaming", "Cocina y recetas",
    "Viajes", "Educación", "Relaciones", "Entretenimiento", "Criptomonedas",
    "Bienes raíces", "Productividad"
  ];

  async function handleGenerar() {
    if (!tema.trim() || !nicho) {
      setError("Por favor ingresa el tema y selecciona un nicho.");
      return;
    }
    setLoading(true);
    setError("");
    setTitulos([]);
    setExpandedIndex(null);
    setFilterEmocion("all");

    try {
      const res = await fetch("/api/titulos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, nicho, tipo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTitulos(data.titulos || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error generando títulos");
    } finally {
      setLoading(false);
    }
  }

  function copyTitle(titulo: string, index: number) {
    navigator.clipboard.writeText(titulo);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function copyAll() {
    const text = filteredTitulos.map((t, i) => `${i + 1}. ${t.titulo}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  function downloadTitulos() {
    const content = filteredTitulos.map((t, i) =>
      `${i + 1}. ${t.titulo}\n   Fórmula: ${t.formula} | Puntuación: ${t.puntuacion}/100 | Emoción: ${t.emocion}\n   Gancho: ${t.gancho}\n`
    ).join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `titulos-virales-${tema.slice(0, 30).replace(/\s+/g, "-")}.txt`;
    a.click();
  }

  const emocionesList = [...new Set(titulos.map(t => t.emocion))];
  const filteredTitulos = filterEmocion === "all" ? titulos : titulos.filter(t => t.emocion === filterEmocion);
  const avgScore = titulos.length ? Math.round(titulos.reduce((a, b) => a + b.puntuacion, 0) / titulos.length) : 0;
  const topTitle = titulos.length ? titulos.reduce((a, b) => a.puntuacion > b.puntuacion ? a : b) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
              <ArrowLeft size={16} />
              <span>Volver</span>
            </Link>
            <div className="w-px h-5 bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-none">Títulos Virales</h1>
                <p className="text-xs text-white/40 leading-none mt-0.5">Generador con IA</p>
              </div>
            </div>
          </div>
          <NavAuth />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-4">
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-yellow-400 text-xs font-medium">12 fórmulas probadas de YouTube</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">
            Genera títulos que{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              disparan los clics
            </span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Cada título usa una fórmula psicológica diferente. Pruébalos todos, el algoritmo de YouTube ama la variedad.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">
                Tema o idea del video *
              </label>
              <input
                type="text"
                value={tema}
                onChange={e => setTema(e.target.value)}
                placeholder="ej: cómo ahorrar dinero siendo estudiante"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 transition-colors"
                onKeyDown={e => e.key === "Enter" && handleGenerar()}
              />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">
                Nicho *
              </label>
              <select
                value={nicho}
                onChange={e => setNicho(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
              >
                <option value="" className="bg-gray-900">Seleccionar nicho</option>
                {nichos.map(n => (
                  <option key={n} value={n} className="bg-gray-900">{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs text-white/50">Tipo de canal:</span>
            {[
              { value: "faceless", icon: EyeOff, label: "Faceless", desc: "Sin mostrar la cara" },
              { value: "personal", icon: User,   label: "Personal", desc: "Con presentador" },
              { value: "educativo", icon: BookOpen, label: "Educativo", desc: "Tutoriales / Cursos" },
            ].map(opt => {
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTipo(opt.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                    tipo === opt.value
                      ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300"
                      : "bg-white/5 border-white/10 text-white/50 hover:border-white/30"
                  }`}
                >
                  <OptIcon size={13} style={{ color: "#a78bfa" }} /> {opt.label}
                </button>
              );
            })}
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
            className="w-full py-4 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Analizando fórmulas virales...
              </>
            ) : (
              <>
                <Zap size={20} />
                Generar 12 Títulos Virales
              </>
            )}
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-full mb-2" />
                    <div className="h-4 bg-white/10 rounded w-4/5 mb-3" />
                    <div className="flex gap-2">
                      <div className="h-5 bg-white/10 rounded w-20" />
                      <div className="h-5 bg-white/10 rounded w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {titulos.length > 0 && !loading && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-yellow-400">{titulos.length}</div>
                <div className="text-xs text-white/50 mt-1">Títulos generados</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className={`text-2xl font-black ${getScoreColor(avgScore)}`}>{avgScore}/100</div>
                <div className="text-xs text-white/50 mt-1">Puntuación promedio</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-purple-400">{emocionesList.length}</div>
                <div className="text-xs text-white/50 mt-1">Emociones distintas</div>
              </div>
            </div>

            {/* Top title highlight */}
            {topTitle && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Mejor título · {topTitle.puntuacion}/100</span>
                </div>
                <p className="text-white font-bold text-lg leading-snug">"{topTitle.titulo}"</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-white/50">
                    {(() => { const FI = FORMULAS_INFO[topTitle.formula] || Pin; return <FI size={11} style={{ color: "#a78bfa" }} />; })()}
                    {topTitle.formula}
                  </span>
                  <span className="text-xs text-white/50">·</span>
                  <span className="inline-flex items-center gap-1 text-xs text-white/50">
                    {(() => { const EI = EMOCIONES_CONFIG[topTitle.emocion]?.icon || Pin; return <EI size={11} style={{ color: "#a78bfa" }} />; })()}
                    {topTitle.emocion}
                  </span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-white/40" />
                <button
                  onClick={() => setFilterEmocion("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterEmocion === "all"
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-white/50 hover:text-white"
                  }`}
                >
                  Todos ({titulos.length})
                </button>
                {emocionesList.map(emocion => {
                  const cfg = EMOCIONES_CONFIG[emocion] || { icon: Pin, color: "text-white/60", bg: "" };
                  const count = titulos.filter(t => t.emocion === emocion).length;
                  const EmoIcon = cfg.icon;
                  return (
                    <button
                      key={emocion}
                      onClick={() => setFilterEmocion(emocion)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filterEmocion === emocion
                          ? `${cfg.bg} border ${cfg.color}`
                          : "bg-white/5 text-white/50 hover:text-white"
                      }`}
                    >
                      <EmoIcon size={11} style={{ color: "#a78bfa" }} /> {emocion} ({count})
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
                  onClick={downloadTitulos}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs transition-all"
                >
                  <Download size={12} />
                  Descargar
                </button>
              </div>
            </div>

            {/* Titles grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTitulos.map((titulo, index) => {
                const originalIndex = titulos.indexOf(titulo);
                const emocionCfg = EMOCIONES_CONFIG[titulo.emocion] || { color: "text-white/60", bg: "bg-white/5 border-white/10", icon: Pin };
                const isExpanded = expandedIndex === originalIndex;
                return (
                  <div
                    key={originalIndex}
                    className={`bg-white/5 border rounded-xl transition-all cursor-pointer ${
                      isExpanded ? "border-white/30" : "border-white/10 hover:border-white/20"
                    }`}
                    onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Score badge */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getScoreBg(titulo.puntuacion)} flex flex-col items-center justify-center`}>
                          <span className="text-white font-black text-sm leading-none">{titulo.puntuacion}</span>
                          <span className="text-white/70 text-[9px] leading-none mt-0.5">/ 100</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2">
                            {titulo.titulo}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {(() => { const EI = emocionCfg.icon; return (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border ${emocionCfg.bg} ${emocionCfg.color}`}>
                                <EI size={10} style={{ color: "#a78bfa" }} /> {titulo.emocion}
                              </span>
                            ); })()}
                            {(() => { const FI = FORMULAS_INFO[titulo.formula] || Pin; return (
                              <span className="inline-flex items-center gap-1 text-xs text-white/40">
                                <FI size={10} style={{ color: "#a78bfa" }} /> {titulo.formula}
                              </span>
                            ); })()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={e => { e.stopPropagation(); copyTitle(titulo.titulo, originalIndex); }}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                            title="Copiar"
                          >
                            {copiedIndex === originalIndex
                              ? <Check size={14} className="text-green-400" />
                              : <Copy size={14} className="text-white/60" />
                            }
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setExpandedIndex(isExpanded ? null : originalIndex); }}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                          >
                            {isExpanded
                              ? <ChevronUp size={14} className="text-white/60" />
                              : <ChevronDown size={14} className="text-white/60" />
                            }
                          </button>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="mt-3">
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getScoreBg(titulo.puntuacion)} rounded-full transition-all`}
                            style={{ width: `${titulo.puntuacion}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded info */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-white/10 pt-3">
                        <div className="flex items-start gap-2">
                          <Lightbulb size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Por qué genera clics</p>
                            <p className="text-sm text-white/70">{titulo.gancho}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tips section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-blue-400" />
                  <span className="text-blue-400 text-sm font-bold">A/B Test</span>
                </div>
                <p className="text-xs text-white/50">Prueba 2-3 títulos diferentes para el mismo video. YouTube te permite cambiar el título después de publicar.</p>
              </div>
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 size={16} className="text-purple-400" />
                  <span className="text-purple-400 text-sm font-bold">CTR objetivo</span>
                </div>
                <p className="text-xs text-white/50">Un buen título consigue 4-10% de CTR. Combínalo siempre con una miniatura que refuerce el mismo mensaje.</p>
              </div>
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-green-400" />
                  <span className="text-green-400 text-sm font-bold">Consistencia</span>
                </div>
                <p className="text-xs text-white/50">Los títulos con números específicos (7, 11, 17) generan hasta 73% más clics que los títulos genéricos.</p>
              </div>
            </div>

            {/* Generate again */}
            <div className="mt-6 text-center">
              <button
                onClick={handleGenerar}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all"
              >
                <RefreshCw size={16} />
                Regenerar con las mismas opciones
              </button>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && titulos.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <Zap size={36} className="text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">¿Listo para viralizar?</h3>
            <p className="text-white/40 max-w-md mx-auto text-sm">
              Ingresa el tema de tu video y genera 12 títulos optimizados con las fórmulas que usan los canales con millones de vistas.
            </p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl mx-auto">
              {Object.entries(FORMULAS_INFO).slice(0, 8).map(([formula, Icon]) => (
                <div key={formula} className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                  <div className="flex justify-center mb-1"><Icon size={16} style={{ color: "#a78bfa" }} /></div>
                  <p className="text-[10px] text-white/40 leading-tight">{formula}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
