import { useEffect, useRef, useState } from 'react';

/**
 * FadeIn — anima la entrada de cualquier elemento al hacer scroll.
 *
 * Props:
 *   delay     {number}  ms de retraso antes de que empiece la transición (stagger)
 *   direction {string}  'up' | 'down' | 'left' | 'right' | 'none'
 *   className {string}  clases extra para el div contenedor
 *   as        {string}  tag HTML ('div', 'section', 'article', ...)
 */
export default function FadeIn({
  children,
  delay     = 0,
  direction = 'up',
  className = '',
  as: Tag   = 'div',
}) {
  const ref     = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const initial = {
    up:    'opacity-0 translate-y-8',
    down:  'opacity-0 -translate-y-8',
    left:  'opacity-0 translate-x-8',
    right: 'opacity-0 -translate-x-8',
    none:  'opacity-0',
  }[direction] ?? 'opacity-0 translate-y-8';

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out ${seen ? 'opacity-100 translate-y-0 translate-x-0' : initial} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
