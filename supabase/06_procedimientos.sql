-- ══════════════════════════════════════════════════════════════════════════
--  Arko Studio — Procedimientos / Guías (Fase 4)
--  Ejecutá en Supabase → SQL Editor → New query → Run. Idempotente.
--  Guarda el paso a paso (en markdown) de cada servicio. Una guía por servicio.
-- ══════════════════════════════════════════════════════════════════════════

create table if not exists public.procedimientos (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  categoria  text not null,           -- produccion | postproduccion
  servicio   text not null,           -- slug del servicio (ver src/admin/Procedimientos.jsx)
  titulo     text,
  contenido  text                     -- markdown
);

create unique index if not exists procedimientos_servicio_unique on public.procedimientos (servicio);

alter table public.procedimientos enable row level security;
drop policy if exists "procedimientos_auth_all" on public.procedimientos;
create policy "procedimientos_auth_all" on public.procedimientos
  for all to authenticated using (true) with check (true);
