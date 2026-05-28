import { useState, useEffect } from 'react';

const WHATSAPP_NUMBER = '+5491144340580';

const SERVICES = [
  { value: '', label: 'Seleccioná un servicio' },
  { value: 'Fotografía profesional', label: '📷 Fotografía profesional' },
  { value: 'Video para redes sociales', label: '🎬 Video para redes sociales' },
  { value: 'Tour virtual 360°', label: '🔭 Tour virtual 360°' },
  { value: 'Pack completo', label: '✨ Premiere Pack (foto + video + tour)' },
];

export default function BudgetModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', contact: '', service: '', message: '' });
  const [errors, setErrors] = useState({});

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Ingresá tu nombre';
    if (!form.contact.trim()) e.contact = 'Ingresá tu teléfono o email';
    if (!form.service) e.service = 'Seleccioná un servicio';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const text = [
      `¡Hola! Quiero solicitar un presupuesto. 🏠`,
      ``,
      `*Nombre:* ${form.name}`,
      `*Contacto:* ${form.contact}`,
      `*Servicio:* ${form.service}`,
      form.message ? `*Mensaje:* ${form.message}` : '',
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    onClose();
    setForm({ name: '', contact: '', service: '', message: '' });
    setErrors({});
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-on-surface/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 bg-white dark:bg-stone-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="editorial-gradient px-8 py-6 flex justify-between items-start">
          <div>
            <p className="text-[#C5A059] font-headline text-xs uppercase tracking-widest font-bold mb-1">
              Arko Studio
            </p>
            <h2 className="font-headline font-extrabold text-2xl text-white text-locked leading-tight">
              Solicitá tu presupuesto
            </h2>
            <p className="text-white/70 text-sm mt-1 font-light">
              Te respondemos en menos de 24 hs
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors mt-1"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-8 py-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block font-headline text-xs uppercase tracking-widest text-on-surface-variant mb-1.5 font-bold">
              Nombre completo *
            </label>
            <input
              type="text"
              placeholder="Ej: Martín López"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full bg-surface-container border rounded-lg px-4 py-3 text-sm text-on-surface placeholder-outline focus:outline-none focus:border-[#C5A059] transition-colors ${
                errors.name ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Teléfono / Email */}
          <div>
            <label className="block font-headline text-xs uppercase tracking-widest text-on-surface-variant mb-1.5 font-bold">
              Teléfono o Email *
            </label>
            <input
              type="text"
              placeholder="Ej: 11 1234-5678 o tu@email.com"
              value={form.contact}
              onChange={(e) => handleChange('contact', e.target.value)}
              className={`w-full bg-surface-container border rounded-lg px-4 py-3 text-sm text-on-surface placeholder-outline focus:outline-none focus:border-[#C5A059] transition-colors ${
                errors.contact ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errors.contact && <p className="text-error text-xs mt-1">{errors.contact}</p>}
          </div>

          {/* Servicio */}
          <div>
            <label className="block font-headline text-xs uppercase tracking-widest text-on-surface-variant mb-1.5 font-bold">
              Servicio de interés *
            </label>
            <select
              value={form.service}
              onChange={(e) => handleChange('service', e.target.value)}
              className={`w-full bg-surface-container border rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-[#C5A059] transition-colors appearance-none cursor-pointer ${
                errors.service ? 'border-error' : 'border-outline-variant'
              } ${!form.service ? 'text-outline' : ''}`}
            >
              {SERVICES.map(({ value, label }) => (
                <option key={value} value={value} disabled={value === ''}>
                  {label}
                </option>
              ))}
            </select>
            {errors.service && <p className="text-error text-xs mt-1">{errors.service}</p>}
          </div>

          {/* Mensaje opcional */}
          <div>
            <label className="block font-headline text-xs uppercase tracking-widest text-on-surface-variant mb-1.5 font-bold">
              ¿Algo más que quieras contarnos?{' '}
              <span className="text-outline font-normal normal-case tracking-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ej: Tengo una propiedad en Palermo de 3 ambientes..."
              value={form.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm text-on-surface placeholder-outline focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full editorial-gradient text-white font-headline font-bold text-sm uppercase tracking-widest py-4 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 mt-2"
          >
            <span className="material-symbols-outlined text-xl">send</span>
            Enviar por WhatsApp
          </button>

          <p className="text-center text-outline text-xs">
            Al enviar abrirá WhatsApp con tu consulta pre-armada
          </p>
        </form>
      </div>
    </div>
  );
}
