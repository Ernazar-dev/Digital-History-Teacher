import { z } from 'zod';
import type { LessonPlan } from '@/types/api';

export const lessonFormSchema = z.object({
  title: z.string().trim().min(3, 'Sarlavha kamida 3 belgi'),
  topic: z.string().trim().min(2, 'Mavzuni kiriting'),
  topicId: z.string().nullable(),
  gradeLevel: z.string().trim().min(1, 'Kursni tanlang'),
  durationMinutes: z.number({ invalid_type_error: 'Davomiylikni kiriting' }).int().min(5).max(240),
  goals: z.string(),
  objectives: z.string(),
  learningOutcomes: z.string(),
  problemQuestions: z.array(z.object({ text: z.string().trim().min(1, 'Savolni yozing') })),
  individualTasks: z.string(),
  groupTasks: z.string(),
  interactiveMethods: z.array(z.string()),
  assessmentCriteria: z.string(),
  reflectionQuestions: z.string(),
  methodicalRationale: z.string(),
  stages: z.array(
    z.object({
      title: z.string().trim().min(1, 'Bosqich nomi'),
      durationMinutes: z.number({ invalid_type_error: 'Daqiqa' }).int().min(1).max(240),
      teacherActivity: z.string(),
      studentActivity: z.string(),
      methods: z.string(),
      resources: z.string(),
    }),
  ),
  resources: z.array(
    z.object({
      sourceId: z.string().nullable(),
      virtualObjectId: z.string().nullable(),
      purpose: z.string(),
      label: z.string().optional(),
    }),
  ),
});
export type LessonFormValues = z.infer<typeof lessonFormSchema>;

export const EMPTY_LESSON: LessonFormValues = {
  title: '', topic: '', topicId: null, gradeLevel: '1', durationMinutes: 45, goals: '', objectives: '', learningOutcomes: '',
  problemQuestions: [], individualTasks: '', groupTasks: '', interactiveMethods: [], assessmentCriteria: '',
  reflectionQuestions: '', methodicalRationale: '', stages: [], resources: [],
};

export const fromLesson = (l: LessonPlan): LessonFormValues => ({
  title: l.title, topic: l.topic, topicId: l.topicId, gradeLevel: l.gradeLevel, durationMinutes: l.durationMinutes, goals: l.goals,
  objectives: l.objectives, learningOutcomes: l.learningOutcomes,
  problemQuestions: l.problemQuestions.map((text) => ({ text })), individualTasks: l.individualTasks,
  groupTasks: l.groupTasks, interactiveMethods: l.interactiveMethods, assessmentCriteria: l.assessmentCriteria,
  reflectionQuestions: l.reflectionQuestions, methodicalRationale: l.methodicalRationale,
  stages: l.stages.map(({ title, durationMinutes, teacherActivity, studentActivity, methods, resources }) => ({
    title, durationMinutes, teacherActivity, studentActivity, methods, resources,
  })),
  resources: l.resources.map((r) => ({
    sourceId: r.sourceId, virtualObjectId: r.virtualObjectId, purpose: r.purpose,
    label: r.source?.title ?? r.virtualObject?.title ?? '',
  })),
});

export const toPayload = (v: LessonFormValues) => ({
  ...v,
  problemQuestions: v.problemQuestions.map((q) => q.text),
  resources: v.resources.map(({ sourceId, virtualObjectId, purpose }) => ({ sourceId, virtualObjectId, purpose })),
});

/** Interaktiv metodlar ro'yxati — talaba o'zi tanlaydi yoki yangisini yozadi */
export const METHOD_OPTIONS = [
  'Guruhli ish', 'Juftlikda ishlash', 'Muammoli vaziyat', 'Aqliy hujum', 'Klaster', 'Insert', 'Venn diagrammasi',
  'Kuzatuv varag‘i', 'Manba bilan ishlash', 'Rolli o‘yin', 'Munozara', 'Virtual sayohat', 'Xronologik lenta', 'Keys-stadi',
].map((m) => ({ value: m, label: m }));

/** Oliy ta'lim: bakalavriat 1–4 kurslari */
export const GRADE_OPTIONS = ['1', '2', '3', '4'].map((g) => ({ value: g, label: `${g}-kurs` }));

/** Kurs yorlig'i; avvalgi yozuvlardagi boshqa qiymatlar o'zgarishsiz ko'rsatiladi */
export const courseLabel = (g: string) => (['1', '2', '3', '4'].includes(g) ? `${g}-kurs` : g);
