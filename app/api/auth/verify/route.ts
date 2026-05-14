<<<<<<< HEAD
// app/api/auth/verify/route.ts
// Activa la cuenta mediante el token de verificación

import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenSchema } from '@/lib/schemas';
import { activateUser } from '@/lib/dataService';
import { ValidationError } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = verifyTokenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { token } = parsed.data;

    // Activar usuario
    try {
      const user = await activateUser(token);
      return NextResponse.json(
        {
          message: 'Cuenta activada exitosamente. Ya puedes iniciar sesión.',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
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
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Error al verificar el correo' },
      { status: 500 }
=======
import { NextResponse } from 'next/server';
import { VerifySchema } from '@lib/schemas';
import { activateUser } from '@lib/dataService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = VerifySchema.parse(body);
    await activateUser(token);

    return NextResponse.json({ message: 'Cuenta activada correctamente.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'No se pudo activar la cuenta.',
        message: error instanceof Error ? error.message : 'Token inválido o expirado.',
      },
      { status: 400 }
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
    );
  }
}
