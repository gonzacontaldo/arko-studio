-- ══════════════════════════════════════════════════════════════════════════
--  Arko Studio — ingesta de leads automatizados (OpenClaw / ZonaProp)
--  Ejecutá este SQL en Supabase → SQL Editor → New query → Run.
--  Agrega columnas para guardar el link del aviso y datos estructurados del
--  scraping, y una constraint UNIQUE sobre url para deduplicar.
--  Es idempotente: se puede correr varias veces sin romper nada.
-- ══════════════════════════════════════════════════════════════════════════

alter table public.leads add column if not exists url      text;   -- link del aviso en ZonaProp
alter table public.leads add column if not exists metadata jsonb;  -- datos estructurados (precio, score, imágenes, etc.)

-- Deduplicación por url. Debe ser una CONSTRAINT UNIQUE (no un índice parcial):
-- PostgREST usa "ON CONFLICT (url)" sin predicado, así que un índice parcial
-- (WHERE url IS NOT NULL) NO sirve como árbitro. Una constraint UNIQUE sí, y
-- además permite múltiples filas con url NULL (leads cargados a mano).
drop index      if exists leads_url_unique;                          -- limpia el índice parcial viejo si existía
alter table public.leads drop constraint if exists leads_url_unique;
alter table public.leads add  constraint leads_url_unique unique (url);
