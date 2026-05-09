"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Check,
} from "lucide-react";
import GlobalNav from "@/components/GlobalNav";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduledVideo {
  id: string;
  titulo: string;
  keywords?: string;
  hook?: string;
  color: string;
}

interface KanbanCard {
  id: string;
  titulo: string;
  keywords?: string;
  hookReferencia?: string;
}

interface KanbanColumn {
  id: string;
  label: string;
  cards: KanbanCard[];
}

type ScheduledMap = Record<string, ScheduledVideo[]>;

// ─── Constants ────────────────────────────────────────────────────────────────

const COLOR_PALETTE = [
  "bg-purple-500",
  "bg-pink-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-cyan-500",
];

const DAYS_ES = ["L", "M", "X", "J", "V", "S", "D"];

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateLabel(key: string): string {
  const [y, m, d] = key.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const total = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= total; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}

// Monday-based: 0 = Mon, 6 = Sun
function dayOfWeekMon(d: Date): number {
  return (d.getDay() + 6) % 7;
}

// ─── Inner Page Component ─────────────────────────────────────────────────────

function CalendarioInner() {
  const today = new Date();
  const todayKey = toDateKey(today);

  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [scheduled, setScheduled] = useState<ScheduledMap>({});
  const [unscheduled, setUnscheduled] = useState<ScheduledVideo[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCanal, setSelectedCanal] = useState<string>("");
  const [canalOptions, setCanalOptions] = useState<string[]>([]);
  const [selectingVideoId, setSelectingVideoId] = useState<string | null>(null);
  const [addingVideoId, setAddingVideoId] = useState<string>("");

  // ── Load from localStorage ──────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Find all kanban boards
    const kanbanKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("kanban-")) kanbanKeys.push(k);
    }

    if (kanbanKeys.length === 0) return;

    const canals = kanbanKeys.map((k) => k.replace("kanban-", ""));
    setCanalOptions(canals);
    const initialCanal = canals[0] ?? "";
    setSelectedCanal((prev) => prev || initialCanal);

    // Load previously saved scheduled map
    const savedScheduled = localStorage.getItem("viralscope-calendario");
    const parsedScheduled: ScheduledMap = savedScheduled
      ? (JSON.parse(savedScheduled) as ScheduledMap)
      : {};
    setScheduled(parsedScheduled);

    // Collect all scheduled video ids
    const scheduledIds = new Set<string>();
    Object.values(parsedScheduled).forEach((arr) =>
      arr.forEach((v) => scheduledIds.add(v.id))
    );

    // Load cards from all kanban boards — Ideas + Guión columns
    let colorIdx = 0;
    const allUnscheduled: ScheduledVideo[] = [];

    for (const key of kanbanKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      let columns: KanbanColumn[] = [];
      try {
        columns = JSON.parse(raw) as KanbanColumn[];
      } catch {
        continue;
      }
      const relevant = columns.filter(
        (c) => c.id === "ideas" || c.id === "guion"
      );
      for (const col of relevant) {
        for (const card of col.cards) {
          if (!scheduledIds.has(card.id)) {
            allUnscheduled.push({
              id: card.id,
              titulo: card.titulo || "(Sin título)",
              keywords: card.keywords,
              hook: card.hookReferencia,
              color: COLOR_PALETTE[colorIdx % COLOR_PALETTE.length],
            });
            colorIdx++;
          }
        }
      }
    }

    setUnscheduled(allUnscheduled);
  }, []);

  // ── Persist scheduled to localStorage ──────────────────────────────────────
  const persistScheduled = useCallback((map: ScheduledMap) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("viralscope-calendario", JSON.stringify(map));
    }
  }, []);

  // ── Filtered unscheduled by canal ──────────────────────────────────────────
  const filteredUnscheduled = unscheduled.filter(() => {
    // All unscheduled are already from all canals; filtering by canal requires
    // tracking which board each video came from. For now show all.
    return true;
  });

  // ── Assign video to date ────────────────────────────────────────────────────
  const assignVideo = useCallback(
    (dateKey: string, video: ScheduledVideo) => {
      setScheduled((prev) => {
        const existing = prev[dateKey] ?? [];
        // Avoid duplicates
        if (existing.some((v) => v.id === video.id)) return prev;
        const next = { ...prev, [dateKey]: [...existing, video] };
        persistScheduled(next);
        return next;
      });
      setUnscheduled((prev) => prev.filter((v) => v.id !== video.id));
    },
    [persistScheduled]
  );

  // ── Remove video from date ──────────────────────────────────────────────────
  const removeVideo = useCallback(
    (dateKey: string, videoId: string) => {
      setScheduled((prev) => {
        const existing = prev[dateKey] ?? [];
        const removed = existing.find((v) => v.id === videoId);
        const updated = existing.filter((v) => v.id !== videoId);
        const next = { ...prev };
        if (updated.length === 0) {
          delete next[dateKey];
        } else {
          next[dateKey] = updated;
        }
        persistScheduled(next);
        // Return removed video to unscheduled
        if (removed) {
          setUnscheduled((u) => [...u, removed]);
        }
        return next;
      });
    },
    [persistScheduled]
  );

  // ── Handle day click ────────────────────────────────────────────────────────
  const handleDayClick = useCallback(
    (dateKey: string) => {
      if (selectingVideoId) {
        const video = unscheduled.find((v) => v.id === selectingVideoId);
        if (video) {
          assignVideo(dateKey, video);
        }
        setSelectingVideoId(null);
      } else {
        setSelectedDate(dateKey);
        setAddingVideoId("");
      }
    },
    [selectingVideoId, unscheduled, assignVideo]
  );

  // ── Month navigation ────────────────────────────────────────────────────────
  const prevMonth = () =>
    setCurrentMonth(
      (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentMonth(
      (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)
    );
  const goToday = () =>
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));

  // ── Build calendar grid ─────────────────────────────────────────────────────
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = getDaysInMonth(year, month);
  const firstDow = dayOfWeekMon(days[0]);
  // Pad start
  const paddedDays: (Date | null)[] = [
    ...Array(firstDow).fill(null),
    ...days,
  ];
  // Pad end to complete last row
  while (paddedDays.length % 7 !== 0) paddedDays.push(null);

  const hasKanbanData = canalOptions.length > 0;

  // ── Modal video list ────────────────────────────────────────────────────────
  const modalVideos = selectedDate ? (scheduled[selectedDate] ?? []) : [];
  const unscheduledNotInModal = unscheduled.filter(
    (v) => !modalVideos.some((m) => m.id === v.id)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GlobalNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-400" />
            <span
              style={{
                background:
                  "linear-gradient(135deg, #a78bfa, #f472b6, #fb923c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Calendario de publicación
            </span>
          </h1>
          <p className="text-slate-400">
            Organiza y programa tus videos en el calendario mensual.
          </p>
        </div>

        {/* Empty state */}
        {!hasKanbanData && (
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              No tienes videos en el Kanban aún
            </h2>
            <p className="text-slate-400 mb-6">
              Primero crea un tablero Kanban con tus ideas y guiones para
              poder programarlos aquí.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/kanban"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
              >
                Ir al Kanban
              </Link>
              <Link
                href="/plan"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
              >
                Crear un plan
              </Link>
            </div>
          </div>
        )}

        {hasKanbanData && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── LEFT SIDEBAR ── */}
            <aside className="lg:w-1/3 space-y-4">
              {/* Canal selector */}
              {canalOptions.length > 1 && (
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
                  <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">
                    Canal
                  </label>
                  <select
                    value={selectedCanal}
                    onChange={(e) => setSelectedCanal(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    {canalOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Unscheduled videos */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-white text-sm">
                    📋 Videos sin programar
                  </h2>
                  <span className="bg-purple-600/30 text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full">
                    {filteredUnscheduled.length}
                  </span>
                </div>

                {filteredUnscheduled.length === 0 ? (
                  <div className="text-center py-6">
                    <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">
                      ✅ Todos los videos están programados
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {filteredUnscheduled.map((video) => (
                      <div
                        key={video.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          selectingVideoId === video.id
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/70"
                        }`}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${video.color}`}
                        />
                        <span className="flex-1 text-sm text-white truncate">
                          {video.titulo}
                        </span>
                        <button
                          onClick={() => {
                            if (selectingVideoId === video.id) {
                              setSelectingVideoId(null);
                            } else {
                              setSelectingVideoId(video.id);
                              setSelectedDate(null);
                            }
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors flex-shrink-0 ${
                            selectingVideoId === video.id
                              ? "bg-blue-600 text-white"
                              : "bg-slate-700 hover:bg-purple-600 text-slate-300 hover:text-white"
                          }`}
                        >
                          {selectingVideoId === video.id
                            ? "Cancelar"
                            : "Programar"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectingVideoId && (
                  <p className="mt-3 text-xs text-blue-400 text-center animate-pulse">
                    Haz clic en un día del calendario para asignar
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <Link
                    href="/kanban"
                    className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ir al Kanban
                  </Link>
                </div>
              </div>

              {/* Scheduled summary */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
                <h3 className="font-bold text-white text-sm mb-3">
                  📊 Resumen
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-purple-400">
                      {Object.values(scheduled).reduce(
                        (acc, arr) => acc + arr.length,
                        0
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Programados</p>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-pink-400">
                      {filteredUnscheduled.length}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Sin fecha</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── CALENDAR ── */}
            <main className="lg:w-2/3">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
                {/* Month header */}
                <div className="flex items-center justify-between mb-5">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black text-white">
                      {MONTHS_ES[month]} {year}
                    </h2>
                    <button
                      onClick={goToday}
                      className="text-xs px-3 py-1 rounded-full bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-colors font-semibold"
                    >
                      Hoy
                    </button>
                  </div>

                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Day of week headers */}
                <div className="grid grid-cols-7 mb-2">
                  {DAYS_ES.map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest py-1"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {paddedDays.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className="aspect-square" />;
                    }

                    const key = toDateKey(day);
                    const isToday = key === todayKey;
                    const isPast = day < today && !isToday;
                    const dayVideos = scheduled[key] ?? [];
                    const visible = dayVideos.slice(0, 2);
                    const overflow = dayVideos.length - 2;
                    const isSelecting = !!selectingVideoId;

                    return (
                      <div
                        key={key}
                        onClick={() => handleDayClick(key)}
                        className={`
                          aspect-square flex flex-col p-1.5 rounded-xl border transition-all cursor-pointer
                          ${isToday
                            ? "ring-2 ring-purple-500 border-purple-500/50 bg-purple-500/10"
                            : isPast
                            ? "border-slate-800 bg-slate-900/20 opacity-50"
                            : "border-slate-800 bg-slate-900/30 hover:bg-slate-800/50"
                          }
                          ${isSelecting && !isPast
                            ? "hover:border-blue-500 hover:ring-1 hover:ring-blue-500"
                            : ""
                          }
                          ${selectedDate === key
                            ? "ring-1 ring-pink-500 border-pink-500/50"
                            : ""
                          }
                        `}
                      >
                        <span
                          className={`text-xs font-bold leading-none mb-1 ${
                            isToday ? "text-purple-300" : isPast ? "text-slate-600" : "text-slate-300"
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                          {visible.map((v) => (
                            <div
                              key={v.id}
                              className="flex items-center gap-0.5 min-w-0"
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${v.color}`}
                              />
                              <span className="text-[9px] text-slate-300 truncate leading-tight">
                                {v.titulo}
                              </span>
                            </div>
                          ))}
                          {overflow > 0 && (
                            <span className="text-[9px] text-slate-500 leading-tight">
                              +{overflow} más
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </main>
          </div>
        )}
      </div>

      {/* ── ASSIGNMENT MODAL ── */}
      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDate(null);
          }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white">
                📅 {formatDateLabel(selectedDate)}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Assigned videos */}
              {modalVideos.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                    Videos asignados
                  </p>
                  {modalVideos.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50"
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${v.color}`}
                      />
                      <span className="flex-1 text-sm text-white truncate">
                        {v.titulo}
                      </span>
                      <button
                        onClick={() => removeVideo(selectedDate, v.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-2">
                  No hay videos asignados a este día.
                </p>
              )}

              {/* Add video section */}
              {unscheduledNotInModal.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                    Agregar video
                  </p>
                  <div className="flex gap-2">
                    <select
                      value={addingVideoId}
                      onChange={(e) => setAddingVideoId(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Seleccionar video…</option>
                      {unscheduledNotInModal.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.titulo}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const video = unscheduled.find(
                          (v) => v.id === addingVideoId
                        );
                        if (video && selectedDate) {
                          assignVideo(selectedDate, video);
                          setAddingVideoId("");
                        }
                      }}
                      disabled={!addingVideoId}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  </div>
                </div>
              )}

              {unscheduledNotInModal.length === 0 &&
                modalVideos.length === 0 && (
                  <p className="text-sm text-slate-500 text-center">
                    No hay videos disponibles para agregar.
                  </p>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function CalendarioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-slate-400 flex items-center gap-3">
            <Calendar className="w-5 h-5 animate-pulse text-purple-400" />
            <span>Cargando calendario…</span>
          </div>
        </div>
      }
    >
      <CalendarioInner />
    </Suspense>
  );
}
