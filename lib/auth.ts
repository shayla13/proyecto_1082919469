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
}
