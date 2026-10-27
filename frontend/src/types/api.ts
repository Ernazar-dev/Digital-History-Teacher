/** Backend javob turlari — markazlashgan (backend Prisma modellari bilan mos) */
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED';
export type PublicationStatus = 'DRAFT' | 'REVIEWED' | 'PUBLISHED';
export type SourceType = 'WRITTEN' | 'VISUAL' | 'MAP' | 'AUDIO' | 'VIDEO' | 'ARCHAEOLOGICAL';
export type VariantKind = 'ORIGINAL' | 'SCHOLARLY_COMMENTARY' | 'EDUCATIONAL_ADAPTATION';
export type WorkStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RETURNED' | 'REVIEWED';
export type ObjectType = 'MODEL_3D' | 'TOUR_360' | 'VIRTUAL_MUSEUM' | 'OTHER';
export type Provider = 'SKETCHFAB' | 'UZBEKISTAN360' | 'OTHER';
export type TaskKind = 'OBSERVATION' | 'EVIDENCE' | 'COMPARISON' | 'DISCUSSION' | 'LESSON_APPLICATION' | 'MATERIAL_CREATION';
export type GroupKind = 'REGULAR' | 'EXPERIMENTAL' | 'CONTROL';
export type AssignmentType =
  | 'SOURCE_COMPARISON' | 'CHRONOLOGY' | 'MAP_IDENTIFICATION' | 'PERSONALITY_ANALYSIS' | 'PROBLEM_QUESTIONS'
  | 'INTERACTIVE_TASK_DESIGN' | 'EVIDENCE_CONCLUSION' | 'VIRTUAL_OBJECT_LESSON' | 'SOURCE_ADAPTATION' | 'LESSON_PLAN';
export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type SubmissionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RETURNED' | 'GRADED';
export type EvidenceKind =
  | 'TEST' | 'SURVEY' | 'REFLECTION' | 'SOURCE_ANALYSIS' | 'PRACTICAL_TASK' | 'LESSON_PLAN' | 'PORTFOLIO' | 'SELF_ASSESSMENT' | 'EXPERT';
export type DiagnosticStage = 'INITIAL' | 'INTERMEDIATE' | 'FINAL';
export type AssessmentStage = DiagnosticStage | 'ONGOING';
export type DiagnosticKind = 'TEST' | 'SURVEY' | 'REFLECTION' | 'CASE';
export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT' | 'LIKERT';
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

export interface SourceVariant { id?: string; kind: VariantKind; title: string; content: string; citation?: string | null }

export interface MediaFileRef { id: string; originalName: string; mimeType: string; size: number }

export interface SourceListItem {
  id: string; title: string; slug: string; summary: string; type: SourceType; format: string | null;
  dateLabel: string | null; yearFrom: number | null; yearTo: number | null; author: string | null;
  status: PublicationStatus; isDemo: boolean; mediaUrl: string | null; mediaFileId: string | null;
  mediaFile?: { id: string; mimeType: string } | null;
  latitude: number | null; longitude: number | null; createdAt: string; updatedAt: string;
  period: { id: string; name: string } | null; topics: { id: string; name: string }[];
}

export interface Source extends SourceListItem {
  description: string | null; periodId: string | null; origin: string | null; repository: string | null;
  originalUrl: string | null; license: string | null; copyright: string | null; reliabilityNotes: string | null;
  limitations: string | null; notes: string | null; teachingUse: string | null; methodicalRecommendations: string | null;
  practicalTasks: string | null; references: string | null; embedUrl: string | null; variants: SourceVariant[]; createdBy: { id: string; fullName: string } | null;
  mediaFile: MediaFileRef | null; files: MediaFileRef[];
  virtualObjects: (Ref & { thumbnailUrl: string | null })[]; assignments: Ref[];
}

export interface AnalysisQuestion {
  key: string; label: string; hint?: string; section: 'identification' | 'critical' | 'synthesis' | 'pedagogical'; required: boolean;
  kind?: 'text' | 'choice'; options?: { value: string; label: string }[];
}

export interface SourceAnalysis {
  id: string; studentId: string; sourceId: string; answers: Record<string, string>; status: WorkStatus;
  teacherComment: string | null; score: number | null; submittedAt: string | null; reviewedAt: string | null;
  createdAt: string; updatedAt: string;
  source: { id: string; title: string; slug: string; type: SourceType; dateLabel: string | null; summary: string };
  student: { id: string; fullName: string }; reviewedBy: { id: string; fullName: string } | null;
}

export interface Comparison {
  id: string; studentId: string; title: string; similarities: string; differences: string; evidence: string;
  conclusion: string; teachingUse: string; status: WorkStatus; teacherComment: string | null; score: number | null;
  submittedAt: string | null; reviewedAt: string | null; updatedAt: string;
  student: { id: string; fullName: string }; reviewedBy: { id: string; fullName: string } | null;
  items: { sourceId: string; notes: string | null; source: SourceListItem & { origin: string | null; reliabilityNotes: string | null; limitations: string | null } }[];
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
  tasks: VirtualTask[]; assignments: Ref[]; myResponse: VirtualResponse | null;
  sources: (Ref & { slug: string; dateLabel: string | null; mediaUrl: string | null; mediaFile: { id: string; mimeType: string } | null })[];
}

export interface Group {
  id: string; name: string; description: string | null; kind: GroupKind; academicYear: string | null; teacherId: string;
  teacher: { id: string; fullName: string; username: string; email: string | null }; _count: { members: number; assignments: number };
  members?: { studentId: string; joinedAt: string; student: { id: string; fullName: string; username: string; email: string | null; status: UserStatus } }[];
}

export interface RubricCriterion { id: string; title: string; description: string | null; maxScore: number; componentId: string | null; component?: { id: string; code: string; name: string } | null }
export interface Rubric { id: string; title: string; description: string | null; criteria: RubricCriterion[]; _count?: { assignments: number } }

export interface Feedback {
  id: string; decision: 'COMMENT' | 'RETURN_FOR_REVISION' | 'GRADE'; comment: string; version: number; totalScore: number | null;
  createdAt: string; author: { id: string; fullName: string } | null; scores: { criterionId: string; score: number; comment: string | null }[];
}
/** 6-modul raqamli simulyatori. Talabaga yil va koordinatalar yuborilmaydi (ixtiyoriy maydonlar) */
export interface ChronologyEvent { id: string; text: string; year?: number }
export interface MapPlace { id: string; label: string; lat?: number; lng?: number }
export type SimulatorConfig = { kind: 'CHRONOLOGY'; events: ChronologyEvent[] } | { kind: 'MAP'; toleranceKm: number; places: MapPlace[] };
export type SimulatorAnswer = { order: string[] } | { placements: Record<string, { lat: number; lng: number }> };
export interface SimulatorResult {
  score: number; correct: number; total: number; toleranceKm?: number;
  details: {
    id: string; correct: boolean; text?: string; year?: number; position?: number; label?: string; lat?: number; lng?: number;
    placed?: { lat: number; lng: number } | null; distanceKm?: number | null;
  }[];
}
export interface Submission {
  id: string; assignmentId: string; studentId: string; content: string; lessonPlanId: string | null; status: SubmissionStatus;
  version: number; score: number | null; submittedAt: string | null; gradedAt: string | null; updatedAt: string;
  simulatorAnswer?: SimulatorAnswer | null; autoScore?: number | null; autoDetails?: SimulatorResult | null;
  student?: { id: string; fullName: string; username?: string; email?: string | null };
  assignment?: {
    id: string; title: string; type: AssignmentType; maxScore: number; dueDate: string | null; evidenceKind?: EvidenceKind; rubric?: Rubric | null;
    simulator?: SimulatorConfig | null;
  };
  lessonPlan?: { id: string; title: string; status: WorkStatus } | null;
  revisions?: { id: string; version: number; content: string; createdAt: string }[];
  feedbacks?: Feedback[];
}
export interface Assignment {
  id: string; title: string; scenario: string; instructions: string | null; type: AssignmentType; status: AssignmentStatus;
  dueDate: string | null; maxScore: number; rubricId: string | null; evidenceKind: EvidenceKind; createdAt: string;
  createdBy: { id: string; fullName: string } | null; rubric: Rubric | null;
  groups: { id: string; name: string; kind: GroupKind }[]; sources: Ref[]; virtualObjects: (Ref & { thumbnailUrl: string | null })[];
  _count: { submissions: number }; simulator?: SimulatorConfig | null;
  myStatus?: SubmissionStatus; mySubmission?: Submission | null; submissionCounts?: Record<string, number>;
}

export interface LessonStage { id?: string; title: string; durationMinutes: number; teacherActivity: string; studentActivity: string; methods: string; resources: string }
export interface LessonResource {
  id?: string; sourceId: string | null; virtualObjectId: string | null; purpose: string;
  source?: { id: string; title: string; slug: string; type: SourceType; dateLabel: string | null; license: string | null; originalUrl: string | null } | null;
  virtualObject?: { id: string; title: string; slug: string; type: ObjectType; externalUrl: string; license: string | null } | null;
}
export interface LessonCriterionScore { criterionId: string; title: string; maxScore: number; score: number; comment: string | null }
export interface LessonPlan {
  id: string; authorId: string; title: string; topic: string; gradeLevel: string; durationMinutes: number;
  goals: string; objectives: string; learningOutcomes: string; problemQuestions: string[]; individualTasks: string;
  groupTasks: string; interactiveMethods: string[]; assessmentCriteria: string; reflectionQuestions: string;
  methodicalRationale: string; status: WorkStatus; currentVersion: number; assignmentId: string | null;
  teacherComment: string | null; score: number | null; submittedAt: string | null; reviewedAt: string | null;
  updatedAt: string; createdAt: string;
  author: { id: string; fullName: string }; reviewedBy: { id: string; fullName: string } | null;
  topicId: string | null; topicRef: { id: string; name: string; slug: string; period: { id: string; name: string } | null } | null;
  rubric: { id: string; title: string } | null; criterionScores: LessonCriterionScore[] | null;
  assignment: { id: string; title: string; rubricId: string | null } | null; stages: LessonStage[]; resources: LessonResource[];
  versions: { id: string; version: number; note: string | null; createdAt: string }[];
}
export interface LessonListItem {
  id: string; title: string; topic: string; gradeLevel: string; durationMinutes: number; status: WorkStatus;
  currentVersion: number; score: number | null; updatedAt: string; submittedAt: string | null;
  author: { id: string; fullName: string }; _count: { resources: number; stages: number };
}

export interface DiagnosticOption { id: string; text: string }
export interface DiagnosticQuestion {
  id: string; componentId: string; type: QuestionType; prompt: string; options: DiagnosticOption[] | null;
  correct: string[] | null; points: number; sortOrder: number; component?: { id: string; code: string; name: string };
}
export interface Diagnostic {
  id: string; title: string; description: string | null; stage: DiagnosticStage; kind: DiagnosticKind; isActive: boolean;
  timeLimitMinutes: number | null; createdAt: string; questions?: DiagnosticQuestion[];
  sourceId?: string | null; source?: { id: string; title: string; slug: string; type: SourceType } | null;
  _count?: { questions: number; attempts?: number };
  myAttempt?: { id: string; status: 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEWED'; submittedAt: string | null; autoScore: number | null; maxAutoScore: number | null } | null;
}
export interface DiagnosticAttempt {
  id: string; diagnosticId: string; studentId: string; status: 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEWED';
  startedAt: string; submittedAt: string | null; autoScore: number | null; maxAutoScore: number | null;
  student: { id: string; fullName: string }; diagnostic: Diagnostic & { questions: DiagnosticQuestion[] };
  responses: { id: string; questionId: string; answer: unknown; isCorrect: boolean | null; score: number | null; teacherComment: string | null }[];
}

export interface LevelRef { code: string; name: string }
export interface EvidenceRecord {
  id: string; score: number; stage: AssessmentStage; assessorRole: 'AUTO' | 'SELF' | 'TEACHER' | 'EXPERT';
  assessor: { id: string; fullName: string } | null; note: string | null; refType: string | null; refId: string | null; createdAt: string;
  details?: { indicatorId: string; criterion: string; title: string; level: IndicatorLevel; points: number }[] | null;
}
export interface ComponentResult {
  componentId: string; code: string; name: string; weight: number; score: number | null; level: LevelRef | null; evidenceKinds: number;
  evidence: { kind: EvidenceKind; average: number; weight: number; weightConfigured: boolean; count: number; records: EvidenceRecord[] }[];
}
export interface CompetenceProfile {
  stage: AssessmentStage | 'ALL'; overall: number | null; overallLevel: LevelRef | null; components: ComponentResult[];
  recordCount: number; warnings: string[]; disclaimer: string;
}
export interface Dynamics {
  byStage: Record<AssessmentStage, { overall: number | null; level: LevelRef | null; components: { code: string; name: string; score: number | null }[] }>;
  initialVsFinal: { code: string; name: string; initial: number | null; final: number | null; change: number | null }[];
}
/** Hujjat, 5-modul: indikator darajalari tavsifi (Past=1, O'rta=2, Yuqori=3 ball) */
export interface AssessmentIndicator {
  id: string; title: string; description: string | null; lowDescriptor: string; mediumDescriptor: string; highDescriptor: string;
}
export type IndicatorLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export interface AssessmentComponent {
  id: string; code: string; name: string; definition: string; methods: string | null; weight: number; sortOrder: number;
  evidenceWeights: { componentId: string; evidenceKind: EvidenceKind; weight: number }[];
  criteria: { id: string; title: string; description: string | null; sortOrder: number; indicators: AssessmentIndicator[] }[];
}
export interface AssessmentLevel { id: string; code: string; name: string; description: string; minPercent: number; maxPercent: number }
export interface AssessmentConfig { components: AssessmentComponent[]; levels: AssessmentLevel[]; note: string }

export interface PortfolioItem {
  id: string; type: PortfolioItemType; title: string; description: string | null; refType: string; refId: string;
  sourceIds: string[]; version: number; isFeatured: boolean; createdAt: string; updatedAt: string;
  sources: { id: string; title: string; slug: string; type: SourceType }[];
  /** Ish natijasi: holat, foiz, oxirgi o'qituvchi izohi (diagnostikada — bosqich) */
  outcome?: { status: string | null; percent: number | null; teacherComment: string | null; stage?: string | null };
}
export interface Reflection { id: string; title: string; content: string; relatedType: string | null; relatedId: string | null; createdAt: string; updatedAt: string }
export interface Portfolio {
  id: string; studentId: string; summary: string | null; student: { id: string; fullName: string; username: string; email: string | null; institution: string | null };
  items: PortfolioItem[]; reflections: Reflection[]; profile: CompetenceProfile;
  dynamics: { stage: 'INITIAL' | 'INTERMEDIATE' | 'FINAL'; overall: number | null; level: LevelRef | null; components: { code: string; name: string; score: number | null }[] }[];
  diagnostics: { itemId: string; title: string; stage: DiagnosticStage | null; status: string | null; percent: number | null; date: string }[];
  teacherComments: { itemId: string; title: string; type: PortfolioItemType; comment: string; percent: number | null; date: string }[];
}
export interface PortfolioItemDetail extends PortfolioItem { detail: Record<string, unknown> | null }

export interface ReviewItem {
  kind: 'SUBMISSION' | 'ANALYSIS' | 'COMPARISON' | 'LESSON' | 'VIRTUAL' | 'DIAGNOSTIC';
  id: string; title: string; student: { id: string; fullName: string }; submittedAt: string | null;
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
