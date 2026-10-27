import { Descriptions, Table, Tag } from 'antd';
import type { LessonPlan } from '@/types/api';

const Block = ({ title, text }: { title: string; text?: string | null }) =>
  text ? (
    <div className="print-break mb-5">
      <h3 className="mb-1 text-base font-semibold text-primary">{title}</h3>
      <p className="prose-text m-0">{text}</p>
    </div>
  ) : null;

/** Dars ishlanmasining chop etishga mos (PDF) hujjat ko'rinishi */
export const LessonDocument = ({ l }: { l: LessonPlan }) => (
  <div className="print-page rounded-lg border border-line bg-white p-6 shadow-sm md:p-10">
    <div className="mb-6 border-b border-line pb-4">
      <div className="text-sm uppercase tracking-wide text-accent">Dars ishlanmasi · {l.currentVersion}-versiya</div>
      <h2 className="font-serif-title m-0 mt-1 text-2xl">{l.title}</h2>
      <Descriptions size="small" column={{ xs: 1, sm: 2, md: 4 }} className="mt-3">
        <Descriptions.Item label="Mavzu">{l.topic}</Descriptions.Item>
        <Descriptions.Item label="Sinf">{l.gradeLevel}</Descriptions.Item>
        <Descriptions.Item label="Davomiyligi">{l.durationMinutes} daqiqa</Descriptions.Item>
        <Descriptions.Item label="Muallif">{l.author.fullName}</Descriptions.Item>
      </Descriptions>
    </div>
    <Block title="Maqsad" text={l.goals} />
    <Block title="Vazifalar" text={l.objectives} />
    <Block title="O‘quv natijalari" text={l.learningOutcomes} />
    <div className="print-break mb-5">
      <h3 className="mb-2 text-base font-semibold text-primary">Tarixiy manbalar va virtual obyektlar</h3>
      <ol className="m-0 pl-5">
        {l.resources.map((r) => (
          <li key={r.id} className="mb-1">
            <b>{r.source?.title ?? r.virtualObject?.title}</b>
            {r.virtualObject && <Tag className="ml-2">3D/360°</Tag>}
            {(r.source?.license || r.virtualObject?.license) && <span className="text-sm text-muted"> — litsenziya: {r.source?.license ?? r.virtualObject?.license}</span>}
            {r.purpose && <div className="text-sm">Maqsadi: {r.purpose}</div>}
          </li>
        ))}
      </ol>
    </div>
    {l.problemQuestions.length > 0 && (
      <div className="print-break mb-5">
        <h3 className="mb-2 text-base font-semibold text-primary">Muammoli savollar</h3>
        <ol className="m-0 pl-5">{l.problemQuestions.map((q) => <li key={q}>{q}</li>)}</ol>
      </div>
    )}
    <Block title="Individual topshiriqlar" text={l.individualTasks} />
    <Block title="Guruhli topshiriqlar" text={l.groupTasks} />
    {l.interactiveMethods.length > 0 && (
      <div className="mb-5">
        <h3 className="mb-2 text-base font-semibold text-primary">Interaktiv metodlar</h3>
        {l.interactiveMethods.map((m) => <Tag key={m}>{m}</Tag>)}
      </div>
    )}
    <div className="print-break mb-5">
      <h3 className="mb-2 text-base font-semibold text-primary">Dars bosqichlari</h3>
      <Table
        size="small"
        pagination={false}
        rowKey={(r) => `${r.title}-${r.durationMinutes}`}
        dataSource={l.stages}
        scroll={{ x: 700 }}
        columns={[
          { title: 'Bosqich', dataIndex: 'title', width: 160 },
          { title: 'Vaqt', width: 70, render: (_, s) => `${s.durationMinutes} daq.` },
          { title: 'O‘qituvchi faoliyati', dataIndex: 'teacherActivity' },
          { title: 'O‘quvchi faoliyati', dataIndex: 'studentActivity' },
          { title: 'Metod va vositalar', render: (_, s) => [s.methods, s.resources].filter(Boolean).join('; ') },
        ]}
      />
    </div>
    <Block title="Baholash mezonlari" text={l.assessmentCriteria} />
    <Block title="Refleksiya savollari" text={l.reflectionQuestions} />
    <Block title="Metodik qarorlar asosnomasi" text={l.methodicalRationale} />
  </div>
);
