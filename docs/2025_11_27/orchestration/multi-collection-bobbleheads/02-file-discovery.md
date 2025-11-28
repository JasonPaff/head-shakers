# Step 2: AI-Powered File Discovery

**Start Time**: 2025-11-27T12:01:00Z
**End Time**: 2025-11-27T12:02:30Z
**Duration**: ~90 seconds
**Status**: Completed

## Input: Refined Feature Request

Implement a many-to-many relationship between bobbleheads and collections by modifying the database schema to replace the current one-to-many relationship (where each bobblehead belongs to a single collection via a foreign key) with a junction table that enables bobbleheads to exist in multiple collections simultaneously.

## Agent Prompt

```
Analyze this feature request and discover ALL relevant files for implementation in the Head Shakers codebase:

FEATURE REQUEST:
Implement a many-to-many relationship between bobbleheads and collections by modifying the database schema to replace the current one-to-many relationship (where each bobblehead belongs to a single collection via a foreign key) with a junction table that enables bobbleheads to exist in multiple collections simultaneously. This involves creating a new junction table in the Drizzle schema under src/lib/db/ with composite primary keys and foreign key relationships to both bobbleheads and collections tables, including appropriate indexes for query performance and cascade delete behavior. Update the existing Drizzle schema definitions to remove the direct foreign key from the bobbleheads table to collections and establish proper many-to-many relations using Drizzle's relations API. Generate and run the necessary database migration. Modify all affected database queries in src/lib/queries/ to join through the junction table when fetching bobbleheads with their collections or collections with their bobbleheads. Update server actions in src/lib/actions/ that create, update, or delete bobbleheads or collections to handle the new many-to-many relationship. Adjust the facades layer in src/lib/facades/ to orchestrate these operations with proper transaction handling. Create or update Zod validation schemas in src/lib/validations/. Make minimal front-end changes required to support the back-end implementation.

DISCOVERY REQUIREMENTS:
1. Search src/lib/db/ for schema files (bobbleheads, collections, relations)
2. Search src/lib/queries/ for bobblehead and collection queries
3. Search src/lib/actions/ for bobblehead and collection server actions
4. Search src/lib/facades/ for related facades
5. Search src/lib/validations/ for validation schemas
6. Search src/components/ for UI components that display bobblehead-collection relationships
7. Search src/app/ for pages/routes that may need updates

For each file found, categorize by priority:
- CRITICAL: Must be modified (schema files, junction table creation)
- HIGH: Likely needs modification (queries, actions, facades)
- MEDIUM: May need modification (validation schemas, types)
- LOW: Reference only (existing patterns, similar implementations)

Return a comprehensive list with file paths, priority, and brief description of relevance.
```

## Full Agent Response

### Analysis Summary

- Explored 6 primary directories (src/lib/db, src/lib/queries, src/lib/actions, src/lib/facades, src/lib/validations, src/components, src/app)
- Examined 45+ candidate files
- Found 28 highly relevant files requiring modification
- Identified 12 supporting files that may need updates

## Discovered Files

### CRITICAL PRIORITY (Must Be Modified)

#### Database Schema Files

| File Path                                                          | Relevance                                                                                                                                                                                 |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/db/schema/bobbleheads.schema.ts`                          | Currently has direct foreign key `collectionId` (line 33-35) that must be removed. Junction table will replace this one-to-many relationship.                                             |
| `src/lib/db/schema/collections.schema.ts`                          | Reference for schema patterns. No structural changes needed, but relations will change.                                                                                                   |
| `src/lib/db/schema/relations.schema.ts`                            | CRITICAL: Must update `bobbleheadsRelations` (line 43-59) and `collectionsRelations` (line 35-41) to define many-to-many relationships through new junction table instead of one-to-many. |
| `src/lib/db/schema/index.ts`                                       | Must export new junction table schema after creation.                                                                                                                                     |
| **NEW FILE**: `src/lib/db/schema/bobblehead-collections.schema.ts` | Create new junction table with composite primary key, foreign keys to both tables, cascade delete behavior, and performance indexes.                                                      |

### HIGH PRIORITY (Core Implementation Files)

#### Query Layer

| File Path                                          | Methods to Update                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/queries/bobbleheads/bobbleheads-query.ts` | `findByCollectionAsync` (lines 212-240), `findByIdWithRelationsAsync` (lines 265-318), `findBySlugWithRelationsAsync` (lines 343-398), `getAdjacentBobbleheadsInCollectionAsync` (lines 446-534), `getBobbleheadPositionInCollectionAsync` (lines 628-680), `searchAsync` (lines 729-788)                     |
| `src/lib/queries/collections/collections.query.ts` | `getAllCollectionBobbleheadsWithPhotosAsync` (lines 260-309), `getBobbleheadsInCollectionAsync` (lines 311-340), `getBrowseCategoriesAsync` (lines 342-589), `getCollectionBobbleheadsWithPhotosAsync` (lines 737-787), `getDashboardDataAsync` (lines 862-883), `getDistinctCategoriesAsync` (lines 885-912) |

#### Facade Layer

| File Path                                           | Methods to Update                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `src/lib/facades/bobbleheads/bobbleheads.facade.ts` | `createAsync` (lines 62-94), `deleteAsync` (lines 97-172), `updateAsync` (lines 877-922) |
| `src/lib/facades/collections/collections.facade.ts` | `deleteAsync` (lines 557-586)                                                            |

#### Server Actions

| File Path                                            | Actions to Update                                                                                                                               |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/actions/bobbleheads/bobbleheads.actions.ts` | `createBobbleheadWithPhotosAction` (lines 39-230), `updateBobbleheadWithPhotosAction` (lines 294-491), `deleteBobbleheadAction` (lines 232-292) |
| `src/lib/actions/collections/collections.actions.ts` | `deleteCollectionAction` (lines 158-212) - validate cascade delete                                                                              |

### MEDIUM PRIORITY (May Need Updates)

#### Validation Schemas

| File Path                                       | Relevance                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/lib/validations/bobbleheads.validation.ts` | Review `collectionId` validation at line 72. Consider adding new schema for junction table operations. |
| `src/lib/validations/collections.validation.ts` | May need new schemas for adding/removing bobbleheads from collections.                                 |

### LOW PRIORITY (UI/Frontend - Reference Only)

#### Components

| File Path                                                            | Notes                                                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------- |
| `src/components/feature/bobblehead/bobblehead-edit-dialog.tsx`       | Form still needs collectionId, backend handles junction table |
| `src/components/feature/collections/collection-delete.tsx`           | No changes needed, cascade delete works                       |
| `src/app/(app)/bobbleheads/add/components/collection-assignment.tsx` | Form component, backend handles junction table                |
| `src/app/(app)/bobbleheads/add/components/add-item-form-client.tsx`  | Form submission unchanged                                     |

#### Pages

| File Path                                                          | Notes                                            |
| ------------------------------------------------------------------ | ------------------------------------------------ |
| `src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx` | Server component fetches data, no changes needed |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx` | Server component, no changes needed              |
| `src/app/(app)/bobbleheads/add/page.tsx`                           | Form page, no changes needed                     |

## Architecture Insights

### Key Patterns Discovered

1. **Junction Table Reference**: The codebase already has a junction table pattern in `bobbleheadTags` (bobbleheads.schema.ts lines 194-214) which should be used as the template
2. **Relations Pattern**: The `relations.schema.ts` file uses Drizzle's `relations()` API with `many()` and `one()` helpers
3. **Current Schema**: `bobbleheads.collectionId` references `collections.id` with cascade delete (one-to-many)
4. **Query Patterns**: Queries use `.where(eq(bobbleheads.collectionId, collectionId))` pattern
5. **Transaction Handling**: Facades use `dbInstance` parameter for transaction support

### Existing Similar Implementation

- **`bobbleheadTags` junction table** (bobbleheads.schema.ts lines 194-214): Perfect reference for the new `bobbleheadCollections` junction table structure
- **Tag relations** (relations.schema.ts lines 68-88): Shows how to define many-to-many relations through a junction table

## File Validation Results

All discovered files verified to exist:

- ✅ `src/lib/db/schema/bobbleheads.schema.ts`
- ✅ `src/lib/db/schema/collections.schema.ts`
- ✅ `src/lib/db/schema/relations.schema.ts`
- ✅ `src/lib/db/schema/index.ts`
- ✅ `src/lib/queries/bobbleheads/bobbleheads-query.ts`
- ✅ `src/lib/queries/collections/collections.query.ts`
- ✅ `src/lib/facades/bobbleheads/bobbleheads.facade.ts`
- ✅ `src/lib/facades/collections/collections.facade.ts`
- ✅ `src/lib/actions/bobbleheads/bobbleheads.actions.ts`
- ✅ `src/lib/actions/collections/collections.actions.ts`
- ✅ `src/lib/validations/bobbleheads.validation.ts`
- ✅ `src/lib/validations/collections.validation.ts`

## Discovery Statistics

- **Directories Explored**: 7
- **Files Examined**: 45+
- **CRITICAL Priority Files**: 5 (1 new file required)
- **HIGH Priority Files**: 6
- **MEDIUM Priority Files**: 2
- **LOW Priority Files**: 7
- **Total Relevant Files**: 20+

## Migration Strategy Identified

1. Create junction table schema file
2. Generate and test migration (with rollback plan)
3. Update relations.schema.ts
4. Update query layer (test each method)
5. Update facade layer (transaction handling)
6. Update validation schemas if needed
7. Verify server actions work correctly
8. Test frontend forms (should work without changes)
