-- 5-modul: indikator darajalari tavsifi, baholash tafsiloti va kompleks keys-topshiriq
-- AlterEnum
ALTER TYPE "DiagnosticKind" ADD VALUE 'CASE';

-- AlterTable
ALTER TABLE "AssessmentIndicator" ADD COLUMN     "highDescriptor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lowDescriptor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "mediumDescriptor" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "CompetenceRecord" ADD COLUMN     "details" JSONB;

-- AlterTable
ALTER TABLE "Diagnostic" ADD COLUMN     "sourceId" UUID;

-- AddForeignKey
ALTER TABLE "Diagnostic" ADD CONSTRAINT "Diagnostic_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

