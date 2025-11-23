# Implementation Plan: Bobblehead Details Image Carousel UI/UX Enhancement

**Generated**: 2025-01-23
**Original Request**: Improve the visual appeal and general UI/UX of the bobblehead details pages image carousels
**Refined Request**: Enhance the visual appeal and overall UI/UX of the bobblehead details page image carousels by improving the existing Embla Carousel implementation located in the feature components under src/components/feature/. The current carousel should be refined with smoother transitions, better visual feedback for navigation controls, and improved thumbnail strip interactions that clearly indicate the active image state. Implement polished carousel navigation using Lucide React icons for previous/next buttons with appropriate hover and focus states styled through Tailwind CSS 4 and Class Variance Authority for consistent variant management. Add subtle entrance animations for carousel slides and consider implementing a lightbox modal using Radix UI Dialog for full-screen image viewing that maintains keyboard navigation and accessibility standards. Optimize the visual presentation of Cloudinary-served images by leveraging next-cloudinary's CldImage component with appropriate responsive sizing, lazy loading, and blur placeholder support to improve perceived performance during image transitions.

## Analysis Summary

- Feature request refined with project context
- Discovered 17 files across multiple directories
- Generated 9-step implementation plan

## File Discovery Results

### Critical Priority (Must Modify)

| File                                                                                                             | Purpose                                                      |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/components/ui/carousel.tsx`                                                                                 | Core Embla Carousel wrapper - add animations, dot indicators |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-primary-image.tsx` | Main image display - add transitions, blur placeholders      |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-image-gallery.tsx` | Thumbnail strip - add scroll-snap, improve active states     |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-feature-card.tsx`                 | Main container - extract lightbox, improve modal             |
| `src/components/feature/bobblehead/bobblehead-photo-gallery-modal.tsx`                                           | Lightbox modal - add entrance animations, improve dots       |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-photo-gallery.tsx`                | Photo gallery card - add entrance animations                 |

### High Priority (Supporting)

- `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` - Consistent styling needed
- `src/components/ui/dialog.tsx` - Base Radix Dialog
- `src/components/ui/button.tsx` - Base button with CVA variants

---

## Implementation Plan

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

This plan enhances the visual appeal and user experience of the bobblehead details page image carousels by improving Embla Carousel transitions, adding blur placeholder support for CldImage, implementing polished dot indicators with CVA variants, creating smoother thumbnail strip interactions with scroll-snap behavior, and refining the lightbox modal with entrance animations and improved accessibility.

## Prerequisites

- [ ] Verify embla-carousel-react ^8.6.0 is installed
- [ ] Verify next-cloudinary ^6.16.2 supports blur placeholder feature
- [ ] Verify tw-animate-css ^1.4.0 provides necessary animation utilities
- [ ] Confirm no breaking changes in existing carousel implementations

## Implementation Steps

### Step 1: Extend Core Carousel Component with Dot Indicators and Animation Support

**What**: Add CarouselDots component with CVA variants, expose selectedIndex state, and add slide animation classes to the base carousel.
**Why**: The core carousel lacks dot indicators and animation hooks needed by all consuming components.
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/components/ui/carousel.tsx` - Add CarouselDots component, selectedIndex state, animation classes

**Changes:**

- Add useState for selectedIndex tracking with useEffect to sync with Embla API select event
- Create CarouselDots component using CVA for size and color variants
- Export selectedIndex from CarouselContext for external consumption
- Add data-active attribute support for active slide styling
- Enhance CarouselPrevious and CarouselNext with improved hover/focus states using transition classes
- Add smooth transition CSS classes to CarouselContent for slide animations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] CarouselDots component renders with correct variant support
- [ ] selectedIndex accurately reflects current slide position
- [ ] Navigation buttons have smooth hover/focus transitions
- [ ] All validation commands pass

---

### Step 2: Add Carousel-Specific CSS Animation Keyframes

**What**: Define custom keyframes for carousel slide entrance animations, dot pulse effects, and thumbnail highlight transitions.
**Why**: tw-animate-css provides base animations but carousel-specific effects need custom keyframes for polished interactions.
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/app/globals.css` - Add carousel animation keyframes and utilities

**Changes:**

- Add @keyframes carousel-fade-in for slide entrance animation
- Add @keyframes carousel-scale-in for zoom entrance effect
- Add @keyframes dot-pulse for active dot indicator animation
- Create @utility classes for animate-carousel-fade-in, animate-carousel-scale-in, animate-dot-pulse
- Add scroll-snap-type and scroll-snap-align utilities for thumbnail strip

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Keyframes compile without CSS errors
- [ ] Animation utilities are accessible via Tailwind classes
- [ ] Scroll-snap utilities work correctly
- [ ] All validation commands pass

---

### Step 3: Enhance Feature Card Primary Image with Blur Placeholders and Transitions

**What**: Add CldImage blur placeholder support, implement smooth fade-in transitions on image load, and improve navigation button visibility states.
**Why**: Blur placeholders improve perceived performance during image loading, and smooth transitions create a more polished experience.
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-primary-image.tsx` - Add blur placeholder, loading states, transition effects

**Changes:**

- Add useState for image loading state to track when blur placeholder should show
- Add blurDataURL prop to CldImage using Cloudinary's blur transformation
- Implement fade-in transition when image loads using opacity transition
- Enhance navigation button visibility with always-visible semi-transparent state on mobile, fade-on-hover on desktop
- Add scale transition on image hover for subtle zoom effect
- Improve photo counter badge with backdrop-blur for better readability

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Blur placeholder displays during image load
- [ ] Image fades in smoothly when loaded
- [ ] Navigation buttons have improved visibility on mobile
- [ ] Photo counter has improved visual contrast
- [ ] All validation commands pass

---

### Step 4: Improve Feature Card Image Gallery Thumbnail Strip

**What**: Add scroll-snap behavior for precise thumbnail positioning, implement smooth scroll animation, and enhance active thumbnail visual feedback.
**Why**: Thumbnail navigation should feel precise and tactile with clear visual indication of the selected image.
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-image-gallery.tsx` - Add scroll-snap, improved active states, smooth scrolling

**Changes:**

- Add scroll-snap-type: x mandatory to thumbnail strip container
- Add scroll-snap-align: start to each thumbnail button
- Implement useRef and scrollIntoView to auto-scroll to selected thumbnail when changed externally
- Enhance selected thumbnail with scale transform and shadow elevation
- Add transition-all with duration-200 for smooth state changes
- Improve thumbnail opacity transition from 0.6 to 1.0 on selection
- Add subtle border-2 border-transparent hover:border-primary/50 for hover state

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Thumbnail strip snaps to thumbnail boundaries when scrolling
- [ ] Selected thumbnail auto-scrolls into view
- [ ] Active thumbnail has clear visual distinction with scale and shadow
- [ ] Hover states provide appropriate feedback
- [ ] All validation commands pass

---

### Step 5: Extract and Enhance Feature Card Lightbox Modal

**What**: Extract the inline modal from bobblehead-feature-card.tsx into a dedicated component with entrance animations, improved dot indicators, and enhanced navigation.
**Why**: The lightbox modal is duplicated between feature card and photo gallery; extracting creates reusability and allows focused enhancement.
**Confidence**: Medium

**Files to Create:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-lightbox-modal.tsx` - New dedicated lightbox component

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-feature-card.tsx` - Replace inline modal with new component

**Changes:**

- Create FeatureCardLightboxModal component with props for photos, currentIndex, onClose, onIndexChange
- Add DialogContent entrance animation using data-[state=open]:animate-carousel-scale-in
- Implement dot indicators using the pattern from bobblehead-photo-gallery-modal
- Add smooth image transition using opacity change and transform on index change
- Include touch swipe gesture support using onTouchStart/onTouchEnd handlers
- Maintain keyboard navigation (ArrowLeft, ArrowRight, Escape) accessibility
- Import and use new component in bobblehead-feature-card.tsx
- Remove inline modal JSX from bobblehead-feature-card.tsx

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New lightbox component renders correctly
- [ ] Modal has entrance animation on open
- [ ] Dot indicators show current position clearly
- [ ] Touch swipe gestures work on mobile
- [ ] Keyboard navigation maintains accessibility
- [ ] Feature card uses new extracted component
- [ ] All validation commands pass

---

### Step 6: Enhance Bobblehead Photo Gallery Modal

**What**: Improve the existing photo gallery modal with entrance animations, enhanced dot indicators with CVA styling, and smoother image transitions.
**Why**: Maintains consistency with feature card lightbox improvements and provides a polished full-screen viewing experience.
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-photo-gallery-modal.tsx` - Add animations, improve dots, enhance transitions

**Changes:**

- Add entrance animation to DialogContent using animate-in with zoom-in-95 and fade-in-0
- Enhance dot indicator buttons with CVA variants for size (sm, default, lg)
- Add pulse animation to active dot using animate-dot-pulse
- Implement image crossfade transition using opacity and position absolute stacking
- Add preload for adjacent images to improve perceived performance
- Enhance navigation buttons with scale transform on hover
- Add gradient overlay fade animation when entering

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Modal has smooth entrance animation
- [ ] Dot indicators have clear active state with pulse
- [ ] Images transition smoothly without flicker
- [ ] Adjacent images preload for faster navigation
- [ ] Navigation buttons have hover scale effect
- [ ] All validation commands pass

---

### Step 7: Enhance Bobblehead Photo Gallery Card Grid

**What**: Add entrance animations to grid items, improve hover states, and enhance the modal trigger interaction.
**Why**: The photo gallery grid serves as the entry point to the lightbox; polished interactions set expectations for the modal experience.
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-photo-gallery.tsx` - Add staggered entrance, improved hover, better modal trigger

**Changes:**

- Add staggered entrance animation to grid items using animation-delay based on index
- Enhance image hover with smoother scale transition and overlay darkening
- Add focus-visible ring styles to grid items for keyboard accessibility
- Implement image loading state with blur placeholder pattern from Step 3
- Improve modal trigger with visual feedback on click/touch
- Enhance modal dot indicators consistency with other components

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Grid items animate in with staggered timing
- [ ] Hover states are smooth and visually appealing
- [ ] Keyboard focus is clearly visible
- [ ] Images have blur placeholder during load
- [ ] Modal trigger provides clear feedback
- [ ] All validation commands pass

---

### Step 8: Update Bobblehead Gallery Card for Consistency

**What**: Apply consistent animation patterns, dot indicator styling, and navigation button improvements to match the enhanced feature card components.
**Why**: Gallery cards appear alongside feature cards and should have consistent visual language and interaction patterns.
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` - Update animations, dots, and navigation to match feature card

**Changes:**

- Update dot indicators to use same CVA styling pattern as other components
- Add entrance animation to image using animate-carousel-fade-in
- Enhance navigation buttons with consistent hover/active states
- Add blur placeholder pattern to CldImage for loading state
- Improve photo counter badge styling to match feature card primary image
- Add touch swipe support to photo navigation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Dot indicators match styling of other components
- [ ] Image has entrance animation
- [ ] Navigation buttons have consistent styling
- [ ] Blur placeholder displays during load
- [ ] Touch swipe works for photo navigation
- [ ] All validation commands pass

---

### Step 9: Integration Testing and Visual Verification

**What**: Verify all components work together correctly across different screen sizes and interaction modes.
**Why**: Individual component changes may interact in unexpected ways; integration testing ensures cohesive user experience.
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- None (testing only)

**Changes:**

- Test feature card primary image with blur placeholder on slow network
- Test thumbnail strip scroll-snap on mobile and desktop
- Test lightbox modal entrance animations and keyboard navigation
- Test photo gallery grid staggered animations
- Test gallery card consistency with feature card
- Verify touch gestures work on mobile devices
- Verify focus management and screen reader compatibility

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run test
```

**Success Criteria:**

- [ ] All carousel components render without errors
- [ ] Animations are smooth at 60fps
- [ ] Touch gestures work correctly on mobile
- [ ] Keyboard navigation is fully functional
- [ ] Screen reader can navigate carousel content
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Manual verification of blur placeholder behavior on slow network
- [ ] Manual verification of animation smoothness across browsers
- [ ] Manual verification of touch/swipe gestures on mobile
- [ ] Manual verification of keyboard accessibility
- [ ] Visual regression check for existing carousel functionality

## Notes

**Architectural Decisions:**

- CVA is used for dot indicator variants to maintain consistency with existing button.tsx pattern (Confidence: High)
- Touch swipe detection uses simple touch event handlers rather than a gesture library to minimize bundle size (Confidence: Medium)
- Blur placeholder uses Cloudinary's built-in transformation rather than next/image blurDataURL for consistency with existing CldImage usage (Confidence: High)

**Risk Considerations:**

- CldImage blur placeholder requires verifying next-cloudinary supports the placeholder prop; fallback is to use opacity transition only
- Scroll-snap may have inconsistent behavior across older browsers; progressive enhancement approach recommended
- Animation timing should be tested on lower-end devices to ensure performance

**Dependencies:**

- Steps 1-2 must be completed before Steps 3-8 as they provide foundational animations and components
- Step 5 depends on Step 3 patterns being established
- Step 9 depends on all other steps being complete
