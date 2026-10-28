# Activación de consultas y reservas — ARKO Studio

## Estado de la implementación

El código agrega Consultas y reservas al admin, presupuestos privados, cupos semanales, retenciones de hasta 72 horas, pagos de reserva mediante Mercado Pago, correos Zoho y seguimiento programado. La integración comienza DESACTIVADA y en modo de prueba. Mientras no se habilite, el formulario conserva su envío actual por WhatsApp.

No se han conectado cuentas reales ni realizado cobros/envíos de producción. El código por sí solo no instala tablas en Supabase ni configura credenciales en Vercel.

## 1. Base de datos

Usar primero un proyecto Supabase de pruebas, separado del productivo. Copiar el esquema vigente (schema.sql, 03_portfolio.sql, 05_clientes_agenda.sql, 08_finanzas.sql según corresponda) y ejecutar `supabase/09_commercial.sql` desde el SQL Editor.

La migración es transaccional y se puede volver a ejecutar. No crea cupos ni habilita automáticamente los envíos. Restringe las tablas del CRM y finanzas al listado explícito de administradores. Conserva las políticas públicas del portfolio publicado.

Después de instalar, ir a Authentication → Users y copiar el UUID de tu usuario administrador. Ejecutar:

```sql
insert into public.com_admins(user_id)
values ('UUID-DE-TU-USUARIO-ADMINISTRADOR')
on conflict do nothing;
```

Hacer lo mismo con cualquier otro administrador autorizado. Sin este paso, el admin no podrá leer el CRM y las finanzas después de la migración.

## 2. Variables del servidor en Vercel

La lista completa está en `.env.example`. Cargar valores en Settings → Environment Variables. Las variables secretas NO deben tener prefijo `VITE_`, no se guardan en Git ni se pegan en el chat.

- `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`: proyecto correspondiente al entorno.
- `COMMERCIAL_MODE=test`: valor inicial. Solo cambiar a `production` después de las pruebas.
- `COMMERCIAL_SITE_URL`: dominio HTTPS exacto desde donde se abre el sitio, sin rutas. Por ejemplo `https://arkostudio.com.ar`. El origen debe coincidir también para las solicitudes del navegador.
- `QUOTE_LINK_SECRET`: secreto aleatorio de al menos 32 caracteres. Mantenerlo estable: cambiarlo invalida los enlaces anteriores.
- `COMMERCIAL_JOB_SECRET`: otro secreto aleatorio de al menos 32 caracteres para el proceso programado.
- `COMMERCIAL_TEST_EMAIL`: tu dirección para recibir TODAS las pruebas mientras el modo sea `test`.

Las variables deben cargarse en el entorno correcto (Preview/Production), y después debe hacerse un redeploy.

## 3. Zoho Mail

1. Confirmar el plan y la región de la cuenta (com/eu/in/com.au/jp/ca). Verificar que la cuenta permita el acceso necesario a API y webhooks.
2. Crear la autorización OAuth de Zoho para enviar mensajes con el alcance mínimo `ZohoMail.messages.CREATE`. Obtener Client ID, Client Secret y un Refresh Token con acceso offline. Esto se realiza desde la cuenta de Zoho; no requiere compartir tu contraseña.
3. Obtener el Account ID del buzón con la API de cuentas de Zoho (alcance de lectura de cuentas para esta consulta inicial, si es necesario).
4. Cargar `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ACCOUNT_ID`, `ZOHO_REGION` en Vercel. El remitente configurado en el código es `contacto@arkostudio.com.ar`: debe pertenecer al buzón de `ZOHO_ACCOUNT_ID` o ser un alias autorizado en Zoho. `ZOHO_FROM_ADDRESS` ya no se utiliza.
5. En el admin, guardar un borrador de plantilla y usar “Enviar prueba del borrador guardado”. Comprobar recepción y contenido. “Aceptado por Zoho” significa aceptado por la API, no una prueba de lectura ni de entrega en la bandeja principal.

### Presupuesto formal en PDF

El primer correo de presupuesto incluye un PDF adjunto generado por el servidor. El cuerpo es breve y fijo: indica que el presupuesto está adjunto y ofrece un botón para elegir semana y reservar. El asunto sigue siendo editable. Las plantillas antiguas guardadas en la base no vuelven a insertar precios y condiciones en el cuerpo del primer correo. Los recordatorios mantienen sus plantillas habituales.

El PDF usa los valores y condiciones guardados en cada propuesta: cliente, inmueble, superficie, servicios, precio base, tramos adicionales de 100 m², adicionales, total con IVA incluido, seña y saldo. Los packs se presentan como conjunto y sus servicios se explican sin atribuirles precios individuales ficticios. Las nuevas consultas guardan el desglose y las descripciones en `snapshot`; no se necesita una migración. Las propuestas anteriores conservan el importe acordado, sin reconstruir precios históricos con el catálogo actual.

Zoho carga el PDF mediante `POST /api/accounts/{accountId}/messages/attachments?uploadType=multipart&isInline=false`, con un campo de archivo `attach`. El servidor deja que `fetch` genere el encabezado y el boundary multipart. Luego envía el mensaje con los metadatos del adjunto. Usa el mismo alcance `ZohoMail.messages.CREATE`. Si falla la generación o carga del PDF, no se envía un correo sin adjunto. Una respuesta ambigua al envío se mantiene como `uncertain`, para evitar duplicados.

En Comercial → Plantillas → Presupuesto, “Enviar prueba del borrador guardado” prueba el mismo circuito con un PDF de ejemplo marcado sin validez comercial. Comprobar el adjunto y el botón en el buzón de pruebas antes de habilitar envíos de producción. No se envían mensajes reales durante las pruebas automatizadas.

Validación local: `node --test scripts/commercial.test.mjs scripts/quote-pdf.test.mjs`. Ejemplo visual: `node scripts/preview-quote-pdf.mjs` genera `output/pdf/presupuesto-arko-ejemplo.pdf` con datos ficticios.

### Detectar respuestas

Crear `ZOHO_INBOUND_SECRET` aleatorio de al menos 32 caracteres en Vercel. Configurar un outgoing webhook en Zoho Mail para correos entrantes con asunto que contenga el código de consulta. URL:

```
https://TU-DOMINIO/api/commercial?action=zoho_webhook&verify=TU-SECRETO
```

Tratar esta URL como secreta. No pegarla en tickets públicos ni Git. Seleccionar Limited Data List para enviar solo los datos necesarios.

La primera solicitud de registro entrega `x-hook-secret`; el servidor lo guarda en una tabla privada. Las solicitudes siguientes deben tener una firma HMAC válida sobre el cuerpo original. La respuesta solo se asocia si el código de consulta y el remitente coinciden. Pausa el seguimiento y registra el evento; el contenido completo sigue en Zoho. Si el cliente inicia otro asunto y elimina el código, se puede pausar manualmente desde el admin.

Al recrear el webhook hay que revisar y reemplazar el secreto de firma guardado en `com_secrets` desde el servidor/SQL Editor; no se muestra en la interfaz pública.

## 4. Mercado Pago

1. Confirmar la cuenta que recibirá las reservas y revisar sus comisiones.
2. En Developers → Tus integraciones, crear una aplicación de Checkout Pro (Preferences API).
3. Usar primero credenciales y compradores/tarjetas de prueba. Cargar `MP_ACCESS_TOKEN` y `MP_COLLECTOR_ID` del vendedor de pruebas.
4. Configurar notificaciones de pagos en:

```
https://TU-DOMINIO/api/commercial?action=mp_webhook
```

5. Copiar la clave de firma a `MP_WEBHOOK_SECRET`.
6. Crear un presupuesto de prueba, aprobarlo en el admin si hace falta, elegir semana y pagar usando el checkout de pruebas.

Cada pago se consulta en la API del proveedor y se verifica importe, moneda, vendedor, referencia y entorno. La vuelta del navegador no confirma el pago. Las reservas de prueba no crean producciones ni movimientos financieros reales.

Los pagos aprobados fuera de plazo o duplicados se muestran como “requiere revisión”. No se confirma un cupo ocupado ni se devuelve dinero automáticamente. Las devoluciones/contracargos también requieren revisar la reserva y su contabilidad desde el admin.

## 5. Tareas programadas de Supabase

Después de comprobar Zoho y la API, habilitar Cron y pg_net. Crear dos secretos en Supabase Vault:

- `arko_commercial_jobs_url`: `https://TU-DOMINIO/api/commercial?action=jobs`
- `arko_commercial_jobs_secret`: mismo valor que `COMMERCIAL_JOB_SECRET` de Vercel.

Ejecutar `supabase/10_commercial_cron.sql`. Programa una revisión cada cinco minutos, con lotes pequeños. Revisar sus ejecuciones en Supabase y los envíos en el admin.

No poner la clave directamente en el SQL guardado en Git. El vencimiento de un cupo se comprueba también al reservar, por lo que un retraso del proceso no mantiene un cupo ocupado indefinidamente.

## 6. Configuración en el admin

Entrar a Consultas y reservas:

1. Configuración: revisar precios, depósito de $15.000, retención de 72 horas, vigencia de presupuesto y condiciones de cancelación/reprogramación. La reserva se descuenta del total. Los presupuestos existentes conservan sus precios.
2. Semanas: cargar el lunes de cada semana y la cantidad de cupos que realmente se pueden ofrecer online. Descontar los trabajos coordinados por fuera del sistema. Bloquear las semanas que no estén disponibles.
3. Mensajes: revisar cada plantilla, guardar borradores, probar y publicar. Publicar es una acción separada de guardar un borrador.
4. Decidir si los presupuestos se aprueban automáticamente. Si está desactivado, cada solicitud queda por revisar antes de habilitar su reserva.
5. Habilitar envíos, pagos y formulario solo después de comprobar las conexiones. La recuperación a los 7 y 21 días se activa por separado.

Los recordatorios de pago se programan a las 24 y 48 horas y, si corresponde, tres horas antes de vencer. Si el proceso se atrasó, no manda varios recordatorios acumulados de pago juntos. La retención nunca supera la vigencia de la propuesta.

## Pruebas antes de abrir al público

- Presupuesto Base, Destacado y Completo; precios según m² y adicionales.
- Aprobación manual y automática.
- Elegir semana; repetir el clic no debe crear ni extender otra reserva.
- Pago aprobado, rechazado y pendiente.
- Notificación repetida: un solo ingreso/confirmación.
- Vencimiento y pago tardío: cupo liberado y revisión manual.
- Respuesta desde el correo original: seguimiento pausado.
- Baja: no se envían más recordatorios comerciales.
- Plantilla guardada en borrador: no cambia el mensaje publicado.
- Dos usuarios intentando tomar el último cupo: solo uno lo obtiene.

Se incluyeron pruebas de lógica/API en `scripts/commercial.test.mjs` y pruebas transaccionales de PostgreSQL en `scripts/commercial-db.test.sql`. Estas últimas se ejecutan únicamente contra una base de pruebas. El procesamiento SQL y la concurrencia se probaron localmente; las conexiones reales con Zoho/Mercado Pago requieren tus cuentas para el ensayo final.

## Pasar a producción

Repetir la instalación/configuración en el proyecto productivo. Usar las credenciales productivas de Mercado Pago, verificar el webhook de ese entorno y establecer `COMMERCIAL_MODE=production`. Configurar la cuenta Zoho remitente y las tareas del entorno productivo. Hacer un redeploy y activar las opciones del admin.

Supervisar los primeros pedidos. Si un envío queda “Verificar en Zoho”, revisar Enviados antes de reintentar: el proveedor podría haber recibido el mail aunque su respuesta se haya perdido. Las claves, permisos y pruebas de cuentas externas son los pasos pendientes para la activación real.

## Fuentes de integración

- https://www.zoho.com/mail/help/api/post-send-an-email.html
- https://www.zoho.com/mail/help/dev-platform/webhook.html
- https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/overview
- https://supabase.com/docs/guides/cron


### Pausa manual de respuestas
Configurar `COMMERCIAL_REPLY_MODE=manual` en Vercel si Zoho no incluye webhooks. Revisar el correo y pausar el seguimiento desde el detalle de cada consulta cuando el cliente responda. Los pagos aprobados y las bajas siguen deteniendo los recordatorios automaticamente.
