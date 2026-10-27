import { Alert, Button, Empty, Skeleton } from 'antd';
import type { ReactNode } from 'react';
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
  if (query.isLoading) return <Skeleton active paragraph={{ rows: skeletonRows }} />;
  if (query.isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Ma’lumotlarni yuklab bo‘lmadi"
        description={errorMessage(query.error)}
        action={<Button size="small" onClick={() => query.refetch()}>Qayta urinish</Button>}
      />
    );
  }
  if (query.data === undefined) return null;
  if (isEmpty?.(query.data)) {
    return (
      <Empty description={empty ?? 'Hozircha ma’lumot yo‘q'} className="py-10">
        {emptyAction}
      </Empty>
    );
  }
  return <>{children(query.data)}</>;
}
