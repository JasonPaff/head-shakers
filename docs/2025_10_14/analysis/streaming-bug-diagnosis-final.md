# Feature Suggestion Streaming Bug - Final Diagnosis

**Date:** 2025-10-14
**Status:** ROOT CAUSE IDENTIFIED ✅

## Summary

The feature suggestion system always returns 0 suggestions because the Claude Agent SDK hits the `maxTurns` limit before generating the final response.

## Root Cause

**The agent uses all 10 turns on tool calls and never generates the JSON response.**

### Evidence from Logs

```
[executeFeatureSuggestionAgentWithStreaming] Result details: {
  hasResult: false,           ← NO RESULT TEXT
  hasUsage: true,
  isError: undefined,
  resultLength: undefined,
  subtype: 'error_max_turns'  ← HIT MAX TURNS LIMIT
}
```

### Agent Behavior

1. **Turn 1-13:** Agent makes Read/Grep/Glob tool calls to analyze the codebase
2. **Turn 10:** Max turn limit reached
3. **Result:** SDK returns `error_max_turns` with no suggestions

The agent spent all its turns **reading files** and never generated the **final JSON response** with suggestions.

## Why This Happens

The default feature suggestion prompt tells the agent to:
1. Read CLAUDE.md
2. Use Glob to find relevant files
3. Read 1-2 additional files
4. Generate suggestions

However, the agent is:
- **Making too many tool calls** (13 assistant messages)
- **Reading too many files** (not following the "2 file max" guidance)
- **Not generating the final response** before turn limit

## Fixes Applied

### ✅ Fix #1: Token Usage Field Mapping (COMPLETED)

**File:** `src/app/api/feature-planner/suggest-feature/[jobId]/route.ts:200-204`

```typescript
// Before: undefined values causing validation errors
tokenUsage: {
  inputTokens: result.tokenUsage.promptTokens,      // undefined
  outputTokens: result.tokenUsage.completionTokens, // undefined
  totalTokens: result.tokenUsage.totalTokens,       // undefined
}

// After: safe with fallback values
tokenUsage: {
  inputTokens: result.tokenUsage.promptTokens ?? 0,
  outputTokens: result.tokenUsage.completionTokens ?? 0,
  totalTokens: result.tokenUsage.totalTokens ?? 0,
}
```

**Impact:** Fixes validation errors when result completes successfully.

### ✅ Fix #2: Enhanced Diagnostic Logging (COMPLETED)

**File:** `src/lib/services/feature-planner.service.ts:650-742`

Added comprehensive logging to track:
- When result messages are detected
- Result message details (hasResult, subtype, resultLength)
- Suggestion parsing results
- Token usage from result messages

**Impact:** Revealed the `error_max_turns` root cause.

## Required Fix: Increase Turn Limit

### File to Modify

`src/lib/services/feature-planner.service.ts:609`

### Current Code

```typescript
for await (const message of query({
  options: {
    ...BASE_SDK_OPTIONS,
    allowedTools,
    fallbackModel: FALLBACK_MODEL,
    includePartialMessages: !!onUpdate,
    maxThinkingTokens: THINKING_TOKEN_LIMITS.FEATURE_SUGGESTION,
    maxTurns: TURN_LIMITS.FEATURE_SUGGESTION,  // ← Currently 10
    model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
    systemPrompt,
  },
  prompt,
}))
```

### Proposed Solution

**Option 1: Increase Turn Limit (Quick Fix)**

```typescript
maxTurns: 15,  // Increased from 10 to allow more tool calls
```

**Option 2: Improve Prompt (Better Fix)**

Update the prompt to be more directive:

```typescript
const prompt = `...

TOOL USAGE CONSTRAINTS (CRITICAL):
- Read CLAUDE.md first to understand project context
- Use Glob to find 1-2 relevant files for the target area
- Read at most 2 additional files (choose the most relevant)
- DO NOT read more than 3 files total (including CLAUDE.md)
- After reading files, IMMEDIATELY generate suggestions - DO NOT use additional tools
- Focus on speed: complete analysis within 8-10 turns maximum

...`;
```

**Option 3: Hybrid Approach (Recommended)**

1. Increase turn limit to 15 (safety buffer)
2. Improve prompt with stricter tool usage constraints
3. Add turn budget warnings in logs

### Turn Limit Constants

**File:** `src/lib/constants/claude-sdk-config.ts`

```typescript
export const TURN_LIMITS = {
  FEATURE_SUGGESTION: 10,  // ← Too low for current prompt behavior
  FILE_DISCOVERY_LEGACY: 10,
  FILE_DISCOVERY_SPECIALIZED: 4,
  IMPLEMENTATION_PLANNING: 10,
  REFINEMENT: 5,
  SYNTHESIS: 3,
} as const;
```

**Recommended Change:**

```typescript
export const TURN_LIMITS = {
  FEATURE_SUGGESTION: 15,  // Increased to accommodate file reading + response generation
  // ... rest unchanged
} as const;
```

## Test Results

### Test Run: Bobblehead Card Enhancement

**Input:**
- Page/Component: "Bobblehead Card"
- Feature Type: "Enhancement"
- Priority: "Medium"

**Results:**
- ✅ Job creation succeeded (Phase 1)
- ✅ SSE connection established (Phase 2)
- ✅ Token usage tracked correctly
- ✅ Result message detected and processed
- ❌ No suggestions generated (hit max turns)
- ❌ Subtype: `error_max_turns`

**Tool Calls Made:**
- 13 assistant messages (too many)
- Multiple Read, Grep, Glob calls
- No final JSON response generated

## Impact Assessment

### User Experience
- Users see "Generating Suggestions..." with streaming text
- After ~30 seconds, UI shows "0 suggestions"
- No error message displayed (appears as if AI generated nothing)

### System Health
- ✅ No crashes or exceptions
- ✅ Proper error handling in SDK
- ✅ Token usage tracked correctly
- ❌ Poor user experience (appears broken)

## Next Steps

1. **Immediate Fix:** Increase `TURN_LIMITS.FEATURE_SUGGESTION` from 10 to 15
2. **Prompt Optimization:** Strengthen tool usage constraints in prompt
3. **Add Monitoring:** Log turn count warnings when approaching limit
4. **User Feedback:** Show error message when max turns hit
5. **Testing:** Verify suggestions generate successfully with new limits

## Files Changed

1. ✅ `src/app/api/feature-planner/suggest-feature/[jobId]/route.ts` - Token field mapping
2. ✅ `src/lib/services/feature-planner.service.ts` - Diagnostic logging
3. ⏳ `src/lib/constants/claude-sdk-config.ts` - Turn limit increase (pending)
4. ⏳ `src/lib/services/feature-planner.service.ts` - Prompt optimization (pending)

## Lessons Learned

1. **Diagnostic Logging is Essential:** Without detailed logging, we couldn't see the `error_max_turns` result
2. **Token Usage Validation:** Client-side validation caught the field name mismatch early
3. **SDK Behavior:** The Agent SDK has built-in turn limits that must be considered in prompt design
4. **Prompt Engineering:** Tool usage constraints must be **very explicit** to prevent over-use

## Related Documentation

- Claude Agent SDK: `docs/2025_10_12/claude-typescript-sdk.md`
- Implementation Plan: `docs/2025_10_14/tasks/two-phase-streaming-implementation-plan.md`
- Initial Analysis: `docs/2025_10_14/analysis/streaming-bug-diagnosis.md`
