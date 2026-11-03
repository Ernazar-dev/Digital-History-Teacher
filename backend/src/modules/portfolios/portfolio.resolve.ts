import { prisma } from '../../config/prisma';

/** refType → bog'langan ishning holati, bahosi va mazmunini o'qish */
export const resolveRef = async (refType: string, refId: string) => {
  switch (refType) {
    case 'LessonPlan':
      return prisma.lessonPlan.findUnique({
        where: { id: refId },
        select: {
          id: true, title: true, topic: true, gradeLevel: true, status: true, score: true, teacherComment: true,
          currentVersion: true, updatedAt: true,
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
    case 'ReflectionEntry':
      return prisma.reflectionEntry.findUnique({ where: { id: refId } });
    default:
      return null;
  }
};
