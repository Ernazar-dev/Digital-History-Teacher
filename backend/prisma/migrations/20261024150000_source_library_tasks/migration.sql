-- 1-modul: manba asosidagi amaliy topshiriqlar
ALTER TABLE "HistoricalSource" ADD COLUMN "practicalTasks" TEXT;

-- 3D model va 360° sayohat — 4-modul (VirtualObject) obyektlari; manba turlaridan olib tashlanadi
UPDATE "HistoricalSource" SET "type" = 'VISUAL' WHERE "type" IN ('MODEL_3D', 'TOUR_360');
ALTER TYPE "SourceType" RENAME TO "SourceType_old";
CREATE TYPE "SourceType" AS ENUM ('WRITTEN', 'VISUAL', 'MAP', 'AUDIO', 'VIDEO', 'ARCHAEOLOGICAL');
ALTER TABLE "HistoricalSource" ALTER COLUMN "type" TYPE "SourceType" USING ("type"::text::"SourceType");
DROP TYPE "SourceType_old";
