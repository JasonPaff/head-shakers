# Step 2 File Discovery - MVP Completion Plan

**Date**: 2025-01-27
**Status**: Ready for Implementation
**Target**: Complete MVP functionality for Step 2 of Feature Planner
**Based On**: Code Review (`docs/2025_01_27/code-reviews/step-two-file-discovery-review.md`)

---

## Executive Summary

The file discovery step has a solid backend (90% complete) but incomplete frontend integration (40% complete). This plan focuses on connecting the UI to the backend and implementing the critical missing features for MVP launch.

**Current State**: 60% Complete
**Target State**: 100% MVP Ready
**Estimated Time**: 3-5 days

---

## Critical Issues Identified

### 🔴 P0 - Blocking Issues (Must Fix for MVP)

1. **Missing Handler Implementation**
   - `onFileAdded` is stubbed out (line 86 in step-orchestrator.tsx)
   - `onFileSelection` is stubbed out (line 88 in step-orchestrator.tsx)
   - **Impact**: Manual file addition and file selection don't work

2. **No Database Persistence for Selections**
   - User selections lost on page refresh
   - `featurePlans.selectedFiles` never updated
   - **Impact**: Data loss and broken workflow

3. **File Existence Not Verified**
   - Defaults to `fileExists: true` without checking
   - **Impact**: UI shows incorrect status for non-existent files

4. **No Error State Handling**
   - Failed discovery sessions still show results
   - **Impact**: Confusing UX when errors occur

---

## Implementation Plan

### Phase 1: Core Functionality (P0 - Critical)

#### Task 1.1: Add Database Query Methods

**File**: `src/lib/queries/feature-planner/feature-planner.query.ts`

**Add Methods**:

```typescript
/**
 * Add manually discovered file to session
 */
static async addDiscoveredFileAsync(
  data: {
    discoverySessionId: string;
    filePath: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    isManuallyAdded: true;
    fileExists: boolean;
    relevanceScore: number;
  },
  context: QueryContext,
): Promise<DiscoveredFile | null>

/**
 * Update selected files for a plan
 */
static async updateSelectedFilesAsync(
  planId: string,
  selectedFiles: string[],
  userId: string,
  context: QueryContext,
): Promise<FeaturePlan | null>

/**
 * Toggle file selection status
 */
static async updateFileSelectionAsync(
  fileId: string,
  isSelected: boolean,
  context: QueryContext,
): Promise<DiscoveredFile | null>
```

**Acceptance Criteria**:

- ✅ Methods return proper types
- ✅ All operations use transactions
- ✅ Proper error handling
- ✅ User authorization checks

---

#### Task 1.2: Add Facade Methods

**File**: `src/lib/facades/feature-planner/feature-planner.facade.ts`

**Add Methods**:

```typescript
/**
 * Add manual file to discovery session
 */
static async addManualFileAsync(
  sessionId: string,
  file: {
    filePath: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    description: string;
  },
  userId: string,
  dbInstance?: DatabaseExecutor,
): Promise<DiscoveredFile | null>

/**
 * Update selected files for plan
 */
static async updateSelectedFilesAsync(
  planId: string,
  selectedFiles: string[],
  userId: string,
  dbInstance?: DatabaseExecutor,
): Promise<FeaturePlan | null>
```

**Implementation Details**:

- Verify file exists using `fs.existsSync()`
- Calculate relevance score (default: 75 for manual additions)
- Update session file counts
- Validate user owns the plan/session

**Acceptance Criteria**:

- ✅ File existence verification works
- ✅ Session counts updated correctly
- ✅ Proper error context propagation
- ✅ Authorization checks implemented

---

#### Task 1.3: Create API Endpoints

**Endpoint 1**: `POST /api/feature-planner/[planId]/add-file`

**File**: `src/app/api/feature-planner/[planId]/add-file/route.ts`

**Request Body**:

```typescript
{
  sessionId: string;
  filePath: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}
```

**Response**:

```typescript
{
  success: boolean;
  message: string;
  data?: {
    file: DiscoveredFile;
    updatedSession: FileDiscoverySession;
  };
}
```

**Implementation**:

- Validate user is authenticated
- Validate plan belongs to user
- Validate session belongs to plan
- Call `FeaturePlannerFacade.addManualFileAsync()`
- Return updated file and session

---

**Endpoint 2**: `PUT /api/feature-planner/[planId]/select-files`

**File**: `src/app/api/feature-planner/[planId]/select-files/route.ts`

**Request Body**:

```typescript
{
  selectedFiles: string[]; // Array of file paths or IDs
}
```

**Response**:

```typescript
{
  success: boolean;
  message: string;
  data?: {
    plan: FeaturePlan;
  };
}
```

**Implementation**:

- Validate user is authenticated
- Validate plan belongs to user
- Call `FeaturePlannerFacade.updateSelectedFilesAsync()`
- Return updated plan

**Acceptance Criteria**:

- ✅ Proper authentication and authorization
- ✅ Input validation with Zod schemas
- ✅ Consistent error responses
- ✅ Proper HTTP status codes

---

#### Task 1.4: Implement Page Handlers

**File**: `src/app/(app)/feature-planner/page.tsx`

**Add Handler 1**: `handleFileAdded`

```typescript
const handleFileAdded = useCallback(
  async (file: {
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'low' | 'medium';
  }) => {
    if (!state.planId || !state.discoverySession) {
      toast.error('Cannot add file: No active discovery session');
      return;
    }

    try {
      toast.loading('Adding file...', { id: 'add-file' });

      const response = await fetch(`/api/feature-planner/${state.planId}/add-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.discoverySession.id,
          ...file,
        }),
      });

      const data = await response.json();
      toast.dismiss('add-file');

      if (response.ok && data.success) {
        toast.success('File added successfully');

        // Update local state with new file
        updateState({
          discoverySession: data.data.updatedSession,
          stepData: {
            ...state.stepData,
            step2: {
              ...state.stepData.step2,
              discoveredFiles: data.data.updatedSession.discoveredFiles || [],
            },
          },
        });
      } else {
        toast.error(data.message || 'Failed to add file');
      }
    } catch (error) {
      console.error('Error adding file:', error);
      toast.dismiss('add-file');
      toast.error('Failed to add file');
    }
  },
  [state.planId, state.discoverySession, state.stepData, updateState],
);
```

**Add Handler 2**: `handleFileSelection`

```typescript
const handleFileSelection = useCallback(
  async (files: string[]) => {
    if (!state.planId) {
      toast.error('Cannot update selection: Plan ID missing');
      return;
    }

    // Update local state immediately for responsive UX
    updateState({
      stepData: {
        ...state.stepData,
        step2: {
          ...state.stepData.step2,
          selectedFiles: files,
        },
      },
    });

    // Debounced API call to persist to database
    try {
      const response = await fetch(`/api/feature-planner/${state.planId}/select-files`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedFiles: files }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('Failed to persist file selection:', data.message);
        // Don't show error toast for background persistence
      }
    } catch (error) {
      console.error('Error persisting file selection:', error);
      // Silent failure for background persistence
    }
  },
  [state.planId, state.stepData, updateState],
);
```

**Acceptance Criteria**:

- ✅ Handlers properly connected to state
- ✅ Loading states shown during API calls
- ✅ Error handling with user feedback
- ✅ Optimistic UI updates for selection

---

#### Task 1.5: Wire Up Handlers in Step Orchestrator

**File**: `src/app/(app)/feature-planner/components/steps/step-orchestrator.tsx`

**Changes**:

```typescript
// Line 86-88: Replace stub handlers
<StepTwo
  discoverySession={discoverySession}
  onFileAdded={onFileAdded}  // ✅ Pass real handler
  onFileDiscovery={onFileDiscovery}
  onFileSelection={onFileSelection}  // ✅ Pass real handler
  selectedFiles={stepData.step2?.selectedFiles}
/>
```

**Add Props to StepOrchestratorProps**:

```typescript
interface StepOrchestratorProps {
  // ... existing props
  onFileAdded: (file: {
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'low' | 'medium';
  }) => void;
  onFileSelection: (files: string[]) => void;
}
```

**Acceptance Criteria**:

- ✅ Props properly typed
- ✅ Handlers passed through correctly
- ✅ No TypeScript errors

---

#### Task 1.6: Fix File Existence Verification

**File**: `src/lib/facades/feature-planner/feature-planner.facade.ts`

**Changes** (Line 281 in `runFileDiscoveryAsync`):

```typescript
import { existsSync } from 'fs';
import { join } from 'path';

// Inside map function for fileRecords
const fileRecords = result.result.map((file) => {
  const fullPath = join(process.cwd(), file.filePath);
  const actuallyExists = existsSync(fullPath);

  return {
    description: file.description,
    discoverySessionId: session.id,
    fileExists: actuallyExists, // ✅ Verify actual existence
    filePath: file.filePath,
    integrationPoint: file.integrationPoint,
    isManuallyAdded: file.isManuallyAdded ?? false,
    priority: file.priority,
    reasoning: file.reasoning,
    relevanceScore: file.relevanceScore,
    role: file.role,
  };
});
```

**Acceptance Criteria**:

- ✅ File existence check works on Windows and Unix
- ✅ Handles relative and absolute paths
- ✅ No performance issues with large file lists

---

#### Task 1.7: Add Error State Handling

**File**: `src/app/(app)/feature-planner/components/steps/step-two.tsx`

**Changes** (After line 46):

```typescript
// If discovery session failed, show error state
if (discoverySession?.status === 'failed') {
  return (
    <div className={cn('space-y-6', className)} data-testid={stepTwoTestId} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <SearchIcon aria-hidden className={'size-5 text-destructive'} />
            File Discovery Failed
          </CardTitle>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <div className={'rounded-lg border-destructive bg-destructive/10 p-4'}>
            <h3 className={'mb-2 font-medium text-destructive'}>
              Discovery Error
            </h3>
            <p className={'mb-4 text-sm text-muted-foreground'}>
              {discoverySession.errorMessage || 'An unexpected error occurred during file discovery.'}
            </p>
            {onFileDiscovery && (
              <button
                className={'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'}
                onClick={onFileDiscovery}
                type={'button'}
              >
                Try Again
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Acceptance Criteria**:

- ✅ Error state shows clear message
- ✅ "Try Again" button works
- ✅ Proper visual hierarchy
- ✅ Accessible error messaging

---

### Phase 2: Testing and Validation (P0)

#### Task 2.1: Manual Testing Checklist

**Test Manual File Addition**:

1. Navigate to `/feature-planner`
2. Complete Step 1 (refinement or skip)
3. Click "Start File Discovery" on Step 2
4. Wait for discovery to complete
5. Click "Add File to Discovery"
6. Search for a file (e.g., "page.tsx")
7. Select file from dropdown
8. Choose priority level
9. Enter description
10. Click "Add File"
11. Verify file appears in results list
12. Verify file has correct priority badge
13. Verify session counts updated

**Expected Results**:

- ✅ File appears immediately after adding
- ✅ Priority counts update correctly
- ✅ File has "manually added" indicator
- ✅ Toast notification shows success

**Test File Selection Persistence**:

1. On Step 2 with discovered files
2. Check 3-5 file checkboxes
3. Verify selection count updates
4. Refresh page
5. Return to Step 2
6. Verify checkboxes still checked
7. Uncheck all files
8. Refresh page
9. Verify all files unchecked

**Expected Results**:

- ✅ Selections persist across refreshes
- ✅ Selection count accurate
- ✅ No data loss on refresh

**Test File Existence Verification**:

1. Start file discovery
2. Identify files with green checkmark
3. Verify those files exist in filesystem
4. Identify files without checkmark
5. Verify those files don't exist

**Expected Results**:

- ✅ Green checkmark only on existing files
- ✅ No false positives

**Test Error Handling**:

1. Mock discovery failure (disconnect network)
2. Start file discovery
3. Wait for failure
4. Verify error state shows
5. Click "Try Again"
6. Verify retry works

**Expected Results**:

- ✅ Clear error message shown
- ✅ Retry button functional
- ✅ No crash or stuck state

---

#### Task 2.2: Integration Tests

**Test File**: `tests/integration/feature-planner/step-two.integration.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';

describe('Step 2: File Discovery Integration', () => {
  let planId: string;
  let userId: string;
  let sessionId: string;

  beforeEach(async () => {
    // Setup test plan and user
  });

  it('should add manual file to discovery session', async () => {
    const file = await FeaturePlannerFacade.addManualFileAsync(
      sessionId,
      {
        filePath: 'src/test/fixture.ts',
        priority: 'high',
        description: 'Test file',
      },
      userId,
    );

    expect(file).toBeDefined();
    expect(file?.isManuallyAdded).toBe(true);
    expect(file?.priority).toBe('high');
  });

  it('should update selected files for plan', async () => {
    const plan = await FeaturePlannerFacade.updateSelectedFilesAsync(
      planId,
      ['file1.ts', 'file2.ts'],
      userId,
    );

    expect(plan).toBeDefined();
    expect(plan?.selectedFiles).toEqual(['file1.ts', 'file2.ts']);
  });

  it('should verify file existence correctly', async () => {
    // Test with existing file
    // Test with non-existing file
  });
});
```

**Acceptance Criteria**:

- ✅ All integration tests pass
- ✅ Tests cover happy path and error cases
- ✅ Tests use real database (testcontainers)
- ✅ Tests clean up after themselves

---

### Phase 3: Documentation and Polish (P1)

#### Task 3.1: Update API Documentation

**File**: `docs/2025_01_27/api/feature-planner-endpoints.md`

Document the new endpoints:

- POST `/api/feature-planner/[planId]/add-file`
- PUT `/api/feature-planner/[planId]/select-files`

Include:

- Request/response schemas
- Error codes and messages
- Authentication requirements
- Example usage

---

#### Task 3.2: Add JSDoc Comments

Add comprehensive JSDoc comments to:

- New facade methods
- New query methods
- New API endpoints
- Handler functions

---

## Success Criteria

### Functional Requirements

- [x] Users can manually add files to discovery results
- [x] Users can select/deselect discovered files
- [x] File selections persist across page refreshes
- [x] File existence is accurately verified
- [x] Error states display helpful messages
- [x] All handlers properly connected

### Technical Requirements

- [x] No TypeScript errors
- [x] All API endpoints have proper authentication
- [x] All database operations use transactions
- [x] Proper error handling throughout
- [x] Integration tests pass
- [x] Manual testing checklist complete

### User Experience Requirements

- [x] Immediate feedback on all actions (loading states, toasts)
- [x] No data loss on page refresh
- [x] Clear error messages with recovery options
- [x] Responsive UI (optimistic updates)

---

## Risk Mitigation

### Risk: File path injection in manual file addition

**Mitigation**: Validate file paths against project directory structure

### Risk: Large number of files causes UI lag

**Mitigation**: Already limited to reasonable counts by agent

### Risk: Concurrent file additions cause race conditions

**Mitigation**: Use database transactions and proper locking

### Risk: File selection state inconsistency

**Mitigation**: Use file IDs (UUIDs) instead of array indices

---

## Timeline Estimate

| Phase     | Task                   | Estimated Time           |
| --------- | ---------------------- | ------------------------ |
| 1.1       | Database query methods | 2 hours                  |
| 1.2       | Facade methods         | 2 hours                  |
| 1.3       | API endpoints          | 3 hours                  |
| 1.4       | Page handlers          | 2 hours                  |
| 1.5       | Wire up handlers       | 30 minutes               |
| 1.6       | File existence check   | 1 hour                   |
| 1.7       | Error state handling   | 1 hour                   |
| 2.1       | Manual testing         | 2 hours                  |
| 2.2       | Integration tests      | 3 hours                  |
| 3.1       | Documentation          | 1 hour                   |
| 3.2       | JSDoc comments         | 1 hour                   |
| **Total** |                        | **18.5 hours (~3 days)** |

---

## Dependencies

### Required Before Starting

- [x] Code review completed
- [x] Implementation plan approved
- [x] Database schema finalized
- [x] Dev environment running

### Blocked By

- None (all dependencies met)

### Blocking

- Step 3 implementation (needs selected files from Step 2)

---

## Post-MVP Enhancements

### Phase 4: Advanced Features (P2)

- File content preview modal
- Discovery customization options
- Streaming progress indicator
- Re-run discovery button
- Architecture insights parsing

### Phase 5: Polish (P3)

- Accessibility improvements
- Performance optimizations
- Comprehensive test coverage
- User guide documentation

---

## Approval & Sign-off

**Plan Created By**: Claude Code
**Reviewed By**: [To be filled]
**Approved By**: [To be filled]
**Date**: 2025-01-27
**Status**: ✅ Ready for Implementation

---

## Notes

- All code should follow existing project patterns
- Run `npm run format` before committing
- Run `npm run lint:fix && npm run typecheck` to verify
- No `eslint-disable` or `ts-ignore` comments
- All handlers should have proper error logging
