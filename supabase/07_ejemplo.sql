-- ══════════════════════════════════════════════════════════════════════════
--  Arko Studio — Ficha de ejemplo configurable (/ejemplo)
--  Ejecutá en Supabase → SQL Editor → New query → Run. Idempotente.
--  Permite elegir desde el hub qué propiedad se muestra en /ejemplo, y cargar
--  los datos de la ficha (precio, ubicación, descripción, specs).
-- ══════════════════════════════════════════════════════════════════════════

alter table public.producciones add column if not exists es_ejemplo       boolean not null default false;
alter table public.producciones add column if not exists ficha_precio      text;
alter table public.producciones add column if not exists ficha_ubicacion   text;
alter table public.producciones add column if not exists ficha_descripcion text;
alter table public.producciones add column if not exists ficha_specs       text[];

-- Lectura pública: además de lo publicado, dejar leer la ficha de ejemplo
-- (aunque no esté en el portfolio público). Las columnas internas del CRM
-- siguen ocultas por los grants a nivel columna.
drop policy if exists "producciones_public_read" on public.producciones;
create policy "producciones_public_read" on public.producciones
  for select to anon using (publicado = true or es_ejemplo = true);

grant select (
  es_ejemplo, ficha_precio, ficha_ubicacion, ficha_descripcion, ficha_specs
) on public.producciones to anon;
