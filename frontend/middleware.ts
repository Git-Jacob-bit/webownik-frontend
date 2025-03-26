import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token'); // jeśli używasz ciastek
  // const token = request.headers.get("Authorization"); // jeśli wysyłasz token przez nagłówki

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // strony, które chcesz chronić
    '/dashboard/:path*',
    '/quiz/:path*',
    '/upload/:path*',
    '/next/:path*',
    '/',
  ],
};
