import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { nichos, Nicho } from "@/lib/nichos";

/*
-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS nichos_data (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT,
  rpm_min NUMERIC,
  rpm_max NUMERIC,
  ganancias_min NUMERIC,
  ganancias_max NUMERIC,
  competencia TEXT,
  tendencia TEXT,
  faceless BOOLEAN,
  idioma TEXT,
  keywords TEXT[],
  descripcion TEXT,
  ejemplo_canal TEXT,
  vistas_promedio TEXT,
  tipo TEXT,
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
*/

// Map camelCase Nicho fields to snake_case DB columns
function nichoToRow(n: Nicho) {
  return {
    id: n.id,
    nombre: n.nombre,
    categoria: n.categoria,
    rpm_min: n.rpmMin,
    rpm_max: n.rpmMax,
    ganancias_min: n.gananciasMin,
    ganancias_max: n.gananciasMax,
    competencia: n.competencia,
    tendencia: n.tendencia,
    faceless: n.faceless,
    idioma: n.idioma,
    keywords: n.keywords,
    descripcion: n.descripcion,
    ejemplo_canal: n.ejemploCanal,
    vistas_promedio: n.vistasPromedio,
    tipo: n.tipo,
    rank: n.rank ?? null,
    updated_at: new Date().toISOString(),
  };
}

// Map DB row back to Nicho shape
function rowToNicho(row: Record<string, unknown>): Nicho {
  return {
    id: row.id as string,
    nombre: row.nombre as string,
    categoria: row.categoria as string,
    rpmMin: row.rpm_min as number,
    rpmMax: row.rpm_max as number,
    gananciasMin: row.ganancias_min as number,
    gananciasMax: row.ganancias_max as number,
    competencia: row.competencia as Nicho["competencia"],
    tendencia: row.tendencia as Nicho["tendencia"],
    faceless: row.faceless as boolean,
    idioma: row.idioma as Nicho["idioma"],
    keywords: row.keywords as string[],
    descripcion: row.descripcion as string,
    ejemploCanal: row.ejemplo_canal as string,
    vistasPromedio: row.vistas_promedio as string,
    tipo: row.tipo as Nicho["tipo"],
    rank: row.rank != null ? (row.rank as number) : undefined,
  };
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnon) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnon);
      const { data, error } = await supabase
        .from("nichos_data")
        .select("*")
        .order("rank", { ascending: true, nullsFirst: false });

      if (!error && data && data.length > 0) {
        const mapped = (data as Record<string, unknown>[]).map(rowToNicho);
        return NextResponse.json({ nichos: mapped, source: "supabase" });
      }
    } catch {
      // Fall through to local
    }
  }

  return NextResponse.json({ nichos, source: "local" });
}

export async function POST(req: NextRequest) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 403 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SUPABASE_URL not configured" },
      { status: 500 }
    );
  }

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action !== "seed") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const rows = nichos.map(nichoToRow);

  const { error } = await supabaseAdmin
    .from("nichos_data")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, seeded: rows.length });
}
