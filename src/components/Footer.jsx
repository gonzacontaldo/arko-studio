const socialLinks = [
  { label: 'Instagram', href: '#' },
  { label: 'LinkedIn',  href: '#' },
  { label: 'Contacto',  href: '#' },
];

const legal = [
  { label: 'Privacidad', href: '#' },
  { label: 'Términos',   href: '#' },
];

const coverageZones = [
  'CABA',
  'GBA Norte',
  'GBA Sur',
  'GBA Oeste',
  'Zona Norte (Nordelta, Tigre)',
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-stone-200 bg-stone-100 dark:bg-stone-950 px-12 pt-16 pb-10">

      {/* ── Grid principal ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

        {/* Marca */}
        <div>
          <div className="font-headline font-bold text-lg text-stone-900 dark:text-stone-100 uppercase mb-4">
            ARKO Studio
          </div>
          <p className="font-body text-sm text-stone-500 leading-relaxed max-w-xs">
            Contenido multimedia inmobiliario de alto nivel para agentes, constructoras y desarrolladores.
          </p>
        </div>

        {/* Cobertura */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-[#C5A059] mb-4">
            Cobertura
          </h4>
          <ul className="space-y-2">
            {coverageZones.map((zone) => (
              <li key={zone} className="flex items-center gap-2 text-sm text-stone-500">
                <span className="material-symbols-outlined text-[#C5A059] text-base">
                  location_on
                </span>
                {zone}
              </li>
            ))}
          </ul>
          <p className="text-xs text-stone-400 mt-4 leading-relaxed">
            Interior del país:{' '}
            <span className="text-[#C5A059] font-medium">consultar disponibilidad</span>
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-[#C5A059] mb-4">
            Links
          </h4>
          <div className="flex flex-col gap-2.5">
            {socialLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="font-body text-sm text-stone-500 hover:text-[#C5A059] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-[#C5A059] mb-4">
            Legal
          </h4>
          <div className="flex flex-col gap-2.5">
            {legal.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="font-body text-sm text-stone-500 hover:text-[#C5A059] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* ── Barra inferior ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto border-t border-stone-200 dark:border-stone-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="font-body text-xs text-stone-400">
          © {new Date().getFullYear()} ARKO Studio. Todos los derechos reservados.
        </p>
        <p className="font-body text-xs text-stone-400">
          Buenos Aires, Argentina
        </p>
      </div>

    </footer>
  );
}
