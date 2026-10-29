-- Run after 11_property_quotes.sql. Only future submissions generate notifications.
begin;
insert into public.com_templates(key,title,subject,body) values
('admin_notice','Aviso interno de nueva consulta','Nueva consulta web ARKO','Aviso interno a contacto@arkostudio.com.ar con los datos de la solicitud y acceso al admin.')
on conflict(key) do nothing;

create or replace function public.com_notify_new_quote() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 perform com_queue(new.id,'admin_notice',now(),new.id||':admin_notice');
 return new;
end $$;
revoke all on function public.com_notify_new_quote() from public,anon,authenticated;
drop trigger if exists com_quote_admin_notice on public.com_quotes;
create trigger com_quote_admin_notice after insert on public.com_quotes
for each row execute function public.com_notify_new_quote();

-- Customer actions must not cancel a pending internal notification.
do $$
declare fn record; definition text;
begin
 for fn in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname in ('com_hold','com_apply_payment','com_admin_action') loop
  definition:=pg_get_functiondef(fn.oid);
  definition:=replace(definition,'template_key<>''quote''','template_key not in (''quote'',''admin_notice'')');
  execute definition;
 end loop;
end $$;
commit;
