import { TrophyOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { QueryState } from '@/components/feedback/QueryState';
import { progressService } from '@/services/progress.service';

const MEDAL = ['#d4a017', '#a8a9ad', '#b07d4f'];

/** Guruh reytingi. Talabaga boshqalarning ismi qisqartirilgan holda keladi (server tomonida) */
export const LeaderboardCard = ({ groupId, staff = false }: { groupId: string; staff?: boolean }) => {
  const q = useQuery({ queryKey: ['leaderboard', groupId], queryFn: () => progressService.leaderboard(groupId) });
  return (
    <QueryState query={q}>
      {(lb) => (
        <Card title={<span><TrophyOutlined className="mr-2 text-accent" />Reyting: {lb.group.name}</span>}>
          <Table
            size="small"
            rowKey="studentId"
            pagination={false}
            dataSource={lb.rows}
            scroll={{ x: 420 }}
            rowClassName={(r) => (r.isMe ? 'bg-primary-soft' : '')}
            columns={[
              {
                title: '№', width: 56,
                render: (_, r) => <span className="font-semibold" style={{ color: MEDAL[r.rank - 1] }}>{r.rank}</span>,
              },
              {
                title: 'Talaba',
                render: (_, r) => (staff ? <Link to={`/app/progress/students/${r.studentId}`}>{r.name}</Link> : <span>{r.name}{r.isMe && <Tag className="ml-2">Siz</Tag>}</span>),
              },
              { title: 'Daraja', width: 120, dataIndex: 'level' },
              { title: 'Yutuqlar', width: 90, dataIndex: 'achievements' },
              { title: 'Ball', width: 70, render: (_, r) => <b>{r.points}</b> },
            ]}
          />
        </Card>
      )}
    </QueryState>
  );
};
