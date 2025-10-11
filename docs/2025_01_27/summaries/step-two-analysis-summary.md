# Step 2 File Discovery - Analysis Summary

**Date**: 2025-01-27
**Status**: Analysis Complete, Ready for Implementation
**Documents Generated**:

- Code Review: `docs/2025_01_27/code-reviews/step-two-file-discovery-review.md`
- Implementation Plan: `docs/2025_01_27/plans/step-two-file-discovery-mvp-completion-plan.md`

---

## Executive Summary

The file discovery step (Step 2) of the feature planner has been thoroughly analyzed. The backend implementation is **excellent (90% complete)** with proper architecture, error handling, and database persistence. However, the frontend integration is **incomplete (40% complete)** with critical user interaction handlers missing.

### Key Findings

✅ **What's Working Well**:

- Backend API and service layer are production-ready
- Database schema is well-designed
- UI components display data correctly
- Type safety throughout the codebase

❌ **What's Broken**:

- Manual file addition button doesn't work (handler stubbed)
- File selection checkboxes don't persist (handler stubbed)
- File selections lost on page refresh (no database persistence)
- File existence not verified (defaults to true)

---

## Current Status: 60% Complete

### Backend: 90% Complete ✅

- ✅ API endpoint with authentication
- ✅ Facade layer with proper error handling
- ✅ Service layer with Claude Agent SDK integration
- ✅ Database persistence with full metadata
- ✅ Circuit breaker and retry logic
- ✅ Response parsing for JSON and markdown

### Frontend: 40% Complete ⚠️

- ✅ Results display with priority grouping
- ✅ File autocomplete with search
- ✅ Execution metrics display
- ❌ Manual file addition (UI only, no backend connection)
- ❌ File selection persistence (checkboxes don't save)
- ❌ Error state handling (shows results even on failure)

---

## Critical Issues (MVP Blockers)

### 1. Missing Handler Implementation 🔴

**Location**: `step-orchestrator.tsx` lines 86-88

```typescript
onFileAdded={() => {}}  // ❌ Stub
onFileSelection={() => {}}  // ❌ Stub
```

**Impact**: Core features don't work - users can't add files or save selections.

**Fix**: Implement proper handlers in `page.tsx` that call API endpoints.

---

### 2. No Database Persistence 🔴

**Issue**: User selections stored in React state only, lost on refresh.

**Impact**: Data loss, broken workflow, can't proceed to Step 3.

**Fix**:

- Create `PUT /api/feature-planner/[planId]/select-files` endpoint
- Update `featurePlans.selectedFiles` in database
- Load selections on page mount

---

### 3. File Existence Not Verified 🔴

**Location**: `feature-planner.facade.ts` line 281

```typescript
fileExists: file.fileExists ?? true,  // ❌ Doesn't check filesystem
```

**Impact**: UI shows green checkmark for files that don't exist.

**Fix**: Use `fs.existsSync()` to verify files actually exist.

---

### 4. No Error State Handling 🔴

**Issue**: Failed discovery sessions still show results instead of error message.

**Impact**: Confusing UX when errors occur.

**Fix**: Check `discoverySession.status === 'failed'` and show error state.

---

## Implementation Plan Overview

### Phase 1: Critical Fixes (3 days)

1. **Add Database Methods** - Create query methods for file operations
2. **Add Facade Methods** - Business logic for adding files and updating selections
3. **Create API Endpoints** - POST for file addition, PUT for selection updates
4. **Implement Handlers** - Connect UI to backend via API calls
5. **Wire Up Components** - Remove stub handlers, pass real handlers through
6. **Fix File Verification** - Add `existsSync()` check
7. **Add Error States** - Handle failed discovery sessions

### Phase 2: Testing (1 day)

1. **Manual Testing** - Complete testing checklist for all features
2. **Integration Tests** - Write tests for facade and API endpoints

### Phase 3: Documentation (0.5 days)

1. **API Documentation** - Document new endpoints
2. **JSDoc Comments** - Add comprehensive code documentation

**Total Estimated Time**: 4-5 days

---

## Detailed Implementation Steps

### Step 1: Database Query Methods

**File**: `src/lib/queries/feature-planner/feature-planner.query.ts`

Add methods:

- `addDiscoveredFileAsync()` - Insert manually added file
- `updateSelectedFilesAsync()` - Update plan's selected files
- `updateFileSelectionAsync()` - Toggle file selection status

### Step 2: Facade Methods

**File**: `src/lib/facades/feature-planner/feature-planner.facade.ts`

Add methods:

- `addManualFileAsync()` - Add file with validation and persistence
- `updateSelectedFilesAsync()` - Update selections with authorization

### Step 3: API Endpoints

**Files**:

- `src/app/api/feature-planner/[planId]/add-file/route.ts`
- `src/app/api/feature-planner/[planId]/select-files/route.ts`

Implement:

- Authentication and authorization
- Input validation with Zod
- Error handling with proper status codes
- Consistent response format

### Step 4: Page Handlers

**File**: `src/app/(app)/feature-planner/page.tsx`

Implement:

- `handleFileAdded()` - Call add-file API, update state
- `handleFileSelection()` - Call select-files API, optimistic update

### Step 5: Wire Up Handlers

**File**: `src/app/(app)/feature-planner/components/steps/step-orchestrator.tsx`

Replace:

```typescript
// Before
onFileAdded={() => {}}
onFileSelection={() => {}}

// After
onFileAdded={onFileAdded}
onFileSelection={onFileSelection}
```

### Step 6: Fix File Verification

**File**: `src/lib/facades/feature-planner/feature-planner.facade.ts`

Add:

```typescript
import { existsSync } from 'fs';
import { join } from 'path';

fileExists: existsSync(join(process.cwd(), file.filePath));
```

### Step 7: Error State Handling

**File**: `src/app/(app)/feature-planner/components/steps/step-two.tsx`

Add error state check and display before showing results.

---

## Testing Checklist

### Manual Testing

- [ ] Manual file addition works end-to-end
- [ ] File selections persist across page refreshes
- [ ] File existence indicators are accurate
- [ ] Error states display correctly
- [ ] All toast notifications appear
- [ ] Loading states show during operations

### Integration Testing

- [ ] Add manual file to session
- [ ] Update selected files for plan
- [ ] Verify file existence check
- [ ] Handle discovery failures gracefully

---

## Success Criteria

### Functional ✅

- Users can add files manually
- Users can select/deselect files
- Selections persist across refreshes
- File existence is accurate
- Errors display helpful messages

### Technical ✅

- No TypeScript errors
- All endpoints authenticated
- Database transactions used
- Proper error handling
- Tests pass

### UX ✅

- Immediate feedback (loading, toasts)
- No data loss
- Clear error messages
- Responsive UI

---

## Files Modified

### New Files (7)

1. `src/app/api/feature-planner/[planId]/add-file/route.ts`
2. `src/app/api/feature-planner/[planId]/select-files/route.ts`
3. `tests/integration/feature-planner/step-two.integration.test.ts`
4. `docs/2025_01_27/code-reviews/step-two-file-discovery-review.md`
5. `docs/2025_01_27/plans/step-two-file-discovery-mvp-completion-plan.md`
6. `docs/2025_01_27/api/feature-planner-endpoints.md`
7. `docs/2025_01_27/summaries/step-two-analysis-summary.md`

### Modified Files (5)

1. `src/lib/queries/feature-planner/feature-planner.query.ts` - Add query methods
2. `src/lib/facades/feature-planner/feature-planner.facade.ts` - Add facade methods, fix file check
3. `src/app/(app)/feature-planner/page.tsx` - Implement handlers
4. `src/app/(app)/feature-planner/components/steps/step-orchestrator.tsx` - Wire up handlers
5. `src/app/(app)/feature-planner/components/steps/step-two.tsx` - Add error state

---

## Risk Assessment

### Low Risk ✅

- Database operations (using existing patterns)
- API endpoints (following established structure)
- Error handling (comprehensive coverage)

### Medium Risk ⚠️

- File path validation (need to prevent path traversal)
- Concurrent operations (mitigated with transactions)
- State synchronization (handled with optimistic updates)

### Mitigation Strategies

- Validate all file paths against project root
- Use database transactions for all operations
- Implement optimistic UI updates with rollback
- Add comprehensive error logging
- Test with concurrent requests

---

## Post-MVP Enhancements

These features are **not required for MVP** but should be considered for future iterations:

### P2 - Important Features

- File content preview modal
- Discovery customization options (directory filters, file type filters)
- Streaming progress indicator
- Re-run discovery button

### P3 - Nice to Have

- Accessibility improvements (aria-live regions)
- Performance optimizations (pagination for large file lists)
- Architecture insights parsing
- User guide documentation

---

## Next Steps

### Immediate Actions

1. ✅ Review code review document
2. ✅ Review implementation plan
3. 🔄 **Next**: Start implementing database query methods
4. Continue with facade methods
5. Create API endpoints
6. Implement handlers
7. Wire up components
8. Test thoroughly

### Before Starting Implementation

- Ensure dev environment is running (`npm run dev`)
- Create feature branch (`git checkout -b fix/step-two-file-discovery`)
- Review existing patterns in codebase
- Read through both generated documents fully

### During Implementation

- Follow the implementation plan step-by-step
- Run `npm run format` after each file
- Run `npm run lint:fix && npm run typecheck` regularly
- Test each feature as it's completed
- Commit frequently with clear messages

### After Implementation

- Complete manual testing checklist
- Run integration tests
- Update documentation
- Create pull request
- Request code review

---

## Key Learnings

### What Went Well ✅

- Backend architecture is solid and maintainable
- Clear separation of concerns (API → Facade → Service → Database)
- Type safety throughout
- Good error handling patterns

### What Needs Improvement 🔄

- Frontend components should have integration tests from the start
- Handler stubs should throw errors instead of silently failing
- File existence should be verified during discovery, not just stored
- Documentation should be written alongside code

---

## References

- **Code Review**: `docs/2025_01_27/code-reviews/step-two-file-discovery-review.md`
- **Implementation Plan**: `docs/2025_01_27/plans/step-two-file-discovery-mvp-completion-plan.md`
- **Specification**: `docs/2025_01_27/specs/FEATURE-PLANNER-SPEC.md`
- **Project Guidelines**: `CLAUDE.md`

---

## Contacts

**For Questions**:

- Architecture: Review `docs/2025_10_08/architecture/` folder
- Database: Use Neon DB Expert subagent
- Testing: Review existing test patterns in `tests/` folder

**Resources**:

- Next.js Documentation: https://nextjs.org/docs
- Drizzle ORM: https://orm.drizzle.team/docs
- Claude Agent SDK: (internal documentation)

---

## Appendix: Code Snippets

### Example Database Query Method

```typescript
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
): Promise<DiscoveredFile | null> {
  try {
    const [file] = await context.db
      .insert(discoveredFiles)
      .values(data)
      .returning();

    return file || null;
  } catch (error) {
    console.error('Error adding discovered file:', error);
    throw error;
  }
}
```

### Example Handler Implementation

```typescript
const handleFileAdded = useCallback(
  async (file: { description: string; filePath: string; priority: string }) => {
    if (!state.planId || !state.discoverySession) return;

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
        updateState({ discoverySession: data.data.updatedSession });
      } else {
        toast.error(data.message || 'Failed to add file');
      }
    } catch (error) {
      toast.error('Failed to add file');
    }
  },
  [state.planId, state.discoverySession, updateState],
);
```

---

**Document Prepared By**: Claude Code
**Analysis Complete**: 2025-01-27
**Status**: ✅ Ready for Implementation
