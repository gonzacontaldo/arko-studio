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

## Inventario de equipos

Ejecutar `13_inventario.sql` después de `09_commercial.sql` en el SQL Editor del mismo proyecto. La pestaña **Finanzas → Inventario** funciona de forma independiente: si falta su tabla, muestra instrucciones sin bloquear las demás secciones de Finanzas.

- Alta y edición de equipos, tipo, inversión histórica en USD, fecha de compra opcional, servicios asociados, uso específico y notas.
- Se pueden asociar varios servicios a un equipo y cargar cada lente o accesorio por separado.
- Archivar conserva el registro: el resumen distingue inversión en equipos activos de inversión histórica total. No se eliminan equipos desde la interfaz.
- Los importes se ingresan directamente en USD; no se reconvierten con la cotización actual.
- Cargar inventario no crea movimientos financieros, recuperaciones ni gastos duplicados. La asignación de cobros a recuperación de inversión se implementará por separado.
- Acceso restringido con `com_is_admin()`, igual que el resto del administrador comercial.

Verificación manual tras activar la tabla: crear un equipo con varios servicios y un valor con centavos; recargar y comprobar persistencia; editar importe y usos; buscar y filtrar; archivar y comprobar ambos totales; intentar acceder sin rol de administrador y comprobar que RLS rechaza el acceso.

## Costos y tiempos por servicio

Ejecutar `14_costos_servicios.sql` después de `13_inventario.sql`. Abrir **Finanzas → Costos por servicio**. Se usa el catálogo comercial guardado, completado con los servicios predeterminados, más fotografía/video aéreo. Las configuraciones de servicios retirados del catálogo se conservan.

Cada servicio registra alcance, minutos activos de preparación/captura/edición/entrega, valor hora objetivo en USD, volumen mensual estimado, costos y equipos del inventario. Los equipos activos ya asociados al servicio se preseleccionan al configurar por primera vez; después la selección se guarda en la configuración. Esa selección no modifica los usos descriptivos del inventario.

Costo estimado por trabajo = minutos / 60 × valor hora + costos directos asignados + gastos periódicos asignados / trabajos al mes. Para cada gasto se registra importe total y porcentaje correspondiente al servicio; los gastos anuales se dividen por doce antes del reparto mensual. El reparto entre servicios es manual: el usuario debe distribuir el 100% del gasto compartido. No se incluyen gastos generales, traslados compartidos ni recuperación de equipos. Los valores no modifican precios públicos ni crean movimientos, pagos o retiros. Todavía no se aplican automáticamente a producciones existentes.

Verificación: `node --test scripts/service-costs.test.mjs scripts/finance.test.mjs`; `npm run build`. `scripts/service-costs-db.test.sql` comprueba restricciones en una base de prueba con ambas migraciones instaladas y revierte sus filas al finalizar.

## Vinculación con gastos recurrentes

Ejecutar `15_costos_recurrentes.sql` después de `14_costos_servicios.sql`. En cada servicio, **Usar un gasto de Recurrentes** permite seleccionar una suscripción o gasto existente y asignarle un porcentaje. Solo se guarda su identificador y porcentaje: importe, moneda y frecuencia se consultan desde `fin_recurrentes` al abrir la sección. Las configuraciones manuales anteriores se conservan. Si el mismo gasto se había copiado manualmente, quitar esa copia al vincularlo; no se deducen equivalencias por nombre.

Los recurrentes en USD mantienen su valor; los de ARS se convierten con la cotización oficial venta visible en Finanzas, como estimación actual. Sin cotización, el total queda pendiente con una explicación. Un recurrente faltante tampoco se interpreta como costo cero. Se excluyen pausados, futuros y finalizados; la última cuota aporta durante su período de cobertura. La fecha final explícita limita la vigencia. Las anualidades se normalizan a doce meses.

La interfaz y el trigger de base de datos impiden repetir un recurrente en el mismo servicio o asignar más del 100% entre servicios. La asignación no genera pagos ni modifica el gasto original. Los porcentajes se conservan aunque se pause el recurrente. Las producciones históricas todavía no usan estas estimaciones.

Pruebas adicionales: `scripts/recurring-costs-db.test.sql` (base de prueba con migraciones instaladas, rollback al terminar) y `scripts/service-costs.test.mjs` (conversión, actualización del gasto fuente, vigencia y anualidades).

## Video unificado y recuperación de inversión

Cinematográfico (`cine`), reels y FPV comparten una configuración interna de costos bajo `cine`. Se conserva la configuración ya cargada de cinematográfico y su volumen debe representar el total de formatos vendidos al mes. El catálogo y los precios públicos conservan sus formatos comerciales. Inventario agrupa esas etiquetas sin duplicarlas. Planos se considera sin costo por ahora y se excluye del reparto de recuperación. Supabase sigue siendo un gasto general; no se asigna automáticamente a servicios.

Ejecutar `16_recuperacion_equipos.sql` después de las anteriores para habilitar **Finanzas → Recuperación de equipos**. Agrega un total manual recuperado por equipo (inicialmente cero, nunca superior a la inversión) y una configuración de plazo en meses. La interfaz presenta 24 meses como simulación inicial, sin guardar ni asumir que ese plazo fue elegido. El usuario puede guardar un objetivo de entre 1 y 600 meses.

Para cada equipo activo: saldo pendiente = inversión USD − total recuperado manual; objetivo mensual = saldo / plazo. Se vincula a los servicios configurados por sus asociaciones en Inventario o sus equipos seleccionados en Costos por servicio, normalizando todos los formatos de video. El objetivo mensual del equipo se divide por la suma de cantidades mensuales de esos servicios; cada categoría aporta ese importe por unidad vendida. El reparto conserva el objetivo sin duplicar equipos compartidos. Los equipos sin volumen asociado se muestran como pendientes de reparto. El total de inversión archivada permanece en Inventario, pero se excluye del plan activo.

El plazo es un horizonte a partir del saldo actual, sin fecha final fija ni cómputo de meses transcurridos. El modelo supone una unidad de uso por servicio: un pack suma sus servicios y dos formatos de video cuentan como dos unidades. No calcula descuentos por uso compartido en una misma visita. El total recuperado es una declaración manual acumulada, no una suma automática de cobros, un movimiento de dinero ni un historial de recuperaciones. Los objetivos quedan separados de los costos operativos y de la remuneración.

Pruebas: `scripts/recovery.test.mjs` comprueba reparto compartido, agrupación de video, saldos, archivado y conservación del objetivo; `scripts/recovery-db.test.sql` valida restricciones monetarias, plazo y permisos en una base de prueba con rollback.
