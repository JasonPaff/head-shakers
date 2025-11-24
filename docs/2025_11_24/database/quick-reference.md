# Database Quick Reference

## All Tables in head-shakers Database

### User Management (7 tables)

- **users** - Core user accounts
- **user_sessions** - Active sessions
- **login_history** - Login audit trail
- **user_settings** - User preferences
- **notification_settings** - Notification preferences
- **user_blocks** - Blocked user relationships
- **user_activity** - Activity tracking

### Collections & Content (5 tables)

- **collections** - User bobblehead collections
- **sub_collections** - Collection sections
- **bobbleheads** - Individual bobblehead items
- **bobblehead_photos** - Item photos
- **bobblehead_tags** - Item tags

### Tags & Social (4 tables)

- **tags** - Reusable tags
- **follows** - User follow relationships
- **likes** - Content likes (polymorphic)
- **comments** - Content comments (polymorphic)

### Moderation & Reports (1 table)

- **content_reports** - User content reports (Admin Reports Page)

### Featured & System (4 tables)

- **featured_content** - Curated homepage content
- **platform_settings** - Global config
- **notifications** - User notifications
- **content_metrics** - Analytics metrics

### Analytics (2 tables)

- **content_views** - View tracking
- **search_queries** - Search analytics

### Launch (1 table)

- **launch_notifications** - Pre-launch email signups

**TOTAL: 24 tables**

---

## content_reports Table - Testing Details

### Location

Schema: `src/lib/db/schema/moderation.schema.ts`
Query: `src/lib/queries/content-reports/content-reports.query.ts`
Facade: `src/lib/facades/content-reports/content-reports.facade.ts`

### Current Record Count

To check: Query the database directly or use the admin reports page at `/admin/reports`

### Key Fields

```typescript
{
  id: UUID,                    // Unique identifier
  createdAt: Timestamp,        // When reported
  status: enum,                // 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reason: enum,                // Why reported
  targetType: enum,            // What was reported
  targetId: UUID,              // ID of reported content
  reporterId: UUID,            // User who reported
  description: string,         // Reporter's explanation
  moderatorId: UUID | null,    // Admin reviewer
  moderatorNotes: string,      // Admin notes
  resolvedAt: Timestamp | null // When closed
}
```

### Target Types Supported

- `bobblehead` - Bobblehead items
- `collection` - Collections
- `subcollection` - Subcollections
- `comment` - Comments on content
- `user` - User profiles

### Report Reasons

- offensive_content
- spam
- copyright_violation
- misinformation
- impersonation
- harassment
- inappropriate_content
- low_quality

### Admin Reports Page

**URL**: `/admin/reports`
**Components**:

- Stats cards (total, pending, reviewed, resolved)
- Filter panel (status, type, reason, date range)
- Data table (sortable, pageable, selectable)
- Row actions (view details, mark status)
- Bulk actions (apply status to multiple)

---

## How to Test Admin Reports Functionality

### 1. Create Test Reports

```bash
# Via UI: Hover over any content → Report button → Fill form → Submit
# Via Direct Insert: See testing guide below
```

### 2. Access Admin Panel

```
Route: /admin/reports
Requires: Moderator or Admin role
```

### 3. Verify Table Data

```typescript
// Check current data using facade
const { reports, stats } = await ContentReportsFacade.getAllReportsWithSlugsForAdminAsync(
  {}, // no filters - get all
  currentUser.id,
);

console.log(`Total: ${stats.total}, Pending: ${stats.pending}`);
```

### 4. Test Features

- [ ] Filter by status (pending/reviewed/resolved/dismissed)
- [ ] Filter by target type (bobblehead/collection/comment/etc)
- [ ] Filter by reason
- [ ] Date range filtering
- [ ] Pagination (10/25/50/100 per page)
- [ ] Column sorting
- [ ] Row selection and bulk actions
- [ ] View details dialog
- [ ] Link to reported content
- [ ] Status change with confirmation

---

## Database Commands Reference

### List All Tables

```bash
# Using Neon CLI or psql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

### Check content_reports Record Count

```sql
SELECT
  COUNT(*) as total,
  status,
  COUNT(*) as count
FROM content_reports
GROUP BY status
ORDER BY count DESC;
```

### Get Sample Reports

```sql
SELECT
  cr.id,
  cr.created_at,
  cr.status,
  cr.reason,
  cr.target_type,
  u.display_name as reporter_name
FROM content_reports cr
LEFT JOIN users u ON cr.reporter_id = u.id
ORDER BY cr.created_at DESC
LIMIT 5;
```

### Count by Target Type

```sql
SELECT
  target_type,
  COUNT(*) as count
FROM content_reports
GROUP BY target_type
ORDER BY count DESC;
```

---

## File Locations

| Purpose           | File                                                        |
| ----------------- | ----------------------------------------------------------- |
| Schema Definition | `src/lib/db/schema/moderation.schema.ts`                    |
| Query Logic       | `src/lib/queries/content-reports/content-reports.query.ts`  |
| Business Logic    | `src/lib/facades/content-reports/content-reports.facade.ts` |
| Server Actions    | `src/lib/actions/admin/admin-content-reports.actions.ts`    |
| Components        | `src/components/admin/reports/*`                            |
| Admin Page        | `src/app/(app)/admin/reports/page.tsx`                      |

---

## Key Component Files

### Admin Reports Client

**File**: `src/components/admin/reports/admin-reports-client.tsx`

- Handles report selection, status changes, confirmations
- Manages detail dialog and bulk actions

### Reports Table

**File**: `src/components/admin/reports/reports-table.tsx`

- Displays reports in TanStack React Table
- 8 columns: Actions, Summary, Status, Type, View, Submitted, ID, Reporter
- Supports sorting, pagination, row selection
- Handles bulk action bar

### Report Detail Dialog

**File**: `src/components/admin/reports/report-detail-dialog.tsx`

- Shows full report information
- Allows status change
- Input for moderator notes

### Report Filters

**File**: `src/components/admin/reports/report-filters.tsx`

- Multi-select filters
- Date range picker
- Status, type, reason checkboxes

---

## Performance Notes

### Indexes Used by Admin Reports Query

1. `content_reports_status_idx` - Filter by status
2. `content_reports_created_at_idx` - Order by created_at
3. `content_reports_target_idx` - Join to get content
4. `content_reports_reporter_id_idx` - Filter by reporter

### Query Optimization

- Uses LEFT JOINs (not INNER) to show reports even if content deleted
- Computed fields in SQL (CASE statements) for content info
- Pagination with LIMIT/OFFSET
- Ordered by created_at DESC for newest first

---

## Next Steps for Testing

1. **Access Admin Reports Page**
   - Navigate to `/admin/reports` with admin/moderator account
   - Should show stats and filter options

2. **Create Sample Data** (if needed)
   - Create user reports via content report buttons
   - Or insert test records directly

3. **Verify Table Functionality**
   - Apply filters
   - Sort columns
   - Paginate through results
   - View details
   - Change status

4. **Check Data Integrity**
   - Verify reports have correct reporter
   - Check status changes update properly
   - Confirm resolved_at is set when closing
   - Verify foreign key constraints
