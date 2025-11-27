# Code Review Report

**Target**: Home page at `app/(app)/(home)/page` (Route: `/`)
**Date**: 2025-11-27
**Review ID**: review-2025-11-27-home-page

---

## Executive Summary

### Overall Health: B (83/100)

| Layer | Score | Grade | Status |
|-------|-------|-------|--------|
| UI/Components | 71 | C | Needs Improvement |
| Business Logic | 93 | A | Excellent |
| Data Layer | 94 | A | Excellent |
| Static Analysis | 100 | A | Perfect |
| **Overall** | **83** | **B** | **Good** |

### Issue Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0 | None found |
| High | 8 | Fix before merge |
| Medium | 17 | Should address |
| Low | 14 | Consider fixing |
| Info | 1 | For awareness |
| **Total** | **40** | |

### Key Findings

1. **Missing Test ID Support** - 6 client components lack required `ComponentTestIdProps` and `testId` prop implementation, blocking automated UI testing
2. **Authentication Utility Import** - Server component imports `getUserIdAsync` which may need verification after auth-utils consolidation refactor
3. **Incorrect Cache TTL Configuration** - Platform stats facade uses MEDIUM TTL instead of EXTENDED for rarely-changing data

---

## Call Graph

```
HomePage (src/app/(app)/(home)/page.tsx)
├── generateMetadata() → generatePageMetadata('home')
├── serializeJsonLd(ORGANIZATION_SCHEMA, WEBSITE_SCHEMA)
├── <HeroSection />
│   ├── <Suspense> → <PlatformStatsAsync />
│   │   └── PlatformStatsFacade.getPlatformStatsAsync()
│   │       ├── BobbleheadsQuery.getBobbleheadCountAsync()
│   │       ├── CollectionsQuery.getCollectionCountAsync()
│   │       └── UsersQuery.getUserCountAsync()
│   └── <Suspense> → <FeaturedBobbleheadAsync />
│       └── FeaturedContentFacade.getFeaturedBobbleheadAsync()
│           └── FeaturedContentQuery.getFeaturedBobbleheadAsync()
├── <FeaturedCollectionsSection />
│   └── <Suspense> → <FeaturedCollectionsAsync />
│       ├── getUserIdAsync() [auth-utils]
│       └── FeaturedContentFacade.getFeaturedCollectionsAsync()
│           └── FeaturedContentQuery.getFeaturedCollectionsAsync()
├── <TrendingBobbleheadsSection />
│   └── <Suspense> → <TrendingBobbleheadsAsync />
│       └── FeaturedContentFacade.getTrendingBobbleheadsAsync()
│           └── FeaturedContentQuery.getTrendingBobbleheadsAsync()
└── <JoinCommunitySection />
    └── <AuthContent> (client component)
```

---

## High Priority Issues (8)

### 1. Missing ComponentTestIdProps in FeaturedCollectionsDisplay
- **Severity**: HIGH
- **Location**: `src/app/(app)/(home)/components/display/featured-collections-display.tsx:36-40`
- **Issue**: Props type missing `ComponentTestIdProps`, testId not implemented
- **Impact**: Blocks automated E2E testing

### 2. Missing ComponentTestIdProps in FeaturedCollectionCard
- **Severity**: HIGH
- **Location**: `src/app/(app)/(home)/components/display/featured-collections-display.tsx:78`
- **Issue**: Card component missing test ID support

### 3. Missing ComponentTestIdProps in TrendingBobbleheadsDisplay
- **Severity**: HIGH
- **Location**: `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx:28-32`
- **Issue**: Props type missing `ComponentTestIdProps`

### 4. Missing ComponentTestIdProps in TrendingBobbleheadCard
- **Severity**: HIGH
- **Location**: `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx:62-66`
- **Issue**: Card component missing test ID support

### 5. Missing data-testid on Section Components
- **Severity**: HIGH
- **Location**: `hero-section.tsx`, `featured-collections-section.tsx`, `trending-bobbleheads-section.tsx`
- **Issue**: Section wrapper components missing required `data-testid` attributes

### 6. Authentication Function Import Verification Needed
- **Severity**: HIGH
- **Location**: `src/app/(app)/(home)/components/async/featured-collections-async.tsx:7`
- **Issue**: Verify `getUserIdAsync` import after auth-utils consolidation refactor

### 7. Incorrect Cache TTL for Platform Stats
- **Severity**: HIGH
- **Location**: `src/lib/facades/platform/platform-stats.facade.ts:86`
- **Issue**: Uses MEDIUM TTL (5 min) instead of EXTENDED (1 hr) for rarely-changing stats

### 8. Page Component Missing async Keyword
- **Severity**: HIGH
- **Location**: `src/app/(app)/(home)/page.tsx:19`
- **Issue**: Server component should have `async` keyword

---

## Medium Priority Issues (17)

### Code Conventions (5)
- Page uses `export default function` instead of separate declaration/export
- Import order doesn't follow conventions
- Hardcoded error boundary names (3 files)

### Type Safety (6)
- Using `interface` instead of `type` for props (6 occurrences across display components)

### Naming Conventions (3)
- `badgeText` should be `_badgeText`
- testId variables missing `_` prefix
- `publicId`, `blurDataUrl`, `avatarUrl` missing `_` prefix

### Business Logic (3)
- Wrong method name in error context
- Missing cache-miss breadcrumb in `getTrendingBobbleheadsAsync`
- Inconsistent optional parameter pattern

---

## Low Priority Issues (14)

- Documentation gaps (duplicate comments, missing JSDoc)
- Components missing empty Props interfaces
- Hard-coded boolean values in query methods instead of DEFAULTS
- Complex ternary for badge text
- Inconsistent placeholder image approach
- Auth component missing test ID support

---

## Positive Findings

### Perfect Implementations (Zero Issues)
- `BobbleheadsQuery.getBobbleheadCountAsync`
- `CollectionsQuery.getCollectionCountAsync`
- `UsersQuery.getUserCountAsync`

### Architecture Patterns (Well Implemented)
- Server-only guards prevent client-side execution
- Suspense boundaries with meaningful fallbacks
- Error boundaries for graceful degradation
- Promise.all() for parallel data fetching
- SEO metadata with generateMetadata()
- JSON-LD structured data
- Type-safe routing with $path
- Domain-specific cache helpers
- Proper facade/query layer separation
- **Perfect static analysis** - 0 lint, type, or format errors

---

## Recommended Actions

### Immediate (Before Merge)
1. Add `ComponentTestIdProps` to 4 display components
2. Add `data-testid` to 3 section components
3. Verify `getUserIdAsync` import
4. Change cache TTL from MEDIUM to EXTENDED
5. Add `async` keyword to HomePage

### Short-term (This Sprint)
1. Convert `interface` to `type` for props (6 occurrences)
2. Apply `_` prefix to derived variables
3. Fix error context method name
4. Add cache-miss breadcrumb

### Long-term (Backlog)
1. Add JSDoc to async components
2. Add Props interfaces to sections
3. Replace hard-coded booleans with DEFAULTS

---

## Review Coverage

| Agent | Status | Issues |
|-------|--------|--------|
| server-component-specialist | SUCCESS | 11 |
| client-component-specialist | SUCCESS | 16 |
| facade-specialist | SUCCESS | 4 |
| database-specialist | SUCCESS | 3 |
| conventions-validator | SUCCESS | 5 |
| static-analysis-validator | SUCCESS | 0 |

**Files Analyzed**: 21 | **Methods Reviewed**: 33
