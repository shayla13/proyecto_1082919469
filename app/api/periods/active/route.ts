import { NextResponse } from 'next/server';
import { getActivePeriod } from '@/lib/dataService';

export async function GET() {
  try {
    const activePeriod = await getActivePeriod();
    return NextResponse.json(activePeriod);
  } catch (error) {
    console.error('Error fetching active period:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}