import StudioScene from './hero/StudioScene';

export default function Hero({ onOpenModal }) {
  return (
    <section id="top" className="studio-hero">
      <div className="studio-hero-inner">
        <div className="studio-copy">
          <p className="studio-eyebrow"><span /> PRODUCCIÓN AUDIOVISUAL INMOBILIARIA</p>
          <h1>Tu propiedad.<br />Su mejor <span>perspectiva.</span></h1>
          <p className="studio-description">Fotografía y video inmobiliario en Buenos Aires. Creamos imágenes que hacen que tu propiedad se destaque desde el primer vistazo.</p>
          <div className="studio-actions">
            <button onClick={onOpenModal} className="studio-primary">Solicitar presupuesto <span aria-hidden="true">↗</span></button>
            <a href="#portfolio" className="studio-secondary">Ver portfolio <span aria-hidden="true">↗</span></a>
          </div>
          <div className="studio-location"><span className="studio-location-mark" aria-hidden="true">⌖</span> CABA Y ZONA NORTE <span className="studio-location-divider" /> FOTOGRAFÍA · DRONE · TOURS 360°</div>
        </div>
        <StudioScene />
      </div>
      <div className="studio-hero-bottom"><span>CADA ESPACIO TIENE UNA HISTORIA. LA HACEMOS VISIBLE.</span><a href="#portfolio">EXPLORÁ NUESTRO TRABAJO <span aria-hidden="true">↓</span></a></div>
    </section>
  );
}
