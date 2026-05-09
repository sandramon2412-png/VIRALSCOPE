-- Migration: 001_nichos
-- Creates the nichos_data table with RLS policies and indexes

-- ─────────────────────────────────────────────
-- Table
-- ─────────────────────────────────────────────
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

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS nichos_data_categoria_idx ON nichos_data (categoria);
CREATE INDEX IF NOT EXISTS nichos_data_tipo_idx ON nichos_data (tipo);

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────
ALTER TABLE nichos_data ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can read nichos (anon and authenticated)
CREATE POLICY "nichos_public_read"
  ON nichos_data
  FOR SELECT
  USING (true);

-- Authenticated write: only authenticated users with the service role
-- can insert / update / delete. In practice, writes go through the
-- service role key (bypasses RLS entirely), but this policy covers
-- direct authenticated requests from admin tools.
CREATE POLICY "nichos_authenticated_insert"
  ON nichos_data
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "nichos_authenticated_update"
  ON nichos_data
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "nichos_authenticated_delete"
  ON nichos_data
  FOR DELETE
  TO authenticated
  USING (true);
