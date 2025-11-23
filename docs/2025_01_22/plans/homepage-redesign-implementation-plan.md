# Homepage Redesign Implementation Plan

**Generated**: 2025-01-22
**Original Request**: an expanded, redesigned, more inviting homepage, both for public (unauthenticated) users and logged in users

## Refined Request

Design and implement a comprehensive homepage redesign for Head Shakers that creates a distinctly inviting and engaging experience for both unauthenticated public visitors and logged-in users, with each audience receiving a contextually appropriate landing experience. For public users, the homepage should serve as a compelling entry point that showcases the vibrant bobblehead collector community, featuring a hero section that communicates the platform's core value proposition, a curated selection of featured collections and trending bobbleheads that demonstrate the breadth and passion within the community, educational content that explains what Head Shakers offers, and clear calls-to-action that guide visitors toward authentication. For authenticated users, the homepage should transform into a personalized content hub that prioritizes their own collections and social context, displaying their collection summaries, recent activity from followed collectors, recommendations based on their interests and existing collections, and quick-access tools for managing and sharing their content. The redesign should maintain visual consistency with the existing Radix UI component library and Tailwind CSS 4 styling while introducing thoughtful improvements to information hierarchy, visual appeal, and user guidance through better use of whitespace, typography, imagery via Cloudinary integration, and interactive elements. The implementation should leverage the existing app architecture with separate route handling via the (public) and (app) route groups, utilize server components for efficient data fetching and SEO optimization on the public homepage, integrate with current social features such as featured content management, follows, likes, and comments to surface meaningful content, and ensure the experience feels native to the platform while being distinctly different from the existing dashboard and collection pages. The redesign should be data-driven, using analytics and user behavior to inform which collections and content are surfaced, and should be performant and accessible, following WCAG standards and ensuring fast load times even with rich visual content from Cloudinary.

## Analysis Summary

- Feature request refined with project context
- Discovered 35+ files across 4 priority levels
- Generated 12-step implementation plan

## File Discovery Results

### Critical Priority (Must Modify)
- `src/app/(app)/(home)/page.tsx` - Current authenticated homepage
- `src/app/(public)/coming-soon/page.tsx` - Current public landing page
- `src/app/(public)/layout.tsx` - Public route layout
- `src/app/(app)/(home)/components/async/featured-collections-async.tsx` - Featured collections data fetcher
- `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Featured collections UI

### High Priority (Likely Modify)
- `src/app/(app)/(home)/components/skeletons/featured-collections-skeleton.tsx` - Loading skeleton
- `src/app/(app)/(home)/components/featured-collections-error-boundary.tsx` - Error boundary
- `src/app/(app)/dashboard/feed/page.tsx` - Activity feed page
- `src/lib/facades/featured-content/featured-content.facade.ts` - Featured content business logic
- `src/lib/queries/featured-content/featured-content-query.ts` - Featured content queries
- `src/lib/facades/social/social.facade.ts` - Social features business logic
- `src/lib/queries/social/social.query.ts` - Social database queries
- `src/lib/queries/collections/collections.query.ts` - Collections queries

### Medium Priority (Integration/Reference)
- `src/components/layout/app-header/app-header.tsx` - Main header
- `src/components/ui/auth.tsx` - AuthContent component
- `src/components/ui/card.tsx`, `carousel.tsx`, `button.tsx`, `like-button.tsx` - UI components
- `src/lib/seo/seo.constants.ts`, `metadata.utils.ts`, `jsonld.utils.ts` - SEO utilities
- `src/utils/optional-auth-utils.ts` - Optional auth utilities
- `src/lib/constants/cloudinary-paths.ts` - Cloudinary paths

---

## Overview

**Estimated Duration**: 5-7 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

This plan implements a comprehensive homepage redesign that creates distinct experiences for public (unauthenticated) and authenticated users. The public homepage will showcase the bobblehead collector community with compelling hero content, featured collections, and trending content to drive signups. The authenticated homepage will transform into a personalized content hub displaying collection summaries, activity from followed collectors, recommendations, and quick-access tools.

## Prerequisites

- [ ] Verify existing FeaturedContentFacade methods are working correctly
- [ ] Confirm Cloudinary integration is properly configured
- [ ] Review current database schema for follows and social features
- [ ] Ensure CacheService patterns are understood for new components

## Implementation Steps

### Step 1: Create Homepage Type Definitions and Shared Utilities

**What**: Define TypeScript types and shared utilities for the new homepage components.
**Why**: Establishing type safety upfront prevents runtime errors and enables better IDE support throughout development.
**Confidence**: High

**Files to Create:**
- `src/app/(app)/(home)/types/homepage.types.ts` - Type definitions for homepage data structures

**Files to Modify:**
- None

**Changes:**
- Create type definitions for `PublicHomepageData`, `AuthenticatedHomepageData`
- Create types for `TrendingBobblehead`, `FeaturedCollectionCard`, `CollectionSummary`
- Create types for `ActivityFeedItem`, `RecommendedCollection`
- Create type definitions for homepage section props

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All type definitions compile without errors
- [ ] Types are exportable and usable in other files
- [ ] All validation commands pass

---

### Step 2: Create Homepage Facade for Aggregated Data Fetching

**What**: Build a new HomepageFacade to orchestrate data fetching for both public and authenticated homepage variants.
**Why**: Centralizes business logic for homepage data, follows the established facade pattern, and enables efficient caching strategies.
**Confidence**: High

**Files to Create:**
- `src/lib/facades/homepage/homepage.facade.ts` - Main facade for homepage data operations

**Files to Modify:**
- None

**Changes:**
- Implement `getPublicHomepageData()` method aggregating featured content, trending items, and community stats
- Implement `getAuthenticatedHomepageData(userId)` method aggregating user collections, activity feed, and recommendations
- Implement `getTrendingBobbleheads(limit)` method for trending content section
- Implement `getFollowedUsersActivity(userId, limit)` method for activity feed
- Implement `getCollectionRecommendations(userId, limit)` method for personalized recommendations
- Add proper caching using CacheService patterns
- Add Sentry breadcrumbs for monitoring

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Facade methods return properly typed data
- [ ] Caching is implemented following existing patterns
- [ ] Error handling follows facade error context patterns
- [ ] All validation commands pass

---

### Step 3: Create Public Homepage Components Structure

**What**: Build the async/display component structure for the public homepage sections.
**Why**: Following the established async/display pattern ensures proper server-side data fetching with client-side interactivity.
**Confidence**: High

**Files to Create:**
- `src/app/(public)/(home)/components/async/hero-section-async.tsx` - Server component for hero data
- `src/app/(public)/(home)/components/display/hero-section-display.tsx` - Client display for hero section
- `src/app/(public)/(home)/components/async/trending-bobbleheads-async.tsx` - Server component for trending data
- `src/app/(public)/(home)/components/display/trending-bobbleheads-display.tsx` - Client display for trending
- `src/app/(public)/(home)/components/async/community-showcase-async.tsx` - Server component for community stats
- `src/app/(public)/(home)/components/display/community-showcase-display.tsx` - Client display for community stats
- `src/app/(public)/(home)/components/skeletons/hero-section-skeleton.tsx` - Loading skeleton
- `src/app/(public)/(home)/components/skeletons/trending-bobbleheads-skeleton.tsx` - Loading skeleton
- `src/app/(public)/(home)/components/skeletons/community-showcase-skeleton.tsx` - Loading skeleton

**Files to Modify:**
- None

**Changes:**
- Implement hero section with compelling headline, value proposition, and CTAs
- Implement trending bobbleheads carousel using existing Carousel component
- Implement community showcase with collector stats and featured users
- Create skeleton components matching final layouts
- Use Cloudinary integration for images via CldImage
- Use $path for all internal navigation links

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All components follow async/display pattern
- [ ] Skeleton components match final component layouts
- [ ] Components use proper TypeScript types
- [ ] All validation commands pass

---

### Step 4: Create Public Homepage Page and Layout

**What**: Build the main public homepage page that replaces the current coming-soon page.
**Why**: Creates the primary entry point for unauthenticated visitors with optimized SEO metadata and structured data.
**Confidence**: High

**Files to Create:**
- `src/app/(public)/(home)/page.tsx` - Main public homepage page
- `src/app/(public)/(home)/error-boundaries/homepage-error-boundary.tsx` - Error boundary for public homepage

**Files to Modify:**
- `src/app/(public)/layout.tsx` - Add public header/footer structure

**Changes:**
- Create page with generateMetadata function for SEO optimization
- Add JSON-LD structured data using existing seo.constants
- Implement Suspense boundaries with skeleton components
- Implement error boundaries for graceful degradation
- Add revalidation timing for ISR (revalidate = 300)
- Structure layout with hero, featured collections, trending, community sections
- Add clear CTAs directing to authentication

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Page renders with proper SEO metadata
- [ ] JSON-LD structured data is valid
- [ ] Suspense boundaries show skeletons during loading
- [ ] Error boundaries catch and display errors gracefully
- [ ] All validation commands pass

---

### Step 5: Create Authenticated Homepage Components Structure

**What**: Build the async/display component structure for authenticated user homepage sections.
**Why**: Authenticated users need personalized content that differs significantly from the public view.
**Confidence**: High

**Files to Create:**
- `src/app/(app)/(home)/components/async/collection-summary-async.tsx` - Server component for user's collections
- `src/app/(app)/(home)/components/display/collection-summary-display.tsx` - Client display for collection summary
- `src/app/(app)/(home)/components/async/activity-feed-async.tsx` - Server component for activity feed
- `src/app/(app)/(home)/components/display/activity-feed-display.tsx` - Client display for activity feed
- `src/app/(app)/(home)/components/async/recommendations-async.tsx` - Server component for recommendations
- `src/app/(app)/(home)/components/display/recommendations-display.tsx` - Client display for recommendations
- `src/app/(app)/(home)/components/async/quick-actions-async.tsx` - Server component for quick actions
- `src/app/(app)/(home)/components/display/quick-actions-display.tsx` - Client display for quick actions
- `src/app/(app)/(home)/components/skeletons/collection-summary-skeleton.tsx` - Loading skeleton
- `src/app/(app)/(home)/components/skeletons/activity-feed-skeleton.tsx` - Loading skeleton
- `src/app/(app)/(home)/components/skeletons/recommendations-skeleton.tsx` - Loading skeleton
- `src/app/(app)/(home)/components/skeletons/quick-actions-skeleton.tsx` - Loading skeleton

**Files to Modify:**
- None

**Changes:**
- Implement collection summary cards showing user's collections with metrics
- Implement activity feed showing recent actions from followed collectors
- Implement recommendations section based on user interests
- Implement quick actions for common tasks (add bobblehead, create collection)
- Create skeleton components matching final layouts
- Use Cloudinary integration for images via CldImage
- Use $path for all internal navigation links

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All components follow async/display pattern
- [ ] Components properly fetch and display user-specific data
- [ ] Skeleton components match final component layouts
- [ ] All validation commands pass

---

### Step 6: Redesign Authenticated Homepage Page

**What**: Refactor the existing authenticated homepage to use the new personalized component structure.
**Why**: The authenticated homepage needs to transform from a generic landing to a personalized content hub.
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/(home)/page.tsx` - Refactor authenticated homepage

**Changes:**
- Restructure page layout with personalized greeting section
- Add collection summary section using new components
- Add activity feed section for followed collectors
- Add recommendations section based on user data
- Add quick actions section for common tasks
- Preserve existing featured collections section with refinements
- Update metadata generation for authenticated context
- Maintain username onboarding provider functionality

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Page displays personalized content for authenticated users
- [ ] Username onboarding continues to work correctly
- [ ] All Suspense boundaries function properly
- [ ] Page maintains good performance metrics
- [ ] All validation commands pass

---

### Step 7: Create Activity Feed Query and Data Layer

**What**: Implement database queries and facade methods for the activity feed functionality.
**Why**: Activity feed requires new queries to aggregate actions from followed users.
**Confidence**: Medium

**Files to Create:**
- `src/lib/queries/activity/activity.query.ts` - Activity feed database queries

**Files to Modify:**
- `src/lib/facades/homepage/homepage.facade.ts` - Add activity feed methods

**Changes:**
- Create query to fetch recent activity from followed users
- Query should aggregate: new bobbleheads added, collections created, likes given
- Implement pagination support for activity feed
- Add proper indexing recommendations for activity queries
- Implement caching strategy for activity feed data
- Add activity type filtering capabilities

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Activity queries return properly typed data
- [ ] Queries are performant with proper indexes
- [ ] Caching is implemented for activity data
- [ ] All validation commands pass

---

### Step 8: Implement Recommendations Engine

**What**: Create the recommendation logic based on user's collection categories and followed users.
**Why**: Personalized recommendations increase engagement and content discovery.
**Confidence**: Medium

**Files to Create:**
- `src/lib/queries/recommendations/recommendations.query.ts` - Recommendation queries

**Files to Modify:**
- `src/lib/facades/homepage/homepage.facade.ts` - Add recommendation methods

**Changes:**
- Implement category-based collection recommendations
- Implement similar collectors recommendations based on collection overlap
- Implement trending in categories recommendations
- Add scoring algorithm for recommendation ranking
- Implement caching for recommendation results
- Add fallback recommendations for new users with limited data

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Recommendations are relevant to user's interests
- [ ] New users receive appropriate fallback recommendations
- [ ] Recommendation queries are performant
- [ ] All validation commands pass

---

### Step 9: Implement Community Statistics and Trending Logic

**What**: Create queries and facade methods for community statistics and trending content.
**Why**: Public homepage needs compelling community data to attract new users.
**Confidence**: High

**Files to Modify:**
- `src/lib/facades/homepage/homepage.facade.ts` - Add community stats methods

**Changes:**
- Implement total collectors count query
- Implement total bobbleheads count query
- Implement trending bobbleheads algorithm (based on recent likes, views)
- Implement featured collectors selection logic
- Add caching for community statistics (longer TTL)
- Add trending time window configuration

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Community stats are accurate and cached appropriately
- [ ] Trending algorithm produces meaningful results
- [ ] Statistics update at reasonable intervals
- [ ] All validation commands pass

---

### Step 10: Refine Visual Design and Accessibility

**What**: Apply consistent visual design improvements and ensure WCAG compliance across all homepage components.
**Why**: Visual appeal and accessibility are critical for user experience and legal compliance.
**Confidence**: High

**Files to Modify:**
- All display component files created in previous steps
- `src/app/(public)/(home)/page.tsx` - Visual refinements
- `src/app/(app)/(home)/page.tsx` - Visual refinements

**Changes:**
- Apply consistent spacing using Tailwind CSS 4 utilities
- Implement improved typography hierarchy
- Add focus indicators for keyboard navigation
- Add proper ARIA labels and roles
- Implement reduced motion support for animations
- Add proper alt text for all images
- Ensure color contrast meets WCAG AA standards
- Add skip navigation links

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All interactive elements are keyboard accessible
- [ ] Color contrast ratios meet WCAG AA requirements
- [ ] All images have descriptive alt text
- [ ] Focus states are clearly visible
- [ ] All validation commands pass

---

### Step 11: Optimize Performance and Add Monitoring

**What**: Implement performance optimizations and add Sentry monitoring for the new homepage components.
**Why**: Homepage performance directly impacts user experience and SEO rankings.
**Confidence**: High

**Files to Modify:**
- `src/lib/facades/homepage/homepage.facade.ts` - Add performance monitoring
- Display components - Add performance optimizations

**Changes:**
- Implement image lazy loading with Cloudinary transformations
- Add Sentry breadcrumbs for key user interactions
- Implement performance monitoring for data fetching
- Add proper cache invalidation strategies
- Optimize bundle size by code-splitting where appropriate
- Add preload hints for critical resources
- Implement stale-while-revalidate caching patterns

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Page load time under 3 seconds on 3G connection
- [ ] Largest Contentful Paint (LCP) under 2.5 seconds
- [ ] Sentry captures meaningful breadcrumbs
- [ ] Cache invalidation works correctly
- [ ] All validation commands pass

---

### Step 12: Update Navigation and Routing

**What**: Update navigation components and routing to properly link to the new homepage structure.
**Why**: Users need consistent navigation to access the new homepage from anywhere in the app.
**Confidence**: High

**Files to Modify:**
- `src/components/layout/app-header/app-header.tsx` - Update home link behavior

**Changes:**
- Update home link to properly route based on auth state
- Ensure logo click navigates to appropriate homepage
- Update any breadcrumb components to include new routes
- Verify $path routing works correctly for all new pages
- Add proper active state indicators for navigation

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Navigation correctly routes to appropriate homepage based on auth state
- [ ] All internal links use $path routing
- [ ] Breadcrumbs display correctly
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Build completes successfully with `npm run build`
- [ ] Public homepage loads correctly for unauthenticated users
- [ ] Authenticated homepage displays personalized content
- [ ] All Suspense boundaries show proper loading states
- [ ] Error boundaries catch and display errors gracefully
- [ ] Page accessibility meets WCAG AA standards
- [ ] Performance metrics meet target thresholds

## Notes

**Architecture Decisions:**
- The plan follows the existing async/display component pattern for consistency
- HomepageFacade centralizes all homepage-related business logic
- Activity feed requires new database queries but uses existing follows schema
- Recommendations are based on existing collection categories and social data

**Potential Risks:**
- Activity feed queries may need database index optimization for performance at scale
- Recommendation algorithm quality depends on available user data
- Public homepage content relies on having sufficient featured content in the database

**Assumptions:**
- The existing FeaturedContentFacade methods are working correctly
- Cloudinary integration is properly configured and functional
- The follows schema supports the activity feed requirements
- Sufficient featured content exists in the database for the public homepage
