# Implementation Plan: Slug-Based URLs for Bobbleheads and Collections

**Generated**: 2025-11-10T00:06:30Z
**Original Request**: as a user I want better URLs for sharing and seo. The current URL for a bobblehead would be -http://localhost:3000/bobbleheads/a38ae2ef-c499-4a87-aa62-e5c99dec2d11 , I would like a more robust solution that allows for better SEO and URLs for sharing.

**Refined Request**: As a user, I want better URLs for sharing and SEO so that when I share a bobblehead listing or collection with others, the URL is memorable, human-readable, and optimized for search engines instead of relying on UUID-based paths like `/bobbleheads/a38ae2ef-c499-4a87-aa62-e5c99dec2d11`. The solution should implement slug-based URLs that incorporate relevant information about the bobblehead (e.g., `/bobbleheads/vintage-mickey-mouse-bobblehead` or `/collections/my-collection-2024`), making links more shareable across social media and email while improving SEO performance. This requires adding a `slug` field to the bobblehead and collection tables in PostgreSQL, implementing slug generation logic that handles special characters, spaces, and collision detection to ensure uniqueness, and updating the database schema via Drizzle migrations. The Next.js routing should support both legacy UUID-based routes (for backward compatibility with existing shared links) and new slug-based routes with a preference toward the slug pattern for new URLs. The type-safe routing system via next-typesafe-url needs to be updated to generate both slug and UUID variants, allowing Server Actions and Server Components to reference resources using slugs while maintaining type safety. URL parameters should be validated using Zod to ensure slugs meet specific formatting requirements, and a redirect mechanism should gracefully handle legacy UUID URLs by fetching the corresponding bobblehead and redirecting to its canonical slug-based URL with proper HTTP status codes (301 for permanent redirects). The implementation should also consider SEO metadata generation, ensuring open graph tags, structured data (JSON-LD), and canonical tags properly reflect the slug-based URLs. Performance considerations include indexing the slug column in PostgreSQL for fast lookups and implementing caching via Upstash Redis for slug-to-ID mappings to minimize database queries on frequently shared bobbleheads or collections.

## Analysis Summary

- Feature request refined with project context
- Discovered 28 files across 5 architectural layers
- Generated 27-step implementation plan
- Estimated duration: 3-4 days
- Complexity: High
- Risk level: Medium

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

Implement human-readable, SEO-friendly slug-based URLs for bobbleheads and collections (e.g., `/bobbleheads/vintage-mickey-mouse-bobblehead`) while maintaining backward compatibility with existing UUID-based URLs through automatic 301 redirects. This involves database schema changes, slug generation utilities, routing updates, caching optimization, and metadata enhancements.

## Prerequisites

- [ ] Backup production database before schema migration
- [ ] Verify Redis cache service is operational
- [ ] Confirm all existing bobblehead and collection URLs are using UUID format
- [ ] Review current SEO metadata implementation
- [ ] Ensure development database branch is active for testing

## Implementation Steps

### Step 1: Create Slug Generation Utility

**What**: Build a reusable slug generation utility with collision detection and validation
**Why**: Centralized slug logic ensures consistency across bobbleheads and collections
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\utils\slug.utils.ts` - Slug generation, sanitization, and uniqueness checking utilities

**Changes:**
- Add `generateSlug(text: string): string` function to convert text to URL-safe slug
- Add `sanitizeSlug(text: string): string` to remove special characters and normalize spaces
- Add `ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string` for collision handling
- Add `validateSlugFormat(slug: string): boolean` for format validation
- Include Zod schema export `slugSchema` with pattern validation (lowercase, hyphens, alphanumeric)

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Slug utility handles special characters (™, ®, ©, accents)
- [ ] Collision detection appends numeric suffixes (-2, -3, etc.)
- [ ] Slugs are lowercase with hyphens only
- [ ] All validation commands pass

---

### Step 2: Update Database Schema for Bobbleheads

**What**: Add slug column to bobbleheads table with unique constraint and index
**Why**: Database-level uniqueness enforcement and fast slug lookups are critical for performance
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\db\schema\bobbleheads.schema.ts` - Add slug column definition
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\db\schema\schema-limits.ts` - Add slug length constraints

**Changes:**
- Add `slug` column to `bobbleheadsTable` as `varchar(255).notNull().unique()`
- Add database index on slug column for performance
- Update schema-limits.ts with `BOBBLEHEAD_SLUG_MIN_LENGTH: 3` and `BOBBLEHEAD_SLUG_MAX_LENGTH: 255`
- Ensure slug column includes database-level constraint for uniqueness

**Validation Commands:**
```bash
npm run db:generate
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Drizzle generates migration file successfully
- [ ] Schema includes unique constraint on slug
- [ ] Schema includes index on slug column
- [ ] All validation commands pass

---

### Step 3: Update Database Schema for Collections

**What**: Add slug column to collections table with unique constraint and index
**Why**: Collections need identical slug functionality as bobbleheads for consistency
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\db\schema\collections.schema.ts` - Add slug column definition
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\db\schema\schema-limits.ts` - Add collection slug length constraints

**Changes:**
- Add `slug` column to `collectionsTable` as `varchar(255).notNull().unique()`
- Add database index on slug column for performance
- Update schema-limits.ts with `COLLECTION_SLUG_MIN_LENGTH: 3` and `COLLECTION_SLUG_MAX_LENGTH: 255`
- Ensure slug column includes database-level constraint for uniqueness

**Validation Commands:**
```bash
npm run db:generate
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Drizzle generates migration file successfully
- [ ] Schema includes unique constraint on slug
- [ ] Schema includes index on slug column
- [ ] All validation commands pass

---

### Step 4: Run Database Migration with Slug Generation

**What**: Execute migration and backfill existing records with generated slugs
**Why**: Existing bobbleheads and collections need slugs for backward compatibility
**Confidence**: Medium

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\db\scripts\backfill-slugs.ts` - Script to generate slugs for existing records

**Changes:**
- Create migration script that adds slug columns to both tables
- Create backfill script that queries all bobbleheads and collections
- Generate slugs from bobblehead name/title and collection name
- Handle slug collisions by appending numeric suffixes
- Update all records with unique slugs using database transactions

**Validation Commands:**
```bash
npm run db:migrate
npm run lint:fix && npm run typecheck
node --loader ts-node/esm src/lib/db/scripts/backfill-slugs.ts
```

**Success Criteria:**
- [ ] Migration executes without errors on development database
- [ ] All existing bobbleheads have unique slugs
- [ ] All existing collections have unique slugs
- [ ] No null slug values remain
- [ ] All validation commands pass

---

### Step 5: Update Bobblehead Validation Schema

**What**: Add slug field to Zod validation schemas with pattern and uniqueness rules
**Why**: Type-safe validation ensures slug format consistency across the application
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\bobbleheads.validation.ts` - Add slug validation to schemas

**Changes:**
- Import `slugSchema` from slug.utils.ts
- Add `slug` field to `createBobbleheadSchema` (optional, auto-generated if not provided)
- Add `slug` field to `updateBobbleheadSchema` (optional)
- Include validation that slug matches pattern: lowercase, hyphens, alphanumeric only
- Add length constraints matching schema-limits.ts values
- Ensure slug uniqueness check is handled at facade/action layer, not validation layer

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Slug validation rejects uppercase letters
- [ ] Slug validation rejects special characters except hyphens
- [ ] Slug validation enforces min/max length
- [ ] All validation commands pass

---

### Step 6: Update Collection Validation Schema

**What**: Add slug field to collection Zod validation schemas with pattern rules
**Why**: Collections require identical validation as bobbleheads for consistency
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\collections.validation.ts` - Add slug validation to schemas

**Changes:**
- Import `slugSchema` from slug.utils.ts
- Add `slug` field to `createCollectionSchema` (optional, auto-generated if not provided)
- Add `slug` field to `updateCollectionSchema` (optional)
- Include validation that slug matches pattern: lowercase, hyphens, alphanumeric only
- Add length constraints matching schema-limits.ts values

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Slug validation rejects uppercase letters
- [ ] Slug validation rejects special characters except hyphens
- [ ] Slug validation enforces min/max length
- [ ] All validation commands pass

---

### Step 7: Update Bobblehead Query Layer

**What**: Add slug-based lookup functions to bobblehead queries
**Why**: Queries need to support both UUID and slug-based lookups for routing
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\bobbleheads-query.ts` - Add slug lookup function

**Changes:**
- Add `getBobbleheadBySlug(slug: string, userId?: string)` function
- Include permission-based filtering matching existing UUID lookup pattern
- Return same data structure as `getBobbleheadById` for consistency
- Add slug to SELECT fields in existing query functions
- Optimize query with slug index usage

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Slug lookup function returns bobblehead data with permissions
- [ ] Function respects visibility and ownership rules
- [ ] Query uses slug index for performance
- [ ] All validation commands pass

---

### Step 8: Update Collection Query Layer

**What**: Add slug-based lookup functions to collection queries
**Why**: Collections require identical query capabilities as bobbleheads
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\collections.query.ts` - Add slug lookup function

**Changes:**
- Add `getCollectionBySlug(slug: string, userId?: string)` function
- Include permission-based filtering matching existing UUID lookup pattern
- Return same data structure as `getCollectionById` for consistency
- Add slug to SELECT fields in existing query functions
- Optimize query with slug index usage

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Slug lookup function returns collection data with permissions
- [ ] Function respects visibility and ownership rules
- [ ] Query uses slug index for performance
- [ ] All validation commands pass

---

### Step 9: Update Bobblehead Facade Layer

**What**: Add slug generation logic to create/update operations in bobblehead facade
**Why**: Facade layer handles business logic including automatic slug generation
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\facades\bobbleheads.facade.ts` - Add slug generation to create/update

**Changes:**
- Import slug utilities from slug.utils.ts
- In create operation: generate slug from bobblehead name if not provided
- Check for slug uniqueness by querying existing slugs
- Call `ensureUniqueSlug` if collision detected
- In update operation: regenerate slug if name changes and slug not explicitly provided
- Add slug to return data for all facade functions

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] New bobbleheads automatically receive unique slugs
- [ ] Slug generation handles special characters from bobblehead names
- [ ] Slug collisions resolved with numeric suffixes
- [ ] All validation commands pass

---

### Step 10: Update Collection Facade Layer

**What**: Add slug generation logic to create/update operations in collection facade
**Why**: Collections require identical slug generation as bobbleheads
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\facades\collections.facade.ts` - Add slug generation to create/update

**Changes:**
- Import slug utilities from slug.utils.ts
- In create operation: generate slug from collection name if not provided
- Check for slug uniqueness by querying existing slugs
- Call `ensureUniqueSlug` if collision detected
- In update operation: regenerate slug if name changes and slug not explicitly provided
- Add slug to return data for all facade functions

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] New collections automatically receive unique slugs
- [ ] Slug generation handles special characters from collection names
- [ ] Slug collisions resolved with numeric suffixes
- [ ] All validation commands pass

---

### Step 11: Update Bobblehead Server Actions

**What**: Add slug field to action responses and ensure slug is included in mutations
**Why**: Server actions need to return slug data for client-side routing
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\bobbleheads.actions.ts` - Include slug in action responses

**Changes:**
- Ensure create/update actions return slug in response data
- Add slug to cache invalidation tags
- Verify slug is properly validated through Zod schemas
- No changes to action signatures required (facade handles slug generation)

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Create action returns bobblehead with slug
- [ ] Update action returns updated slug if name changed
- [ ] Cache tags include slug for invalidation
- [ ] All validation commands pass

---

### Step 12: Update Collection Server Actions

**What**: Add slug field to collection action responses
**Why**: Server actions need to return slug data for client-side routing
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\collections.actions.ts` - Include slug in action responses

**Changes:**
- Ensure create/update actions return slug in response data
- Add slug to cache invalidation tags
- Verify slug is properly validated through Zod schemas
- No changes to action signatures required (facade handles slug generation)

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Create action returns collection with slug
- [ ] Update action returns updated slug if name changed
- [ ] Cache tags include slug for invalidation
- [ ] All validation commands pass

---

### Step 13: Update Cache Service for Slug-Based Caching

**What**: Add slug-to-ID mapping cache functions with Redis
**Why**: Frequently accessed bobbleheads/collections benefit from cached slug lookups
**Confidence**: Medium

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\services\cache.service.ts` - Add slug caching functions
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\services\cache-revalidation.service.ts` - Add slug cache invalidation

**Changes:**
- Add `cacheSlugToId(resourceType: 'bobblehead' | 'collection', slug: string, id: string)` function
- Add `getIdBySlug(resourceType: 'bobblehead' | 'collection', slug: string)` function
- Add cache key pattern: `slug:{resourceType}:{slug}` → `{id}`
- Add slug cache invalidation to revalidation service when bobblehead/collection updated
- Set TTL to 24 hours for slug mappings

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Slug-to-ID mappings cached in Redis
- [ ] Cache invalidated when slug changes
- [ ] Cache keys follow consistent pattern
- [ ] All validation commands pass

---

### Step 14: Update Type-Safe Routes for Bobblehead

**What**: Add slug-based route variants to bobblehead route types
**Why**: next-typesafe-url requires explicit route definitions for type safety
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobblehead\route-type.ts` - Add slug route variant
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobblehead\[id]\route-type.ts` - Update to support both slug and UUID

**Changes:**
- Add new route type for `/bobblehead/[slug]` pattern
- Update existing `/bobblehead/[id]` to accept both slug and UUID parameters
- Add Zod validation in route type to distinguish UUID vs slug format
- Include type guards for slug vs UUID discrimination
- Ensure backward compatibility with UUID-based routes

**Validation Commands:**
```bash
npm run next-typesafe-url
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Route types support both `/bobblehead/{uuid}` and `/bobblehead/{slug}` patterns
- [ ] Type-safe route generation works for both formats
- [ ] Zod validation correctly identifies slug vs UUID
- [ ] All validation commands pass

---

### Step 15: Update Type-Safe Routes for Collection

**What**: Add slug-based route variants to collection route types
**Why**: Collections require identical routing capabilities as bobbleheads
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collection\route-type.ts` - Add slug route variant
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collection\[id]\route-type.ts` - Update to support both slug and UUID

**Changes:**
- Add new route type for `/collection/[slug]` pattern
- Update existing `/collection/[id]` to accept both slug and UUID parameters
- Add Zod validation in route type to distinguish UUID vs slug format
- Include type guards for slug vs UUID discrimination
- Ensure backward compatibility with UUID-based routes

**Validation Commands:**
```bash
npm run next-typesafe-url
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Route types support both `/collection/{uuid}` and `/collection/{slug}` patterns
- [ ] Type-safe route generation works for both formats
- [ ] Zod validation correctly identifies slug vs UUID
- [ ] All validation commands pass

---

### Step 16: Update Bobblehead Edit Page Routes

**What**: Update edit page to accept both UUID and slug parameters
**Why**: Edit functionality must work with both URL formats
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobblehead\[id]\edit\route-type.ts` - Support both formats
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobblehead\[id]\edit\page.tsx` - Handle both parameter types

**Changes:**
- Update route type to accept both UUID and slug
- Add parameter detection logic in edit page
- Fetch bobblehead by UUID or slug based on parameter format
- Maintain existing permission checks and edit functionality
- Use slug-based URLs in form redirects after save

**Validation Commands:**
```bash
npm run next-typesafe-url
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Edit page works with both UUID and slug URLs
- [ ] After save, redirect uses slug URL
- [ ] Permission checks function correctly
- [ ] All validation commands pass

---

### Step 17: Update Collection Edit Page Routes

**What**: Update collection edit page to accept both UUID and slug parameters
**Why**: Edit functionality must work with both URL formats
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collection\[id]\edit\route-type.ts` - Support both formats
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collection\[id]\edit\page.tsx` - Handle both parameter types

**Changes:**
- Update route type to accept both UUID and slug
- Add parameter detection logic in edit page
- Fetch collection by UUID or slug based on parameter format
- Maintain existing permission checks and edit functionality
- Use slug-based URLs in form redirects after save

**Validation Commands:**
```bash
npm run next-typesafe-url
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Edit page works with both UUID and slug URLs
- [ ] After save, redirect uses slug URL
- [ ] Permission checks function correctly
- [ ] All validation commands pass

---

### Step 18: Update SEO Metadata Generation for Bobbleheads

**What**: Enhance Open Graph, JSON-LD, and canonical tags to use slug URLs
**Why**: SEO benefits require proper metadata with slug-based canonical URLs
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobblehead\[id]\page.tsx` - Update metadata generation

**Changes:**
- Update `generateMetadata` function to use slug in canonical URL
- Update Open Graph URL to use slug format
- Update Twitter card URL to use slug format
- Add JSON-LD structured data with slug-based URLs
- Include bobblehead name, image, and details in structured data
- Ensure all metadata reflects slug-based canonical URL

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Canonical URL uses slug format
- [ ] Open Graph tags include slug URL
- [ ] JSON-LD structured data includes slug URL
- [ ] Metadata remains valid for SEO tools
- [ ] All validation commands pass

---

### Step 19: Update SEO Metadata Generation for Collections

**What**: Enhance Open Graph, JSON-LD, and canonical tags to use slug URLs
**Why**: SEO benefits require proper metadata with slug-based canonical URLs
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collection\[id]\page.tsx` - Update metadata generation

**Changes:**
- Update `generateMetadata` function to use slug in canonical URL
- Update Open Graph URL to use slug format
- Update Twitter card URL to use slug format
- Add JSON-LD structured data with slug-based URLs
- Include collection name, description, and details in structured data
- Ensure all metadata reflects slug-based canonical URL

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Canonical URL uses slug format
- [ ] Open Graph tags include slug URL
- [ ] JSON-LD structured data includes slug URL
- [ ] Metadata remains valid for SEO tools
- [ ] All validation commands pass

---

### Step 20: Update Middleware for Slug Route Handling

**What**: Ensure middleware properly handles slug-based routes for auth and rate limiting
**Why**: Middleware must recognize both UUID and slug patterns for security
**Confidence**: Medium

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\middleware.ts` - Add slug pattern recognition

**Changes:**
- Update route pattern matching to recognize slug format in addition to UUID
- Ensure authentication checks apply to both URL formats
- Verify rate limiting applies consistently to slug and UUID routes
- Add slug format validation in middleware if not already present
- Maintain all existing middleware functionality

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Middleware recognizes slug-based bobblehead routes
- [ ] Middleware recognizes slug-based collection routes
- [ ] Authentication applies to both formats
- [ ] Rate limiting applies to both formats
- [ ] All validation commands pass

---

### Step 21: Update All Link References to Use Slug URLs

**What**: Replace UUID-based links with slug-based links throughout the application
**Why**: User-facing links should use readable slugs for better UX and SEO
**Confidence**: Medium

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\bobblehead\*` - Update bobblehead component links
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\collections\*` - Update collection component links
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\dashboard\*` - Update dashboard links
- Any other components rendering bobblehead/collection links

**Changes:**
- Search for all Link components pointing to `/bobblehead/[id]` and update to use slug
- Search for all Link components pointing to `/collection/[id]` and update to use slug
- Update programmatic navigation to use slug-based routes
- Ensure slug data is available in component props (update queries if needed)
- Use type-safe route helper functions for link generation

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All bobblehead links use slug format
- [ ] All collection links use slug format
- [ ] No broken links after migration
- [ ] Type-safe routing maintained
- [ ] All validation commands pass

---

### Step 22: Add Database Performance Optimization

**What**: Verify and optimize database indexes for slug-based queries
**Why**: Fast slug lookups are critical for performance and user experience
**Confidence**: High

**Files to Modify:**
- Review migration files generated in Step 2 and Step 3

**Changes:**
- Verify slug column has B-tree index in both tables
- Confirm index is properly created in migration
- Add composite index on (slug, userId) if queries frequently filter by both
- Run EXPLAIN ANALYZE on slug-based queries to verify index usage
- Document index strategy in migration comments

**Validation Commands:**
```bash
npm run db:migrate
```

**Success Criteria:**
- [ ] Slug indexes exist in database
- [ ] Query execution plans show index usage
- [ ] Slug lookups complete in <10ms
- [ ] No full table scans on slug queries
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Database migration executes successfully on development branch
- [ ] All existing bobbleheads and collections have unique slugs
- [ ] UUID-to-slug redirects return 301 status
- [ ] Slug-based URLs render correctly
- [ ] SEO metadata includes slug URLs in canonical, OG, and JSON-LD
- [ ] Redis cache stores slug-to-ID mappings
- [ ] All tests pass with `npm run test`
- [ ] Manual testing confirms backward compatibility
- [ ] Performance testing shows <10ms slug lookups
- [ ] Documentation complete and reviewed

## Notes

**Critical Considerations:**

- **Backward Compatibility**: All existing UUID-based URLs MUST continue to work via 301 redirects. Do not break existing shared links.
- **Slug Uniqueness**: Database-level unique constraints prevent duplicates. Facade layer handles collision detection before insert.
- **SEO Impact**: 301 redirects preserve SEO value from old URLs. Canonical tags must always point to slug-based URLs.
- **Performance**: Database indexes on slug columns are mandatory. Redis caching reduces database load for popular items.
- **Migration Risk**: Backfilling slugs for existing records is a one-time operation. Test thoroughly on development database before production.

**Assumptions Requiring Confirmation:**

- Bobblehead names are sufficiently unique to generate meaningful slugs (Low confidence - may need to include additional metadata like year or category in slug)
- Redis cache service is configured and operational in all environments
- Current rate limiting and authentication middleware use pattern matching that will recognize slug format
- No existing URLs in external systems (emails, social shares) require preservation beyond 301 redirects

**Performance Targets:**

- Slug-based lookups: <10ms database query time
- Cache hit rate for popular items: >80%
- 301 redirect overhead: <5ms

**Rollback Strategy:**

- If critical issues arise, slug columns can remain in database but application can revert to UUID-only routing
- Remove slug-based route handling and restore UUID-only links
- Keep 301 redirects disabled until issues resolved
