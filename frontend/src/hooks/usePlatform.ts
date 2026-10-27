import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/portfolio.service';

/** Standart logotip (public/logo.png). Admin «Sozlamalar»da o'z logotipini yuklasa — o'shanisi ishlatiladi */
export const DEFAULT_LOGO = '/logo.png';

/** Platforma nomi va logotipi — admin sozlamalaridan */
export const usePlatform = () => {
  const q = useQuery({ queryKey: ['settings', 'public'], queryFn: adminService.publicSettings, staleTime: 5 * 60_000 });
  return {
    name: q.data?.['platform.name'] || 'Digital History Teacher',
    fullName: q.data?.['platform.fullName'] ?? '',
    description: q.data?.['platform.description'] ?? '',
    logoUrl: q.data?.['platform.logoUrl'] ?? '',
    institution: q.data?.['platform.institution'] ?? '',
  };
};
