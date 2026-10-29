-- Run after 09 and 10, before deploying the new form.
alter table public.com_quotes alter column total drop not null;
insert into public.com_templates(key,title,subject,body) values ('received','Recepción de solicitud','Recibimos tu solicitud en ARKO Studio','Hola {nombre}, recibimos tu solicitud para {zona}.\n\n{detalle}\n\nVamos a revisar el alcance y contactarte para preparar tu presupuesto. Una vez definido, recibirás el PDF y el enlace para reservar.') on conflict(key) do nothing;
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
 values(p_id,p_request_key,now()+make_interval(days=>s.quote_days),p_data->>'name',p_data->>'email',p_data->>'zone',(p_data->>'m2')::numeric,p_data->>'timing',p_data->>'message',p_data->'snapshot',(p_data#>>'{snapshot,total}')::integer,s.deposit,s.terms,case when (s.auto_quote and not coalesce((p_data#>>'{snapshot,requiresReview}')::boolean,false)) then now() end,case when (s.auto_quote and not coalesce((p_data#>>'{snapshot,requiresReview}')::boolean,false)) then 'ready' else 'pending_review' end,p_test,p_ip,lead) returning * into q;
 if (s.auto_quote and not coalesce((p_data#>>'{snapshot,requiresReview}')::boolean,false)) then
  perform com_queue(q.id,'quote',now(),q.id||':quote');
  perform com_queue(q.id,'choose_week',now()+interval '24 hours',q.id||':choose');
 end if;
 if coalesce((q.snapshot->>'requiresReview')::boolean,false) then perform com_queue(q.id,'received',now(),q.id||':received'); end if;
 insert into com_events(quote_id,kind) values(q.id,'request_received');
 return jsonb_build_object('id',q.id,'stage',q.stage);
end $$;
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
   if q.total is null then raise exception 'FLOW:Guardá la cotización antes de enviarla.'; end if;
   update com_quotes set approved_at=now(),stage='ready',valid_until=now()+make_interval(days=>(select quote_days from com_settings where id=1)) where id=q.id;
   update leads set estado='presupuestado' where id=q.lead_id;
   perform com_queue(q.id,'quote',now(),q.id||':quote');
   perform com_queue(q.id,'choose_week',now()+interval '24 hours',q.id||':choose');
  elsif p_action='quote_draft' then
   if q.stage<>'pending_review' or not coalesce((q.snapshot->>'requiresReview')::boolean,false) then raise exception 'FLOW:Esta consulta no admite cotización manual.'; end if;
   if jsonb_array_length(p_data->'lineItems')<1 or exists(select 1 from jsonb_array_elements(p_data->'lineItems') x where length(trim(x->>'description'))<1 or (x->>'quantity')::integer<1 or (x->>'unitPrice')::integer<1 or (x->>'total')::bigint<>(x->>'quantity')::bigint*(x->>'unitPrice')::bigint) then raise exception 'FLOW:Revisá los conceptos.'; end if;
   if (select sum((x->>'total')::bigint) from jsonb_array_elements(p_data->'lineItems') x) <> (p_data->>'total')::bigint or (p_data->>'total')::bigint<q.deposit then raise exception 'FLOW:El total debe cubrir la reserva.'; end if;
   update com_quotes set total=(p_data->>'total')::integer, snapshot=snapshot||jsonb_build_object('total',(p_data->>'total')::integer,'lineItems',p_data->'lineItems','scopeOfWork',p_data->>'scopeOfWork') where id=q.id;
  elsif p_action='pause'  then update com_quotes set paused=(p_data->>'paused')::boolean where id=q.id;
  elsif p_action='notes' then update com_quotes set notes=p_data->>'notes' where id=q.id;
  elsif p_action='close' then
   if exists(select 1 from com_reservations where quote_id=q.id and status in ('confirmed','payment_review')) then raise exception 'FLOW:Esta consulta tiene un pago o una reserva confirmada. Revisala antes de cancelarla.'; end if;
   update com_quotes set stage='closed',paused=true where id=q.id;
   update com_reservations set status='cancelled' where quote_id=q.id and status='held';
   update com_jobs set status='cancelled' where quote_id=q.id and status='pending' and template_key<>'quote';
  else raise exception 'FLOW:Acción desconocida.'; end if;
 end if;
 insert into com_events(quote_id,kind,detail) values(case when p_action in ('approve','quote_draft','pause','notes','close') then p_id end,'admin_'||p_action,jsonb_build_object('actor',p_actor));
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.com_property_quotes_version() returns integer language sql security definer set search_path=public as $$ select 1; $$;
revoke all on function public.com_property_quotes_version() from public,anon,authenticated;
grant execute on function public.com_property_quotes_version() to service_role;
