import { z } from 'zod';

export const createCampaignSchema = z.object({
  titre: z.string().min(3, 'Minimum 3 caractères'),
  description: z.string().min(10, 'Minimum 10 caractères'),
  type: z.enum(['sensibilisation', 'promotion', 'formation'], {
    error: 'Type de campagne requis',
  }),
  commune: z.string().min(1, 'Commune requise'),
  secteur: z.string().min(1, 'Secteur requis'),
  datePrevue: z.string().min(1, 'Date prévue requise'),
  dateFinEstimee: z.string().optional(),
  pmeOrganisatrice: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export const submitCollecteSchema = z.object({
  participants: z.number().int().positive('Nombre de participants requis'),
  notes: z.string().optional(),
});

export type SubmitCollecteInput = z.infer<typeof submitCollecteSchema>;

/** Formulaire création campagne (API) — superviseur / admin */
export const createCampaignApiFormSchema = z
  .object({
    title: z.string().min(1, 'Titre requis').max(500),
    description: z.string().max(8000).optional(),
    type: z.enum(['AWARENESS', 'PROMOTION', 'TRAINING']),
    zoneId: z.string().optional(),
    scheduledDate: z.string().min(1, 'Date prévue requise'),
    endDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.scheduledDate);
    if (Number.isNaN(start.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Date prévue invalide',
        path: ['scheduledDate'],
      });
      return;
    }
    if (data.endDate && data.endDate.length > 0) {
      const end = new Date(data.endDate);
      if (Number.isNaN(end.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Date de fin invalide',
          path: ['endDate'],
        });
      } else if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La date de fin doit être postérieure à la date prévue',
          path: ['endDate'],
        });
      }
    }
  });

export type CreateCampaignApiFormInput = z.infer<typeof createCampaignApiFormSchema>;
