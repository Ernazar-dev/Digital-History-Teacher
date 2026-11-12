import { BankOutlined, BookOutlined, BuildOutlined, CheckSquareOutlined, FolderOpenOutlined, GlobalOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import i18n from '@/i18n';
import type { MethodTool } from './methods';

const DEFS: Record<MethodTool, { icon: ReactNode; to: string }> = {
  sources: { icon: <BookOutlined />, to: '/app/sources' },
  museum: { icon: <BankOutlined />, to: '/app/museum' },
  explore: { icon: <GlobalOutlined />, to: '/app/explore' },
  lessons: { icon: <BuildOutlined />, to: '/app/lessons' },
  assignments: { icon: <CheckSquareOutlined />, to: '/app/assignments' },
  profile: { icon: <FolderOpenOutlined />, to: '/app/profile' },
};

/** Metodni qöllaşda işlatiladigan platforma bölimlari; nom va izoh joriy tilda öqiladi */
export const TOOLS = Object.fromEntries(
  (Object.keys(DEFS) as MethodTool[]).map((k) => [
    k,
    {
      ...DEFS[k],
      get label() { return i18n.t(`methodology.tool.${k}`); },
      get desc() { return i18n.t(`methodology.tool.${k}Desc`); },
    },
  ]),
) as Record<MethodTool, { label: string; desc: string; icon: ReactNode; to: string }>;
