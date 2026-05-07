import { NextRequest, NextResponse } from 'next/server';
import { getProfessorById } from '@/lib/dataService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const professor = await getProfessorById(params.id);
    if (!professor) {
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(professor);
  } catch (error) {
    console.error('Error fetching professor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}