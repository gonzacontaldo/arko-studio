const HERO_VIDEO_ID = '9pBvgShBwUA';

export default function Hero({ onOpenModal }) {
  return (
    <section className="relative min-h-screen flex items-center justify-start pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* iframe escalado al 130% para ocultar bordes y logo de YouTube */}
        <div className="absolute inset-0 scale-[1.3] pointer-events-none">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${HERO_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${HERO_VIDEO_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`}
            title="Video de producción audiovisual inmobiliaria de ARKO Studio"
            loading="lazy"
            frameBorder="0"
            allow="autoplay; encrypted-media"
          />
        </div>
        <div className="absolute inset-0 bg-on-surface/40" />
      </div>
      <div className="relative z-10 max-w-4xl px-4 md:px-24">
        <h1 className="font-headline font-extrabold text-3xl sm:text-5xl md:text-7xl text-white text-locked leading-tight mb-6 break-words">
          Fotografía y video inmobiliario en Buenos Aires
        </h1>
        <p className="text-white/90 text-base sm:text-xl font-light max-w-2xl mb-10 leading-relaxed">
          Producción audiovisual para propiedades: fotografía profesional, video, drone, planos y tours virtuales 360° en CABA y Zona Norte.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={onOpenModal}
            className="editorial-gradient text-on-secondary px-10 py-4 rounded-md font-bold text-sm tracking-widest uppercase shadow-lg active:scale-95 transition-all duration-150"
          >
            Solicitar Presupuesto
          </button>
          <a
            href="#portfolio"
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-md font-bold text-sm tracking-widest uppercase hover:bg-white/20 transition-all"
          >
            Ver Portfolio
          </a>
        </div>
      </div>
    </section>
  );
}
