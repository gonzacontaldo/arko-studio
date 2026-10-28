-- ARKO Commercial: run after 08_finanzas.sql. Transactional and repeatable.
-- No public writes. Add your own auth.users UUID to com_admins after installation.
begin;
create table if not exists public.com_admins(user_id uuid primary key references auth.users(id) on delete cascade);
create or replace function public.com_is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from com_admins where user_id=auth.uid()) $$;
revoke all on function public.com_is_admin() from public;
grant execute on function public.com_is_admin() to authenticated,service_role;
create table if not exists public.com_settings(
 id integer primary key check(id=1), enabled boolean not null default false,
 emails_enabled boolean not null default false, payments_enabled boolean not null default false,
 auto_quote boolean not null default false, recovery_enabled boolean not null default false,
 deposit integer not null default 15000 check(deposit between 1 and 1000000),
 hold_hours integer not null default 72 check(hold_hours between 1 and 168),
 quote_days integer not null default 14 check(quote_days between 1 and 90),
 catalog jsonb not null default '{}', terms text not null default 'La reserva se descuenta del total. El día y horario se coordinan según el clima, la disponibilidad y el acceso a la propiedad. Consultanos las condiciones de reprogramación antes de reservar.',
 updated_at timestamptz not null default now()
);
insert into public.com_settings(id) values(1) on conflict do nothing;
create table if not exists public.com_quotes(
 id uuid primary key default gen_random_uuid(), request_key uuid not null unique,
 created_at timestamptz not null default now(), valid_until timestamptz not null,
 name text not null, email text not null, zone text not null, m2 numeric not null check(m2>0),
 timing text not null, message text not null default '', snapshot jsonb not null,
 total integer not null check(total>0), deposit integer not null check(deposit>0 and deposit<=total),
 terms text not null, approved_at timestamptz,
 stage text not null default 'pending_review' check(stage in ('pending_review','ready','reserved','confirmed','payment_review','closed')),
 paused boolean not null default false, unsubscribed boolean not null default false,
 is_test boolean not null default true, ip_hash text, notes text not null default '',
 lead_id uuid references public.leads(id), cliente_id uuid references public.clientes(id),
 produccion_id uuid references public.producciones(id), finance_id uuid references public.fin_cobros(id)
);
create index if not exists com_quotes_email_idx on public.com_quotes(email,created_at);
create index if not exists com_quotes_ip_idx on public.com_quotes(ip_hash,created_at);
create table if not exists public.com_weeks(
 week_start date primary key check(extract(isodow from week_start)=1),
 capacity integer not null check(capacity between 0 and 100), enabled boolean not null default true
);
create table if not exists public.com_reservations(
 id uuid primary key default gen_random_uuid(), quote_id uuid not null references public.com_quotes(id),
 week_start date not null references public.com_weeks(week_start), created_at timestamptz not null default now(),
 hold_until timestamptz not null, deposit integer not null check(deposit>0),
 status text not null default 'held' check(status in ('held','expired','confirmed','payment_review','cancelled')),
 preference_id text, checkout_url text, primary_payment_id text,
 checkout_lock_until timestamptz, checkout_attempt uuid
);
create index if not exists com_reservation_week_idx on public.com_reservations(week_start,status,hold_until);
create unique index if not exists com_reservation_active_quote_idx on public.com_reservations(quote_id) where status in ('held','confirmed','payment_review');
create table if not exists public.com_payments(
 id text primary key, reservation_id uuid not null references public.com_reservations(id),
 status text not null, amount numeric not null, currency text not null, is_test boolean not null,
 updated_at timestamptz not null default now(), review boolean not null default false,
 finance_movement_id uuid references public.fin_movimientos(id)
);
create table if not exists public.com_templates(
 key text primary key, title text not null, subject text not null, body text not null,
 draft_subject text, draft_body text, enabled boolean not null default true, updated_at timestamptz not null default now()
);
create table if not exists public.com_events(
 id bigint generated always as identity primary key, quote_id uuid references public.com_quotes(id),
 created_at timestamptz not null default now(), kind text not null, detail jsonb not null default '{}'
);
create table if not exists public.com_jobs(
 id uuid primary key default gen_random_uuid(), quote_id uuid not null references public.com_quotes(id),
 reservation_id uuid references public.com_reservations(id), template_key text not null references public.com_templates(key),
 dedupe_key text not null unique, due_at timestamptz not null, status text not null default 'pending'
 check(status in ('pending','processing','sent','cancelled','failed','uncertain')),
 attempts integer not null default 0, claim_id uuid, claimed_at timestamptz,
 sent_at timestamptz, provider_id text, last_error text, rendered_subject text, rendered_body text
);
create index if not exists com_jobs_due_idx on public.com_jobs(status,due_at);
insert into public.com_templates(key,title,subject,body) values
('quote','Presupuesto','Tu presupuesto ARKO [{codigo}]',E'Hola, {nombre}.\n\nEncontrarás adjunto tu presupuesto formal de ARKO Studio.\n\nPara elegir tu semana de producción y reservar la fecha, hacé clic en el botón de abajo.\n\nSaludos,\nARKO Studio'),
('choose_week','Elegir semana','¿Elegimos tu semana de producción? [{codigo}]',E'Hola, {nombre}. ¿Pudiste revisar tu propuesta? Podés elegir una semana disponible acá:\n{enlace}\n\nSi tenés una duda, respondé este correo.\n\nPara detener los recordatorios:\n{baja}'),
('hold','Cupo retenido','Guardamos tu cupo de producción [{codigo}]',E'Hola, {nombre}. Retuvimos un cupo para la semana {semana} hasta {vencimiento}.\n\nConfirmalo abonando la reserva de {reserva}:\n{enlace}\n\nEl día exacto se coordina según el clima y el acceso a la propiedad.'),
('reminder','Recordatorio de pago','Tu cupo sigue pendiente de confirmación [{codigo}]',E'Hola, {nombre}. Tu cupo para la semana {semana} está retenido hasta {vencimiento}.\n\nPodés confirmar tu reserva de {reserva} desde acá:\n{enlace}\n\nSi ya pagaste, estamos verificando el estado. Podés responder este mail para consultarnos.\n\nDetener recordatorios:\n{baja}'),
('expired','Retención vencida','Podés volver a consultar disponibilidad [{codigo}]',E'Hola, {nombre}. Venció el plazo de retención y liberamos el cupo. Si querés retomar, revisá la disponibilidad actual desde tu propuesta:\n{enlace}\n\nDetener recordatorios:\n{baja}'),
('confirmed','Reserva confirmada','Tu reserva está confirmada [{codigo}]',E'Hola, {nombre}. Recibimos tu reserva de {reserva} y confirmamos un cupo para la semana {semana}.\n\n{detalle}\nTotal: {total}\nSaldo pendiente: {saldo}. Coordinaremos el día y horario según el clima y el acceso a la propiedad.\n\nPodés ver el resumen acá:\n{enlace}'),
('recovery','Recuperar interés','¿Retomamos la producción? [{codigo}]',E'Hola, {nombre}. ¿Seguís pensando en hacer la producción de la propiedad en {zona}?\n\nPodés revisar tu propuesta y la disponibilidad desde acá:\n{enlace}\n\nDetener recordatorios:\n{baja}') on conflict(key) do nothing;

create or replace function public.com_queue(p_quote uuid,p_template text,p_due timestamptz,p_dedupe text,p_reservation uuid default null) returns void language sql security definer set search_path=public as $$
 insert into com_jobs(quote_id,template_key,due_at,dedupe_key,reservation_id) values(p_quote,p_template,p_due,p_dedupe,p_reservation) on conflict(dedupe_key) do nothing;
$$;
create or replace function public.com_create_quote(p_id uuid,p_request_key uuid,p_data jsonb,p_ip text,p_test boolean) returns jsonb language plpgsql security definer set search_path=public as $$
declare s com_settings; q com_quotes; lead uuid;
begin
 perform pg_advisory_xact_lock(hashtext('arko_commercial'));
 select * into q from com_quotes where request_key=p_request_key;
 if found then
  if q.email<>p_data->>'email' then raise exception 'FLOW:La solicitud ya fue utilizada.'; end if;
  return jsonb_build_object('id',q.id,'stage',q.stage);
 end if;
 select * into s from com_settings where id=1;
 if not p_test and not s.enabled then raise exception 'FLOW:Las consultas automáticas todavía no están habilitadas.'; end if;
 if (select count(*) from com_quotes where email=p_data->>'email' and created_at>now()-interval '1 day')>=3 or
 (select count(*) from com_quotes where ip_hash=p_ip and created_at>now()-interval '1 hour')>=10 then raise exception 'FLOW:Ya recibimos tus consultas. Esperá antes de enviar otra.'; end if;
 if not p_test then insert into leads(nombre,contacto,propiedad,mensaje,fuente,estado) values(p_data->>'name',p_data->>'email',p_data->>'zone',p_data->>'message','web','nuevo') returning id into lead; end if;
 insert into com_quotes(id,request_key,valid_until,name,email,zone,m2,timing,message,snapshot,total,deposit,terms,approved_at,stage,is_test,ip_hash,lead_id)
 values(p_id,p_request_key,now()+make_interval(days=>s.quote_days),p_data->>'name',p_data->>'email',p_data->>'zone',(p_data->>'m2')::numeric,p_data->>'timing',p_data->>'message',p_data->'snapshot',(p_data#>>'{snapshot,total}')::integer,s.deposit,s.terms,case when s.auto_quote then now() end,case when s.auto_quote then 'ready' else 'pending_review' end,p_test,p_ip,lead) returning * into q;
 if s.auto_quote then
  perform com_queue(q.id,'quote',now(),q.id||':quote');
  perform com_queue(q.id,'choose_week',now()+interval '24 hours',q.id||':choose');
 end if;
 insert into com_events(quote_id,kind) values(q.id,'request_received');
 return jsonb_build_object('id',q.id,'stage',q.stage);
end $$;
create or replace function public.com_hold(p_quote uuid,p_week date) returns jsonb language plpgsql security definer set search_path=public as $$
declare q com_quotes; w com_weeks; r com_reservations; s com_settings; used integer;
begin
 perform pg_advisory_xact_lock(hashtext('arko_commercial'));
 select * into q from com_quotes where id=p_quote for update;
 if not found or q.approved_at is null or q.valid_until<=now() or q.stage not in ('ready','reserved') then raise exception 'FLOW:La propuesta necesita revisión o ya venció. Contactanos.'; end if;
 select * into r from com_reservations where quote_id=q.id and status in ('held','confirmed','payment_review');
 if found then
  if r.status='held' and r.hold_until>now() then
   if r.week_start<>p_week then raise exception 'FLOW:Ya tenés un cupo retenido. Contactanos para cambiarlo.'; end if;
   return to_jsonb(r);
  elsif r.status<>'held' then raise exception 'FLOW:Tu reserva ya fue procesada.';
  else update com_reservations set status='expired' where id=r.id; end if;
 end if;
 select * into w from com_weeks where week_start=p_week and enabled for update;
 if not found or p_week<((now() at time zone 'America/Argentina/Buenos_Aires')::date - (extract(isodow from now() at time zone 'America/Argentina/Buenos_Aires')::integer-1)) then raise exception 'FLOW:Esta semana no está disponible.'; end if;
 select count(*) into used from com_reservations where week_start=p_week and quote_id in (select id from com_quotes where is_test=q.is_test) and (status='confirmed' or (status='held' and hold_until>now()));
 if used>=w.capacity then raise exception 'FLOW:Se completaron los cupos de esta semana.'; end if;
 select * into s from com_settings where id=1;
 insert into com_reservations(quote_id,week_start,hold_until,deposit) values(q.id,p_week,least(now()+make_interval(hours=>s.hold_hours),q.valid_until),q.deposit) returning * into r;
 update com_quotes set stage='reserved' where id=q.id;
 update com_jobs set status='cancelled' where quote_id=q.id and status='pending' and template_key<>'quote';
 perform com_queue(q.id,'hold',now(),r.id||':hold',r.id);
 if r.hold_until>now()+interval '24 hours' then perform com_queue(q.id,'reminder',now()+interval '24 hours',r.id||':24',r.id); end if;
 if r.hold_until>now()+interval '48 hours' then perform com_queue(q.id,'reminder',now()+interval '48 hours',r.id||':48',r.id); end if;
 if r.hold_until>=now()+interval '12 hours' then perform com_queue(q.id,'reminder',r.hold_until-interval '3 hours',r.id||':last',r.id); end if;
 insert into com_events(quote_id,kind,detail) values(q.id,'week_held',jsonb_build_object('week',p_week,'until',r.hold_until));
 return to_jsonb(r);
end $$;

drop function if exists public.com_expire();
create or replace function public.com_expire(p_test boolean) returns integer language plpgsql security definer set search_path=public as $$
declare r com_reservations; n integer:=0; s com_settings;
begin
 perform pg_advisory_xact_lock(hashtext('arko_commercial'));
 select * into s from com_settings where id=1;
 for r in select r1.* from com_reservations r1 join com_quotes q1 on q1.id=r1.quote_id where r1.status='held' and r1.hold_until<=now() and q1.is_test=p_test for update of r1 loop
  update com_reservations set status='expired' where id=r.id;
  update com_quotes set stage='ready' where id=r.quote_id and stage='reserved';
  update com_jobs set status='cancelled' where reservation_id=r.id and status='pending';
  perform com_queue(r.quote_id,'expired',now(),r.id||':expired',r.id);
  if s.recovery_enabled then
   perform com_queue(r.quote_id,'recovery',now()+interval '7 days',r.id||':recover7',r.id);
   perform com_queue(r.quote_id,'recovery',now()+interval '21 days',r.id||':recover21',r.id);
  end if;
  insert into com_events(quote_id,kind) values(r.quote_id,'hold_expired'); n:=n+1;
 end loop;
 -- A crashed process may already have submitted its email. Never blindly resend it.
 update com_jobs set status='uncertain',last_error='Worker interrumpido: comprobar en Zoho antes de reenviar.' where status='processing' and claimed_at<now()-interval '10 minutes';
 return n;
end $$;
drop function if exists public.com_claim_job();
create or replace function public.com_claim_job(p_test boolean) returns jsonb language plpgsql security definer set search_path=public as $$
declare j com_jobs;
begin
 perform pg_advisory_xact_lock(hashtext('arko_commercial_jobs'));
 select * into j from com_jobs j1 where status='pending' and due_at<=now() and exists(select 1 from com_quotes q1 where q1.id=j1.quote_id and q1.is_test=p_test) and not exists(select 1 from com_jobs j2 where j2.quote_id=j1.quote_id and j2.status='processing') order by due_at for update skip locked limit 1;
 if not found then return null; end if;
 update com_jobs set status='processing',attempts=attempts+1,claimed_at=now(),claim_id=gen_random_uuid() where id=j.id returning * into j;
 return to_jsonb(j);
end $$;
create or replace function public.com_apply_payment(p_payment jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare r com_reservations; q com_quotes; existing com_payments; pid text:=p_payment->>'id'; st text:=p_payment->>'status'; cat uuid; movement uuid; customer uuid; production uuid; bill uuid; occupied integer; can_confirm boolean;
begin
 perform pg_advisory_xact_lock(hashtext('arko_commercial'));
 select * into r from com_reservations where id=(p_payment->>'reservation_id')::uuid for update;
 if not found then raise exception 'FLOW:Reserva inexistente.'; end if;
 select * into q from com_quotes where id=r.quote_id for update;
 if (p_payment->>'amount')::numeric<>r.deposit or p_payment->>'currency'<>'ARS' or (p_payment->>'is_test')::boolean<>q.is_test then raise exception 'FLOW:El pago no coincide con la reserva.'; end if;
 select * into existing from com_payments where id=pid;
 if found and existing.reservation_id<>r.id then raise exception 'FLOW:El pago pertenece a otra reserva.'; end if;
 if existing.status=st and (existing.review or (r.primary_payment_id=pid and r.status='confirmed' and st='approved')) then return jsonb_build_object('status',r.status,'duplicate',true); end if;
 insert into com_payments(id,reservation_id,status,amount,currency,is_test) values(pid,r.id,st,r.deposit,'ARS',q.is_test)
 on conflict(id) do update set status=excluded.status,updated_at=now();
 if st='approved' then
  select count(*) into occupied from com_reservations where week_start=r.week_start and id<>r.id and quote_id in (select id from com_quotes where is_test=q.is_test) and (status='confirmed' or (status='held' and hold_until>now()));
  can_confirm:=coalesce(r.status in ('held','expired') and r.primary_payment_id is null and (p_payment->>'approved_at')::timestamptz<=r.hold_until and occupied<(select capacity from com_weeks where week_start=r.week_start and enabled),false);
  if can_confirm and not q.is_test then
   select id into customer from clientes where lower(contacto)=q.email order by created_at limit 1;
   if customer is null then insert into clientes(nombre,contacto,origen) values(q.name,q.email,'web') returning id into customer; end if;
   insert into producciones(propiedad,cliente,cliente_id,lead_id,estado,servicios,notas) values(q.zone,q.name,customer,q.lead_id,'agendado',array(select jsonb_array_elements_text(q.snapshot->'services')),'Semana solicitada: '||r.week_start||'. Día por coordinar. Presupuesto '||q.id) returning id into production;
   select id into cat from fin_categorias where clave_inicial='producciones';
   insert into fin_cobros(cliente,descripcion,fecha,total,categoria_id) values(q.name,'Producción ARKO '||q.id,(now() at time zone 'America/Argentina/Buenos_Aires')::date,q.total,cat) returning id into bill;
  end if;
  if existing.finance_movement_id is null and not q.is_test then
   select id into cat from fin_categorias where clave_inicial='producciones';
   insert into fin_movimientos(tipo,estado,fecha,descripcion,importe,moneda,categoria_id,pagador,receptor,medio,cobro_id)
   values('entrada','pagado',(now() at time zone 'America/Argentina/Buenos_Aires')::date,'Reserva ARKO '||q.id||' / MP '||pid,r.deposit,'ARS',cat,q.name,'ARKO Studio','mercado_pago',bill) returning id into movement;
   update com_payments set finance_movement_id=movement where id=pid;
  end if;
  if can_confirm then
   update com_reservations set status='confirmed',primary_payment_id=pid where id=r.id;
   update com_quotes set stage='confirmed',cliente_id=customer,produccion_id=production,finance_id=bill where id=q.id;
   update com_jobs set status='cancelled' where quote_id=q.id and status='pending' and template_key<>'quote';
   perform com_queue(q.id,'confirmed',now(),r.id||':confirmed',r.id);
   insert into com_events(quote_id,kind,detail) values(q.id,'payment_confirmed',jsonb_build_object('payment_id',pid));
  else
   update com_payments set review=true where id=pid;
   if r.status<>'confirmed' then update com_reservations set status='payment_review' where id=r.id; end if;
   update com_quotes set stage=case when stage='confirmed' then stage else 'payment_review' end,paused=true where id=q.id;
   update com_jobs set status='cancelled' where quote_id=q.id and status='pending' and template_key<>'quote';
   insert into com_events(quote_id,kind,detail) values(q.id,'payment_needs_review',jsonb_build_object('payment_id',pid));
  end if;
 elsif st in ('refunded','charged_back','cancelled') and r.primary_payment_id=pid then
  update com_payments set review=true where id=pid;
  update com_quotes set paused=true where id=q.id;
  insert into com_events(quote_id,kind,detail) values(q.id,'payment_reversed_review',jsonb_build_object('payment_id',pid,'status',st));
 end if;
 return jsonb_build_object('status',(select status from com_reservations where id=r.id));
end $$;


-- RLS: read access only for explicitly enrolled administrators. Mutations go through the API.
do $$ declare t text; begin
 foreach t in array array['com_admins','com_settings','com_quotes','com_weeks','com_reservations','com_payments','com_templates','com_jobs','com_events'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('drop policy if exists com_admin_read on public.%I',t);
  execute format('create policy com_admin_read on public.%I for select to authenticated using (public.com_is_admin())',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
-- Never expose privileged transition functions as public RPCs.
do $$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('com_queue','com_create_quote','com_hold','com_expire','com_claim_job','com_apply_payment') loop
  execute format('revoke all on function %s from public,anon,authenticated',f.signature);
  execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;
-- Then enroll ONLY your admin user (copy its UUID from Supabase Authentication → Users):
-- insert into public.com_admins(user_id) values ('YOUR-ADMIN-USER-UUID') on conflict do nothing;
-- Administrative changes are atomic and audited. Called only by the server after JWT verification.
create or replace function public.com_admin_action(p_action text,p_id uuid,p_data jsonb,p_actor uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare q com_quotes; r com_reservations; w date; used integer; result jsonb;
begin
 if not exists(select 1 from com_admins where user_id=p_actor) then raise exception 'FLOW:Administrador no autorizado.'; end if;
 perform pg_advisory_xact_lock(hashtext('arko_commercial'));
 if p_action='week' then
  w:=(p_data->>'week_start')::date;
  select count(*) into used from com_reservations where week_start=w and (status='confirmed' or (status='held' and hold_until>now()));
  if (p_data->>'capacity')::integer<used then raise exception 'FLOW:La capacidad no puede ser menor a los cupos ocupados.'; end if;
  insert into com_weeks(week_start,capacity,enabled) values(w,(p_data->>'capacity')::integer,(p_data->>'enabled')::boolean)
  on conflict(week_start) do update set capacity=excluded.capacity,enabled=excluded.enabled;
 elsif p_action='settings' then
  update com_settings set enabled=(p_data->>'enabled')::boolean,emails_enabled=(p_data->>'emails_enabled')::boolean,
  payments_enabled=(p_data->>'payments_enabled')::boolean,auto_quote=(p_data->>'auto_quote')::boolean,recovery_enabled=(p_data->>'recovery_enabled')::boolean,
  deposit=(p_data->>'deposit')::integer,hold_hours=(p_data->>'hold_hours')::integer,quote_days=(p_data->>'quote_days')::integer,
  catalog=p_data->'catalog',terms=p_data->>'terms',updated_at=now() where id=1;
 elsif p_action in ('template_draft','template_publish','template_toggle') then
  if p_action='template_toggle' then update com_templates set enabled=(p_data->>'enabled')::boolean where key=p_data->>'key';
  elsif p_action='template_draft' then update com_templates set draft_subject=p_data->>'subject',draft_body=p_data->>'body' where key=p_data->>'key';
  else update com_templates set subject=coalesce(draft_subject,subject),body=coalesce(draft_body,body),draft_subject=null,draft_body=null,enabled=(p_data->>'enabled')::boolean,updated_at=now() where key=p_data->>'key'; end if;
 elsif p_action='retry_job' then
  update com_jobs set status='pending',due_at=now(),claim_id=null,claimed_at=null,last_error=null where id=p_id and status in ('failed','uncertain');
 else
  select * into q from com_quotes where id=p_id for update;
  if not found then raise exception 'FLOW:Consulta inexistente.'; end if;
  if p_action='approve' then
   if q.stage<>'pending_review' then raise exception 'FLOW:La consulta ya fue procesada.'; end if;
   update com_quotes set approved_at=now(),stage='ready',valid_until=now()+make_interval(days=>(select quote_days from com_settings where id=1)) where id=q.id;
   update leads set estado='presupuestado' where id=q.lead_id;
   perform com_queue(q.id,'quote',now(),q.id||':quote');
   perform com_queue(q.id,'choose_week',now()+interval '24 hours',q.id||':choose');
  elsif p_action='pause' then update com_quotes set paused=(p_data->>'paused')::boolean where id=q.id;
  elsif p_action='notes' then update com_quotes set notes=p_data->>'notes' where id=q.id;
  elsif p_action='close' then
   if exists(select 1 from com_reservations where quote_id=q.id and status in ('confirmed','payment_review')) then raise exception 'FLOW:Esta consulta tiene un pago o una reserva confirmada. Revisala antes de cancelarla.'; end if;
   update com_quotes set stage='closed',paused=true where id=q.id;
   update com_reservations set status='cancelled' where quote_id=q.id and status='held';
   update com_jobs set status='cancelled' where quote_id=q.id and status='pending' and template_key<>'quote';
  else raise exception 'FLOW:Acción desconocida.'; end if;
 end if;
 insert into com_events(quote_id,kind,detail) values(case when p_action in ('approve','pause','notes','close') then p_id end,'admin_'||p_action,jsonb_build_object('actor',p_actor));
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.com_admin_action(text,uuid,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.com_admin_action(text,uuid,jsonb,uuid) to service_role;
create table if not exists public.com_secrets(key text primary key,value text not null);
alter table public.com_secrets enable row level security;
revoke all on public.com_secrets from public,anon,authenticated;
grant all on public.com_secrets to service_role;

-- Restrict existing CRM/finance records to the same explicit administrator list.
-- Public published-portfolio policies are preserved.
drop policy if exists leads_auth_all on public.leads;
create policy leads_auth_all on public.leads for all to authenticated using(public.com_is_admin()) with check(public.com_is_admin());
drop policy if exists clientes_auth_all on public.clientes;
create policy clientes_auth_all on public.clientes for all to authenticated using(public.com_is_admin()) with check(public.com_is_admin());
drop policy if exists producciones_auth_all on public.producciones;
create policy producciones_auth_all on public.producciones for all to authenticated using(public.com_is_admin()) with check(public.com_is_admin());
do $$ declare t text; begin foreach t in array array['fin_categorias','fin_cobros','fin_movimientos','fin_recurrentes'] loop
 execute format('drop policy if exists fin_auth_all on public.%I',t);
 execute format('create policy fin_auth_all on public.%I for all to authenticated using(public.com_is_admin()) with check(public.com_is_admin())',t);
end loop;end $$;

create or replace function public.com_available_weeks(p_test boolean) returns jsonb language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_agg(jsonb_build_object('week_start',week_start,'available',available) order by week_start),'[]'::jsonb)
 from (select w.week_start,greatest(0,w.capacity-(select count(*)::integer from com_reservations r where r.week_start=w.week_start and r.quote_id in (select id from com_quotes where is_test=p_test) and (r.status='confirmed' or (r.status='held' and r.hold_until>now())))) as available
 from com_weeks w where w.enabled and w.week_start>=date_trunc('week',now() at time zone 'America/Argentina/Buenos_Aires')::date) x;
$$;
revoke all on function public.com_available_weeks(boolean) from public,anon,authenticated;
grant execute on function public.com_available_weeks(boolean) to service_role;
commit;
