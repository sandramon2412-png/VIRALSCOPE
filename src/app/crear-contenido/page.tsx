"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Loader2, Check, Copy, Download, RefreshCw, Send,
  ChevronRight, Sparkles, Zap, FileText,
  Hash, Image as ImageIcon, Mic, Search, Eye,
} from "lucide-react";
import GlobalNav from "@/components/GlobalNav";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Titulo {
  titulo: string;
  ctrScore: number;
  seoScore: number;
  viralPot: string;
  analisis: string;
  formula: string;
  emocion: string;
}

interface Hook {
  hook: string;
  palabras: number;
  duracionSeg: number;
  arquetipo: string;
  analisis: string;
}

interface SeoData {
  descripcion: string;
  tags: string[];
  hashtags: string[];
}

interface MiniaturaPrompt {
  estilo: string;
  prompt: string;
  analisis: string;
}

type Paso = "titulos" | "hook" | "guion" | "seo" | "miniaturas";

const PASOS: { id: Paso; label: string; icon: React.ReactNode }[] = [
  { id: "titulos",   label: "Título",    icon: <Zap className="w-3.5 h-3.5" /> },
  { id: "hook",      label: "Hook",      icon: <Mic className="w-3.5 h-3.5" /> },
  { id: "guion",     label: "Guión",     icon: <FileText className="w-3.5 h-3.5" /> },
  { id: "seo",       label: "SEO",       icon: <Search className="w-3.5 h-3.5" /> },
  { id: "miniaturas",label: "Miniatura", icon: <ImageIcon className="w-3.5 h-3.5" /> },
];

// ─── Helper components ────────────────────────────────────────────────────────

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs font-medium transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {label || (copied ? "Copiado" : "Copiar")}
    </button>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-16">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value * 10}%` }} />
      </div>
      <span className="text-xs font-bold w-6 text-right" style={{ color: value >= 8 ? "#4ade80" : value >= 6 ? "#facc15" : "#f87171" }}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function ViralBadge({ level }: { level: string }) {
  const cfg = {
    "Muy Alto": "bg-green-500/20 text-green-400 border-green-500/30",
    "Alto":     "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    "Medio":    "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
    "Bajo":     "bg-red-500/15 text-red-400 border-red-500/25",
  }[level] || "bg-slate-500/15 text-slate-400 border-slate-500/25";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg}`}>{level}</span>
  );
}

// ─── Generate thumbnail with DALL-E ──────────────────────────────────────────

async function generateImage(prompt: string): Promise<string> {
  const res = await fetch("/api/miniatura", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: prompt.slice(0, 100),
      estilo: "fotorrealista",
      resolucion: "1792x1024",
      prompt,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error generando imagen");
  return data.url || data.imageUrl || data.images?.[0]?.url || "";
}

// ─── Main Component ───────────────────────────────────────────────────────────

function CrearContenidoContent() {
  const params = useSearchParams();
  const tituloRef  = params.get("titulo")    || "";
  const canalRef   = params.get("canal")     || "";
  const nicho      = params.get("nicho")     || "";
  const thumbnail  = params.get("thumbnail") || "";
  const videoId    = params.get("videoId")   || "";

  const [pasoActivo, setPasoActivo] = useState<Paso>("titulos");
  const [completados, setCompletados] = useState<Set<Paso>>(new Set());
  const [variacion, setVariacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video duration setting
  const [duracion, setDuracion]   = useState("10 min");

  // Data per step
  const [titulos, setTitulos]     = useState<Titulo[]>([]);
  const [tituloElegido, setTituloElegido] = useState("");
  const [hooks, setHooks]         = useState<Hook[]>([]);
  const [hookElegido, setHookElegido] = useState("");
  const [guion, setGuion]         = useState("");
  const [seo, setSeo]             = useState<SeoData | null>(null);
  const [miniaturas, setMiniaturas] = useState<MiniaturaPrompt[]>([]);

  // Thumbnail generation
  const [genImages, setGenImages] = useState<Record<number, string>>({});
  const [genLoading, setGenLoading] = useState<Record<number, boolean>>({});
  const [genError, setGenError]   = useState<Record<number, string>>({});

  const inputRef = useRef<HTMLInputElement>(null);

  // ── API call ────────────────────────────────────────────────────────────

  const callAPI = useCallback(async (paso: Paso, extras: Record<string, unknown> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/crear-contenido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paso,
          tituloRef,
          canalRef,
          nicho,
          tituloElegido,
          hookElegido,
          variacion,
          duracion,
          faceless: true,
          ...extras,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      return null;
    } finally {
      setLoading(false);
    }
  }, [tituloRef, canalRef, nicho, tituloElegido, hookElegido, variacion, duracion]);

  // ── Step: generate ──────────────────────────────────────────────────────

  const generarTitulos = async () => {
    const data = await callAPI("titulos");
    if (data?.titulos) { setTitulos(data.titulos); setVariacion(""); }
  };

  const generarHooks = async (titulo?: string) => {
    const elegido = titulo || tituloElegido;
    const data = await callAPI("hook", { tituloElegido: elegido });
    if (data?.hooks) { setHooks(data.hooks); setVariacion(""); }
  };

  const generarGuion = async (hook?: string) => {
    const elegido = hook || hookElegido;
    const data = await callAPI("guion", { hookElegido: elegido });
    if (data?.guion) { setGuion(data.guion); setVariacion(""); }
  };

  const generarSeo = async (g?: string) => {
    const data = await callAPI("seo", { guion: g || guion });
    if (data?.descripcion) { setSeo(data); setVariacion(""); }
  };

  const generarMiniaturas = async () => {
    const data = await callAPI("miniaturas");
    if (data?.miniaturas) { setMiniaturas(data.miniaturas); setVariacion(""); }
  };

  // ── Step: select & advance ──────────────────────────────────────────────

  const usarTitulo = async (t: string) => {
    setTituloElegido(t);
    setCompletados(p => new Set([...p, "titulos"]));
    setPasoActivo("hook");
    await generarHooks(t);
  };

  const usarHook = async (h: string) => {
    setHookElegido(h);
    setCompletados(p => new Set([...p, "hook"]));
    setPasoActivo("guion");
    await generarGuion(h);
  };

  const usarGuion = async () => {
    setCompletados(p => new Set([...p, "guion"]));
    setPasoActivo("seo");
    await generarSeo(guion);
  };

  const usarSeo = async () => {
    setCompletados(p => new Set([...p, "seo"]));
    setPasoActivo("miniaturas");
    await generarMiniaturas();
  };

  const usarMiniaturas = () => {
    setCompletados(p => new Set([...p, "miniaturas"]));
  };

  // ── Generate image from prompt ──────────────────────────────────────────

  const handleCrearImagen = async (idx: number, prompt: string) => {
    setGenLoading(p => ({ ...p, [idx]: true }));
    setGenError(p => ({ ...p, [idx]: "" }));
    try {
      const url = await generateImage(prompt);
      if (!url) throw new Error("No se recibió imagen");
      setGenImages(p => ({ ...p, [idx]: url }));
    } catch (e) {
      setGenError(p => ({ ...p, [idx]: e instanceof Error ? e.message : "Error" }));
    } finally {
      setGenLoading(p => ({ ...p, [idx]: false }));
    }
  };

  // ── Export all ──────────────────────────────────────────────────────────

  const exportarTXT = () => {
    const lines: string[] = [
      "═══════════════════════════════════════════",
      "  CONTENIDO GENERADO — ViralScope",
      "═══════════════════════════════════════════",
      `Referencia: ${tituloRef}`,
      `Canal: ${canalRef} | Nicho: ${nicho}`,
      "",
      "─── TÍTULO ───────────────────────────────",
      tituloElegido,
      "",
      "─── HOOK DE APERTURA ─────────────────────",
      hookElegido,
      "",
      "─── GUIÓN COMPLETO ───────────────────────",
      guion,
      "",
    ];
    if (seo) {
      lines.push(
        "─── DESCRIPCIÓN YOUTUBE ──────────────────",
        seo.descripcion,
        "",
        "─── TAGS ─────────────────────────────────",
        seo.tags.join(", "),
        "",
        "─── HASHTAGS ─────────────────────────────",
        seo.hashtags.join(" "),
        "",
      );
    }
    if (miniaturas.length) {
      lines.push("─── PROMPTS MINIATURAS ───────────────────");
      miniaturas.forEach((m, i) => {
        lines.push(`\n[${i + 1}] ${m.estilo}`, m.prompt);
      });
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `contenido-${(tituloElegido || "video").slice(0, 30).replace(/[^a-z0-9]/gi, "-")}.txt`;
    a.click();
  };

  const exportarPDF = () => {
    const fecha = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

    const seccion = (titulo: string, contenido: string) => contenido ? `
    <div class="seccion">
      <div class="seccion-header">${titulo}</div>
      <div class="seccion-body">${contenido.replace(/\n/g, "<br>")}</div>
    </div>
  ` : "";

    const tags = seo?.tags?.map(t => `<span class="tag">${t}</span>`).join("") || "";
    const hashtags = seo?.hashtags?.map(h => `<span class="hashtag">${h}</span>`).join(" ") || "";

    const promptsHtml = miniaturas.map((m, i) => `
    <div class="prompt-card">
      <div class="prompt-estilo">[${i + 1}] ${m.estilo}</div>
      <div class="prompt-text">${m.prompt}</div>
      <div class="prompt-analisis">💡 ${m.analisis}</div>
    </div>
  `).join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Contenido — ${tituloElegido || "Video"}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a2e; font-size: 12px; line-height: 1.6; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }

  /* Header */
  .header { background: linear-gradient(135deg, #8b5cf6, #ec4899, #f97316); color: white; padding: 24px 32px; border-radius: 12px; margin-bottom: 28px; }
  .header-logo { font-size: 11px; font-weight: 700; opacity: 0.8; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
  .header-titulo { font-size: 20px; font-weight: 900; line-height: 1.3; margin-bottom: 8px; }
  .header-meta { font-size: 11px; opacity: 0.75; }
  .header-meta span { margin-right: 16px; }

  /* Sections */
  .seccion { margin-bottom: 22px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; break-inside: avoid; }
  .seccion-header { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 10px 16px; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; }
  .seccion-body { padding: 16px; color: #334155; white-space: pre-wrap; }

  /* Hook special */
  .seccion.hook .seccion-body { background: #fdf4ff; border-left: 3px solid #a855f7; font-style: italic; font-size: 13px; }

  /* Tags */
  .tags-wrap { padding: 12px 16px; display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 500; }
  .hashtag { color: #7c3aed; font-weight: 600; font-size: 11px; }

  /* Prompts */
  .prompt-card { background: #0f172a; color: #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 12px; break-inside: avoid; }
  .prompt-estilo { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #a78bfa; margin-bottom: 8px; }
  .prompt-text { font-size: 11px; line-height: 1.7; color: #cbd5e1; margin-bottom: 8px; }
  .prompt-analisis { font-size: 10px; color: #64748b; font-style: italic; }

  /* Footer */
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; color: #94a3b8; font-size: 10px; }

  @media print {
    body { background: #fff; }
    .page { padding: 20px; max-width: 100%; }
    .no-print { display: none; }
    @page { margin: 1cm; size: A4; }
  }
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="header-logo">⚡ ViralScope — Contenido Generado con IA</div>
    <div class="header-titulo">${tituloElegido || "Título no seleccionado"}</div>
    <div class="header-meta">
      <span>📺 ${canalRef || "Canal"}</span>
      <span>🎯 ${nicho || "Nicho"}</span>
      <span>📅 ${fecha}</span>
    </div>
  </div>

  <!-- Referencia -->
  ${tituloRef ? `<div class="seccion"><div class="seccion-header">🎬 Video de Referencia</div><div class="seccion-body">${tituloRef}</div></div>` : ""}

  <!-- Título -->
  ${seccion("⚡ Título Elegido", tituloElegido)}

  <!-- Hook -->
  ${hookElegido ? `<div class="seccion hook"><div class="seccion-header">🎙️ Hook de Apertura</div><div class="seccion-body">${hookElegido.replace(/\n/g, "<br>")}</div></div>` : ""}

  <!-- Guión -->
  ${guion ? `<div class="seccion"><div class="seccion-header">📝 Guión Completo</div><div class="seccion-body" style="font-size:11px">${guion.replace(/\n/g, "<br>")}</div></div>` : ""}

  <!-- SEO -->
  ${seo?.descripcion ? `<div class="seccion"><div class="seccion-header">🔍 Descripción YouTube (SEO)</div><div class="seccion-body" style="font-size:11px">${seo.descripcion.replace(/\n/g, "<br>")}</div></div>` : ""}

  ${seo?.tags?.length ? `<div class="seccion"><div class="seccion-header">🏷️ Tags</div><div class="tags-wrap">${tags}</div></div>` : ""}

  ${seo?.hashtags?.length ? `<div class="seccion"><div class="seccion-header"># Hashtags</div><div class="seccion-body">${hashtags}</div></div>` : ""}

  <!-- Prompts de miniaturas -->
  ${miniaturas.length ? `<div class="seccion"><div class="seccion-header">🖼️ Prompts de Miniaturas</div><div class="seccion-body" style="padding:12px">${promptsHtml}</div></div>` : ""}

  <!-- Footer -->
  <div class="footer">
    <span>Generado con ViralScope.ai</span>
    <span>${fecha}</span>
  </div>
</div>

<script>
  window.onload = function() {
    window.print();
  };
</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) {
      alert("Permite las ventanas emergentes para exportar el PDF");
      return;
    }
    win.document.write(html);
    win.document.close();
  };

  // ── On variacion submit ─────────────────────────────────────────────────

  const handleEnviarVariacion = () => {
    if (!variacion.trim()) return;
    if (pasoActivo === "titulos") generarTitulos();
    else if (pasoActivo === "hook") generarHooks();
    else if (pasoActivo === "guion") generarGuion();
    else if (pasoActivo === "seo") generarSeo();
    else if (pasoActivo === "miniaturas") generarMiniaturas();
  };

  // ── Init load ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (titulos.length === 0) {
      generarTitulos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pasoIdx = PASOS.findIndex(p => p.id === pasoActivo);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <GlobalNav />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-4">

        {/* ── Header ── */}
        <div className="flex items-start gap-3">
          {thumbnail && (
            <div className="w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
              <Image src={thumbnail} alt="ref" width={96} height={54} className="w-full h-full object-cover" unoptimized />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-500 mb-0.5">
              {canalRef && <span className="text-blue-400 font-medium">{canalRef}</span>}
              {nicho && <span> · {nicho}</span>}
            </div>
            <p className="text-slate-300 text-sm line-clamp-2 leading-snug">
              {tituloRef || "Crear contenido con IA"}
            </p>
            {tituloElegido && (
              <p className="text-violet-300 text-xs mt-1 font-medium line-clamp-1">→ {tituloElegido}</p>
            )}
          </div>
          {(tituloElegido || guion) && (
            <div className="flex gap-2">
              <button
                onClick={exportarTXT}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> .TXT
              </button>
              <button
                onClick={exportarPDF}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-violet-700/50 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 text-xs font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          )}
        </div>

        {/* ── Step tabs ── */}
        <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-1.5">
          {PASOS.map((p, i) => {
            const done = completados.has(p.id);
            const active = pasoActivo === p.id;
            const reachable = i === 0 ||
              (i === 1 && tituloElegido) ||
              (i === 2 && hookElegido) ||
              (i === 3 && guion) ||
              (i === 4 && seo);
            return (
              <button
                key={p.id}
                onClick={() => reachable && setPasoActivo(p.id)}
                disabled={!reachable}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                    : done
                    ? "bg-green-900/30 text-green-400 hover:bg-green-900/40"
                    : reachable
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-700 cursor-not-allowed"
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : p.icon}
                <span className="hidden sm:inline">{p.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            );
          })}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            PASO 1: TÍTULOS
        ══════════════════════════════════════════════════════════════════════ */}
        {pasoActivo === "titulos" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">
                {titulos.length > 0
                  ? `Tienes ${titulos.length} opciones de título. Elige el que más te guste.`
                  : "Generando títulos optimizados para tu nicho..."}
              </p>
              {titulos.length > 0 && (
                <button onClick={generarTitulos} disabled={loading} className="p-1.5 text-slate-500 hover:text-violet-400 transition-colors rounded-lg hover:bg-slate-800">
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
              )}
            </div>

            {loading && titulos.length === 0 ? (
              <div className="flex items-center gap-3 py-8 justify-center text-violet-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Analizando el video de referencia y generando títulos...</span>
              </div>
            ) : (
              titulos.map((t, i) => (
                <div
                  key={i}
                  className={`border rounded-xl p-4 space-y-3 transition-all ${
                    tituloElegido === t.titulo
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-slate-700/60 bg-slate-800/30 hover:border-slate-600"
                  }`}
                >
                  {/* Title text */}
                  <p className="font-semibold text-white leading-snug">{t.titulo}</p>

                  {/* Scores */}
                  <div className="space-y-1.5">
                    <ScoreBar label="CTR Score" value={t.ctrScore} color="bg-violet-500" />
                    <ScoreBar label="SEO Score" value={t.seoScore} color="bg-blue-500" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{t.formula}</span>
                      <ViralBadge level={t.viralPot} />
                    </div>
                    <span className="text-xs text-slate-500 italic">{t.emocion}</span>
                  </div>

                  {/* Analysis */}
                  <div className="bg-slate-900/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Análisis</p>
                    <p className="text-slate-300 text-xs leading-relaxed">{t.analisis}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <CopyBtn text={t.titulo} />
                    <button
                      onClick={() => usarTitulo(t.titulo)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-xs font-bold transition-colors"
                    >
                      {loading && tituloElegido === t.titulo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Usar este título → Hook
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            PASO 2: HOOK
        ══════════════════════════════════════════════════════════════════════ */}
        {pasoActivo === "hook" && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">
              {hooks.length > 0 ? "Elige el hook de apertura para tu video." : "Generando hooks..."}
            </p>

            {loading && hooks.length === 0 ? (
              <div className="flex items-center gap-3 py-8 justify-center text-violet-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Generando hooks basados en el título elegido...</span>
              </div>
            ) : (
              hooks.map((h, i) => (
                <div key={i} className={`border rounded-xl p-4 space-y-3 transition-all ${
                  hookElegido === h.hook ? "border-green-500/50 bg-green-500/5" : "border-slate-700/60 bg-slate-800/30"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">{h.arquetipo}</span>
                    <span className="text-xs text-slate-500">{h.palabras} palabras · ~{h.duracionSeg}s</span>
                  </div>

                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">{h.hook}</p>

                  <div className="bg-slate-900/60 rounded-lg p-3">
                    <p className="text-xs text-slate-400 leading-relaxed">{h.analisis}</p>
                  </div>

                  <div className="flex gap-2">
                    <CopyBtn text={h.hook} />
                    <button
                      onClick={() => usarHook(h.hook)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-xs font-bold transition-colors"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Usar este hook → Guión
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            PASO 3: GUIÓN
        ══════════════════════════════════════════════════════════════════════ */}
        {pasoActivo === "guion" && (
          <div className="space-y-3">
            {/* Duration selector */}
            {!guion && (
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 font-semibold mb-2">⏱ Duración objetivo del video</p>
                <div className="flex flex-wrap gap-1.5">
                  {["60 seg","90 seg","3 min","5 min","8 min","10 min","15 min","20 min"].map(d => (
                    <button
                      key={d}
                      onClick={() => setDuracion(d)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        duracion === d
                          ? "bg-violet-600 border-violet-500 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">
                {guion ? "Guión generado. Revísalo y úsalo o pide cambios." : "Generando guión completo..."}
              </p>
              {guion && (
                <div className="flex gap-2">
                  <CopyBtn text={guion} label="Copiar guión" />
                </div>
              )}
            </div>

            {loading && !guion ? (
              <div className="flex items-center gap-3 py-8 justify-center text-violet-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Escribiendo el guión de {duracion}...</span>
              </div>
            ) : guion ? (
              <>
                <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-5">
                  <pre className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">{guion}</pre>
                </div>
                <button
                  onClick={usarGuion}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-bold transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Usar este guión → SEO
                </button>
              </>
            ) : null}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            PASO 4: SEO
        ══════════════════════════════════════════════════════════════════════ */}
        {pasoActivo === "seo" && (
          <div className="space-y-4">
            {loading && !seo ? (
              <div className="flex items-center gap-3 py-8 justify-center text-violet-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Generando descripción y palabras clave optimizadas...</span>
              </div>
            ) : seo ? (
              <>
                {/* Descripción */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Descripción YouTube</span>
                    <CopyBtn text={seo.descripcion} />
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{seo.descripcion}</p>
                </div>

                {/* Tags */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags ({seo.tags.length})</span>
                    </div>
                    <CopyBtn text={seo.tags.join(", ")} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {seo.tags.map(t => (
                      <span key={t} className="text-xs bg-slate-700/50 border border-slate-600/50 text-slate-300 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Hashtags */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hashtags</span>
                    <CopyBtn text={seo.hashtags.join(" ")} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seo.hashtags.map(h => (
                      <span key={h} className="text-xs text-violet-400 font-medium">{h}</span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={usarSeo}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-bold transition-colors"
                >
                  <Check className="w-4 h-4" /> Continuar → Miniatura
                </button>
              </>
            ) : null}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            PASO 5: MINIATURAS
        ══════════════════════════════════════════════════════════════════════ */}
        {pasoActivo === "miniaturas" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">
                {miniaturas.length > 0 ? `${miniaturas.length} estilos de miniatura generados.` : "Generando prompts de miniaturas..."}
              </p>
              {miniaturas.length > 0 && (
                <button onClick={generarMiniaturas} disabled={loading} className="p-1.5 text-slate-500 hover:text-violet-400 transition-colors rounded-lg hover:bg-slate-800">
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
              )}
            </div>

            {loading && miniaturas.length === 0 ? (
              <div className="flex items-center gap-3 py-8 justify-center text-violet-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Diseñando prompts de alta conversión para tu miniatura...</span>
              </div>
            ) : (
              miniaturas.map((m, i) => (
                <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-3">
                  {/* Style badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                      {m.estilo}
                    </span>
                  </div>

                  {/* Prompt text */}
                  <p className="text-slate-300 text-xs leading-relaxed">{m.prompt}</p>

                  {/* Analysis */}
                  <div className="bg-slate-900/60 rounded-lg px-3 py-2">
                    <p className="text-slate-500 text-xs">{m.analisis}</p>
                  </div>

                  {/* Generated image */}
                  {genImages[i] && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900">
                      <Image src={genImages[i]} alt={m.estilo} fill className="object-cover" unoptimized />
                      <a
                        href={genImages[i]}
                        download={`miniatura-${i + 1}.png`}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {genError[i] && (
                    <p className="text-red-400 text-xs">{genError[i]}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <CopyBtn text={m.prompt} label="Copiar prompt" />
                    <button
                      onClick={() => handleCrearImagen(i, m.prompt)}
                      disabled={genLoading[i]}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-white text-xs font-bold transition-colors disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #ec4899, #f97316)" }}
                    >
                      {genLoading[i] ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando...</>
                      ) : (
                        <><Sparkles className="w-3.5 h-3.5" /> Crear imagen</>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}

            {miniaturas.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={exportarTXT}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-bold transition-all hover:border-slate-600"
                >
                  <Download className="w-4 h-4" /> Exportar .TXT
                </button>
                <button
                  onClick={exportarPDF}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)" }}
                >
                  <FileText className="w-4 h-4" /> Exportar PDF
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Variacion input (sticky bottom) ── */}
        <div className="sticky bottom-4 mt-auto">
          <div className="bg-slate-900/95 border border-slate-700/60 rounded-2xl p-2 flex gap-2 backdrop-blur-sm shadow-2xl shadow-black/60">
            <input
              ref={inputRef}
              type="text"
              value={variacion}
              onChange={e => setVariacion(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleEnviarVariacion()}
              placeholder={
                pasoActivo === "titulos"    ? "Pide variaciones del título o un ángulo diferente..." :
                pasoActivo === "hook"       ? "Pide un hook más corto, más agresivo, otro estilo..." :
                pasoActivo === "guion"      ? "Extiende una sección, cambia el tono, agrega más datos..." :
                pasoActivo === "seo"        ? "Ajusta la descripción, agrega más keywords..." :
                "Cambia el estilo visual, el texto, el fondo..."
              }
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none"
            />
            <button
              onClick={handleEnviarVariacion}
              disabled={loading || !variacion.trim()}
              className="px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-30 transition-all"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function CrearContenidoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    }>
      <CrearContenidoContent />
    </Suspense>
  );
}
