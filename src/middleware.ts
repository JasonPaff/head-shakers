import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { $path } from 'next-typesafe-url';
import { NextResponse } from 'next/server';

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
  // allows unauthenticated users to discover collections, subcollections, and bobbleheads
  // search functionality uses publicActionClient with rate limiting to prevent abuse
  '/search(.*)',

  // public collection views (read-only)
  '/collections/:slug', // matches /collections/[collectionSlug]
  '/collections/:slug/subcollection(.*)', // matches subcollection routes
  '/collections/:slug/share(.*)', // sharing routes

  // public bobblehead views (read-only)
  '/bobbleheads/:slug', // matches /bobbleheads/[bobbleheadSlug]
  '/bobbleheads/:slug/share(.*)', // sharing routes

  // public user profiles (read-only)
  '/users/:username',
  '/users/:username/collections(.*)',
  '/users/:username/following(.*)',

  // webhooks - external services (Clerk)
  '/api/webhooks/clerk',
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
  '/bobbleheads/add(.*)', // updated from items to bobbleheads

  // edit routes - require auth + ownership check
  '/collections/:slug/edit(.*)',
  '/collections/:slug/settings(.*)',
  '/bobbleheads/:slug/edit(.*)', // updated from items to bobbleheads
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

  // production gate: only allow authorized admins to access the site
  // only apply in production environment
  // skip the production gate for webhooks (external services)
  if (process.env.NODE_ENV === 'production') {
    const isWebhook = req.nextUrl.pathname.startsWith('/api/webhooks');
    const isComingSoonPage = req.nextUrl.pathname.startsWith($path({ route: '/coming-soon' }));

    if (!isComingSoonPage && !isWebhook) {
      const isAuthorized =
        userId === 'user_31kD3SV1UzjAJRhOiFw1DwvwOlH' || userId === 'user_32QMYObNpzxyI318lew9yTk9rZI';
      if (!isAuthorized) {
        const comingSoonUrl = new URL($path({ route: '/coming-soon' }), req.url);
        return NextResponse.redirect(comingSoonUrl);
      }
    }
  }

  // public routes, no auth required
  if (isPublicRoute(req)) {
    return;
  }

  // construct absolute URL for homepage
  const homeUrl = new URL($path({ route: '/' }), req.url).toString();

  // admin routes - require authentication (role checking done at component level)
  if (isAdminRoute(req)) {
    await auth.protect({ unauthenticatedUrl: homeUrl });
    return;
  }

  // protected routes
  if (isProtectedRoute(req)) {
    await auth.protect({ unauthenticatedUrl: homeUrl });
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
