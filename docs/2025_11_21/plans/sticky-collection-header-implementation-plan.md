# Sticky Header for Collection, Subcollection, and Bobblehead Details - Implementation Plan

**Generated**: 2025-11-21T${new Date().toISOString().split('T')[1]}

**Original Request**: as a user I would like the collection/subcollection/bobblehead details header to be sticky, when scrolled down after the main header ( the area with the title/description and the share/edit/delete/report/like buttons goes out of a view a shorter streamlined version should appear so the viewer always has access to those actions

**Refined Request**: As a user, I would like the collection, subcollection, and bobblehead details header to implement a sticky positioning behavior that persists during vertical scrolling. When the user scrolls down and the main header section (containing the title, description, and action buttons for share, edit, delete, report, and like) moves out of the viewport, a streamlined sticky version should automatically appear at the top of the page to ensure the viewer maintains immediate access to these critical actions without scrolling back to the original position. This sticky header should be implemented using Tailwind CSS 4's sticky positioning utilities combined with Radix UI components to maintain visual consistency with the existing design system. The streamlined version should intelligently reduce visual complexity by consolidating or abstracting less critical information while preserving the core action buttons (like, share, edit, delete, and report) in a more compact layout, possibly utilizing icon-only buttons from Lucide React for space efficiency.

---

## Analysis Summary

- Feature request refined with project context
- Discovered **30 files** across **12+ directories**
- Generated **15-step** implementation plan
- **4 new components** to create
- **12 existing files** to modify

---

## File Discovery Results

### High Priority Files (9 files)

**Collection Detail Pages:**

- `src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx`
- `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-header.tsx`
- `src/app/(app)/collections/[collectionSlug]/(collection)/components/async/collection-header-async.tsx`

**Subcollection Detail Pages:**

- `src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/page.tsx`
- `src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/subcollection-header.tsx`
- `src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/async/subcollection-header-async.tsx`

**Bobblehead Detail Pages:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx`
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-header.tsx`
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-header-async.tsx`

### Medium Priority Files (19 files)

**Action Components:**

- Collection: `collection-share-menu.tsx`, `collection-delete.tsx`, `collection-edit-section.tsx`
- Subcollection: `subcollection-share-menu.tsx`, `subcollection-delete.tsx`, `subcollection-edit-section.tsx`
- Bobblehead: `bobblehead-share-menu.tsx`, `bobblehead-header-edit.tsx`, `bobblehead-header-delete.tsx`
- Shared: `report-button.tsx`, `like-button.tsx`

**Skeleton Components:**

- `collection-header-skeleton.tsx`
- `subcollection-header-skeleton.tsx`
- `bobblehead-header-skeleton.tsx`

**Layout & UI:**

- `content-layout.tsx`
- `app-header.tsx` (reference for sticky pattern)
- `button.tsx`
- `dropdown-menu.tsx`

**Utilities:**

- `tailwind-utils.ts`
- `use-toggle.ts`

### New Files to Create (4 files)

1. `src/components/feature/sticky-header/sticky-header-wrapper.tsx` - Shared scroll detection wrapper
2. `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-sticky-header.tsx` - Collection sticky header
3. `src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/subcollection-sticky-header.tsx` - Subcollection sticky header
4. `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-sticky-header.tsx` - Bobblehead sticky header

---

## Architecture Insights

### Existing Sticky Pattern (from app-header.tsx)

```tsx
<header className={'sticky top-0 z-50 w-full border-b bg-background'}>
```

### Recommended Sticky Header Styling

- **Position**: `sticky top-0 z-40` (below app-header z-50)
- **Visual Effect**: `backdrop-blur-sm bg-background/95 border-b`
- **Width**: `w-full`
- **Transitions**: `transition-transform duration-200`

### Current Header Structure

All three entity types follow consistent pattern:

- Back navigation button (top-left)
- Action buttons row (top-right): Share, Edit (owner), Delete (owner), Report (non-owner)
- Title and description
- Metadata row with Like button and stats

### Scroll Detection Strategy

- Use **IntersectionObserver API** for native performance
- Sentinel element before original header triggers visibility
- Boolean state controls sticky header conditional rendering

---

## Implementation Plan

### Overview

**Estimated Duration**: 2-3 days
**Complexity**: Medium
**Risk Level**: Low

### Quick Summary

Implement sticky positioning behavior for collection, subcollection, and bobblehead detail page headers that persist during vertical scrolling. When the main header scrolls out of view, a streamlined sticky version appears at the top with consolidated action buttons, providing continuous access to core actions (like, share, edit, delete, report) without requiring users to scroll back up.

### Prerequisites

- [ ] Existing collection, subcollection, and bobblehead detail pages are functional
- [ ] All action components (share-menu, delete, edit, report, like-button) are working
- [ ] Tailwind CSS 4 configuration includes backdrop-blur utilities
- [ ] Development environment running with `npm run dev`

---

## Implementation Steps

### Step 1: Create Shared Sticky Header Wrapper Component

**What**: Build a reusable wrapper component that detects scroll position and toggles sticky header visibility
**Why**: Centralizes scroll detection logic to avoid duplication across three entity types
**Confidence**: High

**Files to Create:**

- `src/components/feature/sticky-header/sticky-header-wrapper.tsx` - Client component that manages scroll state and sticky header visibility

**Changes:**

- Create new folder `src/components/feature/sticky-header/`
- Implement scroll detection using IntersectionObserver API to track when original header exits viewport
- Manage boolean state for sticky header visibility using useState
- Accept children render prop pattern with scroll state parameter
- Export TypeScript interface for wrapper props including threshold and rootMargin options

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component compiles without TypeScript errors
- [ ] IntersectionObserver properly detects scroll position
- [ ] State updates trigger re-renders correctly
- [ ] All validation commands pass
- [ ] Component is marked as client component with 'use client' directive

---

### Step 2: Create Collection Sticky Header Component

**What**: Build sticky header variant for collection detail pages with compact action layout
**Why**: Provides streamlined header with essential actions when main header is scrolled out of view
**Confidence**: High

**Files to Create:**

- `src/components/feature/collection/collection-sticky-header.tsx` - Client component rendering compact collection header

**Changes:**

- Accept props matching CollectionHeaderProps interface including collectionId, slug, title, privacy, likeCount, isLiked, canEdit, canDelete
- Render fixed positioned header with `sticky top-0 z-40 backdrop-blur-sm bg-background/95 border-b` styling
- Include collection title truncated with ellipsis for long names
- Integrate ShareCollectionMenu, EditCollectionButton, DeleteCollectionButton, ReportButton components in icon-only mode
- Use LikeCompactButton variant from like-button component
- Implement responsive layout with flexbox wrapping action buttons appropriately for mobile/tablet/desktop
- Add smooth opacity transition when appearing/disappearing using Tailwind transition utilities

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component renders with correct z-index below app header
- [ ] All action buttons functional and properly typed
- [ ] Title truncation works correctly
- [ ] Responsive layout adapts to viewport sizes
- [ ] Backdrop blur effect applied correctly
- [ ] All validation commands pass

---

### Step 3: Create Subcollection Sticky Header Component

**What**: Build sticky header variant for subcollection detail pages
**Why**: Maintains action accessibility for subcollection pages during scroll
**Confidence**: High

**Files to Create:**

- `src/components/feature/subcollection/subcollection-sticky-header.tsx` - Client component rendering compact subcollection header

**Changes:**

- Accept props matching SubcollectionHeaderProps interface including subcollectionId, slug, title, privacy, likeCount, isLiked, canEdit, canDelete, collectionSlug
- Apply identical styling pattern as collection sticky header for consistency
- Integrate ShareSubcollectionMenu, EditSubcollectionButton, DeleteSubcollectionButton, ReportButton components
- Use LikeCompactButton with appropriate subcollection entity type
- Include breadcrumb or parent collection indicator in compact format
- Implement same responsive and transition behavior as collection variant

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component matches collection sticky header visual pattern
- [ ] All subcollection-specific actions integrated correctly
- [ ] Parent collection context visible in compact format
- [ ] Type safety enforced for all props
- [ ] All validation commands pass

---

### Step 4: Create Bobblehead Sticky Header Component

**What**: Build sticky header variant for bobblehead detail pages
**Why**: Provides persistent action access for bobblehead viewing experience
**Confidence**: High

**Files to Create:**

- `src/components/feature/bobblehead/bobblehead-sticky-header.tsx` - Client component rendering compact bobblehead header

**Changes:**

- Accept props matching BobbleheadHeaderProps interface including bobbleheadId, slug, name, privacy, likeCount, isLiked, canEdit, canDelete, subcollectionSlug, collectionSlug
- Apply consistent styling with sibling sticky headers
- Integrate ShareBobbleheadMenu, EditBobbleheadButton, DeleteBobbleheadButton, ReportButton components
- Use LikeCompactButton with bobblehead entity type
- Display bobblehead name with truncation and optional thumbnail image in compact size
- Include collection/subcollection breadcrumb path in condensed format

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component follows established sticky header pattern
- [ ] Bobblehead-specific actions function correctly
- [ ] Thumbnail image renders properly when included
- [ ] Breadcrumb path displays parent hierarchy
- [ ] All validation commands pass

---

### Step 5: Integrate Sticky Header into Collection Detail Page

**What**: Modify collection detail page to include sticky header with scroll detection
**Why**: Implements the feature for collection pages using shared components
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx` - Add sticky header integration to page layout

**Changes:**

- Import StickyHeaderWrapper and CollectionStickyHeader components
- Wrap main content with StickyHeaderWrapper component
- Add sentinel div element immediately before original CollectionHeader to serve as intersection observer target
- Conditionally render CollectionStickyHeader when scroll state indicates header is out of view
- Pass necessary props from collection data to sticky header component
- Ensure original header and sticky header receive identical prop values for consistency

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Sticky header appears when scrolling past original header
- [ ] Sticky header hides when scrolling back to top
- [ ] No layout shifts or content jumps during transition
- [ ] All action buttons maintain functionality in sticky state
- [ ] All validation commands pass

---

### Step 6: Integrate Sticky Header into Subcollection Detail Page

**What**: Modify subcollection detail page to include sticky header behavior
**Why**: Extends sticky header feature to subcollection viewing experience
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/page.tsx` - Add sticky header integration

**Changes:**

- Import StickyHeaderWrapper and SubcollectionStickyHeader components
- Apply identical integration pattern as collection page
- Add intersection observer sentinel element
- Conditionally render SubcollectionStickyHeader based on scroll state
- Pass subcollection-specific props including parent collection context
- Ensure type safety for all prop passing

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Sticky header behavior matches collection page implementation
- [ ] Parent collection context properly displayed
- [ ] Navigation between collection and subcollection maintains sticky behavior
- [ ] All validation commands pass

---

### Step 7: Integrate Sticky Header into Bobblehead Detail Page

**What**: Modify bobblehead detail page to include sticky header functionality
**Why**: Completes sticky header feature across all three entity detail pages
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx` - Add sticky header integration

**Changes:**

- Import StickyHeaderWrapper and BobbleheadStickyHeader components
- Follow established integration pattern from collection and subcollection pages
- Position sentinel element for scroll detection
- Conditionally render BobbleheadStickyHeader when original header exits viewport
- Pass complete bobblehead props including breadcrumb hierarchy data
- Handle optional thumbnail image prop correctly

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Sticky header appears and disappears based on scroll position
- [ ] Breadcrumb hierarchy displays correctly in compact format
- [ ] Thumbnail image renders when available
- [ ] Consistent behavior with collection and subcollection implementations
- [ ] All validation commands pass

---

### Step 8: Implement Responsive Breakpoint Adjustments

**What**: Optimize sticky header layouts for mobile, tablet, and desktop viewports
**Why**: Ensures usable interface across all device sizes without action button overlap
**Confidence**: Medium

**Files to Modify:**

- `src/components/feature/collection/collection-sticky-header.tsx` - Add responsive layout classes
- `src/components/feature/subcollection/subcollection-sticky-header.tsx` - Add responsive layout classes
- `src/components/feature/bobblehead/bobblehead-sticky-header.tsx` - Add responsive layout classes

**Changes:**

- Apply Tailwind responsive classes for breakpoints sm, md, lg, xl
- Adjust spacing between action buttons using responsive gap utilities
- Implement title width constraints with responsive max-width classes
- Hide less critical elements on mobile viewports using hidden/block utilities
- Stack action buttons vertically on smallest screens if necessary
- Test layout on mobile 320px, tablet 768px, and desktop 1024px+ viewports

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Action buttons remain accessible without horizontal scrolling on mobile
- [ ] Title truncation adapts to available space at each breakpoint
- [ ] No visual overflow or layout breaking at any viewport size
- [ ] Consistent visual hierarchy maintained across breakpoints
- [ ] All validation commands pass

---

### Step 9: Add Smooth Transition Animations

**What**: Implement enter/exit animations for sticky header appearance
**Why**: Provides polished user experience with smooth visual transitions
**Confidence**: High

**Files to Modify:**

- `src/components/feature/collection/collection-sticky-header.tsx` - Add transition classes
- `src/components/feature/subcollection/subcollection-sticky-header.tsx` - Add transition classes
- `src/components/feature/bobblehead/bobblehead-sticky-header.tsx` - Add transition classes
- `src/components/feature/sticky-header/sticky-header-wrapper.tsx` - Add transition state management

**Changes:**

- Add Tailwind transition classes for opacity and transform properties
- Implement slide-down animation using translate-y utilities when appearing
- Add fade-in effect with opacity transition
- Use transition-all duration-300 ease-in-out for smooth animation timing
- Conditionally apply animation classes based on visibility state from wrapper
- Ensure animations respect prefers-reduced-motion accessibility preference

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Sticky header slides down smoothly when appearing
- [ ] Fade effect enhances visual transition
- [ ] Animation duration feels natural and not jarring
- [ ] Reduced motion preference respected for accessibility
- [ ] All validation commands pass

---

### Step 10: Optimize Intersection Observer Performance

**What**: Fine-tune IntersectionObserver configuration for optimal scroll performance
**Why**: Prevents unnecessary re-renders and ensures smooth scrolling experience
**Confidence**: High

**Files to Modify:**

- `src/components/feature/sticky-header/sticky-header-wrapper.tsx` - Optimize observer configuration

**Changes:**

- Set appropriate rootMargin value to trigger visibility change slightly before header exits viewport
- Configure threshold array for precise intersection detection
- Implement cleanup function to disconnect observer on component unmount
- Add ref cleanup in useEffect dependency array
- Debounce state updates if multiple rapid intersection changes occur
- Ensure observer only initialized once per component instance

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Smooth scrolling performance without jank or stuttering
- [ ] Sticky header appears at optimal scroll position
- [ ] No memory leaks from undisconnected observers
- [ ] Console shows no performance warnings
- [ ] All validation commands pass

---

### Step 11: Add Type-Safe Navigation for Action Buttons

**What**: Ensure all navigation actions in sticky header use type-safe routing with $path
**Why**: Maintains project standard for type-safe routing and prevents broken navigation links
**Confidence**: High

**Files to Modify:**

- `src/components/feature/collection/collection-sticky-header.tsx` - Verify $path usage in navigation
- `src/components/feature/subcollection/subcollection-sticky-header.tsx` - Verify $path usage in navigation
- `src/components/feature/bobblehead/bobblehead-sticky-header.tsx` - Verify $path usage in navigation

**Changes:**

- Import $path from next-typesafe-url for all internal navigation links
- Replace any hardcoded URL strings with $path route generation
- Verify edit button navigation uses $path for edit routes
- Ensure breadcrumb links use $path for parent entity routes
- Validate all navigation props passed to action components use type-safe routes
- Add TypeScript checks for route parameter types

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All navigation uses $path with no hardcoded strings
- [ ] TypeScript enforces correct route parameters
- [ ] Edit, share, and breadcrumb navigation functional
- [ ] No runtime navigation errors in browser console
- [ ] All validation commands pass

---

### Step 12: Handle Edge Cases and Loading States

**What**: Implement proper handling for loading states, missing data, and error conditions
**Why**: Ensures robust user experience even with incomplete or delayed data
**Confidence**: Medium

**Files to Modify:**

- `src/components/feature/collection/collection-sticky-header.tsx` - Add null checks and loading states
- `src/components/feature/subcollection/subcollection-sticky-header.tsx` - Add null checks and loading states
- `src/components/feature/bobblehead/bobblehead-sticky-header.tsx` - Add null checks and loading states

**Changes:**

- Add null/undefined checks for optional props like thumbnail images
- Implement skeleton loader state if data not immediately available
- Handle missing permission props gracefully by hiding restricted actions
- Provide fallback UI when like count or other metrics unavailable
- Validate entity slugs before navigation to prevent broken links
- Add error boundary consideration for component failure isolation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component renders without errors when optional props missing
- [ ] Skeleton state displays appropriately during loading
- [ ] Permission-restricted actions hidden when user lacks access
- [ ] No console errors for undefined property access
- [ ] All validation commands pass

---

### Step 13: Accessibility Audit and ARIA Improvements

**What**: Ensure sticky header meets accessibility standards with proper ARIA attributes
**Why**: Maintains inclusive user experience for users with assistive technologies
**Confidence**: High

**Files to Modify:**

- `src/components/feature/collection/collection-sticky-header.tsx` - Add ARIA attributes
- `src/components/feature/subcollection/subcollection-sticky-header.tsx` - Add ARIA attributes
- `src/components/feature/bobblehead/bobblehead-sticky-header.tsx` - Add ARIA attributes
- `src/components/feature/sticky-header/sticky-header-wrapper.tsx` - Add landmark roles

**Changes:**

- Add role="banner" or appropriate landmark role to sticky header container
- Include aria-label describing sticky header purpose
- Ensure all icon-only buttons have descriptive aria-label attributes
- Verify focus management when sticky header appears
- Test keyboard navigation through all action buttons
- Add skip link consideration for users wanting to bypass sticky header
- Verify screen reader announcements for sticky header state changes

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Screen readers properly announce sticky header and action buttons
- [ ] Keyboard navigation works without mouse interaction
- [ ] Focus indicators visible on all interactive elements
- [ ] ARIA attributes valid according to WCAG guidelines
- [ ] No accessibility violations in browser dev tools audit
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck` without errors
- [ ] All files pass `npm run lint:fix` without warnings
- [ ] All files formatted with `npm run format`
- [ ] Visual testing confirms sticky header appears at correct scroll position
- [ ] Action buttons in sticky header function identically to original header
- [ ] Responsive behavior verified on mobile 375px, tablet 768px, desktop 1440px
- [ ] Cross-browser testing completed on Chrome, Firefox, Safari, Edge
- [ ] Accessibility audit passes with screen reader testing
- [ ] Performance profiling shows no scroll jank or degradation
- [ ] No console errors or warnings in browser developer tools

---

## Notes

**Z-Index Coordination**: Sticky header uses z-40 to position below main app-header at z-50, preventing visual conflicts while maintaining proper stacking order.

**Performance Consideration**: IntersectionObserver API provides native browser optimization for scroll detection, avoiding manual scroll event listeners that could degrade performance.

**Glassmorphism Effect**: The backdrop-blur-sm with bg-background/95 creates subtle translucent effect, but may not render identically on older browsers - fallback to solid background acceptable.

**Animation Preferences**: Implementation respects prefers-reduced-motion media query for users with motion sensitivity.

**Component Reusability**: StickyHeaderWrapper designed as generic wrapper, potentially reusable for other sticky UI patterns beyond entity headers.

**Type Safety**: All components leverage TypeScript strict mode and Zod validation schemas from existing header components to maintain type safety.

**Testing Strategy**: Manual testing prioritized for scroll behavior and visual validation; automated testing could be added later using Playwright for E2E scroll scenarios.

**Future Enhancements**: Consider adding user preference to disable sticky headers via settings, or automatic hiding on mobile when scrolling down to maximize content space.

---

## Orchestration Logs

For detailed execution logs and AI analysis from each step of the planning process, see:

- [00-orchestration-index.md](../orchestration/sticky-collection-header/00-orchestration-index.md) - Workflow overview and navigation
- [01-feature-refinement.md](../orchestration/sticky-collection-header/01-feature-refinement.md) - Refined request with project context
- [02-file-discovery.md](../orchestration/sticky-collection-header/02-file-discovery.md) - AI-powered file discovery analysis
- [03-implementation-planning.md](../orchestration/sticky-collection-header/03-implementation-planning.md) - Implementation plan generation details
