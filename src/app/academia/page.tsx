"use client";

import { useState, useEffect } from "react";
import { GraduationCap, BookOpen, Calendar } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";

interface Lesson {
  id: string;
  titulo: string;
  categoria: string;
  duracion: string;
  dificultad: string;
  desc: string;
  youtubeId: string;
}

const LESSONS: Lesson[] = [
  // Fundamentos
  { id: "1", titulo: "Cómo funciona el algoritmo de YouTube en 2026", categoria: "Fundamentos", duracion: "12:34", dificultad: "Principiante", desc: "Entiende exactamente cómo YouTube decide a quién mostrar tu video", youtubeId: "7R_W6m3cEQ0" },
  { id: "2", titulo: "Outlier Score: qué es y cómo usarlo", categoria: "Fundamentos", duracion: "8:20", dificultad: "Principiante", desc: "Aprende a identificar videos virales antes de que exploten", youtubeId: "3WpYBV6FqEI" },
  { id: "3", titulo: "Nichos más rentables en YouTube en español 2026", categoria: "Fundamentos", duracion: "15:45", dificultad: "Principiante", desc: "Los nichos con mayor RPM y menor competencia para hispanohablantes", youtubeId: "TGTazJHjPNk" },
  { id: "4", titulo: "Canales Faceless: la guía completa", categoria: "Fundamentos", duracion: "22:10", dificultad: "Principiante", desc: "Cómo crear un canal exitoso sin mostrar tu rostro", youtubeId: "hvSVMFP5vEs" },
  // Creación
  { id: "5", titulo: "Cómo escribir títulos que generan clics", categoria: "Creación", duracion: "10:15", dificultad: "Intermedio", desc: "Fórmulas psicológicas para títulos con CTR superior al 5%", youtubeId: "y6YNVXZZ0fQ" },
  { id: "6", titulo: "El hook perfecto: los primeros 30 segundos", categoria: "Creación", duracion: "14:30", dificultad: "Intermedio", desc: "Técnicas para retener al 70% de los espectadores en el hook", youtubeId: "7gGTjnvh0ug" },
  { id: "7", titulo: "Miniaturas que convierten: diseño para YouTube", categoria: "Creación", duracion: "18:20", dificultad: "Intermedio", desc: "Principios de diseño que aumentan el CTR de tu miniatura", youtubeId: "YrdEMSJE5cU" },
  { id: "8", titulo: "SEO para YouTube: posiciona tus videos", categoria: "Creación", duracion: "16:45", dificultad: "Intermedio", desc: "Tags, títulos y descripciones optimizados para el buscador", youtubeId: "FBtghFPXKE8" },
  { id: "9", titulo: "Guiones virales: estructura y retención", categoria: "Creación", duracion: "20:00", dificultad: "Avanzado", desc: "Cómo estructurar un guión que mantenga el 60%+ de retención", youtubeId: "sVqZBYONEA8" },
  // Monetización
  { id: "10", titulo: "Cómo monetizar tu canal: guía completa", categoria: "Monetización", duracion: "25:30", dificultad: "Principiante", desc: "Paso a paso para activar AdSense y las demás fuentes de ingreso", youtubeId: "7R_W6m3cEQ0" },
  { id: "11", titulo: "RPM vs CPM: qué significa y cómo aumentarlo", categoria: "Monetización", duracion: "11:20", dificultad: "Intermedio", desc: "Entiende tus métricas de monetización y cómo optimizarlas", youtubeId: "3WpYBV6FqEI" },
  { id: "12", titulo: "Patrocinios y brand deals: cómo conseguirlos", categoria: "Monetización", duracion: "19:15", dificultad: "Avanzado", desc: "Estrategias para conseguir patrocinadores desde 5K suscriptores", youtubeId: "TGTazJHjPNk" },
];

const TABS = ["Todos", "Fundamentos", "Creación", "Monetización"] as const;
type Tab = typeof TABS[number];

const DIFFICULTY_COLORS: Record<string, string> = {
  Principiante: "bg-green-500/20 text-green-400 border-green-500/30",
  Intermedio: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Avanzado: "bg-red-500/20 text-red-400 border-red-500/30",
};

const CATEGORY_COLORS: Record<string, string> = {
  Fundamentos: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Creación: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Monetización: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

function VideoCard({ lesson, completed, onToggleComplete }: {
  lesson: Lesson;
  completed: boolean;
  onToggleComplete: (id: string) => void;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`bg-slate-900/50 border rounded-2xl overflow-hidden flex flex-col transition-all hover:border-slate-600/60 ${
      completed ? "border-green-500/40" : "border-slate-700/50"
    }`}>
      {/* Video / Thumbnail */}
      <div className="relative aspect-video bg-slate-950 flex-shrink-0">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${lesson.youtubeId}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full group"
            aria-label={`Reproducir: ${lesson.titulo}`}
          >
            {/* Thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://img.youtube.com/vi/${lesson.youtubeId}/maxresdefault.jpg`}
              alt={lesson.titulo}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 ml-1 border-t-[9px] border-b-[9px] border-l-[16px] border-t-transparent border-b-transparent border-l-slate-900" />
              </div>
            </div>
          </button>
        )}

        {/* Completed badge */}
        {completed && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-md z-10">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[lesson.categoria] ?? "bg-slate-700 text-slate-300 border-slate-600"}`}>
            {lesson.categoria}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[lesson.dificultad] ?? "bg-slate-700 text-slate-300 border-slate-600"}`}>
            {lesson.dificultad}
          </span>
          <span className="text-[10px] text-slate-500 ml-auto">{lesson.duracion}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-100 leading-snug">{lesson.titulo}</h3>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed flex-1">{lesson.desc}</p>

        {/* Mark as complete */}
        <button
          onClick={() => onToggleComplete(lesson.id)}
          className={`mt-1 w-full text-xs font-medium py-1.5 rounded-lg border transition-colors ${
            completed
              ? "border-green-500/40 text-green-400 bg-green-500/10 hover:bg-green-500/20"
              : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300"
          }`}
        >
          {completed ? "✓ Completada" : "Marcar como completada"}
        </button>
      </div>
    </div>
  );
}

export default function AcademiaPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Todos");
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  // Load progress from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("academia_completed");
      if (stored) {
        setCompleted(new Set(JSON.parse(stored) as string[]));
      }
    } catch {
      // ignore
    }
  }, []);

  function toggleComplete(id: string) {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem("academia_completed", JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const filtered = activeTab === "Todos"
    ? LESSONS
    : LESSONS.filter(l => l.categoria === activeTab);

  const totalLessons = LESSONS.length;
  const completedCount = completed.size;
  const progressPct = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GlobalNav />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
            <GraduationCap size={36} style={{ color: "#a78bfa" }} /> Academia ViralScope
          </h1>
          <p className="text-slate-400 text-lg mb-6">
            Aprende a dominar YouTube con nuestros tutoriales paso a paso
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900 border border-slate-700/50 rounded-full px-4 py-1.5">
              <BookOpen size={14} style={{ color: "#a78bfa" }} />
              <span>15+ Lecciones gratuitas</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900 border border-slate-700/50 rounded-full px-4 py-1.5">
              <Calendar size={14} className="text-green-400" />
              <span>Actualizado 2026</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">
                {completedCount} de {totalLessons} lecciones completadas
              </span>
              <span className="text-sm font-bold text-violet-400">{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                activeTab === tab
                  ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/20"
                  : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {tab}
              <span className="ml-1.5 text-xs opacity-60">
                ({tab === "Todos" ? LESSONS.length : LESSONS.filter(l => l.categoria === tab).length})
              </span>
            </button>
          ))}
        </div>

        {/* Lessons grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(lesson => (
            <VideoCard
              key={lesson.id}
              lesson={lesson}
              completed={completed.has(lesson.id)}
              onToggleComplete={toggleComplete}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No hay lecciones en esta categoría.
          </div>
        )}
      </main>
    </div>
  );
}
