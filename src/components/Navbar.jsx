import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'Inicio',    href: '#top',       section: 'top'       },
  { label: 'Portfolio', href: '#portfolio', section: 'portfolio' },
  { label: 'Servicios', href: '#servicios', section: 'servicios' },
  // { label: 'Precios',   href: '#precios',   section: 'precios'   },
  { label: 'Proceso',   href: '#proceso',   section: 'proceso'   },
  { label: 'Nosotros',  href: '#nosotros',  section: 'nosotros'  },
];

export default function Navbar({ onOpenModal }) {
  const [activeSection, setActiveSection] = useState('top');
  const [menuOpen, setMenuOpen]           = useState(false);
  const [scrolled, setScrolled]           = useState(false);

  // ── Detectar scroll para cambiar aspecto del navbar ───────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Highlight activo por scroll ───────────────────────────────────────────
  useEffect(() => {
    const sectionIds = navLinks.map(l => l.section).filter(s => s !== 'top');
    const visible    = new Set();

    const updateActive = () => {
      let current = 'top';
      for (const { section } of navLinks) {
        if (section !== 'top' && visible.has(section)) current = section;
      }
      setActiveSection(current);
    };

    const observers = sectionIds.map(id => {
      const el  = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          entry.isIntersecting ? visible.add(id) : visible.delete(id);
          updateActive();
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });

    return () => observers.forEach(o => o?.disconnect());
  }, []);

  // ── Cerrar menú mobile al redimensionar a desktop ─────────────────────────
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Bloquear scroll del body cuando el menú mobile está abierto ───────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLinkClick = () => setMenuOpen(false);

  const linkClass = (section) =>
    `font-headline tracking-tight uppercase text-sm transition-colors duration-200 ${
      activeSection === section
        ? 'text-[#C5A059] border-b-2 border-[#C5A059] pb-0.5'
        : 'text-stone-600 dark:text-stone-400 hover:text-[#C5A059]'
    }`;

  return (
    <nav className={`fixed top-0 w-full z-50 backdrop-blur-xl transition-all duration-300 ${
      scrolled
        ? 'bg-white/96 dark:bg-stone-900/96 shadow-lg py-0'
        : 'bg-white/80 dark:bg-stone-900/80 shadow-sm'
    }`}>

      {/* ── Barra principal ─────────────────────────────────────────────── */}
      <div className={`flex justify-between items-center px-6 md:px-8 transition-all duration-300 ${scrolled ? 'py-3' : 'py-4'}`}>

        {/* Logo */}
        <a href="#top" className="font-headline font-bold tracking-tighter text-xl text-stone-900 dark:text-stone-100 uppercase">
          ARKO Studio
        </a>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href, section }) => (
            <a key={label} href={href} className={linkClass(section)}>{label}</a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* CTA — solo desktop */}
          <button
            onClick={onOpenModal}
            className="hidden md:block editorial-gradient text-on-secondary px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest active:scale-95 transition-all duration-150"
          >
            Solicitar Presupuesto
          </button>

          {/* Hamburger — solo mobile */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-[#C5A059] transition-colors"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <span className="material-symbols-outlined text-2xl">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Drawer mobile ───────────────────────────────────────────────── */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-t border-outline-variant/20 shadow-xl transition-all duration-300 origin-top ${
          menuOpen
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        <div className="px-6 py-6 flex flex-col gap-1">
          {navLinks.map(({ label, href, section }) => (
            <a
              key={label}
              href={href}
              onClick={handleLinkClick}
              className={`py-3 border-b border-outline-variant/10 font-headline font-bold tracking-widest uppercase text-sm transition-colors duration-200 ${
                activeSection === section ? 'text-[#C5A059]' : 'text-stone-700 dark:text-stone-300'
              }`}
            >
              {label}
            </a>
          ))}

          {/* CTA dentro del drawer */}
          <button
            onClick={() => { setMenuOpen(false); onOpenModal(); }}
            className="mt-4 w-full editorial-gradient text-on-secondary py-4 rounded-lg text-sm font-bold uppercase tracking-widest active:scale-95 transition-all duration-150"
          >
            Solicitar Presupuesto
          </button>
        </div>
      </div>

    </nav>
  );
}
