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
