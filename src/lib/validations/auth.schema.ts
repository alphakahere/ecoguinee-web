import { z } from 'zod';

export const loginSchema = z.object({
	emailOrPhone: z.string().min(1, "Email ou numéro de téléphone requis"),
	password: z.string().min(6, "Minimum 6 caractères"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
