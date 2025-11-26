# Step 2: File Discovery

**Status**: Completed
**Started**: 2025-11-26T00:01:00Z
**Completed**: 2025-11-26T00:03:00Z

## Input

### Refined Feature Request

Replace the simple hero section on the main home page with the more elaborate HeroSection component from the home-page-demo route, integrating its advanced visual features while maintaining data-driven functionality.

## Discovery Summary

- **Total Files Discovered**: 38 relevant files
- **Directories Explored**: 15+
- **Files Examined**: 50+ candidate files
- **New Files to Create**: 1-3 potential new files

## Files by Priority

### CRITICAL (Core Implementation)

| File | Action | Reason |
|------|--------|--------|
| `src/app/(app)/(home)/page.tsx` | MODIFY | Main target - replace hero section |
| `src/app/home-page-demo/page.tsx` | REFERENCE | Source template with HeroSection, Badge, MOCK_STATS |
| `src/app/(app)/(home)/components/async/featured-bobbleheads-async.tsx` | REFERENCE | Pattern for async data fetching |

### HIGH (Data Fetching & Business Logic)

| File | Action | Reason |
|------|--------|--------|
| `src/lib/facades/featured-content/featured-content.facade.ts` | REFERENCE | getFeaturedBobbleheads() method |
| `src/lib/facades/analytics/analytics.facade.ts` | POTENTIAL MODIFY | May need getPlatformStats() |
| `src/lib/facades/collections/collections.facade.ts` | REFERENCE | Count methods |
| `src/lib/facades/bobbleheads/bobbleheads.facade.ts` | REFERENCE | Count methods |
| `src/lib/facades/users/users.facade.ts` | REFERENCE | getUserById(), count methods |
| `src/lib/queries/bobbleheads/bobbleheads-query.ts` | POTENTIAL MODIFY | Add count query |
| `src/lib/queries/collections/collections.query.ts` | POTENTIAL MODIFY | Add count query |
| `src/lib/queries/users/users-query.ts` | REFERENCE | Has countUsersForAdmin() |
| `src/lib/facades/social/social.facade.ts` | REFERENCE | Like data |

### MEDIUM (UI Components & Supporting Code)

| File | Action | Reason |
|------|--------|--------|
| `src/components/ui/auth.tsx` | REUSE | AuthContent wrapper |
| `src/components/ui/badge.tsx` | EVALUATE | May need to extend variants |
| `src/components/ui/button.tsx` | REUSE | CTA buttons |
| `src/components/ui/card.tsx` | REUSE | Floating cards |
| `src/components/ui/skeleton.tsx` | REUSE | Loading states |
| `src/components/ui/conditional.tsx` | REUSE | Conditional rendering |
| `src/components/ui/variants/featured-card-variants.ts` | REFERENCE | CVA variants |
| `src/app/(app)/(home)/components/display/featured-bobbleheads-display.tsx` | REFERENCE | Badge usage pattern |
| `src/app/(app)/(home)/components/skeletons/featured-bobbleheads-skeleton.tsx` | REUSE | Already used |
| `src/app/(app)/(home)/components/async/featured-collections-async.tsx` | REFERENCE | Async pattern |
| `src/app/(app)/(home)/components/display/featured-collections-display.tsx` | REFERENCE | Display pattern |
| `src/app/(app)/(home)/components/skeletons/featured-collections-skeleton.tsx` | REUSE | Already used |
| `src/app/(app)/(home)/components/featured-collections-error-boundary.tsx` | REFERENCE | Error handling |
| `src/components/feature/users/username-onboarding-provider.tsx` | REUSE | Keep as-is |
| `src/components/ui/like-button.tsx` | REUSE | Engagement metrics |

### LOW (Utilities & Configuration)

| File | Action | Reason |
|------|--------|--------|
| `src/utils/optional-auth-utils.ts` | REUSE | getOptionalUserId() |
| `src/utils/tailwind-utils.ts` | REUSE | cn() utility |
| `src/lib/seo/seo.constants.ts` | REUSE | Schema constants |
| `src/lib/seo/metadata.utils.ts` | REUSE | serializeJsonLd() |
| `src/app/globals.css` | EVALUATE | Check animations |
| `src/lib/constants/cloudinary-paths.ts` | REUSE | Placeholder images |
| `src/lib/utils/cloudinary.utils.ts` | REUSE | URL utilities |
| `src/lib/test-ids.ts` | REUSE | Test ID generation |
| `src/lib/queries/featured-content/featured-content-transformer.ts` | REFERENCE | Data transformation |
| `src/lib/queries/featured-content/featured-content-query.ts` | REFERENCE | Query patterns |
| `src/lib/services/cache.service.ts` | REFERENCE | Caching patterns |

## Potential New Files

| File | Priority | Purpose |
|------|----------|---------|
| `src/lib/facades/platform/platform-stats.facade.ts` | HIGH | Aggregate platform statistics |
| `src/app/(app)/(home)/components/async/hero-stats-async.tsx` | MEDIUM | Async stats fetching |
| `src/app/(app)/(home)/components/skeletons/hero-stats-skeleton.tsx` | LOW | Stats loading skeleton |

## Architecture Insights

### Key Patterns

1. **Async Server Components**: Use Suspense with async components for data fetching
2. **Facade Layer**: Business logic through facades with caching/error handling
3. **CVA Variants**: Consistent styling via featured-card-variants.ts
4. **Auth Pattern**: AuthContent wrapper for conditional rendering

### Platform Stats Strategy

**Recommended**: Create new `PlatformStatsFacade` with aggressive caching (1 hour TTL) that aggregates:
- Total bobbleheads count
- Total collections count
- Total collectors (users) count

## Validation

- [x] Minimum 3 relevant files discovered (38 found)
- [x] All file paths validated to exist
- [x] Files properly categorized by priority
- [x] AI analysis based on actual file contents
- [x] Existing patterns and integration points identified
