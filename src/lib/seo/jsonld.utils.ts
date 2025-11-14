/**
 * JSON-LD Structured Data Utilities
 *
 * Functions for generating schema.org JSON-LD structured data for different content types.
 * This enables rich search results and improves search engine understanding of content.
 *
 * All schemas follow schema.org specifications and return properly formatted JSON-LD
 * with @context and @type properties.
 */

import type {
  BreadcrumbItem,
  BreadcrumbListSchema,
  CollectionPageSchema,
  OrganizationSchema,
  PersonSchema,
  ProductSchema,
} from './metadata.types';

import { DEFAULT_SITE_METADATA } from './seo.constants';

/**
 * Breadcrumb navigation item
 */
export interface BreadcrumbNavItem {
  /** Display name for the breadcrumb */
  name: string;
  /** URL for the breadcrumb (optional for last item) */
  url?: string;
}

/**
 * Parameters for generating a CollectionPage schema
 */
export interface GenerateCollectionPageSchemaParams {
  /** Collection description */
  description?: string;
  /** Number of items in the collection */
  itemsCount?: number;
  /** Collection name/title */
  name: string;
  /** Collection URL */
  url: string;
}

/**
 * Parameters for generating a Person schema
 */
export interface GeneratePersonSchemaParams {
  /** User's description/bio */
  description?: string;
  /** User's profile image URL */
  image?: string;
  /** User's display name */
  name: string;
  /** Social media profiles or other identifying URLs */
  sameAs?: Array<string>;
  /** User's profile URL */
  url?: string;
  /** User's unique identifier */
  userId: string;
}

/**
 * Parameters for generating a Product schema
 */
export interface GenerateProductSchemaParams {
  /** Brand name or manufacturer */
  brand?: string;
  /** Product category */
  category?: string;
  /** Date the product was created or added to the collection */
  dateCreated?: string;
  /** Product description */
  description?: string;
  /** Product image URL(s) */
  image?: Array<string> | string;
  /** Product name/title */
  name: string;
}

/**
 * Generates a BreadcrumbList schema for navigation breadcrumbs
 *
 * @param items - Array of breadcrumb navigation items
 * @returns BreadcrumbList JSON-LD schema
 *
 * @example
 * ```typescript
 * const breadcrumbSchema = generateBreadcrumbSchema([
 *   { name: 'Home', url: 'https://headshakers.com' },
 *   { name: 'Collections', url: 'https://headshakers.com/collections' },
 *   { name: 'Sports', url: 'https://headshakers.com/collections/sports' },
 *   { name: 'NBA' } // Last item typically doesn't have a URL
 * ]);
 * ```
 */
export function generateBreadcrumbSchema(items: Array<BreadcrumbNavItem>): BreadcrumbListSchema {
  const itemListElement: Array<BreadcrumbItem> = items.map((item, index) => {
    const breadcrumbItem: BreadcrumbItem = {
      '@type': 'ListItem',
      name: item.name,
      position: index + 1,
    };

    // Add item URL if provided (last breadcrumb may not have a URL)
    if (item.url) {
      breadcrumbItem.item = item.url;
    }

    return breadcrumbItem;
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

/**
 * Generates a CollectionPage schema for collection listing pages
 *
 * @param params - CollectionPage schema parameters
 * @returns CollectionPage JSON-LD schema
 *
 * @example
 * ```typescript
 * const collectionSchema = generateCollectionPageSchema({
 *   name: 'Sports Bobbleheads Collection',
 *   description: 'My collection of sports-themed bobbleheads',
 *   url: 'https://headshakers.com/collections/sports',
 *   itemsCount: 42
 * });
 * ```
 */
export function generateCollectionPageSchema(
  params: GenerateCollectionPageSchemaParams,
): CollectionPageSchema {
  const schema: CollectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: params.name,
    url: params.url,
  };

  if (params.description) {
    schema.description = params.description;
  }

  return schema;
}

/**
 * Generates an Organization schema for site-wide organization data
 *
 * @returns Organization JSON-LD schema
 *
 * @example
 * ```typescript
 * const orgSchema = generateOrganizationSchema();
 * // Returns the Head Shakers organization schema
 * ```
 */
export function generateOrganizationSchema(): OrganizationSchema {
  return {
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
  };
}

/**
 * Generates a Person schema for user profile pages
 *
 * @param params - Person schema parameters
 * @returns Person JSON-LD schema
 *
 * @example
 * ```typescript
 * const personSchema = generatePersonSchema({
 *   userId: 'user-123',
 *   name: 'John Collector',
 *   description: 'Bobblehead enthusiast since 2010',
 *   image: 'https://example.com/john.jpg',
 *   url: 'https://headshakers.com/collectors/john',
 *   sameAs: ['https://twitter.com/johncollector']
 * });
 * ```
 */
export function generatePersonSchema(params: GeneratePersonSchemaParams): PersonSchema {
  const schema: PersonSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: params.name,
  };

  if (params.description) {
    schema.description = params.description;
  }

  if (params.image) {
    schema.image = params.image;
  }

  if (params.url) {
    schema.url = params.url;
  }

  if (params.sameAs && params.sameAs.length > 0) {
    schema.sameAs = params.sameAs;
  }

  return schema;
}

/**
 * Generates a Product schema for bobblehead detail pages
 *
 * @param params - Product schema parameters
 * @returns Product JSON-LD schema
 *
 * @example
 * ```typescript
 * const productSchema = generateProductSchema({
 *   name: 'Michael Jordan Bulls Bobblehead',
 *   description: 'Limited edition Chicago Bulls bobblehead from 2020',
 *   image: ['https://example.com/mj1.jpg', 'https://example.com/mj2.jpg'],
 *   category: 'Sports',
 *   brand: 'FOCO',
 *   dateCreated: '2020-01-15'
 * });
 * ```
 */
export function generateProductSchema(params: GenerateProductSchemaParams): ProductSchema {
  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
  };

  if (params.description) {
    schema.description = params.description;
  }

  if (params.image) {
    schema.image = params.image;
  }

  if (params.category) {
    schema.category = params.category;
  }

  if (params.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: params.brand,
    };
  }

  return schema;
}
