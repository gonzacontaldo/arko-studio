# Búsquedas orgánicas de ARKO Studio

## Qué página responde a cada búsqueda

| Intención | Página principal |
| --- | --- |
| Fotografía inmobiliaria | `/fotografia-inmobiliaria` (URL y título conservados) |
| Video inmobiliario, cinematográfico, reel inmobiliario | `/video-inmobiliario` |
| Drone para inmobiliarias, fotos y tomas aéreas de propiedades | `/drone-inmobiliario` |
| Drone FPV, recorrido FPV inmobiliario, video de interiores con drone | `/fpv-inmobiliario` |
| Contenido inmobiliario, contenido para inmobiliarias, producción audiovisual inmobiliaria | `/contenido-inmobiliario` |
| Planos para inmobiliarias, planos 2D de propiedades, relevamiento con láser | `/planos-2d` |
| Tour virtual, tour 360, recorrido virtual, Kuula, Matterport | `/tour-virtual-360` |

El contenido delimita el servicio y la cobertura real: CABA y Zona Norte de Buenos Aires. No se ofrecen planos arquitectónicos ni vuelos garantizados en cualquier ubicación. Las páginas nuevas explican necesidades distintas: FPV profundiza el recorrido con drone y la preparación; Contenido ayuda a elegir y combinar servicios. No se crean páginas duplicadas para cada variante de una palabra o cada localidad.

## Implementación

- `src/data/services.js` y `src/data/seoGuides.js`: metadatos y contenido de las guías.
- `src/lib/seo.js`: origen canónico sin `www`, imágenes absolutas y datos estructurados con migas de navegación. El dominio `www` redirige actualmente al dominio sin `www`; no se cambia esa configuración externa.
- `src/entry-server.jsx` y `scripts/prerender-seo.mjs`: generan el HTML real de las páginas públicas con React en el build. Se incluyen los estilos de cada ruta desde el manifiesto del cliente. El bundle temporal del servidor se elimina y no se publica. Los datos dinámicos del portfolio, la selección de medios y el catálogo del administrador siguen cargándose en el navegador como antes; el HTML usa los valores iniciales de la aplicación.
- Sitemap generado desde la misma lista de rutas, rutas estáticas explícitas en Vercel y encabezados `noindex` para admin, ejemplo y presupuesto privado.
- El componente SEO actualiza la única etiqueta canónica y el único script de datos estructurados al navegar. No se agregan calificaciones, reseñas, fechas de videos, habilitaciones ni funciones no verificadas.
- La home conserva solo las tarjetas de servicios. El enlace a la guía de contenido y los enlaces del pie conectan las páginas nuevas con el resto del sitio.

Validación: primero `npm run build` y luego `node --test scripts/*.test.mjs`. Las pruebas SEO requieren `dist` y comprueban HTML completo, metadatos, una sola canónica por página, enlaces, sitemap, rewrites y existencia de recursos de imagen/estilos.

## Pasos después de publicar

1. En Google Search Console, usar la propiedad del dominio o la propiedad `https://arkostudio.com.ar/`. Enviar `https://arkostudio.com.ar/sitemap.xml`.
2. Inspeccionar las siete páginas de servicios/guías: probar la URL publicada y revisar la canónica elegida por Google, el HTML renderizado y la posibilidad de indexación. Solicitar indexación de las páginas nuevas y de las que se actualizaron. La solicitud no garantiza indexación ni posición.
3. Revisar el informe de rendimiento por página y consulta, comparando períodos equivalentes. Registrar impresiones, clics, CTR y posición para los grupos de búsquedas de la tabla; distinguir CABA/Zona Norte de búsquedas genéricas sin intención local.
4. Mantener ejemplos propios y contenido comercial actualizados. Pedir a clientes que quieran acreditar una producción que enlacen a la página del servicio o al portfolio desde sus sitios; no comprar enlaces ni publicar reseñas ficticias.
5. Si existe un Perfil de Empresa en Google, revisar que los servicios, teléfono y cobertura reales coincidan. No publicar domicilios, horarios o zonas de atención que no estén confirmados.

No se ha accedido a Search Console ni se dispone de una línea base de sus consultas/posiciones. Los cambios preparan el sitio para descubrimiento e indexación; no garantizan aparecer por todas las búsquedas, especialmente términos amplios como «FPV» o «planos» sin contexto inmobiliario o local.

Referencias: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics · https://developers.google.com/search/docs/fundamentals/seo-starter-guide · https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
