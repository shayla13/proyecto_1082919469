// app/api/auth/forgot-password/route.ts
// Solicita un link de recuperación de contraseña

import { NextRequest, NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/lib/schemas';
import { createPasswordResetToken, getSystemConfig } from '@/lib/dataService';
import { sendPasswordResetEmail } from '@/lib/emailService';
import { NotFoundError } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const config = await getSystemConfig();

    // Intentar crear el token de reset
    try {
      const resetToken = await createPasswordResetToken(email);

      // Enviar correo
      const emailSent = await sendPasswordResetEmail(
        email,
        resetToken,
        config.institution_name
      );

      if (!emailSent) {
        console.warn('Password reset email failed to send');
        return NextResponse.json(
          { error: 'No pudimos enviar el correo. Intenta más tarde.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.' },
        { status: 200 }
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        // No revelar si el usuario existe por seguridad
        return NextResponse.json(
          { message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.' },
          { status: 200 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Error en la solicitud' },
      { status: 500 }
    );
  }
}
