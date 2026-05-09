"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Mail, Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { user, signIn, signUp, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab]           = useState<"login" | "registro">("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  // Si ya está logueado, redirigir
  useEffect(() => {
    if (!loading && user) router.push("/");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (tab === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        setError(translateError(error));
      } else {
        const from = new URLSearchParams(window.location.search).get("from") || "/";
        router.push(from);
      }
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        setError(translateError(error));
      } else {
        setSuccess("¡Cuenta creada! Revisa tu correo para confirmar tu cuenta, luego inicia sesión.");
        setTab("login");
      }
    }
    setSubmitting(false);
  }

  function translateError(msg: string): string {
    if (msg.includes("Invalid login credentials")) return "Email o contraseña incorrectos";
    if (msg.includes("Email not confirmed")) return "Confirma tu correo antes de iniciar sesión";
    if (msg.includes("User already registered")) return "Ya existe una cuenta con ese email";
    if (msg.includes("Password should be")) return "La contraseña debe tener al menos 6 caracteres";
    if (msg.includes("Unable to validate")) return "Email inválido";
    return msg;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="font-bold text-lg tracking-tight">ViralScope</span>
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">ViralScope</h1>
            <p className="text-slate-400 text-sm mt-1">Tu herramienta de estrategia viral en YouTube</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            {/* Tabs */}
            <div className="flex bg-slate-900 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setTab("login"); setError(null); setSuccess(null); }}
                className={cn(
                  "flex-1 py-2 text-sm font-semibold rounded-lg transition-colors",
                  tab === "login" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => { setTab("registro"); setError(null); setSuccess(null); }}
                className={cn(
                  "flex-1 py-2 text-sm font-semibold rounded-lg transition-colors",
                  tab === "registro" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Crear cuenta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Benefits */}
              <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-violet-400 mb-2">Con tu cuenta accedes a:</p>
                <div className="space-y-1.5">
                  {["Mis Proyectos de canal", "Kanban de producción persistente", "Crear Canal con IA", "Guardar videos favoritos"].map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={tab === "registro" ? "Mínimo 6 caracteres" : "Tu contraseña"}
                    required
                    minLength={6}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-green-300 text-xs">{success}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{tab === "login" ? "Entrando..." : "Creando cuenta..."}</>
                ) : (
                  tab === "login" ? "Iniciar sesión" : "Crear cuenta gratis"
                )}
              </button>
            </form>

            {tab === "login" && (
              <p className="text-center text-xs text-slate-500 mt-4">
                ¿No tienes cuenta?{" "}
                <button onClick={() => setTab("registro")} className="text-violet-400 hover:text-violet-300">
                  Regístrate gratis
                </button>
              </p>
            )}
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            Al continuar aceptas guardar tus proyectos en la nube de forma segura.
          </p>
        </div>
      </div>
    </div>
  );
}
