import dayjs from 'dayjs';

export const fmtDate = (d?: string | null) => (d ? dayjs(d).format('DD.MM.YYYY') : '—');
export const fmtDateTime = (d?: string | null) => (d ? dayjs(d).format('DD.MM.YYYY HH:mm') : '—');
export const fmtPercent = (n?: number | null) => (n === null || n === undefined ? '—' : `${Math.round(n * 10) / 10}%`);
export const isOverdue = (d?: string | null) => Boolean(d && dayjs(d).isBefore(dayjs()));
export const yearLabel = (y: number | null | undefined) => (y === null || y === undefined ? '' : y < 0 ? `mil. avv. ${-y}` : String(y));
export const fmtBytes = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
