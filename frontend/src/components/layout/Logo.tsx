import { Link } from 'react-router-dom';
import { DEFAULT_LOGO, usePlatform } from '@/hooks/usePlatform';

export const Logo = ({ dark = false, to = '/' }: { dark?: boolean; to?: string }) => {
  const { name, logoUrl } = usePlatform();
  return (
    <Link to={to} className="group flex min-w-0 items-center gap-3 no-underline">
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
        <span className="absolute inset-0 rounded-xl bg-[conic-gradient(from_0deg,#f3dd9e,#c29a45,#8f6a24,#c29a45,#f3dd9e)] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-60" />
        {/* To'q fonda ochiq plitka ustida — shaffof fonli to'q logotip ham ko'rinadi */}
        <img
          src={logoUrl || DEFAULT_LOGO}
          alt=""
          className={`relative h-10 w-10 rounded-xl object-contain transition-transform duration-700 ease-premium group-hover:scale-105 ${dark ? 'bg-canvas p-0.5' : ''}`}
          onError={(e) => { e.currentTarget.src = DEFAULT_LOGO; }}
        />
      </span>
      <span className={`font-serif-title truncate text-lg font-bold leading-tight transition-colors duration-300 ${dark ? 'text-white' : 'text-primary'}`}>{name}</span>
    </Link>
  );
};
