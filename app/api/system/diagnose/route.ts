import { NextResponse } from 'next/server';
import { getSystemMode } from '@lib/dataService';
import { Pool } from 'pg';

export async function GET() {
  const mode = getSystemMode();
  const dbUrl = process.env.DATABASE_URL;
  let dbConnected = false;
  let errorMessage = null;

  if (dbUrl) {
    const pool = new Pool({ connectionString: dbUrl });
    try {
      await pool.query('SELECT 1');
      dbConnected = true;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Error de conexión desconocido.';
    } finally {
      await pool.end();
    }
  }

  return NextResponse.json({ mode, dbConnected, errorMessage }, { status: 200 });
}
