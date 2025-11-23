# Implementation Plan: Bobblehead Gallery Card Visual Redesign

**Generated**: 2025-01-23
**Original Request**: The bobblehead cards on the collection page (/collection/[collectionSlug]) could use a visual overhaul and redesign to look clean, colorful, modern with a better UI/UX.

**Refined Request**: The bobblehead cards displayed on the collection page (accessible via `/collection/[collectionSlug]`) require a comprehensive visual redesign to enhance the platform's overall aesthetic and user experience. Currently, the cards need to be modernized with a clean, colorful, and visually appealing design that aligns with contemporary UI/UX standards while leveraging the existing Head Shakers design system. The redesign should incorporate Radix UI components for consistency with the platform's established component library, Tailwind CSS 4 for modern styling and animations, and Class Variance Authority for flexible component variants that support different card states and layouts. The visual overhaul should improve the presentation of bobblehead metadata, making key information more discoverable and easier to scan, while implementing better visual hierarchy, improved spacing, and enhanced typography to create a more polished appearance. Lucide React icons should be strategically integrated to provide visual cues and improve navigation, and the cards should support modern interaction patterns such as hover effects, smooth transitions, and potentially expanded previews or detail views. The implementation should maintain type safety with TypeScript, ensure accessibility standards are met, and utilize internal navigation with `$path` from next-typesafe-url for any linked actions.

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: Medium
**Risk Level**: Low-Medium

## Quick Summary

This plan redesigns the `BobbleheadGalleryCard` component on the collection page to create a modern, visually appealing card design. The redesign will improve visual hierarchy, enhance metadata presentation with badges and tooltips, implement refined hover effects and transitions, and ensure accessibility compliance while maintaining full compatibility with the existing data layer and functionality.

## Prerequisites

- [ ] Ensure development environment is running with `npm run dev`
- [ ] Verify access to all related component files
- [ ] Understand existing card data structure from `BobbleheadGalleryCardProps` interface
- [ ] Review design tokens in `globals.css` for consistency

## Implementation Steps

### Step 1: Add New CSS Animation Keyframes and Utilities

**What**: Extend the global CSS with new animation keyframes and utility classes needed for enhanced card interactions.
**Why**: The redesigned card requires subtle lift effects, gradient overlays, and smooth micro-interactions that need custom CSS utilities beyond default Tailwind classes.
**Confidence**: High

**Files to Modify:**

- `src/app/globals.css` - Add new keyframes and utility classes

**Changes:**

- Add `card-lift` keyframe for subtle vertical movement on hover
- Add `shimmer` keyframe for skeleton loading enhancement
- Add `gradient-shift` keyframe for dynamic background effects
- Create `animate-card-lift`, `animate-shimmer`, and `animate-gradient-shift` utility classes
- Add `backdrop-blur-subtle` utility for frosted glass effects on overlays

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New CSS animations compile without errors
- [ ] Utilities are accessible via Tailwind class names
- [ ] All validation commands pass

---

### Step 2: Create CVA Variants for Bobblehead Card Component

**What**: Add Class Variance Authority (CVA) configuration to the bobblehead card component for flexible styling variants.
**Why**: CVA enables consistent variant-based styling patterns used throughout the project, allowing future extensibility for different card layouts or states while maintaining type safety.
**Confidence**: High

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` - Add CVA imports and variant definitions

**Changes:**

- Import `cva` and `VariantProps` from `class-variance-authority`
- Define `bobbleheadCardVariants` with size variants (default, compact) and visual variants (default, featured)
- Add `variant` and `size` props to `BobbleheadGalleryCardProps` interface extending CVA variants
- Apply variant classes to the root Card component

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] CVA variants are properly typed
- [ ] Component accepts new `variant` and `size` props
- [ ] Existing functionality remains unchanged
- [ ] All validation commands pass

---

### Step 3: Redesign Card Header with Enhanced Typography and Metadata Badges

**What**: Refactor the CardHeader section with improved visual hierarchy, modern typography, and metadata badge integration.
**Why**: The current header lacks visual distinction and metadata badges. Modern UI patterns use badges to highlight key information at a glance, improving content scannability.
**Confidence**: High

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` - Restructure CardHeader section

**Changes:**

- Import `Badge` component from `@/components/ui/badge`
- Restructure CardHeader layout using flexbox for better alignment
- Add gradient text effect to bobblehead name using `bg-gradient-to-r` and `bg-clip-text`
- Display subcollection as a Badge with `secondary` variant instead of plain text link
- Add FolderIcon inside the badge for visual consistency
- Increase header padding and add subtle bottom border separator
- Ensure proper text truncation with `line-clamp-1` and `truncate` classes
- Add proper accessible labels to interactive elements

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Header displays bobblehead name with enhanced typography
- [ ] Subcollection displays as styled badge
- [ ] Visual hierarchy is improved
- [ ] All validation commands pass

---

### Step 4: Enhance Photo Container with Modern Overlay and Interaction Effects

**What**: Redesign the photo container section with refined overlay gradients, improved loading states, and polished hover interactions.
**Why**: The photo is the primary visual element and needs sophisticated presentation. Enhanced overlays and transitions create a premium feel while maintaining usability.
**Confidence**: High

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` - Update photo container section

**Changes:**

- Change photo container background to use a subtle gradient instead of solid `bg-muted`
- Add rounded corners to the photo container section using `rounded-lg overflow-hidden`
- Implement gradient overlay at bottom for better text contrast using `bg-gradient-to-t from-black/60 via-black/20 to-transparent`
- Enhance hover state with `ring-2 ring-primary/50` effect on focus
- Improve "View Gallery" overlay with frosted glass effect using `backdrop-blur-sm`
- Add photo count indicator badge in top-right corner when multiple photos exist
- Refine image scale animation from `scale-105` to `scale-[1.03]` for subtler effect
- Add subtle shadow on the image container

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Photo container has refined visual treatment
- [ ] Hover effects are smooth and polished
- [ ] Photo count indicator displays when applicable
- [ ] Focus states are accessible and visible
- [ ] All validation commands pass

---

### Step 5: Redesign Navigation Controls with Improved Visibility and Accessibility

**What**: Enhance the previous/next photo navigation controls and dot indicators with better visual design and accessibility.
**Why**: Navigation controls need to be clearly visible against varying image backgrounds while maintaining accessibility standards and providing smooth interactions.
**Confidence**: High

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` - Update navigation controls section

**Changes:**

- Style navigation buttons with frosted glass background using `bg-white/90 dark:bg-black/70 backdrop-blur-sm`
- Add subtle shadow to buttons for depth: `shadow-md`
- Increase button touch target size with proper padding
- Enhance dot indicators with improved contrast and larger active state
- Add keyboard focus indicators using `focus-visible:ring-2 focus-visible:ring-white`
- Implement smooth fade-in animation for controls on hover
- Add screen reader announcements for current photo position

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Navigation controls are clearly visible on all image backgrounds
- [ ] Buttons have proper focus states for keyboard navigation
- [ ] Touch targets meet accessibility size requirements (44x44px minimum)
- [ ] Screen readers announce photo navigation context
- [ ] All validation commands pass

---

### Step 6: Redesign CardContent Section with Improved Description Layout

**What**: Enhance the description section with better typography, spacing, and visual treatment.
**Why**: The description area needs better visual hierarchy and more refined spacing to improve readability and overall card aesthetics.
**Confidence**: High

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` - Update CardContent section

**Changes:**

- Adjust CardContent padding for better visual balance
- Change description typography to use `text-sm leading-relaxed` for improved readability
- Add empty state visual treatment when no description exists (show subtle placeholder text)
- Reduce line-clamp from 3 to 2 lines with ellipsis for cleaner appearance
- Add subtle top border using `border-t border-border/50` for section separation
- Implement smooth height transition for consistent card sizing

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Description text is more readable
- [ ] Empty description state is handled gracefully
- [ ] Section has proper visual separation
- [ ] All validation commands pass

---

### Step 7: Redesign CardFooter with Enhanced Action Bar Layout

**What**: Refactor the CardFooter with improved visual organization, better button styling, and enhanced interaction patterns.
**Why**: The footer contains primary actions and needs clear visual hierarchy. Modern card designs group related actions and provide clear visual cues for interactivity.
**Confidence**: High

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` - Restructure CardFooter section

**Changes:**

- Import `Tooltip`, `TooltipContent`, `TooltipTrigger` from tooltip component
- Reorganize footer layout with flexbox justify-between and items-center
- Group Like and Share buttons in a left-aligned container with `gap-1`
- Style Like button with subtle background on hover state
- Wrap Share button in Tooltip showing "Share bobblehead"
- Style "View Details" button with primary variant and subtle gradient
- Add subtle background color to action area
- Wrap action menu button in Tooltip showing "More options"
- Ensure all interactive elements have proper hover and focus states

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Footer actions are clearly organized
- [ ] Tooltips provide helpful context
- [ ] Button hierarchy is clear (primary vs secondary actions)
- [ ] All validation commands pass

---

### Step 8: Implement Card-Level Hover and Focus Effects

**What**: Add polished card-level interaction states including lift effect, shadow transitions, and border highlights.
**Why**: Card-level feedback creates visual affordance indicating interactivity and provides a cohesive, premium feel to the UI.
**Confidence**: High

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` - Update root Card element styling

**Changes:**

- Update Card className to include `transition-all duration-300 ease-out`
- Add hover state: `hover:shadow-xl hover:-translate-y-1 hover:border-primary/20`
- Add focus-within state for keyboard navigation: `focus-within:ring-2 focus-within:ring-primary/50`
- Change fixed height from `h-[580px]` to use `min-h-[580px]` with flex-grow for content
- Add subtle border color change on hover
- Ensure smooth animation timing using `ease-out` curve

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Card has smooth lift animation on hover
- [ ] Shadow transitions are fluid
- [ ] Focus state is visible for accessibility
- [ ] Card maintains consistent sizing
- [ ] All validation commands pass

---

### Step 9: Update Loading Skeleton to Match New Card Design

**What**: Redesign the skeleton loading component to accurately reflect the new card structure and proportions.
**Why**: Loading skeletons should mirror the final layout to prevent jarring visual shifts when content loads, improving perceived performance.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/collections/[collectionSlug]/(collection)/components/skeletons/bobblehead-card-skeleton.tsx` - Update skeleton structure

**Changes:**

- Update Card wrapper with same styling as actual card (rounded corners, shadow)
- Restructure CardHeader skeleton to match new header layout with badge placeholder
- Add skeleton for photo count indicator in top-right corner
- Adjust CardContent skeleton proportions to match redesigned description area
- Update CardFooter skeleton to reflect new action bar layout
- Ensure skeleton element sizes match actual component dimensions
- Add shimmer animation to skeleton elements for better loading indication

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Skeleton accurately reflects new card layout
- [ ] Skeleton dimensions match actual card dimensions
- [ ] Loading shimmer animation is visible
- [ ] All validation commands pass

---

### Step 10: Update Grid Container Spacing and Responsiveness

**What**: Refine the parent grid container to complement the new card design with appropriate spacing and responsive breakpoints.
**Why**: Card spacing affects visual rhythm and overall page aesthetics. The grid needs to accommodate the enhanced card shadows and hover effects without overlap.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobbleheads.tsx` - Update grid container classes

**Changes:**

- Increase gap between cards from `gap-6` to `gap-8` to accommodate lift/shadow effects
- Add padding to grid container bottom to prevent shadow clipping
- Ensure responsive columns adjust properly: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3`
- Maintain current section title and controls layout

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Grid spacing accommodates new card shadows
- [ ] Cards display properly at all breakpoints
- [ ] No visual overlap between adjacent cards
- [ ] All validation commands pass

---

### Step 11: Add Dark Mode Optimizations

**What**: Ensure all new visual elements have proper dark mode treatment with appropriate color adjustments.
**Why**: The project supports dark mode, and all visual enhancements must work correctly in both light and dark themes.
**Confidence**: High

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` - Add dark mode specific classes

**Changes:**

- Review and adjust all color values with `dark:` variants where needed
- Ensure gradient overlays have appropriate dark mode colors
- Verify frosted glass effects work in dark mode with proper opacity
- Adjust shadow colors for dark mode using `dark:shadow-xl` with appropriate colors
- Test hover state colors in dark mode
- Ensure badge variants display correctly in dark mode

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All visual elements render correctly in dark mode
- [ ] Contrast ratios meet accessibility standards in both modes
- [ ] Hover and focus states are visible in dark mode
- [ ] All validation commands pass

---

### Step 12: Final Accessibility Audit and ARIA Enhancements

**What**: Conduct comprehensive accessibility review and add any missing ARIA attributes or semantic improvements.
**Why**: Accessibility is a project requirement, and all visual changes must maintain or improve accessibility for users with assistive technologies.
**Confidence**: High

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` - Add ARIA attributes and semantic improvements

**Changes:**

- Add `aria-label` to card for screen reader context describing the bobblehead
- Ensure all interactive elements have proper `aria-label` or visible text
- Add `aria-live="polite"` to photo counter for announcing changes
- Verify focus order follows logical reading sequence
- Add `role="group"` to action button containers with `aria-label`
- Ensure color contrast meets WCAG 2.1 AA standards (4.5:1 for text)
- Add `title` attributes to truncated text elements for full text access
- Verify all icon-only buttons have accessible names

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All interactive elements are keyboard accessible
- [ ] Screen readers can navigate and understand card content
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] All files pass `npm run format`
- [ ] Card renders correctly in light mode
- [ ] Card renders correctly in dark mode
- [ ] Card is responsive across all breakpoints (mobile, tablet, desktop)
- [ ] Keyboard navigation works correctly through all interactive elements
- [ ] Loading skeleton accurately reflects final card layout
- [ ] Photo carousel functionality is preserved
- [ ] All existing data flows work correctly (likes, shares, delete, navigation)

## Notes

**Architectural Decisions (High Confidence):**
- Using CVA for variant management aligns with existing project patterns (badge, button components)
- Keeping all changes within existing component files minimizes risk and maintains architecture
- Using Tailwind CSS utilities over custom CSS where possible for maintainability

**Risk Mitigation:**
- The redesign is purely visual with no changes to data fetching, actions, or business logic
- Existing test IDs are preserved to maintain test compatibility
- All changes are backwards compatible with existing props interface

**Performance Considerations:**
- New animations use GPU-accelerated properties (transform, opacity)
- No additional JavaScript runtime overhead beyond existing functionality
- CSS animations are lightweight and performant

**Testing Recommendations:**
- Manual visual testing across light/dark modes
- Keyboard navigation testing
- Screen reader testing with VoiceOver/NVDA
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Responsive testing at key breakpoints (375px, 768px, 1024px, 1440px)

---

## File Discovery Summary

### Critical Priority (Must Modify)
- `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` - Primary card component
- `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobbleheads.tsx` - Parent grid
- `src/app/(app)/collections/[collectionSlug]/(collection)/components/skeletons/bobblehead-card-skeleton.tsx` - Loading skeleton

### High Priority (UI Components to Use)
- `src/components/ui/card.tsx` - Base Card component
- `src/components/ui/badge.tsx` - CVA badges
- `src/components/ui/button.tsx` - CVA buttons
- `src/components/ui/tooltip.tsx` - Tooltips
- `src/components/ui/like-button.tsx` - Like variants

### Medium Priority (Context)
- `src/app/globals.css` - CSS animations
- `src/lib/validations/bobbleheads.validation.ts` - Type definitions

---

*Generated by /plan-feature orchestrator on 2025-01-23*
