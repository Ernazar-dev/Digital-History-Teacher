-- Login email o'rniga username orqali amalga oshiriladi; email ixtiyoriy bo'ladi.

-- 1. Ustun qo'shish
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- 2. Mavjud foydalanuvchilar uchun username: emailning "@" dan oldingi qismi
--    (faqat a-z, 0-9, ".", "_", "-"), takrorlansa "_2", "_3" ... qo'shiladi
WITH base AS (
  SELECT
    "id",
    COALESCE(NULLIF(regexp_replace(lower(split_part("email", '@', 1)), '[^a-z0-9._-]', '', 'g'), ''), 'user') AS b,
    "createdAt"
  FROM "User"
),
ranked AS (
  SELECT "id", b, ROW_NUMBER() OVER (PARTITION BY b ORDER BY "createdAt", "id") AS rn FROM base
)
UPDATE "User" u
SET "username" = CASE WHEN r.rn = 1 THEN r.b ELSE r.b || '_' || r.rn END
FROM ranked r
WHERE r."id" = u."id";

-- 3. Majburiy va unikal
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- 4. Email ixtiyoriy
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
