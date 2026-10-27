import { execSync } from 'node:child_process';
import { config } from 'dotenv';

/** Test bazasini toza holatga keltiradi va migratsiyalarni qo'llaydi */
export default function setup() {
  config();
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('TEST_DATABASE_URL .env faylida ko‘rsatilmagan');
  if (url === process.env.DATABASE_URL) throw new Error('Test bazasi asosiy baza bilan bir xil bo‘lmasligi kerak');
  execSync('npx prisma migrate reset --force --skip-seed --skip-generate', {
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: url, PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'yes' },
  });
}
