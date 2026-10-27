import { useEffect, useRef, useState, type CSSProperties, type ElementType, type MouseEvent, type ReactNode } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Element ko'rinish maydoniga kirganini kuzatadi (bir marta) */
export const useInView = <T extends Element>(threshold = 0.15) => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
};

/** Scroll qilinganda yumshoq paydo bo'luvchi blok */
export const Reveal = ({
  children, delay = 0, className = '', as: Tag = 'div',
}: { children: ReactNode; delay?: number; className?: string; as?: ElementType }) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'is-visible' : ''} ${className}`} style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
};

/** Sarlavhani so'zma-so'z ko'taradi */
export const SplitWords = ({ text, delay = 0, step = 70, className = '' }: { text: string; delay?: number; step?: number; className?: string }) => (
  <span className={className} aria-label={text}>
    {text.split(' ').map((w, i) => (
      <span key={`${w}-${i}`} className="word-reveal" aria-hidden>
        <span style={{ animationDelay: `${delay + i * step}ms` }}>{w}</span>
        {' '}
      </span>
    ))}
  </span>
);

/** Raqamni 0 dan qiymatgacha sanab chiqadi (ko'ringanda) */
export const CountUp = ({ value, duration = 1400, className = '' }: { value: number; duration?: number; className?: string }) => {
  const { ref, inView } = useInView<HTMLSpanElement>(0.3);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setN(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);
  return <span ref={ref} className={className}>{n.toLocaleString('uz-UZ')}</span>;
};

/** Kursor joylashuvini CSS o'zgaruvchilariga yozadi (.spotlight effekti uchun) */
export const spotlightHandler = (e: MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};

/** Sharqona sakkiz qirrali yulduz ornamenti (dekorativ) */
export const Ornament = ({ className = '', strokeOpacity = 0.35 }: { className?: string; strokeOpacity?: number }) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden fill="none" stroke="currentColor" strokeOpacity={strokeOpacity}>
    <g strokeWidth="0.8">
      <rect x="45" y="45" width="110" height="110" />
      <rect x="45" y="45" width="110" height="110" transform="rotate(45 100 100)" />
      <circle cx="100" cy="100" r="78" />
      <circle cx="100" cy="100" r="96" strokeDasharray="2 6" />
      <circle cx="100" cy="100" r="38" />
      <rect x="73" y="73" width="54" height="54" />
      <rect x="73" y="73" width="54" height="54" transform="rotate(45 100 100)" />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1="100" y1="22" x2="100" y2="62" transform={`rotate(${i * 22.5} 100 100)`} />
      ))}
    </g>
  </svg>
);
