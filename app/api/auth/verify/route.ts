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
    );
  }
}
