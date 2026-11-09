/** Backend javob turlari — markazlashgan (backend Prisma modellari bilan mos) */
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED';
export type PublicationStatus = 'DRAFT' | 'REVIEWED' | 'PUBLISHED';
export type SourceType = 'WRITTEN' | 'VISUAL' | 'MAP' | 'AUDIO' | 'VIDEO' | 'ARCHAEOLOGICAL';
export type WorkStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RETURNED' | 'REVIEWED';
export type ObjectType = 'MODEL_3D' | 'TOUR_360' | 'VIRTUAL_MUSEUM' | 'OTHER';
export type Provider = 'SKETCHFAB' | 'UZBEKISTAN360' | 'OTHER';
export type TaskKind = 'OBSERVATION' | 'EVIDENCE' | 'COMPARISON' | 'DISCUSSION' | 'LESSON_APPLICATION' | 'MATERIAL_CREATION';
export type GroupKind = 'REGULAR' | 'EXPERIMENTAL' | 'CONTROL';
export type PortfolioItemType =
  | 'ASSIGNMENT' | 'SOURCE_ANALYSIS' | 'SOURCE_COMPARISON' | 'LESSON_PLAN' | 'VIRTUAL_WORK' | 'DIAGNOSTIC' | 'SELF_ASSESSMENT' | 'REFLECTION' | 'UPLOAD';

export interface PageMeta { page: number; pageSize: number; total: number; totalPages: number }
export interface Paged<T> { data: T[]; meta: PageMeta }
export interface ApiErrorBody { error: { code: string; message: string; details?: unknown } }
export interface Ref { id: string; title: string; slug?: string; type?: string }

export interface User {
  id: string; username: string; email: string | null; fullName: string; role: Role; status: UserStatus;
  institution: string | null; createdAt: string; lastLoginAt: string | null;
  /** Faqat /users ro'yxatida: talaba a'zo bo'lgan guruhlar */
  groups?: { id: string; name: string }[];
}

export interface Period {
  id: string; name: string; slug: string; startYear: number | null; endYear: number | null;
  description: string | null; reference: string | null; sortOrder: number;
  _count?: { sources: number; virtualObjects: number };
}
export interface Topic { id: string; name: string; slug: string; description: string | null; periodId: string | null; period?: { id: string; name: string } | null; _count?: { sources: number } }

export interface MediaFileRef { id: string; originalName: string; mimeType: string; size: number }

export interface SourceListItem {
  id: string; title: string; slug: string; summary: string; type: SourceType; bookLabel: string | null; sortOrder: number;
  dateLabel: string | null; yearFrom: number | null; yearTo: number | null;
  status: PublicationStatus; mediaFileId: string | null; mediaFile?: { id: string; mimeType: string } | null; mediaUrl: string | null;
  presentationFileId: string | null; videoFileId: string | null; videoUrl: string | null; hasLecture?: boolean;
  /** Kitob muallifi (tarixiy asarlar uchun) */
  author?: string | null;
  latitude: number | null; longitude: number | null; createdAt: string; updatedAt: string;
  period: { id: string; name: string } | null; topics: { id: string; name: string }[];
}

/** Kutubxonadagi mavzu: ma'ruza matni, taqdimot va video rolik */
export interface Source extends SourceListItem {
  periodId: string | null; lectureContent: string | null; references: string | null; originalUrl: string | null; license: string | null;
  createdBy: { id: string; fullName: string } | null;
  mediaFile: MediaFileRef | null; lectureFile: MediaFileRef | null; presentationFile: MediaFileRef | null; videoFile: MediaFileRef | null;
  lectureFileId: string | null;
  /** Javob tili (tarjima topilmasa — 'uz') va o'zbekchada qolgan qismlar: 'text' | 'lecture' | 'presentation' | 'video' */
  lang?: 'uz' | 'ru' | 'en';
  fallbacks?: string[];
  /** Qaysi tillarda variant bor (o'zbekcha doim) */
  availableLocales?: string[];
  /** Tarixiy kitob bo'lsa — qidiriladigan sahifalar soni (ro'yxat qidiruvi uchun), aks holda 0 */
  pageCount: number;
  tests: { id: string; title: string; questionCount: number }[];
  virtualObjects: (Ref & { slug: string; type: ObjectType; thumbnailUrl: string | null; periodLabel: string | null; location: string | null })[];
}

/** Mavzuning ru/en varianti (admin tahrirlash oynasi uchun) */
export interface SourceTranslation {
  id: string; sourceId: string; locale: 'ru' | 'en';
  title: string; summary: string | null; description: string | null; lectureContent: string | null;
  lectureFileId: string | null; presentationFileId: string | null; videoFileId: string | null; videoUrl: string | null;
  lectureFile: MediaFileRef | null; presentationFile: MediaFileRef | null; videoFile: MediaFileRef | null;
}

export interface VirtualTask { id: string; kind: TaskKind; prompt: string; sortOrder: number }
export interface VirtualObjectListItem {
  id: string; title: string; slug: string; type: ObjectType; provider: Provider; periodLabel: string | null;
  location: string | null; latitude: number | null; longitude: number | null; description: string;
  thumbnailUrl: string | null; isDemo: boolean; isActive: boolean; status: PublicationStatus; license: string | null;
  authorOrOrganization: string | null; period: { id: string; name: string } | null; _count?: { tasks: number };
}
export interface VirtualResponse {
  id: string; studentId: string; virtualObjectId: string; answers: Record<string, string>; activityDesign: string;
  status: WorkStatus; teacherComment: string | null; score: number | null; submittedAt: string | null;
  reviewedAt: string | null; updatedAt: string;
  student?: { id: string; fullName: string }; reviewedBy?: { id: string; fullName: string } | null;
  virtualObject?: { id: string; title: string; slug: string; type: ObjectType; tasks: VirtualTask[] };
}
export interface VirtualObject extends VirtualObjectListItem {
  periodId: string | null; historicalSignificance: string | null; externalUrl: string; embedUrl: string | null;
  termsNote: string | null; historicalReferences: string | null; methodicalRecommendations: string | null;
  tasks: VirtualTask[]; myResponse: VirtualResponse | null;
  sources: (Ref & { slug: string; dateLabel: string | null; mediaUrl: string | null; mediaFile: { id: string; mimeType: string } | null })[];
}

export interface Group {
  id: string; name: string; description: string | null; kind: GroupKind; academicYear: string | null; teacherId: string;
  teacher: { id: string; fullName: string; username: string; email: string | null }; _count: { members: number };
  members?: { studentId: string; joinedAt: string; student: { id: string; fullName: string; username: string; email: string | null; status: UserStatus } }[];
}

export interface LessonStage { id?: string; title: string; durationMinutes: number; teacherActivity: string; studentActivity: string; methods: string; resources: string }
export interface LessonResource {
  id?: string; sourceId: string | null; virtualObjectId: string | null; purpose: string;
  source?: { id: string; title: string; slug: string; type: SourceType; dateLabel: string | null; license: string | null; originalUrl: string | null } | null;
  virtualObject?: { id: string; title: string; slug: string; type: ObjectType; externalUrl: string; license: string | null } | null;
}
export interface LessonPlan {
  id: string; authorId: string; title: string; topic: string; gradeLevel: string; durationMinutes: number;
  goals: string; objectives: string; learningOutcomes: string; problemQuestions: string[]; individualTasks: string;
  groupTasks: string; interactiveMethods: string[]; assessmentCriteria: string; reflectionQuestions: string;
  methodicalRationale: string; status: WorkStatus; currentVersion: number;
  teacherComment: string | null; score: number | null; submittedAt: string | null; reviewedAt: string | null;
  updatedAt: string; createdAt: string;
  author: { id: string; fullName: string }; reviewedBy: { id: string; fullName: string } | null;
  topicId: string | null; topicRef: { id: string; name: string; slug: string; period: { id: string; name: string } | null } | null;
  stages: LessonStage[]; resources: LessonResource[];
  versions: { id: string; version: number; note: string | null; createdAt: string }[];
}
export interface LessonListItem {
  id: string; title: string; topic: string; gradeLevel: string; durationMinutes: number; status: WorkStatus;
  currentVersion: number; score: number | null; updatedAt: string; submittedAt: string | null;
  author: { id: string; fullName: string }; _count: { resources: number; stages: number };
}

export interface PortfolioItem {
  id: string; type: PortfolioItemType; title: string; description: string | null; refType: string; refId: string;
  sourceIds: string[]; version: number; isFeatured: boolean; createdAt: string; updatedAt: string;
  sources: { id: string; title: string; slug: string; type: SourceType }[];
  /** Ish natijasi: holat, foiz, oxirgi o'qituvchi izohi */
  outcome?: { status: string | null; percent: number | null; teacherComment: string | null };
}
export interface Reflection { id: string; title: string; content: string; relatedType: string | null; relatedId: string | null; createdAt: string; updatedAt: string }
export interface Portfolio {
  id: string; studentId: string; summary: string | null; student: { id: string; fullName: string; username: string; email: string | null; institution: string | null };
  items: PortfolioItem[]; reflections: Reflection[];
  teacherComments: { itemId: string; title: string; type: PortfolioItemType; comment: string; percent: number | null; date: string }[];
}
export interface PortfolioItemDetail extends PortfolioItem { detail: Record<string, unknown> | null }

/** O'qituvchi ko'rib chiqishi kerak bo'lgan ish (dars ishlanmasi yoki virtual obyekt javobi) */
export interface ReviewItem {
  kind: 'LESSON' | 'VIRTUAL'; id: string; title: string; student: { id: string; fullName: string }; submittedAt: string | null; slug: string | null;
}

export type TestOption = 'A' | 'B' | 'C' | 'D';
export interface TestAttemptResult {
  id?: string; answers?: (TestOption | null)[]; answerKey?: TestOption[]; correctCount: number; total: number; percent: number; submittedAt: string;
}
export interface TestListItem {
  id: string; title: string; description: string | null; questionCount: number; isPublished: boolean; createdAt: string; createdById: string | null;
  source: { id: string; title: string; slug: string } | null; createdBy: { id: string; fullName: string } | null;
  attemptCount: number; myAttempt: TestAttemptResult | null;
}
/** Fayl asosidagi test: kalit o'qituvchiga; talabaga faqat topshirgandan keyin (myAttempt.answerKey) */
export interface Test extends Omit<TestListItem, 'attemptCount' | 'myAttempt'> {
  fileId: string; sourceId: string | null; file: MediaFileRef; answerKey: TestOption[] | null; myAttempt: TestAttemptResult | null;
}
export interface TestResultRow {
  id: string; correctCount: number; total: number; percent: number; submittedAt: string; answers: (TestOption | null)[];
  student: { id: string; fullName: string; username: string; groups: { id: string; name: string }[] };
}

export interface AuditLog {
  id: string; action: string; entity: string; entityId: string | null; meta: unknown; ip: string | null; createdAt: string;
  actor: { id: string; fullName: string; username: string; email: string | null } | null;
}

export type Settings = {
  'platform.name': string; 'platform.fullName': string; 'platform.description': string;
  'platform.logoUrl': string; 'platform.institution': string; 'auth.studentAutoApprove': boolean;
};
export type PublicSettings = Omit<Settings, 'auth.studentAutoApprove'>;
