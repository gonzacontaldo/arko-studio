export const services = {
  'fotografia-inmobiliaria': {
    title: 'Fotografía Inmobiliaria Profesional en Buenos Aires | ARKO Studio',
    description: 'Fotografía profesional de propiedades con edición cuidada para inmobiliarias, desarrolladoras y propietarios en Buenos Aires y Zona Norte.',
    eyebrow: 'Fotografía profesional',
    h1: 'Fotografía inmobiliaria profesional',
    intro: 'Creamos imágenes claras y atractivas que presentan cada propiedad con fidelidad y ayudan a destacarla en portales, redes y campañas comerciales.',
    sections: [
      ['Imágenes que explican el espacio', 'Realizamos tomas generales y de detalle para comunicar distribución, amplitud, luz y terminaciones en casas, departamentos, oficinas, lotes y desarrollos.'],
      ['Edición y entrega', 'Cada selección recibe edición profesional para lograr una presentación consistente, natural y lista para publicar en los canales de venta o alquiler.'],
      ['Para equipos de real estate', 'El servicio está pensado para inmobiliarias, desarrolladoras y propietarios que necesitan una identidad visual sólida para sus publicaciones.'],
    ],
  },
  'video-inmobiliario': {
    title: 'Video Inmobiliario en Buenos Aires | ARKO Studio',
    description: 'Producción de video inmobiliario horizontal y vertical para propiedades, inmobiliarias y desarrolladoras en Buenos Aires y Zona Norte.',
    eyebrow: 'Producción audiovisual',
    h1: 'Video inmobiliario para presentar propiedades',
    intro: 'Producimos piezas audiovisuales que recorren los ambientes y transmiten la experiencia del espacio en formatos preparados para portales y redes sociales.',
    sections: [
      ['Una narrativa visual del inmueble', 'Planificamos recorridos que conectan interiores, exteriores y detalles para que cada video sea claro, dinámico y coherente con la propiedad.'],
      ['Formatos para cada canal', 'Trabajamos contenido horizontal y vertical, incluyendo piezas para redes, para que una misma producción pueda acompañar distintas acciones comerciales.'],
      ['Edición profesional', 'La selección de tomas, el ritmo y la terminación visual buscan elevar el valor percibido sin distorsionar las características reales del inmueble.'],
    ],
  },
  'drone-inmobiliario': {
    title: 'Drone Inmobiliario en Buenos Aires | ARKO Studio',
    description: 'Fotografía y video con drone para mostrar propiedades, lotes, desarrollos y su entorno en Buenos Aires y Zona Norte.',
    eyebrow: 'Perspectivas aéreas',
    h1: 'Drone inmobiliario para propiedades y desarrollos',
    intro: 'Las tomas aéreas aportan contexto y escala: permiten mostrar el lote, los exteriores, los accesos y la relación de la propiedad con su entorno.',
    sections: [
      ['Cuándo aporta una toma aérea', 'Es especialmente útil para casas con jardín, lotes, barrios, complejos y desarrollos donde la ubicación y el entorno forman parte de la propuesta.'],
      ['Fotografía y video', 'Integramos material aéreo con la producción visual de la propiedad para construir una presentación completa y coherente.'],
      ['Contenido pensado para comercializar', 'Seleccionamos perspectivas que ayudan a comprender el inmueble y funcionan tanto en publicaciones como en videos y campañas digitales.'],
    ],
  },
  'tour-virtual-360': {
    title: 'Tour Virtual 360° Inmobiliario en Buenos Aires | ARKO Studio',
    description: 'Tours virtuales 360° para recorrer propiedades online desde cualquier dispositivo. Servicio para real estate en Buenos Aires y Zona Norte.',
    eyebrow: 'Recorridos interactivos',
    h1: 'Tour virtual 360° para propiedades',
    intro: 'Creamos recorridos interactivos para que potenciales compradores o inquilinos exploren los ambientes a su ritmo desde cualquier dispositivo.',
    sections: [
      ['Visitas online más completas', 'Un tour 360° permite comprender la circulación y la relación entre ambientes antes de coordinar una visita presencial.'],
      ['Integración en la comunicación', 'El recorrido puede complementar fotografías, videos y planos dentro de una presentación digital más informativa.'],
      ['Para propiedades y desarrollos', 'Es una herramienta útil para inmobiliarias, desarrolladoras y propietarios que necesitan mostrar espacios de manera remota.'],
    ],
  },
  'planos-2d': {
    title: 'Planos 2D para Propiedades en Buenos Aires | ARKO Studio',
    description: 'Planos 2D con medición para comunicar la distribución de casas, departamentos y espacios comerciales en Buenos Aires y Zona Norte.',
    eyebrow: 'Distribución del espacio',
    h1: 'Planos 2D para publicaciones inmobiliarias',
    intro: 'Los planos ayudan a entender de un vistazo la distribución y la relación entre los ambientes de una propiedad.',
    sections: [
      ['Información visual complementaria', 'Combinados con fotografía, video y tours, los planos aportan una lectura práctica que facilita la evaluación del inmueble.'],
      ['Medición y representación', 'Realizamos el relevamiento y preparamos una pieza visual clara, pensada para incorporarse a publicaciones y presentaciones comerciales.'],
      ['Casas, departamentos y oficinas', 'El servicio se adapta a distintos tipos de propiedades y resulta útil para inmobiliarias, desarrolladoras y propietarios.'],
    ],
  },
};

export const serviceLinks = Object.entries(services).map(([slug, service]) => ({ slug, label: service.h1 }));
