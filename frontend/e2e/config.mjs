/**
 * Brauzer E2E sozlamalari. Ishga tushirishdan oldin: PostgreSQL, backend (npm run dev),
 * frontend (npm run dev) ishlab turishi va seed (demo foydalanuvchilar bilan) bajarilgan bo'lishi kerak.
 */
export const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:5173';
export const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome');
// Login-parollar kodda emas — backend/.env (ADMIN_*, DEMO_*) yoki E2E_* o'zgaruvchilaridan olinadi
const backendEnv = new URL('../../backend/.env', import.meta.url);
try { process.loadEnvFile(backendEnv); } catch { /* fayl bo'lmasa — faqat process.env */ }
const need = (...names) => {
  for (const n of names) if (process.env[n]) return process.env[n].trim();
  throw new Error(`E2E: ${names.join(' yoki ')} o'zgaruvchisi ko'rsatilmagan (backend/.env ga qarang)`);
};
const students = need('E2E_STUDENT_USERNAME', 'DEMO_STUDENT_USERNAMES').split(',').map((s) => s.trim());
export const CREDS = {
  student: [students[0], need('E2E_STUDENT_PASSWORD', 'DEMO_STUDENT_PASSWORD')],
  teacher: [need('E2E_TEACHER_USERNAME', 'DEMO_TEACHER_USERNAME'), need('E2E_TEACHER_PASSWORD', 'DEMO_TEACHER_PASSWORD')],
  admin: [need('E2E_ADMIN_USERNAME', 'ADMIN_USERNAME'), need('E2E_ADMIN_PASSWORD', 'ADMIN_PASSWORD')],
};
