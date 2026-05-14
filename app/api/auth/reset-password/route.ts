// app/api/auth/reset-password/route.ts
// Aplica una nueva contraseña con token de reset

import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/lib/schemas';
import { resetPassword } from '@/lib/dataService';
import { hashPassword } from '@/lib/auth';
import { ValidationError } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { token, newPassword } = parsed.data;

    // Hashear la nueva contraseña
    const passwordHash = await hashPassword(newPassword);

    // Aplicar reset
    try {
      await resetPassword(token, passwordHash);
      return NextResponse.json(
        { message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.' },
        { status: 200 }
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Error al restablecer la contraseña' },
      { status: 500 }
    );
  }
}
