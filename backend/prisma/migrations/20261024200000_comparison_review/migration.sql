-- 2-modul: taqqoslash ishini kim va qachon baholagani
-- DropIndex
DROP INDEX "SourceComparison_studentId_idx";

-- AlterTable
ALTER TABLE "SourceComparison" ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" UUID;

-- CreateIndex
CREATE INDEX "SourceComparison_studentId_status_idx" ON "SourceComparison"("studentId", "status");

-- AddForeignKey
ALTER TABLE "SourceComparison" ADD CONSTRAINT "SourceComparison_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

