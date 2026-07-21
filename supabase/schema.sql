-- ══════════════════════════════════════════════════════════════════════════
--  Arko Studio — esquema del hub de administración (Fase 1)
--  Ejecutá este SQL en Supabase → SQL Editor → New query → Run.
--  Crea las tablas de leads y producción, y las protege con RLS para que
--  SOLO usuarios logueados puedan leer/escribir.
-- ══════════════════════════════════════════════════════════════════════════

-- ── LEADS ────────────────────────────────────────────────────────────────
-- Consultas entrantes (del formulario de presupuesto o cargadas a mano).
create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  nombre       text not null,
  contacto     text,                        -- teléfono / email / whatsapp
  propiedad    text,                        -- descripción o dirección
  mensaje      text,
  fuente       text default 'web',          -- web | manual | instagram | referido
  estado       text not null default 'nuevo', -- nuevo | contactado | presupuestado | ganado | perdido
  notas        text
);

-- ── PRODUCCIÓN ───────────────────────────────────────────────────────────
-- Trabajos en curso y su estado.
create table if not exists public.producciones (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  propiedad     text not null,
  cliente       text,
  lead_id       uuid references public.leads(id) on delete set null,
  estado        text not null default 'agendado', -- agendado | filmado | edicion | entregado
  fecha_sesion  date,
  servicios     text[],                     -- ['foto','video','tour','dron']
  notas         text
);

-- ── Row Level Security ───────────────────────────────────────────────────
alter table public.leads        enable row level security;
alter table public.producciones enable row level security;

-- Solo usuarios autenticados pueden ver y operar. El público (anon) no toca nada.
drop policy if exists "leads_auth_all" on public.leads;
create policy "leads_auth_all" on public.leads
  for all to authenticated using (true) with check (true);

drop policy if exists "producciones_auth_all" on public.producciones;
create policy "producciones_auth_all" on public.producciones
  for all to authenticated using (true) with check (true);

-- ── (Opcional) Alta de leads desde el formulario público ─────────────────
-- Descomentá esto MÁS ADELANTE si querés que el formulario de la web cargue
-- leads automáticamente sin login. Permite solo INSERT al público, nada más.
-- create policy "leads_public_insert" on public.leads
--   for insert to anon with check (true);
