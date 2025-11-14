# Implementation Plan: Smooth Fade-in and Slide-up Animations

**Generated**: 2025-11-12T00:04:30Z
**Original Request**: Smooth fade-in and slide-up animations with cascade timing
**Status**: Ready for Implementation

---

## Overview

**Estimated Duration**: 2-3 days
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

Implement smooth, accessible fade-in and slide-up animations across the Head Shakers application using Tailwind CSS 4's animation capabilities, custom keyframes, and the existing tw-animate-css library. Animations will be applied to page loads, modals, cards, and list items with intelligent cascade timing and accessibility considerations for users with motion preferences.

## Prerequisites

- [ ] Verify tw-animate-css library is properly configured and working
- [ ] Review existing animation patterns in dialog.tsx and globals.css
- [ ] Test current motion preference detection in browser
- [ ] Ensure all target components are identified and accessible

## Implementation Steps

### Step 1: Define Core Animation Keyframes and Utilities

**What**: Create reusable fade-in and slide-up keyframe definitions in globals.css
**Why**: Establishes the foundation for consistent animations across the entire application
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\globals.css` - Add custom keyframes and utility classes for fade-in, slide-up, and cascade animations

**Changes:**

- Add keyframe definitions for fade-in animation with opacity transitions
- Add keyframe definitions for slide-up animation with transform and opacity
- Add keyframe definitions for fade-slide-up combining both effects
- Create utility classes for animation durations (300ms, 500ms, 700ms)
- Create utility classes for animation delays for cascade effects (100ms, 200ms, 300ms, 400ms, 500ms)
- Add motion-safe variants to ensure animations respect prefers-reduced-motion
- Create stagger delay utilities for list item cascades

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Keyframes are defined for fade-in, slide-up, and combined animations
- [ ] Utility classes are created for various durations and delays
- [ ] Motion-safe variants are properly configured
- [ ] All validation commands pass

---

### Step 2: Update Base UI Card Component with Animation Support

**What**: Enhance the card.tsx component to support optional fade-in animations
**Why**: Cards are used throughout the application and need consistent animation support
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\card.tsx` - Add optional animation props and classes

**Changes:**

- Add optional isAnimated boolean prop to Card component with default false
- Add optional animationDelay prop for cascade effects
- Apply motion-safe fade-slide-up animation classes when isAnimated is true
- Add animation delay classes based on animationDelay prop
- Ensure animations trigger on mount without requiring state changes

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Card component accepts isAnimated and animationDelay props
- [ ] Animation classes are conditionally applied based on props
- [ ] TypeScript types are properly defined for new props
- [ ] All validation commands pass

---

### Step 3: Update Dialog Components with Enhanced Animations

**What**: Enhance dialog animations to be smoother and more consistent
**Why**: Dialogs already have animations but they need to be unified with the new animation system
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\dialog.tsx` - Replace existing animation classes with new unified system
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\alert-dialog.tsx` - Apply consistent animation patterns

**Changes:**

- Replace data-state animation classes in DialogContent with new fade-slide-up keyframes
- Update animation timing to use 300ms duration for smoother feel
- Ensure DialogOverlay uses consistent fade-in animation
- Add motion-safe variants to all dialog animations
- Update alert-dialog components with matching animation patterns
- Maintain existing zoom animations but ensure timing consistency

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Dialog animations use new unified keyframes
- [ ] Animation timing is consistent across all dialog types
- [ ] Motion-safe variants are applied
- [ ] Existing functionality is preserved
- [ ] All validation commands pass

---

### Step 4: Implement Animations for Bobblehead Gallery Cards

**What**: Add fade-in animations to BobbleheadGalleryCard with cascade timing
**Why**: Gallery cards are central to the user experience and benefit from smooth entrance animations
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\bobblehead\bobblehead-gallery-card.tsx` - Add animation support using updated Card component

**Changes:**

- Add isAnimated prop set to true when rendering Card
- Calculate and apply animationDelay based on card index in parent grid
- Ensure animations trigger on initial render
- Preserve all existing hover and interaction animations
- Test that animations do not interfere with photo gallery modal opening

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Cards animate on initial page load
- [ ] Cascade timing creates staggered effect
- [ ] Existing hover effects are preserved
- [ ] No interference with modal interactions
- [ ] All validation commands pass

---

### Step 5: Implement Animations for Collection Cards

**What**: Add fade-in animations to CollectionCard components with cascade timing
**Why**: Collection cards appear in grids and lists, requiring smooth entrance animations
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\dashboard\collection\(collection)\components\collection-card.tsx` - Add animation support
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\dashboard\collection\(collection)\components\collections-tab-content.tsx` - Pass animation index to cards

**Changes:**

- Update CollectionCard to accept isAnimated and animationDelay props
- Apply animation props to root Card component
- Modify collections-tab-content.tsx to pass card index for cascade calculation
- Calculate stagger delay as index multiplied by 100ms with maximum of 500ms
- Ensure animations work with collapsible subcollections section

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Collection cards animate with cascade effect
- [ ] Stagger timing feels natural (not too slow or fast)
- [ ] Animation props flow correctly from parent to child
- [ ] Collapsible sections work without animation conflicts
- [ ] All validation commands pass

---

### Step 6: Implement Animations for Featured Content Display

**What**: Add fade-in animations to FeaturedHeroDisplay cards with proper cascade timing
**Why**: Featured content is prominently displayed and benefits from polished entrance animations
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\featured\components\display\featured-hero-display.tsx` - Add animation support to featured cards

**Changes:**

- Update renderFeaturedCard function to accept animation index parameter
- Apply motion-safe fade-slide-up classes to Card components in renderFeaturedCard
- Calculate animation delay based on card position (hero banner first, then collection of week)
- Use 200ms stagger for hero content since there are fewer items
- Ensure animations apply to both hero and standard featured cards
- Maintain responsive grid layout without animation interference

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Featured cards animate smoothly on page load
- [ ] Hero banner animates before collection of week cards
- [ ] Stagger timing feels appropriate for content hierarchy
- [ ] Responsive layout functions correctly with animations
- [ ] All validation commands pass

---

### Step 7: Implement Animations for Bobblehead Detail Page Cards

**What**: Add fade-in animations to detail page information cards with cascade timing
**Why**: Detail pages contain multiple information cards that should animate in sequence
**Confidence**: Medium

**Files to Create:**

- None

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\bobblehead-feature-card.tsx` - Add animation support
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\bobblehead-details-card.tsx` - Add animation support
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\bobblehead-specification-card.tsx` - Add animation support
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\bobblehead-acquisition-card.tsx` - Add animation support
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\bobblehead-custom-fields-card.tsx` - Add animation support
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\bobblehead-status-privacy-card.tsx` - Add animation support
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\bobblehead-timestamps-card.tsx` - Add animation support

**Changes:**

- Add motion-safe animation classes directly to Card components in each file
- Use fixed animation delays based on typical card display order (feature: 0ms, details: 100ms, specs: 200ms, acquisition: 300ms, custom: 400ms, status: 500ms, timestamps: 600ms)
- Ensure animations do not interfere with server component rendering
- Apply consistent animation duration of 500ms across all detail cards
- Consider using CSS-based animations to avoid hydration issues with server components

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Detail cards animate in logical sequence top to bottom
- [ ] Animation timing feels smooth and not rushed
- [ ] Server component rendering is not affected
- [ ] No hydration mismatches occur
- [ ] All validation commands pass

---

### Step 8: Implement Animations for Async Card Wrappers

**What**: Add animation support to async card container components
**Why**: Async wrappers control the loading and rendering of card groups on detail pages
**Confidence**: Medium

**Files to Create:**

- None

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\async\bobblehead-feature-card-async.tsx` - Add animation coordination
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\async\bobblehead-detail-cards-async.tsx` - Add animation coordination
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\async\bobblehead-secondary-cards-async.tsx` - Add animation coordination

**Changes:**

- Wrap async component containers with motion-safe animation wrapper classes
- Ensure animation classes are applied to parent containers that hold multiple cards
- Pass appropriate animation delay props to child components
- Coordinate cascade timing across async boundaries
- Handle loading states without triggering animations during skeleton to content transitions

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Animations trigger after async content loads
- [ ] No animation flicker during skeleton to content transition
- [ ] Cascade timing flows naturally across async boundaries
- [ ] Loading states do not cause animation replay
- [ ] All validation commands pass

---

### Step 9: Create Reusable Animation Hook for Complex Cases

**What**: Create a custom React hook for managing scroll-triggered and intersection-based animations
**Why**: Some components may need animations triggered by viewport intersection for performance
**Confidence**: Medium

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\hooks\use-animation-on-view.ts` - Custom hook for intersection observer-based animations

**Files to Modify:**

- None

**Changes:**

- Create custom hook that uses Intersection Observer API
- Accept threshold, root margin, and animation class parameters
- Return ref to attach to animated element and isVisible state
- Include motion preference detection to disable animations when prefers-reduced-motion is set
- Implement cleanup for observer on unmount
- Add TypeScript types for all parameters and return values
- Include error handling for browsers without Intersection Observer support

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Hook properly implements Intersection Observer
- [ ] Motion preferences are respected
- [ ] Memory leaks are prevented with proper cleanup
- [ ] TypeScript types are comprehensive and accurate
- [ ] Browser compatibility fallback is implemented
- [ ] All validation commands pass

---

### Step 10: Apply Scroll-Triggered Animations to Long Lists

**What**: Use the animation hook for long lists of items like search results and browse pages
**Why**: Performance optimization for pages with many items by animating only visible content
**Confidence**: Low

**Files to Create:**

- None

**Files to Modify:**

- Identify parent components that render long lists of cards (to be determined during implementation based on performance testing)

**Changes:**

- Apply use-animation-on-view hook to list item wrappers in identified components
- Set appropriate intersection observer thresholds (10% visibility recommended)
- Configure root margin to trigger animations slightly before items enter viewport
- Ensure animations work with pagination and infinite scroll if present
- Test performance impact and adjust observer configuration as needed
- Add fallback for initial viewport items to animate immediately without intersection

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Scroll-triggered animations activate at appropriate viewport positions
- [ ] No performance degradation on pages with many items
- [ ] Initial viewport items animate immediately on page load
- [ ] Observer cleanup prevents memory leaks during navigation
- [ ] All validation commands pass

---

### Step 11: Add Animation Support to Skeleton Components

**What**: Ensure skeleton loading states transition smoothly to animated content
**Why**: Prevents jarring transitions when content loads and maintains animation consistency
**Confidence**: Medium

**Files to Create:**

- None

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\skeletons\bobblehead-feature-card-skeleton.tsx` - Add fade-out capability
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\skeletons\bobblehead-detail-cards-skeleton.tsx` - Add fade-out capability
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\skeletons\bobblehead-secondary-cards-skeleton.tsx` - Add fade-out capability
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\featured\components\skeletons\featured-card-skeleton.tsx` - Add fade-out capability
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collections\[collectionId]\(collection)\components\skeletons\bobblehead-card-skeleton.tsx` - Add fade-out capability
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\dashboard\collection\(collection)\components\skeletons\collection-card-skeleton.tsx` - Add fade-out capability

**Changes:**

- Add optional isExiting prop to skeleton components with default false
- Apply fade-out animation class when isExiting is true
- Set fade-out duration to 200ms for quick exit
- Ensure skeletons respect motion preferences
- Coordinate skeleton exit timing with content entrance animations
- Consider using React Suspense boundaries for automatic transition coordination

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Skeleton components can fade out smoothly
- [ ] Content animations trigger as skeletons exit
- [ ] No visual gap between skeleton exit and content entrance
- [ ] Motion preferences are respected
- [ ] All validation commands pass

---

### Step 12: Test Accessibility and Motion Preferences

**What**: Comprehensive testing of prefers-reduced-motion support and ARIA attributes
**Why**: Ensures animations are accessible and respect user preferences for motion sensitivity
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- Review all modified component files to ensure motion-safe classes are correctly applied

**Changes:**

- Verify all animations use motion-safe variants that respect prefers-reduced-motion
- Test with browser developer tools forcing prefers-reduced-motion media query
- Ensure reduced motion mode shows content immediately without animations
- Verify ARIA live regions are not affected by animation timing
- Confirm focus management is not disrupted by animations
- Test keyboard navigation during animated transitions
- Validate screen reader announcements are not delayed by animations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All animations respect prefers-reduced-motion setting
- [ ] Content is immediately visible with reduced motion enabled
- [ ] Focus management works correctly during animations
- [ ] Screen readers announce content without timing issues
- [ ] Keyboard navigation is unaffected by animations
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Visual regression testing shows smooth animations across all components
- [ ] Animation performance is acceptable (no frame drops, smooth 60fps)
- [ ] Prefers-reduced-motion setting is respected throughout application
- [ ] No hydration errors or console warnings in browser
- [ ] Animations feel cohesive and consistent across the entire application
- [ ] Cascade timing feels natural (not too slow or too fast)
- [ ] All dialog and modal animations work smoothly
- [ ] Page load animations do not interfere with interactive elements

## Notes

**Animation Timing Philosophy:**

- Base duration: 300-500ms for most animations (feels smooth without being slow)
- Cascade stagger: 100-200ms between items (creates rhythm without excessive delay)
- Maximum total cascade time: 500-600ms (prevents users waiting too long for content)
- Dialog animations: 200-300ms (quick but noticeable)

**Performance Considerations:**

- Use CSS animations and transforms for hardware acceleration
- Prefer opacity and transform properties over layout-affecting properties
- Consider intersection observer for long lists to prevent animating off-screen content
- Test on lower-powered devices to ensure smooth performance

**Browser Compatibility:**

- Tailwind CSS 4 animations work in all modern browsers
- Intersection Observer has fallback for older browsers in custom hook
- prefers-reduced-motion is supported in all modern browsers with graceful fallback

**Assumptions Requiring User Confirmation:**

- Assumption: 300-500ms duration is appropriate for card animations (user may prefer faster/slower)
- Assumption: 100-200ms cascade stagger creates desired effect (may need adjustment based on visual design preferences)
- Assumption: All cards should animate by default (user may want to enable selectively)
- Assumption: Scroll-triggered animations are desired for long lists (may prefer immediate animation for all content)

---

## File Discovery Analysis

### Total Files Discovered: 32

**Critical Priority (3 files)**:

- globals.css - Primary CSS configuration
- postcss.config.mjs - PostCSS configuration
- tailwind-utils.ts - Class merging utility

**High Priority (14 files)**:

- UI Components: card.tsx, dialog.tsx, alert-dialog.tsx, skeleton.tsx
- Feature Components: bobblehead-gallery-card.tsx, collection-card.tsx, search-result-item.tsx, comment-list.tsx
- Page Components: featured page, hero display, collection detail, dashboard
- Tab Content: collections-tab-content.tsx, bobbleheads-tab-content.tsx

**Medium Priority (11 files)**:

- Layout components: content-layout.tsx, page-content.tsx
- Supporting UI: popover.tsx, tooltip.tsx, tabs.tsx, dropdown-menu.tsx, select.tsx, navigation-menu.tsx
- Featured content display components

**Low Priority (4 files)**:

- hover-card.tsx, conditional.tsx, and other utility components

### Existing Animation Patterns:

- Radix UI data-[state] variants in dialog components
- Custom keyframe (caret-blink) in globals.css
- tw-animate-css library imported
- Skeleton animate-pulse loading states

---

## Implementation Readiness

✅ **Ready for Implementation**: This plan is comprehensive and actionable
✅ **All Prerequisites Identified**: tw-animate-css, existing patterns documented
✅ **Clear Success Criteria**: Each step has validation and success criteria
✅ **Risk Mitigation**: Low risk with existing patterns to build upon
✅ **Accessibility Considered**: Dedicated testing step for motion preferences
✅ **Performance Optimized**: Intersection observer strategy for long lists

**Next Steps**: Begin implementation with Step 1 (Define Core Animation Keyframes)
