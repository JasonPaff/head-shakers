# Step 5: Integrate Nuqs State Management in Controls Component

**Step**: 5/10
**Specialist**: form-specialist
**Status**: ✓ Success
**Duration**: ~3 minutes

## Objective

Update controls component to manage subcollection filter state with Nuqs

## Skills Loaded

- **form-system**: Form-System-Conventions.md
- **react-coding-conventions**: React-Coding-Conventions.md
- **validation-schemas**: Validation-Schemas-Conventions.md
- **server-actions**: Server-Actions-Conventions.md

## Changes Made

### Files Modified

**src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobblehead-controls.tsx**
- Added `subcollectionId` to useQueryStates configuration with parseAsString parser
- Extended viewOptions to include 'subcollection' mode
- Implemented state coordination logic between view and subcollectionId
- Integrated CollectionSubcollectionFilter component into controls layout
- Added subcollections prop to component interface (default: empty array)

### State Coordination Logic

**When subcollection selected**:
- Sets subcollectionId to UUID
- Automatically updates view to 'subcollection'

**When view toggled to 'all' or 'collection'**:
- Clears subcollectionId
- Updates view accordingly

**When view buttons clicked**:
- Clears any active subcollection filter
- Maintains search and sort filters

## Conventions Applied

- ✓ Underscore prefix for derived variables
- ✓ Extracted complex boolean conditions to descriptive variables
- ✓ Proper event handler naming (handleSubcollectionFilterChange)
- ✓ Added props interface with proper typing
- ✓ Single quotes for strings and JSX attributes
- ✓ UI block comments for clarity

## Validation Results

### ESLint
✓ Passed - No errors or warnings

### TypeScript
✓ Passed - No compilation errors

## Success Criteria

- [✓] Nuqs manages subcollectionId in URL query parameters
- [✓] State updates propagate correctly to URL
- [✓] View and subcollectionId states coordinate properly
- [✓] All validation commands pass

## Notes for Next Steps

**State Coordination**:
- URL always reflects current filter state
- View mode auto-updates when subcollection selected
- View buttons clear subcollection selection
- Component accepts subcollections prop (will be populated in Step 7)

**Filter Component Behavior**:
- Renders null when no subcollections exist
- Shows three options: All, Main Collection, and individual subcollections
- Properly manages URL state through nuqs
