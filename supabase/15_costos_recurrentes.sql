-- Ejecutar después de 14_costos_servicios.sql. Vincula gastos existentes sin copiar importes.
begin;
create or replace function public.fin_validar_costos_servicio(p_costos jsonb) returns boolean
language plpgsql immutable set search_path=public as $$
declare c jsonb;
begin
 if jsonb_typeof(p_costos) <> 'array' or jsonb_array_length(p_costos)>100 then return false; end if;
 for c in select value from jsonb_array_elements(p_costos) loop
  if c ? 'recurrente_id' then
   if coalesce(c->>'recurrente_id','') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' or jsonb_typeof(c->'porcentaje') is distinct from 'number' then return false; end if;
   if (c->>'porcentaje')::numeric <= 0 or (c->>'porcentaje')::numeric > 100 then return false; end if;
   continue;
  end if;
  if jsonb_typeof(c) <> 'object' or coalesce(length(trim(c->>'nombre')),0) not between 1 and 200
   or coalesce(c->>'periodo','') not in ('trabajo','mensual','anual')
   or jsonb_typeof(c->'importe_usd') is distinct from 'number'
   or jsonb_typeof(c->'porcentaje') is distinct from 'number' then return false; end if;
  if (c->>'importe_usd')::numeric <= 0 or (c->>'importe_usd')::numeric > 999999999
   or (c->>'porcentaje')::numeric <= 0 or (c->>'porcentaje')::numeric > 100 then return false; end if;
 end loop;
 return true;
end $$;
create or replace function public.fin_validar_servicio_config() returns trigger
language plpgsql set search_path=public as $$
declare etapa text; minutos numeric; total numeric:=0; costo jsonb; asignado numeric;
begin
 foreach etapa in array array['preparacion','captura','edicion','entrega'] loop
  if jsonb_typeof(new.tiempos->etapa) is distinct from 'number' then raise exception 'Completá los tiempos de todas las tareas.'; end if;
  minutos:=(new.tiempos->>etapa)::numeric;
  if minutos<0 or minutos>100000 then raise exception 'Tiempo fuera de rango.'; end if;
  total:=total+minutos;
 end loop;
 if total<=0 then raise exception 'Ingresá tiempo para al menos una tarea.'; end if;
 if exists(select 1 from unnest(new.equipos) e(id) where e.id is null or not exists(select 1 from public.fin_equipos q where q.id=e.id)) then raise exception 'Uno de los equipos seleccionados ya no existe.'; end if;
 -- Serializa cambios de asignación para impedir sobreasignaciones concurrentes.
 perform pg_advisory_xact_lock(7342015);
 if not public.fin_validar_costos_servicio(new.costos) then raise exception 'Costos inválidos.'; end if;
 for costo in select value from jsonb_array_elements(new.costos) where value ? 'recurrente_id' loop
  if not exists(select 1 from fin_recurrentes where id=(costo->>'recurrente_id')::uuid) then raise exception 'El gasto recurrente no existe o no tenés acceso.'; end if;
  if (select count(*) from jsonb_array_elements(new.costos) c where c->>'recurrente_id'=costo->>'recurrente_id')>1 then raise exception 'El gasto recurrente está repetido en este servicio.'; end if;
  select coalesce(sum((c->>'porcentaje')::numeric),0) into asignado
   from fin_servicios_config s cross join lateral jsonb_array_elements(s.costos) c
   where s.servicio_id<>new.servicio_id and c->>'recurrente_id'=costo->>'recurrente_id';
  if asignado+(costo->>'porcentaje')::numeric>100 then raise exception 'El gasto recurrente supera el 100%% asignado entre servicios.'; end if;
 end loop;
 new.updated_at:=now();
 return new;
end $$;
commit;
