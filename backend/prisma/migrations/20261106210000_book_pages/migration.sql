-- Kitoblar (PDF): har bir sahifa matni — kitob ichidan qidirish va kerakli sahifaga o'tish uchun
CREATE TABLE "SourcePage" (
    "id" UUID NOT NULL,
    "sourceId" UUID NOT NULL,
    "page" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "SourcePage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SourcePage_sourceId_page_key" ON "SourcePage"("sourceId", "page");

ALTER TABLE "SourcePage" ADD CONSTRAINT "SourcePage_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "HistoricalSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
