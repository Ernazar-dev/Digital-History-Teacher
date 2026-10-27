import { DatePicker, Form, Input, InputNumber, Select, Switch } from 'antd';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

/**
 * React Hook Form + Zod validatsiyasini Ant Design Form.Item ko'rinishi bilan birlashtiruvchi maydonlar.
 * Xato matni Zod sxemasidan keladi va maydon ostida ko'rsatiladi.
 */
interface Base<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: ReactNode;
  required?: boolean;
  help?: ReactNode;
  className?: string;
}

const Item = ({ id, label, required, error, help, className, children }: { id?: string; label?: ReactNode; required?: boolean; error?: string; help?: ReactNode; className?: string; children: ReactNode }) => (
  <Form.Item htmlFor={id} label={label} required={required} validateStatus={error ? 'error' : undefined} help={error ?? help} className={className} layout="vertical">
    {children}
  </Form.Item>
);

export function TextField<T extends FieldValues>(p: Base<T> & { placeholder?: string; type?: string; autoComplete?: string }) {
  return (
    <Controller control={p.control} name={p.name} render={({ field, fieldState }) => (
      <Item id={String(p.name)} label={p.label} required={p.required} error={fieldState.error?.message} help={p.help} className={p.className}>
        {p.type === 'password' ? (
          <Input.Password {...field} id={field.name} value={field.value ?? ''} placeholder={p.placeholder} autoComplete={p.autoComplete} />
        ) : (
          <Input {...field} id={field.name} value={field.value ?? ''} type={p.type} placeholder={p.placeholder} autoComplete={p.autoComplete} />
        )}
      </Item>
    )} />
  );
}

export function TextAreaField<T extends FieldValues>(p: Base<T> & { rows?: number; placeholder?: string; maxLength?: number }) {
  return (
    <Controller control={p.control} name={p.name} render={({ field, fieldState }) => (
      <Item id={String(p.name)} label={p.label} required={p.required} error={fieldState.error?.message} help={p.help} className={p.className}>
        <Input.TextArea {...field} id={field.name} value={field.value ?? ''} rows={p.rows ?? 4} placeholder={p.placeholder} maxLength={p.maxLength} showCount={Boolean(p.maxLength)} />
      </Item>
    )} />
  );
}

export function NumberField<T extends FieldValues>(p: Base<T> & { min?: number; max?: number; step?: number }) {
  return (
    <Controller control={p.control} name={p.name} render={({ field, fieldState }) => (
      <Item id={String(p.name)} label={p.label} required={p.required} error={fieldState.error?.message} help={p.help} className={p.className}>
        <InputNumber id={field.name} className="w-full" min={p.min} max={p.max} step={p.step} value={field.value ?? null} onChange={(v) => field.onChange(v ?? null)} />
      </Item>
    )} />
  );
}

export function SelectField<T extends FieldValues>(
  p: Base<T> & { options: { value: string; label: ReactNode }[]; mode?: 'multiple'; placeholder?: string; allowClear?: boolean; loading?: boolean },
) {
  return (
    <Controller control={p.control} name={p.name} render={({ field, fieldState }) => (
      <Item id={String(p.name)} label={p.label} required={p.required} error={fieldState.error?.message} help={p.help} className={p.className}>
        <Select
          id={field.name}
          value={field.value ?? undefined}
          onChange={(v) => field.onChange(v ?? null)}
          options={p.options}
          mode={p.mode}
          placeholder={p.placeholder}
          allowClear={p.allowClear}
          loading={p.loading}
          showSearch
          optionFilterProp="label"
        />
      </Item>
    )} />
  );
}

export function SwitchField<T extends FieldValues>(p: Base<T>) {
  return (
    <Controller control={p.control} name={p.name} render={({ field }) => (
      <Item id={String(p.name)} label={p.label} help={p.help} className={p.className}>
        <Switch id={field.name} checked={Boolean(field.value)} onChange={field.onChange} />
      </Item>
    )} />
  );
}

export function DateField<T extends FieldValues>(p: Base<T>) {
  return (
    <Controller control={p.control} name={p.name} render={({ field, fieldState }) => (
      <Item id={String(p.name)} label={p.label} required={p.required} error={fieldState.error?.message} help={p.help} className={p.className}>
        <DatePicker
          id={field.name}
          className="w-full"
          showTime={{ format: 'HH:mm' }}
          format="DD.MM.YYYY HH:mm"
          value={field.value ? dayjs(field.value) : null}
          onChange={(d) => field.onChange(d ? d.toISOString() : null)}
        />
      </Item>
    )} />
  );
}
