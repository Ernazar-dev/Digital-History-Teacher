/**
 * Deploy (Render build) uchun: boshlang'ich ma'lumotlar FAQAT baza bo'sh bo'lganda (birinchi deploy) yuklanadi.
 * Oddiy seed manbalar va obyektlarni upsert qiladi — har deployda ishlasa, administratorning
 * tahrirlari ustidan yozib yuborardi. Shuning uchun keyingi deploylarda o'tkazib yuboriladi.
 */
import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  const [periods, sources] = await Promise.all([prisma.historicalPeriod.count(), prisma.historicalSource.count()]);
  await prisma.$disconnect();
  if (periods > 0 || sources > 0) {
    console.log(`Seed o‘tkazib yuborildi: bazada ma’lumot bor (davrlar: ${periods}, manbalar: ${sources}).`);
    return;
  }
  console.log('Baza bo‘sh — boshlang‘ich ma’lumotlar yuklanmoqda...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
