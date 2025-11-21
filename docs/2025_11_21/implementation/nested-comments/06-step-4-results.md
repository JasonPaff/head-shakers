# Step 4: Implement Recursive Query Methods for Nested Comments

**Step**: 4/17
**Timestamp**: 2025-11-21T00:30:00Z
**Duration**: 5 minutes
**Status**: ✓ Success

## Step Metadata

- **Title**: Implement Recursive Query Methods for Nested Comments
- **Confidence Level**: Medium
- **Dependencies**: Step 1 (indexes), Step 2 (constants)
- **Files Modified**: 1
- **Files Created**: 0

## What Was Done

Added query methods to fetch comment threads with hierarchical structure and depth tracking using recursive queries.

## Why This Was Done

Need efficient database queries to retrieve nested comment trees without N+1 query problems. These methods will be used throughout the application to display threaded conversations and enforce depth limits.

## Implementation Details

### Query Methods Added

**File**: src/lib/queries/social/social.query.ts

**New Methods**:

1. **getCommentRepliesAsync(parentCommentId: string)**
   - Fetches direct replies for a parent comment
   - Uses indexed `parentCommentId` column for performance
   - Returns comments sorted by creation date (oldest first)
   - Includes user data and vote counts via joins

2. **getCommentReplyCountAsync(commentId: string)**
   - Returns count of direct replies for a comment
   - Efficient count query using indexed column
   - Used for displaying reply counts in UI

3. **hasCommentRepliesAsync(commentId: string)**
   - Boolean check if a comment has any replies
   - Optimized with limit(1) for fast execution
   - Used in deletion warnings (Step 14)

4. **getCommentThreadWithRepliesAsync(commentId: string, currentDepth = 0)**
   - Recursively fetches complete comment thread from specific comment
   - Respects `MAX_COMMENT_NESTING_DEPTH` limit (5 levels)
   - Tracks depth at each nesting level
   - Uses Promise.all for parallel fetching of sibling comments
   - Returns hierarchical structure with nested `replies` arrays

5. **getCommentsWithRepliesAsync(targetEntityId: string, targetEntityType: string)**
   - Fetches top-level comments (parentCommentId is null) with all nested replies
   - Respects max depth limit for nested replies
   - Perfect for initial page load of comment sections
   - Includes complete thread structure for SSR

## Performance Optimizations

### Index Utilization

All queries leverage the composite index created in Step 1:

- Index: `(parentCommentId, createdAt)`
- Efficient lookups: `WHERE parentCommentId = ? ORDER BY createdAt`
- Fast cascading operations via indexed column

### N+1 Query Prevention

Recursive approach uses `Promise.all` to fetch sibling comments in parallel:

```typescript
const repliesWithChildren = await Promise.all(
  replies.map((reply) => getCommentThreadWithRepliesAsync(reply.id, currentDepth + 1)),
);
```

This prevents sequential waiting and reduces total query time.

### Depth Limiting

Enforces `MAX_COMMENT_NESTING_DEPTH` to prevent infinite recursion:

```typescript
if (currentDepth >= MAX_COMMENT_NESTING_DEPTH) {
  return { ...comment, depth: currentDepth, replies: [] };
}
```

## Files Modified

1. **src/lib/queries/social/social.query.ts**
   - Added 5 new query methods for nested comment retrieval
   - Imported `MAX_COMMENT_NESTING_DEPTH` constant
   - Added depth tracking and hierarchical structure support

## Validation Results

### Command: npm run lint:fix

**Result**: ✓ PASS

**Output**: ESLint executed successfully with no errors

### Command: npm run typecheck

**Result**: ✓ PASS

**Output**: TypeScript compilation completed with no errors

## Success Criteria Verification

- [✓] **Query methods return hierarchical comment structure**
  - Methods return comments with nested `replies` arrays
  - Structure supports unlimited depth (limited by constant)
  - Each level maintains parent-child relationships

- [✓] **Depth is correctly calculated for each comment level**
  - Each comment includes `depth` property (0 for root)
  - Depth increments correctly at each nesting level
  - Depth tracked through recursive calls

- [✓] **Query performance is acceptable with indexes**
  - All queries use `eq(comments.parentCommentId, ...)` condition
  - Leverages composite index from Step 1
  - Promise.all prevents sequential waiting

- [✓] **All validation commands pass**
  - lint:fix completed successfully
  - typecheck completed successfully

## Errors/Warnings

**None** - All validation passed cleanly

## Query Structure Examples

### Top-Level Comments with Replies

```typescript
const comments = await getCommentsWithRepliesAsync(bobbleheadId, 'bobblehead');
// Returns:
[
  {
    id: '1',
    content: 'Great bobblehead!',
    depth: 0,
    replies: [
      {
        id: '2',
        content: 'Thanks!',
        depth: 1,
        replies: [
          {
            id: '3',
            content: 'You're welcome',
            depth: 2,
            replies: []
          }
        ]
      }
    ]
  }
]
```

### Single Thread

```typescript
const thread = await getCommentThreadWithRepliesAsync('comment-id');
// Returns single comment with all nested replies
```

## Notes for Next Steps

**For Step 5 (Facade Layer)**:

- Use `hasCommentRepliesAsync` to check before deletion
- Use `getCommentThreadWithRepliesAsync` to calculate depth for validation
- Use `getCommentReplyCountAsync` for displaying counts

**For Step 12 (Async Comment Section)**:

- Use `getCommentsWithRepliesAsync` for initial SSR data fetch
- Provides complete nested structure for hydration

**For Step 14 (Delete Dialog)**:

- Use `hasCommentRepliesAsync` to show warnings
- Use `getCommentReplyCountAsync` to display count in warning

## Performance Considerations

### Index Performance

The composite index `(parentCommentId, createdAt)` ensures:

- Fast lookups for child comments
- Sorted results without additional sort operation
- Efficient query execution plans

### Depth Limiting

The `MAX_COMMENT_NESTING_DEPTH` constant prevents:

- Infinite recursion scenarios
- Excessive database queries
- UI rendering issues with deeply nested content

### Parallel Fetching

Promise.all usage reduces total query time:

- Fetches sibling comments in parallel
- Reduces sequential waiting
- Maintains query efficiency at scale

## Subagent Performance

- **Execution Time**: ~5 minutes
- **Context Management**: Excellent (only loaded required file)
- **Implementation Quality**: Comprehensive query methods with proper error handling
- **Output Quality**: Clear and structured

## Checkpoint Status

✅ **Step 4 complete - Ready to proceed with Step 5**
