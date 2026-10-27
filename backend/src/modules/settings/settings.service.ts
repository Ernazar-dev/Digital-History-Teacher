import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

/** Tizim sozlamalari va ularning standart qiymatlari */
export const SETTING_DEFAULTS = {
  'platform.name': 'Digital History Teacher',
  'platform.fullName':
    'Raqamli tarixiy manbalar asosida bo‘lajak tarix fani o‘qituvchilarining metodik kompetensiyasini rivojlantirish elektron ta’lim platformasi',
  'platform.description':
    'Bo‘lajak tarix o‘qituvchilari uchun raqamli tarixiy manbalarni izlash, tanqidiy tahlil qilish va ular asosida dars loyihalash muhiti.',
  'platform.logoUrl': '',
  'platform.institution': '',
  'auth.studentAutoApprove': true,
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type SettingsMap = { -readonly [K in SettingKey]: (typeof SETTING_DEFAULTS)[K] extends boolean ? boolean : string };

const PUBLIC_KEYS: SettingKey[] = [
  'platform.name',
  'platform.fullName',
  'platform.description',
  'platform.logoUrl',
  'platform.institution',
];

export const settingsService = {
  async getAll(): Promise<SettingsMap> {
    const rows = await prisma.systemSetting.findMany();
    const result = { ...SETTING_DEFAULTS } as unknown as SettingsMap;
    for (const row of rows) {
      if (row.key in SETTING_DEFAULTS) {
        (result as Record<string, unknown>)[row.key] = row.value;
      }
    }
    return result;
  },

  async getPublic() {
    const all = await this.getAll();
    return Object.fromEntries(PUBLIC_KEYS.map((k) => [k, all[k]]));
  },

  async get<K extends SettingKey>(key: K): Promise<SettingsMap[K]> {
    const all = await this.getAll();
    return all[key];
  },

  async update(values: Partial<SettingsMap>) {
    const entries = Object.entries(values).filter(([k]) => k in SETTING_DEFAULTS);
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.systemSetting.upsert({
          where: { key },
          create: { key, value: value as Prisma.InputJsonValue },
          update: { value: value as Prisma.InputJsonValue },
        }),
      ),
    );
    return this.getAll();
  },
};
