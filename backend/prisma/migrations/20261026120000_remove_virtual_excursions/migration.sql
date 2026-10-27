-- Alohida «Virtual sayohatlar» bo'limi olib tashlandi (4-modul virtual muzey bo'limi orqali qoplanadi)
-- Portfolio'da sayohatga ishora qiluvchi yozuvlar qolmasin
DELETE FROM "PortfolioItem" WHERE "refType" = 'VirtualExcursion';

-- DropForeignKey
ALTER TABLE "VirtualExcursionStop" DROP CONSTRAINT "VirtualExcursionStop_excursionId_fkey";
ALTER TABLE "VirtualExcursionStop" DROP CONSTRAINT "VirtualExcursionStop_virtualObjectId_fkey";
ALTER TABLE "VirtualExcursionStop" DROP CONSTRAINT "VirtualExcursionStop_sourceId_fkey";
ALTER TABLE "VirtualExcursion" DROP CONSTRAINT "VirtualExcursion_authorId_fkey";
ALTER TABLE "VirtualExcursion" DROP CONSTRAINT "VirtualExcursion_reviewedById_fkey";

-- DropTable
DROP TABLE "VirtualExcursionStop";
DROP TABLE "VirtualExcursion";
