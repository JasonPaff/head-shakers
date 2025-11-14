# Implementation Plan: Slug-Based URL Architecture Migration

**Generated**: 2025-11-12T00:00:09Z
**Original Request**: implement slug based urls for bobbleheads, subcollections, and collecitons with no backwards compatability with the old GUID based approach. The app should use 100% slugs and no GUID's

## Analysis Summary

- Feature request refined with project context
- Discovered 59 files across database, routing, business logic, and UI layers
- Generated 20-step implementation plan with comprehensive validation
- Estimated duration: 3-4 days
- Risk level: High (breaking changes, no backwards compatibility)

---

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: High
**Risk Level**: High

## Quick Summary

Migrate the entire application from GUID-based URLs to human-readable slug-based URLs for bobbleheads, collections, and subcollections. This is a breaking change that eliminates all backwards compatibility with existing UUID routes, requiring database schema updates, route restructuring, and comprehensive updates across queries, actions, facades, and components.

## Prerequisites

- [ ] Ensure development environment is fully set up with all dependencies installed
- [ ] Verify `/db` command access to Neon database (project: misty-boat-49919732, db: head-shakers)
- [ ] Create backup of current database state on development branch
- [ ] Confirm no active users on development branch during migration
- [ ] Review all discovered files (59 total) to understand current architecture

## Implementation Steps

### Step 1: Create Slug Generation Utilities

**What**: Build utility functions for generating URL-safe slugs with collision handling
**Why**: Provides consistent slug generation logic used throughout the migration
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\utils\slug.ts` - Slug generation and validation utilities

**Changes:**

- Add `generateSlug(name: string): string` function to create URL-safe slugs from entity names
- Add `ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string` function for collision handling
- Add `validateSlug(slug: string): boolean` function for slug format validation
- Add slug regex pattern constant for validation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Slug utility functions handle special characters, spaces, and unicode properly
- [ ] Collision handling appends numeric suffixes correctly
- [ ] Slug validation enforces URL-safe format
- [ ] All validation commands pass

---

### Step 2: Define Slug Constants

**What**: Create constants for slug validation rules and constraints
**Why**: Centralizes slug requirements and makes them reusable across the codebase
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\slug.ts` - Slug-related constants

**Changes:**

- Add `SLUG_MAX_LENGTH` constant
- Add `SLUG_MIN_LENGTH` constant
- Add `SLUG_PATTERN` regex constant
- Add `SLUG_RESERVED_WORDS` array for protected slugs

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Constants are properly typed and exported
- [ ] Reserved words list includes admin, api, auth, etc.
- [ ] All validation commands pass

---

### Step 3: Update Database Schema

**What**: Add slug columns to bobbleheads, collections, and subcollections tables
**Why**: Stores slugs in the database with proper constraints and indexes
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\db\schema\index.ts` - Add slug columns to schema definitions

**Changes:**

- Add `slug` column to bobbleheads table (varchar, unique, not null)
- Add `slug` column to collections table (varchar, not null, unique per userId)
- Add `slug` column to subcollections table (varchar, not null, unique per collectionId)
- Add indexes for slug lookups on all three tables
- Add composite unique constraints for collections (userId, slug) and subcollections (collectionId, slug)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Schema changes follow Drizzle ORM patterns
- [ ] Unique constraints match requirements (global for bobbleheads, scoped for collections/subcollections)
- [ ] Indexes are properly defined for performance
- [ ] All validation commands pass

---

### Step 4: Generate and Run Database Migration

**What**: Create Drizzle migration to add slug columns and populate them
**Why**: Applies schema changes to the database and generates slugs for existing records
**Confidence**: Medium

**Files to Create:**

- Migration file via `npm run db:generate` in `C:\Users\JasonPaff\dev\head-shakers\drizzle\migrations\`

**Changes:**

- Use `/db run migration "Add slug columns to bobbleheads, collections, and subcollections with unique constraints"` command
- Migration should add slug columns with nullable first
- Migration should populate slugs using entity names with collision handling
- Migration should set columns to NOT NULL after population
- Migration should add unique constraints and indexes

**Validation Commands:**

```bash
npm run db:generate
npm run typecheck
```

**Success Criteria:**

- [ ] Migration file generated successfully
- [ ] Migration reviewed for correctness
- [ ] Slug population logic handles collisions properly
- [ ] All validation commands pass
- [ ] Migration execution confirmed via `/db` command

---

### Step 5: Update Validation Schemas

**What**: Add slug validation to Zod schemas for bobbleheads, collections, and subcollections
**Why**: Ensures type safety and validation for slug fields across the application
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\bobblehead.ts` - Add slug validation
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\collection.ts` - Add slug validation
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\subcollection.ts` - Add slug validation

**Changes:**

- Add slug field to bobblehead validation schema with pattern and length constraints
- Add slug field to collection validation schema with pattern and length constraints
- Add slug field to subcollection validation schema with pattern and length constraints
- Update create/update schemas to include slug field
- Use slug constants from Step 2 for validation rules

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Slug validation enforces format, length, and pattern requirements
- [ ] Validation schemas properly typed with Zod
- [ ] All validation commands pass

---

### Step 6: Update Database Queries for Slug Lookups

**What**: Modify query functions to use slug-based lookups instead of ID-based
**Why**: Changes data fetching layer to work with slugs as primary identifiers
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\bobblehead.ts` - Update query functions
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\collection.ts` - Update query functions
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\subcollection.ts` - Update query functions

**Changes:**

- Update `getBobbleheadById` to `getBobbleheadBySlug` with slug parameter
- Update `getCollectionById` to `getCollectionBySlug` with userId and slug parameters
- Update `getSubcollectionById` to `getSubcollectionBySlug` with collectionId and slug parameters
- Add slug-based query filters using Drizzle where clauses
- Update related queries that join on these entities to use slug fields
- Remove or deprecate ID-based query functions

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All query functions properly typed with slug parameters
- [ ] Queries use proper scoping (userId for collections, collectionId for subcollections)
- [ ] Related queries updated to use slug-based joins
- [ ] All validation commands pass

---

### Step 7: Update Facades for Slug-Based Operations

**What**: Modify facade layer to handle slug-based business logic
**Why**: Updates business logic layer to work with slug identifiers and handle uniqueness validation
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\facades\bobblehead.ts` - Update facade methods
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\facades\collection.ts` - Update facade methods
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\facades\subcollection.ts` - Update facade methods

**Changes:**

- Update create methods to generate slugs from entity names
- Add slug uniqueness validation before create/update operations
- Update get methods to use slug-based queries from Step 6
- Update update methods to handle slug regeneration when names change
- Add slug collision handling logic using utilities from Step 1
- Remove ID-based facade methods

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Facades properly generate and validate slugs
- [ ] Collision handling works correctly for duplicate names
- [ ] Update operations handle slug changes appropriately
- [ ] All validation commands pass

---

### Step 8: Update Server Actions for Slug Parameters

**What**: Modify server actions to accept and work with slug parameters
**Why**: Updates mutation layer to use slugs for entity identification
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\bobblehead.ts` - Update action signatures
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\collection.ts` - Update action signatures
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\subcollection.ts` - Update action signatures

**Changes:**

- Update action input schemas to accept slug instead of id
- Update action implementations to call slug-based facades
- Add slug validation to action input schemas
- Update return types to include slug fields
- Remove ID-based action variants

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Actions properly validate slug inputs
- [ ] Actions use next-safe-action pattern correctly
- [ ] All validation commands pass

---

### Step 9: Update Route Type Definitions

**What**: Modify route type files to change [id] patterns to [slug] patterns
**Why**: Updates TypeScript route definitions for next-typesafe-url
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[id]\route-types.ts` - Change to [slug] pattern
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collections\[username]\[collectionSlug]\route-types.ts` - Update pattern
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collections\[username]\[collectionSlug]\[subcollectionSlug]\route-types.ts` - Update pattern

**Changes:**

- Update bobblehead route type from `[id]` to `[slug]`
- Update collection route type from `[id]` to `[collectionSlug]`
- Update subcollection route type from `[id]` to `[subcollectionSlug]`
- Update route parameter type definitions
- Regenerate route types using `npm run next-typesafe-url`

**Validation Commands:**

```bash
npm run next-typesafe-url
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Route types use slug parameters
- [ ] next-typesafe-url generates updated $path types
- [ ] All validation commands pass

---

### Step 10: Rename Route Directories (BREAKING CHANGE)

**What**: Rename [id] directories to [slug] or [slugName] patterns in App Router
**Why**: Physical directory structure must match route type definitions
**Confidence**: High

**Files to Modify:**

- Rename `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[id]\` to `[slug]\`
- Rename collection and subcollection route directories to match slug patterns

**Changes:**

- Rename bobblehead [id] directory to [slug]
- Rename collection route directories to use [collectionSlug] pattern
- Rename subcollection route directories to use [subcollectionSlug] pattern
- Ensure nested route structure remains intact
- Update any route group names if necessary

**Validation Commands:**

```bash
npm run typecheck
```

**Success Criteria:**

- [ ] Directory names match route type definitions from Step 9
- [ ] All nested routes preserved correctly
- [ ] No broken imports from directory rename
- [ ] All validation commands pass

---

### Step 11: Update Page Component Parameters

**What**: Modify page.tsx files to use slug parameters instead of id
**Why**: Page components must destructure and use slug from route parameters
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[slug]\page.tsx` - Update params
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[slug]\edit\page.tsx` - Update params
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collections\[username]\[collectionSlug]\page.tsx` - Update params
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collections\[username]\[collectionSlug]\edit\page.tsx` - Update params
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collections\[username]\[collectionSlug]\[subcollectionSlug]\page.tsx` - Update params
- All other page components in renamed directories

**Changes:**

- Update page component props interface to use `slug` instead of `id`
- Update params destructuring to extract slug values
- Update data fetching calls to use slug-based queries
- Update metadata generation to use slug parameters
- Remove any id-based logic

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All page components properly typed with slug params
- [ ] Data fetching uses slug-based queries from Step 6
- [ ] Metadata generation works with slug parameters
- [ ] All validation commands pass

---

### Step 12: Update Layout Components

**What**: Modify layout.tsx files to use slug parameters
**Why**: Layout components need to handle slug-based routing for nested layouts
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[slug]\layout.tsx` - Update if exists
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collections\[username]\[collectionSlug]\layout.tsx` - Update if exists
- Any other layout files in renamed directories

**Changes:**

- Update layout component props to use slug parameters
- Update any data fetching for layout context
- Update metadata generation in layouts
- Ensure proper parameter passing to children

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Layout components properly typed with slug params
- [ ] Layouts pass correct context to nested routes
- [ ] All validation commands pass

---

### Step 13: Update Component $path() Calls

**What**: Replace all $path() calls throughout components to use slug parameters
**Why**: Navigation links must use slugs instead of IDs
**Confidence**: Medium

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\bobblehead\BobbleheadCard.tsx` - Update links
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\collections\CollectionCard.tsx` - Update links
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\subcollections\SubcollectionCard.tsx` - Update links
- All other components with navigation (12+ files discovered)

**Changes:**

- Replace `$path('/bobbleheads/:id', { id: bobblehead.id })` with slug-based paths
- Replace `$path('/collections/:username/:collectionSlug', ...)` with slug parameters
- Update all collection and subcollection navigation links
- Update breadcrumb components
- Update navigation menus
- Update dynamic links in cards and lists

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All $path() calls use slug parameters
- [ ] Navigation links properly typed with next-typesafe-url
- [ ] No references to id in route parameters
- [ ] All validation commands pass

---

### Step 14: Update Services and Utilities

**What**: Modify service layer functions to work with slug-based lookups
**Why**: Services that interact with entities need to use slug identifiers
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\services\bobblehead-service.ts` - Update methods
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\services\collection-service.ts` - Update methods
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\services\subcollection-service.ts` - Update methods
- Any utility files that reference entity IDs

**Changes:**

- Update service method signatures to accept slug parameters
- Update service implementations to call slug-based queries
- Update any caching keys to use slugs
- Update any URL generation logic

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Services use slug-based lookups
- [ ] Caching strategies updated for slug keys
- [ ] All validation commands pass

---

### Step 15: Update Middleware for Slug Routing

**What**: Modify middleware to handle slug-based route patterns
**Why**: Middleware needs to correctly identify and process slug-based routes
**Confidence**: Medium

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\middleware.ts` - Update route matching

**Changes:**

- Update route matching patterns to recognize slug parameters
- Update any authentication/authorization checks that use route parameters
- Update rate limiting keys if they use route identifiers
- Update any URL rewriting logic

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Middleware correctly matches slug-based routes
- [ ] Authentication and authorization work with slug parameters
- [ ] All validation commands pass

---

### Step 16: Update Analytics and Tracking

**What**: Modify analytics tracking to use slug identifiers
**Why**: Analytics events should track slug-based page views and interactions
**Confidence**: Low

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\analytics\tracking.ts` - Update event payloads
- Any components that send analytics events (4 files discovered)

**Changes:**

- Update page view tracking to include slug instead of id
- Update event payloads to use slug identifiers
- Update any analytics queries that group by identifier
- Ensure backwards compatibility in analytics data if needed

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Analytics events use slug parameters
- [ ] Event tracking properly typed
- [ ] All validation commands pass

---

### Step 17: Update Admin and Browse Pages

**What**: Modify admin dashboard and browse pages to work with slug-based routing
**Why**: Admin tools and browse functionality need to generate slug-based links
**Confidence**: Medium

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\bobbleheads\page.tsx` - Update links
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\page.tsx` - Update links
- Admin table components with action links

**Changes:**

- Update admin table row actions to use slug-based navigation
- Update browse page cards and links to use slugs
- Update any admin tools that generate URLs
- Update search results to link using slugs

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Admin pages navigate using slugs
- [ ] Browse functionality works with slug-based URLs
- [ ] All validation commands pass

---

### Step 18: Update Cache Invalidation Logic

**What**: Modify caching strategies to use slug-based cache keys
**Why**: Cache invalidation must work with slug identifiers
**Confidence**: Medium

**Files to Modify:**

- Any files implementing Next.js cache revalidation
- Redis cache key generation utilities

**Changes:**

- Update revalidatePath calls to use slug-based paths
- Update Redis cache keys to use slug identifiers
- Update cache invalidation in server actions
- Update any cache warming logic

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Cache invalidation uses correct slug-based paths
- [ ] Cache keys properly structured with slugs
- [ ] All validation commands pass

---

### Step 19: Remove All ID-Based Route References

**What**: Search and remove any remaining references to ID-based routing
**Why**: Ensures complete migration with no leftover ID-based code paths
**Confidence**: Medium

**Files to Modify:**

- Any files with remaining references to id parameters in routes

**Changes:**

- Search codebase for patterns like `params.id`, `searchParams.id`, `/[id]/`
- Remove or update any remaining ID-based route logic
- Update any documentation or comments referencing ID routes
- Remove deprecated helper functions

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] No remaining references to id in route parameters
- [ ] Codebase search confirms complete migration
- [ ] All validation commands pass

---

### Step 20: Comprehensive Testing and Validation

**What**: Test all slug-based routes and functionality end-to-end
**Why**: Validates that the entire migration works correctly across all features
**Confidence**: High

**Changes:**

- Test bobblehead detail pages with various slug formats
- Test collection and subcollection navigation
- Test slug collision handling with duplicate names
- Test edit operations that change entity names
- Test navigation from all entry points (cards, links, breadcrumbs)
- Test admin and browse pages
- Verify slug generation for special characters and unicode
- Test URL sharing and direct navigation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run build
```

**Success Criteria:**

- [ ] All bobblehead pages load correctly with slug URLs
- [ ] Collection and subcollection routing works end-to-end
- [ ] Slug generation handles edge cases properly
- [ ] Navigation works from all components
- [ ] No console errors or warnings
- [ ] All validation commands pass
- [ ] Production build succeeds

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Route types regenerated with `npm run next-typesafe-url`
- [ ] Database migration executed successfully on development branch
- [ ] Manual testing confirms all slug-based routes work
- [ ] Production build completes without errors
- [ ] All navigation links use slug-based $path() calls
- [ ] No references to ID-based routing remain in codebase

## Notes

**BREAKING CHANGES:**

- This migration is a breaking change with NO backwards compatibility
- All existing UUID-based URLs will break immediately
- Users with bookmarked links will need updated URLs
- External links to the site will break
- Consider communication plan for users about URL changes

**ASSUMPTIONS REQUIRING CONFIRMATION:**

- Slug uniqueness constraints are acceptable (global for bobbleheads, user-scoped for collections, collection-scoped for subcollections)
- Breaking existing URLs is acceptable for this project stage
- Development branch can be used for migration testing before production
- Entity names are suitable for slug generation (not excessively long or problematic)

**RISKS:**

- Slug collision handling must be thoroughly tested with real data
- Name changes require slug regeneration which may break shared links
- Migration may require significant testing time due to scope
- Database migration on large datasets could take time
- SEO impact from URL changes if site is already indexed

**RECOMMENDATIONS:**

- Test migration on development branch first with production data copy
- Document new URL structure for users and external systems
- Consider implementing 404 page with helpful messaging about URL changes
- Monitor analytics after deployment for broken link patterns
- Consider adding URL slug preview in entity creation/edit forms

---

## File Discovery Details

For complete file discovery results, see: `docs/2025_11_12/orchestration/slug-based-urls/02-file-discovery.md`

**Summary:**

- **Total Files**: 59 files requiring modification
- **Critical Priority**: 5 files (database schema & migrations)
- **High Priority**: 28 files (validations, routes, queries, actions, facades)
- **Medium Priority**: 20 files (components, services, infrastructure)
- **Low Priority**: 4 files (analytics, admin)
- **Supporting**: 2 files (constants)
- **New Files**: 2 (slug utilities, migration)
- **Directory Renames**: 3 (breaking changes)
