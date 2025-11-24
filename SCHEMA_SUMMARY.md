# Head Shakers Database Schema Summary

## Overview Completed

I've created comprehensive documentation about the head-shakers database schema with special focus on the `content_reports` table used by the Admin Reports page.

---

## Documentation Created

All documentation is located in: `docs/2025_11_24/database/`

### 1. **README.md** (START HERE)

Quick navigation guide to all documentation with overview of each file.

### 2. **database-schema-overview.md** (Main Reference)

Complete database schema with all 24 tables:

- User Management (7 tables)
- Collections & Content (5 tables)
- Social Features (4 tables)
- Moderation & Reports (1 table)
- Featured Content & System (4 tables)
- Analytics (2 tables)
- Launch (1 table)

### 3. **content-reports-analysis.md** (Admin Reports Deep Dive)

Detailed analysis of content_reports table including:

- Table structure and all fields
- Enum definitions (status, reasons, target types)
- Relationships and constraints
- Admin Reports query mechanism
- Admin Reports page features
- Current data status and testing checklist

### 4. **quick-reference.md** (Fast Lookup)

Quick facts including:

- All 24 tables listed
- content_reports key information
- File locations for all related code
- Database commands reference
- Performance notes

### 5. **test-queries.md** (SQL Examples)

Ready-to-run SQL queries including:

- Basic count queries
- Sample data with joins
- Content-specific queries
- Analytics queries
- Admin reports equivalent queries
- TypeScript usage examples

### 6. **TABLE_LISTING.txt** (Visual Reference)

Complete table listing with:

- All 24 tables with descriptions
- Summary statistics
- Key relationships map
- Special features (polymorphic, JSONB, etc.)

---

## Key Findings - content_reports Table

### Current Status

The content_reports table exists and is fully implemented with:

- **Schema**: Complete with all necessary fields
- **Relationships**: Proper foreign keys to users table
- **Indexes**: 8 optimized indexes for common queries
- **Enums**: 3 enums for status, reason, and target type
- **Admin Panel**: Fully functional at `/admin/reports`

### Table Structure

```
id (UUID PK)
├── created_at, updated_at (timestamps)
├── reporter_id (FK → users, cascade)
├── moderator_id (FK → users, set null)
├── reason (enum: 8 types)
├── status (enum: pending/reviewed/resolved/dismissed)
├── target_type (enum: bobblehead/collection/subcollection/comment/user)
├── target_id (UUID, polymorphic)
├── description (varchar 1000)
├── moderator_notes (varchar 1000)
└── resolved_at (optional timestamp)
```

### Admin Reports Page Features

**URL**: `/admin/reports`

- Stats cards (total, pending, reviewed, resolved)
- Advanced filtering (status, type, reason, date range)
- Sortable data table (8 columns)
- Bulk actions support
- Detail view dialog
- Content linking with graceful handling of deleted content

---

## All Available Tables (24)

| Category              | Tables                                                                                                | Count  |
| --------------------- | ----------------------------------------------------------------------------------------------------- | ------ |
| User Management       | users, user_sessions, login_history, user_settings, notification_settings, user_blocks, user_activity | 7      |
| Collections & Content | collections, sub_collections, bobbleheads, bobblehead_photos, bobblehead_tags                         | 5      |
| Tags & Social         | tags, follows, likes, comments                                                                        | 4      |
| Moderation            | **content_reports**                                                                                   | 1      |
| Featured & System     | featured_content, platform_settings, notifications, content_metrics                                   | 4      |
| Analytics             | content_views, search_queries                                                                         | 2      |
| Launch                | launch_notifications                                                                                  | 1      |
| **TOTAL**             |                                                                                                       | **24** |

---

## To Test Admin Reports Functionality

### 1. Access the Admin Panel

- Navigate to: `http://localhost:3000/admin/reports`
- Requires: Admin or Moderator role

### 2. Run Database Queries

See `test-queries.md` for SQL examples:

```sql
-- Get count by status
SELECT status, COUNT(*) FROM content_reports GROUP BY status;

-- Get sample reports
SELECT cr.*, u.display_name as reporter_name
FROM content_reports cr
LEFT JOIN users u ON cr.reporter_id = u.id
LIMIT 5;
```

### 3. Test Page Features

- [ ] View stats cards
- [ ] Apply filters (status, type, reason, date)
- [ ] Sort columns
- [ ] Paginate (10, 25, 50, 100 per page)
- [ ] Select and bulk update rows
- [ ] View report details
- [ ] Link to reported content

---

## File Locations in Codebase

### Schema & Database

- Schema: `src/lib/db/schema/moderation.schema.ts`
- Query: `src/lib/queries/content-reports/content-reports.query.ts`
- Facade: `src/lib/facades/content-reports/content-reports.facade.ts`

### Actions & Mutations

- Create: `src/lib/actions/moderation/content-reports.actions.ts`
- Update: `src/lib/actions/admin/admin-content-reports.actions.ts`

### UI Components

- Client: `src/components/admin/reports/admin-reports-client.tsx`
- Table: `src/components/admin/reports/reports-table.tsx`
- Detail: `src/components/admin/reports/report-detail-dialog.tsx`
- Filters: `src/components/admin/reports/report-filters.tsx`

### Page

- Admin Page: `src/app/(app)/admin/reports/page.tsx`

---

## Performance Characteristics

### Indexes Used

```
content_reports_status_idx              - Fast status filtering
content_reports_created_at_idx          - Ordered queries
content_reports_target_idx              - Content linking
content_reports_reporter_status_idx     - Combined filters
content_reports_status_created_idx      - Moderator queue
+ 3 more for moderator_id, reason, reporter_id
```

### Query Pattern

- Admin page uses LEFT JOINs to handle deleted content gracefully
- Pagination with LIMIT/OFFSET (no full table scans)
- Composite indexes for multi-column filters
- All common filters are indexed

---

## Next Steps

1. **For Overview**: Read `docs/2025_11_24/database/README.md`

2. **For Details**:
   - Schema: `docs/2025_11_24/database/database-schema-overview.md`
   - Reports: `docs/2025_11_24/database/content-reports-analysis.md`

3. **For Testing**:
   - Use queries: `docs/2025_11_24/database/test-queries.md`
   - Check list: See content-reports-analysis.md

4. **For Quick Lookup**:
   - `docs/2025_11_24/database/quick-reference.md`
   - `docs/2025_11_24/database/TABLE_LISTING.txt`

---

## Summary

The content_reports table and Admin Reports page are fully functional and well-documented. The database contains 24 tables with comprehensive schema, proper relationships, and optimized indexes. All documentation for understanding the schema and testing the content_reports functionality has been created and is ready for use.

**Documentation Location**: `C:\Users\JasonPaff\dev\head-shakers\docs\2025_11_24\database\`
