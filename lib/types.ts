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

export type Theme = 'light' | 'dark';
export type AnimationEffect = 'shimmer' | 'fadeIn' | 'slideUp';
