# Implementation Plan: Complete Removal of Tags Feature from Bobbleheads

Generated: 2026-01-11
Original Request: remove the tags feature from bobbleheads, remove it from the add/edit bobblehead form and anywhere else. The app is not in production yet so no backwards compatible approach is needed. The entire concept of tags for bobbleheads should be removed completely.

## Overview

**Estimated Duration**: 6-8 hours
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

This plan systematically removes the complete tags feature from the bobblehead application, including database schema definitions (tags table and bobblehead_tags junction table), all validation schemas, server actions, queries, facade methods, UI components, and related constants. The removal follows a safe order: UI components first to prevent runtime errors, then server-side logic, and finally database schema changes with migration generation.

## Prerequisites

- [ ] Ensure no uncommitted changes exist in the working directory
- [ ] Create a feature branch for this removal (e.g., `feature/remove-tags`)
- [ ] Verify database access for migration generation with `npm run db:generate`
- [ ] Confirm all tests pass before starting: `npm run test`

## Implementation Steps

### Step 1: Remove Tag-Specific UI Components

**What**: Delete standalone tag UI components that are exclusively used for tags functionality.
**Why**: Removing these first prevents import errors in other components that may reference them.
**Confidence**: High

**Files to Delete:**

- `src/components/ui/tags-input.tsx` - Tags input primitive wrapper
- `src/components/ui/tag-badge.tsx` - Tag badge and list display components
- `src/components/ui/form/field-components/tag-field.tsx` - TanStack Form tag field component
- `src/app/(app)/user/[username]/dashboard/collection/components/add-form/item-tags.tsx` - Add form tag section
- `src/app/(app)/admin/featured-content/components/tag-filter.tsx` - Admin tag filter component

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All listed files are deleted
- [ ] No orphaned imports referencing deleted components
- [ ] All validation commands pass

---

### Step 2: Remove TagField from Form System Registration

**What**: Unregister TagField from the TanStack Form hook configuration.
**Why**: The form system must not reference the deleted TagField component.
**Confidence**: High

**Files to Modify:**

- `src/components/ui/form/index.tsx` - Remove TagField import and fieldComponents entry

**Changes:**

- Remove import statement for TagField
- Remove TagField from the fieldComponents object in createFormHook

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] TagField is removed from form hook configuration
- [ ] Form system initializes without errors
- [ ] All validation commands pass

---

### Step 3: Remove Tag References from Bobblehead Forms

**What**: Remove ItemTags component usage and tags field from add/edit bobblehead form displays.
**Why**: Forms must not render removed tag sections or include tags in form state.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/user/[username]/dashboard/collection/components/display/add-bobblehead-form-display.tsx` - Remove ItemTags import and component usage
- `src/app/(app)/user/[username]/dashboard/collection/components/display/edit-bobblehead-form-display.tsx` - Remove ItemTags import and component usage, remove tags property from BobbleheadForEdit interface and defaultValues

**Changes:**

- Remove ItemTags import statement
- Remove ItemTags component from JSX render tree
- Remove tags property from BobbleheadForEdit interface (edit form only)
- Remove tags from form defaultValues initialization

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] ItemTags component usage removed from both form displays
- [ ] Tags property removed from form type and default values
- [ ] Forms render without tag-related sections
- [ ] All validation commands pass

---

### Step 4: Remove Tag Display from Bobblehead Feature Card

**What**: Remove tags display section from the bobblehead quick info feature card.
**Why**: Public bobblehead view should not display tags section.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]/components/feature-card/feature-card-quick-info.tsx` - Remove tags display section and related derived variables

**Changes:**

- Remove tags-related derived boolean variables (_hasTags, _visibleTags, _remainingTagsCount, _hasMoreTags)
- Remove isValidHexColor helper function
- Remove Tags Section JSX block with Conditional wrapper
- Remove tags property access from bobblehead.tags

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Tags section removed from feature card quick info
- [ ] No references to bobblehead.tags in the component
- [ ] All validation commands pass

---

### Step 5: Remove Tag Filtering from Search Components

**What**: Remove tagIds from search filters and route type definitions.
**Why**: Search functionality should not include tag-based filtering.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/browse/search/components/search-filters.tsx` - Remove tagIds from props interface, useMemo dependency, handleClearFilters, and active filters display
- `src/app/(app)/browse/search/route-type.ts` - Remove tagIds from Route searchParams schema

**Changes:**

- Remove tagIds from SearchFiltersProps interface
- Remove tagIds from activeFilterCount calculation
- Remove tagIds from handleClearFilters callback
- Remove tagIds check from _hasActiveFilters derived variable
- Remove tagIds badge display from Active Filters Summary
- Remove tagIds from route searchParams schema

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] tagIds removed from search filter props and state
- [ ] Route type no longer includes tagIds parameter
- [ ] All validation commands pass

---

### Step 6: Delete Tags Server Actions

**What**: Delete the entire tags server actions file.
**Why**: All tag CRUD operations are no longer needed.
**Confidence**: High

**Files to Delete:**

- `src/lib/actions/tags/tags.actions.ts` - Complete file deletion

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Tags actions file deleted
- [ ] No imports referencing deleted actions
- [ ] All validation commands pass

---

### Step 7: Delete Tags Facade

**What**: Delete the tags facade and its types.
**Why**: Business logic orchestration for tags is no longer needed.
**Confidence**: High

**Files to Delete:**

- `src/lib/facades/tags/tags.facade.ts` - Complete file deletion

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Tags facade file deleted
- [ ] No imports referencing TagsFacade
- [ ] All validation commands pass

---

### Step 8: Delete Tags Query

**What**: Delete the tags query class and its types.
**Why**: Database query operations for tags are no longer needed.
**Confidence**: High

**Files to Delete:**

- `src/lib/queries/tags/tags-query.ts` - Complete file deletion

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Tags query file deleted
- [ ] No imports referencing TagsQuery or TagRecord
- [ ] All validation commands pass

---

### Step 9: Remove Tag References from BobbleheadsFacade

**What**: Remove TagsFacade import and all tag-related method calls from BobbleheadsFacade.
**Why**: Bobblehead operations should not reference tag functionality.
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Remove TagsFacade import and tag removal calls in deleteAsync, batchDeleteAsync, and any other methods

**Changes:**

- Remove import statement for TagsFacade
- Remove TagsFacade.removeAllFromBobblehead calls in deleteAsync method
- Remove TagsFacade.removeAllFromBobblehead calls in batchDeleteAsync method
- Remove any tag-related tracking warnings

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] No TagsFacade imports or references remain
- [ ] Delete operations work without tag cleanup
- [ ] All validation commands pass

---

### Step 10: Delete Tags Validation Schema

**What**: Delete the complete tags validation schema file.
**Why**: All tag-related Zod schemas and types are no longer needed.
**Confidence**: High

**Files to Delete:**

- `src/lib/validations/tags.validation.ts` - Complete file deletion

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Tags validation file deleted
- [ ] No imports referencing tag validation schemas or types
- [ ] All validation commands pass

---

### Step 11: Remove Tags from Bobblehead Validation Schemas

**What**: Remove tags property from bobblehead creation and update schemas.
**Why**: Bobblehead schemas should not include optional tags arrays.
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/bobbleheads.validation.ts` - Remove tags from createBobbleheadWithPhotosSchema, updateBobbleheadWithPhotosSchema, and remove bobbleheadTags-related exports

**Changes:**

- Remove tags property from createBobbleheadWithPhotosSchema.extend()
- Remove tags property from updateBobbleheadWithPhotosSchema.extend()
- Remove selectBobbleheadTagSchema export
- Remove insertBobbleheadTagSchema export
- Remove InsertBobbleheadTag type export
- Remove SelectBobbleheadTag type export
- Remove import for bobbleheadTags from schema

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Tags property removed from bobblehead schemas
- [ ] BobbleheadTag-related schemas and types removed
- [ ] All validation commands pass

---

### Step 12: Remove TagIds from Public Search Validation

**What**: Remove tagIds filtering from public search validation schemas.
**Why**: Search filters should not include tag-based filtering options.
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/public-search.validation.ts` - Remove tagIds from searchFiltersSchema

**Changes:**

- Remove tagIds property from searchFiltersSchema object
- Remove CONFIG.CONTENT.MAX_TAGS_PER_BOBBLEHEAD reference

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] tagIds removed from search filters schema
- [ ] Search validation passes without tag filtering
- [ ] All validation commands pass

---

### Step 13: Remove Tags from Database Relations Schema

**What**: Remove all tag-related relations from the Drizzle relations schema.
**Why**: Database relations must not reference removed tables.
**Confidence**: High

**Files to Modify:**

- `src/lib/db/schema/relations.schema.ts` - Remove tag imports, tag relations, and tag references in other relations

**Changes:**

- Remove import for tags from tags.schema
- Remove import for bobbleheadTags from bobbleheads.schema
- Remove bobbleheadTags and tags properties from bobbleheadsRelations
- Remove bobbleheadTagsRelations export entirely
- Remove tagsRelations export entirely
- Remove tags property from usersRelations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All tag-related relations removed
- [ ] No references to tags or bobbleheadTags in relations
- [ ] All validation commands pass

---

### Step 14: Remove bobbleheadTags Junction Table from Bobbleheads Schema

**What**: Remove the bobbleheadTags junction table and its reference to the tags table.
**Why**: Junction table is no longer needed after removing the tags feature.
**Confidence**: High

**Files to Modify:**

- `src/lib/db/schema/bobbleheads.schema.ts` - Remove bobbleheadTags table definition and tags import

**Changes:**

- Remove import for tags from tags.schema
- Remove entire bobbleheadTags pgTable definition

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] bobbleheadTags table removed from schema
- [ ] No foreign key references to tags table
- [ ] All validation commands pass

---

### Step 15: Delete Tags Schema File

**What**: Delete the complete tags schema file.
**Why**: The tags table is no longer needed in the database.
**Confidence**: High

**Files to Delete:**

- `src/lib/db/schema/tags.schema.ts` - Complete file deletion

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Tags schema file deleted
- [ ] No imports referencing tags schema
- [ ] All validation commands pass

---

### Step 16: Remove Tags Export from Schema Index

**What**: Remove the tags schema export from the schema barrel file.
**Why**: Barrel file must not export deleted schema.
**Confidence**: High

**Files to Modify:**

- `src/lib/db/schema/index.ts` - Remove tags.schema export

**Changes:**

- Remove the line exporting from tags.schema.ts

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Tags schema no longer exported
- [ ] Schema index compiles cleanly
- [ ] All validation commands pass

---

### Step 17: Clean Up Tag-Related Constants

**What**: Remove tag-related entries from all constants files.
**Why**: Constants should not reference removed feature.
**Confidence**: High

**Files to Modify:**

- `src/lib/constants/action-names.ts` - Remove TAGS section from ACTION_NAMES, remove bobblehead tag actions
- `src/lib/constants/operations.ts` - Remove TAGS section from OPERATIONS
- `src/lib/constants/error-messages.ts` - Remove TAG section from ERROR_MESSAGES
- `src/lib/constants/error-codes.ts` - Remove TAGS section from ERROR_CODES
- `src/lib/constants/schema-limits.ts` - Remove TAG section from SCHEMA_LIMITS
- `src/lib/constants/defaults.ts` - Remove TAG section from DEFAULTS
- `src/lib/constants/config.ts` - Remove MAX_CUSTOM_TAGS_PER_USER and MAX_TAGS_PER_BOBBLEHEAD from CONFIG.CONTENT, remove TAG_ADD and TAG_REMOVE from rate limiting
- `src/lib/constants/cache.ts` - Remove TAGS namespace, TAGS cache keys, and tag-related cache key builders
- `src/lib/constants/sentry.ts` - Remove TAG_DATA from SENTRY_CONTEXTS

**Changes:**

- Remove entire TAGS object from ACTION_NAMES
- Remove ADD_TAG and REMOVE_TAG from BOBBLEHEADS section in ACTION_NAMES
- Remove entire TAGS object from OPERATIONS
- Remove entire TAG object from ERROR_MESSAGES
- Remove entire TAGS object from ERROR_CODES
- Remove TAG object from SCHEMA_LIMITS
- Remove TAG object from DEFAULTS
- Remove MAX_CUSTOM_TAGS_PER_USER from CONFIG.CONTENT
- Remove MAX_TAGS_PER_BOBBLEHEAD from CONFIG.CONTENT
- Remove TAG_ADD and TAG_REMOVE from CONFIG.RATE_LIMITING.ACTION_SPECIFIC
- Remove TAGS from CACHE_CONFIG.NAMESPACES
- Remove BOBBLEHEAD_TAGS tag pattern from CACHE_CONFIG.TAGS
- Remove TAG tag pattern from CACHE_CONFIG.TAGS
- Remove TAGS cache keys section from CACHE_KEYS
- Remove TAG_DATA from SENTRY_CONTEXTS

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All tag-related constants removed
- [ ] No references to tag constants in codebase
- [ ] All validation commands pass

---

### Step 18: Remove Tag-Related Cache Revalidation

**What**: Remove the onTagChange method from CacheRevalidationService.
**Why**: Tag change cache invalidation is no longer needed.
**Confidence**: High

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Remove onTagChange method from bobbleheads section

**Changes:**

- Remove entire onTagChange method from static readonly bobbleheads object

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] onTagChange method removed from CacheRevalidationService
- [ ] No calls to onTagChange remain in codebase
- [ ] All validation commands pass

---

### Step 19: Generate Database Migration

**What**: Generate a Drizzle migration to drop the tags and bobblehead_tags tables.
**Why**: Database schema must be updated to remove the tables.
**Confidence**: High

**Commands to Run:**

```bash
npm run db:generate
```

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Migration file generated successfully
- [ ] Migration includes DROP TABLE for both tags and bobblehead_tags
- [ ] Migration file is properly formatted
- [ ] All validation commands pass

---

### Step 20: Update Test Files

**What**: Delete tag-specific test files and update tests that reference tags.
**Why**: Tests must reflect the removed functionality.
**Confidence**: Medium

**Files to Delete:**

- `tests/unit/lib/validations/tags.validation.test.ts` - Complete file deletion

**Files to Modify:**

- `tests/integration/actions/bobbleheads/bobbleheads.actions.test.ts` - Remove tag-related test cases and assertions
- `tests/integration/facades/bobbleheads-dashboard/bobbleheads-dashboard.facade.test.ts` - Remove tag-related test cases and assertions
- `tests/setup/test-db.ts` - Remove tags and bobbleheadTags table references from test setup

**Changes:**

- Delete tags validation test file
- Remove any test cases that test tag attachment/detachment
- Remove tag assertions from bobblehead creation/update tests
- Update test database setup to exclude tags tables

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**

- [ ] Tag validation tests deleted
- [ ] Integration tests updated and passing
- [ ] All validation commands pass
- [ ] Test suite runs without tag-related failures

---

### Step 21: Update Database Seed Script

**What**: Remove tag-related seeding from the database seed script.
**Why**: Seed script should not attempt to populate removed tables.
**Confidence**: Medium

**Files to Modify:**

- `src/lib/db/scripts/seed.ts` - Remove tag creation and bobblehead-tag association logic

**Changes:**

- Remove imports for tags table
- Remove tag seeding data arrays
- Remove tag insertion logic
- Remove bobblehead-tag association logic

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Seed script no longer references tags
- [ ] Seed script runs successfully
- [ ] All validation commands pass

---

### Step 22: Delete Obsolete Documentation

**What**: Remove tag-related implementation plan documentation.
**Why**: Documentation for removed features should be cleaned up.
**Confidence**: High

**Files to Delete:**

- `docs/2025_09_18/plans/tag-field-autocomplete-implementation-plan.md` - Obsolete documentation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Obsolete documentation deleted
- [ ] All validation commands pass

---

### Step 23: Run Database Migration

**What**: Execute the generated migration to drop tables from the database.
**Why**: Database must be synchronized with the updated schema.
**Confidence**: High

**Commands to Run:**

```bash
npm run db:migrate
```

**Success Criteria:**

- [ ] Migration executes without errors
- [ ] Tags and bobblehead_tags tables no longer exist in database
- [ ] Application starts without database errors

---

### Step 24: Final Verification

**What**: Comprehensive verification that all tag references are removed.
**Why**: Ensures complete removal with no orphaned code.
**Confidence**: High

**Commands to Run:**

```bash
npm run lint:fix && npm run typecheck && npm run build && npm run test
```

**Success Criteria:**

- [ ] Linting passes with no errors
- [ ] TypeScript compiles with no errors
- [ ] Production build succeeds
- [ ] All tests pass
- [ ] Application runs without runtime errors

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Production build succeeds with `npm run build`
- [ ] All tests pass with `npm run test`
- [ ] Database migration applies cleanly with `npm run db:migrate`
- [ ] Application starts and functions without tag-related errors

## Notes

- **Recommended Execution Order**: Follow the steps sequentially. Earlier steps prevent TypeScript/lint errors in later steps.
- **Rollback Strategy**: Since the application is not in production and no data migration is needed, rollback is simply reverting the git branch.
- **Type Safety**: The TypeScript compiler will catch most orphaned references after each deletion step. Running `npm run typecheck` after each step ensures immediate feedback.
- **Testing**: Run the test suite frequently, especially after Steps 20 and 24, to ensure no regressions.
- **Database Migration**: Step 19 generates the migration; Step 23 runs it. Keep these separate to allow review of the generated migration SQL before execution.
- **Forms Impact**: The add and edit bobblehead forms will no longer have a tags section. The form schema changes in Step 11 ensure form validation remains correct.
