import { z } from 'zod';

export const createReportSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().min(1, 'Adresse requise'),
    commune: z.string().min(1, 'Commune requise'),
    quartier: z.string().min(1, 'Quartier requis'),
  }),
  wasteType: z.enum(['solid', 'liquid', 'mixed'], {
    error: 'Type de déchet requis',
  }),
  severity: z.enum(['low', 'medium', 'high', 'critical'], {
    error: 'Niveau de gravité requis',
  }),
  description: z.string().min(10, 'Minimum 10 caractères'),
  photoUrl: z.string().url().optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

export const updateReportStatusSchema = z.object({
  status: z.enum(['reported', 'in-progress', 'resolved']),
});

export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
