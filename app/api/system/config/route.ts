import { NextResponse } from 'next/server';
import { getSystemConfig } from '@lib/dataService';

export async function GET() {
  try {
    const config = await getSystemConfig();
    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'No se pudo leer la configuración del sistema.',
        message: error instanceof Error ? error.message : 'Error desconocido.',
      },
      { status: 500 }
    );
  }
}
