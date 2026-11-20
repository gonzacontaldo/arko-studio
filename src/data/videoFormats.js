export const videoFormats = [
  {
    id: 'cine', name: 'Cinematográfico', label: 'PRESENTAR EN DETALLE', videoId: 'ni3x6uBh2ZA', project: 'Casa en Virazón', poster: '/portfolio-web/Virazon/Portada.jpg',
    title: 'Una mirada que se toma su tiempo.',
    description: 'Un recorrido con encuadres cuidados, movimientos suaves y atención a los detalles. Ideal para presentar la arquitectura y transmitir cómo se vive cada ambiente.',
    benefits: ['Muestra materiales, luz y terminaciones.', 'Construye una presentación completa y cuidada.', 'Acompaña la web, los portales y las presentaciones comerciales.'],
    channels: 'Web · portales · presentaciones', ratio: '16:9',
    goal: 'Mostrar la propiedad en detalle',
    recommendation: 'Te recomendamos un video cinematográfico.',
    reason: 'Le da espacio a la arquitectura, conecta los ambientes y permite detenerse en lo que hace especial a la propiedad.',
    requirement: 'Ambientes preparados, tiempo para repetir movimientos y una buena planificación de la luz.',
  },
  {
    id: 'reel', name: 'Reel', label: 'CAPTAR ATENCIÓN EN REDES', videoId: 'SAIckW_n0g0', project: 'Departamento en Tigre',
    title: 'El primer vistazo tiene otro ritmo.',
    description: 'Una pieza vertical, breve y dinámica, pensada para el celular. Seleccionamos los puntos más atractivos y los conectamos con una edición que acompaña el lenguaje de las redes.',
    benefits: ['Formato vertical para Reels, TikTok y Shorts.', 'Concentra los puntos fuertes en una pieza ágil.', 'Se puede planificar para una campaña o un llamado a la acción.'],
    channels: 'Instagram · TikTok · YouTube Shorts', ratio: '9:16',
    goal: 'Generar interés en redes sociales',
    recommendation: 'Te recomendamos un reel vertical.',
    reason: 'Prioriza un buen comienzo, un mensaje concreto y el ritmo para presentar la propiedad en una pantalla de celular.',
    requirement: 'Definir el mensaje, los ambientes protagonistas y qué querés que haga quien lo ve: consultar, visitar o conocer más.',
  },
  {
    id: 'fpv', name: 'FPV', label: 'CONECTAR LOS ESPACIOS', videoId: 'FdnXaE2IYpw', project: 'Casa en San Isidro',
    title: 'El espacio se entiende en movimiento.',
    description: 'Un recorrido inmersivo con drone FPV que conecta interiores y exteriores. La sensación de continuidad ayuda a entender cómo se relacionan los ambientes.',
    benefits: ['Permite seguir la circulación entre espacios.', 'Conecta interiores, jardín y exteriores.', 'Aporta una perspectiva dinámica e inmersiva.'],
    channels: 'Web · redes · presentaciones', ratio: '16:9',
    goal: 'Mostrar cómo se conectan los ambientes',
    recommendation: 'Te recomendamos un recorrido FPV.',
    reason: 'Ayuda a leer la distribución y a experimentar el paso entre los espacios. Revisamos antes si el inmueble permite el recorrido que buscás.',
    requirement: 'Una ruta despejada, accesos coordinados y tiempo de ensayo. La viabilidad se revisa según el lugar y las condiciones.',
  },
];

export const videoFormatById = Object.fromEntries(videoFormats.map(format => [format.id, format]));
