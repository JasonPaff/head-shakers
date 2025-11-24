# Step 2: Enhance Content Reports Query with JOINs

**Timestamp**: 2025-11-24
**Specialist**: database-specialist
**Status**: SUCCESS

## Step Details

**What**: Create new query method with LEFT JOINs to fetch slug data for content linking
**Why**: The query must return slug data for generating type-safe links without additional API calls

## Skills Loaded

- database-schema: `.claude/skills/database-schema/references/Database-Schema-Conventions.md`
- drizzle-orm: `.claude/skills/drizzle-orm/references/Drizzle-ORM-Conventions.md`
- validation-schemas: `.claude/skills/validation-schemas/references/Validation-Schemas-Conventions.md`

## Files Modified

| File | Changes |
|------|---------|
| src/lib/queries/content-reports/content-reports.query.ts | Added `getAllReportsWithSlugsForAdminAsync` method with LEFT JOINs to bobbleheads, collections, and subcollections tables |

## Conventions Applied

- Extended `BaseQuery` class pattern
- Used `QueryContext` for database instance access
- Applied `this.getDbInstance(context)` for database access
- Used `this.applyPagination(options)` for pagination
- Used `this.executeWithRetry()` for resilience
- Method named with `Async` suffix
- Used `sql<type>` for type-safe SQL expressions
- Used CASE expressions for conditional slug selection
- Used LEFT JOINs with Drizzle ORM syntax

## Query Details

The new method includes:
- LEFT JOIN to `bobbleheads` table for bobblehead slugs
- LEFT JOIN to `collections` table for collection slugs
- LEFT JOIN to `subCollections` table for subcollection slugs
- LEFT JOIN from subcollections to collections (aliased as "parent_collection") for parent collection slug
- CASE expression to select appropriate slug based on targetType
- `contentExists` boolean based on whether joined content is NULL

## Validation Results

| Command | Result |
|---------|--------|
| npm run lint:fix | PASS |
| npm run typecheck | PASS |

## Success Criteria

- [x] New query method correctly fetches slug data for all target types
- [x] Subcollections correctly include parent collection slug
- [x] Query handles missing/deleted content gracefully (NULL slugs)
- [x] All validation commands pass

## Notes for Next Steps

- The method returns `SelectContentReportWithSlugs` type
- Comments have `targetSlug: null` (no direct route)
- Next steps update the table component to use this data
