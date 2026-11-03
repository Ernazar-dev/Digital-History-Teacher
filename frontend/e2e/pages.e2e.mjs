import puppeteer from 'puppeteer-core';
import { BASE as BASE_URL, CHROME, CREDS as C } from './config.mjs';
const BASE = BASE_URL;
const API = BASE + '/api/v1';
const SHOTS = new Set((process.env.SHOTS ?? '').split(',').filter(Boolean));

const apiLogin = async (username, password) => (await (await fetch(API + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })).json()).data.accessToken;
const get = async (path, t) => (await (await fetch(API + path, { headers: t ? { Authorization: `Bearer ${t}` } : {} })).json()).data;

const S = await apiLogin(...C.student);
const T = await apiLogin(...C.teacher);
const src = (await get('/sources?pageSize=1', S))[0];
const obj = (await get('/virtual-objects/registon-majmuasi-samarqand', S));
const tests = await get('/tests', S);
const test = tests[0];
const lessons = await get('/lessons', S);
const groups = await get('/groups', T);
const port = await get('/portfolios/me', S);
const vresp = await get('/virtual-objects/responses/mine', S);
const me = (await get('/auth/me', S));

const ROUTES = {
  guest: ['/', '/about', '/catalog/sources', `/catalog/sources/${src.slug}`, '/catalog/museum', `/catalog/museum/${obj.slug}`, '/app/methodology', '/login', '/register', '/forgot-password', '/nope'],
  student: ['/app', '/app/sources', `/app/sources/${src.slug}`,
    '/app/museum', `/app/museum/${obj.slug}`, '/app/explore', '/app/methodology', '/app/search?q=Samarqand', '/app/lessons', '/app/lessons/new', lessons[0] && `/app/lessons/${lessons[0].id}`, lessons[0] && `/app/lessons/${lessons[0].id}/edit`,
    '/app/assignments', test && `/app/assignments/${test.id}`, '/app/?tab=yol',
    '/app/portfolio', port.items[0] && `/app/portfolio/items/${port.items[0].id}`, '/app/profile', '/app/admin/users'],
  teacher: ['/app', '/app/groups', groups[0] && `/app/groups/${groups[0].id}`, '/app/assignments', '/app/assignments/new', test && `/app/assignments/${test.id}`, test && `/app/assignments/${test.id}/edit`,
    `/app/progress/students/${me.id}`, `/app/portfolio/students/${me.id}`, vresp[0] && `/app/museum/responses/${vresp[0].id}`, '/app/admin/sources', '/app/admin/sources/new'],
  admin: ['/app', '/app/admin/users', '/app/admin/sources', `/app/admin/sources/${src.id}/edit`, '/app/admin/objects', '/app/admin/objects/new', `/app/admin/objects/${obj.id}/edit`,
    '/app/admin/roles', '/app/admin/taxonomy', '/app/admin/settings', '/app/admin/audit'],
};
const CREDS = C;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const problems = [];
for (const [role, routes] of Object.entries(ROUTES)) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  let current = '';
  page.on('pageerror', (e) => problems.push(`[${role}] ${current} PAGEERROR ${e.message.split('\n')[0]}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|tile.openstreetmap|sketchfab|Download the React DevTools/.test(m.text())) problems.push(`[${role}] ${current} CONSOLE ${m.text().slice(0, 220)}`);
  });
  if (CREDS[role]) {
    await page.goto(BASE + '/login', { waitUntil: 'networkidle0' });
    await page.type('input[autocomplete=username]', CREDS[role][0]);
    await page.type('input[type=password]', CREDS[role][1]);
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('button[type=submit]')]);
  }
  for (const r of routes.filter(Boolean)) {
    current = r;
    await page.goto(BASE + r, { waitUntil: 'networkidle0', timeout: 45000 });
    await new Promise((res) => setTimeout(res, 400));
    const text = await page.evaluate(() => document.body.innerText);
    const flags = [];
    if (text.includes('Sahifani ko‘rsatishda xato')) flags.push('ERROR_BOUNDARY');
    if (text.includes('Ma’lumotlarni yuklab bo‘lmadi')) flags.push('QUERY_ERROR');
    if (text.includes('Ruxsat yo‘q')) flags.push('403');
    if (text.includes('Sahifa topilmadi')) flags.push('404');
    const h1 = await page.evaluate(() => document.querySelector('h2,h1')?.textContent?.slice(0, 60) ?? '');
    console.log(`${role.padEnd(7)} ${r.slice(0, 60).padEnd(62)} ${flags.join(',') || 'ok'} | ${h1}`);
    if (SHOTS.has(`${role}:${r}`)) await page.screenshot({ path: `shot-${role}-${r.replace(/[^a-z0-9]/gi, '_').slice(0, 40)}.png`, fullPage: false });
  }
  await ctx.close();
}
await browser.close();
console.log('\nPROBLEMS:', problems.length);
for (const p of [...new Set(problems)]) console.log(p);
if (problems.length) process.exitCode = 1;
