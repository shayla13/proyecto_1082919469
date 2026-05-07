import { NextResponse } from 'next/server';
import { requireAuth } from '@lib/withAuth';

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'No autorizado',
        message: error instanceof Error ? error.message : 'No se pudo autenticar al usuario.',
      },
      { status: 401 }
    );
  }
}
