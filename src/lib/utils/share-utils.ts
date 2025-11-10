/**
 * Share utility functions
 * Helper functions for generating shareable URLs, handling clipboard operations,
 * and creating social media share links
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Share options for generating social media URLs
 */
export interface ShareOptions {
  description?: string;
  title?: string;
  url: string;
}

/**
 * Social media platforms supported for sharing
 */
export type SharePlatform = 'facebook' | 'linkedin' | 'twitter';

/**
 * Copies text to clipboard using the Clipboard API
 *
 * @param text - The text to copy to clipboard
 * @returns Promise that resolves to true if successful, false otherwise
 *
 * @example
 * await copyToClipboard('https://example.com/share') // returns: true
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Check if clipboard API is available
    if (!navigator?.clipboard) {
      const error = new Error('Clipboard API not available');
      Sentry.captureException(error, {
        extra: { operation: 'copy-to-clipboard' },
        level: 'warning',
      });
      return false;
    }

    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    Sentry.captureException(error, {
      extra: { operation: 'copy-to-clipboard', textLength: text.length },
      level: 'warning',
    });
    return false;
  }
}

/**
 * Generates an absolute URL from a relative path
 *
 * @param relativePath - The relative path to convert to an absolute URL
 * @returns The absolute URL
 *
 * @example
 * generateAbsoluteUrl('/bobbleheads/123') // returns: "https://headshakers.com/bobbleheads/123"
 */
export function generateAbsoluteUrl(relativePath: string): string {
  try {
    const baseUrl = getBaseUrl();
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${baseUrl}${cleanPath}`;
  } catch (error) {
    Sentry.captureException(error, {
      extra: { operation: 'generate-absolute-url', relativePath },
      level: 'error',
    });
    throw error;
  }
}

/**
 * Generates a social media share URL for the specified platform
 *
 * @param platform - The social media platform ('twitter', 'facebook', 'linkedin')
 * @param options - Share options including url, title, and description
 * @returns The social media share URL
 *
 * @example
 * generateSocialShareUrl('twitter', {
 *   url: 'https://example.com/bobblehead/123',
 *   title: 'Check out this bobblehead!',
 *   description: 'Amazing collectible'
 * })
 */
export function generateSocialShareUrl(platform: SharePlatform, options: ShareOptions): string {
  try {
    const { description = '', title = '', url } = options;

    switch (platform) {
      case 'facebook': {
        // Facebook share URL format: https://www.facebook.com/sharer/sharer.php?u={url}
        const params = new URLSearchParams({ u: url });
        return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
      }

      case 'linkedin': {
        // LinkedIn share URL format: https://www.linkedin.com/sharing/share-offsite/?url={url}
        const params = new URLSearchParams({ url });
        return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
      }

      case 'twitter': {
        // Twitter/X share URL format: https://twitter.com/intent/tweet?url={url}&text={text}
        const text = title ? `${title}${description ? ` - ${description}` : ''}` : description;
        const params = new URLSearchParams({
          url,
          ...(text && { text }),
        });
        return `https://twitter.com/intent/tweet?${params.toString()}`;
      }

      default: {
        const error = new Error(`Unsupported share platform: ${platform as string}`);
        Sentry.captureException(error, {
          extra: { operation: 'generate-social-share-url', platform },
          level: 'warning',
        });
        throw error;
      }
    }
  } catch (error) {
    Sentry.captureException(error, {
      extra: { operation: 'generate-social-share-url', options, platform },
      level: 'error',
    });
    throw error;
  }
}

/**
 * Gets the base URL for the application
 * Uses NEXT_PUBLIC_APP_URL environment variable
 *
 * @returns The base URL for the application
 * @throws Error if NEXT_PUBLIC_APP_URL is not configured
 *
 * @example
 * getBaseUrl() // returns: "https://headshakers.com"
 */
export function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) {
    const error = new Error('NEXT_PUBLIC_APP_URL environment variable is not configured');
    Sentry.captureException(error, {
      extra: { operation: 'get-base-url' },
      level: 'error',
    });
    throw error;
  }

  return baseUrl;
}

/**
 * Opens a URL in a new window with specified dimensions
 * Commonly used for social media share popups
 *
 * @param url - The URL to open
 * @param width - Window width in pixels (default: 600)
 * @param height - Window height in pixels (default: 400)
 *
 * @example
 * openShareWindow('https://twitter.com/intent/tweet?url=...', 600, 400)
 */
export function openShareWindow(url: string, width = 600, height = 400): void {
  try {
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      url,
      'share',
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0`,
    );
  } catch (error) {
    Sentry.captureException(error, {
      extra: { operation: 'open-share-window', url },
      level: 'warning',
    });
    // Fallback to regular window.open
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
