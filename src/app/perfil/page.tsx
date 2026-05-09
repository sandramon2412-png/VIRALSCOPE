"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Crown,
  Play,
  LogOut,
  Trash2,
  BarChart2,
  Bell,
  Calendar,
  FolderOpen,
} from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

/* ------------------------------------------------------------------ */
/* helpers                                                              */
/* ------------------------------------------------------------------ */

function fmtDate(iso: string | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function countKanbanCards(): number {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("kanban-")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          // columns may be an object { [id]: { cards: [] } } or an array
          if (Array.isArray(parsed)) {
            parsed.forEach((col: { cards?: unknown[] }) => {
              total += col.cards?.length ?? 0;
            });
          } else if (typeof parsed === "object" && parsed !== null) {
            Object.values(parsed).forEach((col) => {
              const c = col as { cards?: unknown[] };
              total += c.cards?.length ?? 0;
            });
          }
        }
      }
    }
    return total;
  } catch {
    return 0;
  }
}

interface Stats {
  proyectos: number;
  kanbanVideos: number;
  alertas: number;
  programados: number;
}

function readStats(): Stats {
  try {
    const proyRaw = localStorage.getItem("viralscope-proyectos");
    const proyectos = proyRaw ? (JSON.parse(proyRaw) as unknown[]).length : 0;

    const kanbanVideos = countKanbanCards();

    const alertRaw = localStorage.getItem("viralscope-alertas");
    const alertas = alertRaw
      ? (JSON.parse(alertRaw) as { activa?: boolean }[]).filter((a) => a.activa !== false).length
      : 0;

    const calRaw = localStorage.getItem("viralscope-calendario");
    const programados = calRaw ? (JSON.parse(calRaw) as unknown[]).length : 0;

    return { proyectos, kanbanVideos, alertas, programados };
  } catch {
    return { proyectos: 0, kanbanVideos: 0, alertas: 0, programados: 0 };
  }
}

function clearViralScopeData() {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith("viralscope-") || key.startsWith("kanban-"))) {
      toRemove.push(key);
    }
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}

/* ------------------------------------------------------------------ */
/* main component                                                       */
/* ------------------------------------------------------------------ */

function PerfilContent() {
  const { user, session, signOut, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ proyectos: 0, kanbanVideos: 0, alertas: 0, programados: 0 });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStats(readStats());
    setHydrated(true);
  }, []);

  const initial = user?.email?.[0]?.toUpperCase() ?? "?";
  const isPro = false; // extend when billing is added

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  async function handleDisconnect() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleConnect() {
    await signInWithGoogle();
  }

  function handleClearData() {
    if (window.confirm("¿Seguro? Se eliminarán todos los datos locales de ViralScope (proyectos, kanban, alertas, calendario). Esta acción no se puede deshacer.")) {
      clearViralScopeData();
      setStats({ proyectos: 0, kanbanVideos: 0, alertas: 0, programados: 0 });
    }
  }

  const isYouTubeConnected = Boolean(session?.provider_token);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* ── Section 1: Cuenta ─────────────────────────────────────── */}
        <section className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">Cuenta</h2>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white flex-shrink-0 select-none"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
            >
              {initial}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-100 truncate">{user?.email}</p>

              <p className="text-xs text-slate-500 mt-1">
                Miembro desde{" "}
                <span className="text-slate-400">{fmtDate(user?.created_at)}</span>
              </p>

              {/* Plan badge */}
              <div className="mt-2">
                {isPro ? (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
                  >
                    <Crown className="w-3 h-3" />
                    Plan Pro
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                    <User className="w-3 h-3" />
                    Plan Gratuito
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Estadísticas ───────────────────────────────── */}
        <section className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
            Estadísticas de uso
          </h2>

          {!hydrated ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-800/60 rounded-xl p-4 animate-pulse h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<FolderOpen className="w-4 h-4 text-violet-400" />} label="Proyectos creados" value={stats.proyectos} />
              <StatCard icon={<BarChart2 className="w-4 h-4 text-blue-400" />} label="Videos en Kanban" value={stats.kanbanVideos} />
              <StatCard icon={<Bell className="w-4 h-4 text-amber-400" />} label="Alertas activas" value={stats.alertas} />
              <StatCard icon={<Calendar className="w-4 h-4 text-green-400" />} label="Videos programados" value={stats.programados} />
            </div>
          )}
        </section>

        {/* ── Section 3: Canal de YouTube ───────────────────────────── */}
        <section className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
            Canal de YouTube
          </h2>

          {isYouTubeConnected ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Play className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-100">Canal conectado</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25">
                      ✅ Activo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tienes acceso a métricas reales de YouTube
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                >
                  Ver dashboard
                </Link>
                <button
                  onClick={handleDisconnect}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Desconectar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-300">Canal no conectado</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-500 border border-slate-600">
                      ❌ Inactivo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Conecta tu canal para ver CTR real, impresiones y retención
                  </p>
                </div>
              </div>
              <button
                onClick={handleConnect}
                className="text-xs font-semibold px-4 py-2 rounded-lg text-white transition-colors flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
              >
                Conectar con Google
              </button>
            </div>
          )}
        </section>

        {/* ── Section 4: Acciones ───────────────────────────────────── */}
        <section className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">Acciones</h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>

            <button
              onClick={handleClearData}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar datos locales
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* stat card sub-component                                              */
/* ------------------------------------------------------------------ */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-2xl font-black text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* default export — wrapped with ProtectedRoute                        */
/* ------------------------------------------------------------------ */

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <PerfilContent />
    </ProtectedRoute>
  );
}
