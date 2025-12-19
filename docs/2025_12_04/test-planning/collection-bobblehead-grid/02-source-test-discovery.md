# Step 2: Source & Test Discovery

**Started**: 2025-12-04T00:01:00Z
**Completed**: 2025-12-04T00:02:30Z
**Status**: SUCCESS

## Input

Refined test scope from Step 1 covering BobbleheadGridDisplay, toolbar, selection mode, pagination, server actions, facades, and queries.

## Agent Prompt

```
For the collection dashboard's bobblehead grid feature, discover ALL relevant source files and existing test files.

**Feature Context**: The bobblehead grid at /dashboard/collection includes:
- BobbleheadGridDisplay client component for viewing, filtering, sorting, selecting bobbleheads
- Toolbar with search, filters (category/condition/featured), sort options
- Selection mode with bulk operations (batch delete, batch feature)
- BobbleheadCard with hover overlays and actions
- Pagination with page size selection
- Server components for data fetching via BobbleheadsDashboardFacade
- Server actions for delete, batch delete, feature, batch feature operations
- URL state management with nuqs

[Full search patterns included]
```

## Discovery Results

### Source Files (47 files)

#### High Priority - Core Implementation (Critical)

| File                                                                                             | Priority | Description                                                           |
| ------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------- |
| `src/app/(app)/dashboard/collection/(collection)/components/display/bobblehead-grid-display.tsx` | Critical | Core orchestration component - state, URL params, selection, bulk ops |
| `src/app/(app)/dashboard/collection/(collection)/components/main/toolbar.tsx`                    | Critical | Search, filters, sort, toggles, selection mode                        |
| `src/app/(app)/dashboard/collection/(collection)/components/main/bulk-actions-bar.tsx`           | Critical | Bulk selection controls, batch delete/feature                         |
| `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-card.tsx`            | Critical | Individual card with hover, selection, actions                        |
| `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-pagination.tsx`      | Critical | Pagination controls, page size selector                               |
| `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-grid.tsx`            | High     | Responsive grid wrapper with density variants                         |
| `src/lib/actions/bobbleheads/bobbleheads.actions.ts`                                             | Critical | Server actions (delete, batch delete, feature, batch feature)         |
| `src/lib/facades/bobbleheads/bobbleheads-dashboard.facade.ts`                                    | Critical | Data fetching facade with caching                                     |
| `src/lib/facades/bobbleheads/bobbleheads.facade.ts`                                              | Critical | Business logic facade for mutations                                   |
| `src/lib/queries/bobbleheads/bobbleheads-dashboard.query.ts`                                     | Critical | Database queries with filtering/sorting/pagination                    |

#### Medium Priority - Supporting (High)

| File                                                                                               | Priority | Description                                |
| -------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------ |
| `src/app/(app)/dashboard/collection/(collection)/components/async/bobblehead-grid-async.tsx`       | High     | Server component data fetching wrapper     |
| `src/app/(app)/dashboard/collection/(collection)/components/empty-states/no-bobbleheads.tsx`       | High     | Empty state (no bobbleheads)               |
| `src/app/(app)/dashboard/collection/(collection)/components/empty-states/no-results.tsx`           | High     | Empty state (no filtered results)          |
| `src/app/(app)/dashboard/collection/(collection)/components/skeleton/bobblehead-grid-skeleton.tsx` | Medium   | Loading skeleton for grid                  |
| `src/app/(app)/dashboard/collection/(collection)/components/skeleton/toolbar-skeleton.tsx`         | Medium   | Loading skeleton for toolbar               |
| `src/app/(app)/dashboard/collection/(collection)/route-type.ts`                                    | High     | URL state parsers (nuqs), type definitions |
| `src/lib/validations/bobbleheads.validation.ts`                                                    | High     | Validation schemas for actions             |

#### Low Priority - Utilities (Medium/Low)

| File                                                          | Priority | Description                |
| ------------------------------------------------------------- | -------- | -------------------------- |
| `src/app/(app)/dashboard/collection/(collection)/page.tsx`    | Low      | Page entry point           |
| `src/app/(app)/dashboard/collection/(collection)/loading.tsx` | Low      | Page loading state         |
| `src/lib/queries/bobbleheads/bobbleheads-query.ts`            | Medium   | General bobblehead queries |
| `src/lib/db/schema/bobbleheads.schema.ts`                     | Low      | Database schema            |
| `src/hooks/use-user-preferences.ts`                           | Medium   | User preferences hook      |
| `src/hooks/use-server-action.ts`                              | Medium   | Server action wrapper      |
| `src/hooks/use-toggle.ts`                                     | Low      | Toggle state hook          |

#### UI Components (Reusable)

| File                                                              | Priority | Description                |
| ----------------------------------------------------------------- | -------- | -------------------------- |
| `src/components/ui/alert-dialogs/confirm-delete-alert-dialog.tsx` | Medium   | Delete confirmation dialog |
| `src/components/ui/button.tsx`                                    | Low      | Button component           |
| `src/components/ui/input.tsx`                                     | Low      | Input component            |
| `src/components/ui/dropdown-menu.tsx`                             | Low      | Dropdown menu              |
| `src/components/ui/checkbox.tsx`                                  | Low      | Checkbox component         |
| `src/components/ui/select.tsx`                                    | Low      | Select component           |
| `src/components/ui/hover-card.tsx`                                | Low      | Hover card component       |

### Existing Test Files (10 files)

#### Component Tests

| File                                                                    | What It Tests                  |
| ----------------------------------------------------------------------- | ------------------------------ |
| `tests/components/home/display/featured-bobblehead-display.test.tsx`    | Featured bobblehead rendering  |
| `tests/components/home/display/trending-bobbleheads-display.test.tsx`   | Trending bobbleheads rendering |
| `tests/components/home/sections/trending-bobbleheads-section.test.tsx`  | Trending section component     |
| `tests/components/home/skeleton/featured-bobblehead-skeleton.test.tsx`  | Skeleton loading states        |
| `tests/components/home/skeleton/trending-bobbleheads-skeleton.test.tsx` | Skeleton loading states        |

#### Unit Tests

| File                                                        | What It Tests           |
| ----------------------------------------------------------- | ----------------------- |
| `tests/unit/lib/validations/bobbleheads.validation.test.ts` | Validation schema tests |

#### Integration Tests

| File                                                               | What It Tests                          |
| ------------------------------------------------------------------ | -------------------------------------- |
| `tests/integration/facades/bobbleheads/bobbleheads.facade.test.ts` | Facade integration with Testcontainers |

### Test Infrastructure Files

| File                                             | Purpose                                           |
| ------------------------------------------------ | ------------------------------------------------- |
| `tests/fixtures/bobblehead.factory.ts`           | createTestBobblehead, createTestBobbleheads, etc. |
| `tests/mocks/data/bobbleheads.mock.ts`           | mockBobblehead, createMockBobblehead, etc.        |
| `tests/mocks/data/collections.mock.ts`           | Collection mock data                              |
| `tests/mocks/data/collections-dashboard.mock.ts` | Dashboard mock data                               |
| `tests/mocks/handlers/bobbleheads.handlers.ts`   | MSW handlers for bobbleheads                      |
| `tests/mocks/handlers/collections.handlers.ts`   | MSW handlers for collections                      |

## Architecture Insights

### Data Fetching Flow

```
Server Component (BobbleheadGridAsync)
    ↓
Facade (BobbleheadsDashboardFacade.getListByCollectionSlugAsync)
    ↓
Query (BobbleheadsDashboardQuery.getListAsync)
    ↓
Database (Drizzle ORM)
```

### URL State Management

- Uses `nuqs` for type-safe URL state
- Parsers in `route-type.ts`
- Search, filters, sort, page, pageSize params

### Selection & Bulk Operations

- Client-side Set-based selection tracking
- Bulk actions via server actions
- Confirmation dialogs for destructive operations

### Existing Test Patterns Found

- Skeleton component tests
- Display component tests with mock data
- Section component tests
- Validation schema tests
- Facade integration tests with Testcontainers

## Validation Results

- Source files discovered: 47 (PASS - minimum 3 required)
- Test files discovered: 10 (PASS)
- All files validated to exist: YES
- Files categorized by priority: YES
- SOURCE/TEST categorization: YES
