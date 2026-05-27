import BEFORE_IMG from '../assets/BeforeAfter/Before.jpg';
import AFTER_IMG from '../assets/BeforeAfter/After.jpg';

export default function BeforeAfter() {
  return (
    <section className="py-16 md:py-32 px-4 md:px-8 bg-surface-container-low overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-locked mb-10 md:mb-16 text-center">
          El Impacto del Contenido Visual
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <img
              className="w-full h-[280px] sm:h-[400px] md:h-[500px] object-cover rounded-md grayscale-[40%] contrast-75"
              src={BEFORE_IMG}
              alt="Interior con iluminación deficiente, tomado con celular"
              loading="lazy"
            />
            <div className="absolute top-6 left-6 bg-on-surface/80 text-white px-4 py-1 text-xs font-bold uppercase tracking-widest">
              Publicación Básica
            </div>
          </div>
          <div className="relative">
            <img
              className="w-full h-[280px] sm:h-[400px] md:h-[500px] object-cover rounded-md"
              src={AFTER_IMG}
              alt="Interior con iluminación profesional y composición balanceada"
              loading="lazy"
            />
            <div className="absolute top-6 right-6 bg-secondary text-on-secondary px-4 py-1 text-xs font-bold uppercase tracking-widest">
              Contenido Profesional
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
