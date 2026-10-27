-- «Demo» belgilari va matnlari olib tashlanadi (platforma bo'ylab ko'rsatilmaydi)
UPDATE "HistoricalSource" SET "isDemo" = false WHERE "isDemo" = true;
UPDATE "VirtualObject" SET "isDemo" = false WHERE "isDemo" = true;

UPDATE "VirtualObject" SET "title" = regexp_replace("title", '\s*\(DEMO[^)]*\)', '', 'gi') WHERE "title" ~* 'demo';
UPDATE "VirtualObject" SET "termsNote" = 'Uzbekistan360 saytidagi Buxoro bo‘yicha 360° tur.'
  WHERE "termsNote" ILIKE 'DEMO yozuv:%';

UPDATE "HistoricalPeriod" SET "reference" = regexp_replace("reference", '\s*Demo ma’lumot — tadqiqotchi tomonidan aniqlashtiriladi\.', '', 'g')
  WHERE "reference" ILIKE '%demo%';
