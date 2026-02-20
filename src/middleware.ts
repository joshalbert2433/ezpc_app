import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

// Paths that are accessible without authentication
const publicPaths = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register', '/api/products'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the path is explicitly public
  if (publicPaths.some(path => path === pathname || (path !== '/' && pathname.startsWith(path)))) {
    return NextResponse.next();
  }

  // 2. Get the session cookie
  const session = request.cookies.get('session')?.value;

  // 3. Admin routes are strictly protected
  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    try {
      const payload = await decrypt(session);
      if (payload.role !== 'admin') return NextResponse.redirect(new URL('/dashboard', request.url));
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 4. Protected user routes (like dashboard, cart, wishlist)
  const protectedUserPaths = ['/dashboard', '/checkout', '/profile', '/addresses'];
  if (protectedUserPaths.some(path => pathname.startsWith(path))) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (except /api/auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, etc.
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
