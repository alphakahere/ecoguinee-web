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
