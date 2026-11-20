-- Ejecutar después de 15_costos_recurrentes.sql.
-- El plazo es un objetivo de recuperación de capital, no una vida útil contable.
begin;
alter table public.fin_equipos add column if not exists recuperado_usd numeric(14,2) not null default 0;
do $$ begin
 if not exists(select 1 from pg_constraint where conname='fin_equipos_recuperado_valido' and conrelid='public.fin_equipos'::regclass) then
  alter table public.fin_equipos add constraint fin_equipos_recuperado_valido check(recuperado_usd>=0 and recuperado_usd<=valor_usd);
 end if;
end $$;
create table if not exists public.fin_recuperacion_config (
 id integer primary key check(id=1),
 plazo_meses integer not null check(plazo_meses between 1 and 600)
);
alter table public.fin_recuperacion_config enable row level security;
drop policy if exists fin_recuperacion_admin on public.fin_recuperacion_config;
create policy fin_recuperacion_admin on public.fin_recuperacion_config for all to authenticated using(public.com_is_admin()) with check(public.com_is_admin());
revoke all on public.fin_recuperacion_config from anon;
grant select,insert,update on public.fin_recuperacion_config to authenticated;
-- No se fija un plazo ni se declara inversión recuperada automáticamente.
commit;
