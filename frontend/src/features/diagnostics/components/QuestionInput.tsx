import { Checkbox, Input, Radio } from 'antd';
import type { DiagnosticQuestion } from '@/types/api';

export type AnswerValue = string | string[] | undefined;

/** Variant — butun qator bosiladigan blok; tanlangani ajralib turadi */
const box = (selected: boolean, disabled?: boolean) =>
  `m-0 flex w-full items-start rounded-lg border border-solid px-4 py-3 text-[15px] leading-relaxed transition-colors ${
    selected ? 'border-primary bg-primary-soft' : `border-line bg-white ${disabled ? '' : 'hover:border-primary'}`
  }`;

/** Savol turiga mos javob maydoni */
export const QuestionInput = ({ q, value, onChange, disabled }: { q: DiagnosticQuestion; value: AnswerValue; onChange: (v: AnswerValue) => void; disabled?: boolean }) => {
  const options = q.options ?? [];
  switch (q.type) {
    case 'SINGLE_CHOICE':
      return (
        <Radio.Group value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="flex w-full flex-col gap-2">
          {options.map((o) => <Radio key={o.id} value={o.id} className={box(value === o.id, disabled)}>{o.text}</Radio>)}
        </Radio.Group>
      );
    case 'MULTIPLE_CHOICE': {
      const selected = (value as string[]) ?? [];
      return (
        <Checkbox.Group value={selected} onChange={(v) => onChange(v as string[])} disabled={disabled} className="flex w-full flex-col gap-2">
          {options.map((o) => <Checkbox key={o.id} value={o.id} className={box(selected.includes(o.id), disabled)}>{o.text}</Checkbox>)}
        </Checkbox.Group>
      );
    }
    case 'LIKERT':
      return (
        <Radio.Group value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(130px,1fr))]">
          {options.map((o) => <Radio key={o.id} value={o.id} className={box(value === o.id, disabled)}>{o.text}</Radio>)}
        </Radio.Group>
      );
    default:
      return (
        <Input.TextArea
          autoSize={{ minRows: 4, maxRows: 16 }}
          placeholder="Javobingizni shu yerga yozing…"
          className="text-[15px]"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );
  }
};
