import { FilePdfOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Image } from 'antd';
import { EmbedViewer } from '@/components/common/EmbedViewer';
import type { Source } from '@/types/api';

const isImage = (url: string) => /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url);
const isAudio = (url: string) => /\.(mp3|ogg|oga|wav)(\?.*)?$/i.test(url);
const isVideo = (url: string) => /\.(mp4|webm|ogv)(\?.*)?$/i.test(url);

/** Manbaning raqamli nusxasi: yuklangan fayl, tashqi rasm yoki ruxsat etilgan embed */
export const SourceMedia = ({ s }: { s: Source }) => {
  if (s.embedUrl) {
    return <EmbedViewer title={s.title} embedUrl={s.embedUrl} externalUrl={s.originalUrl} kind="media" height={460} />;
  }
  if (s.mediaFile) {
    const url = `/api/v1/media/${s.mediaFile.id}`;
    if (s.mediaFile.mimeType.startsWith('image/')) return <Image src={url} alt={s.title} className="rounded-lg" />;
    if (s.mediaFile.mimeType.startsWith('video/')) return <video src={url} controls className="w-full rounded-lg" />;
    if (s.mediaFile.mimeType.startsWith('audio/')) return <audio src={url} controls className="w-full" />;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Button icon={<FilePdfOutlined />}>{s.mediaFile.originalName}</Button>
      </a>
    );
  }
  if (s.mediaUrl && isImage(s.mediaUrl)) return <Image src={s.mediaUrl} alt={s.title} className="max-h-[560px] rounded-lg object-contain" />;
  if (s.mediaUrl && isAudio(s.mediaUrl)) return <audio src={s.mediaUrl} controls preload="none" className="w-full" />;
  if (s.mediaUrl && isVideo(s.mediaUrl)) return <video src={s.mediaUrl} controls preload="metadata" className="w-full rounded-lg bg-black" />;
  if (s.mediaUrl) {
    return (
      <a href={s.mediaUrl} target="_blank" rel="noopener noreferrer">
        <Button icon={<LinkOutlined />}>Raqamli nusxani ochish</Button>
      </a>
    );
  }
  return null;
};
