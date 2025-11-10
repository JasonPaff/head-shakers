# Collection Navigation - Implementation Plan

**Generated**: 2025-11-10T${new Date().toISOString()}
**Estimated Duration**: 1-2 days
**Complexity**: High
**Risk Level**: Medium

## Original Request

```
as a user I would like to be able to cycle through the bobbleheads in a collection from an individual bobblehead page in the collection without having to go back to the collection page. If a user goes into the Orioles collection and views the first bobblehead they should be able to go to the next/previous bobblehead in the collection without having to return to the collection page between each one to select the next, there should be left/right or next/previous buttons to allow for collection navigation.
```

## Refined Request

As a user, I want to navigate through bobbleheads within a collection directly from the individual bobblehead detail page without returning to the collection view, enabling seamless browsing of collection items. When viewing a bobblehead within the Orioles collection, I should be able to use next/previous navigation buttons (positioned as left/right arrow icons from Lucide React) to cycle through all bobbleheads in that collection in the order they appear on the collection page. The implementation should maintain the collection context throughout navigation, with the routing structure supporting `/collections/[collectionId]/bobbleheads/[bobbleheadId]` to preserve the collection scope. The navigation state should be managed client-side using React state or URL parameters via Nuqs to track the current bobblehead's position within the collection, while the Server Component should fetch the collection's bobblehead list during initial page load to determine available navigation targets. Next/previous buttons should be disabled or hidden at the collection boundaries (first and last items respectively) and display loading states during transitions between bobbleheads.

## Analysis Summary

- **Feature Request**: Successfully refined with project-specific technical context (3.1x expansion)
- **Files Discovered**: 17 files across 6 architectural layers
- **Files to Modify**: 5 critical files
- **Files to Create**: 1 new component
- **Reference Files**: 11 supporting files
- **Architecture Patterns**: Data Flow (Page → Async → Facade → Query → DB), Server Component separation, Permission contexts

## File Discovery Results

### Critical Files to Modify

1. **src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/page.tsx** - Main bobblehead detail page entry point
2. **src/lib/queries/collections/collections.query.ts** - Database queries for fetching bobbleheads in collections
3. **src/lib/facades/collections/collections.facade.ts** - Business logic layer for collection operations
4. **src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-header.tsx** - Header component needing navigation buttons
5. **src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/async/bobblehead-header-async.tsx** - Async wrapper for data fetching

### New Files to Create

1. **src/components/feature/bobblehead/bobblehead-navigation.tsx** - Navigation component for next/previous controls

### Architecture Insights

**Key Patterns**:
- Data Flow: Page → Async Wrapper → Facade → Query → Database
- Server Components with async/sync component separation
- Permission Context: All queries respect privacy settings with query contexts
- Collection-Bobblehead Relationship: Bobbleheads have collectionId and optional subcollectionId
- Ordering and Sorting: Collections support multiple sort options (newest, oldest, name_asc, name_desc)

**Integration Points**:
1. Query Enhancement: `collections.query.ts` - Add method to fetch neighbor bobbleheads
2. Facade Enhancement: `collections.facade.ts` - Wrap query with permission/error handling
3. Component Enhancement: `bobblehead-header.tsx` - Add next/prev buttons
4. Async Data: `bobblehead-header-async.tsx` - Fetch neighbor IDs in parallel

**Challenges Identified**:
1. Sort order complexity - navigation must respect current collection sort
2. Subcollection vs collection navigation - determine user context
3. Permission checking - neighbors must respect same visibility rules
4. Performance - fetching full lists vs optimized neighbor queries

---

## Overview

**Estimated Duration**: 1-2 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

This feature enables seamless navigation through bobbleheads within a collection directly from the individual bobblehead detail page. Users can click next/previous arrow buttons to cycle through bobbleheads in the order they appear on the collection view, maintaining collection context throughout navigation without returning to the collection view. The implementation leverages the existing `/collections/[collectionId]` routing structure, extends it with `/bobbleheads/[bobbleheadId]` route context, uses Nuqs for client-side URL state management, and fetches the sorted collection bobblehead list server-side during initial page load.

## Prerequisites

- [ ] Node.js and npm installed with project dependencies available
- [ ] Understanding of Nuqs library for URL state management (client-side)
- [ ] Familiarity with the existing Server Component/Server Action architecture
- [ ] Lucide React icons available (ChevronLeftIcon, ChevronRightIcon already in use)
- [ ] Database query context patterns (public/user/protected contexts)
- [ ] TypeScript strict mode and Zod validation patterns in the codebase

## Implementation Steps

### Step 1: Create New Query Method for Sequential Bobblehead Navigation

**What**: Add a new query method to fetch sorted bobblehead IDs and positions within a collection for efficient navigation state management.

**Why**: The existing `getBobbleheadsInCollectionAsync` returns full records. We need a lightweight method that returns only IDs in sort order, plus additional context about a target bobblehead's position, to avoid fetching unnecessary data for navigation.

**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\collections\collections.query.ts` - Add new query method

**Changes:**
- Add new static method `getBobbleheadNavigationContextAsync` that accepts `collectionId`, `currentBobbleheadId`, and `context`
- Return type should include: `{ previousBobbleheadId: string | null, nextBobbleheadId: string | null, currentIndex: number, totalCount: number }`
- Query should respect permission filters (isPublic, userId, isDeleted checks) matching existing patterns
- Include support for both collection-level and subcollection-level bobbleheads (via optional `subcollectionId` parameter)
- Use same sort order as display layer (`createdAt` descending for 'newest', ascending for 'oldest', etc.)

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Method compiles without TypeScript errors
- [ ] Method respects existing permission model (public/user/protected contexts)
- [ ] Returns accurate previous/next/current index data for various collection states
- [ ] Handles edge cases: single bobblehead, first item, last item, not-found scenarios
- [ ] Passes lint and typecheck validation

---

### Step 2: Create Facade Method for Navigation Data

**What**: Add a facade method that wraps the query method with caching and error handling following existing patterns.

**Why**: The facade layer provides caching, error context, and Sentry tracking consistent with the application architecture. This ensures navigation data benefits from cache efficiency and proper error reporting.

**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\facades\collections\collections.facade.ts` - Add new facade method

**Changes:**
- Add static method `getBobbleheadNavigationContext` that accepts `collectionId`, `currentBobbleheadId`, `viewerUserId`, and optional `dbInstance`
- Use `CacheService.bobbleheads.byCollection` for caching (reuse existing cache key pattern)
- Call the new query method from Step 1 with appropriate context
- Wrap with try-catch and `createFacadeError` for error handling
- Include Sentry breadcrumbs for tracking navigation patterns

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Method implements proper error handling with FacadeErrorContext
- [ ] Uses existing caching patterns from other facade methods
- [ ] Type signatures are properly exported for use in async components
- [ ] Includes Sentry instrumentation (optional, for monitoring)
- [ ] Passes lint and typecheck validation

---

### Step 3: Create New Bobblehead Navigation Component

**What**: Create a new client-side component that displays prev/next navigation buttons with loading states, positioned at the top of the bobblehead detail page.

**Why**: This component encapsulates the UI logic for navigation, button states (enabled/disabled at boundaries), loading transitions, and keyboard accessibility.

**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\bobblehead\bobblehead-navigation.tsx` - Navigation UI component

**Changes:**
- Create component that accepts: `previousBobbleheadId`, `nextBobbleheadId`, `isLoading`, `collectionId`
- Include optional `subcollectionId` for subcollection navigation
- Use Lucide React ChevronLeftIcon and ChevronRightIcon (or ArrowLeftIcon/ArrowRightIcon if preferred for consistency with existing back button)
- Implement button disable logic: disable previous button if `previousBobbleheadId` is null, disable next button if `nextBobbleheadId` is null
- Add loading spinner/skeleton state during navigation transitions
- Use Next.js Link component with `$path` for type-safe routing
- Implement keyboard navigation (arrow keys) for accessibility
- Add ARIA labels and semantic HTML
- Use existing Button and Conditional components from codebase
- Style to match existing bobblehead detail page aesthetic

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component renders without TypeScript errors
- [ ] Navigation buttons show correct prev/next URLs via type-safe routing
- [ ] Buttons disable appropriately at collection boundaries
- [ ] Loading state displays during transitions
- [ ] Keyboard navigation implemented (arrow keys)
- [ ] Accessibility attributes (aria-labels, disabled state) present
- [ ] Passes lint and typecheck validation

---

### Step 4: Create Async Wrapper Component for Navigation Data

**What**: Create an async server component that fetches navigation context data and passes it to the client component.

**Why**: Follows the existing async/sync component separation pattern in the codebase. Server component handles data fetching and permissions; client component handles interactivity.

**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\async\bobblehead-navigation-async.tsx` - Async server component wrapper

**Changes:**
- Create async component that accepts `bobbleheadId` and optional `collectionId` and `subcollectionId` parameters
- Call `CollectionsFacade.getBobbleheadNavigationContext` to fetch navigation data
- Handle loading/error states gracefully (error boundary will handle critical failures)
- Extract previous/next IDs and pass to client component
- Include optional tracking of navigation usage (via Sentry or analytics if desired)

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Async component properly fetches navigation data from facade
- [ ] Gracefully handles missing or null navigation data
- [ ] Returns client component with populated navigation props
- [ ] Marked with 'use server' or implicit server component markers
- [ ] Passes lint and typecheck validation

---

### Step 5: Modify Bobblehead Header Component to Integrate Navigation

**What**: Update the `BobbleheadHeader` component to include navigation controls alongside existing header content.

**Why**: The header is the logical place for navigation controls, positioned consistently with other page-level actions like back button, share, edit, and delete.

**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\bobblehead-header.tsx` - Sync client component

**Changes:**
- Add new props: `previousBobbleheadId`, `nextBobbleheadId`, `collectionId` (optional `subcollectionId`)
- Integrate `<BobbleheadNavigation />` component into the header action buttons area
- Position navigation buttons logically: either left side (near back button) or right side with action buttons
- Ensure responsive layout works on mobile/tablet (consider collapsing to icon-only on small screens)
- Maintain visual alignment with existing buttons (Share, Edit, Delete, Report)

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component accepts new navigation props without breaking existing functionality
- [ ] Navigation buttons render and are accessible
- [ ] Layout remains responsive across breakpoints
- [ ] No visual regression in header appearance
- [ ] Existing buttons (Share, Edit, Delete, Report) remain functional
- [ ] Passes lint and typecheck validation

---

### Step 6: Update Bobblehead Header Async Component to Fetch Navigation Context

**What**: Modify the `BobbleheadHeaderAsync` server component to fetch navigation data alongside existing data and pass it to the sync header component.

**Why**: The async wrapper is responsible for all data fetching. It should also fetch navigation context and ensure the sync component receives all required props.

**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\async\bobblehead-header-async.tsx` - Async server component

**Changes:**
- Add `collectionId` to the component's accepted props (may need to pass from page component)
- Fetch navigation context using facade method alongside existing bobblehead/likeData fetches
- Handle cases where bobblehead has no collectionId (navigation not available)
- Support both collection-level and subcollection-level navigation
- Pass `previousBobbleheadId`, `nextBobbleheadId`, and collection context to sync BobbleheadHeader component
- Maintain existing error handling and Suspense patterns

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component fetches navigation data correctly
- [ ] Navigation data passed to sync component without type errors
- [ ] Handles cases where collection context is missing
- [ ] Graceful degradation if navigation fetch fails (still shows header)
- [ ] Parallel data fetching with existing calls for performance
- [ ] Passes lint and typecheck validation

---

### Step 7: Update Bobblehead Detail Page to Support Collection Context

**What**: Ensure the main bobblehead detail page passes collection information to header components for navigation context.

**Why**: The page component already has access to the bobblehead's collectionId from initial data fetch. This needs to be threaded through to the async header component to enable navigation context fetching.

**Confidence**: Medium

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\page.tsx` - Main page component

**Changes:**
- Verify that basic bobblehead fetch includes `collectionId` and `subcollectionId` fields
- Pass `collectionId` and `subcollectionId` (if available) to `BobbleheadHeaderAsync` component as props
- Consider whether these values should be added to URL parameters for bookmarking/sharing (optional enhancement)
- Update Suspense fallback if needed

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Collection context properly passed from page to async header component
- [ ] No TypeScript errors in prop passing
- [ ] Existing page functionality unchanged
- [ ] Bobblehead detail page still loads correctly
- [ ] Passes lint and typecheck validation

---

### Step 8: Add URL State Management (Optional Client-Side Enhancement)

**What**: Optionally implement Nuqs-based URL state to reflect navigation position in the URL for bookmarking and sharing.

**Why**: This is an enhancement that allows users to share direct links to specific bobbleheads within collection navigation context. It's optional but improves UX.

**Confidence**: Medium

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\route-type.ts` - Route type definition (if implementing query params)
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\bobblehead\bobblehead-navigation.tsx` - Navigation component (optional state management)

**Changes:**
- Optionally add query parameters like `?collection={collectionId}` to the current bobblehead URL for context preservation
- Use Nuqs `parseAsString` and `useQueryState` if implementing client-side state tracking
- Update navigation button href generation to include context query params
- This allows URLs like `/bobbleheads/[id]?collection=[collectionId]` to preserve navigation context

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Optional enhancement, can be skipped without breaking feature
- [ ] If implemented, URLs maintain collection context across navigation
- [ ] Query params properly validated in route-type.ts
- [ ] No performance impact from URL state management
- [ ] Passes lint and typecheck validation

---

### Step 9: Create Error Boundary and Fallback Handling

**What**: Ensure navigation failures gracefully degrade without breaking the bobblehead detail view.

**Why**: Network errors, permission issues, or data inconsistencies could prevent navigation context from loading. The feature should fail gracefully.

**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\async\bobblehead-header-async.tsx` - Error handling in async component

**Changes:**
- Wrap `getBobbleheadNavigationContext` call in try-catch with sensible defaults (all navigation fields null)
- Return sync header component with `previousBobbleheadId={null}` and `nextBobbleheadId={null}` on error
- Log errors to Sentry for monitoring navigation-specific failures
- Ensure Suspense fallback skeleton doesn't break header layout
- Test behavior when: collection is deleted, bobblehead is moved between collections, permissions change

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Navigation errors don't crash the page
- [ ] Header renders with disabled navigation buttons on error
- [ ] Errors logged to Sentry with context
- [ ] User can still view bobblehead details without navigation
- [ ] Passes lint and typecheck validation

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck` without errors
- [ ] All files pass `npm run lint:fix` without warnings (for modified/new files)
- [ ] All new tests pass with `npm run test`
- [ ] Integration tests verify navigation works with existing header/layout components
- [ ] Manual UAT confirms: navigation buttons appear, disable at boundaries, navigate between items correctly
- [ ] Mobile responsive design verified across breakpoints
- [ ] Permission model validated: private collections not navigable by non-owners, public collections accessible
- [ ] Error scenarios tested: missing collection, deleted bobblehead, permission denied
- [ ] Performance acceptable for large collections (tested with 100+ item collection)
- [ ] No console errors or TypeScript suppressions (`ts-ignore`, `eslint-disable`) introduced

## Notes

### Architecture Decisions

1. **Separation of Concerns**: Query and facade methods handle data; components handle UI. This maintains the existing async/sync component pattern.

2. **Caching Strategy**: Navigation data is cached at the collection level using existing cache keys. This leverages the cache invalidation already in place for collection updates.

3. **Permission Model**: Navigation respects existing permission filters. If a user can't access the collection, they can't navigate within it. If a bobblehead is private, navigation skips it.

4. **Subcollection Support**: The query method includes optional `subcollectionId` parameter to support navigation within subcollections as well as collection-level navigation.

5. **URL State (Optional)**: The implementation can optionally include query parameters for bookmarking context, but this is non-critical and can be deferred.

6. **Error Graceful Degradation**: If navigation context fetch fails, the header renders normally but with disabled navigation buttons rather than failing entirely.

### Assumptions Requiring Confirmation

1. **Sort Order Consistency**: The navigation must respect the same sort order as the collection display. Verify that `_getSortOrder` method from `CollectionsQuery` covers all sort options used in UI (`newest`, `oldest`, `name_asc`, `name_desc`).

2. **Collection Display Behavior**: Current codebase shows collection view at `/collections/[collectionId]` with optional filters (search, sort). Navigation context assumes the collection's natural sort order or respects any applied filters from the referrer.

3. **Bobblehead Deletion**: If a bobblehead in the middle of a collection is deleted, the next/previous navigation should account for this. The query should only return IDs of non-deleted bobbleheads.

4. **Multi-Tab Consistency**: If a user opens a collection in one tab, deletes a bobblehead, then uses navigation in another tab, the navigation might reference a deleted item. This is acceptable (will 404) but should be considered in error messaging.

### Risk Mitigation

1. **Database Query Load**: Fetching all bobblehead IDs for a collection could be expensive. Mitigation: cache aggressively, monitor slow queries, consider pagination limits for navigation in very large collections (1000+ items).

2. **Stale Navigation State**: If a bobblehead is deleted or moved while a user has the detail page open, navigation references could become invalid. Mitigation: graceful 404 on invalid navigation, error boundary handling.

3. **Permission Bypass**: Navigation context must respect permission model. Mitigation: use same permission filters as existing queries, test with private/public collections and different user roles.

4. **Performance on Mobile**: Navigation UI should not significantly impact mobile performance. Mitigation: keep components lightweight, use efficient event handling, test on real mobile devices.

### Future Enhancements

1. Keyboard shortcuts documentation (arrow key navigation)
2. Touch swipe gestures on mobile for left/right navigation
3. Progress indicator showing "X of Y" position in collection
4. Analytics on navigation patterns (which collections have high navigation usage)
5. Pre-fetching next bobblehead's images for smooth transitions
6. Reverse navigation (back to collection) via browser history integration

---

**Next Steps**: Review this implementation plan, confirm architecture decisions match project standards, and begin implementation starting with Step 1 (query layer).
