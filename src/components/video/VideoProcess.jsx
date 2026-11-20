import { useEffect, useRef, useState } from 'react';
import frame from '../../assets/portfolio-web/Virazon/Foto2.jpg';

const steps = [
  { label: 'Planificación', title: 'Antes de grabar, elegimos qué contar.', copy: 'Definimos el objetivo, el formato y los espacios protagonistas. Coordinamos el acceso, la luz y el tiempo de producción. Si vas a aparecer en cámara, preparamos el mensaje y una guía breve para tu participación.', detail: 'La propiedad tiene que estar preparada antes de la sesión. Para FPV también revisamos la ruta y los accesos.', tags: ['Objetivo y canales de publicación', 'Recorrido y ambientes', 'Guion si hay presentación'] },
  { label: 'Rodaje', title: 'Una buena toma necesita tranquilidad.', copy: 'Trabajamos con cámaras y equipamiento profesional. Para cinematográficos y reels usamos gimbal: un estabilizador que nos permite recorrer el espacio con movimientos suaves y controlados. El FPV se realiza con un drone pensado para un recorrido inmersivo.', detail: 'Ensayamos, grabamos distintas pasadas y revisamos el material. Reservamos tiempo para elegir el mejor encuadre y repetir un movimiento cuando hace falta.', tags: ['Cámara y estabilización profesional', 'Movimientos planificados', 'Tiempo para ensayar y revisar'] },
  { label: 'Montaje y ritmo', title: 'La velocidad también cuenta una historia.', copy: 'Seleccionamos las tomas y construimos el recorrido. Usamos speed ramps cuando aportan a la pieza: cambios graduales de velocidad que agilizan un desplazamiento y permiten detener la mirada en un detalle.', detail: 'El ritmo se adapta al objetivo: más contemplativo para mostrar arquitectura, más ágil para un reel o fluido para acompañar un recorrido FPV.', tags: ['Selección de tomas', 'Speed ramps y transiciones', 'Un ritmo pensado para cada formato'] },
  { label: 'Color grading', title: 'Una imagen coherente, de principio a fin.', copy: 'Ajustamos exposición, balance de blancos, contraste y color para dar continuidad visual a las tomas. El color grading define la terminación de la pieza respetando los materiales y la luz del inmueble.', detail: 'La comparación visual es una demostración ilustrativa sobre una fotografía terminada; no es un antes y después del video original.', tags: ['Luz y balance de blancos', 'Contraste y color', 'Consistencia entre ambientes'] },
  { label: 'Sonido y música', title: 'El sonido también construye el espacio.', copy: 'Editamos la música y sumamos ambientes y efectos de sonido que acompañan los movimientos y las transiciones. Cuidamos la mezcla para que el conjunto tenga intención y no tape una voz si hay una presentación.', detail: 'Ofrecemos música licenciada. Definimos las cuentas, los canales y si habrá campañas pagas para elegir una pista cuya licencia contemple esos usos.', tags: ['Música licenciada para el uso acordado', 'Ambientes y efectos de sonido', 'Mezcla y terminación profesional'] },
  { label: 'Entrega', title: 'Tu video, preparado para donde lo vas a usar.', copy: 'Exportamos la pieza en el formato acordado y compartimos un enlace privado para descargar el archivo de entrega. Podemos incorporar la identidad de tu inmobiliaria y un cierre con el mensaje definido.', detail: 'El plazo habitual de referencia es de 72 horas después de la producción. Confirmamos la fecha según la duración, los formatos y el trabajo de postproducción.', tags: ['Formato y canales acordados', 'Identidad y cierre de la pieza', 'Descarga del archivo en calidad de entrega'] },
];

function GimbalDrawing() {
  return <svg className="video-gimbal-drawing" viewBox="0 0 320 300" fill="none" aria-hidden="true"><g className="video-gimbal-handle"><path d="M160 270v-95l47-32" stroke="#d3c7a8" strokeWidth="15" strokeLinecap="round" /><rect x="150" y="214" width="20" height="54" rx="6" fill="#758b78" /><circle cx="208" cy="141" r="17" fill="#374e41" stroke="#d3c7a8" strokeWidth="4" /><path d="M208 140v-39h-48" stroke="#d3c7a8" strokeWidth="11" strokeLinejoin="round" /><circle cx="157" cy="101" r="15" fill="#374e41" stroke="#d3c7a8" strokeWidth="4" /></g><g className="video-gimbal-payload"><rect x="84" y="56" width="116" height="77" rx="12" fill="#3e5147" stroke="#d3c7a8" strokeWidth="3" /><path d="m120 56 8-16h31l9 16" stroke="#d3c7a8" strokeWidth="4" /><circle cx="140" cy="95" r="31" fill="#1e3028" stroke="#d3c7a8" strokeWidth="4" /><circle cx="140" cy="95" r="20" stroke="#78988e" strokeWidth="2" /><circle cx="140" cy="95" r="10" fill="#668a8d" /><circle cx="180" cy="71" r="3" fill="#d3c7a8" /></g></svg>;
}

function ProcessVisual({ active, visualRef }) {
  return (
    <div className="video-process-visual" ref={visualRef}>
      <div className="video-edit-monitor">
        <div className="video-monitor-top"><span>ARKO STUDIO</span><span>{steps[active].label.toUpperCase()}</span></div>
        <div className="video-monitor-frame">
          <img src={frame} alt="Interior utilizado para ilustrar la producción y edición audiovisual" width="1200" height="900" loading="lazy" />
          <div className={`video-process-layer video-plan-visual ${active === 0 ? 'is-active' : ''}`} aria-hidden="true"><div><span>EL PUNTO DE PARTIDA</span><strong>Una intención.<br />Un recorrido.</strong><p>Objetivo · formato · publicación</p></div></div>
          <div className={`video-process-layer video-rig-visual ${active === 1 ? 'is-active' : ''}`} aria-hidden="true"><GimbalDrawing /><span>CÁMARA + GIMBAL / MOVIMIENTO CONTROLADO</span></div>
          <div className={`video-process-layer video-speed-visual ${active === 2 ? 'is-active' : ''}`} aria-hidden="true"><span>EL RITMO DE LA PIEZA</span><strong>Avanzar.<br />Detener la mirada.</strong><svg viewBox="0 0 400 110"><path d="M0 90C70 90 65 15 140 15S210 90 270 90s65-65 130-65" stroke="#d2c19b" strokeWidth="3" fill="none" /><path d="M0 104h400" stroke="#ffffff33" /><circle cx="140" cy="15" r="5" fill="#d2c19b" /></svg><div><span>Más ágil</span><span>Más pausado</span></div></div>
          <div className={`video-process-layer video-color-visual ${active === 3 ? 'is-active' : ''}`} aria-hidden="true"><img src={frame} alt="" className="video-color-reference" width="1200" height="900" loading="lazy" /><img src={frame} alt="" className="video-color-finished" width="1200" height="900" loading="lazy" /><span className="video-color-divider" /><span className="video-color-label">COLOR GRADING · DEMOSTRACIÓN ILUSTRATIVA</span></div>
          <div className={`video-process-layer video-audio-visual ${active === 4 ? 'is-active' : ''}`} aria-hidden="true"><span>EL DISEÑO SONORO</span><strong>También se siente.</strong><div className="video-audio-track"><span>Música licenciada</span><div>{Array.from({length:36},(_,i)=><i key={i} style={{height:`${18+((i*17)%39)}%`}} />)}</div></div><div className="video-audio-track video-audio-track-effects"><span>Ambientes y efectos</span><div>{Array.from({length:36},(_,i)=><i key={i} style={{height:`${8+((i*29)%64)}%`}} />)}</div></div></div>
          <div className={`video-process-layer video-delivery-visual ${active === 5 ? 'is-active' : ''}`} aria-hidden="true"><span>LISTO PARA PUBLICAR</span><div><div className="video-output-landscape">16:9</div><div className="video-output-portrait">9:16</div></div><p>Tu formato, definido desde el inicio.</p></div>
        </div>
        <div className="video-monitor-timeline" aria-hidden="true"><div className="video-timeline-clips"><span /><span /><span /><span /><span /></div><div className="video-timeline-audio" /><i /></div>
      </div>
      <p className="video-monitor-caption">Una mirada al proceso, ilustrada paso a paso.</p>
    </div>
  );
}

export default function VideoProcess() {
  const [active, setActive] = useState(0);
  const layout = useRef(null), visual = useRef(null), articles = useRef([]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const anchor = innerHeight * (innerWidth < 900 ? .7 : .52);
      let index = 0;
      articles.current.forEach((article, i) => { if (article?.getBoundingClientRect().top <= anchor) index = i; });
      setActive(index);
      const rect = articles.current[index]?.getBoundingClientRect();
      const progress = rect ? Math.max(0, Math.min(1, (anchor - rect.top)/(rect.height*.85))) : 0;
      visual.current?.style.setProperty('--video-progress', progress);
      visual.current?.style.setProperty('--video-reveal', `${progress*100}%`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => {
      window.removeEventListener('scroll', schedule);
      if (entry.isIntersecting) { window.addEventListener('scroll', schedule, {passive:true}); schedule(); }
    }, {rootMargin:'100px'});
    if (layout.current) observer.observe(layout.current);
    window.addEventListener('resize', schedule); update();
    return () => { observer.disconnect(); window.removeEventListener('scroll',schedule); window.removeEventListener('resize',schedule); cancelAnimationFrame(frame); };
  }, []);
  return (
    <section id="video-proceso" className="photo-section video-process" aria-labelledby="video-process-title">
      <div className="photo-section-heading"><p className="photo-kicker">DE LA IDEA AL ARCHIVO FINAL</p><h2 id="video-process-title">Detrás de cada segundo,<br /><em>hay una producción.</em></h2><p>Seguí bajando para conocer cómo preparamos, grabamos y editamos tu video.</p></div>
      <div className="video-process-layout" ref={layout}><ProcessVisual active={active} visualRef={visual} /><div>{steps.map((step,i)=><article className={`video-process-step ${active===i?'is-current':''}`} key={step.label} ref={element=>{articles.current[i]=element;}}><p className="photo-step-label"><span>{String(i+1).padStart(2,'0')}</span>{step.label}</p><h3>{step.title}</h3><p>{step.copy}</p><ul>{step.tags.map(tag=><li key={tag}><span aria-hidden="true">✓</span>{tag}</li>)}</ul><p className="video-step-detail">{step.detail}</p></article>)}</div></div>
    </section>
  );
}
