"use client";

import { useState } from "react";
import { supabase, GuardadoTipo } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useGuardar() {
  const { user } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado]   = useState(false);

  async function guardar(
    tipo: GuardadoTipo,
    titulo: string,
    datos: Record<string, unknown>
  ): Promise<boolean> {
    if (!user) return false;

    setGuardando(true);
    const { error } = await supabase.from("guardados").insert({
      user_id: user.id,
      tipo,
      titulo,
      datos,
    });
    setGuardando(false);

    if (!error) {
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
      return true;
    }
    return false;
  }

  return { guardar, guardando, guardado, isLoggedIn: !!user };
}
