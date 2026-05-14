<<<<<<< HEAD
// app/api/system/diagnose/route.ts
// Diagnóstico del estado del sistema

import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/pgMigrate';
import { getSystemMode, getSystemConfig } from '@/lib/dataService';

export async function GET(request: NextRequest) {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      checks: [],
    };

    // Check 1: Base de datos
    try {
      const dbConnected = await testDatabaseConnection();
      diagnostics.checks.push({
        name: 'database',
        status: dbConnected ? 'ok' : 'error',
        message: dbConnected ? 'Conectado a Supabase' : 'No se pudo conectar a Supabase',
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'database',
        status: 'error',
        message: error instanceof Error ? error.message : 'Database error',
      });
    }

    // Check 2: Sistema (seed vs live)
    try {
      const mode = await getSystemMode();
      diagnostics.checks.push({
        name: 'system_mode',
        status: 'ok',
        value: mode,
        message: mode === 'seed' ? 'Modo seed (antes de bootstrap)' : 'Modo live (producción)',
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'system_mode',
        status: 'error',
        message: error instanceof Error ? error.message : 'Mode detection error',
      });
    }

    // Check 3: Configuración del sistema
    try {
      const config = await getSystemConfig();
      diagnostics.checks.push({
        name: 'system_config',
        status: 'ok',
        value: {
          institution_name: config.institution_name,
          allowed_domain: config.allowed_domain,
        },
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'system_config',
        status: 'error',
        message: error instanceof Error ? error.message : 'Config error',
      });
    }

    // Check 4: Variables de entorno
    const envChecks = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
      JWT_SECRET: !!process.env.JWT_SECRET,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    };

    diagnostics.checks.push({
      name: 'environment_variables',
      status: Object.values(envChecks).every((v) => v) ? 'ok' : 'warning',
      value: envChecks,
      message: Object.values(envChecks).every((v) => v)
        ? 'Todas las variables configuradas'
        : 'Faltan variables de entorno',
    });

    return NextResponse.json(diagnostics);
  } catch (error) {
    console.error('Diagnostic error:', error);
    return NextResponse.json(
      { error: 'Diagnostic failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
=======
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
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
}
