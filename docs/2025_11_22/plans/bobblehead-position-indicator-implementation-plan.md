# Implementation Plan: Bobblehead Collection Navigation Position Indicator

Generated: 2025-11-22
Original Request: Add a position indicator to bobblehead collection navigation showing "X of Y" (e.g., "3 of 6") between the previous/next buttons so users know their current location within the collection/subcollection
Refined Request: Add a position indicator to the bobblehead collection navigation component that displays the current position within the collection or subcollection using an "X of Y" format (e.g., "3 of 6") positioned centrally between the Previous and Next navigation buttons. The indicator should be calculated by counting the total number of bobbleheads in the filtered collection/subcollection context and determining the current bobblehead's ordinal position based on the createdAt timestamp ordering used by the getAdjacentBobbleheadsInCollectionAsync query.

## Analysis Summary

- Feature request refined with project context
- Discovered 12 files across 7 directories
- Generated 7-step implementation plan

## File Discovery Results

### Critical Priority (Must Modify)

1. `src/lib/types/bobblehead-navigation.types.ts` - Add currentPosition and totalCount fields
2. `src/lib/validations/bobblehead-navigation.validation.ts` - Add fields to Zod schema
3. `src/lib/queries/bobbleheads/bobbleheads-query.ts` - Add position counting query method
4. `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Update getBobbleheadNavigationData
5. `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx` - Add position indicator UI

### High Priority (Verify/Modify)

6. `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx` - Verify props
7. `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-navigation-skeleton.tsx` - Add position skeleton

## Overview

**Estimated Duration**: 3-4 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

This implementation adds an "X of Y" position indicator to the bobblehead collection navigation component. The feature requires extending the type definitions and validation schemas to include `currentPosition` and `totalCount` fields, adding a new query method to count bobbleheads in a collection/subcollection context, updating the facade layer to fetch this data alongside existing navigation data, and modifying the UI component to render the position indicator centrally between the Previous and Next navigation buttons.

## Prerequisites

- [ ] Verify development server can start successfully with `npm run dev`
- [ ] Confirm existing navigation functionality works (previous/next buttons)
- [ ] Understand the createdAt DESC ordering used for navigation (previous = newer, next = older)

## Implementation Steps

### Step 1: Extend Type Definitions

**What**: Add `currentPosition` and `totalCount` fields to the `BobbleheadNavigationData` type
**Why**: These fields are required to calculate and display the "X of Y" position indicator
**Confidence**: High

**Files to Modify:**

- `src/lib/types/bobblehead-navigation.types.ts` - Add new fields to BobbleheadNavigationData type

**Changes:**

- Add `currentPosition: number` field to `BobbleheadNavigationData` type (1-indexed ordinal position)
- Add `totalCount: number` field to `BobbleheadNavigationData` type (total bobbleheads in filtered context)
- Add JSDoc comments explaining the fields and their relationship to createdAt ordering

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] TypeScript type `BobbleheadNavigationData` includes `currentPosition` and `totalCount` fields
- [ ] JSDoc comments clearly document the fields' purpose
- [ ] All validation commands pass

---

### Step 2: Update Validation Schemas

**What**: Add the new fields to the Zod validation schema to match the updated types
**Why**: Maintains consistency between TypeScript types and runtime validation schemas
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/bobblehead-navigation.validation.ts` - Add fields to bobbleheadNavigationDataSchema

**Changes:**

- Add `currentPosition` field to `bobbleheadNavigationDataSchema` using `z.number().int().positive()`
- Add `totalCount` field to `bobbleheadNavigationDataSchema` using `z.number().int().nonnegative()`
- Ensure schema validation messages are consistent with existing patterns

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Zod schema includes `currentPosition` and `totalCount` fields with appropriate validators
- [ ] Schema type inference matches the TypeScript type definitions from Step 1
- [ ] All validation commands pass

---

### Step 3: Add Position Counting Query Method

**What**: Add a new query method to count bobbleheads and determine position within collection context
**Why**: Provides the data needed to calculate the position indicator efficiently at the database level
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/bobbleheads/bobbleheads-query.ts` - Add getBobbleheadPositionInCollectionAsync method

**Changes:**

- Add new static method `getBobbleheadPositionInCollectionAsync` to `BobbleheadsQuery` class
- Method should accept: bobbleheadId, collectionId, subcollectionId (nullable), and context
- Return type should be `{ currentPosition: number; totalCount: number }` or null if bobblehead not found
- Query total count using COUNT(\*) with same collection/subcollection filtering as navigation
- Calculate position by counting bobbleheads with createdAt >= current bobblehead's createdAt (using same ordering logic as navigation)
- Apply same permission filtering using `buildBaseFilters` as existing methods
- Include JSDoc documentation explaining the position calculation logic

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New method `getBobbleheadPositionInCollectionAsync` exists in `BobbleheadsQuery`
- [ ] Method returns correct position based on createdAt DESC ordering (position 1 = newest)
- [ ] Method respects subcollection filtering when subcollectionId is provided
- [ ] Method applies standard permission filtering (isPublic, userId, isDeleted)
- [ ] All validation commands pass

---

### Step 4: Update Facade Method

**What**: Modify `getBobbleheadNavigationData` to include position data in the response
**Why**: Orchestrates the query layer to provide complete navigation data including position
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Update getBobbleheadNavigationData method

**Changes:**

- Call the new `getBobbleheadPositionInCollectionAsync` query method alongside existing `getAdjacentBobbleheadsInCollectionAsync`
- Execute both queries in parallel using Promise.all for optimal performance
- Include `currentPosition` and `totalCount` in the returned schema object
- Handle edge case where position query returns null (default to position 0 and count 0)
- Maintain existing caching strategy (MEDIUM TTL, collection-based cache tags)
- Update Sentry breadcrumb data to include position information

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] `getBobbleheadNavigationData` returns `currentPosition` and `totalCount` fields
- [ ] Both queries execute in parallel for optimal performance
- [ ] Existing caching behavior is preserved (TTL.MEDIUM = 1800 seconds)
- [ ] Sentry breadcrumb includes position data
- [ ] All validation commands pass

---

### Step 5: Update Navigation Component UI

**What**: Add the position indicator display between Previous and Next navigation buttons
**Why**: Provides visual feedback to users showing their current position within the collection
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx` - Add position indicator rendering

**Changes:**

- Update the component to receive `currentPosition` and `totalCount` from `navigationData`
- Add a centered position indicator element between Previous and Next buttons with text "X of Y"
- Apply styling: `text-sm`, neutral color (e.g., `text-muted-foreground`), centered flex alignment
- Ensure indicator is visible on both desktop and mobile viewports
- Add appropriate `data-testid` for the position indicator using `generateTestId`
- Add `data-slot` attribute consistent with existing component patterns
- Add ARIA attributes for accessibility (aria-label describing position)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Position indicator displays "X of Y" format (e.g., "3 of 6")
- [ ] Indicator is centered between Previous and Next buttons
- [ ] Styling uses `text-sm` and neutral color (`text-muted-foreground`)
- [ ] Indicator is visible on both desktop and mobile viewports
- [ ] Test ID and data-slot attributes are properly applied
- [ ] All validation commands pass

---

### Step 6: Verify Async Component Props

**What**: Confirm the async component correctly passes the navigation data including new fields
**Why**: Ensures the data flow from server to client component is complete
**Confidence**: High

**Files to Verify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx` - Verify prop passing

**Changes:**

- Verify that `navigationData` returned from `BobbleheadsFacade.getBobbleheadNavigationData` is passed to `BobbleheadNavigation` component
- No changes expected if facade return type is correctly updated (TypeScript will enforce correct typing)
- Confirm existing null check logic still works with new fields

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Async component compiles without type errors
- [ ] Navigation data with new fields flows correctly to client component
- [ ] All validation commands pass

---

### Step 7: Update Navigation Skeleton

**What**: Add position indicator skeleton to the loading state
**Why**: Provides consistent loading UX with the final rendered component
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-navigation-skeleton.tsx` - Add position skeleton element

**Changes:**

- Add a centered Skeleton element between the Previous and Next button skeletons
- Match the approximate dimensions of the position indicator text (small width, h-4 or h-5)
- Add appropriate `testId` prop using `generateTestId`
- Maintain consistent styling with existing skeleton layout

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Skeleton includes centered position indicator placeholder
- [ ] Skeleton dimensions match expected position text size
- [ ] Test ID is properly applied
- [ ] Layout matches the final rendered component structure
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Development server starts without errors (`npm run dev`)
- [ ] Position indicator displays correctly when navigating with collection context
- [ ] Position updates correctly when navigating to previous/next bobbleheads
- [ ] Position shows "1 of X" for newest bobblehead in collection
- [ ] Position shows "X of X" for oldest bobblehead in collection
- [ ] Position respects subcollection filtering when subcollectionId query param is present
- [ ] Skeleton loading state shows position placeholder

## Notes

**Architecture Decisions:**

- Position calculation uses the same createdAt DESC ordering as navigation (position 1 = newest)
- Both queries (adjacent bobbleheads + position) are executed in parallel for performance
- Caching strategy remains unchanged (TTL.MEDIUM = 1800 seconds, collection-based cache tags)
- The position indicator is always shown when navigation is displayed (they share the same data source)

**Edge Cases to Consider:**

- Single bobblehead in collection: Position shows "1 of 1"
- Bobblehead not in collection context (no collectionId): Navigation component returns null (existing behavior)
- Position query failure: Defaults to 0/0 but should log error via Sentry

**Testing Recommendations:**

- Manually test with collections of various sizes (1, 2, 5, 10+ bobbleheads)
- Verify subcollection filtering shows correct subset count
- Test keyboard navigation (arrow keys) updates position correctly
- Verify caching behavior by checking subsequent page loads are faster
