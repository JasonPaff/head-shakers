# Step 2: File Discovery

**Started**: 2025-11-24T00:00:02Z
**Completed**: 2025-11-24T00:00:03Z
**Status**: Success

## Input: Refined Feature Request

The admin reports table should include a dedicated column that displays a dynamic link to the reported content, allowing administrators to quickly navigate to and review the offending item. This column should use an appropriate Lucide React icon to indicate it's clickable. The link should be generated using the $path utility from next-typesafe-url to ensure type-safe routing to the correct content page based on the report's content type (bobblehead, collection, comment, user profile, etc.).

## Discovery Statistics

- Directories explored: 8
- Candidate files examined: 28
- Highly relevant files: 5
- Supporting files: 10

## Discovered Files by Priority

### Critical (Must Modify)

| File                                                       | Relevance                             | Action |
| ---------------------------------------------------------- | ------------------------------------- | ------ |
| `src/components/admin/reports/reports-table.tsx`           | Main table component - add new column | MODIFY |
| `src/lib/queries/content-reports/content-reports.query.ts` | Query needs to return slug info       | MODIFY |

### High Priority (Understanding)

| File                                                                                         | Relevance                           | Action          |
| -------------------------------------------------------------------------------------------- | ----------------------------------- | --------------- |
| `src/lib/validations/moderation.validation.ts`                                               | SelectContentReport type definition | POSSIBLY MODIFY |
| `src/lib/db/schema/moderation.schema.ts`                                                     | Schema with targetId/targetType     | REFERENCE       |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/route-type.ts`                      | Bobblehead route params             | REFERENCE       |
| `src/app/(app)/collections/[collectionSlug]/(collection)/route-type.ts`                      | Collection route params             | REFERENCE       |
| `src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/route-type.ts` | Subcollection route params          | REFERENCE       |
| `src/app/(app)/users/[userId]/route-type.ts`                                                 | User profile route params           | REFERENCE       |

### Medium Priority (Reference)

| File                                                        | Relevance                                         | Action          |
| ----------------------------------------------------------- | ------------------------------------------------- | --------------- |
| `src/components/admin/analytics/trending-content-table.tsx` | **KEY PATTERN** - getContentLink() implementation | REFERENCE       |
| `src/components/admin/reports/admin-reports-client.tsx`     | Parent component                                  | POSSIBLY MODIFY |
| `src/components/admin/reports/report-detail-dialog.tsx`     | Could add link here too                           | POSSIBLY MODIFY |
| `src/app/(app)/admin/reports/page.tsx`                      | Server component                                  | POSSIBLY MODIFY |
| `src/lib/facades/content-reports/content-reports.facade.ts` | Business logic layer                              | POSSIBLY MODIFY |

### Low Priority (Context)

| File                                                  | Relevance               | Action    |
| ----------------------------------------------------- | ----------------------- | --------- |
| `src/lib/queries/bobbleheads/bobbleheads-query.ts`    | Query pattern reference | REFERENCE |
| `src/lib/queries/collections/collections.query.ts`    | Query pattern reference | REFERENCE |
| `src/lib/queries/collections/subcollections.query.ts` | Query pattern reference | REFERENCE |
| `src/lib/db/schema/bobbleheads.schema.ts`             | Slug field reference    | REFERENCE |
| `src/lib/db/schema/collections.schema.ts`             | Slug field reference    | REFERENCE |

## Key Pattern Discovered

**`trending-content-table.tsx` lines 73-91** provides exact implementation pattern:

```typescript
const getContentLink = (item?: TrendingContentItem) => {
  if (!item) return '#';
  switch (item.targetType) {
    case 'bobblehead':
      return $path({
        route: '/bobbleheads/[bobbleheadSlug]',
        routeParams: { bobbleheadSlug: item.targetSlug },
      });
    case 'collection':
      return $path({
        route: '/collections/[collectionSlug]',
        routeParams: { collectionSlug: item.targetSlug },
      });
    case 'user':
      return $path({ route: '/users/[userId]', routeParams: { userId: item.targetId } });
    default:
      return '#';
  }
};
```

## Architecture Insights

1. **Route Structure**:
   - Bobbleheads: `/bobbleheads/[bobbleheadSlug]` - needs slug
   - Collections: `/collections/[collectionSlug]` - needs slug
   - Subcollections: `/collections/[collectionSlug]/subcollection/[subcollectionSlug]` - needs BOTH slugs
   - Users: `/users/[userId]` - needs userId (direct from targetId)

2. **Data Gap**: Current `SelectContentReport` only has `targetId` and `targetType` - no slug info

3. **Icon Pattern**: Project uses Lucide React - `ExternalLinkIcon` already used in similar table

4. **Special Cases**:
   - Subcollections need parent collection slug (JOIN required)
   - Comments have no direct route (link to parent content or disable)
   - Deleted content should show disabled link with tooltip

## Validation Results

- **Minimum Files Check**: ✅ 5 critical/high files discovered (exceeds minimum of 3)
- **File Existence**: ✅ All paths validated
- **Coverage**: ✅ All architectural layers covered (schema, queries, facades, components, pages)
