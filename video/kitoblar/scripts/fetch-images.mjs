// Commons'dan rasmlarni yuklaydi (<= 1280 px) va mualliflik ma'lumotini src/books/<slug>.credits.json ga yozadi.
// Ishlatish: node scripts/fetch-images.mjs <slug>   (ro'yxat: scripts/images/<slug>.json { "fayl-nomi": "Commons sarlavhasi" })
// Wikimedia so'rovlar sonini cheklaydi (429) — shuning uchun so'rovlar orasida pauza va qayta urinish bor; tayyor rasmlar o'tkazib yuboriladi.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';

const slug = process.argv[2];
const wanted = JSON.parse(readFileSync(new URL(`./images/${slug}.json`, import.meta.url), 'utf8'));
const out = `public/images/${slug}`;
mkdirSync(out, { recursive: true });
const UA = { 'User-Agent': 'DHT-video/1.0 (educational project)' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (h = '') => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

const api = async (params) => {
  for (let a = 0; a < 8; a++) {
    const res = await fetch('https://commons.wikimedia.org/w/api.php?format=json&action=query&' + params, { headers: UA });
    if (res.ok) return res.json();
    await sleep(15000 * (a + 1));
  }
  throw new Error('API javob bermadi');
};

const credits = existsSync(`src/books/${slug}.credits.json`) ? JSON.parse(readFileSync(`src/books/${slug}.credits.json`, 'utf8')) : {};
for (const [name, title] of Object.entries(wanted)) {
  const file = `${out}/${name}.jpg`;
  const full = title.startsWith('File:') ? title : `File:${title}`;
  const r = await api(`prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1280&titles=${encodeURIComponent(full)}`);
  const info = Object.values(r.query.pages)[0]?.imageinfo?.[0];
  if (!info) { console.log('TOPILMADI:', name, title); continue; }
  if (!(existsSync(file) && statSync(file).size > 10000)) {
    let buf = Buffer.alloc(0);
    for (let a = 0; a < 7 && buf.length < 10000; a++) {
      if (a) await sleep(15000 * a);
      const res = await fetch(info.thumburl, { headers: UA });
      if (res.ok) buf = Buffer.from(await res.arrayBuffer());
    }
    if (buf.length < 10000) { console.log('YUKLANMADI:', name); continue; }
    writeFileSync(file, buf);
    console.log(name, (buf.length / 1024).toFixed(0) + ' KB');
    await sleep(4000);
  }
  const m = info.extmetadata ?? {};
  credits[name] = { license: strip(m.LicenseShortName?.value), artist: strip(m.Artist?.value).slice(0, 70), page: info.descriptionurl };
  writeFileSync(`src/books/${slug}.credits.json`, JSON.stringify(credits, null, 2));
}
console.log(slug, 'tayyor');
