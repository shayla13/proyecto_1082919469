import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_NAME = 'evaldoc_token';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está configurado.');
}

const encoder = new TextEncoder();
const jwtKey = encoder.encode(JWT_SECRET);

export interface SessionUser {
  userId: number;
  email: string;
  role: 'admin' | 'student';
}

export async function createSessionToken(payload: SessionUser): Promise<string> {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('evaldoc')
    .setExpirationTime('24h')
    .sign(jwtKey);
}

export async function verifySessionToken(token: string): Promise<SessionUser> {
  const { payload } = await jwtVerify(token, jwtKey, {
    issuer: 'evaldoc',
  });

  return payload as unknown as SessionUser;
}

export function getAuthCookieName() {
  return TOKEN_NAME;
}

export function getAuthCookieOptions() {
  return {
    name: TOKEN_NAME,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24,
  };
}
