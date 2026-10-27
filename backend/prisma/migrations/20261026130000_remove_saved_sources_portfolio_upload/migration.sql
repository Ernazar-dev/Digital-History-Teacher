-- «Saqlangan manbalar» bo'limi olib tashlandi
ALTER TABLE "SavedSource" DROP CONSTRAINT "SavedSource_userId_fkey";
ALTER TABLE "SavedSource" DROP CONSTRAINT "SavedSource_sourceId_fkey";
DROP TABLE "SavedSource";

-- Elektron portfolio: talaba o'zi yuklagan fayllar (profil sahifasida)
ALTER TYPE "PortfolioItemType" ADD VALUE 'UPLOAD';
