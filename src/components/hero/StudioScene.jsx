import { useEffect, useRef, useState } from 'react';
import fallback from '../../assets/portfolio-web/Yacht/Portada.jpg';

export default function StudioScene() {
  const host = useRef(null);
  const scene = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('./createStudioScene').then(({ createStudioScene }) => {
      if (cancelled) return;
      try { scene.current = createStudioScene(host.current, () => setReady(true)); }
      catch { setFailed(true); host.current?.replaceChildren(); }
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; scene.current?.dispose(); scene.current = null; };
  }, []);

  return (
    <div className="studio-visual" role="group" aria-label="Nuestros equipos: cámara con trípode, dron, cámara 360 y cámara en gimbal">
      {(!ready || failed) && <img className="studio-fallback" src={fallback} alt="Fotografía inmobiliaria de ARKO Studio" />}
      <div className={`studio-canvas ${ready ? 'is-ready' : ''}`} ref={host} aria-hidden="true" />
      {ready && !failed && (
        <button
          className="studio-pause"
          type="button"
          aria-label={paused ? 'Reanudar animación' : 'Pausar animación'}
          aria-pressed={paused}
          onClick={() => { scene.current?.setPaused(!paused); setPaused(!paused); }}
        >
          {paused ? '▶' : 'Ⅱ'}
        </button>
      )}
    </div>
  );
}
