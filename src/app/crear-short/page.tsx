"use client";

import { useState, useRef, useEffect } from "react";
import GlobalNav from "@/components/GlobalNav";
import {
  Video, Download, Loader2, Play, Pause,
  Sparkles, ChevronRight, CheckCircle, AlertCircle,
  Zap, Film, Music,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Elimina todos los marcadores del guión antes de enviarlo a TTS */
function cleanForTTS(text: string): string {
  return text
    // 1. Eliminar TODO lo que esté dentro de corchetes (incluso multilínea)
    .replace(/\[[\s\S]*?\]/g, " ")
    // 2. Eliminar líneas con caracteres de caja (━ ─ ═ etc.)
    .replace(/^.*[─-╿].*$/gm, "")
    // 3. Eliminar formato markdown **bold** *italic*
    .replace(/\*+([^*\n]*)\*+/g, "$1")
    .replace(/\*+/g, "")
    // 4. Eliminar líneas en MAYÚSCULAS completas (etiquetas de sección)
    .replace(/^[A-ZÁÉÍÓÚÜÑ\s\d:→\-–—\/]+$/gm, "")
    // 5. Eliminar ": " al inicio de línea (residuo de [MARKER]: texto)
    .replace(/^[\s]*:[\s]*/gm, "")
    // 6. Eliminar viñetas y guiones de lista
    .replace(/^[\s]*[-•·*]\s+/gm, "")
    // 7. Limpiar espacios y saltos
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Divide el texto limpio en chunks de ~6 palabras para subtítulos */
function buildSubtitles(text: string, duration: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const CHUNK = 6;
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += CHUNK) {
    chunks.push(words.slice(i, i + CHUNK).join(" "));
  }
  if (!chunks.length) return [];
  const dt = duration / chunks.length;
  return chunks.map((t, i) => ({ text: t, start: i * dt, end: (i + 1) * dt }));
}

/** Dibuja subtítulo estilo TikTok centrado en la parte baja del canvas */
function drawSub(ctx: CanvasRenderingContext2D, text: string, W: number, H: number) {
  const fontSize = 44;
  ctx.font = `bold ${fontSize}px Arial Black, Arial, sans-serif`;
  ctx.textAlign = "center";

  // Word-wrap
  const maxW = W - 60;
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  if (!lines.length) return;

  const lh = fontSize * 1.3;
  const totalH = lines.length * lh;
  // Posición fija: 160px desde abajo
  const startY = H - 160 - totalH;
  const pad = 20;

  // Fondo negro semitransparente
  const bgW = Math.max(...lines.map(l => ctx.measureText(l).width)) + pad * 2;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect((W - bgW) / 2, startY - pad, bgW, totalH + pad * 2, 12);
  } else {
    ctx.rect((W - bgW) / 2, startY - pad, bgW, totalH + pad * 2);
  }
  ctx.fill();

  // Texto blanco con borde negro para máxima legibilidad
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(0,0,0,0.9)";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 8;
  lines.forEach((line, i) => {
    const y = startY + i * lh + fontSize * 0.88;
    ctx.strokeText(line, W / 2, y);
    ctx.fillText(line, W / 2, y);
  });
  ctx.shadowBlur = 0;
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

async function renderShort(
  tema: string,              // tema del video — usado para seeds de Picsum
  audioBlob: Blob,
  cleanScript: string,
  onProgress: (msg: string) => void,
): Promise<string> {
  if (!("MediaRecorder" in window)) throw new Error("Tu navegador no soporta grabación de video.");

  // ── 1. Cargar imágenes desde Picsum Photos ────────────────────────────────
  //    picsum.photos = fotos reales de Unsplash, CORS habilitado, gratis, sin auth
  //    El seed determina qué foto sale — seeds distintos = fotos distintas
  onProgress("Cargando imágenes...");

  // Generar 5 seeds distintos basados en palabras del tema
  const baseWords = tema.toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/).filter(w => w.length > 2);
  const seeds = Array.from({ length: 5 }, (_, i) => `${baseWords[i % baseWords.length] || "video"}-${i}`);

  const imgResults = await Promise.allSettled(
    seeds.map((seed, i) => new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";   // Picsum tiene Access-Control-Allow-Origin: *
      const t = setTimeout(() => reject(new Error(`Timeout imagen ${i + 1}`)), 15000);
      img.onload  = () => { clearTimeout(t); resolve(img); };
      img.onerror = () => { clearTimeout(t); reject(new Error(`Error img ${i + 1}`)); };
      // 608×1080 = exactamente el tamaño del canvas — sin redimensionar
      img.src = `https://picsum.photos/seed/${encodeURIComponent(seed)}/608/1080`;
    }))
  );

  const images = imgResults
    .filter((r): r is PromiseFulfilledResult<HTMLImageElement> => r.status === "fulfilled")
    .map(r => r.value);

  if (images.length === 0) throw new Error("No se pudieron cargar las imágenes de fondo. Verifica tu conexión.");
  onProgress(`${images.length} imágenes listas`);

  // ── 2. Decodificar audio ───────────────────────────────────────────────────
  const audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") await audioCtx.resume();

  const arrayBuf   = await audioBlob.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
  const duration    = audioBuffer.duration;

  if (duration < 0.5) throw new Error("Audio demasiado corto, inténtalo de nuevo");
  onProgress(`Audio listo: ${Math.round(duration)}s · ${images.length} imágenes`);

  const subtitles = buildSubtitles(cleanScript, duration);

  // ── 3. Canvas 9:16 ────────────────────────────────────────────────────────
  const W = 608, H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── 4. Audio → MediaStream (AudioBufferSourceNode) ────────────────────────
  const dest      = audioCtx.createMediaStreamDestination();
  const audioBuf  = audioCtx.createBufferSource();
  audioBuf.buffer = audioBuffer;
  audioBuf.connect(dest);
  audioBuf.connect(audioCtx.destination); // también por altavoces durante la grabación

  // ── 5. Combinar canvas + audio ────────────────────────────────────────────
  const canvasStream = canvas.captureStream(30);
  dest.stream.getAudioTracks().forEach(t => canvasStream.addTrack(t));

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
    ? "video/webm;codecs=vp9,opus"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
    ? "video/webm;codecs=vp8,opus"
    : "video/webm";

  const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 3_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  return new Promise<string>((resolve, reject) => {
    recorder.onstop = () => {
      audioCtx.close();
      resolve(URL.createObjectURL(new Blob(chunks, { type: mimeType })));
    };
    recorder.onerror = () => reject(new Error("Error en MediaRecorder"));

    recorder.start(100);

    // Asegurar AudioContext activo justo antes de start()
    audioCtx.resume().then(() => { audioBuf.start(0); });

    const startTs = performance.now();    // reloj fiable, independiente de AudioContext
    const imgSlot = duration / images.length;
    let lastSec = -1;
    onProgress("Grabando...");

    // setInterval no se pausa cuando el tab está en segundo plano
    const intervalId = setInterval(() => {
      try {
        const elapsed = (performance.now() - startTs) / 1000;

        if (elapsed >= duration + 0.5) {
          clearInterval(intervalId);
          recorder.stop();
          return;
        }

        // ── Imagen actual con efecto Ken Burns ──────────────────────────────
        const imgIdx  = Math.min(Math.floor(elapsed / imgSlot), images.length - 1);
        const imgProg = imgSlot > 0 ? (elapsed % imgSlot) / imgSlot : 0;
        const img     = images[imgIdx];

        const zoom  = 1 + imgProg * 0.15;
        const panX  = (imgIdx % 2 === 0 ? 1 : -1) * imgProg * 0.03 * W;
        const ratio = Math.max(W / img.naturalWidth, H / img.naturalHeight) * zoom;
        const dw    = img.naturalWidth  * ratio;
        const dh    = img.naturalHeight * ratio;
        ctx.drawImage(img, (W - dw) / 2 + panX, (H - dh) / 2, dw, dh);

        // ── Fade hacia la siguiente imagen (último 20% del slot) ─────────────
        if (imgProg > 0.8 && imgIdx + 1 < images.length) {
          const alpha = (imgProg - 0.8) / 0.2;
          const next  = images[imgIdx + 1];
          const nr    = Math.max(W / next.naturalWidth, H / next.naturalHeight);
          ctx.globalAlpha = alpha;
          ctx.drawImage(
            next,
            (W - next.naturalWidth * nr) / 2,
            (H - next.naturalHeight * nr) / 2,
            next.naturalWidth * nr,
            next.naturalHeight * nr,
          );
          ctx.globalAlpha = 1;
        }

        // ── Gradiente oscuro inferior ─────────────────────────────────────────
        const grad = ctx.createLinearGradient(0, H * 0.5, 0, H);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, "rgba(0,0,0,0.7)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, H * 0.5, W, H * 0.5);

        // ── Subtítulo sincronizado ─────────────────────────────────────────────
        const sub = subtitles.find(s => elapsed >= s.start && elapsed < s.end);
        if (sub) drawSub(ctx, sub.text, W, H);

        // ── Progreso cada segundo ──────────────────────────────────────────────
        const nowSec = Math.floor(elapsed);
        if (nowSec !== lastSec) {
          lastSec = nowSec;
          onProgress(`Grabando... ${nowSec}s / ${Math.round(duration)}s`);
        }
      } catch (frameErr) {
        console.error("Error en frame:", frameErr);
      }
    }, 33); // ~30 fps
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
  const [steps, setSteps] = useState<Step[]>([
    { id: "script", label: "Generando guión",            status: "idle" },
    { id: "videos", label: "Buscando video de fondo",    status: "idle" },
    { id: "audio",  label: "Generando voz (ElevenLabs)", status: "idle" },
    { id: "render", label: "Montando video",              status: "idle" },
  ]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

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
      // ── 1. Voiceover limpio (sin marcadores de producción) ────────────────
      let scriptText = guion.trim();
      // Si viene un guión importado con marcadores, limpiarlo también
      if (scriptText) scriptText = cleanForTTS(scriptText);

      if (!scriptText) {
        setStep("script", "loading");
        // Usamos /api/voiceover que genera texto narrable puro, sin etiquetas
        const res = await fetch("/api/voiceover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tema, duracion }),
        });
        if (!res.ok) throw new Error("Error generando voiceover");
        const { voiceover } = await res.json();
        if (!voiceover) throw new Error("El voiceover volvió vacío. Inténtalo de nuevo.");
        scriptText = voiceover;
        setGuion(scriptText);
      }
      setStep("script", "done", `${scriptText.length} caracteres`);

      // ── 2. Imágenes de fondo — Picsum Photos ──────────────────────────────────
      //    Fotos reales de Unsplash, CORS habilitado, sin API key, sin servidor.
      //    Se cargan directamente en el cliente durante el render.
      setStep("videos", "done", "Imágenes de fondo listas (Picsum)");

      // ── 3. TTS (sin marcadores) ───────────────────────────────────────────
      setStep("audio", "loading");
      // scriptText ya es texto puro — enviarlo directo a TTS
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: scriptText, voiceId }),
      });
      if (!ttsRes.ok) throw new Error("Error generando voz");
      const audioBlob = await ttsRes.blob();
      if (audioBlob.size < 500) throw new Error(`Audio vacío (${audioBlob.size} bytes)`);
      setStep("audio", "done");

      // ── 4. Render ─────────────────────────────────────────────────────────
      setStep("render", "loading", "Iniciando...");
      const url = await renderShort(
        tema || scriptText.slice(0, 40),
        audioBlob,
        scriptText,
        msg => setStep("render", "loading", msg),
      );
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
    a.download = `short-${(tema.slice(0, 30) || "viralscope").replace(/\s+/g, "-")}.webm`;
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

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Video size={28} style={{ color: "#a78bfa" }} />
            <h1 className="text-3xl font-bold text-white">Crear Short con IA</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Guión → Voz → Fondo animado + Subtítulos → Listo para TikTok / Reels / Shorts
          </p>
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
            <input value={tema} onChange={e => setTema(e.target.value)}
              placeholder="Ej: 3 tips para ahorrar dinero este mes"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.2)" }} />
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
              opacity: canGenerate ? 1 : 0.5, cursor: canGenerate ? "pointer" : "not-allowed",
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

        {/* Result */}
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
                <Download size={15} /> Descargar WebM
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden mx-auto" style={{ maxWidth: 320, background: "#000" }}>
              <video ref={videoRef} src={videoUrl} className="w-full" playsInline loop onEnded={() => setPlaying(false)} />
              <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center"
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
                  <Icon size={16} style={{ color: "#a78bfa" }} className="mx-auto mb-1" />{label}
                </div>
              ))}
            </div>
          </div>
        )}

        {guion && !guionExt && (
          <div className="rounded-2xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <Music size={14} style={{ color: "#a78bfa" }} />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Guión generado</span>
            </div>
            <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed" style={{ maxHeight: 200, overflowY: "auto" }}>{guion}</pre>
          </div>
        )}

        <div className="text-center text-xs text-slate-600 pb-4">
          Video: <a href="https://www.pexels.com" target="_blank" rel="noreferrer" className="underline">Pexels</a> · Voz: ElevenLabs · Motor: Canvas + MediaRecorder
        </div>
      </div>
    </div>
  );
}
