import { NextResponse } from 'next/server';
import { RegisterSchema } from '@lib/schemas';
import { createUser, createActivationToken } from '@lib/dataService';
import { sendVerificationEmail } from '@lib/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = RegisterSchema.parse(body);

    const user = await createUser({ name, email, password });
    const token = await createActivationToken(user.id);
    await sendVerificationEmail(user.email, token);

    return NextResponse.json(
      {
        message: 'Usuario registrado. Revisa tu correo para activar la cuenta.',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'No se pudo registrar el usuario.',
        message: error instanceof Error ? error.message : 'Error desconocido.',
      },
      { status: error instanceof Error && error.message.includes('Solo se aceptan correos del dominio') ? 400 : 400 }
    );
  }
}
