import {useServiceMedia} from '../../lib/serviceMedia';
import { useEffect, useRef, useState } from 'react';

const steps = [
  { label: 'Coordinación', title: 'Primero, conocemos la propiedad.', description: 'Nos contás dónde está, su superficie, qué ambientes querés mostrar y cuándo necesitás publicar. Con eso definimos el alcance, el presupuesto y el mejor momento para trabajar con la luz del lugar.', detail: 'Coordinamos el acceso y quién nos recibe. El horario se elige según la orientación y los espacios a fotografiar.', tags: ['Ubicación y superficie', 'Objetivo de la publicación', 'Fecha y acceso'] },
  { label: 'Preparación', title: 'El mejor resultado empieza antes de la cámara.', description: 'Un espacio limpio, ordenado y despejado nos permite concentrarnos en la luz y el encuadre. Te compartimos una guía para que el inmueble esté listo cuando llegamos.', detail: 'La limpieza, el orden y el movimiento de objetos pesados o personales quedan a cargo del propietario.', tags: ['Mesadas y pisos despejados', 'Camas hechas y vidrios limpios', 'Cortinas y persianas abiertas'] },
  { label: 'La producción', title: 'Cada ambiente necesita su tiempo.', description: 'Recorremos el inmueble, elegimos los puntos de vista y trabajamos la composición, la exposición y los detalles. Hacemos las tomas necesarias para representar tanto los interiores como los exteriores.', detail: 'La duración depende de la superficie, la luz y la cantidad de ambientes. Acordamos el tiempo de sesión al reservar, sin apurar las tomas.', tags: ['Tomas generales', 'Detalles y terminaciones', 'Interiores y exteriores'] },
  { label: 'Postproducción', title: 'La foto no termina en el disparo.', description: 'Seleccionamos las imágenes y trabajamos la luz, el balance de color y las verticales para que el conjunto se vea natural y consistente. La edición pone en valor el espacio respetando cómo es el inmueble.', detail: 'La imagen acompaña el scroll para ilustrar el tratamiento de luz y color. Es una demostración sobre una foto terminada, no un archivo RAW original.', tags: ['Luz equilibrada', 'Color natural', 'Perspectivas cuidadas'] },
  { label: 'Tu identidad', title: 'Tus propiedades. Tu marca.', description: 'Podemos incorporar el logo o la marca de agua que elijas. Nos enviás el archivo y acordamos la ubicación y el tamaño para que acompañe la imagen sin tapar lo importante.', detail: 'La marca que ves en la imagen es solo un ejemplo. La entrega se prepara con la identidad acordada para tu inmobiliaria.', tags: ['Tu logo o marca de agua', 'Ubicación y tamaño acordados', 'Una presentación consistente'] },
  { label: 'La entrega', title: 'Listas para publicar. Con toda su calidad.', description: 'Recibís un enlace privado para descargar las fotos editadas en alta resolución y las versiones optimizadas para web. Así tenés los archivos originales de entrega, sin la compresión de un reenvío por mensajería.', detail: 'El plazo habitual es de hasta 72 horas después de la producción. Confirmamos la fecha de entrega al coordinar la sesión.', tags: ['Descarga por enlace privado', 'Alta resolución y versión web', 'Entrega habitual en 72 horas'] },
];

function StoryVisual({ active, visualRef }) {
  const {processImage:finishedPhoto}=useServiceMedia('fotografia-inmobiliaria');
  return (
    <div className="photo-story-visual" ref={visualRef}>
      <div className="photo-story-image">
        <img src={finishedPhoto} alt="Fotografía utilizada para ilustrar las etapas del servicio" width="1920" height="1280" loading="lazy" />
        <div className={`photo-story-layer photo-story-planning ${active === 0 ? 'is-active' : ''}`} aria-hidden="true">
          <div className="photo-planning-note"><span className="material-symbols-outlined">event_available</span><p>Una sesión bien planificada</p><span>Ubicación · luz · acceso</span><div><i /> Fecha y horario a coordinar</div></div>
        </div>
        <div className={`photo-story-layer photo-story-preparation ${active === 1 ? 'is-active' : ''}`} aria-hidden="true">
          <div className="photo-preparation-note">Antes de nuestra llegada<span>✓ &nbsp; Espacios despejados</span><span>✓ &nbsp; Vidrios y espejos limpios</span><span>✓ &nbsp; Accesos listos</span></div>
        </div>
        <div className={`photo-story-layer photo-story-capture ${active === 2 ? 'is-active' : ''}`} aria-hidden="true">
          <img src={finishedPhoto} alt="" className="photo-demo-unedited" width="1920" height="1280" loading="lazy" />
          <div className="photo-viewfinder"><i /><i /><i /><i /><span>ENCUADRE · LUZ · DETALLE</span><b>+</b></div>
          <span className="photo-visual-tag">Referencia de captura · simulación</span>
        </div>
        <div className={`photo-story-layer photo-story-editing ${active === 3 ? 'is-active' : ''}`} aria-hidden="true">
          <img src={finishedPhoto} alt="" className="photo-demo-unedited" width="1920" height="1280" loading="lazy" />
          <img src={finishedPhoto} alt="" className="photo-scroll-reveal" width="1920" height="1280" loading="lazy" />
          <span className="photo-reveal-line" />
          <span className="photo-visual-tag">Demostración ilustrativa de edición</span>
        </div>
        <div className={`photo-story-layer photo-story-brand ${active === 4 ? 'is-active' : ''}`} aria-hidden="true"><span>TU INMOBILIARIA</span></div>
        <div className={`photo-story-layer photo-story-delivery ${active === 5 ? 'is-active' : ''}`} aria-hidden="true"><div className="photo-delivery-note"><span className="material-symbols-outlined">folder_open</span><div>Tu propiedad<span>Fotografías finales</span></div><b>Alta resolución<br />Versión web</b></div></div>
      </div>
      <div className="photo-story-caption"><span>{steps[active].label}</span><span>ARKO STUDIO</span></div>
    </div>
  );
}

export default function PhotoStory() {
  const [active, setActive] = useState(0);
  const sections = useRef([]);
  const visual = useRef(null);
  const layout = useRef(null);

  useEffect(() => {
    let frame = 0;
    let observer;
    const update = () => {
      frame = 0;
      const mobile = window.innerWidth < 900;
      const anchor = window.innerHeight * (mobile ? .74 : .52);
      let index = 0;
      sections.current.forEach((section, i) => { if (section && section.getBoundingClientRect().top <= anchor) index = i; });
      setActive(index);
      const rect = sections.current[3]?.getBoundingClientRect();
      if (rect) {
        const progress = Math.max(0, Math.min(1, (anchor - rect.top) / (rect.height * .8)));
        visual.current?.style.setProperty('--edit-reveal', `${progress * 100}%`);
      }
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    const subscribe = () => window.addEventListener('scroll', requestUpdate, { passive: true });
    observer = new IntersectionObserver(([entry]) => {
      window.removeEventListener('scroll', requestUpdate);
      if (entry.isIntersecting) { subscribe(); requestUpdate(); }
    }, { rootMargin: '100px' });
    if (layout.current) observer.observe(layout.current);
    window.addEventListener('resize', requestUpdate);
    update();
    return () => { observer.disconnect(); window.removeEventListener('scroll', requestUpdate); window.removeEventListener('resize', requestUpdate); cancelAnimationFrame(frame); };
  }, []);

  return (
    <section className="photo-process photo-section" id="proceso-fotografia" aria-labelledby="photo-process-title">
      <div className="photo-section-heading"><p className="photo-kicker">DE LA PRIMERA CHARLA A LA ÚLTIMA FOTO</p><h2 id="photo-process-title">Una buena foto lleva<br /><em>mucho más que un clic.</em></h2><p>Así trabajamos tu propiedad, paso a paso. Seguí bajando para ver el proceso.</p></div>
      <div className="photo-story-layout" ref={layout}>
        <StoryVisual active={active} visualRef={visual} />
        <div className="photo-story-steps">
          {steps.map((step, i) => (
            <article className={`photo-story-step ${active === i ? 'is-current' : ''}`} key={step.label} ref={element => { sections.current[i] = element; }}>
              <p className="photo-step-label"><span>{String(i + 1).padStart(2, '0')}</span> {step.label}</p>
              <h3>{step.title}</h3><p>{step.description}</p>
              <ul>{step.tags.map(tag => <li key={tag}><span aria-hidden="true">✓</span>{tag}</li>)}</ul>
              <p className="photo-step-detail">{step.detail}</p>
              {i === 1 && <a href="#preparar-inmueble" className="photo-text-link">Ver la checklist de preparación</a>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
