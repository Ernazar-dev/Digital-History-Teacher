-- Talabaning «O‘zini o‘zi baholash» funksiyasi olib tashlandi: uning dalil vazni va usul tavsifi ham olib tashlanadi.
-- Qolgan vaznlar nisbiy hisoblanadi (natija = Σ ball×vazn / Σ vazn), shuning uchun ularni qayta taqsimlash shart emas.
DELETE FROM "EvidenceWeight" WHERE "evidenceKind" = 'SELF_ASSESSMENT';
UPDATE "AssessmentComponent" SET "methods" = 'Elektron portfolio, ekspert bahosi'
  WHERE "code" = 'REFLECTIVE' AND "methods" = 'O‘zini baholash, elektron portfolio, ekspert bahosi';
