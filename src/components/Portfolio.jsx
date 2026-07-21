import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPortfolio } from '../lib/portfolio';
import PortfolioGrid from './PortfolioGrid';

export default function Portfolio() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetchPortfolio().then(items => {
      const dest = items.filter(i => i.destacado);
      setFeatured((dest.length ? dest : items).slice(0, 3));
    });
  }, []);

  return (
    <section id="portfolio" className="py-24 bg-surface-container-low">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="px-8 mb-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="max-w-2xl">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-4 block">Portfolio</span>
          <h2 className="font-headline font-extrabold text-4xl text-locked">Trabajos Destacados</h2>
        </div>
        <p className="text-on-surface-variant text-sm max-w-sm">
          Una selección de nuestros trabajos más recientes: fotografía, video, tours virtuales y tomas aéreas.
        </p>
      </div>

      {/* ── Grilla destacadas ─────────────────────────────────────────── */}
      <PortfolioGrid items={featured} />

      {/* ── CTA a portfolio completo ──────────────────────────────────── */}
      <div className="px-8 mt-12 max-w-7xl mx-auto flex justify-center">
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 editorial-gradient text-on-secondary font-headline font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-150"
        >
          Ver portfolio completo
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </Link>
      </div>

    </section>
  );
}
