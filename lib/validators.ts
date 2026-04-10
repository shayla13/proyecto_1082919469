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
