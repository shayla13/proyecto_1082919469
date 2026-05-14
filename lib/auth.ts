<<<<<<< HEAD
// lib/auth.ts
// Utilidades de autenticación: JWT, hashing, tokens

import { jwtVerify, SignJWT } from 'jose';
import { hash, compare } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { AuthPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

export async function signJWT(payload: AuthPayload, expiresIn: string = '24h'): Promise<string> {
  const jwt = new SignJWT(payload);

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
=======
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
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
}
