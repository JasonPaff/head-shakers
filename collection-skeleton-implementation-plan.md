# Collection Page Skeleton Loader Implementation Plan

## Executive Summary

This document outlines a comprehensive plan to enhance the loading experience for collection pages (`/collections/[collectionId]`) by implementing skeleton loaders that mirror the actual page structure and utilizing React Suspense boundaries for independent section loading.

## Current State Analysis

### Existing Loading Implementation

**Current Loading Component** (`src/app/(app)/collections/[collectionId]/(collection)/loading.tsx`):
- Simple full-page spinner with animated dots
- Generic "Please wait..." message
- No visual indication of page structure
- Single loading state for entire page

**Current Page Architecture** (`src/app/(app)/collections/[collectionId]/(collection)/page.tsx`):
- Monolithic data fetching in single async component
- All data loaded before any UI renders
- No streaming or progressive loading
- Three main API calls: collection data, like data, bobbleheads data

### Page Structure Analysis

Based on browser inspection, the loaded collection page consists of:

1. **Header Section** (`CollectionHeader`):
   - Collection title, description
   - Like button with count
   - Creation date and bobblehead count

2. **Main Content Area** (`CollectionBobbleheads`):
   - Section title and add button
   - Filter controls (view toggles, search, sort)
   - Bobblehead grid (3-column on desktop)

3. **Sidebar** (2 components):
   - **Collection Stats**: Total count, subcollections, last updated
   - **Subcollections List**: Card-based list with thumbnails

## Architecture Improvements

### 1. Suspense Boundary Strategy

```
Collection Page
├── Suspense: Header Section
│   ├── CollectionHeaderSkeleton
│   └── CollectionHeader (server component)
├── Main Content Grid
│   ├── Suspense: Bobbleheads Section
│   │   ├── CollectionBobbleheadsSkeleton
│   │   └── CollectionBobbleheads (server component)
│   └── Sidebar
│       ├── Suspense: Stats Section
│       │   ├── CollectionStatsSkeleton
│       │   └── CollectionStats (server component)
│       └── Suspense: Subcollections Section
│           ├── SubcollectionsSkeleton
│           └── CollectionSidebarSubcollections (server component)
```

### 2. Data Fetching Optimization

**Current Approach:**
```typescript
// All data fetched in page.tsx before rendering
const collection = await CollectionsFacade.getCollectionForPublicView(...)
const likeResult = await SocialFacade.getContentLikeData(...)
// Bobbleheads fetched in CollectionBobbleheads component
```

**Improved Approach:**
```typescript
// Split data fetching across components for streaming
- Basic collection info: Immediate (for header)
- Like data: Independent Suspense boundary
- Bobbleheads: Independent Suspense boundary
- Stats: Independent Suspense boundary
- Subcollections: Independent Suspense boundary
```

## Component Implementation Plan

### 1. Skeleton Components to Create

#### `CollectionHeaderSkeleton.tsx`
```typescript
export const CollectionHeaderSkeleton = () => (
  <div className="mt-3 border-b border-border">
    <ContentLayout>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Skeleton className="h-8 w-64 mb-2" /> {/* Title */}
          <Skeleton className="h-4 w-96 mb-4" /> {/* Description */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20" /> {/* Like button */}
            <Skeleton className="h-4 w-32" /> {/* Date */}
          </div>
        </div>
        <Skeleton className="h-10 w-20" /> {/* Share button */}
      </div>
    </ContentLayout>
  </div>
)
```

#### `CollectionBobbleheadsSkeleton.tsx`
```typescript
export const CollectionBobbleheadsSkeleton = () => (
  <div>
    <div className="mb-4 flex items-center justify-between">
      <Skeleton className="h-8 w-80" /> {/* Section title */}
      <Skeleton className="h-10 w-32" /> {/* Add button */}
    </div>

    {/* Filter controls */}
    <div className="mb-4 flex justify-between">
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-64" /> {/* Search */}
        <Skeleton className="h-10 w-48" /> {/* Sort */}
      </div>
    </div>

    {/* Bobblehead grid */}
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <BobbleheadCardSkeleton key={i} />
      ))}
    </div>
  </div>
)
```

#### `BobbleheadCardSkeleton.tsx`
```typescript
export const BobbleheadCardSkeleton = () => (
  <div className="rounded-lg border bg-card p-4">
    <Skeleton className="aspect-square w-full mb-3 rounded" /> {/* Image */}
    <Skeleton className="h-6 w-full mb-2" /> {/* Title */}
    <Skeleton className="h-4 w-3/4 mb-3" /> {/* Description */}
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Skeleton className="h-8 w-12" /> {/* Like */}
        <Skeleton className="h-8 w-8" />  {/* Share */}
        <Skeleton className="h-8 w-8" />  {/* More */}
      </div>
      <Skeleton className="h-8 w-20" /> {/* View Details */}
    </div>
  </div>
)
```

#### `CollectionStatsSkeleton.tsx`
```typescript
export const CollectionStatsSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" /> {/* "Collection Stats" */}
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" /> {/* Icon */}
            <Skeleton className="h-4 w-24" />        {/* Label */}
            <Skeleton className="h-4 w-8 ml-auto" /> {/* Value */}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)
```

#### `SubcollectionsSkeleton.tsx`
```typescript
export const SubcollectionsSkeleton = () => (
  <Card>
    <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
      <Skeleton className="h-6 w-28" /> {/* "Subcollections" */}
      <Skeleton className="h-8 w-8 rounded" /> {/* Add button */}
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded border">
            <Skeleton className="h-12 w-12 rounded" /> {/* Thumbnail */}
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" /> {/* Name */}
              <Skeleton className="h-3 w-16" />       {/* Count */}
            </div>
            <Skeleton className="h-4 w-4" /> {/* Arrow */}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)
```

### 2. Base Skeleton Component

Create reusable `Skeleton` component if not exists:

```typescript
// src/components/ui/skeleton.tsx
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}
```

### 3. Component Architecture Refactoring

#### Updated `page.tsx` Structure

```typescript
// src/app/(app)/collections/[collectionId]/(collection)/page.tsx
export default async function CollectionPage({ routeParams, searchParams }: CollectionPageProps) {
  const { collectionId } = await routeParams;
  const resolvedSearchParams = await searchParams;
  const currentUserId = await getOptionalUserId();

  // Only fetch basic collection info for initial render
  const collection = await CollectionsFacade.getBasicCollectionInfo(
    collectionId,
    currentUserId || undefined,
  );

  if (!collection) {
    notFound();
  }

  return (
    <div>
      {/* Header Section with Suspense */}
      <Suspense fallback={<CollectionHeaderSkeleton />}>
        <CollectionHeaderAsync
          collectionId={collectionId}
          currentUserId={currentUserId}
        />
      </Suspense>

      {/* Main Content */}
      <div className="mt-4">
        <ContentLayout>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Main Content Area */}
            <div className="lg:col-span-9">
              <Suspense fallback={<CollectionBobbleheadsSkeleton />}>
                <CollectionBobbleheadsAsync
                  collectionId={collectionId}
                  searchParams={resolvedSearchParams}
                  currentUserId={currentUserId}
                />
              </Suspense>
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-6 lg:col-span-3">
              <Suspense fallback={<CollectionStatsSkeleton />}>
                <CollectionStatsAsync
                  collectionId={collectionId}
                  currentUserId={currentUserId}
                />
              </Suspense>

              <Suspense fallback={<SubcollectionsSkeleton />}>
                <CollectionSidebarSubcollectionsAsync
                  collectionId={collectionId}
                  currentUserId={currentUserId}
                />
              </Suspense>
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
// CollectionHeaderAsync.tsx
export const CollectionHeaderAsync = async ({
  collectionId,
  currentUserId
}: {
  collectionId: string;
  currentUserId: string | null;
}) => {
  const [collection, likeData] = await Promise.all([
    CollectionsFacade.getCollectionForPublicView(collectionId, currentUserId),
    SocialFacade.getContentLikeData(collectionId, 'collection', currentUserId)
  ]);

  if (!collection) notFound();

  return <CollectionHeader collection={collection} likeData={likeData} />;
};
```

### 4. Updated Loading Page

Replace simple spinner with comprehensive skeleton:

```typescript
// src/app/(app)/collections/[collectionId]/(collection)/loading.tsx
import { CollectionHeaderSkeleton } from './components/skeletons/collection-header-skeleton';
import { CollectionBobbleheadsSkeleton } from './components/skeletons/collection-bobbleheads-skeleton';
import { CollectionStatsSkeleton } from './components/skeletons/collection-stats-skeleton';
import { SubcollectionsSkeleton } from './components/skeletons/subcollections-skeleton';
import { ContentLayout } from '@/components/layout/content-layout';

export default function CollectionLoading() {
  return (
    <div>
      {/* Header Skeleton */}
      <CollectionHeaderSkeleton />

      {/* Main Content Skeleton */}
      <div className="mt-4">
        <ContentLayout>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Main Content Area */}
            <div className="lg:col-span-9">
              <CollectionBobbleheadsSkeleton />
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-6 lg:col-span-3">
              <CollectionStatsSkeleton />
              <SubcollectionsSkeleton />
            </aside>
          </div>
        </ContentLayout>
      </div>
    </div>
  );
}
```

## Implementation Steps

### Phase 1: Skeleton Components (2-3 hours)
1. **Create base Skeleton component** if not existing
2. **Implement skeleton components**:
   - `CollectionHeaderSkeleton`
   - `CollectionBobbleheadsSkeleton`
   - `BobbleheadCardSkeleton`
   - `CollectionStatsSkeleton`
   - `SubcollectionsSkeleton`
3. **Update loading.tsx** to use new skeleton layout
4. **Run lint:fix & typecheck ** to ensure no errors
5. **Test skeleton visual accuracy** against real components

### Phase 2: Component Refactoring (3-4 hours)
1. **Extract async components**:
   - `CollectionHeaderAsync`
   - `CollectionBobbleheadsAsync`
   - `CollectionStatsAsync`
   - `CollectionSidebarSubcollectionsAsync`
2. **Optimize data fetching**:
   - Split facade methods for independent loading
   - Add error boundaries for each section
3. **Run lint:fix & typecheck ** to ensure no errors
4. **Update page.tsx** with Suspense boundaries

### Phase 3: Data Layer Optimization (2-3 hours)
1. **Create optimized facade methods**:
   - `getBasicCollectionInfo()` - minimal data for initial render
   - `getCollectionHeaderData()` - header + like data
   - `getCollectionStatsData()` - stats-specific data
2. **Implement streaming-friendly queries**
3. **Run lint:fix & typecheck ** to ensure no errors
4. **Add proper error handling** for each data section

### Phase 4: Testing & Refinement (1-2 hours)
1. **Visual regression testing** - ensure skeletons match real content
2. **Performance testing** - verify streaming benefits
3. **Accessibility testing** - skeleton announcements
4. **Run lint:fix & typecheck ** to ensure no errors
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
src/app/(app)/collections/[collectionId]/(collection)/
├── components/
│   ├── skeletons/
│   │   ├── collection-header-skeleton.tsx
│   │   ├── collection-bobbleheads-skeleton.tsx
│   │   ├── bobblehead-card-skeleton.tsx
│   │   ├── collection-stats-skeleton.tsx
│   │   └── subcollections-skeleton.tsx
│   ├── async/
│   │   ├── collection-header-async.tsx
│   │   ├── collection-bobbleheads-async.tsx
│   │   ├── collection-stats-async.tsx
│   │   └── collection-sidebar-subcollections-async.tsx
│   ├── collection-header.tsx (existing)
│   ├── collection-bobbleheads.tsx (existing)
│   ├── collection-stats.tsx (existing)
│   └── collection-sidebar-subcollections.tsx (existing)
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
3. **Preemptive Loading**: Start loading subcollections when hovering
4. **Analytics Integration**: Track loading performance metrics
5. **A/B Testing**: Compare skeleton vs. spinner performance

## Conclusion

This implementation plan provides a comprehensive approach to upgrading the collection page loading experience. By implementing skeleton loaders that mirror the actual page structure and utilizing React Suspense boundaries, users will experience faster perceived loading times and better overall user experience.

The phased approach allows for incremental implementation and testing, ensuring each component works correctly before moving to the next phase. The architecture improvements also set the foundation for similar enhancements across other pages in the application.