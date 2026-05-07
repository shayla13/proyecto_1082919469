import { NextResponse } from 'next/server';
import { ForgotPasswordSchema } from '@lib/schemas';
import { getUserByEmail, createPasswordResetToken } from '@lib/dataService';
import { sendPasswordResetEmail } from '@lib/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = ForgotPasswordSchema.parse(body);
    const user = await getUserByEmail(email);

    if (user && user.is_active) {
      const token = await createPasswordResetToken(email);
      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({ message: 'Si el correo existe, se envió un enlace de recuperación.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'No se pudo procesar la solicitud.',
        message: error instanceof Error ? error.message : 'Error desconocido.',
      },
      { status: 400 }
    );
  }
}
