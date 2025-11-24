# Step 4: Create Subcollection Selector Component

**Step**: 4/10
**Specialist**: react-component-specialist
**Status**: ✓ Success
**Duration**: ~2 minutes

## Objective

Build new Radix UI Select component for choosing subcollection filter

## Skills Loaded

- **react-coding-conventions**: React-Coding-Conventions.md
- **ui-components**: UI-Components-Conventions.md

## Changes Made

### Files Created

**src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-subcollection-filter.tsx**

- New client-side Radix UI Select component
- Implements three filter options:
  1. "All Bobbleheads" (filter: null)
  2. "Main Collection Only" (filter: "collection")
  3. Individual subcollections (filter: subcollectionId)
- Includes proper accessibility labels
- Returns null when no subcollections exist

### Component Interface

```typescript
interface CollectionSubcollectionFilterProps extends ComponentTestIdProps {
  subcollections: Array<{ id: string; name: string }>;
  currentFilter: null | string;
  onFilterChange: (filter: null | string) => void;
}
```

## Conventions Applied

- ✓ 'use client' directive for client-side component
- ✓ Arrow function component with TypeScript interface
- ✓ Named export (no default export)
- ✓ Type imports with `import type`
- ✓ Single quotes for strings and imports
- ✓ JSX attributes with curly braces
- ✓ Boolean naming with underscore prefix (\_hasSubcollections)
- ✓ Event handler naming with 'handle' prefix
- ✓ Callback prop naming with 'on' prefix
- ✓ Test ID pattern with generateTestId
- ✓ Accessibility with aria-label
- ✓ Conditional rendering with early return
- ✓ UI block comments for sections
- ✓ Component structure with derived variables before return

## Validation Results

### ESLint

✓ Passed - No errors

### TypeScript

✓ Passed - No compilation errors

## Success Criteria

- [✓] Component renders Radix Select with all filter options
- [✓] Matches existing Radix Select styling patterns
- [✓] Properly typed props interface
- [✓] All validation commands pass

## Notes for Next Steps

**Filter Values**:

- `null` → "All Bobbleheads" (view all)
- `"collection"` → "Main Collection Only" (main only)
- `subcollectionId` → Specific subcollection name (filtered view)

**Integration Requirements** (Step 5):

- Connect to nuqs URL state management
- Pass subcollections array from server
- Wire up onFilterChange callback to update URL params
- Component automatically hides when no subcollections exist
