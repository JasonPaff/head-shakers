# Content Reports Table - Analysis & Testing Guide

## Table Structure

### Table: `content_reports`

Location: `src/lib/db/schema/moderation.schema.ts`

```sql
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT random_uuid(),
  created_at TIMESTAMP DEFAULT now(),
  description VARCHAR(1000),
  moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  moderator_notes VARCHAR(1000),
  reason content_report_reason NOT NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  resolved_at TIMESTAMP,
  status content_report_status DEFAULT 'pending' NOT NULL,
  target_id UUID NOT NULL,
  target_type content_report_target_type NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);
```

---

## Enums

### content_report_reason

Available reasons for reporting:

- `offensive_content` - Content is offensive or inappropriate
- `spam` - Content is spam or misleading
- `copyright_violation` - Intellectual property violation
- `misinformation` - False or misleading information
- `impersonation` - Impersonation of another user
- `harassment` - Harassment or threatening content
- `inappropriate_content` - Other inappropriate content
- `low_quality` - Low quality content

### content_report_status

Report lifecycle states:

- `pending` - Initial state, awaiting moderator review (DEFAULT)
- `reviewed` - Moderator has reviewed but not closed
- `resolved` - Action was taken (content removed/user warned)
- `dismissed` - No violation found

### content_report_target_type

Types of content that can be reported:

- `bobblehead` - Individual bobblehead item
- `collection` - User collection
- `subcollection` - Subcollection within a collection
- `comment` - User comment on content
- `user` - User profile

---

## Key Relationships

### Foreign Keys

1. **reporter_id** (NOT NULL) → users(id) [CASCADE DELETE]
   - User who submitted the report
   - If reporter is deleted, report is deleted

2. **moderator_id** (NULLABLE) → users(id) [SET NULL]
   - Admin/moderator who reviewed the report
   - Can be NULL if not yet assigned
   - If moderator is deleted, report remains with NULL moderator

### Polymorphic Relationship

- `targetType` + `targetId` together identify the reported content
- Not a direct foreign key (supports multiple content types)

---

## Indexes

```sql
-- Single column indexes
content_reports_created_at_idx ON (created_at)
content_reports_moderator_id_idx ON (moderator_id)
content_reports_reason_idx ON (reason)
content_reports_reporter_id_idx ON (reporter_id)
content_reports_status_idx ON (status)

-- Composite indexes for common queries
content_reports_reporter_status_idx ON (reporter_id, status)
content_reports_status_created_idx ON (status, created_at)
content_reports_target_idx ON (target_type, target_id)
```

### Index Usage

- **Filtering by status**: Gets pending/reviewed/resolved reports quickly
- **Moderator queue**: Filters by status and date (status_created_idx)
- **Target lookup**: Finds all reports for a specific content item
- **Reporter history**: Gets all reports from a specific user

---

## Admin Reports Query

### Main Query Method

**Class**: `ContentReportsQuery` (extends `BaseQuery`)
**File**: `src/lib/queries/content-reports/content-reports.query.ts`
**Method**: `getAllReportsWithSlugsForAdminAsync`

### What the Query Does

1. Selects all content_reports fields
2. LEFT JOINs related content tables:
   - bobbleheads (for bobblehead reports)
   - collections (for collection reports)
   - sub_collections (for subcollection reports)
   - comments (for comment reports)
3. Computes derived fields:
   - `contentExists`: Whether reported content still exists
   - `targetSlug`: URL-friendly identifier for content
   - `parentCollectionSlug`: For subcollections (for routing)
   - `commentContent`: The actual comment text (if comment report)
4. Applies filters and pagination

### Filter Options

```typescript
type AdminReportsFilterOptions = {
  limit?: number;
  offset?: number;
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed' | Array<Status>;
  targetType?: 'bobblehead' | 'collection' | 'subcollection' | 'comment' | Array<Type>;
  reason?: ContentReportReason | Array<ContentReportReason>;
  reporterId?: string;
  moderatorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
};
```

---

## Admin Reports Page Features

### Location

`src/app/(app)/admin/reports/page.tsx`

### Display Components

1. **Stats Cards** - Top of page showing counts:
   - Total Reports
   - Pending (awaiting review)
   - Reviewed (seen but not closed)
   - Resolved (action taken)

2. **Filter Section** - `ReportFilters` component
   - Status filter (multi-select)
   - Target Type filter
   - Reason filter
   - Date range picker

3. **Data Table** - `ReportsTable` component
   - Columns: Reason, Status, Content Type, View, Submitted Date, Content ID, Reporter ID
   - Sorting: Click headers to sort
   - Pagination: 10, 25, 50, 100 rows per page
   - Bulk Actions: Mark multiple reports with same status
   - Row Actions: Each row has menu for individual actions

4. **Detail Dialog** - `ReportDetailDialog` component
   - Full report information
   - Reporter and moderator details
   - Moderator notes field
   - Status change action

### User Actions

1. **Mark as Reviewed** - Indicates moderator has seen it
2. **Mark as Resolved** - Action was taken, shows confirmation
3. **Dismiss Report** - No violation found, shows confirmation
4. **View Details** - Opens detail dialog
5. **View Content** - Link to reported content (if it still exists)
   - For comments: Popup showing comment text
   - For other types: Direct link to content
   - Disabled if content no longer exists

---

## Current Data Status

### Expected Usage

Based on the code structure and schema, the application is ready to:

- Accept user reports via `reportReasonDialog`
- Store reports with complete metadata
- Admin moderators can review and manage reports
- Generate statistics from report data

### Testing the Table

To verify content_reports has data:

```typescript
// Using the existing query
const { reports, stats } = await ContentReportsFacade.getAllReportsWithSlugsForAdminAsync(
  {}, // no filters
  userId, // current user ID for context
);

console.log('Total reports:', stats.total);
console.log('Breakdown:', {
  pending: stats.pending,
  reviewed: stats.reviewed,
  resolved: stats.resolved,
  dismissed: stats.dismissed,
});
console.log('Sample report:', reports[0]);
```

---

## Field Descriptions

| Field           | Type          | Required | Description                 |
| --------------- | ------------- | -------- | --------------------------- |
| id              | UUID          | Yes      | Unique report identifier    |
| created_at      | TIMESTAMP     | Yes      | When report was submitted   |
| updated_at      | TIMESTAMP     | Yes      | Last update timestamp       |
| reporter_id     | UUID          | Yes      | Who submitted the report    |
| reason          | enum          | Yes      | Why content was reported    |
| description     | VARCHAR(1000) | No       | Reporter's explanation      |
| target_type     | enum          | Yes      | Type of reported content    |
| target_id       | UUID          | Yes      | ID of reported content      |
| status          | enum          | Yes      | Current review status       |
| moderator_id    | UUID          | No       | Admin who reviewed (if any) |
| moderator_notes | VARCHAR(1000) | No       | Admin's notes               |
| resolved_at     | TIMESTAMP     | No       | When report was closed      |

---

## Data Insertion Points

### Creating Reports

**Location**: Server Action
`src/lib/actions/moderation/content-reports.actions.ts`

**Flow**:

1. User sees report button on content
2. User fills `report_reason_dialog` with reason and description
3. Server action validates and inserts into content_reports
4. Report starts in 'pending' status

### Updating Reports

**Location**: Server Action
`src/lib/actions/admin/admin-content-reports.actions.ts`

**Methods**:

- `updateReportStatusAction` - Change single report status
- `bulkUpdateReportsAction` - Change multiple reports at once

**Operations**:

1. Set moderator_id and moderator_notes
2. Change status
3. Set resolved_at if status is 'resolved' or 'dismissed'

---

## Common Admin Workflows

### Review Pending Reports

```
Filter: status = 'pending'
Action: Click "View Details" -> Change status to "Reviewed"
```

### Close Resolved Cases

```
Filter: status = 'resolved'
Action: Confirm resolution is documented in moderator_notes
```

### Generate Report Statistics

```
Group by status
Count records in each group
Display in stats cards at top of page
```

### Find Content Issues

```
Filter by: targetType = 'bobblehead' or 'collection'
Filter by: reason = 'offensive_content' or 'spam'
View content by clicking link
Delete or flag content as needed
```

---

## Testing Checklist

- [ ] Create test reports via UI or API
- [ ] Verify reports appear in admin panel
- [ ] Test filtering by status, type, reason
- [ ] Test pagination (10, 25, 50, 100 rows)
- [ ] Test sorting by columns
- [ ] Test bulk actions (select multiple, apply status)
- [ ] Test detail view dialog
- [ ] Test status changes (mark reviewed, resolved, dismissed)
- [ ] Verify stats cards update correctly
- [ ] Test view content links (existing vs deleted content)
- [ ] Test date range filtering
- [ ] Verify moderator notes are saved
- [ ] Check that resolved_at is set when closing report
