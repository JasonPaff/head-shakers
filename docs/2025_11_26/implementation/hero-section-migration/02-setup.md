# Setup and Routing

**Timestamp**: 2025-11-26T18:13:00Z
**Duration**: ~1 minute

## Extracted Steps Summary

13 implementation steps identified from the plan.

## Step Routing Table

| Step | Title                                      | Primary Files                                              | Specialist                 | Skills                                                |
| ---- | ------------------------------------------ | ---------------------------------------------------------- | -------------------------- | ----------------------------------------------------- |
| 1    | Create Platform Statistics Facade          | src/lib/facades/platform/platform-stats.facade.ts          | facade-specialist          | facade-layer, caching, sentry-monitoring, drizzle-orm |
| 2    | Create Platform Statistics Query Methods   | src/lib/queries/bobbleheads/, src/lib/queries/collections/ | database-specialist        | database-schema, drizzle-orm, validation-schemas      |
| 3    | Create Hero Stats Async Component          | src/app/(app)/(home)/components/async/                     | react-component-specialist | react-coding-conventions, ui-components               |
| 4    | Create Hero Stats Skeleton Component       | src/app/(app)/(home)/components/skeletons/                 | react-component-specialist | react-coding-conventions, ui-components               |
| 5    | Extract and Adapt Badge Component Variants | src/components/ui/badge.tsx                                | react-component-specialist | react-coding-conventions, ui-components               |
| 6    | Create Hero Featured Bobblehead Showcase   | src/app/(app)/(home)/components/display/                   | react-component-specialist | react-coding-conventions, ui-components               |
| 7    | Create Hero Featured Bobblehead Async      | src/app/(app)/(home)/components/async/                     | react-component-specialist | react-coding-conventions, ui-components               |
| 8    | Create Hero Featured Bobblehead Skeleton   | src/app/(app)/(home)/components/skeletons/                 | react-component-specialist | react-coding-conventions, ui-components               |
| 9    | Create New Hero Section Component          | src/app/(app)/(home)/components/                           | react-component-specialist | react-coding-conventions, ui-components               |
| 10   | Integrate New Hero Section into Home Page  | src/app/(app)/(home)/page.tsx                              | react-component-specialist | react-coding-conventions, ui-components               |
| 11   | Update Badge Icon Support                  | src/components/ui/badge.tsx                                | react-component-specialist | react-coding-conventions, ui-components               |
| 12   | Create Cache Service Methods               | src/lib/services/cache.service.ts                          | facade-specialist          | facade-layer, caching                                 |
| 13   | Add Cache Revalidation                     | src/lib/services/cache-revalidation.service.ts             | facade-specialist          | facade-layer, caching                                 |

## Multi-Domain Steps

- **Step 1**: Primary facade, also involves queries and caching
- **Steps 5 & 11**: Same file (badge.tsx) - could be combined in practice

## Step Dependencies

- Steps 3, 7 depend on Step 1 (facade must exist)
- Step 2 depends on Step 1 (query methods needed by facade)
- Steps 6, 9 depend on Step 5 (badge variants needed)
- Step 9 depends on Steps 3, 4, 6, 7, 8 (components used by hero section)
- Step 10 depends on Step 9 (hero section component must exist)
- Step 12 depends on Step 1 (cache methods used by facade)
- Step 13 depends on Step 12 (revalidation uses cache tags)

## Todo List Created

15 items: 13 implementation steps + pre-checks + quality gates

## Setup Complete

Beginning implementation with Step 1.
