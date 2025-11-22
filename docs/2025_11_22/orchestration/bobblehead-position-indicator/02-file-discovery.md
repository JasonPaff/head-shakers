# Step 2: File Discovery

## Step Metadata

- **Start Time**: 2025-11-22T00:00:30Z
- **End Time**: 2025-11-22T00:01:30Z
- **Duration**: ~60 seconds
- **Status**: Completed

## Input: Refined Request

Add a position indicator to the bobblehead collection navigation component that displays the current position within the collection or subcollection using an "X of Y" format (e.g., "3 of 6") positioned centrally between the Previous and Next navigation buttons. The indicator should be calculated by counting the total number of bobbleheads in the filtered collection/subcollection context and determining the current bobblehead's ordinal position based on the createdAt timestamp ordering used by the getAdjacentBobbleheadsInCollectionAsync query. This requires extending the BobbleheadNavigationData type to include currentPosition and totalCount fields, updating the BobbleheadsFacade.getBobbleheadNavigationData method to fetch the total collection count via BobbleheadsQuery, and modifying the BobbleheadNavigation client component to render the position indicator with appropriate styling (text-sm, neutral color) that remains visible on both desktop and mobile viewports. The position count should respect the same collection/subcollection filtering already implemented through Nuqs query state (collectionId and subcollectionId) and should be cached with the existing MEDIUM TTL (1800 seconds) and collection-based cache invalidation strategy to maintain performance parity with current navigation behavior.

## Agent Prompt Sent

```
Find all files relevant to implementing this feature:

REFINED FEATURE REQUEST:
[Full refined request as above]

PROJECT STRUCTURE:
- src/app/(app)/bobbleheads/ - bobblehead routes and pages
- src/components/feature/bobblehead/ - bobblehead-specific components
- src/lib/facades/ - business logic layer facades
- src/lib/queries/ - database queries
- src/lib/actions/ - server actions

DISCOVERY REQUIREMENTS:
1. Find minimum 5 relevant files
2. Categorize by priority (Critical/High/Medium/Low)
3. Provide reasoning for each file's relevance
4. Validate all file paths exist
5. Look for existing navigation components, facades, queries, and types
```

## Full Agent Response

### Analysis Summary

- Explored 12 directories
- Examined 25 candidate files
- Found 9 highly relevant files
- Identified 3 supporting files

## Discovered Files

### Critical Priority (Core Implementation)

| #   | File Path                                                                                      | Action | Relevance                                                                               |
| --- | ---------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| 1   | `src/lib/types/bobblehead-navigation.types.ts`                                                 | MODIFY | Defines `BobbleheadNavigationData` type - add `currentPosition` and `totalCount` fields |
| 2   | `src/lib/validations/bobblehead-navigation.validation.ts`                                      | MODIFY | Zod validation schema - add fields to match updated types                               |
| 3   | `src/lib/queries/bobbleheads/bobbleheads-query.ts`                                             | MODIFY | Contains `getAdjacentBobbleheadsInCollectionAsync` - add position counting method       |
| 4   | `src/lib/facades/bobbleheads/bobbleheads.facade.ts`                                            | MODIFY | Contains `getBobbleheadNavigationData` - update to include position data                |
| 5   | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx` | MODIFY | Client component - add position indicator UI                                            |

### High Priority (Supporting Components)

| #   | File Path                                                                                                         | Action | Relevance                                             |
| --- | ----------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------- |
| 6   | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx`        | VERIFY | Server component fetching navigation data             |
| 7   | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-navigation-skeleton.tsx` | MODIFY | Loading skeleton - add position indicator placeholder |

### Medium Priority (Configuration/Infrastructure)

| #   | File Path                       | Action | Relevance                                                 |
| --- | ------------------------------- | ------ | --------------------------------------------------------- |
| 8   | `src/lib/constants/cache.ts`    | NONE   | Reference - existing TTL.MEDIUM and tags already in place |
| 9   | `src/lib/test-ids/generator.ts` | VERIFY | Test ID generation for position indicator                 |

### Low Priority (Reference/Context)

| #   | File Path                                                          | Action | Relevance                              |
| --- | ------------------------------------------------------------------ | ------ | -------------------------------------- |
| 10  | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx` | NONE   | Already integrates navigation properly |
| 11  | `src/lib/services/cache-revalidation.service.ts`                   | NONE   | Reference for invalidation patterns    |
| 12  | `src/lib/utils/cache-tags.utils.ts`                                | NONE   | Cache tag utilities                    |

## Architecture Insights

### Data Flow Pattern

```
Page -> AsyncComponent -> Facade -> Query -> Database
```

Navigation flow: `page.tsx` -> `BobbleheadNavigationAsync` -> `BobbleheadsFacade.getBobbleheadNavigationData` -> `BobbleheadsQuery.getAdjacentBobbleheadsInCollectionAsync`

### Caching Strategy

- TTL: `CACHE_CONFIG.TTL.MEDIUM` (1800 seconds / 30 minutes)
- Tags: `CACHE_CONFIG.TAGS.COLLECTION_BOBBLEHEADS(collectionId)` for invalidation
- Key: incorporates `bobbleheadId`, `collectionId`, `subcollectionId`, and `viewerUserId`

### Navigation Ordering

- Uses `createdAt DESC` ordering
- "Previous" = newer item, "Next" = older item
- Position calculation must respect this same ordering

## File Modification Scope

| File                                  | Lines | Modification Scope                        |
| ------------------------------------- | ----- | ----------------------------------------- |
| `bobblehead-navigation.types.ts`      | 45    | Add 2 fields                              |
| `bobblehead-navigation.validation.ts` | 55    | Add 2 schema fields                       |
| `bobbleheads-query.ts`                | 760   | Add ~30-50 lines for count/position query |
| `bobbleheads.facade.ts`               | 936   | Modify ~15-20 lines to include position   |
| `bobblehead-navigation.tsx`           | 188   | Add ~15-20 lines for position indicator   |
| `bobblehead-navigation-skeleton.tsx`  | 27    | Add ~3-5 lines for position skeleton      |

## Discovery Statistics

- **Total Files Discovered**: 12
- **Files Requiring Modification**: 6
- **Files for Reference Only**: 6
- **Minimum Requirement (5 files)**: PASS
- **All Paths Validated**: PASS

## Validation Results

- **Minimum Files**: 12 discovered (exceeds 5 minimum) - PASS
- **AI Analysis Quality**: Detailed reasoning provided - PASS
- **File Validation**: All paths verified to exist - PASS
- **Smart Categorization**: Files properly prioritized - PASS
- **Comprehensive Coverage**: All architectural layers covered - PASS
