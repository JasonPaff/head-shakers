# Step 2: Source & Test Discovery

**Started**: 2025-12-04
**Status**: Completed
**Duration**: ~60 seconds

## Input

Refined scope from Step 1: Collection sidebar components, data layer, and utilities

## Agent Prompt Sent

```
For the feature area: "Collection Dashboard Sidebar" at /dashboard/collection, discover:
1. Source Files in src/ related to this feature
2. Existing Tests in tests/ that test this functionality
Search patterns for sidebar components, facades, queries, actions, validations, and utilities.
```

## Source Files Discovered (41 files)

### Critical Priority - Core Sidebar Components

| File Path                                                                                        | Description                                                                 |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `src/app/(app)/dashboard/collection/(collection)/components/display/sidebar-display.tsx`         | Main client component orchestrating sidebar state, filtering, sorting, CRUD |
| `src/app/(app)/dashboard/collection/(collection)/components/async/sidebar-async.tsx`             | Server component fetching collections and preferences                       |
| `src/app/(app)/dashboard/collection/(collection)/components/sidebar/sidebar-header.tsx`          | Header with title and "New" button                                          |
| `src/app/(app)/dashboard/collection/(collection)/components/sidebar/sidebar-search.tsx`          | Search input, card style picker, sort dropdown, hover toggle                |
| `src/app/(app)/dashboard/collection/(collection)/components/sidebar/sidebar-collection-list.tsx` | Collection cards container                                                  |
| `src/app/(app)/dashboard/collection/(collection)/components/sidebar/sidebar-footer.tsx`          | Footer with collection count                                                |

### Critical Priority - Collection Card Variants

| File Path                                                                                                | Description                                      |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `src/app/(app)/dashboard/collection/(collection)/components/sidebar/cards/collection-card-compact.tsx`   | Compact card with thumbnail, name, stats         |
| `src/app/(app)/dashboard/collection/(collection)/components/sidebar/cards/collection-card-detailed.tsx`  | Detailed card with description, engagement stats |
| `src/app/(app)/dashboard/collection/(collection)/components/sidebar/cards/collection-card-cover.tsx`     | Cover image card with gradient overlay           |
| `src/app/(app)/dashboard/collection/(collection)/components/sidebar/cards/collection-card-hovercard.tsx` | Hover card preview content                       |

### Critical Priority - Data Layer

| File Path                                                     | Description                               |
| ------------------------------------------------------------- | ----------------------------------------- |
| `src/lib/facades/collections/collections-dashboard.facade.ts` | Business logic for dashboard operations   |
| `src/lib/queries/collections/collections-dashboard.query.ts`  | Database queries with stats aggregation   |
| `src/lib/facades/collections/collections.facade.ts`           | General collections CRUD logic            |
| `src/lib/queries/collections/collections.query.ts`            | General collection queries                |
| `src/lib/actions/collections/collections.actions.ts`          | Server actions for create, update, delete |
| `src/lib/validations/collections.validation.ts`               | Zod validation schemas                    |

### High Priority - Collection CRUD Dialogs

| File Path                                                                | Description                     |
| ------------------------------------------------------------------------ | ------------------------------- |
| `src/components/feature/collections/collection-upsert-dialog.tsx`        | Create/edit dialog              |
| `src/components/feature/collections/collection-form-fields.tsx`          | Form fields component           |
| `src/components/feature/collections/hooks/use-collection-upsert-form.ts` | Form state management hook      |
| `src/components/feature/collections/collection-delete.tsx`               | Delete button with confirmation |
| `src/components/ui/alert-dialogs/confirm-delete-alert-dialog.tsx`        | Reusable confirm dialog         |

### High Priority - Empty States

| File Path                                                                                             | Description                       |
| ----------------------------------------------------------------------------------------------------- | --------------------------------- |
| `src/app/(app)/dashboard/collection/(collection)/components/empty-states/no-collections.tsx`          | Empty state for no collections    |
| `src/app/(app)/dashboard/collection/(collection)/components/empty-states/no-filtered-collections.tsx` | Empty state for no search results |

### High Priority - Layout

| File Path                                                                                          | Description                              |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `src/app/(app)/dashboard/collection/(collection)/components/layout/collection-layout.tsx`          | Main layout with sidebar and content     |
| `src/app/(app)/dashboard/collection/(collection)/components/layout/collection-desktop-sidebar.tsx` | Desktop sidebar wrapper                  |
| `src/app/(app)/dashboard/collection/(collection)/components/layout/collection-mobile-header.tsx`   | Mobile header with drawer                |
| `src/app/(app)/dashboard/collection/(collection)/page.tsx`                                         | Dashboard page with auto-selection logic |

### Medium Priority - Utilities & Hooks

| File Path                           | Description                                       |
| ----------------------------------- | ------------------------------------------------- |
| `src/lib/utils/collection.utils.ts` | sortCollections utility function (9 sort options) |
| `src/utils/server-cookies.ts`       | getUserPreferences utility                        |
| `src/hooks/use-user-preferences.ts` | Client-side preferences hook                      |
| `src/hooks/use-toggle.ts`           | Toggle state hook                                 |
| `src/hooks/use-server-action.ts`    | Server action execution hook                      |

### Low Priority - Schema & Constants

| File Path                                                       | Description                          |
| --------------------------------------------------------------- | ------------------------------------ |
| `src/lib/db/schema/collections.schema.ts`                       | Drizzle schema for collections table |
| `src/lib/constants/defaults.ts`                                 | Default values                       |
| `src/lib/constants/schema-limits.ts`                            | Validation limits                    |
| `src/lib/constants/operations.ts`                               | Operation names                      |
| `src/lib/constants/error-messages.ts`                           | Error messages                       |
| `src/app/(app)/dashboard/collection/(collection)/route-type.ts` | Route type definitions               |

## Test Files Discovered (2 files)

### Unit Tests

| File Path                                                   | Coverage                                          |
| ----------------------------------------------------------- | ------------------------------------------------- |
| `tests/unit/lib/validations/collections.validation.test.ts` | deleteCollectionSchema, getCollectionBySlugSchema |

### Integration Tests

| File Path                                              | Coverage                          |
| ------------------------------------------------------ | --------------------------------- |
| `tests/integration/actions/collections.facade.test.ts` | CollectionsFacade CRUD operations |

### Component Tests

**None found for sidebar components**

## File Validation Results

- ✅ All file paths validated to exist
- ✅ 41 source files discovered
- ✅ 2 test files discovered
- ⚠️ Major gap: No component tests for sidebar

## Key Architecture Insights

1. **Server/Client Split**: Async server component fetches data, client component handles interactivity
2. **User Preferences**: Cookie-based persistence with useUserPreferences hook
3. **Three Card Variants**: Compact, Detailed, Cover with consistent API
4. **Hover Cards**: Optional preview toggled by preference
5. **Auto-selection**: Server-side logic selects first collection when none selected
6. **9 Sort Options**: name-asc/desc, count-asc/desc, value-asc/desc, likes-desc, views-desc, comments-desc
