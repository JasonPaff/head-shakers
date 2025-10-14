# Two-Phase Streaming Implementation Plan

**Date:** 2025-10-14
**Type:** Refactor
**Reference:** `docs/2025_10_14/analysis/two-phase-streaming-deep-dive.md`

---

## Overview

This plan outlines the refactoring of the feature suggestion system to use a two-phase streaming approach:
- **Phase 1**: Server action creates ephemeral job and returns jobId
- **Phase 2**: Client connects to SSE endpoint for streaming updates

### Important Notes

- **This is a REFACTOR** - Much of the code already exists
- **NO test writing** - Tests will be written separately
- **NO deployment tasks** - Focus on implementation only
- **NO backwards compatibility** - This is a breaking change
- **Each task includes validation steps**
- **Follow existing project patterns**
- **React code must follow React-Coding-Conventions.md**

---

## Validation Requirements

### For ALL Tasks
- Run `npm run lint:fix` after implementation
- Run `npm run typecheck` to ensure no TypeScript errors
- Verify no errors before marking task complete

### For React/Frontend Tasks (Tasks 13-25)
Additional validation against `.claude/conventions/React-Coding-Conventions.md`:
- ✅ Boolean variables use `is` prefix
- ✅ Derived variables (used in rendering) use `_` prefix
- ✅ Event handlers use `handle` prefix
- ✅ Callback props use `on` prefix
- ✅ Component follows 7-step internal organization
- ✅ Conditional rendering uses `<Conditional>` component
- ✅ UI sections have block comments
- ✅ Class composition uses `cn()` utility

---

## Phase 1: Infrastructure & Setup (Tasks 1-2)

### Task 1: Setup Redis/Storage Infrastructure
**Description:** Configure Redis client for job metadata storage
**Files:**
- Review existing Redis patterns in codebase
- Initialize Redis client (Upstash)

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Existing Patterns:** Check for existing Redis setup in `src/lib/` directory

---

### Task 2: Create JobMetadata Interface and Schemas
**Description:** Define TypeScript interfaces and Zod schemas for job metadata
**Files:**
- Create interface in appropriate types file
- Create Zod schema in `src/lib/validations/`

**Pattern Reference:**
```typescript
interface JobMetadata {
  userId: string;
  input: {
    pageOrComponent: string;
    featureType: string;
    priorityLevel: string;
    additionalContext?: string;
    customModel?: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: number;
}
```

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Existing Patterns:** Follow Zod schema patterns in `src/lib/validations/`

---

## Phase 2: Server Action Implementation (Tasks 3-5)

### Task 3: Refactor startFeatureSuggestionAction
**Description:** Update or create server action for job creation
**Files:**
- `src/lib/actions/feature-planner/feature-planner.actions.ts`

**Requirements:**
- Use `authActionClient` pattern
- Return jobId immediately (no AI execution)
- Response time: 50-100ms

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Existing Patterns:** Follow existing action patterns in `src/lib/actions/`

---

### Task 4: Add Job Creation Validation
**Description:** Implement input validation with Zod
**Files:**
- `src/lib/actions/feature-planner/feature-planner.actions.ts`

**Schema:**
```typescript
z.object({
  pageOrComponent: z.string().min(1).max(200),
  featureType: z.enum(['enhancement', 'new-capability', 'optimization', 'ui-improvement', 'integration']),
  priorityLevel: z.enum(['low', 'medium', 'high', 'critical']),
  additionalContext: z.string().max(1000).optional(),
  customModel: z.string().optional(),
})
```

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Existing Patterns:** Match existing action input schemas

---

### Task 5: Implement Job Metadata Storage
**Description:** Store job metadata in Redis with TTL
**Files:**
- `src/lib/actions/feature-planner/feature-planner.actions.ts`

**Requirements:**
- Store with key: `suggestion:${jobId}`
- TTL: 600 seconds (10 minutes)
- Generate jobId with `crypto.randomUUID()`

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Existing Patterns:** Follow existing Redis patterns if available

---

## Phase 3: SSE Endpoint Implementation (Tasks 6-12)

### Task 6: Create SSE Endpoint Route
**Description:** Create SSE endpoint at `/api/feature-planner/suggest-feature/[jobId]/route.ts`
**Files:**
- `src/app/api/feature-planner/suggest-feature/[jobId]/route.ts`

**Requirements:**
```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  // Implementation
}
```

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Existing Patterns:** Follow existing API route patterns in `src/app/api/`

---

### Task 7: Implement Authentication & Authorization
**Description:** Add authentication and job ownership verification
**Files:**
- `src/app/api/feature-planner/suggest-feature/[jobId]/route.ts`

**Requirements:**
- Check user authentication with getUserId()
- Verify jobId belongs to user
- Return 401/403 if unauthorized

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Existing Patterns:** Use existing auth patterns

---

### Task 8: Create ReadableStream for SSE
**Description:** Implement SSE streaming with proper formatting
**Files:**
- `src/app/api/feature-planner/suggest-feature/[jobId]/route.ts`

**SSE Format:**
```
event: connected
data: {"jobId":"...","timestamp":123456}

event: delta
data: {"text":"...","totalLength":100}

event: complete
data: {"suggestions":[...],"tokenUsage":{...}}
```

**Headers:**
```typescript
{
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no',
}
```

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

---

### Task 9: Integrate Claude SDK with Streaming
**Description:** Update FeaturePlannerService to support streaming callback
**Files:**
- `src/lib/services/feature-planner.service.ts` (or equivalent)
- SSE endpoint route

**Requirements:**
- Pass streaming callback to `executeFeatureSuggestionAgent`
- Callback receives text deltas
- Send deltas via SSE

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Existing Patterns:** Review existing FeaturePlannerService implementation

---

### Task 10: Implement Update Throttling
**Description:** Throttle SSE updates to 100ms intervals
**Files:**
- SSE endpoint route

**Implementation:**
```typescript
let lastUpdateTime = Date.now();

const onUpdate = (text: string) => {
  const now = Date.now();
  if (now - lastUpdateTime >= 100) {
    sendEvent('delta', { text });
    lastUpdateTime = now;
  }
};
```

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

---

### Task 11: Add Custom Agent Support
**Description:** Integrate custom agent configuration
**Files:**
- SSE endpoint route

**Requirements:**
- Use `FeaturePlannerFacade.getFeatureSuggestionAgentAsync`
- Pass custom agent to service

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Existing Patterns:** Follow existing custom agent patterns

---

### Task 12: Implement Job Lifecycle Management
**Description:** Update job status and cleanup
**Files:**
- SSE endpoint route

**Status Transitions:**
- `pending` → `in_progress` (when stream starts)
- `in_progress` → `completed` (on success)
- `in_progress` → `failed` (on error)

**Cleanup:**
- Delete job from Redis on completion
- Keep failed jobs for 1 hour (debugging)

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

---

## Phase 4: React Hook Implementation (Tasks 13-18)

### Task 13: Refactor useSuggestFeature Hook with TanStack Query
**Description:** Update custom hook to use TanStack Query for Phase 1
**Files:**
- `src/app/(app)/feature-planner/hooks/use-suggest-feature.ts` (or similar)

**Requirements:**
- Use `useMutation` for job creation
- Custom state for Phase 2 streaming
- Boolean state must use `is` prefix
- Follow hook organization patterns

**React Convention Checks:**
- ✅ Boolean naming: `isLoading`, `isConnecting`, `isStreaming`
- ✅ Hook organization: state → hooks → callbacks
- ✅ Event handlers with `handle` prefix

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Review:** `.claude/conventions/React-Coding-Conventions.md`

---

### Task 14: Implement SSE Connection Logic
**Description:** Add fetch() and ReadableStream reader for SSE
**Files:**
- `src/app/(app)/feature-planner/hooks/use-suggest-feature.ts`

**Requirements:**
```typescript
const connectToStream = useCallback(async (jobId: string) => {
  const response = await fetch(`/api/feature-planner/suggest-feature/${jobId}`, {
    method: 'GET',
    headers: { 'Accept': 'text/event-stream' },
  });

  const reader = response.body.getReader();
  // ... stream reading logic
}, []);
```

**React Convention Checks:**
- ✅ useCallback for async functions
- ✅ Proper dependency array

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Review:** `.claude/conventions/React-Coding-Conventions.md`

---

### Task 15: Add SSE Event Parsing
**Description:** Parse and handle SSE messages
**Files:**
- `src/app/(app)/feature-planner/hooks/use-suggest-feature.ts`

**Event Types:**
- `connected`: Initial connection
- `delta`: Text chunk
- `complete`: Final result
- `error`: Error message

**React Convention Checks:**
- ✅ Switch statement for event handling
- ✅ State updates in proper locations

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Review:** `.claude/conventions/React-Coding-Conventions.md`

---

### Task 16: Implement State Machine
**Description:** Add status state with transitions
**Files:**
- `src/app/(app)/feature-planner/hooks/use-suggest-feature.ts`

**States:**
```typescript
type Status = 'idle' | 'creating' | 'connecting' | 'streaming' | 'complete' | 'error';
```

**Transitions:**
```
idle → creating → connecting → streaming → complete/error
```

**React Convention Checks:**
- ✅ All boolean state uses `is` prefix
- ✅ Status type properly defined
- ✅ State organization follows conventions

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Review:** `.claude/conventions/React-Coding-Conventions.md`

---

### Task 17: Add Progress Estimation
**Description:** Calculate progress from accumulated text
**Files:**
- `src/app/(app)/feature-planner/hooks/use-suggest-feature.ts`

**Implementation:**
```typescript
// Typical suggestion is ~2000 characters
const _estimatedProgress = Math.min(
  95,
  Math.floor((accumulatedLength / 2000) * 100)
);
```

**React Convention Checks:**
- ✅ Derived variable uses `_` prefix: `_estimatedProgress`
- ✅ Placed after hooks, before return

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Review:** `.claude/conventions/React-Coding-Conventions.md`

---

### Task 18: Implement Cancellation Support
**Description:** Add ability to cancel streaming
**Files:**
- `src/app/(app)/feature-planner/hooks/use-suggest-feature.ts`

**Implementation:**
```typescript
const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

const cancelSuggestion = useCallback(() => {
  if (readerRef.current) {
    readerRef.current.cancel();
    readerRef.current = null;
  }
  setStatus('idle');
}, []);
```

**React Convention Checks:**
- ✅ useRef for mutable reference
- ✅ useCallback for cancel function
- ✅ Proper cleanup

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Review:** `.claude/conventions/React-Coding-Conventions.md`

---

## Phase 5: UI Components (Tasks 19-23)

### Task 19: Refactor FeatureSuggestionForm Component
**Description:** Update or create form component with status displays
**Files:**
- `src/app/(app)/feature-planner/components/feature-suggestion-form.tsx` (or similar)

**Requirements:**
- Use existing form components
- Show different UI for each status
- Follow component organization

**React Convention Checks:**
- ✅ Kebab-case file naming
- ✅ Named export
- ✅ Arrow function component
- ✅ Props interface: `FeatureSuggestionFormProps`
- ✅ 7-step internal organization
- ✅ Boolean props with `is` prefix
- ✅ UI block comments

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Review:** `.claude/conventions/React-Coding-Conventions.md`

---

### Task 20: Add Progressive Text Display
**Description:** Show streaming text with cursor animation
**Files:**
- Form component or separate component

**Implementation:**
```tsx
{/* Streaming Text Display */}
<div className={'whitespace-pre-wrap font-mono text-xs'}>
  {partialText}
  <span className={'animate-pulse'}>▋</span>
</div>
```

**React Convention Checks:**
- ✅ UI block comment
- ✅ Class composition with `cn()` if needed
- ✅ Conditional rendering with `<Conditional>`

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Review:** `.claude/conventions/React-Coding-Conventions.md`

---

### Task 21: Implement Progress Bar and Status Messages
**Description:** Show progress and status for each phase
**Files:**
- Form component

**Components:**
- Use existing `<Progress>` from `ui/progress`
- Use existing `<Card>` components

**Status Messages:**
- `creating`: "Creating job..."
- `connecting`: "Connecting to AI..."
- `streaming`: "Generating suggestions..." + progress

**React Convention Checks:**
- ✅ Derived variables for visibility: `_isCreating`, `_isConnecting`, `_isStreaming`
- ✅ UI block comments for each section
- ✅ `<Conditional>` for conditional rendering

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Review:** `.claude/conventions/React-Coding-Conventions.md`

---

### Task 22: Add Error Display and Retry
**Description:** Show errors with retry functionality
**Files:**
- Form component

**Requirements:**
- Use existing Card components
- Show error message
- Provide retry button
- Event handler: `handleRetry`

**React Convention Checks:**
- ✅ Error state: `error` (string | null)
- ✅ Boolean: `_isErrorVisible`
- ✅ Event handler: `handleRetry`
- ✅ UI block comment: `{/* Error Display */}`

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Review:** `.claude/conventions/React-Coding-Conventions.md`

---

### Task 23: Create Final Results Display
**Description:** Show suggestion cards on completion
**Files:**
- Form component or separate results component

**Requirements:**
- Use existing Card components
- Show all suggestions
- Display title, rationale, description
- Show implementation considerations

**React Convention Checks:**
- ✅ Derived variable: `_isSuggestionsVisible`
- ✅ UI block comment: `{/* Suggestion Results */}`
- ✅ Map over suggestions properly

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Review:** `.claude/conventions/React-Coding-Conventions.md`

---

## Phase 6: Error Handling & Resilience (Tasks 24-26)

### Task 24: Add Timeout Handling
**Description:** Implement 2-minute timeout for SSE connections
**Files:**
- `use-suggest-feature` hook

**Implementation:**
```typescript
useEffect(() => {
  if (status === 'streaming') {
    const timeout = setTimeout(() => {
      readerRef.current?.cancel();
      setError('Request timed out after 2 minutes');
      setStatus('error');
    }, 120000);

    return () => clearTimeout(timeout);
  }
}, [status]);
```

**React Convention Checks:**
- ✅ useEffect cleanup
- ✅ Boolean: `isTimedOut` if needed

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Review:** `.claude/conventions/React-Coding-Conventions.md`

---

### Task 25: Implement Network Error Handling
**Description:** Handle network errors gracefully
**Files:**
- `use-suggest-feature` hook

**Requirements:**
- Try-catch blocks around fetch
- User-friendly error messages
- Distinguish between network errors and business logic errors

**React Convention Checks:**
- ✅ Error state properly managed
- ✅ Error messages descriptive

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Review:** `.claude/conventions/React-Coding-Conventions.md`

---

### Task 26: Add Client Disconnect Handling
**Description:** Handle client disconnects in SSE endpoint
**Files:**
- SSE endpoint route

**Implementation:**
```typescript
// In ReadableStream
cancel() {
  console.log('[SSE] Client disconnected');
  // Optional: Update job status to cancelled
}
```

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

---

## Phase 7: Monitoring & Security (Tasks 27-29)

### Task 27: Add Sentry Logging
**Description:** Log key events for monitoring
**Files:**
- Server action
- SSE endpoint

**Requirements:**
- Use existing Sentry patterns
- Add breadcrumbs at key points
- Use `SENTRY_BREADCRUMB_CATEGORIES` and `SENTRY_LEVELS`

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Existing Patterns:** Follow existing Sentry usage

---

### Task 28: Implement Job Creation Rate Limiting
**Description:** Limit job creation to 10 per user per minute
**Files:**
- Server action or middleware

**Requirements:**
- Track job creation per user
- Return error if rate exceeded
- Follow existing rate limiting patterns

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Existing Patterns:** Check for existing rate limiting implementation

---

### Task 29: Implement SSE Connection Rate Limiting
**Description:** Limit to 5 concurrent SSE connections per user
**Files:**
- SSE endpoint

**Requirements:**
- Track active connections per user
- Return 429 if limit exceeded
- Clean up on disconnect

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

---

## Phase 8: Performance & Monitoring (Task 30)

### Task 30: Add Performance Monitoring
**Description:** Track execution metrics
**Files:**
- Server action
- SSE endpoint

**Metrics:**
- Job creation time
- Streaming duration
- Token usage
- Error rates

**Validation:**
```bash
npm run lint:fix
npm run typecheck
```

**Existing Patterns:** Follow existing monitoring patterns

---

## Phase 9: Manual Verification (Task 31)

### Task 31: Manual Testing
**Description:** Test complete two-phase flow in development

**Test Cases:**
1. **Happy Path**
   - Submit form
   - Verify job creation (50-100ms response)
   - Verify SSE connection
   - Verify streaming updates
   - Verify final results

2. **Error Cases**
   - Test with invalid input
   - Test with expired jobId
   - Test with unauthorized user
   - Test network disconnect
   - Test timeout (may need to mock)

3. **UI States**
   - Verify all status messages
   - Verify progress bar updates
   - Verify cursor animation
   - Verify error display
   - Verify retry functionality

4. **Edge Cases**
   - Test cancellation
   - Test rapid successive requests
   - Test browser refresh during streaming

**Checklist:**
- [ ] Form submission works
- [ ] Job created successfully
- [ ] SSE connection established
- [ ] Text streams progressively
- [ ] Progress bar updates
- [ ] Final results display
- [ ] Error handling works
- [ ] Cancellation works
- [ ] Retry works
- [ ] No console errors
- [ ] No lint errors
- [ ] No TypeScript errors

---

## Summary

### Task Breakdown
- **Infrastructure**: 2 tasks
- **Server Action**: 3 tasks
- **SSE Endpoint**: 7 tasks
- **React Hook**: 6 tasks
- **UI Components**: 5 tasks
- **Error Handling**: 3 tasks
- **Monitoring**: 4 tasks
- **Testing**: 1 task

**Total: 31 tasks**

### Critical Success Factors
1. Follow existing code patterns
2. Validate each task with lint + typecheck
3. Follow React conventions for all React code
4. Ensure all boolean variables use `is` prefix
5. Ensure all derived variables use `_` prefix
6. Add UI block comments to all components
7. Test thoroughly before marking complete

### Common Pitfalls to Avoid
- ❌ Don't use `has`, `can`, `should` for booleans (use `is`)
- ❌ Don't forget `_` prefix for derived variables
- ❌ Don't skip validation steps
- ❌ Don't ignore lint/typecheck errors
- ❌ Don't write new code without checking existing patterns
- ❌ Don't use `&&` operator for conditional rendering (use `<Conditional>`)

---

## References

- **Architecture**: `docs/2025_10_14/analysis/two-phase-streaming-deep-dive.md`
- **React Conventions**: `.claude/conventions/React-Coding-Conventions.md`
- **React Audit**: `docs/2025_10_12/feature-planner-react-audit.md`
- **Project Rules**: `CLAUDE.md`
