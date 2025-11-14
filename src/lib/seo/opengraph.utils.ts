/**
 * OpenGraph and Twitter Card metadata utilities
 *
 * Provides functions to generate properly formatted metadata objects for
 * social media sharing on platforms like Facebook, LinkedIn, and Twitter/X.
 */

import type {
  OpenGraphImage,
  OpenGraphMetadata,
  TwitterCardImage,
  TwitterCardMetadata,
} from './metadata.types';

import { CHARACTER_LIMITS, DEFAULT_SITE_METADATA, IMAGE_DIMENSIONS } from './seo.constants';

/**
 * Generates base metadata properties shared by both Open Graph and Twitter Card
 *
 * @param title - The page title
 * @param description - The page description
 * @returns Object containing shared metadata properties
 */
export function generateBaseMetadata(
  title: string,
  description: string,
): {
  description: string;
  title: string;
} {
  return {
    description: description || DEFAULT_SITE_METADATA.description,
    title: title || DEFAULT_SITE_METADATA.title,
  };
}

/**
 * Generates Open Graph metadata for social media sharing
 *
 * Creates properly formatted Open Graph metadata compatible with Next.js Metadata API.
 * Enforces character limits and provides sensible defaults.
 *
 * @param options - Configuration object for Open Graph metadata
 * @param options.title - The page title (max 60 characters, truncated if longer)
 * @param options.description - The page description (max 155 characters, truncated if longer)
 * @param options.images - Array of images for social preview (recommended: 1200x630px)
 * @param options.url - The canonical URL of the page
 * @param options.type - The type of content (default: 'website')
 * @param options.siteName - The site name (default: from constants)
 * @param options.locale - The locale of the content (default: 'en_US')
 * @returns Properly formatted Open Graph metadata object
 *
 * @example
 * generateOpenGraphMetadata({
 *   title: 'My Collection',
 *   description: 'Check out my bobblehead collection',
 *   images: [{ url: 'https://example.com/image.jpg', width: 1200, height: 630 }],
 *   url: 'https://headshakers.com/collections/123',
 * })
 */
export function generateOpenGraphMetadata(options: {
  description: string;
  images?: Array<OpenGraphImage>;
  locale?: string;
  siteName?: string;
  title: string;
  type?: 'article' | 'product' | 'profile' | 'website';
  url: string;
}): OpenGraphMetadata {
  const {
    description,
    images = [],
    locale = DEFAULT_SITE_METADATA.locale,
    siteName = DEFAULT_SITE_METADATA.siteName,
    title,
    type = DEFAULT_SITE_METADATA.ogType,
    url,
  } = options;

  // Enforce character limits with truncation
  const truncatedTitle = truncateWithEllipsis(title, CHARACTER_LIMITS.ogTitle);
  const truncatedDescription = truncateWithEllipsis(description, CHARACTER_LIMITS.ogDescription);

  // Ensure images have proper dimensions
  const formattedImages: Array<OpenGraphImage> = images.map((image) => ({
    alt: image.alt || truncatedTitle,
    height: image.height || IMAGE_DIMENSIONS.openGraph.height,
    type: image.type || 'image/jpeg',
    url: image.url,
    width: image.width || IMAGE_DIMENSIONS.openGraph.width,
  }));

  return {
    description: truncatedDescription,
    images: formattedImages,
    locale,
    siteName,
    title: truncatedTitle,
    type,
    url,
  };
}

/**
 * Generates Twitter Card metadata for Twitter/X sharing
 *
 * Creates properly formatted Twitter Card metadata compatible with Next.js Metadata API.
 * Enforces character limits and provides sensible defaults.
 *
 * @param options - Configuration object for Twitter Card metadata
 * @param options.title - The page title (max 70 characters, truncated if longer)
 * @param options.description - The page description (max 200 characters, truncated if longer)
 * @param options.images - Array of images for Twitter preview (recommended: 800x418px)
 * @param options.card - The type of Twitter card (default: 'summary_large_image')
 * @param options.site - Twitter handle of the site (default: from constants)
 * @param options.creator - Twitter handle of the content creator
 * @returns Properly formatted Twitter Card metadata object
 *
 * @example
 * generateTwitterCardMetadata({
 *   title: 'My Collection',
 *   description: 'Check out my bobblehead collection',
 *   images: [{ url: 'https://example.com/image.jpg' }],
 *   creator: '@collector123',
 * })
 */
export function generateTwitterCardMetadata(options: {
  card?: 'app' | 'player' | 'summary' | 'summary_large_image';
  creator?: string;
  description: string;
  images?: Array<TwitterCardImage>;
  site?: string;
  title: string;
}): TwitterCardMetadata {
  const {
    card = DEFAULT_SITE_METADATA.twitterCard,
    creator,
    description,
    images = [],
    site = DEFAULT_SITE_METADATA.twitterHandle,
    title,
  } = options;

  // Enforce character limits with truncation
  const truncatedTitle = truncateWithEllipsis(title, CHARACTER_LIMITS.twitterTitle);
  const truncatedDescription = truncateWithEllipsis(description, CHARACTER_LIMITS.twitterDescription);

  // Format images with proper alt text
  const formattedImages: Array<TwitterCardImage> = images.map((image) => ({
    alt: image.alt || truncatedTitle,
    url: image.url,
  }));

  return {
    card,
    ...(creator && { creator }),
    description: truncatedDescription,
    ...(formattedImages.length > 0 && { images: formattedImages }),
    site,
    title: truncatedTitle,
  };
}

/**
 * Truncates text to a maximum length with ellipsis
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum number of characters
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * truncateWithEllipsis('This is a very long title that needs truncating', 20)
 * // returns: "This is a very lo..."
 */
function truncateWithEllipsis(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.substring(0, maxLength - 3)}...`;
}
