import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BudgetModal from '../components/BudgetModal';
import WhatsAppFAB from '../components/WhatsAppFAB';
import Seo, { SITE_URL } from '../components/Seo';
import { services, serviceLinks } from '../data/services';

export default function ServicePage() {
  const { serviceSlug } = useParams();
  const service = services[serviceSlug];
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => window.scrollTo(0, 0), [serviceSlug]);
  if (!service) return <Navigate to="/" replace />;
  const path = `/${serviceSlug}`;
  const schema = {
    '@context': 'https://schema.org', '@type': 'Service', name: service.h1,
    description: service.description, url: `${SITE_URL}${path}`,
    areaServed: ['Buenos Aires', 'CABA', 'Zona Norte'],
    provider: { '@type': 'LocalBusiness', name: 'ARKO Studio', url: SITE_URL },
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      <Seo {...service} path={path} schema={schema} />
      <Navbar onOpenModal={() => setModalOpen(true)} />
      <main>
        <section className="pt-36 pb-20 px-4 md:px-8 bg-surface-container-low">
          <div className="max-w-5xl mx-auto">
            <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-5 block">{service.eyebrow}</span>
            <h1 className="font-headline font-extrabold text-4xl md:text-6xl text-locked leading-tight max-w-4xl">{service.h1}</h1>
            <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed max-w-3xl mt-7">{service.intro}</p>
            <button onClick={() => setModalOpen(true)} className="mt-9 editorial-gradient text-on-secondary px-8 py-4 rounded-md font-bold text-sm tracking-widest uppercase">Solicitar presupuesto</button>
          </div>
        </section>
        <section className="py-16 md:py-24 px-4 md:px-8">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            {service.sections.map(([heading, copy]) => <article key={heading}><h2 className="font-headline font-bold text-xl mb-3">{heading}</h2><p className="text-on-surface-variant leading-relaxed">{copy}</p></article>)}
          </div>
        </section>
        <section className="py-16 px-4 md:px-8 bg-surface-container-low">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-headline font-extrabold text-3xl mb-4">Producción en Buenos Aires y Zona Norte</h2>
            <p className="text-on-surface-variant max-w-3xl mb-8">Trabajamos principalmente en CABA y Zona Norte de Buenos Aires. Consultanos por disponibilidad para tu propiedad o desarrollo.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/portfolio" className="font-bold text-secondary underline underline-offset-4">Ver trabajos de producción inmobiliaria</Link>
              <button onClick={() => setModalOpen(true)} className="font-bold text-secondary underline underline-offset-4">Consultar por este servicio</button>
            </div>
          </div>
        </section>
        <nav aria-label="Otros servicios" className="py-12 px-4 md:px-8"><div className="max-w-5xl mx-auto"><h2 className="font-headline font-bold text-xl mb-5">Otros servicios</h2><div className="flex flex-wrap gap-x-6 gap-y-3">{serviceLinks.filter(x => x.slug !== serviceSlug).map(x => <Link key={x.slug} to={`/${x.slug}`} className="text-on-surface-variant hover:text-secondary underline underline-offset-4">{x.label}</Link>)}</div></div></nav>
      </main>
      <Footer />
      <WhatsAppFAB />
      <BudgetModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
