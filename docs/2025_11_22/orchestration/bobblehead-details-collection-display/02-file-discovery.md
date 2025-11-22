# Step 2: AI-Powered File Discovery

## Metadata

- **Step**: 2 - File Discovery
- **Start Time**: 2025-11-22T00:01:00Z
- **End Time**: 2025-11-22T00:02:00Z
- **Duration**: ~60 seconds
- **Status**: Completed

## Input: Refined Feature Request

As a user, I would like the bobblehead details page header section to provide clearer and more prominent display of collection and subcollection information with direct navigation links, enabling me to quickly understand the organizational context of the bobblehead I'm viewing and navigate between related items in the collection hierarchy.

## Complete Agent Prompt

```
Discover all files relevant to implementing this feature in the Head Shakers codebase:

**Refined Feature Request**:
As a user, I would like the bobblehead details page header section to provide clearer and more prominent display of collection and subcollection information with direct navigation links...

**Project Context**:
- Next.js 16.0.3 with App Router in src/app/
- React components in src/components/ (ui/, feature/, layout/)
- Bobblehead routes in src/app/(app)/bobbleheads/
- Database schemas in src/lib/db/
- Queries in src/lib/queries/
- Server actions in src/lib/actions/
- Validations in src/lib/validations/
- Uses $path from next-typesafe-url

**Task**:
1. Search for all files related to bobblehead details page, header components, collection display
2. Find database schemas for bobbleheads, collections, subcollections
3. Locate query files that fetch collection/subcollection data
4. Find any existing breadcrumb or navigation components
5. Identify type definitions and validation schemas

**Output Requirements**:
Return a structured list of discovered files with:
- File path
- Priority (Critical/High/Medium/Low)
- Brief reason for relevance (one sentence)
```

## Discovery Statistics

- **Directories Explored**: 8
- **Candidate Files Examined**: 35+
- **Highly Relevant Files**: 16
- **Supporting Files**: 10

## Discovered Files by Priority

### Critical Priority (Must Modify)

| File Path | Reason |
|-----------|--------|
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-header.tsx` | Primary header component displaying back button with truncated parent collection label - requires adding breadcrumb navigation |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-header-async.tsx` | Server component that fetches bobblehead data - may need to pass additional collection context |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-header-skeleton.tsx` | Loading skeleton needs updating to match new header layout with breadcrumb section |

### High Priority (Supporting Implementation)

| File Path | Reason |
|-----------|--------|
| `src/components/feature/bobblehead/bobblehead-sticky-header.tsx` | Sticky header with existing breadcrumb pattern (Collection > Subcollection > Title) - reference implementation |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx` | Main page component passing collectionId/subcollectionId context to children |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx` | Client component showing collection context indicator - existing pattern for collection display |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/collection-context-indicator.tsx` | Existing component displaying collection/subcollection badge - can be reused or adapted |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-page-client-wrapper.tsx` | Client wrapper showing how collection data flows from page to components |

### Medium Priority (Data Layer / Reference)

| File Path | Reason |
|-----------|--------|
| `src/lib/queries/bobbleheads/bobbleheads-query.ts` | Query class fetching bobblehead with collectionName, collectionSlug, subcollectionName, subcollectionSlug |
| `src/lib/facades/bobbleheads/bobbleheads.facade.ts` | Facade coordinating bobblehead data fetching including navigation context |
| `src/lib/facades/collections/collections.facade.ts` | Provides getCollectionById for fallback display when no URL context |
| `src/lib/facades/collections/subcollections.facade.ts` | Provides getSubCollectionForPublicView for fallback subcollection display |
| `src/lib/types/bobblehead-navigation.types.ts` | Type definitions for NavigationContext and BobbleheadNavigationData |
| `src/lib/validations/bobblehead-navigation.validation.ts` | Zod schemas for navigation context validation |

### Low Priority (Reference / Minor Updates)

| File Path | Reason |
|-----------|--------|
| `src/lib/db/schema/bobbleheads.schema.ts` | Database schema with collectionId and subcollectionId fields |
| `src/lib/db/schema/collections.schema.ts` | Collection and SubCollection schemas with name, slug fields |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/route-type.ts` | Route type definitions for navigation context via URL |
| `src/lib/seo/jsonld.utils.ts` | Contains generateBreadcrumbSchema - reference for breadcrumb patterns |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx` | Server component fetching navigation data pattern |

## Architecture Insights

### Key Patterns Discovered

1. **Collection Context Flow**: Bobblehead page receives `collectionId` and `subcollectionId` as optional search params. When present, enables collection-scoped navigation. Without them, can display stored collection relationships.

2. **Data Already Available**: `BobbleheadWithRelations` type includes `collectionName`, `collectionSlug`, `subcollectionName`, `subcollectionSlug` via LEFT JOINs.

3. **$path Routing**: All internal navigation uses `$path` from `next-typesafe-url`:
   - `/collections/[collectionSlug]` for collection pages
   - `/collections/[collectionSlug]/subcollection/[subcollectionSlug]` for subcollection pages
   - `/bobbleheads/[bobbleheadSlug]` for bobblehead pages

4. **Existing Breadcrumb Patterns**:
   - Sticky header shows Collection > Subcollection > Title breadcrumbs
   - SEO generates breadcrumb JSON-LD schema
   - CollectionContextIndicator displays context with truncation and tooltip

5. **Fallback Data Strategy**: When no URL context exists, can use `bobblehead.collectionId` and `bobblehead.subcollectionId` to fetch names via existing facade methods.

### Potential Integration Challenges

1. **Mobile Responsiveness**: Need to handle breadcrumb display on small screens (current navigation hides on mobile)
2. **Truncation Strategy**: Long names need truncation with tooltips (existing pattern uses maxLength=25)
3. **Conditional Display**: Must handle four scenarios:
   - URL context matches stored IDs
   - URL context differs from stored IDs
   - No URL context, bobblehead has stored collection
   - No URL context, bobblehead has no collection

## File Validation Results

All discovered file paths verified to exist in the codebase.

## Validation Summary

- **Minimum Files**: PASS - Discovered 16+ relevant files (minimum 5 required)
- **AI Analysis Quality**: PASS - Detailed reasoning provided for each file
- **File Validation**: PASS - All paths exist
- **Smart Categorization**: PASS - Files categorized by implementation priority
- **Comprehensive Coverage**: PASS - Covers components, data layer, types, and schemas
