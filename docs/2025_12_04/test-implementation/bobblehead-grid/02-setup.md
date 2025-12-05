# Setup and Routing

**Timestamp**: 2025-12-04
**Duration**: In progress

## Extracted Steps Summary

14 steps identified across 4 phases:
- **Phase 1**: 3 infrastructure steps (factories, mocks, setup utilities)
- **Phase 2**: 2 unit test steps (URL parsers, pagination helpers)
- **Phase 3**: 6 component test steps (grid, bulk actions, pagination, toolbar, card, display)
- **Phase 4**: 3 integration test steps (query, facade, server actions)

## Step Routing Table

| Step | Description | Test Type | Specialist Agent |
|------|-------------|-----------|------------------|
| 1.1 | Create bobblehead grid factory | infrastructure | test-infrastructure-specialist |
| 1.2 | Create hook mocks | infrastructure | test-infrastructure-specialist |
| 1.3 | Extend mock environment setup | infrastructure | test-infrastructure-specialist |
| 2.1 | URL parser tests (route-type.ts) | unit | unit-test-specialist |
| 2.2 | Pagination helper tests | unit | unit-test-specialist |
| 3.1 | BobbleheadGrid component tests | component | component-test-specialist |
| 3.2 | BulkActionsBar component tests | component | component-test-specialist |
| 3.3 | BobbleheadPagination component tests | component | component-test-specialist |
| 3.4 | Toolbar component tests | component | component-test-specialist |
| 3.5 | BobbleheadCard component tests | component | component-test-specialist |
| 3.6 | BobbleheadGridDisplay component tests | component | component-test-specialist |
| 4.1 | BobbleheadsDashboardQuery integration tests | integration | integration-test-specialist |
| 4.2 | BobbleheadsDashboardFacade integration tests | integration | integration-test-specialist |
| 4.3 | Bobblehead server actions integration tests | integration | integration-test-specialist |

## Step Dependencies

1. Steps 1.1-1.3 are prerequisites for all other steps
2. Step 2.2 requires extracting `getPageNumbers` function or testing inline
3. Steps 3.1-3.6 require infrastructure from Phase 1
4. Steps 4.1-4.3 require test database setup

## Todo List

15 items created:
- 14 implementation steps
- 1 test validation step

## Checkpoint

Setup complete. Beginning implementation with Step 1.1.
