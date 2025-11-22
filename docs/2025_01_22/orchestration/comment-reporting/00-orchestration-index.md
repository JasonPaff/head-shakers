# Comment Reporting Feature - Orchestration Index

**Generated**: 2025-01-22
**Feature**: Comment Reporting (like collection/subcollection/bobblehead reporting)
**Status**: Completed

## Original Request

> As a user I would like to be able to report comments just like I can report collection/subcollections/bobbleheads

## Workflow Steps

| Step | Name | Status | Log File |
|------|------|--------|----------|
| 1 | Feature Refinement | Completed | [01-feature-refinement.md](./01-feature-refinement.md) |
| 2 | File Discovery | Completed | [02-file-discovery.md](./02-file-discovery.md) |
| 3 | Implementation Planning | Completed | [03-implementation-planning.md](./03-implementation-planning.md) |

## Output Files

- **Implementation Plan**: `docs/2025_01_22/plans/comment-reporting-implementation-plan.md`

## Summary

### Feature Refinement (Step 1)
- Original request (19 words) expanded to 327-word detailed specification
- Added technical context: next-safe-action, Zod schemas, Drizzle ORM, admin moderation
- Identified key requirements: duplicate prevention, self-report prevention, consistent UI

### File Discovery (Step 2)
- **Key Finding**: Database already supports 'comment' in TARGET_TYPE enum
- 35 relevant files discovered across 15+ directories
- 8 files require modification (all application layer, no DB migrations)
- Existing patterns identified for consistent implementation

### Implementation Planning (Step 3)
- 8-step implementation plan generated
- Estimated duration: 2-3 hours
- Complexity: Low | Risk: Low
- All steps include validation commands (`npm run lint:fix && npm run typecheck`)

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/validations/moderation.validation.ts` | Add 'comment' to 3 schema enums |
| `src/lib/queries/content-reports/content-reports.query.ts` | Add 'comment' case to validateTargetAsync |
| `src/lib/facades/content-reports/content-reports.facade.ts` | Update 'comment' case in validateReportTarget |
| `src/components/feature/content-reports/report-button.tsx` | Add 'comment' to ReportTargetType |
| `src/components/feature/comments/comment-item.tsx` | Add ReportButton for non-owners |
| `src/components/admin/reports/reports-table.tsx` | Add 'comment' badge styling |
| `src/components/admin/reports/report-detail-dialog.tsx` | Add 'comment' content type handling |
| `src/components/admin/reports/report-filters.tsx` | Add 'comment' filter option |

## Navigation

- [Step 1: Feature Refinement](./01-feature-refinement.md)
- [Step 2: File Discovery](./02-file-discovery.md)
- [Step 3: Implementation Planning](./03-implementation-planning.md)
- [Implementation Plan](../plans/comment-reporting-implementation-plan.md)
