// lib/pgMigrate.ts
// Ejecución de migraciones en Postgres

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { readdirSync } from 'fs';

export interface MigrationResult {
  filename: string;
  applied: boolean;
  error?: string;
}

async function createPool(): Promise<Pool> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

export async function runMigrations(): Promise<MigrationResult[]> {
  const pool = await createPool();
  const results: MigrationResult[] = [];

  try {
    // Crear tabla de control si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL       PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    // Leer migraciones del directorio
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      try {
        // Verificar si ya se aplicó
        const { rows } = await pool.query(
          'SELECT filename FROM _migrations WHERE filename = $1',
          [file]
        );

        if (rows.length > 0) {
          results.push({ filename: file, applied: false });
          continue;
        }

        // Leer y ejecutar migración
        const filePath = join(migrationsDir, file);
        const sql = readFileSync(filePath, 'utf-8');

        // Dividir por ";" para ejecutar sentencias individuales
        const statements = sql
          .split(';')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const statement of statements) {
          await pool.query(statement);
        }

        // Registrar migración
        await pool.query(
          'INSERT INTO _migrations (filename) VALUES ($1)',
          [file]
        );

        results.push({ filename: file, applied: true });
      } catch (error) {
        results.push({
          filename: file,
          applied: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  } finally {
    await pool.end();
  }
}

export async function getAppliedMigrations(): Promise<string[]> {
  const pool = await createPool();

  try {
    const { rows } = await pool.query(
      'SELECT filename FROM _migrations ORDER BY applied_at ASC'
    );
    return rows.map((r) => r.filename);
  } finally {
    await pool.end();
  }
}

export async function testDatabaseConnection(): Promise<boolean> {
  const pool = await createPool();

  try {
    const result = await pool.query('SELECT NOW()');
    return result.rowCount === 1;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  } finally {
    await pool.end();
  }
}
