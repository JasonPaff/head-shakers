import type { MetadataRoute } from 'next';

import { DEFAULT_SITE_METADATA } from '@/lib/seo/seo.constants';

/**
 * Generate robots.txt file to guide search engine crawlers
 *
 * This configuration:
 * - Allows crawling of all public routes
 * - Blocks authenticated routes (dashboard, settings, admin)
 * - Blocks edit and create routes
 * - Blocks internal API routes (except public APIs)
 * - Provides sitemap URL for efficient crawling
 * - Includes crawl-delay for rate limiting
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = DEFAULT_SITE_METADATA.url;

  return {
    rules: [
      {
        allow: '/',
        crawlDelay: 1,
        disallow: [
          // Authenticated routes
          '/dashboard',
          '/dashboard/*',
          '/settings',
          '/settings/*',
          '/admin',
          '/admin/*',

          // Edit and create routes
          '/edit',
          '/edit/*',
          '/create',
          '/create/*',
          '*/edit',
          '*/edit/*',
          '*/create',
          '*/create/*',

          // Internal API routes (except public APIs)
          '/api/webhooks',
          '/api/webhooks/*',
          '/api/internal',
          '/api/internal/*',

          // Authentication routes
          '/sign-in',
          '/sign-up',
          '/sign-out',
        ],
        userAgent: '*',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
