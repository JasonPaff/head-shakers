# Step 2: File Discovery

## Step Metadata

| Field      | Value                         |
| ---------- | ----------------------------- |
| Step       | 2 - AI-Powered File Discovery |
| Status     | Completed                     |
| Start Time | 2025-11-23T00:00:30Z          |
| End Time   | 2025-11-23T00:01:30Z          |
| Duration   | ~60 seconds                   |

## Input: Refined Feature Request

Redesign and enhance the `/browse/search` page to deliver a clean, modern interface with significantly improved user experience for discovering bobblehead collections and individual bobbleheads. The current search page should be rebuilt using the existing Radix UI component library and Tailwind CSS 4, incorporating a visually refined layout with better visual hierarchy, improved spacing, and modern design patterns such as card-based result displays with Cloudinary-optimized images, subtle hover states, and smooth transitions. The search functionality should leverage Nuqs for URL state management to ensure search queries, filters, and pagination state are properly synchronized with the URL for shareability and browser navigation support...

## Discovery Statistics

- **Directories Explored**: 12+
- **Candidate Files Examined**: 80+
- **Highly Relevant Files**: 31
- **Supporting Files**: 35+

## Discovered Files by Priority

### Critical Priority (Must Modify - Core Implementation)

| File Path                                                        | Description                                                                                     |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/app/(app)/browse/search/page.tsx`                           | Main search page server component - entry point for the redesigned search page                  |
| `src/app/(app)/browse/search/route-type.ts`                      | Route type definitions with Zod schemas for URL search params validation                        |
| `src/app/(app)/browse/search/components/search-page-content.tsx` | Client component orchestrating search functionality, already uses Nuqs for URL state management |
| `src/app/(app)/browse/search/components/search-filters.tsx`      | Search filters component with entity type toggles, sort options - needs enhanced filtering      |
| `src/app/(app)/browse/search/components/search-results-grid.tsx` | Results display component - needs grid/list view modes implementation                           |
| `src/app/(app)/browse/search/components/search-pagination.tsx`   | Pagination component for search results                                                         |
| `src/components/feature/search/search-result-item.tsx`           | Individual search result card component - needs visual enhancement                              |

### High Priority (Likely Modify - Supporting Implementation)

| File Path                                                  | Description                                                                                     |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/lib/actions/content-search/content-search.actions.ts` | Server actions for public search - `searchPublicContentAction`, `getPublicSearchDropdownAction` |
| `src/lib/facades/content-search/content-search.facade.ts`  | Business logic facade with `getPublicSearchPageResults`, `getPublicSearchDropdownResults`       |
| `src/lib/queries/content-search/content-search.query.ts`   | Database queries for searching collections, subcollections, bobbleheads                         |
| `src/lib/validations/public-search.validation.ts`          | Zod validation schemas for search input, filters, pagination                                    |
| `src/components/feature/search/search-dropdown.tsx`        | Header search dropdown - shares search result display patterns                                  |
| `src/lib/constants/enums.ts`                               | Contains `ENUMS.SEARCH.SORT_BY`, `ENUMS.SEARCH.SORT_ORDER` values                               |
| `src/lib/constants/config.ts`                              | Contains `CONFIG.SEARCH` and `CONFIG.PAGINATION` settings                                       |

### Medium Priority (Reference - Existing Patterns)

| File Path                                                        | Description                                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/app/(app)/browse/components/browse-collections-content.tsx` | Browse collections with Nuqs URL state management - reference for Nuqs patterns |
| `src/app/(app)/browse/components/browse-collections-table.tsx`   | Card-based grid display using `$path` helper - reference for card layouts       |
| `src/app/(app)/browse/components/browse-collections-filters.tsx` | Filter components pattern reference                                             |
| `src/components/admin/reports/reports-table.tsx`                 | TanStack React Table implementation with sorting, pagination, row selection     |
| `src/lib/services/cache.service.ts`                              | CacheService with Redis-based search caching                                    |
| `src/lib/constants/cache.ts`                                     | Cache configuration including `CACHE_CONFIG.TTL.PUBLIC_SEARCH` (10 minutes)     |
| `src/lib/utils/cache.utils.ts`                                   | Cache key generation utilities for search operations                            |
| `src/lib/utils/redis-client.ts`                                  | Upstash Redis client wrapper for distributed caching                            |
| `src/lib/utils/cloudinary.utils.ts`                              | Cloudinary URL extraction for optimized image display                           |
| `src/hooks/use-server-action.ts`                                 | Hook for executing server actions with toast notifications                      |
| `src/hooks/use-toggle.ts`                                        | Toggle state hook used in search dropdown                                       |

### Low Priority (Context - UI Components)

| File Path                           | Description                                          |
| ----------------------------------- | ---------------------------------------------------- |
| `src/components/ui/skeleton.tsx`    | Skeleton loading component for loading states        |
| `src/components/ui/spinner.tsx`     | Loading spinner component                            |
| `src/components/ui/card.tsx`        | Radix-based Card component for result cards          |
| `src/components/ui/badge.tsx`       | Badge component for tags and entity type indicators  |
| `src/components/ui/select.tsx`      | Select dropdown for filters                          |
| `src/components/ui/checkbox.tsx`    | Checkbox for entity type toggles                     |
| `src/components/ui/input.tsx`       | Input component for search text                      |
| `src/components/ui/button.tsx`      | Button component                                     |
| `src/components/ui/conditional.tsx` | Conditional rendering utility component              |
| `src/components/ui/empty-state.tsx` | Empty state component for no results                 |
| `src/components/ui/separator.tsx`   | Visual separator between sections                    |
| `src/components/ui/tabs.tsx`        | Tabs component (potentially for view mode switching) |
| `src/components/ui/table.tsx`       | Table component for list view                        |

### Database Schema Files (Reference)

| File Path                                 | Description                                           |
| ----------------------------------------- | ----------------------------------------------------- |
| `src/lib/db/schema/bobbleheads.schema.ts` | Bobbleheads table with GIN indexes for text search    |
| `src/lib/db/schema/collections.schema.ts` | Collections/subcollections schema with search indexes |
| `src/lib/db/schema/tags.schema.ts`        | Tags schema for tag filtering                         |

## Architecture Insights

### Existing Patterns Discovered

1. **URL State Management (Nuqs)**: Already implemented in `search-page-content.tsx` using `useQueryStates` with parsers like `parseAsString`, `parseAsInteger`, `parseAsArrayOf`, `parseAsStringEnum`.

2. **Type-Safe Routing**: Uses `next-typesafe-url` with `$path` helper for generating routes.

3. **Server Actions Pattern**: Uses `next-safe-action` with `publicActionClient` for unauthenticated search actions. Input validated through Zod schemas.

4. **Caching Strategy**: Redis-based caching via `CacheService.redisSearch.publicPage()` with 10-minute TTL.

5. **Debounced Search**: Already implemented with `CONFIG.SEARCH.DEBOUNCE_MS` (300ms).

6. **TanStack React Table**: Full implementation available in `reports-table.tsx`.

7. **Cloudinary Integration**: Uses `CldImage` from `next-cloudinary`.

### Current Search Implementation

The current `search-page-content.tsx` already has:

- Nuqs URL state management for all search params
- Debounced search input
- Entity type filtering (collection, subcollection, bobblehead)
- Sort by/order options
- Tag ID filtering
- Pagination
- Loading, error, and empty states

### Recommended Enhancements

1. **View Modes**: Add grid/list toggle using URL state
2. **Enhanced Filters**: Add category, rarity, date range filters
3. **Skeleton Loaders**: Replace spinner with card skeletons
4. **Visual Refinement**: Update SearchResultItem with better card design
5. **TanStack Table**: Integrate for list view mode
6. **Autocomplete**: Add real-time search suggestions

## Validation Results

| Check                   | Result | Notes                                             |
| ----------------------- | ------ | ------------------------------------------------- |
| Minimum Files           | PASS   | 31 relevant files discovered (>3 minimum)         |
| File Path Validation    | PASS   | All paths verified to exist                       |
| Priority Categorization | PASS   | Files categorized across 4 priority levels        |
| Comprehensive Coverage  | PASS   | Covers UI, queries, actions, schemas, caching     |
| Pattern Recognition     | PASS   | Identified existing Nuqs, TanStack Table patterns |
