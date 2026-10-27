import { useQuery } from '@tanstack/react-query';
import { Select } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { SOURCE_TYPE } from '@/lib/labels';
import { sourcesService } from '@/services/catalog.service';

/** Nashr etilgan manbalarni qidirib tanlash (server tomonida qidiruv) */
export const SourcePicker = ({
  value, onChange, mode, placeholder = 'Manbani qidiring va tanlang',
}: { value?: string | string[]; onChange: (v: never) => void; mode?: 'multiple'; placeholder?: string }) => {
  const [q, setQ] = useState('');
  const list = useQuery({ queryKey: ['source-picker', q], queryFn: () => sourcesService.list({ q: q || undefined, pageSize: 30, status: 'PUBLISHED' }) });
  // Qidiruv o'zgarganda ham tanlangan manbalar nomi ko'rinib turishi uchun ko'rilgan nomlar eslab qolinadi
  const labels = useRef(new Map<string, string>());
  list.data?.data.forEach((s) => labels.current.set(s.id, `${s.title} — ${SOURCE_TYPE[s.type]}`));
  const options = useMemo(() => {
    const found = list.data?.data.map((s) => ({ value: s.id, label: labels.current.get(s.id)! })) ?? [];
    const selected = (Array.isArray(value) ? value : value ? [value] : [])
      .filter((id) => !found.some((o) => o.value === id) && labels.current.has(id))
      .map((id) => ({ value: id, label: labels.current.get(id)! }));
    return [...selected, ...found];
  }, [list.data, value]);
  return (
    <Select
      className="w-full"
      showSearch
      mode={mode}
      value={value as never}
      onChange={onChange}
      filterOption={false}
      onSearch={setQ}
      loading={list.isFetching}
      placeholder={placeholder}
      options={options}
      notFoundContent={list.isFetching ? 'Qidirilmoqda...' : 'Topilmadi'}
    />
  );
};
