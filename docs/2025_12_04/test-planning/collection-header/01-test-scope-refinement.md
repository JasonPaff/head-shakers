# Step 1: Test Scope Refinement

**Started**: 2025-12-04T00:00:00Z
**Completed**: 2025-12-04T00:00:30Z
**Status**: Success

## Original Request

"the collection dashboards collection header at /dashboard/collection"

## Scope Filter

unit | component | integration

## Agent Prompt

```
Analyze this feature area for testing: "the collection dashboards collection header at /dashboard/collection" with scope limited to unit, component, and integration tests (no E2E).

Using the project context from CLAUDE.md (Head Shakers is a Next.js 16 bobblehead collection platform with React 19, Drizzle ORM, next-safe-action server actions, and TanStack Form), identify what specific functionality needs to be tested for the collection header component.

Consider:
- What source files are likely involved? (Look in src/app/(app)/dashboard/collection and src/components/feature/collection)
- What user interactions exist in a collection header? (viewing collection info, editing, actions)
- What data operations occur? (fetching collection data, displaying stats)
- What error scenarios should be covered? (loading states, missing data, permissions)

Output a SINGLE PARAGRAPH (200-400 words) describing the testable scope. Focus on WHAT needs testing, not HOW to test it.
```

## Agent Response

The collection dashboard header consists of two primary presentation layers: CollectionStickyHeader (C:\Users\jasonpaff\dev\head-shakers\src\components\feature\collection\collection-sticky-header.tsx) for mobile/tablet views showing compact collection title with action buttons, and CollectionHeaderCard (C:\Users\jasonpaff\dev\head-shakers\src\app\(app)\dashboard\collection\(collection)\components\main\collection-header-card.tsx) for desktop views displaying a comprehensive card with cover image, collection name, description, and detailed statistics. The testable functionality includes displaying collection metadata (name, description, cover image, slug), presenting aggregated statistics (bobblehead count, featured count, total monetary value via formatCurrency, like count, view count, comment count), and managing user interactions through action buttons. For owners, these interactions include editing collection details via CollectionUpsertDialog (opening/closing edit dialog, validating collection name uniqueness, updating collection properties like name/description/coverImageUrl/isPublic), deleting collections via ConfirmDeleteAlertDialog (opening confirmation dialog, executing deleteCollectionAction, navigating away on success), and sharing collections via CollectionShareMenu (copying links to clipboard, sharing to Twitter/Facebook social platforms). Non-owners can like collections via LikeCompactButton (toggling like state, updating like count optimistically) and report content via ReportButton. The data layer requires testing CollectionsDashboardFacade.getHeaderByCollectionSlugAsync which aggregates data from multiple sources using subqueries for bobblehead statistics, comments, likes, and views, with proper cache integration via CacheService.collections.dashboardHeader. Error scenarios must cover missing collection data (null/undefined handling), permission validation (ensuring userId-based access control), loading states during async operations, failed server actions (delete/update failures with proper error messages), navigation failures, and cache invalidation on mutations. Integration tests should verify the complete flow from CollectionHeaderAsync server component through CollectionHeaderDisplay client orchestrator to child components, ensuring proper state management with useQueryStates for URL synchronization and useServerAction for mutation handling with toast notifications.

## Refined Test Scope

### Components to Test

- **CollectionStickyHeader** - Mobile/tablet compact header
- **CollectionHeaderCard** - Desktop comprehensive header card
- **CollectionUpsertDialog** - Edit collection modal
- **ConfirmDeleteAlertDialog** - Delete confirmation
- **CollectionShareMenu** - Share options
- **LikeCompactButton** - Like toggle
- **ReportButton** - Report content

### Functionality to Test

1. **Metadata Display**: Collection name, description, cover image, slug
2. **Statistics Display**: Bobblehead count, featured count, total value, likes, views, comments
3. **Owner Actions**: Edit, delete, share
4. **Non-Owner Actions**: Like, report
5. **Data Layer**: CollectionsDashboardFacade.getHeaderByCollectionSlugAsync, caching

### Error Scenarios

- Missing collection data
- Permission validation
- Loading states
- Failed server actions
- Cache invalidation

## Validation Results

- Format: Single paragraph ✓
- Word count: ~350 words ✓
- Focus on WHAT: ✓
