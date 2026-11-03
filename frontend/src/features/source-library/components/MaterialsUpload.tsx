import { CloudUploadOutlined, DeleteOutlined, PictureOutlined, SwapOutlined } from '@ant-design/icons';
import { Button, Spin, Upload } from 'antd';
import { useState } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { adminService } from '@/services/portfolio.service';
import { IMAGE_ACCEPT, mediaFileUrl } from '../files';
import type { UploadedFile } from '../sourceForm.schema';
import { FileBadge, MaterialViewer } from './MaterialViewer';

/** Faylni serverga yuklaydi; turi va mazmuni (magic bytes) serverda tekshiriladi */
const useUploader = () => {
  const notify = useNotify();
  const [pending, setPending] = useState(0);
  const upload = async (file: File): Promise<UploadedFile | null> => {
    setPending((n) => n + 1);
    try {
      return await adminService.uploadMedia(file);
    } catch (e) {
      notify.error(e, `«${file.name}» yuklanmadi`);
      return null;
    } finally {
      setPending((n) => n - 1);
    }
  };
  return { upload, pending };
};

/** Muqova rasmi — kutubxona kartochkasi va manba sahifasi tepasida ko'rinadi */
export const CoverUpload = ({ value, onChange }: { value: UploadedFile | null; onChange: (v: UploadedFile | null) => void }) => {
  const { upload, pending } = useUploader();
  const pick = ({ file }: { file: unknown }) => void upload(file as File).then((f) => f && onChange(f));
  if (value) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-solid border-line bg-canvas">
        <img src={mediaFileUrl(value.id)} alt="Muqova rasmi" className="block aspect-[4/3] w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3">
          <Upload accept={IMAGE_ACCEPT} showUploadList={false} customRequest={pick}>
            <Button size="small" icon={<PictureOutlined />} loading={pending > 0}>
              Almashtirish
            </Button>
          </Upload>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onChange(null)} aria-label="Rasmni olib tashlash" />
        </div>
      </div>
    );
  }
  return (
    <Upload.Dragger
      accept={IMAGE_ACCEPT}
      showUploadList={false}
      customRequest={pick}
      className="[&_.ant-upload-drag]:!rounded-xl [&_.ant-upload-drag]:!bg-canvas"
    >
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 px-4">
        {pending > 0 ? <Spin /> : <PictureOutlined className="text-3xl text-primary" />}
        <div className="text-sm font-medium">Rasm yuklash</div>
        <div className="text-xs text-muted">JPG, PNG yoki WEBP — bosing yoki shu yerga tashlang</div>
      </div>
    </Upload.Dragger>
  );
};

/**
 * Bitta fayl (taqdimot, video, ma'ruza fayli, test fayli): tashlash yoki tanlash, almashtirish va olib tashlash.
 * `preview` — yuklangan fayl nomi ostida sahifaning o'zida ochiladi (nima yuklanganini ko'rish uchun).
 */
export const SingleFileUpload = ({
  value,
  onChange,
  accept,
  hint,
  preview = false,
}: {
  value: UploadedFile | null;
  onChange: (v: UploadedFile | null) => void;
  accept: string;
  hint: string;
  preview?: boolean;
}) => {
  const { upload, pending } = useUploader();
  const pick = ({ file }: { file: unknown }) => void upload(file as File).then((f) => f && onChange(f));
  if (value) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-solid border-line bg-white px-3 py-2">
          <a href={mediaFileUrl(value.id)} target="_blank" rel="noreferrer" className="min-w-0 no-underline">
            <FileBadge file={value} />
          </a>
          <span className="flex shrink-0 gap-1">
            <Upload accept={accept} showUploadList={false} customRequest={pick}>
              <Button size="small" icon={<SwapOutlined />} loading={pending > 0}>
                Almashtirish
              </Button>
            </Upload>
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onChange(null)}
              aria-label="Faylni olib tashlash"
            />
          </span>
        </div>
        {/* key — fayl almashtirilsa ko'rinish yangidan yuklanadi */}
        {preview && <MaterialViewer key={value.id} files={[value]} />}
      </div>
    );
  }
  return (
    <Upload.Dragger
      accept={accept}
      showUploadList={false}
      customRequest={pick}
      className="[&_.ant-upload-drag]:!rounded-xl [&_.ant-upload-drag]:!border-primary/30 [&_.ant-upload-drag]:!bg-primary-soft/40"
    >
      <div className="flex flex-col items-center gap-2 px-4 py-5">
        {pending > 0 ? <Spin /> : <CloudUploadOutlined className="text-3xl text-primary" />}
        <div className="font-semibold">{pending > 0 ? 'Yuklanmoqda…' : 'Faylni shu yerga tashlang yoki bosib tanlang'}</div>
        <div className="text-sm text-muted">{hint}</div>
      </div>
    </Upload.Dragger>
  );
};
