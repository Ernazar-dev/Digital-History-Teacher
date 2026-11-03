import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/config/prisma';
import { seedLectures } from '../prisma/seed-lectures';
import { seedTopicObjects } from '../prisma/seed-objects';
import { OBJECTS_D, TOPIC_OBJECTS } from '../prisma/seed-data/objects-d';
import { api } from './helpers';

/** Avval seed.ts orqali yaratiladigan obyektlar (OBJECTS_A/B/C) */
const EXISTING = [
  'registon-majmuasi-samarqand', 'gur-amir-maqbarasi', 'bibixonim-masjidi', 'ulugbek-rasadxonasi-sekstanti', 'oqsaroy-shahrisabz',
  'hazrati-imom-majmuasi-shahrisabz', 'tillakori-madrasasi-namozxonasi', 'xiva-ichan-qala-360', 'buxoro-tarixiy-markazi-360-demo',
];

describe('mavzularga biriktirilgan 3D / 360° obyektlar', () => {
  afterAll(async () => {
    // Boshqa testlar obyektlar sonini sanamasligi uchun yaratilganlar o'chiriladi (bog'lanishlar cascade bilan ketadi)
    await prisma.virtualObject.deleteMany({ where: { slug: { in: OBJECTS_D.map((o) => o.slug) } } });
  });

  it('ma’lumotlar yaxlit: slug’lar noyob, biriktirishdagi har bir slug mavjud obyektga ishora qiladi', () => {
    const slugs = OBJECTS_D.map((o) => o.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const known = new Set([...slugs, ...EXISTING]);
    for (const [topic, objects] of Object.entries(TOPIC_OBJECTS)) {
      for (const s of objects) expect(known.has(s), `${topic} → ${s}`).toBe(true);
    }
    for (const o of OBJECTS_D) {
      expect(o.embedUrl, o.slug).toMatch(/^https:\/\/(sketchfab\.com\/models\/[0-9a-f]{32}\/embed|uzbekistan360\.uz\/ru\?city=\d+)$/);
    }
  });

  it('obyektlar yaratiladi, mavzularga biriktiriladi, takroran ishga tushganda ko‘paymaydi va talabaga ko‘rinadi', async () => {
    await seedLectures(prisma, null);
    const first = await seedTopicObjects(prisma, null);
    expect(first.created).toBe(OBJECTS_D.length);
    expect(first.linked).toBeGreaterThan(0);

    const second = await seedTopicObjects(prisma, null);
    expect(second).toEqual({ created: 0, updated: 0, linked: 0 });

    const res = await api().get('/api/v1/sources/xiva-xonligi');
    expect(res.status).toBe(200);
    const objects = res.body.data.virtualObjects as { slug: string }[];
    expect(objects.map((o) => o.slug)).toEqual(expect.arrayContaining(['kalta-minor-xiva', 'ota-darvoza-xiva', 'islomxoja-minorasi-xiva']));
  });
});
