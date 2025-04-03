// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Rutas que no requieren autenticación
//   const publicPaths = ['/login', '/register', '/terminos', '/favicon.ico'];
//   const isPublic = publicPaths.some((publicPath) => pathname.startsWith(publicPath));
//   const isStatic = pathname.startsWith('/_next/') || pathname.includes('.');

//   if (isPublic || isStatic) {
//     return NextResponse.next();
//   }

//   // Verificar cookie de sesión
//   const session = request.cookies.get('connect.sid');

//   if (!session) {
//     const url = request.nextUrl.clone();
//     url.pathname = '/login';
//     url.searchParams.set('redirect', pathname); // opcional: guardar a dónde quería ir
//     return NextResponse.redirect(url);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// };
