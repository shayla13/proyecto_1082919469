// lib/seedReader.ts
// Lectura de datos del seed.json para modo seed

import { readFileSync } from 'fs';
import { join } from 'path';
import { User, SystemConfig } from './types';

interface SeedData {
  users: Array<{
    email: string;
    password_hash: string;
    name: string;
    role: string;
    is_active: boolean;
  }>;
  system_config: {
    institution_name: string;
    allowed_domain: string;
    min_evaluations_to_publish: number;
  };
}

let cachedSeed: SeedData | null = null;

export function readSeed(): SeedData {
  if (cachedSeed) {
    return cachedSeed;
  }

  try {
    const seedPath = join(process.cwd(), 'data', 'seed.json');
    const seedContent = readFileSync(seedPath, 'utf-8');
    cachedSeed = JSON.parse(seedContent) as SeedData;
    return cachedSeed;
  } catch (error) {
    console.error('Error reading seed.json:', error);
    throw new Error('Failed to read seed data');
  }
}

export function getSeedAdmin(): User {
  const seed = readSeed();
  const adminData = seed.users.find((u) => u.role === 'admin');

  if (!adminData) {
    throw new Error('No admin user found in seed');
  }

  return {
    id: 'seed-admin-000', // ID temporal para modo seed
    name: adminData.name,
    email: adminData.email,
    password_hash: adminData.password_hash,
    role: 'admin' as const,
    is_active: true,
    login_attempts: 0,
    locked_until: null,
    created_at: new Date().toISOString(),
  };
}

export function getSeedSystemConfig(): SystemConfig {
  const seed = readSeed();
  const config = seed.system_config;

  return {
    id: 1,
    institution_name: config.institution_name,
    allowed_domain: config.allowed_domain,
    min_evaluations_to_publish: config.min_evaluations_to_publish,
    updated_at: new Date().toISOString(),
  };
}

export function getSeedUserByEmail(email: string): User | null {
  const seed = readSeed();
  const userData = seed.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!userData) {
    return null;
  }

  return {
    id: `seed-user-${Buffer.from(userData.email).toString('hex').slice(0, 8)}`,
    name: userData.name,
    email: userData.email,
    password_hash: userData.password_hash,
    role: userData.role as 'estudiante' | 'admin',
    is_active: userData.is_active,
    login_attempts: 0,
    locked_until: null,
    created_at: new Date().toISOString(),
  };
}
