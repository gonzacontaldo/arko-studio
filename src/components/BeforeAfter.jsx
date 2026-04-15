const BEFORE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC3p9DsCXeaAJGv1CKBSv8GPTRWll7nUHcSN9ISQZkF2G93RBhRLy3vgmI2ueLoBM1DZglY7MgZYFsB96T6fNhDD2B--35Vlq0U9NX7nLKemvesMPRJPV8Fr01SkWXLt-bmo2gJE86ebPxLzjFvJvC9nct9DsW1Vtfog8e3ptVQdEpMkuvPcoaEpvu8Hj0-N5Fup3-qVjloGDWXU_I770kZQQ8fB--pmuO1g8-3fuYgPeoebhAw_liIGFIqCP90765k09sT69vQ6A0';
const AFTER_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzjj8kQ4HafVp1OnfZVNPSndumhRJJqXtKdmEk7F2fQNdxb9XNMBPdOBD-iEbX9HvORT-5IbnU9n01cWV92SdRO86TjRuLNkNgoIUeNY3_8sHeZgPDhMq6cLVkjJ4lidGQa33JfxfR3y6qe7NiEcZXtyZH03LvvTicyCS9kui3JQhJ_-SJ6TeEu9BKlqMEmSQguyWOSrsvDrH-wAM8fcX9s2YzvCgo5AyvIzlt5zS5gh6yGnw-bWRGoZ2qsGztmC3-CuxAhC67kQc';

export default function BeforeAfter() {
  return (
    <section className="py-32 px-8 bg-surface-container-low overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-headline font-extrabold text-4xl text-locked mb-16 text-center">
          El Impacto del Contenido Visual
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <img
              className="w-full h-[500px] object-cover rounded-md grayscale-[40%] contrast-75"
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
              className="w-full h-[500px] object-cover rounded-md"
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
