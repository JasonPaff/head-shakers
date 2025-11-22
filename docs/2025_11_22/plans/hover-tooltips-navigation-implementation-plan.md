# Implementation Plan: Bobblehead Navigation Hover Preview Tooltips

Generated: 2025-11-22
Original Request: Add hover tooltips to bobblehead navigation buttons that preview the destination bobblehead name and cover photo before clicking (e.g., "Next: Mike Trout Bobblehead")

## Overview

**Estimated Duration**: 4-6 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

This feature adds hover tooltips to the sequential bobblehead navigation buttons that display a preview of the destination bobblehead's name and cover photo. The implementation leverages the existing HoverCard component (Radix UI), extends the current navigation data to include photo URLs from the database query layer, and creates a new preview card component that displays the adjacent bobblehead's information using CldImage for optimized Cloudinary images.

## Prerequisites

- [ ] Verify HoverCard component works correctly at `src/components/ui/hover-card.tsx`
- [ ] Confirm CldImage from next-cloudinary is available and functioning
- [ ] Ensure extractPublicIdFromCloudinaryUrl utility is accessible

## File Discovery Summary

**Critical Files:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx`
- `src/components/ui/hover-card.tsx`
- `src/lib/types/bobblehead-navigation.types.ts`

**High Priority Files:**

- `src/lib/facades/bobbleheads/bobbleheads.facade.ts`
- `src/lib/queries/bobbleheads/bobbleheads-query.ts`
- `src/lib/validations/bobblehead-navigation.validation.ts`
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx`

## Implementation Steps

### Step 1: Extend Database Query to Include Primary Photo URL

**What**: Modify the `getAdjacentBobbleheadsInCollectionAsync` query to join with `bobbleheadPhotos` and return the primary photo URL for adjacent bobbleheads.

**Why**: The current query only returns bobblehead records without photo data; the hover preview requires the cover image to display.

**Confidence**: High

**Files to Modify:**

- `src/lib/queries/bobbleheads/bobbleheads-query.ts`

**Changes:**

- Modify `getAdjacentBobbleheadsInCollectionAsync` method to perform a LEFT JOIN with `bobbleheadPhotos` table
- Filter joined photos by `isPrimary = true` condition
- Update the return type `AdjacentBobbleheadsResult` to include `photoUrl: string | null` field
- Update both previous and next bobblehead queries to include the photo join

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Query correctly joins bobbleheadPhotos table
- [ ] Primary photo URL is returned for adjacent bobbleheads when available
- [ ] Null is returned for photoUrl when no primary photo exists
- [ ] All validation commands pass

---

### Step 2: Update Facade Layer to Transform Photo URL

**What**: Modify the `getBobbleheadNavigationData` facade method to properly map the photoUrl from the query result to the navigation data schema.

**Why**: The facade currently hardcodes `photoUrl: null`; it needs to pass through the actual photo URL from the query.

**Confidence**: High

**Files to Modify:**

- `src/lib/facades/bobbleheads/bobbleheads.facade.ts`

**Changes:**

- Update the `transformBobblehead` helper function inside `getBobbleheadNavigationData` to accept and return the photoUrl field
- Remove the hardcoded `photoUrl: null` assignment
- Map the photoUrl from the query result to the returned navigation data

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] transformBobblehead function correctly maps photoUrl
- [ ] Navigation data includes actual photo URLs when available
- [ ] Type safety is maintained throughout the transformation
- [ ] All validation commands pass

---

### Step 3: Create Navigation Preview Card Component

**What**: Create a new component that renders the bobblehead preview content for the hover card, displaying the name and cover photo.

**Why**: The preview content needs to be encapsulated in a reusable component that can be used within the HoverCard for both previous and next navigation buttons.

**Confidence**: High

**Files to Create:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation-preview.tsx`

**Changes:**

- Add 'use client' directive at the top of the file
- Import CldImage from next-cloudinary for optimized image rendering
- Import extractPublicIdFromCloudinaryUrl utility for Cloudinary public ID extraction
- Import AdjacentBobblehead type from bobblehead-navigation.types
- Create BobbleheadNavigationPreview component with props for bobblehead data
- Implement conditional rendering for when photoUrl is present vs absent
- Add name display with appropriate text styling
- Apply consistent sizing and styling using Tailwind CSS
- Add generateTestId for test coverage

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component renders bobblehead name correctly
- [ ] Component renders CldImage when photoUrl is provided
- [ ] Component shows placeholder or empty state when no photo exists
- [ ] Component follows project styling conventions
- [ ] All validation commands pass

---

### Step 4: Update Navigation Component to Use HoverCard

**What**: Modify the BobbleheadNavigation component to wrap navigation links with HoverCard components that display the preview on hover.

**Why**: This integrates the hover preview functionality with the existing navigation buttons to provide users with visual feedback before clicking.

**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx`

**Changes:**

- Import HoverCard, HoverCardContent, and HoverCardTrigger from `@/components/ui/hover-card`
- Import the new BobbleheadNavigationPreview component
- Wrap the previous navigation Link with HoverCard, HoverCardTrigger (asChild), and HoverCardContent
- Wrap the next navigation Link with HoverCard, HoverCardTrigger (asChild), and HoverCardContent
- Pass appropriate side prop to HoverCardContent (side="bottom" for consistent positioning)
- Pass the adjacent bobblehead data to BobbleheadNavigationPreview within each HoverCardContent
- Ensure disabled spans (when no adjacent bobblehead exists) do not have HoverCard wrappers
- Add generateTestId for hover card test coverage

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] HoverCard displays on hover of previous navigation button
- [ ] HoverCard displays on hover of next navigation button
- [ ] Preview shows correct bobblehead name and photo
- [ ] HoverCard does not appear for disabled navigation states
- [ ] Keyboard navigation continues to work correctly
- [ ] All validation commands pass

---

### Step 5: Add Accessibility Attributes

**What**: Enhance the hover preview components with appropriate ARIA attributes and accessibility considerations.

**Why**: Ensuring the hover previews are accessible to screen readers and follow WCAG guidelines is essential for inclusive design.

**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation-preview.tsx`
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx`

**Changes:**

- Add aria-describedby attributes to link the navigation buttons with their preview content
- Add appropriate alt text to CldImage in the preview component
- Ensure HoverCardContent has appropriate role attributes
- Add aria-hidden to decorative elements in the preview
- Verify existing aria-label attributes on navigation links are sufficient

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Screen readers can access preview information appropriately
- [ ] Images have descriptive alt text
- [ ] ARIA relationships are correctly established
- [ ] All validation commands pass

---

### Step 6: Manual Testing and Visual Verification

**What**: Perform comprehensive manual testing of the hover preview feature across different scenarios.

**Why**: Visual features require human verification to ensure proper appearance, timing, and user experience.

**Confidence**: High

**Files to Modify:**

- No file modifications required

**Changes:**

- Test hover preview on bobblehead with primary photo
- Test hover preview on bobblehead without photos
- Test hover timing and animation smoothness
- Test on different viewport sizes
- Test keyboard focus behavior
- Verify preview positioning does not overflow viewport

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run build
```

**Success Criteria:**

- [ ] Hover preview appears smoothly on mouse enter
- [ ] Hover preview disappears appropriately on mouse leave
- [ ] Preview displays correctly on all supported browsers
- [ ] Preview positioning is appropriate and does not obstruct content
- [ ] Build completes without errors
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] `npm run build` completes successfully
- [ ] Manual verification of hover preview functionality
- [ ] Verify no console errors or warnings during hover interactions

## Notes

**Architecture Decisions:**

1. **Query Layer Extension (High Confidence)**: Extending the existing query with a LEFT JOIN is the cleanest approach, as it fetches all required data in a single database call without adding network latency.

2. **Component Composition (High Confidence)**: Creating a separate BobbleheadNavigationPreview component maintains separation of concerns and makes the code more maintainable and testable.

3. **HoverCard vs Tooltip (High Confidence)**: HoverCard is the correct choice as it supports richer content (images + text) while Tooltip is designed for simple text-only hints.

**Assumptions Requiring Confirmation:**

- The isPrimary field on bobbleheadPhotos correctly identifies the cover photo for each bobblehead
- HoverCard openDelay and closeDelay defaults provide adequate user experience (can be tuned if needed)

**Potential Risks:**

- **Image Loading Delay**: If photo loading is slow, the hover preview may appear empty briefly. Mitigation: The data is pre-fetched on server, so images should be cached by browser.
- **Cache Invalidation**: Photo changes need to invalidate navigation cache. Mitigation: Existing cache revalidation on photo changes should handle this.
