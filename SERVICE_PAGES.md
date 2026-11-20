# Imágenes y videos de servicios

Entrar en `/admin?tab=service-pages` → **Páginas de servicios** y elegir Fotografía, Video, Planos 2D, Tours 360° o Tomas aéreas.

- Imágenes: subir JPG, PNG, WebP o AVIF (hasta 15 MB), elegir una foto del portfolio o pegar su URL HTTPS.
- Videos: pegar un enlace de YouTube/Shorts o su ID. La portada se puede personalizar; vacía usa la miniatura de YouTube.
- Tours: pegar el enlace público o iframe de Kuula/Viewin360 o Matterport. Se guarda solamente el enlace validado, nunca código HTML.
- Planos: subir una imagen reemplaza el esquema de demostración en sus tres ubicaciones. Actualizar la descripción del ejemplo según corresponda. Vacío conserva el esquema interactivo original.
- Fotografía: los tres trabajos finales pueden seguir los destacados de la home o elegirse en orden con los tres selectores.

**Guardar cambios** aplica la selección. Subir una imagen por sí solo no modifica la página. **Recuperar originales** devuelve el editor a las selecciones originales; se debe guardar para aplicarlas. Las imágenes anteriores no se eliminan.

## Implementación

Los documentos públicos se guardan en el bucket existente `portfolio`, en `service-pages/<slug>.json`. Contienen únicamente referencias a medios públicos y sus descripciones. No se requieren migraciones SQL ni cambios de políticas RLS.

`POST /api/service-media?service=<slug>&action=save|upload` comprueba la sesión y la pertenencia a `com_admins` usando el control de acceso comercial existente. El servidor escribe en Storage con las variables privadas `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`, ya configuradas en Vercel. La clave privada nunca se envía al navegador. El endpoint acepta solamente cinco servicios y campos conocidos, imágenes raster admitidas y enlaces a proveedores permitidos.

Se guardan solamente las diferencias con los originales, para que las URLs de recursos generadas por Vite sigan cada despliegue. Si el documento no existe o no está disponible, el sitio conserva sus medios originales; el editor muestra errores de lectura y evita sobrescribir una configuración que no pudo cargar.

En desarrollo, Vite adapta el mismo handler. Las variables privadas deben estar en el entorno del proceso de Vite. No usar prefijo `VITE_` para secretos. En producción Vercel ejecuta la función directamente.

Pruebas: `node --test scripts/service-media.test.mjs` y `npm run build`.
