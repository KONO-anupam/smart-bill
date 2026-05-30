// middleware
/**
 * Route protection summary:
 *
 * PUBLIC (no auth required):
 *   /                        — landing page
 *   /login                   — auth page
 *   /invoice/[sharing_token] — UUID-based public invoice portal,
 *                              accessible to anyone (invoice recipients)
 *
 * PROTECTED (auth required, redirect to /login?redirectedFrom=...):
 *   /dashboard               — invoice history and account
 *   /dashboard/*             — any dashboard sub-paths
 *   /invoice/new             — invoice creation form
 *   /invoice/new/*           — any sub-paths of new invoice
 *
 * STATIC ASSETS (always pass through, never checked):
 *   /_next/static, /_next/image, /favicon.ico, image files
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/invoice/new'];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
}

function isPublicInvoice(pathname: string): boolean {
  // /invoice/[sharing_token] — UUID-based public portal.
  // Anything under /invoice/ that is NOT /invoice/new.
  // Always public regardless of auth.
  return (
    pathname.startsWith('/invoice/') &&
    !pathname.startsWith('/invoice/new')
  );
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — must be called on every request
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public invoice portals are always allowed through
  if (isPublicInvoice(pathname)) {
    return response;
  }

  // Unauthenticated user hitting a protected route
  if (!user && isProtected(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user hitting the login page
  if (user && pathname === '/login') {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    dashboardUrl.search = '';
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};