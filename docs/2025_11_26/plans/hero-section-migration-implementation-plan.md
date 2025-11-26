# Implementation Plan: Hero Section Migration from Demo to Production

## Overview

**Estimated Duration**: 4-6 hours
**Complexity**: Medium
**Risk Level**: Medium

## Quick Summary

Replace the simple hero section on the main home page with the elaborate HeroSection component from the home-page-demo route, integrating advanced visual features including animated gradient orbs, grid pattern backgrounds, two-column layout with featured bobblehead showcase, floating cards with bounce animations, real platform statistics, and wave divider separator. This refactor maintains data-driven functionality by replacing mock data with live data from facades while preserving all accessibility attributes and authentication-aware behavior.

## Prerequisites

- [ ] Current home page at src/app/(app)/(home)/page.tsx is functioning correctly
- [ ] Demo page at src/app/home-page-demo/page.tsx contains the target HeroSection component
- [ ] FeaturedContentFacade.getFeaturedBobbleheads() is accessible and returning data
- [ ] UsersQuery.countUsersForAdminAsync() exists for counting total users
- [ ] Database access is configured for server components

## Implementation Steps

### Step 1: Create Platform Statistics Facade

**What**: Create a new facade to aggregate platform-wide statistics for total bobbleheads, collectors, and collections
**Why**: The hero section displays real-time platform stats that need to be fetched from the database with proper caching
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\facades\platform\platform-stats.facade.ts` - Aggregate platform statistics using existing query methods

**Changes:**

- Create PlatformStatsFacade class with static methods
- Add getPlatformStats() method that returns total bobbleheads, total collections, and total collectors
- Use UsersQuery for counting users/collectors
- Query bobbleheads table for total count (excluding deleted)
- Query collections table for total count
- Add proper error handling with createFacadeError
- Add Sentry breadcrumbs for monitoring
- Implement caching strategy using CacheService pattern

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] PlatformStatsFacade.getPlatformStats() returns an object with totalBobbleheads, totalCollectors, totalCollections
- [ ] Facade follows existing facade patterns from the codebase
- [ ] Proper error handling and Sentry integration included
- [ ] All validation commands pass

---

### Step 2: Create Platform Statistics Query Methods

**What**: Add query methods to count total bobbleheads and collections across all users
**Why**: The facade needs underlying query methods to fetch platform-wide statistics from the database
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\bobbleheads\bobbleheads-query.ts` - Add countTotalBobbleheadsAsync() method
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\collections\collections.query.ts` - Add countTotalCollectionsAsync() method

**Changes:**

- Add static async countTotalBobbleheadsAsync(context: QueryContext) method to BobbleheadsQuery
- Query bobbleheads table with count() excluding deleted records using isNull(bobbleheads.deletedAt)
- Add static async countTotalCollectionsAsync(context: QueryContext) method to CollectionsQuery
- Query collections table with count() for all collections
- Follow existing BaseQuery patterns with getDbInstance(context)
- Return number type from both methods

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] countTotalBobbleheadsAsync() returns accurate count of non-deleted bobbleheads
- [ ] countTotalCollectionsAsync() returns accurate count of all collections
- [ ] Methods follow existing query patterns in codebase
- [ ] All validation commands pass

---

### Step 3: Create Hero Stats Async Component

**What**: Create an async server component to fetch and display platform statistics in the hero section
**Why**: Platform stats need to be fetched server-side and wrapped in Suspense for loading states
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\(home)\components\async\hero-stats-async.tsx` - Server component for fetching platform statistics

**Changes:**

- Create async function component HeroStatsAsync that fetches data from PlatformStatsFacade.getPlatformStats()
- Accept optional dbInstance prop for transaction support
- Return JSX displaying three statistics in a flex row layout matching demo styles
- Use border-t border-slate-700/50 pt-8 styling from demo
- Display stats with text-3xl font-bold text-white for numbers
- Display labels with text-sm text-slate-400
- Format numbers with toLocaleString()
- Add proper aria-labels for accessibility

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] HeroStatsAsync fetches and displays platform statistics
- [ ] Component is async and uses server-side data fetching
- [ ] Styling matches the demo hero section stats row
- [ ] All validation commands pass

---

### Step 4: Create Hero Stats Skeleton Component

**What**: Create a skeleton loading component for platform statistics
**Why**: Suspense boundaries require skeleton components for loading states
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\(home)\components\skeletons\hero-stats-skeleton.tsx` - Loading skeleton for platform stats

**Changes:**

- Create HeroStatsSkeleton functional component
- Display three skeleton blocks in flex row layout matching HeroStatsAsync
- Use Skeleton component from @/components/ui/skeleton
- Add proper aria-busy and role="status" attributes
- Match spacing and sizing from stats async component
- Include sr-only text for screen readers
- Use generateTestId for test IDs
- Match border-t border-slate-700/50 pt-8 styling

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Skeleton matches the layout of HeroStatsAsync component
- [ ] Proper accessibility attributes included
- [ ] Follows existing skeleton component patterns
- [ ] All validation commands pass

---

### Step 5: Extract and Adapt Badge Component Variants

**What**: Extend the existing Badge component to support editor_pick, trending, popular, and new variants from the demo
**Why**: The hero section uses specialized badge variants that don't exist in the current Badge component
**Confidence**: Medium

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\badge.tsx` - Add new badge variants with gradient styles

**Changes:**

- Add new variant options to badgeVariants CVA configuration
- Add editor_pick variant with gradient from-amber-400 to-yellow-500 background and text-black
- Add trending variant with gradient from-orange-500 to-red-500 background and text-white
- Add popular variant with gradient from-purple-500 to-pink-500 background and text-white
- Add new_badge variant (avoid conflict with reserved word) with gradient from-green-500 to-emerald-500 background and text-white
- Update Badge component to optionally render icon children from lucide-react
- Maintain backward compatibility with existing default, destructive, outline, and secondary variants
- Add shadow-lg to gradient variants for elevated appearance

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Badge component supports all four new variants
- [ ] Gradient styles match the demo implementation
- [ ] Existing badge variants continue to work
- [ ] All validation commands pass

---

### Step 6: Create Hero Featured Bobblehead Showcase Component

**What**: Create a display component for the featured bobblehead card in the hero section right column
**Why**: The hero section needs a specialized component to showcase a single featured bobblehead with floating stat cards
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\(home)\components\display\hero-featured-bobblehead.tsx` - Display component for hero section bobblehead showcase

**Changes:**

- Create HeroFeaturedBobblehead component accepting bobblehead data prop
- Use CldImage from next-cloudinary for image display with transformations
- Implement main card with rounded-3xl border, gradient background from-slate-800/80 to-slate-900/80
- Add Editor's Pick badge using extended Badge component
- Display bobblehead name, description, like count, and view count
- Create two floating cards with animate-bounce at different animation durations
- First floating card: "Top Rated This Week" with Trophy icon at top-8 -left-8 -rotate-12
- Second floating card: "+23% Value Growth" with TrendingUp icon at -right-4 bottom-20 rotate-6
- Use proper $path() for linking to bobblehead detail page
- Add proper aria-hidden for decorative elements
- Include hover effects with group-hover:scale-110 on image

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component displays featured bobblehead with floating cards
- [ ] Styling matches demo hero section right column
- [ ] Links use $path() helper for type safety
- [ ] All validation commands pass

---

### Step 7: Create Hero Featured Bobblehead Async Component

**What**: Create async server component to fetch featured bobblehead data for hero showcase
**Why**: Hero section needs server-side data fetching with Suspense support for the featured bobblehead
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\(home)\components\async\hero-featured-bobblehead-async.tsx` - Async wrapper for fetching featured bobblehead

**Changes:**

- Create async function component HeroFeaturedBobbleheadAsync
- Accept currentUserId prop for like data
- Call FeaturedContentFacade.getFeaturedBobbleheads(1) to get single featured bobblehead
- Fetch like data using SocialFacade.getBatchContentLikeData if user authenticated
- Transform FeaturedContentData to match HeroFeaturedBobblehead component interface
- Handle empty state by returning null or placeholder
- Pass transformed data to HeroFeaturedBobblehead display component
- Follow pattern from FeaturedBobbleheadsAsync component

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component fetches and passes featured bobblehead data correctly
- [ ] Like data integration works for authenticated users
- [ ] Follows existing async component patterns
- [ ] All validation commands pass

---

### Step 8: Create Hero Featured Bobblehead Skeleton

**What**: Create skeleton loading component for hero featured bobblehead showcase
**Why**: Suspense boundary for featured bobblehead needs a loading skeleton
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\(home)\components\skeletons\hero-featured-bobblehead-skeleton.tsx` - Loading skeleton for featured showcase

**Changes:**

- Create HeroFeaturedBobbleheadSkeleton component
- Match main card dimensions with aspect-square and rounded-3xl
- Add skeleton for image area using Skeleton component
- Add skeleton for badge in top-left corner
- Add skeletons for title, description, and stats at bottom
- Include two floating card skeletons matching the positions from display component
- Use proper aria-busy, role="status", and sr-only text
- Apply same border and background styling as display component
- Use generateTestId for test IDs

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Skeleton matches layout of HeroFeaturedBobblehead component
- [ ] Floating card skeletons positioned correctly
- [ ] Accessibility attributes included
- [ ] All validation commands pass

---

### Step 9: Create New Hero Section Component

**What**: Create a new server-side HeroSection component extracting and adapting the demo's HeroSection
**Why**: Need to replace client-side demo hero with server-side version that uses real data
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\(home)\components\hero-section.tsx` - Server-side hero section with real data

**Changes:**

- Extract HeroSection structure from home-page-demo/page.tsx
- Convert from client component to server component by removing 'use client'
- Accept currentUserId prop for authenticated user state
- Preserve animated background elements with gradient orbs and grid pattern
- Preserve aria-hidden attributes on all decorative elements
- Maintain two-column grid layout with lg:grid-cols-2
- Update badge to use "The Premier Bobblehead Community" text
- Update heading to "Collect, Share, and Discover Bobbleheads" matching current site
- Update description to match current site copy
- Replace CTA buttons with AuthContent wrapper and proper $path() links
- Replace MOCK_STATS with Suspense wrapping HeroStatsAsync component
- Replace demo featured card with Suspense wrapping HeroFeaturedBobbleheadAsync
- Preserve wave divider SVG at bottom with dark mode support
- Remove all hardcoded href="#" and replace with $path() helpers
- Maintain responsive breakpoints and Tailwind utilities

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component is server-side with async data fetching via child components
- [ ] Preserves all visual design elements from demo
- [ ] Replaces mock data with Suspense-wrapped async components
- [ ] Uses $path() for all internal links
- [ ] All validation commands pass

---

### Step 10: Integrate New Hero Section into Home Page

**What**: Replace the existing hero section in page.tsx with the new HeroSection component
**Why**: Complete the migration by swapping the simple hero for the elaborate version
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\(home)\page.tsx` - Replace hero section markup with new component

**Changes:**

- Import new HeroSection component from components/hero-section
- Import HeroStatsSkeleton and HeroFeaturedBobbleheadSkeleton for Suspense fallbacks
- Remove existing hero section markup from lines 96-172
- Add HeroSection component in its place, passing currentUserId prop
- Ensure Suspense boundaries are properly configured within HeroSection
- Maintain all other sections (Featured Collections, Featured Bobbleheads, Join Community)
- Keep existing metadata, JSON-LD scripts, and username onboarding logic
- Verify revalidate = 300 setting remains for ISR

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New hero section renders correctly on home page
- [ ] All async data loads properly within Suspense boundaries
- [ ] Other home page sections remain unchanged
- [ ] All validation commands pass

---

### Step 11: Update Badge Icon Support

**What**: Add optional icon prop to Badge component for rendering Lucide icons
**Why**: Hero section and featured content badges need to display icons alongside text
**Confidence**: Medium

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\badge.tsx` - Add icon prop support

**Changes:**

- Add optional icon prop of type React.ReactNode to BadgeProps
- Conditionally render icon before children if provided
- Apply size-3 class to icon wrapper for consistent sizing
- Ensure icon inherits text color from badge variant
- Update existing CVA classes to support icon children
- Maintain backward compatibility for badges without icons
- Update component to handle both string children and icon + string combinations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Badge component accepts and renders optional icon prop
- [ ] Icon sizing and color inheritance work correctly
- [ ] Existing badge usage without icons continues to work
- [ ] All validation commands pass

---

### Step 12: Create Cache Service Methods for Platform Stats

**What**: Add caching methods to CacheService for platform statistics
**Why**: Platform stats should be cached to reduce database load and improve performance
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\services\cache.service.ts` - Add platform stats caching methods

**Changes:**

- Add platform property to CacheService with stats method
- Implement CacheService.platform.stats() wrapping unstable_cache
- Use cache key pattern platform:stats
- Set TTL to EXTENDED (1 hour) since stats don't change frequently
- Add cache tag platform-stats for revalidation
- Follow existing CacheService patterns from featured content
- Include proper error handling and logging context

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] CacheService.platform.stats() properly caches platform statistics
- [ ] Cache invalidation tags are correctly configured
- [ ] Follows existing cache service patterns
- [ ] All validation commands pass

---

### Step 13: Add Cache Revalidation for Platform Stats

**What**: Add cache revalidation triggers for platform stats when content changes
**Why**: Platform stats cache needs to be invalidated when bobbleheads, collections, or users are added/removed
**Confidence**: Medium

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\services\cache-revalidation.service.ts` - Add platform stats revalidation

**Changes:**

- Add platform property to CacheRevalidationService with onStatsChange method
- Call revalidateTag('platform-stats') to invalidate cache
- Trigger onStatsChange() from bobblehead creation/deletion
- Trigger onStatsChange() from collection creation/deletion
- Trigger onStatsChange() from user registration
- Add breadcrumbs for monitoring cache invalidation
- Follow existing revalidation service patterns

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Platform stats cache revalidates on content changes
- [ ] Revalidation triggers integrated into appropriate facades
- [ ] Monitoring breadcrumbs added for debugging
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Hero section displays correctly on home page with real data
- [ ] Platform statistics show accurate counts
- [ ] Featured bobblehead showcase loads and displays properly
- [ ] All Suspense boundaries work with loading skeletons
- [ ] Authentication-aware CTA buttons function correctly
- [ ] Links use $path() and navigate to correct routes
- [ ] Accessibility attributes preserved on decorative elements
- [ ] Responsive design works across breakpoints
- [ ] Dark mode styling functions correctly
- [ ] Animations and visual effects render smoothly

## Notes

**Architecture Decisions:**

- Using server components with Suspense boundaries for optimal performance and SEO
- Platform stats cached with 1-hour TTL since they change infrequently
- Facade pattern maintains separation between business logic and queries
- Badge component extended rather than creating new component for consistency

**Implementation Risks:**

- **Medium Risk**: Cache invalidation timing - platform stats may show stale data for up to 1 hour
- **Low Risk**: Floating card positioning may need minor adjustments across different screen sizes
- **Low Risk**: Badge variant naming conflicts avoided by using new_badge instead of new

**Migration Strategy:**

- Demo page remains unchanged for reference during development
- Can be removed after successful migration verification
- Gradual rollout possible by feature-flagging hero section component

**Performance Considerations:**

- Platform stats query aggregates across all tables - may need optimization for large datasets
- Featured bobblehead query limited to 1 result for hero section
- Suspense boundaries prevent blocking page load on slow data fetches
- ISR revalidation at 300 seconds balances freshness and performance

**Testing Recommendations:**

- Verify platform stats accuracy against database counts
- Test loading states with simulated slow network
- Verify authentication flow with sign-up and existing user states
- Test responsive design at mobile, tablet, and desktop breakpoints
- Verify dark mode styling on all hero section elements
- Test accessibility with screen reader
