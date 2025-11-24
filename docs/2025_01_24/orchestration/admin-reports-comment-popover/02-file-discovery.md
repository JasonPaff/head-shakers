# Step 2: File Discovery

## Metadata

- **Started**: 2025-01-24T00:00:02Z
- **Completed**: 2025-01-24T00:00:03Z
- **Status**: Success

## Input: Refined Feature Request

On the admin report pages, the reports table currently includes a "View Content" column that displays links to reported content; however, this column cannot link to comments, so it uses a disabled icon instead. Since direct linking to comments isn't feasible within the current implementation, the disabled icon should be replaced with a different icon (such as an eye or message icon from Lucide React) that triggers a Radix UI popover component. When clicked, this popover should display the full text of the reported comment in a modal-like overlay, allowing admins to review the comment content directly from the reports table without needing to navigate away.

## Agent Prompt

```
FEATURE REQUEST:
[Refined feature request above]

PROJECT: Head Shakers - Bobblehead Collection Platform

TASK: Identify ALL files relevant to implementing this admin reports comment popover feature.

Search focus areas:
1. Admin reports pages and components (src/app/(app)/admin/reports/)
2. Reports table column definitions
3. Existing popover components in src/components/ui/
4. Report-related queries and data types
5. Comment data structures and queries
```

## Discovered Files

### Critical Priority (Must Modify)

| File Path                                                  | Priority     | Relevance                                                                      | Action         |
| ---------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------ | -------------- |
| `src/components/admin/reports/reports-table.tsx`           | **Critical** | Contains "View Content" column with disabled icon for comments (lines 268-304) | **Modify**     |
| `src/components/ui/popover.tsx`                            | **Critical** | Existing Radix UI popover component to use                                     | Reference      |
| `src/lib/queries/content-reports/content-reports.query.ts` | **High**     | Query needs modification to JOIN comment content                               | **Modify**     |
| `src/lib/validations/moderation.validation.ts`             | **High**     | Type definition may need `commentContent` field                                | **May Modify** |

### Medium Priority (Supporting)

| File Path                                                   | Priority | Relevance                                  | Action    |
| ----------------------------------------------------------- | -------- | ------------------------------------------ | --------- |
| `src/lib/facades/content-reports/content-reports.facade.ts` | Medium   | Facade coordinating report data            | Review    |
| `src/components/admin/reports/admin-reports-client.tsx`     | Medium   | Client wrapper for reports table           | Review    |
| `src/app/(app)/admin/reports/page.tsx`                      | Medium   | Server component fetching reports          | Review    |
| `src/lib/queries/social/social.query.ts`                    | Medium   | Has `getCommentByIdAsync` for reference    | Reference |
| `src/lib/db/schema/social.schema.ts`                        | Medium   | Comments table schema with `content` field | Reference |
| `src/lib/db/schema/moderation.schema.ts`                    | Medium   | ContentReports table schema                | Reference |

### Low Priority (Reference)

| File Path                                               | Priority | Relevance                         | Action    |
| ------------------------------------------------------- | -------- | --------------------------------- | --------- |
| `src/components/admin/reports/report-detail-dialog.tsx` | Low      | Shows report detail patterns      | Reference |
| `src/components/admin/reports/report-filters.tsx`       | Low      | Shows popover usage patterns      | Reference |
| `src/components/ui/button.tsx`                          | Low      | Button component                  | Reference |
| `src/components/ui/tooltip.tsx`                         | Low      | Currently used for disabled state | Reference |
| `src/lib/validations/comment.validation.ts`             | Low      | Comment data types                | Reference |

## Architecture Insights

### Data Flow

```
page.tsx (Server) -> ContentReportsFacade -> ContentReportsQuery -> Database
                                                    |
                                                    v
AdminReportsClient (Client) <- ReportsTable (Client)
```

### Current Comment Handling

- In `reports-table.tsx`, comments detected via `targetType === 'comment'`
- Link is disabled with tooltip "Comments cannot be viewed directly"

### Existing Patterns

- Popover already used in `report-filters.tsx` for date pickers
- Query already JOINs to comments table to check existence (can extend to get content)

## Discovery Statistics

- **Directories Explored**: 12+
- **Files Examined**: 25+
- **Relevant Files Found**: 15
- **Files Needing Modification**: 2-4

## Validation Results

- **Minimum Files Check**: PASS (15 files discovered, minimum 3 required)
- **File Existence Check**: PASS (all paths validated)
- **Coverage Check**: PASS (covers schema, queries, components, pages)
