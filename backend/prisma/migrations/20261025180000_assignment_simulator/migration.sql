-- 6-modul: raqamli simulyator (xronologiya, xarita) va avtomatik tekshiruv
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "simulator" JSONB;

-- AlterTable
ALTER TABLE "AssignmentSubmission" ADD COLUMN     "autoDetails" JSONB,
ADD COLUMN     "autoScore" DOUBLE PRECISION,
ADD COLUMN     "simulatorAnswer" JSONB;

