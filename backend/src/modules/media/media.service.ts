import { randomUUID } from 'node:crypto';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { driverFor, storage } from './storage';

const isZip = (b: Buffer) => b.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));

/** Ruxsat etilgan turlar va ularning "magic bytes" imzolari */
const ALLOWED: Record<string, { ext: string; check: (b: Buffer) => boolean }> = {
  'image/jpeg': { ext: 'jpg', check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { ext: 'png', check: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  'image/webp': { ext: 'webp', check: (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' },
  'image/gif': { ext: 'gif', check: (b) => b.subarray(0, 4).toString() === 'GIF8' },
  'application/pdf': { ext: 'pdf', check: (b) => b.subarray(0, 5).toString() === '%PDF-' },
  'audio/mpeg': { ext: 'mp3', check: (b) => b.subarray(0, 3).toString() === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) },
  'video/mp4': { ext: 'mp4', check: (b) => b.subarray(4, 8).toString() === 'ftyp' },
  // Office hujjatlari ZIP konteyner (PK imzosi bilan boshlanadi)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', check: isZip },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: 'pptx', check: isZip },
};

/** Katalog (manba media va o'quv materiallari) uchun ruxsat etilgan turlar */
export const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'audio/mpeg', 'video/mp4',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

/** Talabaning elektron portfoliosi: hujjat, taqdimot, PDF va rasm */
export const PORTFOLIO_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
];

export const mediaService = {
  async upload(file: Express.Multer.File, userId: string, allowed: string[] = ALLOWED_MIME_TYPES) {
    const spec = allowed.includes(file.mimetype) ? ALLOWED[file.mimetype] : undefined;
    // Mijoz yuborgan MIME turiga ishonmaymiz — fayl mazmuni tekshiriladi
    if (!spec || !spec.check(file.buffer)) {
      throw AppError.badRequest('Fayl turi ruxsat etilmagan yoki fayl mazmuni turiga mos emas');
    }
    const storageKey = `${randomUUID()}.${spec.ext}`;
    await storage.save(storageKey, file.buffer);
    const originalName = file.originalname.replace(/[^\p{L}\p{N}._ -]/gu, '_').slice(0, 200);
    return prisma.mediaFile.create({
      data: { originalName, storageKey, storage: storage.name, mimeType: file.mimetype, size: file.size, uploadedById: userId },
    });
  },

  async getForDownload(id: string) {
    const file = await prisma.mediaFile.findUnique({ where: { id } });
    if (!file) throw AppError.notFound('Fayl topilmadi');
    const stream = await driverFor(file.storage).read(file.storageKey).catch(() => {
      throw AppError.notFound('Fayl saqlash joyida topilmadi');
    });
    return { file, stream };
  },

  async remove(id: string) {
    const file = await prisma.mediaFile.findUnique({ where: { id } });
    if (!file) throw AppError.notFound('Fayl topilmadi');
    await prisma.mediaFile.delete({ where: { id } });
    await driverFor(file.storage).remove(file.storageKey);
  },
};
