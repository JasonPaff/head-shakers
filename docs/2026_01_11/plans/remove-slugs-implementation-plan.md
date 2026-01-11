# Remove Slugs Implementation Plan

**Generated**: 2026-01-11
**Original Request**: Remove the concept of slugs from the application, they were necessary when the route was /collection/[collectionSlug] or /bobbleheads/[bobbleheadSlug] but now that the routes are scoped to the user name and collection they are not necessary anymore and we can use the collection/bobblehead name directly without modification.

**Refined Request**: Remove the slug concept entirely from the application since the routing structure has changed from /collection/[collectionSlug] and /bobbleheads/[bobbleheadSlug] to user-scoped routes that no longer require slugs, allowing collection and bobblehead names to be used directly without modification. This refactoring should span the entire codebase, starting with the Drizzle ORM database schema in src/lib/db/ where slug columns should be removed from the collections and bobbleheads tables, along with any associated unique indexes or constraints on those slug fields. Generate new Drizzle migrations to drop these columns from PostgreSQL. Update all Drizzle-Zod validation schemas that reference slug fields, removing slug from insert and select schemas, and modify any Zod validation schemas in src/lib/validations/ that validate or transform slugs. The server actions in src/lib/actions/ need updating to remove slug generation logic during collection and bobblehead creation or updates, and queries in src/lib/queries/ should be refactored to use name-based lookups instead of slug-based lookups where applicable, considering that routes are now scoped by username. Update the facade layer in src/lib/facades/ to remove any slug-related business logic. Modify the App Router route definitions in src/app/(app)/ to reflect the new parameter structure, updating dynamic route segments and their corresponding page components to work with names instead of slugs. Update next-typesafe-url route definitions and regenerate the $path types. Remove any slug utility functions from src/lib/utils/. Update all React components that reference slugs. Since the application is not yet in production, no backwards compatibility is needed.

---

## Analysis Summary

- Feature request refined with project context
- Discovered 100+ files across all architectural layers
- Generated 25-step implementation plan

---

## File Discovery Results

### CRITICAL Priority (6 files)
| File | Category | Status |
|------|----------|--------|
| `src/lib/db/schema/collections.schema.ts` | Database Schema | Modify |
| `src/lib/db/schema/bobbleheads.schema.ts` | Database Schema | Modify |
| `src/lib/constants/slug.ts` | Constants | **DELETE** |
| `src/lib/utils/slug.ts` | Utility | **DELETE** |
| `src/lib/validations/collections.validation.ts` | Validation | Modify |
| `src/lib/validations/bobbleheads.validation.ts` | Validation | Modify |

### HIGH Priority (15 files)
| File | Category |
|------|----------|
| `src/lib/facades/collections/collections.facade.ts` | Facade |
| `src/lib/facades/bobbleheads/bobbleheads.facade.ts` | Facade |
| `src/lib/queries/collections/collections.query.ts` | Query |
| `src/lib/queries/bobbleheads/bobbleheads-query.ts` | Query |
| `src/lib/services/cache-revalidation.service.ts` | Service |
| `src/lib/validations/bobblehead-navigation.validation.ts` | Validation |
| `src/lib/types/bobblehead-navigation.types.ts` | Types |
| `src/lib/facades/collections/collections-dashboard.facade.ts` | Facade |
| `src/lib/facades/bobbleheads/bobbleheads-dashboard.facade.ts` | Facade |
| `src/lib/queries/collections/collections-dashboard.query.ts` | Query |
| `src/lib/queries/bobbleheads/bobbleheads-dashboard.query.ts` | Query |
| `src/lib/queries/content-search/content-search.query.ts` | Query |
| `src/lib/queries/featured-content/featured-content-query.ts` | Query |
| `src/lib/queries/featured-content/featured-content-transformer.ts` | Query |
| `src/lib/actions/social/social.actions.ts` | Action |

### MEDIUM Priority (50+ files)
- Route folders: `[collectionSlug]` → `[collectionId]`, `[bobbleheadSlug]` → `[bobbleheadId]`
- 30+ components using slug in props/links
- SEO and utility files

### LOW Priority (40+ files)
- Integration, component, and unit tests
- Test factories and mocks

---

## Implementation Plan

### Overview

**Estimated Duration**: 3-4 days
**Complexity**: High
**Risk Level**: Medium

### Quick Summary

This refactoring removes the slug concept entirely from the Head Shakers application since routing has shifted to user-scoped routes (e.g., `/user/[username]/collection/[collectionId]`) that no longer require URL-friendly slugs. The work spans database schema modifications, validation schemas, facades, queries, route definitions, components, and test files. Since the application is not in production, no migration strategy or backwards compatibility is needed - this is a clean removal.

### Prerequisites

- [ ] Ensure local development environment is running and database is accessible
- [ ] Create a database backup before schema changes
- [ ] Ensure all tests pass before starting (`npm run test`)
- [ ] Ensure `npm run lint:fix && npm run typecheck` passes

---

### Step 1: Delete Slug Utility Files

**What**: Remove the dedicated slug utility and constants files that are no longer needed.
**Why**: These files contain slug generation, validation, and reserved words that will have no purpose after the refactoring.
**Confidence**: High

**Files to Delete:**
- `src/lib/constants/slug.ts` - Contains SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_PATTERN, SLUG_RESERVED_WORDS
- `src/lib/utils/slug.ts` - Contains generateSlug, ensureUniqueSlug, validateSlug functions

**Changes:**
- Delete both files entirely
- Remove all imports referencing these files throughout the codebase

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Both files deleted
- [ ] No imports referencing `@/lib/constants/slug` or `@/lib/utils/slug` remain
- [ ] All validation commands pass

---

### Step 2: Update Database Schema - Collections Table

**What**: Remove the slug column, slug index, and slug unique constraint from the collections schema.
**Why**: Collections will be identified by ID and accessed via user-scoped routes with collection names instead of slugs.
**Confidence**: High

**Files to Modify:**
- `src/lib/db/schema/collections.schema.ts` - Remove slug column definition, slug index, user_slug_unique constraint, and SLUG_MAX_LENGTH import

**Changes:**
- Remove import of `SLUG_MAX_LENGTH` from `@/lib/constants/slug`
- Remove `slug: varchar('slug', { length: SLUG_MAX_LENGTH }).notNull()` column
- Remove `index('collections_slug_idx').on(table.slug)` index
- Remove `uniqueIndex('collections_user_slug_unique').on(table.userId, table.slug)` constraint

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Collections schema no longer contains slug column
- [ ] Collections schema no longer references SLUG_MAX_LENGTH
- [ ] All validation commands pass

---

### Step 3: Update Database Schema - Bobbleheads Table

**What**: Remove the slug column and slug index from the bobbleheads schema.
**Why**: Bobbleheads will be identified by ID and accessed via user-scoped routes with names instead of slugs.
**Confidence**: High

**Files to Modify:**
- `src/lib/db/schema/bobbleheads.schema.ts` - Remove slug column definition, slug index, and SLUG_MAX_LENGTH import

**Changes:**
- Remove import of `SLUG_MAX_LENGTH` from `@/lib/constants/slug`
- Remove `slug: varchar('slug', { length: SLUG_MAX_LENGTH }).notNull().unique()` column
- Remove `index('bobbleheads_slug_idx').on(table.slug)` index

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Bobbleheads schema no longer contains slug column
- [ ] Bobbleheads schema no longer references SLUG_MAX_LENGTH
- [ ] All validation commands pass

---

### Step 4: Generate and Run Database Migration

**What**: Generate a Drizzle migration to drop the slug columns and indexes from PostgreSQL.
**Why**: The database needs to reflect the schema changes by removing the physical columns.
**Confidence**: High

**Changes:**
- Run `npm run db:generate` to create migration dropping slug columns
- Review the generated migration SQL to ensure it only drops slug-related items
- Run `npm run db:migrate` to apply the migration

**Validation Commands:**
```bash
npm run db:generate
npm run db:migrate
```

**Success Criteria:**
- [ ] Migration file generated successfully
- [ ] Migration drops collections.slug column and related indexes
- [ ] Migration drops bobbleheads.slug column and related indexes
- [ ] Migration runs without errors

---

### Step 5: Update Collections Validation Schema

**What**: Remove slug-related validation schemas and imports from collections validation.
**Why**: No slug validation is needed when slugs are not used.
**Confidence**: High

**Files to Modify:**
- `src/lib/validations/collections.validation.ts` - Remove slug from insert schema omit, remove getCollectionBySlugSchema, remove SLUG_* imports

**Changes:**
- Remove imports of `SLUG_MAX_LENGTH`, `SLUG_MIN_LENGTH`, `SLUG_PATTERN` from `@/lib/constants/slug`
- Remove `slug: true` from insertCollectionSchema omit clause
- Remove the entire `getCollectionBySlugSchema` export
- Update `UpdateCollection` type to remove slug if extended

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] No slug-related imports in collections validation
- [ ] insertCollectionSchema no longer omits slug (field removed from schema)
- [ ] getCollectionBySlugSchema removed entirely
- [ ] All validation commands pass

---

### Step 6: Update Bobbleheads Validation Schema

**What**: Remove slug-related validation schemas and imports from bobbleheads validation.
**Why**: No slug validation is needed when slugs are not used.
**Confidence**: High

**Files to Modify:**
- `src/lib/validations/bobbleheads.validation.ts` - Remove slug from insert schema omit, remove getBobbleheadBySlugSchema, remove SLUG_* imports

**Changes:**
- Remove imports of `SLUG_MAX_LENGTH`, `SLUG_MIN_LENGTH`, `SLUG_PATTERN` from `@/lib/constants/slug`
- Remove `slug: true` from insertBobbleheadSchema omit clause
- Remove the entire `getBobbleheadBySlugSchema` export

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] No slug-related imports in bobbleheads validation
- [ ] insertBobbleheadSchema no longer omits slug (field removed from schema)
- [ ] getBobbleheadBySlugSchema removed entirely
- [ ] All validation commands pass

---

### Step 7: Update Bobblehead Navigation Types and Validation

**What**: Remove slug field from navigation types and validation schemas.
**Why**: Navigation will use bobblehead IDs and names instead of slugs.
**Confidence**: High

**Files to Modify:**
- `src/lib/types/bobblehead-navigation.types.ts` - Remove slug from AdjacentBobblehead and NavigationContext types
- `src/lib/validations/bobblehead-navigation.validation.ts` - Remove slug from adjacentBobbleheadSchema and navigationContextSchema

**Changes:**
- Remove `slug: string` from AdjacentBobblehead type
- Remove `contextSlug: string` from NavigationContext type
- Remove `slug` field from adjacentBobbleheadSchema
- Remove `contextSlug` field from navigationContextSchema

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] AdjacentBobblehead type no longer contains slug
- [ ] NavigationContext type no longer contains contextSlug
- [ ] Corresponding validation schemas updated
- [ ] All validation commands pass

---

### Step 8: Update Collections Query Layer

**What**: Remove slug-related query methods and return fields from CollectionsQuery.
**Why**: Queries should no longer reference slug columns or provide slug-based lookups.
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/collections/collections.query.ts` - Remove findBySlugAsync, findBySlugWithRelationsAsync, getCollectionSlugsByUserIdAsync, getCollectionMetadata slug field, and BobbleheadListRecord.slug

**Changes:**
- Remove `findBySlugAsync` method entirely
- Remove `findBySlugWithRelationsAsync` method entirely
- Remove `getCollectionSlugsByUserIdAsync` method entirely
- Remove `slug` from `getCollectionMetadata` return type and query
- Remove `slug` field from `BobbleheadListRecord` type
- Remove `slug` from `BrowseCollectionRecord.collection` type
- Remove `collectionSlug` from `_selectBobbleheadWithPhoto` method
- Remove `slug` selections in `getBrowseCategoriesAsync` and `getBrowseCollectionsAsync`
- Remove `slug` from `CollectionDashboardListRecord` type

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] No slug-related query methods remain
- [ ] No slug fields in return types
- [ ] All validation commands pass

---

### Step 9: Update Bobbleheads Query Layer

**What**: Remove slug-related query methods and return fields from BobbleheadsQuery.
**Why**: Queries should no longer reference slug columns or provide slug-based lookups.
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/bobbleheads/bobbleheads-query.ts` - Remove findBySlugAsync, findBySlugWithRelationsAsync, getSlugsAsync, and slug from BobbleheadWithRelations

**Changes:**
- Remove `findBySlugAsync` method entirely
- Remove `findBySlugWithRelationsAsync` method entirely
- Remove `getSlugsAsync` method entirely
- Remove `collectionSlug` from `BobbleheadWithRelations` type
- Update `findByIdWithRelationsAsync` to not include `collection.slug`
- Remove `slug` references in `getBobbleheadMetadata` method

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] No slug-based query methods remain
- [ ] BobbleheadWithRelations no longer includes collectionSlug
- [ ] All validation commands pass

---

### Step 10: Update Collections Facade Layer

**What**: Remove slug generation logic and slug-based lookup methods from CollectionsFacade.
**Why**: The facade should no longer handle slug generation during create/update or provide slug lookups.
**Confidence**: High

**Files to Modify:**
- `src/lib/facades/collections/collections.facade.ts` - Remove slug imports, slug generation in createCollectionAsync and updateAsync, remove getCollectionBySlug and getCollectionBySlugWithRelations methods

**Changes:**
- Remove import of `ensureUniqueSlug`, `generateSlug` from `@/lib/utils/slug`
- In `createCollectionAsync`: Remove slug generation logic, remove `slug` from insert data
- In `updateAsync`: Remove slug regeneration logic when name changes
- Remove `getCollectionBySlug` method entirely
- Remove `getCollectionBySlugWithRelations` method entirely
- Remove `getCollectionSeoMetadata` slug parameter and return field
- Update `getCollectionForPublicView` to remove `slug` from return object
- Update cache revalidation calls to remove slug parameters

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] No slug generation logic in create/update methods
- [ ] No slug-based lookup methods
- [ ] All validation commands pass

---

### Step 11: Update Bobbleheads Facade Layer

**What**: Remove slug generation logic and slug-based lookup methods from BobbleheadsFacade.
**Why**: The facade should no longer handle slug generation during create/update or provide slug lookups.
**Confidence**: High

**Files to Modify:**
- `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Remove slug imports, generateUniqueSlugAsync method, slug-based methods, and slug parameters in cache invalidation

**Changes:**
- Remove import of `ensureUniqueSlug`, `generateSlug` from `@/lib/utils/slug`
- Remove `generateUniqueSlugAsync` private method entirely
- In `createAsync`: Remove slug generation, create without slug
- In `createWithPhotosAsync`: Remove slug generation, create without slug
- In `updateAsync`: Remove slug regeneration logic
- Remove `getBobbleheadBySlug` method entirely
- Remove `getBobbleheadBySlugWithRelations` method entirely
- Update `getBobbleheadNavigationData` to remove `slug` from transformation
- Update `getBobbleheadSeoMetadata` to remove slug return field
- Update `CreateBobbleheadResult` type to remove `collectionSlug`
- Update cache invalidation calls to remove slug parameters

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] No slug generation logic remains
- [ ] No slug-based lookup methods
- [ ] CreateBobbleheadResult no longer includes collectionSlug
- [ ] All validation commands pass

---

### Step 12: Update Cache Revalidation Service

**What**: Remove slug parameters from cache revalidation method signatures.
**Why**: Cache invalidation should use IDs instead of slugs for path revalidation.
**Confidence**: High

**Files to Modify:**
- `src/lib/services/cache-revalidation.service.ts` - Update method signatures to remove slug parameters, update path revalidation to use IDs

**Changes:**
- Update `bobbleheads.onCreate` to remove `bobbleheadSlug`, `collectionSlug` parameters
- Update `bobbleheads.onDelete` to remove `bobbleheadSlug`, `collectionSlug` parameters
- Update `bobbleheads.onPhotoChange` to remove slug parameters
- Update `bobbleheads.onTagChange` to remove slug parameters
- Update `bobbleheads.onUpdate` to remove slug parameters
- Update `collections.onCreate` to remove `collectionSlug` parameter
- Update `collections.onDelete` to remove `collectionSlug` parameter
- Update `collections.onUpdate` to remove `collectionSlug` parameter
- Update `collections.onBobbleheadChange` to remove slug parameters
- Update `social.onCommentChange` to remove `entitySlug`, `collectionSlug` parameters
- Update `social.onLikeChange` to remove `entitySlug`, `collectionSlug` parameters
- Update path revalidation calls to use ID-based routes or remove if no longer applicable

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] No slug parameters in cache revalidation method signatures
- [ ] Path revalidation updated to use ID-based patterns
- [ ] All validation commands pass

---

### Step 13: Rename Route Folder Segments - Collections

**What**: Rename the `[collectionSlug]` dynamic route folder to `[collectionId]`.
**Why**: Routes should use IDs instead of slugs for identification.
**Confidence**: High

**Files to Modify:**
- Rename `src/app/(app)/user/[username]/collection/[collectionSlug]` to `[collectionId]`
- Update `route-type.ts` in the renamed folder

**Changes:**
- Rename folder from `[collectionSlug]` to `[collectionId]`
- Update `route-type.ts` to validate `collectionId` as UUID instead of slug pattern
- Remove SLUG_* imports from route-type.ts
- Update routeParams schema to use `collectionId: z.uuid()`

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Route folder renamed to `[collectionId]`
- [ ] route-type.ts uses UUID validation for collectionId
- [ ] All validation commands pass

---

### Step 14: Rename Route Folder Segments - Bobbleheads

**What**: Rename the `[bobbleheadSlug]` dynamic route folder to `[bobbleheadId]`.
**Why**: Routes should use IDs instead of slugs for identification.
**Confidence**: High

**Files to Modify:**
- Rename `src/app/(app)/user/[username]/collection/[collectionId]/bobbleheads/[bobbleheadSlug]` to `[bobbleheadId]`
- Update `route-type.ts` in the renamed folder

**Changes:**
- Rename folder from `[bobbleheadSlug]` to `[bobbleheadId]`
- Update `route-type.ts` to validate `bobbleheadId` and `collectionId` as UUIDs
- Remove SLUG_* imports from route-type.ts
- Update routeParams schema to use UUID validation

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Route folder renamed to `[bobbleheadId]`
- [ ] route-type.ts uses UUID validation for both IDs
- [ ] All validation commands pass

---

### Step 15: Regenerate next-typesafe-url Types

**What**: Run the next-typesafe-url generator to update the `$path` types.
**Why**: The type definitions need to reflect the new route parameter names.
**Confidence**: High

**Changes:**
- Run `npm run next-typesafe-url` to regenerate `_next-typesafe-url_.d.ts`
- Verify generated types use `collectionId` and `bobbleheadId` instead of slugs

**Validation Commands:**
```bash
npm run next-typesafe-url
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] `_next-typesafe-url_.d.ts` regenerated successfully
- [ ] Routes now use `[collectionId]` and `[bobbleheadId]` parameters
- [ ] All validation commands pass

---

### Step 16: Update Page Components - Collection Page

**What**: Update the collection page component to use collectionId instead of collectionSlug.
**Why**: Page components need to receive and use IDs for data fetching.
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/user/[username]/collection/[collectionId]/page.tsx` - Update route params usage
- `src/app/(app)/user/[username]/collection/[collectionId]/types.ts` - Update types if exists
- All components in `src/app/(app)/user/[username]/collection/[collectionId]/components/` - Update prop types and data fetching

**Changes:**
- Update page.tsx to extract `collectionId` from routeParams instead of `collectionSlug`
- Update data fetching to use `getByIdAsync` instead of slug-based methods
- Update all child components to receive and use IDs
- Update link generation to use IDs

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Page extracts collectionId from route params
- [ ] Data fetching uses ID-based methods
- [ ] All validation commands pass

---

### Step 17: Update Page Components - Bobblehead Page

**What**: Update the bobblehead page component to use bobbleheadId instead of bobbleheadSlug.
**Why**: Page components need to receive and use IDs for data fetching.
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/user/[username]/collection/[collectionId]/bobbleheads/[bobbleheadId]/page.tsx` - Update route params usage
- All components in `src/app/(app)/user/[username]/collection/[collectionId]/bobbleheads/[bobbleheadId]/components/` - Update prop types and data fetching

**Changes:**
- Update page.tsx to extract `bobbleheadId` and `collectionId` from routeParams
- Update data fetching to use `getBobbleheadById` instead of slug-based methods
- Update all child components to receive and use IDs
- Update navigation component to use IDs instead of slugs
- Update link generation throughout

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Page extracts bobbleheadId and collectionId from route params
- [ ] Data fetching uses ID-based methods
- [ ] Navigation uses IDs for prev/next links
- [ ] All validation commands pass

---

### Step 18: Update Dashboard Query and Facade Files

**What**: Remove slug fields from dashboard-specific query and facade files.
**Why**: Dashboard views should not include or display slug information.
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/collections/collections-dashboard.query.ts` - Remove slug from return types and queries
- `src/lib/queries/bobbleheads/bobbleheads-dashboard.query.ts` - Remove slug from return types and queries
- `src/lib/facades/collections/collections-dashboard.facade.ts` - Remove slug usage
- `src/lib/facades/bobbleheads/bobbleheads-dashboard.facade.ts` - Remove slug usage

**Changes:**
- Remove `slug` from dashboard record types
- Remove slug selections from dashboard queries
- Update dashboard facades to not reference slugs

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] No slug fields in dashboard types
- [ ] No slug in dashboard query results
- [ ] All validation commands pass

---

### Step 19: Update Content Search and Featured Content Queries

**What**: Remove slug fields from search and featured content query transformers.
**Why**: Search results and featured content should use IDs for navigation.
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/content-search/content-search.query.ts` - Remove slug from search results
- `src/lib/queries/featured-content/featured-content-query.ts` - Remove slug from featured content
- `src/lib/queries/featured-content/featured-content-transformer.ts` - Remove slug transformations

**Changes:**
- Update search result types to exclude slug
- Update featured content result types to exclude slug
- Update transformers to not include slug in output

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Search results use IDs instead of slugs
- [ ] Featured content uses IDs instead of slugs
- [ ] All validation commands pass

---

### Step 20: Update Social Actions

**What**: Remove slug parameters from social action methods.
**Why**: Social actions should use IDs for cache invalidation.
**Confidence**: High

**Files to Modify:**
- `src/lib/actions/social/social.actions.ts` - Remove slug parameters from action methods

**Changes:**
- Update like/unlike actions to remove slug parameters
- Update comment actions to remove slug parameters
- Update follow actions if they use slug

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] No slug parameters in social action signatures
- [ ] All validation commands pass

---

### Step 21: Update Feature Components Throughout Codebase

**What**: Update all feature components that reference slug in props, links, or display logic.
**Why**: Components must use IDs for link generation and data display.
**Confidence**: Medium

**Files to Modify:**
- Components in `src/components/feature/` directories
- Dashboard page components in `src/app/(app)/user/[username]/dashboard/`
- Browse page components in `src/app/(app)/browse/`
- Admin components in `src/components/admin/`

**Changes:**
- Update component prop types to use IDs instead of slugs
- Update `$path` calls to use `collectionId` and `bobbleheadId` parameters
- Update any display of slug fields to show name instead
- Update link generation throughout

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All components use IDs in prop types
- [ ] All `$path` calls use ID parameters
- [ ] No slug display in UI
- [ ] All validation commands pass

---

### Step 22: Update Middleware

**What**: Update middleware if it contains any slug-related logic.
**Why**: Middleware should process ID-based routes.
**Confidence**: High

**Files to Modify:**
- `src/middleware.ts` - Update route matching patterns if needed

**Changes:**
- Update any route matchers that reference slug patterns
- Update any slug validation or transformation logic

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Middleware handles ID-based routes correctly
- [ ] All validation commands pass

---

### Step 23: Update Test Factories and Mocks

**What**: Remove slug fields from test factories, mocks, and MSW handlers.
**Why**: Test infrastructure must match the updated schema.
**Confidence**: High

**Files to Modify:**
- Test factory files in `tests/fixtures/`
- MSW handlers in `tests/mocks/handlers/`
- Mock data files in `tests/mocks/data/`

**Changes:**
- Remove slug field generation from collection factories
- Remove slug field generation from bobblehead factories
- Update mock data to exclude slug fields
- Update MSW handlers to not return slug fields

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] No slug in factory-generated data
- [ ] Mock data excludes slugs
- [ ] All validation commands pass

---

### Step 24: Update Integration and Unit Tests

**What**: Update all test files that reference slugs.
**Why**: Tests must reflect the new ID-based architecture.
**Confidence**: Medium

**Files to Modify:**
- Integration tests in `tests/integration/`
- Component tests in `tests/components/`
- Unit tests in `tests/unit/`
- E2E tests if any reference slugs

**Changes:**
- Update test assertions to not expect slug fields
- Update test data creation to not include slugs
- Update route testing to use ID parameters
- Remove tests for slug generation and validation utilities

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
npm run test
```

**Success Criteria:**
- [ ] No test references slug fields
- [ ] Tests for slug utilities removed
- [ ] All tests pass
- [ ] All validation commands pass

---

### Step 25: Final Verification and Cleanup

**What**: Run full verification suite and clean up any remaining slug references.
**Why**: Ensure complete removal and application stability.
**Confidence**: High

**Changes:**
- Run grep search for any remaining "slug" references
- Address any edge cases discovered
- Run full test suite
- Run build to verify production readiness

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
npm run test
npm run build
```

**Success Criteria:**
- [ ] No remaining slug references in source code (except potentially third-party)
- [ ] All linting passes
- [ ] All type checking passes
- [ ] All tests pass
- [ ] Build succeeds

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Database migration runs successfully
- [ ] `npm run next-typesafe-url` regenerates types correctly
- [ ] Full test suite passes with `npm run test`
- [ ] Build succeeds with `npm run build`
- [ ] No remaining slug references in codebase (verify with grep)

## Notes

- **Breaking Change**: This is a significant refactoring that changes URL structure from `/user/[username]/collection/[collectionSlug]` to `/user/[username]/collection/[collectionId]`. All existing bookmarks/links would break, but this is acceptable since the application is not in production.

- **Estimation Uncertainty**: The 3-4 day estimate assumes focused work. The component update steps (16, 17, 21) may take longer depending on the number of components and the complexity of their slug usage patterns.

- **Testing Strategy**: Update tests incrementally after each step to catch regressions early. The full test suite should pass after each major step.

- **Database Migration**: Run the migration on a test database first to verify it executes correctly before applying to development/staging environments.

- **Route Changes**: Renaming route folders (Steps 13-14) may require clearing Next.js cache (`.next` folder) to ensure proper routing.

- **ID vs Name Display**: While routes now use IDs, the UI should continue to display human-readable collection and bobblehead names. The ID is used only for routing/identification, not display.
