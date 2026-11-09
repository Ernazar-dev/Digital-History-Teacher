-- Ko'p tillilik: bazadagi o'zbekcha matnlarning ru/en variantlari (kalit — o'zbekcha matn hash'i)
CREATE TABLE "TextTranslation" (
    "id" UUID NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TextTranslation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TextTranslation_sourceHash_locale_key" ON "TextTranslation"("sourceHash", "locale");
