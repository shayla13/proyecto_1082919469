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
}
