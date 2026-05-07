import { NextResponse } from 'next/server';
import { ChangePasswordSchema } from '@lib/schemas';
import { requireAuth } from '@lib/withAuth';
import { changePassword } from '@lib/dataService';

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { currentPassword, newPassword } = ChangePasswordSchema.parse(body);
    await changePassword(user.userId, currentPassword, newPassword);

    return NextResponse.json({ message: 'Contraseña actualizada correctamente.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'No se pudo cambiar la contraseña.',
        message: error instanceof Error ? error.message : 'Error desconocido.',
      },
      { status: error instanceof Error && error.message.includes('incorrecta') ? 400 : 401 }
    );
  }
}
