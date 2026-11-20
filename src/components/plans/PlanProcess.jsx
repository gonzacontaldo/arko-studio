import {useServiceMedia} from '../../lib/serviceMedia';
import { useEffect, useRef, useState } from 'react';
import FloorPlanIllustration from './FloorPlanIllustration';

const steps = [
  { label:'La visita', stage:'visit', title:'Coordinamos el relevamiento.', copy:'Nos contás qué propiedad es, su superficie y qué espacios necesitás incluir. Organizamos el acceso para poder recorrer y medir los ambientes el día del servicio.', detail:'Si también contratás fotografía u otros servicios, coordinamos el relevamiento dentro de la visita prevista.', tags:['Propiedad y espacios a incluir','Accesos y disponibilidad','Alcance acordado antes de la visita'] },
  { label:'Medición láser', stage:'laser', title:'Las medidas se toman en el inmueble.', copy:'El día del servicio recorremos la propiedad y relevamos las medidas con un medidor láser. Registramos la disposición de los ambientes y cómo se conectan entre sí.', detail:'Necesitamos acceso a los espacios incluidos y puntos de medición despejados. El relevamiento es la base para preparar el esquema después.', tags:['Medición presencial con láser','Registro de ambientes','Relación entre los espacios'] },
  { label:'Elaboración posterior', stage:'drawing', title:'Después de la visita, dibujamos el plano.', copy:'Con las medidas y las referencias relevadas elaboramos un plano esquemático 2D. Organizamos los ambientes, sus nombres y la información acordada para que la distribución sea fácil de interpretar.', detail:'El dibujo se prepara después del relevamiento y se organiza para facilitar la lectura de la propiedad.', tags:['Elaboración a partir del relevamiento','Distribución y ambientes identificados','Lectura clara del conjunto'] },
  { label:'Entrega', stage:'finished', title:'La distribución, lista para tu publicación.', copy:'Compartimos el archivo digital del plano esquemático para que lo incorpores a tu presentación. Junto a las fotos y el video, ayuda a entender la relación entre los ambientes antes de visitar la propiedad.', detail:'Confirmamos el formato y la fecha de entrega al coordinar el servicio, según la superficie y el alcance del relevamiento.', tags:['Archivo digital','Uso en publicaciones inmobiliarias','Formato y entrega acordados'] },
];

export default function PlanProcess() {
  const media=useServiceMedia('planos-2d');
  const [active,setActive]=useState(0);
  const articles=useRef([]),visual=useRef(null),layout=useRef(null);
  useEffect(()=>{
    let frame=0;
    const update=()=>{
      frame=0;const anchor=innerHeight*(innerWidth<900?.7:.52);let index=0;
      articles.current.forEach((article,i)=>{if(article?.getBoundingClientRect().top<=anchor)index=i;});
      setActive(index);
      const rect=articles.current[index]?.getBoundingClientRect();
      const progress=rect?Math.max(0,Math.min(1,(anchor-rect.top)/(rect.height*.8))):0;
      visual.current?.style.setProperty('--plan-progress',progress);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    const observer=new IntersectionObserver(([entry])=>{window.removeEventListener('scroll',schedule);if(entry.isIntersecting){window.addEventListener('scroll',schedule,{passive:true});schedule();}},{rootMargin:'100px'});
    if(layout.current)observer.observe(layout.current);window.addEventListener('resize',schedule);update();
    return()=>{observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);cancelAnimationFrame(frame);};
  },[]);
  return <section className="photo-section plan-process" id="plan-proceso" aria-labelledby="plan-process-title"><div className="photo-section-heading"><p className="photo-kicker">DEL INMUEBLE AL ESQUEMA</p><h2 id="plan-process-title">Medimos en la visita.<br /><em>Lo elaboramos después.</em></h2><p>Un relevamiento presencial y un dibujo pensado para explicar la distribución.</p></div><div className="plan-process-layout" ref={layout}><div className="plan-process-visual" ref={visual}><div className="plan-process-paper"><FloorPlanIllustration stage={steps[active].stage} selected={active===1?'living':null} /><div className="plan-process-label"><span>{steps[active].label}</span><span>EJEMPLO ILUSTRATIVO</span></div></div><p className="plan-illustration-note">{media.planCaption}</p></div><div>{steps.map((step,i)=><article className="plan-process-step" key={step.label} ref={element=>{articles.current[i]=element;}}><p className="photo-step-label"><span>{String(i+1).padStart(2,'0')}</span>{step.label}</p><h3>{step.title}</h3><p>{step.copy}</p><ul>{step.tags.map(tag=><li key={tag}><span aria-hidden="true">✓</span>{tag}</li>)}</ul><p className="plan-step-detail">{step.detail}</p></article>)}</div></div></section>;
}
