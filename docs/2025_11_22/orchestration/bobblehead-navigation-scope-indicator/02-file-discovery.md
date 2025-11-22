# Step 2: AI-Powered File Discovery

## Step Metadata

- **Step**: 2 - File Discovery
- **Status**: Completed
- **Start Time**: 2025-11-22T00:00:30Z
- **End Time**: 2025-11-22T00:01:30Z
- **Duration**: ~60 seconds

## Refined Request Used as Input

When users navigate between bobbleheads using the sequential navigation controls, they currently have no visual indication of which collection or subcollection context is scoping their navigation. This feature request adds a clear, contextual label to the bobblehead navigation interface that displays the active collection or subcollection name, helping users understand the boundaries of their navigation.

## Discovery Statistics

- **Directories Explored**: 8
- **Candidate Files Examined**: 45+
- **Highly Relevant Files Found**: 18
- **Supporting Files Found**: 10
- **Total Files Discovered**: 28

## Discovered Files by Priority

### Critical Priority (Core Implementation)

| File                                | Path                                                                                                       | Relevance                                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| bobblehead-navigation.tsx           | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx`             | Primary client component rendering navigation controls - where collection context label needs integration |
| bobblehead-navigation-async.tsx     | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx` | Async server component wrapper fetching navigation data - must fetch collection/subcollection names       |
| bobblehead-navigation.types.ts      | `src/lib/types/bobblehead-navigation.types.ts`                                                             | Type definitions for navigation data - must extend with collection name fields                            |
| bobblehead-navigation.validation.ts | `src/lib/validations/bobblehead-navigation.validation.ts`                                                  | Zod validation schemas - must update for collection context fields                                        |

### High Priority

| File                               | Path                                                                                                              | Relevance                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| bobblehead-navigation-skeleton.tsx | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-navigation-skeleton.tsx` | Skeleton loader - should include skeleton for context label         |
| bobbleheads.facade.ts              | `src/lib/facades/bobbleheads/bobbleheads.facade.ts`                                                               | Contains getBobbleheadNavigationData - must return collection names |
| page.tsx                           | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx`                                                | Main detail page - review for integration points                    |

### Medium Priority

| File                     | Path                                                                    | Relevance                                                           |
| ------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| bobbleheads-query.ts     | `src/lib/queries/bobbleheads/bobbleheads-query.ts`                      | Database query layer - may need extension for collection name query |
| collections.query.ts     | `src/lib/queries/collections/collections.query.ts`                      | Collection query layer with findByIdAsync                           |
| subcollections.query.ts  | `src/lib/queries/collections/subcollections.query.ts`                   | Subcollection query layer                                           |
| collections.facade.ts    | `src/lib/facades/collections/collections.facade.ts`                     | Collection facade with getCollectionById                            |
| subcollections.facade.ts | `src/lib/facades/collections/subcollections.facade.ts`                  | Subcollection facade                                                |
| route-type.ts            | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/route-type.ts` | Route type definitions with BobbleheadNavigationContext             |
| tooltip.tsx              | `src/components/ui/tooltip.tsx`                                         | Tooltip for full name on truncation                                 |
| badge.tsx                | `src/components/ui/badge.tsx`                                           | Badge component for context label styling                           |

### Low Priority

| File              | Path                                | Relevance                                      |
| ----------------- | ----------------------------------- | ---------------------------------------------- |
| test-ids.ts       | `src/lib/test-ids.ts`               | Test ID generation - new IDs for context label |
| conditional.tsx   | `src/components/ui/conditional.tsx` | Conditional rendering utility                  |
| button.tsx        | `src/components/ui/button.tsx`      | Button styling reference                       |
| tailwind-utils.ts | `src/utils/tailwind-utils.ts`       | cn() utility for class merging                 |

## Architecture Insights

### Navigation Data Flow Pattern

```
BobbleheadNavigationAsync (Server Component)
    ↓ fetches via
BobbleheadsFacade.getBobbleheadNavigationData()
    ↓ passes to
BobbleheadNavigation (Client Component)
    ↓ renders
Previous/Next links + [NEW] Collection Context Label
```

### URL State Management

- Collection context tracked via URL search params (`collectionId`, `subcollectionId`)
- Uses `nuqs` library with `useQueryStates` hook
- Context already available in navigation component

### Existing Similar Functionality

- `BobbleheadWithRelations` type includes `collectionName` and `subcollectionName` fields
- Navigation skeleton demonstrates loading state patterns
- `Conditional` component handles conditional rendering

## Integration Points

1. **Data Enhancement**: `getBobbleheadNavigationData` must return collection/subcollection names
2. **Type Extension**: `BobbleheadNavigationData` needs `collectionName`, `subcollectionName`, `collectionId`, `subcollectionId` fields
3. **UI Integration**: New context label component positioned within/adjacent to existing `<nav>` element

## File Validation Results

All discovered file paths validated to exist in the codebase.

## Warnings

None - comprehensive file discovery completed successfully.
