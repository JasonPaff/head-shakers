# Implementation Plan: Browse by Category Section Integration

**Generated**: 2025-11-27
**Original Request**: Integrate the style from the /home-page-demo browse by category section into the real home page. Make sure to match the color scheme used in the real home page hero section and real home pages feature collection section that have already been ported over from the /home-page-demo route. Must support light and dark mode.

**Refined Request**: Integrate the visual design and layout patterns from the browse by category section in the /home-page-demo prototype route into the real home page, ensuring the category cards, grid layout, and interactive elements match the styling established in the already-ported hero section and featured collection section that use the real home page's color scheme. The category browse section should maintain consistency with the existing home page design by respecting Tailwind CSS 4's utility classes and custom animations, applying the same color tokens for backgrounds, text, and accent elements across both light and dark modes as implemented in the hero and featured sections. Implement the browse by category component using Radix UI components where appropriate and leverage Class Variance Authority for managing component variants that respond to theme changes. The component should support the full range of Tailwind dark mode classes to ensure proper light and dark mode switching through next-themes. Pay attention to spacing, typography, and visual hierarchy to match the polished appearance of the already-ported sections, ensuring responsive design that works across mobile, tablet, and desktop breakpoints.

## Analysis Summary

- Feature request refined with project context (57 → 336 words)
- Discovered 32 files across 12+ directories
- Generated 8-step implementation plan

## File Discovery Results

### Critical - Source
- `src/app/home-page-demo/page.tsx` - Contains CategoriesSection component (lines 259-304) with exact visual design to port

### Critical - Destination/Reference
- `src/app/(app)/(home)/page.tsx` - Real home page where section will be inserted
- `src/app/(app)/(home)/components/hero-section.tsx` - Style reference with orange color scheme
- `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Card styling reference
- `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx` - Grid layout reference

### Files to Create
- `src/app/(app)/(home)/components/async/browse-categories-async.tsx` - Async wrapper for data fetching
- `src/app/(app)/(home)/components/display/browse-categories-display.tsx` - Display component
- `src/app/(app)/(home)/components/skeleton/browse-categories-skeleton.tsx` - Loading skeleton
- `src/lib/utils/category-icons.utils.ts` - Category icon mapping utility

### High - Data Layer
- `src/lib/queries/collections/collections.query.ts` - Has getDistinctCategoriesAsync method
- `src/lib/actions/collections/collections.actions.ts` - Has getCategoriesAction server action

---

## Overview

**Estimated Duration**: 4-6 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

Integrate the browse by category section from the home-page-demo prototype into the real home page using the existing orange color scheme and three-layer component architecture (async/display/skeleton). The section will display category cards in a responsive grid layout that links to the browse page with category filters applied.

## Prerequisites

- [ ] Verify existing category data structure from `getDistinctCategoriesAsync` query
- [ ] Confirm `$path` type-safe routing supports category filter parameters
- [ ] Review orange color scheme tokens from hero-section.tsx

## Implementation Steps

### Step 1: Create Browse Categories Display Component

**What**: Build the client-side display component for category cards with hover effects and responsive grid
**Why**: Separates presentation logic from data fetching following the established three-layer pattern
**Confidence**: High

**Files to Create:**
- `src/app/(app)/(home)/components/display/browse-categories-display.tsx` - Client component with interactive category cards

**Changes:**
- Create `BrowseCategory` TypeScript interface with name, bobbleheadCount, and collectionCount properties
- Create `BrowseCategoriesDisplayProps` interface accepting categories array
- Implement `BrowseCategoriesDisplay` component with responsive grid layout (sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6)
- Implement `CategoryCard` component with:
  - Link wrapper using $path to /browse/categories with category filter query parameter
  - Category emoji icon display (map category names to appropriate emojis)
  - Gradient hover overlay with category-specific colors
  - Card transition effects (hover:-translate-y-1)
  - Orange color scheme for borders and text matching hero section
  - Light/dark mode support via Tailwind dark: classes
- Add empty state with SearchIcon when no categories available
- Include data-slot and data-testid attributes using generateTestId utility
- Export both BrowseCategoriesDisplay and BrowseCategory type

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component renders category cards in responsive grid
- [ ] Category cards link to /browse/categories with proper query parameters
- [ ] Hover effects work smoothly with gradient overlays
- [ ] Light and dark mode styling matches hero section orange scheme
- [ ] Empty state displays when no categories provided
- [ ] All validation commands pass

---

### Step 2: Create Browse Categories Skeleton Component

**What**: Build loading skeleton for category cards matching the display component layout
**Why**: Provides visual feedback during Suspense loading state following established skeleton pattern
**Confidence**: High

**Files to Create:**
- `src/app/(app)/(home)/components/skeleton/browse-categories-skeleton.tsx` - Loading skeleton component

**Changes:**
- Create `BrowseCategoriesSkeleton` export function component
- Implement responsive grid layout matching display component (sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6)
- Render 6 skeleton cards using Array.from with Skeleton component
- Each card should include:
  - Rounded container with border matching category card styling
  - Icon placeholder skeleton (size-12 or similar)
  - Text line skeletons for category name and count
- Add accessibility attributes (role="status", aria-busy, aria-label)
- Add screen reader announcement text with sr-only class
- Include data-slot and data-testid attributes using generateTestId utility

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Skeleton renders 6 placeholder cards in matching grid layout
- [ ] Skeleton structure matches final category card layout
- [ ] Accessibility attributes properly configured
- [ ] All validation commands pass

---

### Step 3: Create Browse Categories Async Component

**What**: Build server component that fetches category data and renders display component
**Why**: Implements data fetching layer following the three-layer architecture pattern
**Confidence**: High

**Files to Create:**
- `src/app/(app)/(home)/components/async/browse-categories-async.tsx` - Server component with data fetching

**Changes:**
- Add 'server-only' import at top of file
- Import BrowseCategoriesDisplay component and BrowseCategory type
- Import CategoryRecord type from collections.query
- Import CollectionsQuery.getDistinctCategoriesAsync method
- Import getUserIdAsync utility for optional auth
- Create async function component `BrowseCategoriesAsync`
- Fetch current user ID using getUserIdAsync
- Fetch categories using CollectionsQuery.getDistinctCategoriesAsync with proper query context
- Map CategoryRecord data to BrowseCategory type including:
  - Category name
  - Bobblehead count
  - Collection count
  - Map category names to appropriate emoji icons (Baseball: ⚾, Basketball: 🏀, Football: 🏈, Hockey: 🏒, Soccer: ⚽, Entertainment: 🎬, etc.)
- Return BrowseCategoriesDisplay component with mapped categories data
- Export BrowseCategoriesAsync as named export

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component successfully fetches category data from database
- [ ] CategoryRecord data properly mapped to BrowseCategory type
- [ ] Emoji icons correctly assigned to category names
- [ ] Server-only directive prevents client-side execution
- [ ] All validation commands pass

---

### Step 4: Integrate Browse Categories Section into Home Page

**What**: Add the new browse categories section to the home page between trending bobbleheads and join community sections
**Why**: Completes the integration following the established home page structure with ErrorBoundary and Suspense wrappers
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/(home)/page.tsx` - Add browse categories section

**Changes:**
- Import BrowseCategoriesAsync component
- Import BrowseCategoriesSkeleton component
- Import SearchIcon from lucide-react
- Add new section element after trending bobbleheads section (line 170) and before join community section (line 172)
- Section should include:
  - Wrapper section with orange gradient background matching home page theme: `bg-gradient-to-br from-orange-50 via-white to-orange-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`
  - Container with proper spacing (py-20, container mx-auto px-6)
  - Section header with:
    - Icon container with SearchIcon using orange gradient background
    - H2 heading: "Browse by Category"
    - Subtitle paragraph: "Find exactly what you're looking for across our diverse categories"
  - ErrorBoundary wrapper with name="browse-categories"
  - Suspense wrapper with BrowseCategoriesSkeleton fallback
  - BrowseCategoriesAsync component
  - Optional "View All Categories" button linking to /browse/categories

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Browse categories section renders between trending and community sections
- [ ] Section styling matches orange color scheme from hero and featured sections
- [ ] ErrorBoundary properly wraps async component
- [ ] Suspense displays skeleton during loading
- [ ] Section header styling consistent with other home page sections
- [ ] All validation commands pass

---

### Step 5: Add Category Filter Support to Browse Page Route

**What**: Verify and update type-safe routing to support category query parameters for /browse/categories route
**Why**: Ensures category cards correctly link to filtered browse results
**Confidence**: Medium

**Files to Modify:**
- Check if route configuration already supports category filters, if not, update routing types

**Changes:**
- Verify $path supports /browse/categories route with category query parameter
- If not supported, update next-typesafe-url route definitions to include category filter parameter
- Test category card links navigate correctly to browse page with category filter applied
- Verify browse page receives and applies category filter from query parameters

**Validation Commands:**
```bash
npm run next-typesafe-url && npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Category card links generate correct URLs with category filter
- [ ] Browse page route accepts category query parameter
- [ ] Clicking category card navigates to filtered browse results
- [ ] All validation commands pass

---

### Step 6: Add Category Icon Mapping Utility

**What**: Create a reusable utility function to map category names to emoji icons
**Why**: Centralizes icon mapping logic for maintainability and consistency across the application
**Confidence**: High

**Files to Create:**
- `src/lib/utils/category-icons.utils.ts` - Category icon mapping utility

**Changes:**
- Create `getCategoryIcon` function that accepts category name string
- Map common category names to appropriate emoji icons:
  - Baseball → ⚾
  - Basketball → 🏀
  - Football → 🏈
  - Hockey → 🏒
  - Soccer → ⚽
  - Entertainment → 🎬
  - Movies → 🎬
  - Music → 🎵
  - Sports → 🏆
  - Politics → 🏛️
  - Default → 🎯
- Return appropriate emoji based on case-insensitive matching
- Export getCategoryIcon function
- Add JSDoc comments documenting function purpose and parameters

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Function correctly maps category names to emoji icons
- [ ] Case-insensitive matching works properly
- [ ] Default icon returned for unmapped categories
- [ ] Function properly exported and documented
- [ ] All validation commands pass

---

### Step 7: Update Browse Categories Display to Use Icon Utility

**What**: Refactor display component to use centralized icon mapping utility
**Why**: Removes hardcoded icon logic from display component for better maintainability
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/(home)/components/display/browse-categories-display.tsx` - Use icon utility

**Changes:**
- Import getCategoryIcon utility function
- Remove inline icon mapping logic from CategoryCard component
- Use getCategoryIcon(category.name) to get icon for each category
- Verify icon displays correctly in category card

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Category cards display icons from utility function
- [ ] All icons render correctly for each category
- [ ] No inline icon mapping logic remains in component
- [ ] All validation commands pass

---

### Step 8: Final Integration Testing and Refinement

**What**: Test complete browse categories section integration with all features working together
**Why**: Ensures all components work correctly as an integrated system before completion
**Confidence**: High

**Files to Modify:**
- None (testing and verification step)

**Changes:**
- Start development server and navigate to home page
- Verify browse categories section renders after trending bobbleheads
- Test category card hover effects and transitions
- Click each category card and verify navigation to browse page with correct filter
- Test responsive layout on mobile, tablet, and desktop viewports
- Verify light mode and dark mode styling matches hero section
- Test loading skeleton displays during data fetching
- Verify empty state displays when no categories available
- Test error boundary catches and displays errors gracefully
- Check browser console for any warnings or errors

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck && npm run build
```

**Success Criteria:**
- [ ] Browse categories section renders correctly on home page
- [ ] All category cards display with proper icons and counts
- [ ] Category card links navigate to filtered browse results
- [ ] Responsive layout works across all breakpoints
- [ ] Light and dark mode styling matches orange color scheme
- [ ] Loading skeleton displays during Suspense
- [ ] Error boundary handles errors gracefully
- [ ] Production build completes without errors
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Browse categories section visually matches prototype design
- [ ] Orange color scheme consistent with hero and featured sections
- [ ] Category cards link correctly to filtered browse page
- [ ] Responsive grid layout works on mobile, tablet, and desktop
- [ ] Light and dark mode styling properly implemented
- [ ] Loading states work with Suspense and skeleton
- [ ] Error boundary properly wraps async components
- [ ] Production build completes successfully

## Notes

**Routing Considerations**: The browse page route may need updates to accept and apply category filter query parameters. If the route doesn't support this, Step 5 will require additional work to configure the routing system.

**Icon Mapping Strategy**: The category icon mapping uses emoji for simplicity and consistency with the prototype. If the product team prefers using Lucide React icons instead, the utility function can be updated to return icon component references.

**Color Scheme Customization**: The orange color scheme from hero-section.tsx should be used for consistency. Key colors include:
- Light backgrounds: `from-orange-50 via-white to-orange-50/50`
- Dark backgrounds: `dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`
- Icon containers: `from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30`
- Accent text: `text-orange-600 dark:text-orange-400`

**Performance Optimization**: The category data is fetched server-side and cached appropriately. Consider adding React cache() wrapper if needed for additional caching optimization.

**Accessibility**: All components include proper ARIA attributes, semantic HTML, and screen reader support following established patterns in the codebase.
