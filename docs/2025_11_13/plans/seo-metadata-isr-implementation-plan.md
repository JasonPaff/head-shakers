# SEO, Metadata Generation, and ISR Implementation Plan

**Generated**: 2025-11-13
**Original Request**: the app should have improved SEO, proper metadata generation and ISR features.
**Estimated Duration**: 5-6 days
**Complexity**: High
**Risk Level**: Medium

## Analysis Summary

- Feature request refined with project context (343 words)
- Discovered 42+ files across all architectural layers
- Generated 24-step implementation plan with 4 phases
- Identified existing patterns: ISR in featured page, facade pattern, Cloudinary integration

## Refined Feature Request

The Head Shakers application should implement comprehensive SEO optimization and dynamic metadata generation to improve search engine visibility and social media shareability across all public and authenticated routes. Specifically, the app needs to generate proper Open Graph (OG) meta tags, Twitter Card metadata, and structured JSON-LD schema markup for key content types including user profile pages, bobblehead collection pages, individual bobblehead catalog entries, and public landing pages (about, terms, privacy). This should be accomplished using Next.js 16's built-in metadata API and generateMetadata function to create dynamic, route-specific metadata based on actual content from the PostgreSQL database queried through Drizzle ORM, ensuring that when users share collection links or bobblehead catalog entries on social platforms, rich previews display with appropriate images from Cloudinary, descriptions, and structured data. Additionally, the application should leverage Incremental Static Regeneration (ISR) to pre-render and cache critical public pages and frequently accessed content (such as featured collections, trending bobbleheads, and user profile previews) with configurable revalidation intervals, reducing server load while maintaining content freshness. For authenticated routes like the user dashboard and personal collections, the app should implement dynamic server-side rendering with appropriate cache headers and preview mode support for content editors. The SEO implementation should include XML sitemap generation for all indexable routes, robots.txt configuration to guide search crawlers, canonical URL tags to prevent duplicate content issues, and proper heading hierarchy across templates. Performance metrics like Core Web Vitals should be monitored through existing Sentry integration, and all metadata generation should be thoroughly tested to ensure consistency across different content types and that Cloudinary image URLs are properly optimized for social sharing with appropriate sizing and format parameters for each platform's requirements.

## File Discovery Results

### Files by Priority

**CRITICAL Priority (18 files)**:

- New files to create: sitemap.ts, robots.ts, metadata.types.ts, seo.constants.ts, opengraph.utils.ts, jsonld.utils.ts, metadata.utils.ts, cache.utils.ts
- Dynamic pages to enhance: users/[userId]/page.tsx, bobbleheads/[bobbleheadSlug]/page.tsx, collections/[collectionSlug]/page.tsx, subcollection/[subcollectionSlug]/page.tsx
- Public pages: about/page.tsx, terms/page.tsx, privacy/page.tsx
- Configuration: layout.tsx, next.config.ts

**HIGH Priority (9 files)**:

- Queries: bobbleheads-query.ts, collections.query.ts, users-query.ts
- Facades: bobbleheads.facade.ts, collections.facade.ts, users.facade.ts
- Utils: cloudinary.utils.ts, slug.ts, cache.utils.ts

**MEDIUM Priority (9 files)**:

- Browse pages: featured/page.tsx, trending/page.tsx, categories pages, search/page.tsx
- User public pages: collections/page.tsx, followers/page.tsx, following/page.tsx

**LOW Priority (6+ files)**:

- Authenticated routes (noindex): dashboard, settings, admin
- Edit routes (noindex): bobblehead/edit, collection/edit

### Architecture Insights

**Existing Patterns Discovered**:

1. ISR usage in featured page (revalidate = 300)
2. Basic generateMetadata stubs in some pages
3. Facade pattern well-established
4. Cloudinary integration ready for enhancement
5. Redis caching via CacheService
6. Sentry monitoring available
7. Next.js 16 with App Router

**Integration Points**:

1. Cloudinary utils need social media sizing (1200x630 OG, 800x418 Twitter)
2. Existing query layer ready for metadata queries
3. Redis caching can integrate with ISR
4. Sentry can monitor metadata performance
5. Middleware distinguishes public vs protected routes

---

# Implementation Plan

## Overview

**Estimated Duration**: 5-6 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

Implement comprehensive SEO optimization across Head Shakers including dynamic metadata generation with Open Graph and Twitter Card support, JSON-LD structured data, XML sitemap generation, robots.txt configuration, and Incremental Static Regeneration (ISR) for public content. This will improve search engine visibility and social media shareability while maintaining performance through intelligent caching strategies.

## Prerequisites

- [ ] Verify Cloudinary image optimization settings and URL generation capabilities
- [ ] Confirm current Redis cache configuration and available cache keys
- [ ] Review existing Sentry performance monitoring setup
- [ ] Ensure database query performance for metadata generation is acceptable
- [ ] Verify next-typesafe-url is properly configured for canonical URLs

## Implementation Steps

### Step 1: Create Core SEO Types and Constants

**What**: Establish TypeScript types and constants for metadata generation across the application
**Why**: Provides type safety and centralized configuration for all SEO-related functionality
**Confidence**: High

**Files to Create:**

- `src/lib/seo/metadata.types.ts` - TypeScript interfaces for metadata objects
- `src/lib/seo/seo.constants.ts` - Default values, limits, and platform-specific requirements

**Changes:**

- Define `PageMetadata` interface with title, description, keywords, canonical, OG tags, Twitter tags
- Define `OpenGraphMetadata` interface for OG-specific properties
- Define `TwitterCardMetadata` interface for Twitter-specific properties
- Define `JsonLdSchema` union type for supported schema.org types
- Create constants for default site metadata, image dimensions per platform, character limits
- Define supported JSON-LD schema types (Person, Product, Organization, CollectionPage)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All metadata types are properly exported and have no TypeScript errors
- [ ] Constants include Twitter (800x418), OG (1200x630), default fallback values
- [ ] All validation commands pass

---

### Step 2: Implement Cloudinary Image Optimization Utilities

**What**: Extend Cloudinary utilities to generate optimized social sharing image URLs
**Why**: Social platforms require specific image dimensions and formats for optimal display
**Confidence**: High

**Files to Modify:**

- `src/lib/utils/cloudinary.utils.ts` - Add social image optimization functions

**Changes:**

- Add `generateOpenGraphImageUrl` function accepting Cloudinary public ID, returns optimized 1200x630 URL
- Add `generateTwitterCardImageUrl` function accepting Cloudinary public ID, returns optimized 800x418 URL
- Add `generateSocialImageUrl` function with platform parameter (og, twitter, default)
- Ensure all functions apply proper transformations (format auto, quality auto, fetch format webp)
- Add fallback logic for missing or invalid public IDs to return default social image

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Functions generate valid Cloudinary URLs with proper transformations
- [ ] Fallback behavior returns site default social image
- [ ] All validation commands pass

---

### Step 3: Create OpenGraph and Twitter Card Metadata Utilities

**What**: Build utility functions to generate Open Graph and Twitter Card metadata objects
**Why**: Centralize metadata generation logic for consistency across all routes
**Confidence**: High

**Files to Create:**

- `src/lib/seo/opengraph.utils.ts` - Open Graph metadata generation functions

**Files to Modify:**

- `src/lib/seo/seo.constants.ts` - Add site URL constant from environment variable

**Changes:**

- Create `generateOpenGraphMetadata` function accepting title, description, images, url, type
- Create `generateTwitterCardMetadata` function accepting title, description, images, card type
- Create `generateBaseMetadata` function for shared metadata properties
- Implement character limit enforcement (OG title 60 chars, description 155 chars)
- Add default fallback values from seo.constants
- Include site name, locale, and alternate locales in OG metadata

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Functions return properly formatted metadata objects compatible with Next.js Metadata API
- [ ] Character limits are enforced with truncation and ellipsis
- [ ] All validation commands pass

---

### Step 4: Implement JSON-LD Structured Data Utilities

**What**: Create functions to generate schema.org JSON-LD structured data for different content types
**Why**: Enables rich search results and improves search engine understanding of content
**Confidence**: High

**Files to Create:**

- `src/lib/seo/jsonld.utils.ts` - JSON-LD schema generation functions

**Changes:**

- Create `generatePersonSchema` for user profiles (accepts userId, name, image, url, description)
- Create `generateProductSchema` for bobbleheads (accepts name, description, image, category, dateCreated)
- Create `generateCollectionPageSchema` for collections (accepts name, description, items count, creator)
- Create `generateOrganizationSchema` for site-wide organization data
- Create `generateBreadcrumbSchema` for navigation breadcrumbs
- All functions return properly formatted JSON-LD with @context and @type

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All schema functions return valid JSON-LD format
- [ ] Schemas match schema.org specifications for each type
- [ ] All validation commands pass

---

### Step 5: Create Main SEO Metadata Generation Utility

**What**: Build the primary metadata generation function that orchestrates all metadata components
**Why**: Provides a single interface for generating complete metadata objects for any page type
**Confidence**: High

**Files to Create:**

- `src/lib/seo/metadata.utils.ts` - Main metadata generation orchestrator

**Changes:**

- Create `generatePageMetadata` function accepting page type, content data, options
- Implement logic to combine base metadata, OG metadata, Twitter metadata, JSON-LD
- Add canonical URL generation using next-typesafe-url $path helper
- Implement robots meta tag generation based on page visibility settings
- Add alternate language link generation for future i18n support
- Include verification meta tags for search console (Google, Bing) from environment variables
- Create helper for dynamic title template (page title | site name)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Function returns complete Metadata object compatible with Next.js generateMetadata
- [ ] Canonical URLs use $path for type safety
- [ ] Robots tags properly set for public vs authenticated routes
- [ ] All validation commands pass

---

### Step 6: Enhance Database Queries for Metadata Fetching

**What**: Add lightweight metadata-specific queries to existing query files
**Why**: Optimize database queries to fetch only necessary data for metadata generation
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/users-query.ts` - Add getUserMetadata query
- `src/lib/queries/bobbleheads-query.ts` - Add getBobbleheadMetadata query
- `src/lib/queries/collections.query.ts` - Add getCollectionMetadata query

**Changes:**

- In users-query.ts: Add `getUserMetadata` selecting only userId, name, username, profileImage, bio
- In bobbleheads-query.ts: Add `getBobbleheadMetadata` selecting only slug, name, description, primaryImage, category, createdAt, owner info
- In collections.query.ts: Add `getCollectionMetadata` selecting only slug, name, description, coverImage, itemCount, owner info, isPublic
- All queries should use proper joins to get owner username/name for attribution
- Add error handling for not found cases

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Queries select minimal fields needed for metadata
- [ ] Queries use efficient joins without N+1 issues
- [ ] Error handling returns null for not found cases
- [ ] All validation commands pass

---

### Step 7: Create Facade Layer for SEO Operations

**What**: Add SEO-specific methods to existing facade files
**Why**: Maintains architectural pattern and provides caching layer for metadata operations
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/users.facade.ts` - Add getUserSeoMetadata method
- `src/lib/facades/bobbleheads.facade.ts` - Add getBobbleheadSeoMetadata method
- `src/lib/facades/collections.facade.ts` - Add getCollectionSeoMetadata method

**Changes:**

- In users.facade.ts: Add `getUserSeoMetadata` calling getUserMetadata with Redis caching (TTL 3600s)
- In bobbleheads.facade.ts: Add `getBobbleheadSeoMetadata` calling getBobbleheadMetadata with caching (TTL 1800s)
- In collections.facade.ts: Add `getCollectionSeoMetadata` calling getCollectionMetadata with caching (TTL 1800s)
- Use existing CacheService pattern for all caching operations
- Add cache invalidation hints in method documentation
- Include proper error handling and fallback to direct query on cache miss

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All facade methods properly integrate with existing CacheService
- [ ] Cache keys follow existing naming conventions
- [ ] TTL values are reasonable for content freshness vs performance
- [ ] All validation commands pass

---

### Step 8: Implement User Profile Dynamic Metadata

**What**: Add generateMetadata to user profile page with full SEO support
**Why**: User profiles are highly shareable content requiring rich social previews
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/users/[userId]/page.tsx` - Implement generateMetadata function

**Changes:**

- Add async `generateMetadata` function accepting params with userId
- Call usersFacade.getUserSeoMetadata to fetch user data
- Handle user not found case with appropriate 404 metadata
- Generate Person JSON-LD schema using jsonld.utils
- Create metadata using metadata.utils with user name, bio, profile image
- Use Cloudinary utils to optimize profile image for social sharing
- Set canonical URL to user profile using $path helper
- Include breadcrumb schema for navigation context

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Metadata includes proper OG tags, Twitter cards, and JSON-LD
- [ ] Profile images are optimized for social platforms
- [ ] User not found returns appropriate metadata
- [ ] All validation commands pass

---

### Step 9: Implement Bobblehead Detail Dynamic Metadata

**What**: Add generateMetadata to individual bobblehead pages with Product schema
**Why**: Bobbleheads are primary catalog content requiring rich product markup
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/page.tsx` - Implement generateMetadata function

**Changes:**

- Add async `generateMetadata` function accepting params with bobbleheadSlug
- Call bobbleheadsFacade.getBobbleheadSeoMetadata to fetch bobblehead data
- Handle bobblehead not found case with appropriate 404 metadata
- Generate Product JSON-LD schema including category, creator, dateCreated
- Create metadata with bobblehead name, description, primary image
- Optimize primary image URLs using Cloudinary social sharing utils
- Set canonical URL using slug-based routing and $path
- Include owner attribution in description and OG metadata

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Product schema includes all relevant bobblehead properties
- [ ] Images are properly optimized for OG and Twitter
- [ ] Owner information is included in metadata
- [ ] All validation commands pass

---

### Step 10: Implement Collection and Subcollection Dynamic Metadata

**What**: Add generateMetadata to collection and subcollection pages with CollectionPage schema
**Why**: Collections are key organizational content requiring proper structured data
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/collections/[collectionSlug]/page.tsx` - Implement generateMetadata function
- `src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/page.tsx` - Implement generateMetadata function

**Changes:**

- In collection page: Add async generateMetadata with collectionSlug parameter
- In subcollection page: Add async generateMetadata with collectionSlug and subcollectionSlug parameters
- Call collectionsFacade.getCollectionSeoMetadata for both pages
- Handle not found and private collection cases appropriately (noindex for private)
- Generate CollectionPage JSON-LD schema with item count, creator, description
- Create metadata with collection name, description, cover image
- Optimize cover images for social sharing using Cloudinary utils
- Set robots to noindex for private collections
- Include owner username and collection hierarchy in metadata

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Private collections are properly marked noindex
- [ ] CollectionPage schema includes accurate item counts
- [ ] Cover images are optimized for social platforms
- [ ] Subcollections include parent collection in breadcrumb schema
- [ ] All validation commands pass

---

### Step 11: Enhance Public Landing Pages with Static Metadata

**What**: Add comprehensive metadata to about, terms, and privacy pages
**Why**: Public pages need proper SEO even though content is static
**Confidence**: High

**Files to Modify:**

- `src/app/(public)/about/page.tsx` - Add metadata export
- `src/app/(public)/terms/page.tsx` - Add metadata export
- `src/app/(public)/privacy/page.tsx` - Add metadata export

**Changes:**

- In about page: Export metadata object with site description, Organization JSON-LD schema
- In terms page: Export metadata with legal page markup, appropriate robots tags
- In privacy page: Export metadata with privacy policy markup, appropriate robots tags
- All pages use OpenGraph and Twitter Card metadata
- Set canonical URLs using $path helper
- Include last updated date in metadata where applicable
- Add WebPage JSON-LD schema to all public pages

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All public pages have complete metadata objects
- [ ] Organization schema is properly formatted
- [ ] Canonical URLs are correct
- [ ] All validation commands pass

---

### Step 12: Implement ISR for Featured and Trending Pages

**What**: Add revalidation configuration and metadata to browse pages
**Why**: Frequently accessed public pages benefit from ISR caching while maintaining freshness
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/browse/featured/page.tsx` - Enhance existing ISR with metadata
- `src/app/(app)/browse/trending/page.tsx` - Add ISR and metadata
- `src/app/(app)/browse/categories/[category]/page.tsx` - Add ISR and metadata

**Changes:**

- In featured page: Add generateMetadata function, ensure revalidate = 300 (5 min) is maintained
- In trending page: Add export const revalidate = 600 (10 min), add generateMetadata
- In category pages: Add export const revalidate = 900 (15 min), add dynamic generateMetadata
- Generate CollectionPage schema for featured/trending listing pages
- Include item counts and update timestamps in metadata
- Optimize preview images for social sharing
- Set appropriate cache-control headers

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Revalidate timings are set appropriately per page traffic patterns
- [ ] Metadata reflects current featured/trending content
- [ ] ISR properly regenerates pages at configured intervals
- [ ] All validation commands pass

---

### Step 13: Generate XML Sitemap with Dynamic Routes

**What**: Create sitemap.ts to generate XML sitemap for all indexable routes
**Why**: Helps search engines discover and crawl all public content efficiently
**Confidence**: Medium

**Files to Create:**

- `src/app/sitemap.ts` - Dynamic sitemap generation

**Changes:**

- Create default export async function returning MetadataRoute.Sitemap array
- Query database for all public users, bobbleheads, collections using facade layer
- Generate static routes (about, terms, privacy, featured, trending)
- Generate dynamic routes for each user profile, bobblehead, collection
- Set appropriate changeFrequency (daily for trending, weekly for profiles, monthly for static)
- Set priority values (1.0 for homepage, 0.8 for featured, 0.6 for content, 0.4 for static)
- Include lastModified timestamps from database updatedAt fields
- Use $path helper for generating all URLs
- Implement pagination if content exceeds 50k URLs

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Sitemap includes all public indexable routes
- [ ] URLs use proper canonical format with domain
- [ ] Change frequencies and priorities are set appropriately
- [ ] All validation commands pass

---

### Step 14: Create Robots.txt Configuration

**What**: Implement robots.ts to guide search engine crawlers
**Why**: Properly directs crawlers and specifies sitemap location
**Confidence**: High

**Files to Create:**

- `src/app/robots.ts` - Robots.txt generation

**Changes:**

- Create default export function returning MetadataRoute.Robots object
- Allow all crawlers for public routes (User-agent wildcard, Allow all)
- Disallow authenticated routes (/dashboard, /settings, /admin, /api/webhooks)
- Disallow edit routes (/edit, /create)
- Disallow internal API routes except public APIs
- Include sitemap URL reference
- Add Crawl-delay directive if needed for rate limiting
- Use environment variable for site URL

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Public routes are properly allowed
- [ ] Private/authenticated routes are disallowed
- [ ] Sitemap reference is included
- [ ] All validation commands pass

---

### Step 15: Update Root Layout with Global Metadata

**What**: Enhance root layout.tsx with site-wide metadata defaults
**Why**: Provides fallback metadata and global SEO configuration
**Confidence**: High

**Files to Modify:**

- `src/app/layout.tsx` - Add global metadata export

**Changes:**

- Export metadata object with site title template, default description
- Add viewport configuration (width, initial scale, theme color)
- Include verification meta tags (Google Search Console, Bing Webmaster)
- Add manifest.json reference for PWA support
- Set robots default to index, follow for public routes
- Include global OpenGraph defaults (site_name, type, locale)
- Add Twitter Card defaults (card type, site handle)
- Set metadataBase to site URL from environment variable

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Global metadata provides sensible defaults
- [ ] metadataBase is properly configured from environment
- [ ] Verification tags use environment variables
- [ ] All validation commands pass

---

### Step 16: Add Cache Utilities for Metadata Operations

**What**: Create caching helpers specifically for metadata generation
**Why**: Reduces database load for frequently accessed metadata
**Confidence**: High

**Files to Create:**

- `src/lib/seo/cache.utils.ts` - SEO-specific caching utilities

**Changes:**

- Create `cacheMetadata` function accepting key, generator function, TTL
- Create `invalidateMetadataCache` function accepting content type and ID
- Create cache key generators for user, bobblehead, collection metadata
- Implement cache warming function for featured/trending content
- Add monitoring hooks to track cache hit rates
- Use existing CacheService as underlying implementation
- Add error handling for cache failures with fallback to direct generation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Cache utilities integrate with existing CacheService
- [ ] Cache keys follow consistent naming convention
- [ ] Error handling gracefully falls back on cache failure
- [ ] All validation commands pass

---

### Step 17: Implement Metadata Invalidation Hooks

**What**: Add cache invalidation to relevant server actions
**Why**: Ensures metadata stays fresh when content is updated
**Confidence**: Medium

**Files to Modify:**

- `src/lib/actions/users.actions.ts` - Add metadata cache invalidation
- `src/lib/actions/bobbleheads.actions.ts` - Add metadata cache invalidation
- `src/lib/actions/collections.actions.ts` - Add metadata cache invalidation

**Changes:**

- In users actions: Call invalidateMetadataCache on profile update, avatar change
- In bobbleheads actions: Call invalidateMetadataCache on create, update, delete, image change
- In collections actions: Call invalidateMetadataCache on create, update, delete, visibility change
- Import cache invalidation utilities from seo/cache.utils
- Add invalidation after successful mutation but before revalidatePath
- Log invalidation operations for monitoring

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Cache invalidation occurs after all relevant content mutations
- [ ] Invalidation happens before path revalidation
- [ ] No performance degradation from invalidation operations
- [ ] All validation commands pass

---

### Step 18: Add Environment Variables and Configuration

**What**: Update configuration files with SEO-related settings
**Why**: Centralizes SEO configuration and supports different environments
**Confidence**: High

**Files to Modify:**

- `src/lib/config/config.ts` - Add SEO configuration section
- `next.config.ts` - Add metadata and image optimization settings

**Changes:**

- In config.ts: Add seo object with siteUrl, siteName, defaultDescription, twitterHandle, social links
- In config.ts: Add metadata object with verification tokens, OG defaults, JSON-LD defaults
- In next.config.ts: Configure image domains for Cloudinary
- In next.config.ts: Enable experimental metadata optimizations if available
- Add environment variable validation for required SEO variables
- Document required environment variables in comments

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All SEO settings are centralized in config
- [ ] Environment variables are properly typed
- [ ] Image domains include Cloudinary and any fallback CDNs
- [ ] All validation commands pass

---

### Step 19: Add Sentry Performance Monitoring for Metadata

**What**: Integrate Sentry tracking for metadata generation performance
**Why**: Monitors metadata generation performance and identifies bottlenecks
**Confidence**: Medium

**Files to Modify:**

- `src/lib/seo/metadata.utils.ts` - Add Sentry instrumentation
- `src/app/sitemap.ts` - Add Sentry instrumentation

**Changes:**

- Wrap metadata generation functions with Sentry transactions
- Add breadcrumbs for each metadata component generation step
- Track database query performance within metadata operations
- Monitor cache hit/miss rates for metadata
- Set up custom Sentry tags for content type (user, bobblehead, collection)
- Add error tracking for metadata generation failures
- Track sitemap generation duration and entry counts

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Sentry transactions capture metadata generation timing
- [ ] Performance bottlenecks are identifiable in Sentry dashboard
- [ ] Error tracking includes metadata-specific context
- [ ] All validation commands pass

---

### Step 20: Create Metadata Testing Suite

**What**: Build comprehensive tests for metadata generation utilities
**Why**: Ensures metadata correctness and prevents regression
**Confidence**: High

**Files to Create:**

- `tests/lib/seo/metadata.utils.test.ts` - Metadata generation tests
- `tests/lib/seo/opengraph.utils.test.ts` - OpenGraph tests
- `tests/lib/seo/jsonld.utils.test.ts` - JSON-LD schema tests
- `tests/lib/utils/cloudinary.utils.test.ts` - Enhance with social image tests

**Changes:**

- Test generatePageMetadata with various content types and edge cases
- Test OpenGraph metadata generation with character limit enforcement
- Test Twitter Card metadata with different card types
- Test JSON-LD schema generation for Person, Product, CollectionPage types
- Test Cloudinary social image URL generation with proper dimensions
- Test canonical URL generation using mocked $path
- Test metadata for not found content
- Test metadata for private content (noindex verification)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**

- [ ] All metadata generation paths are tested
- [ ] Edge cases (missing data, invalid input) are covered
- [ ] Character limits are verified in tests
- [ ] Image URL generation is validated
- [ ] All validation commands pass including test suite

---

### Step 21: Add Authenticated Route Metadata Guards

**What**: Implement metadata for authenticated routes with noindex directives
**Why**: Prevents search engines from indexing private user content
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/dashboard/page.tsx` - Add noindex metadata
- `src/app/(app)/settings/page.tsx` - Add noindex metadata
- `src/app/(app)/admin/page.tsx` - Add noindex metadata
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/edit/page.tsx` - Add noindex metadata
- `src/app/(app)/collections/[collectionSlug]/edit/page.tsx` - Add noindex metadata

**Changes:**

- Export metadata object with robots set to noindex, nofollow
- Remove from sitemap generation in sitemap.ts
- Add X-Robots-Tag header in middleware for authenticated routes
- Ensure no JSON-LD schemas are generated for private pages
- Add meta tag for referrer policy on sensitive pages

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All authenticated routes have noindex metadata
- [ ] Dashboard and settings pages are excluded from sitemap
- [ ] Edit routes are properly marked as noindex
- [ ] All validation commands pass

---

### Step 22: Implement Preview Mode Support

**What**: Add preview mode functionality for content editors to verify metadata
**Why**: Allows content review before publishing with accurate metadata preview
**Confidence**: Medium

**Files to Create:**

- `src/app/api/preview/route.ts` - Preview mode API endpoint
- `src/lib/seo/preview.utils.ts` - Preview mode utilities

**Changes:**

- Create preview API route to enable/disable preview mode via draftMode
- Add preview mode detection in generateMetadata functions
- Allow metadata generation for draft/unpublished content in preview mode
- Add preview mode banner component for visual indication
- Implement secure preview token validation
- Add exit preview mode functionality
- Document preview mode workflow for content editors

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Preview mode can be enabled via secure API endpoint
- [ ] Metadata generates correctly for draft content in preview
- [ ] Preview mode is visually indicated to editors
- [ ] All validation commands pass

---

### Step 23: Create SEO Documentation

**What**: Document SEO implementation, best practices, and maintenance procedures
**Why**: Ensures team understands SEO system and can maintain it properly
**Confidence**: High

**Files to Create:**

- `docs/2025_11_13/specs/SEO_Implementation.md` - Comprehensive SEO documentation

**Changes:**

- Document metadata generation architecture and flow
- Provide examples of metadata output for each content type
- Document caching strategy and invalidation triggers
- List all environment variables required for SEO
- Explain ISR configuration and revalidation strategies
- Document JSON-LD schemas and when each is used
- Provide troubleshooting guide for common metadata issues
- Document how to add metadata to new pages
- Include performance optimization guidelines
- Add monitoring and analytics setup instructions

**Validation Commands:**

```bash
# No validation needed for documentation
```

**Success Criteria:**

- [ ] Documentation covers all SEO components implemented
- [ ] Examples are provided for each content type
- [ ] Troubleshooting guide addresses common issues
- [ ] Maintenance procedures are clearly documented

---

### Step 24: Perform SEO Audit and Validation

**What**: Comprehensive testing and validation of all SEO implementations
**Why**: Ensures all metadata, schemas, and configurations work correctly across all pages
**Confidence**: High

**Files to Modify:**

- Various page files may need adjustments based on audit findings

**Changes:**

- Test all dynamic metadata generation functions with real database data
- Validate OpenGraph tags using Facebook Sharing Debugger
- Validate Twitter Cards using Twitter Card Validator
- Validate JSON-LD schemas using Google Rich Results Test
- Verify sitemap generation and accessibility at /sitemap.xml
- Verify robots.txt generation and accessibility at /robots.txt
- Test ISR functionality and cache revalidation
- Verify canonical URLs are correct across all pages
- Check image optimization for social sharing platforms
- Validate Core Web Vitals with metadata overhead
- Test metadata cache performance and hit rates

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test && npm run build
```

**Success Criteria:**

- [ ] All pages generate valid metadata without errors
- [ ] OpenGraph and Twitter Card validators show correct previews
- [ ] JSON-LD schemas pass Google Rich Results Test
- [ ] Sitemap is accessible and contains all expected URLs
- [ ] ISR properly caches and revalidates content
- [ ] Build completes successfully with no metadata errors
- [ ] All validation commands pass

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] All tests pass `npm run test`
- [ ] Production build completes successfully `npm run build`
- [ ] Sitemap generates without errors at /sitemap.xml
- [ ] Robots.txt accessible at /robots.txt
- [ ] OpenGraph tags validate in Facebook Sharing Debugger
- [ ] Twitter Cards validate in Twitter Card Validator
- [ ] JSON-LD schemas pass Google Rich Results Test
- [ ] Metadata cache hit rates >70% for frequently accessed content
- [ ] No Core Web Vitals degradation from metadata overhead

## Notes

**Important Considerations:**

- **Environment Variables**: Ensure NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SITE_NAME, and verification tokens are properly configured in all environments
- **Cloudinary Configuration**: Verify Cloudinary domain is whitelisted in next.config.ts for image optimization
- **Database Performance**: Metadata queries should complete in <100ms; add database indexes if needed
- **Cache Strategy**: Redis cache is critical for performance; ensure Upstash Redis is properly configured
- **ISR Timing**: Revalidation intervals should balance freshness vs server load; monitor and adjust based on traffic
- **Preview Mode Security**: Preview tokens must be cryptographically secure and properly validated
- **Character Limits**: Strictly enforce OG title (60 chars) and description (155 chars) limits to prevent truncation
- **Social Platform Testing**: Always test with actual platform validators before deploying to production

**Risk Mitigation:**

- Metadata generation failures should gracefully fall back to defaults without breaking page rendering
- Cache failures should not prevent metadata generation, only affect performance
- Database query timeouts should return cached or default metadata
- Image optimization failures should fall back to original Cloudinary URLs
- Sitemap generation errors should not prevent application deployment

**Performance Targets:**

- Metadata generation should add <50ms to page load time
- Sitemap generation should complete in <5 seconds for up to 10k URLs
- Cache hit rate for metadata should exceed 70% for public content
- JSON-LD schema generation should add <10ms overhead
- ISR should reduce server load by >60% for featured/trending pages

---

## Orchestration Logs

Full orchestration logs are available at:

- **Directory**: `docs/2025_11_13/orchestration/seo-metadata-isr/`
- **Index**: `00-orchestration-index.md`
- **Step 1**: `01-feature-refinement.md`
- **Step 2**: `02-file-discovery.md`
- **Step 3**: `03-implementation-planning.md`
