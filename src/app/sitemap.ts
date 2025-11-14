import type { MetadataRoute } from 'next';

import * as Sentry from '@sentry/nextjs';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { bobbleheads, collections, users } from '@/lib/db/schema';
import { DEFAULT_SITE_METADATA } from '@/lib/seo/seo.constants';

/**
 * Generate XML sitemap for all public indexable routes
 *
 * This sitemap includes:
 * - Static pages (homepage, about, terms, privacy, featured, trending)
 * - Dynamic user profiles (all users)
 * - Dynamic bobblehead pages (public bobbleheads only)
 * - Dynamic collection pages (public collections only)
 *
 * This sitemap EXCLUDES (authenticated routes with noindex metadata):
 * - Dashboard routes
 * - Settings pages
 * - Admin pages
 * - Edit routes (bobbleheads/[slug]/edit, collections/[slug]/edit)
 *
 * Change frequencies and priorities:
 * - Homepage: daily, priority 1.0
 * - Featured/Trending: daily, priority 0.8
 * - User profiles: weekly, priority 0.6
 * - Bobbleheads: weekly, priority 0.6
 * - Collections: weekly, priority 0.6
 * - Static pages: monthly, priority 0.4
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return Sentry.startSpan(
    {
      attributes: {
        baseUrl: DEFAULT_SITE_METADATA.url,
      },
      name: 'seo.sitemap.generate',
      op: 'seo.sitemap',
    },
    async () => {
      const baseUrl = DEFAULT_SITE_METADATA.url;

      Sentry.addBreadcrumb({
        category: 'seo',
        data: { baseUrl },
        level: 'info',
        message: 'Starting sitemap generation',
      });

      // Static routes with their configurations
      const staticRoutes: MetadataRoute.Sitemap = [
        {
          changeFrequency: 'daily',
          lastModified: new Date(),
          priority: 1.0,
          url: baseUrl,
        },
        {
          changeFrequency: 'daily',
          lastModified: new Date(),
          priority: 0.8,
          url: `${baseUrl}/browse/featured`,
        },
        {
          changeFrequency: 'daily',
          lastModified: new Date(),
          priority: 0.8,
          url: `${baseUrl}/browse/trending`,
        },
        {
          changeFrequency: 'monthly',
          lastModified: new Date(),
          priority: 0.4,
          url: `${baseUrl}/about`,
        },
        {
          changeFrequency: 'monthly',
          lastModified: new Date(),
          priority: 0.4,
          url: `${baseUrl}/terms`,
        },
        {
          changeFrequency: 'monthly',
          lastModified: new Date(),
          priority: 0.4,
          url: `${baseUrl}/privacy`,
        },
      ];

      Sentry.addBreadcrumb({
        category: 'seo',
        data: { staticRouteCount: staticRoutes.length },
        level: 'debug',
        message: 'Static routes generated',
      });

      try {
        // Query all users (all users are public by default)
        const allUsers = await Sentry.startSpan(
          {
            name: 'seo.sitemap.query.users',
            op: 'db.query',
          },
          async () => {
            const result = await db
              .select({
                id: users.id,
                updatedAt: users.updatedAt,
                username: users.username,
              })
              .from(users)
              .orderBy(users.createdAt);

            Sentry.addBreadcrumb({
              category: 'seo',
              data: { userCount: result.length },
              level: 'debug',
              message: 'Fetched users for sitemap',
            });

            return result;
          },
        );

        // Query all public bobbleheads
        const publicBobbleheads = await Sentry.startSpan(
          {
            name: 'seo.sitemap.query.bobbleheads',
            op: 'db.query',
          },
          async () => {
            const result = await db
              .select({
                id: bobbleheads.id,
                slug: bobbleheads.slug,
                updatedAt: bobbleheads.updatedAt,
              })
              .from(bobbleheads)
              .orderBy(bobbleheads.createdAt);

            Sentry.addBreadcrumb({
              category: 'seo',
              data: { bobbleheadCount: result.length },
              level: 'debug',
              message: 'Fetched bobbleheads for sitemap',
            });

            return result;
          },
        );

        // Query all public collections with their owner usernames
        const publicCollections = await Sentry.startSpan(
          {
            name: 'seo.sitemap.query.collections',
            op: 'db.query',
          },
          async () => {
            const result = await db
              .select({
                id: collections.id,
                slug: collections.slug,
                updatedAt: collections.updatedAt,
                userId: collections.userId,
                username: users.username,
              })
              .from(collections)
              .innerJoin(users, eq(collections.userId, users.id))
              .where(eq(collections.isPublic, true))
              .orderBy(collections.createdAt);

            Sentry.addBreadcrumb({
              category: 'seo',
              data: { collectionCount: result.length },
              level: 'debug',
              message: 'Fetched collections for sitemap',
            });

            return result;
          },
        );

        // Generate dynamic routes for users
        const userRoutes: MetadataRoute.Sitemap = allUsers.map((user) => ({
          changeFrequency: 'weekly',
          lastModified: user.updatedAt,
          priority: 0.6,
          url: `${baseUrl}/users/${user.username}`,
        }));

        // Generate dynamic routes for bobbleheads
        const bobbleheadRoutes: MetadataRoute.Sitemap = publicBobbleheads.map((bobblehead) => ({
          changeFrequency: 'weekly',
          lastModified: bobblehead.updatedAt,
          priority: 0.6,
          url: `${baseUrl}/bobbleheads/${bobblehead.slug}`,
        }));

        // Generate dynamic routes for collections
        const collectionRoutes: MetadataRoute.Sitemap = publicCollections.map((collection) => ({
          changeFrequency: 'weekly',
          lastModified: collection.updatedAt,
          priority: 0.6,
          url: `${baseUrl}/collections/${collection.slug}`,
        }));

        // Combine all routes
        const allRoutes = [...staticRoutes, ...userRoutes, ...bobbleheadRoutes, ...collectionRoutes];

        // Add summary breadcrumb and metrics
        const sitemapSummary = {
          bobbleheads: bobbleheadRoutes.length,
          collections: collectionRoutes.length,
          static: staticRoutes.length,
          total: allRoutes.length,
          users: userRoutes.length,
        };

        Sentry.addBreadcrumb({
          category: 'seo',
          data: sitemapSummary,
          level: 'info',
          message: 'Sitemap generation complete',
        });

        // Set metrics for monitoring
        Sentry.setMeasurement('sitemap.routes.total', allRoutes.length, 'none');
        Sentry.setMeasurement('sitemap.routes.users', userRoutes.length, 'none');
        Sentry.setMeasurement('sitemap.routes.bobbleheads', bobbleheadRoutes.length, 'none');
        Sentry.setMeasurement('sitemap.routes.collections', collectionRoutes.length, 'none');

        // Log sitemap generation summary
        console.log('Sitemap generated:', sitemapSummary);

        return allRoutes;
      } catch (error) {
        // Capture error in Sentry with context
        Sentry.captureException(error, {
          contexts: {
            sitemap: {
              fallbackMode: true,
              staticRoutesCount: staticRoutes.length,
            },
          },
          level: 'error',
          tags: {
            error_type: 'database_query',
            operation: 'sitemap-generation',
          },
        });

        console.error('Error generating sitemap:', error);

        Sentry.addBreadcrumb({
          category: 'seo',
          data: { staticRouteCount: staticRoutes.length },
          level: 'error',
          message: 'Sitemap generation failed, returning static routes only',
        });

        // Return static routes only if dynamic route generation fails
        return staticRoutes;
      }
    },
  );
}
