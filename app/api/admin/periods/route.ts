import { NextRequest, NextResponse } from 'next/server';
import { getPeriods, createPeriod } from '@/lib/dataService';
import { CreatePeriodSchema } from '@/lib/schemas';
import { requireAuth } from '@/lib/withAuth';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación y rol admin
    const session = await requireAuth(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 401 }
      );
    }

    const periods = await getPeriods();
    return NextResponse.json(periods);
  } catch (error) {
    console.error('Error fetching periods:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y rol admin
    const session = await requireAuth(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreatePeriodSchema.parse(body);

    const period = await createPeriod(validatedData);
    return NextResponse.json(period, { status: 201 });
  } catch (error) {
    console.error('Error creating period:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}