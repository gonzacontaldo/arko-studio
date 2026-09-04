import { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ValueSection from '../components/ValueSection';
import Portfolio from '../components/Portfolio';
import Services from '../components/Services';
import Pricing from '../components/Pricing';
import BeforeAfter from '../components/BeforeAfter';
import InteractivePreview from '../components/InteractivePreview';
import Process from '../components/Process';
import About from '../components/About';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import WhatsAppFAB from '../components/WhatsAppFAB';
import BudgetModal from '../components/BudgetModal';
import FadeIn from '../components/FadeIn';
import Seo, { SITE_URL } from '../components/Seo';

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const open = () => setModalOpen(true);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary/30">
      <Seo
        title="Fotografía y Video Inmobiliario en Buenos Aires | ARKO Studio"
        description="Fotografía profesional, video, drone, planos y tours virtuales 360° para propiedades, inmobiliarias y desarrolladoras en Buenos Aires y Zona Norte."
        schema={{ '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'ARKO Studio', url: SITE_URL, description: 'Producción de contenido audiovisual inmobiliario: fotografía, video, drone, planos y tours virtuales 360° en Buenos Aires.', logo: `${SITE_URL}/favicon.png`, image: `${SITE_URL}/portfolio-web/Civis/Portada.jpg`, telephone: '+54 9 11 7649-8888', areaServed: ['Buenos Aires', 'CABA', 'Zona Norte'] }}
      />
      <Navbar onOpenModal={open} />

      {/* Hero sin FadeIn: es lo primero que ve el usuario */}
      <main><Hero onOpenModal={open} />

      <FadeIn><ValueSection /></FadeIn>
      <FadeIn><Portfolio /></FadeIn>
      <FadeIn><Services onOpenBudget={open} /></FadeIn>
      <FadeIn><BeforeAfter /></FadeIn>
      {/* <FadeIn><DevelopersSection /></FadeIn> */}
      <FadeIn><InteractivePreview /></FadeIn>
      <FadeIn><Pricing onOpenModal={open} /></FadeIn>
      <FadeIn><Process /></FadeIn>
      <FadeIn><About /></FadeIn>
      <FadeIn><FinalCTA onOpenModal={open} /></FadeIn></main>
      <FadeIn direction="none"><Footer /></FadeIn>

      <WhatsAppFAB />
      <BudgetModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
