# Subcollection Page Skeleton Loader Implementation Plan

## Executive Summary

This document outlines a comprehensive plan to enhance the loading experience for subcollection pages (`/collections/[collectionId]/subcollection/[subcollectionId]`) by implementing skeleton loaders that mirror the actual page structure and utilizing React Suspense boundaries for independent section loading. This implementation follows the successful pattern established by the collection page skeleton implementation.

## Current State Analysis

### Existing Loading Implementation

**Current Loading Component** (`src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/loading.tsx`):
- Simple full-page spinner with generic `<Loading />` component
- No visual indication of page structure
- Single loading state for entire page
- No progressive loading experience

**Current Page Architecture** (`src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/page.tsx`):
- Monolithic data fetching in single async component (`subcollection.tsx`)
- All data loaded before any UI renders in the main `Subcollection` component
- No streaming or progressive loading
- Two main API calls: subcollection data and like data

### Page Structure Analysis

Based on code analysis, the loaded subcollection page consists of:

1. **Header Section** (`SubcollectionHeader`):
   - Back to collection button
   - Subcollection title and description
   - Like button with count
   - Creation date and bobblehead count
   - Share, edit, and delete buttons

2. **Main Content Area** (`SubcollectionBobbleheads`):
   - Section title and add bobblehead button
   - Search and sort controls (`SubcollectionControls`)
   - Bobblehead grid (3-column on desktop)
   - Empty state handling

3. **Sidebar** (`SubcollectionMetrics`):
   - Total bobbleheads metric card
   - Featured items metric card
   - Last updated metric card

## Architecture Improvements

### 1. Suspense Boundary Strategy

```
Subcollection Page
├── Suspense: Header Section
│   ├── SubcollectionHeaderSkeleton
│   └── SubcollectionHeaderAsync (server component)
├── Main Content Grid
│   ├── Suspense: Bobbleheads Section
│   │   ├── SubcollectionBobbleheadsSkeleton
│   │   └── SubcollectionBobbleheadsAsync (server component)
│   └── Sidebar
│       └── Suspense: Metrics Section
│           ├── SubcollectionMetricsSkeleton
│           └── SubcollectionMetricsAsync (server component)
```

### 2. Data Fetching Optimization

**Current Approach:**
```typescript
// All data fetched in subcollection.tsx before rendering
const subcollection = await SubcollectionsFacade.getSubCollectionForPublicView(...)
const likeResult = await SocialFacade.getContentLikeData(...)
// Bobbleheads fetched in SubcollectionBobbleheads component
```

**Improved Approach:**
```typescript
// Split data fetching across components for streaming
- Basic subcollection info: Immediate (for verification)
- Header data (subcollection + like): Independent Suspense boundary
- Bobbleheads data: Independent Suspense boundary
- Metrics data: Independent Suspense boundary (can use basic subcollection info)
```

## Component Implementation Plan

### 1. Skeleton Components to Create

#### `SubcollectionHeaderSkeleton.tsx`
```typescript
export const SubcollectionHeaderSkeleton = () => (
  <Fragment>
    {/* Back to Collection Button and Action Buttons */}
    <div className={'mb-6 flex items-center justify-between gap-4'}>
      <Skeleton className={'h-9 w-48'} /> {/* Back button */}

      {/* Share, Edit, Delete Buttons */}
      <div className={'flex items-center gap-2'}>
        <Skeleton className={'h-9 w-20'} /> {/* Share */}
        <Skeleton className={'h-9 w-16'} /> {/* Edit */}
        <Skeleton className={'h-9 w-16'} /> {/* Delete */}
      </div>
    </div>

    <div className={'flex flex-col gap-6'}>
      {/* Subcollection Info */}
      <div>
        <Skeleton className={'mb-3 h-10 w-64'} /> {/* Title */}
        <Skeleton className={'h-6 w-96'} />        {/* Description */}
      </div>

      {/* Subcollection Metadata & Like Button */}
      <div className={'flex flex-wrap items-center justify-between gap-4'}>
        {/* Like Button */}
        <Skeleton className={'h-8 w-20'} />

        <div className={'flex items-center gap-4'}>
          {/* Bobblehead Count */}
          <Skeleton className={'h-5 w-28'} />

          {/* Creation Date */}
          <div className={'flex items-center gap-2'}>
            <Skeleton className={'h-4 w-4'} />
            <Skeleton className={'h-5 w-32'} />
          </div>
        </div>
      </div>
    </div>
  </Fragment>
)
```

#### `SubcollectionBobbleheadsSkeleton.tsx`
```typescript
export const SubcollectionBobbleheadsSkeleton = () => (
  <div>
    <div className={'mb-4 flex items-center justify-between'}>
      {/* Section Title */}
      <Skeleton className={'h-8 w-80'} />

      {/* Add Bobblehead Button */}
      <Skeleton className={'h-10 w-36'} />
    </div>

    {/* Filter Controls */}
    <div className={'mb-4'}>
      <div className={'flex justify-between'}>
        <div className={'flex gap-2'}>
          <Skeleton className={'h-10 w-64'} />  {/* Search */}
          <Skeleton className={'h-10 w-48'} />  {/* Sort */}
        </div>
      </div>
    </div>

    {/* Bobblehead Grid */}
    <div className={'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
      {Array.from({ length: 6 }).map((_, i) => (
        <BobbleheadCardSkeleton key={i} />
      ))}
    </div>
  </div>
)
```

#### `SubcollectionMetricsSkeleton.tsx`
```typescript
export const SubcollectionMetricsSkeleton = () => (
  <div className={'mb-8 grid grid-cols-1 gap-6'}>
    {/* Total Items Card */}
    <Card>
      <CardContent className={'p-6'}>
        <div className={'flex items-center justify-between'}>
          <div>
            <Skeleton className={'mb-2 h-4 w-32'} /> {/* Label */}
            <Skeleton className={'h-8 w-12'} />      {/* Count */}
          </div>
          <Skeleton className={'h-8 w-8'} />         {/* Icon */}
        </div>
      </CardContent>
    </Card>

    {/* Feature Items Card */}
    <Card>
      <CardContent className={'p-6'}>
        <div className={'flex items-center justify-between'}>
          <div>
            <Skeleton className={'mb-2 h-4 w-28'} /> {/* Label */}
            <Skeleton className={'h-8 w-8'} />       {/* Count */}
          </div>
          <Skeleton className={'h-8 w-8'} />         {/* Icon */}
        </div>
      </CardContent>
    </Card>

    {/* Last Updated Card */}
    <Card>
      <CardContent className={'p-6'}>
        <div className={'flex items-center justify-between'}>
          <div>
            <Skeleton className={'mb-2 h-4 w-24'} /> {/* Label */}
            <Skeleton className={'h-4 w-20'} />      {/* Date */}
          </div>
          <Skeleton className={'h-8 w-8'} />         {/* Icon */}
        </div>
      </CardContent>
    </Card>
  </div>
)
```

### 2. Component Architecture Refactoring

#### Updated `page.tsx` Structure

```typescript
// src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/page.tsx
async function SubcollectionPage({ routeParams, searchParams }: SubcollectionPageProps) {
  const { collectionId, subcollectionId } = await routeParams;
  const resolvedSearchParams = await searchParams;
  const currentUserId = await getOptionalUserId();

  // Only fetch basic subcollection info to verify it exists
  const basicSubcollection = await SubcollectionsFacade.getBasicSubcollectionInfo(
    collectionId,
    subcollectionId,
    currentUserId || undefined,
  );

  if (!basicSubcollection) {
    notFound();
  }

  return (
    <div>
      {/* Header Section with Suspense */}
      <div className={'mt-3 border-b border-border'}>
        <ContentLayout>
          <SubcollectionErrorBoundary section={'header'}>
            <Suspense fallback={<SubcollectionHeaderSkeleton />}>
              <SubcollectionHeaderAsync
                collectionId={collectionId}
                subcollectionId={subcollectionId}
                currentUserId={currentUserId}
              />
            </Suspense>
          </SubcollectionErrorBoundary>
        </ContentLayout>
      </div>

      {/* Main Content */}
      <div className={'mt-4'}>
        <ContentLayout>
          <div className={'grid grid-cols-1 gap-8 lg:grid-cols-12'}>
            {/* Main Content Area */}
            <div className={'order-2 lg:order-1 lg:col-span-9'}>
              <SubcollectionErrorBoundary section={'bobbleheads'}>
                <Suspense fallback={<SubcollectionBobbleheadsSkeleton />}>
                  <SubcollectionBobbleheadsAsync
                    collectionId={collectionId}
                    subcollectionId={subcollectionId}
                    searchParams={resolvedSearchParams}
                    currentUserId={currentUserId}
                  />
                </Suspense>
              </SubcollectionErrorBoundary>
            </div>

            {/* Sidebar */}
            <aside className={'order-1 flex flex-col gap-6 lg:order-2 lg:col-span-3'}>
              <SubcollectionErrorBoundary section={'metrics'}>
                <Suspense fallback={<SubcollectionMetricsSkeleton />}>
                  <SubcollectionMetricsAsync
                    collectionId={collectionId}
                    subcollectionId={subcollectionId}
                    currentUserId={currentUserId}
                  />
                </Suspense>
              </SubcollectionErrorBoundary>
            </aside>
          </div>
        </ContentLayout>
      </div>
    </div>
  );
}
```

#### New Async Components

```typescript
// SubcollectionHeaderAsync.tsx
export const SubcollectionHeaderAsync = async ({
  collectionId,
  subcollectionId,
  currentUserId
}: {
  collectionId: string;
  subcollectionId: string;
  currentUserId: string | null;
}) => {
  const [subcollection, likeData] = await Promise.all([
    SubcollectionsFacade.getSubCollectionForPublicView(
      collectionId,
      subcollectionId,
      currentUserId || undefined
    ),
    SocialFacade.getContentLikeData(
      subcollectionId,
      'subcollection',
      currentUserId || undefined
    )
  ]);

  if (!subcollection) notFound();

  return <SubcollectionHeader subcollection={subcollection} likeData={likeData} />;
};
```

```typescript
// SubcollectionBobbleheadsAsync.tsx
export const SubcollectionBobbleheadsAsync = async ({
  collectionId,
  subcollectionId,
  searchParams,
  currentUserId
}: {
  collectionId: string;
  subcollectionId: string;
  searchParams?: SubcollectionSearchParams;
  currentUserId: string | null;
}) => {
  const subcollection = await SubcollectionsFacade.getSubCollectionForPublicView(
    collectionId,
    subcollectionId,
    currentUserId || undefined,
  );

  if (!subcollection) notFound();

  return (
    <SubcollectionBobbleheads
      collectionId={collectionId}
      searchParams={searchParams}
      subcollection={subcollection}
    />
  );
};
```

```typescript
// SubcollectionMetricsAsync.tsx
export const SubcollectionMetricsAsync = async ({
  collectionId,
  subcollectionId,
  currentUserId
}: {
  collectionId: string;
  subcollectionId: string;
  currentUserId: string | null;
}) => {
  const subcollection = await SubcollectionsFacade.getSubCollectionForPublicView(
    collectionId,
    subcollectionId,
    currentUserId || undefined,
  );

  if (!subcollection) notFound();

  return <SubcollectionMetrics subcollection={subcollection} />;
};
```

### 3. Updated Loading Page

Replace simple spinner with comprehensive skeleton:

```typescript
// src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/loading.tsx
import { ContentLayout } from '@/components/layout/content-layout';

import { SubcollectionBobbleheadsSkeleton } from './components/skeletons/subcollection-bobbleheads-skeleton';
import { SubcollectionHeaderSkeleton } from './components/skeletons/subcollection-header-skeleton';
import { SubcollectionMetricsSkeleton } from './components/skeletons/subcollection-metrics-skeleton';

export default function SubcollectionLoading() {
  return (
    <div>
      {/* Header Skeleton */}
      <div className={'mt-3 border-b border-border'}>
        <ContentLayout>
          <SubcollectionHeaderSkeleton />
        </ContentLayout>
      </div>

      {/* Main Content Skeleton */}
      <div className={'mt-4'}>
        <ContentLayout>
          <div className={'grid grid-cols-1 gap-8 lg:grid-cols-12'}>
            {/* Main Content Area */}
            <div className={'order-2 lg:order-1 lg:col-span-9'}>
              <SubcollectionBobbleheadsSkeleton />
            </div>

            {/* Sidebar */}
            <aside className={'order-1 flex flex-col gap-6 lg:order-2 lg:col-span-3'}>
              <SubcollectionMetricsSkeleton />
            </aside>
          </div>
        </ContentLayout>
      </div>
    </div>
  );
}
```

### 4. Error Boundary Component

```typescript
// SubcollectionErrorBoundary.tsx
'use client';

import type { ErrorInfo, ReactNode } from 'react';

import { AlertCircleIcon } from 'lucide-react';
import { Component } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ErrorBoundaryProps = Children<{
  fallback?: ReactNode;
  section?: string;
}>;

interface ErrorBoundaryState {
  error?: Error;
  hasError: boolean;
}

export class SubcollectionErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.section || 'subcollection component'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className={'border-destructive'}>
          <CardHeader className={'pb-3'}>
            <CardTitle className={'flex items-center gap-2 text-destructive'}>
              <AlertCircleIcon aria-hidden className={'size-4'} />
              Error loading {this.props.section || 'content'}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Alert variant={'error'}>
              We encountered an error while loading this section. Please try refreshing the page.
            </Alert>

            <Button
              className={'mt-3'}
              onClick={() => {
                window.location.reload();
              }}
              size={'sm'}
              variant={'outline'}
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

## Implementation Steps

### Phase 1: Skeleton Components (2-3 hours)
1. **Create skeleton components**:
   - `SubcollectionHeaderSkeleton`
   - `SubcollectionBobbleheadsSkeleton`
   - `SubcollectionMetricsSkeleton`
   - Reuse existing `BobbleheadCardSkeleton` from collection implementation
2. **Update loading.tsx** to use new skeleton layout
3. **Run lint:fix & typecheck** to ensure no errors
4. **Test skeleton visual accuracy** against real components

### Phase 2: Component Refactoring (3-4 hours)
1. **Create async components**:
   - `SubcollectionHeaderAsync`
   - `SubcollectionBobbleheadsAsync`
   - `SubcollectionMetricsAsync`
2. **Create error boundary**:
   - `SubcollectionErrorBoundary`
3. **Run lint:fix & typecheck** to ensure no errors
4. **Update page.tsx** with Suspense boundaries

### Phase 3: Data Layer Optimization (2-3 hours)
1. **Create optimized facade methods** (if needed):
   - `getBasicSubcollectionInfo()` - minimal data for initial render
   - Optimize existing methods for better performance
2. **Implement streaming-friendly queries**
3. **Run lint:fix & typecheck** to ensure no errors
4. **Add proper error handling** for each data section

### Phase 4: Testing & Refinement (1-2 hours)
1. **Visual regression testing** - ensure skeletons match real content
2. **Performance testing** - verify streaming benefits
3. **Accessibility testing** - skeleton announcements
4. **Run lint:fix & typecheck** to ensure no errors
5. **Mobile responsiveness** - ensure skeleton grid matches real layout

## Technical Considerations

### Performance Benefits
- **Perceived Performance**: Users see content structure immediately
- **Progressive Loading**: Sections load independently
- **Faster FCP**: First Contentful Paint with skeleton
- **Streaming**: Server can send HTML as data becomes available

### Accessibility Improvements
- **Screen Reader Support**: Skeletons should have proper ARIA labels
- **Loading Announcements**: Use `aria-live` regions for status updates
- **Focus Management**: Ensure logical tab order during transitions

### Error Handling Strategy
- **Section-Level Errors**: Each Suspense boundary catches its own errors
- **Graceful Degradation**: Show error state without breaking other sections
- **Retry Mechanisms**: Allow users to retry failed sections

### Mobile Considerations
- **Responsive Skeletons**: Match responsive grid layouts
- **Touch Targets**: Ensure skeleton elements don't interfere with interactions
- **Performance**: Optimize animations for mobile devices

## File Structure

```
src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/
├── components/
│   ├── skeletons/
│   │   ├── subcollection-header-skeleton.tsx
│   │   ├── subcollection-bobbleheads-skeleton.tsx
│   │   └── subcollection-metrics-skeleton.tsx
│   ├── async/
│   │   ├── subcollection-header-async.tsx
│   │   ├── subcollection-bobbleheads-async.tsx
│   │   └── subcollection-metrics-async.tsx
│   ├── subcollection-error-boundary.tsx
│   ├── subcollection-header.tsx (existing)
│   ├── subcollection-bobbleheads.tsx (existing)
│   ├── subcollection-metrics.tsx (existing)
│   ├── subcollection-controls.tsx (existing)
│   └── subcollection.tsx (updated to be simpler)
├── loading.tsx (updated)
└── page.tsx (updated)
```

## Success Metrics

### User Experience
- **Reduced perceived loading time**: Users see structure immediately
- **Improved engagement**: Less bounce rate during loading
- **Better accessibility**: Screen reader compatibility

### Technical Performance
- **Faster FCP**: First Contentful Paint with skeleton content
- **Independent loading**: Sections load as data becomes available
- **Error resilience**: Failed sections don't break entire page

### Development Benefits
- **Reusable skeletons**: Components can be used across similar pages
- **Easier debugging**: Section-level error isolation
- **Better maintainability**: Clear separation of loading states

## Future Enhancements

1. **Skeleton Animations**: Add wave or shimmer effects
2. **Smart Skeletons**: Adjust skeleton based on expected content size
3. **Preemptive Loading**: Start loading related data when hovering
4. **Analytics Integration**: Track loading performance metrics
5. **A/B Testing**: Compare skeleton vs. spinner performance

## Conclusion

This implementation plan provides a comprehensive approach to upgrading the subcollection page loading experience, following the successful pattern established by the collection page. By implementing skeleton loaders that mirror the actual page structure and utilizing React Suspense boundaries, users will experience faster perceived loading times and better overall user experience.

The phased approach allows for incremental implementation and testing, ensuring each component works correctly before moving to the next phase. The architecture improvements also maintain consistency with the collection page implementation while addressing the unique needs of the subcollection page structure.