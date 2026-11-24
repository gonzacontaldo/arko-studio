import { Link } from 'react-router-dom';

const services = [
  {
    slug: 'fotografia-inmobiliaria', icon: 'photo_camera', title: 'Fotografía HDR',
    description: 'Mostrá cada ambiente con una mirada cuidada, desde la captura hasta las imágenes editadas.',
    features: ['Interiores y exteriores', 'Edición profesional', 'Marca de agua acordada'],
    action: 'Explorar fotografía',
  },
  {
    slug: 'video-inmobiliario', icon: 'movie', title: 'Video inmobiliario',
    description: 'Elegí el formato según tu objetivo: cinematográfico horizontal, reel vertical o recorrido FPV.',
    features: ['Compará los tres formatos', 'Música licenciada', 'Edición y color'],
    action: 'Elegir mi video',
  },
  {
    slug: 'planos-2d', icon: 'architecture', title: 'Planos 2D',
    description: 'Ayudá a entender la distribución con un plano esquemático elaborado a partir de mediciones con láser.',
    features: ['Relevamiento presencial', 'Distribución de ambientes', 'Plano no arquitectónico'],
    action: 'Conocer los planos',
  },
  {
    slug: 'tour-virtual-360', icon: 'vrpano', title: 'Tours virtuales 360°',
    description: 'Dejá que los interesados recorran la propiedad a su ritmo. Conocé Kuula y Matterport y elegí tu plataforma.',
    features: ['Probá ambos recorridos', 'Compará las plataformas', '3 meses de hosting incluidos'],
    action: 'Descubrir los tours',
  },
  {
    slug: 'drone-inmobiliario', icon: 'flight_takeoff', title: 'Tomas aéreas',
    description: 'Sumá contexto a tu producción de fotos o video mostrando la propiedad, sus exteriores y su entorno.',
    features: ['Extra de fotografía o video', 'Sujeto a viabilidad de vuelo', 'FPV sin este adicional'],
    action: 'Ver cómo sumarlas',
  },
];

export default function Services() {
  return (
    <section id="servicios" aria-labelledby="services-title" className="py-16 md:py-32 px-4 md:px-8 bg-surface">
      <header className="max-w-3xl mx-auto mb-10 md:mb-14 text-center">
        <p className="text-secondary font-headline font-bold text-xs tracking-widest uppercase mb-4">Nuestros servicios</p>
        <h2 id="services-title" className="font-headline font-extrabold text-3xl md:text-4xl text-locked mb-5">Elegí cómo mostrar tu propiedad.</h2>
        <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">Entrá en cada servicio para ver trabajos reales, conocer el proceso y consultar sus precios. Toda la información para elegir tu próxima producción.</p>
      </header>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {services.map(service => (
          <Link key={service.slug} to={`/${service.slug}`} aria-labelledby={`service-${service.slug}`} className="group bg-white p-6 rounded-xl border border-outline-variant/50 hover:border-secondary hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-4 motion-safe:hover:-translate-y-1 motion-safe:transition duration-200 flex flex-col">
            <span className="material-symbols-outlined text-secondary mb-5 text-3xl block" aria-hidden="true">{service.icon}</span>
            <h3 id={`service-${service.slug}`} className="font-headline font-bold text-lg mb-3">{service.title}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-5">{service.description}</p>
            <ul className="text-xs space-y-2 text-on-surface-variant mb-6">
              {service.features.map(feature => <li key={feature} className="flex gap-2"><span className="text-secondary" aria-hidden="true">✓</span>{feature}</li>)}
            </ul>
            <div className="mt-auto border-t border-outline-variant/50 pt-5">
              <span className="flex items-center justify-between gap-2 text-secondary font-headline font-bold text-xs group-hover:underline underline-offset-4">{service.action}<span aria-hidden="true" className="material-symbols-outlined text-lg motion-safe:group-hover:translate-x-1 motion-safe:transition-transform">arrow_forward</span></span>
              <span className="block text-[11px] text-on-surface-variant mt-2">Ejemplos · Proceso · Precios</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
