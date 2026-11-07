/**
 * Kitob PDF'larini sahifa-sahifa rasmga aylantirib, Tesseract (o'zbek kirill modeli) bilan qayta o'qiydi.
 * PDF ichidagi tayyor matn qatlami eski, past sifatli OCR — qayta o'qish xatolarni keskin kamaytiradi.
 * Dev-asbob: natija `material/ocr/<slug>/<bet>.json` ga yoziladi (git'ga kirmaydi), `build-books.mjs` uni o'zi topib ishlatadi.
 *
 * Tayyorlash (loyihadan tashqarida, bir marta):
 *   mkdir ~/ocr-tools && cd ~/ocr-tools && npm i pdfjs-dist@3.11.174 @napi-rs/canvas tesseract.js@5
 * Ishga tushirish (bo'laklarga bo'lib, parallel):
 *   OCR_MODULES=~/ocr-tools node backend/prisma/seed-data/ocr-books.mjs <slug> <bo'lak> <bo'laklar soni>
 * Qayta ishga tushirilsa, tayyor sahifalar o'tkazib yuboriladi.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const material = join(here, '..', '..', '..', 'material');
const require = createRequire(join(resolve(process.env.OCR_MODULES ?? '.'), 'noop.js'));
const nc = require('@napi-rs/canvas');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
const { createWorker } = require('tesseract.js');

globalThis.DOMMatrix = nc.DOMMatrix;
globalThis.Path2D = nc.Path2D;
globalThis.ImageData = nc.ImageData;

/** slug -> PDF fayl nomi (build-books.mjs dagi bilan bir xil) */
const FILES = {
  'kitob-avesto': '1_Авесто_Қадимги_ёзма_ёдгорликлар.pdf',
  'kitob-buxoro-tarixi': '4. Abu Bakr Narshaxiy. Buxoro tarixi 4.pdf',
  'kitob-zafarnoma': '7. Sharafiddin Ali Yazdiy. Zafarnoma 7.pdf',
  'kitob-boburnoma': '8. Zahiriddin Muhammad Bobur. Boburnoma 8).pdf',
  'kitob-shajarai-turk': "9. Abulg'oziy Bahodirxon. Shajarai turk 9.pdf",
};

class Factory {
  create(w, h) {
    const canvas = nc.createCanvas(w, h);
    return { canvas, context: canvas.getContext('2d') };
  }
  reset(c, w, h) {
    c.canvas.width = w;
    c.canvas.height = h;
  }
  destroy(c) {
    c.canvas.width = 0;
    c.canvas.height = 0;
  }
}

const [slug, shardArg = '0', shardsArg = '1'] = process.argv.slice(2);
const shard = Number(shardArg);
const shards = Number(shardsArg);
if (!FILES[slug]) throw new Error(`Noma'lum kitob: ${slug}`);

const out = join(material, 'ocr', slug);
mkdirSync(out, { recursive: true });
const doc = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(join(material, FILES[slug]))), useSystemFonts: true, canvasFactory: new Factory(), disableFontFace: true }).promise;
const worker = await createWorker('uzb_cyrl', 1, { logger: () => {} });

let done = 0;
for (let n = 1 + shard; n <= doc.numPages; n += shards) {
  const target = join(out, `${String(n).padStart(4, '0')}.json`);
  if (existsSync(target)) continue;
  const page = await doc.getPage(n);
  const vp = page.getViewport({ scale: 2.5 });
  const f = new Factory().create(vp.width, vp.height);
  await page.render({ canvasContext: f.context, viewport: vp, canvasFactory: new Factory() }).promise;
  const { data } = await worker.recognize(f.canvas.toBuffer('image/png'));
  // Tesseract ikki ustunni bitta qatorga qo'shib yuboradi — shuning uchun so'zlar o'rni (bbox) ham saqlanadi;
  // ustunlarni ajratish va tartiblash build-books.mjs da (qayta o'qimasdan sozlash mumkin)
  const lines = data.lines.map((l) => ({
    y0: l.bbox.y0,
    y1: l.bbox.y1,
    words: l.words.map((w) => [w.text, w.bbox.x0, w.bbox.x1, Math.round(w.confidence)]),
  }));
  writeFileSync(target, JSON.stringify({ w: f.canvas.width, h: f.canvas.height, lines }));
  page.cleanup();
  done += 1;
}
await worker.terminate();
console.log(`${slug} bo'lak ${shard}/${shards}: ${done} ta sahifa o'qildi`);
