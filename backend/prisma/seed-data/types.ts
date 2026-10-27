import type { SourceType, SourceVariantKind } from '@prisma/client';

export interface SeedSource {
  slug: string;
  title: string;
  summary: string;
  description: string;
  type: SourceType;
  format: string;
  period: string | null;
  topics: string[];
  dateLabel: string;
  yearFrom: number | null;
  yearTo: number | null;
  author: string | null;
  origin: string;
  repository: string;
  originalUrl: string | null;
  mediaUrl?: string | null;
  license: string;
  reliabilityNotes: string;
  limitations: string;
  teachingUse: string;
  methodicalRecommendations: string;
  /** Manba asosidagi amaliy topshiriqlar — har bir qatorda bitta */
  practicalTasks?: string;
  /** Foydalanilgan adabiyotlar — har qatorda bitta ("Nomi — havola") */
  references?: string;
  latitude?: number | null;
  longitude?: number | null;
  status?: 'DRAFT' | 'REVIEWED' | 'PUBLISHED';
  variants: { kind: SourceVariantKind; title: string; content: string; citation?: string }[];
}
