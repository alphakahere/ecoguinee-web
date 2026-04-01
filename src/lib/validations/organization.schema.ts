import { z } from 'zod';

export const organizationFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z
    .string()
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Email invalide'),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^(\+224\s?)?6\d{8}$/.test(v.replace(/\s/g, '')),
      'Numéro invalide (ex: 622 00 00 00)',
    ),
  address: z.string().optional(),
  description: z.string().optional(),
  activityType: z.string().optional(),
  zoneIds: z.array(z.string()).optional(),
});

export type OrganizationFormInput = z.infer<typeof organizationFormSchema>;
