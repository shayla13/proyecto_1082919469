<<<<<<< HEAD
// app/api/auth/logout/route.ts
// Logout - elimina el cookie de autenticación

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: 'Logout exitoso' },
      { status: 200 }
    );

    // Eliminar cookie
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Error en el logout' },
      { status: 500 }
    );
  }
=======
import { NextResponse } from 'next/server';
import { getAuthCookieOptions } from '@lib/auth';

export async function POST() {
  const response = NextResponse.json({ message: 'Sesión cerrada.' });
  response.cookies.set({
    name: getAuthCookieOptions().name,
    value: '',
    httpOnly: true,
    secure: getAuthCookieOptions().secure,
    sameSite: getAuthCookieOptions().sameSite,
    path: getAuthCookieOptions().path,
    maxAge: 0,
  });
  return response;
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
}
