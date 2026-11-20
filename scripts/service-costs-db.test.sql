-- Base de prueba con 13_inventario.sql y 14_costos_servicios.sql instaladas.
-- Ejecutar con un rol propietario; todas las filas de prueba se revierten.
begin;
insert into public.fin_equipos(id,nombre,valor_usd) values('00000000-0000-0000-0000-000000000014','Equipo de prueba',100);
insert into public.fin_servicios_config(servicio_id,alcance,tiempos,valor_hora_usd,trabajos_mes,costos,equipos)
values ('test-foto','Hasta 100 m²','{"preparacion":15,"captura":60,"edicion":90,"entrega":15}',10,5,
 '[{"nombre":"Software","importe_usd":100,"porcentaje":25,"periodo":"mensual"}]',array['00000000-0000-0000-0000-000000000014'::uuid]);
do $$ begin
 begin
  update fin_servicios_config set costos='[{"nombre":"Error","importe_usd":1,"porcentaje":101,"periodo":"mensual"}]' where servicio_id='test-foto';
  raise exception 'TEST: porcentaje inválido aceptado';
 exception when check_violation then null; end;
 begin
  update fin_servicios_config set costos='[{"nombre":"Error","importe_usd":1,"periodo":"mensual"}]' where servicio_id='test-foto';
  raise exception 'TEST: costo incompleto aceptado';
 exception when check_violation then null; end;
 begin
  update fin_servicios_config set equipos=array['00000000-0000-0000-0000-000000000099'::uuid] where servicio_id='test-foto';
  raise exception 'TEST: equipo inexistente aceptado';
 exception when raise_exception then
  if sqlerrm like 'TEST:%' then raise; end if;
  if sqlerrm not like 'Uno de los equipos%' then raise; end if;
 end;
 begin
  update fin_servicios_config set tiempos='{"captura":0}' where servicio_id='test-foto';
  raise exception 'TEST: tiempos incompletos aceptados';
 exception when raise_exception then
  if sqlerrm like 'TEST:%' then raise; end if;
 end;
 if has_table_privilege('anon','public.fin_servicios_config','select') then raise exception 'TEST: anon tiene acceso'; end if;
 if not (select relrowsecurity from pg_class where oid='public.fin_servicios_config'::regclass) then raise exception 'TEST: RLS desactivado'; end if;
end $$;
rollback;
