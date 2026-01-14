import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { $path } from 'next-typesafe-url';

const isPublicRoute = createRouteMatcher([
  // homepage - anyone can view
  '/',

  // SEO files - must be publicly accessible for search engines
  '/sitemap.xml',
  '/robots.txt',

  // static pages (route group)
  '/about(.*)',
  '/privacy(.*)',
  '/terms(.*)',

  // coming soon page - always accessible
  '/coming-soon(.*)',

  // public browsing - anyone can view
  '/browse(.*)',

  // public search - anyone can search content
  // allows unauthenticated users to discover collections and bobbleheads
  // search functionality uses publicActionClient with rate limiting to prevent abuse
  '/search(.*)',

  // public collection views (read-only) - nested under user
  '/user/:username/collection/:collectionSlug', // matches /user/[username]/collection/[collectionSlug]
  '/user/:username/collection/:collectionSlug/share(.*)', // sharing routes

  // public bobblehead views (read-only) - nested under user/collection
  '/user/:username/collection/:collectionSlug/bobbleheads/:bobbleheadSlug',
  '/user/:username/collection/:collectionSlug/bobbleheads/:bobbleheadSlug/share(.*)', // sharing routes

  // public user profiles (read-only)
  '/user/:username(.*)', // matches /user/[username] and nested routes
  '/users/:username',
  '/users/:username/collections(.*)',
  '/users/:username/following(.*)',

  // webhooks - external services (Clerk)
  '/api/webhooks/clerk',
]);

const isProtectedRoute = createRouteMatcher([
  // dashboard - always protected
  '/dashboard(.*)',

  // user dashboard - always protected
  '/user/:username/dashboard(.*)',

  // settings - always protected
  '/settings(.*)',

  // examples - always protected
  '/examples(.*)',

  // edit routes - require auth + ownership check
  '/user/:username/collection/:collectionSlug/bobbleheads/:bobbleheadSlug/edit(.*)', // bobblehead edit routes
]);

const isAdminRoute = createRouteMatcher([
  // admin dashboard and management
  '/admin(.*)',

  // feature planner - admin only
  '/feature-planner(.*)',
]);

const middleware = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // add user context
  if (userId) Sentry.setUser({ id: userId });
  Sentry.setContext('request', {
    method: req.method,
    url: req.url,
    userAgent: req.headers.get('user-agent'),
  });

  // construct absolute URL for homepage
  const homeUrl = new URL($path({ route: '/' }), req.url).toString();

  // protected routes - check these BEFORE public routes to ensure
  // specific protected patterns take precedence over public catch-alls
  if (isProtectedRoute(req)) {
    await auth.protect({ unauthenticatedUrl: homeUrl });
    return;
  }

  // admin routes - require authentication (role checking done at component level)
  if (isAdminRoute(req)) {
    await auth.protect({ unauthenticatedUrl: homeUrl });
    return;
  }

  // public routes, no auth required
  if (isPublicRoute(req)) {
    return;
  }

  // for any other routes, protect by default (fail-safe)
  await auth.protect({ unauthenticatedUrl: homeUrl });
  return;
});

export default middleware;

export const config = {
  matcher: [
    // skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // always run for API routes
    '/(api|trpc)(.*)',
  ],
};
