-- Ko'p tillilik: mavzuning ru/en variantlari (asosiy yozuv — o'zbekcha)
CREATE TABLE "HistoricalSourceTranslation" (
    "id" UUID NOT NULL,
    "sourceId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "teachingUse" TEXT,
    "methodicalRecommendations" TEXT,
    "practicalTasks" TEXT,
    "references" TEXT,
    "lectureContent" TEXT,
    "lectureFileId" UUID,
    "presentationFileId" UUID,
    "videoFileId" UUID,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoricalSourceTranslation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HistoricalSourceTranslation_sourceId_locale_key" ON "HistoricalSourceTranslation"("sourceId", "locale");

ALTER TABLE "HistoricalSourceTranslation" ADD CONSTRAINT "HistoricalSourceTranslation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HistoricalSourceTranslation" ADD CONSTRAINT "HistoricalSourceTranslation_lectureFileId_fkey" FOREIGN KEY ("lectureFileId") REFERENCES "MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HistoricalSourceTranslation" ADD CONSTRAINT "HistoricalSourceTranslation_presentationFileId_fkey" FOREIGN KEY ("presentationFileId") REFERENCES "MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HistoricalSourceTranslation" ADD CONSTRAINT "HistoricalSourceTranslation_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
