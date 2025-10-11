# Step 2 File Discovery - Bug Analysis & Implementation Plan

**Date:** 2025-10-11
**Feature:** Step 2 File Discovery MVP Completion
**Current Status:** ~75% Complete - Critical bugs blocking full functionality

---

## Executive Summary

The Step 2 file discovery implementation is mostly complete but has **3 critical bugs** that prevent users from:
1. Adding files manually through the autocomplete interface
2. Selecting/deselecting discovered files
3. Persisting file selections to the database

These bugs are caused by **empty placeholder functions** in the component tree that were never implemented.

---

## Architecture Overview

### Current Working Components ✅

1. **File Search API** - `src/app/api/feature-planner/files/search/route.ts`
   - ✅ Working glob-based file search
   - ✅ Proper validation with Zod
   - ✅ Returns up to 20 results
   - ✅ Filters out node_modules, .next, etc.

2. **File Discovery Service** - `src/lib/services/feature-planner.service.ts`
   - ✅ `executeFileDiscoveryAgent()` method working
   - ✅ Proper circuit breaker and retry logic
   - ✅ Parser implemented (`parseFileDiscoveryResponse()`)
   - ✅ Returns structured FileDiscoveryResult[]

3. **File Discovery Facade** - `src/lib/facades/feature-planner/feature-planner.facade.ts`
   - ✅ `runFileDiscoveryAsync()` method working
   - ✅ Creates discovery session
   - ✅ Executes agent
   - ✅ Persists results to database
   - ✅ Creates discovered_files records

4. **File Discovery API** - `src/app/api/feature-planner/discover/route.ts`
   - ✅ POST endpoint working
   - ✅ Calls facade method
   - ✅ Returns full session with discovered files

5. **UI Components**
   - ✅ `FileDiscoveryResults` - Displays discovered files beautifully
   - ✅ `FileAutocomplete` - Search UI works perfectly
   - ✅ `StepTwo` - Layout and structure complete
   - ✅ File grouping by priority (critical/high/medium/low)
   - ✅ Summary stats display
   - ✅ Checkboxes for selection

---

## Critical Bugs 🐛

### Bug #1: Empty `onFileAdded` Handler ❌

**Location:** `src/app/(app)/feature-planner/components/steps/step-orchestrator.tsx:86`

```typescript
<StepTwo
  discoverySession={discoverySession}
  onFileAdded={() => {}}  // ❌ EMPTY PLACEHOLDER
  onFileDiscovery={onFileDiscovery}
  onFileSelection={() => {}}
  selectedFiles={stepData.step2?.selectedFiles}
/>
```

**Impact:**
- Users can search for files using the autocomplete
- Users can select a file from search results
- Users can fill in description and priority
- **But clicking "Add File to Discovery" does nothing!** ❌

**Expected Behavior:**
1. Add file to discovery session in the database
2. Update local state to show the newly added file
3. Display success toast
4. Clear the autocomplete form

**Root Cause:**
The `onFileAdded` prop is passed as an empty function from `step-orchestrator.tsx`, and the orchestrator itself receives an empty function from `page.tsx`.

---

### Bug #2: Empty `onFileSelection` Handler ❌

**Location:** `src/app/(app)/feature-planner/components/steps/step-orchestrator.tsx:88`

```typescript
<StepTwo
  discoverySession={discoverySession}
  onFileAdded={() => {}}
  onFileDiscovery={onFileDiscovery}
  onFileSelection={() => {}}  // ❌ EMPTY PLACEHOLDER
  selectedFiles={stepData.step2?.selectedFiles}
/>
```

**Impact:**
- Users can see checkboxes next to each discovered file
- Users can click checkboxes
- **But selections are not saved!** ❌
- If user navigates away and comes back, selections are lost

**Expected Behavior:**
1. Track which files user has checked/unchecked
2. Update local state immediately for UI feedback
3. Persist selections (optional, could be local state only for MVP)
4. Pass selected files to Step 3 for plan generation

**Root Cause:**
The `onFileSelection` prop is passed as an empty function from `step-orchestrator.tsx`, and the orchestrator itself receives an empty function from `page.tsx`.

---

### Bug #3: No Manual File Addition to Database ❌

**Issue:** There's no API endpoint or facade method to add a manually discovered file to an existing discovery session.

**Current Flow:**
1. File discovery agent runs → creates `file_discovery_sessions` record
2. Agent finds files → creates `discovered_files` records linked to session
3. ✅ This works!

**Missing Flow:**
1. User searches and selects a file manually
2. ❌ No way to add it to the `discovered_files` table
3. ❌ File won't appear in the discovery results
4. ❌ File won't be available for Step 3

**What's Needed:**
- API endpoint: `POST /api/feature-planner/[planId]/files/add`
- Facade method: `addManualFileToDiscoveryAsync()`
- Query method: `addDiscoveredFileAsync()`

---

## Database Schema Analysis

### Current Schema ✅

The database schema **fully supports** manual file addition:

```typescript
// discovered_files table
export const discoveredFiles = pgTable('discovered_files', {
  id: text('id').primaryKey().notNull(),
  discoverySessionId: text('discovery_session_id').notNull(),
  filePath: text('file_path').notNull(),
  priority: filePriorityEnum('priority').notNull(),
  description: text('description'),

  // Manual file addition support
  isManuallyAdded: boolean('is_manually_added').default(false).notNull(),
  addedByUserId: text('added_by_user_id'),

  // Other metadata...
  role: text('role'),
  integrationPoint: text('integration_point'),
  reasoning: text('reasoning'),
  relevanceScore: integer('relevance_score').default(50),
  fileExists: boolean('file_exists').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Key Points:**
- ✅ `isManuallyAdded` field exists
- ✅ `addedByUserId` field exists
- ✅ All required fields are nullable except `filePath` and `priority`
- ✅ No blockers in the schema

---

## Implementation Plan

### Phase 1: Fix Core Handlers (30 minutes)

#### Task 1.1: Implement `handleFileAdded` in page.tsx

**File:** `src/app/(app)/feature-planner/page.tsx`

**Action:** Add new handler function

```typescript
const handleFileAdded = useCallback(async (file: {
  description: string;
  filePath: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}) => {
  if (!state.planId || !state.discoverySession) {
    toast.error('Please run file discovery first');
    return;
  }

  try {
    toast.loading('Adding file...', { id: 'add-file' });

    const response = await fetch(`/api/feature-planner/${state.planId}/files/add`, {
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

      // Update local state with the new file
      updateState({
        discoverySession: {
          ...state.discoverySession,
          discoveredFiles: [
            ...(state.discoverySession.discoveredFiles || []),
            data.data,
          ],
          totalFilesFound: (state.discoverySession.totalFilesFound || 0) + 1,
          // Update priority counts
          ...(file.priority === 'critical' && {
            criticalPriorityCount: (state.discoverySession.criticalPriorityCount || 0) + 1,
          }),
          ...(file.priority === 'high' && {
            highPriorityCount: (state.discoverySession.highPriorityCount || 0) + 1,
          }),
          ...(file.priority === 'medium' && {
            mediumPriorityCount: (state.discoverySession.mediumPriorityCount || 0) + 1,
          }),
          ...(file.priority === 'low' && {
            lowPriorityCount: (state.discoverySession.lowPriorityCount || 0) + 1,
          }),
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
}, [state.planId, state.discoverySession, updateState]);
```

**Changes:**
- Add `handleFileAdded` function
- Pass it to `StepOrchestrator`

#### Task 1.2: Implement `handleFileSelection` in page.tsx

**File:** `src/app/(app)/feature-planner/page.tsx`

**Action:** Add new handler function

```typescript
const handleFileSelection = useCallback((selectedFiles: string[]) => {
  updateState({
    stepData: {
      ...state.stepData,
      step2: {
        ...state.stepData.step2,
        discoveredFiles: state.discoverySession?.discoveredFiles || [],
        selectedFiles,
      },
    },
  });
}, [state.discoverySession?.discoveredFiles, state.stepData, updateState]);
```

**Changes:**
- Add `handleFileSelection` function
- Pass it to `StepOrchestrator`

#### Task 1.3: Wire up handlers in StepOrchestrator

**File:** `src/app/(app)/feature-planner/components/steps/step-orchestrator.tsx`

**Action:** Replace empty functions with actual props

```typescript
interface StepOrchestratorProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  // ... existing props
  onFileAdded: (file: {
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }) => void;
  onFileSelection: (files: string[]) => void;
}

export const StepOrchestrator = ({
  // ... existing props
  onFileAdded,
  onFileSelection,
  // ... rest
}: StepOrchestratorProps) => {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Step 2: File Discovery */}
      <Conditional isCondition={currentStep === 2}>
        <StepTwo
          discoverySession={discoverySession}
          onFileAdded={onFileAdded}  // ✅ FIXED
          onFileDiscovery={onFileDiscovery}
          onFileSelection={onFileSelection}  // ✅ FIXED
          selectedFiles={stepData.step2?.selectedFiles}
        />
      </Conditional>

      {/* ... other steps */}
    </div>
  );
};
```

---

### Phase 2: Create Manual File Addition API (45 minutes)

#### Task 2.1: Create Query Method

**File:** `src/lib/queries/feature-planner/feature-planner.query.ts`

**Action:** Add new method (if it doesn't already exist)

```typescript
/**
 * Add a manually discovered file to a discovery session
 */
static async addDiscoveredFileAsync(
  data: {
    sessionId: string;
    filePath: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    addedByUserId: string;
  },
  context: QueryContext,
): Promise<DiscoveredFile | null> {
  const db = context.dbInstance;

  const [file] = await db
    .insert(discoveredFiles)
    .values({
      id: createId(),
      discoverySessionId: data.sessionId,
      filePath: data.filePath,
      priority: data.priority,
      description: data.description,
      isManuallyAdded: true,
      addedByUserId: data.addedByUserId,
      fileExists: true, // TODO: Could verify with fs
      relevanceScore: 75, // Default score for manual additions
      createdAt: new Date(),
    })
    .returning();

  return file ?? null;
}
```

#### Task 2.2: Create Facade Method

**File:** `src/lib/facades/feature-planner/feature-planner.facade.ts`

**Action:** Add new method

```typescript
/**
 * Add a manually discovered file to a discovery session
 */
static async addManualFileToDiscoveryAsync(
  planId: string,
  sessionId: string,
  file: {
    filePath: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    description: string;
  },
  userId: string,
  dbInstance?: DatabaseExecutor,
): Promise<DiscoveredFile | null> {
  try {
    const context = createUserQueryContext(userId, { dbInstance });

    // Verify the plan belongs to the user
    const plan = await FeaturePlannerQuery.findPlanByIdAsync(planId, context);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Verify the session belongs to the plan
    const sessions = await FeaturePlannerQuery.getFileDiscoverySessionsByPlanAsync(planId, context);
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Discovery session not found');
    }

    // Add the file
    const discoveredFile = await FeaturePlannerQuery.addDiscoveredFileAsync(
      {
        sessionId,
        filePath: file.filePath,
        priority: file.priority,
        description: file.description,
        addedByUserId: userId,
      },
      context,
    );

    if (!discoveredFile) {
      throw new Error('Failed to add file');
    }

    // Update session counts
    const updateData: Record<string, number> = {
      totalFilesFound: (session.totalFilesFound || 0) + 1,
    };

    if (file.priority === 'critical') {
      updateData.criticalPriorityCount = (session.criticalPriorityCount || 0) + 1;
    } else if (file.priority === 'high') {
      updateData.highPriorityCount = (session.highPriorityCount || 0) + 1;
    } else if (file.priority === 'medium') {
      updateData.mediumPriorityCount = (session.mediumPriorityCount || 0) + 1;
    } else if (file.priority === 'low') {
      updateData.lowPriorityCount = (session.lowPriorityCount || 0) + 1;
    }

    await FeaturePlannerQuery.updateFileDiscoverySessionAsync(
      sessionId,
      updateData,
      context,
    );

    return discoveredFile;
  } catch (error) {
    const context: FacadeErrorContext = {
      facade: facadeName,
      method: 'addManualFileToDiscoveryAsync',
      operation: OPERATIONS.FEATURE_PLANNER.ADD_MANUAL_FILE,
      data: { planId, sessionId, file },
      userId,
    };
    throw createFacadeError(context, error);
  }
}
```

#### Task 2.3: Create API Route

**File:** `src/app/api/feature-planner/[planId]/files/add/route.ts` (NEW)

**Action:** Create new file

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';

import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { createServiceError } from '@/lib/utils/error-builders';
import { getUserId } from '@/utils/user-utils';

const addFileSchema = z.object({
  sessionId: z.string().min(1),
  filePath: z.string().min(1),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  description: z.string().min(1),
});

/**
 * POST /api/feature-planner/[planId]/files/add
 * Add a manually discovered file to a discovery session
 */
export async function POST(
  request: Request,
  { params }: { params: { planId: string } }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = addFileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { sessionId, filePath, priority, description } = validation.data;

    const file = await FeaturePlannerFacade.addManualFileToDiscoveryAsync(
      params.planId,
      sessionId,
      { filePath, priority, description },
      userId
    );

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Failed to add file' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'File added successfully',
        data: file,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding manual file:', error);

    const context: ServiceErrorContext = {
      endpoint: '/api/feature-planner/[planId]/files/add',
      method: 'POST',
      operation: 'add-manual-file',
      service: 'feature-planner',
      isRetryable: true,
    };

    const serviceError = createServiceError(context, error);

    return NextResponse.json(
      { success: false, error: serviceError.message },
      { status: 500 }
    );
  }
}
```

---

### Phase 3: Testing & Validation (30 minutes)

#### Task 3.1: Manual Testing Checklist

**Test Scenario 1: File Discovery Flow**
- [ ] Start with a new feature request
- [ ] Complete Step 1 refinement
- [ ] Navigate to Step 2
- [ ] Click "Start File Discovery"
- [ ] Wait for discovery to complete
- [ ] Verify files are displayed grouped by priority
- [ ] Verify summary stats are correct

**Test Scenario 2: Manual File Addition**
- [ ] Type in file search autocomplete
- [ ] Verify suggestions appear (e.g., type "src/")
- [ ] Select a file from suggestions
- [ ] Set priority (e.g., "high")
- [ ] Enter description
- [ ] Click "Add File to Discovery"
- [ ] Verify success toast appears
- [ ] Verify file appears in discovery results
- [ ] Verify file is marked as manually added (check UI/database)
- [ ] Verify counts updated (e.g., high priority count +1)

**Test Scenario 3: File Selection**
- [ ] Check/uncheck files in discovery results
- [ ] Verify checkboxes update immediately
- [ ] Verify selection count updates
- [ ] Navigate away from Step 2 and back
- [ ] Verify selections persist (MVP: local state is fine)
- [ ] Proceed to Step 3
- [ ] Verify selected files are available for planning

#### Task 3.2: Database Validation

**Queries to Run:**

```sql
-- Check if manually added files are saved correctly
SELECT
  id,
  file_path,
  priority,
  description,
  is_manually_added,
  added_by_user_id,
  created_at
FROM discovered_files
WHERE discovery_session_id = '<session_id>'
  AND is_manually_added = true;

-- Verify session counts updated
SELECT
  id,
  total_files_found,
  critical_priority_count,
  high_priority_count,
  medium_priority_count,
  low_priority_count
FROM file_discovery_sessions
WHERE id = '<session_id>';
```

#### Task 3.3: Error Handling Tests

**Test Cases:**
- [ ] Try to add file before running discovery (should show error)
- [ ] Try to add duplicate file (should prevent or allow based on requirements)
- [ ] Try to add file with empty description (should show validation error)
- [ ] Try to add file with invalid priority (should show validation error)
- [ ] Test network error during file addition (should show error toast)

---

## File Selection Strategy

### Database Persistence

**Implementation:**
- Add `isSelected` field updates via API
- Fetch selected files on mount
- Sync local state with database

**Decision for MVP:** Use **Option A** (local state only)

---

## Constants Updates Needed

**File:** `src/lib/constants.ts`

**Action:** Add new operation constant (if missing)

```typescript
export const OPERATIONS = {
  // ... existing operations
  FEATURE_PLANNER: {
    // ... existing ops
    ADD_MANUAL_FILE: 'add-manual-file',
  },
};
```

---

## Summary of Changes

### Files to Modify ✏️

1. `src/app/(app)/feature-planner/page.tsx`
   - Add `handleFileAdded` function
   - Add `handleFileSelection` function
   - Pass handlers to `StepOrchestrator`

2. `src/app/(app)/feature-planner/components/steps/step-orchestrator.tsx`
   - Add `onFileAdded` prop to interface
   - Add `onFileSelection` prop to interface
   - Pass props to `StepTwo`

3. `src/lib/queries/feature-planner/feature-planner.query.ts`
   - Add `addDiscoveredFileAsync()` method

4. `src/lib/facades/feature-planner/feature-planner.facade.ts`
   - Add `addManualFileToDiscoveryAsync()` method

5. `src/lib/constants.ts` (if operation constant missing)
   - Add `ADD_MANUAL_FILE` operation

### Files to Create 📄

1. `src/app/api/feature-planner/[planId]/files/add/route.ts`
   - POST endpoint for adding manual files

---

## Time Estimates

| Phase | Tasks | Time | Total |
|-------|-------|------|-------|
| Phase 1 | Fix handlers (1.1-1.3) | 10min each | 30min |
| Phase 2 | Create API (2.1-2.3) | 15min each | 45min |
| Phase 3 | Testing (3.1-3.3) | 30min total | 30min |
| **TOTAL** | | | **1h 45min** |

---

## Success Criteria

**MVP Complete When:**
- ✅ Users can manually add files via autocomplete
- ✅ `npm run lint:fix` passes with no errors
- ✅ `npm run typecheck` passes with no errors
- ✅ Added files appear in discovery results immediately
- ✅ Added files are marked as "manually added"
- ✅ File selections tracked in local state
- ✅ Selected files passed to Step 3
- ✅ No console errors
- ✅ Proper toast notifications
- ✅ Database records created correctly

---

## Next Steps (Post-MVP)

**Future Enhancements:**
1. Persist file selections to database
2. File existence verification (check if file actually exists)
3. File type icons based on extension
4. File preview/quick view
5. Bulk file operations (select all by priority)
6. File recommendation based on similar features
7. Import files from a list/CSV
8. Export discovered files to JSON

---

**Status:** ✅ Analysis Complete - Ready for Implementation
**Priority:** 🔴 Critical (Blocking MVP)
**Estimated Effort:** 1h 45min
**Next Action:** Begin Phase 1 implementation
