-- Platformani soddalashtirish (2026-11-03):
--  * Tahlil laboratoriyasi, diagnostika, kompetensiya, rubrikalar va eski topshiriqlar olib tashlandi
--  * Manbalar kutubxonasi = ma'ruza mavzulari (ma'ruza matni, taqdimot, video)
--  * Topshiriqlar = fayl asosidagi test (javoblar kaliti bilan)

-- Olib tashlangan ishlar portfoliodan ham o'chiriladi
DELETE FROM "PortfolioItem" WHERE "refType" IN ('SourceAnalysis', 'SourceComparison', 'AssignmentSubmission', 'DiagnosticAttempt', 'SelfAssessment');
UPDATE "ReflectionEntry" SET "relatedType" = NULL, "relatedId" = NULL
  WHERE "relatedType" IN ('SourceAnalysis', 'SourceComparison', 'AssignmentSubmission', 'DiagnosticAttempt');

-- Platforma nomi: «rivojlantirish» → «takomillashtirish» (admin sozlamada saqlangan bo'lsa)
UPDATE "SystemSetting"
  SET "value" = to_jsonb(replace("value" #>> '{}', 'kompetensiyasini rivojlantirish', 'kompetensiyasini takomillashtirish'))
  WHERE "key" = 'platform.fullName' AND jsonb_typeof("value") = 'string';

-- DropForeignKey
ALTER TABLE "SourceFile" DROP CONSTRAINT "SourceFile_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "SourceFile" DROP CONSTRAINT "SourceFile_mediaFileId_fkey";

-- DropForeignKey
ALTER TABLE "SourceVariant" DROP CONSTRAINT "SourceVariant_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "SourceAnalysis" DROP CONSTRAINT "SourceAnalysis_studentId_fkey";

-- DropForeignKey
ALTER TABLE "SourceAnalysis" DROP CONSTRAINT "SourceAnalysis_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "SourceAnalysis" DROP CONSTRAINT "SourceAnalysis_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "SourceComparison" DROP CONSTRAINT "SourceComparison_studentId_fkey";

-- DropForeignKey
ALTER TABLE "SourceComparison" DROP CONSTRAINT "SourceComparison_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "SourceComparisonItem" DROP CONSTRAINT "SourceComparisonItem_comparisonId_fkey";

-- DropForeignKey
ALTER TABLE "SourceComparisonItem" DROP CONSTRAINT "SourceComparisonItem_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentCriterion" DROP CONSTRAINT "AssessmentCriterion_componentId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentIndicator" DROP CONSTRAINT "AssessmentIndicator_criterionId_fkey";

-- DropForeignKey
ALTER TABLE "EvidenceWeight" DROP CONSTRAINT "EvidenceWeight_componentId_fkey";

-- DropForeignKey
ALTER TABLE "CompetenceRecord" DROP CONSTRAINT "CompetenceRecord_studentId_fkey";

-- DropForeignKey
ALTER TABLE "CompetenceRecord" DROP CONSTRAINT "CompetenceRecord_assessorId_fkey";

-- DropForeignKey
ALTER TABLE "CompetenceRecord" DROP CONSTRAINT "CompetenceRecord_componentId_fkey";

-- DropForeignKey
ALTER TABLE "Diagnostic" DROP CONSTRAINT "Diagnostic_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Diagnostic" DROP CONSTRAINT "Diagnostic_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "DiagnosticQuestion" DROP CONSTRAINT "DiagnosticQuestion_diagnosticId_fkey";

-- DropForeignKey
ALTER TABLE "DiagnosticQuestion" DROP CONSTRAINT "DiagnosticQuestion_componentId_fkey";

-- DropForeignKey
ALTER TABLE "DiagnosticAttempt" DROP CONSTRAINT "DiagnosticAttempt_diagnosticId_fkey";

-- DropForeignKey
ALTER TABLE "DiagnosticAttempt" DROP CONSTRAINT "DiagnosticAttempt_studentId_fkey";

-- DropForeignKey
ALTER TABLE "DiagnosticResponse" DROP CONSTRAINT "DiagnosticResponse_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "DiagnosticResponse" DROP CONSTRAINT "DiagnosticResponse_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Rubric" DROP CONSTRAINT "Rubric_createdById_fkey";

-- DropForeignKey
ALTER TABLE "RubricCriterion" DROP CONSTRAINT "RubricCriterion_rubricId_fkey";

-- DropForeignKey
ALTER TABLE "RubricCriterion" DROP CONSTRAINT "RubricCriterion_componentId_fkey";

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_rubricId_fkey";

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_createdById_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentGroup" DROP CONSTRAINT "AssignmentGroup_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentGroup" DROP CONSTRAINT "AssignmentGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentSource" DROP CONSTRAINT "AssignmentSource_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentSource" DROP CONSTRAINT "AssignmentSource_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentVirtualObject" DROP CONSTRAINT "AssignmentVirtualObject_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentVirtualObject" DROP CONSTRAINT "AssignmentVirtualObject_virtualObjectId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentSubmission" DROP CONSTRAINT "AssignmentSubmission_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentSubmission" DROP CONSTRAINT "AssignmentSubmission_studentId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentSubmission" DROP CONSTRAINT "AssignmentSubmission_lessonPlanId_fkey";

-- DropForeignKey
ALTER TABLE "SubmissionRevision" DROP CONSTRAINT "SubmissionRevision_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentFeedback" DROP CONSTRAINT "AssignmentFeedback_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentFeedback" DROP CONSTRAINT "AssignmentFeedback_authorId_fkey";

-- DropForeignKey
ALTER TABLE "CriterionScore" DROP CONSTRAINT "CriterionScore_feedbackId_fkey";

-- DropForeignKey
ALTER TABLE "CriterionScore" DROP CONSTRAINT "CriterionScore_criterionId_fkey";

-- DropForeignKey
ALTER TABLE "LessonPlan" DROP CONSTRAINT "LessonPlan_rubricId_fkey";

-- DropForeignKey
ALTER TABLE "LessonPlan" DROP CONSTRAINT "LessonPlan_assignmentId_fkey";

-- AlterTable
ALTER TABLE "HistoricalSource" ADD COLUMN     "bookLabel" TEXT,
ADD COLUMN     "lectureContent" TEXT,
ADD COLUMN     "lectureFileId" UUID,
ADD COLUMN     "presentationFileId" UUID,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "videoFileId" UUID,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "LessonPlan" DROP COLUMN "assignmentId",
DROP COLUMN "criterionScores",
DROP COLUMN "rubricId";

-- DropTable
DROP TABLE "SourceFile";

-- DropTable
DROP TABLE "SourceVariant";

-- DropTable
DROP TABLE "SourceAnalysis";

-- DropTable
DROP TABLE "SourceComparison";

-- DropTable
DROP TABLE "SourceComparisonItem";

-- DropTable
DROP TABLE "AssessmentComponent";

-- DropTable
DROP TABLE "AssessmentCriterion";

-- DropTable
DROP TABLE "AssessmentIndicator";

-- DropTable
DROP TABLE "AssessmentLevel";

-- DropTable
DROP TABLE "EvidenceWeight";

-- DropTable
DROP TABLE "CompetenceRecord";

-- DropTable
DROP TABLE "Diagnostic";

-- DropTable
DROP TABLE "DiagnosticQuestion";

-- DropTable
DROP TABLE "DiagnosticAttempt";

-- DropTable
DROP TABLE "DiagnosticResponse";

-- DropTable
DROP TABLE "Rubric";

-- DropTable
DROP TABLE "RubricCriterion";

-- DropTable
DROP TABLE "Assignment";

-- DropTable
DROP TABLE "AssignmentGroup";

-- DropTable
DROP TABLE "AssignmentSource";

-- DropTable
DROP TABLE "AssignmentVirtualObject";

-- DropTable
DROP TABLE "AssignmentSubmission";

-- DropTable
DROP TABLE "SubmissionRevision";

-- DropTable
DROP TABLE "AssignmentFeedback";

-- DropTable
DROP TABLE "CriterionScore";

-- DropEnum
DROP TYPE "SourceVariantKind";

-- DropEnum
DROP TYPE "AssignmentType";

-- DropEnum
DROP TYPE "AssignmentStatus";

-- DropEnum
DROP TYPE "SubmissionStatus";

-- DropEnum
DROP TYPE "FeedbackDecision";

-- DropEnum
DROP TYPE "DiagnosticStage";

-- DropEnum
DROP TYPE "DiagnosticKind";

-- DropEnum
DROP TYPE "QuestionType";

-- DropEnum
DROP TYPE "AttemptStatus";

-- DropEnum
DROP TYPE "EvidenceKind";

-- DropEnum
DROP TYPE "AssessorRole";

-- DropEnum
DROP TYPE "AssessmentStage";

-- CreateTable
CREATE TABLE "Test" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceId" UUID,
    "fileId" UUID NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "answerKey" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestAttempt" (
    "id" UUID NOT NULL,
    "testId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "answers" JSONB NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Test_sourceId_idx" ON "Test"("sourceId");

-- CreateIndex
CREATE INDEX "Test_deletedAt_isPublished_idx" ON "Test"("deletedAt", "isPublished");

-- CreateIndex
CREATE INDEX "TestAttempt_studentId_idx" ON "TestAttempt"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "TestAttempt_testId_studentId_key" ON "TestAttempt"("testId", "studentId");

-- AddForeignKey
ALTER TABLE "HistoricalSource" ADD CONSTRAINT "HistoricalSource_lectureFileId_fkey" FOREIGN KEY ("lectureFileId") REFERENCES "MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricalSource" ADD CONSTRAINT "HistoricalSource_presentationFileId_fkey" FOREIGN KEY ("presentationFileId") REFERENCES "MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricalSource" ADD CONSTRAINT "HistoricalSource_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "MediaFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Eski manbalar kutubxonadan yashiriladi (soft delete — kerak bo'lsa qaytarish mumkin);
-- ularning o'rniga 13 ta ma'ruza mavzusi keladi (npm run db:seed:lectures)
UPDATE "HistoricalSource" SET "deletedAt" = CURRENT_TIMESTAMP WHERE "deletedAt" IS NULL;
