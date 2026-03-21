import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'AGENT', 'USER'], {
    error: 'Rôle requis',
  }),
  territoire: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
