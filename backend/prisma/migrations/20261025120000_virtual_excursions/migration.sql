-- 4-modul: virtual sayohat shaklidagi mashg'ulotlar va obyekt ishlarini baholash
-- AlterTable
ALTER TABLE "VirtualObjectResponse" ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" UUID,
ADD COLUMN     "score" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "VirtualExcursion" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 45,
    "goal" TEXT NOT NULL DEFAULT '',
    "introduction" TEXT NOT NULL DEFAULT '',
    "finalTask" TEXT NOT NULL DEFAULT '',
    "assessmentCriteria" TEXT NOT NULL DEFAULT '',
    "status" "WorkStatus" NOT NULL DEFAULT 'DRAFT',
    "teacherComment" TEXT,
    "score" DOUBLE PRECISION,
    "reviewedById" UUID,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualExcursion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualExcursionStop" (
    "id" UUID NOT NULL,
    "excursionId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "virtualObjectId" UUID,
    "sourceId" UUID,
    "durationMinutes" INTEGER NOT NULL DEFAULT 5,
    "narrative" TEXT NOT NULL DEFAULT '',
    "studentTask" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "VirtualExcursionStop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VirtualExcursion_authorId_status_idx" ON "VirtualExcursion"("authorId", "status");

-- CreateIndex
CREATE INDEX "VirtualExcursionStop_excursionId_idx" ON "VirtualExcursionStop"("excursionId");

-- AddForeignKey
ALTER TABLE "VirtualObjectResponse" ADD CONSTRAINT "VirtualObjectResponse_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualExcursion" ADD CONSTRAINT "VirtualExcursion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualExcursion" ADD CONSTRAINT "VirtualExcursion_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualExcursionStop" ADD CONSTRAINT "VirtualExcursionStop_excursionId_fkey" FOREIGN KEY ("excursionId") REFERENCES "VirtualExcursion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualExcursionStop" ADD CONSTRAINT "VirtualExcursionStop_virtualObjectId_fkey" FOREIGN KEY ("virtualObjectId") REFERENCES "VirtualObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualExcursionStop" ADD CONSTRAINT "VirtualExcursionStop_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

