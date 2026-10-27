/**
 * Lokal diskdagi yuklangan fayllarni (UPLOAD_DIR) bazaga ko'chiradi: StoredFile jadvaliga yozadi
 * va MediaFile.storage = 'database' qiladi. Lokal ma'lumotlarni Neon'ga o'tkazgandan keyin
 * bir marta ishga tushiriladi (DATABASE_URL — Neon). Qayta ishga tushirish xavfsiz.
 *
 *   npm run storage:import
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();
const root = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

const main = async () => {
  const files = await prisma.mediaFile.findMany({ where: { storage: 'local' }, select: { id: true, storageKey: true } });
  let moved = 0;
  const missing: string[] = [];
  for (const f of files) {
    const data = await fs.readFile(path.join(root, path.basename(f.storageKey))).catch(() => null);
    if (!data) {
      missing.push(f.storageKey);
      continue;
    }
    await prisma.$transaction([
      prisma.$executeRaw`INSERT INTO "StoredFile" ("key", "data", "size") VALUES (${f.storageKey}, ${data}, ${data.length}) ON CONFLICT ("key") DO NOTHING`,
      prisma.mediaFile.update({ where: { id: f.id }, data: { storage: 'database' } }),
    ]);
    moved += 1;
  }
  console.log(`Bazaga ko‘chirildi: ${moved} ta fayl.`);
  if (missing.length) console.warn(`Diskda topilmadi (${missing.length}):`, missing.join(', '));
  await prisma.$disconnect();
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
