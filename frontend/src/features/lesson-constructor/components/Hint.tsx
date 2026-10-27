import { BulbOutlined } from '@ant-design/icons';
import { Alert } from 'antd';

/** Yo'naltiruvchi savollar: tayyor javob emas, metodik qarorga undovchi savollar */
export const Hint = ({ items }: { items: string[] }) => (
  <Alert
    className="mb-5"
    type="info"
    icon={<BulbOutlined />}
    showIcon
    message="O‘zingizga savol bering"
    description={<ul className="m-0 pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul>}
  />
);
