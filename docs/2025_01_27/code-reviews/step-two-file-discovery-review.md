# Step 2: File Discovery - Code Review

**Review Date**: 2025-01-27
**Reviewer**: Claude Code (Senior Code Reviewer)
**Target**: Feature Planner Step 2 Implementation
**Specification**: `docs/2025_01_27/specs/FEATURE-PLANNER-SPEC.md`

---

## Executive Summary

The File Discovery step (Step 2) has a **solid backend implementation** with AI agent integration, database persistence, and proper error handling. However, the **frontend integration is incomplete**, with critical handlers missing and several MVP features not implemented. The core discovery mechanism works, but user interaction capabilities are limited.

**Overall Status**: 60% Complete (Backend Strong, Frontend Needs Work)

---

## 1. Overview

### Architecture Flow

```
User clicks "Start File Discovery"
  → handleFileDiscovery() in page.tsx
  → POST /api/feature-planner/discover
  → FeaturePlannerFacade.runFileDiscoveryAsync()
  → FeaturePlannerService.executeFileDiscoveryAgent()
  → Claude Agent SDK (file discovery agent)
  → Database persistence (file_discovery_sessions, discovered_files)
  → UI update with FileDiscoveryResults component
```

### Files Reviewed

1. **Frontend Components**:
   - `src/app/(app)/feature-planner/components/steps/step-two.tsx` - Main Step 2 component
   - `src/app/(app)/feature-planner/components/file-discovery-results.tsx` - Results display
   - `src/app/(app)/feature-planner/components/file-autocomplete.tsx` - Manual file addition
   - `src/app/(app)/feature-planner/components/steps/step-orchestrator.tsx` - Step integration
   - `src/app/(app)/feature-planner/page.tsx` - Main page with handlers

2. **Backend Implementation**:
   - `src/app/api/feature-planner/discover/route.ts` - API endpoint
   - `src/lib/facades/feature-planner/feature-planner.facade.ts` - Business logic
   - `src/lib/services/feature-planner.service.ts` - Agent execution
   - `src/app/api/feature-planner/files/search/route.ts` - File search API
   - `src/lib/db/schema/feature-planner.schema.ts` - Database schema

---

## 2. Completed Features ✅

### Backend Implementation (Excellent)

#### API Endpoint (`/api/feature-planner/discover`)

```typescript
// C:\Users\JasonPaff\dev\head-shakers\src\app\api\feature-planner\discover\route.ts
```

- ✅ **Authentication**: Proper user ID validation
- ✅ **Input Validation**: Plan ID and custom model support
- ✅ **Facade Integration**: Clean separation of concerns
- ✅ **Error Handling**: Proper error responses with service error context
- ✅ **Response Format**: Consistent API response structure

**Quality**: 9/10 - Well-structured, follows project patterns

#### Facade Layer (`FeaturePlannerFacade.runFileDiscoveryAsync`)

```typescript
// Lines 212-305 in feature-planner.facade.ts
```

- ✅ **Plan Status Updates**: Sets `currentStep: 2`, `status: 'discovering'`
- ✅ **Session Creation**: Creates `file_discovery_sessions` record with proper tracking
- ✅ **Agent Execution**: Calls service layer with retry logic
- ✅ **Result Persistence**: Updates session with token usage, execution time, file counts
- ✅ **File Records**: Batch creates `discovered_files` records with full metadata
- ✅ **Error Context**: Comprehensive error tracking with operation context

**Quality**: 10/10 - Exemplary implementation with all quality controls

#### Service Layer (`FeaturePlannerService.executeFileDiscoveryAgent`)

```typescript
// Lines 130-209 in feature-planner.service.ts
```

- ✅ **Circuit Breaker**: Proper resilience pattern implementation
- ✅ **Retry Logic**: Automatic retry with 2 max attempts
- ✅ **Agent Integration**: Claude SDK integration with allowed tools (Read, Grep, Glob)
- ✅ **Response Parsing**: Handles both JSON and markdown formats
- ✅ **Token Tracking**: Accurate usage metrics for cost analysis
- ✅ **Validation**: Zod schema validation for agent responses

**Highlights**:

- Smart priority normalization (`normalizePriority`)
- Relevance score normalization (0-100 range)
- Multiple response format support
- Fallback path extraction for unstructured responses

**Quality**: 9/10 - Robust and well-tested patterns

#### Database Schema

```typescript
// file_discovery_sessions and discovered_files tables
```

- ✅ **Session Tracking**: Complete execution metadata
- ✅ **Priority Counts**: Pre-computed counts (critical/high/medium/low)
- ✅ **Architecture Insights**: Field for AI-generated insights
- ✅ **File Details**: Comprehensive metadata (role, reasoning, integration point)
- ✅ **Manual Addition Support**: `isManuallyAdded` flag
- ✅ **Selection State**: `isSelected` flag for user choices

**Quality**: 10/10 - Well-designed schema with proper constraints

### Frontend Display (Good)

#### File Discovery Results Component

```typescript
// C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\feature-planner\components\file-discovery-results.tsx
```

- ✅ **Priority Grouping**: Files organized by critical/high/medium/low
- ✅ **Summary Statistics**: Visual count cards with color coding
- ✅ **Architecture Insights**: Display of AI-generated insights
- ✅ **File Details**: Shows path, role, description, reasoning, integration point
- ✅ **Relevance Score**: Badge display for scores
- ✅ **File Existence**: Visual indicator with CheckCircle2 icon
- ✅ **Selection UI**: Checkbox support for each file
- ✅ **Selection Summary**: Shows count of selected files

**Quality**: 8/10 - Good UI/UX, proper accessibility

#### Step Two Component

```typescript
// C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\feature-planner\components\steps\step-two.tsx
```

- ✅ **Empty State**: Clear "Run File Discovery" prompt when no session
- ✅ **Execution Metrics**: Token usage and timing display
- ✅ **Component Integration**: Clean integration of results and autocomplete
- ✅ **Test IDs**: Proper test ID generation

**Quality**: 7/10 - Good structure, but missing interactive handlers

#### File Autocomplete Component

```typescript
// C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\feature-planner\components\file-autocomplete.tsx
```

- ✅ **File Search**: Integration with `/api/feature-planner/files/search`
- ✅ **Debounced Search**: 300ms debounce for performance
- ✅ **Autocomplete UI**: Dropdown with suggestions
- ✅ **Priority Selection**: Dropdown for critical/high/medium/low
- ✅ **Description Input**: Textarea for reasoning
- ✅ **Validation**: Checks for file selection and description
- ✅ **User Feedback**: Toast notifications for success/error

**Quality**: 9/10 - Excellent UX with proper debouncing

#### File Search API

```typescript
// C:\Users\JasonPaff\dev\head-shakers\src\app\api\feature-planner\files\search\route.ts
```

- ✅ **Glob Integration**: Uses `glob` package for file discovery
- ✅ **Directory Exclusions**: Ignores `node_modules`, `.next`, `.git`, etc.
- ✅ **Query Validation**: Zod schema validation
- ✅ **Result Limiting**: Caps at 20 results for performance
- ✅ **Case-Insensitive Search**: Proper search behavior

**Quality**: 8/10 - Simple and effective

---

## 3. Critical Issues ❌

### High Priority - Blocking MVP

#### 1. Missing Handler Implementation (Lines 86-88 in step-orchestrator.tsx)

```typescript
<StepTwo
  discoverySession={discoverySession}
  onFileAdded={() => {}}  // ❌ STUB - Not implemented
  onFileDiscovery={onFileDiscovery}
  onFileSelection={() => {}}  // ❌ STUB - Not implemented
  selectedFiles={stepData.step2?.selectedFiles}
/>
```

**Impact**: Users cannot:

- Add files manually (button is visible but does nothing)
- Select/deselect discovered files (checkboxes work visually but don't persist)

**Fix Required**: Implement proper handlers in `page.tsx`:

```typescript
const handleFileAdded = useCallback(
  (file: { description: string; filePath: string; priority: 'critical' | 'high' | 'low' | 'medium' }) => {
    // Call API to add file to database
    // Update local state with new file
    // Persist to featurePlans.selectedFiles
  },
  [state.planId, state.discoverySession],
);

const handleFileSelection = useCallback(
  (files: string[]) => {
    updateState({
      stepData: {
        ...state.stepData,
        step2: {
          ...state.stepData.step2,
          selectedFiles: files,
        },
      },
    });
    // Optionally: Persist to database immediately or on step transition
  },
  [state.stepData, updateState],
);
```

**Severity**: CRITICAL - Core feature non-functional

---

#### 2. File Selection Not Persisted to Database

```typescript
// handleFileDiscovery() only reads from API, never writes selections back
// featurePlans.selectedFiles is never updated
```

**Impact**:

- User selections are lost on page refresh
- Cannot proceed to Step 3 with selected files
- No audit trail of user choices

**Fix Required**:

- Add API endpoint: `PUT /api/feature-planner/:planId/selected-files`
- Update `featurePlans.selectedFiles` field
- Call on step transition or debounced during selection

**Severity**: CRITICAL - Data loss issue

---

#### 3. Manual File Addition Not Connected to Database

```typescript
// FileAutocomplete calls onFileAdded with file data
// But the handler is stubbed out, so nothing happens
```

**Impact**:

- "Add File to Discovery" button appears to work but does nothing
- No new `discovered_files` records created
- Files don't appear in results list

**Fix Required**:

- Add API endpoint: `POST /api/feature-planner/:sessionId/files`
- Create `discovered_files` record with `isManuallyAdded: true`
- Update UI state to show new file immediately
- Increment session file counts

**Severity**: CRITICAL - Advertised feature doesn't work

---

### Medium Priority - Important for MVP

#### 4. No File Content Preview

```typescript
// Spec says: "File content preview on hover/click"
// Currently: No preview implementation
```

**Impact**: Users cannot verify file relevance without leaving the app

**Fix Required**:

- Add modal or popover component
- API endpoint: `GET /api/feature-planner/files/preview?path=...`
- Use `Read` tool to fetch file content server-side
- Syntax highlighting with `react-syntax-highlighter`

**Severity**: HIGH - Important UX feature missing

---

#### 5. No Streaming Progress Indicator

```typescript
// Spec says: "Streaming progress indicator showing AI analysis"
// Currently: Simple toast notification, no streaming
```

**Current Behavior**:

```typescript
toast.info('Starting file discovery...');
// Long wait...
toast.success(data.message);
```

**Impact**:

- Poor UX for long-running operations
- No feedback during 30-60 second discovery process
- Users may think app is frozen

**Fix Required**:

- Implement streaming with Server-Sent Events or WebSocket
- Show file count as it increases
- Display current file being analyzed
- Show estimated time remaining

**Severity**: MEDIUM - UX issue but not blocking

---

#### 6. No Customization Options

```typescript
// Spec says: "Discovery scope settings (directory filters)"
// Spec says: "Minimum relevance threshold"
// Spec says: "File type filters (.tsx, .ts, .md, etc.)"
// Currently: None implemented
```

**Impact**: Users have no control over discovery scope or quality

**Fix Required**:

- Add settings panel similar to `RefinementSettings`
- Pass settings to agent prompt
- Filter results client-side by relevance threshold
- Update agent prompt with directory/file type filters

**Severity**: MEDIUM - MVP feature missing

---

### Low Priority - Polish Items

#### 7. No "Re-run Discovery" Button

```typescript
// FileDiscoveryResults has onRunDiscovery prop
// But it's passed empty function: onRunDiscovery={() => {}}
```

**Impact**: Users must refresh page to re-run discovery

**Fix Required**: Connect to `handleFileDiscovery` from page

**Severity**: LOW - Workaround exists

---

#### 8. File Selection Uses Array Indices as Keys

```typescript
// file-discovery-results.tsx:117
const fileKey = `${file.filePath}-${index}`;
```

**Issue**: If files are reordered, selections break

**Fix Required**: Use stable IDs from database (`discovered_files.id`)

**Severity**: LOW - Edge case bug

---

#### 9. No Loading State for File Discovery Button

```typescript
// StepTwo component doesn't show loading state
// Button is clickable during execution
```

**Impact**: Users can trigger multiple concurrent discoveries

**Fix Required**:

- Add `isDiscovering` state
- Disable button and show spinner during execution

**Severity**: LOW - Rate limiting prevents real issues

---

## 4. Bugs Found 🐛

### Bug #1: Architecture Insights Not Populated

**Location**: `feature-planner.facade.ts:257`

```typescript
const updatedSession = await FeaturePlannerQuery.updateFileDiscoverySessionAsync(
  session.id,
  {
    // ... other fields
    // ❌ architectureInsights is never set
  },
  context,
);
```

**Root Cause**: Agent doesn't return architecture insights in current prompt

**Impact**: UI component shows empty insights section

**Fix**: Update agent prompt to request architecture analysis

---

### Bug #2: Incorrect File Exists Default

**Location**: `feature-planner.facade.ts:281`

```typescript
fileExists: file.fileExists ?? true,  // ❌ Should verify actual file existence
```

**Issue**: Assumes all files exist without checking filesystem

**Impact**: UI shows green checkmark for non-existent files

**Fix**:

```typescript
import { existsSync } from 'fs';
import { join } from 'path';

fileExists: existsSync(join(process.cwd(), file.filePath)),
```

---

### Bug #3: selectedFiles Type Mismatch

**Location**: `step-orchestrator.tsx:89` and state management

```typescript
// StepData.step2.selectedFiles is string[]
// But file-discovery-results uses it as file IDs
// But step-two.tsx passes it as-is
```

**Issue**: Inconsistent contract - array of file IDs vs array of file paths

**Impact**: Selection state may not persist correctly

**Fix**: Standardize on file IDs (UUIDs from `discovered_files.id`)

---

### Bug #4: No Error State in StepTwo

```typescript
// If discoverySession.status === 'failed', still shows results
// Should show error message instead
```

**Fix**: Add error state handling:

```typescript
if (discoverySession?.status === 'failed') {
  return <ErrorDisplay message={discoverySession.errorMessage} />;
}
```

---

## 5. Security Concerns 🔒

### Medium Risk

#### 1. File Path Injection in Preview

**If file preview is implemented**, must validate paths:

```typescript
// ❌ Dangerous
const filePath = searchParams.get('path');
const content = readFileSync(filePath);

// ✅ Safe
const filePath = searchParams.get('path');
if (!filePath.startsWith('src/') && !filePath.startsWith('docs/')) {
  return new Response('Forbidden', { status: 403 });
}
```

### Low Risk

#### 2. File Search Glob Pattern

**Current**: Accepts any query string
**Risk**: Expensive glob patterns could cause DoS

**Mitigation**: Already limited to 20 results, but could add pattern complexity check

---

## 6. Performance Analysis 📊

### Good Performance

- ✅ **Debounced Search**: 300ms debounce prevents excessive API calls
- ✅ **Result Limiting**: File search capped at 20 results
- ✅ **Circuit Breaker**: Prevents cascade failures
- ✅ **Retry Logic**: Automatic recovery without user intervention

### Potential Issues

- ⚠️ **Large Discovery Sessions**: No pagination for 100+ files
- ⚠️ **Glob Search**: Full filesystem scan on every search (could cache)
- ⚠️ **No Request Cancellation**: Can't abort in-flight discovery

---

## 7. Type Safety Assessment 🔧

### Excellent Type Safety

```typescript
// All major types are properly defined
interface StepTwoProps extends ComponentProps<'div'>, ComponentTestIdProps {
  discoverySession?: FileDiscoverySession | null;
  onFileAdded: (file: {
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'low' | 'medium';
  }) => void;
  // ...
}
```

- ✅ Zod schemas for validation
- ✅ Drizzle schema types
- ✅ Proper discriminated unions for status
- ✅ No `any` types found

---

## 8. Code Quality Assessment 💎

### Positive Highlights

1. **Excellent Separation of Concerns**:
   - Clear boundaries: API → Facade → Service → Agent
   - UI components are pure and testable

2. **Consistent Patterns**:
   - Follows project's established patterns
   - Error handling matches other facades
   - Query/mutation split is clean

3. **Good Documentation**:
   - JSDoc comments on service methods
   - Clear naming conventions
   - Schema documentation

4. **Proper Error Handling**:
   - Service error context propagation
   - Circuit breaker for resilience
   - User-friendly error messages

### Areas for Improvement

1. **Handler Stubs**: Empty function implementations should throw or warn
2. **Magic Numbers**: `maxTurns: 1` should be a constant
3. **Hardcoded Values**: Model name repeated across files
4. **Missing Tests**: No test coverage visible for Step 2 components

---

## 9. Accessibility Review ♿

### Good Practices

- ✅ Semantic HTML with proper button elements
- ✅ Aria-hidden on decorative icons
- ✅ Proper label associations in FileAutocomplete
- ✅ Keyboard navigation with checkboxes

### Missing

- ❌ No aria-live for discovery progress
- ❌ No loading announcements for screen readers
- ❌ Checkbox groups need `role="group"` and `aria-labelledby`

---

## 10. Implementation Priorities for MVP Completion 📋

### Phase 1: Critical Fixes (1-2 days)

1. **Implement `handleFileAdded`** - Connect manual file addition to API
   - Create `POST /api/feature-planner/:sessionId/files` endpoint
   - Add to database with `isManuallyAdded: true`
   - Update UI state immediately

2. **Implement `handleFileSelection`** - Persist selections to database
   - Create `PUT /api/feature-planner/:planId/selected-files` endpoint
   - Update `featurePlans.selectedFiles` on change
   - Debounce updates to avoid excessive writes

3. **Fix File Existence Check** - Verify files actually exist
   - Add `existsSync` check in facade
   - Update `fileExists` field accurately

### Phase 2: Important Features (2-3 days)

4. **Add File Content Preview** - Allow users to verify file relevance
   - Create modal component with syntax highlighting
   - Add `GET /api/feature-planner/files/preview` endpoint
   - Use `Read` tool server-side for security

5. **Implement Discovery Customization** - Give users control
   - Add settings panel for scope/filters/thresholds
   - Pass settings to agent prompt
   - Filter results client-side by relevance

6. **Add Streaming Progress** - Improve UX for long operations
   - Implement SSE or polling mechanism
   - Show incremental file counts
   - Display current analysis status

### Phase 3: Polish (1-2 days)

7. **Connect Re-run Discovery** - Allow retrying without refresh
8. **Add Loading States** - Disable buttons during operations
9. **Fix Architecture Insights** - Update agent prompt
10. **Add Error States** - Handle failed discovery sessions
11. **Improve Accessibility** - Add aria-live regions

---

## 11. Recommended Architecture Changes 🏗️

### 1. Separate File Selection API

```typescript
// Current: selectedFiles stored in featurePlans.selectedFiles (JSONB)
// Better: Update discovered_files.isSelected (boolean column)

// Benefits:
// - Simpler queries
// - Better indexing
// - Easier to track selection history
```

### 2. Add Discovery Settings Table

```typescript
// Instead of passing settings inline, persist them
export const discoverySettings = pgTable('discovery_settings', {
  id: uuid('id').primaryKey(),
  sessionId: uuid('session_id').references(() => fileDiscoverySessions.id),
  directoryFilters: jsonb('directory_filters').$type<string[]>(),
  fileTypeFilters: jsonb('file_type_filters').$type<string[]>(),
  minRelevanceThreshold: integer('min_relevance_threshold'),
  // ...
});
```

### 3. WebSocket for Streaming

```typescript
// Instead of SSE, use WebSocket for bidirectional communication
// Allows user to cancel in-progress discovery
```

---

## 12. Testing Recommendations 🧪

### Unit Tests Needed

```typescript
// feature-planner.service.test.ts
describe('parseFileDiscoveryResponse', () => {
  it('should parse JSON format correctly');
  it('should parse markdown format correctly');
  it('should normalize priorities to valid enums');
  it('should handle missing fields gracefully');
});

// file-discovery-results.test.tsx
describe('FileDiscoveryResults', () => {
  it('should group files by priority');
  it('should handle file selection');
  it('should show correct counts');
});
```

### Integration Tests Needed

```typescript
// feature-planner-step-two.integration.test.ts
describe('Step 2 Flow', () => {
  it('should discover files and persist to database');
  it('should allow manual file addition');
  it('should persist file selections');
  it('should handle discovery failures gracefully');
});
```

---

## 13. Documentation Gaps 📚

1. **No User Guide**: How to interpret relevance scores, priorities
2. **No Agent Prompt Documentation**: What instructions the AI receives
3. **No API Documentation**: Endpoint contracts not documented
4. **No Error Recovery Guide**: What to do when discovery fails

---

## 14. Comparison with Specification

### Specification Requirements vs. Implementation

| Requirement                           | Status         | Notes                               |
| ------------------------------------- | -------------- | ----------------------------------- |
| Streaming progress indicator          | ❌ Missing     | Toast notifications only            |
| Real-time file discovery results      | ✅ Implemented | Works well                          |
| Uses existing file discovery agent    | ✅ Implemented | Properly integrated                 |
| File categorization by priority       | ✅ Implemented | 4 levels (critical/high/medium/low) |
| Interactive file list with checkboxes | ⚠️ Partial     | UI works, persistence missing       |
| "Add File" button                     | ⚠️ Partial     | UI exists, handler stubbed          |
| File content preview                  | ❌ Missing     | Critical UX feature                 |
| Discovery scope settings              | ❌ Missing     | No customization                    |
| Relevance threshold                   | ❌ Missing     | No filtering                        |
| File type filters                     | ❌ Missing     | No filtering                        |

**Compliance**: 3/10 fully complete, 2/10 partially complete, 5/10 missing

---

## 15. Recommendations Summary

### Must-Have for MVP (Blocking)

1. ✅ Implement `handleFileAdded` and connect to API
2. ✅ Implement `handleFileSelection` and persist to database
3. ✅ Fix file existence verification
4. ✅ Add file content preview feature

### Should-Have for MVP (Important)

5. ✅ Add discovery customization options
6. ✅ Implement streaming progress indicator
7. ✅ Connect re-run discovery button
8. ✅ Add loading and error states

### Nice-to-Have (Post-MVP)

9. ✅ Improve accessibility (aria-live regions)
10. ✅ Add unit and integration tests
11. ✅ Document API endpoints
12. ✅ Add user guide for interpreting results

---

## 16. Conclusion

### Strengths 💪

- **Excellent backend architecture** - Clean separation, proper error handling
- **Solid database design** - Well-thought-out schema with constraints
- **Good UI components** - Professional appearance, clear information hierarchy
- **Proper type safety** - No type holes or `any` usage

### Weaknesses 🤔

- **Incomplete frontend integration** - Critical handlers stubbed out
- **Missing spec features** - Streaming, customization, preview not implemented
- **Data persistence gaps** - User selections not saved to database
- **Limited interactivity** - Most buttons/checkboxes don't work

### Overall Assessment

**Backend: 9/10** - Production-ready
**Frontend: 4/10** - Needs significant work
**MVP Readiness: 60%** - Core functionality works, but user experience is incomplete

---

## Next Steps

**Priority 1 (This Sprint)**:

- Implement missing handlers (`handleFileAdded`, `handleFileSelection`)
- Add file persistence endpoints
- Fix file existence checking

**Priority 2 (Next Sprint)**:

- Add file content preview
- Implement discovery customization
- Add streaming progress

**Priority 3 (Post-MVP)**:

- Improve accessibility
- Add comprehensive testing
- Write documentation

---

**Reviewed By**: Claude Code (Senior Code Reviewer)
**Review Completed**: 2025-01-27
**Document Version**: 1.0
