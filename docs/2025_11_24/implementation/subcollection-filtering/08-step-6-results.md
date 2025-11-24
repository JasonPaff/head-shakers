# Step 6: Update Server Component Data Fetching

**Step**: 6/10
**Specialist**: react-component-specialist
**Status**: ✓ Success
**Duration**: ~2 minutes

## Objective

Modify server component to extract and pass subcollection filter to facade layer

## Skills Loaded

- **react-coding-conventions**: React-Coding-Conventions.md
- **ui-components**: UI-Components-Conventions.md

## Changes Made

### Files Modified

**src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobbleheads.tsx**
- Extracted `subcollectionId` from URL search params
- Implemented view state mapping logic to facade parameters
- Simplified facade call to use single method for all filtering states
- Added clear comments explaining three-state filtering logic

### View State Mapping

**Implementation Logic**:
```typescript
// Map view state to subcollection filter parameter:
// - 'all': undefined (all bobbleheads)
// - 'collection': null (main collection only)
// - 'subcollection': subcollectionId value (specific subcollection)
const subcollectionIdParam =
  view === 'all'
    ? undefined
    : view === 'collection'
      ? null
      : subcollectionIdFromParams;
```

**Three States Supported**:
1. `view === 'all'` → `subcollectionId: undefined` (all bobbleheads)
2. `view === 'collection'` → `subcollectionId: null` (main only)
3. `view === 'subcollection'` → `subcollectionId: <uuid>` (specific)

## Conventions Applied

- ✓ Single quotes for strings and comments
- ✓ Clear inline comments explaining mapping logic
- ✓ Proper TypeScript type annotations (null | string | undefined)
- ✓ Extracted URL parameter to descriptive variable
- ✓ Used conditional logic with clear comments
- ✓ Maintained existing code organization
- ✓ Followed server component async/await patterns

## Validation Results

### ESLint
✓ Passed - No errors or warnings

### TypeScript
✓ Passed - No compilation errors

## Success Criteria

- [✓] Server component reads subcollectionId from URL
- [✓] Filtered data request includes subcollection parameter
- [✓] Component renders filtered bobblehead list correctly
- [✓] All validation commands pass

## Notes for Next Steps

**Simplified Facade Usage**:
- Uses single `getAllCollectionBobbleheadsWithPhotos` method
- Handles all three filtering states via `subcollectionId` parameter
- No need for conditional method selection

**Data Flow**:
URL → searchParams → mapping logic → facade → query → filtered results

Step 7 will complete the data flow by passing subcollections array to the controls component.
