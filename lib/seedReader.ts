import fs from 'fs/promises';
import path from 'path';
import { SeedSchema, SeedData } from './validators';

const SEED_PATH = path.join(process.cwd(), 'data', 'seed.json');

export type { SeedData };

export async function readSeedFile(): Promise<SeedData> {
  const raw = await fs.readFile(SEED_PATH, 'utf-8');
  const parsed = JSON.parse(raw);
  return SeedSchema.parse(parsed);
}

export async function writeSeedFile(data: SeedData): Promise<void> {
  await fs.writeFile(SEED_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function getSeedFilePath(): string {
  return SEED_PATH;
}
