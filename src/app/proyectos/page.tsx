"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus, Trash2, Layout, Sparkles,
  Calendar, Hash, Users, Flame, Download, Film,
} from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Proyecto {
  id: string;
  nombre: string;
  handle: string;
  nicho: string;
  faceless: boolean;
  logoUrl?: string;
  bannerUrl?: string;
  creadoEn: string; // ISO date string
  totalCards?: number;
}

const STORAGE_KEY = "viralscope-proyectos";

function fmt(date: string) {
  try {
    return new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch { return date; }
}

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProyectos(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  const exportarZip = async (p: Proyecto) => {
    setExportingId(p.id);
    try {
      // Gather project data from localStorage
      let kanban = null;
      let plan = null;
      try {
        const kanbanRaw = localStorage.getItem(`kanban-${p.nombre}`);
        if (kanbanRaw) kanban = JSON.parse(kanbanRaw);
      } catch {}
      try {
        const planRaw = localStorage.getItem(`plan-${p.nombre}`);
        if (planRaw) plan = JSON.parse(planRaw);
      } catch {}

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canalNombre: p.nombre, proyecto: p, kanban, plan }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `viralscope-${p.nombre.replace(/[^a-zA-Z0-9_\-]/g, "-")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Error al exportar el proyecto. Inténtalo de nuevo.");
    } finally {
      setExportingId(null);
    }
  };

  const eliminar = (id: string) => {
    if (!window.confirm("¿Eliminar este proyecto?")) return;
    setProyectos(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Get kanban card count for each project
  const getCardCount = (nombre: string) => {
    try {
      const saved = localStorage.getItem(`kanban-${nombre}`);
      if (!saved) return 0;
      const cols = JSON.parse(saved);
      return cols.reduce((acc: number, col: { cards: unknown[] }) => acc + (col.cards?.length || 0), 0);
    } catch { return 0; }
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />
      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <Layout className="w-3.5 h-3.5" /> Mis Proyectos
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              Panel de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400">
                Canales
              </span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Todos tus proyectos de canal en un solo lugar.</p>
          </div>
          <Link
            href="/crear-canal"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)" }}
          >
            <Plus className="w-4 h-4" /> Nuevo Proyecto
          </Link>
        </div>

        {!hydrated ? (
          // Skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-24 bg-slate-700/50" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-700 rounded w-2/3" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                  <div className="h-8 bg-slate-700 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : proyectos.length === 0 ? (
          // Empty state
          <div className="text-center py-24 space-y-4">
            <div className="flex justify-center"><Film size={56} style={{ color: "#a78bfa" }} /></div>
            <h2 className="text-xl font-bold text-slate-300">Aún no tienes proyectos</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Crea tu primer canal con IA y aparecerá aquí con su logo, banner y Kanban.
            </p>
            <Link
              href="/crear-canal"
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
            >
              <Sparkles className="w-4 h-4" /> Crear mi primer canal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proyectos.map(p => {
              const cards = getCardCount(p.nombre);
              return (
                <div key={p.id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-all group">
                  {/* Banner */}
                  <div className="relative h-24 bg-gradient-to-r from-violet-900/60 to-pink-900/40">
                    {p.bannerUrl && (
                      <Image src={p.bannerUrl} alt="banner" fill className="object-cover opacity-60" unoptimized />
                    )}
                    {/* Logo */}
                    <div className="absolute -bottom-6 left-4">
                      <div className="w-14 h-14 rounded-full border-2 border-slate-800 overflow-hidden bg-slate-700 shadow-xl">
                        {p.logoUrl ? (
                          <Image src={p.logoUrl} alt="logo" width={56} height={56} className="w-full h-full object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-black text-xl">
                            {p.nombre.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={() => eliminar(p.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="pt-8 px-4 pb-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-white">{p.nombre}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.handle && <span className="text-xs text-slate-500">{p.handle}</span>}
                        {p.faceless && (
                          <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Users className="w-2.5 h-2.5" /> Faceless
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {p.nicho && (
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          <span className="line-clamp-1">{p.nicho}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{fmt(p.creadoEn)}</span>
                      </div>
                      {cards > 0 && (
                        <div className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span className="text-orange-400">{cards} ideas</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href={`/kanban?canal=${encodeURIComponent(p.nombre)}&nicho=${encodeURIComponent(p.nicho)}`}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 text-xs font-semibold transition-colors"
                      >
                        <Layout className="w-3.5 h-3.5" /> Kanban
                      </Link>
                      <Link
                        href={`/crear-canal?resume=1&nombre=${encodeURIComponent(p.nombre)}&handle=${encodeURIComponent(p.handle || "")}&nicho=${encodeURIComponent(p.nicho)}&faceless=${p.faceless}&logoUrl=${encodeURIComponent(p.logoUrl || "")}&bannerUrl=${encodeURIComponent(p.bannerUrl || "")}`}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-bold transition-colors"
                        style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Editar
                      </Link>
                    </div>
                    {/* Export ZIP */}
                    <button
                      onClick={() => exportarZip(p)}
                      disabled={exportingId === p.id}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-transparent hover:bg-slate-700/40 border border-slate-600/40 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3 h-3" />
                      {exportingId === p.id ? "Exportando..." : "⬇️ Exportar ZIP"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
    </ProtectedRoute>
  );
}
