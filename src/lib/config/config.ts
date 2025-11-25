/**
 * Application configuration
 *
 * Centralizes all configuration settings including environment variables,
 * SEO metadata, and feature flags. This file ensures type safety and
 * provides validation for required environment variables.
 */

/**
 * Environment variable validation error
 */
class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Get optional environment variable
 *
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns The environment variable value or default
 */
function getOptionalEnvVar(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * Get required environment variable with validation
 *
 * @param key - Environment variable key
 * @param defaultValue - Optional default value for non-production environments
 * @returns The environment variable value
 * @throws {ConfigurationError} If the variable is missing in production
 */
function getRequiredEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (!value) {
    if (defaultValue !== undefined && process.env.NODE_ENV !== 'production') {
      return defaultValue;
    }
    throw new ConfigurationError(
      `Missing required environment variable: ${key}. Please add it to your .env file.`,
    );
  }

  return value;
}

/**
 * SEO Configuration
 *
 * Centralizes all SEO-related settings including site metadata, social media
 * configuration, and search engine verification tokens.
 *
 * Required environment variables:
 * - NEXT_PUBLIC_SITE_URL: Base URL of the site (e.g., https://headshakers.com)
 *
 * Optional environment variables:
 * - NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: Google Search Console verification token
 * - NEXT_PUBLIC_BING_SITE_VERIFICATION: Bing Webmaster verification token
 */
export const seoConfig = {
  /**
   * Default site description for fallback metadata
   */
  defaultDescription:
    'Discover, catalog, and share your bobblehead collection with collectors worldwide. Connect with enthusiasts, explore rare finds, and showcase your collection.',

  /**
   * JSON-LD structured data defaults
   */
  jsonLd: {
    /**
     * Contact information for organization
     */
    contactPoint: {
      contactType: 'customer support',
      email: 'support@headshakers.com', // Update with actual email
    },

    /**
     * Logo URL for organization schema
     */
    logoUrl: '/images/logo.png',

    /**
     * Organization name for schema.org markup
     */
    organizationName: 'Head Shakers',
  },

  /**
   * OpenGraph default configuration
   *
   * These values are used as fallbacks for OpenGraph metadata
   * when page-specific values are not provided.
   */
  openGraph: {
    /**
     * Default locale for content
     */
    locale: 'en_US',

    /**
     * Site name displayed in social previews
     */
    siteName: 'Head Shakers',

    /**
     * Default OpenGraph type for pages
     */
    type: 'website' as const,
  },

  /**
   * Site name displayed in metadata
   */
  siteName: 'Head Shakers',

  /**
   * Base site URL
   *
   * Used for generating canonical URLs, OpenGraph URLs, and sitemaps.
   * Should not include trailing slash.
   *
   * @example "https://headshakers.com"
   */
  siteUrl: getRequiredEnvVar('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),

  /**
   * Social media profile URLs
   *
   * Used in Organization schema, social meta tags, and footer social links.
   * The footer component automatically displays icons for any platforms with
   * configured URLs. Empty strings result in the platform being hidden from the footer.
   *
   * To enable a social platform in the footer:
   * 1. Add the full URL to the corresponding property below
   * 2. The icon and link will automatically appear in the footer
   * 3. Supported platforms: Facebook, Twitter, Instagram, LinkedIn
   */
  socialProfiles: {
    facebook: 'https://facebook.com/headshakers',
    instagram: 'https://instagram.com/headshakers',
    linkedin: 'https://linkedin.com/company/headshakers',
    twitter: 'https://twitter.com/headshakers',
  },

  /**
   * Twitter Card default configuration
   */
  twitter: {
    /**
     * Default card type for Twitter/X previews
     *
     * - summary: Small square image
     * - summary_large_image: Large rectangular image (recommended)
     */
    cardType: 'summary_large_image' as const,

    /**
     * Creator username for authored content
     */
    creator: '@headshakers',

    /**
     * Twitter/X username (with @ symbol)
     */
    site: '@headshakers',
  },

  /**
   * Twitter/X handle for the site (without @ symbol)
   */
  twitterHandle: 'headshakers',

  /**
   * Metadata verification tokens
   *
   * Used for search engine and webmaster tools verification.
   * These are added to the site's root layout metadata.
   */
  verification: {
    /**
     * Bing Webmaster Tools verification token
     *
     * Get from: https://www.bing.com/webmasters
     */
    bing: getOptionalEnvVar('NEXT_PUBLIC_BING_SITE_VERIFICATION'),

    /**
     * Google Search Console verification token
     *
     * Get from: https://search.google.com/search-console
     */
    google: getOptionalEnvVar('NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION'),
  },
} as const;

/**
 * Application configuration
 *
 * General application settings and feature flags.
 */
export const appConfig = {
  /**
   * Environment detection
   */
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },

  /**
   * Application name
   */
  name: seoConfig.siteName,

  /**
   * Application URL (base URL)
   */
  url: seoConfig.siteUrl,
} as const;

/**
 * CDN and external service configuration
 */
export const cdnConfig = {
  /**
   * Cloudinary configuration
   */
  cloudinary: {
    /**
     * Cloudinary CDN hostname for image optimization
     */
    cdnHostname: 'res.cloudinary.com',
    cloudName: getRequiredEnvVar('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
  },
} as const;

/**
 * Export all configuration
 */
export const config = {
  app: appConfig,
  cdn: cdnConfig,
  seo: seoConfig,
} as const;

export type AppConfig = typeof appConfig;
export type CdnConfig = typeof cdnConfig;
export type Config = typeof config;
/**
 * Type exports for configuration
 */
export type SeoConfig = typeof seoConfig;
