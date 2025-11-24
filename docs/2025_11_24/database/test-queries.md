# Content Reports - Test Queries

These queries can be used to verify data in the content_reports table and understand the admin reports functionality.

## Basic Count Queries

### Total Records in content_reports

```sql
SELECT COUNT(*) as total_reports
FROM content_reports;
```

### Reports by Status

```sql
SELECT
  status,
  COUNT(*) as count
FROM content_reports
GROUP BY status
ORDER BY count DESC;
```

Expected output:

```
status      | count
------------|-------
pending     | X
reviewed    | Y
resolved    | Z
dismissed   | W
```

### Reports by Target Type

```sql
SELECT
  target_type,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage
FROM content_reports
GROUP BY target_type
ORDER BY count DESC;
```

### Reports by Reason

```sql
SELECT
  reason,
  COUNT(*) as count
FROM content_reports
GROUP BY reason
ORDER BY count DESC;
```

---

## Sample Reports Data

### Get Recent Reports with Reporter Info

```sql
SELECT
  cr.id,
  cr.created_at,
  cr.status,
  cr.reason,
  cr.target_type,
  u_reporter.display_name as reporter_name,
  u_reporter.email as reporter_email
FROM content_reports cr
LEFT JOIN users u_reporter ON cr.reporter_id = u_reporter.id
ORDER BY cr.created_at DESC
LIMIT 5;
```

### Get Pending Reports for Review

```sql
SELECT
  cr.id,
  cr.created_at,
  cr.reason,
  cr.target_type,
  cr.target_id,
  cr.description,
  u.display_name as reporter_name
FROM content_reports cr
LEFT JOIN users u ON cr.reporter_id = u.id
WHERE cr.status = 'pending'
ORDER BY cr.created_at ASC
LIMIT 20;
```

### Get Reports with Moderator Info

```sql
SELECT
  cr.id,
  cr.created_at,
  cr.status,
  cr.reason,
  u_reporter.display_name as reporter_name,
  u_moderator.display_name as moderator_name,
  cr.resolved_at,
  cr.moderator_notes
FROM content_reports cr
LEFT JOIN users u_reporter ON cr.reporter_id = u_reporter.id
LEFT JOIN users u_moderator ON cr.moderator_id = u_moderator.id
WHERE cr.status IN ('resolved', 'dismissed')
ORDER BY cr.resolved_at DESC;
```

---

## Content-Specific Queries

### Get Reports on Deleted Content

```sql
SELECT
  cr.id,
  cr.target_type,
  cr.target_id,
  cr.created_at,
  cr.status
FROM content_reports cr
LEFT JOIN bobbleheads b ON cr.target_type = 'bobblehead' AND cr.target_id = b.id
LEFT JOIN collections c ON cr.target_type = 'collection' AND cr.target_id = c.id
LEFT JOIN sub_collections sc ON cr.target_type = 'subcollection' AND cr.target_id = sc.id
LEFT JOIN comments cm ON cr.target_type = 'comment' AND cr.target_id = cm.id
WHERE
  (cr.target_type = 'bobblehead' AND b.id IS NULL)
  OR (cr.target_type = 'collection' AND c.id IS NULL)
  OR (cr.target_type = 'subcollection' AND sc.id IS NULL)
  OR (cr.target_type = 'comment' AND cm.id IS NULL);
```

### Get Bobblehead Reports with Content Info

```sql
SELECT
  cr.id,
  cr.created_at,
  cr.reason,
  cr.status,
  b.name as bobblehead_name,
  b.slug as bobblehead_slug,
  u.display_name as reporter_name
FROM content_reports cr
LEFT JOIN bobbleheads b ON cr.target_id = b.id
LEFT JOIN users u ON cr.reporter_id = u.id
WHERE cr.target_type = 'bobblehead'
ORDER BY cr.created_at DESC;
```

### Get Collection Reports with Content Info

```sql
SELECT
  cr.id,
  cr.created_at,
  cr.reason,
  cr.status,
  c.name as collection_name,
  c.slug as collection_slug,
  u.display_name as reporter_name
FROM content_reports cr
LEFT JOIN collections c ON cr.target_id = c.id
LEFT JOIN users u ON cr.reporter_id = u.id
WHERE cr.target_type = 'collection'
ORDER BY cr.created_at DESC;
```

### Get Comment Reports with Content

```sql
SELECT
  cr.id,
  cr.created_at,
  cr.reason,
  cr.status,
  cm.content as comment_text,
  cm.target_type as comment_on_type,
  u_reporter.display_name as reporter_name
FROM content_reports cr
LEFT JOIN comments cm ON cr.target_id = cm.id
LEFT JOIN users u_reporter ON cr.reporter_id = u_reporter.id
WHERE cr.target_type = 'comment'
ORDER BY cr.created_at DESC;
```

---

## Analytics & Stats Queries

### Reports by Status and Target Type

```sql
SELECT
  status,
  target_type,
  COUNT(*) as count
FROM content_reports
GROUP BY status, target_type
ORDER BY status, count DESC;
```

### Average Time to Resolution

```sql
SELECT
  ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)::numeric, 1) as avg_hours_to_resolve,
  MIN(resolved_at - created_at) as fastest_resolve,
  MAX(resolved_at - created_at) as slowest_resolve
FROM content_reports
WHERE resolved_at IS NOT NULL AND status IN ('resolved', 'dismissed');
```

### Most Reported Reasons

```sql
SELECT
  reason,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage
FROM content_reports
GROUP BY reason
ORDER BY count DESC;
```

### Reports by Day

```sql
SELECT
  DATE(created_at) as report_date,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
  COUNT(CASE WHEN status = 'dismissed' THEN 1 END) as dismissed
FROM content_reports
GROUP BY DATE(created_at)
ORDER BY report_date DESC;
```

### Moderator Activity

```sql
SELECT
  u.display_name as moderator_name,
  COUNT(cr.id) as reports_handled,
  COUNT(CASE WHEN cr.status = 'resolved' THEN 1 END) as resolved,
  COUNT(CASE WHEN cr.status = 'dismissed' THEN 1 END) as dismissed,
  ROUND(AVG(EXTRACT(EPOCH FROM (cr.resolved_at - cr.created_at)) / 3600)::numeric, 1) as avg_hours
FROM content_reports cr
LEFT JOIN users u ON cr.moderator_id = u.id
WHERE cr.status IN ('resolved', 'dismissed')
GROUP BY u.id, u.display_name
ORDER BY reports_handled DESC;
```

### Users with Most Reports

```sql
SELECT
  u.display_name,
  u.email,
  COUNT(cr.id) as reports_submitted,
  COUNT(CASE WHEN cr.status = 'resolved' THEN 1 END) as resulted_in_action
FROM content_reports cr
LEFT JOIN users u ON cr.reporter_id = u.id
GROUP BY u.id, u.display_name, u.email
HAVING COUNT(cr.id) > 1
ORDER BY reports_submitted DESC;
```

---

## Admin Reports Page Equivalent Queries

### What the Admin Page Shows by Default

```sql
-- Equivalent to: getAllReportsWithSlugsForAdminAsync() with no filters
SELECT
  cr.id,
  cr.created_at,
  cr.status,
  cr.reason,
  cr.target_type,
  cr.target_id,
  cr.description,
  cr.reporter_id,
  cr.moderator_id,
  cr.moderator_notes,
  cr.resolved_at,
  -- Computed fields for content existence
  CASE
    WHEN cr.target_type = 'bobblehead' THEN b.id IS NOT NULL
    WHEN cr.target_type = 'collection' THEN c.id IS NOT NULL
    WHEN cr.target_type = 'subcollection' THEN sc.id IS NOT NULL
    WHEN cr.target_type = 'comment' THEN cm.id IS NOT NULL
    ELSE false
  END as content_exists,
  -- Slugs for links
  CASE
    WHEN cr.target_type = 'bobblehead' THEN b.slug
    WHEN cr.target_type = 'collection' THEN c.slug
    WHEN cr.target_type = 'subcollection' THEN sc.slug
  END as target_slug,
  -- Parent collection slug for subcollections
  CASE
    WHEN cr.target_type = 'subcollection' THEN c_parent.slug
  END as parent_collection_slug,
  -- Comment content if comment report
  CASE
    WHEN cr.target_type = 'comment' THEN cm.content
  END as comment_content
FROM content_reports cr
LEFT JOIN bobbleheads b ON cr.target_type = 'bobblehead' AND cr.target_id = b.id
LEFT JOIN collections c ON cr.target_type = 'collection' AND cr.target_id = c.id
LEFT JOIN sub_collections sc ON cr.target_type = 'subcollection' AND cr.target_id = sc.id
LEFT JOIN collections c_parent ON sc.collection_id = c_parent.id
LEFT JOIN comments cm ON cr.target_type = 'comment' AND cr.target_id = cm.id
ORDER BY cr.created_at DESC
LIMIT 25
OFFSET 0;
```

### With Status Filter (Pending)

```sql
SELECT -- same as above
FROM content_reports cr
-- ... joins ...
WHERE cr.status = 'pending'
ORDER BY cr.created_at DESC
LIMIT 25;
```

### With Date Filter

```sql
SELECT -- same as above
FROM content_reports cr
-- ... joins ...
WHERE cr.created_at >= '2025-01-01'::timestamp
  AND cr.created_at < '2025-12-31'::timestamp
ORDER BY cr.created_at DESC
LIMIT 25;
```

---

## Test Data Verification Queries

### Verify Table Structure

```sql
-- Check all columns and types
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'content_reports'
ORDER BY ordinal_position;
```

### Verify Indexes

```sql
-- Check all indexes on table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'content_reports'
ORDER BY indexname;
```

### Verify Constraints

```sql
-- Check foreign keys and other constraints
SELECT
  constraint_type,
  constraint_name,
  column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu USING (table_name, constraint_name)
WHERE tc.table_name = 'content_reports';
```

---

## Usage Examples in TypeScript

### Using the Facade (Recommended)

```typescript
// From any server function or API route
import { ContentReportsFacade } from '@/lib/facades/content-reports/content-reports.facade';

// Get all reports
const { reports, stats } = await ContentReportsFacade.getAllReportsWithSlugsForAdminAsync(
  {}, // options
  userId, // current user
);

console.log(`Total: ${stats.total}`);
console.log(`Pending: ${stats.pending}`);
reports.forEach((report) => {
  console.log(`Report ${report.id}: ${report.status}`);
});
```

### With Filters

```typescript
const { reports, stats } = await ContentReportsFacade.getAllReportsWithSlugsForAdminAsync(
  {
    status: 'pending',
    limit: 25,
    offset: 0,
  },
  userId,
);
```

### Bulk Update

```typescript
const updated = await ContentReportsFacade.bulkUpdateReportsStatusAsync(
  ['report-id-1', 'report-id-2'],
  'resolved',
  moderatorId,
  moderatorNotes, // optional
);
```

---

## Notes for Testing

1. **Use Admin Account**: Must have admin or moderator role to see admin reports page
2. **Test Filters**: Try each filter independently and in combination
3. **Check Pagination**: Test with different page sizes
4. **Verify Joins**: Check that content links are correct and deleted content shows as unavailable
5. **Test Status Changes**: Verify resolved_at is set appropriately
6. **Bulk Operations**: Test selecting multiple reports and applying bulk actions
7. **Performance**: Check query performance with large datasets using EXPLAIN ANALYZE
