# Step 2: File Discovery

**Started**: 2026-01-11T00:00:31Z
**Completed**: 2026-01-11T00:02:00Z
**Status**: ✅ Complete

## Input

Refined feature request for complete removal of tags feature from bobbleheads.

## Agent Prompt

Find all files relevant to implementing the tags removal feature request, searching for:
- Database schema files containing tag tables or relations
- Validation schema files with tag fields
- Server action files handling tags
- Query files fetching tag data
- Facade files with tag business logic
- UI components for tag input, display, or filtering
- Form components with tag fields
- Type definition files with tag interfaces

## Agent Response

### Discovery Statistics

| Metric | Value |
|--------|-------|
| Directories Explored | 12 |
| Files Examined | 85+ |
| Files Highly Relevant | 32 |
| Supporting Files | 18 |

## Discovered Files by Priority

### Critical Priority (Core Database/Schema - Must Delete or Modify First)

| File Path | Action | Description |
|-----------|--------|-------------|
| `src/lib/db/schema/tags.schema.ts` | DELETE | Tags and bobbleheadTags junction table schema |
| `src/lib/db/schema/relations.schema.ts` | MODIFY | Remove tagsRelations and bobbleheadTagsRelations |
| `src/lib/db/schema/index.ts` | MODIFY | Remove tags and bobbleheadTags exports |

### Critical Priority (Validation Layer)

| File Path | Action | Description |
|-----------|--------|-------------|
| `src/lib/validations/tags.validation.ts` | DELETE | All tag-related Zod schemas |
| `src/lib/validations/bobbleheads.validation.ts` | MODIFY | Remove tags field from schemas |
| `src/lib/validations/public-search.validation.ts` | MODIFY | Remove tagIds from search schemas |

### High Priority (Server Actions)

| File Path | Action | Description |
|-----------|--------|-------------|
| `src/lib/actions/tags/tags.actions.ts` | DELETE | All tag CRUD server actions |
| `src/lib/actions/bobbleheads/bobbleheads.actions.ts` | MODIFY | Remove tag operation references |

### High Priority (Query Layer)

| File Path | Action | Description |
|-----------|--------|-------------|
| `src/lib/queries/tags/tags-query.ts` | DELETE | TagsQuery class |
| `src/lib/queries/bobbleheads/bobbleheads-query.ts` | MODIFY | Remove tag imports and relations |
| `src/lib/queries/content-search/content-search.query.ts` | MODIFY | Remove tag search functionality |

### High Priority (Facade Layer)

| File Path | Action | Description |
|-----------|--------|-------------|
| `src/lib/facades/tags/tags.facade.ts` | DELETE | TagsFacade class |
| `src/lib/facades/bobbleheads/bobbleheads.facade.ts` | MODIFY | Remove TagsFacade import and usage |
| `src/lib/facades/bobbleheads/bobbleheads-dashboard.facade.ts` | MODIFY | Remove tags from BobbleheadForEdit |
| `src/lib/facades/content-search/content-search.facade.ts` | MODIFY | Remove tag search logic |

### High Priority (UI Components)

| File Path | Action | Description |
|-----------|--------|-------------|
| `src/components/ui/tags-input.tsx` | DELETE | Tags input component |
| `src/components/ui/tag-badge.tsx` | DELETE | Tag badge component |
| `src/components/ui/form/field-components/tag-field.tsx` | DELETE | TanStack Form tag field |
| `src/components/ui/form/index.tsx` | MODIFY | Remove tag component exports |
| `src/app/(app)/user/[username]/dashboard/collection/components/add-form/item-tags.tsx` | DELETE | Add form tags section |
| `src/app/(app)/user/[username]/dashboard/collection/components/display/add-bobblehead-form-display.tsx` | MODIFY | Remove ItemTags |
| `src/app/(app)/user/[username]/dashboard/collection/components/display/edit-bobblehead-form-display.tsx` | MODIFY | Remove ItemTags and tags handling |
| `src/app/(app)/admin/featured-content/components/tag-filter.tsx` | DELETE | Admin tag filter |
| `src/app/(app)/browse/search/components/search-filters.tsx` | MODIFY | Remove tagIds filter |
| `src/app/(app)/browse/search/route-type.ts` | MODIFY | Remove tagIds from schema |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]/components/feature-card/feature-card-quick-info.tsx` | MODIFY | Remove tag display |

### Medium Priority (Constants/Config)

| File Path | Action | Description |
|-----------|--------|-------------|
| `src/lib/constants/action-names.ts` | MODIFY | Remove TAGS section |
| `src/lib/constants/operations.ts` | MODIFY | Remove TAGS section |
| `src/lib/constants/error-messages.ts` | MODIFY | Remove TAG section |
| `src/lib/constants/error-codes.ts` | MODIFY | Remove TAGS section |
| `src/lib/constants/schema-limits.ts` | MODIFY | Remove TAG limits |
| `src/lib/constants/defaults.ts` | MODIFY | Remove TAG defaults |
| `src/lib/constants/config.ts` | MODIFY | Remove tag config values |
| `src/lib/constants/cache.ts` | MODIFY | Remove TAGS namespace |
| `src/lib/constants/sentry.ts` | MODIFY | Remove TAG_DATA context |

### Medium Priority (Services)

| File Path | Action | Description |
|-----------|--------|-------------|
| `src/lib/services/cache-revalidation.service.ts` | MODIFY | Remove onTagChange method |
| `src/lib/utils/cache-tags.utils.ts` | REVIEW | May have tag-specific cache generators |

### Low Priority (Tests)

| File Path | Action | Description |
|-----------|--------|-------------|
| `tests/unit/lib/validations/tags.validation.test.ts` | DELETE | Tag validation tests |
| `tests/integration/actions/bobbleheads/bobbleheads.actions.test.ts` | MODIFY | Remove TagsFacade mocks |
| `tests/integration/facades/bobbleheads-dashboard/bobbleheads-dashboard.facade.test.ts` | MODIFY | Remove tag test cases |
| `tests/setup/test-db.ts` | MODIFY | Remove tags from KNOWN_TABLES |

### Low Priority (Seed/Scripts)

| File Path | Action | Description |
|-----------|--------|-------------|
| `src/lib/db/scripts/seed.ts` | MODIFY | Remove tag seeding |

### Documentation

| File Path | Action | Description |
|-----------|--------|-------------|
| `docs/2025_09_18/plans/tag-field-autocomplete-implementation-plan.md` | DELETE | Obsolete tag documentation |

## Architecture Insights

### Database Pattern
- `tags` table: id, name, color, usageCount, timestamps
- `bobblehead_tags` junction table: many-to-many relationship
- Drizzle relations for bidirectional querying

### Integration Points
1. **Forms**: TanStack Form with TagField component
2. **Search**: URL params for tag filtering
3. **Admin**: Tag filter in featured content
4. **Display**: Color-coded badges on bobbleheads
5. **Cache**: Dedicated namespace and invalidation

### Recommended Removal Order
1. UI components (prevent runtime errors)
2. Server actions and facades
3. Queries
4. Validations
5. Schema files and exports
6. Generate migration (`npm run db:generate`)
7. Constants, configs, tests
8. Run migration (`npm run db:migrate`)

## Validation Results

- ✅ Minimum 3 files discovered: 32+ relevant files found
- ✅ Files categorized by priority
- ✅ Action type specified for each file (DELETE/MODIFY/REVIEW)
- ✅ Comprehensive coverage across all layers
