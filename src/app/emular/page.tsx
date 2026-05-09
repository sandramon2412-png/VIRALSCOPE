"use client";
import { useState } from "react";
import Link from "next/link";
import NavAuth from "@/components/NavAuth";
import GlobalNav from "@/components/GlobalNav";
import {
  Copy, Check, ArrowLeft, RefreshCw, AlertTriangle, Sparkles,
  Target, TrendingUp, Calendar, Zap, Star, ChevronDown, ChevronUp,
  Users, BarChart2, Crosshair, BookOpen, Search
} from "lucide-react";

interface PilarExito { nombre: string; descripcion: string; }
interface SemanaAccion { semana: number; accion: string; objetivo: string; }
interface VideoGancho { titulo: string; razon: string; }
interface ComoSuperarlo { gap_principal: string; angulo_diferenciador: string; ventaja_competitiva: string; }
interface MetricasObjetivo { subs_mes_1: string; subs_mes_3: string; subs_mes_6: string; views_promedio_objetivo: string; }

interface Resultado {
  resumen_canal: string;
  pilares_exito: PilarExito[];
  tipo_contenido: string;
  publico_objetivo: string;
  patron_titulos: string;
  patron_hooks: string;
  frecuencia_optima: string;
  como_superarlo: ComoSuperarlo;
  plan_primeros_30_dias: SemanaAccion[];
  videos_gancho: VideoGancho[];
  seo_keywords: string[];
  metricas_objetivo: MetricasObjetivo;
  herramientas_recomendadas: string[];
  advertencias: string[];
}

const NICHOS = [
  "Finanzas personales", "Fitness y salud", "Tecnología", "Emprendimiento",
  "Marketing digital", "Desarrollo personal", "Gaming", "Cocina y recetas",
  "Viajes", "Educación", "Relaciones", "Entretenimiento", "Criptomonedas",
  "Bienes raíces", "Productividad", "Motivación", "Programación",
];

const ESTILOS = [
  "Educativo / Tutoriales", "Entretenimiento", "Motivacional",
  "Informativo / Noticias", "Storytelling", "Faceless / Narración",
  "Vlogs / Personal", "Shorts / Clips cortos",
];

export default function EmularPage() {
  const [canal, setCanal] = useState("");
  const [nicho, setNicho] = useState("");
  const [suscriptores, setSuscriptores] = useState("");
  const [videosXsemana, setVideosXsemana] = useState("");
  const [estilo, setEstilo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>("plan");
  const [copiedKw, setCopiedKw] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState<number | null>(null);

  async function handleEmular() {
    if (!canal.trim() || !nicho) {
      setError("Por favor ingresa el nombre del canal y selecciona el nicho.");
      return;
    }
    setLoading(true);
    setError("");
    setResultado(null);
    setExpandedSection("plan");

    try {
      const res = await fetch("/api/emular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canal, nicho, suscriptores, videosXsemana, estilo, objetivo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResultado(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error analizando canal");
    } finally {
      setLoading(false);
    }
  }

  function toggleSection(s: string) {
    setExpandedSection(prev => prev === s ? null : s);
  }

  return (
    <div className="min-h-screen bg-[#0a0812] text-white">
      <GlobalNav />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(249,115,22,0.12))", border: "1px solid rgba(139,92,246,0.3)" }}>
            <Sparkles size={13} style={{ color: "#a78bfa" }} />
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Estrategia completa para replicar cualquier canal exitoso
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">
            Emula y supera a{" "}
            <span style={{ background: "linear-gradient(135deg, #8b5cf6, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              cualquier canal
            </span>
          </h2>
          <p className="text-white/45 max-w-xl mx-auto">
            Ingresa un canal de referencia y obtén un plan completo para replicar su estrategia, superar sus debilidades y crecer más rápido.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl p-6 mb-8"
          style={{ background: "radial-gradient(130% 130% at 0% 0%, #1a1430, #0b0914 70%)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">📺 Canal de referencia *</label>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  value={canal}
                  onChange={e => setCanal(e.target.value)}
                  placeholder="ej: @juandeldinero, Andynsane, MrBeast..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">🎯 Nicho *</label>
              <select value={nicho} onChange={e => setNicho(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors">
                <option value="" className="bg-gray-900">Seleccionar nicho</option>
                {NICHOS.map(n => <option key={n} value={n} className="bg-gray-900">{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">👥 Suscriptores aprox.</label>
              <input type="text" value={suscriptores} onChange={e => setSuscriptores(e.target.value)}
                placeholder="ej: 500K, 1.2M, 50K"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">📅 Frecuencia del canal</label>
              <input type="text" value={videosXsemana} onChange={e => setVideosXsemana(e.target.value)}
                placeholder="ej: 2 videos/semana"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">🎬 Estilo de contenido</label>
              <select value={estilo} onChange={e => setEstilo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors">
                <option value="" className="bg-gray-900">Seleccionar estilo</option>
                {ESTILOS.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">💭 Tu objetivo (opcional)</label>
              <input type="text" value={objetivo} onChange={e => setObjetivo(e.target.value)}
                placeholder="ej: crear canal similar pero en español"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm">
              <AlertTriangle size={15} />{error}
            </div>
          )}

          <button onClick={handleEmular} disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)", boxShadow: "0 4px 24px rgba(139,92,246,0.3)" }}>
            {loading ? <><RefreshCw size={20} className="animate-spin" />Analizando canal con IA...</> : <><Crosshair size={20} />Emular Este Canal</>}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="h-4 rounded w-1/3 mb-2" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="h-3 rounded w-full mb-1" style={{ background: "rgba(255,255,255,0.04)" }} />
                <div className="h-3 rounded w-4/5" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {resultado && !loading && (
          <div className="space-y-4">
            {/* Resumen */}
            <div className="rounded-2xl p-5"
              style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(249,115,22,0.08))", border: "1px solid rgba(139,92,246,0.25)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} style={{ color: "#a78bfa" }} />
                <span className="font-bold text-white text-sm">Análisis de {canal}</span>
              </div>
              <p className="text-white/65 text-sm leading-relaxed">{resultado.resumen_canal}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>
                  📺 {resultado.tipo_contenido}
                </span>
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", color: "#fb923c" }}>
                  📅 {resultado.frecuencia_optima}
                </span>
              </div>
            </div>

            {/* Pilares de éxito */}
            <SectionCard
              title="⭐ Pilares de éxito"
              icon={<Star size={16} style={{ color: "#eab308" }} />}
              expanded={expandedSection === "pilares"}
              onToggle={() => toggleSection("pilares")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resultado.pilares_exito.map((p, i) => (
                  <div key={i} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-sm font-bold text-white mb-1">{p.nombre}</p>
                    <p className="text-xs text-white/50 leading-relaxed">{p.descripcion}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Cómo superarlo */}
            <SectionCard
              title="🎯 Cómo superarlo"
              icon={<Target size={16} style={{ color: "#22c55e" }} />}
              expanded={expandedSection === "superar"}
              onToggle={() => toggleSection("superar")}
              highlightColor="rgba(34,197,94,0.1)"
              borderColor="rgba(34,197,94,0.25)"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl p-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Gap detectado</p>
                  <p className="text-sm text-white/70">{resultado.como_superarlo.gap_principal}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#a78bfa" }}>Tu ángulo único</p>
                  <p className="text-sm text-white/70">{resultado.como_superarlo.angulo_diferenciador}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <p className="text-xs text-green-400 font-bold uppercase tracking-wider mb-1">Ventaja competitiva</p>
                  <p className="text-sm text-white/70">{resultado.como_superarlo.ventaja_competitiva}</p>
                </div>
              </div>
            </SectionCard>

            {/* Plan 30 días */}
            <SectionCard
              title="📅 Plan de los primeros 30 días"
              icon={<Calendar size={16} style={{ color: "#60a5fa" }} />}
              expanded={expandedSection === "plan"}
              onToggle={() => toggleSection("plan")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resultado.plan_primeros_30_dias.map((s) => (
                  <div key={s.semana} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                        style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}>
                        {s.semana}
                      </div>
                      <span className="text-xs text-white/40 uppercase tracking-wider">Semana {s.semana}</span>
                    </div>
                    <p className="text-sm text-white font-medium mb-1">{s.accion}</p>
                    <p className="text-xs text-white/45">🎯 {s.objetivo}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Videos gancho */}
            <SectionCard
              title="⚡ 5 videos para arrancar"
              icon={<Zap size={16} style={{ color: "#fb923c" }} />}
              expanded={expandedSection === "videos"}
              onToggle={() => toggleSection("videos")}
            >
              <div className="space-y-2">
                {resultado.videos_gancho.map((v, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl p-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #f97316, #ec4899)" }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{v.titulo}</p>
                      <p className="text-xs text-white/40 mt-0.5">{v.razon}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(v.titulo); setCopiedTitle(i); setTimeout(() => setCopiedTitle(null), 2000); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white/10">
                      {copiedTitle === i ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-white/30" />}
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Métricas objetivo */}
            <SectionCard
              title="📊 Métricas objetivo"
              icon={<BarChart2 size={16} style={{ color: "#22d3ee" }} />}
              expanded={expandedSection === "metricas"}
              onToggle={() => toggleSection("metricas")}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Mes 1", value: resultado.metricas_objetivo.subs_mes_1, color: "#a78bfa" },
                  { label: "Mes 3", value: resultado.metricas_objetivo.subs_mes_3, color: "#f472b6" },
                  { label: "Mes 6", value: resultado.metricas_objetivo.subs_mes_6, color: "#fb923c" },
                  { label: "Vistas/video", value: resultado.metricas_objetivo.views_promedio_objetivo, color: "#22d3ee" },
                ].map(m => (
                  <div key={m.label} className="rounded-xl p-4 text-center"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-xs text-white/35 mb-1">{m.label}</p>
                    <p className="font-black text-sm" style={{ color: m.color }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Patrones */}
            <SectionCard
              title="🧠 Patrones del canal"
              icon={<BookOpen size={16} style={{ color: "#a78bfa" }} />}
              expanded={expandedSection === "patrones"}
              onToggle={() => toggleSection("patrones")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">📝 Fórmula de títulos</p>
                  <p className="text-sm text-white/70 leading-relaxed">{resultado.patron_titulos}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">🎙️ Patrón de hooks</p>
                  <p className="text-sm text-white/70 leading-relaxed">{resultado.patron_hooks}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">👤 Audiencia objetivo</p>
                  <p className="text-sm text-white/70 leading-relaxed">{resultado.publico_objetivo}</p>
                </div>
              </div>
            </SectionCard>

            {/* Keywords + advertencias */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <TrendingUp size={14} style={{ color: "#22d3ee" }} />
                  Keywords SEO
                </p>
                <div className="flex flex-wrap gap-2">
                  {resultado.seo_keywords.map(kw => (
                    <button key={kw} onClick={() => { navigator.clipboard.writeText(kw); setCopiedKw(kw); setTimeout(() => setCopiedKw(null), 2000); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-cyan-500/20"
                      style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)", color: "#22d3ee" }}>
                      {copiedKw === kw ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                      {kw}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-400" />
                  Errores a evitar
                </p>
                <ul className="space-y-2">
                  {resultado.advertencias.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Volver a analizar */}
            <div className="text-center pt-4">
              <button onClick={handleEmular}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white/50 hover:text-white transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <RefreshCw size={15} />Regenerar análisis
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !resultado && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(249,115,22,0.15))", border: "1px solid rgba(139,92,246,0.2)" }}>
              <Crosshair size={36} style={{ color: "#a78bfa" }} />
            </div>
            <h3 className="text-xl font-bold mb-2">Emulación de canal con IA</h3>
            <p className="text-white/35 max-w-md mx-auto text-sm">
              Ingresa cualquier canal de YouTube como referencia y obtén un plan completo para replicar su estrategia, superar sus debilidades y crecer más rápido que ellos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  title, icon, children, expanded, onToggle, highlightColor, borderColor
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  highlightColor?: string;
  borderColor?: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: highlightColor ? `radial-gradient(130% 130% at 0% 0%, ${highlightColor.replace("0.1", "0.08")}, #0b0914 70%)` : "radial-gradient(130% 130% at 0% 0%, #1a1430, #0b0914 70%)",
        border: `1px solid ${borderColor || "rgba(139,92,246,0.15)"}`,
      }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-bold text-sm text-white">{title}</span>
        </div>
        {expanded ? <ChevronUp size={15} className="text-white/35" /> : <ChevronDown size={15} className="text-white/35" />}
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}
