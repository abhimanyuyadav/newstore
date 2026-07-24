import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect admin routes - check for admin authentication token
  if (path.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin_session')?.value;
    
    // Allow only /admin/login to be accessed without auth
    if (path !== '/admin' && path !== '/admin/login') {
      if (!adminToken) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  // Protect API routes
  if (path.startsWith('/api')) {
    const response = NextResponse.next();
    
    // Add security headers to all API responses
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/checkout/:path*',
    '/account/:path*',
    '/payment/:path*',
  ],
}
