# Step 3: Coverage Gap Analysis

## Step Metadata
- **Status**: Completed
- **Started**: 2025-11-27T00:03:00Z
- **Completed**: 2025-11-27T00:05:00Z
- **Duration**: ~120 seconds

## Input Files Analyzed

**Source Files**: 41 files across critical, high, and medium priority
**Existing Tests**: 6 files (2 E2E, 4 component)
**Scope Filter**: all (Unit, Component, Integration, E2E)

## Coverage Matrix

| Source File | Unit | Component | Integration | E2E | Status |
|-------------|------|-----------|-------------|-----|--------|
| `page.tsx` | ❌ | ❌ | ❌ | ✅ | Partial |
| `hero-section.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `featured-collections-section.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `trending-bobbleheads-section.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `join-community-section.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `platform-stats-async.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `featured-bobblehead-async.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `featured-collections-async.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `trending-bobbleheads-async.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `platform-stats-display.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `featured-bobblehead-display.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `featured-collections-display.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `trending-bobbleheads-display.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `platform-stats-skeleton.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `featured-bobblehead-skeleton.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `featured-collections-skeleton.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `trending-bobbleheads-skeleton.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `platform-stats.facade.ts` | ❌ | N/A | ❌ | ❌ | Missing |
| `featured-content.facade.ts` | ❌ | N/A | ❌ | ❌ | Missing |
| `featured-content-query.ts` | ❌ | N/A | ❌ | ❌ | Missing |
| `featured-content-transformer.ts` | ❌ | N/A | ❌ | ❌ | Missing |
| `auth.tsx` | ❌ | ❌ | ❌ | ❌ | Missing |
| `cloudinary.utils.ts` | ❌ | N/A | ❌ | ❌ | Missing |
| `cache.service.ts` | ❌ | N/A | ❌ | ❌ | Missing |

## Gaps by Priority

### Critical Priority (34 tests)

| File | Functionality Missing | Tests Needed |
|------|----------------------|--------------|
| `platform-stats.facade.ts` | getPlatformStatsAsync, cache, error handling | 8 |
| `featured-content.facade.ts` | getFeaturedBobblehead, getCollections, getTrending | 11 |
| `featured-content-query.ts` | All query methods, like status calculation | 8 |
| `page.tsx` | generateMetadata, JSON-LD, page composition | 7 |

### High Priority (56 tests)

| File | Functionality Missing | Tests Needed |
|------|----------------------|--------------|
| `hero-section.tsx` | Render, auth states, error boundaries | 8 |
| `featured-collections-section.tsx` | Render, Suspense, navigation | 5 |
| `trending-bobbleheads-section.tsx` | Render, Suspense, navigation | 5 |
| `join-community-section.tsx` | Auth states, feature cards, CTAs | 6 |
| `platform-stats-async.tsx` | Facade integration, error handling | 2 |
| `featured-bobblehead-async.tsx` | Data fetch, transformation, null handling | 3 |
| `featured-collections-async.tsx` | User data, like status, null fields | 3 |
| `trending-bobbleheads-async.tsx` | Fetch, badge assignment, missing fields | 2 |
| `platform-stats-display.tsx` | Rendering, number formatting, accessibility | 3 |
| `featured-bobblehead-display.tsx` | Cloudinary, badges, stats, floating cards | 5 |
| `featured-collections-display.tsx` | Grid, empty state, images, likes | 5 |
| `trending-bobbleheads-display.tsx` | Grid, empty state, badge variants, hover | 5 |
| `auth.tsx` (AuthContent) | Loading, authenticated, unauthenticated | 3 |

### Medium Priority (37 tests)

| File | Functionality Missing | Tests Needed |
|------|----------------------|--------------|
| `platform-stats-skeleton.tsx` | Structure, accessibility | 2 |
| `featured-bobblehead-skeleton.tsx` | Structure, animations, accessibility | 3 |
| `featured-collections-skeleton.tsx` | 6 skeletons, grid layout | 2 |
| `trending-bobbleheads-skeleton.tsx` | 12 skeletons, responsive grid | 2 |
| `featured-content-transformer.ts` | Transform, filter, null handling | 4 |
| `cloudinary.utils.ts` | URL extraction, blur data, edge cases | 4 |
| `cache.service.ts` | Featured methods, keys, TTL | 5 |
| `bobbleheads-query.ts` | getBobbleheadCountAsync | 2 |
| `collections.query.ts` | getCollectionCountAsync | 2 |
| `users-query.ts` | getUserCountAsync | 2 |
| Count queries combined | Error handling | 3 |

## Test Count Summary

| Test Type | Count | Status |
|-----------|-------|--------|
| Unit Tests | 42 | Missing |
| Component Tests | 42 | Missing |
| Integration Tests | 28 | Missing |
| E2E Tests | 15 | Partial (1 exists) |
| **Total** | **127** | **Missing** |

## Validation Results

- **All source files analyzed**: ✓ (41 files)
- **Gap priorities assigned**: ✓ (Critical/High/Medium)
- **Test estimates provided**: ✓ (127 tests total)
- **Dependencies identified**: ✓

## Infrastructure Requirements

Before implementing tests:
1. **Clerk mock setup** - For auth-aware component tests
2. **Cloudinary utilities mock** - For image display tests
3. **Featured content database factory** - For integration tests
4. **Cache service test utilities** - For facade tests

## Critical Code Sections Requiring Tests

1. **Error Handling**: Facade error context propagation and Sentry logging
2. **Data Transformation**: Complex null field handling in async components
3. **Cache Layer**: Cache key generation, TTL, and invalidation
4. **Image Optimization**: Cloudinary URL parsing and blur data generation
5. **Auth-Aware Rendering**: Dynamic CTA buttons based on auth state
