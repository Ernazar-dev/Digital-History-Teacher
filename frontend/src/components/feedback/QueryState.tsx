import { Alert, Button, Empty, Skeleton } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '@/lib/http';

interface Props<T> {
  query: { isLoading: boolean; isError: boolean; error: unknown; data: T | undefined; refetch: () => unknown };
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  emptyAction?: ReactNode;
  skeletonRows?: number;
  children: (data: T) => ReactNode;
}

/** Har bir so'rov uchun izchil loading / error / empty / success holatlari */
export function QueryState<T>({ query, isEmpty, empty, emptyAction, skeletonRows = 6, children }: Props<T>) {
  const { t } = useTranslation();
  if (query.isLoading) return <Skeleton active paragraph={{ rows: skeletonRows }} />;
  if (query.isError) {
    return (
      <Alert
        type="error"
        showIcon
        message={t('common.loadFailed')}
        description={errorMessage(query.error)}
        action={<Button size="small" onClick={() => query.refetch()}>{t('common.retry')}</Button>}
      />
    );
  }
  if (query.data === undefined) return null;
  if (isEmpty?.(query.data)) {
    return (
      <Empty description={empty ?? t('common.noData')} className="py-10">
        {emptyAction}
      </Empty>
    );
  }
  return <>{children(query.data)}</>;
}
