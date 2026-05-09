import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

export type GuardadoTipo = "busqueda" | "plan" | "canal" | "miniatura";

export interface Guardado {
  id: string;
  user_id: string;
  tipo: GuardadoTipo;
  titulo: string;
  datos: Record<string, unknown>;
  created_at: string;
}
