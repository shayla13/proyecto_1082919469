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
}
