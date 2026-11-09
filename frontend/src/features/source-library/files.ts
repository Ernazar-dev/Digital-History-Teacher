import i18n from '@/i18n';
import type { MediaFileRef } from '@/types/api';

export const mediaFileUrl = (id: string) => `/api/v1/media/${id}`;

/** Mavzu afishasi: yuklangan rasm ustun, bo'lmasa tashqi havola */
export const coverOf = (s: { mediaFile?: { id: string; mimeType: string } | null; mediaUrl?: string | null }) =>
  s.mediaFile?.mimeType.startsWith('image/') ? mediaFileUrl(s.mediaFile.id) : s.mediaUrl || null;

/** YouTube havolasidan (watch, youtu.be, shorts, embed) xavfsiz embed manzili — cookie'siz domen */
export const youtubeEmbedUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, '');
    let id: string | null = null;
    if (host === 'youtu.be') id = u.pathname.slice(1);
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id = u.searchParams.get('v') ?? /^\/(?:embed|shorts|live)\/([^/?#]+)/.exec(u.pathname)?.[1] ?? null;
    }
    return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
};

/** Mavzu fayllari uchun ruxsat etilgan turlar */
export const PRESENTATION_ACCEPT = '.pptx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation';
export const LECTURE_FILE_ACCEPT = '.docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export const VIDEO_ACCEPT = '.mp4,video/mp4';
export const TEST_FILE_ACCEPT = LECTURE_FILE_ACCEPT;

export type FileKind = 'pdf' | 'docx' | 'pptx' | 'image' | 'audio' | 'video' | 'other';

const MIME_KIND: Record<string, FileKind> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
};

export const fileKind = (f: Pick<MediaFileRef, 'mimeType'>): FileKind =>
  MIME_KIND[f.mimeType] ??
  (f.mimeType.startsWith('image/') ? 'image' : f.mimeType.startsWith('audio/') ? 'audio' : f.mimeType.startsWith('video/') ? 'video' : 'other');

/** Fayl turi nomi joriy tilda o'qiladi */
export const KIND_LABEL = (() => {
  const out = {} as Record<FileKind, string>;
  for (const k of ['pdf', 'docx', 'pptx', 'image', 'audio', 'video', 'other'] as FileKind[]) {
    Object.defineProperty(out, k, { enumerable: true, get: () => i18n.t(`kind.${k}`) });
  }
  return out;
})();

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
