"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Bell, BellOff, Flame, TrendingUp, X, Check, Mail } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import Link from "next/link";

interface Alerta {
  id: string;
  keyword: string;
  minOutlier: number;  // minimum outlier score to trigger
  activa: boolean;
  creadaEn: string;
  ultimoMatch?: string; // last video title that matched
  matchCount: number;
  email?: string;
  emailActivo: boolean;
}

const STORAGE_KEY = "viralscope-alertas";

function getAlertas(): Alerta[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return [];
    // Migrate old alerts that may lack emailActivo
    const parsed: Alerta[] = JSON.parse(s);
    return parsed.map(a => ({ ...a, emailActivo: a.emailActivo ?? false }));
  } catch { return []; }
}

function saveAlertas(alertas: Alerta[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alertas));
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [keyword, setKeyword] = useState("");
  const [minOutlier, setMinOutlier] = useState(5);
  const [hydrated, setHydrated] = useState(false);

  // Email form state
  const [emailInput, setEmailInput] = useState("");
  const [emailActivoInput, setEmailActivoInput] = useState(false);

  useEffect(() => {
    setAlertas(getAlertas());
    setHydrated(true);
  }, []);

  const agregar = () => {
    if (!keyword.trim()) return;
    const emailValue = emailInput.trim() || undefined;
    const nueva: Alerta = {
      id: Math.random().toString(36).slice(2, 10),
      keyword: keyword.trim(),
      minOutlier,
      activa: true,
      creadaEn: new Date().toISOString(),
      matchCount: 0,
      email: emailValue,
      emailActivo: emailActivoInput && Boolean(emailValue),
    };
    const next = [nueva, ...alertas];
    setAlertas(next);
    saveAlertas(next);
    setKeyword("");
    setEmailInput("");
    setEmailActivoInput(false);
  };

  const eliminar = (id: string) => {
    const next = alertas.filter(a => a.id !== id);
    setAlertas(next);
    saveAlertas(next);
  };

  const toggleActiva = (id: string) => {
    const next = alertas.map(a => a.id === id ? { ...a, activa: !a.activa } : a);
    setAlertas(next);
    saveAlertas(next);
  };

  const toggleEmailActivo = (id: string) => {
    const next = alertas.map(a => a.id === id ? { ...a, emailActivo: !a.emailActivo } : a);
    setAlertas(next);
    saveAlertas(next);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />
      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Bell className="w-3.5 h-3.5" /> Alertas de nichos virales
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-2">
            <Bell size={28} style={{ color: "#a78bfa" }} /> Alertas de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
              Outlier
            </span>
          </h1>
          <p className="text-slate-400 text-sm">
            Cuando busques un nicho y encuentre videos con Outlier Score mayor a tu umbral, verás una notificación automática.
          </p>
        </div>

        {/* Add form */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 mb-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-300">Nueva alerta</h3>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Nicho o palabra clave</label>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && agregar()}
              placeholder="ej: finanzas personales, crypto, true crime..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs text-slate-500">Outlier mínimo para alertar</label>
              <span className="text-xs font-bold text-orange-400">{minOutlier}x el promedio</span>
            </div>
            <input
              type="range"
              min={2} max={20} step={1} value={minOutlier}
              onChange={e => setMinOutlier(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-slate-700 accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
              <span>2x (bajo)</span>
              <span>10x (viral)</span>
              <span>20x (explosivo)</span>
            </div>
          </div>

          {/* Email notification section */}
          <div className="border-t border-slate-700/50 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Notificarme por email <span className="text-slate-600">(opcional)</span></span>
              </label>
              <button
                type="button"
                onClick={() => setEmailActivoInput(v => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${emailActivoInput ? "bg-orange-500" : "bg-slate-700"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${emailActivoInput ? "translate-x-4" : "translate-x-1"}`} />
              </button>
            </div>
            {emailActivoInput && (
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            )}
          </div>

          <button
            onClick={agregar}
            disabled={!keyword.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40 transition-all"
            style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}
          >
            <Plus className="w-4 h-4" /> Crear alerta
          </button>
        </div>

        {/* Alert list */}
        {!hydrated ? null : alertas.length === 0 ? (
          <div className="text-center py-16 text-slate-500 space-y-3">
            <Bell className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm">No tienes alertas configuradas.</p>
            <p className="text-xs text-slate-600">Crea una alerta arriba y te notificaremos cuando busques ese nicho.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertas.map(a => (
              <div key={a.id} className={`border rounded-xl p-4 flex items-center justify-between gap-3 transition-all ${a.activa ? "border-slate-700/60 bg-slate-800/40" : "border-slate-800/40 bg-slate-900/30 opacity-60"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-white text-sm">{a.keyword}</span>
                    <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded-full">
                      ≥{a.minOutlier}x
                    </span>
                    {a.matchCount > 0 && (
                      <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full">
                        {a.matchCount} coincidencia{a.matchCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {a.email && a.emailActivo && (
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5" /> email
                      </span>
                    )}
                  </div>
                  {a.ultimoMatch && (
                    <p className="text-xs text-slate-500 truncate">Último: &ldquo;{a.ultimoMatch}&rdquo;</p>
                  )}
                  {a.email && (
                    <p className="text-[10px] text-slate-600 truncate mt-0.5">{a.email}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Email toggle */}
                  {a.email && (
                    <button
                      onClick={() => toggleEmailActivo(a.id)}
                      title={a.emailActivo ? "Desactivar email" : "Activar email"}
                      className={`p-1.5 rounded-lg transition-colors ${a.emailActivo ? "text-blue-400 hover:bg-blue-500/10" : "text-slate-600 hover:text-slate-400"}`}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => toggleActiva(a.id)}
                    className={`p-1.5 rounded-lg transition-colors ${a.activa ? "text-orange-400 hover:bg-orange-500/10" : "text-slate-600 hover:text-slate-400"}`}
                  >
                    {a.activa ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>
                  <Link
                    href={`/?q=${encodeURIComponent(a.keyword)}`}
                    className="p-1.5 rounded-lg text-violet-400 hover:bg-violet-500/10 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </Link>
                  <button onClick={() => eliminar(a.id)} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
