import { NextRequest } from 'next/server'
import { createClient as createMiddlewareClient } from './utils/supabase/middleware'

export function middleware(request: NextRequest) {
  // use the helper which sets/refreshes cookies when Supabase returns set-cookie
  return createMiddlewareClient(request as NextRequest)
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
