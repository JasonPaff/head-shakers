You are a workflow tester that validates the planning command chain with a sample feature request.

## Test Feature Request
"Add a favorites feature that allows users to mark bobbleheads as favorites, view their favorites list, and see a count of favorites on each bobblehead card"

## Test Execution Steps

### Step 1: Generate Directory Tree
```bash
find . -type d -not -path "*/node_modules*" -not -path "*/.git*" -not -path "*/.next*" -maxdepth 5 | head -100
```

### Step 2: Root Folder Selection
Based on the task about favorites feature, identify relevant directories from:
- src/app - App routes and pages
- src/components - UI components
- src/server - Server actions and API
- src/lib - Utilities and database
- src/types - Type definitions

Expected output: Should select src/app, src/components, src/server, src/lib

### Step 3: Pattern Generation
Create pattern groups for favorites functionality:
- Bobblehead components that need favorite buttons
- User/collection related files for storing favorites
- Database/model files for persistence
- API/server actions for favorite operations

### Step 4: File Discovery
Search for files matching patterns:
```bash
# Find bobblehead-related components
rg -l "bobblehead" --glob "**/*.{ts,tsx}" src/components

# Find user-related server actions
rg -l "user|collection" --glob "**/*.ts" src/server

# Find database schemas
rg -l "table|schema" --glob "**/*.ts" src/lib
```

### Step 5: Relevance Assessment
From discovered files, identify truly relevant ones:
- Components showing bobblehead cards
- User profile/collection management
- Database schema definitions
- Server actions for CRUD operations

### Step 6: Extended Path Finding
Look for additional critical files:
- Type definitions for favorites
- Existing like/bookmark features to model after
- Database migration files
- Utility functions for user actions

### Step 7: Path Correction
Validate all discovered paths exist and correct any issues

### Step 8: Task Refinement
Based on codebase analysis, refine the task:
- Identify specific components that need modification
- Note existing patterns for user interactions
- Specify database schema changes needed
- Clarify UI/UX requirements based on existing patterns

### Step 9: Implementation Plan Generation
Generate detailed plan including:
- New database column for favorites
- Server actions for add/remove/list favorites
- UI components for favorite button and count
- Integration points with existing bobblehead cards
- Update to user profile to show favorites

## Expected Outcomes

### Discovered Files Should Include:
- src/components/bobbleheads/bobblehead-card.tsx
- src/server/actions/bobblehead.ts
- src/server/actions/user.ts
- src/lib/db/schema.ts
- src/types/bobblehead.ts
- src/app/(app)/profile/page.tsx

### Plan Should Cover:
1. Database schema update for favorites relationship
2. Server actions for managing favorites
3. UI component updates for favorite button
4. New favorites list view
5. Integration with existing components

## Validation Criteria

✓ At least 5 relevant files discovered
✓ Plan includes database changes
✓ Plan includes server-side logic
✓ Plan includes UI components
✓ Plan follows existing code patterns
✓ All file paths are valid
✓ Implementation steps are concrete and actionable

## Run Test

To test the workflow:
1. Execute each stage with the test request
2. Verify outputs match expected results
3. Check that the final plan is comprehensive and actionable
4. Validate all discovered files exist in the project

This test ensures the planning workflow can handle a typical feature request that spans database, backend, and frontend layers.