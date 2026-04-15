const CTA_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDDJ7ZC0HzSCNnlPYOuD6Sxeaw6NT3qcvWtYL2SV10VFWUQ2hH9QXjmadaQqTPuU027bHN1cs4E5dWW1IWOfxihefOjZJ4zfIooUsdvB0y_KNUjG91P-YEhnq6sNSUm7x6er5kTGRWMCwUJzsq07bx9taMwKBnmo4LMFF5XlOJm8Xz4gR7hCnDQDTjgOWF05g9PlPuVDOsJ0Uh85hxBcvCKXJ6sXdFYxAMju40j_5JDbyR0rLkvCvOwyEhuz95OTvMSQquFPbyehP0';

export default function FinalCTA({ onOpenModal }) {
  return (
    <section className="py-40 px-8 relative overflow-hidden bg-on-surface text-center">
      <div className="absolute inset-0 opacity-10">
        <img
          className="w-full h-full object-cover"
          src={CTA_BG}
          alt="Fondo arquitectónico oscuro con detalles de concreto"
          loading="lazy"
        />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="font-headline font-extrabold text-5xl md:text-6xl text-white text-locked mb-8 leading-tight">
          ¿Listo para destacar tus propiedades?
        </h2>
        <p className="text-surface-variant text-xl mb-12 font-light">
          Sumáte a los agentes que usan contenido profesional para generar más consultas y cerrar operaciones más
          rápido.
        </p>
        <button
          onClick={onOpenModal}
          className="editorial-gradient text-on-secondary px-16 py-5 rounded-md font-bold text-lg tracking-widest uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
        >
          Reservar Sesión
        </button>
      </div>
    </section>
  );
}
