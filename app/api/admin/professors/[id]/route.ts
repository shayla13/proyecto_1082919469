import { NextRequest, NextResponse } from 'next/server';
import { deactivateProfessor, updateProfessor } from '@/lib/dataService';
import { UpdateProfessorSchema } from '@/lib/schemas';
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
    const validatedData = UpdateProfessorSchema.parse(body);

    const professor = await updateProfessor(params.id, validatedData);
    return NextResponse.json(professor);
  } catch (error) {
    console.error('Error updating professor:', error);
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

    // Intentar desactivar (soft delete)
    const professor = await deactivateProfessor(params.id);

    return NextResponse.json(professor);
  } catch (error) {
    console.error('Error deactivating professor:', error);
    if (error instanceof Error) {
      // RN-08: Si tiene evaluaciones, retornar 409
      if (error.message.includes('tiene evaluaciones asociadas')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
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