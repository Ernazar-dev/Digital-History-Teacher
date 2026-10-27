import { Typography } from 'antd';
import type { ReactNode } from 'react';

interface Props { title: ReactNode; description?: ReactNode; extra?: ReactNode; tag?: ReactNode }

export const PageHeader = ({ title, description, extra, tag }: Props) => (
  <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div className="min-w-0">
      <div className="gold-rule mb-4" aria-hidden />
      <div className="flex flex-wrap items-center gap-2">
        <Typography.Title level={2} className="font-serif-title !mb-0 !text-[28px] !font-bold !leading-tight md:!text-[34px]">
          {title}
        </Typography.Title>
        {tag}
      </div>
      {description && <Typography.Paragraph className="!mb-0 !mt-2.5 max-w-prose !text-[15px] !leading-relaxed text-muted">{description}</Typography.Paragraph>}
    </div>
    {extra && <div className="no-print flex flex-wrap gap-2">{extra}</div>}
  </div>
);
