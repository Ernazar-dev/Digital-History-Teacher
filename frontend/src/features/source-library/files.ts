import type { MediaFileRef } from '@/types/api';

export const mediaFileUrl = (id: string) => `/api/v1/media/${id}`;

export type FileKind = 'pdf' | 'docx' | 'pptx' | 'image' | 'audio' | 'video' | 'other';

const MIME_KIND: Record<string, FileKind> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
};

export const fileKind = (f: Pick<MediaFileRef, 'mimeType'>): FileKind =>
  MIME_KIND[f.mimeType] ??
  (f.mimeType.startsWith('image/') ? 'image' : f.mimeType.startsWith('audio/') ? 'audio' : f.mimeType.startsWith('video/') ? 'video' : 'other');

export const KIND_LABEL: Record<FileKind, string> = {
  pdf: 'PDF', docx: 'Word', pptx: 'Taqdimot', image: 'Rasm', audio: 'Audio', video: 'Video', other: 'Fayl',
};

export const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** O'quv materiali sifatida yuklash mumkin bo'lgan turlar (serverda mazmuni ham tekshiriladi) */
export const MATERIAL_ACCEPT = [
  '.pdf', '.docx', '.pptx', 'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'audio/mpeg', 'video/mp4',
].join(',');

export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';
