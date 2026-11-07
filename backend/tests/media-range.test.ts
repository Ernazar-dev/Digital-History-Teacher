import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { prisma } from '../src/config/prisma';
import { parseRange } from '../src/modules/media/media.routes';
import { storage } from '../src/modules/media/storage';
import { api } from './helpers';

describe('Media: HTTP Range (video/audio ni surish uchun)', () => {
  it('parseRange: boshi-oxiri, ochiq oxir, oxirgi N bayt, noto‘g‘ri va chegaradan tashqari qiymatlar', () => {
    expect(parseRange('bytes=0-99', 1000)).toEqual([0, 99]);
    expect(parseRange('bytes=500-', 1000)).toEqual([500, 999]);
    expect(parseRange('bytes=-100', 1000)).toEqual([900, 999]);
    expect(parseRange('bytes=900-5000', 1000)).toEqual([900, 999]);
    expect(parseRange('bytes=1000-', 1000)).toBe('invalid');
    expect(parseRange('bytes=50-10', 1000)).toBe('invalid');
    expect(parseRange(undefined, 1000)).toBeNull();
    expect(parseRange('items=0-1', 1000)).toBeNull();
    expect(parseRange('bytes=0-1,5-9', 1000)).toBeNull();
    expect(parseRange('bytes=abc-', 1000)).toBeNull();
  });

  it('fayl: butun javob Accept-Ranges bilan, bo‘lak so‘ralsa 206 va aynan shu baytlar, chegaradan tashqari — 416', async () => {
    const data = Buffer.from(Array.from({ length: 5000 }, (_, i) => i % 251));
    const storageKey = `${randomUUID()}.mp4`;
    await storage.save(storageKey, data);
    const file = await prisma.mediaFile.create({
      data: { originalName: 'sinov.mp4', storageKey, storage: storage.name, mimeType: 'video/mp4', size: data.length },
    });
    const get = (range?: string) => {
      const req = api().get(`/api/v1/media/${file.id}`).buffer(true).parse((r, cb) => {
        const chunks: Buffer[] = [];
        r.on('data', (c: Buffer) => chunks.push(c));
        r.on('end', () => cb(null, Buffer.concat(chunks)));
      });
      return range ? req.set('Range', range) : req;
    };

    const full = await get();
    expect(full.status).toBe(200);
    expect(full.headers['accept-ranges']).toBe('bytes');
    expect(Number(full.headers['content-length'])).toBe(5000);
    expect((full.body as Buffer).equals(data)).toBe(true);

    const part = await get('bytes=1200-2399');
    expect(part.status).toBe(206);
    expect(part.headers['content-range']).toBe('bytes 1200-2399/5000');
    expect(Number(part.headers['content-length'])).toBe(1200);
    expect((part.body as Buffer).equals(data.subarray(1200, 2400))).toBe(true);

    const tail = await get('bytes=-300');
    expect(tail.status).toBe(206);
    expect((tail.body as Buffer).equals(data.subarray(4700))).toBe(true);

    const bad = await api().get(`/api/v1/media/${file.id}`).set('Range', 'bytes=9000-');
    expect(bad.status).toBe(416);
    expect(bad.headers['content-range']).toBe('bytes */5000');
  });
});
