/** Portfolio elementidan asl işga havola */
export const workLink = (refType: string, refId: string, detail?: Record<string, unknown> | null) => {
  switch (refType) {
    case 'LessonPlan': return `/app/lessons/${refId}`;
    case 'VirtualObjectResponse': {
      const o = detail?.virtualObject as { slug: string } | undefined;
      return o ? `/app/museum/${o.slug}` : null;
    }
    default: return null;
  }
};
