"use client";

import { useState, useRef, useCallback, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus, X, GripVertical, ChevronRight, Sparkles,
  Calendar, Hash, Link as LinkIcon, FileText, Save,
  Loader2, Check, Flame, Layout, Lightbulb,
} from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

// ─── Types ───────────────────────────────────────────────────────────────────

interface KanbanCard {
  id: string;
  titulo: string;
  keywords: string;
  hookReferencia: string;
  linkReferencia: string;
  guion: string;
  fechaInicio: string;
  fechaFin: string;
  notas: string;
}

interface KanbanColumn {
  id: string;
  label: string;
  color: string;
  dotColor: string;
  cards: KanbanCard[];
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "ideas",       label: "Ideas",       color: "border-yellow-500/30",  dotColor: "bg-yellow-400",  cards: [] },
  { id: "guion",       label: "Guión",       color: "border-blue-500/30",    dotColor: "bg-blue-400",    cards: [] },
  { id: "grabacion",   label: "Grabación",   color: "border-purple-500/30",  dotColor: "bg-purple-400",  cards: [] },
  { id: "edicion",     label: "Edición",     color: "border-orange-500/30",  dotColor: "bg-orange-400",  cards: [] },
  { id: "programado",  label: "Programado",  color: "border-cyan-500/30",    dotColor: "bg-cyan-400",    cards: [] },
  { id: "publicado",   label: "Publicado",   color: "border-green-500/30",   dotColor: "bg-green-400",   cards: [] },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Card Modal ───────────────────────────────────────────────────────────────

function CardModal({ card, onSave, onClose }: {
  card: Partial<KanbanCard>;
  onSave: (c: KanbanCard) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<KanbanCard>({
    id: card.id || uid(),
    titulo: card.titulo || "",
    keywords: card.keywords || "",
    hookReferencia: card.hookReferencia || "",
    linkReferencia: card.linkReferencia || "",
    guion: card.guion || "",
    fechaInicio: card.fechaInicio || "",
    fechaFin: card.fechaFin || "",
    notas: card.notas || "",
  });

  const set = (k: keyof KanbanCard) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <h3 className="font-bold text-white">
            {card.id ? "Editar tarjeta" : "Nueva tarjeta de video"}
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Título del video *</label>
            <input
              value={form.titulo}
              onChange={set("titulo")}
              placeholder="ej: 5 errores que arruinan tus finanzas personales"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3 h-3" /> Palabras clave
            </label>
            <input
              value={form.keywords}
              onChange={set("keywords")}
              placeholder="finanzas, dinero, ahorrar..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Hook */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-orange-400" /> Hook / Gancho de apertura
            </label>
            <textarea
              value={form.hookReferencia}
              onChange={set("hookReferencia")}
              rows={2}
              placeholder="El hook que captará la atención en los primeros 3 segundos..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>

          {/* Reference link */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-3 h-3" /> Video de referencia
            </label>
            <input
              value={form.linkReferencia}
              onChange={set("linkReferencia")}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Inicio edición
              </label>
              <input
                type="date"
                value={form.fechaInicio}
                onChange={set("fechaInicio")}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Fin edición
              </label>
              <input
                type="date"
                value={form.fechaFin}
                onChange={set("fechaFin")}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* Script */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Guión / Notas
            </label>
            <textarea
              value={form.guion}
              onChange={set("guion")}
              rows={4}
              placeholder="Pega o escribe el guión o notas del video aquí..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 px-5 py-4 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-semibold transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { if (form.titulo.trim()) onSave(form); }}
            disabled={!form.titulo.trim()}
            className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Column Component ──────────────────────────────────────────────────

function KanbanCol({
  col,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onDrop,
  onDragStart,
}: {
  col: KanbanColumn;
  onAddCard: (colId: string) => void;
  onEditCard: (colId: string, card: KanbanCard) => void;
  onDeleteCard: (colId: string, cardId: string) => void;
  onDrop: (targetColId: string, e: React.DragEvent) => void;
  onDragStart: (colId: string, cardId: string) => void;
}) {
  const [over, setOver] = useState(false);

  return (
    <div
      className={`flex flex-col min-w-[260px] w-[260px] bg-slate-900/60 border rounded-2xl transition-all ${col.color} ${over ? "border-violet-500/60 bg-violet-500/5" : ""}`}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { setOver(false); onDrop(col.id, e); }}
    >
      {/* Column header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
          <span className="font-bold text-sm text-white">{col.label}</span>
          <span className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">{col.cards.length}</span>
        </div>
        <button
          onClick={() => onAddCard(col.id)}
          className="p-1 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[100px]">
        {col.cards.map(card => (
          <div
            key={card.id}
            draggable
            onDragStart={() => onDragStart(col.id, card.id)}
            className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-3 cursor-grab active:cursor-grabbing group hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-black/30"
          >
            {/* Card header */}
            <div className="flex items-start gap-2 mb-2">
              <GripVertical className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5 group-hover:text-slate-500" />
              <p className="text-white text-xs font-semibold leading-snug flex-1 line-clamp-2">{card.titulo}</p>
            </div>

            {/* Card meta */}
            <div className="space-y-1.5 pl-5">
              {card.keywords && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Hash className="w-3 h-3" />
                  <span className="line-clamp-1">{card.keywords}</span>
                </div>
              )}
              {(card.fechaInicio || card.fechaFin) && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>{card.fechaInicio || "?"} → {card.fechaFin || "?"}</span>
                </div>
              )}
              {card.linkReferencia && (
                <a
                  href={card.linkReferencia}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span className="truncate max-w-[160px]">Ver referencia</span>
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-1 mt-2 pl-5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEditCard(col.id, card)}
                className="text-xs px-2 py-1 rounded-lg bg-slate-700 hover:bg-violet-600/40 text-slate-400 hover:text-violet-300 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => onDeleteCard(col.id, card.id)}
                className="text-xs px-2 py-1 rounded-lg bg-slate-700 hover:bg-red-600/40 text-slate-400 hover:text-red-300 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {col.cards.length === 0 && (
          <div
            onClick={() => onAddCard(col.id)}
            className="border-2 border-dashed border-slate-700/50 rounded-xl p-4 text-center text-slate-600 text-xs cursor-pointer hover:border-slate-600 hover:text-slate-500 transition-colors"
          >
            + Agregar idea
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Kanban Page ─────────────────────────────────────────────────────────

function KanbanContent() {
  const params = useSearchParams();
  const canalName = params.get("canal") || "Mi Canal";
  const nicho = params.get("nicho") || "";

  // Load columns synchronously from localStorage to avoid race conditions
  function loadColumnsFromStorage(canal: string): KanbanColumn[] {
    if (typeof window === "undefined") return DEFAULT_COLUMNS;
    try {
      const raw = localStorage.getItem(`kanban-${canal}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return DEFAULT_COLUMNS.map(def => {
            const found = parsed.find((p: KanbanColumn) => p.id === def.id);
            return found ? { ...def, cards: Array.isArray(found.cards) ? found.cards : [] } : def;
          });
        }
      }
    } catch {}
    return DEFAULT_COLUMNS;
  }

  const [columns, setColumns] = useState<KanbanColumn[]>(() => loadColumnsFromStorage(canalName));
  const [hydrated, setHydrated] = useState(false);
  const isFirstRender = useRef(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Partial<KanbanCard>>({});
  const [activeColId, setActiveColId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dragRef = useRef<{ colId: string; cardId: string } | null>(null);

  // Mark as hydrated on mount
  useEffect(() => {
    // Re-load from storage in case canalName changed after initial render
    setColumns(loadColumnsFromStorage(canalName));
    setHydrated(true);
  }, [canalName]);

  // ── localStorage: auto-save on columns change (skip first render) ─────────

  useEffect(() => {
    if (!hydrated) return;
    // Skip the auto-save triggered by the initial load to avoid overwriting data
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const key = `kanban-${canalName}`;
    try {
      localStorage.setItem(key, JSON.stringify(columns));
    } catch {}
  }, [columns, canalName, hydrated]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleAddCard = (colId: string) => {
    setActiveColId(colId);
    setEditingCard({});
    setModalOpen(true);
  };

  const handleEditCard = (colId: string, card: KanbanCard) => {
    setActiveColId(colId);
    setEditingCard(card);
    setModalOpen(true);
  };

  const handleSaveCard = useCallback((card: KanbanCard) => {
    setColumns(cols => cols.map(col => {
      if (col.id !== activeColId) return col;
      const exists = col.cards.find(c => c.id === card.id);
      if (exists) {
        return { ...col, cards: col.cards.map(c => c.id === card.id ? card : c) };
      }
      return { ...col, cards: [...col.cards, card] };
    }));
    setModalOpen(false);
    // Show saved flash
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [activeColId]);

  const handleDeleteCard = (colId: string, cardId: string) => {
    setColumns(cols => cols.map(col =>
      col.id === colId ? { ...col, cards: col.cards.filter(c => c.id !== cardId) } : col
    ));
  };

  const handleDragStart = (colId: string, cardId: string) => {
    dragRef.current = { colId, cardId };
  };

  const handleDrop = (targetColId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (!dragRef.current) return;
    const { colId: srcColId, cardId } = dragRef.current;
    if (srcColId === targetColId) return;

    setColumns(cols => {
      const srcCol = cols.find(c => c.id === srcColId);
      const card = srcCol?.cards.find(c => c.id === cardId);
      if (!card) return cols;
      return cols.map(col => {
        if (col.id === srcColId) return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
        if (col.id === targetColId) return { ...col, cards: [...col.cards, card] };
        return col;
      });
    });
    dragRef.current = null;
  };

  const handleLimpiar = () => {
    if (!window.confirm("¿Eliminar todas las tarjetas del tablero?")) return;
    const key = `kanban-${canalName}`;
    localStorage.removeItem(key);
    setColumns(DEFAULT_COLUMNS);
  };

  const totalCards = columns.reduce((acc, c) => acc + c.cards.length, 0);
  const publishedCount = columns.find(c => c.id === "publicado")?.cards.length ?? 0;

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />

      <main className="px-4 py-6">
        {/* Header */}
        <div className="max-w-[1600px] mx-auto mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/crear-canal" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Proyectos</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-slate-300 text-sm font-medium">{canalName}</span>
              </div>
              <h1 className="text-2xl font-black flex items-center gap-2">
                <Layout size={22} style={{ color: "#a78bfa" }} /> Planificador Kanban
                <span className="text-slate-500 font-normal text-lg ml-2">— {canalName}</span>
              </h1>
              {nicho && <p className="text-slate-500 text-sm mt-0.5">Nicho: {nicho}</p>}
            </div>

            <div className="flex items-center gap-3">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-white">{totalCards}</div>
                  <div className="text-slate-500 text-xs">videos</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-400">{publishedCount}</div>
                  <div className="text-slate-500 text-xs">publicados</div>
                </div>
              </div>

              {saved && (
                <div className="flex items-center gap-1.5 text-green-400 text-sm font-semibold">
                  <Check className="w-4 h-4" /> Guardado
                </div>
              )}

              {hydrated && (
                <div className="text-xs text-slate-600 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Auto-guardado
                </div>
              )}

              <button
                onClick={() => handleAddCard("ideas")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
              >
                <Plus className="w-4 h-4" /> Nueva idea
              </button>
              <button
                onClick={handleLimpiar}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-800 text-xs font-semibold transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Kanban board — horizontal scroll */}
        <div className="max-w-[1600px] mx-auto overflow-x-auto pb-8">
          <div className="flex gap-4 min-w-max">
            {columns.map(col => (
              <KanbanCol
                key={col.id}
                col={col}
                onAddCard={handleAddCard}
                onEditCard={handleEditCard}
                onDeleteCard={handleDeleteCard}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="max-w-[1600px] mx-auto text-center text-xs text-slate-600 mt-2">
          <span className="inline-flex items-center gap-1"><Lightbulb size={11} style={{ color: "#a78bfa" }} /> Arrastra las tarjetas entre columnas para actualizar el estado de producción</span>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <CardModal
          card={editingCard}
          onSave={handleSaveCard}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
    </ProtectedRoute>
  );
}

export default function KanbanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    }>
      <KanbanContent />
    </Suspense>
  );
}
