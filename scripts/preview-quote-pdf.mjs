import { mkdir, writeFile } from 'node:fs/promises';
import { PACKS, SERVICES, ADDONS } from '../src/components/pricingData.js';
import { validateRequest } from '../server/commercial/domain.js';
import { createQuotePdf } from '../server/commercial/quotePdf.js';

const data = validateRequest({ name: 'María Fernández', email: 'cliente@example.com', zone: 'Nordelta, Tigre', propertyType: 'Casa', m2: 250, pack: 'destacado', videos: ['cine'], addons: [ADDONS[0].name] }, { packs: PACKS, services: SERVICES, addons: ADDONS });
const sample = { ...data, id: '12345678-1234-4123-8123-123456789abc', total: data.snapshot.total, deposit: 15000, is_test: true, created_at: '2026-10-28T15:00:00Z', valid_until: '2026-11-11T15:00:00Z', terms: 'El presupuesto tiene una vigencia de 14 días. La seña confirma la reserva y se descuenta del importe total. El cupo de la semana seleccionada se retiene durante 72 horas, sujeto a la vigencia de la propuesta. La producción está sujeta a condiciones climáticas y acceso a la propiedad. El alcance y los valores corresponden a los servicios y la superficie indicados en este documento.' };
const pdf = await createQuotePdf(sample, { link: 'https://www.arkostudio.com.ar/presupuesto#ejemplo-sin-validez' });
await mkdir('output/pdf', { recursive: true });
await writeFile('output/pdf/presupuesto-arko-ejemplo.pdf', pdf.content);
console.log('output/pdf/presupuesto-arko-ejemplo.pdf');
