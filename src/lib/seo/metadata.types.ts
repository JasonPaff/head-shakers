/**
 * Core SEO metadata types for Head Shakers platform
 *
 * These types provide type-safe metadata generation for pages across the application.
 * All types are designed to be compatible with Next.js 16 Metadata API.
 */

/**
 * Alternate language/canonical URLs
 *
 * Specifies alternate versions of the page for different languages or formats.
 */
export interface AlternatesMetadata {
  /** Canonical URL of the page */
  canonical?: string;
  /** Alternate language versions */
  languages?: Record<string, string>;
}

/**
 * Individual breadcrumb item
 */
export interface BreadcrumbItem {
  '@type': 'ListItem';
  item?: string;
  name: string;
  position: number;
}

/**
 * BreadcrumbList schema for navigation breadcrumbs
 *
 * Provides hierarchical navigation context to search engines.
 */
export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<BreadcrumbItem>;
}

/**
 * CollectionPage schema for collection pages
 *
 * Used on collection listing pages to indicate paginated content.
 */
export interface CollectionPageSchema {
  '@context': 'https://schema.org';
  '@type': 'CollectionPage';
  breadcrumb?: BreadcrumbListSchema;
  description?: string;
  name: string;
  url: string;
}

/**
 * JSON-LD Schema.org types supported by the application
 *
 * These schemas provide structured data for search engines to better
 * understand the content and context of pages.
 */
export type JsonLdSchema =
  | BreadcrumbListSchema
  | CollectionPageSchema
  | OrganizationSchema
  | PersonSchema
  | ProductSchema
  | WebSiteSchema;

/**
 * Open Graph image configuration
 */
export interface OpenGraphImage {
  /** Alt text for the image */
  alt?: string;
  /** The height of the image in pixels (recommended: 630) */
  height?: number;
  /** The MIME type of the image */
  type?: string;
  /** The URL of the image */
  url: string;
  /** The width of the image in pixels (recommended: 1200) */
  width?: number;
}

/**
 * Open Graph metadata configuration
 *
 * Used for social media sharing on Facebook, LinkedIn, and other platforms
 * that support the Open Graph protocol.
 *
 * Note: Next.js doesn't support all Open Graph types. We're limited to
 * 'article', 'profile', and 'website' for compatibility.
 */
export interface OpenGraphMetadata {
  /** A brief description of the page (recommended: max 155 characters) */
  description: string;
  /** Images to display in social media previews (recommended: 1200x630px) */
  images: Array<OpenGraphImage>;
  /** The locale of the content (e.g., 'en_US') */
  locale?: string;
  /** The site name displayed in social media previews */
  siteName?: string;
  /** The title of the page (recommended: max 60 characters) */
  title: string;
  /** The type of content - limited to Next.js supported types */
  type: 'article' | 'profile' | 'website';
  /** The canonical URL of the page */
  url: string;
}

/**
 * Organization schema for the site
 *
 * Used on the homepage and about page to provide structured data about
 * the Head Shakers platform.
 */
export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  description?: string;
  logo?: string;
  name: string;
  sameAs?: Array<string>;
  url: string;
}

/**
 * Complete page metadata configuration
 *
 * This is the main interface used throughout the application for generating
 * metadata for pages. It combines all SEO-related metadata into a single object.
 */
export interface PageMetadata {
  /** Alternate language versions of the page */
  alternates?: AlternatesMetadata;
  /** The canonical URL of the page (helps prevent duplicate content issues) */
  canonical?: string;
  /** A brief description of the page (recommended: max 155 characters) */
  description: string;
  /** JSON-LD structured data schema */
  jsonLd?: Array<JsonLdSchema> | JsonLdSchema;
  /** Keywords for the page (comma-separated, optional - modern SEO doesn't heavily rely on this) */
  keywords?: Array<string>;
  /** Open Graph metadata for social media sharing */
  openGraph?: OpenGraphMetadata;
  /** Robots meta tag directives */
  robots?: RobotsMetadata;
  /** The page title (recommended: max 60 characters) */
  title: string;
  /** Twitter Card metadata for Twitter/X sharing */
  twitter?: TwitterCardMetadata;
}

/**
 * Person schema for user profile pages
 *
 * Used on collector profile pages to provide structured data about users.
 */
export interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  description?: string;
  image?: string;
  name: string;
  sameAs?: Array<string>;
  url?: string;
}

/**
 * Product schema for bobblehead detail pages
 *
 * Used on individual bobblehead pages to provide structured data about
 * collectible items.
 */
export interface ProductSchema {
  '@context': 'https://schema.org';
  '@type': 'Product';
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  category?: string;
  description?: string;
  image?: Array<string> | string;
  name: string;
  offers?: {
    '@type': 'Offer';
    availability?: string;
    price?: string;
    priceCurrency?: string;
  };
}

/**
 * Robots meta tag directive
 *
 * Standard robots meta tag directives that control search engine behavior.
 * These match the HTML meta robots specification.
 */
export type RobotsDirective =
  | 'all'
  | 'follow'
  | 'index'
  | 'max-image-preview:large'
  | 'max-image-preview:none'
  | 'max-image-preview:standard'
  | 'max-snippet:-1'
  | 'max-video-preview:-1'
  | 'noarchive'
  | 'nofollow'
  | 'noimageindex'
  | 'noindex'
  | 'none'
  | 'nosnippet';

/**
 * Robots meta tag configuration
 *
 * Controls how search engines crawl and index the page.
 * Can be either a string of comma-separated directives or an object with boolean flags.
 */
export type RobotsMetadata =
  | Array<RobotsDirective>
  | RobotsDirective
  | {
      /** Whether to display image preview in search results */
      maxImagePreview?: 'large' | 'none' | 'standard';
      /** Maximum length of text snippet (-1 for no limit) */
      maxSnippet?: number;
      /** Maximum duration of video snippet in seconds (-1 for no limit) */
      maxVideoPreview?: number;
      /** Whether to prevent caching of this page */
      shouldArchive?: boolean;
      /** Whether search engines should follow links on this page */
      shouldFollow?: boolean;
      /** Whether to allow displaying images from this page in search results */
      shouldIndexImages?: boolean;
      /** Whether search engines should index this page */
      shouldIndexPage?: boolean;
      /** Whether to allow showing snippet in search results */
      shouldShowSnippet?: boolean;
    };

/**
 * SEO image configuration
 *
 * Generic image configuration used across different metadata types.
 */
export interface SeoImage {
  /** Alt text for the image */
  alt: string;
  /** The height of the image in pixels */
  height: number;
  /** The MIME type of the image */
  type?: string;
  /** The URL of the image */
  url: string;
  /** The width of the image in pixels */
  width: number;
}

/**
 * Twitter Card image configuration
 */
export interface TwitterCardImage {
  /** Alt text for the image */
  alt?: string;
  /** The URL of the image */
  url: string;
}

/**
 * Twitter Card metadata configuration
 *
 * Used for Twitter/X social media sharing. Twitter also falls back to
 * Open Graph tags if Twitter-specific tags are not provided.
 */
export interface TwitterCardMetadata {
  /** The type of Twitter card (recommended: 'summary_large_image') */
  card: 'app' | 'player' | 'summary' | 'summary_large_image';
  /** Twitter handle of the content creator */
  creator?: string;
  /** A brief description of the page (recommended: max 200 characters) */
  description: string;
  /** Image to display in Twitter preview (recommended: 800x418px) */
  images?: Array<TwitterCardImage>;
  /** Twitter handle of the site (e.g., '@headshakers') */
  site?: string;
  /** The title of the page (recommended: max 70 characters) */
  title: string;
}

/**
 * WebSite schema for the main site
 *
 * Used on the homepage to provide site-wide structured data.
 */
export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  description?: string;
  name: string;
  potentialAction?: {
    '@type': 'SearchAction';
    'query-input': string;
    target: string;
  };
  url: string;
}
