import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { PACKS, SERVICES, ADDONS } from '../src/components/pricingData.js';
import { validateRequest } from '../server/commercial/domain.js';
import { createQuotePdf, quoteLineItems } from '../server/commercial/quotePdf.js';
import { prepareEmail, processJobs } from '../server/commercial/jobs.js';
import { sendZoho } from '../server/commercial/providers.js';
import handler from '../api/commercial.js';
const catalog = { packs: PACKS.map(p => ({ ...p })), services: SERVICES, addons: ADDONS };
const request = { name: 'María', email: 'cliente@example.com', zone: 'Tigre', m2: 250, propertyType: 'Casa', pack: 'destacado', videos: ['cine'], addons: [ADDONS[0].name] };
const quote = input => { const data = validateRequest({ ...request, ...input }, catalog); return { ...data, id: '12345678-1234-4123-8123-123456789abc', total: data.snapshot.total, deposit: 15000, created_at: '2026-10-28T15:00:00Z', valid_until: '2030-11-11T15:00:00Z', approved_at: '2026-10-28T15:00:00Z', terms: 'La reserva confirma el cupo de producción. Coordinamos el día según clima y acceso.', stage: 'ready', is_test: true }; };
Object.assign(process.env, { COMMERCIAL_MODE: 'test', COMMERCIAL_SITE_URL: 'https://www.arkostudio.com.ar', QUOTE_LINK_SECRET: 'test-only-secret-with-more-than-32-characters', ZOHO_CLIENT_ID: 'test', ZOHO_CLIENT_SECRET: 'test', ZOHO_REFRESH_TOKEN: 'test', ZOHO_ACCOUNT_ID: '123', COMMERCIAL_TEST_EMAIL: 'owner@example.com', SUPABASE_URL: 'https://db.test', SUPABASE_SERVICE_ROLE_KEY: 'test' });

test('pack and a la carte breakdowns reconcile and keep original catalog prices', () => {
  const q = quote();
  assert.deepEqual(q.snapshot.lineItems.map(r => [r.quantity, r.unitPrice, r.total]), [[1, 285000, 285000], [2, 50000, 100000], [1, 50000, 50000]]);
  assert.equal(q.total, 435000);
  for (const input of [{ m2: 100 }, { m2: 100.1 }, { pack: 'custom', services: ['foto', 'cine'] }, { pack: 'base', videos: [], addons: [] }]) {
    const q = quote(input); assert.equal(quoteLineItems(q).reduce((sum, row) => sum + row.total, 0), q.total);
  }
  const saved = JSON.stringify(q.snapshot); catalog.packs[1] = { ...catalog.packs[1], base: 1 };
  assert.equal(JSON.stringify(q.snapshot), saved); catalog.packs[1] = PACKS[1];
  assert.throws(() => quoteLineItems({ ...q, total: q.total + 1 }));
});

test('older quotes preserve agreed amounts without guessing historical service prices', () => {
  const q = quote(); delete q.snapshot.lineItems;
  const rows = quoteLineItems(q);
  assert.equal(rows.length, 2); assert.equal(rows[0].total, 385000);
  assert.equal(rows.reduce((sum, r) => sum + r.total, 0), q.total);
});

test('generated PDF is readable, paginated and has a working private booking link', async () => {
  const link = 'https://www.arkostudio.com.ar/presupuesto#private-token';
  const result = await createQuotePdf(quote(), { link });
  assert.equal(result.content.subarray(0, 5).toString(), '%PDF-');
  const doc = await PDFDocument.load(result.content); assert.ok(doc.getPageCount() >= 1);
  let target;
  for (const page of doc.getPages()) for (const ref of page.node.Annots()?.asArray() || []) {
    const annotation = doc.context.lookup(ref); const action = annotation.lookup(PDFName.of('A'));
    target = action.lookup(PDFName.of('URI'), PDFString).decodeText();
  }
  assert.equal(target, link);
  const long = await createQuotePdf({ ...quote(), name: 'María '.repeat(20), zone: 'Zona '.repeat(40), terms: 'Condición extensa para revisar saltos de página. '.repeat(100) });
  assert.ok((await PDFDocument.load(long.content)).getPageCount() > doc.getPageCount());
});

test('formal email replaces old verbose templates and always includes a PDF', async () => {
  const result = await prepareEmail('quote', quote(), null, { subject: 'Propuesta {nombre}', body: '{detalle} {total} {condiciones}' });
  assert.ok(result.text.includes('adjunto')); assert.ok(!result.text.includes('435.000'));
  assert.equal(result.attachments.length, 1); assert.equal(result.linkLabel, 'Elegir semana y reservar');
  const reminder = await prepareEmail('reminder', quote(), null, { subject: 'Recordatorio', body: 'Reservá: {enlace}' });
  assert.equal(reminder.attachments, undefined);
});

test('Zoho uploads the actual PDF before dispatch and uses the returned attachment metadata', async () => {
  const before = globalThis.fetch, calls = [];
  const attachment = await createQuotePdf(quote());
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('/oauth/')) return new Response(JSON.stringify({ access_token: 'test', expires_in: 3600 }));
    calls.push({ url: String(url), ...options });
    if (String(url).includes('/attachments?')) return new Response(JSON.stringify({ status: { code: 200 }, data: [{ storeName: 'store', attachmentName: attachment.filename, attachmentPath: '/Mail/quote.pdf' }] }));
    return new Response(JSON.stringify({ status: { code: 200 }, data: { messageId: 'sent' } }));
  };
  try {
    await sendZoho({ to: 'customer@example.com', subject: 'Presupuesto', text: 'Adjunto.', attachments: [attachment] });
    assert.equal(calls.length, 2);
    assert.ok(calls[0].url.includes('uploadType=multipart&isInline=false'));
    assert.equal(calls[0].headers['Content-Type'], undefined);
    const file=calls[0].body.get('attach');
    assert.equal(file.name, attachment.filename); assert.equal(file.type, 'application/pdf');
    assert.deepEqual(Buffer.from(await file.arrayBuffer()), attachment.content);
    const sent = JSON.parse(calls[1].body); assert.equal(sent.toAddress, 'owner@example.com');
    assert.deepEqual(sent.attachments, [{ storeName: 'store', attachmentName: attachment.filename, attachmentPath: '/Mail/quote.pdf' }]);
    calls.length = 0;
    globalThis.fetch = async (url) => { calls.push(String(url)); return new Response('{}', { status: 500 }); };
    await assert.rejects(sendZoho({ to: 'customer@example.com', subject: 'Presupuesto', text: 'Adjunto.', attachments: [attachment] }), /adjunto/);
    assert.equal(calls.length, 1); assert.ok(calls[0].includes('/attachments?'));
  } finally { globalThis.fetch = before; }
});

test('scheduled quote dispatch sends the generated attachment and short body', async () => {
  const before = globalThis.fetch, q = quote(), patches = []; let claimed = false, sent;
  globalThis.fetch = async (url, options = {}) => {
    url = String(url);
    const json = v => new Response(JSON.stringify(v));
    if (url.includes('/oauth/')) return json({ access_token: 'test', expires_in: 3600 });
    if (url.includes('mail.zoho.com')) {
      if (url.includes('/attachments?')) return json({ status: { code: 200 }, data: { storeName: 'store', attachmentName: 'quote.pdf', attachmentPath: '/Mail/quote.pdf' } });
      sent = JSON.parse(options.body); return json({ status: { code: 200 }, data: { messageId: 'sent' } });
    }
    if (url.includes('com_settings?')) return json([{ emails_enabled: true }]);
    if (url.includes('/rpc/com_expire')) return json(null);
    if (url.includes('/rpc/com_claim_job')) { if (claimed) return json(null); claimed = true; return json({ id: 'job', claim_id: 'claim', quote_id: q.id, template_key: 'quote', attempts: 1 }); }
    if (url.includes('com_quotes?')) return json([q]);
    if (url.includes('com_reservations?')) return json([]);
    if (url.includes('com_templates?')) return json([{ enabled: true, subject: 'Tu presupuesto', body: 'TOTAL ANTIGUO {total}' }]);
    if (url.includes('com_jobs?')) { patches.push(JSON.parse(options.body)); return json([]); }
    throw new Error(`Unexpected request ${url}`);
  };
  try {
    assert.equal((await processJobs(1)).sent, 1);
    assert.equal(sent.attachments.length, 1); assert.ok(sent.content.includes('adjunto')); assert.ok(!sent.content.includes('TOTAL ANTIGUO'));
    assert.ok(patches.some(p => p.status === 'sent' && p.last_error === null));
  } finally { globalThis.fetch = before; }
});

test('admin email preview uses the same PDF attachment flow', async () => {
  const before = globalThis.fetch; let sent, upload;
  globalThis.fetch = async (url, options = {}) => {
    url = String(url); const json = v => new Response(JSON.stringify(v));
    if (url.includes('/auth/v1/user')) return json({ id: 'admin', email: 'owner@example.com' });
    if (url.includes('com_admins?')) return json([{ user_id: 'admin' }]);
    if (url.includes('com_settings?')) return json([{ catalog, deposit: 15000, quote_days: 14, terms: 'Condiciones guardadas de prueba.' }]);
    if (url.includes('com_templates?')) return json([{ subject: 'Tu presupuesto', body: 'Mensaje antiguo', draft_subject: 'Prueba de presupuesto' }]);
    if (url.includes('/oauth/')) return json({ access_token: 'test', expires_in: 3600 });
    if (url.includes('/attachments?')) { upload = options.body; return json({ status: { code: 200 }, data: { storeName: 'store', attachmentName: 'quote.pdf', attachmentPath: '/Mail/quote.pdf' } }); }
    if (url.includes('mail.zoho.com')) { sent = JSON.parse(options.body); return json({ status: { code: 200 }, data: { messageId: 'sent' } }); }
    throw new Error(`Unexpected request ${url}`);
  };
  const req = { method: 'POST', query: { action: 'admin_test_email' }, headers: { authorization: 'Bearer admin', origin: process.env.COMMERCIAL_SITE_URL }, body: { key: 'quote' } };
  let status, response;
  const res = { setHeader() {}, status(value) { status = value; return this; }, json(value) { response = value; return this; } };
  try {
    await handler(req, res); assert.equal(status, 200, JSON.stringify(response));
    assert.equal(Buffer.from(await upload.get('attach').arrayBuffer()).subarray(0, 5).toString(), '%PDF-'); assert.equal(sent.attachments.length, 1);
    assert.ok(sent.content.includes('adjunto')); assert.ok(sent.content.includes('Elegir semana y reservar'));
  } finally { globalThis.fetch = before; }
});
