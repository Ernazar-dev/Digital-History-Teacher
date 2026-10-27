import { useQuery } from '@tanstack/react-query';
import { Alert, Card, Descriptions, Empty, Table } from 'antd';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { tokens } from '@/app/tokens';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { GROUP_KIND } from '@/lib/labels';
import { assessmentsService } from '@/services/assessment.service';
import { fmtPercent } from '@/utils/format';

/** Tajriba va nazorat guruhlari — faqat tavsifiy o'rtachalar (statistik xulosa emas) */
export default function ExperimentPage() {
  const q = useQuery({ queryKey: ['experiment'], queryFn: assessmentsService.experiment });
  return (
    <>
      <PageHeader
        title="Pedagogik eksperiment: tavsifiy natijalar"
        description="Aniqlovchi (boshlang‘ich) va nazorat (yakuniy) bosqich natijalarining guruhlar bo‘yicha o‘rtacha qiymatlari. Guruh turini «Guruhlar» bo‘limida belgilang."
      />
      <QueryState query={q}>
        {(d) => {
          const has = d.groups.some((g) => g.n > 0);
          const chart = d.groups.map((g) => ({ name: GROUP_KIND[g.kind].label, initial: g.initialMean, final: g.finalMean }));
          return (
            <div className="space-y-6">
              <Alert type="warning" showIcon message="Muhim" description={d.disclaimer} />
              {!has ? (
                <Empty description="Tajriba yoki nazorat guruhlari hali tuzilmagan" />
              ) : (
                <>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {d.groups.map((g) => (
                      <Card key={g.kind} title={GROUP_KIND[g.kind].label}>
                        <Descriptions column={1} size="small">
                          <Descriptions.Item label="Guruhlar">{g.groups.map((x) => `${x.name} (${x.size})`).join(', ') || '—'}</Descriptions.Item>
                          <Descriptions.Item label="Talabalar (n)">{g.n}</Descriptions.Item>
                          <Descriptions.Item label="Boshlang‘ich natijasi bor">{g.nWithInitial}</Descriptions.Item>
                          <Descriptions.Item label="Yakuniy natijasi bor">{g.nWithFinal}</Descriptions.Item>
                          <Descriptions.Item label="O‘rtacha (boshlang‘ich → yakuniy)">{fmtPercent(g.initialMean)} → {fmtPercent(g.finalMean)}</Descriptions.Item>
                        </Descriptions>
                      </Card>
                    ))}
                  </div>
                  <Card title="Umumiy ko‘rsatkich o‘rtachalari">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={chart}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(v: number) => `${v}%`} />
                        <Legend />
                        <Bar dataKey="initial" name="Boshlang‘ich" fill="#9fb0cc" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="final" name="Yakuniy" fill={tokens.color.primary} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                  <Card title="Komponentlar bo‘yicha o‘rtachalar">
                    <Table
                      rowKey="code"
                      pagination={false}
                      scroll={{ x: 640 }}
                      dataSource={d.groups[0].components.map((c, i) => ({
                        code: c.code, name: c.name,
                        eI: c.initialMean, eF: c.finalMean, cI: d.groups[1]?.components[i]?.initialMean ?? null, cF: d.groups[1]?.components[i]?.finalMean ?? null,
                      }))}
                      columns={[
                        { title: 'Komponent', dataIndex: 'name' },
                        { title: 'Tajriba: boshl.', render: (_, r) => fmtPercent(r.eI) },
                        { title: 'Tajriba: yakuniy', render: (_, r) => fmtPercent(r.eF) },
                        { title: 'Nazorat: boshl.', render: (_, r) => fmtPercent(r.cI) },
                        { title: 'Nazorat: yakuniy', render: (_, r) => fmtPercent(r.cF) },
                      ]}
                    />
                  </Card>
                </>
              )}
            </div>
          );
        }}
      </QueryState>
    </>
  );
}
