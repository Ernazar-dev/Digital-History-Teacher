import type { PortfolioItemType, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

type Db = Prisma.TransactionClient | typeof prisma;

export interface PortfolioEntryInput {
  studentId: string;
  type: PortfolioItemType;
  title: string;
  description?: string | null;
  refType: string;
  refId: string;
  sourceIds?: string[];
  version?: number;
}

/**
 * Talaba ishini portfolioga avtomatik qo'shadi yoki yangilaydi.
 * Bir ish (refType+refId) uchun bitta element — versiya raqami yangilanadi.
 */
export const upsertPortfolioItem = async (input: PortfolioEntryInput, db: Db = prisma) => {
  const portfolio = await db.portfolio.upsert({
    where: { studentId: input.studentId },
    create: { studentId: input.studentId },
    update: {},
  });
  const data = {
    type: input.type,
    title: input.title,
    description: input.description ?? null,
    sourceIds: input.sourceIds ?? [],
    version: input.version ?? 1,
  };
  return db.portfolioItem.upsert({
    where: { portfolioId_refType_refId: { portfolioId: portfolio.id, refType: input.refType, refId: input.refId } },
    create: { ...data, portfolioId: portfolio.id, refType: input.refType, refId: input.refId },
    update: data,
  });
};
