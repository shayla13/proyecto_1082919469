import { NextResponse } from 'next/server';
import { getAuthCookieOptions } from '@lib/auth';

export async function POST() {
  const response = NextResponse.json({ message: 'Sesión cerrada.' });
  response.cookies.set({
    name: getAuthCookieOptions().name,
    value: '',
    httpOnly: true,
    secure: getAuthCookieOptions().secure,
    sameSite: getAuthCookieOptions().sameSite,
    path: getAuthCookieOptions().path,
    maxAge: 0,
  });
  return response;
}
