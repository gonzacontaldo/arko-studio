-- ══════════════════════════════════════════════════════════════════════════
--  Arko Studio — Clientes + Agenda (Fase 3)
--  Ejecutá en Supabase → SQL Editor → New query → Run. Idempotente.
--  Crea la tabla de clientes y la conecta con producciones. La agenda no
--  necesita tabla propia: se arma con las fechas de sesión de producciones.
-- ══════════════════════════════════════════════════════════════════════════

create table if not exists public.clientes (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  nombre           text not null,                 -- dueño / persona de contacto
  empresa          text,                          -- inmobiliaria o constructora
  tipo             text not null default 'directo', -- directo | inmobiliaria | constructora
  contacto         text,                          -- tel / email / whatsapp
  origen           text,                          -- cómo se consiguió el contacto
  fecha_nacimiento date,                          -- para calcular edad + recordar cumpleaños
  notas            text
);

alter table public.clientes enable row level security;
drop policy if exists "clientes_auth_all" on public.clientes;
create policy "clientes_auth_all" on public.clientes
  for all to authenticated using (true) with check (true);

-- Conectar producciones con clientes.
alter table public.producciones
  add column if not exists cliente_id uuid references public.clientes(id) on delete set null;
