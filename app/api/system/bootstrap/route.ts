// app/api/system/bootstrap/route.ts
// Bootstrap: ejecuta migraciones y seed en Supabase

import { NextRequest, NextResponse } from 'next/server';
import { runMigrations, getAppliedMigrations } from '@/lib/pgMigrate';
import { supabaseAdmin } from '@/lib/supabase';
import { getSeedAdmin, getSeedSystemConfig } from '@/lib/seedReader';
import { hashPassword } from '@/lib/auth';
import { recordAudit } from '@/lib/blobAudit';

export async function POST(request: NextRequest) {
  try {
    // Validar que el header de bootstrap sea correcto (protección básica)
    const bootstrapSecret = request.headers.get('x-bootstrap-secret');
    if (bootstrapSecret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized bootstrap attempt' },
        { status: 401 }
      );
    }

    const result: any = { success: false, steps: [] };

    // Paso 1: Ejecutar migraciones
    try {
      const migrations = await runMigrations();
      result.steps.push({
        name: 'migrations',
        status: 'completed',
        details: migrations,
      });
    } catch (error) {
      result.steps.push({
        name: 'migrations',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return NextResponse.json(result, { status: 400 });
    }

    // Paso 2: Crear admin en la BD
    try {
      const seedAdmin = getSeedAdmin();
      const seedConfig = getSeedSystemConfig();

      // Verificar que el admin no existe
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', seedAdmin.email)
        .single();

      if (!existing) {
        // Crear admin
        await supabaseAdmin.from('users').insert({
          name: seedAdmin.name,
          email: seedAdmin.email,
          password_hash: seedAdmin.password_hash,
          role: 'admin',
          is_active: true,
        });
      }

      // Verificar que system_config existe
      const { data: configExists } = await supabaseAdmin
        .from('system_config')
        .select('id')
        .limit(1)
        .single();

      if (!configExists) {
        await supabaseAdmin.from('system_config').insert({
          institution_name: seedConfig.institution_name,
          allowed_domain: seedConfig.allowed_domain,
          min_evaluations_to_publish: seedConfig.min_evaluations_to_publish,
        });
      }

      result.steps.push({
        name: 'seed',
        status: 'completed',
        details: {
          admin_email: seedAdmin.email,
          institution: seedConfig.institution_name,
          allowed_domain: seedConfig.allowed_domain,
        },
      });
    } catch (error) {
      result.steps.push({
        name: 'seed',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return NextResponse.json(result, { status: 400 });
    }

    // Paso 3: Registrar en auditoría
    try {
      await recordAudit({
        id: '',
        timestamp: '',
        action: 'bootstrap',
        entity: 'system',
        summary: 'Sistema inicializado — migraciones y seed aplicados',
        metadata: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      console.warn('Failed to record bootstrap audit:', error);
    }

    result.success = true;
    result.message = 'Bootstrap completado exitosamente';

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Bootstrap error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Bootstrap failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const migrations = await getAppliedMigrations();
    return NextResponse.json({
      migrations_applied: migrations,
      count: migrations.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get migrations' },
      { status: 500 }
    );
  }
}
