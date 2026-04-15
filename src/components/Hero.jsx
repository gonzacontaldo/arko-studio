const HERO_IMAGE =
  'https://www.clarin.com/img/2022/01/31/seOJ4SAm4_1256x620__1.jpg';

export default function Hero({ onOpenModal }) {
  return (
    <section className="relative min-h-screen flex items-center justify-start pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover"
          src={HERO_IMAGE}
          alt="Villa arquitectónica moderna con paredes de vidrio y piscina infinita al atardecer"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-on-surface/20" />
      </div>
      <div className="relative z-10 max-w-4xl px-8 md:px-24">
        <h1 className="font-headline font-extrabold text-5xl md:text-7xl text-white text-locked leading-none mb-6">
          Vendé tus propiedades más rápido con contenido visual premium
        </h1>
        <p className="text-white/90 text-xl font-light max-w-2xl mb-10 leading-relaxed">
          Tours virtuales 360°, Tomas con dron 360°, Fotografías y videos para redes sociales diseñados para destacar cada
          propiedad.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={onOpenModal}
            className="editorial-gradient text-on-secondary px-10 py-4 rounded-md font-bold text-sm tracking-widest uppercase shadow-lg active:scale-95 transition-all duration-150"
          >
            Solicitar Presupuesto
          </button>
          <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-md font-bold text-sm tracking-widest uppercase hover:bg-white/20 transition-all">
            Ver Portfolio
          </button>
        </div>
      </div>
    </section>
  );
}
