import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Filtrlarni URL query parametrlarida saqlaydi (havolani ulashish va orqaga qaytish uchun) */
export const useUrlState = <T extends Record<string, string | number | undefined>>(numericKeys: (keyof T)[] = []) => {
  const [params, setParams] = useSearchParams();
  const state = useMemo(() => {
    const out: Record<string, string | number> = {};
    params.forEach((v, k) => {
      out[k] = numericKeys.includes(k as keyof T) ? Number(v) : v;
    });
    return out as Partial<T>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);
  const update = useCallback(
    (patch: Partial<T>) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') next.delete(k);
        else next.set(k, String(v));
      });
      setParams(next, { replace: true });
    },
    [params, setParams],
  );
  return [state, update] as const;
};
