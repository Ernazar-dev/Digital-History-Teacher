import { EyeOutlined, FileSearchOutlined, FormOutlined, ReadOutlined, SwapOutlined, TeamOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { TASK_KIND } from '@/lib/labels';
import type { TaskKind, VirtualTask } from '@/types/api';

const KIND_STYLE: Record<TaskKind, { icon: ReactNode; className: string }> = {
  OBSERVATION: { icon: <EyeOutlined />, className: 'bg-sky-50 text-sky-700 ring-sky-200' },
  EVIDENCE: { icon: <FileSearchOutlined />, className: 'bg-amber-50 text-amber-800 ring-amber-200' },
  COMPARISON: { icon: <SwapOutlined />, className: 'bg-violet-50 text-violet-700 ring-violet-200' },
  DISCUSSION: { icon: <TeamOutlined />, className: 'bg-rose-50 text-rose-700 ring-rose-200' },
  LESSON_APPLICATION: { icon: <ReadOutlined />, className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  MATERIAL_CREATION: { icon: <FormOutlined />, className: 'bg-slate-100 text-slate-700 ring-slate-200' },
};

/** Pedagogik topshiriq: raqam + tur belgisi alohida qatorda, savol matni — undan keyin yangi qatordan */
export const TaskCard = ({ task, index, children }: { task: VirtualTask; index: number; children?: ReactNode }) => {
  const s = KIND_STYLE[task.kind];
  return (
    <div className="rounded-lg border border-solid border-line bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-white">{index + 1}</span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${s.className}`}>
          {s.icon}
          {TASK_KIND[task.kind]}
        </span>
      </div>
      <p className="prose-text mb-0 mt-3 text-[15px] text-ink">{task.prompt}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
};
