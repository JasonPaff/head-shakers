# Step 3: Coverage Gap Analysis

**Started**: 2025-12-04T00:03:00Z
**Completed**: 2025-12-04T00:04:30Z
**Status**: SUCCESS

## Input

Source files and test files from Step 2:

- 47 source files discovered
- 10 existing test files
- Test infrastructure (factories, mocks, handlers)

## Agent Prompt

```
Analyze test coverage gaps for the collection dashboard bobblehead grid feature.

**Scope Filter**: unit | component | integration (NOT e2e)

[Full source and test file lists provided]

For each source file:
1. Identify which test types exist (unit, component, integration)
2. Identify which test types are MISSING
3. List specific exports/functionality that lack coverage
4. Assign priority (Critical/High/Medium/Low)
5. Estimate number of tests needed

Focus ONLY on unit, component, and integration tests (not e2e).
```

## Coverage Matrix Summary

| Source File                       | Unit    | Component | Integration | Gap Status |
| --------------------------------- | ------- | --------- | ----------- | ---------- |
| `bobblehead-grid-display.tsx`     | N/A     | Missing   | Missing     | Critical   |
| `toolbar.tsx`                     | N/A     | Missing   | N/A         | High       |
| `bulk-actions-bar.tsx`            | N/A     | Missing   | N/A         | High       |
| `bobblehead-card.tsx`             | N/A     | Missing   | N/A         | High       |
| `bobblehead-pagination.tsx`       | N/A     | Missing   | N/A         | High       |
| `bobblehead-grid.tsx`             | N/A     | Missing   | N/A         | Medium     |
| `bobbleheads.actions.ts`          | Partial | N/A       | Missing     | High       |
| `bobbleheads-dashboard.facade.ts` | Missing | N/A       | Missing     | High       |
| `bobbleheads.facade.ts`           | Missing | N/A       | Exists      | Partial    |
| `bobbleheads-dashboard.query.ts`  | Missing | N/A       | Missing     | Critical   |
| `bobbleheads.validation.ts`       | Exists  | N/A       | N/A         | Complete   |
| `route-type.ts`                   | Missing | N/A       | N/A         | Low        |

## Coverage Statistics

- **Current Coverage**: ~16.7% (only validation schemas + partial facade tests)
- **Source Files Analyzed**: 17 (12 high priority + 5 medium priority)
- **Existing Tests Found**: 2 (validation schemas + facade)
- **Estimated New Tests Required**: 68-82 tests (high priority)
- **Total Potential Tests**: 93-122 across all types

## Gaps by Priority

### Critical Priority (Must Test)

1. **BobbleheadGridDisplay** - 18-22 tests
   - Complex state management (search, filters, pagination, selection)
   - Server action integration
   - Empty state handling
   - URL parameter synchronization

2. **BobbleheadCard** - 14-18 tests
   - Selection mode interactions
   - Hover card conditionals
   - Keyboard accessibility
   - Condition styling variants

3. **BobbleheadsDashboardQuery** - 12-16 tests
   - Complex filtering logic
   - Pagination accuracy
   - Permission checks
   - Subquery aggregations

### High Priority

4. **Toolbar** - 12-16 tests (Search, filters, sort)
5. **Pagination** - 10-13 tests (Page number logic and controls)
6. **BulkActionsBar** - 8-10 tests (Selection and bulk operations)
7. **Server Actions** - 16-22 tests (Delete, feature toggle operations)
8. **Dashboard Facade** - 8-12 tests (Caching and query orchestration)

### Medium Priority

9. **BobbleheadGrid** - 4-6 tests (Grid wrapper with density variants)

### Low Priority

10. **route-type.ts** - 4-6 tests (URL state parsers)
11. **Async components** - 2-4 tests (Integration with data fetching)

## Test Count Estimates by Type

| Test Type   | Count      | Key Files                                     |
| ----------- | ---------- | --------------------------------------------- |
| Unit        | 7-11       | route-type.ts, pagination helper              |
| Component   | 50-61      | Toolbar, Card, Pagination, Grid, Bulk Actions |
| Integration | 36-50      | Queries, Facades, Actions                     |
| **Total**   | **93-122** | All combined                                  |

**Focused Scope (High Priority Only)**: 68-82 tests

## Recommended Implementation Order

### Phase 1: Foundation (Unit Tests)

1. Route type params validation (4-6 tests)
2. Pagination helper (`getPageNumbers()`) (3-5 tests)

### Phase 2: Component Layer (Component Tests)

3. Bobblehead Card (14-18 tests)
4. Toolbar (12-16 tests)
5. Bulk Actions Bar (8-10 tests)
6. Pagination (10-13 tests)
7. Bobblehead Grid (4-6 tests)

### Phase 3: Business Logic (Integration Tests)

8. Dashboard Query Layer (12-16 tests)
9. Dashboard Facade (8-12 tests)
10. Server Actions (16-22 tests)

### Phase 4: Orchestration (Component Tests)

11. Bobblehead Grid Display (18-22 tests)

## Testing Infrastructure Status

**Ready to use**:

- Bobblehead factory for integration tests
- Mock data for component tests
- MSW handlers for API mocking
- Testcontainers PostgreSQL setup
- Vitest + Testing Library

## Validation Results

- All source files analyzed: YES
- Gaps categorized by priority: YES
- Test estimates provided: YES
- Scope filter applied (no E2E): YES
