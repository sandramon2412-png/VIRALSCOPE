"use client";

import { useState, useRef, useEffect } from "react";
import GlobalNav from "@/components/GlobalNav";
import {
  Video, Download, Loader2, Play, Pause,
  Sparkles, ChevronRight, CheckCircle, AlertCircle,
  Zap, Film, Music, Image,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PexelsPhoto { id: number; url: string; thumb: string; }

interface Step {
  id: string;
  label: string;
  status: "idle" | "loading" | "done" | "error";
  detail?: string;
}

const VOICES = [
  { id: "pNInz6obpgDQGcFmaJgB", label: "Adam (Neutral)" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Bella (Femenina)" },
  { id: "VR6AewLTigWG4xSOukaG", label: "Arnold (Masculina grave)" },
  { id: "MF3mGyEYCl7XYWbV9V6O", label: "Elli (Femenina joven)" },
];

const DURACIONES = [
  { val: "30 seg", label: "30 seg" },
  { val: "45 seg", label: "45 seg" },
  { val: "60 seg", label: "60 seg" },
];

// ─── Canvas + MediaRecorder renderer ─────────────────────────────────────────

async function loadImage(proxyUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar: ${proxyUrl}`));
    img.src = proxyUrl;
  });
}

async function renderShort(
  photos: PexelsPhoto[],
  audioBlob: Blob,
  onProgress: (msg: string) => void,
): Promise<string> {
  if (!("MediaRecorder" in window)) throw new Error("Tu navegador no soporta grabación de video.");

  // ── Cargar imágenes ──────────────────────────────────────────────────────
  onProgress("Cargando imágenes...");
  const images = await Promise.all(
    photos.map(p =>
      loadImage(`/api/download-image?url=${encodeURIComponent(p.url)}&filename=bg.jpg`)
    )
  );

  // ── Decodificar audio ────────────────────────────────────────────────────
  onProgress("Procesando audio...");
  const audioCtx = new AudioContext();
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const duration = audioBuffer.duration;

  // ── Canvas 9:16 ──────────────────────────────────────────────────────────
  const W = 608, H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Routing de audio → MediaStream ──────────────────────────────────────
  const dest = audioCtx.createMediaStreamDestination();
  const src  = audioCtx.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(dest);

  const canvasStream = canvas.captureStream(30);
  dest.stream.getAudioTracks().forEach(t => canvasStream.addTrack(t));

  // ── MediaRecorder ────────────────────────────────────────────────────────
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
    ? "video/webm;codecs=vp9,opus"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
    ? "video/webm;codecs=vp8,opus"
    : "video/webm";

  const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 3_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(URL.createObjectURL(blob));
    };
    recorder.onerror = e => reject(e);

    recorder.start(200);
    src.start(0);

    const startTs   = performance.now();
    const imgSlot   = duration / images.length; // segundos por imagen

    function drawFrame() {
      const elapsed = (performance.now() - startTs) / 1000;

      // Parar cuando termine el audio (+0.3s margen)
      if (elapsed >= duration + 0.3) {
        recorder.stop();
        audioCtx.close();
        return;
      }

      const imgIdx  = Math.min(Math.floor(elapsed / imgSlot), images.length - 1);
      const imgProg = (elapsed % imgSlot) / imgSlot; // 0–1 dentro de esta imagen
      const img     = images[imgIdx];

      // Ken Burns: zoom suave desde 1× a 1.08×
      const scale  = 1 + imgProg * 0.08;
      // Encuadrar para cubrir todo el canvas (cover)
      const ratio  = Math.max(W / img.naturalWidth, H / img.naturalHeight) * scale;
      const dw     = img.naturalWidth  * ratio;
      const dh     = img.naturalHeight * ratio;
      const dx     = (W - dw) / 2;
      const dy     = (H - dh) / 2;

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, dx, dy, dw, dh);

      // Fade suave a la siguiente imagen (último 15% de cada slot)
      if (imgProg > 0.85 && imgIdx + 1 < images.length) {
        const alpha  = (imgProg - 0.85) / 0.15;
        const next   = images[imgIdx + 1];
        const nRatio = Math.max(W / next.naturalWidth, H / next.naturalHeight);
        const nw     = next.naturalWidth  * nRatio;
        const nh     = next.naturalHeight * nRatio;
        ctx.globalAlpha = alpha;
        ctx.drawImage(next, (W - nw) / 2, (H - nh) / 2, nw, nh);
        ctx.globalAlpha = 1;
      }

      // Overlay semitransparente abajo (estilo subtítulo)
      const grad = ctx.createLinearGradient(0, H * 0.65, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, H * 0.65, W, H * 0.35);

      requestAnimationFrame(drawFrame);
    }

    onProgress("Grabando...");
    drawFrame();
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CrearShortPage() {
  const [tema, setTema]         = useState("");
  const [guionExt, setGuionExt] = useState("");
  const [duracion, setDuracion] = useState("45 seg");
  const [voiceId, setVoiceId]   = useState(VOICES[0].id);
  const [guion, setGuion]       = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [videoMime, setVideoMime] = useState("video/webm");
  const [steps, setSteps] = useState<Step[]>([
    { id: "script", label: "Generando guión",           status: "idle" },
    { id: "photos", label: "Buscando imágenes Pexels",  status: "idle" },
    { id: "audio",  label: "Generando voz (ElevenLabs)", status: "idle" },
    { id: "render", label: "Montando video",             status: "idle" },
  ]);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Leer guión/tema desde query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get("guion");
    if (g) { setGuionExt(decodeURIComponent(g)); setGuion(decodeURIComponent(g)); }
    const t = params.get("tema");
    if (t) setTema(decodeURIComponent(t));
  }, []);

  function setStep(id: string, status: Step["status"], detail?: string) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status, detail } : s));
  }

  async function handleGenerate() {
    if (!tema.trim() && !guion.trim()) return;
    setIsRunning(true);
    setVideoUrl(null);
    setSteps(prev => prev.map(s => ({ ...s, status: "idle", detail: undefined })));

    try {
      // ── 1. Guión ──────────────────────────────────────────────────────────
      let scriptText = guion.trim();
      if (!scriptText) {
        setStep("script", "loading");
        const res = await fetch("/api/guion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // La API espera "titulo" no "tema"; devuelve texto plano (no JSON/SSE)
          body: JSON.stringify({ titulo: tema, duracion, nicho: "general", formato: "Short", faceless: true }),
        });
        if (!res.ok) throw new Error("Error generando guión");
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
        }
        scriptText = full.trim();
        if (!scriptText) throw new Error("El guión volvió vacío. Inténtalo de nuevo.");
        setGuion(scriptText);
      }
      setStep("script", "done", `${scriptText.length} caracteres`);

      // ── 2. Fotos Pexels ───────────────────────────────────────────────────
      setStep("photos", "loading");
      const keywords = tema || scriptText.slice(0, 50);
      const q = keywords.split(/\s+/).slice(0, 3).join(" ");
      const pvRes = await fetch(`/api/pexels?q=${encodeURIComponent(q)}&n=5&type=photo`);
      if (!pvRes.ok) throw new Error("Error buscando imágenes en Pexels");
      const { photos }: { photos: PexelsPhoto[] } = await pvRes.json();
      if (!photos?.length) throw new Error("No se encontraron imágenes para este tema");
      setStep("photos", "done", `${photos.length} imágenes encontradas`);

      // ── 3. TTS ───────────────────────────────────────────────────────────
      setStep("audio", "loading");
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: scriptText, voiceId }),
      });
      if (!ttsRes.ok) throw new Error("Error generando voz");
      const audioBlob = await ttsRes.blob();
      if (audioBlob.size < 500) throw new Error(`Audio vacío (${audioBlob.size} bytes)`);
      setStep("audio", "done");

      // ── 4. Render Canvas + MediaRecorder ──────────────────────────────────
      setStep("render", "loading", "Iniciando...");
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm" : "video/webm";
      setVideoMime(mime);

      const url = await renderShort(photos, audioBlob, msg => setStep("render", "loading", msg));
      setVideoUrl(url);
      setStep("render", "done", "¡Video listo!");

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setSteps(prev => prev.map(s => s.status === "loading" ? { ...s, status: "error", detail: msg } : s));
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  }

  function handleDownload() {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    const ext = videoMime.includes("mp4") ? "mp4" : "webm";
    a.download = `short-${(tema.slice(0, 30) || "viralscope").replace(/\s+/g, "-")}.${ext}`;
    a.click();
  }

  function togglePlay() {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  }

  const canGenerate = (tema.trim() || guion.trim()) && !isRunning;

  return (
    <div className="min-h-screen" style={{ background: "#0a0812" }}>
      <GlobalNav />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Video size={28} style={{ color: "#a78bfa" }} />
            <h1 className="text-3xl font-bold text-white">Crear Short con IA</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Guión → Voz → Imágenes Pexels → Video listo para TikTok / Reels / Shorts
          </p>
          <div className="flex items-center justify-center gap-1 text-green-400 text-xs">
            <CheckCircle size={12} /> Sin descargas — procesamiento nativo en tu navegador
          </div>
        </div>

        {/* Config */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)" }}>

          {guionExt && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Guión importado</label>
              <div className="rounded-xl p-3 text-xs text-slate-300" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", maxHeight: 120, overflowY: "auto" }}>
                {guionExt.slice(0, 400)}{guionExt.length > 400 ? "..." : ""}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {guionExt ? "O escribe un tema nuevo" : "Tema del Short *"}
            </label>
            <input
              value={tema}
              onChange={e => setTema(e.target.value)}
              placeholder="Ej: 3 tips para ahorrar dinero este mes"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Duración</label>
              <div className="flex gap-2">
                {DURACIONES.map(d => (
                  <button key={d.val} onClick={() => setDuracion(d.val)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: duracion === d.val ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${duracion === d.val ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.08)"}`,
                      color: duracion === d.val ? "#a78bfa" : "#94a3b8",
                    }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Voz</label>
              <select value={voiceId} onChange={e => setVoiceId(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
                {VOICES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={!canGenerate}
            className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: canGenerate ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "rgba(255,255,255,0.05)",
              opacity: canGenerate ? 1 : 0.5,
              cursor: canGenerate ? "pointer" : "not-allowed",
            }}>
            {isRunning ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isRunning ? "Generando..." : "Crear Short"}
          </button>
        </div>

        {/* Steps */}
        {steps.some(s => s.status !== "idle") && (
          <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: step.status === "done" ? "rgba(34,197,94,0.2)" : step.status === "loading" ? "rgba(139,92,246,0.2)" : step.status === "error" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${step.status === "done" ? "rgba(34,197,94,0.4)" : step.status === "loading" ? "rgba(139,92,246,0.4)" : step.status === "error" ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
                  }}>
                  {step.status === "done"    && <CheckCircle size={14} className="text-green-400" />}
                  {step.status === "loading" && <Loader2 size={14} className="animate-spin" style={{ color: "#a78bfa" }} />}
                  {step.status === "error"   && <AlertCircle size={14} className="text-red-400" />}
                  {step.status === "idle"    && <span className="text-slate-600 text-xs font-bold">{i + 1}</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${step.status === "done" ? "text-green-300" : step.status === "error" ? "text-red-300" : step.status === "loading" ? "text-violet-300" : "text-slate-500"}`}>
                    {step.label}
                  </p>
                  {step.detail && <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>}
                </div>
                {step.status === "idle" && i > 0 && <ChevronRight size={14} className="text-slate-700" />}
              </div>
            ))}
          </div>
        )}

        {/* Video result */}
        {videoUrl && (
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400" />
                <span className="font-bold text-green-300">¡Short listo!</span>
              </div>
              <button onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}>
                <Download size={15} /> Descargar
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden mx-auto" style={{ maxWidth: 320, background: "#000" }}>
              <video ref={videoRef} src={videoUrl} className="w-full" playsInline onEnded={() => setPlaying(false)} />
              <button onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: playing ? "transparent" : "rgba(0,0,0,0.4)" }}>
                {!playing && (
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.8)" }}>
                    <Play size={24} className="text-white ml-1" />
                  </div>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[{ icon: Film, label: "TikTok" }, { icon: Video, label: "Reels" }, { icon: Zap, label: "Shorts" }].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-xl py-2 text-xs text-slate-400" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <Icon size={16} style={{ color: "#a78bfa" }} className="mx-auto mb-1" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guión generado */}
        {guion && !guionExt && (
          <div className="rounded-2xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <Music size={14} style={{ color: "#a78bfa" }} />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Guión generado</span>
            </div>
            <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed" style={{ maxHeight: 200, overflowY: "auto" }}>
              {guion}
            </pre>
          </div>
        )}

        <div className="text-center text-xs text-slate-600 pb-4">
          Procesamiento nativo — sin descargas pesadas.
          <br />Imágenes: <a href="https://www.pexels.com" target="_blank" rel="noreferrer" className="underline">Pexels</a> · Voz: ElevenLabs · Motor: Canvas + MediaRecorder
        </div>

      </div>
    </div>
  );
}
