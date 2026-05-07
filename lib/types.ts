/**
 * Tipos TypeScript para la aplicación
 */

export interface HeroContent {
  headline: string;
  subtext: string;
  effect: 'shimmer' | 'fadeIn' | 'slideUp';
}

export interface MetaInfo {
  title: string;
  description: string;
}

export interface HomeData {
  id: string;
  hero: HeroContent;
  meta: MetaInfo;
  updatedAt: string;
}

export interface AppConfig {
  siteName: string;
  version: string;
  theme: 'light' | 'dark';
  locale: string;
  features: {
    animations: boolean;
    darkMode: boolean;
  };
}

export interface SystemConfig {
  institution_name: string;
  allowed_domain: string;
  min_evaluations_to_publish: number;
}

export type UserRole = 'admin' | 'student';

export interface User {
  [key: string]: unknown;
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  locked_until: string | null;
  failed_login_attempts: number;
  created_at: string;
}

export interface ActivationToken {
  [key: string]: unknown;
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface PasswordResetToken {
  [key: string]: unknown;
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface SessionUser {
  userId: number;
  email: string;
  role: UserRole;
}

export type Theme = 'light' | 'dark';
export type AnimationEffect = 'shimmer' | 'fadeIn' | 'slideUp';

export interface Professor {
  [key: string]: unknown;
  id: string;
  name: string;
  subject: string;
  department: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProfessorRequest {
  name: string;
  subject: string;
  department?: string;
}

export interface UpdateProfessorRequest {
  name?: string;
  subject?: string;
  department?: string;
}

export interface Period {
  [key: string]: unknown;
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  is_manually_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePeriodRequest {
  name: string;
  start_date: string;
  end_date: string;
}

export interface UpdatePeriodRequest {
  name?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  is_manually_closed?: boolean;
}
