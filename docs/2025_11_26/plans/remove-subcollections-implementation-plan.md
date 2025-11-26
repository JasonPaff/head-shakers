# Implementation Plan: Remove Subcollections Feature

**Generated**: 2025-11-26
**Original Request**: Remove subcollections completely from the app, no backwards compatibility, the concept of a subcollection inside a collection should no longer exist in the app and all references to it should be removed.

## Overview

**Estimated Duration**: 2-3 days
**Complexity**: High
**Risk Level**: High

## Quick Summary

Complete removal of the subcollection entity from the Head Shakers bobblehead collection platform. This involves removing database tables, schema definitions, constants, queries, facades, server actions, UI components, routes, and all references to subcollections across the entire application. No backwards compatibility or migration path is provided - this is a complete feature removal.

## Prerequisites

- [ ] Ensure all work is committed to version control before starting
- [ ] Create a database backup (if needed for rollback)
- [ ] Verify no production data depends on subcollections
- [ ] Ensure development environment is running correctly

## Implementation Steps

### Step 1: Remove Database Schema Definitions

**What**: Remove subcollection table definition and all subcollection-related database schema elements
**Why**: Database schema is the foundation - removing it first ensures dependent code will fail compilation, making it easier to identify what needs updating
**Confidence**: High

**Files to Modify:**

- `src/lib/db/schema/collections.schema.ts` - Remove entire subCollections table definition (lines 76-123)
- `src/lib/db/schema/bobbleheads.schema.ts` - Remove subcollectionId column and its import, index
- `src/lib/db/schema/relations.schema.ts` - Remove subCollectionsRelations export and all subcollection relation references
- `src/lib/db/schema/social.schema.ts` - Remove subcollection partial index from comments table

**Changes:**

- Remove subCollections table definition from collections.schema.ts
- Remove subCollections import from bobbleheads.schema.ts
- Remove subcollectionId column from bobbleheads table definition
- Remove bobbleheads_sub_collection_id_idx index
- Remove subCollectionsRelations export from relations.schema.ts
- Remove subCollections relation from collectionsRelations
- Remove subCollection relation from bobbleheadsRelations
- Remove comments_subcollection_target_idx partial index from social.schema.ts

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] subCollections table definition completely removed
- [ ] subcollectionId column removed from bobbleheads table
- [ ] All subcollection relations removed from relations.schema.ts
- [ ] Subcollection indexes removed from social.schema.ts
- [ ] TypeScript compilation shows errors for missing subcollection references (expected)

---

### Step 2: Generate and Review Database Migration

**What**: Generate Drizzle migration to remove subcollections table and subcollectionId column
**Why**: Drizzle will auto-generate the SQL migration based on schema changes, which we need to review before applying
**Confidence**: High

**Files to Create:**

- Migration file in `src/lib/db/migrations/` (auto-generated)

**Changes:**

- Run drizzle-kit generate to create migration
- Review generated SQL to ensure it drops sub_collections table and removes subcollectionId column from bobbleheads table
- Verify migration includes proper DROP statements

**Validation Commands:**

```bash
npm run db:generate
```

**Success Criteria:**

- [ ] Migration file generated successfully
- [ ] Migration includes DROP TABLE sub_collections statement
- [ ] Migration includes ALTER TABLE bobbleheads DROP COLUMN sub_collection_id statement
- [ ] Migration drops bobbleheads_sub_collection_id_idx index
- [ ] No unexpected schema changes in migration

---

### Step 3: Remove Subcollection Constants

**What**: Remove all subcollection-related constants from the constants directory
**Why**: Constants are referenced throughout the application - removing them early helps identify all dependent code
**Confidence**: High

**Files to Modify:**

- `src/lib/constants/defaults.ts` - Remove SUB_COLLECTION object
- `src/lib/constants/schema-limits.ts` - Remove SUB_COLLECTION limits
- `src/lib/constants/error-codes.ts` - Remove SUBCOLLECTIONS error codes
- `src/lib/constants/error-messages.ts` - Remove subcollection error messages
- `src/lib/constants/enums.ts` - Remove 'subcollection' from all enum arrays
- `src/lib/constants/action-names.ts` - Remove subcollection action names
- `src/lib/constants/operations.ts` - Remove SUBCOLLECTIONS operations
- `src/lib/constants/sentry.ts` - Remove SUBCOLLECTION_DATA context
- `src/lib/constants/cloudinary-paths.ts` - Remove subcollection image paths

**Changes:**

- Remove SUB_COLLECTION object from DEFAULTS constant
- Remove SUB_COLLECTION object from SCHEMA_LIMITS constant
- Remove SUBCOLLECTIONS error code section from ERROR_CODES constant
- Remove SUB_COLLECTION_CREATE_FAILED, SUB_COLLECTION_DELETE_FAILED, SUB_COLLECTION_UPDATE_FAILED from ERROR_MESSAGES.COLLECTION
- Remove 'subcollection' from ENUMS.COMMENT.TARGET_TYPE array
- Remove 'subcollection' from ENUMS.CONTENT_REPORT.TARGET_TYPE array
- Remove 'subcollection' from ENUMS.CONTENT_VIEWS.TARGET_TYPE array
- Remove 'subcollection' from ENUMS.LIKE.TARGET_TYPE array
- Remove 'subcollection' from ENUMS.NOTIFICATION.RELATED_TYPE array
- Remove 'subcollection' from ENUMS.SEARCH.RESULT_TYPE array
- Remove subcollection action names from action-names.ts
- Remove SUBCOLLECTIONS operations from operations.ts
- Remove SUBCOLLECTION_DATA from sentry.ts context definitions
- Remove subcollection path generation from cloudinary-paths.ts

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All SUB_COLLECTION references removed from constants
- [ ] All 'subcollection' string literals removed from enums
- [ ] Subcollection error codes and messages removed

---

### Step 4: Delete Subcollection Core Logic Files

**What**: Delete validation schemas, server actions, queries, and facades for subcollections
**Why**: These files contain the business logic and are no longer needed after schema removal
**Confidence**: High

**Files to DELETE:**

- `src/lib/validations/subcollections.validation.ts`
- `src/lib/actions/collections/subcollections.actions.ts`
- `src/lib/queries/collections/subcollections.query.ts`
- `src/lib/facades/collections/subcollections.facade.ts`

**Changes:**

- Delete subcollections.validation.ts entirely
- Delete subcollections.actions.ts entirely
- Delete subcollections.query.ts entirely
- Delete subcollections.facade.ts entirely

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All four files successfully deleted
- [ ] No remaining imports of these files in the codebase

---

### Step 5: Remove Subcollection References from Collections Query/Facade

**What**: Remove subcollection-related logic from collections queries and facades
**Why**: Collections module has relationships with subcollections that need to be cleaned up
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/collections/collections.query.ts`
- `src/lib/facades/collections/collections.facade.ts`

**Changes:**

- Remove any subcollection joins, filters, or selections from query methods
- Remove subcollection count calculations
- Remove subcollection-related return type properties
- Remove subcollection cascade delete logic from collection deletion
- Remove any subcollection imports

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] No subcollection references in collections.query.ts
- [ ] No subcollection references in collections.facade.ts
- [ ] Collection types no longer include subcollection properties

---

### Step 6: Remove Subcollection References from Bobbleheads Query/Facade

**What**: Remove subcollectionId references from bobblehead queries and facades
**Why**: Bobbleheads have a foreign key relationship to subcollections that needs removal
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/bobbleheads/bobbleheads-query.ts`
- `src/lib/facades/bobbleheads/bobbleheads.facade.ts`

**Changes:**

- Remove subcollectionId from bobblehead creation input schemas
- Remove subcollectionId from bobblehead update input schemas
- Remove subcollectionId from bobblehead selection/projection
- Remove subcollectionId filtering logic
- Remove any subcollection joins in bobblehead queries
- Remove subcollection validation logic

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] subcollectionId removed from all bobblehead query methods
- [ ] subcollectionId removed from all bobblehead facade methods
- [ ] No subcollection joins in bobblehead queries

---

### Step 7: Remove Subcollection References from Social Query/Facade

**What**: Remove subcollection target type from social features (likes, comments)
**Why**: Social features support polymorphic relationships including subcollections
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/social/social.query.ts`
- `src/lib/facades/social/social.facade.ts`

**Changes:**

- Remove 'subcollection' case from like target type handling
- Remove 'subcollection' case from comment target type handling
- Remove subcollection target validation
- Remove subcollection content lookup logic
- Update type unions to exclude subcollection

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] 'subcollection' removed from like target type logic
- [ ] 'subcollection' removed from comment target type logic
- [ ] No subcollection validation in social.query.ts or social.facade.ts

---

### Step 8: Remove Subcollection References from Search Query/Facade

**What**: Remove subcollection from content search functionality
**Why**: Search includes subcollections as searchable content type
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/content-search/content-search.query.ts`
- `src/lib/facades/content-search/content-search.facade.ts`

**Changes:**

- Remove subcollection search logic
- Remove subcollection result type handling
- Remove subcollection from search aggregation
- Remove subcollection filters

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Subcollection search removed from content-search.query.ts
- [ ] Subcollection result type removed from search results

---

### Step 9: Remove Subcollection References from Content Reports Query/Facade

**What**: Remove subcollection from content reporting functionality
**Why**: Content reports support reporting subcollections as targets
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/content-reports/content-reports.query.ts`
- `src/lib/facades/content-reports/content-reports.facade.ts`

**Changes:**

- Remove 'subcollection' case from report target type handling
- Remove subcollection target validation
- Remove subcollection content lookup for reports

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] 'subcollection' removed from report target type logic
- [ ] No subcollection validation in content-reports files

---

### Step 10: Remove Subcollection References from Utilities

**What**: Remove subcollection references from utility functions
**Why**: Utilities may have cache keys, type definitions, or helper functions for subcollections
**Confidence**: Medium

**Files to Modify:**

- `src/lib/utils/cache-tags.utils.ts`
- `src/lib/types/bobblehead-navigation.types.ts`
- Any other utility files that reference subcollections

**Changes:**

- Remove subcollection cache tag generation
- Remove subcollection from navigation type definitions
- Remove any subcollection-related type utilities

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Subcollection cache tags removed
- [ ] Subcollection types removed from navigation

---

### Step 11: Delete Subcollection Route Directory

**What**: Delete the entire subcollection route directory and all its contents
**Why**: These routes provide the UI for managing subcollections and are no longer needed
**Confidence**: High

**Files to DELETE:**

- Entire directory: `src/app/(app)/collections/[collectionSlug]/subcollection/` (19 files)

**Changes:**

- Delete the subcollection directory and all nested files/folders

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Subcollection route directory completely removed
- [ ] No broken route references in navigation

---

### Step 12: Delete Subcollection Feature Components

**What**: Delete the feature components directory for subcollections
**Why**: These React components render subcollection UI and are no longer needed
**Confidence**: High

**Files to DELETE:**

- Entire directory: `src/components/feature/subcollections/` (8 files)

**Changes:**

- Delete the subcollections feature components directory and all files

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Subcollections feature components directory removed
- [ ] No imports of these components remain

---

### Step 13: Remove Subcollection Components from Dashboard

**What**: Delete subcollection-related dashboard components
**Why**: Dashboard has dedicated components for displaying subcollections lists
**Confidence**: High

**Files to DELETE:**

- `src/app/(app)/dashboard/collection/(collection)/components/subcollections-list.tsx`
- `src/app/(app)/dashboard/collection/(collection)/components/subcollections-list-item.tsx`
- `src/app/(app)/dashboard/collection/(collection)/components/subcollections-empty-state.tsx`
- `src/app/(app)/dashboard/collection/(collection)/components/subcollections-tab-content.tsx`
- `src/app/(app)/dashboard/collection/(collection)/components/skeletons/subcollections-tab-skeleton.tsx`

**Changes:**

- Delete all five subcollection dashboard component files

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All subcollection dashboard components deleted
- [ ] No imports of these components in dashboard pages

---

### Step 14: Update Collection Delete Component

**What**: Remove subcollection deletion confirmation logic from collection delete component
**Why**: Collection deletion currently checks for subcollections and requires name confirmation
**Confidence**: High

**Files to Modify:**

- `src/components/feature/collections/collection-delete.tsx`

**Changes:**

- Remove subcollection count display
- Remove subcollection deletion warning messages
- Simplify deletion confirmation (may still require name confirmation for collections with bobbleheads)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Subcollection references removed from collection-delete.tsx
- [ ] Component still properly handles collection deletion

---

### Step 15: Update Dashboard Collection Actions

**What**: Remove subcollection-related actions from dashboard collection actions component
**Why**: Dashboard collection actions may include create/manage subcollection buttons
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/dashboard/collection/(collection)/components/collection-actions.tsx`

**Changes:**

- Remove create subcollection button/action
- Remove manage subcollections button/action
- Remove subcollection-related imports

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Subcollection actions removed from collection-actions.tsx
- [ ] Component renders properly without subcollection actions

---

### Step 16: Update Bobblehead Navigation Component

**What**: Remove subcollection navigation from bobblehead detail pages
**Why**: Bobblehead pages show breadcrumb navigation including subcollection if present
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx`

**Changes:**

- Remove subcollection breadcrumb segment
- Update navigation to show only collection
- Remove subcollection-related props and types

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Subcollection navigation removed from bobblehead-navigation.tsx
- [ ] Navigation shows collection without subcollection

---

### Step 17: Update Dashboard Collection Page

**What**: Remove subcollections tab from dashboard collection page
**Why**: Dashboard collection page has tabs for bobbleheads and subcollections
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/dashboard/collection/(collection)/page.tsx`

**Changes:**

- Remove subcollections tab from tab list
- Remove subcollections tab panel
- Remove subcollection component imports
- Update tab state management if needed

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Subcollections tab removed from collection page
- [ ] Only bobbleheads tab remains
- [ ] Page renders correctly without subcollections

---

### Step 18: Update Middleware

**What**: Remove subcollection route protection from middleware
**Why**: Middleware may have specific route handling for subcollection pages
**Confidence**: Medium

**Files to Modify:**

- `src/middleware.ts`

**Changes:**

- Remove subcollection route patterns from middleware
- Remove subcollection-specific authentication/authorization checks

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Subcollection routes removed from middleware
- [ ] Middleware still properly handles collection routes

---

### Step 19: Search and Remove Remaining Subcollection References

**What**: Search entire codebase for any remaining subcollection references and remove them
**Why**: Ensure complete removal of all subcollection-related code
**Confidence**: Medium

**Files to Modify:**

- Any files found containing subcollection references

**Changes:**

- Search for 'subcollection', 'subCollection', 'sub_collection', 'sub-collection' across entire codebase
- Remove any remaining references found in components, pages, utilities, types, etc.
- Update any interfaces or types that reference subcollections

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] No 'subcollection' string found in source files (case-insensitive)
- [ ] No 'subCollection' string found in source files
- [ ] No 'sub_collection' string found in source files
- [ ] No 'sub-collection' string found in source files

---

### Step 20: Regenerate Type-Safe Routes

**What**: Regenerate next-typesafe-url routes after removing subcollection routes
**Why**: Type-safe routing depends on the actual route structure
**Confidence**: High

**Files to Modify:**

- Auto-generated route types (will be regenerated)

**Changes:**

- Run next-typesafe-url generator
- Verify subcollection routes are removed from generated types

**Validation Commands:**

```bash
npm run next-typesafe-url && npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Type-safe routes regenerated successfully
- [ ] No subcollection routes in generated types

---

### Step 21: Apply Database Migration

**What**: Apply the database migration to remove subcollections table
**Why**: Sync database structure with code changes
**Confidence**: High

**Files to Modify:**

- Database schema (via migration)

**Changes:**

- Run database migration to drop sub_collections table and subcollectionId column
- Verify migration completes successfully

**Validation Commands:**

```bash
npm run db:migrate && npm run typecheck
```

**Success Criteria:**

- [ ] Migration applied successfully
- [ ] sub_collections table dropped from database
- [ ] subcollectionId column removed from bobbleheads table
- [ ] No migration errors

---

### Step 22: Final Comprehensive Testing

**What**: Run full test suite and build verification
**Why**: Ensure no broken functionality after subcollection removal
**Confidence**: High

**Files to Modify:**

- None (testing only)

**Changes:**

- Run full linting
- Run type checking
- Run test suite
- Run production build

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test:run && npm run build
```

**Success Criteria:**

- [ ] All linting passes with no errors
- [ ] All type checking passes with no errors
- [ ] All tests pass
- [ ] Production build completes successfully
- [ ] No subcollection references in build output

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck` with zero errors
- [ ] All files pass `npm run lint:fix` with zero errors
- [ ] All tests pass with `npm run test:run`
- [ ] Production build succeeds with `npm run build`
- [ ] Database migration applied successfully
- [ ] No 'subcollection' references found in codebase (case-insensitive search)
- [ ] Manual verification: collection pages render correctly
- [ ] Manual verification: bobblehead pages render correctly
- [ ] Manual verification: dashboard collection view works without subcollections tab

## Notes

### High-Risk Areas

1. **Database Migration**: This is irreversible without a backup. Ensure database backup exists before applying migration.

2. **Type Errors During Implementation**: TypeScript errors are EXPECTED during steps 1-19 as we systematically remove subcollection code. This is intentional - the errors help identify all areas that need updates. Errors should be fully resolved by step 19.

3. **Polymorphic Relationships**: Social features (likes, comments), content reports, and analytics use polymorphic relationships that include subcollections. Removing subcollection from enum arrays will affect validation logic.

4. **Cache Invalidation**: After deployment, existing cached data may reference subcollections. Consider cache clearing if using persistent caching.

### Critical Assumptions

- **Assumption**: No production data contains subcollections that need preservation
- **Assumption**: No external integrations depend on subcollection API endpoints
- **Assumption**: Test data can be regenerated after migration

### Confidence Levels Explained

- **High Confidence**: Clear, well-defined changes with minimal risk
- **Medium Confidence**: Changes requiring careful review of surrounding code
- **Low Confidence**: Would appear if there were uncertain dependencies (none in this plan)

### Post-Implementation Verification

After completing all steps, manually verify:

1. Collection creation and management still works
2. Bobblehead creation and assignment to collections works
3. Dashboard collection view displays correctly
4. Collection deletion works properly
5. Search functionality excludes subcollections
6. Social features (likes, comments) work on collections and bobbleheads
