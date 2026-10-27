import { DiffOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Input, Modal, Select, Table, Tabs } from 'antd';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusTag } from '@/components/common/StatusTag';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { useNotify } from '@/hooks/useNotify';
import { SOURCE_TYPE, toOptions, WORK_STATUS } from '@/lib/labels';
import { analysisService, comparisonService } from '@/services/catalog.service';
import type { WorkStatus } from '@/types/api';
import { fmtDateTime } from '@/utils/format';
import { SourcePicker } from '../components/SourcePicker';

const MAX_COMPARE = 4;

export default function AnalysisHomePage() {
  const { isStudent, isStaff } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'c' ? 'c' : 'a';
  // O'qituvchi uchun standart ko'rinish — tekshirilishi kutilayotgan ishlar
  const [status, setStatus] = useState<WorkStatus | undefined>(isStaff ? 'SUBMITTED' : undefined);
  const [modal, setModal] = useState<'analysis' | 'comparison'>();
  const [sourceId, setSourceId] = useState<string>();
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const analyses = useQuery({ queryKey: ['analyses', status], queryFn: () => analysisService.list({ status, pageSize: 100 }) });
  const comparisons = useQuery({ queryKey: ['comparisons', status], queryFn: () => comparisonService.list({ status, pageSize: 100 }) });
  const createAnalysis = useMutation({
    mutationFn: () => analysisService.create(sourceId!),
    onSuccess: (a) => navigate(`/app/analysis/${a.id}`),
    onError: (e) => notify.error(e),
  });
  const createComparison = useMutation({
    mutationFn: () => comparisonService.create({ title: title.trim(), sourceIds: compareIds }),
    onSuccess: (c) => navigate(`/app/analysis/comparisons/${c.id}`),
    onError: (e) => notify.error(e),
  });
  const canCompare = title.trim().length >= 3 && compareIds.length >= 2 && compareIds.length <= MAX_COMPARE;
  const close = () => setModal(undefined);

  return (
    <>
      <PageHeader
        title="Raqamli tarixiy manbalarni tahlil qilish laboratoriyasi"
        description="Manbaning kelib chiqishi, muallif maqsadi, dalillar va ishonchlilikni aniqlang, turli manbalarni taqqoslang va ularni dars jarayoniga moslashtiring."
        extra={
          isStudent && (
            <>
              <Button icon={<DiffOutlined />} onClick={() => setModal('comparison')}>Manbalarni taqqoslash</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal('analysis')}>Yangi tahlil</Button>
            </>
          )
        }
      />
      <div className="mb-4 max-w-xs">
        <Select
          allowClear
          aria-label="Holat bo‘yicha filtr"
          placeholder="Holat bo‘yicha filtr"
          className="w-full"
          value={status}
          onChange={setStatus}
          options={toOptions(WORK_STATUS)}
        />
      </div>
      <Card>
        <Tabs
          activeKey={tab}
          onChange={(k) => setParams(k === 'c' ? { tab: 'c' } : {}, { replace: true })}
          items={[
            {
              key: 'a',
              label: 'Manba tahlillari',
              children: (
                <QueryState query={analyses} isEmpty={(d) => d.data.length === 0} empty={isStudent ? 'Hali tahlil yo‘q. «Yangi tahlil» orqali manbani tanlab boshlang.' : 'Bu holatdagi tahlillar yo‘q'}>
                  {(d) => (
                    <Table
                      rowKey="id"
                      dataSource={d.data}
                      scroll={{ x: 700 }}
                      columns={[
                        { title: 'Manba', render: (_, a) => <Link to={`/app/analysis/${a.id}`}>{a.source.title}</Link> },
                        { title: 'Turi', width: 150, render: (_, a) => SOURCE_TYPE[a.source.type] },
                        ...(!isStudent ? [{ title: 'Talaba', width: 180, render: (_: unknown, a: (typeof d.data)[number]) => a.student.fullName }] : []),
                        { title: 'Holat', width: 200, render: (_, a) => <StatusTag map={WORK_STATUS} value={a.status} /> },
                        { title: 'Ball', width: 80, render: (_, a) => a.score ?? '—' },
                        { title: 'Yangilangan', width: 150, render: (_, a) => fmtDateTime(a.updatedAt) },
                      ]}
                    />
                  )}
                </QueryState>
              ),
            },
            {
              key: 'c',
              label: 'Manbalarni taqqoslash',
              children: (
                <QueryState
                  query={comparisons}
                  isEmpty={(d) => d.data.length === 0}
                  empty={isStudent ? 'Taqqoslash ishlari yo‘q. «Manbalarni taqqoslash» orqali bir voqeaga oid 2–4 ta manbani tanlang.' : 'Bu holatdagi taqqoslash ishlari yo‘q'}
                >
                  {(d) => (
                    <Table
                      rowKey="id"
                      dataSource={d.data}
                      scroll={{ x: 800 }}
                      columns={[
                        { title: 'Sarlavha', render: (_, c) => <Link to={`/app/analysis/comparisons/${c.id}`}>{c.title}</Link> },
                        { title: 'Manbalar', render: (_, c) => c.items.map((i) => i.source.title).join('; ') },
                        ...(!isStudent ? [{ title: 'Talaba', width: 180, render: (_: unknown, c: (typeof d.data)[number]) => c.student.fullName }] : []),
                        { title: 'Holat', width: 200, render: (_, c) => <StatusTag map={WORK_STATUS} value={c.status} /> },
                        { title: 'Ball', width: 80, render: (_, c) => c.score ?? '—' },
                        { title: 'Yangilangan', width: 150, render: (_, c) => fmtDateTime(c.updatedAt) },
                      ]}
                    />
                  )}
                </QueryState>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        open={modal === 'analysis'}
        title="Tahlil uchun manba tanlang"
        okText="Tahlilni boshlash"
        cancelText="Bekor qilish"
        onCancel={close}
        okButtonProps={{ disabled: !sourceId, loading: createAnalysis.isPending }}
        onOk={() => createAnalysis.mutate()}
      >
        <p className="mb-3 text-sm text-muted">Shu manba bo‘yicha tugallanmagan tahlilingiz bo‘lsa, u davom ettiriladi.</p>
        <SourcePicker value={sourceId} onChange={(v) => setSourceId(v)} />
      </Modal>
      <Modal
        open={modal === 'comparison'}
        title="Manbalarni taqqoslash"
        okText="Taqqoslashni boshlash"
        cancelText="Bekor qilish"
        onCancel={close}
        okButtonProps={{ disabled: !canCompare, loading: createComparison.isPending }}
        onOk={() => createComparison.mutate()}
      >
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message="Bir tarixiy voqea yoki shaxsga oid 2–4 ta manbani tanlang"
          description="Masalan: Amir Temur davlatiga oid ikki xil muallif yozgan manba."
        />
        <label htmlFor="cmp-title" className="mb-1 block text-sm font-medium">Ish sarlavhasi</label>
        <Input
          id="cmp-title"
          className="mb-4"
          placeholder="Masalan: Amir Temur haqidagi ikki nuqtayi nazar"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="mb-1 text-sm font-medium">Manbalar ({compareIds.length}/{MAX_COMPARE})</div>
        <SourcePicker mode="multiple" value={compareIds} onChange={(v: string[]) => setCompareIds(v.slice(0, MAX_COMPARE))} placeholder="Manbalarni qidiring" />
      </Modal>
    </>
  );
}
