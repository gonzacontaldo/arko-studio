begin;
insert into fin_recurrentes(id,descripcion,importe,moneda,categoria_id,pagador,receptor,medio,inicio,frecuencia)
values('00000000-0000-0000-0000-000000000015','Software de prueba',100,'USD',(select id from fin_categorias where clave_inicial='suscripciones'),'ARKO','Proveedor','transferencia','2026-01-01','mensual');
insert into fin_servicios_config(servicio_id,alcance,tiempos,valor_hora_usd,trabajos_mes,costos) values
('test-recurrente-foto','Test','{"preparacion":0,"captura":60,"edicion":0,"entrega":0}',10,5,'[{"recurrente_id":"00000000-0000-0000-0000-000000000015","porcentaje":60}]'),
('test-recurrente-video','Test','{"preparacion":0,"captura":60,"edicion":0,"entrega":0}',10,5,'[{"recurrente_id":"00000000-0000-0000-0000-000000000015","porcentaje":40}]');
do $$ begin
 begin
  update fin_servicios_config set costos='[{"recurrente_id":"00000000-0000-0000-0000-000000000015","porcentaje":41}]' where servicio_id='test-recurrente-video';
  raise exception 'TEST: se aceptó más del 100%%';
 exception when raise_exception then
  if sqlerrm not like 'El gasto recurrente supera%' then raise; end if;
 end;
 begin
  update fin_servicios_config set costos='[{"recurrente_id":"00000000-0000-0000-0000-000000000015","porcentaje":10},{"recurrente_id":"00000000-0000-0000-0000-000000000015","porcentaje":10}]' where servicio_id='test-recurrente-video';
  raise exception 'TEST: recurrente duplicado aceptado';
 exception when raise_exception then
  if sqlerrm not like 'El gasto recurrente está repetido%' then raise; end if;
 end;
 begin
  update fin_servicios_config set costos='[{"recurrente_id":"00000000-0000-0000-0000-000000000099","porcentaje":10}]' where servicio_id='test-recurrente-video';
  raise exception 'TEST: recurrente inexistente aceptado';
 exception when raise_exception then
  if sqlerrm not like 'El gasto recurrente no existe%' then raise; end if;
 end;
end $$;
-- Actualizar el gasto no copia ni sobrescribe los importes en las configuraciones.
update fin_recurrentes set importe=200 where id='00000000-0000-0000-0000-000000000015';
do $$ begin
 if exists(select 1 from fin_servicios_config where servicio_id like 'test-recurrente-%' and costos->0 ? 'importe_usd') then raise exception 'TEST: importe duplicado'; end if;
end $$;
rollback;
