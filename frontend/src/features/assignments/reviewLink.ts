/** Tekshiruv navbatidagi element turiga mos sahifa manzili */
export const reviewLink = (kind: string, id: string) => {
  switch (kind) {
    case 'SUBMISSION': return `/app/submissions/${id}`;
    case 'ANALYSIS': return `/app/analysis/${id}`;
    case 'COMPARISON': return `/app/analysis/comparisons/${id}`;
    case 'LESSON': return `/app/lessons/${id}`;
    case 'VIRTUAL': return `/app/museum/responses/${id}`;
    case 'DIAGNOSTIC': return `/app/diagnostics/attempts/${id}`;
    default: return '/app/review';
  }
};
