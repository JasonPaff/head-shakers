# Step 2: File Discovery

## Metadata
- **Step**: 2 - AI-Powered File Discovery
- **Start Time**: 2026-01-11T00:01:00.000Z
- **End Time**: 2026-01-11T00:02:30.000Z
- **Duration**: ~90 seconds
- **Status**: Complete

## Input

### Refined Request Used
Remove the slug concept entirely from the application since the routing structure has changed from /collection/[collectionSlug] and /bobbleheads/[bobbleheadSlug] to user-scoped routes that no longer require slugs, allowing collection and bobblehead names to be used directly without modification.

## AI Discovery Analysis

### Summary Statistics
- **Directories Explored**: 15+
- **Files Examined**: 50+
- **Files with "slug" keyword**: 391
- **Unique files requiring modification**: 100+

---

## CRITICAL Priority Files (Database Schemas, Migrations, Core Constants)

| File Path | Category | Reasoning |
|-----------|----------|-----------|
| `src/lib/db/schema/collections.schema.ts` | Database Schema | Defines `slug` column on collections table with `SLUG_MAX_LENGTH` constraint, `collections_slug_idx` index, and `collections_user_slug_unique` unique constraint |
| `src/lib/db/schema/bobbleheads.schema.ts` | Database Schema | Defines `slug` column on bobbleheads table with `.unique()` constraint and `bobbleheads_slug_idx` index |
| `src/lib/constants/slug.ts` | Constants | Contains `SLUG_MAX_LENGTH`, `SLUG_MIN_LENGTH`, `SLUG_PATTERN` regex, and `SLUG_RESERVED_WORDS` - **DELETE ENTIRELY** |
| `src/lib/utils/slug.ts` | Utility | Contains `generateSlug()`, `validateSlug()`, and `ensureUniqueSlug()` - **DELETE ENTIRELY** |
| `src/lib/validations/collections.validation.ts` | Validation Schema | References slug constants and contains `getCollectionBySlugSchema` |
| `src/lib/validations/bobbleheads.validation.ts` | Validation Schema | References slug constants and contains `getBobbleheadBySlugSchema` |

---

## HIGH Priority Files (Server Actions, Queries, Facades)

| File Path | Category | Reasoning |
|-----------|----------|-----------|
| `src/lib/facades/collections/collections.facade.ts` | Facade | Imports `ensureUniqueSlug`, `generateSlug`. Has `getCollectionBySlug()` methods |
| `src/lib/facades/bobbleheads/bobbleheads.facade.ts` | Facade | Imports `ensureUniqueSlug`, `generateSlug`. Has `getBobbleheadBySlug()` methods |
| `src/lib/queries/collections/collections.query.ts` | Query | Has `findBySlugAsync()`, `getCollectionSlugsByUserIdAsync()` methods |
| `src/lib/queries/bobbleheads/bobbleheads-query.ts` | Query | Has `findBySlugAsync()`, `getSlugsAsync()` methods |
| `src/lib/services/cache-revalidation.service.ts` | Service | Uses slug in path construction for cache revalidation |
| `src/lib/validations/bobblehead-navigation.validation.ts` | Validation | Contains `slug` and `contextSlug` fields |
| `src/lib/types/bobblehead-navigation.types.ts` | Types | Type `AdjacentBobblehead` includes `slug: string` |
| `src/lib/facades/collections/collections-dashboard.facade.ts` | Facade | Dashboard facade with slugs |
| `src/lib/facades/bobbleheads/bobbleheads-dashboard.facade.ts` | Facade | Dashboard facade with slugs |
| `src/lib/queries/collections/collections-dashboard.query.ts` | Query | Dashboard query including slugs |
| `src/lib/queries/bobbleheads/bobbleheads-dashboard.query.ts` | Query | Dashboard query including slugs |
| `src/lib/queries/content-search/content-search.query.ts` | Query | Search query returning slugs |
| `src/lib/queries/featured-content/featured-content-query.ts` | Query | Featured content with slugs |
| `src/lib/queries/featured-content/featured-content-transformer.ts` | Query | Transforms featured content with slugs |
| `src/lib/actions/social/social.actions.ts` | Action | Social actions referencing slugs |

---

## MEDIUM Priority Files (Route Pages, Route Types, Components)

### Route Files

| File Path | Category |
|-----------|----------|
| `_next-typesafe-url_.d.ts` | Generated Types (regenerate after changes) |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/route-type.ts` | Route Type |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]/route-type.ts` | Route Type |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/page.tsx` | Route Page |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]/page.tsx` | Route Page |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/types.ts` | Types |
| `src/app/(app)/user/[username]/dashboard/collection/route-type.ts` | Route Type |

### Featured/Browse Components

| File Path | Category |
|-----------|----------|
| `src/app/(app)/browse/featured/components/display/featured-tabbed-content-display.tsx` | Component |
| `src/app/(app)/browse/featured/components/display/featured-hero-display.tsx` | Component |
| `src/app/(app)/browse/featured/components/featured-content-display.tsx` | Component |
| `src/app/(app)/browse/components/browse-collections-table.tsx` | Component |
| `src/app/(app)/browse/search/components/search-results-list.tsx` | Component |
| `src/app/(app)/browse/search/components/search-result-card.tsx` | Component |

### Collection Route Components

| File Path | Category |
|-----------|----------|
| `src/app/(app)/user/[username]/collection/[collectionSlug]/components/bobblehead-card.tsx` | Component |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/components/bobblehead-grid.tsx` | Component |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/components/async/collection-header-async.tsx` | Component |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/components/async/collection-bobbleheads-async.tsx` | Component |

### Bobblehead Route Components

| File Path | Category |
|-----------|----------|
| `src/app/(app)/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]/components/bobblehead.tsx` | Component |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]/components/bobblehead-header.tsx` | Component |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]/components/bobblehead-navigation.tsx` | Component |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]/components/collection-breadcrumb.tsx` | Component |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]/components/collection-context-indicator.tsx` | Component |

### Dashboard Components

| File Path | Category |
|-----------|----------|
| `src/app/(app)/user/[username]/dashboard/collection/components/display/collection-header-display.tsx` | Component |
| `src/app/(app)/user/[username]/dashboard/collection/components/display/sidebar-display.tsx` | Component |
| `src/app/(app)/user/[username]/dashboard/collection/components/main/bobblehead-card.tsx` | Component |
| `src/app/(app)/user/[username]/dashboard/collection/components/sidebar/cards/collection-card-detailed.tsx` | Component |
| `src/app/(app)/user/[username]/dashboard/collection/components/sidebar/cards/collection-card-compact.tsx` | Component |
| `src/app/(app)/user/[username]/dashboard/collection/components/sidebar/cards/collection-card-cover.tsx` | Component |

### Home Page Components

| File Path | Category |
|-----------|----------|
| `src/app/(app)/(home)/components/display/featured-bobblehead-display.tsx` | Component |
| `src/app/(app)/(home)/components/display/featured-collections-display.tsx` | Component |
| `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx` | Component |

### Feature Components

| File Path | Category |
|-----------|----------|
| `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` | Component |
| `src/components/feature/bobblehead/bobblehead-share-menu.tsx` | Component |
| `src/components/feature/bobblehead/bobblehead-sticky-header.tsx` | Component |
| `src/components/feature/collection/collection-sticky-header.tsx` | Component |
| `src/components/feature/collections/collection-share-menu.tsx` | Component |
| `src/components/feature/search/search-result-item.tsx` | Component |
| `src/components/feature/collections/hooks/use-collection-upsert-form.ts` | Hook |

### Admin/Analytics Components

| File Path | Category |
|-----------|----------|
| `src/components/admin/analytics/trending-content-table.tsx` | Component |
| `src/components/admin/analytics/view-analytics-dashboard.tsx` | Component |
| `src/components/admin/reports/reports-table.tsx` | Component |
| `src/components/admin/reports/report-detail-dialog.tsx` | Component |
| `src/components/analytics/collection-view-tracker.tsx` | Component |
| `src/components/analytics/bobblehead-view-tracker.tsx` | Component |

### SEO/Utility Files

| File Path | Category |
|-----------|----------|
| `src/app/sitemap.ts` | SEO |
| `src/lib/seo/metadata.utils.ts` | SEO |
| `src/lib/seo/preview.utils.ts` | SEO |
| `src/middleware.ts` | Middleware |
| `src/lib/utils/share-utils.ts` | Utility |
| `src/lib/utils/facade-helpers.ts` | Utility |
| `src/lib/utils/sentry-server/breadcrumbs.server.ts` | Utility |
| `src/lib/db/scripts/seed.ts` | Script |

---

## LOW Priority Files (Tests, Mock Data, Factories)

### Integration Tests

| File Path |
|-----------|
| `tests/integration/actions/collections/collections.actions.test.ts` |
| `tests/integration/facades/collections/collections.facade.test.ts` |
| `tests/integration/actions/bobbleheads/bobbleheads.actions.test.ts` |
| `tests/integration/facades/bobbleheads/bobbleheads.facade.test.ts` |
| `tests/integration/components/collection-header-async.test.tsx` |
| `tests/integration/facades/collections/collections-dashboard.facade.test.ts` |
| `tests/integration/facades/bobbleheads-dashboard/bobbleheads-dashboard.facade.test.ts` |
| `tests/integration/queries/collections/collections-dashboard.query.test.ts` |
| `tests/integration/queries/bobbleheads/bobbleheads-dashboard.query.test.ts` |
| `tests/integration/queries/featured-content/featured-content-query.test.ts` |
| `tests/integration/facades/featured-content/featured-content.facade.test.ts` |
| `tests/integration/facades/social/social.facade.test.ts` |

### Component Tests

| File Path |
|-----------|
| `tests/components/collections/dashboard/sidebar-display.test.tsx` |
| `tests/components/collections/dashboard/collection-header-display.test.tsx` |
| `tests/components/collections/dashboard/collection-card-detailed.test.tsx` |
| `tests/components/collections/dashboard/collection-card-compact.test.tsx` |
| `tests/components/collections/collection-upsert-dialog.test.tsx` |
| `tests/components/collections/collection-share-menu.test.tsx` |
| `tests/components/collections/collection-sticky-header.test.tsx` |
| `tests/components/home/sections/hero-section.test.tsx` |
| `tests/components/home/sections/join-community-section.test.tsx` |
| `tests/components/home/display/featured-bobblehead-display.test.tsx` |
| `tests/components/home/display/featured-collections-display.test.tsx` |
| `tests/components/home/display/trending-bobbleheads-display.test.tsx` |

### Unit Tests

| File Path |
|-----------|
| `tests/unit/app/dashboard/collection/route-type.test.ts` |
| `tests/unit/lib/validations/collections.validation.test.ts` |
| `tests/unit/lib/validations/bobbleheads.validation.test.ts` |
| `tests/unit/lib/utils/share-utils.test.ts` |
| `tests/unit/lib/queries/featured-content/featured-content-transformer.test.ts` |

### Factories and Mocks

| File Path |
|-----------|
| `tests/fixtures/collection.factory.ts` |
| `tests/fixtures/bobblehead.factory.ts` |
| `tests/fixtures/collection-header.factory.ts` |
| `tests/fixtures/bobblehead-grid.factory.ts` |
| `tests/fixtures/featured-content.factory.ts` |
| `tests/mocks/data/collections.mock.ts` |
| `tests/mocks/data/bobbleheads.mock.ts` |
| `tests/mocks/data/collections-dashboard.mock.ts` |
| `tests/mocks/handlers/collections.handlers.ts` |
| `tests/mocks/handlers/bobbleheads.handlers.ts` |
| `tests/e2e/pages/collection.page.ts` |

---

## Architecture Insights

### Key Patterns Discovered

1. **Slug Generation Flow**: Slugs are generated in facades using `generateSlug()` from `slug.ts` utility, then made unique with `ensureUniqueSlug()`

2. **Database Schema Pattern**: Both tables have slug varchar column, index, and unique constraints

3. **Route Structure**: Routes use `[collectionSlug]` and `[bobbleheadSlug]` as dynamic segments

4. **Validation Pattern**: Slug validation uses `SLUG_PATTERN` regex with min/max length constraints

5. **Cache Invalidation**: Uses slug-based path revalidation

### Files to Delete Entirely

- `src/lib/constants/slug.ts`
- `src/lib/utils/slug.ts`

### Post-Implementation Steps Required

1. `npm run db:generate` - Create migration
2. `npm run db:migrate` - Apply migration
3. `npm run next-typesafe-url` - Regenerate route types
4. `npm run typecheck` - Verify no type errors
5. `npm run test` - Ensure all tests pass

---

## Validation Results

- **Files Discovered**: ✅ 100+ files identified
- **Minimum Requirement**: ✅ Well above 3 file minimum
- **Categorization**: ✅ Files properly categorized by priority
- **Comprehensive Coverage**: ✅ All architectural layers covered
