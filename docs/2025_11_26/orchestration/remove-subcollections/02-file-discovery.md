# Step 2: File Discovery Log

**Start Time**: 2025-11-26T00:00:31Z
**End Time**: 2025-11-26T00:02:00Z
**Duration**: ~90 seconds
**Status**: Completed

## Input: Refined Feature Request

This feature request requires the complete removal of the subcollection concept from the Head Shakers bobblehead collection platform, with no backwards compatibility or migration path provided.

## Agent Prompt Sent

```
You are discovering all files relevant to removing subcollections from the Head Shakers bobblehead collection application.

## Refined Feature Request
[Full refined request provided]

## Your Task
1. Search the codebase comprehensively for ALL files containing subcollection references
2. Search for patterns: "subcollection", "subCollection", "sub_collection", "sub-collection"
3. Check these directories specifically...
[Full prompt details]
```

## Discovery Summary

| Metric | Count |
|--------|-------|
| Total files found | 85+ |
| Files to delete entirely | 35 |
| Files to modify | 50+ |
| Directories to delete | 2 |

## Critical Priority Files (12 files)

| File Path | Action | Reason |
|-----------|--------|--------|
| `src/lib/db/schema/collections.schema.ts` | MODIFY | Contains `subCollections` table definition (lines 76-123) |
| `src/lib/db/schema/bobbleheads.schema.ts` | MODIFY | Contains `subcollectionId` foreign key column (line 69) |
| `src/lib/db/schema/relations.schema.ts` | MODIFY | Contains `subCollectionsRelations` and bobblehead relation to subcollection |
| `src/lib/db/schema/social.schema.ts` | MODIFY | Contains index for subcollection comments |
| `src/lib/validations/subcollections.validation.ts` | DELETE | Entire Zod validation schema file for subcollections |
| `src/lib/constants/defaults.ts` | MODIFY | Contains `SUB_COLLECTION` defaults object |
| `src/lib/constants/schema-limits.ts` | MODIFY | Contains `SUB_COLLECTION` schema limits |
| `src/lib/constants/error-codes.ts` | MODIFY | Contains `SUBCOLLECTIONS` error codes object |
| `src/lib/constants/error-messages.ts` | MODIFY | Contains subcollection error messages |
| `src/lib/constants/enums.ts` | MODIFY | Contains 'subcollection' in multiple enum arrays |

## High Priority Files (18 files)

| File Path | Action | Reason |
|-----------|--------|--------|
| `src/lib/actions/collections/subcollections.actions.ts` | DELETE | Complete server actions file (4 actions) |
| `src/lib/queries/collections/subcollections.query.ts` | DELETE | Complete query class (407 lines) |
| `src/lib/facades/collections/subcollections.facade.ts` | DELETE | Complete facade class (353 lines) |
| `src/lib/queries/collections/collections.query.ts` | MODIFY | Contains subcollection types and references |
| `src/lib/queries/bobbleheads/bobbleheads-query.ts` | MODIFY | References subcollections in joins |
| `src/lib/queries/social/social.query.ts` | MODIFY | Social queries for subcollection likes/comments |
| `src/lib/queries/content-search/content-search.query.ts` | MODIFY | Search queries include subcollections |
| `src/lib/queries/content-reports/content-reports.query.ts` | MODIFY | Content reports target subcollections |
| `src/lib/facades/social/social.facade.ts` | MODIFY | Social facade handling subcollections |
| `src/lib/facades/bobbleheads/bobbleheads.facade.ts` | MODIFY | Bobblehead facade with subcollection references |
| `src/lib/facades/collections/collections.facade.ts` | MODIFY | Collections facade interacts with subcollections |
| `src/lib/facades/content-search/content-search.facade.ts` | MODIFY | Search facade including subcollections |
| `src/lib/facades/content-reports/content-reports.facade.ts` | MODIFY | Reports facade handling subcollection reports |
| `src/lib/constants/action-names.ts` | MODIFY | Contains subcollection action names |
| `src/lib/constants/operations.ts` | MODIFY | Contains SUBCOLLECTIONS operations |
| `src/lib/constants/sentry.ts` | MODIFY | Contains SUBCOLLECTION_DATA context |
| `src/lib/constants/cloudinary-paths.ts` | MODIFY | Contains subcollection cover photo paths |
| `src/lib/utils/cache-tags.utils.ts` | MODIFY | Contains 'subcollection' as CacheEntityType |

## Medium Priority Files - Pages & Routes (To Delete)

| File Path | Action |
|-----------|--------|
| `src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/page.tsx` | DELETE |
| `src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/loading.tsx` | DELETE |
| `src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/not-found.tsx` | DELETE |
| `src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/route-type.ts` | DELETE |
| `src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/*.tsx` | DELETE (12 files) |

## Medium Priority Files - Feature Components (To Delete)

| File Path | Action |
|-----------|--------|
| `src/components/feature/subcollections/subcollection-actions.tsx` | DELETE |
| `src/components/feature/subcollections/subcollection-card.tsx` | DELETE |
| `src/components/feature/subcollections/subcollection-create-dialog.tsx` | DELETE |
| `src/components/feature/subcollections/subcollection-delete-dialog.tsx` | DELETE |
| `src/components/feature/subcollections/subcollection-delete.tsx` | DELETE |
| `src/components/feature/subcollections/subcollection-edit-dialog.tsx` | DELETE |
| `src/components/feature/subcollections/subcollection-share-menu.tsx` | DELETE |
| `src/components/feature/subcollection/subcollection-sticky-header.tsx` | DELETE |

## Medium Priority Files - Dashboard Components (To Delete)

| File Path | Action |
|-----------|--------|
| `src/app/(app)/dashboard/collection/(collection)/components/subcollections-list.tsx` | DELETE |
| `src/app/(app)/dashboard/collection/(collection)/components/subcollections-list-item.tsx` | DELETE |
| `src/app/(app)/dashboard/collection/(collection)/components/subcollections-empty-state.tsx` | DELETE |
| `src/app/(app)/dashboard/collection/(collection)/components/subcollections-tab-content.tsx` | DELETE |
| `src/app/(app)/dashboard/collection/(collection)/components/skeletons/subcollections-tab-skeleton.tsx` | DELETE |

## Medium Priority Files - Components to Modify (19 files)

| File Path | Reason |
|-----------|--------|
| `src/components/feature/collections/collection-delete.tsx` | References subcollections in confirmation |
| `src/app/(app)/dashboard/collection/(collection)/components/collection-actions.tsx` | Subcollection actions |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx` | Subcollection context |
| `src/components/feature/comments/async/comment-section-async.tsx` | Subcollection target type |
| `src/components/admin/reports/*.tsx` | Subcollection reports (4 files) |
| `src/components/feature/search/*.tsx` | Subcollection search (2 files) |
| `src/components/feature/bobblehead/*.tsx` | Subcollection references (5 files) |
| `src/components/feature/content-reports/*.tsx` | Subcollection reports (2 files) |
| `src/components/analytics/*.tsx` | Subcollection tracking (2 files) |

## Low Priority Files - Tests

| File Path | Action |
|-----------|--------|
| `tests/integration/actions/bobbleheads.facade.test.ts` | MODIFY |
| `tests/unit/lib/validations/like.validation.test.ts` | MODIFY |
| `tests/unit/validations/social.validation.test.ts` | MODIFY |
| `tests/unit/lib/validations/comment.validation.test.ts` | MODIFY |
| `tests/fixtures/bobblehead.factory.ts` | MODIFY |
| `tests/mocks/data/bobbleheads.mock.ts` | MODIFY |
| `tests/e2e/utils/test-data.ts` | MODIFY |

## Low Priority Files - Documentation

| File Path | Action |
|-----------|--------|
| `docs/2025_11_22/plans/subcollections-view-redesign-implementation-plan.md` | DELETE |
| `docs/2025_11_24/design/subcollections-redesign-architecture-analysis.md` | DELETE |
| `docs/2025_11_24/plans/subcollections-view-filter-implementation-plan.md` | DELETE |
| `docs/2025_11_24/plans/subcollections-view-redesign-implementation-plan.md` | DELETE |

## Directories to Delete Entirely

1. `src/app/(app)/collections/[collectionSlug]/subcollection/` - Entire subcollection route
2. `src/components/feature/subcollections/` - Entire subcollections feature components

## Validation Results

- **Minimum Files Check**: PASS (85+ files discovered, far exceeds 3 minimum)
- **Coverage Check**: PASS (All architectural layers covered)
- **Categorization Check**: PASS (Files properly categorized by priority)

## Architecture Insights

### Database Layer
- Primary table: `sub_collections` with 11 columns, 8 indexes, 6 constraints
- Foreign key: `bobbleheads.subcollectionId` references sub_collections.id
- Relations: Drizzle ORM relations in relations.schema.ts

### Application Layer
- Complete CRUD: Actions, queries, facades fully implemented
- Server Actions: 4 actions (create, read, delete, update)
- Query Layer: SubcollectionsQuery class with 10+ methods
- Facade Layer: SubcollectionsFacade with business logic

### UI Layer
- Dedicated route: `/collections/[collectionSlug]/subcollection/[subcollectionSlug]`
- 19 page components
- 8 reusable feature components
- 5 dashboard components

### Integration Points
- Comments, Likes, Search, Reports, Analytics, Navigation, Cache, SEO, Cloudinary
