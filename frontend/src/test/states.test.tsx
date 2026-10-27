import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueryState } from '@/components/feedback/QueryState';
import { checklist } from '@/features/lesson-constructor/components/StepReview';
import { EMPTY_LESSON } from '@/features/lesson-constructor/lessonForm';

const base = { isLoading: false, isError: false, error: null, data: undefined as string[] | undefined, refetch: vi.fn() };

describe('Loading / error / empty holatlari', () => {
  it('xato holatida tushunarli xabar va qayta urinish tugmasi', () => {
    render(<QueryState query={{ ...base, isError: true, error: new Error('Tarmoq xatosi') }}>{() => <div>OK</div>}</QueryState>);
    expect(screen.getByText('Ma’lumotlarni yuklab bo‘lmadi')).toBeInTheDocument();
    expect(screen.getByText('Tarmoq xatosi')).toBeInTheDocument();
    expect(screen.getByText('Qayta urinish')).toBeInTheDocument();
  });

  it('bo‘sh holat yo‘naltiruvchi matn bilan', () => {
    render(<QueryState query={{ ...base, data: [] }} isEmpty={(d) => d.length === 0} empty="Manba topilmadi">{() => <div>OK</div>}</QueryState>);
    expect(screen.getByText('Manba topilmadi')).toBeInTheDocument();
  });

  it('muvaffaqiyatli holatda kontent', () => {
    render(<QueryState query={{ ...base, data: ['a'] }}>{(d) => <div>{d.length} ta</div>}</QueryState>);
    expect(screen.getByText('1 ta')).toBeInTheDocument();
  });
});

describe('Dars ishlanmasi to‘liqlik tekshiruvi', () => {
  it('bo‘sh ishlanma topshirishga tayyor emas', () => {
    expect(checklist(EMPTY_LESSON).every((i) => i.ok)).toBe(false);
  });
  it('vaqt taqsimoti oshib ketsa ogohlantiradi', () => {
    const v = {
      ...EMPTY_LESSON,
      goals: 'g', objectives: 'v', learningOutcomes: 'o', assessmentCriteria: 'a', reflectionQuestions: 'r',
      individualTasks: 'i', groupTasks: 'gr', interactiveMethods: ['Insert'], methodicalRationale: 'm',
      problemQuestions: [{ text: 'Savol?' }],
      resources: [{ sourceId: 's', virtualObjectId: null, purpose: 'Dalil' }],
      stages: [{ title: 'A', durationMinutes: 50, teacherActivity: '', studentActivity: '', methods: '', resources: '' }],
    };
    const time = checklist(v).find((i) => i.label.startsWith('Vaqt'));
    expect(time?.ok).toBe(false);
    expect(checklist({ ...v, stages: [{ ...v.stages[0], durationMinutes: 40 }] }).every((i) => i.ok)).toBe(true);
  });
});
