# Step 2: Source & Test Discovery

**Started**: 2025-12-04T00:00:30Z
**Completed**: 2025-12-04T00:01:30Z
**Status**: Success

## Input

Refined test scope from Step 1 covering CollectionStickyHeader, CollectionHeaderCard, CollectionUpsertDialog, and related components.

## Discovery Results

### Summary

- **Source Files Discovered**: 35 files
- **Existing Test Files**: 19 files
- **Directories Explored**: 8 primary directories
- **Candidate Files Examined**: 82 files

---

## SOURCE FILES

### Critical Priority (Core Implementation)

| File                                                                                               | Type               | Description                                                               |
| -------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------- |
| `src/app/(app)/dashboard/collection/(collection)/components/main/collection-header-card.tsx`       | Component          | Desktop header card with metadata, stats, cover image, action dropdown    |
| `src/app/(app)/dashboard/collection/(collection)/components/display/collection-header-display.tsx` | Component (Client) | Display orchestrator managing edit/delete dialogs, state coordination     |
| `src/app/(app)/dashboard/collection/(collection)/components/async/collection-header-async.tsx`     | Component (Server) | Server component fetching data via facade, passes to display              |
| `src/components/feature/collection/collection-sticky-header.tsx`                                   | Component (Client) | Mobile/tablet sticky header with like, share, edit/delete, report actions |
| `src/lib/facades/collections/collections-dashboard.facade.ts`                                      | Facade             | Business logic for dashboard operations with caching                      |
| `src/lib/queries/collections/collections-dashboard.query.ts`                                       | Query              | Complex database queries with aggregated stats                            |
| `src/lib/actions/collections/collections.actions.ts`                                               | Server Action      | CRUD actions with validation, uniqueness checks, error handling           |

### High Priority (Supporting Components)

| File                                                              | Type               | Description                                                       |
| ----------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------- |
| `src/components/feature/collections/collection-upsert-dialog.tsx` | Component (Client) | Create/edit dialog with form fields and focus management          |
| `src/components/feature/collections/collection-share-menu.tsx`    | Component (Client) | Share dropdown with copy link, Twitter, Facebook                  |
| `src/components/feature/collections/collection-delete.tsx`        | Component (Client) | Delete button with confirmation dialog                            |
| `src/components/ui/like-button.tsx`                               | Component (Client) | Three variants: LikeIconButton, LikeTextButton, LikeCompactButton |
| `src/components/feature/content-reports/report-button.tsx`        | Component (Client) | Report button opening ReportReasonDialog                          |
| `src/components/ui/alert-dialogs/confirm-delete-alert-dialog.tsx` | Component (Client) | Reusable confirmation dialog with text confirmation               |

### Medium Priority (Business Logic & Utilities)

| File                                                                     | Type               | Description                                               |
| ------------------------------------------------------------------------ | ------------------ | --------------------------------------------------------- |
| `src/lib/facades/collections/collections.facade.ts`                      | Facade             | CRUD operations, browse/search, trending, view tracking   |
| `src/lib/validations/collections.validation.ts`                          | Validation         | Zod schemas for collection operations                     |
| `src/components/feature/collections/hooks/use-collection-upsert-form.ts` | Hook               | Form state, image uploads, validation, action execution   |
| `src/hooks/use-like.tsx`                                                 | Hook               | Like functionality with optimistic updates                |
| `src/hooks/use-server-action.ts`                                         | Hook               | Generic server action wrapper with toasts, loading states |
| `src/hooks/use-toggle.ts`                                                | Hook               | Toggle state for dialog visibility                        |
| `src/lib/utils/currency.utils.ts`                                        | Utility            | Currency formatting for stats display                     |
| `src/lib/utils/share-utils.ts`                                           | Utility            | Clipboard copy, social share URL generation               |
| `src/lib/actions/social/social.actions.ts`                               | Server Action      | toggleLikeAction for likes                                |
| `src/components/feature/collections/collection-form-fields.tsx`          | Component (Client) | Form fields for dialogs                                   |

### Low Priority (Types & Constants)

| File                                                                   | Type      | Description                         |
| ---------------------------------------------------------------------- | --------- | ----------------------------------- |
| `src/components/feature/collections/collection-upsert-dialog.types.ts` | Types     | TypeScript types for upsert dialog  |
| `src/lib/queries/collections/collections.query.ts`                     | Query     | Main collections query class        |
| `src/app/(app)/dashboard/collection/(collection)/route-type.ts`        | Types     | Route type definitions              |
| `src/lib/constants/enums.ts`                                           | Constants | LikeTargetType, comment types, etc. |
| `src/lib/constants/operations.ts`                                      | Constants | Operation names for Sentry          |
| `src/hooks/use-optimistic-server-action.ts`                            | Hook      | Optimistic UI updates               |

---

## EXISTING TEST FILES

### Unit Tests

| File                                                                      | Priority | Description                            |
| ------------------------------------------------------------------------- | -------- | -------------------------------------- |
| `tests/unit/lib/facades/collections/collections-dashboard.facade.test.ts` | High     | Facade method tests with cache mocking |
| `tests/unit/lib/validations/collections.validation.test.ts`               | Medium   | Validation schema tests                |
| `tests/unit/lib/validations/like.validation.test.ts`                      | Medium   | Like schema tests                      |

### Component Tests

| File                                                                        | Priority | Description           |
| --------------------------------------------------------------------------- | -------- | --------------------- |
| `tests/components/collections/dashboard/sidebar-header.test.tsx`            | Medium   | Sidebar header tests  |
| `tests/components/collections/dashboard/sidebar-footer.test.tsx`            | Medium   | Sidebar footer tests  |
| `tests/components/collections/dashboard/sidebar-collection-list.test.tsx`   | Medium   | Sidebar list tests    |
| `tests/components/collections/dashboard/sidebar-search.test.tsx`            | Medium   | Sidebar search tests  |
| `tests/components/collections/dashboard/sidebar-display.test.tsx`           | Medium   | Sidebar display tests |
| `tests/components/collections/dashboard/collection-card-hovercard.test.tsx` | Low      | Hover card tests      |
| `tests/components/collections/dashboard/collection-card-compact.test.tsx`   | Low      | Compact card tests    |
| `tests/components/collections/dashboard/collection-card-detailed.test.tsx`  | Low      | Detailed card tests   |
| `tests/components/collections/dashboard/collection-card-cover.test.tsx`     | Low      | Cover display tests   |
| `tests/components/collections/dashboard/no-collections.test.tsx`            | Low      | Empty state tests     |
| `tests/components/collections/dashboard/no-filtered-collections.test.tsx`   | Low      | Filtered empty state  |

### Integration Tests

| File                                                                        | Priority | Description                   |
| --------------------------------------------------------------------------- | -------- | ----------------------------- |
| `tests/integration/actions/collections.facade.test.ts`                      | High     | Facade operations integration |
| `tests/integration/queries/collections/collections-dashboard.query.test.ts` | High     | Dashboard query with real DB  |

### Test Infrastructure

| File                                             | Type        | Description                     |
| ------------------------------------------------ | ----------- | ------------------------------- |
| `tests/fixtures/collection.factory.ts`           | Factory     | Test collection data generation |
| `tests/mocks/data/collections.mock.ts`           | Mock Data   | Mock collection objects         |
| `tests/mocks/data/collections-dashboard.mock.ts` | Mock Data   | Dashboard-specific mocks        |
| `tests/mocks/handlers/collections.handlers.ts`   | MSW Handler | API request mocking             |

---

## Architecture Insights

### Key Patterns Discovered

1. **Layered Architecture**: async → display → presentational components
2. **Server Actions Pattern**: Type-safe actions with validation, caching, Sentry
3. **Facade Layer**: Business logic abstraction over queries and cache
4. **Optimistic Updates**: Like functionality uses optimistic UI
5. **Focus Management**: Forms use custom HOC for accessibility

### Integration Points

- **Route State**: nuqs for URL state (collectionSlug)
- **Auth**: Clerk for user permissions
- **Forms**: TanStack Form with useAppForm
- **Cache**: CacheRevalidationService on mutations
- **Errors**: Sentry integration throughout

---

## Validation Results

- Source files discovered: 35 (minimum 5 required) ✓
- Test files discovered: 19 ✓
- All critical source files identified ✓
- Existing test coverage mapped ✓
