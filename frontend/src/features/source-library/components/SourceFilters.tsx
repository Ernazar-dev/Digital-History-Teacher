import { useQuery } from '@tanstack/react-query';
import { Input, Select } from 'antd';
import { SOURCE_TYPE, toOptions } from '@/lib/labels';
import { catalogService, type SourceFilters as F } from '@/services/catalog.service';

export const SourceFilters = ({ value, onChange }: { value: F; onChange: (patch: Partial<F>) => void }) => {
  const periods = useQuery({ queryKey: ['periods'], queryFn: catalogService.periods });
  const topics = useQuery({ queryKey: ['topics', value.periodId], queryFn: () => catalogService.topics(value.periodId) });
  return (
    <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <Input.Search
        className="xl:col-span-2"
        placeholder="Nomi, muallifi yoki tavsifi bo‘yicha qidirish"
        allowClear
        defaultValue={value.q}
        onSearch={(q) => onChange({ q: q || undefined, page: 1 })}
      />
      <Select allowClear placeholder="Manba turi" value={value.type} options={toOptions(SOURCE_TYPE)} onChange={(type) => onChange({ type, page: 1 })} />
      <Select
        allowClear
        placeholder="Tarixiy davr"
        value={value.periodId}
        loading={periods.isLoading}
        options={periods.data?.map((p) => ({ value: p.id, label: p.name }))}
        onChange={(periodId) => onChange({ periodId, topicId: undefined, page: 1 })}
      />
      <Select
        allowClear
        placeholder="Mavzu"
        value={value.topicId}
        loading={topics.isLoading}
        options={topics.data?.map((t) => ({ value: t.id, label: t.name }))}
        onChange={(topicId) => onChange({ topicId, page: 1 })}
      />
    </div>
  );
};
