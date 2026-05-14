<<<<<<< HEAD
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
=======
import { NextResponse } from 'next/server';
import { ResetPasswordSchema } from '@lib/schemas';
import { resetPassword } from '@lib/dataService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = ResetPasswordSchema.parse(body);
    await resetPassword(token, password);

    return NextResponse.json({ message: 'Contraseña restablecida correctamente.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'No se pudo restablecer la contraseña.',
        message: error instanceof Error ? error.message : 'Error desconocido.',
      },
      { status: 400 }
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
    );
  }
}
