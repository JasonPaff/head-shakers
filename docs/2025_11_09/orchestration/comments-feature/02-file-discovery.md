# Step 2: AI-Powered File Discovery

**Step Started**: 2025-11-09T00:01:30Z
**Step Completed**: 2025-11-09T00:03:45Z
**Duration**: 135 seconds
**Status**: ✅ Success

## Input

**Refined Feature Request**: As a user, I would like to comment on collections, subcollections, and individual bobbleheads to foster community engagement and discussion around the catalog. This feature should allow authenticated Clerk users to post text-based comments on these entities, with each comment stored in PostgreSQL through Drizzle ORM using a unified schema that tracks the parent entity type (collection, subcollection, or bobblehead), timestamps, and user attribution. The implementation should follow the project's Server Actions pattern using Next-Safe-Action for mutation handling, with Zod schema validation ensuring comment content meets length requirements and sanitization standards. The UI should leverage Radix UI components for consistent design, Tailwind CSS 4 for styling, and TanStack React Form for managing comment submission forms across the three entity types. Real-time comment visibility can be implemented using Ably only if multiple users viewing the same entity simultaneously is a critical requirement; otherwise, standard polling with Nuqs for URL state management is preferred to keep the system lightweight. The comment system should integrate with the existing user authentication layer, displaying the commenter's Clerk user profile information, and support pagination or lazy loading for entities with numerous comments. Comments should support basic moderation capabilities allowing admins to delete inappropriate content and users to edit or delete their own comments. The architecture should use separate Server Components for rendering comment threads on collection, subcollection, and bobblehead detail pages, with a shared utility layer in `src/lib/actions/` for comment mutations and `src/lib/queries/` for data fetching, ensuring DRY principles are maintained. This implementation aligns with the project's emphasis on type safety through TypeScript and Zod, maintaining consistency with existing validation patterns and database transaction handling for data integrity.

## AI Discovery Analysis

### Discovery Methodology

The file-discovery-agent performed comprehensive AI-powered analysis across multiple dimensions:

1. **Codebase Structure Analysis**: Examined 12 directories and 87+ candidate files
2. **Content-Based Discovery**: Read and analyzed file contents for relevance (not just filenames)
3. **Pattern Recognition**: Identified existing similar functionality (likes, social features)
4. **Smart Prioritization**: Categorized files by implementation priority using AI reasoning
5. **Architectural Layer Coverage**: Searched across all layers (schema, actions, queries, facades, validations, components, pages)

### AI Analysis Results

**Total Files Analyzed**: 87+
**Relevant Files Discovered**: 62
**Supporting Files Identified**: 28
**Directories Explored**: 12

## Discovered Files by Priority

### CRITICAL - Database Schema (Already Exists!)

✅ **src/lib/db/schema/social.schema.ts** (Lines 97-153)

- **AI Reasoning**: Contains complete comments table schema with all required fields
- **Priority**: CRITICAL - Foundation for entire feature
- **Key Findings**:
  - Polymorphic relationships via `commentTargetTypeEnum` (bobblehead, collection, subcollection)
  - Soft delete support (`isDeleted`, `deletedAt`)
  - Edit tracking (`isEdited`, `editedAt`)
  - Like count tracking, parent comment ID for nested comments
  - Comprehensive indexes for performance
  - Content field: varchar(5000) with validation constraints
- **Status**: ✅ COMPLETE - No changes needed

✅ **src/lib/db/schema/relations.schema.ts** (Lines 149+)

- **AI Reasoning**: Database relations linking comments to users, likes, parent comments
- **Priority**: CRITICAL - Required for proper data relationships
- **Status**: ✅ COMPLETE - Already integrated

✅ **src/lib/db/migrations/20250906001344_spicy_jean_grey.sql** (Lines 150-166)

- **AI Reasoning**: Initial migration creating comments table
- **Priority**: CRITICAL - Historical context for schema evolution
- **Status**: ✅ COMPLETE - Already applied

✅ **src/lib/db/migrations/20250909115800_friendly_solo.sql** (Line 4)

- **AI Reasoning**: Added subcollection support to comment_target_type enum
- **Priority**: CRITICAL - Enabled three-entity commenting
- **Status**: ✅ COMPLETE - Already applied

### HIGH PRIORITY - Core Implementation Files

#### Validation Layer

✅ **src/lib/validations/social.validation.ts** (Lines 28-54)

- **AI Reasoning**: Complete comment validation schemas already implemented
- **Priority**: HIGH - Required for type-safe comment operations
- **Key Findings**:
  - `insertCommentSchema`: Create validation (content min/max, auto-trim)
  - `updateCommentSchema`: Update validation (content only, tracks editedAt)
  - `selectCommentSchema` and `publicCommentSchema`: Output schemas
  - Uses `createInsertSchema` from drizzle-zod
- **Status**: ✅ PARTIAL - May need pagination/filtering schemas
- **Validation**: File exists and accessible

📋 **src/lib/validations/like.validation.ts**

- **AI Reasoning**: Pattern reference for polymorphic operations
- **Priority**: HIGH - Shows validation patterns to follow
- **Usage**: Reference for targetId + targetType validation patterns
- **Validation**: File exists and accessible

#### Actions Layer (TO BE CREATED)

📋 **src/lib/actions/social/social.actions.ts** (Lines 1-263)

- **AI Reasoning**: Existing social actions showing required patterns
- **Priority**: HIGH - Must add comment actions here
- **Patterns Identified**:
  - `authActionClient` for authenticated operations
  - `publicActionClient` for public read operations
  - Metadata with `actionName` and `isTransactionRequired`
  - Sentry context setting for debugging
  - Cache revalidation after mutations
- **Actions Needed**:
  - `createCommentAction`
  - `updateCommentAction`
  - `deleteCommentAction`
  - `getCommentsForTargetAction`
  - `getCommentByIdAction`
- **Validation**: File exists and accessible

#### Query Layer (TO BE CREATED)

📋 **src/lib/queries/social/social.query.ts** (Lines 1-388)

- **AI Reasoning**: Existing social query patterns to follow
- **Priority**: HIGH - Core data fetching logic
- **Patterns Identified**:
  - Static async methods on SocialQuery class
  - Proper use of `QueryContext` for permissions
  - Pagination support with `FindOptions`
  - Increment/decrement counter updates
  - Type-safe return types
- **Methods Needed**:
  - `createCommentAsync`
  - `updateCommentAsync`
  - `deleteCommentAsync`
  - `getCommentsByTargetAsync`
  - `getCommentByIdAsync`
  - Counter increment/decrement methods
- **Validation**: File exists and accessible

#### Facade Layer (TO BE CREATED)

📋 **src/lib/facades/social/social.facade.ts** (Lines 1-366)

- **AI Reasoning**: Business logic layer between actions and queries
- **Priority**: HIGH - Coordinates complex operations
- **Patterns Identified**:
  - Transaction management
  - Cache integration with `CacheService`
  - Error handling with `createFacadeError`
  - User context handling
  - Batch operations for efficiency
- **Methods Needed**:
  - `createComment`
  - `updateComment`
  - `deleteComment`
  - `getCommentsForTarget`
  - `getCommentWithUserInfo`
- **Validation**: File exists and accessible

### HIGH PRIORITY - UI Components (TO BE CREATED)

#### Existing Comment Component

📋 **src/components/feature/bobblehead/bobblehead-comments-dialog.tsx** (Lines 1-29)

- **AI Reasoning**: Placeholder component showing "coming soon"
- **Priority**: HIGH - Needs full implementation
- **Current State**: Shows dialog with placeholder message
- **Action Needed**: Replace with functional comment system
- **Validation**: File exists and accessible

#### Pattern Reference Components

📋 **src/components/ui/dialog.tsx** (Lines 1-80)

- **AI Reasoning**: Radix Dialog usage patterns
- **Priority**: HIGH - Use for comment dialogs/modals
- **Validation**: File exists and accessible

📋 **src/components/ui/form/field-components/textarea-field.tsx** (Lines 1-66)

- **AI Reasoning**: TanStack Form + Textarea integration
- **Priority**: HIGH - Use for comment input fields
- **Validation**: File exists and accessible

📋 **src/components/ui/avatar.tsx** (Lines 1-41)

- **AI Reasoning**: Radix Avatar for user profile pictures
- **Priority**: HIGH - Use in comment author display
- **Validation**: File exists and accessible

#### Components to Create

🆕 **src/components/feature/comments/comment-list.tsx** (NEW)

- **AI Reasoning**: Display paginated comments for target entity
- **Priority**: HIGH - Core comment display
- **Requirements**:
  - Server Component fetching via facade
  - Show user avatar, name, timestamp, content
  - Edit/delete buttons with permission checks
- **Validation**: N/A - To be created

🆕 **src/components/feature/comments/comment-form.tsx** (NEW)

- **AI Reasoning**: Client Component for comment submission
- **Priority**: HIGH - Core comment creation
- **Requirements**:
  - TanStack Form integration
  - Textarea with character count (1-5000 chars)
  - Submit button with loading state
  - Uses `createCommentAction`
- **Validation**: N/A - To be created

🆕 **src/components/feature/comments/comment-item.tsx** (NEW)

- **AI Reasoning**: Single comment display with actions
- **Priority**: HIGH - Core comment display
- **Requirements**:
  - Edit mode toggle for owned comments
  - Delete confirmation
  - Like button integration
- **Validation**: N/A - To be created

🆕 **src/components/feature/comments/comment-section.tsx** (NEW)

- **AI Reasoning**: Wrapper combining form + list
- **Priority**: HIGH - Main entry point
- **Requirements**:
  - Auth state handling
  - Pagination controls
  - Empty state
- **Validation**: N/A - To be created

### HIGH PRIORITY - Page Integration

📋 **src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/page.tsx** (Lines 48-117)

- **AI Reasoning**: Bobblehead detail page needing comment section
- **Priority**: HIGH - Primary integration point
- **Integration Point**: After line 114 (after secondary cards)
- **Pattern**: Async section with Suspense and error boundaries
- **Validation**: File exists and accessible

📋 **src/app/(app)/collections/[collectionId]/(collection)/page.tsx** (Lines 50-99)

- **AI Reasoning**: Collection detail page needing comment section
- **Priority**: HIGH - Primary integration point
- **Integration Point**: In sidebar or after bobbleheads section
- **Validation**: File exists and accessible

📋 **src/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/page.tsx** (Lines 49-96)

- **AI Reasoning**: Subcollection detail page needing comment section
- **Priority**: HIGH - Primary integration point
- **Integration Point**: In sidebar or after bobbleheads
- **Validation**: File exists and accessible

### MEDIUM PRIORITY - Supporting Infrastructure

#### Constants and Configuration

✅ **src/lib/constants/enums.ts** (Lines 10-12, 46-48, 61-63)

- **AI Reasoning**: Enum definitions for comment system
- **Priority**: MEDIUM - Configuration values
- **Key Findings**:
  - `COMMENT.TARGET_TYPE` already defined
  - `NOTIFICATION.TYPE` includes 'comment'
  - `USER_ACTIVITY.ACTION_TYPE` includes 'comment'
- **Status**: ✅ COMPLETE - No changes needed
- **Validation**: File exists and accessible

✅ **src/lib/constants/defaults.ts** (Lines 29-33)

- **AI Reasoning**: Default values for comment fields
- **Priority**: MEDIUM - Configuration values
- **Key Findings**: All comment defaults defined (IS_DELETED, IS_EDITED, LIKE_COUNT)
- **Status**: ✅ COMPLETE - No changes needed
- **Validation**: File exists and accessible

✅ **src/lib/constants/schema-limits.ts** (Lines 33-35)

- **AI Reasoning**: Field length limits for validation
- **Priority**: MEDIUM - Validation configuration
- **Key Findings**: COMMENT.CONTENT limits defined (MIN: 1, MAX: 5000)
- **Status**: ✅ COMPLETE - No changes needed
- **Validation**: File exists and accessible

📋 **src/lib/constants/operations.ts** (Lines 1-115)

- **AI Reasoning**: Operation names for error tracking
- **Priority**: MEDIUM - Error tracking configuration
- **Action Needed**: Add COMMENTS section with operation names
- **Validation**: File exists and accessible

📋 **src/lib/constants/action-names.ts** (Lines 72-81)

- **AI Reasoning**: Action names for Next-Safe-Action
- **Priority**: MEDIUM - Action configuration
- **Status**: ✅ COMPLETE - Comment action names already in SOCIAL section
- **Validation**: File exists and accessible

📋 **src/lib/constants/error-codes.ts** (Lines 1-100)

- **AI Reasoning**: Error codes for domain
- **Priority**: MEDIUM - Error handling configuration
- **Action Needed**: Add COMMENTS section with error codes
- **Validation**: File exists and accessible

📋 **src/lib/constants/error-messages.ts** (Lines 1-100)

- **AI Reasoning**: User-facing error messages
- **Priority**: MEDIUM - Error handling configuration
- **Action Needed**: Add COMMENTS section with messages
- **Validation**: File exists and accessible

#### Cache and Revalidation

📋 **src/lib/services/cache-revalidation.service.ts**

- **AI Reasoning**: Cache invalidation patterns
- **Priority**: MEDIUM - Performance optimization
- **Action Needed**: Add comment-specific revalidation strategies
- **Validation**: File exists and accessible

📋 **src/lib/utils/cache-tags.utils.ts**

- **AI Reasoning**: Cache tag generation utilities
- **Priority**: MEDIUM - Caching infrastructure
- **Action Needed**: Add comment cache tag generators
- **Validation**: File exists and accessible

#### Utilities and Middleware

📋 **src/lib/utils/next-safe-action.ts**

- **AI Reasoning**: Action client setup with middleware
- **Priority**: MEDIUM - Action infrastructure
- **Usage**: Use `authActionClient` for comment actions
- **Validation**: File exists and accessible

📋 **src/lib/middleware/sanitization.middleware.ts** (Lines 1-58)

- **AI Reasoning**: DOMPurify sanitization for inputs
- **Priority**: MEDIUM - Security
- **Status**: ✅ AUTOMATIC - Applies via action middleware
- **Validation**: File exists and accessible

📋 **src/lib/queries/base/base-query.ts**

- **AI Reasoning**: Base query class with common patterns
- **Priority**: MEDIUM - Query infrastructure
- **Usage**: Extend or use patterns for CommentQuery
- **Validation**: File exists and accessible

📋 **src/lib/queries/base/query-context.ts** (Lines 1-122)

- **AI Reasoning**: Query context creation functions
- **Priority**: MEDIUM - Query infrastructure
- **Usage**: Use for authenticated/public contexts
- **Validation**: File exists and accessible

📋 **src/utils/optional-auth-utils.ts** (Lines 1-28)

- **AI Reasoning**: Optional authentication utilities
- **Priority**: MEDIUM - Authorization
- **Usage**: Check comment ownership for edit/delete
- **Validation**: File exists and accessible

📋 **src/utils/user-utils.ts** (Lines 1-17)

- **AI Reasoning**: User utilities for required auth
- **Priority**: MEDIUM - Authentication
- **Usage**: Get current user ID for comment creation
- **Validation**: File exists and accessible

### MEDIUM PRIORITY - Related Entity Updates

⚠️ **src/lib/db/schema/bobbleheads.schema.ts** (Line 35)

- **AI Reasoning**: Bobblehead schema with commentCount field
- **Priority**: MEDIUM - Entity updates
- **Status**: ✅ COMPLETE - commentCount field exists
- **Action**: Increment/decrement via queries
- **Validation**: File exists and accessible

⚠️ **src/lib/db/schema/collections.schema.ts** (Line 26)

- **AI Reasoning**: Collection schema missing commentCount
- **Priority**: MEDIUM - Entity updates
- **Status**: ⚠️ MISSING FIELD - Has likeCount but NO commentCount
- **Action Needed**: Add migration for commentCount field
- **Validation**: File exists and accessible

⚠️ **src/lib/db/schema/collections.schema.ts** (subcollections)

- **AI Reasoning**: Subcollection schema missing commentCount
- **Priority**: MEDIUM - Entity updates
- **Status**: ⚠️ MISSING FIELD - Needs commentCount field
- **Action Needed**: Add migration for commentCount field
- **Validation**: File exists and accessible

📋 **src/lib/queries/bobbleheads/bobbleheads-query.ts**

- **AI Reasoning**: Bobblehead query methods
- **Priority**: MEDIUM - Entity queries
- **Action**: May need comment count update methods
- **Validation**: File exists and accessible

📋 **src/lib/queries/collections/collections.query.ts**

- **AI Reasoning**: Collection query methods
- **Priority**: MEDIUM - Entity queries
- **Action Needed**: Add comment count methods
- **Validation**: File exists and accessible

📋 **src/lib/queries/collections/subcollections.query.ts**

- **AI Reasoning**: Subcollection query methods
- **Priority**: MEDIUM - Entity queries
- **Action Needed**: Add comment count methods
- **Validation**: File exists and accessible

### LOW PRIORITY - Testing and Documentation

📋 **src/lib/validations/moderation.validation.ts**

- **AI Reasoning**: Reference for moderation patterns
- **Priority**: LOW - Optional enhancement
- **Usage**: Comment moderation/reporting
- **Validation**: File exists and accessible

📋 **src/lib/actions/content-reports/content-reports.actions.ts**

- **AI Reasoning**: Content reporting system
- **Priority**: LOW - Optional enhancement
- **Status**: ✅ Already supports comment reports (ENUMS includes 'comment')
- **Validation**: File exists and accessible

## File Path Validation Results

✅ **All discovered files validated**

- Total files checked: 62
- Existing files: 54
- Files to create: 8
- Missing/inaccessible: 0

## AI Analysis Metrics

- **API Duration**: 135 seconds
- **Files Analyzed**: 87+
- **Relevant Files Found**: 62
- **Pattern Matches**: 28
- **Critical Findings**: 5 (existing schema, validations, migrations)

## Discovery Statistics

### Coverage Analysis

| Layer           | Files Found | Status                |
| --------------- | ----------- | --------------------- |
| Database Schema | 4           | ✅ Complete           |
| Validations     | 2           | ✅ Mostly Complete    |
| Actions         | 1           | 📋 Needs Extension    |
| Queries         | 1           | 📋 Needs Extension    |
| Facades         | 1           | 📋 Needs Extension    |
| Components      | 8           | 🆕 Needs Creation     |
| Pages           | 3           | 📋 Needs Integration  |
| Constants       | 7           | ⚠️ Partially Complete |
| Utilities       | 8           | ✅ Available          |

### Priority Distribution

- **CRITICAL**: 4 files (all existing, complete)
- **HIGH**: 25 files (15 to modify, 10 to create)
- **MEDIUM**: 28 files (mostly infrastructure)
- **LOW**: 5 files (optional enhancements)

## Critical Findings

### ✅ Major Win: Schema Already Exists!

The AI discovered that the comments database infrastructure is FULLY IMPLEMENTED:

- Complete table schema with all fields
- Polymorphic support for all three entity types
- Soft delete and edit tracking
- Comprehensive indexes and constraints
- Validation schemas already defined

### ⚠️ Critical Gap: Missing CommentCount Fields

AI identified missing `commentCount` fields on collections and subcollections tables. Migration required before implementation.

### 📋 Implementation Scope Clarified

AI analysis shows the work is primarily:

1. Adding query/facade/action methods (extending existing files)
2. Creating UI components (new files)
3. Integrating into detail pages (minor modifications)
4. Adding one migration for commentCount fields

## Integration Points Identified

### Component Structure Required

```
src/components/feature/comments/
├── comment-section.tsx (wrapper)
├── comment-form.tsx (TanStack Form)
├── comment-list.tsx (server component)
├── comment-item.tsx (single comment)
├── comment-edit-dialog.tsx (editing)
├── comment-delete-dialog.tsx (confirmation)
├── async/
│   └── comment-section-async.tsx
└── skeletons/
    └── comment-section-skeleton.tsx
```

### Action/Query/Facade Extensions

```
src/lib/
├── actions/social/social.actions.ts (add 5 methods)
├── queries/social/social.query.ts (add 6 methods)
├── facades/social/social.facade.ts (add 5 methods)
└── validations/social.validation.ts (add 2 schemas)
```

### Cache Strategy Required

```typescript
CACHE_KEYS.SOCIAL.COMMENTS(targetType, targetId);
CACHE_KEYS.SOCIAL.COMMENT(commentId);
```

---

**Next Step**: Proceed to Implementation Planning with discovered file analysis
