# Bobblehead Page Loading Improvement Implementation Plan

## Executive Summary

This document outlines the implementation plan for upgrading the bobblehead detail page (`/bobbleheads/[bobbleheadId]`) loading experience to match the sophisticated pattern already implemented on collection and subcollection pages. The upgrade will replace the simple loading spinner with structured skeleton loading, implement independent section loading with Suspense boundaries, and optimize data fetching patterns.

## Current State Analysis

### Existing Implementation
- **Location**: `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/`
- **Loading State**: Simple spinner via `<Loading />` component
- **Data Fetching**: Monolithic server component fetches all data at once
- **Loading Pattern**: All-or-nothing - entire page loads together
- **User Experience**: Poor perceived performance, no progressive loading

### Current Component Structure
The `Bobblehead` component (`bobblehead.tsx`) renders these sections:
1. **Header Section** - Title, actions, metadata
2. **Metrics Section** - Usage stats (auth only)
3. **Feature Card Section** - Main details and primary photo
4. **Photo Gallery Section** - Additional photos (conditional)
5. **Primary Detail Cards** - Details, Specification, Acquisition (3-column grid)
6. **Secondary Detail Cards** - Status/Privacy, Timestamps, Custom Fields (3-column grid)

### Data Dependencies
- Primary data: `BobbleheadsFacade.getBobbleheadWithRelations()`
- Social data: `SocialFacade.getContentLikeData()`
- Auth checks: `checkIsOwner()`, `getOptionalUserId()`

## Target State (Collection Pattern)

### Proven Pattern Analysis
The collection/subcollection pages demonstrate the target architecture:

1. **Strategic Data Fetching**: Only fetch minimal data for existence check
2. **Suspense Boundaries**: Independent loading per section
3. **Async Components**: Server components with targeted data fetching
4. **Skeleton Components**: Structure-mirroring loading placeholders
5. **Error Boundaries**: Section-specific error handling
6. **Full Page Skeleton**: Complete loading.tsx that matches real layout

### Benefits of Target State
- **Perceived Performance**: Users see content progressively
- **Resilience**: One section failure doesn't block others
- **Flexibility**: Sections can be optimized independently
- **User Experience**: Clear loading states that match final layout
- **Maintainability**: Separation of concerns

## Implementation Plan

### Phase 1: File Structure Setup

#### 1.1 Create Skeleton Components Directory
Create: `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/skeletons/`

Required skeleton components:
- `bobblehead-header-skeleton.tsx`
- `bobblehead-metrics-skeleton.tsx`
- `bobblehead-feature-card-skeleton.tsx`
- `bobblehead-photo-gallery-skeleton.tsx`
- `bobblehead-detail-cards-skeleton.tsx` (for primary grid)
- `bobblehead-secondary-cards-skeleton.tsx` (for secondary grid)

#### 1.2 Create Async Components Directory
Create: `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/async/`

Required async components:
- `bobblehead-header-async.tsx`
- `bobblehead-metrics-async.tsx`
- `bobblehead-feature-card-async.tsx`
- `bobblehead-photo-gallery-async.tsx`
- `bobblehead-detail-cards-async.tsx`
- `bobblehead-secondary-cards-async.tsx`

#### 1.3 Create Error Boundary Component
Create: `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-error-boundary.tsx`

### Phase 2: Skeleton Components Implementation

#### 2.1 Header Skeleton (`bobblehead-header-skeleton.tsx`)
**Structure to mirror**: Current header with back button, title, actions, metadata
```typescript
export const BobbleheadHeaderSkeleton = () => (
  <Fragment>
    {/* Back button and action buttons */}
    <div className="mb-6 flex items-center justify-between">
      <Skeleton className="h-9 w-40" /> {/* Back button */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" /> {/* Like button */}
        <Skeleton className="h-9 w-16" /> {/* Edit */}
        <Skeleton className="h-9 w-16" /> {/* Delete */}
      </div>
    </div>

    {/* Title and metadata */}
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-80" /> {/* Title */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-32" /> {/* Collection info */}
        <Skeleton className="h-5 w-24" /> {/* Date */}
      </div>
    </div>
  </Fragment>
);
```

#### 2.2 Metrics Skeleton (`bobblehead-metrics-skeleton.tsx`)
**Structure to mirror**: Stats cards layout
```typescript
export const BobbleheadMetricsSkeleton = () => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="rounded-lg border p-4">
        <Skeleton className="h-6 w-16 mb-2" /> {/* Value */}
        <Skeleton className="h-4 w-20" /> {/* Label */}
      </div>
    ))}
  </div>
);
```

#### 2.3 Feature Card Skeleton (`bobblehead-feature-card-skeleton.tsx`)
**Structure to mirror**: Main feature card with photo and details
```typescript
export const BobbleheadFeatureCardSkeleton = () => (
  <div className="rounded-lg border">
    <div className="grid grid-cols-1 lg:grid-cols-2">
      {/* Photo side */}
      <div className="aspect-square">
        <Skeleton className="h-full w-full rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none" />
      </div>

      {/* Content side */}
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" /> {/* Title */}
        <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
        <Skeleton className="h-4 w-3/4" /> {/* Description line 2 */}

        {/* Key details */}
        <div className="space-y-3 pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
```

#### 2.4 Detail Cards Skeletons
**Primary Cards** (`bobblehead-detail-cards-skeleton.tsx`):
```typescript
export const BobbleheadDetailCardsSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="rounded-lg border p-6">
        <Skeleton className="h-6 w-32 mb-4" /> {/* Card title */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
```

**Secondary Cards** (`bobblehead-secondary-cards-skeleton.tsx`): Same structure as primary

#### 2.5 Photo Gallery Skeleton (`bobblehead-photo-gallery-skeleton.tsx`)
```typescript
export const BobbleheadPhotoGallerySkeleton = () => (
  <div className="rounded-lg border p-6">
    <Skeleton className="h-6 w-40 mb-4" /> {/* Gallery title */}
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  </div>
);
```

### Phase 3: Async Components Implementation

#### 3.1 Data Fetching Strategy
Each async component will fetch only the data it needs:

**Header Async**: Basic bobblehead info + like data
**Metrics Async**: Metrics data (if auth)
**Feature Card Async**: Bobblehead details + primary photo
**Photo Gallery Async**: Additional photos (conditional)
**Detail Cards Async**: Detailed bobblehead data
**Secondary Cards Async**: Timestamps + custom fields

#### 3.2 Header Async (`bobblehead-header-async.tsx`)
```typescript
export const BobbleheadHeaderAsync = async ({
  bobbleheadId,
  currentUserId
}: BobbleheadHeaderAsyncProps) => {
  const [bobblehead, likeData] = await Promise.all([
    BobbleheadsFacade.getBobbleheadBasicInfo(bobbleheadId, currentUserId || undefined),
    SocialFacade.getContentLikeData(bobbleheadId, 'bobblehead', currentUserId || undefined),
  ]);

  if (!bobblehead) {
    notFound();
  }

  const isOwner = await checkIsOwner(bobblehead.userId);

  return <BobbleheadHeader bobblehead={bobblehead} isOwner={isOwner} likeData={likeData} />;
};
```

#### 3.3 Feature Card Async (`bobblehead-feature-card-async.tsx`)
```typescript
export const BobbleheadFeatureCardAsync = async ({
  bobbleheadId,
  currentUserId
}: BobbleheadFeatureCardAsyncProps) => {
  const [bobblehead, likeData] = await Promise.all([
    BobbleheadsFacade.getBobbleheadWithDetails(bobbleheadId, currentUserId || undefined),
    SocialFacade.getContentLikeData(bobbleheadId, 'bobblehead', currentUserId || undefined),
  ]);

  if (!bobblehead) {
    notFound();
  }

  return <BobbleheadFeatureCard bobblehead={bobblehead} likeData={likeData} />;
};
```

#### 3.4 Other Async Components
Follow similar pattern - fetch specific data needed for each section.

### Phase 4: Error Boundary Implementation

#### 4.1 Bobblehead Error Boundary (`bobblehead-error-boundary.tsx`)
```typescript
interface BobbleheadErrorBoundaryProps {
  children: React.ReactNode;
  section: 'header' | 'metrics' | 'feature' | 'gallery' | 'details' | 'secondary';
}

export const BobbleheadErrorBoundary = ({ children, section }: BobbleheadErrorBoundaryProps) => {
  return (
    <ErrorBoundary
      fallback={<BobbleheadErrorFallback section={section} />}
      onError={(error) => {
        console.error(`Error in bobblehead ${section} section:`, error);
        // Optional: Send to error tracking service
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### Phase 5: Main Page Refactoring

#### 5.1 Update Loading.tsx (`loading.tsx`)
Replace simple spinner with comprehensive skeleton:
```typescript
export default function BobbleheadLoading() {
  return (
    <div>
      {/* Header Section */}
      <div className="border-b border-border">
        <ContentLayout>
          <BobbleheadHeaderSkeleton />
        </ContentLayout>
      </div>

      {/* Metrics Section */}
      <div className="mt-4">
        <ContentLayout>
          <BobbleheadMetricsSkeleton />
        </ContentLayout>
      </div>

      {/* Feature Card Section */}
      <div className="mt-4">
        <ContentLayout>
          <BobbleheadFeatureCardSkeleton />
        </ContentLayout>
      </div>

      {/* Photo Gallery Section */}
      <ContentLayout>
        <BobbleheadPhotoGallerySkeleton />
      </ContentLayout>

      {/* Detail Cards Sections */}
      <ContentLayout>
        <BobbleheadDetailCardsSkeleton />
      </ContentLayout>

      <ContentLayout>
        <BobbleheadSecondaryCardsSkeleton />
      </ContentLayout>
    </div>
  );
}
```

#### 5.2 Refactor Main Page (`page.tsx`)
Transform from monolithic to suspense-based:
```typescript
async function BobbleheadPage({ routeParams }: BobbleheadPageProps) {
  const { bobbleheadId } = await routeParams;
  const currentUserId = await getOptionalUserId();

  // Only fetch basic info to verify existence
  const basicBobblehead = await BobbleheadsFacade.getBobbleheadExists(
    bobbleheadId,
    currentUserId || undefined,
  );

  if (!basicBobblehead) {
    notFound();
  }

  return (
    <div>
      {/* Header Section */}
      <div className="border-b border-border">
        <ContentLayout>
          <BobbleheadErrorBoundary section="header">
            <Suspense fallback={<BobbleheadHeaderSkeleton />}>
              <BobbleheadHeaderAsync bobbleheadId={bobbleheadId} currentUserId={currentUserId} />
            </Suspense>
          </BobbleheadErrorBoundary>
        </ContentLayout>
      </div>

      {/* Metrics Section */}
      <AuthContent>
        <div className="mt-4">
          <ContentLayout>
            <BobbleheadErrorBoundary section="metrics">
              <Suspense fallback={<BobbleheadMetricsSkeleton />}>
                <BobbleheadMetricsAsync bobbleheadId={bobbleheadId} />
              </Suspense>
            </BobbleheadErrorBoundary>
          </ContentLayout>
        </div>
      </AuthContent>

      {/* Feature Card Section */}
      <div className="mt-4">
        <ContentLayout>
          <BobbleheadErrorBoundary section="feature">
            <Suspense fallback={<BobbleheadFeatureCardSkeleton />}>
              <BobbleheadFeatureCardAsync bobbleheadId={bobbleheadId} currentUserId={currentUserId} />
            </Suspense>
          </BobbleheadErrorBoundary>
        </ContentLayout>
      </div>

      {/* Photo Gallery Section */}
      <ContentLayout>
        <BobbleheadErrorBoundary section="gallery">
          <Suspense fallback={<BobbleheadPhotoGallerySkeleton />}>
            <BobbleheadPhotoGalleryAsync bobbleheadId={bobbleheadId} />
          </Suspense>
        </BobbleheadErrorBoundary>
      </ContentLayout>

      {/* Primary Detail Cards */}
      <ContentLayout>
        <BobbleheadErrorBoundary section="details">
          <Suspense fallback={<BobbleheadDetailCardsSkeleton />}>
            <BobbleheadDetailCardsAsync bobbleheadId={bobbleheadId} />
          </Suspense>
        </BobbleheadErrorBoundary>
      </ContentLayout>

      {/* Secondary Detail Cards */}
      <ContentLayout>
        <BobbleheadErrorBoundary section="secondary">
          <Suspense fallback={<BobbleheadSecondaryCardsSkeleton />}>
            <BobbleheadSecondaryCardsAsync bobbleheadId={bobbleheadId} />
          </Suspense>
        </BobbleheadErrorBoundary>
      </ContentLayout>
    </div>
  );
}
```

### Phase 6: Data Layer Optimization

#### 6.1 Facade Method Updates
Add new targeted data fetching methods to `BobbleheadsFacade`:

```typescript
// Basic existence check
getBobbleheadExists(bobbleheadId: string, userId?: string): Promise<BasicBobblehead | null>

// Header data
getBobbleheadBasicInfo(bobbleheadId: string, userId?: string): Promise<BobbleheadBasic | null>

// Feature card data
getBobbleheadWithDetails(bobbleheadId: string, userId?: string): Promise<BobbleheadWithDetails | null>

// Metrics data
getBobbleheadMetrics(bobbleheadId: string): Promise<BobbleheadMetrics | null>

// Photos only
getBobbleheadPhotos(bobbleheadId: string): Promise<BobbleheadPhoto[]>
```

#### 6.2 Query Optimization
Update database queries to fetch only required fields per use case.

### Phase 7: Component Refactoring

#### 7.1 Extract Individual Card Components
Break down existing large components:
- Extract `BobbleheadHeader` (if not already separated)
- Ensure all card components are independently usable
- Update prop interfaces for targeted data

#### 7.2 Update Existing Components
Modify existing bobblehead components to work with new async pattern:
- Update prop types to match new data shapes
- Ensure error states are handled properly
- Test with partial data loading

## Implementation Checklist

### Phase 1: Setup ✅
- [ ] Create `skeletons/` directory
- [ ] Create `async/` directory
- [ ] Create error boundary component

### Phase 2: Skeletons ✅
- [ ] `bobblehead-header-skeleton.tsx`
- [ ] `bobblehead-metrics-skeleton.tsx`
- [ ] `bobblehead-feature-card-skeleton.tsx`
- [ ] `bobblehead-photo-gallery-skeleton.tsx`
- [ ] `bobblehead-detail-cards-skeleton.tsx`
- [ ] `bobblehead-secondary-cards-skeleton.tsx`

### Phase 3: Async Components ✅
- [ ] `bobblehead-header-async.tsx`
- [ ] `bobblehead-metrics-async.tsx`
- [ ] `bobblehead-feature-card-async.tsx`
- [ ] `bobblehead-photo-gallery-async.tsx`
- [ ] `bobblehead-detail-cards-async.tsx`
- [ ] `bobblehead-secondary-cards-async.tsx`

### Phase 4: Error Handling ✅
- [ ] `bobblehead-error-boundary.tsx`
- [ ] Error fallback components
- [ ] Error reporting integration

### Phase 5: Main Components ✅
- [ ] Update `loading.tsx`
- [ ] Refactor `page.tsx`
- [ ] Test suspense boundaries

### Phase 6: Data Layer ✅
- [ ] Add facade methods
- [ ] Optimize database queries
- [ ] Test data fetching performance

### Phase 7: Integration ✅
- [ ] Update existing components
- [ ] End-to-end testing
- [ ] Performance verification

## Testing Strategy

### 7.1 Unit Testing
- Test each skeleton component renders correctly
- Test async components handle data properly
- Test error boundaries catch failures

### 7.2 Integration Testing
- Test suspense boundary coordination
- Test loading states transition properly
- Test error recovery scenarios

### 7.3 Performance Testing
- Measure perceived loading performance
- Verify progressive loading works
- Test with slow network conditions

### 7.4 Visual Testing
- Compare skeletons to final rendered state
- Ensure layout shifts are minimized
- Test responsive behavior

## Performance Considerations

### 8.1 Caching Strategy
- Cache basic bobblehead data
- Use proper cache tags for invalidation
- Consider static generation where appropriate

### 8.2 Bundle Size
- Ensure skeleton components are lightweight
- Monitor async component bundle sizes
- Use dynamic imports if needed

### 8.3 Database Optimization
- Optimize queries for each data slice
- Use database indexing appropriately
- Monitor query performance

## Risk Mitigation

### 9.1 Backward Compatibility
- Keep existing component interfaces stable
- Provide migration path for dependent code
- Test with existing features

### 9.2 Error Recovery
- Graceful degradation when sections fail
- Clear error messages for debugging
- Fallback to basic loading if needed

### 9.3 Performance Regression
- Monitor loading performance metrics
- A/B test against current implementation
- Rollback plan if performance degrades

## Success Metrics

### 10.1 User Experience
- Reduced perceived loading time
- Improved user engagement metrics
- Decreased bounce rate on bobblehead pages

### 10.2 Technical Metrics
- Faster time to first contentful paint
- Better lighthouse scores
- Reduced error rates

### 10.3 Developer Experience
- Easier maintenance of loading states
- Better separation of concerns
- Improved debugging capabilities

## Conclusion

This implementation plan transforms the bobblehead page loading experience from a simple spinner to a sophisticated, progressive loading system that matches the quality already established in the collection pages. The modular approach with Suspense boundaries, targeted data fetching, and comprehensive skeleton states will significantly improve both user experience and code maintainability.

The implementation should be done incrementally, with each phase thoroughly tested before proceeding to the next. This ensures minimal disruption to the existing functionality while delivering immediate improvements to the user experience.