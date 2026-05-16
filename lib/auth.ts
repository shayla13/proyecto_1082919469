// lib/auth.ts
// Utilidades de autenticación: JWT, hashing, tokens, sesiones

import { jwtVerify, SignJWT } from 'jose';
import { hash, compare } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { AuthPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const TOKEN_NAME = 'evaldoc_token';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

// Random token generation (for activation, password reset, etc.)
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

// JWT operations
export async function signJWT(payload: AuthPayload, expiresIn: string = '24h'): Promise<string> {
  const jwt = new SignJWT(payload as unknown as Record<string, unknown>);

  jwt.setProtectedHeader({ alg: 'HS256' });
  jwt.setIssuedAt();
  jwt.setExpirationTime(expiresIn);

  return jwt.sign(SECRET_KEY);
}

export async function verifyJWT(token: string): Promise<AuthPayload | null> {
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload as AuthPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Session token operations
export interface SessionUser {
  userId: string;
  email: string;
  role: 'admin' | 'estudiante';
}

export async function createSessionToken(payload: SessionUser): Promise<string> {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('evaldoc')
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      issuer: 'evaldoc',
    });
    return payload as unknown as SessionUser;
  } catch (error) {
    console.error('Session token verification failed:', error);
    return null;
  }
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
    maxAge: 60 * 60 * 24, // 24 hours
  };
}
