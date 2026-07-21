import logoImg from '../assets/Logo.png';

// Logo de Arko Studio para el hub: réplica del de la landing + etiqueta "(hub)".
// size: 'sm' (navbar) | 'lg' (login)
export default function HubLogo({ size = 'sm' }) {
  const lg = size === 'lg';
  return (
    <div className="flex items-center gap-2">
      <div className={`${lg ? 'h-10 w-10' : 'h-8 w-8'} overflow-hidden flex-shrink-0 flex items-center justify-center`}>
        <img src={logoImg} alt="Arko Studio" className={`${lg ? 'h-10 w-10' : 'h-8 w-8'} scale-[2.8]`} />
      </div>
      <div className="flex items-baseline gap-1.5 leading-none">
        <span className={`font-headline font-bold tracking-tighter uppercase text-stone-900 ${lg ? 'text-2xl' : 'text-lg'}`}>
          Arko Studio
        </span>
        <span className={`font-headline font-bold text-secondary ${lg ? 'text-sm' : 'text-xs'}`}>
          (hub)
        </span>
      </div>
    </div>
  );
}
