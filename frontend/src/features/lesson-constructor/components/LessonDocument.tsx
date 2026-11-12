import { Descriptions, Table, Tag } from 'antd';
import i18n from '@/i18n';
import type { LessonPlan } from '@/types/api';
import { courseLabel } from '../lessonForm';

const Block = ({ title, text }: { title: string; text?: string | null }) =>
  text ? (
    <div className="mb-5">
      <h3 className="mb-1 text-base font-semibold text-primary">{title}</h3>
      <p className="prose-text m-0">{text}</p>
    </div>
  ) : null;

/** Dars işlanmasining hujjat körinişi */
export const LessonDocument = ({ l }: { l: LessonPlan }) => (
  <div className="rounded-lg border border-line bg-white p-6 shadow-sm md:p-10">
    <div className="mb-6 border-b border-line pb-4">
      <div className="text-sm uppercase tracking-wide text-accent">{i18n.t('lesson.doc.title', { v: l.currentVersion })}</div>
      <h2 className="font-serif-title m-0 mt-1 text-2xl">{l.title}</h2>
      <Descriptions size="small" column={{ xs: 1, sm: 2, md: 4 }} className="mt-3">
        <Descriptions.Item label={i18n.t('lesson.doc.topic')}>{l.topic}</Descriptions.Item>
        <Descriptions.Item label={i18n.t('lesson.doc.course')}>{courseLabel(l.gradeLevel)}</Descriptions.Item>
        <Descriptions.Item label={i18n.t('lesson.doc.duration')}>{i18n.t('lesson.doc.minutesN', { n: l.durationMinutes })}</Descriptions.Item>
        <Descriptions.Item label={i18n.t('lesson.doc.author')}>{l.author.fullName}</Descriptions.Item>
      </Descriptions>
    </div>
    <Block title={i18n.t('lesson.doc.goal')} text={l.goals} />
    <Block title={i18n.t('lesson.doc.objectives')} text={l.objectives} />
    <Block title={i18n.t('lesson.doc.outcomes')} text={l.learningOutcomes} />
    <div className="mb-5">
      <h3 className="mb-2 text-base font-semibold text-primary">{i18n.t('lesson.doc.sources')}</h3>
      <ol className="m-0 pl-5">
        {l.resources.map((r) => (
          <li key={r.id} className="mb-1">
            <b>{r.source?.title ?? r.virtualObject?.title}</b>
            {r.virtualObject && <Tag className="ml-2">3D/360°</Tag>}
            {r.purpose && <div className="text-sm">{i18n.t('lesson.doc.purpose', { p: r.purpose })}</div>}
          </li>
        ))}
      </ol>
    </div>
    {l.problemQuestions.length > 0 && (
      <div className="mb-5">
        <h3 className="mb-2 text-base font-semibold text-primary">{i18n.t('lesson.doc.problems')}</h3>
        <ol className="m-0 pl-5">{l.problemQuestions.map((q) => <li key={q}>{q}</li>)}</ol>
      </div>
    )}
    <Block title={i18n.t('lesson.doc.individual')} text={l.individualTasks} />
    <Block title={i18n.t('lesson.doc.group')} text={l.groupTasks} />
    {l.interactiveMethods.length > 0 && (
      <div className="mb-5">
        <h3 className="mb-2 text-base font-semibold text-primary">{i18n.t('lesson.doc.methods')}</h3>
        {l.interactiveMethods.map((m) => <Tag key={m}>{m}</Tag>)}
      </div>
    )}
    <div className="mb-5">
      <h3 className="mb-2 text-base font-semibold text-primary">{i18n.t('lesson.doc.stages')}</h3>
      <Table
        size="small"
        pagination={false}
        rowKey={(r) => `${r.title}-${r.durationMinutes}`}
        dataSource={l.stages}
        scroll={{ x: 700 }}
        columns={[
          { title: i18n.t('lesson.doc.colStage'), dataIndex: 'title', width: 160 },
          { title: i18n.t('lesson.doc.colTime'), width: 70, render: (_, s) => i18n.t('lesson.doc.minShort', { n: s.durationMinutes }) },
          { title: i18n.t('lesson.doc.colTeacher'), dataIndex: 'teacherActivity' },
          { title: i18n.t('lesson.doc.colStudent'), dataIndex: 'studentActivity' },
          { title: i18n.t('lesson.doc.colMethods'), render: (_, s) => [s.methods, s.resources].filter(Boolean).join('; ') },
        ]}
      />
    </div>
    <Block title={i18n.t('lesson.doc.criteria')} text={l.assessmentCriteria} />
    <Block title={i18n.t('lesson.doc.reflection')} text={l.reflectionQuestions} />
    <Block title={i18n.t('lesson.doc.rationale')} text={l.methodicalRationale} />
  </div>
);
