import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Excluir archivos estáticos y rutas de Next.js
  if (
    pathname.startsWith('/_next/') ||
    pathname.includes('.')  // Si contiene un punto, se asume que es un archivo (CSS, JS, etc.)
  ) {
    return NextResponse.next();
  }

  // Define las rutas públicas
  const publicPaths = ['/login', '/register', '/terminos'];
  
  // Si la ruta es pública, permitir el acceso
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Para todas las demás rutas, verifica la cookie de sesión
  const sessionCookie = request.cookies.get('connect.sid');
  
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
