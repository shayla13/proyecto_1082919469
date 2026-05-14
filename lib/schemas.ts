// lib/schemas.ts
// Validación con Zod para requests

import { z } from 'zod';

// Validaciones compartidas
export const emailSchema = z
  .string()
  .email('Correo inválido')
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres');

export const nameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede exceder 100 caracteres');

// Schemas de autenticación
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: passwordSchema,
});

export const updateSystemConfigSchema = z.object({
  institution_name: z
    .string()
    .min(1, 'Nombre de institución requerido')
    .max(150, 'Nombre de institución muy largo')
    .optional(),
  allowed_domain: z
    .string()
    .email('Dominio inválido')
    .optional(),
  min_evaluations_to_publish: z
    .number()
    .int()
    .min(1, 'Mínimo 1 evaluación')
    .max(1000, 'Máximo 1000 evaluaciones')
    .optional(),
});

// Type inference from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateSystemConfigInput = z.infer<typeof updateSystemConfigSchema>;
