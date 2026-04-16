import { z } from 'zod';

export const createZoneSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  code: z.string().optional(),
});

export type CreateZoneInput = z.infer<typeof createZoneSchema>;
