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
    );
  }
}
