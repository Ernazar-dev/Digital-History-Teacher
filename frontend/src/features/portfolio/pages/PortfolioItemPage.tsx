import { ArrowRightOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Descriptions, List, Tag, Timeline } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { PORTFOLIO_TYPE, SOURCE_TYPE } from '@/lib/labels';
import { portfolioService } from '@/services/portfolio.service';
import { fmtDateTime } from '@/utils/format';
import { workLink } from '../itemLink';

type Rev = { version: number; content: string; createdAt: string };
type Fb = { comment: string; decision: string; version: number; totalScore: number | null; createdAt: string };

export default function PortfolioItemPage() {
  const { id = '' } = useParams();
  const q = useQuery({ queryKey: ['portfolio-item', id], queryFn: () => portfolioService.item(id) });
  return (
    <QueryState query={q}>
      {(item) => {
        const d = (item.detail ?? {}) as Record<string, unknown>;
        const link = workLink(item.refType, item.refId, d);
        const revisions = (d.revisions as Rev[] | undefined) ?? [];
        const feedbacks = (d.feedbacks as Fb[] | undefined) ?? [];
        return (
          <div className="space-y-6">
            <PageHeader
              title={item.title}
              tag={<Tag color="blue">{PORTFOLIO_TYPE[item.type]}</Tag>}
              description={item.description}
              extra={link && <Link to={link}><Button type="primary" icon={<ArrowRightOutlined />}>Asl ishni ochish</Button></Link>}
            />
            <Card>
              <Descriptions column={{ xs: 1, md: 3 }}>
                <Descriptions.Item label="Yaratilgan">{fmtDateTime(item.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="Yangilangan">{fmtDateTime(item.updatedAt)}</Descriptions.Item>
                <Descriptions.Item label="Versiya">{item.version}</Descriptions.Item>
                {d.status !== undefined && <Descriptions.Item label="Holat">{String(d.status)}</Descriptions.Item>}
                {d.score !== undefined && d.score !== null && <Descriptions.Item label="Ball">{String(d.score)}</Descriptions.Item>}
              </Descriptions>
              {typeof d.teacherComment === 'string' && d.teacherComment && (
                <div className="mt-3"><b>O‘qituvchi izohi:</b> <span className="prose-text">{d.teacherComment}</span></div>
              )}
              {typeof d.content === 'string' && <p className="prose-text mt-3">{d.content}</p>}
            </Card>
            <Card title="Ish asosidagi tarixiy manbalar">
              <List
                dataSource={item.sources}
                locale={{ emptyText: 'Bog‘langan manba yo‘q' }}
                renderItem={(s) => (
                  <List.Item>
                    <Link to={`/app/sources/${s.slug}`}>{s.title}</Link>
                    <Tag>{SOURCE_TYPE[s.type]}</Tag>
                  </List.Item>
                )}
              />
            </Card>
            {(revisions.length > 0 || feedbacks.length > 0) && (
              <Card title="Qayta ishlash tarixi">
                <Timeline
                  items={[
                    ...revisions.map((r) => ({ t: r.createdAt, el: <><b>{r.version}-versiya topshirildi</b><div className="prose-text text-sm">{r.content.slice(0, 400)}</div></> })),
                    ...feedbacks.map((f) => ({ t: f.createdAt, el: <><b>O‘qituvchi ({f.version}-versiyaga):</b> {f.comment}{f.totalScore !== null && ` — ${f.totalScore} ball`}</> })),
                  ]
                    .sort((a, b) => a.t.localeCompare(b.t))
                    .map((x) => ({ children: <div><div className="text-xs text-muted">{fmtDateTime(x.t)}</div>{x.el}</div> }))}
                />
              </Card>
            )}
          </div>
        );
      }}
    </QueryState>
  );
}
