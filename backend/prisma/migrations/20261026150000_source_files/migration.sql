-- 1-modul: manbaga biriktirilgan o'quv materiallari (PDF, DOCX, PPTX, rasm)
CREATE TABLE "SourceFile" (
    "id" UUID NOT NULL,
    "sourceId" UUID NOT NULL,
    "mediaFileId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SourceFile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SourceFile_sourceId_mediaFileId_key" ON "SourceFile"("sourceId", "mediaFileId");
CREATE INDEX "SourceFile_sourceId_sortOrder_idx" ON "SourceFile"("sourceId", "sortOrder");

ALTER TABLE "SourceFile" ADD CONSTRAINT "SourceFile_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SourceFile" ADD CONSTRAINT "SourceFile_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "MediaFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
