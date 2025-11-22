# Implementation Plan: Collection Context Breadcrumb for Bobblehead Header

**Generated**: 2025-11-22
**Original Request**: "as a user I would like better display of collection / subcollection information / links in the bobblehead details page header sections"

**Refined Request**: As a user, I would like the bobblehead details page header section to provide clearer and more prominent display of collection and subcollection information with direct navigation links, enabling me to quickly understand the organizational context of the bobblehead I'm viewing and navigate between related items in the collection hierarchy.

## Overview

**Estimated Duration**: 3-4 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

This plan enhances the bobblehead details page header to display collection and subcollection information more prominently through breadcrumb-style navigation links. The implementation adds a new `CollectionBreadcrumb` component that integrates into the existing header, providing clear hierarchical context (Collection > Subcollection > Bobblehead) with direct navigation links, while maintaining compatibility with both URL-context-driven navigation and fallback display using the bobblehead's stored collection relationships.

## Prerequisites

- [ ] Verify `BobbleheadWithRelations` type includes `collectionName`, `collectionSlug`, `subcollectionName`, `subcollectionSlug` (confirmed)
- [ ] Confirm `$path` from `next-typesafe-url` is available for routing
- [ ] Review existing breadcrumb pattern in `bobblehead-sticky-header.tsx` for consistency

## Implementation Steps

### Step 1: Create CollectionBreadcrumb Component

**What**: Create a new reusable component that displays collection hierarchy as navigable breadcrumbs
**Why**: Provides a dedicated, focused component for displaying collection context with proper responsive behavior and accessibility
**Confidence**: High

**Files to Create:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/collection-breadcrumb.tsx` - New breadcrumb navigation component for collection hierarchy

**Files to Modify:**

- None

**Changes:**

- Create `CollectionBreadcrumb` component as a client component (needs interactivity for tooltips)
- Accept props for `collectionName`, `collectionSlug`, `subcollectionName`, `subcollectionSlug`
- Implement responsive design: full breadcrumb on larger screens, truncated/abbreviated on mobile
- Use `$path` for generating typesafe routes to collection and subcollection pages
- Include tooltips for truncated names using existing `Tooltip` component pattern
- Add proper ARIA labels and accessibility attributes
- Generate test IDs using `generateTestId` with `'feature'` namespace and `'breadcrumb'` component

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component renders collection name as a link when `collectionSlug` is provided
- [ ] Component renders subcollection name as a link when both `collectionSlug` and `subcollectionSlug` are provided
- [ ] Truncation with tooltip works for names longer than 25 characters
- [ ] Responsive behavior hides detailed breadcrumbs on mobile
- [ ] All validation commands pass

---

### Step 2: Update BobbleheadHeader to Include Collection Breadcrumb

**What**: Integrate the new `CollectionBreadcrumb` component into the main header between the title and the action buttons row
**Why**: Places collection context prominently in the header section where users naturally look for organizational information
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-header.tsx` - Add breadcrumb display between navigation row and title

**Changes:**

- Import the new `CollectionBreadcrumb` component
- Add breadcrumb display below the navigation/actions row and above the title
- Position breadcrumb with appropriate spacing using Tailwind classes
- Conditionally render breadcrumb only when `collectionSlug` is available
- Maintain existing back button functionality (which navigates to subcollection if present, otherwise collection)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Breadcrumb appears in header when bobblehead has collection information
- [ ] Breadcrumb shows full hierarchy: Collection / Subcollection
- [ ] Back button continues to work correctly (navigates to immediate parent)
- [ ] Visual hierarchy is clear with appropriate spacing and typography
- [ ] All validation commands pass

---

### Step 3: Update BobbleheadHeaderSkeleton for Breadcrumb Loading State

**What**: Add skeleton placeholder for the new breadcrumb section in the loading state
**Why**: Ensures consistent loading experience and prevents layout shift when header loads
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-header-skeleton.tsx` - Add skeleton for breadcrumb area

**Changes:**

- Add `Skeleton` component between navigation row and title matching breadcrumb dimensions
- Use appropriate width for breadcrumb skeleton (approximately `w-48` to `w-64`)
- Match vertical spacing with actual breadcrumb component

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Skeleton includes placeholder for breadcrumb area
- [ ] Layout matches actual loaded component dimensions
- [ ] No layout shift when content loads
- [ ] All validation commands pass

---

### Step 4: Add Component Test ID Type for Breadcrumb

**What**: Register the new breadcrumb component test ID in the type system
**Why**: Ensures type safety for test ID generation and maintains consistency with project patterns
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/lib/test-ids/generator.ts` - Add 'collection-breadcrumb' to valid components list if not already present

**Changes:**

- Add `'collection-breadcrumb'` to the `validComponents` array in `isValidComponentTestId` function
- The `'breadcrumb'` component ID already exists, so use that or add specific `'collection-breadcrumb'` variant

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Test ID generation works without type errors
- [ ] Component test IDs follow project naming convention
- [ ] All validation commands pass

---

### Step 5: Enhance Mobile Responsiveness for Breadcrumb Display

**What**: Add mobile-specific styles and abbreviated display for collection breadcrumb
**Why**: The current navigation section hides context on mobile; the header breadcrumb should provide context on all screen sizes
**Confidence**: Medium

**Files to Create:**

- None

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/collection-breadcrumb.tsx` - Add responsive styling

**Changes:**

- Use responsive Tailwind classes to adjust breadcrumb display on mobile
- Show abbreviated version on small screens (e.g., just collection name without "Collection:" prefix)
- Ensure touch targets meet accessibility guidelines (minimum 44x44px)
- Hide separator and subcollection on very small screens, show tooltip with full path

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Breadcrumb displays appropriately on mobile devices (320px+)
- [ ] Touch targets meet accessibility requirements
- [ ] Full context available via tooltip on mobile
- [ ] All validation commands pass

---

### Step 6: Verify Integration with Sticky Header

**What**: Ensure the new header breadcrumb complements the existing sticky header breadcrumb without duplication
**Why**: The sticky header already has a breadcrumb pattern; need to ensure visual consistency and avoid redundant information
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- None (review only, potentially minor adjustments to `bobblehead-sticky-header.tsx` if needed)

**Changes:**

- Review visual consistency between header breadcrumb and sticky header breadcrumb
- Ensure typography, colors, and hover states match existing patterns
- Verify no redundant/conflicting navigation elements
- Match the Link styling pattern from `bobblehead-sticky-header.tsx`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Header breadcrumb matches sticky header visual style
- [ ] Both breadcrumbs use consistent navigation patterns
- [ ] No duplicate or conflicting visual elements
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Production build completes successfully with `npm run build`
- [ ] New component follows existing patterns from `bobblehead-sticky-header.tsx`
- [ ] Component uses `$path` for all internal navigation
- [ ] All links have appropriate accessibility attributes (aria-labels)
- [ ] Test IDs follow project conventions

## Notes

1. **Existing Pattern Reference**: The `bobblehead-sticky-header.tsx` file contains an excellent breadcrumb implementation that should be used as the primary reference for styling and structure.

2. **Data Availability**: The `BobbleheadWithRelations` type already includes all necessary fields (`collectionName`, `collectionSlug`, `subcollectionName`, `subcollectionSlug`), so no database or query changes are required.

3. **URL Context vs Stored Relations**: The feature should primarily display the bobblehead's stored collection relationships (from `BobbleheadWithRelations`), not the URL query parameters (`collectionId`, `subcollectionId`). This ensures collection context is always shown, even when users navigate directly to a bobblehead URL.

4. **Back Button Behavior**: The existing back button navigates to the subcollection if present, otherwise to the collection. The new breadcrumb should complement this by showing the full hierarchy, allowing users to navigate to either the collection or subcollection directly.

5. **Mobile Considerations**: The current `BobbleheadNavigation` component hides context on mobile (`hidden sm:block`). The header breadcrumb should provide collection context on all screen sizes, though it may need to be abbreviated on smaller screens.

6. **Truncation Pattern**: Follow the existing pattern from `CollectionContextIndicator` which uses `maxLength=25` for truncation with tooltip display.

---

## Orchestration Reference

Orchestration logs: `docs/2025_11_22/orchestration/bobblehead-details-collection-display/`

- `00-orchestration-index.md` - Workflow overview
- `01-feature-refinement.md` - Step 1 log
- `02-file-discovery.md` - Step 2 log
- `03-implementation-planning.md` - Step 3 log
