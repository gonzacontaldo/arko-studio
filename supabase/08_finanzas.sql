-- Finanzas de ARKO. Ejecutar después de schema.sql en Supabase → SQL Editor.
-- Idempotente. Importes originales y tipo de cambio quedan congelados por pago.
begin;
create table if not exists public.fin_categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(trim(nombre)) > 0),
  tipo text not null check (tipo in ('entrada','salida')),
  activa boolean not null default true,
  clave_inicial text unique,
  unique(nombre, tipo)
);
insert into public.fin_categorias(nombre,tipo,clave_inicial) values
('Producciones audiovisuales','entrada','producciones'),('Fotografía','entrada','fotografia'),
('Edición y postproducción','entrada','edicion'),('Otros ingresos','entrada','otros-ingresos'),
('Suscripciones y software','salida','suscripciones'),('Viáticos y transporte','salida','viaticos'),
('Equipos y accesorios','salida','equipos'),('Assets, música y licencias','salida','assets'),
('Colaboradores y honorarios','salida','colaboradores'),('Marketing y publicidad','salida','marketing'),
('Alquileres y espacios','salida','alquileres'),('Mantenimiento y reparaciones','salida','mantenimiento'),
('Servicios e internet','salida','servicios'),('Comisiones y cargos','salida','comisiones'),
('Impuestos y gestoría','salida','impuestos'),('Capacitación','salida','capacitacion'),
('Otros gastos','salida','otros-gastos') on conflict do nothing;

create table if not exists public.fin_cobros (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 cliente text not null check(length(trim(cliente)) > 0),
 descripcion text not null check(length(trim(descripcion)) > 0),
 fecha date not null,
 vencimiento date,
 total numeric(16,2) not null check(total > 0),
 categoria_id uuid not null references public.fin_categorias(id),
 check(vencimiento is null or vencimiento >= fecha)
);
create table if not exists public.fin_recurrentes (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 descripcion text not null check(length(trim(descripcion)) > 0),
 importe numeric(16,2) not null check(importe > 0),
 moneda text not null check(moneda in ('ARS','USD')),
 categoria_id uuid not null references public.fin_categorias(id),
 pagador text not null check(length(trim(pagador)) > 0),
 receptor text not null check(length(trim(receptor)) > 0),
 medio text not null check(medio in ('efectivo','mercado_pago','transferencia')),
 inicio date not null,
 frecuencia text not null check(frecuencia in ('mensual','anual')),
 cuotas integer check(cuotas between 1 and 1200),
 fin date,
 activa boolean not null default true,
 check(fin is null or fin >= inicio)
);
create table if not exists public.fin_movimientos (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 tipo text not null check(tipo in ('entrada','salida')),
 estado text not null check(estado in ('pendiente','pagado','anulado')),
 fecha date not null,
 vencimiento date,
 descripcion text not null check(length(trim(descripcion)) > 0),
 importe numeric(16,2) not null check(importe > 0),
 moneda text not null check(moneda in ('ARS','USD')),
 cotizacion numeric(16,4),
 importe_ars numeric(16,2) generated always as
   (case when moneda = 'ARS' then importe else round(importe * cotizacion,2) end) stored,
 categoria_id uuid not null references public.fin_categorias(id),
 pagador text not null check(length(trim(pagador)) > 0),
 receptor text not null check(length(trim(receptor)) > 0),
 medio text not null check(medio in ('efectivo','mercado_pago','transferencia')),
 cobro_id uuid references public.fin_cobros(id),
 recurrente_id uuid references public.fin_recurrentes(id),
 ocurrencia date,
 check(cotizacion is null or cotizacion > 0),
 check(moneda <> 'USD' or estado <> 'pagado' or cotizacion is not null),
 check(cobro_id is null or (tipo = 'entrada' and moneda = 'ARS')),
 check(recurrente_id is null or (tipo = 'salida' and ocurrencia is not null)),
 unique(recurrente_id, ocurrencia)
);
create index if not exists fin_movimientos_fecha_idx on public.fin_movimientos(fecha);
create index if not exists fin_movimientos_cobro_idx on public.fin_movimientos(cobro_id);

-- Serializa pagos de un mismo cliente para impedir sobrecobros simultáneos.
create or replace function public.fin_validar_movimiento() returns trigger
language plpgsql set search_path = public as $$
declare v_total numeric; v_pagado numeric; v_tipo text;
begin
 if TG_OP = 'DELETE' then
   raise exception 'Anulá el movimiento para conservar el historial.';
 end if;
 if TG_OP = 'UPDATE' and (new.cobro_id is distinct from old.cobro_id
   or new.recurrente_id is distinct from old.recurrente_id or new.ocurrencia is distinct from old.ocurrencia) then
   raise exception 'No se puede cambiar el origen de un movimiento.';
 end if;
 select tipo into v_tipo from fin_categorias where id = new.categoria_id;
 if v_tipo is distinct from new.tipo then raise exception 'La categoría no corresponde al tipo de movimiento.'; end if;
 if new.estado = 'pagado' and new.fecha > (now() at time zone 'America/Argentina/Buenos_Aires')::date then
   raise exception 'Los pagos futuros deben quedar pendientes.';
 end if;
 if new.cobro_id is not null then
   select total into v_total from fin_cobros where id = new.cobro_id for update;
   select coalesce(sum(importe_ars),0) into v_pagado from fin_movimientos
     where cobro_id = new.cobro_id and estado = 'pagado' and id <> new.id;
   if new.estado = 'pagado' and v_pagado + new.importe > v_total then
     raise exception 'El pago supera el saldo pendiente de esta cuenta.';
   end if;
 end if;
 return new;
end $$;
drop trigger if exists fin_validar_movimiento on public.fin_movimientos;
create trigger fin_validar_movimiento before insert or update or delete on public.fin_movimientos
for each row execute function public.fin_validar_movimiento();

create or replace function public.fin_validar_cobro() returns trigger
language plpgsql set search_path = public as $$
begin
 if not exists(select 1 from fin_categorias where id = new.categoria_id and tipo = 'entrada') then
   raise exception 'Elegí una categoría de entrada.';
 end if;
 if new.total < (select coalesce(sum(importe_ars),0) from fin_movimientos where cobro_id = new.id and estado = 'pagado') then
   raise exception 'El total no puede ser menor a lo ya cobrado.';
 end if;
 return new;
end $$;
drop trigger if exists fin_validar_cobro on public.fin_cobros;
create trigger fin_validar_cobro before insert or update on public.fin_cobros
for each row execute function public.fin_validar_cobro();

create or replace function public.fin_validar_categoria() returns trigger
language plpgsql set search_path = public as $$
begin
 if new.tipo <> old.tipo then raise exception 'El tipo de una categoría no se puede cambiar; creá otra categoría.'; end if;
 return new;
end $$;
drop trigger if exists fin_validar_categoria on public.fin_categorias;
create trigger fin_validar_categoria before update on public.fin_categorias
for each row execute function public.fin_validar_categoria();

create or replace function public.fin_validar_recurrente() returns trigger
language plpgsql set search_path = public as $$
begin
 if not exists(select 1 from fin_categorias where id = new.categoria_id and tipo = 'salida') then
   raise exception 'Elegí una categoría de salida.';
 end if;
 if TG_OP = 'UPDATE' and (new.inicio <> old.inicio or new.frecuencia <> old.frecuencia) then
   raise exception 'Para cambiar el calendario, pausá este gasto y creá uno nuevo.';
 end if;
 return new;
end $$;
drop trigger if exists fin_validar_recurrente on public.fin_recurrentes;
create trigger fin_validar_recurrente before insert or update on public.fin_recurrentes
for each row execute function public.fin_validar_recurrente();

-- Mantiene el día original: 31/ene → 28/feb → 31/mar. Febrero bisiesto incluido.
-- Se materializan pendientes hasta fin del mes actual al abrir Finanzas.
-- Recupera períodos pasados y nunca duplica una ocurrencia, incluso si fue anulada.
create or replace function public.fin_generar_pendientes() returns void
language plpgsql security invoker set search_path = public as $$
declare v_hoy date := (now() at time zone 'America/Argentina/Buenos_Aires')::date;
begin
 insert into fin_movimientos(tipo,estado,fecha,vencimiento,descripcion,importe,moneda,
   categoria_id,pagador,receptor,medio,recurrente_id,ocurrencia)
 select 'salida','pendiente',d.fecha,d.fecha,
   r.descripcion || case when r.cuotas is not null then ' · cuota ' || (n.i+1) || '/' || r.cuotas else '' end,
   r.importe,r.moneda,r.categoria_id,r.pagador,r.receptor,r.medio,r.id,d.fecha
 from fin_recurrentes r
 cross join lateral generate_series(0,
   least(coalesce(r.cuotas - 1,1200),
     greatest(0, (extract(year from age(v_hoy,r.inicio))::int * 12 + extract(month from age(v_hoy,r.inicio))::int + 1)
       / case when r.frecuencia = 'anual' then 12 else 1 end))) n(i)
 cross join lateral (select (r.inicio + make_interval(months => n.i * case when r.frecuencia = 'anual' then 12 else 1 end))::date as fecha) d
 where r.activa and d.fecha <= (date_trunc('month',v_hoy) + interval '1 month - 1 day')::date
   and (r.fin is null or d.fecha <= r.fin)
 on conflict(recurrente_id,ocurrencia) do nothing;
end $$;
revoke all on function public.fin_generar_pendientes() from public;
grant execute on function public.fin_generar_pendientes() to authenticated;

do $$ declare t text; begin
 foreach t in array array['fin_categorias','fin_cobros','fin_recurrentes','fin_movimientos'] loop
   execute format('alter table public.%I enable row level security',t);
   execute format('drop policy if exists fin_auth_all on public.%I',t);
   execute format('create policy fin_auth_all on public.%I for all to authenticated using (true) with check (true)',t);
   execute format('grant select, insert, update, delete on public.%I to authenticated',t);
   execute format('revoke all on public.%I from anon',t);
 end loop;
end $$;
commit;
