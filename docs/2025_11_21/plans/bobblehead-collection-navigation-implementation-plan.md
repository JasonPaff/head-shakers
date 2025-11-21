# Implementation Plan: Bobblehead Sequential Navigation in Collection Context

**Generated**: 2025-11-21T00:05:00Z
**Feature**: Collection Bobblehead Navigation
**Original Request**: as a user I would like a way to cycle/scroll through the bobbleheads in a collection from a bobblehead details page in that collection/subcollection.

## Refined Request

As a user, I want a way to navigate between bobbleheads within a collection or subcollection directly from the bobblehead details page, allowing me to cycle through items sequentially without returning to the collection view. This feature should preserve the collection context through the URL using Nuqs for state management and type-safe routing via $path from next-typesafe-url, displaying previous and next navigation buttons (using Lucide React icons) that are intelligently disabled at collection boundaries. The implementation should leverage the existing App Router structure by maintaining collection/subcollection IDs in the URL query parameters alongside the current bobblehead ID, enabling seamless navigation while preserving filter, sort, and pagination states if previously applied. The detail page should fetch the sequential bobblehead data efficiently using Drizzle ORM queries that determine the previous and next items based on the collection's current sort order, with proper TypeScript typing for all data structures. Navigation should be implemented as Radix UI button components integrated into the existing detail page layout, supporting both keyboard shortcuts (arrow keys) and mouse clicks, while ensuring the feature respects user permissions through server-side validation via Next-Safe-Action before rendering navigation options. When a user navigates to an adjacent bobblehead, the page should update the URL parameters without full navigation where possible, and the component should display loading states during transitions.

## Analysis Summary

- Feature request refined with comprehensive project context
- Discovered 23 files across all architectural layers
- Generated 12-step implementation plan with quality gates
- Estimated duration: 2-3 days (Medium complexity, Medium risk)

## File Discovery Results

### Critical Priority (6 files)
1. `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx` - Main detail page
2. `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/route-type.ts` - Route definition
3. `src/lib/queries/bobbleheads/bobbleheads-query.ts` - Query layer (675 lines)
4. `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Facade layer (824 lines)
5. `src/lib/db/schema/bobbleheads.schema.ts` - Database schema
6. `src/lib/db/schema/collections.schema.ts` - Collections schema

### High Priority (8 files)
7. `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-header.tsx` - Header component
8. `src/components/ui/button.tsx` - UI button component
9. **NEW**: `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx` - Client navigation component
10. **NEW**: `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx` - Server async wrapper
11. `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobblehead-controls.tsx` - Nuqs reference
12. `src/app/(app)/browse/search/components/search-page-content.tsx` - Nuqs pagination reference
13. **NEW**: `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-navigation-skeleton.tsx` - Loading skeleton
14. **NEW**: Test files for navigation components

### Medium Priority (6 files)
15. `src/lib/actions/bobbleheads/bobbleheads.actions.ts` - Server actions
16. **NEW**: `src/lib/validations/bobblehead-navigation.validation.ts` - Navigation validation
17. **NEW**: `src/lib/types/bobblehead-navigation.types.ts` - Navigation types
18. `src/lib/validations/bobbleheads.validation.ts` - Validation reference
19. `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobbleheads.tsx` - Collection view
20. `src/lib/services/cache-revalidation.service.ts` - Cache invalidation

### Low Priority (3 files)
21. Base query utilities (query-context.ts, base-query.ts)
22. Cache services (cache.service.ts)
23. Utility files (slug.ts, optional-auth-utils.ts)

---

## Overview

**Estimated Duration**: 2-3 days
**Complexity**: Medium
**Risk Level**: Medium

## Quick Summary

Implement sequential navigation between bobbleheads within a collection or subcollection context directly from the bobblehead detail page. This feature adds previous/next navigation buttons (using Lucide React icons) that are context-aware, utilizing Nuqs for URL state management and the existing three-layer architecture (Query → Facade → Component) with type-safe routing via $path. The implementation will maintain collection/subcollection context through URL query parameters, support keyboard shortcuts, and respect user permissions through server-side validation.

## Prerequisites

- [ ] Review existing Nuqs usage patterns in collection-bobblehead-controls.tsx
- [ ] Understand the three-layer architecture pattern used in bobbleheads-query.ts and bobbleheads.facade.ts
- [ ] Confirm route-type.ts structure for adding searchParams validation
- [ ] Verify Redis caching patterns with CacheService for navigation data

## Implementation Steps

### Step 1: Extend Route Type Definition with Navigation Context

**What**: Add searchParams validation to route-type.ts to support collectionId and subcollectionId query parameters
**Why**: Type-safe URL state management requires Zod validation for all query parameters used in navigation context
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/route-type.ts` - Add searchParams object with collectionId and subcollectionId

**Changes:**
- Add searchParams object to Route definition with parseAsString for collectionId and subcollectionId
- Update PageProps type inference to include searchParams
- Ensure validation follows existing Nuqs patterns with optional UUID parameters

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] searchParams includes optional collectionId and subcollectionId with UUID validation
- [ ] PageProps type correctly infers searchParams alongside routeParams
- [ ] All validation commands pass

---

### Step 2: Create Navigation Query Methods in BobbleheadsQuery

**What**: Add query methods to find previous and next bobbleheads within collection/subcollection context
**Why**: Query layer handles all database operations with permission filtering and sorting logic
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/bobbleheads/bobbleheads-query.ts` - Add getAdjacentBobbleheadsInCollectionAsync method

**Changes:**
- Add getAdjacentBobbleheadsInCollectionAsync method that accepts bobbleheadId, collectionId, optional subcollectionId, and QueryContext
- Implement query logic to find previous and next bobbleheads based on createdAt DESC ordering
- Apply buildBaseFilters for permission filtering (isPublic, userId, isDeleted)
- Return object with previousBobblehead and nextBobblehead (both nullable)
- Handle subcollection context by filtering on both collectionId and subcollectionId when provided
- Use limit and orderBy clauses to efficiently fetch adjacent records

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Query method correctly finds previous bobblehead (newer by createdAt)
- [ ] Query method correctly finds next bobblehead (older by createdAt)
- [ ] Permission filtering applied through buildBaseFilters
- [ ] Subcollection context properly handled when provided
- [ ] All validation commands pass

---

### Step 3: Create Navigation Types and Validation Schemas

**What**: Define TypeScript types and Zod validation schemas for navigation data structures
**Why**: Type safety and runtime validation ensure data integrity throughout the navigation flow
**Confidence**: High

**Files to Create:**
- `src/lib/types/bobblehead-navigation.types.ts` - Navigation type definitions
- `src/lib/validations/bobblehead-navigation.validation.ts` - Zod validation schemas

**Changes:**
- Define BobbleheadNavigationData type with previousBobblehead and nextBobblehead properties
- Define AdjacentBobblehead type with id, slug, name, and optional photo properties
- Create getBobbleheadNavigationSchema validation schema accepting bobbleheadId, collectionId, and optional subcollectionId
- Use Drizzle-Zod patterns and zodNullableUUID utility for consistency
- Export all types and schemas for use in facade and component layers

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Types properly define navigation data structure with nullable adjacent bobbleheads
- [ ] Validation schemas use existing Zod utilities and follow project patterns
- [ ] All exports properly typed and accessible
- [ ] All validation commands pass

---

### Step 4: Implement Navigation Facade Method with Caching

**What**: Add facade method to fetch navigation data with Redis caching and error handling
**Why**: Facade layer provides business logic, caching, and centralized error handling following established patterns
**Confidence**: High

**Files to Modify:**
- `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Add getBobbleheadNavigationData method

**Changes:**
- Add getBobbleheadNavigationData method accepting bobbleheadId, collectionId, optional subcollectionId, and optional userId
- Implement caching with CacheService using createFacadeCacheKey from cache.utils.ts
- Set TTL to 1800 seconds (30 minutes) consistent with other facade methods
- Call BobbleheadsQuery.getAdjacentBobbleheadsInCollectionAsync with appropriate QueryContext
- Wrap in try-catch with createFacadeError for error handling
- Add Sentry breadcrumbs for cache hits and misses
- Return navigation data with properly typed previous and next bobbleheads

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Facade method properly caches navigation data with appropriate TTL
- [ ] Error handling uses createFacadeError with proper context
- [ ] QueryContext created based on userId presence (public vs user context)
- [ ] Method signature follows existing facade patterns
- [ ] All validation commands pass

---

### Step 5: Create Client Navigation Component

**What**: Build React client component for navigation UI with Nuqs state management and keyboard support
**Why**: Client-side interactivity requires client component with URL state management and event handling
**Confidence**: High

**Files to Create:**
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx` - Client navigation component

**Changes:**
- Create client component with useQueryStates from Nuqs to read collectionId and subcollectionId
- Accept navigationData prop with previousBobblehead and nextBobblehead
- Use Radix UI Button components with Lucide React ChevronLeft and ChevronRight icons
- Implement disabled state when previous/next is null (boundary conditions)
- Use $path for type-safe navigation with bobbleheadSlug and preserved query parameters
- Add keyboard event listener for ArrowLeft and ArrowRight key navigation
- Clean up event listeners in useEffect return
- Apply existing button styling with variant and size props
- Add loading states during navigation transitions using useTransition

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component correctly reads collectionId and subcollectionId from URL via Nuqs
- [ ] Previous and next buttons properly disabled at collection boundaries
- [ ] Keyboard shortcuts work for arrow key navigation
- [ ] Navigation preserves collection context in URL parameters
- [ ] Component follows existing UI patterns and styling
- [ ] All validation commands pass

---

### Step 6: Create Server Async Navigation Wrapper

**What**: Build async server component to fetch navigation data and pass to client component
**Why**: Server component pattern separates data fetching from client interactivity following established architecture
**Confidence**: High

**Files to Create:**
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx` - Server async wrapper

**Changes:**
- Create async server component accepting bobbleheadId, collectionId, and optional subcollectionId props
- Call getOptionalUserId for current user context
- Fetch navigation data via BobbleheadsFacade.getBobbleheadNavigationData
- Return null if no collectionId provided (navigation not applicable)
- Return null if navigation data is empty (no adjacent bobbleheads)
- Pass fetched data to client BobbleheadNavigation component
- Follow async wrapper pattern from bobblehead-header-async.tsx

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component fetches navigation data server-side
- [ ] Properly handles missing collection context by returning null
- [ ] Passes data to client component with correct prop types
- [ ] Follows existing async wrapper patterns
- [ ] All validation commands pass

---

### Step 7: Create Navigation Skeleton Component

**What**: Build loading skeleton component for navigation buttons during Suspense
**Why**: Consistent loading states improve UX and follow existing skeleton pattern throughout the codebase
**Confidence**: High

**Files to Create:**
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-navigation-skeleton.tsx` - Skeleton loading component

**Changes:**
- Create skeleton component mirroring navigation button layout
- Use Skeleton component from UI library for button placeholders
- Match dimensions and spacing of actual navigation buttons
- Follow skeleton patterns from existing bobblehead-header-skeleton.tsx

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Skeleton matches navigation component layout
- [ ] Dimensions and spacing consistent with actual component
- [ ] Uses existing Skeleton UI component
- [ ] All validation commands pass

---

### Step 8: Integrate Navigation into Detail Page

**What**: Add navigation component to bobblehead detail page with Suspense boundary
**Why**: Navigation must be accessible from detail page with proper loading and error handling
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx` - Add navigation section

**Changes:**
- Extract collectionId and optional subcollectionId from searchParams in ItemPage component
- Add new section after BobbleheadHeader with ContentLayout wrapper
- Wrap BobbleheadNavigationAsync in Suspense with BobbleheadNavigationSkeleton fallback
- Wrap in BobbleheadErrorBoundary with section prop
- Pass bobbleheadId, collectionId, and subcollectionId to async component
- Position navigation section logically in page layout (below header, above feature card)
- Conditionally render based on collectionId presence

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Navigation component integrated into page layout
- [ ] Suspense and error boundaries properly configured
- [ ] searchParams correctly extracted and passed to navigation component
- [ ] Navigation only renders when collectionId is present
- [ ] Page layout maintains visual hierarchy
- [ ] All validation commands pass

---

### Step 9: Update Collection View Links to Include Context

**What**: Modify collection bobblehead links to include collectionId and subcollectionId query parameters
**Why**: Navigation context must be established when entering detail page from collection view
**Confidence**: Medium

**Files to Modify:**
- `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobbleheads.tsx` - Update bobblehead links

**Changes:**
- Update links to bobblehead detail pages to include collectionId in searchParams
- Include subcollectionId when viewing subcollection context
- Use $path with both routeParams and searchParams
- Ensure type-safe parameter passing with proper UUID validation
- Update any other collection view components that link to bobblehead details

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Links from collection views include collectionId parameter
- [ ] Links from subcollection views include both collectionId and subcollectionId
- [ ] Type-safe routing maintained with $path
- [ ] Navigation context properly established from collection entry points
- [ ] All validation commands pass

---

### Step 10: Add Cache Invalidation for Navigation Data

**What**: Ensure navigation cache is invalidated when collection structure changes
**Why**: Cached navigation data must stay consistent when bobbleheads are added, deleted, or reordered
**Confidence**: Medium

**Files to Modify:**
- `src/lib/services/cache-revalidation.service.ts` - Add navigation cache invalidation

**Changes:**
- Update revalidateBobblehead method to invalidate navigation cache keys
- Add cache invalidation when bobbleheads are created or deleted in collections
- Invalidate adjacent bobbleheads' navigation cache when collection structure changes
- Use cache tag patterns for efficient invalidation
- Consider invalidating by collection ID pattern to clear all navigation for collection

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Navigation cache invalidated on bobblehead creation in collection
- [ ] Navigation cache invalidated on bobblehead deletion from collection
- [ ] Cache invalidation patterns follow existing service patterns
- [ ] No stale navigation data after collection mutations
- [ ] All validation commands pass

---

### Step 11: Add Navigation Action Tests

**What**: Create comprehensive test suite for navigation query and facade methods
**Why**: Testing ensures navigation logic works correctly across permission scenarios and edge cases
**Confidence**: High

**Files to Create:**
- `tests/lib/queries/bobbleheads/bobbleheads-navigation-query.test.ts` - Query layer tests
- `tests/lib/facades/bobbleheads/bobbleheads-navigation-facade.test.ts` - Facade layer tests

**Changes:**
- Test query method with various collection contexts and permission scenarios
- Test boundary conditions (first bobblehead, last bobblehead, single bobblehead)
- Test subcollection filtering logic
- Test facade caching behavior with cache hits and misses
- Test permission filtering for public vs private bobbleheads
- Test error handling and edge cases
- Use Testcontainers for database testing following existing patterns

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**
- [ ] Query tests cover all permission scenarios
- [ ] Facade tests verify caching behavior
- [ ] Boundary condition tests pass
- [ ] Permission filtering tests validate access control
- [ ] All validation commands pass including test suite

---

### Step 12: Add Component Integration Tests

**What**: Create integration tests for navigation component behavior and keyboard interactions
**Why**: Component tests ensure UI behaves correctly with user interactions and state management
**Confidence**: High

**Files to Create:**
- `tests/components/bobblehead-navigation.test.tsx` - Component integration tests

**Changes:**
- Test component rendering with navigation data
- Test disabled states at collection boundaries
- Test keyboard shortcut functionality (ArrowLeft, ArrowRight)
- Test navigation URL generation with proper query parameters
- Test loading states during transitions
- Use Testing Library for component testing following existing patterns
- Mock Nuqs useQueryStates hook for controlled testing

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**
- [ ] Component renders correctly with navigation data
- [ ] Disabled states work at boundaries
- [ ] Keyboard shortcuts trigger navigation
- [ ] URL parameters correctly included in navigation links
- [ ] All validation commands pass including test suite

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] All test suites pass with `npm run test`
- [ ] Navigation respects permission boundaries (public vs private bobbleheads)
- [ ] Cache invalidation works correctly when collection structure changes
- [ ] Keyboard navigation works without accessibility issues
- [ ] Loading states appear during navigation transitions
- [ ] No console errors or warnings in browser console
- [ ] Navigation context properly preserved through URL parameters

## Notes

### Architecture Considerations

- This implementation follows the established three-layer architecture (Query → Facade → Component)
- Server/client separation maintains data fetching in server components with interactivity in client components
- Type-safe routing with route-type.ts and $path ensures URL parameter safety
- Redis caching reduces database load for navigation queries with 30-minute TTL

### Performance Considerations

- Navigation queries should use covering indexes on bobbleheads table (already exist: bobbleheads_collection_public_idx, bobbleheads_collection_covering_idx)
- Caching with 30-minute TTL balances freshness with performance
- Adjacent bobblehead queries are limited to single previous and next records
- Keyboard shortcuts use passive event listeners for performance

### Edge Cases to Consider

- First bobblehead in collection (previousBobblehead null)
- Last bobblehead in collection (nextBobblehead null)
- Single bobblehead in collection (both null)
- Navigation between subcollections (context switching)
- Permission changes between navigation steps (handled by permission filtering)
- Collection deleted while viewing bobblehead (handled by notFound)

### Security Considerations

- All navigation queries apply permission filtering through QueryContext
- Server-side validation ensures users cannot navigate to inaccessible bobbleheads
- URL parameters validated through Zod schemas in route-type.ts
- No client-side permission bypass possible due to server-side enforcement

### Future Enhancements

- Support for custom sort orders beyond createdAt DESC
- Navigation persistence across browser back/forward
- Prefetching adjacent bobbleheads for instant navigation
- Navigation position indicator (e.g., "3 of 15")
- Touch gesture support for mobile navigation

---

## Orchestration Logs

Complete orchestration logs available at:
- `docs/2025_11_21/orchestration/bobblehead-collection-navigation/00-orchestration-index.md`
- `docs/2025_11_21/orchestration/bobblehead-collection-navigation/01-feature-refinement.md`
- `docs/2025_11_21/orchestration/bobblehead-collection-navigation/02-file-discovery.md`
- `docs/2025_11_21/orchestration/bobblehead-collection-navigation/03-implementation-planning.md`
