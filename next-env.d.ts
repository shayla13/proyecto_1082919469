/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_APP_NAME?: string;
    readonly NEXT_PUBLIC_APP_URL?: string;
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}
