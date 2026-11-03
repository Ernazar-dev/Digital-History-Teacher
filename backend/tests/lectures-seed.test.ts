import { describe, expect, it } from 'vitest';
import { prisma } from '../src/config/prisma';
import { storage } from '../src/modules/media/storage';
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
    const customKey = `custom-${one.id}.pdf`;
    await storage.save(customKey, Buffer.from('%PDF-1.4'));
    const custom = await prisma.mediaFile.create({
      data: { originalName: 'admin.pdf', storageKey: customKey, storage: storage.name, mimeType: 'application/pdf', size: 8 },
    });
    await prisma.historicalSource.update({ where: { id: one.id }, data: { lectureFileId: custom.id } });
    await seedLectures(prisma, null);
    expect((await prisma.historicalSource.findUnique({ where: { id: one.id } }))?.lectureFileId).toBe(custom.id);
    await storage.remove(customKey);
  });

  it('fayl yozuvi bor-u, mazmuni saqlash joyida yo‘qolgan bo‘lsa — seed faylni qayta biriktiradi', async () => {
    await seedLectures(prisma, null);
    const one = await prisma.historicalSource.findUniqueOrThrow({ where: { slug: LECTURES[0].slug }, include: { lectureFile: true } });
    await storage.remove(one.lectureFile!.storageKey);
    expect((await api().get(`/api/v1/media/${one.lectureFileId}`)).status).toBe(404);

    await seedLectures(prisma, null);
    const fixed = await prisma.historicalSource.findUniqueOrThrow({ where: { id: one.id } });
    expect(fixed.lectureFileId).not.toBe(one.lectureFileId);
    expect((await api().get(`/api/v1/media/${fixed.lectureFileId}`)).status).toBe(200);
  });

  it('ma’ruza yangilanganda avvalgi seed nusxasi almashtiriladi, administrator fayli esa saqlanadi', async () => {
    await seedLectures(prisma, null);
    const [a, b] = await prisma.historicalSource.findMany({
      where: { slug: { in: [LECTURES[0].slug, LECTURES[1].slug] } },
      include: { lectureFile: true },
      orderBy: { sortOrder: 'asc' },
    });

    // a — eski seed nusxasi: nomi seed nomi bilan bir xil, mazmuni esa tayyor Word fayldan farq qiladi
    await storage.remove(a.lectureFile!.storageKey);
    await storage.save(a.lectureFile!.storageKey, Buffer.from('PK old version'));
    // b — administrator fayli: boshqa nom, mazmuni ham boshqa
    const customKey = `admin-${b.id}.docx`;
    await storage.save(customKey, Buffer.from('PK admin version'));
    const custom = await prisma.mediaFile.create({
      data: { originalName: 'Mening ma’ruzam.docx', storageKey: customKey, storage: storage.name, mimeType: a.lectureFile!.mimeType, size: 16 },
    });
    await prisma.historicalSource.update({ where: { id: b.id }, data: { lectureFileId: custom.id } });

    await seedLectures(prisma, null);

    const after = await prisma.historicalSource.findUniqueOrThrow({ where: { id: a.id } });
    expect(after.lectureFileId).not.toBe(a.lectureFileId);
    expect(await prisma.mediaFile.findUnique({ where: { id: a.lectureFileId! } })).toBeNull();
    expect((await api().get(`/api/v1/media/${after.lectureFileId}`)).status).toBe(200);
    expect((await prisma.historicalSource.findUniqueOrThrow({ where: { id: b.id } })).lectureFileId).toBe(custom.id);
    await storage.remove(customKey);
  });
});
