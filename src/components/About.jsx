import ABOUT_IMAGE from '../assets/1.png';

export default function About() {
  return (
    <section id="nosotros" className="py-16 md:py-32 px-4 md:px-8 bg-surface-container-low">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 md:gap-20 items-center">
        <div className="w-full md:w-1/3">
          <img
            className="w-full grayscale rounded-md aspect-[3/4] object-cover shadow-xl"
            src={ABOUT_IMAGE}
            alt="Equipo de fotógrafos profesionales de real estate en estudio moderno"
            loading="lazy"
          />
        </div>
        <div className="w-full md:w-2/3">
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-locked mb-6 md:mb-8">Creamos perspectiva</h2>
          <div className="space-y-5 text-on-surface-variant leading-relaxed text-base md:text-lg">
            <p>
              En ARKO, no solo sacamos fotos. Creamos una narrativa visual que respeta la arquitectura y le hace
              justicia a cada inversión.
            </p>
            <p>
              Nuestro equipo está formado por fotógrafos, filmmakers y editores apasionados por la arquitectura, que creen que
              toda propiedad —desde un departamento de entrada hasta un desarrollo de lujo— merece ser mostrada con
              nivel profesional.
            </p>
            <p>
              Nos comprometemos con la calidad absoluta y la entrega rápida para ser una extensión natural de tu equipo de
              marketing.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-outline-variant/30 flex flex-col sm:flex-row gap-5">
            <a
              href="https://instagram.com/TU_USUARIO_IG"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-secondary text-lg">photo_camera</span>
              @arkostudio
            </a>
            <a
              href="tel:+5491100000000"
              className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-secondary text-lg">phone</span>
              +54 9 11 7649-8888
            </a>
            <a
              href="mailto:hola@arkostudio.com.ar"
              className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-secondary text-lg">mail</span>
              contacto@arkostudio.com.ar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
