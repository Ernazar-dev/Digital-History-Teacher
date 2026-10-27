/** Portfolio elementidan asl ishga havola */
export const workLink = (refType: string, refId: string, detail?: Record<string, unknown> | null) => {
  switch (refType) {
    case 'SourceAnalysis': return `/app/analysis/${refId}`;
    case 'SourceComparison': return `/app/analysis/comparisons/${refId}`;
    case 'LessonPlan': return `/app/lessons/${refId}`;
    case 'AssignmentSubmission': {
      const a = detail?.assignment as { id: string } | undefined;
      return a ? `/app/assignments/${a.id}` : null;
    }
    case 'VirtualObjectResponse': {
      const o = detail?.virtualObject as { slug: string } | undefined;
      return o ? `/app/museum/${o.slug}` : null;
    }
    case 'DiagnosticAttempt': return `/app/diagnostics/attempts/${refId}`;
    default: return null;
  }
};
