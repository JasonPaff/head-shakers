# Step 1: Extend Route Types and Search Parameters

**Step**: 1/10
**Specialist**: general-purpose
**Status**: ✓ Success
**Duration**: ~1 minute

## Objective

Update type definitions to support subcollection filtering in URL state

## Changes Made

### Files Modified

**src/app/(app)/collections/[collectionSlug]/(collection)/route-type.ts**

- Extended `searchParamsSchema` view enum to include 'subcollection' option
- Added `subcollectionId` parameter with nullable string type
- Updated from binary toggle ('all' | 'collection') to three-state system ('all' | 'collection' | 'subcollection')

### Implementation Details

```typescript
// Before:
view: z.enum(['all', 'collection']).optional()

// After:
view: z.enum(['all', 'collection', 'subcollection']).optional(),
subcollectionId: z.string().nullable().optional()
```

## Validation Results

### ESLint

✓ Passed with 3 pre-existing warnings (unrelated to this change)

- Warnings in users-data-table.tsx, search-results-list.tsx, reports-table.tsx (TanStack Table React Compiler)

### TypeScript

✓ Passed - No compilation errors

## Success Criteria

- [✓] Route type definitions compile without errors
- [✓] Search param types support subcollection filtering
- [✓] All validation commands pass

## Notes for Next Steps

- The `CollectionSearchParams` type now automatically includes the new parameters
- Next steps can use these type definitions for nuqs search param parsers
- The three-state view system is ready for implementation in components
