"use client";
import { useState } from "react";
import Link from "next/link";
import NavAuth from "@/components/NavAuth";
import {
  Search, ArrowLeft, Sparkles, RefreshCw, AlertTriangle,
  Plus, Trash2, TrendingUp, Target, Zap, Star, BarChart2,
  ChevronDown, ChevronUp, Copy, Check, Users, Loader2,
} from "lucide-react";

interface Canal {
  nombre: string;
  suscriptores: string;
  videosXsemana: string;
  estilo: string;
}

interface AnalisisCanal {
  nombre: string;
  fortalezas: string[];
  debilidades: string[];
  estrategia_contenido: string;
  publico_objetivo: string;
  tipo_contenido: string;
  puntuacion_seo: number;
  puntuacion_engagement: number;
  puntuacion_consistencia: number;
}

interface Oportunidad {
  titulo: string;
  descripcion: string;
  dificultad: "Baja" | "Media" | "Alta";
  impacto_potencial: "Bajo" | "Medio" | "Alto";
}

interface Resultado {
  resumen_nicho: string;
  canales: AnalisisCanal[];
  comparativa: {
    lider_seo: string;
    lider_engagement: string;
    mas_consistente: string;
    gap_contenido: string;
  };
  oportunidades: Oportunidad[];
  estrategia_recomendada: {
    posicionamiento: string;
    tipo_videos: string;
    frecuencia: string;
    primeros_pasos: string[];
  };
  palabras_clave_oportunidad: string[];
}

const NICHOS = [
  "Finanzas personales", "Fitness y salud", "Tecnología", "Emprendimiento",
  "Marketing digital", "Desarrollo personal", "Gaming", "Cocina y recetas",
  "Viajes", "Educación", "Relaciones", "Entretenimiento", "Criptomonedas",
  "Bienes raíces", "Productividad"
];

const ESTILOS = [
  "Educativo / Tutoriales", "Entretenimiento", "Motivacional",
  "Informativo / Noticias", "Storytelling", "Faceless / Narración",
  "Vlogs / Personal", "Shorts / Clips"
];

const DIFICULTAD_CONFIG = {
  "Baja": { color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
  "Media": { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  "Alta": { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
};

const IMPACTO_CONFIG = {
  "Bajo": { color: "text-white/50", icon: "📉" },
  "Medio": { color: "text-yellow-400", icon: "📊" },
  "Alto": { color: "text-green-400", icon: "🚀" },
};

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/50">{label}</span>
        <span className={`text-xs font-bold ${color}`}>{value}/100</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            value >= 80 ? "bg-green-500" : value >= 60 ? "bg-yellow-500" : "bg-red-500"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const CANAL_COLORS = [
  { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
  { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-500" },
  { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500" },
];

function formatSubs(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function CompetenciaPage() {
  const [nicho, setNicho] = useState("");
  const [canales, setCanales] = useState<Canal[]>([
    { nombre: "", suscriptores: "", videosXsemana: "", estilo: "" },
    { nombre: "", suscriptores: "", videosXsemana: "", estilo: "" },
  ]);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedCanal, setExpandedCanal] = useState<number | null>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [fetchingIdx, setFetchingIdx] = useState<number | null>(null);
  const [fetchedIdx, setFetchedIdx] = useState<number[]>([]);

  function addCanal() {
    if (canales.length < 4) {
      setCanales([...canales, { nombre: "", suscriptores: "", videosXsemana: "", estilo: "" }]);
    }
  }

  function removeCanal(index: number) {
    if (canales.length > 2) {
      setCanales(canales.filter((_, i) => i !== index));
      setFetchedIdx(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    }
  }

  function updateCanal(index: number, field: keyof Canal, value: string) {
    const updated = [...canales];
    updated[index][field] = value;
    setCanales(updated);
    // Si el nombre cambia, quitar el estado "verificado"
    if (field === "nombre") {
      setFetchedIdx(prev => prev.filter(i => i !== index));
    }
  }

  async function fetchCanalReal(index: number) {
    const nombre = canales[index].nombre.trim();
    if (!nombre) return;
    setFetchingIdx(index);
    try {
      const res = await fetch(`/api/canal?canal=${encodeURIComponent(nombre)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const { canal } = data;
      const updated = [...canales];
      updated[index] = {
        ...updated[index],
        suscriptores: formatSubs(canal.suscriptores),
        videosXsemana: canal.totalVideos > 0
          ? String(Math.round(canal.totalVideos / Math.max(1, Math.floor((Date.now() - new Date(canal.fechaCreacion).getTime()) / (1000 * 60 * 60 * 24 * 7)))))
          : updated[index].videosXsemana,
      };
      setCanales(updated);
      setFetchedIdx(prev => [...prev.filter(i => i !== index), index]);
    } catch {
      // Silently fail — user can still enter manually
    } finally {
      setFetchingIdx(null);
    }
  }

  async function handleAnalizar() {
    const canalesValidos = canales.filter(c => c.nombre.trim());
    if (!nicho || canalesValidos.length < 2) {
      setError("Por favor ingresa el nicho y al menos 2 canales con nombre.");
      return;
    }
    setLoading(true);
    setError("");
    setResultado(null);
    setExpandedCanal(null);

    try {
      const res = await fetch("/api/competencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canales: canalesValidos, nicho }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResultado(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error analizando competencia");
    } finally {
      setLoading(false);
    }
  }

  function copyKeyword(kw: string) {
    navigator.clipboard.writeText(kw);
    setCopiedKeyword(kw);
    setTimeout(() => setCopiedKeyword(null), 2000);
  }

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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Search size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-none">Análisis de Competencia</h1>
                <p className="text-xs text-white/40 leading-none mt-0.5">Compara hasta 4 canales</p>
              </div>
            </div>
          </div>
          <NavAuth />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-4">
            <Sparkles size={14} className="text-cyan-400" />
            <span className="text-cyan-400 text-xs font-medium">Análisis cruzado de hasta 4 canales</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">
            Encuentra los{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              gaps de tu competencia
            </span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Analiza qué hacen bien y qué hacen mal tus competidores. Encuentra oportunidades que nadie más está aprovechando.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          {/* Nicho */}
          <div className="mb-5">
            <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">🎯 Nicho del análisis *</label>
            <select
              value={nicho}
              onChange={e => setNicho(e.target.value)}
              className="w-full md:w-80 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              <option value="" className="bg-gray-900">Seleccionar nicho</option>
              {NICHOS.map(n => (
                <option key={n} value={n} className="bg-gray-900">{n}</option>
              ))}
            </select>
          </div>

          {/* Canales */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-white/50 uppercase tracking-wider">📺 Canales a comparar ({canales.length}/4)</label>
              {canales.length < 4 && (
                <button
                  onClick={addCanal}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Plus size={14} />
                  Agregar canal
                </button>
              )}
            </div>

            {canales.map((canal, index) => {
              const colorCfg = CANAL_COLORS[index % CANAL_COLORS.length];
              return (
                <div key={index} className={`border ${colorCfg.border} ${colorCfg.bg} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${colorCfg.dot}`} />
                    <span className={`text-xs font-bold ${colorCfg.text}`}>Canal {index + 1}</span>
                    {index >= 2 && (
                      <button
                        onClick={() => removeCanal(index)}
                        className="ml-auto text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {/* Fila 1: Nombre + botón buscar datos reales */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={canal.nombre}
                        onChange={e => updateCanal(index, "nombre", e.target.value)}
                        onKeyDown={e => e.key === "Enter" && fetchCanalReal(index)}
                        placeholder="@handle, URL o nombre del canal *"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                      />
                      <button
                        onClick={() => fetchCanalReal(index)}
                        disabled={!canal.nombre.trim() || fetchingIdx === index}
                        title="Obtener datos reales de YouTube"
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap disabled:opacity-40 ${
                          fetchedIdx.includes(index)
                            ? "bg-green-500/20 border border-green-500/30 text-green-400"
                            : "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30"
                        }`}
                      >
                        {fetchingIdx === index
                          ? <><Loader2 size={12} className="animate-spin" />Buscando...</>
                          : fetchedIdx.includes(index)
                          ? <><Check size={12} />✓ Real</>
                          : <><Search size={12} />Datos reales</>
                        }
                      </button>
                    </div>
                    {/* Fila 2: Subs + Videos/semana + Estilo */}
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={canal.suscriptores}
                        onChange={e => updateCanal(index, "suscriptores", e.target.value)}
                        placeholder="Suscriptores (ej: 50K)"
                        className={`bg-white/5 border rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none ${
                          fetchedIdx.includes(index) ? "border-green-500/30" : "border-white/10 focus:border-white/30"
                        }`}
                      />
                      <input
                        type="text"
                        value={canal.videosXsemana}
                        onChange={e => updateCanal(index, "videosXsemana", e.target.value)}
                        placeholder="Videos/semana"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                      />
                      <select
                        value={canal.estilo}
                        onChange={e => updateCanal(index, "estilo", e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                      >
                        <option value="" className="bg-gray-900">Estilo de contenido</option>
                        {ESTILOS.map(e => (
                          <option key={e} value={e} className="bg-gray-900">{e}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
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
            onClick={handleAnalizar}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Analizando competencia con IA...
              </>
            ) : (
              <>
                <Search size={20} />
                Analizar Competencia
              </>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
              <div className="h-3 bg-white/10 rounded w-full mb-2" />
              <div className="h-3 bg-white/10 rounded w-4/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-white/10 rounded w-1/2 mb-3" />
                  <div className="h-3 bg-white/10 rounded w-full mb-2" />
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {resultado && !loading && (
          <div className="space-y-6">
            {/* Resumen del nicho */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 size={18} className="text-cyan-400" />
                <h3 className="font-bold text-white">Estado del nicho: {nicho}</h3>
              </div>
              <p className="text-white/70 leading-relaxed">{resultado.resumen_nicho}</p>
            </div>

            {/* Comparativa rápida */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-xs text-white/40 mb-1">🏆 Líder en SEO</div>
                <p className="text-white font-bold text-sm">{resultado.comparativa.lider_seo.split(":")[0]}</p>
                <p className="text-white/40 text-xs mt-1">{resultado.comparativa.lider_seo.split(":")[1]}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-xs text-white/40 mb-1">❤️ Mejor engagement</div>
                <p className="text-white font-bold text-sm">{resultado.comparativa.lider_engagement.split(":")[0]}</p>
                <p className="text-white/40 text-xs mt-1">{resultado.comparativa.lider_engagement.split(":")[1]}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-xs text-white/40 mb-1">📅 Más consistente</div>
                <p className="text-white font-bold text-sm">{resultado.comparativa.mas_consistente.split(":")[0]}</p>
                <p className="text-white/40 text-xs mt-1">{resultado.comparativa.mas_consistente.split(":")[1]}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="text-xs text-green-400 mb-1">🕳️ GAP detectado</div>
                <p className="text-white font-bold text-xs leading-snug">{resultado.comparativa.gap_contenido}</p>
              </div>
            </div>

            {/* Análisis por canal */}
            <div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Users size={18} className="text-white/60" />
                Análisis por canal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resultado.canales.map((canal, index) => {
                  const colorCfg = CANAL_COLORS[index % CANAL_COLORS.length];
                  const isExpanded = expandedCanal === index;
                  return (
                    <div key={index} className={`border ${colorCfg.border} rounded-xl overflow-hidden`}>
                      <div
                        className={`${colorCfg.bg} p-4 cursor-pointer`}
                        onClick={() => setExpandedCanal(isExpanded ? null : index)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${colorCfg.dot}`} />
                              <h4 className={`font-bold ${colorCfg.text}`}>{canal.nombre}</h4>
                            </div>
                            <p className="text-xs text-white/50">{canal.tipo_contenido} · {canal.publico_objetivo}</p>
                          </div>
                          {isExpanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                        </div>

                        {/* Score bars */}
                        <div className="mt-3 space-y-1">
                          <ScoreBar label="SEO" value={canal.puntuacion_seo} color="text-blue-400" />
                          <ScoreBar label="Engagement" value={canal.puntuacion_engagement} color="text-purple-400" />
                          <ScoreBar label="Consistencia" value={canal.puntuacion_consistencia} color="text-green-400" />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-white/3 border-t border-white/10">
                          <div className="mb-3">
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Estrategia de contenido</p>
                            <p className="text-sm text-white/70">{canal.estrategia_contenido}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-green-400 uppercase tracking-wider mb-2">✅ Fortalezas</p>
                              <ul className="space-y-1">
                                {canal.fortalezas.map((f, i) => (
                                  <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                                    <span className="text-green-500 mt-0.5">•</span>
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs text-red-400 uppercase tracking-wider mb-2">❌ Debilidades</p>
                              <ul className="space-y-1">
                                {canal.debilidades.map((d, i) => (
                                  <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    {d}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Oportunidades */}
            <div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                Oportunidades detectadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resultado.oportunidades.map((op, index) => {
                  const difCfg = DIFICULTAD_CONFIG[op.dificultad] || DIFICULTAD_CONFIG["Media"];
                  const impCfg = IMPACTO_CONFIG[op.impacto_potencial] || IMPACTO_CONFIG["Medio"];
                  return (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-white text-sm">{op.titulo}</h4>
                        <div className="flex items-center gap-2 ml-2">
                          <span className={`text-xs px-2 py-0.5 rounded border ${difCfg.bg} ${difCfg.color}`}>
                            {op.dificultad}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-white/60 mb-3">{op.descripcion}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40">Impacto:</span>
                        <span className={`text-xs font-bold ${impCfg.color}`}>
                          {impCfg.icon} {op.impacto_potencial}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estrategia recomendada */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Target size={18} className="text-green-400" />
                Tu estrategia para diferenciarte
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-green-400 uppercase tracking-wider mb-2">🎯 Posicionamiento</p>
                  <p className="text-sm text-white/70">{resultado.estrategia_recomendada.posicionamiento}</p>
                </div>
                <div>
                  <p className="text-xs text-green-400 uppercase tracking-wider mb-2">🎬 Tipo de videos</p>
                  <p className="text-sm text-white/70">{resultado.estrategia_recomendada.tipo_videos}</p>
                </div>
                <div>
                  <p className="text-xs text-green-400 uppercase tracking-wider mb-2">📅 Frecuencia</p>
                  <p className="text-sm text-white/70">{resultado.estrategia_recomendada.frecuencia}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-green-400 uppercase tracking-wider mb-3">🚀 Primeros pasos</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {resultado.estrategia_recomendada.primeros_pasos.map((paso, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-white/70">{paso}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-cyan-400" />
                Keywords de oportunidad
              </h3>
              <div className="flex flex-wrap gap-2">
                {resultado.palabras_clave_oportunidad.map((kw, i) => (
                  <button
                    key={i}
                    onClick={() => copyKeyword(kw)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-all"
                  >
                    {copiedKeyword === kw
                      ? <Check size={12} className="text-green-400" />
                      : <Copy size={12} />
                    }
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze again */}
            <div className="text-center">
              <button
                onClick={handleAnalizar}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all"
              >
                <RefreshCw size={16} />
                Volver a analizar
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !resultado && (
          <div className="text-center py-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              {CANAL_COLORS.slice(0, 3).map((cfg, i) => (
                <div key={i} className={`w-16 h-16 rounded-2xl border ${cfg.border} ${cfg.bg} flex items-center justify-center`}>
                  <Star size={24} className={cfg.text} />
                </div>
              ))}
            </div>
            <h3 className="text-xl font-bold mb-2">Espionaje de competencia con IA</h3>
            <p className="text-white/40 max-w-md mx-auto text-sm">
              Ingresa los datos de tus competidores y obtén un análisis profundo de sus estrategias, fortalezas, debilidades y los gaps que puedes aprovechar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
