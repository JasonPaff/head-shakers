# Feature Suggestion Streaming Bug Diagnosis

**Date:** 2025-10-14
**Issue:** Feature suggestions return 0 results and token usage validation errors

## Symptoms

1. ✅ Job creation succeeds (Phase 1)
2. ✅ SSE connection establishes (Phase 2)
3. ✅ Some streaming text appears
4. ❌ **Always returns 0 suggestions**
5. ❌ **Client validation error for missing tokenUsage.inputTokens/outputTokens**

## Server Logs Analysis

```
[executeFeatureSuggestionAgentWithStreaming] Starting query with: {...}
[executeFeatureSuggestionAgentWithStreaming] Message #1-119: stream_event, assistant, user messages
[executeFeatureSuggestionAgentWithStreaming] Message #120: { hasMessage: true, type: 'result' }
[executeFeatureSuggestionAgentWithStreaming] Query loop completed: {
  assistantMessages: 12,
  suggestionsFound: 0,  ← ❌ ZERO SUGGESTIONS
  totalMessages: 120
}
```

### Key Observations

1. **All assistant messages show `hasTextContent: false`**
   - Only `tool_use` and `thinking` blocks are present
   - No `text` blocks with JSON suggestions

2. **Result message (#120) exists but is NOT processed**
   - Log shows `type: 'result'`
   - BUT no "Result message received" log (line 693)
   - This means the `if (message.type === 'result')` condition is NOT executing

3. **Token usage accumulates correctly during loop**
   - Multiple logs show: `cacheCreationTokens: 18913, completionTokens: 7, promptTokens: 10`
   - But final result has undefined values

## Root Causes Identified

### Issue #1: Result Message Not Being Processed

**Location:** `src/lib/services/feature-planner.service.ts:692-728`

The `if (message.type === 'result')` block is not executing even though Message #120 has `type: 'result'`.

**Hypothesis:** TypeScript type narrowing or SDK type mismatch preventing condition from matching.

**Evidence:**
- Line 645 logs show `type: 'result'`
- Line 693 log "Result message received" NEVER appears in logs
- This means suggestions are never extracted from final result

### Issue #2: Token Usage Undefined Error

**Location:** `src/app/api/feature-planner/suggest-feature/[jobId]/route.ts:200-204`

```typescript
// ❌ BUG: These fields don't exist on result.tokenUsage
tokenUsage: {
  inputTokens: result.tokenUsage.promptTokens,      // undefined
  outputTokens: result.tokenUsage.completionTokens, // undefined
  totalTokens: result.tokenUsage.totalTokens,       // undefined
},
```

**Expected Schema:**
```typescript
// src/lib/validations/feature-planner.validation.ts:560-567
export const sseCompleteEventSchema = z.object({
  tokenUsage: z.object({
    inputTokens: z.number(),   // ← Client expects these field names
    outputTokens: z.number(),
    totalTokens: z.number(),
  }),
});
```

**Actual Service Return Type:**
```typescript
// src/lib/services/feature-planner.service.ts:116-127
tokenUsage: {
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  completionTokens: number;   // ← Service returns these field names
  promptTokens: number;
  totalTokens: number;
}
```

**Field Name Mismatch:**
- Service returns: `promptTokens`, `completionTokens`
- Client expects: `inputTokens`, `outputTokens`

### Issue #3: Suggestions Not Extracted

**Location:** `src/lib/services/feature-planner.service.ts:705-716`

Suggestions should be extracted from `resultMessage.result` but this code never runs because Issue #1 prevents the result message from being processed.

## Impact

- **User Experience:** Users see streaming text but get 0 suggestions
- **Token Usage:** Proper token tracking is lost
- **Data Integrity:** Suggestions are generated but not extracted

## Next Steps

1. ✅ **Fix Token Usage Field Mapping** - Map `promptTokens` → `inputTokens`, `completionTokens` → `outputTokens`
2. 🔍 **Debug Result Message Handler** - Add extensive logging to understand why `type === 'result'` doesn't match
3. 🔍 **Verify SDK Message Types** - Check if SDK returns different type string than expected
4. ✅ **Add Optional Chaining** - Protect against undefined with `result.tokenUsage?.promptTokens ?? 0`

## Files Affected

1. `src/app/api/feature-planner/suggest-feature/[jobId]/route.ts` - Fix token field mapping (lines 200-204)
2. `src/lib/services/feature-planner.service.ts` - Debug result message handler (lines 692-728)
3. `src/lib/validations/feature-planner.validation.ts` - No changes needed (schema is correct)

## Testing Required

1. Generate feature suggestion with streaming enabled
2. Verify suggestions appear in results
3. Verify token usage values are present and valid
4. Check server logs for "Result message received"
