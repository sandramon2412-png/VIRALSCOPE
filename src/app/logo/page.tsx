"use client";
import { useState } from "react";
import Link from "next/link";
import GlobalNav from "@/components/GlobalNav";
import {
  ArrowLeft, Sparkles, RefreshCw, AlertTriangle, Download,
  Image as ImageIcon, Check, Zap, Palette
} from "lucide-react";

const NICHOS = [
  "Finanzas personales", "Fitness y salud", "Tecnología", "Emprendimiento",
  "Marketing digital", "Desarrollo personal", "Gaming", "Cocina y recetas",
  "Viajes", "Educación", "Motivación", "Entretenimiento",
  "Criptomonedas", "Bienes raíces", "Productividad",
];

const ESTILOS = [
  "Moderno y minimalista", "Vibrante y llamativo", "Profesional y corporativo",
  "Oscuro y misterioso", "Brillante y positivo", "Retro y vintage",
  "Futurista y tech", "Natural y orgánico",
];

const COLORES_PRESETS = [
  { label: "Morado + Rosa + Naranja", value: "púrpura, rosa y naranja vibrante" },
  { label: "Azul + Cyan", value: "azul eléctrico y cyan" },
  { label: "Rojo + Naranja", value: "rojo y naranja intenso" },
  { label: "Verde + Esmeralda", value: "verde y esmeralda" },
  { label: "Dorado + Negro", value: "dorado y negro premium" },
  { label: "Blanco + Negro", value: "blanco, negro y grises" },
];

export default function LogoPage() {
  const [nombre, setNombre] = useState("");
  const [nicho, setNicho] = useState("");
  const [estilo, setEstilo] = useState("");
  const [colores, setColores] = useState("");
  const [tipo, setTipo] = useState<"logo" | "banner" | "ambos">("ambos");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadedLogo, setDownloadedLogo] = useState(false);
  const [downloadedBanner, setDownloadedBanner] = useState(false);

  async function handleGenerar() {
    if (!nombre.trim() || !nicho) {
      setError("Por favor ingresa el nombre del canal y selecciona el nicho.");
      return;
    }
    setLoading(true);
    setError("");
    setLogoUrl(null);
    setBannerUrl(null);

    try {
      const res = await fetch("/api/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreCanal: nombre, nicho, estilo, colores, tipo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.logo) setLogoUrl(data.logo);
      if (data.banner) setBannerUrl(data.banner);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error generando imágenes");
    } finally {
      setLoading(false);
    }
  }

  async function downloadImage(url: string, filename: string, setDone: (v: boolean) => void) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      window.open(url, "_blank");
    }
  }

  const hasResults = logoUrl || bannerUrl;

  return (
    <div className="min-h-screen bg-[#0a0812] text-white">
      <GlobalNav />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold"
            style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.12), rgba(139,92,246,0.12))", border: "1px solid rgba(20,184,166,0.3)" }}>
            <Sparkles size={13} style={{ color: "#2dd4bf" }} />
            <span style={{ background: "linear-gradient(135deg, #2dd4bf, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Generado con DALL-E 3 · Calidad profesional
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">
            Logo y Banner para tu{" "}
            <span style={{ background: "linear-gradient(135deg, #14b8a6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              canal de YouTube
            </span>
          </h2>
          <p className="text-white/45 max-w-xl mx-auto">
            Genera una foto de perfil profesional y un banner personalizado en segundos. Sin Canva, sin Photoshop, sin diseñador.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-5 sticky top-24"
              style={{ background: "radial-gradient(130% 130% at 0% 0%, #1a1430, #0b0914 70%)", border: "1px solid rgba(20,184,166,0.2)" }}>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Palette size={16} style={{ color: "#2dd4bf" }} />
                Configurar diseño
              </h3>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">📺 Nombre del canal *</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="ej: FinanzasConCarlos"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-teal-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">🎯 Nicho *</label>
                  <select value={nicho} onChange={e => setNicho(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-colors">
                    <option value="" className="bg-gray-900">Seleccionar nicho</option>
                    {NICHOS.map(n => <option key={n} value={n} className="bg-gray-900">{n}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">🎨 Estilo visual</label>
                  <select value={estilo} onChange={e => setEstilo(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-colors">
                    <option value="" className="bg-gray-900">Seleccionar estilo</option>
                    {ESTILOS.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">🎨 Paleta de colores</label>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {COLORES_PRESETS.map(p => (
                      <button key={p.value} onClick={() => setColores(p.value)}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${colores === p.value ? "text-teal-300" : "text-white/40 hover:text-white/70"}`}
                        style={{
                          background: colores === p.value ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.03)",
                          border: colores === p.value ? "1px solid rgba(20,184,166,0.4)" : "1px solid rgba(255,255,255,0.06)"
                        }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={colores}
                    onChange={e => setColores(e.target.value)}
                    placeholder="o escribe tus propios colores..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-teal-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">🖼️ Qué generar</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { value: "logo", label: "Logo", icon: "👤" },
                      { value: "banner", label: "Banner", icon: "🖼️" },
                      { value: "ambos", label: "Ambos", icon: "✨" },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => setTipo(opt.value as "logo" | "banner" | "ambos")}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${tipo === opt.value ? "text-teal-300" : "text-white/40"}`}
                        style={{
                          background: tipo === opt.value ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.04)",
                          border: tipo === opt.value ? "1px solid rgba(20,184,166,0.4)" : "1px solid rgba(255,255,255,0.08)"
                        }}>
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-3 text-red-400 text-xs">
                  <AlertTriangle size={13} />{error}
                </div>
              )}

              <button onClick={handleGenerar} disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #14b8a6, #8b5cf6)", boxShadow: "0 4px 20px rgba(20,184,166,0.25)" }}>
                {loading ? <><RefreshCw size={16} className="animate-spin" />Generando...</> : <><Zap size={16} />Generar con DALL-E 3</>}
              </button>

              <p className="text-center text-xs text-white/25 mt-2">
                {tipo === "ambos" ? "~60-90 segundos" : "~30-45 segundos"} · DALL-E 3
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-5">
            {/* Loading */}
            {loading && (
              <div className="space-y-4">
                {(tipo === "logo" || tipo === "ambos") && (
                  <div className="rounded-2xl p-5 animate-pulse" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="h-4 rounded w-1/3 mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <div className="aspect-square max-w-xs mx-auto rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
                  </div>
                )}
                {(tipo === "banner" || tipo === "ambos") && (
                  <div className="rounded-2xl p-5 animate-pulse" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="h-4 rounded w-1/3 mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <div className="aspect-video w-full rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
                  </div>
                )}
                <div className="text-center text-sm text-white/30">
                  Generando con DALL-E 3... esto puede tomar hasta 90 segundos
                </div>
              </div>
            )}

            {/* Logo result */}
            {logoUrl && !loading && (
              <div className="rounded-2xl p-5"
                style={{ background: "radial-gradient(130% 130% at 0% 0%, #1a1a30, #0b0914 70%)", border: "1px solid rgba(20,184,166,0.2)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span>👤</span> Foto de Perfil / Logo
                  </h3>
                  <button
                    onClick={() => downloadImage(logoUrl, `logo-${nombre.replace(/\s+/g, "-")}.png`, setDownloadedLogo)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.3)", color: "#2dd4bf" }}>
                    {downloadedLogo ? <Check size={12} /> : <Download size={12} />}
                    {downloadedLogo ? "Descargado" : "Descargar PNG"}
                  </button>
                </div>
                <div className="max-w-xs mx-auto">
                  <img src={logoUrl} alt="Logo generado" className="w-full rounded-2xl shadow-2xl"
                    onError={() => setLogoUrl(null)} />
                </div>
                <p className="text-center text-xs text-white/30 mt-3">1024×1024 px · Perfecto para foto de perfil de YouTube</p>
              </div>
            )}

            {/* Banner result */}
            {bannerUrl && !loading && (
              <div className="rounded-2xl p-5"
                style={{ background: "radial-gradient(130% 130% at 0% 0%, #1a1430, #0b0914 70%)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span>🖼️</span> Banner del Canal
                  </h3>
                  <button
                    onClick={() => downloadImage(bannerUrl, `banner-${nombre.replace(/\s+/g, "-")}.png`, setDownloadedBanner)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}>
                    {downloadedBanner ? <Check size={12} /> : <Download size={12} />}
                    {downloadedBanner ? "Descargado" : "Descargar PNG"}
                  </button>
                </div>
                <img src={bannerUrl} alt="Banner generado" className="w-full rounded-xl shadow-2xl"
                  onError={() => setBannerUrl(null)} />
                <p className="text-center text-xs text-white/30 mt-3">1792×1024 px · Optimizado para banner de YouTube</p>
              </div>
            )}

            {/* Regenerate */}
            {hasResults && !loading && (
              <div className="text-center">
                <button onClick={handleGenerar}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white/50 hover:text-white transition-colors text-sm"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <RefreshCw size={14} />Regenerar diseño
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !hasResults && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.15), rgba(139,92,246,0.15))", border: "1px solid rgba(20,184,166,0.2)" }}>
                  <ImageIcon size={36} style={{ color: "#2dd4bf" }} />
                </div>
                <h3 className="text-xl font-bold mb-2">Tu branding visual aquí</h3>
                <p className="text-white/35 max-w-sm mx-auto text-sm">
                  Configura tu canal y genera un logo y banner profesional con DALL-E 3. Sin diseñador, sin Canva.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
