const ABOUT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDXxztFNvBbRBqlUtaaXmvDccd5aH1Pjr4bnmoNOMxKCx7Dkci0SepjpKpIIL7oIy0aWTmGiheFVeXkkRQcAln7dMkELcq27mESL_m9UPH1GF86wWIvsNF8G2YQQKuEdh4QkQqUWwVdNiiZGIPsndYRs1BhlFwBmQoZXPcjU5HsWjI9w9myCRGW05a6NJ9AF1dUCsTo44lBeLVU';

export default function About() {
  return (
    <section id="nosotros" className="py-32 px-8 bg-surface-container-low">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-20 items-center">
        <div className="w-full md:w-1/3">
          <img
            className="w-full grayscale rounded-md aspect-[3/4] object-cover shadow-xl"
            src={ABOUT_IMAGE}
            alt="Equipo de fotógrafos profesionales de real estate en estudio moderno"
            loading="lazy"
          />
        </div>
        <div className="w-full md:w-2/3">
          <h2 className="font-headline font-extrabold text-4xl text-locked mb-8">Creamos perspectiva</h2>
          <div className="space-y-6 text-on-surface-variant leading-relaxed text-lg">
            <p>
              En ARKO, no solo sacamos fotos. Creamos una narrativa visual que respeta la arquitectura y le hace
              justicia a cada inversión.
            </p>
            <p>
              Nuestro equipo está formado por fotógrafos y realizadores apasionados por la arquitectura, que creen que
              toda propiedad —desde un departamento de entrada hasta un desarrollo de lujo— merece ser mostrada con
              nivel profesional.
            </p>
            <p>
              Nos comprometemos con la calidad absoluta, la entrega rápida y ser una extensión natural de tu equipo de
              marketing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
