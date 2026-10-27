import { Ornament } from '@/components/motion/motion';

/** Brendlangan yuklanish holati: aylanuvchi ornament + oltin yoy */
export const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Yuklanmoqda">
    <div className="relative h-16 w-16">
      <Ornament className="absolute inset-0 h-16 w-16 animate-[spin-slow_8s_linear_infinite] text-accent" strokeOpacity={0.5} />
      <span className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-primary" />
    </div>
  </div>
);
