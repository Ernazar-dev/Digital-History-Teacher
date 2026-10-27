import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Popconfirm, Select, Space, Table } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusTag } from '@/components/common/StatusTag';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { useNotify } from '@/hooks/useNotify';
import { ASSIGNMENT_STATUS, ASSIGNMENT_TYPE, SUBMISSION_STATUS, toOptions } from '@/lib/labels';
import { assignmentsService } from '@/services/learning.service';
import { groupsService } from '@/services/people.service';
import type { Assignment, AssignmentType, SubmissionStatus } from '@/types/api';
import { fmtDate, isOverdue } from '@/utils/format';

/** Talaba uchun keyingi qadam — holatga qarab bitta aniq tugma */
const NEXT_STEP: Record<SubmissionStatus, { label: string; primary?: boolean }> = {
  NOT_STARTED: { label: 'Boshlash', primary: true },
  IN_PROGRESS: { label: 'Davom ettirish', primary: true },
  RETURNED: { label: 'Qayta ishlash', primary: true },
  SUBMITTED: { label: 'Ko‘rish' },
  UNDER_REVIEW: { label: 'Ko‘rish' },
  GRADED: { label: 'Natijani ko‘rish' },
};

/** Guruhsiz talaba: guruhini o'zi tanlaydi (bir marta; almashtirish — admin orqali) */
const JoinGroup = () => {
  const qc = useQueryClient();
  const notify = useNotify();
  const [groupId, setGroupId] = useState<string>();
  const groups = useQuery({ queryKey: ['groups', 'public'], queryFn: groupsService.publicList });
  const join = useMutation({
    mutationFn: () => groupsService.join(groupId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['assignments'] });
      notify.success('Guruhga qo‘shildingiz');
    },
    onError: (e) => notify.error(e),
  });
  return (
    <Alert
      className="mb-4"
      type="warning"
      showIcon
      message="Guruhingizni tanlang"
      description={
        <div className="space-y-3">
          <div>Topshiriqlar guruh orqali beriladi. Guruhingizni tanlang — topshiriqlar shu zahoti paydo bo‘ladi.</div>
          {groups.data?.length === 0 ? (
            <div className="text-muted">Hozircha guruh yaratilmagan — administratorga murojaat qiling.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Select
                className="min-w-[240px]"
                placeholder="Guruhni tanlang"
                aria-label="Guruh"
                loading={groups.isLoading}
                value={groupId}
                onChange={setGroupId}
                options={groups.data?.map((g) => ({ value: g.id, label: g.name }))}
              />
              <Button type="primary" disabled={!groupId} loading={join.isPending} onClick={() => join.mutate()}>Qo‘shilish</Button>
            </div>
          )}
        </div>
      }
    />
  );
};

export default function AssignmentsPage() {
  const { isStudent, isStaff, isAdmin, user } = useAuth();
  const [type, setType] = useState<AssignmentType>();
  const qc = useQueryClient();
  const notify = useNotify();
  const q = useQuery({ queryKey: ['assignments', type], queryFn: () => assignmentsService.list({ type }) });
  const myGroups = useQuery({ queryKey: ['groups'], queryFn: groupsService.list, enabled: isStudent });
  const remove = useMutation({
    mutationFn: assignmentsService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments'] }); notify.success('Topshiriq arxivlandi'); },
    onError: (e) => notify.error(e),
  });

  const titleCol = {
    title: 'Topshiriq',
    render: (_: unknown, a: Assignment) => (
      <div>
        <Link to={`/app/assignments/${a.id}`} className="font-medium">{a.title}</Link>
        <div className="text-xs text-muted">{ASSIGNMENT_TYPE[a.type]}</div>
      </div>
    ),
  };
  const dueCol = {
    title: 'Muddat',
    width: 120,
    render: (_: unknown, a: Assignment) => <span className={isOverdue(a.dueDate) && a.myStatus !== 'GRADED' ? 'text-red-700' : ''}>{fmtDate(a.dueDate)}</span>,
  };

  const studentColumns = [
    titleCol,
    dueCol,
    {
      title: 'Holat',
      width: 200,
      render: (_: unknown, a: Assignment) => (
        <div>
          <StatusTag map={SUBMISSION_STATUS} value={a.myStatus ?? 'NOT_STARTED'} />
          {a.myStatus === 'GRADED' && a.mySubmission?.score != null && <div className="mt-1 text-sm font-medium">{a.mySubmission.score} / {a.maxScore} ball</div>}
        </div>
      ),
    },
    {
      title: '',
      width: 160,
      render: (_: unknown, a: Assignment) => {
        const step = NEXT_STEP[a.myStatus ?? 'NOT_STARTED'];
        return <Link to={`/app/assignments/${a.id}`}><Button size="small" type={step.primary ? 'primary' : 'default'}>{step.label}</Button></Link>;
      },
    },
  ];

  const staffColumns = [
    titleCol,
    dueCol,
    { title: 'Holati', width: 130, render: (_: unknown, a: Assignment) => <StatusTag map={ASSIGNMENT_STATUS} value={a.status} /> },
    {
      title: 'Javoblar',
      width: 200,
      render: (_: unknown, a: Assignment) => {
        const waiting = (a.submissionCounts?.SUBMITTED ?? 0) + (a.submissionCounts?.UNDER_REVIEW ?? 0);
        return (
          <span className="text-sm">
            <span className={waiting ? 'font-semibold text-primary' : ''}>Tekshirish kerak: {waiting}</span> · Baholangan: {a.submissionCounts?.GRADED ?? 0}
          </span>
        );
      },
    },
    {
      title: '',
      width: 100,
      render: (_: unknown, a: Assignment) =>
        (isAdmin || a.createdBy?.id === user?.id) && (
          <Space>
            <Link to={`/app/assignments/${a.id}/edit`}><Button size="small" icon={<EditOutlined />} aria-label="Tahrirlash" /></Link>
            <Popconfirm title="Topshiriqni arxivlaysizmi?" okText="Ha" cancelText="Yo‘q" onConfirm={() => remove.mutate(a.id)}>
              <Button size="small" danger icon={<DeleteOutlined />} aria-label="Arxivlash" />
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Topshiriqlar"
        description={
          isStudent
            ? 'Topshiriqni oching, javobingizni yozing va «Topshirish»ni bosing. O‘qituvchi tekshirib baho qo‘yadi yoki qayta ishlashga qaytaradi.'
            : 'Guruhlarga berilgan metodik topshiriqlar va raqamli simulyatorlar. Topshirilgan javoblar «Tekshiruv navbati»ga tushadi.'
        }
        extra={isStaff && <Link to="/app/assignments/new"><Button type="primary" icon={<PlusOutlined />}>Yangi topshiriq</Button></Link>}
      />
      {isStudent && myGroups.data && (
        myGroups.data.length === 0
          ? <JoinGroup />
          : <p className="mb-4 text-sm text-muted">Guruhingiz: <b className="text-ink">{myGroups.data.map((g) => g.name).join(', ')}</b></p>
      )}
      <Card>
        {isStaff && (
          <div className="mb-4 max-w-sm">
            <Select allowClear className="w-full" placeholder="Topshiriq turi" value={type} onChange={setType} options={toOptions(ASSIGNMENT_TYPE)} />
          </div>
        )}
        <QueryState query={q} isEmpty={(d) => d.data.length === 0} empty={isStudent ? 'Sizga hali topshiriq berilmagan' : 'Topshiriqlar yo‘q'}>
          {(d) => <Table rowKey="id" dataSource={d.data} columns={isStudent ? studentColumns : staffColumns} scroll={{ x: 760 }} pagination={d.data.length > 20 ? { pageSize: 20 } : false} />}
        </QueryState>
      </Card>
    </>
  );
}
