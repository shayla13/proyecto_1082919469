import { z } from 'zod';

/**
 * Schemas Zod para validación de datos JSON
 */

const HeroContentSchema = z.object({
  headline: z.string(),
  subtext: z.string(),
  effect: z.enum(['shimmer', 'fadeIn', 'slideUp']),
});

const MetaInfoSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const HomeDataSchema = z.object({
  id: z.string(),
  hero: HeroContentSchema,
  meta: MetaInfoSchema,
  updatedAt: z.string().datetime(),
});

export const AppConfigSchema = z.object({
  siteName: z.string(),
  version: z.string(),
  theme: z.enum(['light', 'dark']),
  locale: z.string(),
  features: z.object({
    animations: z.boolean(),
    darkMode: z.boolean(),
  }),
});

// Tipos inferidos de Zod (opcional, para redundancia)
export type HomeDataValidated = z.infer<typeof HomeDataSchema>;
export type AppConfigValidated = z.infer<typeof AppConfigSchema>;

const SystemConfigSchema = z.object({
  institution_name: z.string(),
  allowed_domain: z.string(),
  min_evaluations_to_publish: z.number().int().positive(),
});

const SeedUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  role: z.enum(['admin', 'student']),
  is_active: z.boolean(),
  locked_until: z.string().nullable(),
  failed_login_attempts: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
});

const SeedTokenSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  token: z.string().min(64).max(64),
  expires_at: z.string().datetime(),
  used_at: z.string().nullable(),
  created_at: z.string().datetime(),
});

const SeedProfessorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  subject: z.string().min(2),
  department: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const SeedPeriodSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  start_date: z.string(),
  end_date: z.string(),
  status: z.string(),
  is_manually_closed: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const SeedSchema = z.object({
  system_config: SystemConfigSchema,
  users: z.array(SeedUserSchema),
  activation_tokens: z.array(SeedTokenSchema),
  password_reset_tokens: z.array(SeedTokenSchema),
  professors: z.array(SeedProfessorSchema),
  periods: z.array(SeedPeriodSchema),
});

export type SeedData = z.infer<typeof SeedSchema>;
