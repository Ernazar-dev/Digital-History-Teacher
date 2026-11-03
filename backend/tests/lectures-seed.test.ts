import { describe, expect, it } from 'vitest';
import { prisma } from '../src/config/prisma';
import { seedLectures } from '../prisma/seed-lectures';
import { LECTURES } from '../prisma/seed-data/lectures';
import { api } from './helpers';

describe('13 ta ma’ruza mavzusi (seed)', () => {
  it('har bir mavzuga Word fayli biriktiriladi, qayta ishga tushganda takrorlanmaydi va admin fayli saqlanadi', async () => {
    await seedLectures(prisma, null);
    const topics = await prisma.historicalSource.findMany({
      where: { slug: { in: LECTURES.map((l) => l.slug) } },
      include: { lectureFile: true },
    });
    expect(topics).toHaveLength(LECTURES.length);
    for (const t of topics) {
      expect(t.lectureFile?.mimeType).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(t.lectureFile?.originalName.endsWith('.docx')).toBe(true);
    }

    // Fayl haqiqatan saqlangan va yuklab olinadi (DOCX — ZIP imzosi «PK»)
    const one = topics[0];
    const res = await api().get(`/api/v1/media/${one.lectureFileId}`).buffer(true).parse((r, cb) => {
      const chunks: Buffer[] = [];
      r.on('data', (c: Buffer) => chunks.push(c));
      r.on('end', () => cb(null, Buffer.concat(chunks)));
    });
    expect(res.status).toBe(200);
    expect((res.body as Buffer).subarray(0, 2).toString()).toBe('PK');

    // Qayta ishga tushirish: yangi fayl qo'shilmaydi
    const before = await prisma.mediaFile.count();
    await seedLectures(prisma, null);
    expect(await prisma.mediaFile.count()).toBe(before);

    // Administrator boshqa fayl yuklagan bo'lsa — seed uni almashtirmaydi
    const custom = await prisma.mediaFile.create({
      data: { originalName: 'admin.pdf', storageKey: `custom-${one.id}.pdf`, mimeType: 'application/pdf', size: 1 },
    });
    await prisma.historicalSource.update({ where: { id: one.id }, data: { lectureFileId: custom.id } });
    await seedLectures(prisma, null);
    expect((await prisma.historicalSource.findUnique({ where: { id: one.id } }))?.lectureFileId).toBe(custom.id);
  });
});
