-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'REVIEWED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('WRITTEN', 'VISUAL', 'MAP', 'AUDIO', 'VIDEO', 'ARCHAEOLOGICAL', 'MODEL_3D', 'TOUR_360');

-- CreateEnum
CREATE TYPE "SourceVariantKind" AS ENUM ('ORIGINAL', 'SCHOLARLY_COMMENTARY', 'EDUCATIONAL_ADAPTATION');

-- CreateEnum
CREATE TYPE "VirtualObjectType" AS ENUM ('MODEL_3D', 'TOUR_360', 'VIRTUAL_MUSEUM', 'OTHER');

-- CreateEnum
CREATE TYPE "EmbedProvider" AS ENUM ('SKETCHFAB', 'UZBEKISTAN360', 'OTHER');

-- CreateEnum
CREATE TYPE "VirtualTaskKind" AS ENUM ('OBSERVATION', 'EVIDENCE', 'COMPARISON', 'DISCUSSION', 'LESSON_APPLICATION', 'MATERIAL_CREATION');

-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'RETURNED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "GroupKind" AS ENUM ('REGULAR', 'EXPERIMENTAL', 'CONTROL');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('SOURCE_COMPARISON', 'CHRONOLOGY', 'MAP_IDENTIFICATION', 'PERSONALITY_ANALYSIS', 'PROBLEM_QUESTIONS', 'INTERACTIVE_TASK_DESIGN', 'EVIDENCE_CONCLUSION', 'VIRTUAL_OBJECT_LESSON', 'SOURCE_ADAPTATION', 'LESSON_PLAN');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'RETURNED', 'GRADED');

-- CreateEnum
CREATE TYPE "FeedbackDecision" AS ENUM ('COMMENT', 'RETURN_FOR_REVISION', 'GRADE');

-- CreateEnum
CREATE TYPE "DiagnosticStage" AS ENUM ('INITIAL', 'INTERMEDIATE', 'FINAL');

-- CreateEnum
CREATE TYPE "DiagnosticKind" AS ENUM ('TEST', 'SURVEY', 'REFLECTION');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT', 'LIKERT');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "EvidenceKind" AS ENUM ('TEST', 'SURVEY', 'REFLECTION', 'SOURCE_ANALYSIS', 'PRACTICAL_TASK', 'LESSON_PLAN', 'PORTFOLIO', 'SELF_ASSESSMENT', 'EXPERT');

-- CreateEnum
CREATE TYPE "AssessorRole" AS ENUM ('AUTO', 'SELF', 'TEACHER', 'EXPERT');

-- CreateEnum
CREATE TYPE "AssessmentStage" AS ENUM ('INITIAL', 'INTERMEDIATE', 'FINAL', 'ONGOING');

-- CreateEnum
CREATE TYPE "PortfolioItemType" AS ENUM ('ASSIGNMENT', 'SOURCE_ANALYSIS', 'SOURCE_COMPARISON', 'LESSON_PLAN', 'VIRTUAL_WORK', 'DIAGNOSTIC', 'SELF_ASSESSMENT', 'REFLECTION');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "institution" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kind" "GroupKind" NOT NULL DEFAULT 'REGULAR',
    "academicYear" TEXT,
    "teacherId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMembership" (
    "groupId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("groupId","studentId")
);

-- CreateTable
CREATE TABLE "HistoricalPeriod" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "description" TEXT,
    "reference" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoricalPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricalTopic" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "periodId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoricalTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaFile" (
    "id" UUID NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storage" TEXT NOT NULL DEFAULT 'local',
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricalSource" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "type" "SourceType" NOT NULL,
    "format" TEXT,
    "periodId" UUID,
    "dateLabel" TEXT,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,
    "author" TEXT,
    "origin" TEXT,
    "repository" TEXT,
    "originalUrl" TEXT,
    "license" TEXT,
    "copyright" TEXT,
    "reliabilityNotes" TEXT,
    "limitations" TEXT,
    "notes" TEXT,
    "teachingUse" TEXT,
    "methodicalRecommendations" TEXT,
    "mediaUrl" TEXT,
    "embedUrl" TEXT,
    "mediaFileId" UUID,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HistoricalSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceTopic" (
    "sourceId" UUID NOT NULL,
    "topicId" UUID NOT NULL,

    CONSTRAINT "SourceTopic_pkey" PRIMARY KEY ("sourceId","topicId")
);

-- CreateTable
CREATE TABLE "SourceVariant" (
    "id" UUID NOT NULL,
    "sourceId" UUID NOT NULL,
    "kind" "SourceVariantKind" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "citation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSource" (
    "userId" UUID NOT NULL,
    "sourceId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSource_pkey" PRIMARY KEY ("userId","sourceId")
);

-- CreateTable
CREATE TABLE "SourceAnalysis" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "sourceId" UUID NOT NULL,
    "answers" JSONB NOT NULL,
    "status" "WorkStatus" NOT NULL DEFAULT 'DRAFT',
    "teacherComment" TEXT,
    "score" DOUBLE PRECISION,
    "reviewedById" UUID,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceComparison" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "similarities" TEXT NOT NULL DEFAULT '',
    "differences" TEXT NOT NULL DEFAULT '',
    "evidence" TEXT NOT NULL DEFAULT '',
    "conclusion" TEXT NOT NULL DEFAULT '',
    "teachingUse" TEXT NOT NULL DEFAULT '',
    "status" "WorkStatus" NOT NULL DEFAULT 'DRAFT',
    "teacherComment" TEXT,
    "score" DOUBLE PRECISION,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceComparisonItem" (
    "comparisonId" UUID NOT NULL,
    "sourceId" UUID NOT NULL,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SourceComparisonItem_pkey" PRIMARY KEY ("comparisonId","sourceId")
);

-- CreateTable
CREATE TABLE "VirtualObject" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "VirtualObjectType" NOT NULL,
    "provider" "EmbedProvider" NOT NULL DEFAULT 'OTHER',
    "periodId" UUID,
    "periodLabel" TEXT,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT NOT NULL,
    "historicalSignificance" TEXT,
    "externalUrl" TEXT NOT NULL,
    "embedUrl" TEXT,
    "authorOrOrganization" TEXT,
    "license" TEXT,
    "termsNote" TEXT,
    "historicalReferences" TEXT,
    "methodicalRecommendations" TEXT,
    "thumbnailUrl" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VirtualObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualObjectSource" (
    "virtualObjectId" UUID NOT NULL,
    "sourceId" UUID NOT NULL,

    CONSTRAINT "VirtualObjectSource_pkey" PRIMARY KEY ("virtualObjectId","sourceId")
);

-- CreateTable
CREATE TABLE "VirtualObjectTask" (
    "id" UUID NOT NULL,
    "virtualObjectId" UUID NOT NULL,
    "kind" "VirtualTaskKind" NOT NULL,
    "prompt" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VirtualObjectTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualObjectResponse" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "virtualObjectId" UUID NOT NULL,
    "answers" JSONB NOT NULL,
    "activityDesign" TEXT NOT NULL DEFAULT '',
    "status" "WorkStatus" NOT NULL DEFAULT 'DRAFT',
    "teacherComment" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualObjectResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentComponent" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "methods" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentCriterion" (
    "id" UUID NOT NULL,
    "componentId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentIndicator" (
    "id" UUID NOT NULL,
    "criterionId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentLevel" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minPercent" DOUBLE PRECISION NOT NULL,
    "maxPercent" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceWeight" (
    "componentId" UUID NOT NULL,
    "evidenceKind" "EvidenceKind" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EvidenceWeight_pkey" PRIMARY KEY ("componentId","evidenceKind")
);

-- CreateTable
CREATE TABLE "CompetenceRecord" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "componentId" UUID NOT NULL,
    "stage" "AssessmentStage" NOT NULL DEFAULT 'ONGOING',
    "evidenceKind" "EvidenceKind" NOT NULL,
    "assessorRole" "AssessorRole" NOT NULL,
    "assessorId" UUID,
    "score" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "refType" TEXT,
    "refId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetenceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnostic" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stage" "DiagnosticStage" NOT NULL,
    "kind" "DiagnosticKind" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "timeLimitMinutes" INTEGER,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Diagnostic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticQuestion" (
    "id" UUID NOT NULL,
    "diagnosticId" UUID NOT NULL,
    "componentId" UUID NOT NULL,
    "type" "QuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB,
    "correct" JSONB,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DiagnosticQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticAttempt" (
    "id" UUID NOT NULL,
    "diagnosticId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "autoScore" DOUBLE PRECISION,
    "maxAutoScore" DOUBLE PRECISION,

    CONSTRAINT "DiagnosticAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticResponse" (
    "id" UUID NOT NULL,
    "attemptId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN,
    "score" DOUBLE PRECISION,
    "teacherComment" TEXT,

    CONSTRAINT "DiagnosticResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rubric" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricCriterion" (
    "id" UUID NOT NULL,
    "rubricId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "componentId" UUID,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RubricCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "instructions" TEXT,
    "type" "AssignmentType" NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'DRAFT',
    "dueDate" TIMESTAMP(3),
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "rubricId" UUID,
    "evidenceKind" "EvidenceKind" NOT NULL DEFAULT 'PRACTICAL_TASK',
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentGroup" (
    "assignmentId" UUID NOT NULL,
    "groupId" UUID NOT NULL,

    CONSTRAINT "AssignmentGroup_pkey" PRIMARY KEY ("assignmentId","groupId")
);

-- CreateTable
CREATE TABLE "AssignmentSource" (
    "assignmentId" UUID NOT NULL,
    "sourceId" UUID NOT NULL,

    CONSTRAINT "AssignmentSource_pkey" PRIMARY KEY ("assignmentId","sourceId")
);

-- CreateTable
CREATE TABLE "AssignmentVirtualObject" (
    "assignmentId" UUID NOT NULL,
    "virtualObjectId" UUID NOT NULL,

    CONSTRAINT "AssignmentVirtualObject_pkey" PRIMARY KEY ("assignmentId","virtualObjectId")
);

-- CreateTable
CREATE TABLE "AssignmentSubmission" (
    "id" UUID NOT NULL,
    "assignmentId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "lessonPlanId" UUID,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "version" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionRevision" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentFeedback" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "authorId" UUID,
    "decision" "FeedbackDecision" NOT NULL,
    "comment" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "totalScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CriterionScore" (
    "feedbackId" UUID NOT NULL,
    "criterionId" UUID NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,

    CONSTRAINT "CriterionScore_pkey" PRIMARY KEY ("feedbackId","criterionId")
);

-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 45,
    "goals" TEXT NOT NULL DEFAULT '',
    "objectives" TEXT NOT NULL DEFAULT '',
    "learningOutcomes" TEXT NOT NULL DEFAULT '',
    "problemQuestions" JSONB NOT NULL DEFAULT '[]',
    "individualTasks" TEXT NOT NULL DEFAULT '',
    "groupTasks" TEXT NOT NULL DEFAULT '',
    "interactiveMethods" JSONB NOT NULL DEFAULT '[]',
    "assessmentCriteria" TEXT NOT NULL DEFAULT '',
    "reflectionQuestions" TEXT NOT NULL DEFAULT '',
    "methodicalRationale" TEXT NOT NULL DEFAULT '',
    "status" "WorkStatus" NOT NULL DEFAULT 'DRAFT',
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "assignmentId" UUID,
    "teacherComment" TEXT,
    "score" DOUBLE PRECISION,
    "reviewedById" UUID,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LessonPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonStage" (
    "id" UUID NOT NULL,
    "lessonPlanId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "teacherActivity" TEXT NOT NULL DEFAULT '',
    "studentActivity" TEXT NOT NULL DEFAULT '',
    "methods" TEXT NOT NULL DEFAULT '',
    "resources" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "LessonStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonResource" (
    "id" UUID NOT NULL,
    "lessonPlanId" UUID NOT NULL,
    "sourceId" UUID,
    "virtualObjectId" UUID,
    "purpose" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "LessonResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonPlanVersion" (
    "id" UUID NOT NULL,
    "lessonPlanId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonPlanVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" UUID NOT NULL,
    "portfolioId" UUID NOT NULL,
    "type" "PortfolioItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "refType" TEXT NOT NULL,
    "refId" UUID NOT NULL,
    "sourceIds" UUID[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReflectionEntry" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "relatedType" TEXT,
    "relatedId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReflectionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "meta" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "Group_teacherId_idx" ON "Group"("teacherId");

-- CreateIndex
CREATE INDEX "GroupMembership_studentId_idx" ON "GroupMembership"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalPeriod_name_key" ON "HistoricalPeriod"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalPeriod_slug_key" ON "HistoricalPeriod"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalTopic_slug_key" ON "HistoricalTopic"("slug");

-- CreateIndex
CREATE INDEX "HistoricalTopic_periodId_idx" ON "HistoricalTopic"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaFile_storageKey_key" ON "MediaFile"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalSource_slug_key" ON "HistoricalSource"("slug");

-- CreateIndex
CREATE INDEX "HistoricalSource_type_status_idx" ON "HistoricalSource"("type", "status");

-- CreateIndex
CREATE INDEX "HistoricalSource_periodId_idx" ON "HistoricalSource"("periodId");

-- CreateIndex
CREATE INDEX "HistoricalSource_deletedAt_idx" ON "HistoricalSource"("deletedAt");

-- CreateIndex
CREATE INDEX "SourceTopic_topicId_idx" ON "SourceTopic"("topicId");

-- CreateIndex
CREATE INDEX "SourceVariant_sourceId_kind_idx" ON "SourceVariant"("sourceId", "kind");

-- CreateIndex
CREATE INDEX "SourceAnalysis_studentId_status_idx" ON "SourceAnalysis"("studentId", "status");

-- CreateIndex
CREATE INDEX "SourceAnalysis_sourceId_idx" ON "SourceAnalysis"("sourceId");

-- CreateIndex
CREATE INDEX "SourceComparison_studentId_idx" ON "SourceComparison"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualObject_slug_key" ON "VirtualObject"("slug");

-- CreateIndex
CREATE INDEX "VirtualObject_type_status_isActive_idx" ON "VirtualObject"("type", "status", "isActive");

-- CreateIndex
CREATE INDEX "VirtualObjectTask_virtualObjectId_idx" ON "VirtualObjectTask"("virtualObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualObjectResponse_studentId_virtualObjectId_key" ON "VirtualObjectResponse"("studentId", "virtualObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentComponent_code_key" ON "AssessmentComponent"("code");

-- CreateIndex
CREATE INDEX "AssessmentCriterion_componentId_idx" ON "AssessmentCriterion"("componentId");

-- CreateIndex
CREATE INDEX "AssessmentIndicator_criterionId_idx" ON "AssessmentIndicator"("criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentLevel_code_key" ON "AssessmentLevel"("code");

-- CreateIndex
CREATE INDEX "CompetenceRecord_studentId_stage_idx" ON "CompetenceRecord"("studentId", "stage");

-- CreateIndex
CREATE INDEX "CompetenceRecord_componentId_idx" ON "CompetenceRecord"("componentId");

-- CreateIndex
CREATE INDEX "CompetenceRecord_refType_refId_idx" ON "CompetenceRecord"("refType", "refId");

-- CreateIndex
CREATE INDEX "Diagnostic_stage_isActive_idx" ON "Diagnostic"("stage", "isActive");

-- CreateIndex
CREATE INDEX "DiagnosticQuestion_diagnosticId_idx" ON "DiagnosticQuestion"("diagnosticId");

-- CreateIndex
CREATE INDEX "DiagnosticAttempt_studentId_idx" ON "DiagnosticAttempt"("studentId");

-- CreateIndex
CREATE INDEX "DiagnosticAttempt_diagnosticId_idx" ON "DiagnosticAttempt"("diagnosticId");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosticResponse_attemptId_questionId_key" ON "DiagnosticResponse"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "RubricCriterion_rubricId_idx" ON "RubricCriterion"("rubricId");

-- CreateIndex
CREATE INDEX "Assignment_status_idx" ON "Assignment"("status");

-- CreateIndex
CREATE INDEX "AssignmentGroup_groupId_idx" ON "AssignmentGroup"("groupId");

-- CreateIndex
CREATE INDEX "AssignmentSubmission_studentId_status_idx" ON "AssignmentSubmission"("studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_studentId_key" ON "AssignmentSubmission"("assignmentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionRevision_submissionId_version_key" ON "SubmissionRevision"("submissionId", "version");

-- CreateIndex
CREATE INDEX "AssignmentFeedback_submissionId_idx" ON "AssignmentFeedback"("submissionId");

-- CreateIndex
CREATE INDEX "LessonPlan_authorId_status_idx" ON "LessonPlan"("authorId", "status");

-- CreateIndex
CREATE INDEX "LessonStage_lessonPlanId_idx" ON "LessonStage"("lessonPlanId");

-- CreateIndex
CREATE INDEX "LessonResource_lessonPlanId_idx" ON "LessonResource"("lessonPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonPlanVersion_lessonPlanId_version_key" ON "LessonPlanVersion"("lessonPlanId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_studentId_key" ON "Portfolio"("studentId");

-- CreateIndex
CREATE INDEX "PortfolioItem_portfolioId_type_idx" ON "PortfolioItem"("portfolioId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioItem_portfolioId_refType_refId_key" ON "PortfolioItem"("portfolioId", "refType", "refId");

-- CreateIndex
CREATE INDEX "ReflectionEntry_studentId_idx" ON "ReflectionEntry"("studentId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricalTopic" ADD CONSTRAINT "HistoricalTopic_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "HistoricalPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaFile" ADD CONSTRAINT "MediaFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricalSource" ADD CONSTRAINT "HistoricalSource_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "HistoricalPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricalSource" ADD CONSTRAINT "HistoricalSource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricalSource" ADD CONSTRAINT "HistoricalSource_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceTopic" ADD CONSTRAINT "SourceTopic_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceTopic" ADD CONSTRAINT "SourceTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "HistoricalTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceVariant" ADD CONSTRAINT "SourceVariant_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSource" ADD CONSTRAINT "SavedSource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSource" ADD CONSTRAINT "SavedSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceAnalysis" ADD CONSTRAINT "SourceAnalysis_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceAnalysis" ADD CONSTRAINT "SourceAnalysis_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceAnalysis" ADD CONSTRAINT "SourceAnalysis_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceComparison" ADD CONSTRAINT "SourceComparison_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceComparisonItem" ADD CONSTRAINT "SourceComparisonItem_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "SourceComparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceComparisonItem" ADD CONSTRAINT "SourceComparisonItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualObject" ADD CONSTRAINT "VirtualObject_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "HistoricalPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualObject" ADD CONSTRAINT "VirtualObject_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualObjectSource" ADD CONSTRAINT "VirtualObjectSource_virtualObjectId_fkey" FOREIGN KEY ("virtualObjectId") REFERENCES "VirtualObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualObjectSource" ADD CONSTRAINT "VirtualObjectSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualObjectTask" ADD CONSTRAINT "VirtualObjectTask_virtualObjectId_fkey" FOREIGN KEY ("virtualObjectId") REFERENCES "VirtualObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualObjectResponse" ADD CONSTRAINT "VirtualObjectResponse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualObjectResponse" ADD CONSTRAINT "VirtualObjectResponse_virtualObjectId_fkey" FOREIGN KEY ("virtualObjectId") REFERENCES "VirtualObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentCriterion" ADD CONSTRAINT "AssessmentCriterion_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentIndicator" ADD CONSTRAINT "AssessmentIndicator_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "AssessmentCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceWeight" ADD CONSTRAINT "EvidenceWeight_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetenceRecord" ADD CONSTRAINT "CompetenceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetenceRecord" ADD CONSTRAINT "CompetenceRecord_assessorId_fkey" FOREIGN KEY ("assessorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetenceRecord" ADD CONSTRAINT "CompetenceRecord_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnostic" ADD CONSTRAINT "Diagnostic_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticQuestion" ADD CONSTRAINT "DiagnosticQuestion_diagnosticId_fkey" FOREIGN KEY ("diagnosticId") REFERENCES "Diagnostic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticQuestion" ADD CONSTRAINT "DiagnosticQuestion_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticAttempt" ADD CONSTRAINT "DiagnosticAttempt_diagnosticId_fkey" FOREIGN KEY ("diagnosticId") REFERENCES "Diagnostic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticAttempt" ADD CONSTRAINT "DiagnosticAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticResponse" ADD CONSTRAINT "DiagnosticResponse_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "DiagnosticAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticResponse" ADD CONSTRAINT "DiagnosticResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "DiagnosticQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rubric" ADD CONSTRAINT "Rubric_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricCriterion" ADD CONSTRAINT "RubricCriterion_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "Rubric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricCriterion" ADD CONSTRAINT "RubricCriterion_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "Rubric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentGroup" ADD CONSTRAINT "AssignmentGroup_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentGroup" ADD CONSTRAINT "AssignmentGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSource" ADD CONSTRAINT "AssignmentSource_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSource" ADD CONSTRAINT "AssignmentSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentVirtualObject" ADD CONSTRAINT "AssignmentVirtualObject_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentVirtualObject" ADD CONSTRAINT "AssignmentVirtualObject_virtualObjectId_fkey" FOREIGN KEY ("virtualObjectId") REFERENCES "VirtualObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionRevision" ADD CONSTRAINT "SubmissionRevision_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AssignmentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentFeedback" ADD CONSTRAINT "AssignmentFeedback_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AssignmentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentFeedback" ADD CONSTRAINT "AssignmentFeedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriterionScore" ADD CONSTRAINT "CriterionScore_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "AssignmentFeedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriterionScore" ADD CONSTRAINT "CriterionScore_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "RubricCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonStage" ADD CONSTRAINT "LessonStage_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonResource" ADD CONSTRAINT "LessonResource_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonResource" ADD CONSTRAINT "LessonResource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonResource" ADD CONSTRAINT "LessonResource_virtualObjectId_fkey" FOREIGN KEY ("virtualObjectId") REFERENCES "VirtualObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlanVersion" ADD CONSTRAINT "LessonPlanVersion_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReflectionEntry" ADD CONSTRAINT "ReflectionEntry_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
