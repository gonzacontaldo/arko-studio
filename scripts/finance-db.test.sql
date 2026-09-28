-- Ejecutar en una base de pruebas con 08_finanzas.sql ya instalado.
-- No deja datos: toda la prueba se revierte.
\set ON_ERROR_STOP on
begin;
set local role authenticated;
do $$
declare
 expense_id uuid; income_id uuid; recurring_id uuid; account_id uuid;
 payment_id uuid; n integer; converted numeric; rejected boolean;
begin
 select id into expense_id from public.fin_categorias where clave_inicial = 'suscripciones';
 select id into income_id from public.fin_categorias where clave_inicial = 'producciones';
 insert into public.fin_recurrentes(descripcion,importe,moneda,categoria_id,pagador,receptor,medio,inicio,frecuencia,cuotas)
 values('Prueba 31 del mes',10,'USD',expense_id,'ARKO','Proveedor','transferencia','2024-01-31','mensual',3) returning id into recurring_id;
 perform public.fin_generar_pendientes();
 perform public.fin_generar_pendientes();
 select count(*) into n from public.fin_movimientos where recurrente_id=recurring_id;
 assert n = 3, 'Recurrencias repetidas o faltantes';
 assert (select array_agg(ocurrencia order by ocurrencia) = array['2024-01-31','2024-02-29','2024-03-31']::date[] from public.fin_movimientos where recurrente_id=recurring_id), 'Calendario fin de mes incorrecto';
 assert not exists(select 1 from public.fin_movimientos where recurrente_id=recurring_id and (estado <> 'pendiente' or importe_ars is not null)), 'USD pendiente debe esperar cotización';
 update public.fin_movimientos set estado='pagado',cotizacion=1234.56,importe=10.99 where recurrente_id=recurring_id and ocurrencia='2024-01-31' returning id,importe_ars into payment_id,converted;
 assert converted=13567.81, 'Conversión o redondeo incorrecto';
 update public.fin_recurrentes set importe=100 where id=recurring_id;
 perform public.fin_generar_pendientes();
 assert (select importe_ars=13567.81 from public.fin_movimientos where id=payment_id), 'La plantilla modificó un pago histórico';
 update public.fin_movimientos set estado='anulado' where id=payment_id;
 perform public.fin_generar_pendientes();
 assert (select count(*)=3 from public.fin_movimientos where recurrente_id=recurring_id), 'Se regeneró una cuota anulada';
 insert into public.fin_recurrentes(descripcion,importe,moneda,categoria_id,pagador,receptor,medio,inicio,frecuencia,fin)
 values('Anual bisiesto',10,'ARS',expense_id,'ARKO','Proveedor','efectivo','2024-02-29','anual','2025-03-01') returning id into recurring_id;
 perform public.fin_generar_pendientes();
 assert (select array_agg(ocurrencia order by ocurrencia) = array['2024-02-29','2025-02-28']::date[] from public.fin_movimientos where recurrente_id=recurring_id), 'Calendario anual o fecha fin incorrectos';
 insert into public.fin_recurrentes(descripcion,importe,moneda,categoria_id,pagador,receptor,medio,inicio,frecuencia,activa)
 values('Pausado',10,'ARS',expense_id,'ARKO','Proveedor','efectivo','2024-01-01','mensual',false) returning id into recurring_id;
 perform public.fin_generar_pendientes();
 assert not exists(select 1 from public.fin_movimientos where recurrente_id=recurring_id), 'Se generó un gasto pausado';
 insert into public.fin_cobros(cliente,descripcion,fecha,total,categoria_id)
 values('Cliente prueba','Producción',current_date,1000,income_id) returning id into account_id;
 insert into public.fin_movimientos(tipo,estado,fecha,descripcion,importe,moneda,categoria_id,pagador,receptor,medio,cobro_id)
 values('entrada','pagado',current_date,'Anticipo',500,'ARS',income_id,'Cliente','ARKO','mercado_pago',account_id) returning id into payment_id;
 rejected := false;
 begin
   insert into public.fin_movimientos(tipo,estado,fecha,descripcion,importe,moneda,categoria_id,pagador,receptor,medio,cobro_id)
   values('entrada','pagado',current_date,'Sobrecobro',501,'ARS',income_id,'Cliente','ARKO','efectivo',account_id);
 exception when raise_exception then rejected := true;
 end;
 assert rejected, 'Se permitió cobrar más que el saldo';
 rejected := false;
 begin update public.fin_cobros set total=499 where id=account_id;
 exception when raise_exception then rejected := true; end;
 assert rejected, 'Se permitió reducir el total por debajo de lo cobrado';
 insert into public.fin_movimientos(tipo,estado,fecha,descripcion,importe,moneda,categoria_id,pagador,receptor,medio,cobro_id)
 values('entrada','pagado',current_date,'Saldo',500,'ARS',income_id,'Cliente','ARKO','efectivo',account_id);
 assert (select sum(importe_ars)=1000 from public.fin_movimientos where cobro_id=account_id and estado='pagado'), 'Anticipo y saldo incorrectos';
 update public.fin_movimientos set estado='anulado' where id=payment_id;
 assert (select sum(importe_ars)=500 from public.fin_movimientos where cobro_id=account_id and estado='pagado'), 'La anulación no restaura el saldo';
 rejected := false;
 begin update public.fin_movimientos set fecha=current_date+1,estado='pagado' where id=payment_id;
 exception when raise_exception then rejected := true; end;
 assert rejected, 'Se permitió confirmar un pago futuro';
 rejected := false;
 begin delete from public.fin_movimientos where id=payment_id;
 exception when raise_exception then rejected := true; end;
 assert rejected, 'Se permitió borrar el historial';
 assert not has_table_privilege('anon','public.fin_movimientos','SELECT'), 'El público puede leer finanzas';
 assert not has_function_privilege('anon','public.fin_generar_pendientes()','EXECUTE'), 'El público puede generar gastos';
 raise notice 'OK: recurrencias, idempotencia, años bisiestos, cuotas, finalización, pausa, USD, historial, anticipos, sobrecobros, anulación y permisos.';
end $$;
rollback;
