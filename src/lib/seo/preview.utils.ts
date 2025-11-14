import { timingSafeEqual } from 'crypto';
import { draftMode } from 'next/headers';

/**
 * Preview Mode Utilities
 *
 * Provides utilities for enabling and managing preview mode for content editors.
 * Preview mode allows editors to view draft content and verify metadata before publishing.
 *
 * Security Considerations:
 * - Preview tokens must be kept secret (use PREVIEW_SECRET environment variable)
 * - Use cryptographically secure token generation for production
 * - Tokens should expire after reasonable time (not implemented in basic version)
 * - Consider implementing one-time use tokens for enhanced security
 * - Always use HTTPS in production to protect tokens in transit
 *
 * Usage:
 * ```typescript
 * // Check if in preview mode
 * const previewing = await isPreviewMode();
 *
 * // Generate preview URL
 * const url = buildPreviewUrl('/bobbleheads/draft-bobblehead', 'secret123');
 * ```
 *
 * @see https://nextjs.org/docs/app/building-your-application/configuring/draft-mode
 */

/**
 * Preview mode configuration
 */
interface PreviewConfig {
  /**
   * Preview secret token from environment variable
   *
   * Set in .env:
   * PREVIEW_SECRET=your-secret-token-here
   */
  secret: string | undefined;
}

/**
 * Preview token validation result
 */
interface PreviewTokenValidation {
  /** Whether the token is valid */
  isValid: boolean;
  /** Optional error message if validation failed */
  message?: string;
}

/**
 * Build preview exit URL
 *
 * Constructs a URL that disables preview mode. Can optionally redirect
 * to a specific path after disabling preview.
 *
 * @param redirectPath - Optional path to redirect to after disabling preview
 * @param baseUrl - Optional base URL (defaults to current site URL or localhost)
 * @returns URL to disable preview mode
 *
 * @example
 * ```typescript
 * // Disable preview and stay on current page
 * const exitUrl = buildPreviewExitUrl();
 *
 * // Disable preview and redirect to homepage
 * const homeUrl = buildPreviewExitUrl('/');
 * ```
 */
export function buildPreviewExitUrl(redirectPath?: string, baseUrl?: string): string {
  const siteUrl = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const url = new URL('/api/preview', siteUrl);

  if (redirectPath) {
    const slug = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`;
    url.searchParams.set('redirect', slug);
  }

  return url.toString();
}

/**
 * Build preview URL with token
 *
 * Constructs a preview URL that enables preview mode and redirects to
 * the specified content path. The URL includes the preview token for
 * authentication.
 *
 * @param contentPath - The path to the content to preview (e.g., '/bobbleheads/draft-item')
 * @param token - Optional preview token (defaults to PREVIEW_SECRET from env)
 * @param baseUrl - Optional base URL (defaults to current site URL or localhost)
 * @returns Complete preview URL with authentication token
 *
 * @example
 * ```typescript
 * // Use environment token (recommended)
 * const url = buildPreviewUrl('/bobbleheads/new-item');
 * // Returns: http://localhost:3000/api/preview?token=SECRET&slug=/bobbleheads/new-item
 *
 * // Use custom token (for testing)
 * const testUrl = buildPreviewUrl('/collections/draft', 'test-token');
 * ```
 */
export function buildPreviewUrl(contentPath: string, token?: string, baseUrl?: string): string {
  // determine token to use
  const previewToken = token || getPreviewToken();

  if (!previewToken) {
    throw new Error('Preview token is required. Set PREVIEW_SECRET environment variable.');
  }

  // ensure content path starts with /
  const slug = contentPath.startsWith('/') ? contentPath : `/${contentPath}`;

  // determine base URL (use env variable or fallback)
  const siteUrl = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // construct preview URL with token and slug
  const url = new URL('/api/preview', siteUrl);
  url.searchParams.set('token', previewToken);
  url.searchParams.set('slug', slug);

  return url.toString();
}

/**
 * Get preview token from environment
 *
 * Returns the PREVIEW_SECRET environment variable. This is the token
 * that must be provided to enable preview mode.
 *
 * @returns The preview secret token or undefined if not configured
 *
 * @example
 * ```typescript
 * const token = getPreviewToken();
 * console.log('Use this token to enable preview:', token);
 * ```
 */
export function getPreviewToken(): string | undefined {
  const config = getPreviewConfig();
  return config.secret;
}

/**
 * Check if currently in preview mode
 *
 * This function checks the Next.js draft mode state to determine if
 * preview mode is currently enabled for the request.
 *
 * @returns Promise resolving to true if preview mode is enabled
 *
 * @example
 * ```typescript
 * // In a Server Component or Server Action
 * const previewing = await isPreviewMode();
 * if (previewing) {
 *   // Show draft content
 *   data = await getDraftContent();
 * } else {
 *   // Show published content only
 *   data = await getPublishedContent();
 * }
 * ```
 */
export async function isPreviewMode(): Promise<boolean> {
  const draft = await draftMode();
  return draft.isEnabled;
}

/**
 * Validate preview token using timing-safe comparison
 *
 * Compares the provided token against the PREVIEW_SECRET environment variable
 * using a timing-safe comparison to prevent timing attacks.
 *
 * @param token - The token to validate
 * @returns True if token is valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = validatePreviewToken(userProvidedToken);
 * if (isValid) {
 *   // Enable preview mode
 * } else {
 *   // Return 401 unauthorized
 * }
 * ```
 */
export function validatePreviewToken(token: string): boolean {
  const config = getPreviewConfig();

  // preview secret must be configured
  if (!config.secret) {
    console.warn('PREVIEW_SECRET environment variable not configured');
    return false;
  }

  // token must be provided
  if (!token || token.trim() === '') {
    return false;
  }

  try {
    // use timing-safe comparison to prevent timing attacks
    // this ensures the comparison takes constant time regardless of
    // where the first difference occurs in the strings
    const expectedBuffer = Buffer.from(config.secret, 'utf-8');
    const providedBuffer = Buffer.from(token, 'utf-8');

    // buffers must be same length for timingSafeEqual
    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    // constant-time comparison
    return timingSafeEqual(expectedBuffer, providedBuffer);
  } catch (error) {
    // comparison failed (likely due to invalid input)
    console.error('Preview token validation error:', error);
    return false;
  }
}

/**
 * Validate preview token with detailed error information
 *
 * Similar to validatePreviewToken but returns detailed validation result
 * with error messages for debugging and user feedback.
 *
 * @param token - The token to validate
 * @returns Validation result with isValid flag and optional error message
 *
 * @example
 * ```typescript
 * const result = validatePreviewTokenDetailed(userToken);
 * if (!result.isValid) {
 *   console.error('Invalid token:', result.message);
 * }
 * ```
 */
export function validatePreviewTokenDetailed(token: string): PreviewTokenValidation {
  const config = getPreviewConfig();

  if (!config.secret) {
    return {
      isValid: false,
      message: 'Preview mode is not configured (missing PREVIEW_SECRET)',
    };
  }

  if (!token || token.trim() === '') {
    return {
      isValid: false,
      message: 'Preview token is required',
    };
  }

  const isValid = validatePreviewToken(token);

  return {
    isValid,
    message: isValid ? undefined : 'Invalid preview token',
  };
}

/**
 * Get preview configuration from environment
 */
function getPreviewConfig(): PreviewConfig {
  return {
    secret: process.env.PREVIEW_SECRET,
  };
}

/**
 * Type exports
 */
export type { PreviewConfig, PreviewTokenValidation };
