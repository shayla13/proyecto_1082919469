import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL no está configurado para ejecutar migrations.');
}

const pool = new Pool({ connectionString: DATABASE_URL });

export async function runMigration(fileName: string): Promise<void> {
  const filePath = path.join(process.cwd(), 'supabase', 'migrations', fileName);
  const sql = await fs.readFile(filePath, 'utf-8');
  await pool.query(sql);
}

export async function hasMigrationApplied(fileName: string): Promise<boolean> {
  const result = await pool.query(
    'SELECT 1 FROM _migrations WHERE filename = $1 LIMIT 1',
    [fileName]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function markMigrationApplied(fileName: string): Promise<void> {
  await pool.query('INSERT INTO _migrations (filename) VALUES ($1)', [fileName]);
}

export async function getMigrationStatus(): Promise<Array<{ filename: string; applied_at: string }>> {
  const result = await pool.query('SELECT filename, applied_at FROM _migrations ORDER BY applied_at');
  return result.rows;
}
