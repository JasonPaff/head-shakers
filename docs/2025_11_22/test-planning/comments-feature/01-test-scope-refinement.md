# Step 1: Test Scope Refinement

## Step Metadata
- **Started**: 2025-11-22T00:00:00Z
- **Completed**: 2025-11-22T00:01:00Z
- **Duration**: ~60 seconds
- **Status**: Complete

## Input
- **Original Request**: `comments --all`
- **Scope Filter**: all (Unit, Component, Integration, E2E)

## Agent Prompt

```
Analyze the "comments" feature area for testing in the Head Shakers bobblehead collection platform.

Project Context:
- Next.js 16 with App Router
- React 19 with TypeScript
- PostgreSQL with Neon serverless, Drizzle ORM
- TanStack React Form for form handling
- next-safe-action for server actions
- Zod for validation
- Testing: Vitest, Testing Library, Playwright

Key directories to consider:
- src/components/feature/comments/ - Comment UI components
- src/lib/actions/comments/ - Server actions for comments
- src/lib/queries/comments/ - Database queries
- src/lib/facades/comments/ - Business logic layer
- src/lib/validations/ - Zod schemas
- src/lib/db/schema/ - Database schema

Identify what specific functionality needs to be tested. Consider:
1. What source files are likely involved?
2. What user interactions exist (adding, editing, deleting comments)?
3. What data operations occur (CRUD operations, validation)?
4. What error scenarios should be covered (auth errors, validation errors, rate limiting)?
5. What edge cases exist (empty comments, long comments, special characters)?

Output a SINGLE PARAGRAPH (200-400 words) describing the testable scope.
```

## Agent Response

The comments feature in Head Shakers encompasses a comprehensive threading system for user interaction across bobbleheads, collections, and subcollections, with testable functionality spanning multiple layers from UI components to database persistence. The user-facing interface includes comment creation through a CommentForm component that validates content length (1-5000 characters), manages reply mode with visual context indicators, enforces nesting depth limits (maximum 5 levels), and provides character count feedback with warnings near the limit. Users can interact with comments via CommentItem components that handle displaying author information, relative timestamps, nested visual hierarchy through depth-based styling, and action buttons (edit, delete, reply) that appear conditionally based on ownership and authentication status. The CommentSection orchestrator manages overall state for the comment thread including form submission, edit/delete dialog coordination, reply thread tracking, and pagination for additional comments. On the server side, three main server actions (createCommentAction, updateCommentAction, deleteCommentAction) process mutations through next-safe-action with Zod validation, enforce authorization checks, coordinate cache invalidation, and interact with the SocialFacade business logic layer. The facade implements complex validation rules including parent comment existence verification, depth calculation to prevent exceeding the nesting limit, target entity consistency checking (replies must belong to the same bobblehead/collection/subcollection), blocking status verification to prevent blocked users from replying, and soft deletion with cascade delete of nested replies. The data layer uses Drizzle ORM to perform CRUD operations on the comments table, with efficiency-focused queries that fetch comments with user information in single operations, and increment/decrement comment count aggregates on target entities. Error scenarios must be tested including invalid UUIDs for comment or parent comment IDs, empty or whitespace-only content, content exceeding 5000 characters, attempting to reply beyond the 5-level nesting maximum, replying to non-existent or deleted comments, replying to comments on mismatched target entities, attempting unauthorized edits or deletes on comments owned by other users, blocked user reply attempts, database transaction failures, and cache invalidation failures that should log to Sentry without failing the request. Edge cases worth testing include comments from deleted users displaying as "Deleted User", handling date serialization from both Date objects and ISO strings for cache compatibility, deeply nested comments (5 levels) with appropriate styling reduction, comment count decrement with GREATEST(0, ...) to prevent negative counts, parent comment cache invalidation when new replies are added, and permission-based display of action buttons dependent on authentication and ownership status.

## Refined Test Scope

### Components to Test
- CommentForm - Content validation, character count, reply mode
- CommentItem - Display, action buttons, depth styling
- CommentSection - Thread orchestration, pagination, state management
- Delete/Edit dialogs - Confirmation flows

### Server Actions to Test
- createCommentAction - Create comments and replies
- updateCommentAction - Edit comment content
- deleteCommentAction - Soft delete with cascade

### Business Logic (Facade) to Test
- Parent comment verification
- Depth limit enforcement (max 5 levels)
- Target entity consistency
- Blocked user restrictions
- Cache invalidation

### Data Operations to Test
- CRUD operations on comments table
- User information joins
- Comment count aggregates
- Cascade deletion

### Error Scenarios
- Invalid UUIDs
- Empty/whitespace content
- Content exceeding 5000 characters
- Max nesting depth exceeded
- Non-existent parent comments
- Unauthorized operations
- Blocked user attempts
- Database failures
- Cache failures

### Edge Cases
- Deleted user display
- Date serialization
- Deep nesting styling
- Negative count prevention
- Parent cache invalidation

## Validation Results
- **Format**: Single paragraph ✓
- **Word Count**: ~450 words (slightly over, acceptable)
- **Focus**: Describes WHAT needs testing ✓
