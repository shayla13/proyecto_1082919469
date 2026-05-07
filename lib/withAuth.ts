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
