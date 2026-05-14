// app/api/auth/login/route.ts
// Login con bloqueo por intentos

import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/schemas';
import { getUserByEmail, incrementLoginAttempts, resetLoginAttempts } from '@/lib/dataService';
import { verifyPassword, signJWT } from '@/lib/auth';
import { recordAudit, TooManyRequestsError, AuthError } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Buscar el usuario
    const user = await getUserByEmail(email);

    if (!user) {
      // Usuario no encontrado - mensaje genérico por seguridad
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verificar bloqueo por intentos fallidos
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingMinutes = Math.ceil(
        (new Date(user.locked_until).getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${remainingMinutes} minutos.` },
        { status: 429 }
      );
    }

    // Verificar que la cuenta está activa
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Cuenta pendiente de verificación. Revisa tu correo.' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const passwordValid = await verifyPassword(password, user.password_hash);

    if (!passwordValid) {
      // Incrementar intentos fallidos
      await incrementLoginAttempts(user.id);

      // Mensaje genérico
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Login exitoso - resetear intentos
    await resetLoginAttempts(user.id);

    // Generar JWT
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Registrar login en auditoría (solo para admin)
    if (user.role === 'admin') {
      await recordAudit({
        id: '',
        timestamp: '',
        action: 'login',
        entity: 'user',
        entity_id: user.id,
        user_email: user.email,
        user_role: 'admin',
        summary: `Login exitoso: ${user.email}`,
      });
    }

    // Crear respuesta con cookie
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      { status: 200 }
    );

    // Establecer cookie HttpOnly
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error en el login' },
      { status: 500 }
    );
  }
}
