"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, BarChart3, Lightbulb, Rocket, DollarSign, Gamepad2, GraduationCap, Heart, Tv2, Globe, AlertTriangle, Trophy, TrendingUp, Target } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";

const RPM_BY_COUNTRY_NICHO: Record<string, Record<string, number>> = {
  "🇲🇽 México":      { finanzas: 2.5, gaming: 0.8, educacion: 1.8, salud: 1.5, entretenimiento: 0.7 },
  "🇪🇸 España":      { finanzas: 6.0, gaming: 2.5, educacion: 4.0, salud: 3.5, entretenimiento: 2.0 },
  "🇦🇷 Argentina":   { finanzas: 1.8, gaming: 0.6, educacion: 1.2, salud: 1.0, entretenimiento: 0.5 },
  "🇨🇴 Colombia":    { finanzas: 2.0, gaming: 0.7, educacion: 1.4, salud: 1.2, entretenimiento: 0.6 },
  "🇨🇱 Chile":       { finanzas: 2.8, gaming: 0.9, educacion: 2.0, salud: 1.8, entretenimiento: 0.8 },
  "🇵🇪 Perú":        { finanzas: 1.5, gaming: 0.5, educacion: 1.0, salud: 0.9, entretenimiento: 0.4 },
  "🇻🇪 Venezuela":   { finanzas: 0.8, gaming: 0.3, educacion: 0.6, salud: 0.5, entretenimiento: 0.2 },
  "🇺🇸 EE.UU. (es)": { finanzas: 12.0, gaming: 4.0, educacion: 8.0, salud: 7.0, entretenimiento: 3.0 },
  "🇺🇸 EE.UU. (en)": { finanzas: 18.0, gaming: 6.0, educacion: 12.0, salud: 10.0, entretenimiento: 4.5 },
  "🌍 Promedio LAT":  { finanzas: 2.2, gaming: 0.7, educacion: 1.6, salud: 1.4, entretenimiento: 0.6 },
};

const NICHOS = ["finanzas", "gaming", "educacion", "salud", "entretenimiento"];
const NICHO_LABELS: Record<string, string> = {
  finanzas: "Finanzas",
  gaming: "Gaming",
  educacion: "Educación",
  salud: "Salud",
  entretenimiento: "Entretenimiento",
};

const NICHO_ICONS: Record<string, React.ElementType> = {
  finanzas: DollarSign,
  gaming: Gamepad2,
  educacion: GraduationCap,
  salud: Heart,
  entretenimiento: Tv2,
};

const NICHO_SELECT_OPTIONS = [
  "finanzas",
  "gaming",
  "educacion",
  "salud",
  "entretenimiento",
  "tecnologia",
  "viajes",
  "cocina",
  "moda",
  "musica",
  "deportes",
  "negocios",
  "ciencia",
  "politica",
  "mascotas",
];

const COUNTRIES = Object.keys(RPM_BY_COUNTRY_NICHO);

function rpmColor(rpm: number): string {
  if (rpm > 5) return "bg-green-900/50 text-green-300 border border-green-700/30";
  if (rpm >= 2) return "bg-yellow-900/40 text-yellow-300 border border-yellow-700/30";
  return "bg-red-900/40 text-red-300 border border-red-700/30";
}

type SortKey = "country" | string;

interface CountryMix {
  mexico: number;
  espana: number;
  argentina: number;
  colombia: number;
  eeuu: number;
  otros: number;
}

export default function RpmPaisesPage() {
  const [selectedNicho, setSelectedNicho] = useState("finanzas");
  const [views, setViews] = useState(100000);
  const [sortKey, setSortKey] = useState<SortKey>("country");
  const [sortAsc, setSortAsc] = useState(true);

  const [mix, setMix] = useState<CountryMix>({
    mexico: 40,
    espana: 15,
    argentina: 15,
    colombia: 10,
    eeuu: 10,
    otros: 10,
  });

  const mixTotal = Object.values(mix).reduce((a, b) => a + b, 0);

  const updateMix = (key: keyof CountryMix, val: number) => {
    setMix(prev => ({ ...prev, [key]: val }));
  };

  // Calculate estimated earnings from mix
  const rpmMap: Record<keyof CountryMix, number> = {
    mexico:    (RPM_BY_COUNTRY_NICHO["🇲🇽 México"][selectedNicho] ?? 1.5) / 1000,
    espana:    (RPM_BY_COUNTRY_NICHO["🇪🇸 España"][selectedNicho] ?? 3.0) / 1000,
    argentina: (RPM_BY_COUNTRY_NICHO["🇦🇷 Argentina"][selectedNicho] ?? 1.0) / 1000,
    colombia:  (RPM_BY_COUNTRY_NICHO["🇨🇴 Colombia"][selectedNicho] ?? 1.2) / 1000,
    eeuu:      (RPM_BY_COUNTRY_NICHO["🇺🇸 EE.UU. (es)"][selectedNicho] ?? 7.0) / 1000,
    otros:     (RPM_BY_COUNTRY_NICHO["🌍 Promedio LAT"][selectedNicho] ?? 1.4) / 1000,
  };

  const estimatedEarnings = (Object.keys(mix) as (keyof CountryMix)[]).reduce((total, key) => {
    const viewsFromCountry = views * (mix[key] / 100);
    return total + viewsFromCountry * rpmMap[key];
  }, 0);

  // Sort table
  const sortedCountries = [...COUNTRIES].sort((a, b) => {
    if (sortKey === "country") {
      return sortAsc ? a.localeCompare(b) : b.localeCompare(a);
    }
    const valA = RPM_BY_COUNTRY_NICHO[a][sortKey] ?? 0;
    const valB = RPM_BY_COUNTRY_NICHO[b][sortKey] ?? 0;
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const fmtViews = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return `${v}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
            <Globe size={12} /> Comparador de RPM
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            RPM por País —{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
              ¿Cuánto vale tu audiencia?
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Compara los ingresos reales según de dónde vienen tus espectadores
          </p>
        </div>

        {/* Interactive Calculator */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Calculator size={18} style={{ color: "#a78bfa" }} /> Calculadora interactiva</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Nicho + Views */}
            <div className="space-y-5">
              {/* Nicho selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Nicho del canal</label>
                <select
                  value={selectedNicho}
                  onChange={e => setSelectedNicho(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500"
                >
                  {NICHO_SELECT_OPTIONS.map(n => (
                    <option key={n} value={n}>
                      {NICHO_LABELS[n] ?? n.charAt(0).toUpperCase() + n.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Views slider */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Visualizaciones: <span className="text-violet-400">{fmtViews(views)}</span>
                </label>
                <input
                  type="range"
                  min={1000}
                  max={10_000_000}
                  step={1000}
                  value={views}
                  onChange={e => setViews(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1K</span><span>10M</span>
                </div>
              </div>

              {/* Earnings preview */}
              <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/30 border border-green-700/30 rounded-xl p-4">
                <div className="text-sm text-slate-400 mb-1">Ingresos estimados totales</div>
                <div className="text-3xl font-black text-green-400">
                  ${estimatedEarnings.toFixed(2)} USD
                </div>
                {mixTotal !== 100 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    <AlertTriangle size={11} className="inline mr-1" /> La mezcla de países suma {mixTotal}% (debe ser 100%)
                  </div>
                )}
              </div>
            </div>

            {/* Right: Country mix sliders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-300">Mezcla de audiencia por país</label>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${mixTotal === 100 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                  {mixTotal}% total
                </span>
              </div>

              {(
                [
                  { key: "mexico" as keyof CountryMix, label: "🇲🇽 México" },
                  { key: "espana" as keyof CountryMix, label: "🇪🇸 España" },
                  { key: "argentina" as keyof CountryMix, label: "🇦🇷 Argentina" },
                  { key: "colombia" as keyof CountryMix, label: "🇨🇴 Colombia" },
                  { key: "eeuu" as keyof CountryMix, label: "🇺🇸 EE.UU." },
                  { key: "otros" as keyof CountryMix, label: "🌍 Otros" },
                ] as { key: keyof CountryMix; label: string }[]
              ).map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{label}</span>
                    <span className="text-white font-semibold">{mix[key]}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={mix[key]}
                    onChange={e => updateMix(key, Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><BarChart3 size={18} style={{ color: "#a78bfa" }} /> Tabla comparativa de RPM (USD por 1,000 vistas)</h2>
            <p className="text-sm text-slate-400 mt-1">Haz clic en los encabezados para ordenar</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th
                    className="px-4 py-3 text-left text-slate-400 font-semibold cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort("country")}
                  >
                    País {sortKey === "country" ? (sortAsc ? "↑" : "↓") : ""}
                  </th>
                  {NICHOS.map(nicho => {
                    const NIcon = NICHO_ICONS[nicho];
                    return (
                    <th
                      key={nicho}
                      className="px-4 py-3 text-center text-slate-400 font-semibold cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort(nicho)}
                    >
                      <span className="inline-flex items-center gap-1">
                        <NIcon size={12} style={{ color: "#a78bfa" }} />
                        {NICHO_LABELS[nicho]}
                        {sortKey === nicho ? (sortAsc ? " ↑" : " ↓") : ""}
                      </span>
                    </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedCountries.map((country, idx) => (
                  <tr
                    key={country}
                    className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${idx % 2 === 0 ? "bg-slate-800/20" : ""}`}
                  >
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{country}</td>
                    {NICHOS.map(nicho => {
                      const rpm = RPM_BY_COUNTRY_NICHO[country][nicho];
                      return (
                        <td key={nicho} className="px-4 py-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${rpmColor(rpm)}`}>
                            ${rpm.toFixed(2)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="p-4 border-t border-slate-700/50 flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-900 border border-green-700/50 inline-block" />
              <span className="text-slate-400">RPM &gt; $5 (alto)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-yellow-900 border border-yellow-700/50 inline-block" />
              <span className="text-slate-400">RPM $2–$5 (medio)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-900 border border-red-700/50 inline-block" />
              <span className="text-slate-400">RPM &lt; $2 (bajo)</span>
            </span>
          </div>
        </div>

        {/* Key Insights */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Lightbulb size={18} style={{ color: "#a78bfa" }} /> Insights clave</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: Lightbulb,
                text: "EE.UU. en español paga 5x más que México en el mismo nicho",
                color: "from-blue-900/40 to-indigo-900/30",
                border: "border-blue-700/30",
              },
              {
                icon: Trophy,
                text: "España tiene el CPM más alto de habla hispana",
                color: "from-violet-900/40 to-purple-900/30",
                border: "border-violet-700/30",
              },
              {
                icon: TrendingUp,
                text: "Un video con 50% audiencia de EE.UU. puede ganar 3x más que uno 100% mexicano",
                color: "from-green-900/40 to-emerald-900/30",
                border: "border-green-700/30",
              },
              {
                icon: Target,
                text: "Estrategia: crea contenido que atraiga audiencia de España y EE.UU. hispanohablante",
                color: "from-orange-900/40 to-amber-900/30",
                border: "border-orange-700/30",
              },
            ].map((insight, i) => {
              const InsightIcon = insight.icon;
              return (
              <div
                key={i}
                className={`bg-gradient-to-br ${insight.color} border ${insight.border} rounded-xl p-4 flex gap-3 items-start`}
              >
                <div className="flex-shrink-0 mt-0.5"><InsightIcon size={18} style={{ color: "#a78bfa" }} /></div>
                <p className="text-sm text-slate-200 leading-relaxed">{insight.text}</p>
              </div>
              );
            })}
          </div>
        </div>

        {/* Tips para audiencia premium */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Rocket size={18} style={{ color: "#a78bfa" }} /> Tips para atraer audiencia premium</h2>
          <ul className="space-y-3">
            {[
              "Publica a las 8–10pm hora España (2–4pm México) para capturar ambas audiencias",
              "Usa términos neutros del español (evita regionalismos que alejan audiencia de España)",
              "El SEO con keywords en inglés puede traer audiencia de EE.UU. hispanohablante",
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="mt-6 pt-5 border-t border-slate-700/50">
            <Link
              href="/calculadora"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)" }}
            >
              <DollarSign size={16} className="inline mr-1" /> Calcula tus ingresos exactos →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
