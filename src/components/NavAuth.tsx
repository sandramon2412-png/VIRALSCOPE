"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, ChevronDown, BookMarked, Loader2, Tv } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Credits {
  credits_remaining: number;
  plan: string;
}

export default function NavAuth() {
  const { user, loading, signOut, providerToken } = useAuth();
  const router = useRouter();
  const [open, setOpen]   = useState(false);
  const [exiting, setExiting] = useState(false);
  const [credits, setCredits] = useState<Credits | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/credits")
      .then(r => r.json())
      .then((data: Credits) => setCredits(data))
      .catch(() => {});
  }, [user]);

  async function handleSignOut() {
    setExiting(true);
    await signOut();
    setOpen(false);
    setExiting(false);
    router.push("/");
  }

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
      >
        <User className="w-3.5 h-3.5" />
        Entrar
      </Link>
    );
  }

  const initials = user.email?.slice(0, 2).toUpperCase() ?? "VS";
  const creditsRemaining = credits?.credits_remaining ?? null;
  const creditColor =
    creditsRemaining === null
      ? "text-slate-400"
      : creditsRemaining < 5
      ? "text-red-400"
      : creditsRemaining < 10
      ? "text-amber-400"
      : "text-violet-400";

  return (
    <div className="relative">
      <div className="flex items-center gap-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-2.5 py-1.5 transition-colors">
        {/* Avatar + email — click goes to /perfil */}
        <Link
          href="/perfil"
          className="flex items-center gap-2 focus:outline-none"
          title="Ver perfil"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
            {initials}
          </div>
          <span className="text-xs text-slate-300 max-w-[100px] truncate hidden sm:block">
            {user.email}
          </span>
        </Link>
        {/* Chevron — click toggles dropdown */}
        <button
          onClick={() => setOpen(v => !v)}
          className="ml-0.5 focus:outline-none"
          aria-label="Abrir menú"
        >
          <ChevronDown className={cn("w-3 h-3 text-slate-500 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-xs text-slate-500">Sesión iniciada como</p>
              <p className="text-sm text-slate-200 font-medium truncate">{user.email}</p>

              {/* Credit indicator */}
              <div className="flex items-center justify-between mt-2">
                <span className={cn("text-xs font-semibold", creditColor)}>
                  ⚡ {creditsRemaining !== null ? `${creditsRemaining} créditos` : "— créditos"}
                </span>
                <Link
                  href="/pricing"
                  onClick={() => setOpen(false)}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Ver planes →
                </Link>
              </div>

              {providerToken ? (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Canal conectado</span>
                </div>
              ) : (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 mt-1.5 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <Tv className="w-3 h-3" />
                  Conectar YouTube
                </Link>
              )}
            </div>
            <div className="p-1">
              <Link
                href="/perfil"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors"
              >
                <BookMarked className="w-4 h-4 text-violet-400" />
                Mis guardados
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors"
              >
                <Tv className="w-4 h-4 text-red-400" />
                Mi Canal
              </Link>
              <button
                onClick={handleSignOut}
                disabled={exiting}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {exiting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
