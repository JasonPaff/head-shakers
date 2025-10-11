# Agent Prompt: Implement Step 2 File Discovery Bug Fixes

## Context

I need you to implement bug fixes for the Step 2 file discovery functionality in the `/feature-planner` page. A comprehensive analysis has been completed and documented at `docs/2025_10_08/step-2-file-discovery-analysis.md`.

## Objective

Fix 3 critical bugs that are blocking users from:
1. Adding files manually through the autocomplete interface
2. Selecting/deselecting discovered files with checkboxes
3. Persisting manual file additions to the database

## Current Status

**Working:**
- File discovery agent execution ✅
- File search API endpoint ✅
- Service layer with parsers ✅
- Database schema fully supports manual additions ✅
- UI components display correctly ✅

**Broken:**
- Empty `onFileAdded` handler in `src/app/(app)/feature-planner/components/steps/step-orchestrator.tsx:86`
- Empty `onFileSelection` handler in `src/app/(app)/feature-planner/components/steps/step-orchestrator.tsx:88`
- Missing API endpoint for manual file addition

## Implementation Tasks

### Phase 1: Fix Core Handlers (30 min)

**File:** `src/app/(app)/feature-planner/page.tsx`

1. **Add `handleFileAdded` function** (~150 lines)
   - Accept file with `filePath`, `description`, `priority`
   - Call `POST /api/feature-planner/[planId]/files/add`
   - Update local state with new file
   - Update priority counts in discovery session
   - Show success/error toasts
   - Reference: See detailed implementation in analysis doc

2. **Add `handleFileSelection` function** (~15 lines)
   - Accept array of selected file IDs
   - Update `stepData.step2.selectedFiles` in state
   - Use `updateState` to persist locally

3. **Wire handlers to StepOrchestrator**
   - Pass `handleFileAdded` as `onFileAdded` prop
   - Pass `handleFileSelection` as `onFileSelection` prop

**File:** `src/app/(app)/feature-planner/components/steps/step-orchestrator.tsx`

4. **Update props interface**
   - Add `onFileAdded: (file: {...}) => void`
   - Add `onFileSelection: (files: string[]) => void`

5. **Pass props to StepTwo component**
   - Replace `onFileAdded={() => {}}` with `onFileAdded={onFileAdded}`
   - Replace `onFileSelection={() => {}}` with `onFileSelection={onFileSelection}`

### Phase 2: Create Manual File Addition API (45 min)

**File:** `src/lib/queries/feature-planner/feature-planner.query.ts`

6. **Add `addDiscoveredFileAsync()` method**
   - Insert into `discovered_files` table
   - Set `isManuallyAdded: true`
   - Set `addedByUserId` to current user
   - Return created file record
   - Follow existing query patterns in this file

**File:** `src/lib/facades/feature-planner/feature-planner.facade.ts`

7. **Add `addManualFileToDiscoveryAsync()` method**
   - Verify plan ownership
   - Verify session belongs to plan
   - Call query method to insert file
   - Update session counts (total files, priority counts)
   - Follow existing facade patterns in this file

**File:** `src/app/api/feature-planner/[planId]/files/add/route.ts` (NEW FILE)

8. **Create POST endpoint**
   - Validate input with Zod schema
   - Authenticate user
   - Call facade method
   - Return success/error response
   - Follow existing API route patterns in this directory

**File:** `src/lib/constants.ts` (if needed)

9. **Add operation constant** (if missing)
   - Add `ADD_MANUAL_FILE: 'add-manual-file'` to `OPERATIONS.FEATURE_PLANNER`

### Phase 3: Testing (30 min)

10. **Manual testing**
    - Test file discovery flow end-to-end
    - Test manual file addition with autocomplete
    - Test file selection checkboxes
    - Test error cases (no session, invalid input, etc.)

11. **Database validation**
    - Verify `discovered_files` records created with `isManuallyAdded: true`
    - Verify session counts updated correctly

## Key Implementation Details

### Handler Signatures

```typescript
// In page.tsx
const handleFileAdded = useCallback(async (file: {
  description: string;
  filePath: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}) => {
  // Implementation
}, [state.planId, state.discoverySession, updateState]);

const handleFileSelection = useCallback((selectedFiles: string[]) => {
  // Implementation
}, [state.discoverySession?.discoveredFiles, state.stepData, updateState]);
```

### API Endpoint

```typescript
// POST /api/feature-planner/[planId]/files/add
// Body: { sessionId, filePath, priority, description }
// Response: { success, message, data }
```

### Database Fields

```typescript
// discovered_files table
{
  id: string,
  discoverySessionId: string,
  filePath: string,
  priority: 'critical' | 'high' | 'medium' | 'low',
  description: string,
  isManuallyAdded: boolean,  // Set to true
  addedByUserId: string,      // Current user
  relevanceScore: number,     // Default 75
  fileExists: boolean,        // Default true
}
```

## Acceptance Criteria

- [ ] Users can search for files using autocomplete
- [ ] Users can add files manually and see them appear immediately
- [ ] Manual files are saved to database with correct fields
- [ ] File selection checkboxes work and track state
- [ ] Selected files persist when navigating within Step 2
- [ ] Session counts update correctly after manual addition
- [ ] Success/error toasts display appropriately
- [ ] No console errors
- [ ] All TypeScript types are correct

## Reference Files

**Read these for patterns:**
- `src/app/(app)/feature-planner/page.tsx` - Main page state management
- `src/lib/facades/feature-planner/feature-planner.facade.ts` - Existing facade methods
- `src/lib/queries/feature-planner/feature-planner.query.ts` - Existing query methods
- `src/app/api/feature-planner/discover/route.ts` - Similar API endpoint
- `docs/2025_10_08/step-2-file-discovery-analysis.md` - Complete analysis with code examples

## Project Rules to Follow

- Format with Prettier before committing
- No `any` types
- No ESLint disable comments
- Follow existing patterns in the codebase
- Use proper error handling with `createServiceError`
- Use `toast` for user feedback
- Use `useCallback` for handlers in React components

## Notes

- MVP decision: Use local state for file selections (no database persistence needed)
- File existence verification can be added later
- The database schema already supports all required fields
- The service layer parsers are already implemented
- Focus on completing the workflow, not adding new features

## Estimated Time

- Phase 1: 30 minutes
- Phase 2: 45 minutes
- Phase 3: 30 minutes
- **Total: 1 hour 45 minutes**

## Getting Started

1. Read `docs/2025_10_08/step-2-file-discovery-analysis.md` thoroughly
2. Review the referenced files to understand patterns
3. Start with Phase 1 (handlers in page.tsx)
4. Test each phase before moving to the next
5. Use the TodoWrite tool to track your progress

Good luck! 🚀
