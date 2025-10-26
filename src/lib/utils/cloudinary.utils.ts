/**
 * Cloudinary utility functions
 * Helper functions for working with Cloudinary URLs and assets
 */

import * as Sentry from '@sentry/nextjs';

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

    // Filter out transformation parameters
    // Transformation parameters typically contain underscores (e.g., 'c_fill', 'w_200')
    // but folder paths may also contain slashes
    // We keep parts that either don't contain underscores OR contain slashes (folder separators)
    const cleanParts = resourceParts.filter((part) => {
      // Skip version parameters (e.g., 'v1234567890')
      if (/^v\d+$/.test(part)) {
        return false;
      }

      // Skip transformation parameters (contain underscore but not slash)
      // Examples: c_fill, w_200, h_300, q_auto
      if (part.includes('_') && !part.includes('/')) {
        return false;
      }

      return true;
    });

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
