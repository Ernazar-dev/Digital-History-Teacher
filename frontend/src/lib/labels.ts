/** Enum qiymatlarining o'zbekcha nomlari va rang belgilari — bitta joyda */
import type {
  AssignmentStatus, AssignmentType, DiagnosticKind, EvidenceKind, GroupKind, ObjectType, PortfolioItemType, Provider,
  PublicationStatus, QuestionType, Role, SourceType, SubmissionStatus, TaskKind, UserStatus, VariantKind, WorkStatus,
  AssessmentStage,
} from '@/types/api';

export const ROLE: Record<Role, string> = { ADMIN: 'Administrator', TEACHER: 'O‘qituvchi', STUDENT: 'Talaba' };
export const USER_STATUS: Record<UserStatus, { label: string; color: string }> = {
  PENDING: { label: 'Tasdiq kutilmoqda', color: 'gold' },
  ACTIVE: { label: 'Faol', color: 'green' },
  BLOCKED: { label: 'Bloklangan', color: 'red' },
};
export const SOURCE_TYPE: Record<SourceType, string> = {
  WRITTEN: 'Yozma manba', VISUAL: 'Vizual manba', MAP: 'Xarita', AUDIO: 'Audio', VIDEO: 'Video',
  ARCHAEOLOGICAL: 'Arxeologik manba',
};
export const PUBLICATION: Record<PublicationStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Qoralama', color: 'default' },
  REVIEWED: { label: 'Tekshirilgan', color: 'blue' },
  PUBLISHED: { label: 'Nashr etilgan', color: 'green' },
};
export const VARIANT: Record<VariantKind, { label: string; hint: string }> = {
  ORIGINAL: { label: 'Asl manba', hint: 'Manbaning asl matni yoki tavsifi' },
  SCHOLARLY_COMMENTARY: { label: 'Ilmiy sharh', hint: 'Ilmiy adabiyotdagi talqin va sharh' },
  EDUCATIONAL_ADAPTATION: { label: 'Ta’lim uchun moslashtirilgan', hint: 'O‘quvchilar uchun soddalashtirilgan variant' },
};
export const WORK_STATUS: Record<WorkStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Qoralama', color: 'default' },
  SUBMITTED: { label: 'Topshirilgan', color: 'blue' },
  UNDER_REVIEW: { label: 'Tekshirilmoqda', color: 'purple' },
  RETURNED: { label: 'Qayta ishlashga qaytarilgan', color: 'orange' },
  REVIEWED: { label: 'Baholangan', color: 'green' },
};
export const SUBMISSION_STATUS: Record<SubmissionStatus, { label: string; color: string }> = {
  NOT_STARTED: { label: 'Boshlanmagan', color: 'default' },
  IN_PROGRESS: { label: 'Jarayonda', color: 'cyan' },
  SUBMITTED: { label: 'Topshirilgan', color: 'blue' },
  UNDER_REVIEW: { label: 'Tekshirilmoqda', color: 'purple' },
  RETURNED: { label: 'Qayta ishlash uchun qaytarilgan', color: 'orange' },
  GRADED: { label: 'Baholangan', color: 'green' },
};
export const ASSIGNMENT_STATUS: Record<AssignmentStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Qoralama', color: 'default' },
  PUBLISHED: { label: 'E’lon qilingan', color: 'green' },
  ARCHIVED: { label: 'Arxivlangan', color: 'red' },
};
export const ASSIGNMENT_TYPE: Record<AssignmentType, string> = {
  SOURCE_COMPARISON: 'Manbalarni taqqoslash',
  CHRONOLOGY: 'Xronologik tartibga solish',
  MAP_IDENTIFICATION: 'Xaritada aniqlash',
  PERSONALITY_ANALYSIS: 'Tarixiy shaxs faoliyatini tahlil qilish',
  PROBLEM_QUESTIONS: 'Muammoli savollar tuzish',
  INTERACTIVE_TASK_DESIGN: 'Interaktiv topshiriq yaratish',
  EVIDENCE_CONCLUSION: 'Dalillar asosida xulosa',
  VIRTUAL_OBJECT_LESSON: '3D/360° obyekt asosida mashg‘ulot',
  SOURCE_ADAPTATION: 'Manbani yoshga moslashtirish',
  LESSON_PLAN: 'Dars ishlanmasi',
};
export const OBJECT_TYPE: Record<ObjectType, string> = { MODEL_3D: '3D model', TOUR_360: '360° sayohat', VIRTUAL_MUSEUM: 'Virtual muzey', OTHER: 'Boshqa' };
export const PROVIDER: Record<Provider, string> = { SKETCHFAB: 'Sketchfab', UZBEKISTAN360: 'Uzbekistan360', OTHER: 'Boshqa' };
export const TASK_KIND: Record<TaskKind, string> = {
  OBSERVATION: 'Kuzatuv savoli', EVIDENCE: 'Tarixiy dalillarni aniqlash', COMPARISON: 'Manba bilan taqqoslash',
  DISCUSSION: 'Guruhli muhokama', LESSON_APPLICATION: 'Darsda qo‘llash', MATERIAL_CREATION: 'Metodik material yaratish',
};
export const GROUP_KIND: Record<GroupKind, { label: string; color: string }> = {
  REGULAR: { label: 'Oddiy guruh', color: 'default' },
  EXPERIMENTAL: { label: 'Tajriba guruhi', color: 'geekblue' },
  CONTROL: { label: 'Nazorat guruhi', color: 'volcano' },
};
export const EVIDENCE_KIND: Record<EvidenceKind, string> = {
  TEST: 'Test', SURVEY: 'So‘rovnoma', REFLECTION: 'Refleksiv savollar', SOURCE_ANALYSIS: 'Manba tahlili',
  PRACTICAL_TASK: 'Amaliy topshiriq', LESSON_PLAN: 'Dars ishlanmasi ekspertizasi', PORTFOLIO: 'Portfolio tahlili',
  SELF_ASSESSMENT: 'O‘zini o‘zi baholash', EXPERT: 'Ekspert bahosi',
};
export const STAGE: Record<AssessmentStage, string> = {
  INITIAL: 'Boshlang‘ich', INTERMEDIATE: 'Oraliq', FINAL: 'Yakuniy', ONGOING: 'Joriy',
};
export const DIAGNOSTIC_KIND: Record<DiagnosticKind, string> = {
  TEST: 'Test', SURVEY: 'So‘rovnoma', REFLECTION: 'Refleksiv savollar', CASE: 'Kompleks keys (manba asosida)',
};
export const QUESTION_TYPE: Record<QuestionType, string> = {
  SINGLE_CHOICE: 'Bitta javob', MULTIPLE_CHOICE: 'Bir nechta javob', TEXT: 'Matnli javob', LIKERT: 'Likert shkalasi',
};
export const PORTFOLIO_TYPE: Record<PortfolioItemType, string> = {
  ASSIGNMENT: 'Topshiriq', SOURCE_ANALYSIS: 'Manba tahlili', SOURCE_COMPARISON: 'Manbalar taqqoslanishi',
  LESSON_PLAN: 'Dars ishlanmasi', VIRTUAL_WORK: 'Virtual obyekt asosidagi ish', DIAGNOSTIC: 'Diagnostika',
  SELF_ASSESSMENT: 'O‘zini o‘zi baholash', REFLECTION: 'Refleksiv yozuv', UPLOAD: 'Yuklangan fayl',
};
export const toOptions = <K extends string>(map: Record<K, string | { label: string }>) =>
  (Object.entries(map) as [K, string | { label: string }][]).map(([value, v]) => ({
    value,
    label: typeof v === 'string' ? v : v.label,
  }));
