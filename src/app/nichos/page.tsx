"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search, SlidersHorizontal, TrendingUp, TrendingDown,
  Minus, DollarSign, User, X, ChevronRight, Trophy, RefreshCw,
} from "lucide-react";
import { nichos as nichosLocal, categorias, Nicho } from "@/lib/nichos";
import { cn } from "@/lib/utils";
import NavAuth from "@/components/NavAuth";
import GlobalNav from "@/components/GlobalNav";

type ActiveTab = "Todos" | "TOP 100 Long 🏆" | "TOP 100 Short 🏆" | "Faceless";

const competenciaColors = {
  baja: "text-green-400 bg-green-400/10 border-green-400/20",
  media: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  alta: "text-red-400 bg-red-400/10 border-red-400/20",
};

const tendenciaIcon = {
  subiendo: <TrendingUp className="w-3.5 h-3.5 text-green-400" />,
  estable: <Minus className="w-3.5 h-3.5 text-slate-400" />,
  bajando: <TrendingDown className="w-3.5 h-3.5 text-red-400" />,
};

const tendenciaColor = {
  subiendo: "text-green-400",
  estable: "text-slate-400",
  bajando: "text-red-400",
};

function RankBadge({ rank, activeTab }: { rank?: number; activeTab: ActiveTab }) {
  if (!rank || activeTab === "Todos") return null;
  return (
    <div className={`text-xs font-black px-2 py-0.5 rounded-full ${
      rank === 1 ? "bg-yellow-400 text-yellow-900" :
      rank === 2 ? "bg-slate-300 text-slate-700" :
      rank === 3 ? "bg-orange-400 text-orange-900" :
      "bg-slate-700 text-slate-300"
    }`}>
      #{rank}
    </div>
  );
}

function NichoCard({ nicho, activeTab }: { nicho: Nicho; activeTab: ActiveTab }) {
  const showRank = activeTab !== "Todos" && nicho.rank !== undefined;
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 hover:bg-slate-800/80 transition-all duration-200 flex flex-col gap-4 relative">
      {/* Rank badge in top-left corner when in TOP 100 mode */}
      {showRank && (
        <div className="absolute top-3 left-3">
          <RankBadge rank={nicho.rank} activeTab={activeTab} />
        </div>
      )}

      {/* Header */}
      <div className={cn("flex items-start justify-between gap-2", showRank && "mt-5")}>
        <div>
          <span className="text-xs text-violet-400 font-medium">{nicho.categoria}</span>
          <h3 className="font-bold text-slate-100 text-base leading-tight mt-0.5">{nicho.nombre}</h3>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {nicho.faceless && (
            <span className="flex items-center gap-1 text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-2 py-0.5">
              <User className="w-3 h-3" /> Faceless
            </span>
          )}
          <span className={cn("flex items-center gap-1 text-xs border rounded-full px-2 py-0.5", competenciaColors[nicho.competencia])}>
            {nicho.competencia}
          </span>
        </div>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed">{nicho.descripcion}</p>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900/50 rounded-xl p-3 text-center">
          <DollarSign className="w-3.5 h-3.5 text-green-400 mx-auto mb-1" />
          <div className="text-slate-100 font-bold text-sm">${nicho.rpmMin}-{nicho.rpmMax}</div>
          <div className="text-slate-500 text-[10px]">RPM USD</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-3 text-center">
          <DollarSign className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
          <div className="text-slate-100 font-bold text-sm">${nicho.gananciasMin}</div>
          <div className="text-slate-500 text-[10px]">min/100K vis</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-3 text-center">
          <div className="flex justify-center mb-1">{tendenciaIcon[nicho.tendencia]}</div>
          <div className={cn("font-bold text-sm capitalize", tendenciaColor[nicho.tendencia])}>
            {nicho.tendencia}
          </div>
          <div className="text-slate-500 text-[10px]">tendencia</div>
        </div>
      </div>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5">
        {nicho.keywords.slice(0, 3).map((kw) => (
          <span key={kw} className="text-[10px] bg-slate-700/50 text-slate-400 rounded-full px-2 py-0.5">
            {kw}
          </span>
        ))}
      </div>

      {/* Canal ejemplo + buscar */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
        <div className="text-xs text-slate-500">
          Ej: <span className="text-slate-300">{nicho.ejemploCanal}</span>
        </div>
        <Link
          href={`/?q=${encodeURIComponent(nicho.nombre)}`}
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
        >
          Buscar videos <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

const TABS: ActiveTab[] = ["Todos", "TOP 100 Long 🏆", "TOP 100 Short 🏆", "Faceless"];

export default function NichosPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("Todos");
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("Todas");
  const [competenciaFiltro, setCompetenciaFiltro] = useState<string>("Todas");
  const [facelessFiltro, setFacelessFiltro] = useState(false);
  const [idiomaFiltro, setIdiomaFiltro] = useState<string>("Todos");
  const [rpmMin, setRpmMin] = useState(0);
  const [tendenciaFiltro, setTendenciaFiltro] = useState<string>("Todas");
  const [sortBy, setSortBy] = useState<"rpm" | "ganancias" | "nombre">("rpm");

  // Supabase integration
  const [nichos, setNichos] = useState<Nicho[]>(nichosLocal);
  const [dataSource, setDataSource] = useState<"supabase" | "local" | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/nichos")
      .then((r) => r.json())
      .then((data: { nichos: Nicho[]; source: "supabase" | "local" }) => {
        if (data.nichos && data.nichos.length > 0) {
          setNichos(data.nichos);
          setDataSource(data.source);
        }
      })
      .catch(() => {
        setDataSource("local");
      });
  }, []);

  async function handleSeed() {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await fetch("/api/nichos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      if (res.ok) {
        setSeedMsg("✅ Datos actualizados en Supabase");
        setDataSource("supabase");
      } else {
        const err = await res.json() as { error?: string };
        if (err.error?.includes("SUPABASE_SERVICE_ROLE_KEY")) {
          setSeedMsg("⚠️ Configura SUPABASE_SERVICE_ROLE_KEY para sincronizar");
        } else {
          setSeedMsg(`⚠️ Error: ${err.error ?? "desconocido"}`);
        }
      }
    } catch {
      setSeedMsg("⚠️ Error al conectar con la API");
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMsg(null), 5000);
    }
  }

  const filtrados = useMemo(() => {
    let base = nichos;

    // Tab-level filtering
    if (activeTab === "TOP 100 Long 🏆") {
      base = base
        .filter((n) => n.tipo === "long" || n.tipo === "ambos")
        .filter((n) => n.rank !== undefined)
        .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
      return base;
    }

    if (activeTab === "TOP 100 Short 🏆") {
      base = base
        .filter((n) => n.tipo === "short" || n.tipo === "ambos")
        .filter((n) => n.rank !== undefined)
        .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
      return base;
    }

    if (activeTab === "Faceless") {
      base = base.filter((n) => n.faceless);
    }

    return base
      .filter((n) => {
        if (search && !n.nombre.toLowerCase().includes(search.toLowerCase()) &&
          !n.descripcion.toLowerCase().includes(search.toLowerCase()) &&
          !n.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()))) return false;
        if (categoriaFiltro !== "Todas" && n.categoria !== categoriaFiltro) return false;
        if (competenciaFiltro !== "Todas" && n.competencia !== competenciaFiltro) return false;
        if (facelessFiltro && !n.faceless) return false;
        if (idiomaFiltro !== "Todos" && n.idioma !== idiomaFiltro && n.idioma !== "ambos") return false;
        if (n.rpmMin < rpmMin) return false;
        if (tendenciaFiltro !== "Todas" && n.tendencia !== tendenciaFiltro) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rpm") return b.rpmMax - a.rpmMax;
        if (sortBy === "ganancias") return b.gananciasMax - a.gananciasMax;
        return a.nombre.localeCompare(b.nombre);
      });
  }, [activeTab, search, categoriaFiltro, competenciaFiltro, facelessFiltro, idiomaFiltro, rpmMin, tendenciaFiltro, sortBy]);

  const activeFilters = [
    categoriaFiltro !== "Todas" && categoriaFiltro,
    competenciaFiltro !== "Todas" && `comp: ${competenciaFiltro}`,
    facelessFiltro && "Faceless",
    idiomaFiltro !== "Todos" && idiomaFiltro,
    rpmMin > 0 && `RPM ≥ $${rpmMin}`,
    tendenciaFiltro !== "Todas" && tendenciaFiltro,
  ].filter(Boolean) as string[];

  const isTopTab = activeTab === "TOP 100 Long 🏆" || activeTab === "TOP 100 Short 🏆";
  const showSidebar = activeTab === "Todos" || activeTab === "Faceless";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {isTopTab ? (
                <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full">
                  <Trophy className="w-3.5 h-3.5" />
                  TOP 100 Nichos
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
                  <DollarSign className="w-3.5 h-3.5" />
                  {nichos.length}+ nichos con RPM real
                </div>
              )}
              {isTopTab && (
                <span className="inline-flex items-center bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  NEW
                </span>
              )}
            </div>

            {/* Actualizar button */}
            <div className="flex items-center gap-2 shrink-0">
              {seedMsg && (
                <span className="text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
                  {seedMsg}
                </span>
              )}
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 hover:border-violet-500 hover:text-violet-300 text-slate-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", seeding && "animate-spin")} />
                Actualizar
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {activeTab === "TOP 100 Long 🏆" ? (
              <>
                TOP 100 Nichos{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Long Form
                </span>
              </>
            ) : activeTab === "TOP 100 Short 🏆" ? (
              <>
                TOP 100 Nichos{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-500">
                  Short Form
                </span>
              </>
            ) : (
              <>
                Explorer de{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-violet-500">
                  Nichos Rentables
                </span>
              </>
            )}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {isTopTab
              ? "Los nichos mejor rankeados ordenados por rentabilidad, tendencia y potencial de crecimiento."
              : "Filtra por RPM, competencia, idioma y faceless. Haz click en cualquier nicho para buscar sus videos virales."}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200",
                activeTab === tab
                  ? tab.includes("Long")
                    ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
                    : tab.includes("Short")
                    ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                    : "bg-violet-600 border-violet-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Sidebar filtros — only show in Todos / Faceless */}
          {showSidebar && (
            <aside className="w-56 shrink-0 space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                  <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1" />Filtros
                </label>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar nicho..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                {/* Categoría */}
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-1.5">Categoría</p>
                  <select
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  >
                    <option>Todas</option>
                    {categorias.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Competencia */}
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-1.5">Competencia</p>
                  <div className="flex gap-1.5">
                    {["Todas", "baja", "media", "alta"].map(v => (
                      <button
                        key={v}
                        onClick={() => setCompetenciaFiltro(v)}
                        className={cn(
                          "flex-1 text-[10px] py-1.5 rounded-lg border transition-colors",
                          competenciaFiltro === v
                            ? "bg-violet-600 border-violet-500 text-white"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                        )}
                      >
                        {v === "Todas" ? "Todas" : v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tendencia */}
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-1.5">Tendencia</p>
                  <select
                    value={tendenciaFiltro}
                    onChange={(e) => setTendenciaFiltro(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  >
                    <option>Todas</option>
                    <option value="subiendo">Subiendo</option>
                    <option value="estable">Estable</option>
                    <option value="bajando">Bajando</option>
                  </select>
                </div>

                {/* Idioma */}
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-1.5">Idioma</p>
                  <select
                    value={idiomaFiltro}
                    onChange={(e) => setIdiomaFiltro(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  >
                    <option>Todos</option>
                    <option value="español">Español</option>
                    <option value="ingles">Inglés</option>
                  </select>
                </div>

                {/* RPM mínimo */}
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-1.5">RPM mínimo: <span className="text-slate-300">${rpmMin}</span></p>
                  <input
                    type="range"
                    min={0} max={20} step={1}
                    value={rpmMin}
                    onChange={(e) => setRpmMin(Number(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>$0</span><span>$20+</span>
                  </div>
                </div>

                {/* Faceless */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={facelessFiltro}
                    onChange={(e) => setFacelessFiltro(e.target.checked)}
                    className="accent-violet-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-300">Solo Faceless</span>
                </label>
              </div>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort + count */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-400">
                  <span className="text-slate-100 font-semibold">{filtrados.length}</span> nichos
                </span>
                {activeFilters.map(f => (
                  <span key={f} className="flex items-center gap-1 text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-2 py-0.5">
                    {f}
                    <button onClick={() => {
                      if (f === "Faceless") setFacelessFiltro(false);
                      else if (f.startsWith("comp:")) setCompetenciaFiltro("Todas");
                      else if (f.startsWith("RPM")) setRpmMin(0);
                      else if (["subiendo", "estable", "bajando"].includes(f)) setTendenciaFiltro("Todas");
                      else if (["español", "Inglés"].includes(f)) setIdiomaFiltro("Todos");
                      else setCategoriaFiltro("Todas");
                    }}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {!isTopTab && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="rpm">Mayor RPM</option>
                  <option value="ganancias">Mayor Ganancia</option>
                  <option value="nombre">Nombre A-Z</option>
                </select>
              )}
            </div>

            {filtrados.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                No hay nichos que coincidan con los filtros.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtrados.map(n => <NichoCard key={n.id} nicho={n} activeTab={activeTab} />)}
              </div>
            )}
          </div>
        </div>

        {/* Source indicator */}
        {dataSource && (
          <div className="mt-8 pt-4 border-t border-slate-800/50 text-center">
            <span className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full border",
              dataSource === "supabase"
                ? "text-green-400 bg-green-400/5 border-green-400/20"
                : "text-slate-500 bg-slate-800/30 border-slate-700/30"
            )}>
              Datos: {dataSource === "supabase" ? "Supabase" : "Local"}
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
