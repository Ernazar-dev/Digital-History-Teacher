import { describe, expect, it } from 'vitest';
import { prisma } from '../src/config/prisma';
import { seedBooks, BOOKS } from '../prisma/seed-books';
import { seedLectures } from '../prisma/seed-lectures';
import { api, userWithToken } from './helpers';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

describe('Tarixiy kitoblar (Word) va ro‘yxatdagi qidiruv', () => {
  it('seed: kitoblar Word fayl, muqova va sahifa matnlari bilan qo‘shiladi, qayta ishga tushganda takrorlanmaydi', async () => {
    await seedBooks(prisma, null);
    const books = await prisma.historicalSource.findMany({
      where: { slug: { in: BOOKS.map((b) => b.slug) } },
      include: { lectureFile: true, _count: { select: { pages: true } } },
    });
    expect(books).toHaveLength(BOOKS.length);
    for (const b of books) {
      expect(b.lectureFile?.mimeType).toBe(DOCX_MIME);
      expect(b._count.pages).toBeGreaterThan(50);
      expect(b.status).toBe('PUBLISHED');
      expect(b.mediaUrl).toBe(`/covers/${b.slug}.jpg`);
      expect(b.author).toBeTruthy();
    }
    const pages = await prisma.sourcePage.count();
    const files = await prisma.mediaFile.count();
    await seedBooks(prisma, null);
    expect(await prisma.sourcePage.count()).toBe(pages);
    expect(await prisma.mediaFile.count()).toBe(files);

    // Word fayl yuklab olinadi (DOCX — ZIP imzosi «PK»)
    const res = await api().get(`/api/v1/media/${books[0].lectureFileId}`).buffer(true).parse((r, cb) => {
      const chunks: Buffer[] = [];
      r.on('data', (c: Buffer) => chunks.push(c));
      r.on('end', () => cb(null, Buffer.concat(chunks)));
    });
    expect(res.status).toBe(200);
    expect((res.body as Buffer).subarray(0, 2).toString()).toBe('PK');
  });

  it('ro‘yxat qidiruvi kitob matnidan ham topadi; sahifa soni kitob ma’lumotida keladi', async () => {
    await seedBooks(prisma, null);
    const book = await prisma.historicalSource.findUniqueOrThrow({ where: { slug: 'kitob-boburnoma' } });
    const sample = (await prisma.sourcePage.findFirstOrThrow({ where: { sourceId: book.id, page: 40 } })).text;
    const word = sample.split(' ').find((w) => /^[\p{L}]{7,}$/u.test(w))!;

    const list = await api().get('/api/v1/sources').query({ q: word, pageSize: 100 });
    expect(list.status).toBe(200);
    expect(list.body.data.map((s: { slug: string }) => s.slug)).toContain(book.slug);

    const detail = await api().get(`/api/v1/sources/${book.slug}`);
    expect(detail.body.data.pageCount).toBeGreaterThan(50);
    expect(detail.body.data.author).toBe('Zahiriddin Muhammad Bobur');
  });

  it('qoralama kitobni mehmon ro‘yxat qidiruvida topa olmaydi', async () => {
    await seedBooks(prisma, null);
    const book = await prisma.historicalSource.findUniqueOrThrow({ where: { slug: 'kitob-avesto' } });
    await prisma.historicalSource.update({ where: { id: book.id }, data: { status: 'DRAFT' } });
    const guest = await api().get('/api/v1/sources').query({ q: 'Avesto', pageSize: 100 });
    expect(guest.body.data.map((s: { slug: string }) => s.slug)).not.toContain(book.slug);
    const admin = await userWithToken('ADMIN');
    const staff = await api().get('/api/v1/sources').set(admin.auth).query({ q: 'Avesto', pageSize: 100 });
    expect(staff.body.data.map((s: { slug: string }) => s.slug)).toContain(book.slug);
    await prisma.historicalSource.update({ where: { id: book.id }, data: { status: 'PUBLISHED' } });
  });

  it('ro‘yxat qidiruvi apostrof ko‘rinishlariga e’tibor bermaydi: «O\'zbekiston» = «O‘zbekiston»', async () => {
    const admin = await userWithToken('ADMIN');
    const make = await api().post('/api/v1/sources').set(admin.auth).send({
      title: 'Apostrof sinovi mavzusi', summary: 'Bu yerda O‘zbekiston va Oʻzbek so‘zlari bor.', status: 'PUBLISHED',
    });
    expect(make.status).toBe(201);
    for (const q of ["O'zbekiston", 'O‘zbekiston', 'Oʻzbekiston', 'o’zbekiston']) {
      const r = await api().get('/api/v1/sources').query({ q, pageSize: 100 });
      expect(r.body.data.map((s: { id: string }) => s.id), q).toContain(make.body.data.id);
    }
    // LIKE maxsus belgilari oddiy matn sifatida qidiriladi
    const wild = await api().get('/api/v1/sources').query({ q: '%%', pageSize: 100 });
    expect(wild.body.data).toHaveLength(0);
  });

  it('boshqa bo‘limlar kitoblarga moslangan: vaqt chizig‘i, xarita, umumiy qidiruv, o‘quv yo‘li', async () => {
    await seedLectures(prisma, null);
    await seedBooks(prisma, null);
    const slugsOf = (arr: { slug: string }[]) => arr.map((x) => x.slug);

    // Vaqt chizig'i: kitoblar o'z davriga tushadi
    const timeline = await api().get('/api/v1/explore/timeline');
    const onTimeline = (timeline.body.data.periods ?? timeline.body.data).flatMap((p: { sources: { slug: string }[] }) => slugsOf(p.sources));
    expect(onTimeline).toEqual(expect.arrayContaining(['kitob-buxoro-tarixi', 'kitob-zafarnoma', 'kitob-boburnoma', 'kitob-shajarai-turk']));
    expect(onTimeline).not.toContain('kitob-avesto');

    // Xarita: faqat aniq joyga bog'langan kitob (Buxoro)
    const map = await api().get('/api/v1/explore/map');
    const mapped = map.body.data.features.filter((f: { kind: string }) => f.kind === 'source').map((f: { slug: string }) => f.slug);
    expect(mapped).toContain('kitob-buxoro-tarixi');

    // Umumiy qidiruv: kitob nomi/muallifi va matni, apostrofga e'tiborsiz
    const byAuthor = await api().get('/api/v1/explore/search').query({ q: 'Narshaxiy', types: 'sources' });
    expect(slugsOf(byAuthor.body.data.sources)).toContain('kitob-buxoro-tarixi');
    const book = await prisma.historicalSource.findUniqueOrThrow({ where: { slug: 'kitob-boburnoma' } });
    const text = (await prisma.sourcePage.findFirstOrThrow({ where: { sourceId: book.id, page: 40 } })).text;
    const word = text.split(' ').find((w) => /^[\p{L}]{7,}$/u.test(w))!;
    const byText = await api().get('/api/v1/explore/search').query({ q: word, types: 'sources' });
    expect(slugsOf(byText.body.data.sources)).toContain('kitob-boburnoma');


    // O'quv yo'li: faqat ma'ruza mavzulari (kitoblarda test yo'q)
    const student = await userWithToken('STUDENT');
    const progress = await api().get('/api/v1/progress/me').set(student.auth);
    const path = slugsOf(progress.body.data.topics);
    expect(path.length).toBeGreaterThan(5);
    expect(path.some((s) => s.startsWith('kitob-'))).toBe(false);
  });
});
