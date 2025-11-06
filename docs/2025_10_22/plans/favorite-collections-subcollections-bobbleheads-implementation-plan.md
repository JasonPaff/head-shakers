# Implementation Plan: Favorites Feature

**Generated**: 2025-10-22T00:04:30Z

**Original Request**: "as a user I would like to be able to favorite collection, subcollections, and individual bobbleheads"

**Refined Request**: Implement a comprehensive favoriting system that allows authenticated users to mark collections, subcollections, and individual bobbleheads as favorites, integrating with the existing Next.js 15.5.3 App Router architecture and PostgreSQL database managed through Drizzle ORM on Neon serverless infrastructure. The feature should create a new database table through Drizzle schema definitions to store user favorites with polymorphic associations supporting all three entity types (collections, subcollections, bobbleheads), utilizing proper foreign key relationships to the existing tables and Clerk user IDs for authentication. Server actions built with Next-Safe-Action should handle the favorite/unfavorite mutations with optimistic UI updates, incorporating Zod validation schemas generated from Drizzle-Zod to ensure type-safe request validation for favorite operations. The implementation should follow the established patterns in the codebase's social features layer (similar to the existing likes, follows, and comments functionality) by creating corresponding facades in the business logic layer, queries for data fetching, and reusable UI components built with Radix UI primitives. Users should be able to toggle favorite status from collection detail pages, bobblehead cards, and listing views, with visual indicators (likely using Lucide React icons) showing favorited items and appropriate feedback using the existing toast notification system. The feature should include a dedicated favorites view in the user dashboard where users can browse their favorited items with filtering and sorting capabilities, leveraging TanStack React Table for data presentation and Nuqs for URL state management of filters. All database queries should be optimized for performance with proper indexing on the favorites table, and the feature should integrate with the existing middleware for authentication checks to ensure only authenticated users can favorite items while maintaining the project's type safety standards and validation patterns throughout the entire implementation stack.

## Analysis Summary

- Feature request refined with project context
- Discovered 42 files across database schema, actions, queries, facades, validations, components, and pages
- Generated 22-step implementation plan with 3-4 day estimated duration

---

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: Medium-High
**Risk Level**: Medium

## Quick Summary

Implement a comprehensive favoriting system allowing authenticated users to mark collections, subcollections, and bobbleheads as favorites. This feature follows the existing social interactions pattern (likes/follows) with a three-layer architecture (Query → Facade → Action), polymorphic entity associations, optimistic UI updates, and a dedicated favorites dashboard view with filtering capabilities.

## Prerequisites

- [ ] Ensure development database branch is active and accessible via `/db` command
- [ ] Verify Clerk authentication is properly configured
- [ ] Confirm existing social features (likes, follows) are functioning as reference patterns
- [ ] Review TanStack React Table and Nuqs documentation for dashboard implementation

## Implementation Steps

### Step 1: Define Database Schema and Generate Migration

**What**: Create the favorites table schema in Drizzle with polymorphic associations and generate the database migration
**Why**: Establishes the data layer foundation supporting all three entity types (collections, subcollections, bobbleheads) with proper foreign keys and indexes
**Confidence**: High

**Files to Create:**

- `src/lib/db/schema/favorites.ts` - Drizzle schema definition for favorites table

**Files to Modify:**

- `src/lib/db/schema/index.ts` - Export the new favorites schema
- `src/lib/db/schema/relations.ts` - Add relations between favorites and collections/subcollections/bobbleheads tables

**Changes:**

- Define favorites table with columns: id (uuid), userId (text from Clerk), entityType (enum: collection/subcollection/bobblehead), entityId (uuid), createdAt (timestamp)
- Add composite unique constraint on (userId, entityType, entityId) to prevent duplicate favorites
- Create indexes on userId for user favorites queries, entityType and entityId for entity favorites count queries
- Add foreign key relationships to collections, subcollections, and bobbleheads tables with cascade delete
- Export favorites table and relations in schema index
- Define one-to-many relations from collections/subcollections/bobbleheads to favorites in relations file

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run db:generate
```

**Success Criteria:**

- [ ] Favorites schema compiles without TypeScript errors
- [ ] Migration file generated successfully in migrations folder
- [ ] Schema includes all required columns with proper types
- [ ] Composite unique constraint prevents duplicate favorites
- [ ] Indexes created for performance optimization
- [ ] All validation commands pass

---

### Step 2: Execute Database Migration

**What**: Run the generated migration on the development database branch
**Why**: Creates the favorites table in the database with proper structure and constraints
**Confidence**: High

**Files to Create:**
None

**Files to Modify:**
None

**Changes:**

- Execute migration using `/db run migration` command to create favorites table
- Verify table creation and constraints via `/db show schema favorites`
- Confirm indexes are properly created

**Validation Commands:**

```bash
/db show schema favorites
/db list tables
```

**Success Criteria:**

- [ ] Migration executes without errors
- [ ] Favorites table exists in database
- [ ] All columns, constraints, and indexes are properly created
- [ ] Foreign key relationships are established

---

### Step 3: Create Validation Schemas with Drizzle-Zod

**What**: Generate Zod validation schemas from Drizzle schema for favorites operations
**Why**: Ensures type-safe validation for favorite/unfavorite server actions following project patterns
**Confidence**: High

**Files to Create:**

- `src/lib/validations/favorites.ts` - Zod schemas for favorites operations

**Files to Modify:**
None

**Changes:**

- Import favorites schema from database schema
- Use createInsertSchema and createSelectSchema from drizzle-zod
- Define toggleFavoriteSchema with pick for userId, entityType, entityId
- Define getFavoritesSchema for filtering (userId, entityType optional, pagination parameters)
- Define removeFavoriteSchema with userId, entityType, entityId
- Export all schemas for use in actions and queries

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Validation schemas compile without errors
- [ ] Schemas properly infer types from Drizzle schema
- [ ] All required fields are included in operation schemas
- [ ] Schemas exported for consumption by actions layer
- [ ] All validation commands pass

---

### Step 4: Implement Database Queries Layer

**What**: Create queries for fetching favorites data with proper joins and filtering
**Why**: Provides reusable, optimized database queries following the three-layer architecture pattern
**Confidence**: High

**Files to Create:**

- `src/lib/queries/favorites.ts` - Database queries for favorites operations

**Files to Modify:**
None

**Changes:**

- Create getFavoritesByUserId query with joins to collections, subcollections, bobbleheads tables
- Implement getFavoriteStatus query to check if specific entity is favorited by user
- Add getFavoritesCountByEntity query for displaying favorite counts on entity cards
- Include getBulkFavoriteStatus query for efficient batch checking across multiple entities
- Add pagination support using limit and offset parameters
- Implement filtering by entityType for favorites dashboard views
- Use proper TypeScript typing with inferred types from Drizzle schema
- Add error handling with try-catch blocks

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All query functions properly typed with Drizzle inference
- [ ] Queries use efficient joins to fetch related entity data
- [ ] Pagination implemented correctly
- [ ] Filtering by entityType works as expected
- [ ] Error handling included in all query functions
- [ ] All validation commands pass

---

### Step 5: Implement Business Logic Facades

**What**: Create facades layer for favorites business logic with cache management
**Why**: Encapsulates business rules, cache invalidation, and provides clean interface between actions and queries
**Confidence**: High

**Files to Create:**

- `src/lib/facades/favorites.ts` - Business logic for favorites operations

**Files to Modify:**

- `src/lib/cache/tags.ts` - Add favorites-specific cache tags

**Changes:**

- Create addFavorite facade function calling database insert with conflict handling
- Implement removeFavorite facade function with delete operation
- Add toggleFavorite facade that checks current status and adds/removes accordingly
- Implement getUserFavorites facade with pagination and filtering support
- Add cache tag constants: FAVORITES_BY_USER, FAVORITES_BY_ENTITY, FAVORITES_COUNT
- Include cache invalidation logic using Next.js revalidateTag for affected entities
- Add transaction support for operations requiring atomicity
- Implement optimistic locking if needed for concurrent operations
- Include proper error handling and logging

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All facade functions properly typed
- [ ] Cache tags defined and exported from cache/tags.ts
- [ ] Cache invalidation triggers on all mutation operations
- [ ] Toggle logic correctly handles both add and remove cases
- [ ] Error handling implemented for all operations
- [ ] All validation commands pass

---

### Step 6: Create Server Actions with Next-Safe-Action

**What**: Implement server actions for favorite/unfavorite mutations with validation
**Why**: Provides type-safe, validated API for client components to perform favorites operations
**Confidence**: High

**Files to Create:**

- `src/lib/actions/favorites.ts` - Server actions for favorites operations

**Files to Modify:**
None

**Changes:**

- Create toggleFavoriteAction using action from next-safe-action
- Bind toggleFavoriteSchema from validations layer
- Implement handler calling toggleFavorite facade with Clerk userId from auth
- Create removeFavoriteAction for explicit unfavorite operation
- Add proper authentication checks using Clerk auth() function
- Return success/error states matching next-safe-action patterns
- Include revalidatePath calls for affected routes
- Add proper TypeScript typing for action inputs and outputs

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Actions properly integrated with next-safe-action
- [ ] Validation schemas correctly bound to actions
- [ ] Authentication checks prevent unauthorized access
- [ ] Facades called with proper parameters
- [ ] Cache invalidation and path revalidation work correctly
- [ ] All validation commands pass

---

### Step 7: Create Optimistic UI Hook

**What**: Implement custom hook for optimistic favorites updates in client components
**Why**: Provides immediate UI feedback while server action processes, improving user experience
**Confidence**: Medium

**Files to Create:**

- `src/lib/hooks/use-optimistic-favorite.ts` - Hook for optimistic favorite updates

**Files to Modify:**
None

**Changes:**

- Create useOptimisticFavorite hook using React useOptimistic
- Accept initial favorite status and entity information as parameters
- Integrate with toggleFavoriteAction using useAction from next-safe-action
- Implement optimistic state update that immediately toggles UI
- Add rollback mechanism on action failure
- Include loading and error states for UI feedback
- Return toggle function, current status, loading state, and error state
- Add proper TypeScript generics for entity types

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Hook properly typed with TypeScript
- [ ] Optimistic updates work immediately on user interaction
- [ ] Server action integration functions correctly
- [ ] Error states handled and exposed to components
- [ ] Rollback works on action failure
- [ ] All validation commands pass

---

### Step 8: Create Reusable Favorite Button Component

**What**: Build a Radix UI-based favorite button component with icon and loading states
**Why**: Provides consistent favoriting UI across all entity types (collections, subcollections, bobbleheads)
**Confidence**: High

**Files to Create:**

- `src/components/ui/favorite-button.tsx` - Reusable favorite button component

**Files to Modify:**
None

**Changes:**

- Create FavoriteButton component accepting entityType, entityId, initialFavorited as props
- Integrate useOptimisticFavorite hook for state management
- Use Lucide React Heart icon with filled/unfilled states
- Add Button component from Radix UI primitives
- Implement loading spinner during action execution
- Add toast notifications for success/error feedback
- Include aria-label for accessibility
- Add visual transitions using Tailwind CSS animations
- Implement authentication check with redirect to sign-in if unauthenticated
- Support variant props for different sizes and styles

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component renders correctly in all states
- [ ] Icon toggles between filled and unfilled appropriately
- [ ] Loading state displays during action
- [ ] Toast notifications appear on success/error
- [ ] Authentication check prevents unauthorized actions
- [ ] Accessibility labels present
- [ ] All validation commands pass

---

### Step 9: Integrate Favorite Button into Entity Detail Pages

**What**: Add FavoriteButton to collection, subcollection, and bobblehead detail pages
**Why**: Allows users to favorite items from their detail views
**Confidence**: High

**Files to Create:**
None

**Files to Modify:**

- `src/app/(app)/collections/[id]/page.tsx` - Collection detail page
- `src/app/(app)/collections/[collectionId]/subcollections/[subcollectionId]/page.tsx` - Subcollection detail page
- `src/app/(app)/bobbleheads/[id]/page.tsx` - Bobblehead detail page

**Changes:**

- Import FavoriteButton component into each detail page
- Fetch current favorite status for the authenticated user in server component
- Pass entityType, entityId, and initialFavorited props to FavoriteButton
- Position button in header section near other action buttons
- Ensure proper layout with existing UI elements
- Add conditional rendering based on authentication status
- Include proper error boundaries for button failures

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] FavoriteButton appears on all three entity detail pages
- [ ] Button positioned consistently across pages
- [ ] Initial favorite status correctly loaded from database
- [ ] Button functions correctly on all pages
- [ ] UI integrates seamlessly with existing layouts
- [ ] All validation commands pass

---

### Step 10: Add Favorite Counts to Entity Cards

**What**: Display favorite counts on collection, subcollection, and bobblehead cards in listing views
**Why**: Provides social proof and engagement metrics visible in browse/search results
**Confidence**: Medium

**Files to Create:**
None

**Files to Modify:**

- `src/components/feature/collections/collection-card.tsx` - Collection card component
- `src/components/feature/subcollections/subcollection-card.tsx` - Subcollection card component
- `src/components/feature/bobbleheads/bobblehead-card.tsx` - Bobblehead card component
- Database schema files to add denormalized favoritesCount columns (collections.ts, subcollections.ts, bobbleheads.ts)

**Changes:**

- Add favoritesCount column to collections, subcollections, and bobbleheads tables in schema
- Generate and run migration to add denormalized count columns with default value 0
- Create database triggers or update facades to maintain accurate counts on favorite add/remove
- Import Heart icon from Lucide React in card components
- Display favorite count with icon in card footer alongside existing social metrics
- Add conditional rendering to show count only when greater than zero
- Style consistently with existing likes/comments counts
- Update queries to include favoritesCount in card data fetching

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run db:generate
```

**Success Criteria:**

- [ ] favoritesCount columns added to all entity tables
- [ ] Migration executed successfully
- [ ] Counts display correctly on all card types
- [ ] Counts update properly when favorites change
- [ ] UI styling matches existing social metric displays
- [ ] All validation commands pass

---

### Step 11: Create Favorites Dashboard Page

**What**: Build dedicated favorites view in user dashboard with filtering and sorting
**Why**: Provides centralized location for users to manage and browse their favorited items
**Confidence**: Medium-High

**Files to Create:**

- `src/app/(app)/dashboard/favorites/page.tsx` - Favorites dashboard page component
- `src/components/feature/favorites/favorites-table.tsx` - Table component for favorites display
- `src/components/feature/favorites/favorites-filters.tsx` - Filter controls component

**Files to Modify:**

- Navigation components to add link to favorites page

**Changes:**

- Create server component page fetching user favorites with pagination
- Implement FavoritesTable using TanStack React Table with columns for entity type, name, image, date favorited
- Add entity type filter using Nuqs for URL state management
- Implement sorting by date favorited (newest/oldest)
- Create FavoritesFilters component with entity type tabs/select
- Add pagination controls using existing pagination components
- Include empty state when no favorites exist
- Add remove favorite action from table rows
- Link entity names to their detail pages
- Implement responsive design for mobile/tablet/desktop
- Add loading states using Suspense boundaries

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Favorites page renders with proper layout
- [ ] Table displays all favorited items correctly
- [ ] Filtering by entity type works via URL parameters
- [ ] Sorting options function properly
- [ ] Pagination navigates through results
- [ ] Empty state displays when appropriate
- [ ] Links to entities work correctly
- [ ] All validation commands pass

---

### Step 12: Add Favorites Navigation Link

**What**: Add favorites link to user dashboard navigation and mobile menu
**Why**: Provides discoverable access point to favorites feature
**Confidence**: High

**Files to Create:**
None

**Files to Modify:**

- `src/components/layout/dashboard-nav.tsx` - Dashboard navigation component
- `src/components/layout/mobile-nav.tsx` - Mobile navigation component (if exists)

**Changes:**

- Import Heart icon from Lucide React
- Add favorites nav item with icon, label, and route to /dashboard/favorites
- Position near other dashboard sections like collections, bobbleheads
- Ensure consistent styling with existing nav items
- Add active state highlighting when on favorites page
- Update mobile navigation if separate component exists
- Add proper aria-labels for accessibility

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Favorites link appears in dashboard navigation
- [ ] Link routes correctly to favorites page
- [ ] Active state highlights properly
- [ ] Icon and styling match existing nav items
- [ ] Mobile navigation updated if applicable
- [ ] All validation commands pass

---

### Step 13: Implement Bulk Favorite Status Fetching for Listing Pages

**What**: Add efficient batch queries to check favorite status for multiple entities on listing pages
**Why**: Enables showing favorite indicators on cards in browse/search without N+1 query issues
**Confidence**: Medium

**Files to Create:**
None

**Files to Modify:**

- `src/lib/queries/favorites.ts` - Add bulk status query (from Step 4 if not already included)
- Collection, subcollection, and bobblehead listing page components

**Changes:**

- Ensure getBulkFavoriteStatus query exists accepting array of entity IDs and type
- Update listing pages to fetch favorite statuses for all displayed entities in single query
- Pass favorite status to card components as prop
- Add FavoriteButton to cards with small variant
- Implement conditional rendering based on authentication
- Optimize query to use WHERE IN clause for efficiency
- Cache favorite status data appropriately

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Bulk query fetches all statuses in single database call
- [ ] Listing pages show favorite indicators on cards
- [ ] No N+1 query issues in database logs
- [ ] Performance remains acceptable with pagination
- [ ] Favorite buttons function on listing cards
- [ ] All validation commands pass

---

### Step 14: Add Cache Invalidation to Favorites Operations

**What**: Implement comprehensive cache invalidation strategy for all favorites mutations
**Why**: Ensures UI reflects accurate favorite status across all views after changes
**Confidence**: High

**Files to Create:**
None

**Files to Modify:**

- `src/lib/facades/favorites.ts` - Update with cache invalidation (from Step 5)
- `src/lib/cache/tags.ts` - Ensure all tags defined (from Step 5)

**Changes:**

- Add revalidateTag calls in facades for FAVORITES_BY_USER tag on any user favorite change
- Invalidate FAVORITES_BY_ENTITY tag for specific entity when favorites change
- Invalidate FAVORITES_COUNT tag to update denormalized counts
- Add revalidatePath calls for affected routes in server actions
- Ensure entity detail pages revalidate on favorite toggle
- Add user favorites dashboard path revalidation
- Test cache invalidation with multiple tabs/windows open
- Verify counts update across all views

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All relevant cache tags invalidated on mutations
- [ ] UI updates across different pages after favorite changes
- [ ] Counts reflect accurate values after revalidation
- [ ] Multiple browser tabs show consistent state
- [ ] No stale data displayed after operations
- [ ] All validation commands pass

---

### Step 15: Add Database Indexes for Query Optimization

**What**: Verify and add additional database indexes for favorites query performance
**Why**: Ensures fast query execution for user favorites and entity favorite counts
**Confidence**: High

**Files to Create:**
None

**Files to Modify:**

- `src/lib/db/schema/favorites.ts` - Add any missing indexes (should be from Step 1)

**Changes:**

- Verify index on userId for getUserFavorites query
- Confirm composite index on (entityType, entityId) for favorites count queries
- Add index on createdAt if sorting by date is common
- Consider covering index on (userId, entityType, createdAt) for filtered favorites queries
- Generate migration if new indexes added
- Run EXPLAIN ANALYZE on common queries to verify index usage
- Test query performance with significant data volume

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run db:generate
/db optimize query [common favorites query]
```

**Success Criteria:**

- [ ] All necessary indexes created in database
- [ ] EXPLAIN ANALYZE shows index usage for queries
- [ ] Query performance acceptable under load
- [ ] No full table scans on favorites table
- [ ] Migration executed successfully if needed
- [ ] All validation commands pass

---

### Step 16: Implement Error Handling and Edge Cases

**What**: Add comprehensive error handling for authentication, authorization, and data integrity issues
**Why**: Ensures robust operation under failure conditions and provides clear user feedback
**Confidence**: High

**Files to Create:**
None

**Files to Modify:**

- `src/lib/actions/favorites.ts` - Enhance error handling
- `src/components/ui/favorite-button.tsx` - Add error displays
- `src/app/(app)/dashboard/favorites/page.tsx` - Add error boundaries

**Changes:**

- Add authentication error handling in server actions with appropriate error messages
- Implement authorization checks preventing users from favoriting non-public entities
- Handle database constraint violations gracefully (duplicate favorites)
- Add error boundaries around favorites components
- Implement retry logic for transient failures
- Add user-friendly error messages in toast notifications
- Handle cases where entity no longer exists
- Add validation for maximum favorites per user if needed
- Test error scenarios: unauthenticated, unauthorized, network failures, database errors

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Authentication errors handled with redirect to sign-in
- [ ] Duplicate favorite attempts handled gracefully
- [ ] User receives clear error messages
- [ ] Error boundaries prevent full page crashes
- [ ] Deleted entity references handled properly
- [ ] All validation commands pass

---

### Step 17: Add TypeScript Types and Exports

**What**: Create comprehensive TypeScript types and ensure proper exports for favorites feature
**Why**: Maintains type safety across the application and enables IDE autocomplete
**Confidence**: High

**Files to Create:**

- `src/lib/types/favorites.ts` - Type definitions for favorites feature

**Files to Modify:**

- `src/lib/types/index.ts` - Export favorites types if barrel file exists (though project avoids barrel files)

**Changes:**

- Define EntityType enum or union type for collection/subcollection/bobblehead
- Create Favorite type inferred from Drizzle schema
- Define FavoriteWithEntity type including joined entity data
- Create FavoritesFilter type for dashboard filtering
- Add FavoriteButtonProps interface
- Define return types for all queries and facades
- Ensure all types exported from their respective files
- Add JSDoc comments for complex types
- Verify type inference works correctly in all components

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All types properly defined and documented
- [ ] Type inference works in IDE
- [ ] No any types used anywhere in favorites feature
- [ ] Complex types have helpful JSDoc comments
- [ ] TypeScript compilation succeeds without errors
- [ ] All validation commands pass

---

### Step 18: Write Unit Tests for Queries and Facades

**What**: Create comprehensive unit tests for favorites queries and business logic
**Why**: Ensures correctness of core favorites functionality and prevents regressions
**Confidence**: Medium

**Files to Create:**

- `tests/lib/queries/favorites.test.ts` - Unit tests for favorites queries
- `tests/lib/facades/favorites.test.ts` - Unit tests for favorites facades

**Files to Modify:**
None

**Changes:**

- Set up test database with Testcontainers for integration tests
- Write tests for getFavoritesByUserId with various filters
- Test getFavoriteStatus for all entity types
- Verify getFavoritesCountByEntity returns accurate counts
- Test addFavorite facade with duplicate handling
- Verify removeFavorite facade deletes correctly
- Test toggleFavorite facade for both add and remove paths
- Mock cache invalidation calls and verify they are triggered
- Test error cases and boundary conditions
- Achieve high code coverage on queries and facades

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run test tests/lib/queries/favorites.test.ts
npm run test tests/lib/facades/favorites.test.ts
```

**Success Criteria:**

- [ ] All query functions have test coverage
- [ ] All facade functions tested including error paths
- [ ] Tests pass consistently
- [ ] Edge cases covered (empty results, duplicates, etc.)
- [ ] Cache invalidation verified in tests
- [ ] All validation commands pass

---

### Step 19: Write Integration Tests for Server Actions

**What**: Create integration tests for favorites server actions with authentication
**Why**: Validates end-to-end functionality including authentication and database operations
**Confidence**: Medium

**Files to Create:**

- `tests/lib/actions/favorites.test.ts` - Integration tests for favorites actions

**Files to Modify:**
None

**Changes:**

- Mock Clerk authentication in test environment
- Test toggleFavoriteAction with authenticated user
- Verify action rejects unauthenticated requests
- Test validation schema enforcement
- Verify database state changes after action execution
- Test cache invalidation triggers
- Mock next-safe-action utilities if needed
- Test concurrent favorite operations
- Verify error handling for invalid entity IDs
- Test authorization for private entities

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run test tests/lib/actions/favorites.test.ts
```

**Success Criteria:**

- [ ] Server actions tested with mocked authentication
- [ ] Validation schema enforcement verified
- [ ] Database changes verified after actions
- [ ] Authentication checks tested
- [ ] Error cases covered
- [ ] All validation commands pass

---

### Step 20: Write Component Tests for Favorite Button

**What**: Create component tests for FavoriteButton using Testing Library
**Why**: Ensures UI component behaves correctly under various states and user interactions
**Confidence**: Medium

**Files to Create:**

- `tests/components/ui/favorite-button.test.tsx` - Component tests for FavoriteButton

**Files to Modify:**
None

**Changes:**

- Set up Testing Library with React 19 compatibility
- Mock useOptimisticFavorite hook
- Test button renders in favorited and unfavorited states
- Verify icon changes on click
- Test loading state during action execution
- Verify toast notifications appear on success/error
- Test accessibility with aria-label assertions
- Mock authentication state for unauthenticated tests
- Verify button disabled during loading
- Test keyboard navigation and interaction

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run test tests/components/ui/favorite-button.test.tsx
```

**Success Criteria:**

- [ ] Component renders correctly in all states
- [ ] User interactions trigger expected behavior
- [ ] Loading states tested
- [ ] Toast notifications verified
- [ ] Accessibility assertions pass
- [ ] All validation commands pass

---

### Step 21: Update Documentation and Add Feature Logging

**What**: Document the favorites feature implementation and create operation logs
**Why**: Provides reference for future development and tracks implementation decisions
**Confidence**: High

**Files to Create:**

- `docs/2025_10_22/specs/FavoritesFeature.md` - Feature specification and implementation notes
- `docs/2025_10_22/database/favorites-schema.md` - Database schema documentation

**Files to Modify:**

- `CLAUDE.md` - Add favorites feature to key features list if appropriate

**Changes:**

- Document database schema design with entity-relationship diagram
- List all API endpoints and server actions for favorites
- Document cache invalidation strategy
- Add usage examples for FavoriteButton component
- Document TypeScript types and interfaces
- List all database indexes and their purposes
- Add troubleshooting section for common issues
- Document testing approach and coverage
- Add migration history for favorites table
- Update main project documentation with favorites feature

**Validation Commands:**

```bash
npm run lint:fix
```

**Success Criteria:**

- [ ] All documentation files created in correct docs folder
- [ ] Schema and API documented comprehensively
- [ ] Usage examples clear and accurate
- [ ] Main project docs updated
- [ ] Documentation formatted properly
- [ ] All validation commands pass

---

### Step 22: Performance Testing and Optimization

**What**: Conduct performance testing on favorites queries and optimize as needed
**Why**: Ensures feature performs well under realistic load conditions
**Confidence**: Medium

**Files to Create:**
None

**Files to Modify:**

- Database schema or queries if optimization needed based on testing results

**Changes:**

- Use `/db check performance` to identify slow queries related to favorites
- Test getUserFavorites query with large datasets (1000+ favorites)
- Verify bulk favorite status query performance on listing pages
- Test favorites count updates under concurrent load
- Use EXPLAIN ANALYZE to verify index usage
- Optimize queries if needed based on performance metrics
- Consider adding materialized view for complex aggregations if needed
- Test cache hit rates and adjust cache strategy if needed
- Benchmark favorite toggle action response time
- Document performance characteristics and limits

**Validation Commands:**

```bash
/db check performance
/db optimize query [identified slow query]
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All favorites queries perform under acceptable thresholds
- [ ] No slow queries identified by database monitoring
- [ ] Index usage verified for all common queries
- [ ] Cache strategy effective in reducing database load
- [ ] Performance documented for future reference
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck` without errors
- [ ] All files pass `npm run lint:fix` without warnings
- [ ] Database migrations executed successfully on development branch
- [ ] All unit tests pass with adequate coverage (target: 80%+)
- [ ] All integration tests pass
- [ ] All component tests pass
- [ ] Manual testing completed on all entity types (collections, subcollections, bobbleheads)
- [ ] Favorites dashboard tested with various filters and pagination
- [ ] Performance testing shows acceptable query times
- [ ] Cache invalidation verified across multiple browser tabs
- [ ] Authentication and authorization checks functioning correctly
- [ ] Error handling tested for all failure scenarios
- [ ] UI components responsive on mobile, tablet, and desktop
- [ ] Accessibility standards met (aria-labels, keyboard navigation)
- [ ] Documentation complete and accurate

## Notes

### Database Safety

- All database operations should use the `/db` command and Neon DB Expert subagent
- Development branch (`br-dark-forest-adf48tll`) will be used for all migrations and testing
- Production branch operations blocked by automatic validation

### Architecture Decisions

- Using polymorphic association pattern (entityType + entityId) following existing likes table design
- Denormalized favoritesCount columns on entity tables for performance, maintained via facades
- Three-layer architecture (Query → Facade → Action) maintains separation of concerns
- Optimistic UI updates provide immediate feedback while maintaining data consistency

### Performance Considerations

- Composite unique constraint prevents duplicate favorites at database level
- Strategic indexes on userId, entityType, entityId optimize common query patterns
- Bulk status fetching prevents N+1 queries on listing pages
- Cache invalidation strategy balances freshness with performance

### Testing Strategy

- Unit tests focus on queries and facades with Testcontainers for database
- Integration tests verify server actions with mocked authentication
- Component tests ensure UI behaves correctly under all states
- Performance testing validates scalability under load

### Risk Mitigation

- Step-by-step approach allows validation at each stage
- Existing social features (likes, follows) provide proven patterns to follow
- Comprehensive error handling prevents poor user experience
- Cache invalidation testing prevents stale data issues

### Authentication Integration

- Clerk userId used for all user associations
- Unauthenticated users see favorites but cannot interact
- Redirect to sign-in for unauthenticated favorite attempts

### Future Enhancements (Out of Scope)

- Email notifications when favorited items updated
- Favorites sharing between users
- Public favorites collections
- Favorites analytics and trending items based on favorites
- Bulk favorite operations (favorite entire collection)
