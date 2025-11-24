# Step 2 Results: Update Database Query

**Timestamp**: 2025-01-24
**Duration**: ~2 minutes
**Specialist**: database-specialist

## Step Details

**What**: Modify the `getAllReportsWithSlugsForAdminAsync` query to include comment content in the SELECT clause
**Why**: Leverages existing JOIN on comments table to fetch data without additional database calls

## Results

**Status**: SUCCESS

**Skills Loaded**:

- database-schema: `.claude/skills/database-schema/references/Database-Schema-Conventions.md`
- drizzle-orm: `.claude/skills/drizzle-orm/references/Drizzle-ORM-Conventions.md`
- validation-schemas: `.claude/skills/validation-schemas/references/Validation-Schemas-Conventions.md`

**Files Modified**:

- `src/lib/queries/content-reports/content-reports.query.ts` - Added `commentContent` computed field to SELECT clause using CASE statement

**Conventions Applied**:

- Type-safe SQL expression with `sql<null | string>` for proper TypeScript inference
- CASE/WHEN pattern consistent with existing computed fields
- Alphabetical field placement in select object
- Snake_case database alias with `.as('comment_content')`

## Validation Results

- **Lint**: PASS
- **TypeScript**: PASS

## Success Criteria

- [x] Query returns `commentContent` field for all reports
- [x] Comment reports include the actual comment text
- [x] Non-comment reports return null for commentContent
- [x] All validation commands pass

## Notes

The query now efficiently fetches comment content using the existing LEFT JOIN - no additional database calls required.
