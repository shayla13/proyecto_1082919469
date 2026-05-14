<<<<<<< HEAD
// lib/withAuth.ts
// Middleware para proteger rutas autenticadas

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './auth';
import { AuthPayload, AuthError } from './types';

export async function withAuth(request: NextRequest, handler: (req: NextRequest, auth: AuthPayload) => Promise<NextResponse>): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Intentar obtener del cookie
      const cookie = request.cookies.get('auth-token')?.value;

      if (!cookie) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }

      const auth = await verifyJWT(cookie);

      if (!auth) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }

      return handler(request, auth);
    }

    const token = authHeader.slice(7);
    const auth = await verifyJWT(token);

    if (!auth) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    return handler(request, auth);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 });
  }
}

// Para usar en rutas API como:
// export async function POST(request: NextRequest) {
//   return withAuth(request, async (req, auth) => {
//     // tu código aquí
//   });
// }
=======
import { NextResponse } from 'next/server';
import { verifySessionToken, getAuthCookieName } from './auth';

export async function requireAuth(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|; )${getAuthCookieName()}=([^;]+)`));
  const token = match?.[1];

  if (!token) {
    throw new Error('No authentication token provided.');
  }

  try {
    return await verifySessionToken(token);
  } catch (error) {
    throw new Error('Token inválido o expirado.');
  }
}

export function withAuth(handler: (req: Request, user: unknown) => Promise<Response>) {
  return async (req: Request) => {
    try {
      const user = await requireAuth(req);
      return await handler(req, user);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'No autorizado',
          message:
            error instanceof Error ? error.message : 'No se pudo autenticar al usuario.',
        },
        { status: 401 }
      );
    }
  };
}
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
