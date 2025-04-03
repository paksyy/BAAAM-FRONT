import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Excluir archivos estáticos y rutas internas
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // archivos como .js, .css
  ) {
    return NextResponse.next();
  }

  // Rutas públicas permitidas sin sesión
  const publicPaths = ['/login', '/register', '/terminos'];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublic) {
    return NextResponse.next();
  }

  // NO validamos cookie aquí porque NO es del mismo dominio
  return NextResponse.next();
}
