import { BulbOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import i18n from '@/i18n';

/** Joriy tildagi yoʻnaltiruvchi savollar roʻyxati (lesson.hints.<key>) */
export const hints = (key: string): string[] => {
  const v = i18n.t(`lesson.hints.${key}`, { returnObjects: true }) as unknown;
  return Array.isArray(v) ? (v as string[]) : [];
};

/** Yoʻnaltiruvchi savollar: tayyor javob emas, metodik qarorga undovchi savollar */
export const Hint = ({ items }: { items: string[] }) => (
  <Alert
    className="mb-5"
    type="info"
    icon={<BulbOutlined />}
    showIcon
    message={i18n.t('lesson.hint')}
    description={<ul className="m-0 pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul>}
  />
);
