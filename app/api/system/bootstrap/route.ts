import { NextResponse } from 'next/server';
import { getSystemMode, getSystemConfig } from '@lib/dataService';

export async function POST() {
  try {
    const mode = getSystemMode();
    const config = await getSystemConfig();
    return NextResponse.json(
      {
        message: 'Bootstrap ejecutado.',
        mode,
        systemConfig: config,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'No se pudo ejecutar bootstrap.',
        message: error instanceof Error ? error.message : 'Error desconocido.',
      },
      { status: 500 }
    );
  }
}
