import { CheckCircleFilled } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { Ornament } from '@/components/motion/motion';
import { usePlatform } from '@/hooks/usePlatform';

const POINTS = ['Raqamli tarixiy manbalar kutubxonasi', 'Tanqidiy tahlil laboratoriyasi', '3D/360° virtual muzey', 'Elektron portfolio va kompetensiya profili'];

/**
 * Kirish/ro'yxat sahifalari uchun ikki ustunli premium qobiq.
 * Balandligi ekrandan (100dvh − header) oshmaydi; sig'masa faqat forma qismi scroll bo'ladi.
 */
export const AuthShell = ({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) => {
  const { name } = usePlatform();
  return (
    <div className="animate-scale-in mx-auto grid w-full max-w-[960px] overflow-hidden rounded-[24px] border border-line bg-white shadow-lift lg:max-h-[calc(100dvh-68px-48px)] lg:grid-cols-[0.9fr_1.1fr]">
      {/* Dekorativ panel */}
      <aside className="grain relative hidden overflow-hidden bg-midnight px-9 py-9 text-white lg:flex lg:flex-col">
        <div className="aurora opacity-70" aria-hidden><span /><span /><span /></div>
        <div className="pattern-girih absolute inset-0 opacity-50" aria-hidden />
        <Ornament className="animate-spin-slow pointer-events-none absolute -bottom-28 -right-28 h-96 w-96 text-accent-light" strokeOpacity={0.3} />
        <div className="relative">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-light">{name}</div>
          <h2 className="font-serif-title m-0 mt-3 text-[30px] font-bold leading-tight">
            Manbadan — <span className="text-gold-gradient italic">mahoratga</span>
          </h2>
          <p className="mb-0 mt-3 max-w-xs text-[15px] leading-relaxed text-white/70">Bo‘lajak tarix o‘qituvchisining metodik yo‘li bitta raqamli muhitda.</p>
        </div>
        <ul className="relative m-0 mt-auto list-none space-y-2.5 p-0 pt-8">
          {POINTS.map((p, i) => (
            <li key={p} className="animate-fade-up flex items-center gap-3 text-sm text-white/80" style={{ animationDelay: `${300 + i * 100}ms` }}>
              <CheckCircleFilled className="text-accent-light" />
              {p}
            </li>
          ))}
        </ul>
      </aside>

      {/* Forma */}
      <section className="flex min-h-0 flex-col justify-center overflow-y-auto px-6 py-7 sm:px-10 sm:py-8">
        <div className="gold-rule mb-4" aria-hidden />
        <h1 className="font-serif-title m-0 text-[26px] font-bold leading-tight sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mb-0 mt-1.5 text-[15px] text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-5 border-t border-line pt-4 text-sm">{footer}</div>}
      </section>
    </div>
  );
};
