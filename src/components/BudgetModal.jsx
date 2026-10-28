import { useState, useEffect, useRef } from 'react';
import { PACKS as DEFAULT_PACKS, SERVICE_BY_ID as DEFAULT_SERVICES, ADDONS as DEFAULT_ADDONS } from './pricingData';
import { useCommercialConfig, commercialApi } from '../lib/commercial';

const PROPERTY_TYPES = ['Lote / terreno', 'Casa', 'Departamento', 'Oficina / local', 'Complejo de oficinas', 'Edificio entero', 'Otro'];
const STEPS = ['Propiedad', 'Ubicación', 'Servicios', 'Contacto'];
const VIDEOS = ['cine', 'fpv', 'reel'];
const emptyForm = () => ({ propertyType: '', services: [], pack: '', m2: '', name: '', email: '', zone: '', videos: [], addons: [], message: '' });
const priceFor = (pack, m2) => pack.base + pack.per100 * Math.max(0, Math.ceil((Number(m2) - 100) / 100));
const money = n => `$ ${n.toLocaleString('es-AR')}`;

export default function BudgetModal({ isOpen, onClose, initialSelection }) {
  const config = useCommercialConfig();
  const PACKS = config.catalog?.packs || DEFAULT_PACKS;
  const ADDONS = config.catalog?.addons || DEFAULT_ADDONS;
  const SERVICE_BY_ID = config.catalog ? Object.fromEntries(config.catalog.services.map(s => [s.id, s])) : DEFAULT_SERVICES;
  const requestKey = useRef(crypto.randomUUID());
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [reservationUrl, setReservationUrl] = useState('');
  useEffect(() => { if (reservationUrl) { panel.current?.scrollTo(0, 0); panel.current?.focus(); } }, [reservationUrl]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const panel = useRef(null);
  const stepTitle = useRef(null);
  useEffect(() => { if (isOpen) { stepTitle.current?.focus(); panel.current?.scrollTo(0, 0); } }, [step, isOpen]);
  const selected = PACKS.find(p => p.id === form.pack);
  const activeVideos = form.pack === 'custom' ? form.services : form.videos;
  const canAddExtras = activeVideos.some(id => id === 'cine' || id === 'reel');
  const validArea = Number(form.m2) >= 1 && Number(form.m2) <= 100000 && Number.isFinite(Number(form.m2));
  const customServices = Object.values(SERVICE_BY_ID).filter(s => form.services.includes(s.id));
  const estimate = validArea && (selected || customServices.length) ? (form.pack === 'custom' ? customServices.reduce((sum, s) => sum + priceFor(s, form.m2), 0) : priceFor(selected, form.m2)) + ADDONS.filter(a => form.addons.includes(a.name)).reduce((sum, a) => sum + a.price, 0) : null;

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
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
      const fields = [...(panel.current?.querySelectorAll('button, input, select, textarea, a[href]') || [])].filter(el => !el.disabled && el.getClientRects().length);
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
    requestKey.current = crypto.randomUUID();
    setForm(prev => ({ ...prev, [field]: value, ...(field === 'pack' ? { services: [], videos: [], addons: [] } : {}), ...((field === 'videos' || (field === 'services' && form.pack === 'custom')) && !value.some(id => id === 'cine' || id === 'reel') ? { addons: [] } : {}) }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };
  const toggle = (field, value) => change(field, form[field].includes(value) ? form[field].filter(v => v !== value) : [...form[field], value]);
  const submit = async e => {
    e.preventDefault();
    const next = {};
    if (!form.propertyType) next.propertyType = 'Elegí el tipo de propiedad.';
    if (!selected && form.pack !== 'custom') next.pack = 'Elegí un pack o servicios a la carta.';
    if (form.pack === 'custom' && !form.services.length) next.services = 'Elegí al menos un servicio.';
    if (!validArea) next.m2 = 'Ingresá una superficie entre 1 y 100.000 m².';
    if (!form.name.trim()) next.name = 'Ingresá tu nombre.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Ingresá un email válido.';
    if (!form.zone.trim()) next.zone = 'Indicá el barrio o localidad de la propiedad.';
    if (selected?.videos && form.videos.length !== selected.videos) next.videos = `Elegí ${selected.videos} ${selected.videos === 1 ? 'video' : 'videos'}.`;
    const groups = [['propertyType', 'm2'], ['zone'], ['pack', 'services', 'videos'], ['name', 'email']];
    if (step < 3) {
      const current = Object.fromEntries(Object.entries(next).filter(([key]) => groups[step].includes(key)));
      setErrors(current);
      if (!Object.keys(current).length) setStep(step + 1);
      else panel.current?.querySelector(`[name="${Object.keys(current)[0]}"]`)?.focus();
      return;
    }
    setErrors(next);
    if (Object.keys(next).length) setStep(groups.findIndex(fields => fields.some(key => next[key])));
    if (Object.keys(next).length) {
      panel.current?.querySelector(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }
    if (config.enabled) {
      setSending(true); setSubmitError('');
      try {
        const result = await commercialApi('submit', { method:'POST', body:{ ...form, website:e.currentTarget.elements.website.value, requestKey:requestKey.current } });
        setReservationUrl('/presupuesto#' + result.token);
        setSending(false);
      } catch (error) { setSubmitError(error.message); setSending(false); }
      return;
    }
    const text = [
      '¡Hola! Quiero solicitar un presupuesto para una producción.',
      `Nombre: ${form.name.trim()}`, `Email: ${form.email.trim()}`,
      `Servicio: ${selected?.name || 'A la carta'}`, `Tipo de propiedad: ${form.propertyType}`, form.pack === 'custom' ? `Servicios: ${customServices.map(s => s.name).join(', ')}` : '', `Superficie: ${form.m2} m²`,
      `Zona de la propiedad: ${form.zone.trim()}`,
      form.videos.length ? `Videos: ${form.videos.map(id => SERVICE_BY_ID[id].name).join(', ')}` : '',
      form.addons.length ? `Adicionales: ${form.addons.join(', ')} (${ADDONS.filter(a => form.addons.includes(a.name)).map(a => money(a.price)).join(' / ')})` : '',
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
          <div><p className="text-white/70 text-xs uppercase tracking-widest mb-2">Arko Studio</p><h2 id="budget-title" className="font-headline font-extrabold text-2xl text-white">{reservationUrl ? 'Recibimos tu consulta' : 'Armá tu producción'}</h2><p className="text-white/80 text-sm mt-2">{reservationUrl ? 'El siguiente paso es elegir tu semana.' : 'Contanos qué necesitás, un paso a la vez.'}</p></div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-white p-2"><span className="material-symbols-outlined">close</span></button>
        </div>
        {reservationUrl ? <section className="p-5 md:p-8 space-y-5" aria-live="polite">
          <p>Gracias, {form.name.trim()}. Vamos a enviarte el presupuesto a <strong>{form.email.trim()}</strong>. Podés elegir tu semana de producción ahora o volver desde el enlace del mail.</p>
          <a href={reservationUrl} className="block text-center editorial-gradient text-white font-bold text-sm py-4 rounded-lg">Elegir semana y reservar</a>
          <p className="text-sm text-on-surface-variant">El cupo se retiene por 72 horas una vez que elegís la semana. La reserva se confirma con la seña de $15.000.</p>
          <button type="button" onClick={onClose} className="text-sm underline text-secondary">Seguir recorriendo la web</button>
        </section> : <form onSubmit={submit} noValidate className="p-5 md:p-8 space-y-7">
          <nav aria-label="Progreso de la solicitud"><ol className="grid grid-cols-4 gap-2">{STEPS.map((label, i) => <li key={label}><button type="button" disabled={i > step} aria-current={i === step ? 'step' : undefined} onClick={() => setStep(i)} className={`w-full border-b-2 pb-3 text-xs sm:text-sm text-left ${i <= step ? 'border-secondary text-secondary font-bold' : 'border-outline-variant text-on-surface-variant'}`}>{i + 1}. {label}</button></li>)}</ol></nav>
          <div ref={stepTitle} key={step} tabIndex={-1} className="outline-none"><p className="text-xs text-secondary uppercase tracking-widest mb-2">Paso {step + 1} de 4</p><h3 className="font-headline font-bold text-xl">{['¿Qué propiedad vamos a mostrar?', '¿Dónde está la propiedad?', 'Elegí cómo mostrarla', '¿A quién enviamos la propuesta?'][step]}</h3></div>
          {step === 0 && <div className="space-y-6"><fieldset><legend className="font-bold text-sm mb-3">Tipo de propiedad *</legend><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{PROPERTY_TYPES.map(type => <label key={type} className={`border-2 rounded-xl p-4 cursor-pointer text-sm ${form.propertyType === type ? 'border-secondary bg-secondary/5' : 'border-outline-variant/50'}`}><input type="radio" name="propertyType" checked={form.propertyType === type} onChange={() => change('propertyType', type)} className="accent-secondary mr-2" />{type}</label>)}</div>{error('propertyType')}</fieldset>
          <div><label htmlFor="budget-m2" className="block text-sm font-bold mb-2">Superficie de la propiedad (m²) *</label><input {...fieldProps('m2')} type="number" min="1" max="100000" step="any" placeholder="Ej: 150" className={inputClass} />{error('m2')}<p className="text-xs text-on-surface-variant mt-2">El precio se calcula por tramos de 100 m², redondeando al tramo siguiente.</p></div>

<p className="text-xs text-on-surface-variant">Indicá la superficie total a relevar. El tipo de inmueble, sus ambientes y amenities se tienen en cuenta al confirmar la propuesta formal.</p></div>}
          {step === 1 && <div><label htmlFor="budget-zone" className="block text-sm font-semibold mb-2">Barrio o localidad *</label><input {...fieldProps('zone')} maxLength={200} placeholder="Ej: Palermo, CABA / Nordelta, Tigre" className={inputClass} />{error('zone')}<p className="text-xs text-on-surface-variant mt-3">Con el barrio y la localidad podemos evaluar el traslado. Coordinamos la dirección exacta al reservar.</p></div>}
          {step === 2 && <div className="space-y-6">
          <fieldset><legend className="font-headline font-bold mb-3">Elegí un pack o armá tu selección *</legend>
            <div className="grid md:grid-cols-3 gap-3">
              {PACKS.map(pack => <label key={pack.id} className={`relative border-2 rounded-xl p-4 cursor-pointer ${form.pack === pack.id ? 'border-secondary bg-secondary/5' : 'border-outline-variant/50'}`}>
                <div className="flex gap-2 items-center mb-2"><input type="radio" name="pack" value={pack.id} checked={form.pack === pack.id} onChange={() => change('pack', pack.id)} className="accent-secondary" /><span className="font-headline font-bold">{pack.name}</span></div>
                <p className="font-bold text-secondary mb-1">{money(priceFor(pack, validArea ? form.m2 : 100))}</p>
                <p className="text-xs text-on-surface-variant mb-3">{validArea ? `para ${form.m2} m²` : 'hasta 100 m²'} · IVA incluido</p>
                <ul className="text-xs space-y-2">{pack.services.map(id => <li key={id}>{SERVICE_BY_ID[id].name}</li>)}{pack.videos && <li className="font-semibold">{pack.videos} {pack.videos === 1 ? 'video a elección' : 'videos a elección'}</li>}</ul>
              </label>)}
            <label className="block border-2 rounded-xl p-4 mt-3 cursor-pointer"><input type="radio" name="pack" checked={form.pack === 'custom'} onChange={() => change('pack', 'custom')} className="accent-secondary mr-2" /><strong>A la carta</strong><p className="text-xs mt-2">Elegí solo los servicios que necesitás.</p></label></div>{error('pack')}
          </fieldset>

          {form.pack === 'custom' && <fieldset><legend className="font-bold text-sm mb-3">Tus servicios *</legend><div className="grid sm:grid-cols-2 gap-3">{Object.values(SERVICE_BY_ID).map(service => <label key={service.id} className="border border-outline-variant rounded-xl p-4 cursor-pointer text-sm"><input type="checkbox" name="services" checked={form.services.includes(service.id)} onChange={() => toggle('services', service.id)} className="accent-secondary mr-2" /><strong>{service.name}</strong><p className="mt-2 text-secondary">{money(priceFor(service, form.m2))}</p><p className="text-xs mt-1 text-on-surface-variant">{service.desc}</p></label>)}</div>{error('services')}</fieldset>}
          {!!selected?.videos && <fieldset><legend className="font-bold text-sm mb-3">Elegí {selected.videos} {selected.videos === 1 ? 'video' : 'videos'} *</legend><div className="flex flex-wrap gap-3">{VIDEOS.map(id => <label key={id} className="border border-outline-variant rounded-lg p-3 text-sm flex gap-2 items-center"><input type="checkbox" name="videos" checked={form.videos.includes(id)} disabled={!form.videos.includes(id) && form.videos.length >= selected.videos} onChange={() => toggle('videos', id)} className="accent-secondary" />{SERVICE_BY_ID[id].name}</label>)}</div>{error('videos')}</fieldset>}
          {canAddExtras && <fieldset><legend className="font-bold text-sm mb-1">Adicionales opcionales</legend><p className="text-xs text-on-surface-variant mb-3">Para videos cinematográficos o reels. Precios por adicional.</p>{ADDONS.map(addon => <label key={addon.name} className="flex gap-3 items-start py-2 text-sm"><input type="checkbox" checked={form.addons.includes(addon.name)} onChange={() => toggle('addons', addon.name)} className="accent-secondary mt-1" /><span>{addon.name} <strong className="text-secondary">+ {money(addon.price)}</strong></span></label>)}</fieldset>}
          </div>}
          {step === 3 && <><fieldset><legend className="font-headline font-bold mb-4">Datos de contacto</legend><div className="grid md:grid-cols-2 gap-4">
            <div><label htmlFor="budget-name" className="block text-sm font-semibold mb-2">Nombre completo *</label><input {...fieldProps('name')} autoComplete="name" maxLength={120} placeholder="Tu nombre y apellido" className={inputClass} />{error('name')}</div>
            <div><label htmlFor="budget-email" className="block text-sm font-semibold mb-2">Email *</label><input {...fieldProps('email')} type="email" autoComplete="email" maxLength={254} placeholder="tu@email.com" className={inputClass} />{error('email')}</div>

          </div></fieldset>
          <div><label htmlFor="budget-message" className="block text-sm font-semibold mb-2">Comentarios (opcional)</label><textarea id="budget-message" value={form.message} onChange={e => change('message', e.target.value)} rows={3} maxLength={2000} placeholder="Ambientes, amenities, accesos u otros detalles…" className={inputClass} /></div>
          </>}
          <div className="bg-surface rounded-xl p-4">{form.propertyType && <p className="text-sm mb-2">{form.propertyType} · {form.m2 || '—'} m²{form.zone ? ` · ${form.zone}` : ''}</p>}<p className="font-bold">{estimate !== null ? `Total estimado: ${money(estimate)}` : 'Elegí tus servicios en el paso 3 para ver el estimado.'}</p><p className="text-xs text-on-surface-variant mt-2">IVA incluido. El valor final se confirma según locación, terreno, amenities y requerimientos de producción. La fecha está sujeta a disponibilidad.</p></div>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          {submitError && <p role="alert" className="text-error text-sm">{submitError}</p>}
          <div className="flex gap-3">{step > 0 && <button type="button" disabled={sending} onClick={() => setStep(step - 1)} className="border border-outline-variant rounded-lg px-5 text-sm">Atrás</button>}<button type="submit" disabled={sending || config.loading} className="w-full editorial-gradient text-white font-bold text-sm py-4 rounded-lg disabled:opacity-50">{step < 3 ? 'Continuar' : sending ? 'Guardando tu consulta…' : config.enabled ? 'Enviar solicitud de presupuesto' : 'Continuar por WhatsApp'}</button>
          </div>
          {step === 3 && <p className="text-center text-on-surface-variant text-xs">{config.enabled ? 'Guardaremos tu solicitud y te enviaremos la propuesta por email. Al terminar, te mostraremos un botón para elegir tu semana. Los recordatorios se pueden detener desde cada mensaje.' : 'Se abrirá WhatsApp con todos los datos y el precio estimado. Enviá el mensaje para que recibamos tu consulta. Usaremos tu email para contactarte sobre este pedido.'}</p>}
        </form>}
      </div>
    </div>
  );
}
