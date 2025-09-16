# Featured Content Page Loading Improvement Implementation Plan

## Executive Summary

This document outlines the implementation plan for upgrading the featured content page (`/browse/featured`) loading experience by implementing skeleton loaders that mirror the page structure and utilizing React Suspense boundaries for independent section loading. This will follow the proven patterns already implemented on collection, subcollection, and bobblehead pages.

## Current State Analysis

### Existing Implementation

**Current Loading Component** (`src/app/(app)/browse/featured/loading.tsx`):
- Simple loading spinner via `<Loading />` component
- Generic loading experience with no visual structure indication
- Single loading state for entire page
- No progressive loading capabilities

**Current Page Architecture** (`src/app/(app)/browse/featured/page.tsx`):
- Static page structure with single server component
- `FeaturedContentServer` handles all data fetching in one component
- Monolithic data loading approach using `Promise.all()`
- All-or-nothing loading pattern

**Current Server Component** (`featured-content-server.tsx`):
- Four parallel API calls: `getHomepageBanner()`, `getEditorPicks()`, `getCollectionOfWeek()`, `getTrendingContent()`
- Additional batch like data fetching for authenticated users
- Single error boundary for all operations
- All data must load before any UI renders

### Page Structure Analysis

Based on `FeaturedContentDisplay` component analysis, the page consists of:

1. **Page Header** (Static):
   - Page title: "Featured Content"
   - Subtitle description
   - No data dependencies - can render immediately

2. **Hero Banner Section** ("Featured This Week"):
   - Grid layout: lg:grid-cols-3
   - Homepage banner items (hero cards spanning 2 cols)
   - Collection of the week items (1 col)
   - Conditional rendering based on data availability

3. **Tabbed Content Section**:
   - Tab navigation: All Featured, Collections, Bobbleheads, Collectors
   - Filter-based content display from combined data
   - Grid layout: md:grid-cols-2 lg:grid-cols-3
   - Dynamic content filtering by `contentType`

4. **Call to Action Section** (Static):
   - Authentication-dependent content
   - No data dependencies - can render immediately

### Data Dependencies

- **Homepage Banner**: `FeaturedContentFacade.getHomepageBanner()`
- **Editor Picks**: `FeaturedContentFacade.getEditorPicks()`
- **Collection of Week**: `FeaturedContentFacade.getCollectionOfWeek()`
- **Trending Content**: `FeaturedContentFacade.getTrendingContent()`
- **Like Data**: `SocialFacade.getBatchContentLikeData()` (authenticated users only)
- **User Authentication**: `getOptionalUserId()`

## Target State (Following Proven Pattern)

### Architecture Improvements

```
Featured Content Page
├── Static Header (immediate render)
├── Suspense: Hero Banner Section
│   ├── FeaturedHeroSkeleton
│   └── FeaturedHeroAsync (homepage_banner + collection_of_week)
├── Suspense: Tabbed Content Section
│   ├── FeaturedTabbedContentSkeleton
│   └── FeaturedTabbedContentAsync (editor_picks + trending + filtering)
└── Static Call to Action (immediate render)
```

### Benefits of New Architecture

- **Perceived Performance**: Hero section loads first, followed by tabbed content
- **Progressive Loading**: Users see content structure immediately
- **Error Resilience**: Hero and tabbed sections can fail independently
- **Flexibility**: Sections can be optimized independently
- **User Experience**: Clear loading states that match final layout

## Component Implementation Plan

### 1. Skeleton Components to Create

#### `FeaturedHeroSkeleton.tsx`
```typescript
export const FeaturedHeroSkeleton = () => (
  <section>
    <div className="mb-6">
      <Skeleton className="h-8 w-48 mb-2" /> {/* "Featured This Week" title */}
      <Skeleton className="h-4 w-96" />      {/* Description */}
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Hero banner card (spans 2 columns) */}
      <FeaturedCardSkeleton isHero={true} />
      {/* Collection of week card */}
      <FeaturedCardSkeleton />
    </div>
  </section>
)
```

#### `FeaturedTabbedContentSkeleton.tsx`
```typescript
export const FeaturedTabbedContentSkeleton = () => (
  <section>
    <div className="mb-6 flex items-center justify-between">
      {/* Tab navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
    </div>

    {/* Content grid */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <FeaturedCardSkeleton key={i} />
      ))}
    </div>
  </section>
)
```

#### `FeaturedCardSkeleton.tsx`
```typescript
interface FeaturedCardSkeletonProps {
  isHero?: boolean;
}

export const FeaturedCardSkeleton = ({ isHero = false }: FeaturedCardSkeletonProps) => {
  const cardClasses = isHero ? 'col-span-full lg:col-span-2' : 'col-span-1';
  const imageHeight = isHero ? 'h-64 lg:h-80' : 'h-48';

  return (
    <div className={`rounded-lg border bg-card overflow-hidden ${cardClasses}`}>
      {/* Image area */}
      <div className="relative">
        <Skeleton className={`w-full ${imageHeight}`} />
        {/* Badges overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Skeleton className="h-6 w-20" /> {/* Content type badge */}
          {isHero && <Skeleton className="h-6 w-16" />} {/* Featured badge */}
        </div>
      </div>

      {/* Card header */}
      <div className="p-6 pb-3">
        <Skeleton className={`mb-3 ${isHero ? 'h-8 w-64' : 'h-6 w-48'}`} /> {/* Title */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" /> {/* "by Owner" */}
          <span className="text-muted-foreground">•</span>
          <Skeleton className="h-4 w-24" /> {/* Date */}
        </div>
      </div>

      {/* Card content */}
      <div className="px-6 pb-6">
        <Skeleton className={`mb-4 ${isHero ? 'h-5 w-full' : 'h-4 w-full'}`} /> {/* Description line 1 */}
        <Skeleton className={`mb-4 ${isHero ? 'h-5 w-3/4' : 'h-4 w-2/3'}`} />   {/* Description line 2 */}

        {/* Stats and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <Skeleton className="h-4 w-12" /> {/* Views */}
            <Skeleton className="h-4 w-8" />  {/* Comments */}
            <Skeleton className="h-4 w-8" />  {/* Likes */}
          </div>
          <Skeleton className="h-9 w-24" />   {/* View button */}
        </div>
      </div>
    </div>
  );
};
```

#### `FeaturedPageSkeleton.tsx` (Full page skeleton)
```typescript
export const FeaturedPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    {/* Static Header - renders immediately */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">Featured Content</h1>
      <p className="mt-2 text-muted-foreground">
        Discover the best collections, bobbleheads, and collectors from our community
      </p>
    </div>

    <div className="space-y-8">
      {/* Hero Banner Skeleton */}
      <FeaturedHeroSkeleton />

      {/* Tabbed Content Skeleton */}
      <FeaturedTabbedContentSkeleton />

      {/* Static Call to Action - renders immediately */}
      <section className="rounded-lg bg-muted/30 p-8 text-center">
        <h3 className="mb-2 text-xl font-semibold">Want to be featured?</h3>
        <p className="mb-4 text-muted-foreground">
          Share your amazing collections and connect with other collectors to get noticed by our community
        </p>
        <div className="flex justify-center gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </section>
    </div>
  </div>
)
```

### 2. Async Components Architecture

#### `FeaturedHeroAsync.tsx`
```typescript
export interface FeaturedHeroAsyncProps {
  isTrackViews?: boolean;
  currentUserId: string | null;
}

export async function FeaturedHeroAsync({
  isTrackViews = false,
  currentUserId
}: FeaturedHeroAsyncProps) {
  try {
    // Fetch hero section data in parallel
    const [homepageBanner, collectionOfWeek] = await Promise.all([
      FeaturedContentFacade.getHomepageBanner(),
      FeaturedContentFacade.getCollectionOfWeek(),
    ]);

    // Collect like data targets for hero content
    const heroContent = [...homepageBanner, ...collectionOfWeek];
    const likeDataMap = new Map();

    if (currentUserId && heroContent.length > 0) {
      const likeDataTargets = heroContent
        .filter((content) => ['bobblehead', 'collection', 'subcollection'].includes(content.contentType))
        .map((content) => ({
          targetId: content.contentId,
          targetType: content.contentType as 'bobblehead' | 'collection' | 'subcollection',
        }));

      if (likeDataTargets.length > 0) {
        try {
          const likeDataResults = await SocialFacade.getBatchContentLikeData(likeDataTargets, currentUserId);
          likeDataResults.forEach((likeData) => {
            const key = `${likeData.targetType}:${likeData.targetId}`;
            likeDataMap.set(key, {
              isLiked: likeData.isLiked,
              likeCount: likeData.likeCount,
              likeId: likeData.likeId,
            });
          });
        } catch (error) {
          console.warn('FeaturedHeroAsync: Failed to fetch like data:', error);
        }
      }
    }

    const transformedData = {
      homepage_banner: homepageBanner.map(content => transformContentWithLikeData(content, likeDataMap)),
      collection_of_week: collectionOfWeek.map(content => transformContentWithLikeData(content, likeDataMap)),
    };

    return (
      <FeaturedHeroDisplay
        heroData={transformedData}
        onViewContent={isTrackViews ? incrementViewCountAction : undefined}
      />
    );
  } catch (error) {
    console.error('Failed to fetch hero content:', error);
    return (
      <FeaturedHeroDisplay
        heroData={{ homepage_banner: [], collection_of_week: [] }}
      />
    );
  }
}
```

#### `FeaturedTabbedContentAsync.tsx`
```typescript
export interface FeaturedTabbedContentAsyncProps {
  isTrackViews?: boolean;
  currentUserId: string | null;
}

export async function FeaturedTabbedContentAsync({
  isTrackViews = false,
  currentUserId
}: FeaturedTabbedContentAsyncProps) {
  try {
    // Fetch tabbed content data in parallel
    const [editorPicks, trending] = await Promise.all([
      FeaturedContentFacade.getEditorPicks(),
      FeaturedContentFacade.getTrendingContent(),
    ]);

    // Handle like data for tabbed content
    const tabbedContent = [...editorPicks, ...trending];
    const likeDataMap = new Map();

    if (currentUserId && tabbedContent.length > 0) {
      const likeDataTargets = tabbedContent
        .filter((content) => ['bobblehead', 'collection', 'subcollection'].includes(content.contentType))
        .map((content) => ({
          targetId: content.contentId,
          targetType: content.contentType as 'bobblehead' | 'collection' | 'subcollection',
        }));

      if (likeDataTargets.length > 0) {
        try {
          const likeDataResults = await SocialFacade.getBatchContentLikeData(likeDataTargets, currentUserId);
          likeDataResults.forEach((likeData) => {
            const key = `${likeData.targetType}:${likeData.targetId}`;
            likeDataMap.set(key, {
              isLiked: likeData.isLiked,
              likeCount: likeData.likeCount,
              likeId: likeData.likeId,
            });
          });
        } catch (error) {
          console.warn('FeaturedTabbedContentAsync: Failed to fetch like data:', error);
        }
      }
    }

    const transformedData = {
      editor_pick: editorPicks.map(content => transformContentWithLikeData(content, likeDataMap)),
      trending: trending.map(content => transformContentWithLikeData(content, likeDataMap)),
    };

    return (
      <FeaturedTabbedContentDisplay
        tabbedData={transformedData}
        onViewContent={isTrackViews ? incrementViewCountAction : undefined}
      />
    );
  } catch (error) {
    console.error('Failed to fetch tabbed content:', error);
    return (
      <FeaturedTabbedContentDisplay
        tabbedData={{ editor_pick: [], trending: [] }}
      />
    );
  }
}
```

### 3. Display Components (Split from current FeaturedContentDisplay)

#### `FeaturedHeroDisplay.tsx`
```typescript
export interface FeaturedHeroDisplayProps {
  heroData: {
    homepage_banner: Array<FeaturedContentItem>;
    collection_of_week: Array<FeaturedContentItem>;
  };
  onViewContent?: (contentId: string) => Promise<void>;
}

export const FeaturedHeroDisplay = ({ heroData, onViewContent }: FeaturedHeroDisplayProps) => {
  // Implementation focuses only on hero banner section
  // Renders the "Featured This Week" section with homepage_banner and collection_of_week
};
```

#### `FeaturedTabbedContentDisplay.tsx`
```typescript
export interface FeaturedTabbedContentDisplayProps {
  tabbedData: {
    editor_pick: Array<FeaturedContentItem>;
    trending: Array<FeaturedContentItem>;
  };
  onViewContent?: (contentId: string) => Promise<void>;
}

export const FeaturedTabbedContentDisplay = ({ tabbedData, onViewContent }: FeaturedTabbedContentDisplayProps) => {
  // Implementation focuses only on tabbed content section
  // Handles filtering and tab state management
  // Combines editor_pick and trending for "All Featured" tab
};
```

### 4. Error Boundary Implementation

#### `FeaturedContentErrorBoundary.tsx`
```typescript
interface FeaturedContentErrorBoundaryProps {
  children: React.ReactNode;
  section: 'hero' | 'tabbed';
}

export const FeaturedContentErrorBoundary = ({
  children,
  section
}: FeaturedContentErrorBoundaryProps) => {
  const fallback = (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
      <h3 className="mb-2 font-semibold text-destructive">
        Failed to load {section === 'hero' ? 'featured content' : 'content sections'}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        There was a problem loading this section. Please try refreshing the page.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </Button>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};
```

### 5. Updated Page Structure

#### Updated `page.tsx`
```typescript
export default function FeaturedPage() {
  const currentUserId = await getOptionalUserId();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Static Header - renders immediately */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Featured Content</h1>
        <p className="mt-2 text-muted-foreground">
          Discover the best collections, bobbleheads, and collectors from our community
        </p>
      </div>

      <div className="space-y-8">
        {/* Hero Banner Section with Suspense */}
        <FeaturedContentErrorBoundary section="hero">
          <Suspense fallback={<FeaturedHeroSkeleton />}>
            <FeaturedHeroAsync
              isTrackViews={true}
              currentUserId={currentUserId}
            />
          </Suspense>
        </FeaturedContentErrorBoundary>

        {/* Tabbed Content Section with Suspense */}
        <FeaturedContentErrorBoundary section="tabbed">
          <Suspense fallback={<FeaturedTabbedContentSkeleton />}>
            <FeaturedTabbedContentAsync
              isTrackViews={true}
              currentUserId={currentUserId}
            />
          </Suspense>
        </FeaturedContentErrorBoundary>

        {/* Static Call to Action - renders immediately */}
        <section className="rounded-lg bg-muted/30 p-8 text-center">
          <h3 className="mb-2 text-xl font-semibold">Want to be featured?</h3>
          <p className="mb-4 text-muted-foreground">
            Share your amazing collections and connect with other collectors to get noticed by our community
          </p>
          <div className="flex justify-center gap-3">
            <AuthContent
              fallback={
                <div className="space-x-2">
                  <Button asChild>
                    <SignInButton mode="modal">Sign In</SignInButton>
                  </Button>
                  <Button asChild>
                    <SignUpButton mode="modal">Sign Up</SignUpButton>
                  </Button>
                </div>
              }
            >
              <Button asChild>
                <Link href={$path({ route: '/dashboard/collection' })}>Create Collection</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={$path({ route: '/bobbleheads/add' })}>Add Bobblehead</Link>
              </Button>
            </AuthContent>
          </div>
        </section>
      </div>
    </div>
  );
}
```

#### Updated `loading.tsx`
```typescript
import { FeaturedPageSkeleton } from './components/skeletons/featured-page-skeleton';

export default function BrowseFeaturedLoading() {
  return <FeaturedPageSkeleton />;
}
```

## Implementation Steps

### Phase 1: Skeleton Components (2-3 hours)
1. **Create skeleton components**:
   - `FeaturedCardSkeleton` (reusable for all card types)
   - `FeaturedHeroSkeleton` (hero banner section)
   - `FeaturedTabbedContentSkeleton` (tabbed section)
   - `FeaturedPageSkeleton` (full page layout)
2. **Update loading.tsx** to use new skeleton layout
3. **Test skeleton visual accuracy** against real components
4. **Run lint:fix & typecheck** to ensure no errors

### Phase 2: Component Splitting (3-4 hours)
1. **Split display components**:
   - Extract `FeaturedHeroDisplay` from `FeaturedContentDisplay`
   - Extract `FeaturedTabbedContentDisplay` from `FeaturedContentDisplay`
   - Maintain existing functionality and styling
2. **Create async components**:
   - `FeaturedHeroAsync` with targeted data fetching
   - `FeaturedTabbedContentAsync` with targeted data fetching
3. **Implement error boundaries**:
   - `FeaturedContentErrorBoundary` with section-specific handling
4. **Run lint:fix & typecheck** to ensure no errors

### Phase 3: Page Integration (2-3 hours)
1. **Update page.tsx** with Suspense boundaries
2. **Add proper error handling** for each section
3. **Implement helper functions**:
   - `transformContentWithLikeData` (shared utility)
   - `incrementViewCountAction` (moved to utils)
4. **Test progressive loading** behavior
5. **Run lint:fix & typecheck** to ensure no errors

### Phase 4: Testing & Optimization (1-2 hours)
1. **Visual regression testing** - ensure skeletons match real content
2. **Performance testing** - verify streaming benefits
3. **Error scenario testing** - verify section resilience
4. **Mobile responsiveness** - ensure skeleton grid matches real layout
5. **Run lint:fix & typecheck** to ensure no errors

## Technical Considerations

### Performance Benefits
- **Perceived Performance**: Users see content structure immediately
- **Progressive Loading**: Hero loads first, then tabbed content
- **Faster FCP**: First Contentful Paint with skeleton and static content
- **Independent Loading**: Sections load as their data becomes available

### Data Optimization
- **Parallel Fetching**: Hero and tabbed content load simultaneously
- **Reduced Waterfalls**: Eliminated sequential data dependencies
- **Like Data Batching**: Maintained efficient batch like data fetching
- **Error Isolation**: Failed sections don't impact others

### Accessibility Improvements
- **Screen Reader Support**: Skeletons have proper ARIA labels
- **Loading Announcements**: Section-specific loading states
- **Focus Management**: Logical tab order during transitions
- **Content Structure**: Clear semantic structure during loading

### Mobile Considerations
- **Responsive Skeletons**: Match responsive grid layouts
- **Touch Performance**: Optimized animations for mobile
- **Progressive Enhancement**: Core content loads first

## File Structure

```
src/app/(app)/browse/featured/
├── components/
│   ├── skeletons/
│   │   ├── featured-card-skeleton.tsx
│   │   ├── featured-hero-skeleton.tsx
│   │   ├── featured-tabbed-content-skeleton.tsx
│   │   └── featured-page-skeleton.tsx
│   ├── async/
│   │   ├── featured-hero-async.tsx
│   │   └── featured-tabbed-content-async.tsx
│   ├── display/
│   │   ├── featured-hero-display.tsx
│   │   └── featured-tabbed-content-display.tsx
│   ├── featured-content-error-boundary.tsx
│   ├── featured-content-display.tsx (legacy - can be removed after migration)
│   └── featured-content-server.tsx (legacy - can be removed after migration)
├── utils/
│   ├── featured-content-transforms.ts
│   └── featured-content-actions.ts
├── loading.tsx (updated)
└── page.tsx (updated)
```

## Migration Strategy

### Gradual Migration Approach
1. **Phase 1**: Implement skeletons alongside existing components
2. **Phase 2**: Create new async components with same data patterns
3. **Phase 3**: Update page.tsx to use new Suspense pattern
4. **Phase 4**: Remove legacy components after verification

### Backward Compatibility
- Maintain existing `FeaturedContentDisplay` interface during transition
- Ensure identical data transformation logic
- Preserve all existing functionality and styling
- Test thoroughly before removing legacy components

## Success Metrics

### User Experience
- **Reduced perceived loading time**: Users see structure immediately
- **Improved engagement**: Less bounce rate during loading
- **Better accessibility**: Screen reader compatibility
- **Progressive content reveal**: Content appears as it loads

### Technical Performance
- **Faster FCP**: First Contentful Paint with skeleton content
- **Independent loading**: Sections load as data becomes available
- **Error resilience**: Failed sections don't break entire page
- **Maintained functionality**: All existing features preserved

### Development Benefits
- **Reusable components**: Skeletons can be used in similar contexts
- **Easier debugging**: Section-level error isolation
- **Better maintainability**: Clear separation of loading states
- **Future flexibility**: Architecture supports easy enhancements

## Future Enhancements

1. **Smart Skeletons**: Adjust skeleton based on expected content counts
2. **Skeleton Animations**: Add wave or shimmer effects
3. **Predictive Loading**: Start loading content based on user behavior
4. **Analytics Integration**: Track loading performance metrics
5. **A/B Testing**: Compare skeleton vs. spinner performance
6. **Content Prioritization**: Load most engaging content first

## Conclusion

This implementation plan provides a comprehensive approach to upgrading the featured content page loading experience. By implementing skeleton loaders that mirror the actual page structure and utilizing React Suspense boundaries, users will experience faster perceived loading times and better overall user experience.

The approach follows the proven patterns already established in the collection, subcollection, and bobblehead pages, ensuring consistency across the application. The phased implementation allows for careful testing and validation at each step, minimizing risk while maximizing the benefits of the new architecture.

The separation of concerns between hero and tabbed content allows for independent optimization and future enhancements, while maintaining all existing functionality and user interactions.