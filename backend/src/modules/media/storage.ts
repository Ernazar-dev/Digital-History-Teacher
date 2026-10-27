import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';

/**
 * Storage abstraksiyasi: lokal disk (standart) yoki ma'lumotlar bazasi (STORAGE_DRIVER=database).
 * Keyinchalik S3-compatible drayverni ham shu interfeysni amalga oshirib ulash mumkin.
 */
export interface StorageDriver {
  readonly name: string;
  save(key: string, data: Buffer): Promise<void>;
  read(key: string): Promise<Readable>;
  remove(key: string): Promise<void>;
}

class LocalStorage implements StorageDriver {
  readonly name = 'local';
  private readonly root = path.resolve(process.cwd(), env.UPLOAD_DIR);

  /** Path traversal oldini olish: kalit faqat root ichida bo'lishi shart */
  private resolve(key: string) {
    const safeKey = path.basename(key);
    const full = path.resolve(this.root, safeKey);
    if (!full.startsWith(this.root + path.sep)) throw new Error('Noto‘g‘ri fayl yo‘li');
    return full;
  }

  async save(key: string, data: Buffer) {
    await fs.mkdir(this.root, { recursive: true });
    await fs.writeFile(this.resolve(key), data, { flag: 'wx' });
  }

  async read(key: string) {
    const full = this.resolve(key);
    await fs.access(full);
    return createReadStream(full);
  }

  async remove(key: string) {
    await fs.rm(this.resolve(key), { force: true });
  }
}

/**
 * Fayllar PostgreSQL'da (StoredFile jadvali, bytea). Render free kabi diski vaqtinchalik
 * hostinglarda yuklangan fayllar qayta deploy yoki uyqudan keyin yo'qolmasligi uchun.
 * Prisma klientining generatsiyasiga bog'liq bo'lmasligi uchun xom SQL ishlatiladi.
 */
class DatabaseStorage implements StorageDriver {
  readonly name = 'database';

  async save(key: string, data: Buffer) {
    await prisma.$executeRaw`INSERT INTO "StoredFile" ("key", "data", "size") VALUES (${key}, ${data}, ${data.length})`;
  }

  async read(key: string) {
    const rows = await prisma.$queryRaw<{ data: Buffer }[]>`SELECT "data" FROM "StoredFile" WHERE "key" = ${key}`;
    if (!rows[0]) throw new Error('Fayl topilmadi');
    return Readable.from([Buffer.from(rows[0].data)]);
  }

  async remove(key: string) {
    await prisma.$executeRaw`DELETE FROM "StoredFile" WHERE "key" = ${key}`;
  }
}

const drivers: Record<string, StorageDriver> = { local: new LocalStorage(), database: new DatabaseStorage() };

/** Yangi fayllar shu drayverga yoziladi */
export const storage: StorageDriver = drivers[env.STORAGE_DRIVER];

/** Mavjud fayl o'zi yozilgan drayverdan o'qiladi (MediaFile.storage) — drayver almashsa ham eski fayllar ochiladi */
export const driverFor = (name: string): StorageDriver => drivers[name] ?? storage;
