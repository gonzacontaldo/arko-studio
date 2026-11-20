export default function VideoExample({ format, playerKey, activePlayer, onPlay, onClose, hero = false }) {
  const playing = activePlayer === playerKey;
  return (
    <div className={`video-example ${format.id === 'reel' ? 'video-example-vertical' : ''} ${hero ? 'video-example-hero' : ''}`} role="group" aria-label={`Ejemplo de ${format.name.toLowerCase()}: ${format.project}`}>
      <div className="video-example-screen">
        {playing ? (
          <>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${format.videoId}?autoplay=1&rel=0&playsinline=1`}
              title={`Ejemplo de video ${format.name.toLowerCase()} — ${format.project} — ARKO Studio`}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
            />
            <button className="video-player-close" onClick={onClose} aria-label={`Cerrar reproducción de ${format.name.toLowerCase()}`}>×</button>
          </>
        ) : (
          <button className="video-example-play" onClick={() => onPlay(playerKey)} aria-label={`Reproducir ejemplo ${format.name.toLowerCase()}: ${format.project}`}>
            <img src={format.poster || `https://i.ytimg.com/vi/${format.videoId}/maxresdefault.jpg`} alt="" width="1280" height="720" loading={hero ? 'eager' : 'lazy'} />
            <span className="video-play-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 5 11 7-11 7z" /></svg></span>
            <span className="video-example-caption">{hero ? 'VER UN TRABAJO REAL' : format.project}<span>{format.name} · {format.ratio}</span></span>
          </button>
        )}
      </div>
    </div>
  );
}
