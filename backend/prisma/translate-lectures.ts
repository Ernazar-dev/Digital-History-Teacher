/**
 * 13 ta ma'ruza matnini (Markdown) Claude API orqali ru va en tillariga tarjima qilib,
 * HistoricalSourceTranslation jadvaliga yozadi. Tarjima admin tomonidan tekshiriladi (tahrirlash sahifasidagi tablar).
 *
 *   ANTHROPIC_API_KEY=sk-ant-... npm run db:translate:lectures            # barcha ma'ruzalar, ikkala til
 *   ANTHROPIC_API_KEY=... npm run db:translate:lectures -- --slug amir-temur-davlati --lang ru
 *   npm run db:translate:lectures -- --force                              # mavjud tarjimani qayta yozadi
 *
 * Mavjud (bo'sh bo'lmagan) tarjimaga tegmaydi — qo'lda tuzatilgan matn yo'qolmasligi uchun.
 */
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { textHash } from '../src/shared/i18n/textHash';

const prisma = new PrismaClient();
const MODEL = process.env.TRANSLATE_MODEL ?? 'claude-opus-5-5';
const LANG_NAME = { ru: 'Russian', en: 'English' } as const;
type Lang = keyof typeof LANG_NAME;

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

/** Markdown'ni "## " sarlavhalar bo'yicha ~6000 belgilik bo'laklarga ajratadi (tuzilma buzilmasligi uchun) */
const chunk = (md: string, max = 6000): string[] => {
  const parts = md.split(/\n(?=#{1,3} )/);
  const out: string[] = [];
  let cur = '';
  for (const p of parts) {
    if (cur && cur.length + p.length > max) {
      out.push(cur);
      cur = '';
    }
    cur += (cur ? '\n' : '') + p;
  }
  if (cur) out.push(cur);
  return out;
};

const call = async (text: string, lang: Lang): Promise<string> => {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      system:
        `You are a professional academic translator. Translate the Uzbek (Latin script) history lecture below into ${LANG_NAME[lang]}. ` +
        'Keep the Markdown structure exactly (headings, lists, tables, bold/italic). Do not add comments or explanations. ' +
        'Keep proper names, dates and numbers accurate; use the standard scholarly transliteration for Central Asian names and terms. ' +
        'Output only the translation.',
      messages: [{ role: 'user', content: text }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = (await res.json()) as { content: { type: string; text?: string }[] };
  return body.content.filter((c) => c.type === 'text').map((c) => c.text ?? '').join('');
};

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY belgilanmagan');
  const slug = arg('slug');
  const only = arg('lang') as Lang | undefined;
  const force = process.argv.includes('--force');
  const langs: Lang[] = only ? [only] : ['ru', 'en'];
  const sources = await prisma.historicalSource.findMany({
    where: { deletedAt: null, lectureContent: { not: null }, ...(slug ? { slug } : {}) },
    select: { id: true, slug: true, title: true, summary: true, lectureContent: true },
    orderBy: { sortOrder: 'asc' },
  });
  for (const s of sources) {
    for (const lang of langs) {
      const existing = await prisma.historicalSourceTranslation.findUnique({ where: { sourceId_locale: { sourceId: s.id, locale: lang } } });
      if (existing?.lectureContent && !force) {
        console.log(`- ${s.slug} [${lang}]: mavjud, o‘tkazib yuborildi`);
        continue;
      }
      process.stdout.write(`+ ${s.slug} [${lang}]: `);
      const parts = chunk(s.lectureContent!);
      const out: string[] = [];
      for (const p of parts) {
        out.push(await call(p, lang));
        process.stdout.write('.');
      }
      // Sarlavha va qisqa tavsif — lug'atdagi tarjimadan (seed-translations)
      const dict = await prisma.textTranslation.findMany({ where: { locale: lang, sourceHash: { in: [textHash(s.title), textHash(s.summary)] } } });
      const byHash = new Map(dict.map((d) => [d.sourceHash, d.text]));
      const data = {
        title: byHash.get(textHash(s.title)) ?? s.title,
        summary: byHash.get(textHash(s.summary)) ?? null,
        lectureContent: out.join('\n\n'),
      };
      await prisma.historicalSourceTranslation.upsert({
        where: { sourceId_locale: { sourceId: s.id, locale: lang } },
        create: { sourceId: s.id, locale: lang, ...data },
        update: data,
      });
      console.log(` ${data.lectureContent.length} belgi`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
