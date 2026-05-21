const values = [
  {
    icon: 'groups',
    title: 'Atraé compradores calificados',
    description:
      'Nuestro contenido visual filtra el interés y garantiza que cada visita sea de un comprador potencial real.',
  },
  {
    icon: 'timer_off',
    title: 'Reducí las visitas innecesarias',
    description:
      'Los tours 360° y los videos responden preguntas antes de que el comprador pise la propiedad.',
  },
  {
    icon: 'trending_up',
    title: 'Aumentá el valor percibido',
    description:
      'La iluminación y composición profesional elevan el valor percibido de cada metro cuadrado.',
  },
  {
    icon: 'diamond',
    title: 'Destacate del resto',
    description: 'No solo publiques: creá una experiencia visual que domine el mercado.',
  },
];

export default function ValueSection() {
  return (
    <section className="py-16 md:py-32 px-4 md:px-8 bg-surface">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
        {values.map(({ icon, title, description }) => (
          <div key={title} className="space-y-4">
            <span className="material-symbols-outlined text-secondary text-4xl block">{icon}</span>
            <h3 className="font-headline font-bold text-lg">{title}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
