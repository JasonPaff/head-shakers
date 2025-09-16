# Claude.ai Development Guide

## Facade Architecture

The application uses a facade pattern in `src/lib/facades/` to provide clean, business-logic-oriented APIs for server actions and server components. Facades handle orchestration, validation, error handling, and business rules while delegating data access to query classes.

### Facade Pattern Structure

All facades follow a consistent pattern:

1. **Static Methods**: All facade methods are static class methods
2. **Error Handling**: Comprehensive error handling with `createFacadeError()` and `FacadeErrorContext`
3. **Query Context**: Uses typed query contexts for permissions and database access
4. **Business Logic**: Handles validation, orchestration, and data enrichment
5. **Database Transactions**: Optional `dbInstance` parameter for transaction support

### Query Context System

Facades use a standardized query context system from `src/lib/queries/base/query-context.ts`:

- `createPublicQueryContext()` - Public access only
- `createUserQueryContext(userId)` - Authenticated user access
- `createProtectedQueryContext(userId)` - Owner-only access
- `createAdminQueryContext(adminUserId)` - Admin/moderator access

### Available Facades

#### BobbleheadsFacade (`src/lib/facades/bobbleheads/bobbleheads.facade.ts`)
Manages bobblehead operations including CRUD, photo management, and search functionality.

**Key Methods:**
- `createAsync(data, userId, dbInstance?)` - Create new bobblehead
- `deleteAsync(data, userId, dbInstance?)` - Delete with Cloudinary cleanup and tag removal
- `getBobbleheadById(id, viewerUserId?, dbInstance?)` - Get single bobblehead
- `getBobbleheadWithRelations(id, viewerUserId?, dbInstance?)` - Get with photos and tags
- `searchBobbleheads(searchTerm, filters, options, viewerUserId?, dbInstance?)` - Advanced search
- `addPhotoAsync(data, dbInstance?)` - Add photo to bobblehead

#### CollectionsFacade (`src/lib/facades/collections/collections.facade.ts`)
Handles collection management with metrics computation and social data enrichment.

**Key Methods:**
- `createAsync(data, userId, dbInstance?)` - Create collection
- `updateAsync(data, userId, dbInstance?)` - Update collection
- `deleteAsync(data, userId, dbInstance?)` - Delete collection
- `getCollectionForPublicView(id, viewerUserId?, dbInstance?)` - Public view with metrics
- `getCollectionBobbleheadsWithPhotos(collectionId, viewerUserId?, options?, dbInstance?)` - Get bobbleheads with photos and like data
- `getUserCollectionsForDashboard(userId, dbInstance?)` - Dashboard data with metrics
- `computeMetrics(collection)` - Calculate collection statistics

#### SubcollectionsFacade (`src/lib/facades/collections/subcollections.facade.ts`)
Manages subcollections within collections.

**Key Methods:**
- `createAsync(data, dbInstance?)` - Create subcollection
- `updateAsync(data, userId, dbInstance?)` - Update subcollection
- `deleteAsync(data, userId, dbInstance?)` - Delete subcollection
- `getSubCollectionForPublicView(collectionId, subcollectionId, viewerUserId?, dbInstance?)` - Public view
- `getSubcollectionBobbleheadsWithPhotos(subcollectionId, viewerUserId?, options?, dbInstance?)` - Get bobbleheads with like data

#### SocialFacade (`src/lib/facades/social/social.facade.ts`)
Handles like functionality and social interactions across content types.

**Key Methods:**
- `toggleLike(targetId, targetType, userId, dbInstance?)` - Like/unlike content
- `getContentLikeData(targetId, targetType, viewerUserId?, dbInstance?)` - Get like status and count
- `getBatchContentLikeData(targets, viewerUserId?, dbInstance?)` - Batch like data retrieval
- `getRecentLikeActivity(targetId, targetType, options?, viewerUserId?, dbInstance?)` - Recent likes
- `getTrendingContent(targetType, options?, viewerUserId?, dbInstance?)` - Trending by likes

#### TagsFacade (`src/lib/facades/tags/tags.facade.ts`)
Comprehensive tag management with validation and business rules.

**Key Methods:**
- `createTag(data, userId, dbInstance?)` - Create new tag
- `getOrCreateTag(name, color, userId, dbInstance?)` - Get existing or create new
- `attachToBobblehead(bobbleheadId, tagIds, userId, dbInstance?)` - Attach tags to bobblehead
- `detachFromBobblehead(bobbleheadId, tagIds, userId, dbInstance?)` - Remove tags
- `validateTagsForBobblehead(bobbleheadId, newTagIds, userId, dbInstance?)` - Validation logic
- `getSuggestionsForUser(query, userId?)` - Tag autocomplete
- `getUserTagStats(userId, dbInstance?)` - User tag analytics

#### ContentSearchFacade (`src/lib/facades/content-search/content-search.facade.ts`)
Admin/moderator search functionality for featuring content.

**Key Methods:**
- `searchBobbleheadsForFeaturing(query, limit, adminUserId, dbInstance?, includeTags?, excludeTags?)` - Admin bobblehead search
- `searchCollectionsForFeaturing(query, limit, adminUserId, dbInstance?, includeTags?, excludeTags?)` - Admin collection search
- `searchUsersForFeaturing(query, limit, adminUserId, dbInstance?)` - Admin user search
- `getBobbleheadForFeaturing(id, adminUserId, dbInstance?)` - Get specific bobblehead for featuring

#### FeaturedContentFacade (`src/lib/facades/featured-content/featured-content.facade.ts`)
Manages featured content system with caching and content types.

**Key Methods:**
- `createAsync(data, curatorId, dbInstance?)` - Create featured content
- `deleteAsync(id, dbInstance?)` - Remove from featured
- `getActiveFeaturedContent(dbInstance?)` - Get all active featured content
- `getHomepageBanner(dbInstance?)` - Homepage banner content
- `getEditorPicks(dbInstance?)` - Editor's picks
- `getTrendingContent(dbInstance?)` - Trending featured content
- `toggleActiveAsync(id, isActive, dbInstance?)` - Enable/disable featured content

#### UsersFacade (`src/lib/facades/users/users.facade.ts`)
Simple user operations facade.

**Key Methods:**
- `getUserByClerkId(clerkId, dbInstance?)` - Get user by Clerk authentication ID

### Error Handling Pattern

All facades use consistent error handling:

```typescript
try {
  const context = createUserQueryContext(userId, { dbInstance });
  return await SomeQuery.operation(data, context);
} catch (error) {
  const context: FacadeErrorContext = {
    data: { /* relevant data */ },
    facade: 'FacadeName',
    method: 'methodName',
    operation: OPERATIONS.DOMAIN.ACTION,
    userId,
  };
  throw createFacadeError(context, error);
}
```

### Usage in Server Actions

Facades are designed to be used directly in Next.js server actions:

```typescript
export async function createBobblehead(data: InsertBobblehead) {
  const { userId } = auth();
  return await BobbleheadsFacade.createAsync(data, userId);
}
```

### Database Transactions

All facades support optional database instances for transactions:

```typescript
await db.transaction(async (tx) => {
  const bobblehead = await BobbleheadsFacade.createAsync(data, userId, tx);
  await TagsFacade.attachToBobblehead(bobblehead.id, tagIds, userId, tx);
});
```

### Social Data Integration

Many facades automatically integrate social data (likes) when retrieving content:

- Collection and subcollection bobblehead lists include like data
- Batch operations optimize like data retrieval
- Like data includes `isLiked`, `likeCount`, and `likeId` for the viewer

### Key Principles

1. **Single Responsibility**: Each facade handles one domain area
2. **Consistent APIs**: All facades follow the same patterns
3. **Permission-Aware**: Query contexts handle access control
4. **Transaction-Safe**: Optional database instance support
5. **Error-Rich**: Detailed error context for debugging
6. **Business-Focused**: Handle validation and orchestration, not just data access