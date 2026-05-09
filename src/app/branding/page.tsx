"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flame, Loader2, AlertCircle, Sparkles, Copy, Check,
  Palette, Users, Target, Hash, Mic, Star, Globe, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import NavAuth from "@/components/NavAuth";
import GlobalNav from "@/components/GlobalNav";

interface BrandingResult {
  nombres: { nombre: string; razon: string; dominio: string }[];
  slogan: string;
  descripcionCanal: string;
  vozMarca: { tono: string; personalidad: string; evitar: string };
  pilares: { nombre: string; descripcion: string; ejemplo: string }[];
  audiencia: { edad: string; perfil: string; dolor: string; deseo: string };
  colores: { nombre: string; hex: string; uso: string }[];
  hashtags: string[];
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={handleCopy} className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function BrandingPage() {
  const [nicho, setNicho]           = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [faceless, setFaceless]     = useState(true);
  const [idioma, setIdioma]         = useState("español");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [result, setResult]         = useState<BrandingResult | null>(null);

  async function handleGenerar() {
    if (!nicho.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicho, descripcion, faceless, idioma }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Identidad de marca completa con IA
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Branding de Canal{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-500">con IA</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Nombre, slogan, descripción, voz de marca, pilares de contenido y paleta de colores. Todo en segundos.
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Nicho del canal *</label>
              <input value={nicho} onChange={e => setNicho(e.target.value)}
                placeholder="Ej: finanzas personales, true crime, IA y tecnología..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Descripción adicional (opcional)</label>
              <input value={descripcion} onChange={e => setDescripcion(e.target.value)}
                placeholder="Ej: enfocado en ahorro para millennials latinoamericanos"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Formato</label>
              <div className="flex gap-2">
                <button onClick={() => setFaceless(true)} className={cn("flex-1 py-2 text-xs rounded-xl border transition-colors", faceless ? "bg-violet-600 border-violet-500 text-white" : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600")}>Faceless</button>
                <button onClick={() => setFaceless(false)} className={cn("flex-1 py-2 text-xs rounded-xl border transition-colors", !faceless ? "bg-violet-600 border-violet-500 text-white" : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600")}>Con cámara</button>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Idioma</label>
              <select value={idioma} onChange={e => setIdioma(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500">
                <option value="español">Español</option>
                <option value="inglés">Inglés</option>
                <option value="español latino">Español Latino</option>
              </select>
            </div>
          </div>
          <button onClick={handleGenerar} disabled={loading || !nicho.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generando identidad de marca...</> : <><Sparkles className="w-4 h-4" />Generar Branding completo</>}
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300/80 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Nombres */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" /> Nombres sugeridos para tu canal
              </h2>
              <div className="space-y-3">
                {result.nombres.map((n, i) => (
                  <div key={i} className={cn("flex items-start gap-4 p-4 rounded-xl border transition-colors", i === 0 ? "bg-violet-500/10 border-violet-500/30" : "bg-slate-900/40 border-slate-700/30 hover:border-slate-600")}>
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", i === 0 ? "bg-violet-600 text-white" : "bg-slate-700 text-slate-400")}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-100">{n.nombre}</span>
                        {i === 0 && <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">Recomendado</span>}
                        <CopyBtn text={n.nombre} />
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{n.razon}</p>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1"><Globe className="w-3 h-3" />{n.dominio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slogan + Descripcion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm"><Mic className="w-4 h-4 text-pink-400" />Slogan del canal</h3>
                  <CopyBtn text={result.slogan} />
                </div>
                <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 italic">
                  &ldquo;{result.slogan}&rdquo;
                </p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm"><Hash className="w-4 h-4 text-blue-400" />Hashtags principales</h3>
                  <CopyBtn text={result.hashtags.join(" ")} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((h, i) => (
                    <span key={i} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full">{h}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Descripcion canal */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm"><Target className="w-4 h-4 text-green-400" />Descripción para el perfil de YouTube</h3>
                <CopyBtn text={result.descripcionCanal} />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{result.descripcionCanal}</p>
            </div>

            {/* Voz de marca */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4 text-sm"><Mic className="w-4 h-4 text-orange-400" />Voz y personalidad de marca</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3">
                  <p className="text-[10px] text-orange-400 uppercase tracking-wider mb-1">Tono</p>
                  <p className="text-sm text-slate-300">{result.vozMarca.tono}</p>
                </div>
                <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3">
                  <p className="text-[10px] text-violet-400 uppercase tracking-wider mb-1">Personalidad</p>
                  <p className="text-sm text-slate-300">{result.vozMarca.personalidad}</p>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                  <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">Evitar</p>
                  <p className="text-sm text-slate-300">{result.vozMarca.evitar}</p>
                </div>
              </div>
            </div>

            {/* Pilares */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4 text-sm"><Target className="w-4 h-4 text-blue-400" />Pilares de contenido</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {result.pilares.map((p, i) => (
                  <div key={i} className="bg-slate-900/60 border border-slate-700/30 rounded-xl p-4">
                    <p className="text-xs font-bold text-violet-400 mb-1">{p.nombre}</p>
                    <p className="text-xs text-slate-400 mb-2">{p.descripcion}</p>
                    <div className="flex items-start gap-1.5">
                      <ChevronRight className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-500 italic">{p.ejemplo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audiencia + Colores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4 text-sm"><Users className="w-4 h-4 text-green-400" />Audiencia ideal</h3>
                <div className="space-y-3">
                  <div><p className="text-[10px] text-slate-500 uppercase tracking-wider">Edad</p><p className="text-sm text-slate-300">{result.audiencia.edad}</p></div>
                  <div><p className="text-[10px] text-slate-500 uppercase tracking-wider">Perfil</p><p className="text-sm text-slate-300">{result.audiencia.perfil}</p></div>
                  <div><p className="text-[10px] text-slate-500 uppercase tracking-wider">Su problema</p><p className="text-sm text-slate-300">{result.audiencia.dolor}</p></div>
                  <div><p className="text-[10px] text-slate-500 uppercase tracking-wider">Su deseo</p><p className="text-sm text-slate-300">{result.audiencia.deseo}</p></div>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4 text-sm"><Palette className="w-4 h-4 text-pink-400" />Paleta de colores sugerida</h3>
                <div className="space-y-3">
                  {result.colores.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl border border-slate-700 shrink-0" style={{ backgroundColor: c.hex }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200">{c.nombre}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{c.hex}</span>
                          <CopyBtn text={c.hex} />
                        </div>
                        <p className="text-[11px] text-slate-500">{c.uso}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
