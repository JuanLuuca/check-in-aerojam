import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie } from 'cookies-next';

export function middleware(request: NextRequest) {
  const authToken = getCookie('authToken', { req: request });

  const url = request.nextUrl.clone();
  const isAuthPage = url.pathname === '/login';
  const isProtectedPage = url.pathname === '/' || url.pathname === '/add-class' || url.pathname === '/manage-users';

  if (!authToken && isProtectedPage) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (authToken && isAuthPage) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/add-class', '/login', '/manage-users'],
};