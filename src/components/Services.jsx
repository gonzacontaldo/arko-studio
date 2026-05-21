import { useState } from 'react';
import ServiceModal from './ServiceModal';

// ─── Imágenes de ejemplo por servicio ────────────────────────────────────────
// Reemplazá cada src con las imágenes reales de tu portafolio

const IMGS = {
  ext1:  'https://lh3.googleusercontent.com/aida-public/AB6AXuAfjVaw9HAi8bHXY-ZAEzhxCN_cXJ5uIOTpDDtSW0JULQXmggxLnFBOfWAfe8Jh7N0wa9TLAFO77xdpSE1PLXylrIj0EmBb6yP83PGVgQBQktfsaIy_FovaV8urwp45eifjxUJ0n8vX1UHNWf6wS4u2_aZtHlNYBkZWGjuLLlmt6uJ70QVBiR6Gmk045_9RybxlgCxOvWN7eFrvrgnKPNwbK_jIH8L2XtxhCAtAADmaMyuw-Elko9RINp5_-_wDIOAPWOe8x0HH0iw',
  kitch: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbcGOoD1nN547lnR0ahgMx4SCJS1_fsTIGaWlF3ttMXNGeQIhiDIo3hgzcceZMR8wmYrN3CpP0W3kPbZTHwSfM_5i2KockTbJ8n1nWEeql08WArR_d-9MN95ukWJLAOYedEzNJdP9pRDMkxj4a5_uqVmXnTYVKTiGO1ztUhL5rRKGy3kyyPKzjuw_wrR2TF8e2ze1mtYEfNChl-4ZJaoyuAzobOojk-qyPxZ4y2crn5BMzxR045oJs6iYa1IX4BRtxgyTOYY89xvc',
  bath:  'https://lh3.googleusercontent.com/aida-public/AB6AXuDRd3wJTbkixsBOu90n4AJlXxyjmt6am2Yd3DM3snY1NaT2YlOl_eVuzKgzX0bV3qNqkplHb_Ua-97e6SpI6EoQAICu_sEeapPiHrBPY9eQHJXPPP_fw2m2qxV-ws-zH7ZPE_LrN3d-og8TVav4uwB5vtdikgmrieQPlgvyaqMdJ_X4DE1hMwUf_1ost3y5D-6y3af4VhDtJt9NuBBGZ4IE9_tYJ-RaRdx94jCUXNyigInV0FFdboQHCd1TQAy_fJfwYR3-Z07i1kA',
  bed:   'https://lh3.googleusercontent.com/aida-public/AB6AXuD6NbrrO3HlakeiijaX4JiSg3u70ojkkjGfIU9R6hxDCL7eCcb86FuxTV0GgPfQLk2p93NC6xs54DJ20A3M62qMjojYmbKcTAW6oXfylAyZmKVBWfFwpndjCk1X1WQZKue6Jjr2Wshl6AcqBdGb1M5zJ_LO6iIgils1BOyg-G3S8A2knqwsskc6SBtK9jdLKYtY_b9V8VvKbcOlI8y-_aAMPxrx4V3k_INcqqM3Or4HsRmPknIkz5Q-XjFJ6tdHZOa23dMt2a99PsY',
  pool:  'https://lh3.googleusercontent.com/aida-public/AB6AXuC-eaQOsoNwZHcyTdaoWVtJe5R9zNjGp6SVaRkITtw9DDkwIPP8FNRUpqcjq3VfsfD7o9QXVgItaNZwZi1jAygBqfCJyYMUQQtbOitbSY-kaw8H3os5Pop2FqufwqA0bc6fXXimkn9Wm62_-DkpiLDdDfxct1qipA5eNdWyn4ypt4BiAGHsVmHf3kmgS6FDTY7AQUJm5W4mYsvgFXDvgUgoz3SvjZJsQGfQrO2g2zQeu6pBSx5srNsG-m6IK1eD39u3vtUotedyhPM',
  living:'https://lh3.googleusercontent.com/aida-public/AB6AXuAaYEMiH0cod3dojq_26y7_U4HsBimeHvnFcgudLVYryFdBTnSQvr-ZT8OJvIUcNN3ngyVGGte8uKZJhtvEYfWWr-nsiabZ5md8MP-ueKX1803lSdBjKQeElUupENuTXRFtATzqBFcN41FAr0GhztUi-cceLWEl7VQwmmUIzU1saDXqed36d4VG9OUNBcljkduhHODkiepgj6usBYdfhVhC-VQMhEeD8zcFh5PSDl64FQN7SHsA_bSSl-rDG59avDmgLQ_bQ-URm3U',
  tour:  'https://lh3.googleusercontent.com/aida-public/AB6AXuCF-qZzYUah1j5VwO9C9NAOhGJ8pdT5vM5Tyyo-F7Rm2JHym4jqS6n5PZ6Vg-kh-zyQJo3ikSc7W7IYdzszcOysmpgvX8fuVREVXs9oNE12BnooavNRgfM0sDLMcbahXLwxI6FipvLPa4NGBAyiQ0Rwq1feJ1byy23T_qMZFeg5g0ZkQYesZB7ll7LKX67_P6pSuK1xQWHFjekTIILJms3u27Xd5WSKA87nGxv8nW-UwY8ZnH7OiIdufju3LFc_1xy8jv8iw-gJ9u0',
  reel:  'https://lh3.googleusercontent.com/aida-public/AB6AXuA4iHgOrimJhX05uIoECVEOif8xrBKhJmXI2Tly9olHdXMbK7MaFgStjg2pCRLqVLxTspa14RvDo-9FDj1CGqRaG89r6WioYgtHDLk1Tb9zlMRe6C3qS4crHZdZiEUyl2tRKrMJSmyZ7EcYrk7aFVK_oiPWPlNGrsyjmHjFRE0iHjCOHzsZsYUmZ77a3u1SjD0jWJ4V5zCU42xQ-GO--4GizqypHcnGha63xkPuys90wr1_SRmUAT1xFhdn5TRZxWT6PMZcdrAVgSk',
  bldg:  'https://lh3.googleusercontent.com/aida-public/AB6AXuA3B-sAaKR52hi9ZnCb2av0yckpNVjLNxDx6LF7NN3q9B4IQI9UEzLItw_3za0qc6s6sDAFUlZweaMl1kQbWczszHBpecwOeu98pxP6Bm4n3mIztvJwCSe9b1BXwxJER5I1AGHmGEcubLbg1woKwrTScNH14AxDbZHj36myvf3pgLOqwA-of-EnbzmN2JtcZx7saexdSK6o_IplVs2T90XJRk5XNa_8YiBIKJoYA065IWshFOjEZHp6yd7x7cdA59yezXfGVvD1ti8',
  hero:  'https://lh3.googleusercontent.com/aida-public/AB6AXuAX7ukA6PdwpBuB2bVlbGlixWRNkhIkyXbU-xKRpcEF-CbZGk6RMQRtl_H01OLgeL8B1OMfEJTTEdeFD8s-am72E-CCw3vHdwsCSrHj7tYtGfk-ALJHhUgwscLaHpxAaKX7UAiHlQ44UZ2Kw0oLXKssMbGNHudhyz-TjY4rw9wHDTSguyyKXzUcV3_2EutnDr6fn0f3D9McEB9yhZxoFz9Y6OIWZ7FPXdUpf8nlgU6T3UYhlX88I8EyCQv2y2GUjUfxFA91Wd9_aRE',
};

// ─── Datos de servicios ───────────────────────────────────────────────────────

const services = [
  {
    icon: 'photo_camera',
    title: 'Fotografía Inmobiliaria',
    description:
      'Tomas gran angulares y detalles clave, procesados con estándares de calidad premium para publicaciones que venden.',
    features: ['Retoque HDR', 'Reemplazo de cielo', 'Sesiones al atardecer'],
    examples: [
      { src: IMGS.ext1,  alt: 'Fachada de casa moderna al atardecer',           label: 'Exterior · Hora azul'   },
      { src: IMGS.kitch, alt: 'Cocina moderna con isla de mármol',               label: 'Interior · Cocina'      },
      { src: IMGS.bath,  alt: 'Baño de lujo con bañadera independiente',         label: 'Interior · Baño'        },
      { src: IMGS.bed,   alt: 'Dormitorio principal con luz natural',            label: 'Interior · Dormitorio'  },
      { src: IMGS.living,alt: 'Living amplio con diseño escandinavo',            label: 'Interior · Living'      },
      { src: IMGS.hero,  alt: 'Villa moderna con piscina infinita al atardecer', label: 'Exterior · Premium'     },
    ],
  },
  {
    icon: 'movie',
    title: 'Videos para Redes',
    description:
      'Contenido vertical optimizado para Instagram y TikTok. Ediciones dinámicas que muestran la energía del espacio.',
    features: ['Estabilización 4K', 'Música licenciada', 'Clips del agente'],
    examples: [
      { src: IMGS.reel,  alt: 'Reel vertical de dormitorio moderno',             label: 'Instagram Reel · Dormitorio' },
      { src: IMGS.living,alt: 'Toma cinematográfica de living',                  label: 'Reel · Living'               },
      { src: IMGS.kitch, alt: 'Video de cocina con slider horizontal',           label: 'Toma deslizante · Cocina'    },
      { src: IMGS.ext1,  alt: 'Video de fachada al amanecer',                    label: 'Exterior · Apertura'         },
      { src: IMGS.pool,  alt: 'Video cenital de patio y pileta',                 label: 'Exterior · Jardín'           },
    ],
  },
  {
    icon: 'architecture',
    title: 'Planos 2D',
    description:
      'Planos 2D precisos con medición láser para que los compradores comprendan la distribución real de cada espacio.',
    features: ['Medición láser', 'Planos a escala', 'Integración con fotos'],
    examples: [
      { src: IMGS.kitch, alt: 'Ambiente cocina comedor',        label: 'Cocina · Comedor'           },
      { src: IMGS.living,alt: 'Living con distribución abierta', label: 'Living · Planta libre'     },
      { src: IMGS.bed,   alt: 'Suite principal con vestidor',    label: 'Dormitorio · Suite'         },
      { src: IMGS.bath,  alt: 'Baño completo en suite',          label: 'Baño · En suite'            },
      { src: IMGS.ext1,  alt: 'Vista aérea de la planta baja',   label: 'Planta baja · Completa'    },
    ],
  },
  {
    icon: 'vrpano',
    title: 'Tours Virtuales 360°',
    description:
      'Recorridos interactivos con Matterport y Kuula. El comprador explora cada ambiente a su ritmo, desde cualquier dispositivo.',
    features: ['Insta360 X5', 'Matterport', 'Kuula'],
    examples: [
      { src: IMGS.tour,  alt: 'Tour 360° del living',            label: 'Living · Tour interactivo'  },
      { src: IMGS.kitch, alt: 'Tour 360° de la cocina',          label: 'Cocina · Vista panorámica'  },
      { src: IMGS.bed,   alt: 'Tour 360° del dormitorio',        label: 'Dormitorio · 360°'          },
      { src: IMGS.bath,  alt: 'Tour 360° del baño principal',    label: 'Baño · Vista Dollhouse'     },
      { src: IMGS.living,alt: 'Vista Dollhouse del inmueble',    label: 'Planta · Vista Dollhouse'   },
      { src: IMGS.ext1,  alt: 'Tour 360° del exterior',          label: 'Exterior · Panorámica'      },
    ],
  },
  {
    icon: 'flight_takeoff',
    title: 'Tomas Aéreas 360°',
    description:
      'Perspectivas aéreas impactantes para mostrar la propiedad y su entorno con el DJI Avata 2. Ideal para lotes, casas con jardín y ubicaciones privilegiadas.',
    features: ['DJI Avata 2', 'Tomas 360°', 'Edición profesional'],
    examples: [
      { src: IMGS.pool,  alt: 'Vista aérea cenital de pileta y jardín',          label: 'Aéreo · Jardín y pileta'    },
      { src: IMGS.bldg,  alt: 'Toma aérea de edificio moderno',                  label: 'Aéreo · Torre en altura'    },
      { src: IMGS.hero,  alt: 'Toma aérea de villa con piscina infinita',        label: 'Aéreo · Vista panorámica'   },
      { src: IMGS.ext1,  alt: 'Fachada y entorno desde altura',                  label: 'Aéreo · Fachada y contexto' },
    ],
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Services({ onOpenBudget }) {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <>
      <section id="servicios" className="py-16 md:py-32 px-4 md:px-8 bg-surface">
        <div className="max-w-7xl mx-auto mb-12 md:mb-20 text-center">
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-locked mb-4">Nuestros Servicios</h2>
          <div className="w-20 h-1 bg-secondary mx-auto" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-surface-container-low p-7 rounded-md border-b-2 border-transparent hover:border-secondary transition-all flex flex-col"
            >
              <span className="material-symbols-outlined text-secondary mb-5 text-3xl block">
                {service.icon}
              </span>
              <h3 className="font-headline font-bold text-lg mb-3">{service.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-5 flex-1">
                {service.description}
              </p>
              <ul className="text-xs space-y-1.5 text-on-surface font-semibold uppercase tracking-wider mb-6">
                {service.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <button
                onClick={() => setSelectedService(service)}
                className="mt-auto flex items-center gap-1.5 text-secondary font-headline font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all duration-200 group"
              >
                {/* Ver ejemplos
                <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover:translate-x-0.5">
                  arrow_forward
                </span> */}
              </button>
            </div>
          ))}
        </div>
      </section>

      {selectedService && (
        <ServiceModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onOpenBudget={onOpenBudget}
        />
      )}
    </>
  );
}
