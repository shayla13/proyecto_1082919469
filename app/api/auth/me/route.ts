<<<<<<< HEAD
// app/api/auth/me/route.ts
// Obtiene el usuario autenticado actualmente

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getUserById } from '@/lib/dataService';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      token = request.cookies.get('auth-token')?.value || null;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const auth = await verifyJWT(token);

    if (!auth) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const user = await getUserById(auth.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
=======
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
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
    );
  }
}
