begin;
insert into fin_equipos(id,nombre,valor_usd,recuperado_usd) values('00000000-0000-0000-0000-000000000016','Recuperación test',100,25);
insert into fin_recuperacion_config(id,plazo_meses) values(1,24);
do $$ begin
 begin
  update fin_equipos set recuperado_usd=101 where id='00000000-0000-0000-0000-000000000016';
  raise exception 'TEST: recuperado supera inversión';
 exception when check_violation then null; end;
 begin
  update fin_equipos set valor_usd=24 where id='00000000-0000-0000-0000-000000000016';
  raise exception 'TEST: inversión inferior a recuperado';
 exception when check_violation then null; end;
 begin
  update fin_recuperacion_config set plazo_meses=0 where id=1;
  raise exception 'TEST: plazo cero aceptado';
 exception when check_violation then null; end;
 if has_table_privilege('anon','fin_recuperacion_config','select') then raise exception 'TEST: anon tiene acceso'; end if;
 if not (select relrowsecurity from pg_class where oid='public.fin_recuperacion_config'::regclass) then raise exception 'TEST: falta RLS'; end if;
end $$;
rollback;
