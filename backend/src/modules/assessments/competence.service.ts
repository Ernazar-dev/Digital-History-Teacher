import type { AssessmentStage, AssessorRole, EvidenceKind, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

type Db = Prisma.TransactionClient | typeof prisma;

export interface EvidenceInput {
  studentId: string;
  componentId: string;
  stage?: AssessmentStage;
  evidenceKind: EvidenceKind;
  assessorRole: AssessorRole;
  assessorId?: string | null;
  score: number;
  note?: string | null;
  refType?: string | null;
  refId?: string | null;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n * 10) / 10));

/**
 * Kompetensiya dalilini yozadi. Bir ish uchun qayta baholanganda (refType+refId+komponent+baholovchi roli)
 * eski yozuv almashtiriladi — ma'lumot takrorlanmaydi.
 */
export const recordEvidence = async (input: EvidenceInput, db: Db = prisma) => {
  if (input.refType && input.refId) {
    await db.competenceRecord.deleteMany({
      where: {
        studentId: input.studentId,
        componentId: input.componentId,
        refType: input.refType,
        refId: input.refId,
        assessorRole: input.assessorRole,
      },
    });
  }
  return db.competenceRecord.create({ data: { ...input, score: clamp(input.score) } });
};

export const getConfig = async () => {
  const [components, levels] = await Promise.all([
    prisma.assessmentComponent.findMany({ orderBy: { sortOrder: 'asc' }, include: { evidenceWeights: true } }),
    prisma.assessmentLevel.findMany({ orderBy: { minPercent: 'asc' } }),
  ]);
  return { components, levels };
};

export const levelFor = (
  percent: number | null,
  levels: { code: string; name: string; minPercent: number; maxPercent: number }[],
) => {
  if (percent === null) return null;
  // Ball quyi chegarasi u yoki bu darajaga yetgan eng yuqori daraja tanlanadi (oraliqlarda bo'shliq qolmaydi)
  const level = [...levels].sort((a, b) => b.minPercent - a.minPercent).find((l) => percent >= l.minPercent);
  return level ? { code: level.code, name: level.name } : null;
};

type RecordRow = Prisma.CompetenceRecordGetPayload<{
  include: { assessor: { select: { id: true; fullName: true } } };
}>;

/**
 * Talabaning kompetensiya profili.
 * Komponent bali = Σ(dalil turi vazni × shu turdagi o'rtacha ball) / Σ(mavjud turlar vazni).
 * Umumiy ko'rsatkich = komponentlar vazni bo'yicha o'rtacha.
 * Har bir natija qaysi yozuvlar asosida hisoblangani qaytariladi (shaffoflik).
 */
export const computeProfile = async (studentId: string, stage?: AssessmentStage) => {
  const { components, levels } = await getConfig();
  const records: RecordRow[] = await prisma.competenceRecord.findMany({
    where: { studentId, ...(stage ? { stage } : {}) },
    include: { assessor: { select: { id: true, fullName: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const componentResults = components.map((component) => {
    const own = records.filter((r) => r.componentId === component.id);
    const byKind = new Map<EvidenceKind, RecordRow[]>();
    for (const r of own) byKind.set(r.evidenceKind, [...(byKind.get(r.evidenceKind) ?? []), r]);

    let weighted = 0;
    let weightSum = 0;
    const evidence = [...byKind.entries()].map(([kind, rows]) => {
      const avg = rows.reduce((s, r) => s + r.score, 0) / rows.length;
      const configured = component.evidenceWeights.find((w) => w.evidenceKind === kind);
      const weight = configured?.weight ?? 1;
      weighted += avg * weight;
      weightSum += weight;
      return {
        kind,
        average: clamp(avg),
        weight,
        weightConfigured: Boolean(configured),
        count: rows.length,
        records: rows.map((r) => ({
          id: r.id, score: r.score, stage: r.stage, assessorRole: r.assessorRole,
          assessor: r.assessor, note: r.note, details: r.details, refType: r.refType, refId: r.refId, createdAt: r.createdAt,
        })),
      };
    });
    const score = weightSum > 0 ? clamp(weighted / weightSum) : null;
    return {
      componentId: component.id,
      code: component.code,
      name: component.name,
      weight: component.weight,
      score,
      level: levelFor(score, levels),
      evidenceKinds: evidence.length,
      evidence,
    };
  });

  const scored = componentResults.filter((c) => c.score !== null);
  const totalWeight = scored.reduce((s, c) => s + c.weight, 0);
  const overall = totalWeight > 0 ? clamp(scored.reduce((s, c) => s + (c.score as number) * c.weight, 0) / totalWeight) : null;

  const warnings: string[] = [];
  if (scored.length < components.length) {
    warnings.push('Ayrim komponentlar bo‘yicha dalillar yo‘q — umumiy xulosa to‘liq emas.');
  }
  if (componentResults.some((c) => c.evidenceKinds === 1)) {
    warnings.push('Ayrim komponentlar faqat bitta turdagi dalilga asoslangan (masalan, faqat test). Amaliy ishlar, dars ishlanmalari va refleksiya ham hisobga olinishi kerak.');
  }

  return {
    stage: stage ?? 'ALL',
    overall,
    overallLevel: levelFor(overall, levels),
    components: componentResults,
    recordCount: records.length,
    warnings,
    disclaimer:
      'Natijalar sozlanadigan dastlabki vaznlar asosida avtomatik hisoblangan. Ular pedagogik eksperiment samaradorligining isboti emas — tadqiqotchi tahlili uchun ma’lumot.',
  };
};

/** Komponent kodini ID ga aylantiradi (kod admin tomonidan o'chirilgan bo'lsa — null) */
export const componentIdByCode = async (code: string, db: Db = prisma) => {
  const component = await db.assessmentComponent.findUnique({ where: { code }, select: { id: true } });
  return component?.id ?? null;
};

/** Hujjatdagi to'rt komponent kodlari */
export const COMPONENT = {
  MOTIVATIONAL: 'MOTIVATIONAL',
  COGNITIVE: 'COGNITIVE',
  ACTIVITY: 'ACTIVITY',
  REFLECTIVE: 'REFLECTIVE',
} as const;
