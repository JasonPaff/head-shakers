# Home Page Visual Refresh - Implementation Plan

**Generated**: 2025-11-24
**Feature**: Home page visual upgrade with featured bobbleheads section
**Orchestration Logs**: [View orchestration details](../orchestration/home-page-redesign/00-orchestration-index.md)

## Original Request

```
The home page could use a stylistic upgrade. The feature collection cards are boring and generic. There should be a featured bobbleheads section below the feature collections. The home page overall should be better presented with a more colorful inviting look and feel.
```

## Refined Request

The home page requires a comprehensive visual refresh to create a more engaging and inviting user experience for bobblehead collectors. The current featured collection cards lack visual depth and personality; they should be redesigned using Tailwind CSS 4's advanced styling capabilities combined with Radix UI components to include hover effects, gradient overlays, and shadow transitions that showcase collection imagery from Cloudinary with optimized aspect ratios. A new featured bobbleheads section should be implemented directly below the featured collections, displaying individual bobblehead items in an attractive grid layout that highlights high-resolution product images, key specifications, and collector engagement metrics through cards built with Class Variance Authority to support multiple visual states and responsive sizes. The overall home page should adopt a vibrant, cohesive color palette that reflects the playful nature of bobblehead collecting, incorporating warm accent colors, subtle gradients, and increased whitespace to improve visual hierarchy and readability. All interactive elements should leverage Lucide React icons strategically throughout the design to guide user attention and improve navigation intuitiveness. The redesigned cards should support dynamic content loading with smooth transitions, use Cloudinary's built-in image transformation capabilities to serve appropriately sized and formatted images for different breakpoints, and implement skeleton loading states for better perceived performance. Consider introducing subtle animations using Tailwind's animation utilities and custom keyframes to create a more polished, premium feel while maintaining performance standards. The layout should be fully responsive using Tailwind's mobile-first approach, ensuring the vibrant design translates beautifully across all device sizes from mobile to desktop, and the color scheme should include accessible contrast ratios while maintaining visual appeal and creating a warm, welcoming atmosphere that encourages users to explore and engage with the bobblehead community.

---

## Analysis Summary

### File Discovery Results

- **Total Files Discovered**: 40 files across all architectural layers
- **Critical Priority Files**: 7 files requiring modification
- **New Components to Create**: 3 components
- **Supporting Files**: 30 reference and integration files

### Architecture Insights

- **Existing Patterns**: Server/Client component split with async data fetching
- **Styling System**: Tailwind CSS 4 with OKLCH color variables and custom animations
- **Image Handling**: Next Cloudinary with automatic optimization and transformations
- **Data Layer**: FeaturedContentFacade supports multiple content types including bobbleheads
- **UI Components**: Radix UI primitives with Class Variance Authority for variants

### Key Files Identified

**Critical Files (Modify):**

1. `src/app/(app)/(home)/page.tsx` - Main home page route
2. `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Current collection cards
3. `src/app/globals.css` - Global styles and animations
4. `src/lib/facades/featured-content/featured-content.facade.ts` - Data fetching facade

**New Components (Create):**

1. `src/app/(app)/(home)/components/async/featured-bobbleheads-async.tsx` - Server component for data fetching
2. `src/app/(app)/(home)/components/display/featured-bobbleheads-display.tsx` - Client component for display
3. `src/app/(app)/(home)/components/skeletons/featured-bobbleheads-skeleton.tsx` - Loading skeleton

---

# Implementation Plan

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

This plan redesigns the home page with enhanced visual depth using Tailwind CSS 4's OKLCH color system, Radix UI components, and optimized Cloudinary imagery. It includes refreshing existing featured collections cards with hover effects and gradients, implementing a new featured bobbleheads section with dynamic grid layouts, introducing a vibrant color palette with warm accents, and adding skeleton loading states with smooth animations for improved perceived performance.

## Prerequisites

- [ ] Verify Cloudinary integration is configured and working
- [ ] Confirm FeaturedContentFacade supports fetching individual bobbleheads
- [ ] Review existing color palette in globals.css to understand current theming
- [ ] Verify Class Variance Authority (CVA) is installed and functioning
- [ ] Ensure Lucide React icons package is available

## Implementation Steps

### Step 1: Analyze Current Architecture and Data Requirements

**What**: Review existing featured content data structure and identify what bobblehead data is available
**Why**: Must understand data shape before designing components to ensure all necessary fields are accessible
**Confidence**: High

**Files to Review:**

- `src/lib/facades/featured-content/featured-content.facade.ts` - Verify getFeaturedBobbleheads method exists or needs creation
- `src/lib/queries/featured-content/featured-content.queries.ts` - Check available query methods for bobbleheads
- `src/lib/db/schema/bobblehead.schema.ts` - Understand bobblehead data structure
- `src/lib/db/schema/featured-content.schema.ts` - Verify featured content types support bobbleheads

**Changes:**

- Document available data fields for featured bobbleheads (images, specs, engagement metrics)
- Identify if new facade methods or queries are needed for fetching featured bobbleheads
- Confirm Cloudinary URL structure for bobblehead images
- Note any missing data points required by design specifications

**Validation Commands:**

```bash
npm run typecheck
```

**Success Criteria:**

- [ ] Data structure for featured bobbleheads is documented
- [ ] Required facade methods identified or confirmed available
- [ ] Cloudinary image transformation requirements understood
- [ ] All files pass typecheck

---

### Step 2: Design Enhanced Color Palette and Animation System

**What**: Extend globals.css with new OKLCH color variables for warm accents, gradients, and animation keyframes
**Why**: Establishes the visual foundation for the vibrant, cohesive design system before component implementation
**Confidence**: High

**Files to Modify:**

- `src/app/globals.css` - Add new color variables and animation keyframes

**Changes:**

- Add warm accent color variables using OKLCH color space (oranges, warm yellows, coral tones)
- Define gradient color stops for card overlays and backgrounds
- Create custom keyframes for hover transitions, fade-ins, and shadow animations
- Add utility classes for increased whitespace and visual hierarchy
- Define responsive animation durations and easing functions
- Ensure all new colors meet WCAG AA contrast ratios for accessibility

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New color variables added with accessible contrast ratios
- [ ] Custom animation keyframes defined for smooth transitions
- [ ] Gradient utilities created for card overlays
- [ ] All validation commands pass
- [ ] No CSS syntax errors in globals.css

---

### Step 3: Create CVA Variants for Enhanced Card Components

**What**: Create reusable CVA variant definitions for featured collection and bobblehead cards
**Why**: Establishes consistent styling patterns with multiple visual states before implementing actual components
**Confidence**: High

**Files to Create:**

- `src/components/ui/variants/featured-card-variants.ts` - CVA definitions for card states

**Changes:**

- Define card base styles with enhanced shadows and borders
- Create hover state variants with gradient overlays and transforms
- Define size variants (small, medium, large) for responsive layouts
- Create loading state variants for skeleton components
- Add interaction state variants (default, hover, active, disabled)
- Define image overlay variants for different content types

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] CVA variants created with proper TypeScript types
- [ ] All visual states defined (default, hover, active, loading)
- [ ] Size variants support responsive breakpoints
- [ ] All validation commands pass
- [ ] No type errors in variant definitions

---

### Step 4: Enhance Featured Collections Display Component

**What**: Redesign featured-collections-display.tsx with new visual treatments, hover effects, and Cloudinary optimizations
**Why**: Updates existing featured collections section with the new design system before adding new sections
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Apply new card styles

**Changes:**

- Replace existing card styling with CVA variants from Step 3
- Add gradient overlay effects using new color palette
- Implement hover transforms with shadow transitions
- Integrate Lucide React icons for visual guidance
- Apply Cloudinary image transformations with responsive breakpoints
- Add smooth transition animations using Tailwind utilities
- Implement responsive grid layout with increased whitespace
- Update aspect ratios for collection imagery display
- Add engagement metrics display with icon integration

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Cards use new CVA variants with all states working
- [ ] Hover effects and transitions render smoothly
- [ ] Cloudinary images load with proper transformations
- [ ] Lucide icons integrated appropriately
- [ ] Responsive layout works across all breakpoints
- [ ] All validation commands pass

---

### Step 5: Create Featured Bobbleheads Facade Method

**What**: Add getFeaturedBobbleheads method to FeaturedContentFacade if not already present
**Why**: Provides data fetching capability for the new featured bobbleheads section
**Confidence**: Medium

**Files to Modify:**

- `src/lib/facades/featured-content/featured-content.facade.ts` - Add bobblehead fetching method
- `src/lib/queries/featured-content/featured-content.queries.ts` - Add supporting query if needed

**Changes:**

- Add getFeaturedBobbleheads method with proper error handling
- Include cache integration with appropriate TTL
- Add Sentry breadcrumbs for monitoring
- Implement permission filtering for visibility
- Return bobblehead data with images, specifications, and engagement metrics
- Add proper TypeScript return types
- Include pagination parameters for future expansion

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] getFeaturedBobbleheads method created or verified
- [ ] Method returns all required data fields
- [ ] Cache integration implemented correctly
- [ ] Error handling and monitoring in place
- [ ] All validation commands pass
- [ ] Return types properly defined

---

### Step 6: Create Featured Bobbleheads Skeleton Component

**What**: Create featured-bobbleheads-skeleton.tsx with loading state animations
**Why**: Improves perceived performance during data fetching for the new bobbleheads section
**Confidence**: High

**Files to Create:**

- `src/app/(app)/(home)/components/skeletons/featured-bobbleheads-skeleton.tsx` - Loading state component

**Changes:**

- Create skeleton component matching bobblehead card layout
- Use Skeleton UI component from component library
- Implement pulse animations using new keyframes
- Match grid layout of actual bobblehead display
- Add proper ARIA labels for accessibility
- Include responsive breakpoint handling
- Use CVA loading state variants

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Skeleton component matches bobblehead card dimensions
- [ ] Pulse animations render smoothly
- [ ] Accessibility attributes present
- [ ] Responsive layout matches display component
- [ ] All validation commands pass

---

### Step 7: Create Featured Bobbleheads Display Component

**What**: Create featured-bobbleheads-display.tsx as client component with interactive cards
**Why**: Implements the main visual display for featured bobbleheads with all interactive elements
**Confidence**: High

**Files to Create:**

- `src/app/(app)/(home)/components/display/featured-bobbleheads-display.tsx` - Client component for bobblehead cards

**Changes:**

- Create client component with 'use client' directive
- Implement grid layout using Tailwind responsive utilities
- Apply CVA card variants with all interaction states
- Add hover effects with gradient overlays and shadow transitions
- Integrate Cloudinary images with responsive transformations
- Display key specifications (series, year, manufacturer) with proper typography
- Show engagement metrics (likes, views) with Lucide icons
- Implement smooth animations for card transitions
- Add proper aspect ratio handling for product images
- Include accessibility attributes and keyboard navigation
- Use $path for internal navigation links
- Integrate LikeButton component for engagement

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Grid layout renders responsively across breakpoints
- [ ] All card states (default, hover, active) work correctly
- [ ] Images load with proper Cloudinary transformations
- [ ] Engagement metrics display with appropriate icons
- [ ] Animations and transitions perform smoothly
- [ ] Keyboard navigation and accessibility work properly
- [ ] All validation commands pass

---

### Step 8: Create Featured Bobbleheads Async Server Component

**What**: Create featured-bobbleheads-async.tsx to handle data fetching and loading states
**Why**: Separates server-side data fetching from client-side interactivity following Next.js patterns
**Confidence**: High

**Files to Create:**

- `src/app/(app)/(home)/components/async/featured-bobbleheads-async.tsx` - Server component wrapper

**Changes:**

- Create async server component for data fetching
- Call getFeaturedBobbleheads from FeaturedContentFacade
- Implement Suspense boundary with skeleton fallback
- Handle empty state when no featured bobbleheads exist
- Pass fetched data to display component as props
- Add proper error boundary handling
- Include section heading with Lucide icons
- Implement conditional rendering based on data availability

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Server component fetches data correctly
- [ ] Suspense boundary shows skeleton during loading
- [ ] Empty state handled gracefully
- [ ] Error boundaries catch and display errors appropriately
- [ ] Props passed correctly to display component
- [ ] All validation commands pass

---

### Step 9: Integrate Featured Bobbleheads Section into Home Page

**What**: Add featured bobbleheads async component to home page below featured collections
**Why**: Brings all pieces together to display the new section in the correct layout position
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/(home)/page.tsx` - Add featured bobbleheads section

**Changes:**

- Import FeaturedBobbleheadsAsync component
- Position component below FeaturedCollectionsAsync
- Add proper section spacing with increased whitespace
- Wrap in Suspense boundary for streaming
- Implement responsive container layout
- Add semantic HTML structure (section, heading hierarchy)
- Ensure proper page layout flow with new content

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Featured bobbleheads section renders below collections
- [ ] Suspense streaming works correctly
- [ ] Section spacing and whitespace appropriate
- [ ] Page layout flows naturally with new content
- [ ] All validation commands pass

---

### Step 10: Enhance Overall Page Layout and Visual Hierarchy

**What**: Update home page layout container with improved spacing, typography, and color application
**Why**: Ensures the vibrant color palette and design system are consistently applied across the entire page
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/(home)/page.tsx` - Update page-level layout and styling

**Changes:**

- Apply new warm accent colors to page background and containers
- Increase section spacing for improved visual hierarchy
- Update heading typography with new color palette
- Add subtle gradient backgrounds to page sections
- Implement responsive padding and margins
- Add decorative elements using Lucide icons where appropriate
- Ensure consistent whitespace throughout page
- Apply container max-widths for optimal readability

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Page uses new color palette consistently
- [ ] Visual hierarchy clear with proper spacing
- [ ] Typography updated with accent colors
- [ ] Responsive layout works across all breakpoints
- [ ] All validation commands pass
- [ ] Page maintains performance with new styles

---

### Step 11: Optimize Cloudinary Image Loading Configuration

**What**: Configure Cloudinary transformation parameters for optimal performance across breakpoints
**Why**: Ensures images load quickly with appropriate quality while maintaining visual appeal
**Confidence**: Medium

**Files to Review and Potentially Modify:**

- `src/components/feature/cloudinary/cloudinary-image.tsx` - Verify transformation props
- `src/lib/utils/cloudinary/cloudinary-url-utils.ts` - Check URL generation utilities

**Changes:**

- Define responsive breakpoint sizes for featured collections images
- Define responsive breakpoint sizes for featured bobbleheads images
- Configure quality settings for optimal balance
- Set up automatic format selection (WebP, AVIF)
- Configure lazy loading parameters
- Add blur placeholder generation
- Implement aspect ratio preservation
- Define transformation presets for different card sizes

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Image transformations configured for all breakpoints
- [ ] Quality settings balance file size and visual appeal
- [ ] Modern formats (WebP, AVIF) implemented
- [ ] Lazy loading works correctly
- [ ] Blur placeholders render during load
- [ ] All validation commands pass

---

### Step 12: Add Smooth Scroll and Interaction Polish

**What**: Implement smooth scroll behavior and refined micro-interactions throughout the page
**Why**: Creates a more polished, premium feel with subtle animations that enhance user experience
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Add micro-interactions
- `src/app/(app)/(home)/components/display/featured-bobbleheads-display.tsx` - Add micro-interactions
- `src/app/globals.css` - Add scroll behavior utilities

**Changes:**

- Add smooth scroll behavior to page navigation
- Implement staggered fade-in animations for card grids
- Add subtle scale transforms on card interactions
- Configure transition timing functions for natural feel
- Add loading progress indicators where appropriate
- Implement focus visible states for keyboard navigation
- Add reduced-motion media query support for accessibility
- Configure proper will-change properties for performance

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Smooth scroll behavior works across page sections
- [ ] Card animations stagger naturally in grid
- [ ] Transitions feel natural and responsive
- [ ] Keyboard focus states clearly visible
- [ ] Reduced-motion preferences respected
- [ ] Animations perform smoothly without jank
- [ ] All validation commands pass

---

### Step 13: Accessibility and Color Contrast Audit

**What**: Verify all color combinations meet WCAG AA standards and interactive elements have proper ARIA attributes
**Why**: Ensures the vibrant design remains accessible to all users including those with visual impairments
**Confidence**: High

**Files to Review:**

- `src/app/globals.css` - Verify color contrast ratios
- `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Check ARIA attributes
- `src/app/(app)/(home)/components/display/featured-bobbleheads-display.tsx` - Check ARIA attributes
- `src/app/(app)/(home)/components/skeletons/featured-bobbleheads-skeleton.tsx` - Verify loading states

**Changes:**

- Test all text on background color combinations for WCAG AA compliance
- Add proper ARIA labels to interactive card elements
- Ensure focus indicators have sufficient contrast
- Add alt text requirements for all images
- Implement proper heading hierarchy (h1, h2, h3)
- Add role attributes where semantic HTML insufficient
- Verify keyboard navigation order logical
- Add skip links if needed for navigation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All color combinations meet WCAG AA contrast ratios
- [ ] Interactive elements have proper ARIA attributes
- [ ] Focus indicators visible and high contrast
- [ ] Image alt text implemented correctly
- [ ] Heading hierarchy semantic and logical
- [ ] Keyboard navigation works intuitively
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Production build completes successfully with `npm run build`
- [ ] All color combinations meet WCAG AA contrast standards
- [ ] Images load with proper Cloudinary transformations at all breakpoints
- [ ] Animations and transitions perform smoothly without jank
- [ ] Page maintains good Core Web Vitals scores (LCP, CLS, FID)
- [ ] Keyboard navigation and screen reader testing completed
- [ ] Mobile, tablet, and desktop layouts render correctly
- [ ] Loading states display properly during data fetching
- [ ] Error boundaries catch and handle errors gracefully

## Notes

### Critical Assumptions Requiring Confirmation

- FeaturedContentFacade may need new method for fetching featured bobbleheads (Step 5)
- Bobblehead schema includes all necessary fields for engagement metrics and specifications
- Cloudinary configuration allows for the required image transformations
- Current authentication and permission system supports featured content visibility filtering

### High-Risk Areas

- **Performance Impact** (Medium Risk): Adding new animations and image-heavy section could impact page load times. Mitigation: Aggressive lazy loading, optimized Cloudinary transformations, and careful bundle size monitoring in Step 14.
- **Cloudinary Configuration** (Medium Risk): Image transformations may need adjustment for optimal quality/performance balance. Mitigation: Test across multiple devices and network conditions in Step 11.
- **Data Availability** (Low Risk): Featured bobbleheads content may not exist in database initially. Mitigation: Handle empty states gracefully in Step 8.

### Design Decisions Requiring User Input

- Specific warm accent color values within OKLCH color space (Step 2)
- Number of featured bobbleheads to display in grid (affects layout in Step 7)
- Animation duration preferences for hover effects and transitions (Step 2)
- Priority of specifications to display on bobblehead cards (Step 7)

### Progressive Enhancement Approach

- All animations respect `prefers-reduced-motion` media query
- Core content accessible even if JavaScript fails to load
- Images have proper fallbacks and alt text
- Skeleton states provide feedback during loading

### Testing Recommendations

- Manual testing across Chrome, Firefox, Safari, and mobile browsers
- Lighthouse audits for performance, accessibility, and SEO
- Test with slow network throttling to verify loading states
- Verify animations perform well on lower-end devices
- Screen reader testing with NVDA/JAWS/VoiceOver

---

## Implementation Commands

To implement this plan, use:

```bash
/implement-plan docs/2025_11_24/plans/home-page-redesign-implementation-plan.md
```

For step-by-step execution:

```bash
/implement-plan docs/2025_11_24/plans/home-page-redesign-implementation-plan.md --step-by-step
```

To review without implementing (dry run):

```bash
/implement-plan docs/2025_11_24/plans/home-page-redesign-implementation-plan.md --dry-run
```
