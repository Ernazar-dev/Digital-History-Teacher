-- 3-modul: katalog mavzusi va rubrika (mezonlar) asosidagi ekspertiza
-- AlterTable
ALTER TABLE "LessonPlan" ADD COLUMN     "criterionScores" JSONB,
ADD COLUMN     "rubricId" UUID,
ADD COLUMN     "topicId" UUID;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "HistoricalTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "Rubric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

