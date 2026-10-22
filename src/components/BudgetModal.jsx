import { useState, useEffect, useRef } from 'react';
import { PACKS, SERVICE_BY_ID, ADDONS } from './pricingData';

const VIDEOS = ['cine', 'fpv', 'reel'];
const TIMING = ['Esta semana', 'En las próximas 2 semanas', 'Dentro de un mes', 'Más adelante', 'Todavía no tengo fecha'];
const emptyForm = () => ({ pack: '', m2: '', name: '', email: '', zone: '', timing: '', videos: [], addons: [], message: '' });
const priceFor = (pack, m2) => pack.base + pack.per100 * Math.max(0, Math.ceil((Number(m2) - 100) / 100));
const money = n => `$ ${n.toLocaleString('es-AR')}`;

export default function BudgetModal({ isOpen, onClose, initialSelection }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const panel = useRef(null);
  const selected = PACKS.find(p => p.id === form.pack);
  const canAddExtras = form.videos.some(id => id === 'cine' || id === 'reel');
  const validArea = Number(form.m2) > 0 && Number.isFinite(Number(form.m2));
  const estimate = selected && validArea ? priceFor(selected, form.m2) + form.addons.length * 50000 : null;

  useEffect(() => {
    if (!isOpen) return;
    if (initialSelection) {
      setForm(prev => ({ ...prev, pack: initialSelection.pack || '', m2: initialSelection.m2 ? String(initialSelection.m2) : '', videos: [], addons: [] }));
      setErrors({});
    }
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const handler = e => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const fields = [...(panel.current?.querySelectorAll('button, input, select, textarea, a[href]') || [])].filter(el => !el.disabled);
      if (!fields.length) return;
      const first = fields[0], last = fields[fields.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handler); previousFocus?.focus(); };
  }, [isOpen, onClose, initialSelection]);

  if (!isOpen) return null;
  const change = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value, ...(field === 'pack' ? { videos: [], addons: [] } : {}), ...(field === 'videos' && !value.some(id => id === 'cine' || id === 'reel') ? { addons: [] } : {}) }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };
  const toggle = (field, value) => change(field, form[field].includes(value) ? form[field].filter(v => v !== value) : [...form[field], value]);
  const submit = e => {
    e.preventDefault();
    const next = {};
    if (!selected) next.pack = 'Elegí un pack.';
    if (!validArea) next.m2 = 'Ingresá una superficie mayor a 0 m².';
    if (!form.name.trim()) next.name = 'Ingresá tu nombre.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Ingresá un email válido.';
    if (!form.zone.trim()) next.zone = 'Indicá el barrio o localidad de la propiedad.';
    if (!TIMING.includes(form.timing)) next.timing = 'Seleccioná cuándo querés producir.';
    if (selected?.videos && form.videos.length !== selected.videos) next.videos = `Elegí ${selected.videos} ${selected.videos === 1 ? 'video' : 'videos'}.`;
    setErrors(next);
    if (Object.keys(next).length) {
      panel.current?.querySelector(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }
    const text = [
      '¡Hola! Quiero solicitar un presupuesto para una producción.',
      `Nombre: ${form.name.trim()}`, `Email: ${form.email.trim()}`,
      `Pack: ${selected.name}`, `Superficie: ${form.m2} m²`,
      `Zona de la propiedad: ${form.zone.trim()}`, `Plazo de producción: ${form.timing}`,
      form.videos.length ? `Videos: ${form.videos.map(id => SERVICE_BY_ID[id].name).join(', ')}` : '',
      form.addons.length ? `Adicionales: ${form.addons.join(', ')} (${money(50000)} cada uno)` : '',
      `Precio estimado: ${money(estimate)} (IVA incluido; sujeto a confirmación según locación y características del inmueble).`,
      form.message.trim() ? `Comentarios: ${form.message.trim()}` : '',
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/5491176498888?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };
  const inputClass = 'w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary';
  const error = field => errors[field] && <p id={`budget-${field}-error`} role="alert" className="text-error text-xs mt-1">{errors[field]}</p>;
  const fieldProps = field => ({ id: `budget-${field}`, name: field, value: form[field], onChange: e => change(field, e.target.value), required: true, 'aria-invalid': !!errors[field], 'aria-describedby': errors[field] ? `budget-${field}-error` : undefined });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-on-surface/60 backdrop-blur-sm" />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="budget-title" tabIndex={-1} className="relative bg-white w-full max-w-4xl max-h-[90dvh] overflow-y-auto rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="editorial-gradient px-5 md:px-8 py-6 flex justify-between items-start gap-4">
          <div><p className="text-white/70 text-xs uppercase tracking-widest mb-2">Arko Studio</p><h2 id="budget-title" className="font-headline font-extrabold text-2xl text-white">Armá tu producción</h2><p className="text-white/80 text-sm mt-2">Elegí tu pack y contanos sobre la propiedad para recibir una propuesta.</p></div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-white p-2"><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={submit} noValidate className="p-5 md:p-8 space-y-7">
          <fieldset><legend className="font-headline font-bold mb-3">1. Elegí tu pack *</legend>
            <div className="grid md:grid-cols-3 gap-3">
              {PACKS.map(pack => <label key={pack.id} className={`relative border-2 rounded-xl p-4 cursor-pointer ${form.pack === pack.id ? 'border-secondary bg-secondary/5' : 'border-outline-variant/50'}`}>
                <div className="flex gap-2 items-center mb-2"><input type="radio" name="pack" value={pack.id} checked={form.pack === pack.id} onChange={() => change('pack', pack.id)} className="accent-secondary" /><span className="font-headline font-bold">{pack.name}</span></div>
                <p className="font-bold text-secondary mb-1">{money(priceFor(pack, validArea ? form.m2 : 100))}</p>
                <p className="text-xs text-on-surface-variant mb-3">{validArea ? `para ${form.m2} m²` : 'hasta 100 m²'} · IVA incluido</p>
                <ul className="text-xs space-y-2">{pack.services.map(id => <li key={id}>{SERVICE_BY_ID[id].name}</li>)}{pack.videos && <li className="font-semibold">{pack.videos} {pack.videos === 1 ? 'video a elección' : 'videos a elección'}</li>}</ul>
              </label>)}
            </div>{error('pack')}
          </fieldset>
          <div><label htmlFor="budget-m2" className="block text-sm font-bold mb-2">Superficie de la propiedad (m²) *</label><input {...fieldProps('m2')} type="number" min="1" step="any" placeholder="Ej: 150" className={inputClass} />{error('m2')}<p className="text-xs text-on-surface-variant mt-2">El precio se calcula por tramos de 100 m², redondeando al tramo siguiente.</p></div>
          {!!selected?.videos && <fieldset><legend className="font-bold text-sm mb-3">Elegí {selected.videos} {selected.videos === 1 ? 'video' : 'videos'} *</legend><div className="flex flex-wrap gap-3">{VIDEOS.map(id => <label key={id} className="border border-outline-variant rounded-lg p-3 text-sm flex gap-2 items-center"><input type="checkbox" name="videos" checked={form.videos.includes(id)} disabled={!form.videos.includes(id) && form.videos.length >= selected.videos} onChange={() => toggle('videos', id)} className="accent-secondary" />{SERVICE_BY_ID[id].name}</label>)}</div>{error('videos')}</fieldset>}
          {canAddExtras && <fieldset><legend className="font-bold text-sm mb-1">Adicionales opcionales</legend><p className="text-xs text-on-surface-variant mb-3">Para videos cinematográficos o reels. {money(50000)} cada uno.</p>{ADDONS.map(addon => <label key={addon.name} className="flex gap-3 items-start py-2 text-sm"><input type="checkbox" checked={form.addons.includes(addon.name)} onChange={() => toggle('addons', addon.name)} className="accent-secondary mt-1" /><span>{addon.name} <strong className="text-secondary">+ {money(addon.price)}</strong></span></label>)}</fieldset>}
          <fieldset><legend className="font-headline font-bold mb-4">2. Contanos sobre vos y la propiedad</legend><div className="grid md:grid-cols-2 gap-4">
            <div><label htmlFor="budget-name" className="block text-sm font-semibold mb-2">Nombre completo *</label><input {...fieldProps('name')} autoComplete="name" maxLength={120} placeholder="Tu nombre y apellido" className={inputClass} />{error('name')}</div>
            <div><label htmlFor="budget-email" className="block text-sm font-semibold mb-2">Email *</label><input {...fieldProps('email')} type="email" autoComplete="email" maxLength={254} placeholder="tu@email.com" className={inputClass} />{error('email')}</div>
            <div><label htmlFor="budget-zone" className="block text-sm font-semibold mb-2">Zona de la propiedad *</label><input {...fieldProps('zone')} maxLength={200} placeholder="Ej: Palermo, CABA / Nordelta, Tigre" className={inputClass} />{error('zone')}</div>
            <div><label htmlFor="budget-timing" className="block text-sm font-semibold mb-2">¿Cuándo querés hacer la producción? *</label><select {...fieldProps('timing')} className={inputClass}><option value="">Seleccioná un plazo</option>{TIMING.map(t => <option key={t}>{t}</option>)}</select>{error('timing')}</div>
          </div></fieldset>
          <div><label htmlFor="budget-message" className="block text-sm font-semibold mb-2">Comentarios (opcional)</label><textarea id="budget-message" value={form.message} onChange={e => change('message', e.target.value)} rows={3} maxLength={2000} placeholder="Tipo de propiedad, fecha tentativa u otros detalles…" className={inputClass} /></div>
          <div className="bg-surface rounded-xl p-4"><p className="font-bold">{estimate !== null ? `Total estimado: ${money(estimate)}` : 'Elegí un pack e ingresá los m² para ver el total.'}</p><p className="text-xs text-on-surface-variant mt-2">IVA incluido. El valor final se confirma según locación, terreno, amenities y requerimientos de producción. La fecha está sujeta a disponibilidad.</p></div>
          <button type="submit" className="w-full editorial-gradient text-white font-bold text-sm py-4 rounded-lg">Continuar por WhatsApp</button>
          <p className="text-center text-on-surface-variant text-xs">Se abrirá WhatsApp con todos los datos y el precio estimado. Enviá el mensaje para que recibamos tu consulta. Usaremos tu email para contactarte sobre este pedido.</p>
        </form>
      </div>
    </div>
  );
}
