import { Card } from 'antd';
import type { ReactNode } from 'react';
import i18n from '@/i18n';

/** Bir xil körinişdagi kontent bölimi */
export const Section = ({ title, extra, children, className = '' }: { title?: ReactNode; extra?: ReactNode; children: ReactNode; className?: string }) => (
  <Card title={title} extra={extra} className={`shadow-sm ${className}`} styles={{ body: { padding: 20 } }}>
    {children}
  </Card>
);

/** Kalit-qiymat juftligi; qiymat bölmasa — "Körsatilmagan" */
export const Field = ({ label, children }: { label: string; children?: ReactNode }) => (
  <div className="mb-4">
    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
    <div className="prose-text text-[15px]">{children || <span className="text-muted">{i18n.t('field.notSpecified')}</span>}</div>
  </div>
);
