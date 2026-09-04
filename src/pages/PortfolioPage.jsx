import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FILTERS } from '../data/portfolioItems';
import { fetchPortfolio } from '../lib/portfolio';
import PortfolioGrid from '../components/PortfolioGrid';
import Footer from '../components/Footer';
import logoImg from '../assets/Logo.png';
import Seo from '../components/Seo';

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [items, setItems] = useState([]);

  // Al entrar a la página, arrancar desde arriba y traer el portfolio.
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPortfolio().then(setItems);
  }, []);

  const filtered = activeFilter === 'all'
    ? items
    : items.filter(item => item.types.includes(activeFilter));

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary/30 min-h-screen flex flex-col">
      <Seo title="Portfolio de Fotografía y Video Inmobiliario | ARKO Studio" description="Trabajos de fotografía, video, drone y tours virtuales 360° realizados por ARKO Studio para propiedades en Buenos Aires." path="/portfolio" />

      {/* ── Header slim ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-nav border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-1.5 shrink-0">
            <div className="h-8 w-8 overflow-hidden flex-shrink-0 flex items-center justify-center">
              <img src={logoImg} alt="ARKO Studio" className="h-8 w-8 scale-[2.8]" />
            </div>
            <span className="font-headline font-bold tracking-tighter text-lg text-stone-900 uppercase leading-none mt-px">
              ARKO Studio
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-headline font-bold uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="hidden sm:inline">Volver al inicio</span>
          </Link>
        </div>
      </header>

      {/* ── Título ────────────────────────────────────────────────────── */}
      <main className="flex-1"><section className="px-8 pt-16 pb-10 max-w-7xl mx-auto w-full">
        <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-4 block">Portfolio</span>
        <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-locked mb-4">Portfolio Completo</h1>
        <p className="text-on-surface-variant text-base max-w-2xl">
          Todos nuestros trabajos: fotografía, video, tours virtuales 360° y tomas aéreas con drone.
        </p>
      </section>

      {/* ── Tabs de filtro ────────────────────────────────────────────── */}
      <div className="px-8 mb-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={`font-headline font-bold text-xs uppercase tracking-widest px-5 py-2 rounded-full border transition-all duration-200 ${
                activeFilter === value
                  ? 'bg-secondary text-on-secondary border-secondary shadow-sm'
                  : 'bg-transparent text-on-surface-variant border-outline-variant hover:border-secondary hover:text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Galería ───────────────────────────────────────────────────── */}
      <div>
        <PortfolioGrid items={filtered} />
      </div></main>

      <Footer />
    </div>
  );
}
