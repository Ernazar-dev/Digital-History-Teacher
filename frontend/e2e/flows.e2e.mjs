import puppeteer from 'puppeteer-core';
import { BASE as BASE_URL, CHROME, CREDS } from './config.mjs';
const BASE = BASE_URL;
const b = await puppeteer.launch({ executablePath: CHROME, headless: true });
const errors = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const newPage = async (w = 1366, h = 900) => {
  const ctx = await b.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: w, height: h });
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && !/sketchfab|openstreetmap/.test(m.text()) && errors.push(m.text()));
  return p;
};
const click = async (p, text) => { const ok = await p.evaluate((t) => { const el = [...document.querySelectorAll('button, .ant-steps-item-title')].find((e) => e.innerText.trim() === t); if (el) { el.click(); return true; } return false; }, text); if (!ok) throw new Error('Tugma topilmadi: ' + text); };
const bodyText = (p) => p.evaluate(() => document.body.innerText);
let failed = 0;
const ok = (cond, msg) => { if (!cond) failed += 1; console.log(cond ? '✔' : '✘', msg); };
const login = async (p, username, pw) => {
  await p.goto(BASE + '/login', { waitUntil: 'networkidle0' });
  await p.type('input[autocomplete=username]', username);
  await p.type('input[type=password]', pw);
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle0' }), p.click('button[type=submit]')]);
};

// A) Ro'yxatdan o'tish (UI) va kirish
{
  const p = await newPage();
  const username = `ui-${Date.now()}`;
  await p.goto(BASE + '/register', { waitUntil: 'networkidle0' });
  await p.type('input[autocomplete=name]', 'UI Sinov Talaba');
  await p.type('input[autocomplete=username]', username);
  const pw = await p.$('input[type=password]');
  await pw.type('qisqa');
  await p.click('button[type=submit]'); await sleep(500);
  ok((await bodyText(p)).includes('kamida 8 belgi'), 'ro‘yxat: qisqa parol Zod orqali rad etildi');
  await pw.click({ clickCount: 3 }); await pw.type('UiParol123');
  // Guruhlar mavjud bo'lsa — talaba guruhini tanlashi shart
  if (await p.$('#groupId')) {
    await p.click('button[type=submit]'); await sleep(500);
    ok((await bodyText(p)).includes('Guruhingizni tanlang'), 'ro‘yxat: guruh tanlanmasa rad etildi');
    await p.click('#groupId'); await sleep(300);
    await p.click('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option'); await sleep(200);
  }
  await p.click('button[type=submit]'); await sleep(2000);
  // Faol talaba ro'yxatdan o'tishi bilan kabinetga kiradi
  ok(p.url().endsWith('/app'), 'ro‘yxat: muvaffaqiyatli, yangi talaba kabinetga kirdi');

  // B) Dars konstruktori: saqlash -> versiya
  await p.goto(BASE + '/app/lessons/new', { waitUntil: 'networkidle0' });
  await p.waitForSelector('#title', { timeout: 15000 }).catch(async () => { await p.screenshot({ path: 'fail-constructor.png' }); console.log('URL', p.url(), (await bodyText(p)).slice(0, 300)); throw new Error('#title yo‘q'); });
  await p.type('#title', 'UI orqali yaratilgan dars');
  await p.type('#topic', 'Temuriylar me’morchiligi');
  await click(p, 'Saqlash'); await sleep(1500); await sleep(400);
  ok(/\/app\/lessons\/[0-9a-f-]+\/edit$/.test(p.url()), `dars saqlandi, tahrir sahifasiga o‘tdi`);
  await click(p, 'Bosqichlar va vaqt'); await sleep(200);
  await click(p, 'Bosqich qo‘shish'); await sleep(200);
  await p.waitForSelector('[id="stages.0.title"]', { timeout: 10000 });
  await p.type('[id="stages.0.title"]', 'Kirish');
  await click(p, 'Saqlash'); await sleep(1500); await sleep(400);
  ok((await bodyText(p)).includes('2-versiya'), 'ikkinchi saqlash — 2-versiya yaratildi');

  // C) Mavzu sahifasi: uch qism (ma'ruza, taqdimot, video) ko'rinadi
  const first = (await (await fetch(BASE + '/api/v1/sources?pageSize=1&sort=order')).json()).data[0];
  await p.goto(BASE + '/app/sources/' + first.slug, { waitUntil: 'networkidle0' });
  const topicText = await bodyText(p);
  ok(['Ma’ruza', 'Taqdimot', 'Video rolik'].every((t) => topicText.includes(t)), 'mavzu sahifasida ma’ruza, taqdimot va video qismlari bor');

  // D) 3D model lazy yuklash
  await p.goto(BASE + '/app/museum/bibixonim-masjidi', { waitUntil: 'networkidle0' });
  ok((await p.$('iframe')) === null, '3D: sahifa ochilganda iframe yuklanmagan');
  await click(p, '3D modelni yuklash'); await sleep(500);
  const src = await p.$eval('iframe', (e) => e.getAttribute('src'));
  ok(src === 'https://sketchfab.com/models/c830abac7e854e22b51b13b807f0c912/embed', '3D: bosilganda Sketchfab iframe yuklandi');
}

// E) O'qituvchi: topshiriqlar (testlar) sahifasi
{
  const p = await newPage();
  await login(p, ...CREDS.teacher);
  await p.goto(BASE + '/app/assignments', { waitUntil: 'networkidle0' });
  ok((await bodyText(p)).includes('Test yuklash'), 'o‘qituvchi: test yuklash tugmasi bor');
}

// F) Mobil ko'rinish
{
  const p = await newPage(390, 844);
  await login(p, ...CREDS.student);
  
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(overflow <= 1, `mobil: gorizontal scroll yo‘q (ortiqcha ${overflow}px)`);
  const menuBtn = await p.waitForSelector('[aria-label="Menyuni ochish"]', { timeout: 15000 }).catch(() => null);
  ok(menuBtn !== null, 'mobil: menyu tugmasi (drawer) bor');
  await p.goto(BASE + '/', { waitUntil: 'networkidle0' });
  const o2 = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(o2 <= 1, `mobil landing: gorizontal scroll yo‘q (${o2}px)`);
}
await b.close();
console.log('\nBrauzer xatolari:', errors.length ? errors : 'yo‘q');
if (failed || errors.length) process.exitCode = 1;
