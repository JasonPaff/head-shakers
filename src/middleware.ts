import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';

const isPublicRoute = createRouteMatcher([
  // static pages (route group)
  '/about(.*)',
  '/privacy(.*)',
  '/terms(.*)',

  // public browsing - anyone can view
  '/browse(.*)',

  // public collection views (read-only)
  '/collections/:id',
  '/collections/:id/share(.*)',

  // public item views (read-only)
  '/items/:id',
  '/items/:id/share(.*)',

  // public user profiles (read-only)
  '/users/:username',
  '/users/:username/collections(.*)',
  '/users/:username/following(.*)',

  // homepage (can be viewed by anyone)
  '/',
]);

const isProtectedRoute = createRouteMatcher([
  // dashboard - always protected
  '/dashboard(.*)',

  // settings - always protected
  '/settings(.*)',

  // examples - always protected
  '/examples(.*)',

  // creation routes - require auth
  '/collections/create(.*)',
  '/items/add(.*)',

  // edit routes - require auth + ownership check
  '/collections/:id/edit(.*)',
  '/collections/:id/settings(.*)',
  '/items/:id/edit(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // add user context
  if (userId) Sentry.setUser({ id: userId });
  Sentry.setContext('request', {
    method: req.method,
    url: req.url,
    userAgent: req.headers.get('user-agent'),
  });

  // protected routes
  if (isProtectedRoute(req)) {
    await auth.protect();
    return;
  }

  // public routes, no auth required
  if (isPublicRoute(req)) {
    return;
  }

  // for any other routes, protect by default (fail-safe)
  await auth.protect();
});

export const config = {
  matcher: [
    // skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // always run for API routes
    '/(api|trpc)(.*)',
  ],
};
