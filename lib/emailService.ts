<<<<<<< HEAD
// lib/emailService.ts
// Envío de correos transaccionales con Resend

import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set');
}

if (!process.env.RESEND_FROM_EMAIL) {
  console.warn('RESEND_FROM_EMAIL is not set');
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@evaldoc.edu.co';

export async function sendVerificationEmail(
  to: string,
  activationToken: string,
  institutionName: string
): Promise<boolean> {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping email');
      return true;
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?token=${activationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Inter, sans-serif; line-height: 1.6; color: #1E3A5F; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white; }
            .content { background: #FFFFFF; padding: 30px; border: 1px solid #E5E7EB; }
            .footer { background: #F9FAFB; padding: 20px; border-radius: 0 0 8px 8px; color: #6B7280; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .button:hover { background: #1D4ED8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">¡Bienvenido a EvalDoc!</h1>
            </div>
            <div class="content">
              <p>Hola,</p>
              <p>Gracias por registrarte en <strong>${institutionName}</strong>. Para activar tu cuenta y comenzar a evaluar a tus profesores, haz clic en el botón de abajo:</p>
              <a href="${verificationUrl}" class="button">Verificar mi correo</a>
              <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; background: #F9FAFB; padding: 10px; border-radius: 4px; font-size: 12px; color: #6B7280;">${verificationUrl}</p>
              <p style="color: #6B7280; font-size: 12px;">Este enlace expira en 24 horas.</p>
            </div>
            <div class="footer">
              <p style="margin: 0;">© ${new Date().getFullYear()} EvalDoc. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: fromEmail,
      to,
      subject: 'Verifica tu cuenta en EvalDoc',
      html,
    });

    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  institutionName: string
): Promise<boolean> {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping email');
      return true;
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Inter, sans-serif; line-height: 1.6; color: #1E3A5F; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white; }
            .content { background: #FFFFFF; padding: 30px; border: 1px solid #E5E7EB; }
            .footer { background: #F9FAFB; padding: 20px; border-radius: 0 0 8px 8px; color: #6B7280; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .button:hover { background: #1D4ED8; }
            .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 10px; margin: 20px 0; border-radius: 4px; color: #92400E; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Recuperar contraseña</h1>
            </div>
            <div class="content">
              <p>Hola,</p>
              <p>Recibimos una solicitud para restablecer tu contraseña en <strong>${institutionName}</strong>. Haz clic en el botón de abajo para crear una nueva contraseña:</p>
              <a href="${resetUrl}" class="button">Restablecer contraseña</a>
              <div class="warning">
                <strong>Seguridad:</strong> Este enlace es válido solo por 15 minutos. Si no solicitaste este cambio, ignora este correo.
              </div>
              <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; background: #F9FAFB; padding: 10px; border-radius: 4px; font-size: 12px; color: #6B7280;">${resetUrl}</p>
            </div>
            <div class="footer">
              <p style="margin: 0;">© ${new Date().getFullYear()} EvalDoc. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: fromEmail,
      to,
      subject: 'Restablecer tu contraseña en EvalDoc',
      html,
    });

    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

export async function sendPeriodOpenNotification(
  students: string[],
  periodName: string,
  institutionName: string
): Promise<{ sent: number; failed: number }> {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping emails');
      return { sent: students.length, failed: 0 };
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

    let sent = 0;
    let failed = 0;

    for (const email of students) {
      try {
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Inter, sans-serif; line-height: 1.6; color: #1E3A5F; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white; }
                .content { background: #FFFFFF; padding: 30px; border: 1px solid #E5E7EB; }
                .footer { background: #F9FAFB; padding: 20px; border-radius: 0 0 8px 8px; color: #6B7280; font-size: 12px; }
                .button { display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                .button:hover { background: #1D4ED8; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 24px;">¡Período de evaluaciones abierto!</h1>
                </div>
                <div class="content">
                  <p>Hola,</p>
                  <p>El período de evaluaciones <strong>"${periodName}"</strong> acaba de abrirse en <strong>${institutionName}</strong>. Tu opinión es importante para mejorar la calidad de la enseñanza.</p>
                  <p>Accede a tu panel para evaluar a tus profesores. Recuerda que tu evaluación es completamente anónima.</p>
                  <a href="${dashboardUrl}" class="button">Ir al panel de evaluaciones</a>
                  <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">Tu opinión es confidencial y segura.</p>
                </div>
                <div class="footer">
                  <p style="margin: 0;">© ${new Date().getFullYear()} EvalDoc. Todos los derechos reservados.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: `Período de evaluaciones: ${periodName}`,
          html,
        });

        sent++;
      } catch (error) {
        console.error(`Failed to send notification to ${email}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  } catch (error) {
    console.error('Failed to send period notifications:', error);
    return { sent: 0, failed: students.length };
  }
=======
import { Resend } from 'resend';
import { getAppUrl } from './supabase';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;

if (!resendApiKey) {
  throw new Error('RESEND_API_KEY no está configurado.');
}

if (!fromEmail) {
  throw new Error('RESEND_FROM_EMAIL no está configurado.');
}

const resend = new Resend(resendApiKey);

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${getAppUrl()}/verify?token=${token}`;
  return resend.emails.send({
    from: `EvalDoc <${fromEmail}>`,
    to: email,
    subject: 'Verifica tu correo institucional en EvalDoc',
    html: `<p>Hola,</p>
      <p>Gracias por registrarte en EvalDoc. Haz clic en el siguiente enlace para activar tu cuenta:</p>
      <p><a href="${url}">${url}</a></p>
      <p>El enlace expira en 24 horas.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${getAppUrl()}/reset-password?token=${token}`;
  return resend.emails.send({
    from: `EvalDoc <${fromEmail}>`,
    to: email,
    subject: 'Restablece tu contraseña de EvalDoc',
    html: `<p>Hola,</p>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <p><a href="${url}">${url}</a></p>
      <p>El enlace expira en 15 minutos.</p>`,
  });
}

export async function sendPeriodOpenNotification(email: string, periodName: string) {
  return resend.emails.send({
    from: `EvalDoc <${fromEmail}>`,
    to: email,
    subject: `EvalDoc: el período ${periodName} ya está abierto`,
    html: `<p>Hola,</p>
      <p>El período de evaluación <strong>${periodName}</strong> ya está abierto. Ingresa a EvalDoc para emitir tu evaluación anónima.</p>`,
  });
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
}
