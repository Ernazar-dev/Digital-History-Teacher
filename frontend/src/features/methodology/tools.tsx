import { BankOutlined, BookOutlined, BuildOutlined, CheckSquareOutlined, FolderOpenOutlined, GlobalOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { MethodTool } from './methods';

/** Metodni qo'llashda ishlatiladigan platforma bo'limlari */
export const TOOLS: Record<MethodTool, { label: string; desc: string; icon: ReactNode; to: string }> = {
  sources: { label: 'Manbalar', desc: 'Ma’ruza, taqdimot va video', icon: <BookOutlined />, to: '/app/sources' },
  museum: { label: 'Virtual muzey', desc: '3D modellar va 360° panoramalar', icon: <BankOutlined />, to: '/app/museum' },
  explore: { label: 'Xarita va vaqt chizig‘i', desc: 'Tarixiy joylar va sanalar', icon: <GlobalOutlined />, to: '/app/explore' },
  lessons: { label: 'Dars konstruktori', desc: 'Metod asosida dars loyihasi', icon: <BuildOutlined />, to: '/app/lessons' },
  assignments: { label: 'Topshiriqlar', desc: 'Test va natijalar', icon: <CheckSquareOutlined />, to: '/app/assignments' },
  profile: { label: 'Portfolio', desc: 'Tayyor ishlarni yuklash', icon: <FolderOpenOutlined />, to: '/app/profile' },
};
