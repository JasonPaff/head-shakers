# Step 6: Enhance Server Actions for Reply Operations

**Step**: 6/17
**Timestamp**: 2025-11-21T00:40:00Z
**Duration**: 4 minutes
**Status**: ✓ Success

## Step Metadata

- **Title**: Enhance Server Actions for Reply Operations
- **Confidence Level**: High
- **Dependencies**: Steps 3 (validation), 5 (facade)
- **Files Modified**: 2
- **Files Created**: 0

## What Was Done

Updated Next-Safe-Action server actions to handle `parentCommentId` parameter with validation and route to appropriate facade methods.

## Why This Was Done

Server actions are the entry point for mutations and need to support reply-specific logic. They bridge the client UI and the facade layer, providing type-safe, validated operations with proper error handling.

## Implementation Details

### Action Enhancement

**File**: src/lib/actions/social/social.actions.ts

**Changes**:
- Updated `createCommentAction` to accept optional `parentCommentId` parameter
- Added conditional routing logic:
  - If `parentCommentId` present → call `createCommentReply`
  - If not present → call `createComment` (existing behavior)
- Added error message mapping for user-friendly feedback
- Enhanced Sentry tracking with `isReply` and `parentCommentId` context
- Maintained existing authorization checks via `authActionClient`

**File**: src/lib/facades/social/social.facade.ts

**Changes**:
- Added optional `error` field to `CommentMutationResult` interface
- Updated `createCommentReply` to return descriptive error messages

## Error Message Mapping

### User-Friendly Error Messages

**Parent Not Found**:
- Facade: "Parent comment not found"
- User: "The comment you are replying to no longer exists"

**Deleted Parent**:
- Facade: "Cannot reply to deleted comment"
- User: "Cannot reply to this comment as it has been removed"

**Entity Mismatch**:
- Facade: "Parent comment belongs to different entity"
- User: "Cannot reply to this comment. It belongs to a different item"

**Depth Exceeded**:
- Facade: "Maximum nesting depth exceeded"
- User: "Cannot reply to this comment. The conversation thread has reached its maximum depth (5 levels)"

### Error Handling Strategy

All errors provide:
- Clear explanation of what went wrong
- Context about why the operation failed
- Actionable information for the user

## Authorization

### Authentication Checks

Existing authorization maintained:
- Uses `authActionClient` from Next-Safe-Action
- Requires authenticated user
- Validates user permissions
- Includes rate limiting and security checks

### Permission Validation

Same authorization model for both:
- Top-level comments
- Reply comments

No special permissions needed for replies.

## Files Modified

1. **src/lib/actions/social/social.actions.ts**
   - Updated `createCommentAction` with reply routing logic
   - Added error message mapping
   - Enhanced Sentry tracking

2. **src/lib/facades/social/social.facade.ts**
   - Added `error` field to result interface
   - Updated `createCommentReply` error responses

## Validation Results

### Command: npm run lint:fix

**Result**: ✓ PASS

**Output**: All ESLint checks passed with no errors or warnings

### Command: npm run typecheck

**Result**: ✓ PASS

**Output**: TypeScript compilation completed successfully with no type errors

## Success Criteria Verification

- [✓] **Action accepts `parentCommentId` parameter correctly**
  - Schema already supports optional `parentCommentId` from Step 3
  - Action routes to appropriate facade method based on presence

- [✓] **Validation errors return user-friendly messages**
  - All facade errors mapped to clear, actionable user messages
  - Context provided for each failure scenario

- [✓] **Authorization checks pass for valid scenarios**
  - `authActionClient` ensures authentication
  - Existing permission model maintained

- [✓] **All validation commands pass**
  - lint:fix completed successfully
  - typecheck completed successfully

## Errors/Warnings

**None** - All validation passed cleanly

## Routing Logic Flow

### Request Flow

1. **Client Submits Form**:
   - Includes `parentCommentId` if replying
   - Uses same action for both top-level and replies

2. **Action Layer**:
   - Validates schema (Zod validation from Step 3)
   - Checks authentication
   - Routes based on `parentCommentId` presence

3. **Facade Layer**:
   - Performs business logic validations (Step 5)
   - Executes database operations
   - Invalidates caches

4. **Response**:
   - Success: Returns created comment
   - Failure: Returns user-friendly error message

### Code Structure

```typescript
if (parentCommentId) {
  result = await SocialFacade.createCommentReply({ ...data });
} else {
  result = await SocialFacade.createComment({ ...data });
}

if (!result.success && result.error) {
  // Map to user-friendly message
  const userMessage = errorMessageMap[result.error] || result.error;
  return { success: false, error: userMessage };
}
```

## Observability

### Sentry Tracking

Enhanced tracking includes:
- `isReply`: Boolean indicating if operation is a reply
- `parentCommentId`: Parent comment ID if present
- `targetEntityType`: Type of entity being commented on
- `targetEntityId`: ID of entity being commented on

This enables:
- Better error tracking
- Performance monitoring of reply operations
- Analytics on reply usage patterns

## Transaction Safety

Operations maintain ACID properties:
- Atomic: All-or-nothing database operations
- Consistent: Enforces all validation rules
- Isolated: Transaction isolation via Drizzle
- Durable: Changes persisted reliably

## Notes for Next Steps

**For Step 7 (Cache Management)**:
- Verify cache invalidation patterns work correctly
- Ensure parent comment cache updates on reply

**For Step 10 (Comment Form)**:
- Form will call this action with `parentCommentId` when in reply mode
- Display error messages from action response
- Handle loading states during submission

**For Step 11 (Comment Section)**:
- Coordinate reply state to provide `parentCommentId` to form
- Handle success/error responses from action

## Type Safety

TypeScript ensures:
- Schema validation catches invalid data at compile-time
- Action parameters match validation schema
- Facade methods have correct signatures
- Error handling covers all cases

## Performance Considerations

### Efficient Routing

Single action for both operations:
- Reduces code duplication
- Simplifies client-side logic
- Maintains consistent API

### Cache Strategy

Action doesn't handle cache directly:
- Facade layer manages cache invalidation
- Separation of concerns maintained
- Cache patterns consistent across operations

## Subagent Performance

- **Execution Time**: ~4 minutes
- **Context Management**: Excellent (only loaded required files)
- **Implementation Quality**: Proper error handling and routing logic
- **Output Quality**: Clear and structured

## Checkpoint Status

✅ **Step 6 complete - Ready to proceed with Step 7**

**Progress Summary**:
- Backend data layer complete (Steps 1-6)
- Next: Cache management verification (Step 7)
- Then: UI component implementation (Steps 8-16)
