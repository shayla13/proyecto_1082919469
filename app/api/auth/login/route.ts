import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { LoginSchema } from '@lib/schemas';
import { getUserByEmail, incrementFailedLoginAttempts, resetFailedLoginAttempts } from '@lib/dataService';
import { createSessionToken, getAuthCookieOptions } from '@lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = LoginSchema.parse(body);
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas.' },
        { status: 400 }
      );
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingMs = new Date(user.locked_until).getTime() - Date.now();
      const minutes = Math.ceil(remainingMs / 60000);
      return NextResponse.json(
        {
          error: 'Cuenta bloqueada temporalmente.',
          message: `Intenta de nuevo en ${minutes} minutos.`,
        },
        { status: 429 }
      );
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      await incrementFailedLoginAttempts(user.id);
      return NextResponse.json(
        { error: 'Credenciales inválidas.' },
        { status: 400 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Cuenta pendiente de verificación.', message: 'Revisa tu correo para activar tu cuenta.' },
        { status: 401 }
      );
    }

    await resetFailedLoginAttempts(user.id);
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: 'Inicio de sesión exitoso.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set({
      name: getAuthCookieOptions().name,
      value: token,
      httpOnly: true,
      secure: getAuthCookieOptions().secure,
      sameSite: getAuthCookieOptions().sameSite,
      path: getAuthCookieOptions().path,
      maxAge: getAuthCookieOptions().maxAge,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: 'No se pudo iniciar sesión.',
        message: error instanceof Error ? error.message : 'Error desconocido.',
      },
      { status: 400 }
    );
  }
}
