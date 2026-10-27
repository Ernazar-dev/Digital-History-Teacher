import { randomUUID } from 'node:crypto';
import type { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { driverFor } from '../src/modules/media/storage';

const readAll = async (s: Readable) => {
  const chunks: Buffer[] = [];
  for await (const c of s) chunks.push(Buffer.from(c));
  return Buffer.concat(chunks);
};

describe('Fayl saqlash drayverlari', () => {
  it('database drayveri: yozish → o‘qish → o‘chirish (Render free uchun)', async () => {
    const db = driverFor('database');
    expect(db.name).toBe('database');
    const key = `${randomUUID()}.png`;
    const data = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff, 0x10, 0x20]);
    await db.save(key, data);
    expect((await readAll(await db.read(key))).equals(data)).toBe(true);
    // Bir xil kalit ikkinchi marta yozilmaydi (lokal diskdagi 'wx' kabi)
    await expect(db.save(key, data)).rejects.toThrow();
    await db.remove(key);
    await expect(db.read(key)).rejects.toThrow();
  });

  it('noma’lum drayver nomi uchun joriy drayver qaytariladi', () => {
    expect(['local', 'database']).toContain(driverFor('s3').name);
  });
});
