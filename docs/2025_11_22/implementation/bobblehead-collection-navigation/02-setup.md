# Setup and Step-Type Detection

**Setup Timestamp**: 2025-11-22T08:17:00Z

## Extracted Steps Summary

12 implementation steps identified from plan:

1. **Extend Route Type Definition** - Add searchParams to route-type.ts
2. **Create Navigation Query Methods** - Add getAdjacentBobbleheadsInCollectionAsync to BobbleheadsQuery
3. **Create Navigation Types and Validation** - Define types and Zod schemas
4. **Implement Navigation Facade** - Add facade method with caching
5. **Create Client Navigation Component** - Build React client component with Nuqs
6. **Create Server Async Wrapper** - Async server component for data fetching
7. **Create Navigation Skeleton** - Loading skeleton component
8. **Integrate into Detail Page** - Add navigation to bobblehead page
9. **Update Collection View Links** - Include context in links
10. **Add Cache Invalidation** - Update cache service
11. **Add Navigation Action Tests** - Query and facade tests
12. **Add Component Integration Tests** - Component behavior tests

## Step-Type Detection and Routing

### Detection Results

| Step | Files | Pattern Matched | Specialist Assigned |
|------|-------|-----------------|---------------------|
| 1 | `src/app/.../route-type.ts` | .tsx/.jsx in src/app/ | react-component-specialist |
| 2 | `src/lib/queries/.../bobbleheads-query.ts` | src/lib/queries/ | database-specialist |
| 3 | `src/lib/types/...`, `src/lib/validations/...` | src/lib/validations/ | validation-specialist |
| 4 | `src/lib/facades/.../bobbleheads.facade.ts` | src/lib/facades/ | facade-specialist |
| 5 | `src/app/.../components/bobblehead-navigation.tsx` | .tsx in src/app/ | react-component-specialist |
| 6 | `src/app/.../components/async/...` | .tsx in src/app/ | react-component-specialist |
| 7 | `src/app/.../components/skeletons/...` | .tsx in src/app/ | react-component-specialist |
| 8 | `src/app/.../page.tsx` | .tsx in src/app/ | react-component-specialist |
| 9 | `src/app/.../collection-bobbleheads.tsx` | .tsx in src/app/ | react-component-specialist |
| 10 | `src/lib/services/cache-revalidation.service.ts` | facade-layer related | facade-specialist |
| 11 | `tests/lib/queries/...`, `tests/lib/facades/...` | tests/ | test-specialist |
| 12 | `tests/components/...` | tests/ | test-specialist |

## Todo List Created

16 items created:
- Phase 1: Pre-implementation (completed)
- Phase 2: Setup (in progress)
- Steps 1-12: Implementation steps (pending)
- Phase 4: Quality gates (pending)
- Phase 5: Summary (pending)

## Step Dependencies

- Step 2 depends on Step 1 (route types needed for query context)
- Step 4 depends on Steps 2 & 3 (query and types needed for facade)
- Step 5 depends on Steps 3 & 4 (types and facade needed for component)
- Step 6 depends on Steps 4 & 5 (facade and client component needed)
- Step 8 depends on Steps 6 & 7 (async wrapper and skeleton needed)
- Step 9 independent (can run in parallel with Step 8)
- Steps 11-12 depend on all previous implementation steps

## Files Per Step Summary

| Step | Files to Modify | Files to Create |
|------|-----------------|-----------------|
| 1 | 1 | 0 |
| 2 | 1 | 0 |
| 3 | 0 | 2 |
| 4 | 1 | 0 |
| 5 | 0 | 1 |
| 6 | 0 | 1 |
| 7 | 0 | 1 |
| 8 | 1 | 0 |
| 9 | 1 | 0 |
| 10 | 1 | 0 |
| 11 | 0 | 2 |
| 12 | 0 | 1 |

**Total**: 6 files to modify, 8 files to create

## Checkpoint

Setup complete. Beginning Step 1 implementation with react-component-specialist.
