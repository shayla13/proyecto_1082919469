// app/api/auth/register/route.ts
// Registro con validación de dominio institucional

import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/schemas';
import { createUser, getSystemConfig } from '@/lib/dataService';
import { generateToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { sendVerificationEmail } from '@/lib/emailService';
import { ValidationError, ConflictError } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Obtener configuración del sistema
    const config = await getSystemConfig();

    // Validar dominio (RN-10)
    const emailDomain = email.split('@')[1];
    if (emailDomain !== config.allowed_domain) {
      return NextResponse.json(
        { error: `Solo se aceptan correos del dominio ${config.allowed_domain}` },
        { status: 400 }
      );
    }

    // Crear usuario
    let user;
    try {
      user = await createUser({ name, email, password });
    } catch (error) {
      if (error instanceof ConflictError) {
        return NextResponse.json(
          { error: 'El correo ya está registrado' },
          { status: 409 }
        );
      }
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }

    // Generar token de activación (24 horas)
    const activationToken = generateToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Guardar token en la BD
    const { error: tokenError } = await supabaseAdmin.from('activation_tokens').insert({
      user_id: user.id,
      token: activationToken,
      expires_at: expiresAt.toISOString(),
    });

    if (tokenError) {
      console.error('Failed to create activation token:', tokenError);
      return NextResponse.json(
        { error: 'Error al registrar el usuario' },
        { status: 500 }
      );
    }

    // Enviar correo de verificación
    const emailSent = await sendVerificationEmail(
      email,
      activationToken,
      config.institution_name
    );

    if (!emailSent) {
      console.warn('Verification email failed to send');
      return NextResponse.json(
        { error: 'Se registró tu cuenta pero no pudimos enviar el correo. Intenta más tarde.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Registro exitoso. Revisa tu correo para activar tu cuenta.',
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Error en el registro' },
      { status: 500 }
    );
  }
}
