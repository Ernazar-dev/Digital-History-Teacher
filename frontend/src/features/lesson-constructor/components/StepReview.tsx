import { CheckCircleTwoTone, CloseCircleTwoTone, RightOutlined } from '@ant-design/icons';
import { Alert, List } from 'antd';
import type { UseFormReturn } from 'react-hook-form';
import type { LessonFormValues } from '../lessonForm';

/** Topshirishdan oldingi tekshiruv (backenddagi tekshiruv bilan bir xil mezonlar) */
export const checklist = (v: LessonFormValues) => {
  const used = v.stages.reduce((s, st) => s + (Number(st.durationMinutes) || 0), 0);
  return [
    { ok: Boolean(v.goals.trim()), label: 'Dars maqsadlari kiritilgan', step: 2 },
    { ok: Boolean(v.objectives.trim()), label: 'Dars vazifalari kiritilgan', step: 2 },
    { ok: Boolean(v.learningOutcomes.trim()), label: 'O‘quv natijalari belgilangan', step: 2 },
    { ok: v.resources.length > 0, label: 'Kamida bitta tarixiy manba yoki virtual obyekt tanlangan', step: 3 },
    { ok: v.resources.length > 0 && v.resources.every((r) => r.purpose.trim()), label: 'Har bir manbaning darsdagi maqsadi yozilgan', step: 3 },
    { ok: v.problemQuestions.some((q) => q.text.trim()), label: 'Kamida bitta muammoli savol tuzilgan', step: 4 },
    { ok: Boolean(v.individualTasks.trim()), label: 'Individual topshiriqlar ishlab chiqilgan', step: 4 },
    { ok: Boolean(v.groupTasks.trim()), label: 'Guruhli topshiriqlar ishlab chiqilgan', step: 4 },
    { ok: v.interactiveMethods.length > 0, label: 'Interaktiv metodlar tanlangan', step: 4 },
    { ok: v.stages.length > 0, label: 'Dars bosqichlari belgilangan', step: 5 },
    { ok: used <= v.durationMinutes, label: `Vaqt taqsimoti dars davomiyligidan oshmaydi (${used}/${v.durationMinutes} daq.)`, step: 5 },
    { ok: Boolean(v.assessmentCriteria.trim()), label: 'Baholash mezonlari kiritilgan', step: 6 },
    { ok: Boolean(v.reflectionQuestions.trim()), label: 'Refleksiya savollari kiritilgan', step: 6 },
    { ok: Boolean(v.methodicalRationale.trim()), label: 'Metodik qarorlar asosnomasi yozilgan', step: 6 },
  ];
};

/** goTo — bandni bosganda o'sha qadamga o'tkazadi (qadam raqami 1 dan boshlanadi) */
export const StepReview = ({ form, goTo }: { form: UseFormReturn<LessonFormValues>; goTo?: (step: number) => void }) => {
  const items = checklist(form.watch());
  const ready = items.every((i) => i.ok);
  return (
    <>
      <Alert
        className="mb-4"
        type={ready ? 'success' : 'warning'}
        showIcon
        message={ready ? 'Dars ishlanmasi topshirishga tayyor' : 'Topshirishdan oldin quyidagilarni to‘ldiring'}
        description="Saqlash har safar yangi versiya yaratadi. Topshirilgach ishlanma o‘qituvchi ekspertizasiga yuboriladi va portfolioga qo‘shiladi."
      />
      <List
        bordered
        dataSource={items}
        renderItem={(i) =>
          i.ok || !goTo ? (
            <List.Item>
              <span>
                {i.ok ? <CheckCircleTwoTone twoToneColor="#2f7d4f" /> : <CloseCircleTwoTone twoToneColor="#b42318" />}
                <span className="ml-2">{i.label}</span>
              </span>
              {!i.ok && <span className="text-sm text-muted">{i.step}-qadam</span>}
            </List.Item>
          ) : (
            <List.Item className="!p-0">
              <button
                type="button"
                onClick={() => goTo(i.step)}
                aria-label={`${i.label} — ${i.step}-qadamga o‘tish`}
                className="group flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-6 py-3 text-left transition-colors hover:bg-red-50 focus-visible:bg-red-50"
              >
                <span>
                  <CloseCircleTwoTone twoToneColor="#b42318" />
                  <span className="ml-2">{i.label}</span>
                </span>
                <span className="shrink-0 text-sm font-medium text-primary">
                  {i.step}-qadamga o‘tish <RightOutlined className="text-xs transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </List.Item>
          )
        }
      />
    </>
  );
};
