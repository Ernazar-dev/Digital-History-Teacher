import type { AssignmentType } from '@prisma/client';
import { z } from 'zod';
import { AppError } from '../../shared/errors/AppError';

/**
 * 6-modul «raqamli simulyator»: hujjatdagi «tarixiy voqealarni xronologik tartibga solish» va
 * «xaritada tarixiy voqealarni belgilash» topshiriqlari interaktiv bajariladi va avtomatik tekshiriladi.
 * Avtomatik natija o'qituvchiga tavsiya — yakuniy bahoni o'qituvchi mezonlar asosida qo'yadi.
 */

const itemId = z.string().trim().min(1).max(40);

export const chronologySimulatorSchema = z.object({
  kind: z.literal('CHRONOLOGY'),
  events: z
    .array(z.object({ id: itemId, text: z.string().trim().min(2).max(500), year: z.number().int().min(-5000).max(2100) }))
    .min(3, 'Kamida 3 ta voqea kiriting')
    .max(20),
});

export const mapSimulatorSchema = z.object({
  kind: z.literal('MAP'),
  toleranceKm: z.number().min(1).max(1000).default(50),
  places: z
    .array(z.object({ id: itemId, label: z.string().trim().min(2).max(300), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }))
    .min(2, 'Kamida 2 ta joy kiriting')
    .max(20),
});

export const simulatorSchema = z
  .discriminatedUnion('kind', [chronologySimulatorSchema, mapSimulatorSchema])
  .superRefine((s, ctx) => {
    const ids = s.kind === 'CHRONOLOGY' ? s.events.map((e) => e.id) : s.places.map((p) => p.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', message: 'Element identifikatorlari takrorlanmasligi kerak' });
  });

export type Simulator = z.infer<typeof simulatorSchema>;

export const simulatorAnswerSchema = z.union([
  z.object({ order: z.array(itemId).max(20) }),
  z.object({ placements: z.record(itemId, z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })) }),
]);
export type SimulatorAnswer = z.infer<typeof simulatorAnswerSchema>;

/** Simulyator topshiriq turiga mos bo'lishi kerak */
export const assertSimulatorType = (type: AssignmentType | undefined, simulator: Simulator | null | undefined) => {
  if (!simulator || !type) return;
  const expected = simulator.kind === 'CHRONOLOGY' ? 'CHRONOLOGY' : 'MAP_IDENTIFICATION';
  if (type !== expected) {
    throw AppError.badRequest(
      simulator.kind === 'CHRONOLOGY'
        ? 'Xronologiya simulyatori faqat «Xronologik tartib» turidagi topshiriqqa biriktiriladi'
        : 'Xarita simulyatori faqat «Xaritada belgilash» turidagi topshiriqqa biriktiriladi',
    );
  }
};

/** FNV-1a — o'xshash identifikatorlar (e1, e2, ...) uchun ham yaxshi aralashtiradi */
const hash = (s: string) => {
  let h = 0x811c9dc5;
  for (const c of `dht:${s}`) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0;
  return h;
};

/**
 * Barqaror aralashtirish (har safar bir xil tartib). Natija tasodifan to'g'ri xronologik tartibga
 * mos kelib qolsa, bir pog'ona siljitiladi — talabaga hech qachon tayyor javob ko'rsatilmaydi.
 */
const shuffledEvents = <T extends { id: string; year: number }>(items: T[]) => {
  const mixed = [...items].sort((a, b) => hash(a.id) - hash(b.id) || a.id.localeCompare(b.id));
  const solved = [...items].sort((a, b) => a.year - b.year);
  return mixed.every((e, i) => e.year === solved[i].year) ? [...mixed.slice(1), mixed[0]] : mixed;
};

/** Talabaga to'g'ri javoblarsiz ko'rinish: yillar va koordinatalar yashiriladi */
export const publicSimulator = (raw: unknown) => {
  const parsed = simulatorSchema.safeParse(raw);
  if (!parsed.success) return null;
  const s = parsed.data;
  if (s.kind === 'CHRONOLOGY') return { kind: s.kind, events: shuffledEvents(s.events).map(({ id, text }) => ({ id, text })) };
  return { kind: s.kind, toleranceKm: s.toleranceKm, places: s.places.map(({ id, label }) => ({ id, label })) };
};

const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/** Javob to'liqligi: barcha voqealar tartiblangan / barcha joylar xaritaga qo'yilgan */
export const missingInAnswer = (s: Simulator, answer: SimulatorAnswer | null | undefined): string[] => {
  if (s.kind === 'CHRONOLOGY') {
    const order = answer && 'order' in answer ? answer.order : [];
    const ids = new Set(s.events.map((e) => e.id));
    if (order.length !== ids.size || order.some((id) => !ids.has(id)) || new Set(order).size !== order.length) {
      return ['Barcha voqealarni xronologik tartibga joylashtiring'];
    }
    return [];
  }
  const placed = answer && 'placements' in answer ? answer.placements : {};
  return s.places.filter((p) => !placed[p.id]).map((p) => `«${p.label}» xaritaga qo‘yilmagan`);
};

/**
 * Avtomatik tekshiruv.
 * Xronologiya: voqea to'g'ri o'rinda turganmi (bir xil yildagi voqealar o'zaro almashinishi mumkin).
 * Xarita: qo'yilgan nuqta haqiqiy joydan ruxsat etilgan masofadan (toleranceKm) uzoq emasmi.
 */
export const gradeSimulator = (s: Simulator, answer: SimulatorAnswer) => {
  if (s.kind === 'CHRONOLOGY') {
    const order = 'order' in answer ? answer.order : [];
    const sortedYears = s.events.map((e) => e.year).sort((a, b) => a - b);
    const byId = new Map(s.events.map((e) => [e.id, e]));
    const details = order.map((id, i) => {
      const e = byId.get(id)!;
      return { id, text: e.text, year: e.year, position: i + 1, correct: e.year === sortedYears[i] };
    });
    const correct = details.filter((d) => d.correct).length;
    return { score: Math.round((correct / s.events.length) * 1000) / 10, correct, total: s.events.length, details };
  }
  const placed = 'placements' in answer ? answer.placements : {};
  const details = s.places.map((p) => {
    const at = placed[p.id];
    const km = at ? Math.round(distanceKm(p, at) * 10) / 10 : null;
    return { id: p.id, label: p.label, lat: p.lat, lng: p.lng, placed: at ?? null, distanceKm: km, correct: km !== null && km <= s.toleranceKm };
  });
  const correct = details.filter((d) => d.correct).length;
  return { score: Math.round((correct / s.places.length) * 1000) / 10, correct, total: s.places.length, toleranceKm: s.toleranceKm, details };
};
