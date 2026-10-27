import { randomUUID } from 'node:crypto';
import type { AssessmentStage, Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { assertCanAccessStudent } from '../../shared/utils/access';
import type {
  componentSchema, criterionSchema, expertRecordSchema, indicatorRatingSchema, indicatorSchema, levelsSchema,
  updateComponentSchema, weightsSchema,
} from './assessments.schemas';
import { INDICATOR_POINTS } from './assessments.schemas';
import { computeProfile, getConfig } from './competence.service';

const STAGES: AssessmentStage[] = ['INITIAL', 'INTERMEDIATE', 'FINAL', 'ONGOING'];

export const assessmentsService = {
  async config() {
    const [components, levels] = await Promise.all([
      prisma.assessmentComponent.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          evidenceWeights: true,
          criteria: { orderBy: { sortOrder: 'asc' }, include: { indicators: { orderBy: { sortOrder: 'asc' } } } },
        },
      }),
      prisma.assessmentLevel.findMany({ orderBy: { minPercent: 'asc' } }),
    ]);
    return {
      components,
      levels,
      note: 'Komponentlar, mezonlar, darajalar va vaznlar DOCX hujjatda taklif qilingan dastlabki ishchi model asosida sozlangan. Ular ilmiy jihatdan tasdiqlangan qiymatlar emas va tadqiqot jarayonida aniqlashtirilishi kerak.',
    };
  },

  createComponent: (input: z.infer<typeof componentSchema>) => prisma.assessmentComponent.create({ data: input }),
  updateComponent: (id: string, input: z.infer<typeof updateComponentSchema>) =>
    prisma.assessmentComponent.update({ where: { id }, data: input }),
  async deleteComponent(id: string) {
    const used = await prisma.competenceRecord.count({ where: { componentId: id } });
    if (used) throw AppError.conflict('Komponent bo‘yicha natijalar mavjud — o‘chirib bo‘lmaydi');
    await prisma.assessmentComponent.delete({ where: { id } });
  },

  createCriterion: (componentId: string, input: z.infer<typeof criterionSchema>) =>
    prisma.assessmentCriterion.create({ data: { ...input, componentId } }),
  updateCriterion: (id: string, input: Partial<z.infer<typeof criterionSchema>>) =>
    prisma.assessmentCriterion.update({ where: { id }, data: input }),
  deleteCriterion: (id: string) => prisma.assessmentCriterion.delete({ where: { id } }),

  createIndicator: (criterionId: string, input: z.infer<typeof indicatorSchema>) =>
    prisma.assessmentIndicator.create({ data: { ...input, criterionId } }),
  updateIndicator: (id: string, input: Partial<z.infer<typeof indicatorSchema>>) =>
    prisma.assessmentIndicator.update({ where: { id }, data: input }),

  /**
   * Komponentni barcha indikatorlari bo'yicha baholash: Past=1, O'rta=2, Yuqori=3 ball.
   * Foiz = to'plangan ball / maksimal ball × 100 — shu tariqa daraja aniq indikatorlarga tayanadi.
   */
  async rateIndicators(actor: Express.AuthUser, input: z.infer<typeof indicatorRatingSchema>) {
    await assertCanAccessStudent(actor, input.studentId);
    const component = await prisma.assessmentComponent.findUnique({
      where: { id: input.componentId },
      include: { criteria: { orderBy: { sortOrder: 'asc' }, include: { indicators: { orderBy: { sortOrder: 'asc' } } } } },
    });
    if (!component) throw AppError.notFound('Komponent topilmadi');
    const indicators = component.criteria.flatMap((c) => c.indicators.map((i) => ({ ...i, criterion: c.title })));
    if (indicators.length === 0) throw AppError.badRequest('Komponentda indikatorlar belgilanmagan');
    const byId = new Map(input.ratings.map((r) => [r.indicatorId, r.level]));
    if (input.ratings.some((r) => !indicators.some((i) => i.id === r.indicatorId))) {
      throw AppError.badRequest('Baholashda boshqa komponentga tegishli indikator bor');
    }
    const missing = indicators.filter((i) => !byId.has(i.id)).map((i) => i.title);
    if (missing.length) throw AppError.unprocessable('Barcha indikatorlarni baholang', { missing });

    const details = indicators.map((i) => {
      const level = byId.get(i.id)!;
      return { indicatorId: i.id, criterion: i.criterion, title: i.title, level, points: INDICATOR_POINTS[level] };
    });
    const max = indicators.length * INDICATOR_POINTS.HIGH;
    const score = (details.reduce((s, d) => s + d.points, 0) / max) * 100;
    const count = (lvl: keyof typeof INDICATOR_POINTS) => details.filter((d) => d.level === lvl).length;
    const summary = `Indikatorlar bo‘yicha: ${count('HIGH')} yuqori, ${count('MEDIUM')} o‘rta, ${count('LOW')} past`;

    return prisma.competenceRecord.create({
      data: {
        studentId: input.studentId,
        componentId: component.id,
        stage: input.stage,
        evidenceKind: 'EXPERT',
        assessorRole: actor.role === 'ADMIN' ? 'EXPERT' : 'TEACHER',
        assessorId: actor.id,
        score: Math.round(score * 10) / 10,
        note: input.note ? `${summary}. ${input.note}` : summary,
        details: details as Prisma.InputJsonValue,
        refType: 'IndicatorAssessment',
        refId: randomUUID(),
      },
    });
  },
  deleteIndicator: (id: string) => prisma.assessmentIndicator.delete({ where: { id } }),

  async replaceLevels(levels: z.infer<typeof levelsSchema>) {
    await prisma.$transaction([
      prisma.assessmentLevel.deleteMany({}),
      prisma.assessmentLevel.createMany({
        data: [...levels].sort((a, b) => a.minPercent - b.minPercent).map((l, i) => ({ ...l, sortOrder: i })),
      }),
    ]);
    return prisma.assessmentLevel.findMany({ orderBy: { minPercent: 'asc' } });
  },

  async replaceWeights(componentId: string, input: z.infer<typeof weightsSchema>) {
    await prisma.$transaction([
      prisma.evidenceWeight.deleteMany({ where: { componentId } }),
      prisma.evidenceWeight.createMany({ data: input.weights.map((w) => ({ ...w, componentId })) }),
    ]);
    return prisma.evidenceWeight.findMany({ where: { componentId } });
  },

  async profile(actor: Express.AuthUser, studentId: string, stage?: AssessmentStage) {
    await assertCanAccessStudent(actor, studentId);
    return computeProfile(studentId, stage);
  },

  /** Bosqichlar bo'yicha dinamika: boshlang'ich, oraliq, yakuniy va joriy */
  async dynamics(actor: Express.AuthUser, studentId: string) {
    await assertCanAccessStudent(actor, studentId);
    const profiles = await Promise.all(STAGES.map((s) => computeProfile(studentId, s)));
    const byStage = Object.fromEntries(
      profiles.map((p) => [
        p.stage,
        { overall: p.overall, level: p.overallLevel, components: p.components.map((c) => ({ code: c.code, name: c.name, score: c.score })) },
      ]),
    );
    const initial = profiles[0];
    const final = profiles[2];
    const delta = initial.components.map((c, i) => ({
      code: c.code,
      name: c.name,
      initial: c.score,
      final: final.components[i].score,
      change: c.score !== null && final.components[i].score !== null ? Math.round(((final.components[i].score as number) - c.score) * 10) / 10 : null,
    }));
    return { byStage, initialVsFinal: delta };
  },

  async records(actor: Express.AuthUser, studentId: string) {
    await assertCanAccessStudent(actor, studentId);
    return prisma.competenceRecord.findMany({
      where: { studentId },
      include: { component: { select: { code: true, name: true } }, assessor: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async expertRecord(actor: Express.AuthUser, input: z.infer<typeof expertRecordSchema>) {
    await assertCanAccessStudent(actor, input.studentId);
    return prisma.competenceRecord.create({
      data: { ...input, assessorRole: actor.role === 'ADMIN' ? 'EXPERT' : 'TEACHER', assessorId: actor.id },
    });
  },

  /** Guruh bo'yicha natijalar jadvali (o'qituvchi hisobotlari va CSV eksport uchun) */
  async groupSummary(actor: Express.AuthUser, groupId: string) {
    const group = await prisma.group.findFirst({
      where: { id: groupId, deletedAt: null },
      include: { members: { include: { student: { select: { id: true, fullName: true, username: true, email: true } } } } },
    });
    if (!group) throw AppError.notFound('Guruh topilmadi');
    if (actor.role === 'TEACHER' && group.teacherId !== actor.id) throw AppError.forbidden();
    if (actor.role === 'STUDENT') throw AppError.forbidden();
    const { components } = await getConfig();
    const rows = [];
    for (const m of group.members) {
      const [initial, final, all] = await Promise.all([
        computeProfile(m.studentId, 'INITIAL'),
        computeProfile(m.studentId, 'FINAL'),
        computeProfile(m.studentId),
      ]);
      rows.push({
        student: m.student,
        initial: initial.overall,
        final: final.overall,
        overall: all.overall,
        level: all.overallLevel,
        components: Object.fromEntries(all.components.map((c) => [c.code, c.score])),
      });
    }
    return {
      group: { id: group.id, name: group.name, kind: group.kind },
      components: components.map((c) => ({ code: c.code, name: c.name })),
      rows,
    };
  },

  async groupCsv(actor: Express.AuthUser, groupId: string) {
    const summary = await this.groupSummary(actor, groupId);
    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? '' : String(v);
      // CSV injection oldini olish (=, +, -, @ bilan boshlanuvchi qiymatlar)
      const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const header = ['F.I.Sh.', 'Login', 'Boshlang‘ich (%)', 'Yakuniy (%)', 'Umumiy (%)', 'Daraja', ...summary.components.map((c) => `${c.name} (%)`)];
    const lines = summary.rows.map((r) =>
      [r.student.fullName, r.student.username, r.initial, r.final, r.overall, r.level?.name, ...summary.components.map((c) => r.components[c.code])]
        .map(esc)
        .join(','),
    );
    return { filename: `guruh-${summary.group.name}.csv`, content: '﻿' + [header.map(esc).join(','), ...lines].join('\r\n') };
  },

  /**
   * Tajriba va nazorat guruhlarining tavsifiy taqqoslanishi (o'rtacha qiymatlar).
   * Statistik ahamiyatlilik testlari bajarilmaydi — tadqiqotchi tegishli statistik usulni tanlaydi.
   */
  async experiment(actor: Express.AuthUser) {
    const where: Prisma.GroupWhereInput = { deletedAt: null, kind: { in: ['EXPERIMENTAL', 'CONTROL'] } };
    if (actor.role === 'TEACHER') where.teacherId = actor.id;
    const groups = await prisma.group.findMany({ where, include: { members: { select: { studentId: true } } } });
    const { components } = await getConfig();
    const mean = (xs: (number | null)[]) => {
      const v = xs.filter((x): x is number => x !== null);
      return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null;
    };
    const result = [];
    for (const kind of ['EXPERIMENTAL', 'CONTROL'] as const) {
      const studentIds = [...new Set(groups.filter((g) => g.kind === kind).flatMap((g) => g.members.map((m) => m.studentId)))];
      const initial = await Promise.all(studentIds.map((id) => computeProfile(id, 'INITIAL')));
      const final = await Promise.all(studentIds.map((id) => computeProfile(id, 'FINAL')));
      result.push({
        kind,
        groups: groups.filter((g) => g.kind === kind).map((g) => ({ id: g.id, name: g.name, size: g.members.length })),
        n: studentIds.length,
        nWithInitial: initial.filter((p) => p.overall !== null).length,
        nWithFinal: final.filter((p) => p.overall !== null).length,
        initialMean: mean(initial.map((p) => p.overall)),
        finalMean: mean(final.map((p) => p.overall)),
        components: components.map((c, i) => ({
          code: c.code,
          name: c.name,
          initialMean: mean(initial.map((p) => p.components[i].score)),
          finalMean: mean(final.map((p) => p.components[i].score)),
        })),
      });
    }
    return {
      groups: result,
      disclaimer:
        'Bu jadval faqat tavsifiy o‘rtacha qiymatlarni ko‘rsatadi. Eksperiment samaradorligi haqidagi xulosa uchun tanlanma hajmi, guruhlar tengligi va tegishli statistik mezonlar (masalan, Styudent yoki Pirson χ² mezoni) tadqiqotchi tomonidan alohida qo‘llanilishi kerak.',
    };
  },
};
