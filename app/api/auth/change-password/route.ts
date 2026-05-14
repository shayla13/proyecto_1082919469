// app/api/auth/change-password/route.ts
// Cambiar contraseña del usuario autenticado

import { NextRequest, NextResponse } from 'next/server';
import { changePasswordSchema } from '@/lib/schemas';
import { getUserById, updateUser } from '@/lib/dataService';
import { verifyPassword, hashPassword, verifyJWT } from '@/lib/auth';
import { ValidationError, AuthError } from '@/lib/types';

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Obtener usuario actual
    const user = await getUserById(auth.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar contraseña actual
    const passwordValid = await verifyPassword(currentPassword, user.password_hash);

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Contraseña actual incorrecta' },
        { status: 401 }
      );
    }

    // Actualizar a nueva contraseña
    await updateUser(user.id, { password: newPassword });

    return NextResponse.json(
      { message: 'Contraseña cambiada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Error al cambiar la contraseña' },
      { status: 500 }
    );
  }
}
