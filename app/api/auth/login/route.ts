<<<<<<< HEAD
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
=======
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
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
        { status: 400 }
      );
    }

<<<<<<< HEAD
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
=======
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingMs = new Date(user.locked_until).getTime() - Date.now();
      const minutes = Math.ceil(remainingMs / 60000);
      return NextResponse.json(
        {
          error: 'Cuenta bloqueada temporalmente.',
          message: `Intenta de nuevo en ${minutes} minutos.`,
        },
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
        { status: 429 }
      );
    }

<<<<<<< HEAD
    // Verificar que la cuenta está activa
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Cuenta pendiente de verificación. Revisa tu correo.' },
=======
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
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
        { status: 401 }
      );
    }

<<<<<<< HEAD
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
=======
    await resetFailedLoginAttempts(user.id);
    const token = await createSessionToken({
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
      userId: user.id,
      email: user.email,
      role: user.role,
    });

<<<<<<< HEAD
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
=======
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
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
    });

    return response;
  } catch (error) {
<<<<<<< HEAD
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error en el login' },
      { status: 500 }
=======
    return NextResponse.json(
      {
        error: 'No se pudo iniciar sesión.',
        message: error instanceof Error ? error.message : 'Error desconocido.',
      },
      { status: 400 }
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
    );
  }
}
