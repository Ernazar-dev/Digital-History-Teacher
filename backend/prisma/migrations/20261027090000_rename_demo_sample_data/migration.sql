-- Namunaviy (seed) hisob va guruh nomlaridan «Demo» so'zi olib tashlanadi — faqat aniq mos keladigan yozuvlar
UPDATE "User" SET "fullName" = 'O‘qituvchi' WHERE "fullName" = 'Demo O‘qituvchi';
UPDATE "User" SET "fullName" = regexp_replace("fullName", '^Demo Talaba ([0-9]+)$', 'Talaba \1') WHERE "fullName" ~ '^Demo Talaba [0-9]+$';
UPDATE "User" SET "institution" = 'Pedagogika oliy ta’lim muassasasi' WHERE "institution" = 'Demo pedagogika oliy ta’lim muassasasi';
UPDATE "Group" SET "name" = 'TO-21 (tajriba guruhi)' WHERE "name" = 'TO-21 (tajriba guruhi, demo)';
UPDATE "Group" SET "name" = 'TO-22 (nazorat guruhi)' WHERE "name" = 'TO-22 (nazorat guruhi, demo)';
