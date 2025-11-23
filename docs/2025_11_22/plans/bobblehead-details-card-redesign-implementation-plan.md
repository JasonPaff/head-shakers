# Bobblehead Feature Card Redesign - Implementation Plan

**Generated**: 2025-11-22
**Original Request**: redesign the main card on the bobblehead details page
**Refined Request**: Redesign the main card component on the bobblehead details page to improve visual hierarchy, usability, and information presentation while maintaining consistency with the platform's design system. The card should prominently display the bobblehead's primary image using Cloudinary optimization with a responsive image gallery component below it, reorganize the metadata and specifications into logically grouped sections with clear visual separation, and provide intuitive access to social features including likes, comments, and user interaction buttons positioned for easy discoverability.

---

## Overview

| Field                  | Value    |
| ---------------------- | -------- |
| **Estimated Duration** | 3-4 days |
| **Complexity**         | High     |
| **Risk Level**         | Medium   |

## Quick Summary

This plan redesigns the main card component on the bobblehead details page to improve visual hierarchy, usability, and information presentation. The redesign will create a more engaging, organized presentation with prominent primary image display using Cloudinary optimization, reorganized metadata sections with collapsible detailed specifications, repositioned social features for better discoverability, and responsive layouts that gracefully handle varying content lengths across desktop and mobile viewports.

## Analysis Summary

- Feature request refined with project context
- Discovered 45+ files across 12 directories
- Generated 11-step implementation plan

## File Discovery Results

### Critical Priority (Must Modify)

| File                                                                                             | Purpose                              |
| ------------------------------------------------------------------------------------------------ | ------------------------------------ |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-feature-card.tsx` | Main card component (PRIMARY TARGET) |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx`                               | Page layout orchestrator             |

### High Priority (Likely Modify)

| File                                                                                                                | Purpose               |
| ------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-details-card.tsx`                    | Details metadata card |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-photo-gallery.tsx`                   | Photo gallery         |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-header.tsx`                          | Header component      |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-feature-card-skeleton.tsx` | Loading skeleton      |

### UI Components (Reference)

- Card, Collapsible, Button, Badge, Dialog, LikeButton, Tabs, Separator from `src/components/ui/`

---

## Prerequisites

- [ ] Verify all target files exist and are accessible
- [ ] Confirm understanding of existing `BobbleheadWithRelations` type structure
- [ ] Review current Cloudinary image optimization patterns in the codebase
- [ ] Ensure Radix UI Collapsible, Tabs, and Separator components are available and working

---

## Implementation Steps

### Step 1: Create Shared Card Section Components

**What**: Create reusable sub-components for metadata display sections that will be used across the redesigned feature card.

**Why**: Establishing consistent patterns for detail items, collapsible sections, and visual separators ensures maintainability and reduces code duplication in the main component.

**Confidence**: High

**Files to Create:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-detail-item.tsx`
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-section.tsx`
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-image-gallery.tsx`

**Changes:**

- Create `FeatureCardDetailItem` component following existing `DetailItem` pattern
- Create `FeatureCardSection` component wrapping Radix Collapsible with consistent styling
- Create `FeatureCardImageGallery` component for horizontal thumbnail strip
- Apply CVA variants for different display states
- Add generateTestId utility calls for all interactive elements
- Ensure proper aria labels and keyboard navigation patterns

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All three sub-components created with proper TypeScript types
- [ ] Components follow existing project patterns (CVA, generateTestId, Conditional)
- [ ] All validation commands pass

---

### Step 2: Create Primary Image Section Component

**What**: Extract and enhance the primary image display logic into a dedicated component with improved Cloudinary optimization and thumbnail navigation.

**Why**: Separating the image section allows for better optimization, cleaner responsive handling, and improved reusability while maintaining the fullscreen modal functionality.

**Confidence**: High

**Files to Create:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-primary-image.tsx`

**Changes:**

- Create component accepting photos array, current index, and navigation handlers as props
- Implement responsive aspect ratio handling (3:4 mobile, square desktop)
- Add CldImage with optimized crop settings
- Include hover-triggered navigation arrows with proper accessibility
- Add photo counter overlay and condition/featured badge overlays
- Support click handler for opening fullscreen modal
- Add keyboard navigation support (arrow keys when focused)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component renders correctly with varying photo counts
- [ ] Navigation arrows appear on hover with proper transitions
- [ ] Badges display correctly based on bobblehead properties
- [ ] All validation commands pass

---

### Step 3: Create Social Actions Bar Component

**What**: Create a dedicated component for social interaction buttons (like, share, comments navigation) positioned prominently in the card layout.

**Why**: Repositioning social features for better discoverability improves user engagement and creates a consistent interaction pattern across the platform.

**Confidence**: High

**Files to Create:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-social-bar.tsx`

**Changes:**

- Create component accepting likeData, bobbleheadId, and targetType props
- Include LikeIconButton with shouldShowCount enabled
- Add comment count display with MessageCircle icon
- Add share trigger button with ShareIcon
- Apply horizontal layout with proper spacing using Tailwind gap utilities
- Use Separator component for visual division from content sections

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Like button displays and functions correctly with like count
- [ ] Share and comments buttons are visible and clickable
- [ ] Component integrates with existing LikeIconButton hook
- [ ] All validation commands pass

---

### Step 4: Create Quick Info Section Component

**What**: Build a component displaying essential bobblehead information (character, series, manufacturer, year) that remains always visible.

**Why**: Critical information should be immediately visible without scrolling or expanding sections to help users quickly understand the item.

**Confidence**: High

**Files to Create:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-quick-info.tsx`

**Changes:**

- Create component accepting BobbleheadWithRelations as prop
- Display character name with primary text styling
- Display series with secondary text styling
- Show manufacturer and year in a row layout
- Include category badge using Badge component
- Display top 3 tags with "+X more" indicator
- Use Conditional component for handling missing/null values

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All key metadata displays correctly when present
- [ ] Missing values handled gracefully without layout shifts
- [ ] Tags display limited to 3 with overflow indicator
- [ ] All validation commands pass

---

### Step 5: Create Collapsible Specifications Section Component

**What**: Build a collapsible section for detailed specifications (dimensions, material, weight) to reduce cognitive load while keeping information accessible.

**Why**: Less frequently accessed information should be collapsible to create a cleaner initial view while remaining easily accessible for users who need it.

**Confidence**: High

**Files to Create:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-specifications.tsx`

**Changes:**

- Create component wrapping FeatureCardSection with specifications content
- Use Collapsible, CollapsibleTrigger, and CollapsibleContent from Radix
- Include FeatureCardDetailItem components for height, weight, material
- Add appropriate Lucide icons for visual clarity
- Implement default collapsed state with useToggle hook
- Show "(N items)" count in section header
- Handle empty state with descriptive placeholder text

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Section expands and collapses smoothly with animation
- [ ] All specification fields display with appropriate icons
- [ ] Empty state handled with informative message
- [ ] All validation commands pass

---

### Step 6: Create Collapsible Acquisition Section Component

**What**: Build a collapsible section for acquisition details (purchase date, price, location, method).

**Why**: Acquisition information is secondary but valuable for collectors, so it should be accessible but not dominate the initial view.

**Confidence**: High

**Files to Create:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-acquisition.tsx`

**Changes:**

- Create component wrapping FeatureCardSection with acquisition content
- Include purchase price with currency formatting
- Include acquisition date with date formatting
- Include purchase location and acquisition method
- Implement default collapsed state
- Follow same pattern as specifications section for consistency

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All acquisition fields display with proper formatting
- [ ] Currency formatting works correctly
- [ ] Date formatting handles various input formats
- [ ] All validation commands pass

---

### Step 7: Refactor Main BobbleheadFeatureCard Component

**What**: Refactor the main feature card component to use the new sub-components and implement the improved layout structure.

**Why**: The main component becomes an orchestrator that combines all sub-components into a cohesive, well-organized card layout with improved visual hierarchy.

**Confidence**: Medium

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-feature-card.tsx`

**Changes:**

- Replace inline image section with FeatureCardPrimaryImage component
- Add FeatureCardImageGallery below primary image for thumbnail navigation
- Replace inline details with FeatureCardQuickInfo component
- Add FeatureCardSocialBar in prominent position
- Add FeatureCardSpecifications as collapsible section
- Add FeatureCardAcquisition as collapsible section
- Update grid layout from 2-column to single column with stacked sections
- Use Separator components between major sections
- Maintain existing Dialog/modal functionality
- Remove redundant code now handled by sub-components

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All sub-components integrate correctly with main component
- [ ] Visual hierarchy improved with clear section separation
- [ ] Fullscreen image modal still functions correctly
- [ ] All validation commands pass

---

### Step 8: Update Loading Skeleton Component

**What**: Update the skeleton component to match the new card layout structure.

**Why**: Loading skeletons must accurately represent the final layout to prevent layout shifts and provide a good loading experience.

**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-feature-card-skeleton.tsx`

**Changes:**

- Update skeleton structure to match new single-column layout
- Add skeleton for thumbnail gallery strip
- Add skeleton for social actions bar
- Add collapsible section skeletons with collapsed state representation
- Maintain responsive behavior matching actual component
- Update aspect ratio handling to match primary image component

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Skeleton layout matches actual component structure
- [ ] No layout shift when content loads
- [ ] Responsive behavior matches actual component
- [ ] All validation commands pass

---

### Step 9: Implement Mobile-First Responsive Styling

**What**: Apply responsive styling adjustments to ensure optimal display across all viewport sizes.

**Why**: Mobile users represent a significant portion of traffic, and the card must function well on smaller screens without sacrificing usability.

**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-feature-card.tsx`
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-primary-image.tsx`
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-image-gallery.tsx`
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-social-bar.tsx`

**Changes:**

- Apply Tailwind responsive prefixes (sm:, md:, lg:) for breakpoint-specific styles
- Reduce padding on mobile using responsive px classes
- Stack social buttons vertically on small screens if needed
- Adjust image aspect ratio for mobile vs desktop
- Reduce thumbnail sizes on mobile
- Ensure touch targets meet minimum 44x44px on mobile
- Adjust typography scale for smaller screens

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Card displays correctly at 320px viewport width
- [ ] Card displays correctly at 768px viewport width
- [ ] Card displays correctly at 1200px+ viewport width
- [ ] All validation commands pass

---

### Step 10: Integration and Page Layout Adjustments

**What**: Ensure the redesigned feature card integrates seamlessly with the page layout and other components.

**Why**: The feature card must work harmoniously with surrounding page elements and maintain consistent spacing with the overall page design.

**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx`

**Changes:**

- Verify ContentLayout wrapper still provides appropriate constraints
- Confirm spacing between feature card and photo gallery sections
- Ensure error boundary wrapping still functions correctly
- Verify async component integration works with new structure
- Test Suspense fallback with updated skeleton
- Confirm no duplicate information between feature card and detail cards sections

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Page layout maintains proper spacing and alignment
- [ ] No visual conflicts between redesigned card and existing sections
- [ ] Suspense boundaries work correctly
- [ ] All validation commands pass

---

### Step 11: Clean Up Redundant Code and Optimize Imports

**What**: Remove any deprecated code, unused imports, and ensure optimal bundle size.

**Why**: Clean code improves maintainability and ensures the codebase remains efficient without dead code accumulation.

**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-feature-card.tsx`
- All newly created feature-card sub-components

**Changes:**

- Remove any unused imports from refactored main component
- Verify no circular dependencies introduced
- Ensure each sub-component only imports what it needs
- Remove any commented-out code from development
- Verify all Lucide icons are imported individually

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] No unused imports warnings from ESLint
- [ ] No circular dependency issues
- [ ] Bundle size not significantly increased
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Manual visual verification on desktop viewport (1200px+)
- [ ] Manual visual verification on tablet viewport (768px)
- [ ] Manual visual verification on mobile viewport (375px)
- [ ] Verify fullscreen image modal opens and navigates correctly
- [ ] Verify like button increments/decrements correctly
- [ ] Verify collapsible sections expand and collapse with animation
- [ ] Verify no console errors in browser developer tools

---

## Notes

- **Architectural Decision (High Confidence)**: Using sub-components rather than a monolithic refactor allows for incremental testing and reduces risk of breaking existing functionality.
- **Architectural Decision (Medium Confidence)**: Moving to single-column layout on all viewport sizes (with responsive adjustments) rather than maintaining the 2-column split. This may need user feedback validation.
- **Risk Mitigation**: The existing photo gallery component (`bobblehead-photo-gallery.tsx`) is separate from the feature card and remains unchanged, providing a fallback for thumbnail navigation if the inline gallery has issues.
- **Future Enhancement Consideration**: The collapsible section pattern can be extended to support custom fields and additional metadata categories without structural changes.
- **Accessibility**: All interactive elements use Radix UI primitives which provide built-in ARIA support. Manual testing should verify screen reader compatibility.
- **Performance**: CldImage with auto format and quality settings provides optimal image delivery. Consider adding priority prop to primary image for LCP optimization.
