"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setStatus("error");
        setMessage("Error verificando la sesión. Intenta iniciar sesión manualmente.");
        return;
      }

      if (data.session) {
        // If there's a provider_token, the user just connected via OAuth (YouTube)
        if (data.session.provider_token) {
          setStatus("success");
          setMessage("¡Canal conectado! Redirigiendo al dashboard...");
          setTimeout(() => router.push("/dashboard"), 1000);
        } else {
          setStatus("success");
          setMessage("¡Sesión iniciada! Redirigiendo...");
          setTimeout(() => router.push("/"), 1500);
        }
      } else {
        // Intentar leer el hash fragment (token de email)
        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
          setStatus("success");
          setMessage("¡Email verificado! Redirigiendo...");
          setTimeout(() => router.push("/"), 1500);
        } else {
          setStatus("error");
          setMessage("Link expirado o inválido. Ve a la página de login.");
          setTimeout(() => router.push("/login"), 2500);
        }
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-6 h-6 text-orange-500" />
        <span className="font-bold text-lg">ViralScope</span>
      </div>

      {status === "loading" && (
        <>
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
          <span className="text-white/60">Conectando tu canal...</span>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="w-12 h-12 text-green-400" />
          <p className="text-slate-200 font-semibold">{message}</p>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-slate-200 font-semibold">{message}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-2 text-sm text-violet-400 hover:text-violet-300 underline"
          >
            Ir al login
          </button>
        </>
      )}
    </div>
  );
}
