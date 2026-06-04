"use client";

import { useState, useCallback } from "react";
import {
  Loader2, AlertCircle, Sparkles, Image as ImageIcon,
  Download, RefreshCw, Wand2, Link as LinkIcon, Zap,
  X, Copy, Check, ChevronDown, ChevronUp, Edit3,
  Camera, User as UserIcon, ScanEye, Upload, TrendingUp,
  ShieldCheck, AlertTriangle, Lightbulb,
  Flame, Target, EyeOff, DollarSign, Rocket, Gamepad2, Moon,
  Tv, Square, Smartphone, ArrowLeft, ArrowRight, ArrowDown, Minus,
} from "lucide-react";
import type { AnalisisMiniatura } from "@/app/api/miniatura/analizar/route";
import GlobalNav from "@/components/GlobalNav";

// ─── Constants ────────────────────────────────────────────────────────────────

const ESTILOS = [
  { id: "impactante",  icon: Flame,       label: "Impactante",  desc: "Alto contraste, dramático" },
  { id: "mrbeast",     icon: Target,      label: "MrBeast",     desc: "Over-saturado, viral" },
  { id: "faceless",    icon: EyeOff,      label: "Faceless",    desc: "Sin caras, conceptual" },
  { id: "finanzas",    icon: DollarSign,  label: "Finanzas",    desc: "Oro, dinero, premium" },
  { id: "motivacion",  icon: Rocket,      label: "Motivación",  desc: "Épico, silueta, cielo" },
  { id: "gaming",      icon: Gamepad2,    label: "Gaming",      desc: "Neon, acción, explosivo" },
  { id: "minimalista", icon: Sparkles,    label: "Minimalista", desc: "Limpio, elegante" },
  { id: "oscuro",      icon: Moon,        label: "Oscuro",      desc: "Dark, neon, noir" },
];

const NICHOS = [
  "Finanzas", "Inversiones", "Motivación", "Tecnología", "IA",
  "Crypto", "Gaming", "Viajes", "Salud", "Educación", "Negocios",
];

const FORMATOS = [
  { id: "landscape", icon: Tv,         label: "YouTube",  sub: "16:9",  size: "1792×1024" },
  { id: "square",    icon: Square,     label: "Cuadrado", sub: "1:1",   size: "1024×1024" },
  { id: "portrait",  icon: Smartphone, label: "Shorts",   sub: "9:16",  size: "1024×1792" },
];

const TEXTO_ESPACIO = [
  { id: "izquierda", icon: ArrowLeft,  label: "Izquierda" },
  { id: "derecha",   icon: ArrowRight, label: "Derecha" },
  { id: "abajo",     icon: ArrowDown,  label: "Abajo" },
  { id: "ninguno",   icon: Minus,      label: "Sin espacio" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeneratedImage { url: string; prompt: string; }

/** Proxy external images through our server to avoid CORS. Data URIs pass through directly. */
function proxyUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;
  if (originalUrl.startsWith("data:")) return originalUrl;
  return `/api/miniatura/image?u=${encodeURIComponent(originalUrl)}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGridClass(count: number, index: number): string {
  if (count === 1) return "col-span-2";
  if (count === 2) return "col-span-1";
  if (count <= 4)  return "col-span-1";
  // 5 images: first row 3 cols (indices 0-2), second row 2 cols centered (3-4)
  if (index < 3)   return "col-span-1";
  return "col-span-1";
}

function getGridStyle(count: number): React.CSSProperties {
  if (count === 1) return { gridTemplateColumns: "1fr" };
  if (count <= 4)  return { gridTemplateColumns: "1fr 1fr" };
  // 5: use 6-col grid so first row = 3 x 2cols, second row = 2 x 3cols centered
  return { gridTemplateColumns: "repeat(6, 1fr)" };
}

function getItemStyle5(index: number): React.CSSProperties {
  if (index < 3) return { gridColumn: "span 2" };
  if (index === 3) return { gridColumn: "2 / span 2" };
  return { gridColumn: "4 / span 2" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function IntensidadSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const labels: Record<number, string> = {
    1: "Sutil",
    2: "Moderada",
    3: "Dramática",
    4: "Intensa",
    5: "Extrema",
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
          Intensidad visual
        </label>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(236,72,153,0.15)", color: "#f9a8d4", border: "1px solid rgba(236,72,153,0.3)" }}>
          {value} — {labels[value]}
        </span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(n => {
          const active = n <= value;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              className="flex-1 h-2 rounded-full transition-all"
              style={{
                background: active
                  ? `linear-gradient(90deg, #ec4899, #f97316)`
                  : "rgba(255,255,255,0.1)",
                boxShadow: active ? "0 0 6px rgba(236,72,153,0.4)" : "none",
              }}
              aria-label={`Intensidad ${n}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>Sutil</span>
        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>Extrema</span>
      </div>
    </div>
  );
}

function ImageModal({ img, onClose, titulo }: { img: GeneratedImage; onClose: () => void; titulo: string }) {
  const [copied, setCopied] = useState(false);

  async function handleDownload() {
    try {
      const res  = await fetch(proxyUrl(img.url));
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `miniatura-${titulo.slice(0, 20).replace(/\s+/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(img.url, "_blank");
    }
  }

  async function handleCopy() {
    await navigator.clipboard?.writeText(img.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(139,92,246,0.3)", background: "#0d0a18" }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full transition-all"
          style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.url} alt="Miniatura en detalle" className="w-full h-auto block" />

        <div className="p-4 flex flex-col gap-3" style={{ background: "rgba(0,0,0,0.4)" }}>
          <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            {img.prompt}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #ec4899, #f97316)", boxShadow: "0 4px 16px rgba(236,72,153,0.3)" }}
            >
              <Download className="w-4 h-4" /> Descargar HD
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
            >
              {copied ? <Check className="w-4 h-4" style={{ color: "#4ade80" }} /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado" : "Copiar prompt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MiniaturaPage() {
  const [modo, setModo]              = useState<"idea" | "url">("idea");
  const [titulo, setTitulo]          = useState("");
  const [nicho, setNicho]            = useState("");
  const [estilo, setEstilo]          = useState("impactante");
  const [youtubeUrl, setYoutubeUrl]  = useState("");
  const [variaciones, setVariaciones] = useState(3);
  const [formato, setFormato]        = useState("landscape");
  const [textoEspacio, setTextoEspacio] = useState("ninguno");
  const [intensidad, setIntensidad]  = useState(3);
  const [loading, setLoading]        = useState(false);
  const [error, setError]            = useState<string | null>(null);
  const [images, setImages]          = useState<GeneratedImage[]>([]);
  const [prevImages, setPrevImages]  = useState<GeneratedImage[]>([]);
  const [loadedIds, setLoadedIds]    = useState<Set<number>>(new Set());
  const [modalImg, setModalImg]      = useState<GeneratedImage | null>(null);
  const [editPrompt, setEditPrompt]  = useState("");
  const [refining, setRefining]      = useState(false);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const [copiedIdx, setCopiedIdx]    = useState<number | null>(null);

  // ── Análisis IA state ──
  const [analysisImage, setAnalysisImage]     = useState<string | null>(null); // base64
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult]   = useState<AnalisisMiniatura | null>(null);
  const [analysisError, setAnalysisError]     = useState<string | null>(null);
  const [analysisNicho, setAnalysisNicho]     = useState("");
  const [analysisTitulo, setAnalysisTitulo]   = useState("");

  // ── Face Swap state ──
  const [faceBase64, setFaceBase64]           = useState<string | null>(null);
  const [faceSwapLoading, setFaceSwapLoading] = useState(false);
  const [faceSwapResult, setFaceSwapResult]   = useState<{ outputUrl: string; method: string } | null>(null);
  const [faceSwapError, setFaceSwapError]     = useState<string | null>(null);
  const [selectedThumbIdx, setSelectedThumbIdx] = useState(0);
  const [conCara, setConCara]                 = useState(false);

  const canGenerate = loading
    ? false
    : modo === "idea"
    ? titulo.trim().length > 0
    : youtubeUrl.trim().length > 0;

  const canRefine = images.length > 0 && editPrompt.trim().length > 0 && !loading && !refining;

  async function handleGenerar() {
    const tituloFinal = modo === "url" ? (titulo || "Miniatura de YouTube") : titulo;
    if (!tituloFinal.trim() && modo === "idea") return;
    if (modo === "url" && !youtubeUrl.trim()) return;

    setLoading(true);
    setError(null);
    setPrevImages([]);
    setImages([]);
    setLoadedIds(new Set());
    setEditPrompt("");
    setFaceSwapResult(null);
    setFaceSwapError(null);
    setSelectedThumbIdx(0);

    try {
      const body: Record<string, unknown> = {
        titulo: tituloFinal,
        nicho,
        estilo,
        variaciones,
        formato,
        textoEspacio,
        intensidad,
        conCara,
      };
      if (modo === "url") body.youtubeUrl = youtubeUrl;

      const res = await fetch("/api/miniatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data: { images?: GeneratedImage[]; error?: string };
      try { data = await res.json(); } catch {
        throw new Error("El servidor no respondió correctamente.");
      }

      if (!res.ok) throw new Error(data.error || "Error desconocido");
      setImages(data.images || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefinar() {
    if (!canRefine) return;
    const tituloFinal = modo === "url" ? (titulo || "Miniatura de YouTube") : titulo;

    setRefining(true);
    setError(null);
    setPrevImages(images);
    setLoadedIds(new Set());

    try {
      const body: Record<string, unknown> = {
        titulo: tituloFinal,
        nicho,
        estilo,
        variaciones: images.length,
        formato,
        textoEspacio,
        intensidad,
        editPrompt,
        existingPrompts: images.map(img => img.prompt),
      };
      if (modo === "url") body.youtubeUrl = youtubeUrl;

      const res = await fetch("/api/miniatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data: { images?: GeneratedImage[]; error?: string };
      try { data = await res.json(); } catch {
        throw new Error("El servidor no respondió correctamente.");
      }

      if (!res.ok) throw new Error(data.error || "Error desconocido");
      setImages(data.images || []);
      setEditPrompt("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setImages(prevImages);
      setPrevImages([]);
    } finally {
      setRefining(false);
    }
  }

  async function handleDownload(img: GeneratedImage, idx: number) {
    try {
      const res  = await fetch(proxyUrl(img.url));
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `miniatura-${idx + 1}-${titulo.slice(0, 20).replace(/\s+/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(img.url, "_blank");
    }
  }

  async function handleCopyPrompt(prompt: string, idx: number) {
    await navigator.clipboard?.writeText(prompt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  const onImageLoad = useCallback((i: number) => {
    setLoadedIds(prev => new Set([...prev, i]));
  }, []);

  // ── Face Swap handlers ──
  function handleFaceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setFaceBase64(ev.target?.result as string);
      setFaceSwapResult(null);
      setFaceSwapError(null);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

/** Comprime una imagen base64 a máx 1024px y calidad JPEG 90% para no superar límites de Vercel */
// Replicate acepta base64 solo si < 256KB — comprimir a 512px/JPEG80 garantiza ~40-80KB
async function compressImage(base64: string, maxPx = 512): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.80));
    };
    img.src = base64;
  });
}

  async function handleFaceSwap() {
    if (!faceBase64 || images.length === 0) return;
    const thumbUrl = images[selectedThumbIdx]?.url;
    if (!thumbUrl) return;

    setFaceSwapLoading(true);
    setFaceSwapError(null);
    setFaceSwapResult(null);

    try {
      // Obtener miniatura como base64
      const thumbRes  = await fetch(proxyUrl(thumbUrl));
      const thumbBlob = await thumbRes.blob();
      const thumbBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(thumbBlob);
      });

      const [thumbCompressed, faceCompressed] = await Promise.all([
        compressImage(thumbBase64),
        compressImage(faceBase64),
      ]);

      // Paso 1: iniciar predicción (retorna predictionId inmediatamente)
      const startRes = await fetch("/api/faceswap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thumbnailBase64: thumbCompressed, faceBase64: faceCompressed }),
      });
      const startText = await startRes.text();
      let startData: { error?: string; predictionId?: string };
      try { startData = JSON.parse(startText); }
      catch { throw new Error(`Error del servidor: ${startText.slice(0, 200)}`); }
      if (!startRes.ok) throw new Error(startData.error || "Error iniciando face swap");
      const { predictionId } = startData;
      if (!predictionId) throw new Error("No se recibió ID de predicción");

      // Paso 2: polling hasta que termine (máx 3 min)
      const maxWait = 180000;
      const started = Date.now();
      while (Date.now() - started < maxWait) {
        await new Promise(r => setTimeout(r, 4000));
        const pollRes = await fetch(`/api/faceswap?id=${predictionId}`);
        const pollText = await pollRes.text();
        let pollData: { status?: string; error?: string; outputUrl?: string; method?: string };
        try { pollData = JSON.parse(pollText); }
        catch { throw new Error(`Error del servidor: ${pollText.slice(0, 200)}`); }
        if (!pollRes.ok) throw new Error(pollData.error || "Error consultando estado");
        if (pollData.status === "succeeded" && pollData.outputUrl) {
          setFaceSwapResult({ outputUrl: pollData.outputUrl, method: pollData.method ?? "replicate" });
          return;
        }
        if (pollData.error) throw new Error(pollData.error);
        // "canceled" también es un estado final
        if (pollData.status === "canceled") throw new Error("La predicción fue cancelada por Replicate");
      }
      throw new Error("Timeout: el modelo tardó más de 3 minutos");

    } catch (e) {
      setFaceSwapError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setFaceSwapLoading(false);
    }
  }

  function handleDownloadFaceSwap() {
    if (!faceSwapResult) return;
    const a    = document.createElement("a");
    a.href     = `/api/download-image?url=${encodeURIComponent(faceSwapResult.outputUrl)}&filename=faceswap-${titulo.slice(0, 20).replace(/\s+/g, "-") || "miniatura"}.png`;
    a.download = `faceswap-${titulo.slice(0, 20).replace(/\s+/g, "-") || "miniatura"}.png`;
    a.click();
  }

  // ── Analysis handlers ──
  function handleAnalysisUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setAnalysisImage(ev.target?.result as string);
      setAnalysisResult(null);
      setAnalysisError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleAnalyzeGenerated(imgUrl: string, idx: number) {
    // Proxy the generated image to get base64
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setAnalysisNicho(nicho || "general");
    setAnalysisTitulo(titulo);
    try {
      const res = await fetch(proxyUrl(imgUrl));
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      setAnalysisImage(base64);
      await runAnalysis(base64, nicho || "general", titulo);
    } catch {
      setAnalysisError("Error cargando la imagen para análisis");
    } finally {
      setAnalysisLoading(false);
    }
    void idx;
  }

  async function runAnalysis(imgBase64: string, nichoVal: string, tituloVal: string) {
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    try {
      const res = await fetch("/api/miniatura/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imgBase64,
          nicho: nichoVal || "general",
          titulo: tituloVal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      setAnalysisResult(data);
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function handleAnalyzeUploaded() {
    if (!analysisImage) return;
    await runAnalysis(analysisImage, analysisNicho || "general", analysisTitulo);
  }

  function getScoreColor(score: number): string {
    if (score >= 80) return "#4ade80";
    if (score >= 60) return "#facc15";
    if (score >= 40) return "#fb923c";
    return "#f87171";
  }

  function getCtrColor(ctr: string): string {
    if (ctr === "Muy Alto") return "#4ade80";
    if (ctr === "Alto") return "#86efac";
    if (ctr === "Medio") return "#facc15";
    if (ctr === "Bajo") return "#fb923c";
    return "#f87171";
  }

  const isProcessing = loading || refining;
  const activeImages = isProcessing ? prevImages : images;

  return (
    <div className="min-h-screen text-white" style={{ background: "#08060f" }}>
      <GlobalNav />

      {/* Modal */}
      {modalImg && (
        <ImageModal
          img={modalImg}
          titulo={titulo}
          onClose={() => setModalImg(null)}
        />
      )}

      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold"
            style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.3)" }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#f472b6" }} />
            <span style={{ color: "#f9a8d4" }}>DALL-E 3 · Hasta 5 variaciones · Clona estilos · Refinamiento</span>
          </div>
          <h1 className="text-4xl font-black mb-2">
            Miniaturas{" "}
            <span style={{
              background: "linear-gradient(135deg, #ec4899, #f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              que generan clics
            </span>
          </h1>
          <p className="text-white/45 text-base">
            Genera desde una idea o clona el estilo de cualquier video de YouTube
          </p>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-8">

          {/* ── LEFT PANEL ── */}
          <div className="space-y-4">

            {/* Modo tabs */}
            <div className="flex rounded-xl p-1 gap-1"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {[
                { id: "idea", label: "Desde idea", icon: Wand2 },
                { id: "url",  label: "Desde URL",  icon: LinkIcon },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setModo(m.id as "idea" | "url")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={modo === m.id
                    ? { background: "linear-gradient(135deg, #ec4899, #f97316)", color: "#fff" }
                    : { color: "rgba(255,255,255,0.4)" }}
                >
                  <m.icon size={13} />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Form card */}
            <div className="rounded-2xl p-5 space-y-5"
              style={{ background: "radial-gradient(130% 130% at 0% 0%, #1e1530, #0b0914 70%)", border: "1px solid rgba(139,92,246,0.2)" }}>

              {modo === "url" && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "#f9a8d4" }}>
                    URL del video de YouTube
                  </label>
                  <input
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(236,72,153,0.3)" }}
                  />
                  <p className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    La IA analizará el estilo visual del video y lo replicará
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {modo === "url" ? "Título de tu video (opcional)" : "Título del video *"}
                </label>
                <input
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder={modo === "url" ? "Ej: Cómo invertir en 2025" : "Ej: Cómo ahorrar $1,000 en 3 meses"}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              {/* Nicho */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Nicho
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {NICHOS.map(n => (
                    <button
                      key={n}
                      onClick={() => setNicho(nicho === n.toLowerCase() ? "" : n.toLowerCase())}
                      className="text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all"
                      style={nicho === n.toLowerCase()
                        ? { background: "rgba(236,72,153,0.25)", border: "1px solid rgba(236,72,153,0.5)", color: "#f9a8d4" }
                        : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estilos */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Estilo visual
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {ESTILOS.map(e => {
                    const EIcon = e.icon;
                    return (
                      <button
                        key={e.id}
                        onClick={() => setEstilo(e.id)}
                        className="flex flex-col items-start px-3 py-2 rounded-xl text-left transition-all"
                        style={estilo === e.id
                          ? { background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.4)" }
                          : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                      >
                        <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: estilo === e.id ? "#f9a8d4" : "rgba(255,255,255,0.7)" }}>
                          <EIcon size={11} style={{ color: "#a78bfa" }} />
                          {e.label}
                        </span>
                        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{e.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Formato */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Formato de imagen
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {FORMATOS.map(f => {
                    const FIcon = f.icon;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFormato(f.id)}
                        className="flex flex-col items-center py-2.5 px-1 rounded-xl transition-all"
                        style={formato === f.id
                          ? { background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.4)" }
                          : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                      >
                        <FIcon size={16} className="mb-0.5" style={{ color: formato === f.id ? "#fdba74" : "#a78bfa" }} />
                        <span className="text-[10px] font-bold" style={{ color: formato === f.id ? "#fdba74" : "rgba(255,255,255,0.6)" }}>
                          {f.label}
                        </span>
                        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{f.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Espacio para texto */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Espacio para texto
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TEXTO_ESPACIO.map(t => {
                    const TIcon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTextoEspacio(t.id)}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all"
                        style={textoEspacio === t.id
                          ? { background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.4)", color: "#c4b5fd" }
                          : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
                      >
                        <TIcon size={10} style={{ color: "#a78bfa" }} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intensidad */}
              <IntensidadSlider value={intensidad} onChange={setIntensidad} />

              {/* Variaciones */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Variaciones:{" "}
                  <span style={{ color: "#f9a8d4" }}>{variaciones}</span>
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setVariaciones(n)}
                      className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                      style={variaciones === n
                        ? { background: "rgba(236,72,153,0.2)", border: "1px solid rgba(236,72,153,0.4)", color: "#f9a8d4" }
                        : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Cada variación tiene composición diferente · ~15-25s por imagen
                </p>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerar}
                disabled={!canGenerate}
                className="w-full flex items-center justify-center gap-2 font-black py-3.5 rounded-xl transition-all text-white"
                style={canGenerate
                  ? { background: "linear-gradient(135deg, #ec4899, #f97316)", boxShadow: "0 8px 24px rgba(236,72,153,0.35)" }
                  : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Generando {variaciones} miniatura{variaciones > 1 ? "s" : ""}...</>
                ) : (
                  <><Zap className="w-4 h-4" />Generar {variaciones} miniatura{variaciones > 1 ? "s" : ""}</>
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl p-4"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f87171" }} />
                <p className="text-sm" style={{ color: "#fca5a5" }}>{error}</p>
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="space-y-4">

            {/* Empty state */}
            {!isProcessing && images.length === 0 && (
              <div className="min-h-[400px] rounded-2xl flex flex-col items-center justify-center gap-4"
                style={{ background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(255,255,255,0.08)" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)" }}>
                  <ImageIcon className="w-8 h-8" style={{ color: "#f472b6" }} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-white/50 mb-1">Tus miniaturas aparecerán aquí</p>
                  <p className="text-xs text-white/25">Hasta 5 variaciones · 3 formatos · Refinamiento con IA</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-1">
                  {["💡 Idea propia", "🔗 Clona URL", "🎨 8 estilos", "📏 3 formatos", "✏️ Refinamiento"].map(t => (
                    <div key={t} className="text-[10px] px-3 py-1.5 rounded-full text-center"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>{t}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading skeletons — show previous images faded while refining */}
            {isProcessing && (
              <div>
                {activeImages.length > 0 && (
                  <div className="mb-3 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#f472b6" }} />
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {refining ? "Refinando con IA..." : "Generando miniaturas..."}
                    </span>
                  </div>
                )}
                <div
                  className="grid gap-4"
                  style={getGridStyle(isProcessing && activeImages.length > 0 ? activeImages.length : variaciones)}
                >
                  {(activeImages.length > 0 ? activeImages : Array.from({ length: variaciones })).map((img, i) => {
                    const count = activeImages.length > 0 ? activeImages.length : variaciones;
                    const isReal = activeImages.length > 0 && img !== undefined;
                    const itemStyle = count === 5 ? getItemStyle5(i) : {};
                    return (
                      <div
                        key={i}
                        className="rounded-2xl overflow-hidden relative"
                        style={{
                          ...itemStyle,
                          border: "1px solid rgba(255,255,255,0.07)",
                          background: "#0d0a18",
                          opacity: isReal ? 0.4 : 1,
                          transition: "opacity 0.3s",
                        }}
                      >
                        {isReal ? (
                          <div className="relative aspect-video">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={(img as GeneratedImage).url}
                              alt={`Variación ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video flex flex-col items-center justify-center gap-3"
                            style={{ background: "rgba(255,255,255,0.02)" }}>
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#f472b6" }} />
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Variación {i + 1}...</p>
                          </div>
                        )}
                        {isReal && (
                          <div className="absolute inset-0 flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.3)" }}>
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#f472b6" }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results */}
            {!isProcessing && images.length > 0 && (
              <div className="space-y-4">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {images.length} miniatura{images.length > 1 ? "s" : ""} generada{images.length > 1 ? "s" : ""}
                  </p>
                  <button
                    onClick={handleGenerar}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerar
                  </button>
                </div>

                {/* Image grid */}
                <div className="grid gap-4" style={getGridStyle(images.length)}>
                  {images.map((img, i) => {
                    const itemStyle = images.length === 5 ? getItemStyle5(i) : {};
                    const gridColSpan = images.length <= 4 && images.length > 1 ? {} : {};
                    void gridColSpan;
                    return (
                      <div
                        key={i}
                        className="group rounded-2xl overflow-hidden relative cursor-pointer"
                        style={{
                          ...itemStyle,
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "#0d0a18",
                          gridColumn: images.length === 1 ? "1 / -1" : itemStyle.gridColumn,
                        }}
                      >
                        {/* Loading placeholder */}
                        {!loadedIds.has(i) && (
                          <div className="absolute inset-0 flex items-center justify-center z-10"
                            style={{ background: "#0d0a18" }}>
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#f472b6" }} />
                          </div>
                        )}

                        {/* Image */}
                        <div
                          className="relative"
                          style={{ aspectRatio: formato === "portrait" ? "9/16" : formato === "square" ? "1/1" : "16/9" }}
                          onClick={() => setModalImg(img)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={`Variación ${i + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            style={{ opacity: loadedIds.has(i) ? 1 : 0, transition: "opacity 0.3s, transform 0.3s" }}
                            onLoad={() => onImageLoad(i)}
                          />

                          {/* Variation badge */}
                          <div className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-md text-white z-10"
                            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
                            V{i + 1}
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 z-10"
                            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}>
                            <button
                              onClick={e => { e.stopPropagation(); handleDownload(img, i); }}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
                              style={{ background: "linear-gradient(135deg, #ec4899, #f97316)", boxShadow: "0 4px 12px rgba(236,72,153,0.4)" }}
                            >
                              <Download className="w-3.5 h-3.5" /> Descargar
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); handleCopyPrompt(img.prompt, i); }}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff" }}
                            >
                              {copiedIdx === i
                                ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copiado</>
                                : <><Copy className="w-3.5 h-3.5" /> Prompt</>}
                            </button>
                          </div>
                        </div>

                        {/* Bottom bar */}
                        <div className="px-3 py-2 flex items-center gap-2"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <button
                            onClick={() => handleDownload(img, i)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all"
                            style={{ background: "linear-gradient(135deg, #ec4899, #f97316)" }}
                          >
                            <Download className="w-3 h-3" /> Descargar
                          </button>
                          <button
                            onClick={() => handleAnalyzeGenerated(img.url, i)}
                            className="px-2.5 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#6ee7b7" }}
                            title="Analizar CTR con IA"
                          >
                            <ScanEye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCopyPrompt(img.prompt, i)}
                            className="px-2.5 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
                            title="Copiar prompt"
                          >
                            {copiedIdx === i
                              ? <Check className="w-3.5 h-3.5" style={{ color: "#4ade80" }} />
                              : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setModalImg(img)}
                            className="px-2.5 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
                            title="Ver en pantalla completa"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Refine panel ── */}
                <div className="rounded-2xl p-4 space-y-3"
                  style={{ background: "radial-gradient(130% 130% at 0% 0%, #1e1530, #0b0914 70%)", border: "1px solid rgba(139,92,246,0.25)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Edit3 className="w-4 h-4" style={{ color: "#c4b5fd" }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#c4b5fd" }}>
                      Refinar con IA
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={editPrompt}
                      onChange={e => setEditPrompt(e.target.value)}
                      placeholder="Ej: cambia el fondo por una mansión, agrega más contraste, colores más fríos..."
                      className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.25)" }}
                      onKeyDown={e => e.key === "Enter" && handleRefinar()}
                    />
                    <button
                      onClick={handleRefinar}
                      disabled={!canRefine}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all whitespace-nowrap"
                      style={canRefine
                        ? { background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }
                        : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}
                    >
                      {refining
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Refinando...</>
                        : <><Wand2 className="w-4 h-4" /> Refinar</>}
                    </button>
                  </div>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                    Claude tomará las instrucciones y generará nuevas versiones mejoradas de tus miniaturas
                  </p>
                </div>

                {/* ── Face Swap panel ── */}
                <div className="rounded-2xl p-4 space-y-4"
                  style={{ background: "radial-gradient(130% 130% at 100% 0%, #0f1a2e, #0b0914 70%)", border: "1px solid rgba(59,130,246,0.25)" }}>

                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
                      <Camera className="w-3.5 h-3.5" style={{ color: "#60a5fa" }} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#93c5fd" }}>
                        Face Swap — Pon tu cara
                      </span>
                      <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-md font-semibold"
                        style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                        Local · ComfyUI
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Coloca tu cara en cualquier miniatura generada. Usa tu GPU local con ComfyUI + ReActor.
                  </p>

                  {/* Toggle: generar con cara */}
                  <button
                    onClick={() => setConCara(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                    style={conCara
                      ? { background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.4)" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <div className="flex items-center gap-2 text-left">
                      <span className="text-base">{conCara ? "🧑" : "🎭"}</span>
                      <div>
                        <p className="text-xs font-bold" style={{ color: conCara ? "#93c5fd" : "rgba(255,255,255,0.6)" }}>
                          {conCara ? "Generando con cara humana" : "Activar cara para Face Swap"}
                        </p>
                        <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {conCara
                            ? "La próxima miniatura incluirá una cara visible para hacer el swap ✓"
                            : "Actívalo antes de generar para que la miniatura incluya una cara"}
                        </p>
                      </div>
                    </div>
                    <div
                      className="w-10 h-5 rounded-full flex items-center transition-all shrink-0"
                      style={{
                        background: conCara ? "#3b82f6" : "rgba(255,255,255,0.15)",
                        padding: "2px",
                        justifyContent: conCara ? "flex-end" : "flex-start",
                      }}
                    >
                      <div className="w-4 h-4 rounded-full bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
                    </div>
                  </button>

                  <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
                    {/* Face upload */}
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Tu foto</p>
                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFaceUpload}
                        />
                        <div
                          className="w-20 h-20 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-all"
                          style={faceBase64
                            ? { border: "2px solid rgba(59,130,246,0.5)" }
                            : { border: "2px dashed rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)" }}
                        >
                          {faceBase64
                            ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={faceBase64} alt="Tu cara" className="w-full h-full object-cover" />
                            )
                            : (
                              <>
                                <UserIcon className="w-5 h-5 mb-1" style={{ color: "rgba(255,255,255,0.25)" }} />
                                <span className="text-[8px] text-center px-1" style={{ color: "rgba(255,255,255,0.25)" }}>Subir foto</span>
                              </>
                            )}
                        </div>
                      </label>
                    </div>

                    {/* Thumbnail selector + apply */}
                    <div className="space-y-3">
                      {images.length > 1 && (
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Selecciona miniatura</p>
                          <div className="flex gap-1.5 flex-wrap">
                            {images.map((img, i) => (
                              <button
                                key={i}
                                onClick={() => { setSelectedThumbIdx(i); setFaceSwapResult(null); }}
                                className="relative w-14 h-9 rounded-lg overflow-hidden transition-all"
                                style={{
                                  border: selectedThumbIdx === i
                                    ? "2px solid #3b82f6"
                                    : "2px solid rgba(255,255,255,0.1)",
                                  boxShadow: selectedThumbIdx === i ? "0 0 8px rgba(59,130,246,0.5)" : "none",
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.url} alt={`V${i+1}`} className="w-full h-full object-cover" />
                                <div className="absolute top-0 left-0 text-[7px] font-black px-1 leading-tight"
                                  style={{ background: "rgba(0,0,0,0.7)", color: selectedThumbIdx === i ? "#60a5fa" : "#fff" }}>
                                  V{i+1}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleFaceSwap}
                        disabled={!faceBase64 || faceSwapLoading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                        style={faceBase64 && !faceSwapLoading
                          ? { background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", boxShadow: "0 4px 16px rgba(59,130,246,0.35)" }
                          : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" }}
                      >
                        {faceSwapLoading
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando con ComfyUI...</>
                          : <><Camera className="w-4 h-4" /> Aplicar Face Swap</>}
                      </button>

                      {!faceBase64 && (
                        <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                          Sube tu foto para activar
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Error */}
                  {faceSwapError && (
                    <div className="flex items-start gap-2 rounded-xl p-3"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f87171" }} />
                      <p className="text-xs" style={{ color: "#fca5a5" }}>{faceSwapError}</p>
                    </div>
                  )}

                  {/* Result */}
                  {faceSwapResult && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold" style={{ color: "#86efac" }}>
                          ✅ Face Swap completado · método: {faceSwapResult.method}
                        </p>
                        <button
                          onClick={handleDownloadFaceSwap}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}
                        >
                          <Download className="w-3 h-3" /> Descargar
                        </button>
                      </div>
                      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(59,130,246,0.3)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={faceSwapResult.outputUrl}
                          alt="Face swap result"
                          className="w-full h-auto block"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Análisis CTR con IA ── */}
                <div className="rounded-2xl p-4 space-y-4"
                  style={{ background: "radial-gradient(130% 130% at 0% 100%, #0d1f0f, #0b0914 70%)", border: "1px solid rgba(16,185,129,0.25)" }}>

                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                      <ScanEye className="w-3.5 h-3.5" style={{ color: "#6ee7b7" }} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6ee7b7" }}>
                        Análisis CTR con Visión IA
                      </span>
                      <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-md font-semibold"
                        style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                        Claude Vision
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Sube cualquier miniatura (la tuya, la de un competidor, o las generadas arriba) y la IA la puntúa en 6 criterios de CTR.
                  </p>

                  {/* Upload zone o imagen seleccionada */}
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                        Imagen a analizar
                      </p>
                      <label className="cursor-pointer block">
                        <input type="file" accept="image/*" className="hidden" onChange={handleAnalysisUpload} />
                        <div
                          className="w-24 h-16 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-all"
                          style={analysisImage
                            ? { border: "2px solid rgba(16,185,129,0.5)" }
                            : { border: "2px dashed rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)" }}
                        >
                          {analysisImage
                            /* eslint-disable-next-line @next/next/no-img-element */
                            ? <img src={analysisImage} alt="Para analizar" className="w-full h-full object-cover" />
                            : <>
                                <Upload className="w-4 h-4 mb-1" style={{ color: "rgba(255,255,255,0.25)" }} />
                                <span className="text-[8px] text-center px-1" style={{ color: "rgba(255,255,255,0.25)" }}>Subir imagen</span>
                              </>
                          }
                        </div>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <input
                        value={analysisNicho}
                        onChange={e => setAnalysisNicho(e.target.value)}
                        placeholder="Nicho (ej: finanzas, gaming...)"
                        className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}
                      />
                      <input
                        value={analysisTitulo}
                        onChange={e => setAnalysisTitulo(e.target.value)}
                        placeholder="Título del video (opcional)"
                        className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}
                      />
                      <button
                        onClick={handleAnalyzeUploaded}
                        disabled={!analysisImage || analysisLoading}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-white transition-all"
                        style={analysisImage && !analysisLoading
                          ? { background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }
                          : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" }}
                      >
                        {analysisLoading
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analizando con Claude Vision...</>
                          : <><ScanEye className="w-3.5 h-3.5" /> Analizar miniatura</>}
                      </button>
                      <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                        O haz clic en el ícono 👁 de cualquier miniatura generada arriba
                      </p>
                    </div>
                  </div>

                  {/* Error */}
                  {analysisError && (
                    <div className="flex items-start gap-2 rounded-xl p-3"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f87171" }} />
                      <p className="text-xs" style={{ color: "#fca5a5" }}>{analysisError}</p>
                    </div>
                  )}

                  {/* Resultado del análisis */}
                  {analysisResult && (
                    <div className="space-y-4">
                      {/* Puntuación general */}
                      <div className="flex items-center gap-4 p-4 rounded-2xl"
                        style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(16,185,129,0.15)" }}>
                        <div className="text-center shrink-0">
                          <div className="text-4xl font-black" style={{ color: getScoreColor(analysisResult.puntuacionGeneral) }}>
                            {analysisResult.puntuacionGeneral}
                          </div>
                          <div className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>/ 100</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4" style={{ color: getCtrColor(analysisResult.ctrEstimado) }} />
                            <span className="text-sm font-bold" style={{ color: getCtrColor(analysisResult.ctrEstimado) }}>
                              CTR Estimado: {analysisResult.ctrEstimado}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                            {analysisResult.veredicto}
                          </p>
                        </div>
                      </div>

                      {/* Categorías */}
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(analysisResult.categorias).map(([key, val]) => {
                          const labels: Record<string, string> = {
                            contraste: "Contraste",
                            emocion: "Emoción",
                            texto: "Texto",
                            composicion: "Composición",
                            color: "Color",
                            cara: "Cara/Expresión",
                          };
                          return (
                            <div key={key} className="rounded-xl p-3"
                              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                                  {labels[key]}
                                </span>
                                <span className="text-xs font-black" style={{ color: getScoreColor(val.puntuacion) }}>
                                  {val.puntuacion}
                                </span>
                              </div>
                              <div className="h-1 rounded-full mb-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
                                <div className="h-full rounded-full transition-all"
                                  style={{ width: `${val.puntuacion}%`, background: getScoreColor(val.puntuacion) }} />
                              </div>
                              <p className="text-[9px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                                {val.comentario}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Fortalezas, Problemas, Mejoras */}
                      <div className="grid grid-cols-1 gap-3">
                        {/* Fortalezas */}
                        <div className="rounded-xl p-3"
                          style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}>
                          <div className="flex items-center gap-1.5 mb-2">
                            <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#34d399" }}>Fortalezas</span>
                          </div>
                          <ul className="space-y-1">
                            {analysisResult.fortalezas.map((f, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                                <span style={{ color: "#34d399" }}>✓</span> {f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Problemas */}
                        {analysisResult.problemas.length > 0 && (
                          <div className="rounded-xl p-3"
                            style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
                            <div className="flex items-center gap-1.5 mb-2">
                              <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#f87171" }}>Problemas</span>
                            </div>
                            <ul className="space-y-1">
                              {analysisResult.problemas.map((p, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                                  <span style={{ color: "#f87171" }}>✗</span> {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Mejoras */}
                        <div className="rounded-xl p-3"
                          style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.2)" }}>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Lightbulb className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#fbbf24" }}>Mejoras para más CTR</span>
                          </div>
                          <ul className="space-y-1">
                            {analysisResult.mejoras.map((m, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                                <span style={{ color: "#fbbf24" }}>{i + 1}.</span> {m}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Comparación con el nicho */}
                        <div className="rounded-xl p-3"
                          style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.2)" }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#a78bfa" }}>
                            Comparación con el nicho
                          </p>
                          <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                            {analysisResult.comparacionNicho}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prompts accordion */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <button
                    onClick={() => setPromptsOpen(v => !v)}
                    className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold select-none transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.35)" }}
                  >
                    <span>Ver prompts generados por IA</span>
                    {promptsOpen
                      ? <ChevronUp className="w-4 h-4" />
                      : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {promptsOpen && (
                    <div className="px-4 py-3 space-y-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                      {images.map((img, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#f472b6" }}>
                              Variación {i + 1}
                            </p>
                            <button
                              onClick={() => handleCopyPrompt(img.prompt, i + 100)}
                              className="text-[9px] px-2 py-0.5 rounded-md transition-all"
                              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}
                            >
                              {copiedIdx === i + 100 ? "✓ Copiado" : "Copiar"}
                            </button>
                          </div>
                          <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {img.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
