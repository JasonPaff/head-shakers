# Step 3: Implementation Planning

**Status**: Completed
**Started**: 2025-11-26T00:03:00Z
**Completed**: 2025-11-26T00:05:00Z

## Input

### Refined Feature Request

Replace the simple hero section on the main home page with the more elaborate HeroSection component from the home-page-demo route, integrating its advanced visual features while maintaining data-driven functionality.

### File Discovery Summary

- 38 relevant files discovered
- 3 potential new files to create
- Key files: page.tsx (main), home-page-demo/page.tsx (source), facades and queries for data

## Agent Prompt

```
Generate an implementation plan in MARKDOWN format (NOT XML) following your defined template with sections:
Overview, Quick Summary, Prerequisites, Implementation Steps, Quality Gates, Notes.

Include 'npm run lint:fix && npm run typecheck' validation for every step touching JS/JSX/TS/TSX files.
Do NOT include code examples.
```

## Implementation Plan Generated

**Location**: `docs/2025_11_26/plans/hero-section-migration-implementation-plan.md`

### Plan Overview

| Metric | Value |
|--------|-------|
| Estimated Duration | 4-6 hours |
| Complexity | Medium |
| Risk Level | Medium |
| Total Steps | 13 |

### Implementation Steps Summary

| Step | Description | Confidence |
|------|-------------|------------|
| 1 | Create Platform Statistics Facade | High |
| 2 | Create Platform Statistics Query Methods | High |
| 3 | Create Hero Stats Async Component | High |
| 4 | Create Hero Stats Skeleton Component | High |
| 5 | Extract and Adapt Badge Component Variants | Medium |
| 6 | Create Hero Featured Bobblehead Showcase Component | High |
| 7 | Create Hero Featured Bobblehead Async Component | High |
| 8 | Create Hero Featured Bobblehead Skeleton | High |
| 9 | Create New Hero Section Component | High |
| 10 | Integrate New Hero Section into Home Page | High |
| 11 | Update Badge Icon Support | Medium |
| 12 | Create Cache Service Methods for Platform Stats | High |
| 13 | Add Cache Revalidation for Platform Stats | Medium |

### Files to Create (7)

1. `src/lib/facades/platform/platform-stats.facade.ts`
2. `src/app/(app)/(home)/components/async/hero-stats-async.tsx`
3. `src/app/(app)/(home)/components/skeletons/hero-stats-skeleton.tsx`
4. `src/app/(app)/(home)/components/display/hero-featured-bobblehead.tsx`
5. `src/app/(app)/(home)/components/async/hero-featured-bobblehead-async.tsx`
6. `src/app/(app)/(home)/components/skeletons/hero-featured-bobblehead-skeleton.tsx`
7. `src/app/(app)/(home)/components/hero-section.tsx`

### Files to Modify (6)

1. `src/lib/queries/bobbleheads/bobbleheads-query.ts`
2. `src/lib/queries/collections/collections.query.ts`
3. `src/components/ui/badge.tsx`
4. `src/app/(app)/(home)/page.tsx`
5. `src/lib/services/cache.service.ts`
6. `src/lib/services/cache-revalidation.service.ts`

### Quality Gates

- TypeScript compilation passes
- ESLint passes with no errors
- Hero section displays correctly with real data
- Platform statistics show accurate counts
- All Suspense boundaries work with loading skeletons
- Authentication-aware CTA buttons function correctly
- Links use $path() and navigate correctly
- Accessibility attributes preserved
- Responsive design works
- Dark mode styling functions correctly
- Animations and visual effects render smoothly

## Validation Results

- [x] Format: Markdown (PASS)
- [x] Template Compliance: All sections present (PASS)
- [x] Validation Commands: All steps include lint/typecheck (PASS)
- [x] No Code Examples: Only instructions (PASS)
- [x] Actionable Steps: Concrete implementation details (PASS)
- [x] Complete Coverage: Addresses full feature request (PASS)
