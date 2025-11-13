# Setup and Initialization: One-Click Bookmark Feature

**Setup Start**: 2025-11-12T08:30:45Z
**Setup Complete**: 2025-11-12T08:31:00Z
**Duration**: 15 seconds

---

## Extracted Implementation Steps

**Total Steps**: 19
**Steps with React Files**: Steps 9, 10, 11 (will auto-invoke react-coding-conventions skill)
**Steps with Database Operations**: Steps 1, 2

### Step Summary

**Phase 1: Foundation (Steps 1-7)**
1. **Create Database Schema**: Define bookmarks table with Drizzle ORM
2. **Generate Migration**: Create and apply database migration
3. **Create Validation**: Define Zod schemas for bookmark operations
4. **Create Query Layer**: Implement BookmarksQuery class
5. **Create Facade Layer**: Implement BookmarksFacade business logic
6. **Update Constants**: Add bookmark-related constants
7. **Update Cache**: Add bookmark cache revalidation

**Phase 2: Server Actions & UI (Steps 8-10)**
8. **Create Server Action**: Implement toggleBookmarkAction
9. **Create Bookmark Hook**: Build useBookmark hook with optimistic updates (React)
10. **Create Bookmark Button**: Build BookmarkButton UI component (React)

**Phase 3: Integration (Steps 11-14)**
11. **Integrate Detail Page**: Add bookmark button to bobblehead detail page (React)
12. **Create Collection Page**: Build bookmarks collection page (React)
13. **Add Dashboard Tab**: Add bookmarks tab to navigation (React)
14. **Update Routes**: Generate type-safe routes

**Phase 4: Testing (Steps 15-19)**
15. **Query Tests**: Test BookmarksQuery class
16. **Facade Tests**: Test BookmarksFacade logic
17. **Action Tests**: Test toggleBookmarkAction
18. **Hook Tests**: Test useBookmark hook
19. **Component Tests**: Test BookmarkButton component

---

## Todo List Created

**Total Todos**: 23 items
- 2 phase todos (pre-checks, setup) - completed
- 19 step todos - pending
- 2 phase todos (quality gates, summary) - pending

**Initial Status**: All step todos marked as "pending", ready for sequential execution

---

## Step Metadata Prepared

**Files to Create** (16 total):
- 1 schema file (bookmarks.schema.ts)
- 1 validation file (bookmark.validation.ts)
- 1 query file (bookmarks.query.ts)
- 1 facade file (bookmarks.facade.ts)
- 1 action file (bookmarks.actions.ts)
- 1 hook file (use-bookmark.tsx)
- 1 component file (bookmark-button.tsx)
- 2 page files (bookmarks page + route-type)
- 5 test files (query, facade, action, hook, component)
- 1 migration file (auto-generated)

**Files to Modify** (17 total):
- 7 constant files (enums, defaults, action-names, operations, error-codes, error-messages, cache)
- 3 schema files (index.ts, relations.schema.ts, potentially bobbleheads/users schemas)
- 2 cache infrastructure files (cache-revalidation.service.ts, cache-tags.utils.ts)
- 3 bobblehead detail page files (page.tsx, bobblehead-header.tsx, bobblehead-header-async.tsx)
- 1 dashboard navigation file (dashboard-tabs.tsx)
- 1 auto-generated routes file ($path object)

---

## Step Dependencies Analysis

**Independent Steps** (can run in parallel in theory):
- Step 3 (validation schemas)
- Step 6 (constants updates)

**Dependent Steps** (require previous steps):
- Step 2 depends on Step 1 (migration needs schema)
- Step 4 depends on Step 1 (query needs schema)
- Step 5 depends on Steps 1, 4 (facade needs schema + query)
- Step 7 depends on Step 6 (cache needs constants)
- Step 8 depends on Steps 3, 5, 7 (action needs validation, facade, cache)
- Step 9 depends on Step 8 (hook needs action)
- Step 10 depends on Step 9 (button needs hook)
- Step 11 depends on Steps 4, 10 (integration needs query + button)
- Step 12 depends on Steps 4, 10 (collection page needs query + button)
- Step 13 depends on Step 12 (navigation needs page to exist)
- Step 14 depends on Steps 12, 13 (routes need pages to exist)
- Steps 15-19 depend on Steps 1-14 (tests need implementations)

**Execution Strategy**: Sequential execution respecting dependencies

---

## Files Mentioned Per Step

**Step 1 Files**:
- Create: `src/lib/db/schema/bookmarks.schema.ts`
- Modify: `src/lib/db/schema/index.ts`, `src/lib/db/schema/relations.schema.ts`

**Step 2 Files**:
- Create: Migration file (auto-generated path)

**Step 3 Files**:
- Create: `src/lib/validations/bookmark.validation.ts`

**Step 4 Files**:
- Create: `src/lib/queries/bookmarks/bookmarks.query.ts`

**Step 5 Files**:
- Create: `src/lib/facades/bookmarks/bookmarks.facade.ts`

**Step 6 Files**:
- Modify: `src/lib/constants/enums.ts`, `defaults.ts`, `action-names.ts`, `operations.ts`, `error-codes.ts`, `error-messages.ts`, `cache.ts`

**Step 7 Files**:
- Modify: `src/lib/services/cache-revalidation.service.ts`, `src/lib/utils/cache-tags.utils.ts`

**Step 8 Files**:
- Create: `src/lib/actions/bookmarks/bookmarks.actions.ts`

**Step 9 Files**:
- Create: `src/hooks/use-bookmark.tsx`

**Step 10 Files**:
- Create: `src/components/ui/bookmark-button.tsx`

**Step 11 Files**:
- Modify: `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/page.tsx`
- Modify: `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-header.tsx`
- Modify: `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/async/bobblehead-header-async.tsx`

**Step 12 Files**:
- Create: `src/app/(app)/dashboard/bookmarks/page.tsx`
- Create: `src/app/(app)/dashboard/bookmarks/route-type.ts`

**Step 13 Files**:
- Modify: `src/app/(app)/dashboard/collection/(collection)/components/dashboard-tabs.tsx`

**Step 14 Files**:
- Modify: Auto-generated $path object (via npm script)

**Steps 15-19 Files**:
- Create: 5 test files in `tests/` directory

---

## React File Detection

**Steps with React Files**: 9, 10, 11, 12, 13
- These steps will automatically invoke `react-coding-conventions` skill
- Ensures all React components follow project conventions
- Enforced before any code changes are made

---

## Validation Commands Per Step

**All Code Steps** (1, 3-13, 15-19):
```bash
npm run lint:fix && npm run typecheck
```

**Migration Step** (2):
```bash
npm run db:generate && npm run db:migrate
```

**Route Generation Step** (14):
```bash
npm run next-typesafe-url && npm run typecheck
```

**Test Steps** (15-19):
```bash
npm run lint:fix && npm run typecheck && npm run test [test-file-path]
```

---

## Setup Status

✓ Implementation index created (00-implementation-index.md)
✓ Pre-checks log saved (01-pre-checks.md)
✓ Setup log created (this file - 02-setup.md)
✓ 23 todos created and initialized
✓ Step metadata prepared for subagent delegation
✓ File paths extracted for context loading
✓ Dependencies mapped for execution order
✓ React file detection configured
✓ Validation commands identified per step

**Ready for Phase 3**: Step-by-Step Implementation via Subagents

---

**Checkpoint**: Setup complete at 2025-11-12T08:31:00Z
