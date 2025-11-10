# Step 2: File Discovery

**Step Start**: 2025-11-10T00:00:30Z
**Step End**: 2025-11-10T00:01:45Z
**Duration**: 75 seconds
**Status**: ✅ Success

## Refined Request Used as Input

As a user, I would like the share menus to be functional so that I can easily distribute my bobblehead collections and individual bobbleheads with other collectors and non-users. Currently, the share menu UI components exist within the application, but they lack the backend implementation to execute actual sharing actions. The sharing functionality should integrate with the existing Next-Safe-Action server actions architecture to handle mutation operations securely and validate user permissions through Clerk authentication.

## Agent Prompt Sent

```
You are an AI file discovery agent for the Head Shakers bobblehead collection platform. Your task is to discover ALL files relevant to implementing share menu functionality.

## Feature Request (Refined)

[Refined request from Step 1]

## Your Task

1. Find existing share menu UI components that need backend implementation
2. Identify collection and bobblehead pages where share functionality should work
3. Locate server action files where share logic should be implemented
4. Find validation schemas that may need share-related validation
5. Discover any existing share or social features in the codebase

## Discovery Requirements

- MINIMUM: Discover at least 5 relevant files
- CATEGORIZATION: Assign each file a priority (Critical/High/Medium/Low)
- REASONING: Explain WHY each file is relevant and what role it plays
- CONTENT ANALYSIS: Base your analysis on actual file contents, not just names
- COMPREHENSIVE: Cover all layers (UI components, pages, actions, validations, utilities)
```

## AI File Discovery Analysis

**Analysis Method**: AI-powered codebase exploration with content analysis
**Exploration Scope**: 8 primary directories, 42+ candidate files examined
**Discovery Results**: 28 highly relevant files identified

### Critical Priority Files (4 files)

1. **`src\components\feature\bobblehead\bobblehead-share-menu.tsx`**
   - Priority: Critical
   - Role: Bobblehead share menu UI component
   - Current State: Basic dropdown menu with static items
   - Reasoning: Core component requiring event handlers and sharing logic
   - Integration: Used in bobblehead-header.tsx (line 68-73)

2. **`src\components\feature\collections\collection-share-menu.tsx`**
   - Priority: Critical
   - Role: Collection share menu UI component
   - Current State: Identical structure to bobblehead menu
   - Reasoning: Primary component for collection sharing
   - Integration: Used in collection-header.tsx (line 50-55)

3. **`src\components\feature\subcollections\subcollection-share-menu.tsx`**
   - Priority: Critical
   - Role: Subcollection share menu UI component
   - Current State: Same static structure as other menus
   - Reasoning: Completes sharing feature across all content types
   - Integration: Used in subcollection-header.tsx (line 52-57)

4. **`src\hooks\use-server-action.ts`**
   - Priority: Critical
   - Role: Custom hook wrapping Next-Safe-Action
   - Current State: Handles action execution with toast notifications
   - Reasoning: Standard pattern for calling server actions with user feedback
   - Features: Toast promise handling, error transformation

### High Priority Files (12 files)

**Server Actions (3 files)**: 5. `src\lib\actions\collections\collections.actions.ts` - Collection server actions template 6. `src\lib\actions\bobbleheads\bobbleheads.actions.ts` - Bobblehead server actions template 7. `src\lib\actions\subcollections\subcollections.actions.ts` - Subcollection actions pattern

**Validations (3 files)**: 8. `src\lib\validations\collections.validation.ts` - Collection Zod schemas 9. `src\lib\validations\subcollections.validation.ts` - Subcollection schemas 10. `src\lib\validations\social.validation.ts` - Social feature validations (similar pattern)

**Pages & Integration (6 files)**: 11. `src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\bobblehead-header.tsx` 12. `src\app\(app)\collections\[collectionId]\(collection)\components\collection-header.tsx` 13. `src\app\(app)\collections\[collectionId]\subcollection\[subcollectionId]\components\subcollection-header.tsx` 14. `src\app\(app)\collections\[collectionId]\(collection)\page.tsx` 15. `src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\page.tsx` 16. `src\app\(app)\collections\[collectionId]\share\page.tsx` - Dedicated share page (stub)

### Medium Priority Files (9 files)

**Supporting Infrastructure (6 files)**: 17. `src\components\ui\sonner.tsx` - Toast notification component 18. `src\lib\constants\action-names.ts` - Action name constants 19. `src\lib\constants\operations.ts` - Operation names for logging 20. `src\lib\constants\enums.ts` - Application enums 21. `src\components\ui\dropdown-menu.tsx` - Radix UI dropdown (already used) 22. `src\lib\utils\next-safe-action.ts` - Action client configuration

**Social Actions (1 file)**: 23. `src\lib\actions\social\social.actions.ts` - Similar interaction patterns

**Facades & Queries (2 files)**: 24. `src\lib\facades\collections\collections.facade.ts` - Collection business logic 25. `src\lib\facades\bobbleheads\bobbleheads.facade.ts` - Bobblehead business logic

### Low Priority Files (3 files)

26. `src\lib\queries\collections\collections.query.ts` - Database queries
27. `src\lib\queries\bobbleheads\bobbleheads-query.ts` - Bobblehead queries
28. `src\lib\services\cache-revalidation.service.ts` - Cache invalidation

## File Path Validation Results

All 28 discovered files validated through AI content analysis:

- ✅ All file paths confirmed to exist
- ✅ All files accessible and readable
- ✅ Content analysis performed on each file
- ✅ Integration points identified and verified
- ✅ Current implementation state assessed

## AI Analysis Metrics

- **Directories Explored**: 8 (components, app, actions, validations, utils, hooks, facades, queries)
- **Candidate Files Examined**: 42+
- **Relevant Files Discovered**: 28
- **Critical Priority**: 4 files
- **High Priority**: 12 files
- **Medium Priority**: 9 files
- **Low Priority**: 3 files

## Discovery Statistics and Coverage

- ✅ **Minimum Requirement Met**: 28 files discovered (target: 5+)
- ✅ **Content-Based Analysis**: All files analyzed based on actual content
- ✅ **Smart Prioritization**: Files categorized by implementation priority
- ✅ **Comprehensive Coverage**: All architectural layers covered
- ✅ **Pattern Recognition**: Identified existing similar functionality (social actions)
- ✅ **Integration Points**: Mapped component usage and data flows

## Architecture Insights

### Key Patterns Identified

1. **Server Action Pattern**: Uses authActionClient/publicActionClient with metadata, Zod schemas, Sentry logging, and cache revalidation
2. **Client Hook Pattern**: useServerAction hook with toast feedback and loading/success/error states
3. **URL Generation**: Type-safe routing with next-typesafe-url ($path helper)
4. **Component Structure**: Client share menus with server component parents

### Similar Functionality Found

- **Social Actions**: Like/comment actions show similar user-initiated content interaction pattern
- **View Tracking**: CONTENT_METRIC.TYPE already includes 'share' enum value
- **URL Sharing**: Type-safe routing infrastructure already in place

### Integration Points

1. URL generation utilities needed
2. Clipboard API integration (navigator.clipboard.writeText)
3. Social media URL templates (Twitter/X, Facebook)
4. Analytics tracking (enum already supports it)
5. Public content sharing (likely no auth required)

## Recommended Implementation Approach

### Phase 1: Core Functionality

- Create share utilities for URL generation and clipboard
- Implement client-side share handlers in menu components
- Add toast notifications for user feedback
- Test copy-to-clipboard functionality

### Phase 2: Backend Integration (Optional)

- Add share validation schema if tracking shares
- Create share action for analytics tracking
- Update action names and operations constants
- Implement cache invalidation if needed

### Phase 3: Social Media

- Implement social media URL generation
- Add window.open handlers for social sharing
- Consider Open Graph meta tags for rich previews
- Test social sharing with actual URLs

## Warnings and Notes

1. **All share menus have identical structure** - Could potentially be consolidated into single reusable component
2. **No current analytics tracking** - Consider whether share events should be tracked
3. **Public vs private sharing** - Need to clarify if authentication required for sharing
4. **Open Graph tags** - Not mentioned in discovery, may need for social media previews

## Next Steps

✅ Step 2 Complete - Proceeding to Step 3: Implementation Planning
