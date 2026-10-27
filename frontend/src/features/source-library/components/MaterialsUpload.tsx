import { ArrowDownOutlined, ArrowUpOutlined, CloudUploadOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import { Button, Spin, Upload } from 'antd';
import { useRef, useState } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { adminService } from '@/services/portfolio.service';
import { IMAGE_ACCEPT, MATERIAL_ACCEPT, mediaFileUrl } from '../files';
import type { UploadedFile } from '../sourceForm.schema';
import { FileBadge } from './MaterialViewer';

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
            <Button size="small" icon={<PictureOutlined />} loading={pending > 0}>Almashtirish</Button>
          </Upload>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onChange(null)} aria-label="Rasmni olib tashlash" />
        </div>
      </div>
    );
  }
  return (
    <Upload.Dragger accept={IMAGE_ACCEPT} showUploadList={false} customRequest={pick} className="[&_.ant-upload-drag]:!rounded-xl [&_.ant-upload-drag]:!bg-canvas">
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 px-4">
        {pending > 0 ? <Spin /> : <PictureOutlined className="text-3xl text-primary" />}
        <div className="text-sm font-medium">Rasm yuklash</div>
        <div className="text-xs text-muted">JPG, PNG yoki WEBP — bosing yoki shu yerga tashlang</div>
      </div>
    </Upload.Dragger>
  );
};

/** O'quv materiallari: PDF, Word, PowerPoint, rasm, audio, video — bir nechtasini birdaniga tashlash mumkin */
export const FilesUpload = ({ value, onChange }: { value: UploadedFile[]; onChange: (v: UploadedFile[]) => void }) => {
  const { upload, pending } = useUploader();
  // Bir nechta fayl parallel yuklanadi — har biri tayyor bo'lganda eng so'nggi ro'yxatga qo'shiladi
  const current = useRef(value);
  current.current = value;
  const set = (next: UploadedFile[]) => {
    current.current = next;
    onChange(next);
  };
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set(next);
  };

  return (
    <div className="space-y-3">
      <Upload.Dragger
        multiple
        accept={MATERIAL_ACCEPT}
        showUploadList={false}
        customRequest={({ file }) => void upload(file as File).then((f) => f && set([...current.current, f]))}
        className="[&_.ant-upload-drag]:!rounded-xl [&_.ant-upload-drag]:!border-primary/30 [&_.ant-upload-drag]:!bg-primary-soft/40"
      >
        <div className="flex flex-col items-center gap-2 px-4 py-6">
          {pending > 0 ? <Spin /> : <CloudUploadOutlined className="text-4xl text-primary" />}
          <div className="text-base font-semibold">{pending > 0 ? `Yuklanmoqda… (${pending})` : 'Fayllarni shu yerga tashlang'}</div>
          <div className="text-sm text-muted">yoki bosib tanlang · PDF, Word (.docx), PowerPoint (.pptx), rasm, audio, video</div>
        </div>
      </Upload.Dragger>

      {value.length > 0 && (
        <ul className="m-0 list-none space-y-2 p-0">
          {value.map((f, i) => (
            <li key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-solid border-line bg-white px-3 py-2">
              <a href={mediaFileUrl(f.id)} target="_blank" rel="noreferrer" className="min-w-0 no-underline"><FileBadge file={f} /></a>
              <span className="flex shrink-0 gap-1">
                <Button size="small" type="text" icon={<ArrowUpOutlined />} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Yuqoriga" />
                <Button size="small" type="text" icon={<ArrowDownOutlined />} disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Pastga" />
                <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => set(value.filter((x) => x.id !== f.id))} aria-label="Faylni olib tashlash" />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
