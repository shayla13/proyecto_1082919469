<<<<<<< HEAD
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
=======
import { z } from 'zod';

export const EmailSchema = z.string().email({ message: 'Ingrese un correo válido.' });
export const PasswordSchema = z
  .string()
  .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  .max(128, { message: 'La contraseña no puede superar los 128 caracteres.' });

export const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: EmailSchema,
  password: PasswordSchema,
});

export const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export const VerifySchema = z.object({
  token: z.string().min(64).max(64),
});

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(64).max(64),
  password: PasswordSchema,
});

export const ChangePasswordSchema = z.object({
  currentPassword: PasswordSchema,
  newPassword: PasswordSchema,
});

export const SystemConfigSchema = z.object({
  institution_name: z.string().min(1),
  allowed_domain: z.string().min(1),
  min_evaluations_to_publish: z.number().int().positive(),
});

export const CreateProfessorSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  subject: z.string().min(2, { message: 'La materia debe tener al menos 2 caracteres.' }),
  department: z.string().optional(),
});

export const UpdateProfessorSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }).optional(),
  subject: z.string().min(2, { message: 'La materia debe tener al menos 2 caracteres.' }).optional(),
  department: z.string().optional(),
});

export const CreatePeriodSchema = z.object({
  name: z.string().min(2, { message: 'El nombre del período debe tener al menos 2 caracteres.' }),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Fecha de inicio inválida.' }),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Fecha de fin inválida.' }),
}).refine((data) => new Date(data.start_date) < new Date(data.end_date), {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin.',
  path: ['end_date'],
});

export const UpdatePeriodSchema = z.object({
  name: z.string().min(2, { message: 'El nombre del período debe tener al menos 2 caracteres.' }).optional(),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Fecha de inicio inválida.' }).optional(),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Fecha de fin inválida.' }).optional(),
  status: z.enum(['activo', 'cerrado']).optional(),
  is_manually_closed: z.boolean().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) < new Date(data.end_date);
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin.',
  path: ['end_date'],
});

export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type VerifyRequest = z.infer<typeof VerifySchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
export type SystemConfig = z.infer<typeof SystemConfigSchema>;
export type CreateProfessorRequest = z.infer<typeof CreateProfessorSchema>;
export type UpdateProfessorRequest = z.infer<typeof UpdateProfessorSchema>;
export type CreatePeriodRequest = z.infer<typeof CreatePeriodSchema>;
export type UpdatePeriodRequest = z.infer<typeof UpdatePeriodSchema>;
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
