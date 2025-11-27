# Code Review Scope Analysis

**Target**: The home page at app/(app)/(home)/page
**Entry Point**: `src/app/(app)/(home)/page.tsx`
**Route**: `/` (homepage)

## Call Graph Overview

```
HomePage (page.tsx)
├── generateMetadata() → generatePageMetadata('home')
├── serializeJsonLd(ORGANIZATION_SCHEMA)
├── serializeJsonLd(WEBSITE_SCHEMA)
│
├── <HeroSection />
│   ├── <AuthContent> (client) → useAuth() from Clerk
│   ├── <Suspense> → <PlatformStatsAsync />
│   │   └── PlatformStatsFacade.getPlatformStatsAsync()
│   │       └── CacheService.platform.stats()
│   │           └── Promise.all([
│   │               BobbleheadsQuery.getBobbleheadCountAsync(),
│   │               CollectionsQuery.getCollectionCountAsync(),
│   │               UsersQuery.getUserCountAsync()
│   │           ])
│   └── <Suspense> → <FeaturedBobbleheadAsync />
│       └── FeaturedContentFacade.getFeaturedBobbleheadAsync()
│           └── CacheService.featured.featuredBobblehead()
│               └── FeaturedContentQuery.getFeaturedBobbleheadAsync()
│
├── <FeaturedCollectionsSection />
│   └── <Suspense> → <FeaturedCollectionsAsync />
│       ├── getUserIdAsync() → UsersFacade.getUserByClerkIdAsync()
│       └── FeaturedContentFacade.getFeaturedCollectionsAsync(userId)
│           └── CacheService.featured.collections(userId)
│               └── FeaturedContentQuery.getFeaturedCollectionsAsync()
│
├── <TrendingBobbleheadsSection />
│   └── <Suspense> → <TrendingBobbleheadsAsync />
│       └── FeaturedContentFacade.getTrendingBobbleheadsAsync()
│           └── CacheService.featured.trendingBobbleheads()
│               └── FeaturedContentQuery.getTrendingBobbleheadsAsync()
│
└── <JoinCommunitySection />
    └── <AuthContent> (client) → useAuth() from Clerk
```

## Summary Statistics

| Category | Files | Methods/Components | Priority Breakdown |
|----------|-------|-------------------|-------------------|
| Server Components | 8 | 11 | 6 HIGH, 4 MEDIUM, 1 LOW |
| Client Components | 4 | 5 | 0 HIGH, 5 MEDIUM, 0 LOW |
| Facades | 2 | 4 | 3 HIGH, 1 MEDIUM, 0 LOW |
| Cache Service | 1 | 4 | 0 HIGH, 4 MEDIUM, 0 LOW |
| Queries | 4 | 6 | 3 HIGH, 3 MEDIUM, 0 LOW |
| Utilities | 2 | 3 | 0 HIGH, 1 MEDIUM, 2 LOW |
| **Total** | **21** | **33** | **9 HIGH, 14 MEDIUM, 3 LOW** |

## Review Assignments by Domain

### Server Components

#### `src/app/(app)/(home)/page.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `HomePage` | Page Component | Entry point | HIGH |
| `generateMetadata` | Metadata Function | SEO metadata | MEDIUM |

#### `src/app/(app)/(home)/components/sections/hero-section.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `HeroSection` | Server Component | Hero with stats/featured | HIGH |

#### `src/app/(app)/(home)/components/sections/featured-collections-section.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `FeaturedCollectionsSection` | Server Component | Featured collections wrapper | MEDIUM |

#### `src/app/(app)/(home)/components/sections/trending-bobbleheads-section.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `TrendingBobbleheadsSection` | Server Component | Trending wrapper | MEDIUM |

#### `src/app/(app)/(home)/components/sections/join-community-section.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `JoinCommunitySection` | Server Component | Community CTA | LOW |

#### `src/app/(app)/(home)/components/async/platform-stats-async.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `PlatformStatsAsync` | Async Server Component | Platform stats | HIGH |

#### `src/app/(app)/(home)/components/async/featured-bobblehead-async.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `FeaturedBobbleheadAsync` | Async Server Component | Hero bobblehead | HIGH |

#### `src/app/(app)/(home)/components/async/featured-collections-async.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `FeaturedCollectionsAsync` | Async Server Component | Featured collections | HIGH |

#### `src/app/(app)/(home)/components/async/trending-bobbleheads-async.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `TrendingBobbleheadsAsync` | Async Server Component | Trending bobbleheads | HIGH |

### Client Components

#### `src/components/ui/auth.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `AuthContent` | Client Component | Auth-aware switcher | MEDIUM |

#### `src/app/(app)/(home)/components/display/featured-collections-display.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `FeaturedCollectionsDisplay` | Client Component | Collection cards grid | MEDIUM |
| `FeaturedCollectionCard` | Client Component | Individual card | MEDIUM |

#### `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `TrendingBobbleheadsDisplay` | Client Component | Trending grid | MEDIUM |

#### `src/app/(app)/(home)/components/display/featured-bobblehead-display.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `FeaturedBobbleheadDisplay` | Client Component | Hero showcase | MEDIUM |

### Facades

#### `src/lib/facades/platform/platform-stats.facade.ts`
| Method | Purpose | Cache | Priority |
|--------|---------|-------|----------|
| `getPlatformStatsAsync(dbInstance?)` | Platform statistics | unstable_cache, Tags: platform-stats | HIGH |

#### `src/lib/facades/featured-content/featured-content.facade.ts`
| Method | Purpose | Cache | Priority |
|--------|---------|-------|----------|
| `getFeaturedBobbleheadAsync(dbInstance)` | Hero bobblehead | Redis, TTL: EXTENDED | HIGH |
| `getFeaturedCollectionsAsync(userId?, dbInstance)` | Featured collections | Redis, TTL: LONG, user-specific keys | HIGH |
| `getTrendingBobbleheadsAsync(dbInstance)` | Trending bobbleheads | Redis, TTL: LONG | HIGH |

**SKIP (not in call path)**: createAsync, deleteAsync, getActiveFeaturedContentAsync, getAllFeaturedContentForAdmin, getCollectionOfWeek, getEditorPicks, getFeaturedContentById, getFeaturedContentByIdForAdmin, getFooterFeaturedContentAsync, getHomepageBanner, getTrendingContent, incrementViewCount, toggleActiveAsync, updateAsync

### Queries

#### `src/lib/queries/featured-content/featured-content-query.ts`
| Method | Tables | Priority |
|--------|--------|----------|
| `getFeaturedBobbleheadAsync(context)` | featuredContent, bobbleheads, bobbleheadPhotos | HIGH |
| `getFeaturedCollectionsAsync(context, userId?)` | featuredContent, collections, users, likes | HIGH |
| `getTrendingBobbleheadsAsync(context)` | featuredContent, bobbleheads, bobbleheadPhotos | HIGH |

**SKIP**: All CRUD methods, admin queries, footer query

#### `src/lib/queries/bobbleheads/bobbleheads-query.ts`
| Method | Tables | Priority |
|--------|--------|----------|
| `getBobbleheadCountAsync(context)` | bobbleheads | MEDIUM |

**SKIP**: All other 29+ methods

#### `src/lib/queries/collections/collections.query.ts`
| Method | Tables | Priority |
|--------|--------|----------|
| `getCollectionCountAsync(context)` | collections | MEDIUM |

**SKIP**: All other 24+ methods

#### `src/lib/queries/users/users-query.ts`
| Method | Tables | Priority |
|--------|--------|----------|
| `getUserCountAsync(context)` | users | MEDIUM |

**SKIP**: All other 14+ methods

### Cache Service

#### `src/lib/services/cache.service.ts`
| Method | Called By | Key Pattern | Priority |
|--------|-----------|-------------|----------|
| `platform.stats()` | PlatformStatsFacade | CACHE_KEYS.PLATFORM.STATS() | MEDIUM |
| `featured.featuredBobblehead()` | FeaturedContentFacade | CACHE_KEYS.FEATURED.FEATURED_BOBBLEHEAD() | MEDIUM |
| `featured.collections(userId)` | FeaturedContentFacade | user-specific keys | MEDIUM |
| `featured.trendingBobbleheads()` | FeaturedContentFacade | CACHE_KEYS.FEATURED.TRENDING_BOBBLEHEADS() | MEDIUM |

**Note**: Only 4 of 50+ methods are in scope

### Utilities

#### `src/utils/auth-utils.ts`
| Function | Purpose | Priority |
|----------|---------|----------|
| `getUserIdAsync()` | Get current user ID with request deduplication | MEDIUM |

#### `src/lib/seo/metadata.utils.ts`
| Function | Purpose | Priority |
|----------|---------|----------|
| `generatePageMetadata(page, options)` | Generate SEO metadata | LOW |
| `serializeJsonLd(schema)` | Serialize structured data | LOW |
