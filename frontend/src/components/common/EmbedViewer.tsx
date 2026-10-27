import { ExportOutlined, PlayCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Alert, Button, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';

/** Frontendda ham tekshiriladigan ruxsat etilgan hostlar (asosiy tekshiruv — backendda) */
const ALLOWED_HOSTS = ['sketchfab.com', 'uzbekistan360.uz'];

export const isAllowedEmbed = (url: string | null | undefined): url is string => {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && ALLOWED_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
};

interface Props {
  title: string;
  embedUrl: string | null;
  externalUrl?: string | null;
  thumbnailUrl?: string | null;
  kind?: '3d' | '360' | 'media';
  /** Sahifa ochilishi bilan yuklanmaydi — foydalanuvchi bosganda yuklanadi */
  autoLoad?: boolean;
  height?: number;
}

/**
 * Tashqi 3D/360° kontent ko'ruvchisi. Kontent yuklanmasa yoki ruxsat etilmagan bo'lsa,
 * sahifa buzilmaydi: tavsif saqlanadi, preview rasm va tashqi havola taklif qilinadi.
 */
export const EmbedViewer = ({ title, embedUrl, externalUrl, thumbnailUrl, kind = '3d', autoLoad = false, height = 520 }: Props) => {
  const [active, setActive] = useState(autoLoad);
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timer = useRef<number>();
  const allowed = isAllowedEmbed(embedUrl);

  useEffect(() => {
    if (!active || loaded) return;
    timer.current = window.setTimeout(() => setTimedOut(true), 20000);
    return () => window.clearTimeout(timer.current);
  }, [active, loaded]);

  const external = externalUrl && (
    <a href={externalUrl} target="_blank" rel="noopener noreferrer">
      <Button icon={<ExportOutlined />}>Yangi oynada ochish</Button>
    </a>
  );

  if (!allowed) {
    return (
      <div className="overflow-hidden rounded-lg border border-line bg-canvas">
        {thumbnailUrl && <img src={thumbnailUrl} alt={title} className="max-h-[420px] w-full object-cover" loading="lazy" />}
        <div className="p-4">
          <Alert
            type="info"
            showIcon
            icon={<WarningOutlined />}
            message="Ichki ko‘rish mavjud emas"
            description="Bu obyekt uchun ruxsat etilgan embed manzili kiritilmagan. Obyekt tavsifi pastda saqlangan; tashqi sahifani alohida oynada ochishingiz mumkin."
            action={external}
          />
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-primary" style={{ height }}>
        {thumbnailUrl && <img src={thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" loading="lazy" />}
        <div className="relative z-10 flex flex-col items-center gap-3 p-4 text-center">
          <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={() => setActive(true)} className="!bg-accent !border-accent">
            {kind === '360' ? '360° panoramani yuklash' : kind === '3d' ? '3D modelni yuklash' : 'Kontentni yuklash'}
          </Button>
          <span className="text-sm text-white/90">Tashqi kontent faqat siz bosganingizda yuklanadi</span>
          {external}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border border-line bg-black" style={{ height }}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spin size="large" />
          </div>
        )}
        <iframe
          title={title}
          src={embedUrl}
          className="h-full w-full border-0"
          loading="lazy"
          allow="autoplay; fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
          onLoad={() => {
            setLoaded(true);
            window.clearTimeout(timer.current);
          }}
        />
      </div>
      {timedOut && !loaded && (
        <Alert
          type="warning"
          showIcon
          message="Tashqi kontent uzoq vaqt yuklanmayapti"
          description="Internet aloqasi sekin yoki tashqi sayt vaqtincha mavjud emas bo‘lishi mumkin. Obyektni yangi oynada ochib ko‘ring."
          action={external}
        />
      )}
      {loaded && <div className="flex justify-end">{external}</div>}
    </div>
  );
};
