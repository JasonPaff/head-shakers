/**
 * Cloudinary utility functions
 * Helper functions for working with Cloudinary URLs and assets
 */

import * as Sentry from '@sentry/nextjs';

import { IMAGE_DIMENSIONS } from '@/lib/seo/seo.constants';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const DEFAULT_SOCIAL_IMAGE = '/images/og-default.jpg';

/**
 * Extracts the file format/extension from a Cloudinary URL
 *
 * @param url - The full Cloudinary URL
 * @returns The file extension (e.g., 'jpg', 'png', 'webp')
 *
 * @example
 * extractFormatFromCloudinaryUrl('https://res.cloudinary.com/demo/image/upload/photo.jpg') // returns: "jpg"
 */
export function extractFormatFromCloudinaryUrl(url: string): string {
  try {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1] || '';
    const fileNameParts = fileName.split('.');

    if (fileNameParts.length > 1) {
      return fileNameParts[fileNameParts.length - 1] || 'jpg';
    }

    return 'jpg'; // default format
  } catch (error) {
    Sentry.captureException(error, {
      extra: { operation: 'extract-format-cloudinary-url', url },
      level: 'warning',
    });
    return 'jpg';
  }
}

/**
 * Extracts the publicId from a Cloudinary URL
 * Handles various URL formats including transformations and different cloud configurations
 *
 * @param url - The full Cloudinary URL
 * @returns The extracted publicId (folder path + filename without extension)
 *
 * @example
 * // URL: https://res.cloudinary.com/demo/image/upload/v1234/users/abc/photo.jpg
 * extractPublicIdFromCloudinaryUrl(url) // returns: "users/abc/photo"
 *
 * // URL with transformations: https://res.cloudinary.com/demo/image/upload/c_fill,w_200/users/abc/photo.jpg
 * extractPublicIdFromCloudinaryUrl(url) // returns: "users/abc/photo"
 */
export function extractPublicIdFromCloudinaryUrl(url: string): string {
  try {
    // Split URL into parts
    const urlParts = url.split('/');

    // Find the 'upload' segment which separates the base URL from the resource path
    const uploadIndex = urlParts.indexOf('upload');

    if (uploadIndex === -1) {
      // If 'upload' is not found, return the URL as fallback
      return url;
    }

    // Get all parts after 'upload'
    const resourceParts = urlParts.slice(uploadIndex + 1);

    // Filter out transformation parameters and version numbers
    // Transformation parameters are: version numbers (v123456), and transformation strings (like c_fill,w_200)
    // These always come before the resource path
    const cleanParts: Array<string> = [];
    let hasFoundResourcePath = false;

    for (const part of resourceParts) {
      // Skip version parameters (e.g., 'v1234567890')
      if (/^v\d+$/.test(part)) {
        continue;
      }

      // Transformation parameters contain commas (e.g., 'c_fill,w_200,h_300')
      // Once we encounter a part without comma, we've reached the resource path
      if (!hasFoundResourcePath && part.includes(',')) {
        continue;
      }

      // Once we find a part without comma, we've reached the resource path
      hasFoundResourcePath = true;
      cleanParts.push(part);
    }

    // Join the clean parts back together
    const pathWithExtension = cleanParts.join('/');

    // Remove file extension from the last part
    const lastDotIndex = pathWithExtension.lastIndexOf('.');
    if (lastDotIndex > pathWithExtension.lastIndexOf('/')) {
      // Only remove extension if the dot is in the filename, not in a folder name
      return pathWithExtension.substring(0, lastDotIndex);
    }

    return pathWithExtension;
  } catch (error) {
    // If parsing fails for any reason, return the original URL
    Sentry.captureException(error, {
      extra: { operation: 'parse-cloudinary-url', url },
      level: 'warning',
    });
    return url;
  }
}

/**
 * Generates a low-quality blur placeholder URL for progressive image loading
 *
 * Creates a Cloudinary URL with blur and low quality transformations
 * suitable for use as a placeholder while the full image loads.
 *
 * @param publicId - The Cloudinary public ID of the image
 * @returns Blurred placeholder Cloudinary URL or empty string if publicId is invalid
 *
 * @example
 * generateBlurDataUrl('bobbleheads/item-123')
 * // returns: "https://res.cloudinary.com/demo/image/upload/c_fill,w_10,h_10,e_blur:1000,q_1,f_auto/bobbleheads/item-123"
 */
export function generateBlurDataUrl(publicId: string): string {
  try {
    if (!publicId || !CLOUDINARY_CLOUD_NAME) {
      return '';
    }

    // Use very small dimensions with blur effect for placeholder
    const transformations = 'c_fill,w_10,h_10,e_blur:1000,q_1,f_auto';

    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
  } catch (error) {
    Sentry.captureException(error, {
      extra: { operation: 'generate-blur-data-url', publicId },
      level: 'warning',
    });
    return '';
  }
}

/**
 * Generates an optimized Open Graph image URL for social sharing
 *
 * Creates a Cloudinary URL with transformations optimized for Open Graph
 * (Facebook, LinkedIn, etc.) using 1200x630 dimensions.
 *
 * @param publicId - The Cloudinary public ID of the image
 * @returns Optimized Cloudinary URL or default social image if publicId is invalid
 *
 * @example
 * generateOpenGraphImageUrl('bobbleheads/item-123')
 * // returns: "https://res.cloudinary.com/demo/image/upload/c_fill,w_1200,h_630,f_auto,q_auto/bobbleheads/item-123"
 */
export function generateOpenGraphImageUrl(publicId: string): string {
  try {
    if (!publicId || !CLOUDINARY_CLOUD_NAME) {
      return DEFAULT_SOCIAL_IMAGE;
    }

    const { height, width } = IMAGE_DIMENSIONS.openGraph;
    const transformations = `c_fill,w_${width},h_${height},f_auto,q_auto`;

    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
  } catch (error) {
    Sentry.captureException(error, {
      extra: { operation: 'generate-og-image-url', publicId },
      level: 'warning',
    });
    return DEFAULT_SOCIAL_IMAGE;
  }
}

/**
 * Generates an optimized social sharing image URL based on platform
 *
 * Creates a Cloudinary URL with platform-specific transformations.
 * Supports Open Graph (og), Twitter (twitter), and default dimensions.
 *
 * @param publicId - The Cloudinary public ID of the image
 * @param platform - The target social media platform ('og', 'twitter', or 'default')
 * @returns Optimized Cloudinary URL or default social image if publicId is invalid
 *
 * @example
 * generateSocialImageUrl('bobbleheads/item-123', 'og')
 * // returns: "https://res.cloudinary.com/demo/image/upload/c_fill,w_1200,h_630,f_auto,q_auto/bobbleheads/item-123"
 *
 * @example
 * generateSocialImageUrl('bobbleheads/item-123', 'twitter')
 * // returns: "https://res.cloudinary.com/demo/image/upload/c_fill,w_800,h_418,f_auto,q_auto/bobbleheads/item-123"
 */
export function generateSocialImageUrl(
  publicId: string,
  platform: 'default' | 'og' | 'twitter' = 'default',
): string {
  try {
    if (!publicId || !CLOUDINARY_CLOUD_NAME) {
      return DEFAULT_SOCIAL_IMAGE;
    }

    // Select appropriate dimensions based on platform
    let dimensions;
    switch (platform) {
      case 'og':
        dimensions = IMAGE_DIMENSIONS.openGraph;
        break;
      case 'twitter':
        dimensions = IMAGE_DIMENSIONS.twitter;
        break;
      default:
        dimensions = IMAGE_DIMENSIONS.default;
    }

    const { height, width } = dimensions;
    const transformations = `c_fill,w_${width},h_${height},f_auto,q_auto`;

    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
  } catch (error) {
    Sentry.captureException(error, {
      extra: { operation: 'generate-social-image-url', platform, publicId },
      level: 'warning',
    });
    return DEFAULT_SOCIAL_IMAGE;
  }
}

/**
 * Generates an optimized Twitter Card image URL for social sharing
 *
 * Creates a Cloudinary URL with transformations optimized for Twitter/X
 * large image cards using 800x418 dimensions.
 *
 * @param publicId - The Cloudinary public ID of the image
 * @returns Optimized Cloudinary URL or default social image if publicId is invalid
 *
 * @example
 * generateTwitterCardImageUrl('bobbleheads/item-123')
 * // returns: "https://res.cloudinary.com/demo/image/upload/c_fill,w_800,h_418,f_auto,q_auto/bobbleheads/item-123"
 */
export function generateTwitterCardImageUrl(publicId: string): string {
  try {
    if (!publicId || !CLOUDINARY_CLOUD_NAME) {
      return DEFAULT_SOCIAL_IMAGE;
    }

    const { height, width } = IMAGE_DIMENSIONS.twitter;
    const transformations = `c_fill,w_${width},h_${height},f_auto,q_auto`;

    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
  } catch (error) {
    Sentry.captureException(error, {
      extra: { operation: 'generate-twitter-image-url', publicId },
      level: 'warning',
    });
    return DEFAULT_SOCIAL_IMAGE;
  }
}
