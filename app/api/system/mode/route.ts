// app/api/system/mode/route.ts
// Retorna si el sistema está en modo seed o live

import { NextRequest, NextResponse } from 'next/server';
import { getSystemMode } from '@/lib/dataService';

export async function GET(request: NextRequest) {
  try {
    const mode = await getSystemMode();
    return NextResponse.json({ mode });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get system mode' },
      { status: 500 }
    );
  }
}
