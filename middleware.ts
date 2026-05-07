import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/verify',
    '/forgot-password',
    '/reset-password',
    '/ranking',
    '/professors',
  ];

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Para rutas protegidas, verificar autenticación
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirigir a login si no hay token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // TODO: Implementar verificación de token JWT
    // Por ahora, solo verificar que existe el cookie
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificar rutas de admin (placeholder - implementar verificación de role)
    if (pathname.startsWith('/admin/')) {
      // TODO: Verificar role de admin
      // Por ahora, permitir acceso
    }

    // Token presente, continuar
    return NextResponse.next();
  } catch (error) {
    // Error en verificación, redirigir a login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};