// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ['/login', '/register', '/terminos', '/favicon.ico'];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));
  const isStatic = pathname.startsWith('/_next/') || pathname.includes('.');

  // Si es pública o recurso estático, permite
  if (isPublic || isStatic) return NextResponse.next();

  // Verificar cookie de sesión
  const session = request.cookies.get('connect.sid');

  // Si no hay sesión, redirige al login
  if (!session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname); // guarda a dónde iba
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
