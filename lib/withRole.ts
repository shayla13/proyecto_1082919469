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
}
