# Implementation Plan: Many-to-Many Bobbleheads-Collections Relationship

**Generated**: 2025-11-27
**Original Request**: Allow bobbleheads to belong to multiple collections simultaneously. This plan will be for the back-end to support this with the minimal amount of front-end (UI) changes required to support the new back-end will be added in this feature request.

**Refined Request**: Implement a many-to-many relationship between bobbleheads and collections by modifying the database schema to replace the current one-to-many relationship (where each bobblehead belongs to a single collection via a foreign key) with a junction table that enables bobbleheads to exist in multiple collections simultaneously. This involves creating a new `bobblehead_collections` junction table in the Drizzle schema under `src/lib/db/` with composite primary keys and foreign key relationships to both `bobbleheads` and `collections` tables, including appropriate indexes for query performance and cascade delete behavior to maintain referential integrity when collections or bobbleheads are removed. Update the existing Drizzle schema definitions to remove the direct foreign key from the `bobbleheads` table to `collections` and establish proper many-to-many relations using Drizzle's relations API. Generate and run the necessary database migration using `npm run db:generate` and `npm run db:migrate` to alter the schema without data loss, ensuring existing bobblehead-collection associations are migrated to the junction table. Modify all affected database queries in `src/lib/queries/` to join through the junction table when fetching bobbleheads with their collections or collections with their bobbleheads, updating query return types and ensuring proper TypeScript typing throughout. Update server actions in `src/lib/actions/` that create, update, or delete bobbleheads or collections to handle the new many-to-many relationship, including actions for adding/removing bobbleheads to/from collections. Adjust the facades layer in `src/lib/facades/` to orchestrate these operations with proper transaction handling and error management. Create or update Zod validation schemas in `src/lib/validations/` using Drizzle-Zod patterns to validate the new relationship structure, including schemas for adding/removing bobbleheads from collections. Make minimal front-end changes required to support the back-end implementation: update TypeScript types used by components to reflect that bobbleheads can have multiple collections (array instead of single object), modify any UI components that display or manage bobblehead-collection relationships to handle the array structure, and ensure server action calls from client components pass the correct data structure for the new many-to-many operations, keeping UI changes strictly limited to what's necessary for the back-end to function correctly without redesigning the user interface or adding new features beyond the core multi-collection membership capability.

---

## Overview

**Estimated Duration**: 2-3 days
**Complexity**: High
**Risk Level**: High

## Quick Summary

Transform the bobbleheads-collections relationship from one-to-many (single collection per bobblehead) to many-to-many (bobblehead can exist in multiple collections) by creating a junction table, updating all database schemas, relations, queries, facades, actions, and validations to work with the new relationship structure.

## Prerequisites

- [ ] Database backup completed (production safety measure)
- [ ] All existing tests passing
- [ ] Understanding of current bobblehead-collection usage patterns
- [ ] Confirmation that existing data migration strategy is acceptable (decide whether to preserve current collectionId as first junction entry or start fresh)

## Implementation Steps

### Step 1: Create Junction Table Schema

**What**: Create a new junction table schema file for the many-to-many relationship between bobbleheads and collections
**Why**: This junction table replaces the direct foreign key relationship and allows bobbleheads to belong to multiple collections
**Confidence**: High

**Files to Create:**

- `src/lib/db/schema/bobblehead-collections.schema.ts` - Junction table with composite primary key, foreign keys, and indexes

**Changes:**

- Create `bobbleheadCollections` table with `bobbleheadId` and `collectionId` columns
- Add composite primary key on `(bobbleheadId, collectionId)`
- Add foreign key constraints with `onDelete: 'cascade'` to both parent tables
- Add indexes for query performance on both foreign key columns
- Add `createdAt` timestamp column for audit trail
- Follow the pattern from `bobbleheadTags` junction table (lines 194-214 in bobbleheads.schema.ts)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Junction table schema created with proper column types matching parent table primary keys
- [ ] Composite primary key defined on both foreign key columns
- [ ] Cascade delete behavior configured for both foreign keys
- [ ] Indexes created for query performance
- [ ] All validation commands pass

---

### Step 2: Update Schema Exports

**What**: Export the new junction table schema from the schema index file
**Why**: Makes the junction table available for imports throughout the application
**Confidence**: High

**Files to Modify:**

- `src/lib/db/schema/index.ts` - Add export for bobbleheadCollections table

**Changes:**

- Import `bobbleheadCollections` from `./bobblehead-collections.schema`
- Add to schema exports object
- Maintain alphabetical ordering of exports

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Junction table exported from schema index
- [ ] No circular dependency issues
- [ ] All validation commands pass

---

### Step 3: Update Relations Schema for Many-to-Many

**What**: Define many-to-many relations using Drizzle's relations API for the junction table
**Why**: Enables Drizzle to understand the relationship structure for query building and type inference
**Confidence**: High

**Files to Modify:**

- `src/lib/db/schema/relations.schema.ts` - Add junction table relations and update bobbleheads/collections relations

**Changes:**

- Create `bobbleheadCollectionsRelations` using `relations()` function
- Define relation from junction to bobbleheads table with `one()` reference
- Define relation from junction to collections table with `one()` reference
- Update `bobbleheadsRelations` to add `many()` relation to junction table
- Update `collectionsRelations` to add `many()` relation to junction table
- Follow the pattern from `bobbleheadTagsRelations` (lines 68-88 in relations.schema.ts)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Junction table relations defined correctly
- [ ] Bobbleheads relations include many-to-many through junction
- [ ] Collections relations include many-to-many through junction
- [ ] All validation commands pass

---

### Step 4: Remove Direct Foreign Key from Bobbleheads Schema

**What**: Remove the `collectionId` foreign key column from the bobbleheads table schema
**Why**: The direct foreign key is replaced by the junction table relationship
**Confidence**: High

**Files to Modify:**

- `src/lib/db/schema/bobbleheads.schema.ts` - Remove collectionId column and foreign key reference

**Changes:**

- Remove `collectionId` column definition from `bobbleheads` table
- Remove any foreign key constraints related to `collectionId`
- Keep all other columns intact
- Update any inline comments that reference the one-to-many relationship

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] collectionId column removed from bobbleheads table schema
- [ ] No foreign key references to collections remain in bobbleheads schema
- [ ] Schema still defines all other bobblehead columns correctly
- [ ] All validation commands pass

---

### Step 5: Generate and Review Database Migration

**What**: Generate Drizzle migration files for the schema changes
**Why**: Creates the SQL migration to apply schema changes to the database
**Confidence**: Medium

**Files to Create:**

- Auto-generated migration file in `src/lib/db/migrations/` directory

**Changes:**

- Run `npm run db:generate` to create migration files
- Review generated SQL for correctness including CREATE TABLE for junction, DROP COLUMN for collectionId, and proper indexes
- Verify CASCADE delete behavior is included
- Add data migration SQL if preserving existing collectionId relationships (INSERT INTO junction table from existing bobbleheads.collectionId values)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Migration files generated successfully
- [ ] SQL creates junction table with correct structure
- [ ] SQL removes collectionId column from bobbleheads table
- [ ] Data migration strategy included if needed
- [ ] Migration reviewed and appears safe

---

### Step 6: Run Database Migration

**What**: Execute the database migration to apply schema changes
**Why**: Updates the actual database structure to support many-to-many relationships
**Confidence**: Medium

**Files to Modify:**

- Database schema (via migration execution)

**Changes:**

- Run `npm run db:migrate` to execute migration
- Verify migration completes without errors
- Manually verify database structure matches expected schema
- Confirm junction table exists with proper constraints and indexes
- Confirm collectionId column removed from bobbleheads table

**Validation Commands:**

```bash
npm run typecheck
```

**Success Criteria:**

- [ ] Migration executes successfully without errors
- [ ] Junction table created in database
- [ ] collectionId column removed from bobbleheads table
- [ ] Foreign key constraints and indexes present
- [ ] Existing data preserved or migrated as planned

---

### Step 7: Update Bobbleheads Query Layer

**What**: Modify all bobblehead query functions to join through the junction table instead of using direct collectionId
**Why**: Queries must adapt to the new many-to-many relationship structure
**Confidence**: Medium

**Files to Modify:**

- `src/lib/queries/bobbleheads/bobbleheads-query.ts` - Update all 6 methods that filter or join on collectionId

**Changes:**

- Update query methods to join with `bobbleheadCollections` junction table when accessing collections
- Modify filtering logic that uses `collectionId` to filter through junction table
- Update `getBobbleheadsByCollectionId` to join through junction table
- Modify any queries that return collection data to use the junction table join
- Update return types to reflect that bobbleheads can have multiple collections (array instead of single object)
- Add aggregation queries if needed to count collections per bobblehead

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All query methods updated to use junction table joins
- [ ] No direct references to bobbleheads.collectionId remain
- [ ] Return types correctly reflect many-to-many relationship
- [ ] Query performance considerations addressed with proper joins
- [ ] All validation commands pass

---

### Step 8: Update Collections Query Layer

**What**: Modify all collection query functions to join through the junction table when accessing bobbleheads
**Why**: Collections queries must adapt to retrieve multiple bobbleheads through the junction table
**Confidence**: Medium

**Files to Modify:**

- `src/lib/queries/collections/collections.query.ts` - Update all 6 methods that join on collectionId

**Changes:**

- Update query methods to join with `bobbleheadCollections` junction table when accessing bobbleheads
- Modify `getCollectionWithBobbleheads` to join through junction table
- Update any aggregation queries (bobblehead counts) to count through junction table
- Ensure proper GROUP BY clauses when aggregating through junction
- Update return types if collections now return bobblehead arrays differently

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All query methods updated to use junction table joins
- [ ] Aggregation queries correctly count bobbleheads through junction
- [ ] Return types correctly reflect many-to-many relationship
- [ ] All validation commands pass

---

### Step 9: Update Bobbleheads Facade Layer

**What**: Modify bobblehead facade methods to handle junction table operations within transactions
**Why**: Creating, updating, and deleting bobbleheads now requires managing junction table entries
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Update createAsync, updateAsync, deleteAsync methods

**Changes:**

- Update `createAsync` to accept array of collectionIds and insert junction table entries in same transaction
- Update `updateAsync` to handle collection changes by deleting old junction entries and inserting new ones
- Update `deleteAsync` to rely on cascade delete for junction table cleanup (verify this works)
- Ensure all operations use the `dbInstance` parameter for transaction support
- Add error handling for junction table operations
- Update cache invalidation to handle collection-related cache tags

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Create operation inserts bobblehead and junction entries in single transaction
- [ ] Update operation properly manages junction table changes
- [ ] Delete operation cleans up junction entries (via cascade or explicit delete)
- [ ] Transaction rollback works correctly on errors
- [ ] All validation commands pass

---

### Step 10: Update Collections Facade Layer

**What**: Modify collection facade methods to handle junction table cleanup
**Why**: Deleting collections now requires managing junction table entries
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/collections/collections.facade.ts` - Update deleteAsync method

**Changes:**

- Update `deleteAsync` to rely on cascade delete for junction table cleanup
- Verify that deleting a collection properly removes all junction table entries
- Ensure transaction handling is correct
- Update cache invalidation to handle bobblehead-related cache tags

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Delete operation cleans up junction entries (via cascade or explicit delete)
- [ ] Transaction handling works correctly
- [ ] Cache invalidation updated appropriately
- [ ] All validation commands pass

---

### Step 11: Update Bobbleheads Validation Schemas

**What**: Modify Zod validation schemas to handle collection assignments as arrays
**Why**: Validation must accept multiple collectionIds instead of single collectionId
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/bobbleheads.validation.ts` - Update schemas to use collectionIds array

**Changes:**

- Replace `collectionId` field with `collectionIds` array field in create/update schemas
- Add array validation (ensure non-empty if required, validate each UUID)
- Update schema types exported for TypeScript inference
- Maintain compatibility with drizzle-zod generated schemas where needed
- Update any schema documentation or comments

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Validation schemas accept collectionIds as array
- [ ] Array validation includes proper UUID validation for each item
- [ ] Schema types correctly exported
- [ ] All validation commands pass

---

### Step 12: Update Collections Validation Schemas

**What**: Review and update collection validation schemas if needed
**Why**: Ensure validation schemas align with new relationship structure
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/collections.validation.ts` - Review and update if needed

**Changes:**

- Review schemas for any references to direct bobblehead relationships
- Add new schemas if needed for operations that assign bobbleheads to collections
- Ensure consistency with bobblehead validation schema changes

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Validation schemas reviewed and updated as needed
- [ ] No conflicts with bobblehead validation changes
- [ ] All validation commands pass

---

### Step 13: Update Bobbleheads Server Actions

**What**: Modify bobblehead server actions to handle collection arrays in input/output
**Why**: Actions are the API layer and must accept the new data structure
**Confidence**: High

**Files to Modify:**

- `src/lib/actions/bobbleheads/bobbleheads.actions.ts` - Update create, update, delete actions

**Changes:**

- Update `createBobblehead` action to accept `collectionIds` array and pass to facade
- Update `updateBobblehead` action to accept `collectionIds` array and handle changes
- Update `deleteBobblehead` action if needed for junction table cleanup
- Update action input validation to use new schemas
- Update action return types to reflect many-to-many relationships
- Update error handling for junction table operations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Actions accept collectionIds arrays in input
- [ ] Actions properly call facade methods with new parameters
- [ ] Error handling covers junction table operations
- [ ] Return types correctly typed
- [ ] All validation commands pass

---

### Step 14: Update Collections Server Actions

**What**: Modify collection server actions to handle many-to-many relationship
**Why**: Ensure collection actions work correctly with new relationship structure
**Confidence**: High

**Files to Modify:**

- `src/lib/actions/collections/collections.actions.ts` - Update delete action and any actions that assign bobbleheads

**Changes:**

- Update `deleteCollection` action to ensure junction table cleanup works
- Update any actions that assign bobbleheads to collections to handle junction table
- Update action return types if collections now include bobblehead arrays
- Update error handling for junction table operations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Delete action properly handles junction table cleanup
- [ ] Actions work correctly with many-to-many structure
- [ ] Error handling comprehensive
- [ ] All validation commands pass

---

### Step 15: Update Frontend Components for Collection Selection

**What**: Modify frontend components that handle collection assignment to support multiple selection
**Why**: UI must allow users to assign bobbleheads to multiple collections
**Confidence**: Medium

**Files to Modify:**

- Components that render collection selection (likely in `src/components/feature/bobbleheads/` or forms)
- Components that display bobblehead-collection relationships

**Changes:**

- Update collection selection UI from single select to multi-select component
- Update form fields to handle `collectionIds` array instead of single `collectionId`
- Update display components to show multiple collections per bobblehead
- Update any filtering or search components that use collection relationships
- Ensure proper error handling for UI validation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Collection selection supports multiple selections
- [ ] Form submission sends collectionIds array
- [ ] Display components show all collections for a bobblehead
- [ ] UI handles empty collections array gracefully
- [ ] All validation commands pass

---

### Step 16: Update Type Definitions and Exports

**What**: Review and update any shared type definitions that reference the relationship
**Why**: Ensure type consistency across the application
**Confidence**: High

**Files to Modify:**

- Any files in `src/lib/types/` that define bobblehead or collection types
- Type exports from query and facade files

**Changes:**

- Update type definitions to reflect many-to-many relationship
- Change `collectionId` to `collectionIds` in type definitions
- Update return types for queries to include collection arrays
- Ensure drizzle-zod generated types are properly imported

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All type definitions updated consistently
- [ ] No type conflicts across the application
- [ ] Drizzle-zod types properly integrated
- [ ] All validation commands pass

---

### Step 17: Run Full Test Suite and Fix Failing Tests

**What**: Execute complete test suite and update tests to work with new relationship structure
**Why**: Tests validate that the implementation works correctly and catches regressions
**Confidence**: Medium

**Files to Modify:**

- Test files in `tests/` directory that test bobblehead or collection functionality
- Mock data and fixtures that include bobblehead-collection relationships

**Changes:**

- Run `npm run test` to identify failing tests
- Update test fixtures to use junction table structure
- Update test assertions to expect collection arrays instead of single collection
- Update mocked data to include proper many-to-many relationships
- Add new tests for junction table operations
- Test edge cases (bobblehead with no collections, bobblehead in many collections, collection with no bobbleheads)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**

- [ ] All existing tests updated and passing
- [ ] New tests added for many-to-many scenarios
- [ ] Edge cases tested
- [ ] Test coverage maintained or improved
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] All tests pass `npm run test`
- [ ] Database migration successfully applied
- [ ] No references to `bobbleheads.collectionId` remain in codebase
- [ ] Junction table properly indexed and constrained
- [ ] Manual testing confirms bobbleheads can be assigned to multiple collections
- [ ] Manual testing confirms deleting collections or bobbleheads cleans up junction entries

## Notes

**Critical Assumptions:**

- Assuming cascade delete is acceptable for junction table entries when parent entities are deleted
- Assuming existing collectionId data should be migrated into junction table (alternative: start fresh with no collection assignments)
- Assuming UI changes are minimal and collection selection already uses reusable components

**High-Risk Areas:**

- Database migration with existing data requires careful testing and possible rollback plan
- Query performance may change with junction table joins - monitor and optimize indexes if needed
- Transaction handling in facades must be thoroughly tested to prevent partial updates
- Cache invalidation logic must be comprehensive to avoid stale data

**Data Migration Strategy:**

- Before Step 6, decide whether to preserve existing `bobbleheads.collectionId` relationships by inserting them into the junction table during migration
- SQL would be: `INSERT INTO bobblehead_collections (bobblehead_id, collection_id, created_at) SELECT id, collection_id, NOW() FROM bobbleheads WHERE collection_id IS NOT NULL;`
- This should be added to the generated migration file before running `db:migrate`

**Performance Considerations:**

- Junction table indexes on both foreign keys are critical for query performance
- Consider composite index on `(collectionId, bobbleheadId)` for reverse lookups
- Monitor query performance after deployment and add additional indexes if needed

**Rollback Plan:**

- Keep migration reversible by saving original collectionId data temporarily
- Test migration on staging environment before production
- Have database backup ready before migration execution

---

## File Discovery Results

### CRITICAL PRIORITY (Must Be Modified)

| File Path                                                     | Relevance                              |
| ------------------------------------------------------------- | -------------------------------------- |
| `src/lib/db/schema/bobbleheads.schema.ts`                     | Has collectionId foreign key to remove |
| `src/lib/db/schema/collections.schema.ts`                     | Reference for schema patterns          |
| `src/lib/db/schema/relations.schema.ts`                       | Must update relations for many-to-many |
| `src/lib/db/schema/index.ts`                                  | Must export new junction table         |
| **NEW**: `src/lib/db/schema/bobblehead-collections.schema.ts` | Create junction table                  |

### HIGH PRIORITY (Core Implementation)

| File Path                                            | Relevance                             |
| ---------------------------------------------------- | ------------------------------------- |
| `src/lib/queries/bobbleheads/bobbleheads-query.ts`   | 6 methods use collectionId filter     |
| `src/lib/queries/collections/collections.query.ts`   | 6 methods join on collectionId        |
| `src/lib/facades/bobbleheads/bobbleheads.facade.ts`  | createAsync, deleteAsync, updateAsync |
| `src/lib/facades/collections/collections.facade.ts`  | deleteAsync                           |
| `src/lib/actions/bobbleheads/bobbleheads.actions.ts` | create, update, delete actions        |
| `src/lib/actions/collections/collections.actions.ts` | delete action                         |

### MEDIUM PRIORITY (May Need Updates)

| File Path                                       | Relevance                      |
| ----------------------------------------------- | ------------------------------ |
| `src/lib/validations/bobbleheads.validation.ts` | Review collectionId validation |
| `src/lib/validations/collections.validation.ts` | May need new schemas           |

### Reference Patterns

- **Existing Junction Table**: `bobbleheadTags` in `bobbleheads.schema.ts` (lines 194-214)
- **Existing Many-to-Many Relations**: `bobbleheadTagsRelations` in `relations.schema.ts` (lines 68-88)
