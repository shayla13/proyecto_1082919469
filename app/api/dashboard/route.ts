import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getSystemMode } from '@/lib/dataService';

export const GET = withAuth(async (request: Request) => {
  try {
    const mode = getSystemMode();

    if (mode === 'seed') {
      // En modo seed, retornar datos vacíos
      return NextResponse.json({
        period: null,
        professors: [],
        progress: {
          evaluated: 0,
          total: 0,
        },
        stats: {
          totalEvaluations: 0,
          averageRating: 0,
        },
      });
    }

    // TODO: Implementar lógica real para modo Supabase
    // - Obtener período activo
    // - Obtener lista de profesores
    // - Calcular progreso del estudiante usando hashes
    // - Estadísticas básicas

    return NextResponse.json({
      period: null,
      professors: [],
      progress: {
        evaluated: 0,
        total: 0,
      },
      stats: {
        totalEvaluations: 0,
        averageRating: 0,
      },
    });
  } catch (error) {
    console.error('Error in dashboard API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});