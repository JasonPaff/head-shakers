/**
 * Main SEO Metadata Generation Utilities
 *
 * This module provides the primary orchestration layer for generating complete
 * metadata objects compatible with Next.js 16 Metadata API. It combines all
 * metadata components (Open Graph, Twitter Card, JSON-LD) into a single interface.
 *
 * Features:
 * - Type-safe canonical URL generation using next-typesafe-url
 * - Automatic robots meta tag generation based on page visibility
 * - Search engine verification meta tags from environment variables
 * - Dynamic title templates with site name appending
 * - Support for alternate language links (i18n ready)
 * - Integration with all SEO utilities (OG, Twitter, JSON-LD, Cloudinary)
 */

import type { Metadata } from 'next';

import * as Sentry from '@sentry/nextjs';

import type {
  AlternatesMetadata,
  JsonLdSchema,
  OpenGraphImage,
  RobotsMetadata,
  TwitterCardImage,
} from './metadata.types';

import { generateOpenGraphMetadata, generateTwitterCardMetadata } from './opengraph.utils';
import { DEFAULT_SITE_METADATA, FALLBACK_METADATA, ROBOTS_CONFIG } from './seo.constants';

/**
 * Options for metadata generation
 */
export interface GenerateMetadataOptions {
  /** Whether the page should be indexed by search engines */
  isIndexable?: boolean;
  /** Whether the page is publicly accessible (affects robots tags) */
  isPublic?: boolean;
  /** JSON-LD schemas to include */
  jsonLd?: Array<JsonLdSchema> | JsonLdSchema;
  /** Override default robots configuration */
  robots?: RobotsMetadata;
  /** Whether to include default Open Graph metadata */
  shouldIncludeOpenGraph?: boolean;
  /** Whether to include default Twitter Card metadata */
  shouldIncludeTwitterCard?: boolean;
  /** Whether to append site name to title */
  shouldUseTitleTemplate?: boolean;
}

/**
 * Content data for metadata generation
 *
 * This flexible interface allows passing different content types while
 * maintaining type safety for common fields.
 */
export interface MetadataContentData {
  /** Brand name for products */
  brand?: string;
  /** Category for products or collections */
  category?: string;
  /** Twitter handle of content creator */
  creatorHandle?: string;
  /** Content description */
  description?: string;
  /** Content images */
  images?: Array<OpenGraphImage | string | TwitterCardImage>;
  /** Keywords for the content */
  keywords?: Array<string>;
  /** Content title */
  title: string;
  /** Content URL or path parameters */
  url?: string;
  /** User ID for profile pages */
  userId?: string;
}

/**
 * Page type classification for metadata generation
 *
 * Different page types may have different default behaviors for indexing,
 * social sharing, and structured data.
 */
export type PageType = 'article' | 'bobblehead' | 'collection' | 'home' | 'profile' | 'public' | 'search';

/**
 * Generates alternate links for canonical URL and language variants
 *
 * Sets up the canonical URL to prevent duplicate content issues and prepares
 * the structure for future internationalization support.
 *
 * @param canonicalUrl - The canonical URL of the page
 * @param languages - Optional language variants (for future i18n support)
 * @returns Alternates metadata object
 *
 * @example
 * ```typescript
 * generateAlternates('https://headshakers.com/collections/123')
 * // Returns: { canonical: 'https://headshakers.com/collections/123' }
 *
 * // Future i18n support:
 * generateAlternates('https://headshakers.com/collections/123', {
 *   'en-US': 'https://headshakers.com/en/collections/123',
 *   'es-ES': 'https://headshakers.com/es/collections/123',
 * })
 * ```
 */
export function generateAlternates(
  canonicalUrl: string,
  languages?: Record<string, string>,
): AlternatesMetadata {
  const alternates: AlternatesMetadata = {
    canonical: canonicalUrl,
  };

  if (languages && Object.keys(languages).length > 0) {
    alternates.languages = languages;
  }

  return alternates;
}

/**
 * Generates complete page metadata for Next.js pages
 *
 * This is the primary interface for generating SEO metadata across the application.
 * It orchestrates all metadata components and returns a complete Next.js Metadata object.
 *
 * @param pageType - The type of page being rendered
 * @param content - Content data for the page
 * @param options - Additional metadata generation options
 * @returns Complete Next.js Metadata object
 *
 * @example
 * ```typescript
 * // Bobblehead detail page
 * export async function generateMetadata({ params }): Promise<Metadata> {
 *   const bobblehead = await getBobblehead(params.slug);
 *
 *   return generatePageMetadata('bobblehead', {
 *     title: bobblehead.name,
 *     description: bobblehead.description,
 *     images: [bobblehead.imageUrl],
 *     category: bobblehead.category,
 *     brand: bobblehead.manufacturer,
 *   }, {
 *     isPublic: bobblehead.isPublic,
 *     shouldUseTitleTemplate: true,
 *   });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // User profile page
 * export async function generateMetadata({ params }): Promise<Metadata> {
 *   const user = await getUser(params.userId);
 *
 *   return generatePageMetadata('profile', {
 *     title: user.displayName,
 *     description: user.bio,
 *     images: [user.avatarUrl],
 *     userId: user.id,
 *   }, {
 *     isPublic: user.isPublicProfile,
 *     shouldIncludeOpenGraph: true,
 *     shouldIncludeTwitterCard: true,
 *   });
 * }
 * ```
 */
export function generatePageMetadata(
  pageType: PageType,
  content: MetadataContentData,
  options: GenerateMetadataOptions = {},
): Metadata {
  return Sentry.startSpan(
    {
      attributes: {
        contentType: pageType,
        hasImages: !!(content.images && content.images.length > 0),
        includeOG: options.shouldIncludeOpenGraph !== false,
        includeTwitter: options.shouldIncludeTwitterCard !== false,
      },
      name: 'seo.metadata.generate',
      op: 'seo.metadata',
    },
    () => {
      const {
        isIndexable = true,
        isPublic = true,
        robots,
        shouldIncludeOpenGraph = true,
        shouldIncludeTwitterCard = true,
      } = options;

      // Add breadcrumb for metadata generation start
      Sentry.addBreadcrumb({
        category: 'seo',
        data: {
          contentTitle: content.title,
          hasDescription: !!content.description,
          isIndexable,
          isPublic,
        },
        level: 'info',
        message: `Generating metadata for ${pageType}`,
      });

      // Use title as-is - root layout handles template via title.template
      const title = content.title;

      // Use provided description or fallback
      const description = content.description || FALLBACK_METADATA.description;

      // Generate canonical URL
      const canonicalUrl = content.url || DEFAULT_SITE_METADATA.url;

      // Build base metadata
      const metadata: Metadata = {
        description,
        title,
      };

      // Add keywords if provided
      if (content.keywords && content.keywords.length > 0) {
        metadata.keywords = content.keywords;
        Sentry.addBreadcrumb({
          category: 'seo',
          data: { keywordCount: content.keywords.length },
          level: 'debug',
          message: 'Added keywords to metadata',
        });
      }

      // Add alternates (canonical URL and future language support)
      metadata.alternates = generateAlternates(canonicalUrl);

      // Add robots meta tag
      const robotsDirectives = robots || generateRobotsMetadata(isIndexable, isPublic);
      // Convert RobotsMetadata to Next.js-compatible format
      metadata.robots = convertRobotsMetadata(robotsDirectives);

      // Add verification meta tags
      const verificationTags = generateVerificationMetaTags();
      if (verificationTags && Object.keys(verificationTags).length > 0) {
        metadata.verification = verificationTags;
        Sentry.addBreadcrumb({
          category: 'seo',
          data: { verificationCount: Object.keys(verificationTags).length },
          level: 'debug',
          message: 'Added verification tags',
        });
      }

      // Add Open Graph metadata
      if (shouldIncludeOpenGraph) {
        Sentry.startSpan(
          {
            name: 'seo.metadata.opengraph',
            op: 'seo.metadata.component',
          },
          () => {
            const ogType = getOpenGraphType(pageType);
            const ogImages = normalizeImages(content.images);

            metadata.openGraph = generateOpenGraphMetadata({
              description,
              images: ogImages,
              title: content.title, // Use original title without template for OG
              type: ogType,
              url: canonicalUrl,
            });

            Sentry.addBreadcrumb({
              category: 'seo',
              data: { imageCount: ogImages.length, ogType },
              level: 'debug',
              message: 'Generated Open Graph metadata',
            });
          },
        );
      }

      // Add Twitter Card metadata
      if (shouldIncludeTwitterCard) {
        Sentry.startSpan(
          {
            name: 'seo.metadata.twitter',
            op: 'seo.metadata.component',
          },
          () => {
            const twitterImages = normalizeImages(content.images, 'twitter');

            metadata.twitter = generateTwitterCardMetadata({
              creator: content.creatorHandle,
              description,
              images: twitterImages,
              title: content.title, // Use original title without template for Twitter
            });

            Sentry.addBreadcrumb({
              category: 'seo',
              data: { hasCreator: !!content.creatorHandle, imageCount: twitterImages.length },
              level: 'debug',
              message: 'Generated Twitter Card metadata',
            });
          },
        );
      }

      // Add final breadcrumb with metadata summary
      Sentry.addBreadcrumb({
        category: 'seo',
        data: {
          hasAlternates: !!metadata.alternates,
          hasKeywords: !!(metadata.keywords && metadata.keywords.length > 0),
          hasOG: !!metadata.openGraph,
          hasTwitter: !!metadata.twitter,
          hasVerification: !!metadata.verification,
        },
        level: 'info',
        message: 'Metadata generation complete',
      });

      // Note: JSON-LD structured data is not included in the metadata object
      // because Next.js doesn't have native support for it in the Metadata API.
      // Use the renderJsonLd() helper function to render JSON-LD in your page component.
      // See jsonld.utils.ts for schema generation functions.

      return metadata;
    },
  );
}

/**
 * Generates robots meta tag based on page visibility settings
 *
 * Creates appropriate robots directives for search engine crawlers based on
 * whether the page should be indexed and if it's publicly accessible.
 *
 * @param isIndexable - Whether the page should be indexed
 * @param isPublic - Whether the page is publicly accessible
 * @returns Robots metadata configuration
 *
 * @example
 * ```typescript
 * // Public, indexable page
 * generateRobotsMetadata(true, true)
 * // Returns: ['index', 'follow']
 *
 * // Private page (requires authentication)
 * generateRobotsMetadata(true, false)
 * // Returns: ['noindex', 'nofollow']
 *
 * // Public but not indexable (e.g., search results page)
 * generateRobotsMetadata(false, true)
 * // Returns: ['noindex', 'follow']
 * ```
 */
export function generateRobotsMetadata(isIndexable: boolean, isPublic: boolean): RobotsMetadata {
  // Private pages should not be indexed
  if (!isPublic) {
    return [...ROBOTS_CONFIG.none];
  }

  // Public but not indexable (e.g., search results, paginated pages)
  if (!isIndexable) {
    return [...ROBOTS_CONFIG.noIndex];
  }

  // Public and indexable - default behavior
  return [...ROBOTS_CONFIG.default];
}

/**
 * Generates a formatted page title with site name template
 *
 * Appends the site name to the page title for better branding in search results
 * and browser tabs. Handles edge cases like empty titles or titles that already
 * include the site name.
 *
 * @param pageTitle - The page-specific title
 * @returns Formatted title with site name
 *
 * @example
 * ```typescript
 * generateTitle('My Collection')
 * // Returns: "My Collection | Head Shakers"
 *
 * generateTitle('Head Shakers')
 * // Returns: "Head Shakers" (no duplication)
 * ```
 */
export function generateTitle(pageTitle: string): string {
  if (!pageTitle || pageTitle.trim() === '') {
    return DEFAULT_SITE_METADATA.siteName;
  }

  // Avoid duplicate site name
  if (pageTitle.toLowerCase().includes(DEFAULT_SITE_METADATA.siteName.toLowerCase())) {
    return pageTitle;
  }

  return `${pageTitle} | ${DEFAULT_SITE_METADATA.siteName}`;
}

/**
 * Generates verification meta tags for search consoles
 *
 * Reads verification codes from environment variables and generates the
 * appropriate meta tags for Google Search Console, Bing Webmaster Tools, etc.
 *
 * Environment variables:
 * - NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
 * - NEXT_PUBLIC_BING_SITE_VERIFICATION
 * - NEXT_PUBLIC_YANDEX_SITE_VERIFICATION
 *
 * @returns Verification meta tags object
 *
 * @example
 * ```typescript
 * // With environment variables set:
 * generateVerificationMetaTags()
 * // Returns: {
 * //   google: 'abc123...',
 * //   bing: 'xyz789...',
 * // }
 * ```
 */
export function generateVerificationMetaTags(): Record<string, string> {
  const verification: Record<string, string> = {};

  if (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) {
    verification.google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  }

  if (process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION) {
    verification.bing = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
  }

  if (process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION) {
    verification.yandex = process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION;
  }

  return verification;
}

/**
 * Serializes JSON-LD schema to a string for script tag rendering
 *
 * This helper function is used to prepare JSON-LD schemas for rendering in page components
 * since Next.js doesn't support JSON-LD in the Metadata API.
 *
 * @param schema - The JSON-LD schema to serialize
 * @returns Serialized JSON-LD string
 *
 * @example
 * ```tsx
 * import { generateProductSchema } from '@/lib/seo/jsonld.utils';
 * import { serializeJsonLd } from '@/lib/seo/metadata.utils';
 *
 * export default function BobbleheadPage({ bobblehead }) {
 *   const productSchema = generateProductSchema({
 *     name: bobblehead.name,
 *     description: bobblehead.description,
 *     image: [bobblehead.imageUrl],
 *   });
 *
 *   return (
 *     <>
 *       <script
 *         type="application/ld+json"
 *         dangerouslySetInnerHTML={{ __html: serializeJsonLd(productSchema) }}
 *       />
 *       <div>{bobblehead.name}</div>
 *     </>
 *   );
 * }
 * ```
 */
export function serializeJsonLd(schema: JsonLdSchema): string {
  return JSON.stringify(schema);
}

/**
 * Converts RobotsMetadata to Next.js-compatible format
 *
 * Next.js expects robots metadata as either a string or an object with boolean properties,
 * not as an array of directives. This function handles the conversion.
 *
 * @param robotsMetadata - The robots metadata to convert
 * @returns Next.js-compatible robots metadata (string or object)
 */
function convertRobotsMetadata(
  robotsMetadata: RobotsMetadata,
): string | { follow?: boolean; index?: boolean } {
  // If already a string, return as-is
  if (typeof robotsMetadata === 'string') {
    return robotsMetadata;
  }

  // If it's an array, convert to comma-separated string
  if (Array.isArray(robotsMetadata)) {
    return robotsMetadata.join(', ');
  }

  // If it's an object with our custom boolean flags, convert to Next.js format
  if ('shouldIndexPage' in robotsMetadata) {
    return {
      follow: robotsMetadata.shouldFollow,
      index: robotsMetadata.shouldIndexPage,
    };
  }

  // Otherwise, it's already in the correct object format
  return robotsMetadata as { follow?: boolean; index?: boolean };
}

/**
 * Maps page type to Open Graph type
 *
 * Different page types map to different Open Graph types for better
 * social media representation.
 *
 * Note: Next.js doesn't support 'product' as an OpenGraph type in its Metadata API,
 * even though the Open Graph protocol does. For product pages (bobbleheads),
 * we use 'website' which is the most appropriate fallback.
 *
 * @param pageType - The application page type
 * @returns Open Graph type
 */
function getOpenGraphType(pageType: PageType): 'article' | 'profile' | 'website' {
  switch (pageType) {
    case 'article':
      return 'article';
    case 'bobblehead':
      // Next.js doesn't support 'product' type, use 'website' instead
      return 'website';
    case 'profile':
      return 'profile';
    case 'collection':
    case 'home':
    case 'public':
    case 'search':
    default:
      return 'website';
  }
}

/**
 * Normalizes image input to proper format for metadata
 *
 * Handles different image input formats (strings, objects) and converts them
 * to the appropriate format for Open Graph or Twitter Card metadata.
 *
 * @param images - Array of image URLs or image objects
 * @param targetFormat - Target format (opengraph or twitter)
 * @returns Array of properly formatted image objects
 */
function normalizeImages(
  images?: Array<OpenGraphImage | string | TwitterCardImage>,
  targetFormat: 'opengraph' | 'twitter' = 'opengraph',
): Array<OpenGraphImage | TwitterCardImage> {
  if (!images || images.length === 0) {
    // Use fallback image
    const fallbackUrl = FALLBACK_METADATA.imageUrl;
    const fallbackAlt = FALLBACK_METADATA.imageAlt;

    if (targetFormat === 'twitter') {
      return [{ alt: fallbackAlt, url: fallbackUrl }];
    }

    return [
      {
        alt: fallbackAlt,
        height: 630,
        type: 'image/jpeg',
        url: fallbackUrl,
        width: 1200,
      },
    ];
  }

  return images.map((image) => {
    if (typeof image === 'string') {
      // Convert string URL to proper object
      if (targetFormat === 'twitter') {
        return {
          alt: FALLBACK_METADATA.imageAlt,
          url: image,
        };
      }

      return {
        alt: FALLBACK_METADATA.imageAlt,
        height: 630,
        type: 'image/jpeg',
        url: image,
        width: 1200,
      };
    }

    // Already an object, ensure it has required fields
    if (targetFormat === 'twitter') {
      return {
        alt: 'alt' in image ? image.alt : FALLBACK_METADATA.imageAlt,
        url: image.url,
      };
    }

    return {
      alt: 'alt' in image && image.alt ? image.alt : FALLBACK_METADATA.imageAlt,
      height: 'height' in image && image.height ? image.height : 630,
      type: 'type' in image && image.type ? image.type : 'image/jpeg',
      url: image.url,
      width: 'width' in image && image.width ? image.width : 1200,
    };
  });
}
