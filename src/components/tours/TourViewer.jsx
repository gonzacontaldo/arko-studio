export default function TourViewer({ platform, viewerKey, activeViewer, onOpen, onClose, hero=false }) {
  const active=activeViewer===viewerKey;
  return <div className={`tour-viewer ${hero?'tour-viewer-hero':''}`} role="group" aria-label={`Ejemplo interactivo de ${platform.name}`}>
    {active?<><iframe src={platform.embedUrl} title={`Tour virtual ${platform.name} — ${platform.project}`} allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/><button className="tour-viewer-close" type="button" onClick={onClose} aria-label={`Cerrar recorrido ${platform.name}`}>×</button></>:<button className="tour-viewer-launch" type="button" onClick={()=>onOpen(viewerKey)} aria-label={`Explorar ejemplo ${platform.name}`}><img src={platform.poster} alt={`Vista previa del recorrido ${platform.name}`} width="1280" height="720" loading={hero?'eager':'lazy'}/><span className="tour-viewer-icon" aria-hidden="true"><span className="material-symbols-outlined">360</span></span><span className="tour-viewer-launch-label">EXPLORAR {platform.name.toUpperCase()}<span>{platform.project}</span></span></button>}
  </div>;
}
