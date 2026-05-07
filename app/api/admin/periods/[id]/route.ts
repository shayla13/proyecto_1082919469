import { NextRequest, NextResponse } from 'next/server';
import { updatePeriod, closePeriod } from '@/lib/dataService';
import { UpdatePeriodSchema } from '@/lib/schemas';
import { requireAuth } from '@/lib/withAuth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = UpdatePeriodSchema.parse(body);

    const period = await updatePeriod(params.id, validatedData);
    return NextResponse.json(period);
  } catch (error) {
    console.error('Error updating period:', error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación y rol admin
    const session = await requireAuth(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 401 }
      );
    }

    // Cerrar período manualmente
    const period = await closePeriod(params.id);

    return NextResponse.json(period);
  } catch (error) {
    console.error('Error closing period:', error);
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