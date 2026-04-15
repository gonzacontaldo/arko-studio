const DEV_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA3B-sAaKR52hi9ZnCb2av0yckpNVjLNxDx6LF7NN3q9B4IQI9UEzLItw_3za0qc6s6sDAFUlZweaMl1kQbWczszHBpecwOeu98pxP6Bm4n3mIztvJwCSe9b1BXwxJER5I1AGHmGEcubLbg1woKwrTScNH14AxDbZHj36myvf3pgLOqwA-of-EnbzmN2JtcZx7saexdSK6o_IplVs2T90XJRk5XNa_8YiBIKJoYA065IWshFOjEZHp6yd7x7cdA59yezXfGVvD1ti8';

export default function DevelopersSection() {
  return (
    <section className="py-32 px-8 bg-on-surface text-surface">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
        <div className="w-full md:w-1/2">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-4 block">
            Soluciones a escala
          </span>
          <h2 className="font-headline font-extrabold text-5xl text-locked mb-8 leading-tight">
            Pensado para constructores y desarrolladores
          </h2>
          <p className="text-surface-variant text-lg font-light leading-relaxed mb-10">
            Nos especializamos en proyectos de gran volumen, emprendimientos y desarrollos inmobiliarios. Desde barrios
            cerrados hasta torres de alta gama, garantizamos una estética visual consistente en cada unidad.
          </p>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-secondary font-bold mb-2">Escalabilidad</h4>
              <p className="text-sm opacity-70">
                Un solo punto de contacto para proyectos de cualquier escala, en múltiples ubicaciones.
              </p>
            </div>
            <div>
              <h4 className="text-secondary font-bold mb-2">Consistencia</h4>
              <p className="text-sm opacity-70">
                Respeto absoluto por la identidad visual de tu proyecto en cada unidad registrada.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="relative rounded-md overflow-hidden shadow-2xl">
            <img
              className="w-full h-[400px] object-cover"
              src={DEV_IMAGE}
              alt="Edificio moderno de vidrio reflejando el cielo azul"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-secondary/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
