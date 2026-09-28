# Finanzas

## Activación

Ejecutar `08_finanzas.sql` una vez en el SQL Editor del proyecto Supabase que usa la aplicación. Se puede volver a ejecutar sin duplicar tablas ni categorías. Luego abrir **Admin → Finanzas**. No requiere claves privadas en el navegador.

La sección sigue el acceso del administrador existente: únicamente usuarios autenticados; Supabase debe mantener deshabilitado el registro público de usuarios. Antes de habilitar otros roles o registro público, reemplazar estas políticas por permisos de administrador explícitos.

## Criterios

- Entrada, Salida y Balance se calculan por fecha efectiva del pago, exclusivamente con movimientos confirmados. Los pendientes y anulados se excluyen.
- El gráfico y el balance anual incluyen enero–diciembre del año seleccionado, también movimientos cargados retroactivamente. No representan el saldo bancario ni incluyen un saldo inicial.
- USD utiliza dólar oficial **venta**, consultado a DolarApi al abrir la sección y cada 15 minutos. Se muestra la fecha de actualización. Cada pago guarda su importe original y cotización; la base calcula y redondea ARS a dos decimales. Para pagos históricos se debe ingresar la cotización correspondiente a esa fecha. Si el servicio falla, se informa y se permite ingreso manual.
- Las cuentas por cobrar se pactan en ARS. Se sugiere 50% de anticipo y luego el saldo, permitiendo pagos menores. Los pagos se enlazan a la cuenta y aparecen una sola vez en movimientos. La base rechaza sobrecobros y totales inferiores a lo ya pagado.
- Los gastos recurrentes se materializan al abrir/actualizar Finanzas, hasta fin del mes actual. Se recuperan períodos anteriores. No hace falta dejar la página abierta ni un servicio externo para recuperar vencimientos; no se generan en segundo plano si nadie abre la sección. No se registran como pagados automáticamente.
- En cuotas, el importe es **por cuota**, no el total de la compra. La fecha final es inclusiva. El día 31 se ajusta al último día de meses cortos, manteniendo el día original en meses posteriores.
- Editar o pausar un recurrente no modifica movimientos ya generados. Reactivarlo recupera períodos faltantes. Para cambiar el calendario, pausar el anterior y crear uno nuevo. Anular individualmente los pendientes que no correspondan.
- Para corregir un pago se puede editar o anular, preservando el registro. Esto no constituye un historial de auditoría de cada edición; una contabilidad formal requerirá asientos inmutables, facturas, impuestos, conciliación bancaria y permisos adicionales.
- Las categorías se pueden renombrar y archivar, conservando las referencias históricas. El tipo no se cambia para evitar que entradas se conviertan en categorías de salida.
- Exportación CSV con los filtros y períodos visibles, incluyendo importe original y tipo de cambio.

## Verificación

- `node --test scripts/finance.test.mjs`: totales, años, pagos parciales, estados y conversión.
- `npm run build`: compilación y generación de páginas existentes.
- En una base PostgreSQL **de prueba** con roles `authenticated` y `anon`, ejecutar la migración y luego `scripts/finance-db.test.sql`. Las pruebas usan transacción y rollback, validan calendario, idempotencia, cuotas, pausa, USD, sobrecobros, anulaciones y permisos.
