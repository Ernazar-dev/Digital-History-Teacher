/**
 * Bazadagi o'zbekcha matnlarning (davr/mavzu/obyekt/manba nomlari va tavsiflari, interaktiv metodlar) ru/en variantlarini
 * TextTranslation jadvaliga yozadi. Qayta ishga tushirish xavfsiz (upsert). Mavjud ma'lumotga tegmaydi.
 *   npm run db:seed:translations
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { textHash } from '../src/shared/i18n/textHash';

const prisma = new PrismaClient();
const read = (f: string) => JSON.parse(readFileSync(path.join(__dirname, 'translations', f), 'utf8')) as Record<string, string> | string[];

/** Dars konstruktoridagi interaktiv metodlar (bazada o'zbekcha saqlanadi) */
const METHODS: [string, string, string][] = [
  ['Guruhli ish', 'Групповая работа', 'Group work'],
  ['Juftlikda ishlash', 'Работа в парах', 'Pair work'],
  ['Muammoli vaziyat', 'Проблемная ситуация', 'Problem situation'],
  ['Aqliy hujum', 'Мозговой штурм', 'Brainstorming'],
  ['Klaster', 'Кластер', 'Cluster'],
  ['Insert', 'Инсерт', 'Insert'],
  ['Venn diagrammasi', 'Диаграмма Венна', 'Venn diagram'],
  ['Kuzatuv varag‘i', 'Лист наблюдения', 'Observation sheet'],
  ['Manba bilan ishlash', 'Работа с источником', 'Working with a source'],
  ['Rolli o‘yin', 'Ролевая игра', 'Role play'],
  ['Munozara', 'Дискуссия', 'Discussion'],
  ['Virtual sayohat', 'Виртуальная экскурсия', 'Virtual tour'],
  ['Xronologik lenta', 'Хронологическая лента', 'Chronological timeline'],
  ['Keys-stadi', 'Кейс-стади', 'Case study'],
];

async function main() {
  const uz = read('uz.json') as string[];
  const ru = read('ru.json') as Record<string, string>;
  const en = read('en.json') as Record<string, string>;
  const pairs: { source: string; ru: string; en: string }[] = uz.map((source, i) => ({ source, ru: ru[String(i)], en: en[String(i)] }));
  const missing = pairs.filter((p) => !p.ru || !p.en);
  if (missing.length) throw new Error(`Tarjimasi yo‘q matnlar: ${missing.length} (masalan: ${missing[0].source.slice(0, 60)})`);
  for (const [source, r, e] of METHODS) pairs.push({ source, ru: r, en: e });

  let n = 0;
  for (const p of pairs) {
    const sourceHash = textHash(p.source);
    for (const [locale, text] of [['ru', p.ru], ['en', p.en]] as const) {
      await prisma.textTranslation.upsert({
        where: { sourceHash_locale: { sourceHash, locale } },
        create: { sourceHash, source: p.source, locale, text },
        update: { source: p.source, text },
      });
      n += 1;
    }
  }
  console.log(`Tarjimalar yozildi: ${pairs.length} matn × 2 til = ${n}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
