-- ══════════════════════════════════════════════════════════════════════════
--  Arko Studio — ingesta de leads automatizados (OpenClaw / ZonaProp)
--  Ejecutá este SQL en Supabase → SQL Editor → New query → Run.
--  Agrega columnas para guardar el link del aviso y datos estructurados del
--  scraping. No rompe nada existente (columnas opcionales).
-- ══════════════════════════════════════════════════════════════════════════

alter table public.leads add column if not exists url      text;   -- link del aviso en ZonaProp
alter table public.leads add column if not exists metadata jsonb;  -- datos estructurados (precio, score, imágenes, etc.)

-- Índice para no duplicar el mismo aviso si OpenClaw corre varias veces.
create unique index if not exists leads_url_unique
  on public.leads (url) where url is not null;
