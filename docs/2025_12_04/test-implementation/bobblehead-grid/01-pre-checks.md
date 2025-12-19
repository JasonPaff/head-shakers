# Pre-Implementation Checks

**Timestamp**: 2025-12-04
**Plan Path**: docs/2025_12_04/plans/bobblehead-grid-test-plan.md
**Execution Mode**: full-auto

## Git Status

- **Current Branch**: main
- **Uncommitted Changes**: 3 files (unrelated to this implementation)
  - Modified: docs/2025_12_04/test-planning/home-page-feature-bobblehead/00-test-planning-index.md
  - Untracked: docs/2025_12_04/test-planning/home-page-feature-bobblehead/04-test-plan.md
  - Untracked: docs/2025_12_04/test-plans/home-featured-bobblehead-e2e-test-plan.md

## Parsed Plan Summary

- **Feature**: Collection Dashboard Bobblehead Grid
- **Total Tests Planned**: 133-163 tests
- **Complexity Level**: High
- **Risk Assessment**: Critical - Core collection dashboard feature

### Test Breakdown

- **Unit Tests**: 20-25 tests (URL parsers, pure utilities)
- **Component Tests**: 81-95 tests (UI components, interactions, accessibility)
- **Integration Tests**: 32-43 tests (Query layer, facade, server actions)

### Critical Risk Areas

1. BobbleheadGridDisplay - Complex state orchestration with 11+ state variables
2. BobbleheadCard - Selection mode, hover cards, accessibility, condition variants
3. BobbleheadsDashboardQuery - Complex subqueries for stats aggregation
4. Server Actions - Batch operations (delete, feature), permission checks
5. Pagination - Page number calculation logic with ellipsis handling

## Prerequisites Validation

### Existing Fixtures (Available)

- `tests/fixtures/bobblehead.factory.ts` - createTestBobblehead(), createTestBobbleheads(), createTestFeaturedBobblehead()
- `tests/fixtures/collection.factory.ts` - createTestCollection()
- `tests/fixtures/user.factory.ts` - createTestUser()

### Existing Mocks (Available)

- `tests/mocks/data/bobbleheads.mock.ts` - mockBobblehead, createMockBobblehead(), createMockBobbleheads()
- MSW handlers available

### Test Infrastructure (Available)

- `tests/setup/test-db.ts` - Testcontainers database setup
- `tests/setup/mock-environment.ts` - Environment variable mocking
- `tests/setup/vitest.setup.ts` - Vitest configuration
- `tests/setup/msw.setup.ts` - MSW configuration

### New Infrastructure Needed (To Be Created)

1. `tests/fixtures/bobblehead-grid.factory.ts` - Mock dashboard record factory
2. `tests/mocks/hooks/use-user-preferences.mock.ts` - User preferences hook mock
3. `tests/mocks/hooks/use-server-action.mock.ts` - Server action hook mock
4. `tests/mocks/router.mock.ts` - Next.js router mock
5. `tests/mocks/nuqs.mock.ts` - nuqs URL state mock
6. Extended `tests/setup/mock-environment.ts` - Component test environment setup

## Implementation Plan

### Phase 1: Test Infrastructure Setup (3 steps)

- Step 1.1: Create bobblehead grid factory
- Step 1.2: Create hook mocks
- Step 1.3: Extend mock environment setup

### Phase 2: Unit Tests (2 steps)

- Step 2.1: URL parser tests (route-type.ts)
- Step 2.2: Pagination helper tests (getPageNumbers)

### Phase 3: Component Tests (6 steps)

- Step 3.1: BobbleheadGrid component tests
- Step 3.2: BulkActionsBar component tests
- Step 3.3: BobbleheadPagination component tests
- Step 3.4: Toolbar component tests
- Step 3.5: BobbleheadCard component tests
- Step 3.6: BobbleheadGridDisplay component tests

### Phase 4: Integration Tests (3 steps)

- Step 4.1: BobbleheadsDashboardQuery integration tests
- Step 4.2: BobbleheadsDashboardFacade integration tests
- Step 4.3: Bobblehead server actions integration tests

## Checkpoint

Pre-checks complete. Ready to proceed with implementation.
