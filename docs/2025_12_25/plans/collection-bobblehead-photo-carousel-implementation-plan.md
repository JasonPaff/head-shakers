# Implementation Plan: Bobblehead Card Photo Carousel

**Generated**: 2025-12-25
**Original Request**: The /dashboard/collection page has a bobblehead grid that displays the bobbleheads in the selected collection, these bobbleheads are displayed as cards that display the featured image from the bobblehead. The bobbleheads though can have multiple photos on them and I would like a way for the collection owner to see these additional photos on the bobblehead cards in the collection dashboard.

**Refined Request**: The collection dashboard at /dashboard/collection displays bobblehead items in a grid layout where each card currently shows only the featured image of the bobblehead, but since bobbleheads can have multiple photos attached to them, collection owners need a way to browse through all available images directly on these cards without navigating away from the collection view. This feature should implement an image carousel or gallery preview on each bobblehead card that allows owners to cycle through all photos associated with that bobblehead, leveraging the existing Embla Carousel React dependency for smooth, performant carousel functionality with proper touch and drag support. The implementation should add navigation controls such as previous/next arrows using Lucide React icons and optional dot indicators to show the current image position within the photo set, with these controls styled consistently using Tailwind CSS 4 and potentially Class Variance Authority for variant management to handle hover states, active states, and responsive sizing.

## Analysis Summary

- Feature request refined with project context
- Discovered 15 files across 4 priority levels
- Generated 10-step implementation plan

## File Discovery Results

### Critical Priority

| File                                                                                  | Purpose                                                         |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-card.tsx` | Primary target - displays single featured photo, needs carousel |
| `src/components/ui/carousel.tsx`                                                      | Existing Embla carousel with all required components            |
| `src/lib/queries/bobbleheads/bobbleheads-dashboard.query.ts`                          | Dashboard query - needs to return all photos                    |

### High Priority

| File                                                                                             | Purpose                                     |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `src/app/(app)/dashboard/collection/(collection)/components/display/bobblehead-grid-display.tsx` | Client wrapper passing data to cards        |
| `src/lib/db/schema/bobbleheads.schema.ts`                                                        | Database schema with bobbleheadPhotos table |
| `src/lib/facades/bobbleheads/bobbleheads-dashboard.facade.ts`                                    | Facade with getListByCollectionSlugAsync    |
| `src/lib/utils/cloudinary.utils.ts`                                                              | Cloudinary utilities for image optimization |

### Medium Priority

| File                                                                                              | Purpose                               |
| ------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-photo-gallery.tsx` | Reference for CldImage usage patterns |
| `src/components/feature/bobblehead/bobblehead-photo-gallery-modal.tsx`                            | Pattern reference for navigation UI   |
| `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-grid.tsx`             | Grid layout component                 |
| `src/app/(app)/dashboard/collection/(collection)/components/async/bobblehead-grid-async.tsx`      | Server component for data fetch       |

### Low Priority

| File                                                             | Purpose                       |
| ---------------------------------------------------------------- | ----------------------------- |
| `tests/components/dashboard/collection/bobblehead-card.test.tsx` | Existing tests to update      |
| `tests/fixtures/bobblehead-grid.factory.ts`                      | Test factory for mock data    |
| `src/components/ui/conditional.tsx`                              | Conditional rendering utility |

---

## Overview

**Estimated Duration**: 4-6 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

This feature adds an image carousel to bobblehead cards on the collection dashboard, allowing collection owners to browse through all photos attached to a bobblehead without leaving the collection view. The implementation leverages the existing Embla Carousel UI components, extends the data layer to include all photos (not just the primary one), and creates a client-side carousel wrapper component with proper accessibility support.

## Prerequisites

- [ ] Confirm existing carousel component at `src/components/ui/carousel.tsx` supports all required features (touch, drag, keyboard, dots)
- [ ] Verify Embla Carousel React dependency is installed
- [ ] Ensure CldImage from next-cloudinary is available for optimized image delivery

## Implementation Steps

### Step 1: Extend Database Query to Include All Photos

**What**: Modify the bobblehead dashboard query to return an array of all photo URLs instead of just the primary photo.
**Why**: The current query only joins and returns the primary photo via `bobbleheadPhotos.url`. To enable carousel functionality, we need all photos associated with each bobblehead.
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/bobbleheads/bobbleheads-dashboard.query.ts` - Add photos array to select and implement subquery or lateral join

**Changes:**

- Add `photos` field to `BobbleheadDashboardListRecord` type definition as `Array<{ id: string; url: string; altText: string | null; sortOrder: number }>`
- Modify the `getListAsync` method to fetch all photos per bobblehead using a subquery or JSON aggregation
- Keep the existing `featurePhoto` field for backward compatibility with any code that depends on it
- Order photos by `sortOrder` ascending, with primary photo first

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] `BobbleheadDashboardListRecord` type includes `photos` array property
- [ ] Query returns all photos for each bobblehead in correct sort order
- [ ] Existing `featurePhoto` field still works for backward compatibility
- [ ] All validation commands pass

---

### Step 2: Create BobbleheadCardCarousel Client Component

**What**: Create a new client component that wraps the existing Carousel UI to display bobblehead photos in the card context.
**Why**: The carousel needs client-side interactivity (touch, drag, keyboard events) while keeping the parent grid as a server component. This follows the established client/server split pattern in the codebase.
**Confidence**: High

**Files to Create:**

- `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-card-carousel.tsx` - New client component for photo carousel

**Changes:**

- Create `BobbleheadCardCarousel` component using `'use client'` directive
- Import and compose existing `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `CarouselDots` from `@/components/ui/carousel`
- Define props interface accepting photos array and bobblehead name for alt text
- Use CldImage for each carousel item with proper transformations (crop fill, size appropriate for card display)
- Apply `extractPublicIdFromCloudinaryUrl` and `generateBlurDataUrl` utilities for optimized loading
- Style navigation arrows to position inside the image container with translucent background
- Conditionally render navigation controls only when photos.length > 1
- Add data-slot attributes following project conventions

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component renders correctly with single photo (no navigation shown)
- [ ] Component renders correctly with multiple photos (navigation visible)
- [ ] Carousel supports touch and drag interactions
- [ ] All validation commands pass

---

### Step 3: Add CVA Variants for Carousel Navigation Controls

**What**: Define Class Variance Authority variants for carousel navigation button sizing and positioning within the card context.
**Why**: The default carousel navigation buttons are positioned outside the carousel container. For cards, they need to be inside the image area with appropriate styling for the smaller context.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-card-carousel.tsx` - Add CVA variants for card-specific navigation styling

**Changes:**

- Create `cardCarouselNavigationVariants` using CVA for button positioning (inside container, translucent background)
- Create `cardCarouselDotsVariants` for dots positioning at bottom of image container
- Apply hover and focus-visible states matching existing project patterns
- Use the `light` colorScheme variant for dots to ensure visibility over images

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Navigation buttons appear inside the image container
- [ ] Buttons have translucent backgrounds that work over various image colors
- [ ] Dots use the light color scheme for visibility
- [ ] All validation commands pass

---

### Step 4: Integrate Carousel into BobbleheadCard Component

**What**: Replace the static image element in BobbleheadCard with the new BobbleheadCardCarousel component.
**Why**: The current card uses a simple `<img>` tag. We need to swap this for the carousel component while maintaining the same visual layout and hover behavior.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-card.tsx` - Replace img with carousel component

**Changes:**

- Import `BobbleheadCardCarousel` from the new component file
- Update `BobbleheadCardProps` to expect `bobblehead` with photos array (type already extended in Step 1)
- Replace the existing `<img>` element with `BobbleheadCardCarousel` component
- Pass photos array from bobblehead data to the carousel
- Maintain the same `aspect-square overflow-hidden bg-muted` container styling
- Ensure hover overlay for Edit/Actions still works correctly over the carousel
- Handle edge case where photos array is empty by showing placeholder

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Carousel renders in place of static image
- [ ] Card layout and sizing remain unchanged
- [ ] Hover overlay with Edit/Actions buttons still functions
- [ ] Cards with no photos display placeholder correctly
- [ ] All validation commands pass

---

### Step 5: Update Test Factory and Existing Tests

**What**: Extend the test factory to include photos array and update existing bobblehead-card tests.
**Why**: The BobbleheadDashboardListRecord type now includes photos, so test fixtures and tests need to account for this change.
**Confidence**: High

**Files to Modify:**

- `tests/fixtures/bobblehead-grid.factory.ts` - Add photos array to mock data
- `tests/components/dashboard/collection/bobblehead-card.test.tsx` - Update tests for new carousel behavior

**Changes:**

- Add `photos` array field to `createMockBobbleheadDashboardRecord` with default test photos
- Include helper function `createMockBobbleheadPhoto` for generating individual photo objects
- Update existing BobbleheadCard tests that check for image rendering
- Add new test cases for carousel navigation visibility based on photo count

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Test factory produces valid mock data with photos array
- [ ] Existing tests pass with updated mock data structure
- [ ] All validation commands pass

---

### Step 6: Add Comprehensive Carousel Tests

**What**: Create test cases specifically for the carousel functionality in the bobblehead card.
**Why**: The carousel introduces new interactive behavior that needs thorough testing including navigation, keyboard support, and edge cases.
**Confidence**: High

**Files to Modify:**

- `tests/components/dashboard/collection/bobblehead-card.test.tsx` - Add carousel-specific test suite

**Changes:**

- Add new describe block for "Carousel Tests"
- Test that single-photo bobbleheads do not show navigation controls
- Test that multi-photo bobbleheads show previous/next buttons and dots
- Test keyboard navigation (ArrowLeft, ArrowRight) within carousel
- Test that carousel interactions do not trigger card selection in selection mode
- Test accessibility attributes on carousel elements (aria-roledescription, role)
- Test dot navigation clicking

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test -- --testPathPattern="bobblehead-card"
```

**Success Criteria:**

- [ ] All new carousel tests pass
- [ ] Keyboard navigation tests verify arrow key functionality
- [ ] Accessibility tests verify ARIA attributes
- [ ] All validation commands pass

---

### Step 7: Handle Carousel and Card Interaction Conflicts

**What**: Ensure carousel swipe/drag interactions do not conflict with card click handling in selection mode.
**Why**: Both the carousel and the card respond to click/touch events. We need to prevent carousel navigation from triggering card selection.
**Confidence**: Medium

**Files to Modify:**

- `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-card-carousel.tsx` - Add event propagation handling
- `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-card.tsx` - Adjust click handlers if needed

**Changes:**

- Add `onClick` handler to carousel navigation buttons that calls `event.stopPropagation()`
- Add `onPointerDown` handler to carousel container to stop propagation on drag start
- Ensure keyboard events on carousel do not bubble up to card's keyboard handler
- Test that clicking/dragging within carousel does not select/deselect the card

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Clicking carousel navigation does not trigger card selection
- [ ] Dragging/swiping carousel does not trigger card click
- [ ] Card selection mode still works when clicking outside carousel controls
- [ ] All validation commands pass

---

### Step 8: Optimize Image Loading for Carousel Performance

**What**: Configure CldImage with appropriate sizes and lazy loading for carousel items.
**Why**: Loading all images for all cards upfront would hurt performance. We need to ensure only visible carousel slides load initially, with lazy loading for subsequent slides.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-card-carousel.tsx` - Add loading optimization

**Changes:**

- Set appropriate `width` and `height` on CldImage matching card aspect ratio (400x400 for compact, 500x500 for comfortable)
- Use `loading="lazy"` for all slides except the first (active) one
- Apply `priority` prop only to first slide when it is in viewport
- Configure blur placeholder using existing `generateBlurDataUrl` utility
- Set `sizes` attribute for responsive image loading based on grid density

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] First slide loads immediately with blur placeholder
- [ ] Subsequent slides lazy load as user navigates
- [ ] Image transformations match card display size
- [ ] All validation commands pass

---

### Step 9: Add Accessibility Enhancements

**What**: Ensure carousel meets accessibility requirements with proper ARIA labels and keyboard support.
**Why**: The existing UI carousel already includes accessibility features. We need to ensure they work correctly in the card context and add any missing labels.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-card-carousel.tsx` - Add accessibility attributes

**Changes:**

- Add `aria-label` to carousel container indicating it is a photo gallery for the bobblehead
- Ensure navigation buttons have descriptive `aria-label` (e.g., "Previous photo", "Next photo")
- Add `aria-live="polite"` region to announce current slide position
- Verify tab order allows users to navigate away from carousel after interacting
- Follow existing patterns from `bobblehead-photo-gallery.tsx` for consistency

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Carousel has descriptive aria-label
- [ ] Navigation buttons are keyboard accessible
- [ ] Screen readers announce slide changes
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] All component tests pass `npm run test`
- [ ] Manual verification of carousel on collection dashboard
- [ ] Accessibility testing with keyboard navigation
- [ ] Performance check - no visible loading delays on grid

## Notes

**Architectural Decisions:**

- The carousel component is kept as a separate client component rather than embedded in the card to maintain clear separation of concerns and allow for future reuse
- Photos are fetched at the query level rather than making separate API calls for each card, avoiding N+1 query issues
- The existing UI carousel is reused with positioning overrides rather than creating a new component, following DRY principles

**Edge Cases Handled:**

- Bobbleheads with 0 photos: Display placeholder image, no carousel
- Bobbleheads with 1 photo: Display image without navigation controls
- Bobbleheads with 2+ photos: Full carousel functionality

**Performance Considerations:**

- First photo uses priority loading with blur placeholder
- Subsequent photos lazy load on navigation
- Cloudinary transformations ensure appropriately sized images for card display
- Photos array is included in the cached query response

**Potential Risks:**

- Query performance impact from fetching all photos (mitigated by existing caching layer)
- Event propagation conflicts between carousel and card (addressed in Step 7)
- Memory usage with many cards (mitigated by lazy loading)
