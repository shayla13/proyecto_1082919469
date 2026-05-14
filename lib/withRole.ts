<<<<<<< HEAD
// lib/withRole.ts
// Middleware para verificar roles específicos

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './auth';
import { AuthPayload } from './types';

export async function withRole(
  request: NextRequest,
  requiredRoles: ('estudiante' | 'admin')[],
  handler: (req: NextRequest, auth: AuthPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');

    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      token = request.cookies.get('auth-token')?.value || null;
    }

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const auth = await verifyJWT(token);

    if (!auth) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    if (!requiredRoles.includes(auth.role)) {
      return NextResponse.json(
        { error: 'Permiso denegado' },
        { status: 403 }
      );
    }

    return handler(request, auth);
  } catch (error) {
    console.error('Role middleware error:', error);
    return NextResponse.json({ error: 'Error de autorización' }, { status: 500 });
  }
=======
import { NextResponse } from 'next/server';
import { requireAuth } from './withAuth';
import type { SessionUser } from './auth';

export function withRole(
  handler: (req: Request, user: SessionUser) => Promise<Response>,
  allowedRoles: Array<SessionUser['role']>
) {
  return async (req: Request) => {
    try {
      const user = await requireAuth(req);
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Acceso denegado', message: 'No tienes permisos suficientes.' },
          { status: 403 }
        );
      }

      return await handler(req, user);
    } catch (error) {
      return NextResponse.json(
        { error: 'No autorizado', message: error instanceof Error ? error.message : 'No se pudo autenticar al usuario.' },
        { status: 401 }
      );
    }
  };
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
}
