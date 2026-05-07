import { NextRequest, NextResponse } from 'next/server';
import { getAllProfessors, createProfessor } from '@/lib/dataService';
import { CreateProfessorSchema } from '@/lib/schemas';
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

    const professors = await getAllProfessors();
    return NextResponse.json(professors);
  } catch (error) {
    console.error('Error fetching professors:', error);
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
    const validatedData = CreateProfessorSchema.parse(body);

    const professor = await createProfessor(validatedData);
    return NextResponse.json(professor, { status: 201 });
  } catch (error) {
    console.error('Error creating professor:', error);
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