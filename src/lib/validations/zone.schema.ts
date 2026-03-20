import { z } from 'zod';

export const createZoneSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  coordinates: z.tuple([z.number(), z.number()]),
});

export type CreateZoneInput = z.infer<typeof createZoneSchema>;

export const createSectorSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  population: z.number().int().positive().optional(),
});

export type CreateSectorInput = z.infer<typeof createSectorSchema>;
