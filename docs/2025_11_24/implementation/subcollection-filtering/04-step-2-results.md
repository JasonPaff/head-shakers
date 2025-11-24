# Step 2: Update Query Layer for Subcollection Filtering

**Step**: 2/10
**Specialist**: database-specialist
**Status**: ✓ Success
**Duration**: ~2 minutes

## Objective

Modify database queries to filter bobbleheads by specific subcollection ID

## Skills Loaded

- **database-schema**: Database-Schema-Conventions.md
- **drizzle-orm**: Drizzle-ORM-Conventions.md
- **validation-schemas**: Validation-Schemas-Conventions.md

## Changes Made

### Files Modified

**src/lib/queries/collections/collections.query.ts**
- Added optional `subcollectionId` parameter to `getAllCollectionBobbleheadsWithPhotosAsync`
- Added optional `subcollectionId` parameter to `getCollectionBobbleheadsWithPhotosAsync`
- Implemented conditional WHERE clause logic for three-state filtering:
  - `undefined`: No subcollection filter (returns all)
  - `null`: Main collection only filter (subcollectionId IS NULL)
  - `string`: Specific subcollection filter (subcollectionId = value)

### Implementation Details

```typescript
// Three-state filtering logic
const subcollectionFilter =
  subcollectionId === undefined
    ? undefined // No filter - include all
    : subcollectionId === null
      ? isNull(bobbleheadsTable.subcollectionId) // Main collection only
      : eq(bobbleheadsTable.subcollectionId, subcollectionId); // Specific subcollection
```

## Conventions Applied

- ✓ Used BaseQuery pattern with `this.getDbInstance(context)`
- ✓ Applied permission filtering with `this.buildBaseFilters()`
- ✓ Used `this.combineFilters()` to safely combine filter conditions
- ✓ Maintained existing pagination and sorting logic
- ✓ Used Drizzle ORM operators (`eq`, `isNull`) for type-safe SQL
- ✓ Followed optional parameter pattern with proper TypeScript typing
- ✓ Added clear inline comments for maintainability
- ✓ Preserved soft delete filtering and permission checks

## Validation Results

### ESLint
✓ Passed with 3 pre-existing warnings (unrelated to this change)

### TypeScript
✓ Passed - No compilation errors

## Success Criteria

- [✓] Query functions accept optional subcollectionId parameter
- [✓] WHERE clause correctly filters by subcollectionId when provided
- [✓] Permission filtering remains intact
- [✓] All validation commands pass

## Notes for Next Steps

The query layer now supports three distinct filtering modes ready for the facade layer:
1. **All bobbleheads**: Pass `subcollectionId: undefined`
2. **Main collection only**: Pass `subcollectionId: null`
3. **Specific subcollection**: Pass `subcollectionId: "uuid-string"`

The facade layer (Step 3) should map view states to these parameters:
- `view: 'all'` → `subcollectionId: undefined`
- `view: 'collection'` → `subcollectionId: null`
- `view: 'subcollection'` → `subcollectionId: <actual-id-from-url>`
