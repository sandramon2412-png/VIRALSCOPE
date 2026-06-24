"use client";

import { useState, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import GlobalNav from "@/components/GlobalNav";
import {
  Video, Mic, Download, Loader2, Play, Pause,
  Sparkles, ChevronRight, CheckCircle, AlertCircle,
  Zap, Film, Music,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PexelsVideo { id: number; url: string; thumb: string; duration: number; }

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function CrearShortPage() {
  const [tema, setTema]           = useState("");
  const [guionExt, setGuionExt]   = useState(""); // guión importado
  const [duracion, setDuracion]   = useState("45 seg");
  const [voiceId, setVoiceId]     = useState(VOICES[0].id);
  const [guion, setGuion]         = useState("");
  const [videoUrl, setVideoUrl]   = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    { id: "script",  label: "Generando guión",        status: "idle" },
    { id: "videos",  label: "Buscando clips Pexels",  status: "idle" },
    { id: "audio",   label: "Generando voz (ElevenLabs)", status: "idle" },
    { id: "render",  label: "Montando video",          status: "idle" },
  ]);

  const ffmpegRef  = useRef<FFmpeg | null>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Leer guión pasado desde /guion como query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get("guion");
    if (g) { setGuionExt(decodeURIComponent(g)); setGuion(decodeURIComponent(g)); }
    const t = params.get("tema");
    if (t) setTema(decodeURIComponent(t));
  }, []);

  // Cargar ffmpeg.wasm desde CDN al montar
  useEffect(() => {
    async function loadFfmpeg() {
      const ff = new FFmpeg();
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ff.load({
        coreURL:  await toBlobURL(`${baseURL}/ffmpeg-core.js`,   "text/javascript"),
        wasmURL:  await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegRef.current = ff;
      setFfmpegReady(true);
    }
    loadFfmpeg().catch(console.error);
  }, []);

  function setStep(id: string, status: Step["status"], detail?: string) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status, detail } : s));
  }

  async function handleGenerate() {
    if (!tema.trim() && !guion.trim()) return;
    if (!ffmpegReady) { alert("FFmpeg aún cargando, espera un momento"); return; }

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
          body: JSON.stringify({ tema, duracion, tipoCanal: "faceless", nicho: "general" }),
        });
        if (!res.ok) throw new Error("Error generando guión");
        // El guión usa SSE — leer stream completo
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try { const d = JSON.parse(line.slice(6)); if (d.text) full += d.text; } catch {}
            }
          }
        }
        scriptText = full.trim();
        setGuion(scriptText);
      }
      setStep("script", "done", `${scriptText.length} caracteres`);

      // Extraer palabras clave para Pexels (primeras 3 palabras del tema)
      const keywords = tema || scriptText.slice(0, 50);
      const pexelsQuery = keywords.split(/\s+/).slice(0, 3).join(" ");

      // ── 2. Videos de Pexels ──────────────────────────────────────────────
      setStep("videos", "loading");
      const pvRes = await fetch(`/api/pexels?q=${encodeURIComponent(pexelsQuery)}&n=5`);
      if (!pvRes.ok) throw new Error("Error buscando videos en Pexels");
      const { videos: pexelsVideos }: { videos: PexelsVideo[] } = await pvRes.json();
      if (!pexelsVideos.length) throw new Error("No se encontraron videos para este tema");
      setStep("videos", "done", `${pexelsVideos.length} clips encontrados`);

      // ── 3. TTS ───────────────────────────────────────────────────────────
      setStep("audio", "loading");
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: scriptText, voiceId }),
      });
      if (!ttsRes.ok) throw new Error("Error generando voz");
      const audioBlob = await ttsRes.blob();
      setStep("audio", "done");

      // ── 4. Render con ffmpeg.wasm ─────────────────────────────────────────
      setStep("render", "loading", "Descargando clips...");
      const ff = ffmpegRef.current!;

      // Descargar audio
      await ff.writeFile("audio.mp3", await fetchFile(audioBlob));

      // Descargar clips de video (máx 3 para no exceder memoria)
      const clipCount = Math.min(pexelsVideos.length, 3);
      for (let i = 0; i < clipCount; i++) {
        setStep("render", "loading", `Descargando clip ${i + 1}/${clipCount}...`);
        const vBlob = await fetch(pexelsVideos[i].url).then(r => r.blob());
        await ff.writeFile(`clip${i}.mp4`, await fetchFile(vBlob));
      }

      // Crear lista de concatenación
      let concatList = "";
      for (let i = 0; i < clipCount; i++) concatList += `file 'clip${i}.mp4'\n`;
      await ff.writeFile("list.txt", concatList);

      setStep("render", "loading", "Concatenando clips...");

      // Concatenar clips en vertical (9:16), agregar audio, recortar a duración del audio
      // Paso 1: concatenar clips
      await ff.exec([
        "-f", "concat", "-safe", "0", "-i", "list.txt",
        "-vf", "scale=608:1080,setsar=1",
        "-c:v", "libx264", "-preset", "ultrafast", "-an",
        "concat.mp4",
      ]);

      setStep("render", "loading", "Mezclando audio...");

      // Paso 2: mezclar con audio y recortar a duración del audio
      await ff.exec([
        "-i", "concat.mp4",
        "-i", "audio.mp3",
        "-map", "0:v", "-map", "1:a",
        "-c:v", "copy", "-c:a", "aac",
        "-shortest",
        "output.mp4",
      ]);

      // Leer resultado
      const outputData = await ff.readFile("output.mp4");
      const outputBlob = new Blob([outputData], { type: "video/mp4" });
      const url = URL.createObjectURL(outputBlob);
      setVideoUrl(url);
      setStep("render", "done", "¡Video listo!");

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      // Marcar el step activo como error
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
    a.download = `short-${tema.slice(0, 30).replace(/\s+/g, "-") || "viralscope"}.mp4`;
    a.click();
  }

  function togglePlay() {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  }

  const canGenerate = (tema.trim() || guion.trim()) && ffmpegReady && !isRunning;

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
            Guión → Voz → Clips de Pexels → Video MP4 listo para TikTok / Reels / Shorts
          </p>
          {!ffmpegReady && (
            <div className="flex items-center justify-center gap-2 text-yellow-400 text-xs">
              <Loader2 size={12} className="animate-spin" />
              Cargando motor de video (ffmpeg.wasm)...
            </div>
          )}
          {ffmpegReady && (
            <div className="flex items-center justify-center gap-1 text-green-400 text-xs">
              <CheckCircle size={12} /> Motor listo — procesamiento 100% en tu navegador
            </div>
          )}
        </div>

        {/* Config */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)" }}>

          {guionExt ? (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Guión importado</label>
              <div className="rounded-xl p-3 text-xs text-slate-300" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", maxHeight: 120, overflowY: "auto" }}>
                {guionExt.slice(0, 400)}{guionExt.length > 400 ? "..." : ""}
              </div>
              <p className="text-[10px] text-slate-500">Se usará este guión. También puedes escribir un tema nuevo abajo.</p>
            </div>
          ) : null}

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
                  <button
                    key={d.val}
                    onClick={() => setDuracion(d.val)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: duracion === d.val ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${duracion === d.val ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.08)"}`,
                      color: duracion === d.val ? "#a78bfa" : "#94a3b8",
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Voz</label>
              <select
                value={voiceId}
                onChange={e => setVoiceId(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}
              >
                {VOICES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: canGenerate ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "rgba(255,255,255,0.05)",
              opacity: canGenerate ? 1 : 0.5,
              cursor: canGenerate ? "pointer" : "not-allowed",
            }}
          >
            {isRunning ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isRunning ? "Generando..." : "Crear Short"}
          </button>
        </div>

        {/* Steps progress */}
        {steps.some(s => s.status !== "idle") && (
          <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: step.status === "done" ? "rgba(34,197,94,0.2)"
                      : step.status === "loading" ? "rgba(139,92,246,0.2)"
                      : step.status === "error" ? "rgba(239,68,68,0.2)"
                      : "rgba(255,255,255,0.05)",
                    border: `1px solid ${step.status === "done" ? "rgba(34,197,94,0.4)"
                      : step.status === "loading" ? "rgba(139,92,246,0.4)"
                      : step.status === "error" ? "rgba(239,68,68,0.4)"
                      : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  {step.status === "done"    && <CheckCircle size={14} className="text-green-400" />}
                  {step.status === "loading" && <Loader2 size={14} className="animate-spin" style={{ color: "#a78bfa" }} />}
                  {step.status === "error"   && <AlertCircle size={14} className="text-red-400" />}
                  {step.status === "idle"    && <span className="text-slate-600 text-xs font-bold">{i + 1}</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${step.status === "done" ? "text-green-300" : step.status === "error" ? "text-red-300" : step.status === "loading" ? "text-violet-300" : "text-slate-500"}`}>
                    {step.label}
                  </p>
                  {step.detail && (
                    <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                  )}
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
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}
              >
                <Download size={15} /> Descargar MP4
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden mx-auto" style={{ maxWidth: 320, background: "#000" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full"
                playsInline
                onEnded={() => setPlaying(false)}
              />
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: playing ? "transparent" : "rgba(0,0,0,0.4)" }}
              >
                {!playing && (
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.8)" }}>
                    <Play size={24} className="text-white ml-1" />
                  </div>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: Film, label: "TikTok" },
                { icon: Video, label: "Reels" },
                { icon: Zap, label: "Shorts" },
              ].map(({ icon: Icon, label }) => (
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

        {/* Info */}
        <div className="text-center text-xs text-slate-600 pb-4">
          El video se procesa en tu navegador — nada se sube a servidores externos.
          <br />Clips: <a href="https://www.pexels.com" target="_blank" rel="noreferrer" className="underline">Pexels</a> (licencia gratuita) · Voz: ElevenLabs · Motor: ffmpeg.wasm
        </div>

      </div>
    </div>
  );
}
