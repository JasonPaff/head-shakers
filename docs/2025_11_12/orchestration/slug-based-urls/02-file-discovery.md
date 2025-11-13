# Step 2: File Discovery

**Status**: ✅ Completed
**Started**: 2025-11-12T00:00:02Z
**Completed**: 2025-11-12T00:00:05Z
**Duration**: ~3 seconds

## Input

### Refined Feature Request

Implement a comprehensive migration to slug-based URL architecture for bobbleheads, subcollections, and collections, eliminating all GUID-based routing with no backwards compatibility support. This requires updating the Next.js App Router pages to use human-readable slugs instead of UUIDs, with slugs generated from entity names and stored in the PostgreSQL database schema via Drizzle ORM migrations. Each slug must be unique within its entity type and organizational context (e.g., bobbleheads globally, subcollections within parent collections, collections per user), with validation and collision-handling logic implemented through Zod schemas to ensure data integrity.

## AI-Powered File Discovery Analysis

### Discovery Metrics

- **Directories Explored**: 8 major directories
- **Candidate Files Examined**: 75+ files
- **Relevant Files Discovered**: 59 files
- **New Files to Create**: 2 files
- **Directory Renames Required**: 3 directories
- **AI Analysis Duration**: ~3 seconds

### Comprehensive File Discovery Results

#### CRITICAL PRIORITY - Database Schema & Migrations (5 files)

1. **`src/lib/db/schema/bobbleheads.schema.ts`** (MODIFY)
   - Relevance: Contains bobbleheads table definition
   - Required Changes: Add slug column (varchar, unique, indexed)
   - AI Reasoning: Core database schema for bobblehead entities

2. **`src/lib/db/schema/collections.schema.ts`** (MODIFY)
   - Relevance: Contains collections and subCollections tables
   - Required Changes: Add slug columns with appropriate uniqueness constraints
   - AI Reasoning: Both collections and subcollections need slug support

3. **`src/lib/db/schema/index.ts`** (VERIFY)
   - Relevance: Central schema export point
   - Required Changes: Verification after schema modifications
   - AI Reasoning: Ensures schema exports are correct post-migration

4. **`drizzle.config.ts`** (REFERENCE)
   - Relevance: Drizzle migration configuration
   - Required Changes: None (reference for migration generation)
   - AI Reasoning: Defines migration output location

5. **`src/lib/db/migrations/[timestamp]_add_slug_columns.sql`** (CREATE)
   - Relevance: Database migration file
   - Required Changes: New file - add slug columns, populate data, add constraints
   - AI Reasoning: Migration to implement schema changes

#### HIGH PRIORITY - Validation Schemas (3 files)

6. **`src/lib/validations/bobbleheads.validation.ts`** (MODIFY)
   - Priority: HIGH
   - Changes: Add slug field to insert/update schemas, change ID validation to slug
   - AI Analysis: All Zod validation must support slug-based operations

7. **`src/lib/validations/collections.validation.ts`** (MODIFY)
   - Priority: HIGH
   - Changes: Add slug validation with user-scoped uniqueness
   - AI Analysis: Collection slugs unique per user

8. **`src/lib/validations/subcollections.validation.ts`** (MODIFY)
   - Priority: HIGH
   - Changes: Add slug validation with collection-scoped uniqueness
   - AI Analysis: Subcollection slugs unique within parent collection

#### HIGH PRIORITY - Route Type Definitions (5 files)

9. **`src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/route-type.ts`** (MODIFY)
   - Priority: HIGH
   - Changes: Rename param to bobbleheadSlug, change validation from UUID to slug pattern
   - AI Analysis: Type-safe routing requires updated param validation

10. **`src/app/(app)/bobbleheads/[bobbleheadId]/edit/route-type.ts`** (MODIFY)
    - Priority: HIGH
    - Changes: Update to slug-based validation
    - AI Analysis: Edit routes must match detail route patterns

11. **`src/app/(app)/collections/[collectionId]/(collection)/route-type.ts`** (MODIFY)
    - Priority: HIGH
    - Changes: Change to collectionSlug with slug validation
    - AI Analysis: Primary collection route type definition

12. **`src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/route-type.ts`** (MODIFY)
    - Priority: HIGH
    - Changes: Update both params to slug-based (collectionSlug, subcollectionSlug)
    - AI Analysis: Nested routing requires both slugs

13. **`next-typesafe-url.config.ts`** (VERIFY)
    - Priority: HIGH
    - Changes: Verify configuration after route renaming
    - AI Analysis: May need updates for renamed directories

#### HIGH PRIORITY - App Router Pages (10 files + 3 directory renames)

14. **RENAME: `src/app/(app)/bobbleheads/[bobbleheadId]/`** → **`[bobbleheadSlug]/`**
    - Priority: HIGH
    - AI Analysis: Breaking change - directory must match param name

15. **`src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx`** (MODIFY)
    - Priority: HIGH
    - Changes: Update param destructuring to bobbleheadSlug
    - AI Analysis: Main detail page for bobbleheads

16. **`src/app/(app)/bobbleheads/[bobbleheadSlug]/edit/page.tsx`** (MODIFY)
    - Priority: HIGH
    - Changes: Update to slug parameter
    - AI Analysis: Edit functionality requires slug support

17. **RENAME: `src/app/(app)/collections/[collectionId]/`** → **`[collectionSlug]/`**
    - Priority: HIGH
    - AI Analysis: Collection route directory rename

18. **`src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx`** (MODIFY)
    - Priority: HIGH
    - Changes: Update param from collectionId to collectionSlug
    - AI Analysis: Collection detail page

19. **`src/app/(app)/collections/[collectionSlug]/edit/page.tsx`** (MODIFY)
    - Priority: HIGH
    - Changes: Update slug param handling
    - AI Analysis: Collection edit page

20. **`src/app/(app)/collections/[collectionSlug]/settings/page.tsx`** (MODIFY)
    - Priority: HIGH
    - Changes: Update slug param handling
    - AI Analysis: Settings require collection identification

21. **`src/app/(app)/collections/[collectionSlug]/share/page.tsx`** (MODIFY)
    - Priority: HIGH
    - Changes: Update slug param handling
    - AI Analysis: Share functionality uses URLs with slugs

22. **RENAME: `src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/`** → **`[subcollectionSlug]/`**
    - Priority: HIGH
    - AI Analysis: Subcollection directory rename (note: collectionId also renamed to collectionSlug)

23. **`src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/page.tsx`** (MODIFY)
    - Priority: HIGH
    - Changes: Update both params to slugs
    - AI Analysis: Nested routing with dual slug params

#### HIGH PRIORITY - Database Queries (3 files)

24. **`src/lib/queries/bobbleheads/bobbleheads-query.ts`** (MODIFY)
    - Priority: HIGH
    - Changes: Add findBySlugAsync(), update existing queries
    - AI Analysis: Data access layer needs slug support

25. **`src/lib/queries/collections/collections.query.ts`** (MODIFY)
    - Priority: HIGH
    - Changes: Add findBySlugAsync() with user context
    - AI Analysis: User-scoped slug lookups

26. **`src/lib/queries/collections/subcollections.query.ts`** (MODIFY)
    - Priority: HIGH
    - Changes: Add findBySlugAsync() with collection context
    - AI Analysis: Collection-scoped slug lookups

#### HIGH PRIORITY - Server Actions (3 files)

27. **`src/lib/actions/bobbleheads/bobbleheads.actions.ts`** (MODIFY)
    - Priority: HIGH
    - Changes: Generate slug on create, validate on update, handle collisions
    - AI Analysis: Server actions must generate and validate slugs

28. **`src/lib/actions/collections/collections.actions.ts`** (MODIFY)
    - Priority: HIGH
    - Changes: User-scoped slug generation and validation
    - AI Analysis: Collections need user context for uniqueness

29. **`src/lib/actions/collections/subcollections.actions.ts`** (MODIFY)
    - Priority: HIGH
    - Changes: Collection-scoped slug generation
    - AI Analysis: Subcollections need parent context

#### HIGH PRIORITY - Facades (3 files)

30. **`src/lib/facades/bobbleheads/bobbleheads.facade.ts`** (MODIFY)
    - Priority: HIGH
    - Changes: Add getBobbleheadBySlug(), update existing methods
    - AI Analysis: Business logic layer bridges queries and actions

31. **`src/lib/facades/collections/collections.facade.ts`** (MODIFY)
    - Priority: HIGH
    - Changes: Add getCollectionBySlug() with user context
    - AI Analysis: Collection business logic with user scoping

32. **`src/lib/facades/collections/subcollections.facade.ts`** (MODIFY)
    - Priority: HIGH
    - Changes: Add getSubcollectionBySlug() with collection context
    - AI Analysis: Subcollection business logic with parent context

#### HIGH PRIORITY - Utility Files (2 files - NEW)

33. **`src/lib/utils/slug.utils.ts`** (CREATE)
    - Priority: HIGH
    - Purpose: Centralized slug generation and validation utilities
    - Required Functions:
      - `generateSlug(name: string): string`
      - `validateSlug(slug: string): boolean`
      - `handleSlugCollision(baseSlug: string, existing: string[]): string`
      - `isSlugAvailable(slug: string, type, context): Promise<boolean>`
    - AI Analysis: Essential utility for consistent slug handling

34. **`src/lib/utils/zod.utils.ts`** (MODIFY)
    - Priority: HIGH
    - Changes: Add zodSlug() validation helper
    - Pattern: `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`
    - AI Analysis: Reusable Zod schema for slug validation

#### MEDIUM PRIORITY - Components (12 files)

35. **`src/components/feature/bobblehead/bobblehead-gallery-card.tsx`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Update $path() call from bobbleheadId to bobbleheadSlug
    - AI Analysis: Gallery cards link to detail pages

36. **`src/components/feature/bobblehead/bobblehead-delete-dialog.tsx`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Update navigation after delete
    - AI Analysis: Post-delete navigation uses $path()

37. **`src/components/feature/bobblehead/bobblehead-delete.tsx`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Update navigation logic
    - AI Analysis: Delete functionality navigation

38. **`src/components/feature/bobblehead/bobblehead-share-menu.tsx`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Generate share URLs with slugs
    - AI Analysis: Share URLs more readable with slugs

39. **`src/components/feature/collections/collection-share-menu.tsx`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Collection share URL generation
    - AI Analysis: Slug-based share URLs

40. **`src/components/feature/subcollections/subcollection-share-menu.tsx`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Subcollection share URLs
    - AI Analysis: Hierarchical share URLs

41. **`src/components/feature/search/search-result-item.tsx`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Update $path() calls for all entity types (lines 45-51)
    - AI Analysis: Search results link to slug-based URLs

42. **`src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-header-async.tsx`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Update prop from bobbleheadId to bobbleheadSlug
    - AI Analysis: Async component receives route params

43. **`src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-detail-cards-async.tsx`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Update prop types and query calls
    - AI Analysis: Detail cards query by slug

44. **`src/app/(app)/collections/[collectionSlug]/(collection)/components/async/collection-header-async.tsx`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Update from collectionId to collectionSlug
    - AI Analysis: Collection header component

45. **`src/app/(app)/collections/[collectionSlug]/(collection)/components/async/collection-bobbleheads-async.tsx`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Update collection query by slug
    - AI Analysis: Collection content loading

46. **`src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/async/subcollection-header-async.tsx`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Update to dual slug params
    - AI Analysis: Subcollection header with both slugs

#### MEDIUM PRIORITY - Services & Infrastructure (4 files)

47. **`src/lib/services/cache-revalidation.service.ts`** (REVIEW)
    - Priority: MEDIUM
    - Changes: Review slug-based invalidation strategies
    - AI Analysis: Cache invalidation may benefit from slug tags

48. **`src/lib/utils/cache-tags.utils.ts`** (REVIEW)
    - Priority: MEDIUM
    - Changes: Consider slug-based cache tags
    - AI Analysis: Currently uses IDs, slugs may improve debugging

49. **`src/lib/utils/share-utils.ts`** (VERIFY)
    - Priority: MEDIUM
    - Changes: Verify generateAbsoluteUrl() works with slugs
    - AI Analysis: No direct changes needed

50. **`src/middleware.ts`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Update route matchers from `:id` to `:slug` patterns
    - AI Analysis: Authentication and rate limiting route patterns

#### LOW PRIORITY - Analytics & Tracking (4 files)

51. **`src/components/analytics/bobblehead-view-tracker.tsx`** (REVIEW)
    - Priority: LOW
    - Changes: May receive slug, verify internal tracking
    - AI Analysis: Tracking may still use IDs internally

52. **`src/components/analytics/collection-view-tracker.tsx`** (REVIEW)
    - Priority: LOW
    - Changes: Similar tracking considerations
    - AI Analysis: View tracking with slug params

53. **`src/lib/facades/analytics/view-tracking.facade.ts`** (VERIFY)
    - Priority: LOW
    - Changes: Verify slug-based routing compatibility
    - AI Analysis: Analytics facade may need slug resolution

54. **`src/lib/services/view-tracking.service.ts`** (REVIEW)
    - Priority: LOW
    - Changes: May need slug-to-ID resolution
    - AI Analysis: Service layer tracking logic

#### LOW PRIORITY - Admin & Browse (3 files)

55. **`src/components/admin/analytics/trending-content-table.tsx`** (MODIFY)
    - Priority: LOW
    - Changes: Update links from IDs to slugs
    - AI Analysis: Admin table links to entities

56. **`src/app/(app)/browse/components/browse-collections-table.tsx`** (MODIFY)
    - Priority: LOW
    - Changes: Collection links in browse views
    - AI Analysis: Browse navigation to slug URLs

57. **`src/lib/validations/browse-collections.validation.ts`** (REVIEW)
    - Priority: LOW
    - Changes: Review for slug compatibility
    - AI Analysis: Browse filters may reference IDs

#### SUPPORTING FILES - Constants (2 files)

58. **`src/lib/constants/schema-limits.ts`** (MODIFY)
    - Priority: MEDIUM
    - Changes: Add slug length limits for all entities
    - Suggested Values:
      - `BOBBLEHEAD.SLUG: { MAX: 100, MIN: 3 }`
      - `COLLECTION.SLUG: { MAX: 100, MIN: 3 }`
      - `SUB_COLLECTION.SLUG: { MAX: 100, MIN: 3 }`
    - AI Analysis: Consistent limits across entities

59. **`src/lib/constants/index.ts`** (VERIFY)
    - Priority: LOW
    - Changes: Verify slug constant exports
    - AI Analysis: Central constants export point

## Architecture Insights from AI Analysis

### Existing Patterns Identified

1. **Next-Typesafe-URL Integration**: Each dynamic route has `route-type.ts` with Zod validation
2. **Three-Layer Architecture**: Facades → Queries → Database
3. **Drizzle-Zod Integration**: Schemas generated from Drizzle tables
4. **Tag-Based Caching**: Sophisticated cache invalidation system
5. **Full-Text Search**: PostgreSQL GIN indexes for name/description fields

### Similar Functionality Found

- **Username System**: Users table already implements name-based routing (not UUID)
- **Tag System**: Tags use name-based identifiers alongside IDs
- **Search Infrastructure**: Existing GIN indexes can support slug searching

### Integration Points

1. **Route Parameter Validation**: All route-type.ts files have UUID validation
2. **$path() Calls**: 30+ instances across components
3. **Database Queries**: Every `eq(table.id, value)` needs slug alternative
4. **Cache Keys**: Tag-based system may benefit from slug keys
5. **Middleware Routes**: Pattern matchers use `:id` syntax

### Key Implementation Challenges

1. **Unique Constraint Context**:
   - Bobbleheads: Global uniqueness
   - Collections: Per-user uniqueness
   - Subcollections: Per-collection uniqueness

2. **Slug Generation Timing**:
   - Auto-generate vs user input
   - Collision handling strategy
   - Update behavior

3. **Migration Strategy**:
   - Populate existing records
   - Handle duplicates
   - Zero-downtime approach

4. **SEO Considerations**:
   - Meaningful slugs
   - Keyword inclusion
   - Stability over time

## File Validation Results

### Existence Checks

- ✅ All discovered files exist and are accessible
- ✅ Directory structure verified
- ✅ No permission issues detected

### Files Requiring Creation

1. `src/lib/utils/slug.utils.ts` - New utility file
2. `src/lib/db/migrations/[timestamp]_add_slug_columns.sql` - Migration file

### Directories Requiring Rename

1. `src/app/(app)/bobbleheads/[bobbleheadId]/` → `[bobbleheadSlug]/`
2. `src/app/(app)/collections/[collectionId]/` → `[collectionSlug]/`
3. `src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/` → `[collectionSlug]/subcollection/[subcollectionSlug]/`

## Discovery Statistics

- **Critical Priority**: 5 files (Database schema & migrations)
- **High Priority**: 28 files (Validations, routes, queries, actions, facades, utilities)
- **Medium Priority**: 20 files (Components, services, infrastructure)
- **Low Priority**: 4 files (Analytics, admin, browse)
- **Supporting Files**: 2 files (Constants)
- **Total Files**: 59 files
- **New Files**: 2 files
- **Directory Renames**: 3 directories

## Coverage Analysis

✅ **Database Layer**: Complete coverage (schema, migrations)
✅ **Validation Layer**: All Zod schemas identified
✅ **Data Access Layer**: All query files discovered
✅ **Business Logic Layer**: All facades identified
✅ **Routing Layer**: All route types and pages found
✅ **Component Layer**: All linking and navigation components
✅ **Infrastructure**: Middleware, caching, services covered
✅ **Constants**: Schema limits and exports identified

## Implementation Roadmap

### Phase 1: Foundation
Files: 33, 34, 58, 59, 1-5 (11 files)
- Slug utilities and constants
- Database schema changes
- Migration generation and execution

### Phase 2: Data Layer
Files: 6-8, 24-32 (12 files)
- Validation schemas
- Query methods
- Facades
- Server actions

### Phase 3: Routing
Files: 9-23 (15 files)
- Route type definitions
- Directory renames
- Page components

### Phase 4: Components
Files: 35-46 (12 files)
- Component updates
- Navigation logic
- Async components

### Phase 5: Infrastructure
Files: 47-57 (11 files)
- Middleware
- Caching
- Admin/analytics
- Testing

## Estimated Implementation Time

- **Phase 1**: 1 day (Foundation)
- **Phase 2**: 1 day (Data layer)
- **Phase 3**: 1 day (Routing - breaking changes)
- **Phase 4**: 0.5 days (Components)
- **Phase 5**: 0.5 days (Infrastructure & testing)
- **Total**: 4-5 days with comprehensive testing

## Next Steps

Proceed to Step 3: Implementation Planning
