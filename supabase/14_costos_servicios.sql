-- Ejecutar después de 13_inventario.sql. Configuración interna; no modifica precios públicos.
begin;
create or replace function public.fin_validar_costos_servicio(p_costos jsonb) returns boolean
language plpgsql immutable set search_path=public as $$
declare c jsonb;
begin
 if jsonb_typeof(p_costos) <> 'array' or jsonb_array_length(p_costos)>100 then return false; end if;
 for c in select value from jsonb_array_elements(p_costos) loop
  if jsonb_typeof(c) <> 'object' or coalesce(length(trim(c->>'nombre')),0) not between 1 and 200
   or coalesce(c->>'periodo','') not in ('trabajo','mensual','anual')
   or jsonb_typeof(c->'importe_usd') is distinct from 'number'
   or jsonb_typeof(c->'porcentaje') is distinct from 'number' then return false; end if;
  if (c->>'importe_usd')::numeric <= 0 or (c->>'importe_usd')::numeric > 999999999
   or (c->>'porcentaje')::numeric <= 0 or (c->>'porcentaje')::numeric > 100 then return false; end if;
 end loop;
 return true;
end $$;
create table if not exists public.fin_servicios_config (
 servicio_id text primary key check(length(trim(servicio_id)) between 1 and 200),
 alcance text not null check(length(trim(alcance)) between 1 and 1000),
 tiempos jsonb not null check(jsonb_typeof(tiempos)='object'),
 valor_hora_usd numeric(12,2) not null check(valor_hora_usd>0),
 trabajos_mes integer not null check(trabajos_mes between 1 and 100000),
 costos jsonb not null default '[]' check(public.fin_validar_costos_servicio(costos)),
 equipos uuid[] not null default '{}',
 notas text not null default '' check(length(notas)<=2000),
 updated_at timestamptz not null default now()
);
create or replace function public.fin_validar_servicio_config() returns trigger
language plpgsql set search_path=public as $$
declare etapa text; minutos numeric; total numeric:=0;
begin
 foreach etapa in array array['preparacion','captura','edicion','entrega'] loop
  if jsonb_typeof(new.tiempos->etapa) is distinct from 'number' then raise exception 'Completá los tiempos de todas las tareas.'; end if;
  minutos:=(new.tiempos->>etapa)::numeric;
  if minutos<0 or minutos>100000 then raise exception 'Tiempo fuera de rango.'; end if;
  total:=total+minutos;
 end loop;
 if total<=0 then raise exception 'Ingresá tiempo para al menos una tarea.'; end if;
 if exists(select 1 from unnest(new.equipos) e(id) where e.id is null or not exists(select 1 from public.fin_equipos q where q.id=e.id)) then raise exception 'Uno de los equipos seleccionados ya no existe.'; end if;
 new.updated_at:=now();
 return new;
end $$;
drop trigger if exists fin_validar_servicio_config on public.fin_servicios_config;
create trigger fin_validar_servicio_config before insert or update on public.fin_servicios_config for each row execute function public.fin_validar_servicio_config();
alter table public.fin_servicios_config enable row level security;
drop policy if exists fin_servicios_config_admin on public.fin_servicios_config;
create policy fin_servicios_config_admin on public.fin_servicios_config for all to authenticated using(public.com_is_admin()) with check(public.com_is_admin());
revoke all on public.fin_servicios_config from anon;
grant select, insert, update on public.fin_servicios_config to authenticated;
commit;
