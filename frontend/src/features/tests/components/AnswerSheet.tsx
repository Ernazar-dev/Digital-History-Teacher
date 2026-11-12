import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import i18n from '@/i18n';
import type { TestOption } from '@/types/api';

export const OPTIONS: TestOption[] = ['A', 'B', 'C', 'D'];

interface Props {
  count: number;
  value: (TestOption | null)[];
  onChange?: (next: (TestOption | null)[]) => void;
  /** Berilsa — natija rejimi: tög'ri/notög'ri belgilanadi, tög'ri javob körsatiladi */
  answerKey?: TestOption[] | null;
  /** Kalitni belgilaş rejimi (öqituvçi) — ranglar yaşil */
  keyMode?: boolean;
}

/**
 * Javoblar varaği: har bir savol raqami yonida A B C D doiraçalari — qoğoz blankadek.
 * Qayta bosilsa belgi olib taşlanadi.
 */
export const AnswerSheet = ({ count, value, onChange, answerKey, keyMode }: Props) => {
  const readOnly = !onChange;
  const set = (i: number, o: TestOption) => {
    if (!onChange) return;
    const next = Array.from({ length: count }, (_, k) => value[k] ?? null);
    next[i] = next[i] === o ? null : o;
    onChange(next);
  };

  return (
    <ol className="m-0 list-none space-y-1 p-0">
      {Array.from({ length: count }, (_, i) => {
        const picked = value[i] ?? null;
        const correct = answerKey?.[i];
        const right = answerKey ? picked === correct : null;
        return (
          <li
            key={i}
            className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${
              right === true ? 'bg-emerald-50' : right === false ? 'bg-red-50' : i % 2 ? 'bg-canvas/60' : ''
            }`}
          >
            <span className="w-8 shrink-0 text-right font-semibold tabular-nums text-ink">{i + 1}.</span>
            <span role="radiogroup" aria-label={`${i + 1}-savol`} className="flex gap-2">
              {OPTIONS.map((o) => {
                const on = picked === o;
                const isKey = answerKey && correct === o;
                const tone = answerKey
                  ? isKey
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : on
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-line bg-white text-muted'
                  : on
                    ? keyMode
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-primary bg-primary text-white'
                    : 'border-line bg-white text-ink hover:border-primary hover:text-primary';
                return (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={i18n.t('misc.answerAria', { n: i + 1, o })}
                    disabled={readOnly}
                    onClick={() => set(i, o)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-solid text-sm font-semibold transition-colors ${tone} ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {o}
                  </button>
                );
              })}
            </span>
            {right === true && <CheckOutlined className="text-emerald-600" aria-label={i18n.t('misc.correct')} />}
            {right === false && (
              <span className="flex items-center gap-1 text-sm text-red-600">
                <CloseOutlined aria-hidden /> {picked ? '' : 'belgilanmagan'}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
};
