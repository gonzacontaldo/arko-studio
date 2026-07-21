-- ══════════════════════════════════════════════════════════════════════════
--  Arko Studio — Producción = Portfolio (Fase 2)
--  Ejecutá este SQL en Supabase → SQL Editor → New query → Run.
--  Extiende `producciones` con los campos del portfolio, habilita la lectura
--  pública SOLO de lo publicado (sin exponer datos internos del CRM) y crea
--  el bucket de Storage para las fotos. Idempotente.
-- ══════════════════════════════════════════════════════════════════════════

-- ── Campos de portfolio en producciones ──────────────────────────────────
alter table public.producciones add column if not exists titulo           text;
alter table public.producciones add column if not exists cover            text;   -- URL de la portada
alter table public.producciones add column if not exists fotos            text[]; -- URLs de las fotos
alter table public.producciones add column if not exists video_horizontal text;   -- YouTube ID
alter table public.producciones add column if not exists video_reel       text;   -- YouTube ID
alter table public.producciones add column if not exists video_vertical   text;   -- YouTube ID
alter table public.producciones add column if not exists video_fpv        text;   -- YouTube ID
alter table public.producciones add column if not exists tour_url         text;
alter table public.producciones add column if not exists es_dron          boolean not null default false; -- incluye tomas con dron (para el filtro)
alter table public.producciones add column if not exists destacado        boolean not null default false; -- aparece en la home
alter table public.producciones add column if not exists publicado        boolean not null default false; -- visible en el sitio público
alter table public.producciones add column if not exists orden            int;    -- orden manual (menor = primero)

-- ── Lectura pública segura ───────────────────────────────────────────────
-- El público (anon) solo puede LEER filas publicadas y SOLO las columnas del
-- portfolio (nunca cliente, notas, lead_id, etc.). Se hace con:
--   1) una policy RLS que filtra por publicado = true
--   2) grants a nivel columna (anon pierde acceso a las columnas internas)
drop policy if exists "producciones_public_read" on public.producciones;
create policy "producciones_public_read" on public.producciones
  for select to anon using (publicado = true);

revoke select on public.producciones from anon;
grant select (
  id, created_at, titulo, cover, fotos,
  video_horizontal, video_reel, video_vertical, video_fpv,
  tour_url, es_dron, destacado, publicado, orden
) on public.producciones to anon;

-- ── Storage: bucket público para las fotos ───────────────────────────────
insert into storage.buckets (id, name, public)
  values ('portfolio', 'portfolio', true)
  on conflict (id) do nothing;

-- Lectura pública + escritura/borrado solo para usuarios logueados.
drop policy if exists "portfolio_public_read"  on storage.objects;
drop policy if exists "portfolio_auth_insert"  on storage.objects;
drop policy if exists "portfolio_auth_update"  on storage.objects;
drop policy if exists "portfolio_auth_delete"  on storage.objects;

create policy "portfolio_public_read" on storage.objects
  for select to anon using (bucket_id = 'portfolio');
create policy "portfolio_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio');
create policy "portfolio_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio');
create policy "portfolio_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio');
