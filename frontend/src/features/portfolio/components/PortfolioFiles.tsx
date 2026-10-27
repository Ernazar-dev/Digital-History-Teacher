import { DeleteOutlined, DownloadOutlined, FileImageOutlined, FileOutlined, FilePdfOutlined, FilePptOutlined, FileWordOutlined, InboxOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Empty, Popconfirm, Skeleton, Upload } from 'antd';
import type { ReactNode } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { portfolioFilesService, type PortfolioFile } from '@/services/portfolio.service';
import { fmtBytes, fmtDate } from '@/utils/format';

const ACCEPT = '.pdf,.docx,.pptx,.jpg,.jpeg,.png';
const MAX_MB = 10;

const fileIcon = (mime?: string): ReactNode => {
  if (!mime) return <FileOutlined />;
  if (mime === 'application/pdf') return <FilePdfOutlined />;
  if (mime.includes('wordprocessingml')) return <FileWordOutlined />;
  if (mime.includes('presentationml')) return <FilePptOutlined />;
  if (mime.startsWith('image/')) return <FileImageOutlined />;
  return <FileOutlined />;
};

/** Faylni token bilan olib, brauzerda yuklab olish */
const saveFile = async (f: PortfolioFile) => {
  const blob = await portfolioFilesService.download(f.id);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = f.file?.originalName ?? f.title;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Elektron portfolio — talaba o'z ishlarini (PDF, Word, PowerPoint, rasm) yuklaydi.
 * studentId berilsa — o'qituvchi/administrator uchun faqat ko'rish rejimi.
 */
export const PortfolioFiles = ({ studentId }: { studentId?: string }) => {
  const editable = !studentId;
  const qc = useQueryClient();
  const notify = useNotify();
  const key = ['portfolio-files', studentId ?? 'me'];
  const q = useQuery({ queryKey: key, queryFn: () => (studentId ? portfolioFilesService.student(studentId) : portfolioFilesService.mine()) });

  const upload = useMutation({
    mutationFn: (file: File) => portfolioFilesService.upload(file),
    onSuccess: (f) => {
      qc.invalidateQueries({ queryKey: key });
      notify.success(`«${f.title}» portfolioga qo‘shildi`);
    },
    onError: (e) => notify.error(e, 'Fayl yuklanmadi'),
  });
  const remove = useMutation({
    mutationFn: (id: string) => portfolioFilesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: (e) => notify.error(e),
  });
  const download = useMutation({ mutationFn: saveFile, onError: (e) => notify.error(e, 'Fayl ochilmadi') });

  const files = q.data ?? [];

  return (
    <div className="space-y-4">
      {editable && (
        <Upload.Dragger
          accept={ACCEPT}
          multiple
          showUploadList={false}
          disabled={upload.isPending}
          beforeUpload={(file) => {
            if (file.size > MAX_MB * 1024 * 1024) {
              notify.info(`«${file.name}» ${MAX_MB} MB dan katta`);
              return Upload.LIST_IGNORE;
            }
            return true;
          }}
          customRequest={({ file, onSuccess, onError }) =>
            upload.mutateAsync(file as File).then(() => onSuccess?.(null), (e) => onError?.(e))
          }
        >
          <p className="ant-upload-drag-icon m-0"><InboxOutlined /></p>
          <p className="m-0 mt-2 font-medium">{upload.isPending ? 'Yuklanmoqda…' : 'Faylni shu yerga tashlang yoki tanlash uchun bosing'}</p>
          <p className="m-0 mt-1 text-sm text-muted">PDF, Word, PowerPoint yoki rasm (JPG, PNG) — har biri {MAX_MB} MB gacha</p>
        </Upload.Dragger>
      )}

      {q.isLoading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : files.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={editable ? 'Hali fayl yuklanmagan' : 'Talaba hali fayl yuklamagan'} />
      ) : (
        <ul className="m-0 list-none divide-y divide-line rounded-xl border border-line p-0">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-lg text-primary">{fileIcon(f.file?.mimeType)}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{f.title}</div>
                <div className="text-xs text-muted">{[f.file && fmtBytes(f.file.size), fmtDate(f.createdAt)].filter(Boolean).join(' · ')}</div>
              </div>
              <Button
                type="text"
                icon={<DownloadOutlined />}
                aria-label={`${f.title} — yuklab olish`}
                loading={download.isPending && download.variables?.id === f.id}
                onClick={() => download.mutate(f)}
              />
              {editable && (
                <Popconfirm title="Faylni portfoliodan o‘chirasizmi?" okText="O‘chirish" cancelText="Yo‘q" onConfirm={() => remove.mutate(f.id)}>
                  <Button type="text" danger icon={<DeleteOutlined />} aria-label={`${f.title} — o‘chirish`} loading={remove.isPending && remove.variables === f.id} />
                </Popconfirm>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
