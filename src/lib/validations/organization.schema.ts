import { z } from 'zod';

// ── Existing schema (used by edit modal) ───────────────────────────────────

export const organizationFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  acronym: z.string().max(10, 'Maximum 10 caractères').optional().or(z.literal('')),
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

// ── Multi-step creation schemas ────────────────────────────────────────────

export const organizationStepSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  acronym: z.string().max(10, 'Maximum 10 caractères').optional().or(z.literal('')),
  email: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Email invalide'),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (v) => !v || /^(\+224\s?)?6\d{8}$/.test(v.replace(/\s/g, '')),
      'Numéro invalide (ex: 622 00 00 00)',
    ),
  address: z.string().optional(),
  activityType: z.string().optional(),
  zoneIds: z.array(z.string()).min(1, 'Sélectionnez au moins une zone'),
});

export type OrganizationStepInput = z.infer<typeof organizationStepSchema>;

export const managerStepSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z
    .string()
    .min(8, 'Numéro trop court')
    .refine(
      (v) => /^(\+224\s?)?6\d{8}$/.test(v.replace(/\s/g, '')),
      'Numéro invalide (ex: +224 622 00 00 00)',
    ),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

export type ManagerStepInput = z.infer<typeof managerStepSchema>;
