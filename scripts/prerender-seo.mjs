import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { services } from '../src/data/services.js';

const root = resolve('dist');
const template = await readFile(resolve(root, 'index.html'), 'utf8');
const site = 'https://www.arkostudio.com.ar';
const image = `${site}/portfolio-web/Civis/Portada.jpg`;
const routes = [
  { path: '/', title: 'Fotografía y Video Inmobiliario en Buenos Aires | ARKO Studio', description: 'Fotografía profesional, video, drone, planos y tours virtuales 360° para propiedades, inmobiliarias y desarrolladoras en Buenos Aires y Zona Norte.', h1: 'Fotografía y video inmobiliario en Buenos Aires', intro: 'Producción audiovisual para propiedades, inmobiliarias y desarrolladoras.' },
  { path: '/portfolio', title: 'Portfolio de Fotografía y Video Inmobiliario | ARKO Studio', description: 'Trabajos de fotografía, video, drone y tours virtuales 360° realizados por ARKO Studio para propiedades en Buenos Aires.', h1: 'Portfolio de producción inmobiliaria', intro: 'Fotografía, video, tours virtuales y tomas aéreas para real estate.' },
  ...Object.entries(services).map(([slug, service]) => ({ path: `/${slug}`, ...service })),
];
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const replace = (html, regex, value) => html.replace(regex, (_, start, _old, end) => `${start}${esc(value)}${end}`);

for (const route of routes) {
  const url = `${site}${route.path === '/' ? '/' : route.path}`;
  let html = template.replace(/<title>.*?<\/title>/, `<title>${esc(route.title)}</title>`);
  html = replace(html, /(<meta name="description" content=")(.*?)(" \/>)/, route.description);
  html = replace(html, /(<link rel="canonical" href=")(.*?)(" \/>)/, url);
  html = replace(html, /(<meta property="og:url" content=")(.*?)(" \/>)/, url);
  html = replace(html, /(<meta property="og:title" content=")(.*?)(" \/>)/, route.title);
  html = replace(html, /(<meta property="og:description" content=")(.*?)(" \/>)/, route.description);
  html = replace(html, /(<meta name="twitter:title" content=")(.*?)(" \/>)/, route.title);
  html = replace(html, /(<meta name="twitter:description" content=")(.*?)(" \/>)/, route.description);
  const business = { '@type': 'LocalBusiness', name: 'Arko Studio', url: site, telephone: '+54 9 11 7649-8888', email: 'gonzalo@arkostudio.com.ar', sameAs: ['https://instagram.com/arkostudio.ar', 'https://www.youtube.com/@arkostudio-media'] };
  const areaServed = [{ '@type': 'AdministrativeArea', name: 'Provincia de Buenos Aires' }, { '@type': 'City', name: 'Ciudad Autónoma de Buenos Aires' }, { '@type': 'Place', name: 'Zona Norte de Buenos Aires' }];
  const schema = route.path === '/' ? { '@context': 'https://schema.org', ...business, description: route.description, logo: `${site}/favicon.png`, image, openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '08:00', closes: '21:00' }], areaServed } : { '@context': 'https://schema.org', '@type': route.path === '/portfolio' ? 'CollectionPage' : 'Service', name: route.h1, url, description: route.description, ...(route.path !== '/portfolio' && { provider: business, areaServed }) };
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script></head>`);
  html = html.replace('<div id="root"></div>', `<div id="root"><main id="seo-content"><h1>${esc(route.h1)}</h1><p>${esc(route.intro || route.description)}</p></main></div>`);
  const output = route.path === '/' ? resolve(root, 'index.html') : resolve(root, route.path.slice(1), 'index.html');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
}
console.log(`Prerendered ${routes.length} public SEO routes.`);
