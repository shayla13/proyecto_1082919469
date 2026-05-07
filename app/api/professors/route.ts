import { NextRequest, NextResponse } from 'next/server';
import { getProfessors } from '@/lib/dataService';

export async function GET() {
  try {
    const professors = await getProfessors();
    return NextResponse.json(professors);
  } catch (error) {
    console.error('Error fetching professors:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}