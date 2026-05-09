"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "viralscope-welcomed";

export default function WelcomeBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  // Avoid hydration mismatch — render nothing on server
  if (!mounted || !visible) return null;

  return (
    <div
      className="mx-4 mt-3 mb-1 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      style={{
        background: "rgba(15,12,28,0.80)",
        border: "1px solid rgba(139,92,246,0.30)",
        boxShadow: "0 4px 32px rgba(139,92,246,0.12)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Text block */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-white text-base leading-snug">
          🎉 ¡Bienvenido a ViralScope!
        </p>
        <p className="text-white/50 text-sm mt-0.5 leading-snug">
          La herramienta todo-en-uno para creadores de YouTube hispanohablantes.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/guia"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
          style={{
            background: "rgba(139,92,246,0.18)",
            border: "1px solid rgba(139,92,246,0.4)",
            color: "#c4b5fd",
          }}
          onClick={dismiss}
        >
          📖 Ver guía completa
        </Link>

        <Link
          href="/crear-canal"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
            boxShadow: "0 4px 16px rgba(139,92,246,0.35)",
          }}
          onClick={dismiss}
        >
          ✨ Crear mi primer canal
        </Link>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all text-lg font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}
