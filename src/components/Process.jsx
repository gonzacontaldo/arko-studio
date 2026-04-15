const steps = [
  {
    number: '1',
    title: 'Contacto',
    description: 'Reserva online simple. Confirmamos logística y acceso en menos de 2 horas.',
    highlighted: false,
  },
  {
    number: '2',
    title: 'Día de Sesión',
    description:
      'Nuestro equipo llega a la propiedad. Iluminación precisa, ambientación y captura desde múltiples ángulos.',
    highlighted: false,
  },
  {
    number: '3',
    title: 'Edición',
    description: 'Retoque profesional, corrección de color y perspectiva arquitectónica.',
    highlighted: false,
  },
  {
    number: '4',
    title: 'Entrega',
    description:
      'Acceso a galería privada en la nube con archivos en alta resolución y versiones web optimizadas.',
    highlighted: true,
  },
];

export default function Process() {
  return (
    <section id="proceso" className="py-32 px-8 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-4 block">
            ¿Cómo trabajamos?
          </span>
          <h2 className="font-headline font-extrabold text-4xl text-locked">Entrega en 72 horas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {steps.map(({ number, title, description, highlighted }) => (
            <div key={number} className="text-center space-y-6">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto font-bold text-2xl border ${
                  highlighted
                    ? 'bg-secondary text-white shadow-lg border-secondary'
                    : 'bg-surface-container-low text-secondary border-outline-variant/20'
                }`}
              >
                {number}
              </div>
              <h4 className="font-headline font-bold text-lg">{title}</h4>
              <p className="text-sm text-on-surface-variant">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
