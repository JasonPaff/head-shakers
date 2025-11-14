/**
 * SEO constants and configuration for Head Shakers platform
 *
 * This file contains centralized constants for metadata generation, including
 * character limits, image dimensions, default values, and supported schema types.
 */

import type { JsonLdSchema } from './metadata.types';

/**
 * Supported JSON-LD schema types for structured data
 *
 * These are the schema.org types that the application can generate
 * for different types of pages.
 */
export const SUPPORTED_SCHEMA_TYPES = [
  'Person',
  'Product',
  'Organization',
  'CollectionPage',
  'BreadcrumbList',
  'WebSite',
] as const;

/**
 * Type for supported schema types
 */
export type SupportedSchemaType = (typeof SUPPORTED_SCHEMA_TYPES)[number];

/**
 * Social media platform image dimensions
 *
 * These are the recommended dimensions for optimal display on each platform.
 * Images should be at least these sizes to avoid pixelation.
 */
export const IMAGE_DIMENSIONS = {
  /** Default fallback image dimensions */
  default: {
    height: 630,
    width: 1200,
  },
  /** Open Graph (Facebook, LinkedIn, etc.) - 1.91:1 aspect ratio */
  openGraph: {
    height: 630,
    width: 1200,
  },
  /** Twitter/X large image card - 1.91:1 aspect ratio */
  twitter: {
    height: 418,
    width: 800,
  },
  /** Twitter/X summary card - 1:1 aspect ratio */
  twitterSummary: {
    height: 400,
    width: 400,
  },
} as const;

/**
 * Character limits for metadata fields
 *
 * These limits are based on how search engines and social platforms
 * display metadata in their interfaces.
 */
export const CHARACTER_LIMITS = {
  /** Keywords (though not heavily used by modern search engines) */
  keywords: 10,
  /** Open Graph description (Facebook shows ~200 characters on desktop, ~110 on mobile) */
  ogDescription: 155,
  /** Open Graph title (Facebook truncates at ~60-70 characters) */
  ogTitle: 60,
  /** SEO meta description (Google shows ~155-160 characters) */
  pageDescription: 155,
  /** SEO page title (Google shows ~60 characters on desktop, ~50 on mobile) */
  pageTitle: 60,
  /** Twitter description (Twitter shows ~200 characters) */
  twitterDescription: 200,
  /** Twitter title (Twitter truncates at ~70 characters) */
  twitterTitle: 70,
} as const;

/**
 * Default site metadata
 *
 * These values are used as fallbacks when page-specific metadata is not available.
 */
export const DEFAULT_SITE_METADATA = {
  /** Default site description */
  description:
    'Discover, catalog, and share your bobblehead collection with collectors worldwide. Connect with enthusiasts, explore rare finds, and showcase your collection.',
  /** Default locale */
  locale: 'en_US',
  /** Default OG type for pages */
  ogType: 'website' as const,
  /** Site name */
  siteName: 'Head Shakers',
  /** Default site title */
  title: 'Head Shakers - Bobblehead Collection Platform',
  /** Default Twitter card type */
  twitterCard: 'summary_large_image' as const,
  /** Site Twitter/X handle */
  twitterHandle: '@headshakers',
  /** Site URL (should be set from environment variable in production) */
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://headshakers.com',
} as const;

/**
 * Default fallback values for metadata
 *
 * These are used when specific values are not provided for a page.
 */
export const FALLBACK_METADATA = {
  /** Default description when none is provided */
  description: DEFAULT_SITE_METADATA.description,
  /** Default image alt text */
  imageAlt: 'Head Shakers - Bobblehead Collection Platform',
  /** Default image URL (should be set to actual default image) */
  imageUrl: `${DEFAULT_SITE_METADATA.url}/images/og-default.jpg`,
  /** Default keywords */
  keywords: [
    'bobblehead',
    'collection',
    'collectibles',
    'bobbleheads',
    'collectors',
    'memorabilia',
    'sports collectibles',
    'pop culture',
  ],
  /** Default page title when none is provided */
  title: DEFAULT_SITE_METADATA.title,
} as const;

/**
 * Organization schema for the Head Shakers platform
 *
 * This is used on the homepage and about page to provide structured data
 * about the organization.
 */
export const ORGANIZATION_SCHEMA: Extract<JsonLdSchema, { '@type': 'Organization' }> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  description: DEFAULT_SITE_METADATA.description,
  logo: `${DEFAULT_SITE_METADATA.url}/images/logo.png`,
  name: DEFAULT_SITE_METADATA.siteName,
  sameAs: [
    // Add social media profiles here when available
    // 'https://twitter.com/headshakers',
    // 'https://facebook.com/headshakers',
  ],
  url: DEFAULT_SITE_METADATA.url,
} as const;

/**
 * Website schema for the Head Shakers platform
 *
 * This is used on the homepage to provide site-wide structured data.
 */
export const WEBSITE_SCHEMA: Extract<JsonLdSchema, { '@type': 'WebSite' }> = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  description: DEFAULT_SITE_METADATA.description,
  name: DEFAULT_SITE_METADATA.siteName,
  potentialAction: {
    '@type': 'SearchAction',
    'query-input': 'required name=search_term_string',
    target: `${DEFAULT_SITE_METADATA.url}/search?q={search_term_string}`,
  },
  url: DEFAULT_SITE_METADATA.url,
} as const;

/**
 * Robots meta tag configurations
 *
 * Pre-configured robots directives for common use cases.
 * Can be used as arrays of directives or as object configurations.
 */
export const ROBOTS_CONFIG = {
  /** Default robots directive - allow indexing and following all pages */
  default: ['index', 'follow'] as const,
  /** No follow - prevent search engines from following links on this page */
  noFollow: ['index', 'nofollow'] as const,
  /** No index - prevent search engines from indexing this page */
  noIndex: ['noindex', 'follow'] as const,
  /** No index and no follow - completely hide from search engines */
  none: ['noindex', 'nofollow'] as const,
} as const;

/**
 * Robots meta tag configurations as objects (alternative format)
 *
 * Object-based configuration with boolean flags for more readable code.
 */
export const ROBOTS_OBJECT_CONFIG = {
  /** Default robots directive - allow indexing and following all pages */
  default: {
    shouldFollow: true,
    shouldIndexPage: true,
  },
  /** No follow - prevent search engines from following links on this page */
  noFollow: {
    shouldFollow: false,
    shouldIndexPage: true,
  },
  /** No index - prevent search engines from indexing this page */
  noIndex: {
    shouldFollow: true,
    shouldIndexPage: false,
  },
  /** No index and no follow - completely hide from search engines */
  none: {
    shouldFollow: false,
    shouldIndexPage: false,
  },
} as const;

/**
 * Common error messages for metadata validation
 */
export const METADATA_ERRORS = {
  descriptionTooLong: `Description exceeds recommended length of ${CHARACTER_LIMITS.pageDescription} characters`,
  invalidImageDimensions: 'Image dimensions do not match recommended sizes',
  invalidUrl: 'Invalid URL provided',
  missingDescription: 'Description is required for page metadata',
  missingTitle: 'Title is required for page metadata',
  titleTooLong: `Title exceeds recommended length of ${CHARACTER_LIMITS.pageTitle} characters`,
} as const;
