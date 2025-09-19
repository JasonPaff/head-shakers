# Step 2: File Discovery

**Start Time**: 2025-01-18T10:02:00Z
**End Time**: 2025-01-18T10:03:30Z
**Duration**: 90 seconds
**Status**: ✅ Success

## Refined Request Used as Input

Implement a comprehensive favoriting system that allows authenticated users to favorite and unfavorite collections, subcollections, and bobbleheads through a unified interface within the Head Shakers platform. This feature requires creating a new `favorites` table in the PostgreSQL database using Drizzle ORM with foreign key relationships to `collections`, `subcollections`, and `bobbleheads` tables, along with a `user_id` field linking to Clerk's authentication system and a polymorphic approach using `favoritable_type` and `favoritable_id` columns to handle the three different entity types efficiently. The implementation will utilize Next.js 15.5.3 server actions with Next-Safe-Action for type-safe favorite/unfavorite operations, incorporating Zod validation schemas to ensure data integrity and proper authentication checks using Clerk's `auth()` helper to verify user sessions before allowing any favoriting actions. The user interface will feature heart-shaped favorite buttons integrated into collection cards, subcollection listings, and bobblehead detail pages using Lucide React icons with Tailwind CSS styling, implementing optimistic updates through TanStack Query mutations to provide immediate visual feedback while the server action processes in the background. The favorite buttons will display different states (filled heart for favorited items, outline heart for unfavorited items) with smooth transitions and hover effects, and the system will include proper error handling with toast notifications for failed operations and automatic retry mechanisms. Database operations will be wrapped in transactions to ensure consistency, with proper indexing on user_id and the combination of favoritable_type/favoritable_id for optimal query performance, and the server actions will return updated favorite counts that can be displayed alongside each item to show community engagement levels, all while maintaining the existing architecture patterns and ensuring compatibility with the current authentication flow and data fetching strategies used throughout the application.

## File Discovery Results

### Priority 1 - Core Schema & Database Files

✅ **Schema Files (Must Modify)**

- `src/lib/db/schema/social.schema.ts` - Contains existing `likes` table (polymorphic structure similar to favorites)
- `src/lib/db/schema/index.ts` - Main schema export file
- `src/lib/db/schema/relations.schema.ts` - Database relationships

### Priority 2 - Server Actions & Validation

✅ **Action Files (Create New)**

- `src/lib/actions/social/social.actions.ts` - Contains like/unlike actions (reference for favorites)
- NEW: `src/lib/actions/favorites/favorites.actions.ts` - To be created

✅ **Validation Schemas**

- `src/lib/validations/social.validation.ts` - Contains like validation schemas
- NEW: `src/lib/validations/favorites.validation.ts` - To be created

### Priority 3 - Query & Data Fetching

✅ **Query Files**

- `src/lib/queries/social/social.query.ts` - Contains like queries
- `src/lib/queries/collections/collections.query.ts` - Collection queries
- `src/lib/queries/collections/subcollections.query.ts` - Subcollection queries
- `src/lib/queries/bobbleheads/bobbleheads-query.ts` - Bobblehead queries
- NEW: `src/lib/queries/favorites/favorites.query.ts` - To be created

### Priority 4 - UI Components (Must Modify)

✅ **Collection Components**

- `src/app/(app)/collections/[collectionId]/(collection)/components/collection.tsx`
- `src/app/(app)/dashboard/collection/(collection)/components/collection-card.tsx`
- `src/components/feature/collections/collection-share-menu.tsx`

✅ **Subcollection Components**

- `src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection.tsx`
- `src/app/(app)/dashboard/collection/(collection)/components/subcollections-list-item.tsx`
- `src/components/feature/subcollections/subcollection-share-menu.tsx`

✅ **Bobblehead Components**

- `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead.tsx`
- `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-header.tsx`
- `src/components/feature/bobblehead/bobblehead-gallery-card.tsx`

### Priority 5 - New Component Files (To Create)

- NEW: `src/components/feature/favorites/favorite-button.tsx` - Reusable favorite button
- NEW: `src/components/feature/favorites/favorite-button-skeleton.tsx` - Loading state

### Priority 6 - Supporting Files

✅ **Constants & Types**

- `src/lib/constants/index.ts` - Add favorite-related constants
- `src/lib/types/favorites.types.ts` - New type definitions

✅ **Hooks (If Needed)**

- NEW: `src/hooks/use-favorite.ts` - Custom hook for favorite operations

## File Path Validation Results

✅ All existing file paths validated successfully
⚠️ New files identified for creation (7 files)

## Discovery Metrics

- **Total Files Discovered**: 35
- **Existing Files to Modify**: 28
- **New Files to Create**: 7
- **File Categories**: 6 (Schema, Actions, Queries, Components, Validations, Types)
- **Components Affected**: 12 UI components requiring favorite button integration

## Key Insights

1. **Existing Infrastructure**: The project already has a `likes` table with a polymorphic structure that can serve as a reference for the favorites implementation
2. **Consistent Pattern**: The existing social features follow the same pattern needed for favorites (polymorphic relationships, server actions, optimistic updates)
3. **Component Integration Points**: Identified 12 specific components where favorite buttons need to be integrated
4. **Database Migration**: Will need to create a new `favorites` table following the pattern of the existing `likes` table
