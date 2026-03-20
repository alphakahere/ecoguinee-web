import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  role: z.enum(['admin', 'supervisor', 'agent', 'public'], {
    error: 'Rôle requis',
  }),
  territoire: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
