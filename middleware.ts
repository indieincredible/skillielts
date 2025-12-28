import NextAuth from 'next-auth';
import { info } from './lib/logger';
import { scheduleFlush } from './lib/logger/axiom-direct';
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from '@/routes';
import authConfig from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const session = req.auth;
  
  // Check logger active
  info('Request received', { 
    path: req.nextUrl.pathname,
    method: req.method,
    isAuthenticated: !!session?.user
  });
  
  // Flush logs in Edge Runtime by optimizing method
  if (process.env.NEXT_RUNTIME === 'edge') {
    // Schedule log flush without blocking current thread
    // Use debounce pattern to avoid flushing too many times
    scheduleFlush();
  }
  
  const { nextUrl } = req;
  const isLoggedIn = !!session;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      // Check callbackUrl from query params
      const callbackUrl = nextUrl.searchParams.get('callbackUrl');
      if (callbackUrl) {
        return Response.redirect(new URL(callbackUrl, nextUrl));
      }
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    // If it's a dashboard route, don't set callbackUrl, just redirect to home page
    if (nextUrl.pathname.startsWith('/dashboard')) {
      return Response.redirect(new URL('/auth/login', nextUrl));
    }
    
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  return;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};






