"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Flame, DollarSign, TrendingUp, Users, Play, Info, Link2, Star, Package, Heart, Handshake, Lock, CheckCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import NavAuth from "@/components/NavAuth";
import GlobalNav from "@/components/GlobalNav";

const NICHOS_RPM = [
  { id: "finanzas", label: "Finanzas personales / Inversiones", rpm: 18 },
  { id: "software", label: "Software / SaaS / Tech", rpm: 22 },
  { id: "negocios", label: "Negocios online / Emprendimiento", rpm: 15 },
  { id: "marketing", label: "Marketing digital", rpm: 14 },
  { id: "legal", label: "Legal / Seguros / Impuestos", rpm: 20 },
  { id: "salud", label: "Salud y bienestar", rpm: 10 },
  { id: "inmobiliario", label: "Bienes raíces", rpm: 16 },
  { id: "educacion", label: "Educación / Cursos", rpm: 9 },
  { id: "crypto", label: "Crypto / Web3", rpm: 13 },
  { id: "viajes", label: "Viajes / Lifestyle", rpm: 6 },
  { id: "gaming", label: "Gaming", rpm: 4 },
  { id: "cocina", label: "Cocina / Recetas", rpm: 5 },
  { id: "entretenimiento", label: "Entretenimiento / Humor", rpm: 3 },
  { id: "musica", label: "Música", rpm: 2.5 },
  { id: "otro", label: "Otro / General", rpm: 4 },
];

const PAISES_MULT = [
  { id: "us", label: "Estados Unidos / Canadá", mult: 1.0 },
  { id: "uk", label: "Reino Unido / Australia", mult: 0.9 },
  { id: "latam_esp", label: "España", mult: 0.6 },
  { id: "latam_mx", label: "México", mult: 0.35 },
  { id: "latam_co", label: "Colombia / Argentina / Chile", mult: 0.3 },
  { id: "latam_pe", label: "Perú / Ecuador / Bolivia", mult: 0.2 },
  { id: "global", label: "Audiencia mixta global", mult: 0.55 },
];

function formatCurrency(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function Slider({
  label, value, min, max, step, onChange, format,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label className="text-xs text-slate-400">{label}</label>
        <span className="text-xs font-semibold text-slate-200">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-slate-700 accent-violet-500 cursor-pointer"
      />
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-slate-600">{format(min)}</span>
        <span className="text-[10px] text-slate-600">{format(max)}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={cn("rounded-2xl border p-4 space-y-1", color)}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

export default function CalculadoraPage() {
  const [nicho, setNicho] = useState("finanzas");
  const [pais, setPais] = useState("latam_mx");
  const [subs, setSubs] = useState(10000);
  const [viewsPerVideo, setViewsPerVideo] = useState(5000);
  const [videosPerMonth, setVideosPerMonth] = useState(8);
  const [ctr, setCtr] = useState(5);

  const nichoData = NICHOS_RPM.find(n => n.id === nicho)!;
  const paisData = PAISES_MULT.find(p => p.id === pais)!;

  const results = useMemo(() => {
    const rpmFinal = nichoData.rpm * paisData.mult;
    const monthlyViews = viewsPerVideo * videosPerMonth;
    const adRevMonth = (monthlyViews / 1000) * rpmFinal;
    const adRevYear = adRevMonth * 12;

    // Estimados de monetización adicional
    const sponsorPerVideo = subs >= 10000 ? (subs / 1000) * 25 * paisData.mult : 0;
    const sponsorMonth = sponsorPerVideo * videosPerMonth * 0.3; // ~30% videos con sponsor

    const affiliateMonth = (monthlyViews / 1000) * 2 * paisData.mult; // ~$2 RPM affiliates

    // Membresías (YouTube Members) — available at 1000+ subs
    const membresiaMonth = subs >= 1000
      ? subs * 0.005 * 4.99 * 0.7 * paisData.mult // 0.5% conversion, $4.99/mo, 70% YouTube cut
      : 0;

    // Productos digitales / cursos (20K+ subs typically)
    const productosMonth = subs >= 20000
      ? (monthlyViews / 1000) * 1.5 * paisData.mult // ~$1.5 per 1000 views in digital products
      : 0;

    // Super Thanks / Super Chats (5K+ subs, live channels)
    const superThanksMonth = subs >= 5000
      ? (monthlyViews / 1000) * 0.8 * paisData.mult
      : 0;

    const totalMonth = adRevMonth + sponsorMonth + affiliateMonth + membresiaMonth + productosMonth + superThanksMonth;
    const totalYear = totalMonth * 12;

    // Proyección a 12 meses (crecimiento lineal simple)
    const growthRate = 0.08; // 8% mensual promedio canal nuevo
    let projYear = 0;
    let projViews = viewsPerVideo;
    let projSubs = subs;
    for (let i = 0; i < 12; i++) {
      const mv = projViews * videosPerMonth;
      const rev = (mv / 1000) * rpmFinal;
      projYear += rev;
      projViews = projViews * (1 + growthRate);
      projSubs = projSubs * (1 + growthRate);
    }

    return {
      rpmFinal,
      monthlyViews,
      adRevMonth,
      adRevYear,
      sponsorMonth,
      affiliateMonth,
      membresiaMonth,
      productosMonth,
      superThanksMonth,
      totalMonth,
      totalYear,
      projYear,
      projSubs: Math.round(projSubs),
    };
  }, [nicho, pais, subs, viewsPerVideo, videosPerMonth, ctr, nichoData, paisData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <DollarSign className="w-3.5 h-3.5" />
            Estimaciones reales · Sin humo
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Calculadora de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Ingresos YouTube</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Estimados basados en RPM reales por nicho e idioma. Incluye AdSense, sponsors y afiliados.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-5">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Nicho del canal</label>
                <select
                  value={nicho}
                  onChange={e => setNicho(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                >
                  {NICHOS_RPM.map(n => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  RPM base: <span className="text-green-400 font-semibold">${nichoData.rpm}</span> USD por 1000 vistas
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">País principal de audiencia</label>
                <select
                  value={pais}
                  onChange={e => setPais(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                >
                  {PAISES_MULT.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Multiplicador: <span className="text-blue-400 font-semibold">{(paisData.mult * 100).toFixed(0)}%</span> del RPM base
                </p>
              </div>

              <div className="border-t border-slate-700/50 pt-4 space-y-4">
                <Slider
                  label="Suscriptores actuales"
                  value={subs}
                  min={1000} max={1000000} step={1000}
                  onChange={setSubs}
                  format={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                />
                <Slider
                  label="Vistas promedio por video"
                  value={viewsPerVideo}
                  min={500} max={500000} step={500}
                  onChange={setViewsPerVideo}
                  format={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                />
                <Slider
                  label="Videos publicados por mes"
                  value={videosPerMonth}
                  min={1} max={30} step={1}
                  onChange={setVideosPerMonth}
                  format={v => `${v} videos`}
                />
                <Slider
                  label="CTR promedio (%)"
                  value={ctr}
                  min={1} max={20} step={0.5}
                  onChange={setCtr}
                  format={v => `${v}%`}
                />
              </div>
            </div>

            {/* RPM Note */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <div className="flex gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-blue-300">RPM final calculado</p>
              </div>
              <p className="text-2xl font-black text-blue-400">${results.rpmFinal.toFixed(2)}</p>
              <p className="text-[11px] text-slate-500 mt-1">USD por cada 1,000 reproducciones monetizadas</p>
              <p className="text-[11px] text-slate-500">= ${nichoData.rpm} × {(paisData.mult * 100).toFixed(0)}%</p>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Main numbers */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Ingresos mensuales (AdSense)"
                value={formatCurrency(results.adRevMonth)}
                sub={`${(results.monthlyViews / 1000).toFixed(0)}k vistas/mes`}
                color="bg-green-500/10 border-green-500/20 text-green-300"
              />
              <StatCard
                label="Ingresos anuales (AdSense)"
                value={formatCurrency(results.adRevYear)}
                sub={`Solo anuncios`}
                color="bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              />
            </div>

            {/* Full monetization breakdown */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                Desglose completo de monetización
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/40">
                  <div>
                    <p className="text-sm text-slate-300">AdSense (anuncios)</p>
                    <p className="text-[11px] text-slate-500">RPM ${results.rpmFinal.toFixed(2)} × {(results.monthlyViews / 1000).toFixed(0)}k vistas</p>
                  </div>
                  <span className="text-sm font-bold text-green-400">{formatCurrency(results.adRevMonth)}/mes</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/40">
                  <div>
                    <p className="text-sm text-slate-300">Sponsors / Patrocinios</p>
                    <p className="text-[11px] text-slate-500">
                      {subs >= 10000
                        ? `~${formatCurrency((subs / 1000) * 25 * paisData.mult)} por video, 30% de videos`
                        : "Disponible desde ~10k subs"}
                    </p>
                  </div>
                  <span className={cn("text-sm font-bold", results.sponsorMonth > 0 ? "text-blue-400" : "text-slate-600")}>
                    {results.sponsorMonth > 0 ? `${formatCurrency(results.sponsorMonth)}/mes` : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/40">
                  <div>
                    <p className="text-sm text-slate-300">Marketing de afiliados</p>
                    <p className="text-[11px] text-slate-500">~$2 RPM estimado en descripciones</p>
                  </div>
                  <span className="text-sm font-bold text-orange-400">{formatCurrency(results.affiliateMonth)}/mes</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <p className="text-sm font-bold text-slate-200">Total estimado</p>
                  <div className="text-right">
                    <p className="text-xl font-black text-violet-400">{formatCurrency(results.totalMonth)}/mes</p>
                    <p className="text-xs text-slate-500">{formatCurrency(results.totalYear)}/año</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 12-month projection */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-300 mb-1 flex items-center gap-2">
                <Play className="w-4 h-4 text-pink-400" />
                Proyección a 12 meses
              </h2>
              <p className="text-[11px] text-slate-500 mb-4">Asumiendo crecimiento orgánico del 8% mensual desde hoy</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 rounded-xl p-3">
                  <p className="text-[11px] text-slate-500">Ingresos AdSense (año 1)</p>
                  <p className="text-xl font-black text-pink-400">{formatCurrency(results.projYear)}</p>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-3">
                  <p className="text-[11px] text-slate-500">Suscriptores proyectados</p>
                  <p className="text-xl font-black text-indigo-400">
                    {results.projSubs >= 1000 ? `${(results.projSubs / 1000).toFixed(1)}k` : results.projSubs}
                  </p>
                </div>
              </div>
            </div>

            {/* Desglose por fuente de ingresos */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Desglose mensual por fuente
              </h3>
              <div className="space-y-3">
                {[
                  { label: "AdSense (RPM)", icon: DollarSign, value: results.adRevMonth, pct: results.totalMonth > 0 ? results.adRevMonth / results.totalMonth : 0, color: "bg-green-500", always: true },
                  { label: "Patrocinios", icon: Handshake, value: results.sponsorMonth, pct: results.totalMonth > 0 ? results.sponsorMonth / results.totalMonth : 0, color: "bg-blue-500", always: subs >= 10000 },
                  { label: "Afiliados", icon: Link2, value: results.affiliateMonth, pct: results.totalMonth > 0 ? results.affiliateMonth / results.totalMonth : 0, color: "bg-violet-500", always: true },
                  { label: "Membresías", icon: Star, value: results.membresiaMonth, pct: results.totalMonth > 0 ? results.membresiaMonth / results.totalMonth : 0, color: "bg-yellow-500", always: subs >= 1000 },
                  { label: "Productos digitales", icon: Package, value: results.productosMonth, pct: results.totalMonth > 0 ? results.productosMonth / results.totalMonth : 0, color: "bg-orange-500", always: subs >= 20000 },
                  { label: "Super Thanks", icon: Heart, value: results.superThanksMonth, pct: results.totalMonth > 0 ? results.superThanksMonth / results.totalMonth : 0, color: "bg-pink-500", always: subs >= 5000 },
                ].filter(item => item.always && item.value > 0).map(item => {
                  const ItemIcon = item.icon;
                  return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-400"><ItemIcon size={11} style={{ color: "#a78bfa" }} />{item.label}</span>
                      <span className="font-semibold text-slate-200">{formatCurrency(item.value)}/mes</span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-700`}
                        style={{ width: `${Math.min(item.pct * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
                <span className="text-xs text-slate-500">Total estimado</span>
                <span className="font-black text-lg text-green-400">{formatCurrency(results.totalMonth)}/mes</span>
              </div>
            </div>

            {/* Requisitos de monetización */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2">
                <Target size={14} style={{ color: "#a78bfa" }} /> Requisitos para desbloquear
              </h3>
              <div className="space-y-2">
                {[
                  { label: "AdSense (YPP)", req: "1,000 subs + 4,000 hs vistas", unlocked: subs >= 1000, icon: DollarSign },
                  { label: "Patrocinios", req: "10,000 subs mínimo recomendado", unlocked: subs >= 10000, icon: Handshake },
                  { label: "Membresías", req: "1,000 subs + YPP activo", unlocked: subs >= 1000, icon: Star },
                  { label: "Super Thanks", req: "5,000 subs + YPP activo", unlocked: subs >= 5000, icon: Heart },
                  { label: "Productos digitales", req: "20,000 subs (audiencia establecida)", unlocked: subs >= 20000, icon: Package },
                ].map(item => {
                  const ReqIcon = item.icon;
                  return (
                  <div key={item.label} className={`flex items-center justify-between p-2.5 rounded-xl text-xs ${item.unlocked ? "bg-green-950/40 border border-green-800/30" : "bg-slate-900/50 border border-slate-800"}`}>
                    <div className="flex items-center gap-2">
                      <ReqIcon size={13} style={{ color: "#a78bfa" }} />
                      <span className={item.unlocked ? "text-slate-200 font-medium" : "text-slate-500"}>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{item.req}</span>
                      {item.unlocked
                        ? <CheckCircle size={13} className="text-green-400" />
                        : <Lock size={13} className="text-slate-600" />
                      }
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-yellow-400" />
                Hitos y beneficios
              </h2>
              <div className="space-y-2">
                {[
                  { subs: 500, label: "500 subs", desc: "Puedes crear handle personalizado (@tucanal)" },
                  { subs: 1000, label: "1k subs + 4k horas", desc: "Acceso al Programa de Socios de YouTube (YPP)" },
                  { subs: 10000, label: "10k subs", desc: "Sponsors empiezan a llegar, productos digitales viables" },
                  { subs: 100000, label: "100k subs", desc: "Placa plateada, $1k–$10k/mes dependiendo del nicho" },
                  { subs: 1000000, label: "1M subs", desc: "Placa dorada, ingresos de 6 cifras posibles" },
                ].map(m => (
                  <div key={m.subs} className={cn(
                    "flex items-start gap-3 px-3 py-2 rounded-lg",
                    subs >= m.subs ? "bg-green-500/10 border border-green-500/20" : "border border-slate-700/30"
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                      subs >= m.subs ? "bg-green-400" : "bg-slate-600"
                    )} />
                    <div>
                      <p className={cn("text-xs font-semibold", subs >= m.subs ? "text-green-300" : "text-slate-400")}>
                        {m.label}
                        {subs >= m.subs && " ✓"}
                      </p>
                      <p className="text-[11px] text-slate-500">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-600 text-center">
              * Estimaciones orientativas. El RPM real varía por temporada, calidad de contenido y retención. Q4 (oct-dic) suele ser 30–50% más alto.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
