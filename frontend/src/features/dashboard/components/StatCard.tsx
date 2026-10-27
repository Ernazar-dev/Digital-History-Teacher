import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CountUp } from '@/components/motion/motion';

export const StatCard = ({ title, value, suffix, icon, to }: { title: string; value: number | string; suffix?: string; icon?: ReactNode; to?: string }) => {
  const card = (
    <div
      className={`group h-full rounded-2xl border border-line bg-white p-5 transition-all duration-300 ${
        to ? 'cursor-pointer hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-muted">{title}</div>
          <div className="font-serif-title mt-2 text-[32px] font-bold leading-none text-ink">
            {typeof value === 'number' ? <CountUp value={value} /> : value}
            {suffix && <span className="ml-1 font-sans text-base font-medium text-muted">{suffix}</span>}
          </div>
        </div>
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-lg text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
  return to ? <Link to={to} className="block no-underline">{card}</Link> : card;
};
