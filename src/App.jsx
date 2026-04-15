import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ValueSection from './components/ValueSection';
import Portfolio from './components/Portfolio';
import Services from './components/Services';
import Pricing from './components/Pricing';
import BeforeAfter from './components/BeforeAfter';
import DevelopersSection from './components/DevelopersSection';
import InteractivePreview from './components/InteractivePreview';
import Process from './components/Process';
import About from './components/About';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import WhatsAppFAB from './components/WhatsAppFAB';
import BudgetModal from './components/BudgetModal';
import FadeIn      from './components/FadeIn';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const open = () => setModalOpen(true);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary/30">
      <Navbar onOpenModal={open} />

      {/* Hero sin FadeIn: es lo primero que ve el usuario */}
      <Hero onOpenModal={open} />

      <FadeIn><ValueSection /></FadeIn>
      <FadeIn><Portfolio /></FadeIn>
      <FadeIn><Services onOpenBudget={open} /></FadeIn>
      <FadeIn><BeforeAfter /></FadeIn>
      <FadeIn><DevelopersSection /></FadeIn>
      <FadeIn><InteractivePreview /></FadeIn>
      <FadeIn><Process /></FadeIn>
      <FadeIn><Pricing onOpenModal={open} /></FadeIn>
      <FadeIn><About /></FadeIn>
      <FadeIn><FinalCTA onOpenModal={open} /></FadeIn>
      <FadeIn direction="none"><Footer /></FadeIn>

      <WhatsAppFAB />
      <BudgetModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <Analytics />
    </div>
  );
}
