import { Table, Tag } from 'antd';
import { EVIDENCE_KIND, STAGE } from '@/lib/labels';
import type { ComponentResult } from '@/types/api';
import { fmtDateTime, fmtPercent } from '@/utils/format';

const ASSESSOR = { AUTO: 'Avtomatik', SELF: 'O‘zini baholash', TEACHER: 'O‘qituvchi', EXPERT: 'Ekspert' };
const LEVEL = { LOW: 'Past', MEDIUM: 'O‘rta', HIGH: 'Yuqori' };

/** Natija qaysi dalillar va vaznlar asosida hisoblanganini ko'rsatadi */
export const EvidenceTable = ({ components }: { components: ComponentResult[] }) => (
  <Table
    rowKey="componentId"
    pagination={false}
    dataSource={components}
    scroll={{ x: 640 }}
    expandable={{
      rowExpandable: (c) => c.evidence.length > 0,
      expandedRowRender: (c) => (
        <Table
          size="small"
          pagination={false}
          rowKey="kind"
          dataSource={c.evidence}
          columns={[
            { title: 'Dalil turi', render: (_, e) => EVIDENCE_KIND[e.kind] },
            { title: 'O‘rtacha', render: (_, e) => fmtPercent(e.average) },
            { title: 'Vazn', render: (_, e) => <span>{e.weight}{!e.weightConfigured && <Tag className="ml-2">standart</Tag>}</span> },
            { title: 'Yozuvlar', dataIndex: 'count' },
            {
              title: 'Tafsilot',
              render: (_, e) => (
                <ul className="m-0 pl-4 text-xs">
                  {e.records.map((r) => (
                    <li key={r.id}>
                      {fmtPercent(r.score)} · {STAGE[r.stage]} · {ASSESSOR[r.assessorRole]}{r.assessor ? ` (${r.assessor.fullName})` : ''} · {r.note ?? ''} · {fmtDateTime(r.createdAt)}
                      {r.details && r.details.length > 0 && (
                        <ul className="m-0 mt-1 pl-4 text-muted">
                          {r.details.map((d) => <li key={d.indicatorId}>{d.title}: {LEVEL[d.level]} ({d.points} ball)</li>)}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ),
            },
          ]}
        />
      ),
    }}
    columns={[
      { title: 'Komponent', dataIndex: 'name' },
      { title: 'Natija', render: (_, c) => fmtPercent(c.score) },
      { title: 'Daraja', render: (_, c) => (c.level ? <Tag color="blue">{c.level.name}</Tag> : '—') },
      { title: 'Dalil turlari soni', dataIndex: 'evidenceKinds' },
      { title: 'Komponent vazni', dataIndex: 'weight' },
    ]}
  />
);
