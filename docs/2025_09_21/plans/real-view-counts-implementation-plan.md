# Real View Counts Implementation Plan

Generated: 2025-09-21T${new Date().toISOString().split('T')[1]}
Original Request: The bobblehead page needs to display the real view count for the bobblehead. Same for the collection and subcollection pages view counts.

## Analysis Summary

- Feature request refined with project context
- Discovered 23 files across 4 priority levels for implementation
- Generated 6-step implementation plan leveraging existing view tracking infrastructure

## File Discovery Results

### Critical Priority Files (5)
- `src/lib/facades/analytics/view-tracking.facade.ts` - Main business logic facade with getViewCountAsync method
- `src/lib/queries/analytics/view-tracking.query.ts` - Database query layer for real-time view counts
- `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-metrics.tsx` - Currently displays cached view count
- `src/app/(app)/collections/[collectionId]/(collection)/components/collection-stats.tsx` - Needs view count display added
- `src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-metrics.tsx` - Needs view count display added

### High Priority Files (5)
- Redis caching service and async component wrappers
- Database schema and TanStack Query infrastructure

## Implementation Plan

## Overview

**Estimated Duration**: 2 days
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

Update bobblehead, collection, and subcollection metrics components to display real-time view counts from the ViewTrackingFacade instead of cached database values. The implementation will integrate with the existing comprehensive view tracking system using Redis caching and background job aggregation.

## Prerequisites

- [ ] ViewTrackingFacade.getViewCountAsync() method is functional
- [ ] Redis caching service is operational
- [ ] Content view target types are properly defined in enums

## Implementation Steps

### Step 1: Create View Count Async Wrapper Components

**What**: Create reusable async wrapper components to fetch real-time view counts
**Why**: Separation of concerns and reusability across different content types
**Confidence**: High

**Files to Create:**

- `src/components/analytics/async/view-count-async.tsx` - Generic async wrapper for fetching view counts

**Changes:**

- Add ViewCountAsync component that accepts targetType, targetId, and optional currentUserId
- Use ViewTrackingFacade.getViewCountAsync() to fetch real-time count
- Include error boundary and fallback for failed view count fetches
- Add proper TypeScript types for props

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component successfully fetches view counts from ViewTrackingFacade
- [ ] Proper error handling for failed requests
- [ ] All validation commands pass

---

### Step 2: Update BobbleheadMetrics to Use Real View Count

**What**: Replace cached bobblehead.viewCount with real-time view count from ViewTrackingFacade
**Why**: Provide accurate, up-to-date view metrics instead of potentially stale database values
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-metrics.tsx` - Replace viewCount display with async wrapper
- `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/async/bobblehead-metrics-async.tsx` - Pass bobbleheadId to metrics component

**Changes:**

- Add ViewCountAsync component import to bobblehead-metrics.tsx
- Replace `{bobblehead.viewCount} views` with ViewCountAsync component
- Pass bobbleheadId and 'bobblehead' as targetType to ViewCountAsync
- Update BobbleheadMetricsAsyncProps to include bobbleheadId prop
- Pass bobbleheadId from async wrapper to metrics component

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Bobblehead page displays real-time view count
- [ ] View count updates reflect actual analytics data
- [ ] All validation commands pass

---

### Step 3: Update CollectionStats to Include Real View Count

**What**: Add view count display to collection stats using real-time data from ViewTrackingFacade
**Why**: Collections currently lack view count display and should show analytics data like bobbleheads
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/collections/[collectionId]/(collection)/components/collection-stats.tsx` - Add view count row to stats list
- `src/app/(app)/collections/[collectionId]/(collection)/components/async/collection-stats-async.tsx` - Pass collectionId to stats component

**Changes:**

- Add EyeIcon import to collection-stats.tsx for view count icon
- Add new list item with ViewCountAsync component for collection views
- Import ViewCountAsync component
- Update CollectionStatsAsyncProps to include collectionId prop
- Pass collectionId from async wrapper to stats component
- Use 'collection' as targetType for ViewCountAsync

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Collection page displays real-time view count in stats section
- [ ] View count appears as new row in collection stats list
- [ ] All validation commands pass

---

### Step 4: Update SubcollectionMetrics to Include Real View Count

**What**: Add view count card to subcollection metrics using real-time data from ViewTrackingFacade
**Why**: Subcollections should display view analytics data consistent with other content types
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-metrics.tsx` - Add view count card to metrics grid
- `src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/async/subcollection-metrics-async.tsx` - Pass subcollectionId to metrics component

**Changes:**

- Add ViewCountAsync component import to subcollection-metrics.tsx
- Add new Card component for view count with EyeIcon
- Use ViewCountAsync with 'subcollection' targetType and subcollectionId
- Update SubcollectionMetricsAsyncProps to include subcollectionId prop
- Pass subcollectionId from async wrapper to metrics component
- Position view count card appropriately in metrics grid

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Subcollection page displays real-time view count in metrics section
- [ ] View count appears as dedicated card in subcollection metrics grid
- [ ] All validation commands pass

---

### Step 5: Add Error Handling and Loading States

**What**: Implement proper loading states and error boundaries for view count components
**Why**: Provide smooth user experience when view count data is loading or fails to load
**Confidence**: Medium

**Files to Modify:**

- `src/components/analytics/async/view-count-async.tsx` - Add Suspense fallback and error handling

**Changes:**

- Add loading skeleton component for view count display
- Implement error boundary with fallback to show "-- views" on failure
- Add try-catch around ViewTrackingFacade.getViewCountAsync() call
- Provide graceful degradation when analytics service is unavailable
- Add proper logging for view count fetch failures

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Smooth loading experience with skeleton states
- [ ] Graceful error handling when view count fetch fails
- [ ] All validation commands pass

---

### Step 6: Add TypeScript Types and Validation

**What**: Ensure all new components have proper TypeScript types and validation
**Why**: Maintain type safety and code quality standards throughout the application
**Confidence**: High

**Files to Modify:**

- `src/components/analytics/async/view-count-async.tsx` - Add comprehensive TypeScript interfaces

**Changes:**

- Add ViewCountAsyncProps interface with proper types
- Add ContentViewTargetType import from constants
- Ensure proper typing for targetId (string) and targetType (ContentViewTargetType)
- Add JSDoc comments for component props and purpose
- Validate all prop types match expected ViewTrackingFacade method signatures

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All components have proper TypeScript interfaces
- [ ] No type errors in validation commands
- [ ] All validation commands pass

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Real-time view counts display correctly on all three content types
- [ ] Error handling works gracefully when analytics service is unavailable
- [ ] Loading states provide smooth user experience

## Notes

The existing ViewTrackingFacade already provides comprehensive caching and error handling through Redis and the CacheService. The implementation leverages this existing infrastructure rather than building new caching layers. The target types ('bobblehead', 'collection', 'subcollection') are already defined in the ENUMS.CONTENT_VIEWS.TARGET_TYPE constant, ensuring consistency with the existing view tracking system.