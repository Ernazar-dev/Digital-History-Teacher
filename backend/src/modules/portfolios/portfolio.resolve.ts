import { prisma } from '../../config/prisma';

/** refType → bog'langan ishning holati, bahosi va mazmunini o'qish */
export const resolveRef = async (refType: string, refId: string) => {
  switch (refType) {
    case 'SourceAnalysis':
      return prisma.sourceAnalysis.findUnique({
        where: { id: refId },
        select: {
          id: true, status: true, score: true, teacherComment: true, answers: true, updatedAt: true,
          source: { select: { id: true, title: true, type: true } },
        },
      });
    case 'SourceComparison':
      return prisma.sourceComparison.findUnique({
        where: { id: refId },
        select: {
          id: true, title: true, status: true, score: true, teacherComment: true, similarities: true,
          differences: true, conclusion: true, updatedAt: true,
        },
      });
    case 'LessonPlan':
      return prisma.lessonPlan.findUnique({
        where: { id: refId },
        select: {
          id: true, title: true, topic: true, gradeLevel: true, status: true, score: true, teacherComment: true,
          currentVersion: true, updatedAt: true,
        },
      });
    case 'AssignmentSubmission':
      return prisma.assignmentSubmission.findUnique({
        where: { id: refId },
        select: {
          id: true, status: true, score: true, version: true, content: true, updatedAt: true,
          assignment: { select: { id: true, title: true, type: true, maxScore: true } },
          lessonPlan: { select: { id: true, title: true } },
          feedbacks: {
            orderBy: { createdAt: 'desc' },
            select: { comment: true, decision: true, version: true, totalScore: true, createdAt: true },
          },
          revisions: { orderBy: { version: 'asc' }, select: { version: true, content: true, createdAt: true } },
        },
      });
    case 'VirtualObjectResponse':
      return prisma.virtualObjectResponse.findUnique({
        where: { id: refId },
        select: {
          id: true, status: true, score: true, teacherComment: true, activityDesign: true, answers: true, updatedAt: true,
          virtualObject: { select: { id: true, title: true, slug: true, tasks: true } },
        },
      });
    case 'DiagnosticAttempt':
      return prisma.diagnosticAttempt.findUnique({
        where: { id: refId },
        select: {
          id: true, status: true, autoScore: true, maxAutoScore: true, submittedAt: true,
          diagnostic: { select: { id: true, title: true, stage: true, kind: true } },
        },
      });
    case 'ReflectionEntry':
      return prisma.reflectionEntry.findUnique({ where: { id: refId } });
    case 'SelfAssessment':
      return prisma.competenceRecord
        .findMany({
          where: { refType: 'SelfAssessment', refId },
          select: { score: true, note: true, stage: true, component: { select: { code: true, name: true } } },
        })
        .then((records) => ({ records }));
    default:
      return null;
  }
};
