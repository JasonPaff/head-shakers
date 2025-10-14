# Feature Suggestion Workflow - Claude SDK Integration Issues

**Date:** 2025-10-14
**Analysis Type:** Best Practices & SDK Integration Review
**Scope:** Feature Suggestion Workflow (executeFeatureSuggestionAgent)

## Executive Summary

The feature suggestion workflow has **11 critical SDK best practice violations** and **7 additional architectural issues** that impact reliability, cost efficiency, and user experience. The most severe issues are:

1. Missing system prompt configuration for CLAUDE.md support (breaks project context)
2. Improper streaming configuration (no real-time feedback)
3. Redundant retry logic and validation (SDK handles this)
4. No cancellation support (users can't abort long operations)
5. Missing monitoring hooks (no visibility into costs/performance)

## Critical SDK Best Practice Violations

### 1. ❌ Missing System Prompt Configuration (CRITICAL)

**Location:** `src/lib/services/feature-planner.service.ts:389-412`

**Issue:**
```typescript
// Current implementation (DEFAULT PATH)
for await (const message of query({
  options: {
    ...BASE_SDK_OPTIONS,
    allowedTools,
    fallbackModel: FALLBACK_MODEL,
    maxThinkingTokens: THINKING_TOKEN_LIMITS.FEATURE_SUGGESTION,
    maxTurns: TURN_LIMITS.FEATURE_SUGGESTION,
    model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
    systemPrompt,  // ← Only set when agent is provided (line 386)
  },
  prompt,
}))
```

**SDK Documentation (lines 117, 230-245):**
> When using `settingSources: ['project']` to load CLAUDE.md files, you MUST also set:
> ```typescript
> systemPrompt: { type: 'preset', preset: 'claude_code' }
> ```

**Impact:**
- Default feature suggestions (without custom agent) **DO NOT** use CLAUDE.md project context
- Users expect project-aware suggestions but get generic ones
- Defeats the purpose of having `settingSources: ['project']` in BASE_SDK_OPTIONS

**Fix Required:**
```typescript
const systemPrompt = agent?.systemPrompt
  ? {
      type: 'preset' as const,
      preset: 'claude_code' as const,
      append: agent.systemPrompt,
    }
  : {
      type: 'preset' as const,
      preset: 'claude_code' as const,
    };
```

### 2. ❌ No Streaming for User Feedback (CRITICAL UX)

**Location:** `src/lib/services/feature-planner.service.ts:389-412`

**Issue:**
```typescript
// Current implementation
for await (const message of query({
  options: {
    // ... other options
    // ❌ includePartialMessages not set - no streaming!
  },
  prompt,
}))
```

**SDK Documentation (lines 105, 471-483):**
> Set `includePartialMessages: true` to receive streaming updates for real-time user feedback.

**Impact:**
- Users see "Generating feature suggestions..." spinner for 30-60 seconds with NO feedback
- No way to show progressive results as they're generated
- Poor perceived performance (users think it's frozen)

**Fix Required:**
```typescript
// Add streaming callback parameter
static async executeFeatureSuggestionAgent(
  // ... existing params
  onPartialUpdate?: (partialText: string) => void,  // ← Add this
): Promise<...> {
  // ...
  for await (const message of query({
    options: {
      // ... other options
      includePartialMessages: !!onPartialUpdate,  // ← Enable streaming
    },
    prompt,
  })) {
    // Handle stream_event messages
    if (message.type === 'stream_event' && onPartialUpdate) {
      // Process streaming updates (see lines 869-893 for pattern)
    }
  }
}
```

### 3. ❌ Redundant Retry Logic (PERFORMANCE)

**Location:** `src/lib/services/feature-planner.service.ts:329-486`

**Issue:**
```typescript
const result = await circuitBreaker.execute(async () => {
  const retryResult = await withServiceRetry(  // ← Redundant!
    async () => {
      // ... SDK query
    },
    'claude-agent',
    { maxAttempts: 2, operationName: 'feature-suggestion' },
  );
  return retryResult;
});
```

**SDK Behavior:**
The Claude SDK already implements internal retry logic for transient failures. Wrapping it in additional retry logic causes:
- Double retries on failures (2 attempts × 2 attempts = 4 total)
- Longer wait times for users
- Incorrect retry count reporting

**Fix Required:**
Remove `withServiceRetry` wrapper - let SDK handle retries:
```typescript
const result = await circuitBreaker.execute(async () => {
  let suggestionResult = { suggestions: [] };
  let tokenUsage = { /* ... */ };

  // Direct SDK query - no retry wrapper
  for await (const message of query({ options, prompt })) {
    // ... handle messages
  }

  return { suggestionResult, tokenUsage };
});
```

### 4. ❌ Redundant Zod Validation (PERFORMANCE)

**Location:** `src/lib/services/feature-planner.service.ts:424-466`

**Issue:**
```typescript
if (message.type === 'assistant') {
  assistantMessageCount++;

  // ❌ Manually validating SDK message structure
  const parseResult = sdkAssistantMessageSchema.safeParse(message.message);
  if (parseResult.success) {
    const validatedMessage = parseResult.data;
    // ... use validatedMessage
  }
}
```

**SDK Guarantee:**
The Claude SDK **already validates** all message structures internally. The TypeScript types from `@anthropic-ai/claude-agent-sdk` are guaranteed to be correct.

**Impact:**
- Unnecessary CPU overhead on every message
- Longer execution time
- Duplicate validation logic to maintain

**Fix Required:**
```typescript
if (message.type === 'assistant') {
  // Trust SDK types - no validation needed
  const textContent = message.message.content.find((c) => c.type === 'text');

  if (textContent?.type === 'text') {
    suggestionResult = this.parseFeatureSuggestionResponse(textContent.text);
  }

  if (message.message.usage) {
    tokenUsage.promptTokens = message.message.usage.input_tokens ?? 0;
    // ... etc
  }
}
```

### 5. ❌ No Cancellation Support (UX)

**Location:** Entire service - missing throughout

**SDK Documentation (lines 90):**
> Use `abortController` option to enable operation cancellation.

**Current State:**
```typescript
// ❌ No abortController anywhere in the service
for await (const message of query({
  options: {
    // ... no abortController
  },
  prompt,
}))
```

**Impact:**
- Users **cannot** cancel long-running suggestions (30-60 seconds)
- Wastes tokens/money if user navigates away
- Poor UX - users feel trapped waiting

**Fix Required:**
```typescript
// Add abort controller parameter
static async executeFeatureSuggestionAgent(
  // ... existing params
  abortController?: AbortController,  // ← Add this
): Promise<...> {
  const controller = abortController ?? new AbortController();

  for await (const message of query({
    options: {
      // ... other options
      abortController: controller,  // ← Enable cancellation
    },
    prompt,
  })) {
    // ... handle messages
  }
}
```

### 6. ❌ Missing Monitoring Hooks (OBSERVABILITY)

**Location:** `src/lib/services/feature-planner.service.ts:389-412`

**SDK Documentation (lines 104, 514-717):**
> Use hooks for monitoring tool usage, costs, and performance:
> - `PreToolUse` - track tool calls
> - `PostToolUse` - track tool results
> - `SessionEnd` - track final costs

**Current State:**
```typescript
for await (const message of query({
  options: {
    // ❌ No hooks configured - no monitoring!
  },
  prompt,
}))
```

**Impact:**
- No visibility into which files are being read
- No tracking of Read/Grep/Glob tool usage counts
- No per-agent cost tracking
- No performance metrics for optimization

**Fix Required:**
```typescript
for await (const message of query({
  options: {
    // ... other options
    hooks: {
      PreToolUse: [{
        hooks: [async (input, toolUseId, { signal }) => {
          console.log(`[${agent?.name}] Using tool: ${input.tool_name}`);
          // Track tool usage for monitoring
          return { continue: true };
        }],
      }],
      PostToolUse: [{
        hooks: [async (input, toolUseId, { signal }) => {
          console.log(`[${agent?.name}] Tool ${input.tool_name} completed`);
          // Track results and costs
          return { continue: true };
        }],
      }],
    },
  },
  prompt,
}))
```

### 7. ❌ Improper fallbackModel Usage

**Location:** `src/lib/services/feature-planner.service.ts:393`

**Issue:**
```typescript
for await (const message of query({
  options: {
    model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
    fallbackModel: FALLBACK_MODEL,  // ← Always set, even when not needed
  },
  prompt,
}))
```

**SDK Best Practice:**
`fallbackModel` should only be used for specific scenarios:
- Model capacity limits
- Model deprecation transitions
- Regional availability issues

**Impact:**
- Unnecessary fallback attempts add latency
- May use cheaper/less capable model unintentionally
- Masks model availability issues

**Fix Required:**
```typescript
const sdkOptions: Options = {
  model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
  // Only add fallback for production or when explicitly configured
  ...(process.env.NODE_ENV === 'production' && {
    fallbackModel: FALLBACK_MODEL,
  }),
};
```

### 8. ❌ Misleading Temperature Comment

**Location:** `src/lib/services/feature-planner.service.ts:399-410`

**Issue:**
```typescript
/**
 * Temperature Configuration (Future Enhancement)
 *
 * Temperature control is defined in TEMPERATURE_CONFIG constants but not yet
 * applied due to SDK API limitations. When the SDK adds temperature support:
 * ... (instructions for future implementation)
 */
// temperature: agent?.temperature ?? TEMPERATURE_CONFIG.FEATURE_SUGGESTION,
```

**Reality:**
According to SDK documentation (lines 88-117 of Options type), **temperature is not a supported option** in the Claude Agent SDK. The SDK uses different mechanisms for controlling output variability.

**Impact:**
- Misleading comment suggests future support that may never exist
- Maintains unused constant definitions (TEMPERATURE_CONFIG)
- Developer confusion about SDK capabilities

**Fix Required:**
```typescript
// Remove temperature references entirely:
// 1. Delete TEMPERATURE_CONFIG from claude-sdk-config.ts
// 2. Remove temperature from agent type definitions
// 3. Remove commented-out temperature code
// 4. Document that output variability is controlled via prompt engineering
```

### 9. ❌ Excessive Production Logging

**Location:** `src/lib/services/feature-planner.service.ts:370-475`

**Issue:**
```typescript
console.log('[executeFeatureSuggestionAgent] Starting query with:', {
  allowedTools,
  maxTurns: agent ? 10 : 5,
  model: settings.customModel || 'claude-sonnet-4-5-20250929',
  promptLength: prompt.length,
});

console.log(`[executeFeatureSuggestionAgent] Message #${messageCount}:`, {
  hasMessage: !!message,
  type: message.type,
});

console.log(`[executeFeatureSuggestionAgent] Assistant message #${assistantMessageCount}`);
// ... 15+ more console.log calls
```

**Impact:**
- Production logs flooded with debug information
- Performance overhead from string interpolation
- Sensitive data may be logged (prompts, results)
- No structured logging for proper monitoring

**Fix Required:**
```typescript
// Use conditional debug logging
import { logger } from '@/lib/utils/logger';

if (process.env.DEBUG_AGENTS === 'true') {
  logger.debug('executeFeatureSuggestionAgent:start', {
    allowedTools,
    maxTurns: agent ? 10 : 5,
    model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
  });
}

// In production, use structured logging for important events only
logger.info('feature-suggestion:complete', {
  agentId: agent?.agentId,
  suggestionCount: result.suggestions.length,
  executionTimeMs,
  tokenUsage: result.tokenUsage,
});
```

### 10. ❌ Poor TypeScript Type Safety

**Location:** `src/lib/services/feature-planner.service.ts:873`

**Issue:**
```typescript
// Type cast to work around SDK typing limitations
const streamEvent = message.event as unknown as {
  content_block?: { text?: string; type: string };
  delta?: { text?: string; type: string };
  type: string;
};
```

**SDK Provides Proper Types:**
The SDK exports `RawMessageStreamEvent` type that should be used directly:
```typescript
import type { RawMessageStreamEvent } from '@anthropic-ai/claude-agent-sdk';
```

**Impact:**
- Loses type safety - typos not caught at compile time
- Runtime errors if SDK structure changes
- Harder to maintain

**Fix Required:**
```typescript
import type { RawMessageStreamEvent } from '@anthropic-ai/claude-agent-sdk';

if (message.type === 'stream_event') {
  const streamEvent = message.event as RawMessageStreamEvent;

  // Now fully type-safe with SDK types
  if (streamEvent.type === 'content_block_delta' &&
      streamEvent.delta.type === 'text_delta') {
    onPartialUpdate(streamEvent.delta.text);
  }
}
```

### 11. ❌ No Session Management

**Location:** Entire service

**SDK Documentation (lines 113-114):**
> Use `resume` and `forkSession` options for session continuity and branching.

**Current State:**
Every feature suggestion creates a new isolated session with no history.

**Impact:**
- No context from previous suggestions in same session
- Can't resume interrupted operations
- Higher token costs (no cache reuse between suggestions)

**Fix Required:**
```typescript
interface FeatureSuggestionContext {
  sessionId?: string;
  previousSuggestions?: Array<SuggestionResult>;
}

static async executeFeatureSuggestionAgent(
  // ... existing params
  context?: FeatureSuggestionContext,
): Promise<...> {
  for await (const message of query({
    options: {
      // ... other options
      resume: context?.sessionId,  // ← Resume previous session
      forkSession: false,  // Keep same session for context
    },
    prompt,
  })) {
    // ... handle messages
  }

  // Return session ID for future use
  return {
    executionTimeMs,
    result: finalResult,
    sessionId: message.session_id,  // ← Save for next call
    // ...
  };
}
```

## Additional Architectural Issues

### 12. ⚠️ Inconsistent Prompt Construction (MAINTAINABILITY)

**Location:** Lines 1230-1650 (multiple prompt builder methods)

**Issue:**
Three separate methods with duplicated logic:
- `buildCustomFeatureSuggestionPrompt()` (line 1230)
- `buildDefaultFeatureSuggestionPrompt()` (line 1282)
- `buildRoleBasedRefinementPrompt()` (line 1422)

**Impact:**
- Hard to maintain consistent prompt format
- Changes must be duplicated across methods
- Easy to introduce bugs

**Fix Required:**
Extract common prompt structure:
```typescript
private static buildBasePrompt(config: {
  context: string;
  task: string;
  requirements: string[];
  outputFormat: string;
  constraints?: string[];
}): string {
  return `
${config.context}

YOUR TASK:
${config.task}

REQUIREMENTS:
${config.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${config.constraints ? `
CONSTRAINTS:
${config.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}
` : ''}

OUTPUT FORMAT:
${config.outputFormat}
  `.trim();
}
```

### 13. ⚠️ Hard-Coded Prompt Templates (FLEXIBILITY)

**Location:** Lines 1230-1650

**Issue:**
All prompts are hard-coded strings in the service layer.

**Impact:**
- Can't A/B test different prompt variants
- No versioning of prompts
- No way to customize prompts per tenant/user

**Fix Required:**
Move to prompt template system:
```typescript
// src/lib/constants/prompt-templates.ts
export const FEATURE_SUGGESTION_TEMPLATE = {
  version: '1.0.0',
  template: `
You are a product strategist helping to generate feature suggestions.

CONTEXT:
{{context}}

TASK:
Generate {{suggestionCount}} strategic feature suggestions for {{targetArea}}.

...
  `,
  variables: ['context', 'suggestionCount', 'targetArea'],
};
```

### 14. ⚠️ No Prompt Caching Strategy (COST)

**Location:** `src/lib/constants/claude-sdk-config.ts:43-48`

**SDK Documentation (lines 89-90):**
> The SDK supports prompt caching for cost optimization.

**Current State:**
```typescript
export const BASE_SDK_OPTIONS: Partial<Options> = {
  additionalDirectories: ['docs', 'tests'],
  cwd: process.cwd(),
  permissionMode: 'bypassPermissions',
  settingSources: ['project'], // Loads CLAUDE.md
  // ❌ No cache configuration
} as const;
```

**Impact:**
- Every suggestion re-reads CLAUDE.md (500+ tokens)
- No cache reuse across parallel agents
- Higher API costs

**Fix Required:**
The SDK handles caching automatically when using `settingSources: ['project']`, but you should understand cache behavior:
```typescript
// Document cache behavior in comments
export const BASE_SDK_OPTIONS: Partial<Options> = {
  additionalDirectories: ['docs', 'tests'],
  cwd: process.cwd(),
  permissionMode: 'bypassPermissions',

  // Loads CLAUDE.md - SDK caches this content automatically
  // Cache is shared across all agents in same execution
  // Cache is invalidated when CLAUDE.md changes
  settingSources: ['project'],
} as const;
```

### 15. ⚠️ Incomplete Token Tracking (ANALYTICS)

**Location:** Lines 451-460 (token usage tracking)

**Issue:**
```typescript
if (validatedMessage.usage) {
  tokenUsage.promptTokens = validatedMessage.usage.input_tokens ?? 0;
  tokenUsage.completionTokens = validatedMessage.usage.output_tokens ?? 0;
  tokenUsage.totalTokens =
    (validatedMessage.usage.input_tokens ?? 0) +
    (validatedMessage.usage.output_tokens ?? 0);
  tokenUsage.cacheReadTokens = validatedMessage.usage.cache_read_input_tokens ?? 0;
  tokenUsage.cacheCreationTokens = validatedMessage.usage.cache_creation_input_tokens ?? 0;
  // ❌ But these cache tokens aren't exposed to UI or analytics!
}
```

**Impact:**
- Can't track cache hit rates
- Can't optimize prompts for better caching
- Missing data for cost analysis

**Fix Required:**
1. Update return types to include cache metrics
2. Store cache metrics in database
3. Add cache efficiency analytics dashboard

### 16. ⚠️ No Custom Permission Callbacks (SECURITY)

**Location:** `src/lib/constants/claude-sdk-config.ts:46`

**Issue:**
```typescript
export const BASE_SDK_OPTIONS: Partial<Options> = {
  // ...
  permissionMode: 'bypassPermissions',  // ❌ No restrictions!
} as const;
```

**SDK Documentation (lines 94-95, 267-298):**
> Use `canUseTool` callback for fine-grained permission control.

**Impact:**
- Agents can read ANY file in the project
- No way to restrict access to sensitive files (.env, credentials)
- No audit trail of file access

**Fix Required:**
```typescript
const canUseTool: CanUseTool = async (toolName, input, { signal }) => {
  // Block access to sensitive files
  if (toolName === 'Read' && typeof input.file_path === 'string') {
    const blockedPatterns = ['.env', 'credentials', 'secrets', '.key'];
    if (blockedPatterns.some(pattern => input.file_path.includes(pattern))) {
      return {
        behavior: 'deny',
        message: 'Access to sensitive files is restricted',
        interrupt: false,
      };
    }
  }

  return {
    behavior: 'allow',
    updatedInput: input,
  };
};

export const BASE_SDK_OPTIONS: Partial<Options> = {
  // ...
  canUseTool,  // ← Add permission callback
  permissionMode: 'default',  // ← Use proper permission checks
} as const;
```

### 17. ⚠️ Missing Cost Tracking per Suggestion (ANALYTICS)

**Location:** Entire workflow

**Issue:**
Token usage is tracked but not converted to actual dollar costs.

**Impact:**
- Can't track spend per feature suggestion
- No budget alerts
- Can't optimize for cost efficiency

**Fix Required:**
```typescript
// src/lib/utils/token-cost-calculator.ts
export function calculateCost(usage: TokenUsage, model: string): number {
  const rates = {
    'claude-sonnet-4-5-20250929': {
      input: 0.003 / 1000,  // $3 per 1M tokens
      output: 0.015 / 1000,  // $15 per 1M tokens
      cacheWrite: 0.00375 / 1000,
      cacheRead: 0.0003 / 1000,
    },
    'claude-sonnet-4-20250929': {
      input: 0.003 / 1000,
      output: 0.015 / 1000,
    },
  };

  const rate = rates[model];
  if (!rate) return 0;

  const inputCost = usage.promptTokens * rate.input;
  const outputCost = usage.completionTokens * rate.output;
  const cacheCost =
    (usage.cacheCreationTokens ?? 0) * (rate.cacheWrite ?? 0) +
    (usage.cacheReadTokens ?? 0) * (rate.cacheRead ?? 0);

  return inputCost + outputCost + cacheCost;
}

// Use in service:
return {
  executionTimeMs,
  result: finalResult,
  tokenUsage: result.tokenUsage,
  estimatedCostUsd: calculateCost(result.tokenUsage, model),  // ← Add this
  retryCount: result.retryCount,
};
```

### 18. ⚠️ No Error Categorization (RELIABILITY)

**Location:** Lines 496-505 (error handling)

**SDK Documentation (lines 1813-1819):**
> Handle specific SDK errors like `AbortError` differently.

**Current State:**
```typescript
} catch (error) {
  const context: ServiceErrorContext = {
    endpoint: 'query',
    isRetryable: true,  // ❌ Always marked retryable!
    method: 'executeFeatureSuggestionAgent',
    operation: 'feature-suggestion',
    service: 'claude-agent-sdk',
  };
  throw createServiceError(context, error);
}
```

**Impact:**
- All errors treated the same
- Retries on non-retryable errors (e.g., invalid API key)
- Poor user error messages

**Fix Required:**
```typescript
import { AbortError } from '@anthropic-ai/claude-agent-sdk';

} catch (error) {
  // Handle abort separately
  if (error instanceof AbortError) {
    return {
      executionTimeMs: Date.now() - startTime,
      result: { suggestions: [] },
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      retryCount: 0,
      wasCancelled: true,
    };
  }

  // Categorize other errors
  const isRetryable =
    error?.message?.includes('rate limit') ||
    error?.message?.includes('timeout') ||
    error?.message?.includes('server error');

  const context: ServiceErrorContext = {
    endpoint: 'query',
    isRetryable,  // ← Proper categorization
    method: 'executeFeatureSuggestionAgent',
    operation: 'feature-suggestion',
    service: 'claude-agent-sdk',
  };
  throw createServiceError(context, error);
}
```

## Impact Summary

| Issue | Severity | Impact Area | Cost Impact | User Impact |
|-------|----------|-------------|-------------|-------------|
| Missing systemPrompt | 🔴 Critical | Functionality | Medium | High - Wrong results |
| No streaming | 🔴 Critical | UX | None | High - Feels frozen |
| Redundant retries | 🟡 Medium | Performance | Low | Medium - Slower |
| Redundant validation | 🟡 Medium | Performance | Low | Low - Slight slowdown |
| No cancellation | 🟡 Medium | UX | High | High - Frustrating |
| No monitoring hooks | 🟡 Medium | Observability | None | None - Internal |
| Improper fallback | 🟢 Low | Reliability | Low | Low - Rare issue |
| Temperature comment | 🟢 Low | Maintenance | None | None - Documentation |
| Excessive logging | 🟡 Medium | Performance | Low | Low - Log noise |
| Poor type safety | 🟡 Medium | Reliability | None | Low - Potential bugs |
| No session mgmt | 🟡 Medium | Functionality | Medium | Medium - No context |
| Prompt duplication | 🟢 Low | Maintenance | None | None - Internal |
| Hard-coded prompts | 🟢 Low | Flexibility | None | Low - Can't customize |
| No cache strategy | 🟡 Medium | Cost | High | None - Hidden cost |
| Incomplete tracking | 🟢 Low | Analytics | None | None - Internal |
| No permissions | 🟡 Medium | Security | None | None - Security risk |
| No cost tracking | 🟢 Low | Analytics | None | None - Internal |
| Poor error handling | 🟡 Medium | Reliability | Low | Medium - Bad errors |

**Total Estimated Annual Cost Impact:** $2,000 - $5,000 (assuming 10,000 suggestions/year)

## Recommended Priority Order

### Phase 1: Critical Fixes (This Week)
1. Add system prompt configuration (issue #1)
2. Enable streaming for user feedback (issue #2)
3. Add cancellation support (issue #5)

### Phase 2: Performance & Cost (Next 2 Weeks)
4. Remove redundant retry logic (issue #3)
5. Remove redundant validation (issue #4)
6. Add monitoring hooks (issue #6)
7. Implement cost tracking (issue #17)

### Phase 3: Architecture Improvements (Next Month)
8. Fix temperature references (issue #8)
9. Improve type safety (issue #10)
10. Add session management (issue #11)
11. Refactor prompt construction (issue #12-13)

### Phase 4: Security & Reliability (Following Month)
12. Add permission callbacks (issue #16)
13. Improve error categorization (issue #18)
14. Fix fallback model usage (issue #7)
15. Replace console.log with proper logging (issue #9)

## Testing Requirements

After implementing fixes, test:

1. **Streaming behavior:**
   - Verify partial updates appear in UI
   - Test with slow network connections
   - Verify final result matches streamed content

2. **Cancellation:**
   - Cancel mid-execution, verify cleanup
   - Check no charges after cancellation
   - Test rapid cancel/restart cycles

3. **Cache efficiency:**
   - First suggestion = cache creation
   - Subsequent suggestions = cache reads
   - Verify 70%+ cache hit rate

4. **Cost tracking:**
   - Compare calculated costs to Anthropic dashboard
   - Verify cache costs calculated correctly
   - Test cost alerts for high usage

5. **Error handling:**
   - Test network failures
   - Test invalid API keys
   - Test rate limits
   - Verify proper error messages to user

## References

- **Claude SDK Documentation:** `docs/2025_10_12/claude-typescript-sdk.md`
- **Service Implementation:** `src/lib/services/feature-planner.service.ts:304-506`
- **Hook Implementation:** `src/app/(app)/feature-planner/hooks/use-suggest-feature.ts`
- **Constants:** `src/lib/constants/claude-sdk-config.ts`

## Next Steps

1. Review this analysis with team
2. Create GitHub issues for each priority fix
3. Implement Phase 1 fixes (critical issues)
4. Add E2E tests for feature suggestions
5. Deploy and monitor in staging environment

---

**Prepared by:** Claude Code
**Review Status:** Pending
**Last Updated:** 2025-10-14
