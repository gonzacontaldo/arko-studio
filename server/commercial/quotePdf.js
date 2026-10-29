import { PDFDocument, PDFString, StandardFonts, rgb } from 'pdf-lib';
import { FlowError, money } from './domain.js';

const colors = { ink: '#292524', muted: '#6c655c', gold: '#826527', pale: '#f6f3ed', line: '#ddd5c7' };
const color = hex => rgb(...hex.replace('#', '').match(/../g).map(v => parseInt(v, 16) / 255));
const clean = value => String(value ?? '').normalize('NFC').replace(/[\u0000-\u001f]/g, ' ').replace(/[\u2010-\u2015]/g, '-').replace(/[^\u0020-\u00ff\u20ac]/g, '');
const date = value => value ? new Date(value).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }) : 'A definir';
export const quoteNumber = q => `ARKO-${String(q.id).slice(0, 8).toUpperCase()}`;

// Older quotes intentionally use their saved total; never rebuild them with today's catalog.
export function quoteLineItems(q) {
  if (q.snapshot.lineItems?.length) {
    const rows = q.snapshot.lineItems;
    if (rows.some(r => !Number.isSafeInteger(r.quantity) || r.quantity < 1 || !Number.isSafeInteger(r.unitPrice) || r.unitPrice < 0 || r.total !== r.quantity * r.unitPrice) || rows.reduce((sum, r) => sum + r.total, 0) !== Number(q.total)) throw new FlowError('El desglose del presupuesto requiere revisión.', 503);
    return rows;
  }
  const addons = q.snapshot.addons || [];
  const base = Number(q.total) - addons.reduce((sum, a) => sum + a.price, 0);
  if (!Number.isSafeInteger(base) || base < 0) throw new FlowError('El presupuesto requiere revisión.', 503);
  return [{ description: q.snapshot.pack === 'A la carta' ? 'Servicios a la carta - importe acordado' : `Pack ${q.snapshot.pack} - importe acordado`, quantity: 1, unitPrice: base, total: base }, ...addons.map(a => ({ description: a.name, quantity: 1, unitPrice: a.price, total: a.price }))];
}

export async function createQuotePdf(q, { link } = {}) {
  const rows = quoteLineItems(q);
  const doc = await PDFDocument.create();
  doc.setTitle(`Presupuesto ${quoteNumber(q)} | ARKO Studio`);
  doc.setAuthor('ARKO Studio');
  doc.setSubject('Propuesta de producción audiovisual inmobiliaria');
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const W = 595.28, H = 841.89, M = 44, width = W - M * 2;
  let page, y;
  const text = (value, x, top, size = 10, font = regular, ink = colors.ink) => page.drawText(clean(value), { x, y: H - top - size, size, font, color: color(ink) });
  const rect = (x, top, w, h, fill) => page.drawRectangle({ x, y: H - top - h, width: w, height: h, color: color(fill) });
  const line = top => page.drawLine({ start: { x: M, y: H - top }, end: { x: W - M, y: H - top }, thickness: 0.7, color: color(colors.line) });
  const wrap = (value, max, size = 10, font = regular) => {
    const result = [];
    for (const paragraph of String(value ?? '').split('\n')) {
      let current = '';
      // Split long unbroken input too (emails, URLs, long customer names).
      for (const word of clean(paragraph).split(/\s+/)) {
        if (font.widthOfTextAtSize((current ? current + ' ' : '') + word, size) <= max) current += (current ? ' ' : '') + word;
        else {
          if (current) result.push(current);
          current = '';
          for (const char of word) {
            if (font.widthOfTextAtSize(current + char, size) > max) { result.push(current); current = ''; }
            current += char;
          }
        }
      }
      result.push(current);
    }
    return result;
  };
  const newPage = () => {
    page = doc.addPage([W, H]);
    rect(0, 0, W, 9, colors.gold);
    text('ARKO', M, 32, 27, bold);
    text('STUDIO', M + 88, 43, 11, regular, colors.gold);
    text('PRODUCCIÓN AUDIOVISUAL INMOBILIARIA', M, 70, 8, regular, colors.muted);
    text('PRESUPUESTO', 365, 34, 14, bold, colors.gold);
    text(quoteNumber(q), 365, 57, 10, bold);
    line(94);
    y = 115;
  };
  const ensure = h => { if (y + h > 765) newPage(); };
  const block = (value, { size = 10, font = regular, ink = colors.ink, gap = 5 } = {}) => {
    for (const row of wrap(value, width, size, font)) { ensure(size + 6); text(row, M, y, size, font, ink); y += size + 5; }
    y += gap;
  };
  const heading = value => { ensure(55); y += 10; block(value, { size: 11, font: bold, ink: colors.gold, gap: 8 }); };
  newPage();
  block('Propuesta de producción', { size: 22, font: bold, gap: 10 });
  block(`Emisión: ${date(q.approved_at || q.created_at)}     |     Válido hasta: ${date(q.valid_until)}`, { size: 9, ink: colors.muted });
  if (q.is_test) block('EJEMPLO / PRUEBA - sin validez comercial', { font: bold, ink: colors.gold });
  heading('01 / CLIENTE Y PROPIEDAD');
  block(`Cliente: ${q.name}\nEmail: ${q.email}\nUbicación: ${q.zone}\nPropiedad: ${q.snapshot.propertyType || 'Tipo a confirmar'} | Superficie a relevar: ${q.m2} m²`, { gap: 8 });
  heading('02 / DETALLE ECONÓMICO');
  const tableHeader = () => { rect(M, y, width, 25, colors.ink); text('CONCEPTO', M + 10, y + 7, 8, bold, '#ffffff'); text('CANT.', 323, y + 7, 8, bold, '#ffffff'); text('P. UNITARIO', 366, y + 7, 8, bold, '#ffffff'); text('IMPORTE', 477, y + 7, 8, bold, '#ffffff'); y += 25; };
  tableHeader();
  rows.forEach((row, i) => {
    const lines = wrap(row.description, 250, 9);
    const height = Math.max(34, lines.length * 13 + 18);
    if (y + height > 765) { newPage(); tableHeader(); }
    if (i % 2 === 0) rect(M, y, width, height, colors.pale);
    lines.forEach((v, j) => text(v, M + 10, y + 10 + j * 13, 9));
    text(row.quantity, 327, y + 10, 9);
    const unit = money(row.unitPrice), total = money(row.total);
    text(unit, 442 - regular.widthOfTextAtSize(clean(unit), 9), y + 10, 9);
    text(total, W - M - 10 - bold.widthOfTextAtSize(clean(total), 9), y + 10, 9, bold);
    y += height; line(y);
  });
  y += 14; ensure(120);
  rect(M, y, width, 46, colors.ink);
  text('TOTAL PRESUPUESTADO', M + 14, y + 15, 10, bold, '#ffffff');
  const totalLabel = `${money(q.total)} ARS`;
  text(totalLabel, W - M - 14 - bold.widthOfTextAtSize(clean(totalLabel), 18), y + 11, 18, bold, '#ffffff');
  y += 56;
  block('Precios finales en pesos argentinos. IVA incluido.', { size: 9, ink: colors.muted });
  block(`Seña para confirmar la reserva: ${money(q.deposit)}\nSaldo restante: ${money(q.total - q.deposit)}`, { size: 10, font: bold });
  if (!q.snapshot.lineItems) block('Propuesta anterior: el importe acordado incluye la superficie indicada. Se conservan los valores originales.', { size: 9, ink: colors.muted });
  block('El alcance de los servicios y las condiciones se detallan a continuación. Este documento es un presupuesto, no una factura.', { size: 9, ink: colors.muted });
  newPage();
  heading('03 / ALCANCE DE LOS SERVICIOS');
  block(q.snapshot.pack === 'A la carta' ? 'Selección de servicios a la carta.' : `Pack ${q.snapshot.pack}: los servicios que siguen están incluidos en el precio del conjunto.`, { size: 9, ink: colors.muted });
  const details = q.snapshot.serviceDetails || [...q.snapshot.services, ...q.snapshot.videos].map(name => ({ name }));
  for (const service of details) {
    ensure(50);
    block(service.name, { size: 10, font: bold, gap: 0 });
    if (service.description) block(service.description, { size: 9, ink: colors.muted, gap: 7 });
  }
  for (const addon of q.snapshot.addons) {
    ensure(50); block(`Adicional: ${addon.name}`, { size: 10, font: bold, gap: 0 });
    if (addon.description) block(addon.description, { size: 9, ink: colors.muted });
  }
  heading('04 / CONDICIONES Y RESERVA');
  block(q.terms, { size: 9 });
  if(q.snapshot.scopeOfWork) block(`Alcance acordado: ${q.snapshot.scopeOfWork}`, {size:9});
  block('La reserva corresponde a un cupo dentro de la semana elegida. El día y horario se coordinan según disponibilidad, clima y acceso a la propiedad.', { size: 9 });
  if (link) {
    ensure(60); y += 8;
    const label = 'Elegir semana y reservar';
    page.drawText(label, { x: M, y: H - y - 11, size: 11, font: bold, color: color(colors.gold) });
    // pdf-lib exposes PDF annotations through its object model.
    const annotation = doc.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [M, H - y - 18, M + 220, H - y + 3], Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of(link) } });
    page.node.addAnnot(doc.context.register(annotation));
    y += 30;
  }
  for (const [i, p] of doc.getPages().entries()) {
    page = p; line(787);
    text('ARKO Studio | contacto@arkostudio.com.ar', M, 797, 8, regular, colors.muted);
    text(`${i + 1} / ${doc.getPageCount()}`, 511, 797, 8, regular, colors.muted);
    text(`Referencia: ${q.id}`, M, 812, 7, regular, colors.muted);
  }
  return { filename: `Presupuesto-${quoteNumber(q)}.pdf`, content: Buffer.from(await doc.save()) };
}
