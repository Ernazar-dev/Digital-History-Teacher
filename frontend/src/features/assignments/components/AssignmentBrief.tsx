import { Card, List, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { Field } from '@/components/common/Section';
import { ASSIGNMENT_TYPE, EVIDENCE_KIND, GROUP_KIND, OBJECT_TYPE, SOURCE_TYPE } from '@/lib/labels';
import { useAuth } from '@/features/auth/useAuth';
import type { Assignment, ObjectType, RubricCriterion, SourceType } from '@/types/api';
import { fmtDateTime } from '@/utils/format';

/** Topshiriq sharti, resurslari va baholash rubrikasi */
export const AssignmentBrief = ({ a }: { a: Assignment }) => {
  const { isStaff } = useAuth();
  return (
  <div className="space-y-6">
    <Card title="Topshiriq sharti">
      <p className="prose-text mt-0 text-[15px]">{a.scenario}</p>
      {a.instructions && <Field label="Nima qilish kerak">{a.instructions}</Field>}
      <div className="flex flex-wrap gap-2">
        <Tag color="blue">{ASSIGNMENT_TYPE[a.type]}</Tag>
        {a.dueDate && <Tag>Muddat: {fmtDateTime(a.dueDate)}</Tag>}
        <Tag>Maks. ball: {a.maxScore}</Tag>
        {isStaff && <Tag color="gold">Dalil turi: {EVIDENCE_KIND[a.evidenceKind]}</Tag>}
        {isStaff && a.groups.map((g) => <Tag key={g.id} color={GROUP_KIND[g.kind].color}>{g.name}</Tag>)}
      </div>
    </Card>
    {(a.sources.length > 0 || a.virtualObjects.length > 0) && (
      <Card title="Foydalanish uchun materiallar">
        <List
          dataSource={[
            ...a.sources.map((s) => ({ key: s.id, to: `/app/sources/${s.slug}`, title: s.title, tag: SOURCE_TYPE[s.type as SourceType] })),
            ...a.virtualObjects.map((o) => ({ key: o.id, to: `/app/museum/${o.slug}`, title: o.title, tag: OBJECT_TYPE[o.type as ObjectType] })),
          ]}
          renderItem={(r) => (
            <List.Item>
              <Link to={r.to} target="_blank">{r.title}</Link>
              <Tag>{r.tag}</Tag>
            </List.Item>
          )}
        />
      </Card>
    )}
    {a.rubric && (
      <Card title={`Baholash rubrikasi: ${a.rubric.title}`}>
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={a.rubric.criteria}
          columns={[
            { title: 'Mezon', dataIndex: 'title' },
            ...(isStaff ? [{ title: 'Kompetensiya komponenti', render: (_: unknown, c: RubricCriterion) => c.component?.name ?? '—' }] : []),
            { title: 'Maks. ball', dataIndex: 'maxScore', width: 100 },
          ]}
        />
      </Card>
    )}
  </div>
  );
};
