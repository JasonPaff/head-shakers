# Step 3: Implementation Planning

## Step Metadata

- **Start Time**: 2025-01-19T00:00:30Z
- **End Time**: 2025-01-19T00:00:35Z
- **Duration**: 5 seconds
- **Status**: Success ✅

## Input Provided

- Refined feature request from Step 1
- File discovery analysis from Step 2
- Project context including existing infrastructure

## Agent Prompt Sent

```
Generate an implementation plan in MARKDOWN format (NOT XML) following your defined template with these sections: ## Overview (with Estimated Duration, Complexity, Risk Level), ## Quick Summary, ## Prerequisites, ## Implementation Steps (each step with What/Why/Confidence/Files/Changes/Validation Commands/Success Criteria), ## Quality Gates, ## Notes. IMPORTANT: Include 'npm run lint:fix && npm run typecheck' validation for every step touching JS/JSX/TS/TSX files. Do NOT include code examples.

Feature Request: I want to implement comprehensive view tracking functionality in the Head Shakers app to monitor user engagement with collections, subcollections, and individual bobbleheads, enabling analytics on content popularity and user behavior patterns. This feature should leverage the existing PostgreSQL database with Neon serverless to create a dedicated views table using Drizzle ORM schema definitions, storing relationships between authenticated Clerk users and viewed content items with timestamps, IP addresses (for anonymous tracking), and metadata like session duration and referrer sources. The implementation should utilize server actions with Next-Safe-Action for secure view recording, integrating with the existing TanStack Query setup for efficient client-side state management and real-time view count updates. To optimize performance and reduce database load, the system should implement view aggregation using Upstash Redis for caching recent views and batching write operations, while employing Upstash QStash for background processing of view analytics and generating trending content recommendations. The tracking should be implemented as middleware or page-level components that automatically record views when users navigate to collection detail pages, subcollection galleries, or individual bobblehead profiles, respecting user privacy preferences and implementing rate limiting to prevent artificial inflation of view counts. The feature should include admin dashboard components built with TanStack React Table for displaying view analytics, popular content insights, and user engagement metrics, while ensuring the view tracking integrates seamlessly with the existing social features like likes and follows to provide comprehensive content performance data. All view data should be validated using Zod schemas derived from Drizzle table definitions, and the implementation should include proper error handling with Sentry monitoring, TypeScript type safety throughout the data flow, and support for both authenticated user tracking and anonymous visitor analytics to maximize insights into content consumption patterns across the platform.

Discovered Files Analysis: The codebase already has a strong foundation with an existing contentViews table in analytics.schema.ts, comprehensive validation schemas, Redis integration, sophisticated caching service, and middleware setup. Key existing files include analytics schema and validations, Redis keys, cache service, and middleware. New files needed include server actions, queries, facades, services for view tracking, client components, and admin dashboard components. The implementation can leverage existing infrastructure including the analytics table, caching patterns, Redis integration, and clean architecture patterns already in place.
```

## Implementation Plan Generated

Based on my analysis of the codebase, I can see the existing infrastructure is well-suited for implementing comprehensive view tracking. The project already has the analytics schema with a `contentViews` table, Redis integration, caching services, and middleware setup. Here's my implementation plan:

# Implementation Plan: Comprehensive View Tracking Functionality

## Overview

**Estimated Duration**: 4-5 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

Implement comprehensive view tracking functionality leveraging existing analytics infrastructure to monitor user engagement with collections, subcollections, and bobbleheads. The solution will use Redis for caching and batching, server actions for secure recording, and provide admin analytics dashboard components while respecting user privacy and implementing rate limiting.

## Prerequisites

- [ ] Verify Upstash Redis is configured and accessible
- [ ] Confirm Upstash QStash is set up for background processing
- [ ] Ensure TanStack Query is properly configured in the client
- [ ] Verify Clerk authentication is working correctly

## Implementation Steps

### Step 1: Create View Tracking Server Actions

**What**: Implement server actions for recording and batch processing view events
**Why**: Server actions provide secure, validated view recording with proper authentication
**Confidence**: High

**Files to Create:**

- `src/lib/actions/analytics/view-tracking.actions.ts` - Core view recording server actions

**Files to Modify:**

- `src/lib/constants/redis-keys.ts` - Add view tracking specific Redis keys
- `src/lib/constants/action-names.ts` - Add action names for view tracking

**Changes:**

- Add secure server actions for recording individual views with rate limiting
- Implement batch view processing action for bulk operations
- Add view aggregation action for background processing
- Include proper validation using existing Zod schemas
- Integrate with Redis for caching and batching operations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All server actions properly validate input using Zod schemas
- [ ] Rate limiting prevents artificial view inflation
- [ ] Actions integrate with existing error handling patterns
- [ ] All validation commands pass

---

### Step 2: Implement View Tracking Queries

**What**: Create database queries for view analytics and aggregation
**Why**: Efficient queries are needed for fetching view counts and analytics data
**Confidence**: High

**Files to Create:**

- `src/lib/queries/analytics/view-tracking.query.ts` - Database queries for view operations
- `src/lib/queries/analytics/view-analytics.query.ts` - Analytics and aggregation queries

**Files to Modify:**

- `src/lib/queries/base/base-query.ts` - Extend base query with view tracking helpers

**Changes:**

- Add queries for recording single and batch views
- Implement view count retrieval with caching integration
- Create trending content queries based on view metrics
- Add user engagement analytics queries
- Include proper permission filtering for privacy

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Queries properly use existing database schema
- [ ] View counting queries are optimized with proper indexes
- [ ] Analytics queries support date range filtering
- [ ] All validation commands pass

---

### Step 3: Create View Tracking Business Logic Facade

**What**: Implement facade layer for view tracking business logic
**Why**: Facade provides clean API and business rule enforcement for view operations
**Confidence**: High

**Files to Create:**

- `src/lib/facades/analytics/view-tracking.facade.ts` - Business logic for view tracking

**Files to Modify:**

- `src/lib/facades/collections/collections.facade.ts` - Integrate view tracking
- `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Integrate view tracking

**Changes:**

- Add view recording with deduplication logic
- Implement view count retrieval with caching
- Create trending content identification
- Add user engagement metrics calculation
- Integrate with existing privacy and permission systems

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Facade properly enforces business rules for view tracking
- [ ] Integration with existing facades maintains consistency
- [ ] View deduplication prevents spam
- [ ] All validation commands pass

---

### Step 4: Implement Redis Caching and Batching Service

**What**: Create specialized service for view tracking caching and batch processing
**Why**: Redis caching reduces database load and enables efficient batch operations
**Confidence**: Medium

**Files to Create:**

- `src/lib/services/view-tracking.service.ts` - Redis-based view caching and batching

**Files to Modify:**

- `src/lib/services/cache.service.ts` - Add view tracking cache utilities
- `src/lib/constants/redis-keys.ts` - Add comprehensive view tracking keys

**Changes:**

- Add Redis-based view batching with configurable intervals
- Implement view count caching with TTL management
- Create trending content cache management
- Add view session tracking for duration calculation
- Include background job scheduling for batch processing

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Redis operations properly handle connection failures
- [ ] Batch processing efficiently groups view events
- [ ] Cache invalidation works correctly
- [ ] All validation commands pass

---

### Step 5: Create Client-Side View Tracking Components

**What**: Implement React components for automatic view tracking
**Why**: Client components enable seamless view recording during user navigation
**Confidence**: High

**Files to Create:**

- `src/components/analytics/view-tracker.tsx` - Generic view tracking component
- `src/components/analytics/collection-view-tracker.tsx` - Collection-specific tracker
- `src/components/analytics/bobblehead-view-tracker.tsx` - Bobblehead-specific tracker

**Files to Modify:**

- `src/components/analytics/index.ts` - Export new components

**Changes:**

- Add intersection observer-based view detection
- Implement session duration tracking with visibility API
- Create debounced view recording to prevent spam
- Add proper error handling for tracking failures
- Include support for anonymous and authenticated users

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Components properly detect when content enters viewport
- [ ] View tracking respects user privacy preferences
- [ ] Error handling doesn't break user experience
- [ ] All validation commands pass

---

### Step 6: Integrate View Tracking into Existing Pages

**What**: Add view tracking components to collection, bobblehead, and profile pages
**Why**: Integration enables automatic view recording across all content types
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/collections/[collectionId]/(collection)/page.tsx` - Add collection view tracking
- `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/page.tsx` - Add bobblehead view tracking
- `src/app/(app)/users/[userId]/page.tsx` - Add profile view tracking
- `src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/page.tsx` - Add subcollection tracking

**Changes:**

- Add view tracking components to each content type page
- Pass proper props for content identification
- Ensure tracking works for both authenticated and anonymous users
- Include proper error boundaries for tracking failures

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] View tracking activates on all target pages
- [ ] Anonymous and authenticated tracking both function
- [ ] Page performance is not negatively impacted
- [ ] All validation commands pass

---

### Step 7: Create Admin Analytics Dashboard Components

**What**: Build comprehensive analytics dashboard components for admin interface
**Why**: Admin dashboard provides insights into content performance and user engagement
**Confidence**: Medium

**Files to Create:**

- `src/components/admin/analytics/view-analytics-dashboard.tsx` - Main analytics dashboard
- `src/components/admin/analytics/trending-content-table.tsx` - Trending content display
- `src/components/admin/analytics/engagement-metrics-card.tsx` - Engagement metrics
- `src/components/admin/analytics/view-charts.tsx` - Charts for view analytics

**Files to Modify:**

- `src/app/(app)/admin/analytics/page.tsx` - Integrate new dashboard components

**Changes:**

- Add real-time view metrics display with auto-refresh
- Implement trending content tables with sorting and filtering
- Create engagement metric cards with period comparisons
- Add interactive charts for view trends and patterns
- Include export functionality for analytics data

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Dashboard displays accurate real-time metrics
- [ ] Charts and tables render without performance issues
- [ ] Data export functionality works correctly
- [ ] All validation commands pass

---

### Step 8: Implement Background Processing with QStash

**What**: Create background jobs for view aggregation and trending calculations
**Why**: Background processing ensures analytics accuracy without impacting user experience
**Confidence**: Medium

**Files to Create:**

- `src/app/api/analytics/process-views/route.ts` - API route for view processing webhook
- `src/lib/jobs/view-aggregation.job.ts` - Background job for view aggregation
- `src/lib/jobs/trending-calculation.job.ts` - Job for calculating trending content

**Files to Modify:**

- `src/lib/services/view-tracking.service.ts` - Add job scheduling functionality

**Changes:**

- Add webhook endpoint for QStash view processing jobs
- Implement view aggregation job with proper error handling
- Create trending content calculation with configurable algorithms
- Add job scheduling for regular analytics updates
- Include proper authentication for webhook endpoints

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Background jobs process view data correctly
- [ ] Webhook authentication prevents unauthorized access
- [ ] Job failures are properly logged and handled
- [ ] All validation commands pass

---

### Step 9: Add Privacy Controls and Rate Limiting

**What**: Implement privacy controls and rate limiting for view tracking
**Why**: Privacy compliance and spam prevention are essential for user trust
**Confidence**: High

**Files to Create:**

- `src/lib/utils/view-privacy.utils.ts` - Privacy utilities for view tracking
- `src/lib/utils/rate-limiting.utils.ts` - Rate limiting utilities

**Files to Modify:**

- `src/lib/actions/analytics/view-tracking.actions.ts` - Add privacy and rate limiting
- `src/middleware.ts` - Add view tracking rate limiting middleware

**Changes:**

- Add user privacy preference checking
- Implement IP-based rate limiting for anonymous users
- Create session-based rate limiting for authenticated users
- Add opt-out functionality for view tracking
- Include proper GDPR compliance measures

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Privacy preferences are properly respected
- [ ] Rate limiting prevents abuse without affecting normal users
- [ ] GDPR compliance requirements are met
- [ ] All validation commands pass

---

### Step 10: Add TanStack Query Integration and Real-time Updates

**What**: Integrate view tracking with TanStack Query for efficient state management
**Why**: TanStack Query provides optimized caching and real-time updates for view data
**Confidence**: High

**Files to Create:**

- `src/lib/hooks/use-view-tracking.ts` - Custom hook for view tracking
- `src/lib/hooks/use-view-analytics.ts` - Hook for analytics data

**Files to Modify:**

- `src/components/analytics/view-tracker.tsx` - Integrate TanStack Query
- `src/components/admin/analytics/view-analytics-dashboard.tsx` - Add real-time updates

**Changes:**

- Add TanStack Query mutations for view recording
- Implement optimistic updates for view counts
- Create real-time analytics data fetching
- Add proper cache invalidation on view updates
- Include error handling and retry logic

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] View counts update in real-time across components
- [ ] Query caching improves performance
- [ ] Error handling provides good user experience
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] View tracking works for authenticated and anonymous users
- [ ] Rate limiting prevents spam without affecting normal usage
- [ ] Privacy controls respect user preferences
- [ ] Admin dashboard displays accurate analytics
- [ ] Background processing completes without errors
- [ ] Performance impact on pages is minimal

## Notes

**Assumptions:**

- Upstash Redis and QStash are properly configured
- Current analytics schema is sufficient for requirements
- Existing caching patterns can be extended for view tracking

**Risk Mitigation:**

- Implement fallback mechanisms if Redis is unavailable
- Use circuit breaker pattern for external service dependencies
- Add comprehensive error logging for troubleshooting
- Include feature flags for gradual rollout

**Performance Considerations:**

- Batch view recording to minimize database writes
- Use Redis for high-frequency operations
- Implement proper database indexes for analytics queries
- Cache trending content calculations

## Plan Validation Results

- **Format Check**: ✅ Markdown format confirmed (not XML)
- **Template Compliance**: ✅ All required sections present
- **Validation Commands**: ✅ All steps include lint:fix && typecheck
- **Content Quality**: ✅ No code examples included, only instructions
- **Completeness**: ✅ Plan addresses all aspects of refined request

## Complexity Assessment

- **Estimated Duration**: 4-5 days
- **Implementation Steps**: 10 detailed steps
- **Risk Level**: Medium (due to Redis/QStash dependencies)
- **File Changes**: 18 new files, 12 existing files to modify
- **Quality Gates**: 8 comprehensive validation criteria
