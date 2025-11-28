# Implementation Plan: Redesign Trending Bobbleheads Section

**Generated**: 2025-11-26
**Original Request**: Integrate the style from the /home-page-demo trending bobblehead section into the real home page. No backwards compatible approach, use the new trending bobblehead design only. Make sure to match the color scheme used in the real home page hero section and real home pages feature collection section that have already been ported over from the /home-page-demo route. Must support light and dark mode.

**Refined Request**: The trending bobblehead section on the real home page needs to be redesigned and implemented using the styling, layout, and component structure from the /home-page-demo trending bobblehead section, replacing any existing implementation entirely without maintaining backwards compatibility. This integration must ensure the new trending section visually matches the existing hero section and feature collection section on the real home page that have already been successfully ported from /home-page-demo, creating a cohesive design language across all three sections. Full support for light and dark modes is required.

## Overview

**Estimated Duration**: 3-4 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

Redesign the trending bobbleheads section on the home page using the styling, layout, and component structure from the /home-page-demo, implementing a 6-column responsive grid with compact cards, gradient backgrounds, hover effects with sliding stats, and full light/dark mode support. This integration creates visual consistency with the already-ported hero and featured collections sections.

## Prerequisites

- [ ] Verify access to FeaturedContentFacade.getTrendingContent() method
- [ ] Verify access to SocialFacade.getBatchContentLikeDataAsync() method
- [ ] Confirm Badge component supports 'trending' variant
- [ ] Confirm CldImage component is available from next-cloudinary

## Implementation Steps

### Step 1: Create Trending Bobbleheads Display Component

**What**: Create client component for rendering trending bobbleheads grid with compact cards
**Why**: Separates presentation logic from data fetching, enables client-side interactivity for hover effects
**Confidence**: High

**Files to Create:**

- `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx` - Client component for grid rendering with hover effects, badges, and stats

**Changes:**

- Create TrendingBobblehead interface matching FeaturedContentData structure with required fields
- Create TrendingBobbleheadsDisplayProps interface accepting array of trending bobbleheads
- Implement TrendingBobbleheadsDisplay component with 6-column responsive grid (grid-cols-2 sm:grid-cols-3 lg:grid-cols-6)
- Create TrendingBobbleheadCard sub-component with compact layout (p-3 padding)
- Add aspect-square image container with CldImage integration
- Position Badge with trending variant at top-2 left-2
- Add gradient overlay (from-black/70 via-transparent to-transparent) with opacity-0 hover:opacity-100
- Implement sliding stats section with translate-y-full to translate-y-0 on hover
- Add Heart and Eye icons with like/view counts in stats overlay
- Display character name, category, and year in card footer with p-3 padding
- Apply border styling (border-slate-200/50 dark:border-slate-700/50)
- Add hover effects (-translate-y-2 hover:shadow-xl)
- Include data-slot and data-testid attributes following project patterns
- Handle empty state with appropriate message and icon
- Extract publicId from Cloudinary URLs using extractPublicIdFromCloudinaryUrl utility
- Generate blur placeholder using generateBlurDataUrl utility
- Link cards to bobblehead detail pages using $path with route '/bobbleheads/[bobbleheadSlug]'

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component exports TrendingBobbleheadsDisplay and TrendingBobblehead interface
- [ ] Grid layout matches demo design with 6 columns on large screens
- [ ] Cards display compact styling with p-3 padding
- [ ] Badge positioned correctly at top-left
- [ ] Hover effects work smoothly with gradient overlay and sliding stats
- [ ] All validation commands pass

---

### Step 2: Create Trending Bobbleheads Async Component

**What**: Create server component to fetch trending bobblehead data and render display component
**Why**: Enables server-side data fetching with proper caching, integrates with existing facade layer
**Confidence**: High

**Files to Create:**

- `src/app/(app)/(home)/components/async/trending-bobbleheads-async.tsx` - Server component for data fetching and transformation

**Changes:**

- Add 'server-only' import at top of file
- Create TrendingBobbleheadsAsyncProps interface with currentUserId property (null | string)
- Implement TrendingBobbleheadsAsync async server component
- Call FeaturedContentFacade.getTrendingContent() to fetch trending content
- Filter results to only include contentType 'bobblehead' (trending can include collections/users)
- Sort by priority and limit to 12 items for 2-row display
- Extract bobblehead IDs for batch like data fetching
- Call SocialFacade.getBatchContentLikeDataAsync with targetType 'bobblehead' if currentUserId exists
- Create likeDataMap using Map with key format 'bobblehead:contentId'
- Transform FeaturedContentData to TrendingBobblehead format mapping all required fields
- Map like data from likeDataMap (isLiked, likeCount, likeId)
- Handle null imageUrl by falling back to placeholder or null
- Return TrendingBobbleheadsDisplay component with transformed data

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component marked with 'server-only' import
- [ ] Properly integrates with FeaturedContentFacade.getTrendingContent()
- [ ] Filters to only bobblehead content type
- [ ] Correctly batches like data fetching for authenticated users
- [ ] Transforms data matching TrendingBobblehead interface
- [ ] Limits results to 12 items
- [ ] All validation commands pass

---

### Step 3: Create Trending Bobbleheads Skeleton Component

**What**: Create loading skeleton matching trending bobbleheads grid layout
**Why**: Provides visual feedback during data fetching, matches Suspense boundary pattern
**Confidence**: High

**Files to Create:**

- `src/app/(app)/(home)/components/skeletons/trending-bobbleheads-skeleton.tsx` - Loading skeleton component

**Changes:**

- Import Skeleton component from components/ui/skeleton
- Import generateTestId utility
- Create TrendingBobbleheadsSkeleton functional component
- Add container div with 6-column grid matching display component
- Add role='status' and aria-busy='true' for accessibility
- Add aria-label='Loading trending bobbleheads'
- Include sr-only span with 'Loading trending bobbleheads...' text
- Create 12 skeleton cards using Array.from with index mapping
- Add aspect-square skeleton for image section
- Add skeleton for card footer content with p-3 padding
- Add skeleton for character name (h-4 w-full)
- Add skeleton for metadata row with category and year (h-3 w-16 each)
- Include data-slot and data-testid attributes for each skeleton card
- Match border styling from display component

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Skeleton grid matches display component layout (grid-cols-2 sm:grid-cols-3 lg:grid-cols-6)
- [ ] Displays 12 skeleton cards for 2-row layout
- [ ] Accessibility attributes properly implemented
- [ ] Visual structure matches actual card layout
- [ ] All validation commands pass

---

### Step 4: Create Trending Bobbleheads Error Boundary

**What**: Create error boundary component for trending section
**Why**: Provides graceful error handling without breaking entire page, matches existing pattern
**Confidence**: High

**Files to Create:**

- `src/app/(app)/(home)/components/error/trending-bobbleheads-error-boundary.tsx` - Error boundary component

**Changes:**

- Copy pattern from FeaturedCollectionsErrorBoundary as template
- Mark file with 'use client' directive
- Import necessary types (ErrorInfo, ReactNode)
- Import AlertCircleIcon from lucide-react
- Import Component from react
- Import Button component
- Create TrendingBobbleheadsErrorBoundary class component extending Component
- Implement constructor initializing hasError state to false
- Implement static getDerivedStateFromError returning error state
- Implement componentDidCatch logging 'Error in trending bobbleheads section:'
- Render fallback UI with destructive styling and 'Failed to load trending bobbleheads' message
- Add Refresh Page button calling window.location.reload()
- Return children when no error

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Error boundary follows existing pattern from FeaturedCollectionsErrorBoundary
- [ ] Displays user-friendly error message
- [ ] Provides refresh functionality
- [ ] Error logged to console for debugging
- [ ] All validation commands pass

---

### Step 5: Integrate Trending Section into Home Page

**What**: Add trending bobbleheads section to home page with proper Suspense and error boundaries
**Why**: Completes the integration, creates cohesive design with hero and featured collections sections
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/(home)/page.tsx` - Add trending section between featured bobbleheads and join community sections

**Changes:**

- Import TrendingBobbleheadsAsync from async/trending-bobbleheads-async
- Import TrendingBobbleheadsSkeleton from skeletons/trending-bobbleheads-skeleton
- Import TrendingBobbleheadsErrorBoundary from error/trending-bobbleheads-error-boundary
- Import Flame icon from lucide-react for section header
- Import Button and ArrowRightIcon for view all button
- Add trending section after featured bobbleheads section (after line 170)
- Add section wrapper with gradient background (bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900)
- Add py-20 padding to section
- Add container div with mx-auto px-6 classes
- Create section header with centered flex column layout (mb-12)
- Add Flame icon in gradient circle (size-16 from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30)
- Add h2 heading 'Trending Now' with text-4xl md:text-5xl
- Add description paragraph 'The most popular bobbleheads this week from collectors worldwide'
- Wrap TrendingBobbleheadsAsync in TrendingBobbleheadsErrorBoundary
- Wrap error boundary in Suspense with TrendingBobbleheadsSkeleton fallback
- Pass currentUserId prop to async component
- Add 'View All Bobbleheads' button section with mt-12 text-center
- Style button with gradient (from-orange-500 to-red-500) matching demo
- Add ArrowRightIcon with translate animation
- Link button to browse bobbleheads page using $path with route '/browse/search'

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Trending section positioned correctly in page layout
- [ ] Section header matches demo design with Flame icon
- [ ] Gradient background matches demo styling
- [ ] Suspense boundary wraps async component with skeleton
- [ ] Error boundary wraps suspense for graceful error handling
- [ ] View all button styled and linked correctly
- [ ] Visual consistency with hero and featured collections sections
- [ ] All validation commands pass

---

### Step 6: Test Visual Consistency and Responsiveness

**What**: Verify visual consistency across all three sections and test responsive behavior
**Why**: Ensures cohesive design language and proper mobile experience
**Confidence**: High

**Files to Modify:**
None - manual verification step

**Changes:**

- Load home page in development server
- Verify gradient backgrounds match across hero, featured collections, and trending sections
- Test responsive grid behavior at breakpoints (mobile 2-col, tablet 3-col, desktop 6-col)
- Verify hover effects work smoothly (gradient overlay and sliding stats)
- Test light/dark mode toggle to ensure proper theming
- Verify badge positioning and styling
- Check CldImage loading and blur placeholders
- Test empty state rendering when no trending content
- Verify error boundary by simulating error
- Check skeleton loading during initial load
- Test all links navigate correctly
- Verify accessibility attributes work with screen readers

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run dev
```

**Success Criteria:**

- [ ] Visual consistency confirmed across all sections
- [ ] Responsive grid works at all breakpoints
- [ ] Hover effects smooth and performant
- [ ] Light/dark modes properly themed
- [ ] Images load with blur placeholders
- [ ] Empty state displays correctly
- [ ] Error boundary catches errors gracefully
- [ ] Skeleton shows during loading
- [ ] All links navigate correctly
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Visual regression testing shows consistency with demo design
- [ ] Light and dark modes both work correctly
- [ ] Responsive layout works at all breakpoints (mobile, tablet, desktop)
- [ ] Hover interactions perform smoothly
- [ ] Loading states display correctly
- [ ] Error states handle gracefully
- [ ] Empty states render appropriately

## Notes

**Design Consistency**: The trending section uses the same orange/red gradient color scheme as the hero and featured collections sections to maintain visual cohesion.

**Data Flow**: Uses FeaturedContentFacade.getTrendingContent() which returns items with featureType='trending'. The implementation filters to only bobblehead content types since trending can include collections and users.

**Performance Considerations**:

- Limits results to 12 items (2 rows of 6) to prevent excessive DOM nodes
- Uses CldImage with blur placeholders for progressive loading
- Batches like data fetching to minimize database queries

**Accessibility**: Includes proper ARIA attributes, screen reader text, and keyboard navigation support following existing component patterns.

**Cache Strategy**: Leverages existing featured content cache from FeaturedContentFacade which uses CacheService with EXTENDED TTL.

**No Backward Compatibility**: Implementation completely replaces any existing trending section without maintaining backward compatibility as requested.

## File Discovery Results

### Files to Create (4)

| File                                                                            | Purpose                            |
| ------------------------------------------------------------------------------- | ---------------------------------- |
| `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx`      | Client component for rendering     |
| `src/app/(app)/(home)/components/async/trending-bobbleheads-async.tsx`          | Server component for data fetching |
| `src/app/(app)/(home)/components/skeletons/trending-bobbleheads-skeleton.tsx`   | Loading skeleton                   |
| `src/app/(app)/(home)/components/error/trending-bobbleheads-error-boundary.tsx` | Error boundary                     |

### Files to Modify (1)

| File                            | Purpose                           |
| ------------------------------- | --------------------------------- |
| `src/app/(app)/(home)/page.tsx` | Add trending section to home page |

### Reference Files (6)

| File                                                                       | Purpose                                        |
| -------------------------------------------------------------------------- | ---------------------------------------------- |
| `src/app/home-page-demo/page.tsx`                                          | Source trending section design (lines 863-977) |
| `src/app/(app)/(home)/components/hero-section.tsx`                         | Color scheme reference                         |
| `src/app/(app)/(home)/components/display/featured-collections-display.tsx` | Card pattern reference                         |
| `src/app/(app)/(home)/components/async/featured-collections-async.tsx`     | Async pattern reference                        |
| `src/components/ui/badge.tsx`                                              | Badge variants                                 |
| `src/lib/facades/featured-content/featured-content.facade.ts`              | Data fetching method                           |
