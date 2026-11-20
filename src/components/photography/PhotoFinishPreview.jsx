import { useState } from 'react';
import photo from '../../assets/BeforeAfter/After-optimized.jpg';

export default function PhotoFinishPreview() {
  const [reveal, setReveal] = useState(62);
  const [brand, setBrand] = useState('TU INMOBILIARIA');
  const [position, setPosition] = useState('bottom-right');
  const [showBrand, setShowBrand] = useState(true);

  return (
    <section className="photo-finish photo-section" id="resultado-fotografia" aria-labelledby="photo-finish-title">
      <div className="photo-finish-header"><div><p className="photo-kicker">EL ÚLTIMO DETALLE TAMBIÉN IMPORTA</p><h2 id="photo-finish-title">La luz, el color.<br /><em>Y tu identidad.</em></h2></div><p>Explorá una demostración del tratamiento visual y probá cómo puede acompañar tu marca a las fotografías.</p></div>
      <div className="photo-finish-grid">
        <div>
          <div className="photo-comparison" style={{ '--reveal': `${reveal}%` }}>
            <img src={photo} alt="Demostración de una referencia de luz y color sobre una fotografía terminada" className="photo-demo-unedited" width="1920" height="1280" loading="lazy" />
            <img src={photo} alt="Fotografía final del living, con luz y color equilibrados" className="photo-comparison-finished" width="1920" height="1280" loading="lazy" />
            {showBrand && brand.trim() && <span className={`photo-preview-watermark ${position}`}>{brand}</span>}
            <span className="photo-comparison-line" aria-hidden="true"><i>‹ ›</i></span>
            <div className="photo-comparison-labels" aria-hidden="true"><span>Resultado final</span><span>Simulación previa</span></div>
            <input type="range" min="0" max="100" value={reveal} onChange={event => setReveal(Number(event.target.value))} aria-label="Comparar simulación de edición con resultado final" aria-valuetext={`${reveal}% de resultado final visible`} />
          </div>
          <p className="photo-demo-caption">Demostración ilustrativa sobre una foto terminada. No es un antes y después de un archivo RAW original.</p>
        </div>
        <div className="photo-brand-controls">
          <p className="photo-kicker">VISTA PREVIA DE TU MARCA</p><h3>Hacela tuya.</h3><p>Tu logo o marca de agua, en la ubicación y el tamaño que acordemos.</p>
          <label htmlFor="photo-brand">Nombre de tu inmobiliaria</label><input id="photo-brand" type="text" value={brand} maxLength={40} onChange={event => setBrand(event.target.value)} autoComplete="organization" />
          <label htmlFor="photo-brand-position">Ubicación de la marca</label><select id="photo-brand-position" value={position} onChange={event => setPosition(event.target.value)}><option value="bottom-right">Abajo a la derecha</option><option value="bottom-left">Abajo a la izquierda</option><option value="center">Centrada</option></select>
          <label className="photo-brand-toggle"><input type="checkbox" checked={showBrand} onChange={event => setShowBrand(event.target.checked)} /> Mostrar marca de ejemplo</label>
          <p className="photo-brand-note">Al coordinar, nos enviás tu logo para preparar la marca definitiva. Esta vista previa es orientativa.</p>
        </div>
      </div>
    </section>
  );
}
