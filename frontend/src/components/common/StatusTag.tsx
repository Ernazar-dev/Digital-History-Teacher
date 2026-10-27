import { Tag } from 'antd';

export const StatusTag = ({ map, value }: { map: Record<string, { label: string; color: string }>; value: string }) => {
  const item = map[value] ?? { label: value, color: 'default' };
  return <Tag color={item.color}>{item.label}</Tag>;
};

