import { z } from 'zod';

const opt = z.string().trim().max(20000).optional().nullable();
const httpUrl = (msg: string) => z.string().trim().refine((v) => /^https?:\/\//i.test(v), msg);
const optUrl = z.string().trim().refine((v) => !v || /^https:\/\//i.test(v), 'Faqat https havola').optional().nullable();

export const objectFormSchema = z.object({
  title: z.string().trim().min(2, 'Nomini kiriting'),
  type: z.enum(['MODEL_3D', 'TOUR_360', 'VIRTUAL_MUSEUM', 'OTHER']),
  provider: z.enum(['SKETCHFAB', 'UZBEKISTAN360', 'OTHER']),
  periodId: z.string().nullable().optional(),
  periodLabel: opt,
  location: opt,
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  description: z.string().trim().min(10, 'Tavsif kamida 10 belgi'),
  historicalSignificance: opt,
  externalUrl: httpUrl('Tashqi manba URL manzilini kiriting'),
  embedUrl: optUrl,
  authorOrOrganization: opt,
  license: opt,
  termsNote: opt,
  historicalReferences: opt,
  methodicalRecommendations: opt,
  thumbnailUrl: optUrl,
  isActive: z.boolean(),
  status: z.enum(['DRAFT', 'REVIEWED', 'PUBLISHED']),
  sourceIds: z.array(z.string()),
  tasks: z.array(
    z.object({
      kind: z.enum(['OBSERVATION', 'EVIDENCE', 'COMPARISON', 'DISCUSSION', 'LESSON_APPLICATION', 'MATERIAL_CREATION']),
      prompt: z.string().trim().min(5, 'Topshiriq matni kamida 5 belgi'),
    }),
  ),
});
export type ObjectFormValues = z.infer<typeof objectFormSchema>;

export const EMPTY_OBJECT: ObjectFormValues = {
  title: '', type: 'MODEL_3D', provider: 'SKETCHFAB', periodId: null, periodLabel: '', location: '', latitude: null,
  longitude: null, description: '', historicalSignificance: '', externalUrl: '', embedUrl: '', authorOrOrganization: '',
  license: '', termsNote: '', historicalReferences: '', methodicalRecommendations: '', thumbnailUrl: '',
  isActive: true, status: 'PUBLISHED', sourceIds: [], tasks: [],
};
