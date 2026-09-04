import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BudgetModal from '../components/BudgetModal';
import WhatsAppFAB from '../components/WhatsAppFAB';
import PortfolioGrid from '../components/PortfolioGrid';
import Seo, { SITE_URL } from '../components/Seo';
import { services, serviceLinks } from '../data/services';
import { fetchPortfolio } from '../lib/portfolio';

export default function ServicePage() {
  const { serviceSlug } = useParams();
  const service = services[serviceSlug];
  const [modalOpen, setModalOpen] = useState(false);
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPortfolio().then(setPortfolio);
  }, [serviceSlug]);

  const examples = useMemo(() => service?.portfolioType
    ? portfolio.filter(item => item.types.includes(service.portfolioType)).slice(0, 6)
    : [], [portfolio, service]);

  if (!service) return <Navigate to="/" replace />;
  const path = `/${serviceSlug}`;
  const schema = {
    '@context': 'https://schema.org', '@type': 'Service', name: service.h1,
    description: service.description, url: `${SITE_URL}${path}`,
    areaServed: [{ '@type': 'AdministrativeArea', name: 'Provincia de Buenos Aires' }, { '@type': 'City', name: 'Ciudad Autónoma de Buenos Aires' }, { '@type': 'Place', name: 'Zona Norte de Buenos Aires' }],
    provider: { '@type': 'LocalBusiness', name: 'Arko Studio', url: SITE_URL, telephone: '+54 9 11 7649-8888', email: 'gonzalo@arkostudio.com.ar', sameAs: ['https://instagram.com/arkostudio.ar', 'https://www.youtube.com/@arkostudio-media'] },
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen selection:bg-secondary/30">
      <Seo {...service} path={path} image={service.heroImage.startsWith('/') ? `${SITE_URL}${service.heroImage}` : service.heroImage} schema={schema} />
      <Navbar onOpenModal={() => setModalOpen(true)} />
      <main>
        <section className="relative min-h-[78vh] flex items-end overflow-hidden bg-on-surface">
          <img src={service.heroImage} alt={`Ejemplo de ${service.h1.toLowerCase()} realizado por ARKO Studio`} className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pt-36 pb-16 md:pb-24">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-secondary-fixed-dim font-bold text-xs tracking-[.18em] uppercase mb-5">
                <span className="material-symbols-outlined text-xl">{service.icon}</span>{service.eyebrow}
              </span>
              <h1 className="font-headline font-extrabold text-4xl sm:text-5xl md:text-7xl text-white text-locked leading-[1.05]">{service.h1}</h1>
              <p className="text-white/85 text-lg md:text-xl leading-relaxed max-w-2xl mt-7">{service.intro}</p>
              <div className="flex flex-wrap gap-4 mt-9">
                <button onClick={() => setModalOpen(true)} className="editorial-gradient text-on-secondary px-8 py-4 rounded-md font-bold text-sm tracking-widest uppercase shadow-lg">Solicitar presupuesto</button>
                <a href="#ejemplos" className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-md font-bold text-sm tracking-widest uppercase hover:bg-white/20 transition-colors">Ver ejemplos</a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-outline-variant/30 bg-surface-container-low">
          <div className="max-w-7xl mx-auto grid sm:grid-cols-3">
            {service.benefits.map((benefit, index) => (
              <div key={benefit} className="px-6 md:px-10 py-7 flex items-center gap-4 border-b sm:border-b-0 sm:border-r last:border-r-0 border-outline-variant/30">
                <span className="font-headline font-extrabold text-secondary text-2xl">0{index + 1}</span>
                <span className="font-semibold text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 md:py-32 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-14">
              <span className="text-secondary font-bold text-xs tracking-widest uppercase block mb-4">Cómo aporta a la publicación</span>
              <h2 className="font-headline font-extrabold text-3xl md:text-5xl text-locked">Una presentación que ayuda a entender y valorar la propiedad</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-px bg-outline-variant/30 border border-outline-variant/30">
              {service.sections.map(([heading, copy], index) => (
                <article key={heading} className="bg-surface p-7 md:p-10 min-h-[270px] flex flex-col">
                  <span className="material-symbols-outlined text-secondary text-3xl mb-10">{index === 0 ? 'visibility' : index === 1 ? 'tune' : 'real_estate_agent'}</span>
                  <h3 className="font-headline font-bold text-xl mb-4">{heading}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="ejemplos" className="py-20 md:py-32 bg-on-surface text-white scroll-mt-16">
          <div className="px-4 md:px-8 max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-secondary-fixed-dim font-bold text-xs tracking-widest uppercase block mb-4">Trabajo real</span>
              <h2 className="font-headline font-extrabold text-3xl md:text-5xl text-locked">Ejemplos de {service.eyebrow.toLowerCase()}</h2>
            </div>
            <p className="text-white/60 max-w-md">Abrí cada proyecto para ver las fotografías y, cuando corresponde, reproducir sus videos o recorrer el tour virtual.</p>
          </div>
          {serviceSlug === 'planos-2d' ? (
            <div className="px-4 md:px-8 max-w-7xl mx-auto">
              <figure className="bg-white rounded-md overflow-hidden grid lg:grid-cols-[1.6fr_1fr]">
                <img src={service.heroImage} alt="Ejemplo real de plano 2D para una publicación inmobiliaria" loading="lazy" className="w-full h-full max-h-[680px] object-contain bg-white" />
                <figcaption className="bg-surface-container-low text-on-surface p-8 md:p-12 flex flex-col justify-center">
                  <span className="material-symbols-outlined text-secondary text-4xl mb-5">architecture</span>
                  <h3 className="font-headline font-extrabold text-2xl mb-4">La distribución, en una sola mirada</h3>
                  <p className="text-on-surface-variant leading-relaxed">Este ejemplo muestra cómo el plano acompaña la publicación para que quien la consulta pueda reconocer los ambientes y entender su relación antes de visitar la propiedad.</p>
                </figcaption>
              </figure>
            </div>
          ) : examples.length > 0 ? <PortfolioGrid items={examples} /> : (
            <p className="px-4 md:px-8 max-w-7xl mx-auto text-white/60">Cargando proyectos del portfolio…</p>
          )}
          <div className="px-4 md:px-8 max-w-7xl mx-auto mt-10 text-center">
            <Link to="/portfolio" className="inline-flex items-center gap-2 border border-white/30 px-7 py-3.5 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-colors">Explorar portfolio completo <span className="material-symbols-outlined">arrow_forward</span></Link>
          </div>
        </section>

        <section className="py-20 md:py-28 px-4 md:px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div><span className="text-secondary font-bold text-xs tracking-widest uppercase block mb-4">Cobertura</span><h2 className="font-headline font-extrabold text-3xl md:text-5xl text-locked mb-5">Buenos Aires, CABA y Zona Norte</h2><p className="text-on-surface-variant text-lg leading-relaxed">Coordinamos producciones para propiedades, inmobiliarias y desarrolladoras. También podés consultarnos por trabajos en otras zonas.</p></div>
            <div className="bg-surface p-8 md:p-10 border-l-4 border-secondary"><h3 className="font-headline font-bold text-2xl mb-3">¿Querés mostrar mejor una propiedad?</h3><p className="text-on-surface-variant mb-7">Contanos qué necesitás y armamos una propuesta según el inmueble y los formatos que vayas a utilizar.</p><button onClick={() => setModalOpen(true)} className="editorial-gradient text-on-secondary px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest">Consultar disponibilidad</button></div>
          </div>
        </section>

        <nav aria-label="Otros servicios" className="py-14 px-4 md:px-8 border-t border-outline-variant/30"><div className="max-w-7xl mx-auto"><h2 className="font-headline font-bold text-xl mb-6">También podemos ayudarte con</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{serviceLinks.filter(x => x.slug !== serviceSlug).map(x => <Link key={x.slug} to={`/${x.slug}`} className="group flex items-center justify-between bg-surface-container-low p-5 hover:bg-surface-container transition-colors"><span className="font-semibold text-sm">{x.label}</span><span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">arrow_forward</span></Link>)}</div></div></nav>
      </main>
      <Footer />
      <WhatsAppFAB />
      <BudgetModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
