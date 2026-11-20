-- Ejecutar después de 09_commercial.sql. Inventario interno, valores históricos en USD.
begin;
create table if not exists public.fin_equipos (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 nombre text not null check (length(trim(nombre)) between 1 and 200),
 categoria text not null default 'otro' check (categoria in ('camara','lente','dron','soporte','almacenamiento','accesorio','otro')),
 valor_usd numeric(14,2) not null check (valor_usd > 0),
 fecha_compra date,
 servicios text[] not null default '{}',
 uso text not null default '' check (length(uso) <= 2000),
 notas text not null default '' check (length(notas) <= 2000),
 activo boolean not null default true
);
alter table public.fin_equipos enable row level security;
drop policy if exists fin_equipos_admin on public.fin_equipos;
create policy fin_equipos_admin on public.fin_equipos for all to authenticated
 using (public.com_is_admin()) with check (public.com_is_admin());
revoke all on public.fin_equipos from anon;
grant select, insert, update on public.fin_equipos to authenticated;
commit;
