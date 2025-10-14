# Claude Agent SDK Integration - Issues & Best Practice Violations

**Analysis Date:** 2025-10-14
**Scope:** Feature Planner feature suggestion workflow
**Files Analyzed:**
- `src/lib/services/feature-planner.service.ts` (2225 lines)
- `src/lib/actions/feature-planner/feature-planner.actions.ts` (793 lines)
- `src/app/(app)/feature-planner/components/request-input.tsx` (142 lines)

---

## Critical Issues

### 1. ❌ Missing AbortController for Cancellation
**Severity:** High | **Impact:** Resource leaks, unresponsive UI

**Problem:**
```typescript
// Current implementation - no abort support
for await (const message of query({
  options: {
    allowedTools,
    maxTurns: 15,
    model: settings.customModel || 'claude-sonnet-4-5-20250929',
  },
  prompt,
})) {
  // Processing...
}
```

**SDK Documentation (Lines 90, 276-277):**
```typescript
type Options = {
  abortController?: AbortController;  // Default: new AbortController()
  // ...
}

// Also available as method:
interface Query {
  interrupt(): Promise<void>;  // Only in streaming input mode
}
```

**Impact:**
- 12-minute timeout operations can't be cancelled
- User stuck waiting even if they navigate away
- Wasted API credits on unwanted completions
- Memory leaks from abandoned queries

**Fix Required:**
```typescript
const abortController = new AbortController();

try {
  for await (const message of query({
    options: {
      abortController,
      allowedTools,
      maxTurns: 15,
      model: settings.customModel,
    },
    prompt,
  })) {
    // Check if aborted
    if (abortController.signal.aborted) break;
  }
} finally {
  abortController.abort(); // Cleanup
}
```

---

### 2. ❌ No Hooks for Observability
**Severity:** High | **Impact:** Debugging blind spots, no audit trail

**Problem:**
All agent executions lack hooks for monitoring tool usage, which is critical for:
- Understanding which files agents read
- Tracking Glob/Grep/Read patterns
- Debugging why agents fail to find files
- Audit compliance for tool usage

**SDK Documentation (Lines 104, 514-554):**
```typescript
type Options = {
  hooks?: Partial<Record<HookEvent, HookCallbackMatcher[]>>;
}

type HookEvent =
  | 'PreToolUse'   // Before tool execution
  | 'PostToolUse'  // After tool execution
  | 'SessionStart'
  | 'SessionEnd'
  | 'Stop';
```

**Missing Instrumentation:**
```typescript
// No visibility into:
// - Which files each specialized agent actually reads
// - Tool execution failures vs permission denials
// - Token usage per tool invocation
// - Timing breakdowns by tool type
```

**Fix Required:**
```typescript
const hooks = {
  PreToolUse: [
    {
      hooks: [async (input, toolUseId, { signal }) => {
        console.log(`[Agent ${agentId}] Using tool: ${input.tool_name}`);
        return { continue: true };
      }],
    },
  ],
  PostToolUse: [
    {
      hooks: [async (input, toolUseId, { signal }) => {
        console.log(`[Agent ${agentId}] Tool result: ${input.tool_name}`);
        return { continue: true };
      }],
    },
  ],
};

for await (const message of query({
  options: { hooks, allowedTools, maxTurns: 15 },
  prompt,
})) {
  // ...
}
```

**Impact on Feature Suggestion:**
- Line 1773: File discovery agent failures are silent
- Line 2046: Response parsing errors lack context
- No way to know if agents are reading wrong files
- Can't optimize tool usage patterns

---

### 3. ❌ Not Using `systemPrompt` Option
**Severity:** Medium | **Impact:** Poor prompt management, missed SDK features

**Problem:**
Building prompts as plain strings instead of using SDK's structured systemPrompt:

```typescript
// Current approach (Lines 1154-1200, 1203-1261, etc.)
private static buildCustomFeatureSuggestionPrompt(...): string {
  return `${agent.systemPrompt}

FEATURE SUGGESTION CONTEXT:
- Target Area: ${pageOrComponent}
...`;
}
```

**SDK Documentation (Lines 117-118):**
```typescript
type Options = {
  systemPrompt?: string | {
    type: 'preset';
    preset: 'claude_code';
    append?: string
  };
}
```

**Why This Matters:**
- Can't leverage Claude Code's built-in system prompt
- Missing CLAUDE.md integration through preset
- Harder to maintain consistency across agents
- No separation of system vs user prompts

**Fix Required:**
```typescript
for await (const message of query({
  options: {
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code',
      append: agent?.systemPrompt || '',
    },
    settingSources: ['project'], // Loads CLAUDE.md
    allowedTools,
  },
  prompt: userPrompt, // Just the user request, not system instructions
})) {
  // ...
}
```

---

### 4. ❌ No Session Management
**Severity:** Medium | **Impact:** Lost context, higher costs

**Problem:**
Each agent call creates a fresh session without reusing context:

```typescript
// Line 376-384: Every refinement is a new session
for await (const message of query({
  options: { allowedTools, maxTurns: 15, model: settings.customModel },
  prompt,
})) {
  // No session continuity
}
```

**SDK Documentation (Lines 95, 103, 113):**
```typescript
type Options = {
  continue?: boolean;        // Continue most recent conversation
  resume?: string;           // Resume specific session ID
  forkSession?: boolean;     // Fork to new session from resumed one
}
```

**Use Case:**
For parallel refinement agents analyzing the same feature request:
1. Agent 1 reads CLAUDE.md (cached)
2. Agent 2 should reuse that cache, not re-read
3. File discovery should continue from refinement session

**Fix Required:**
```typescript
// Store session ID from refinement
let refinementSessionId: string | undefined;

for await (const message of query({
  options: { allowedTools, maxTurns: 15 },
  prompt: refinementPrompt,
})) {
  if (message.type === 'system' && message.subtype === 'init') {
    refinementSessionId = message.session_id;
  }
}

// Reuse session in file discovery
for await (const message of query({
  options: {
    resume: refinementSessionId,
    forkSession: true, // Fork to new session from refined context
    allowedTools: ['Read', 'Grep', 'Glob'],
  },
  prompt: fileDiscoveryPrompt,
})) {
  // Benefits from cached file reads
}
```

---

### 5. ❌ Missing Error Type Discrimination
**Severity:** Medium | **Impact:** Inappropriate retries, poor error messages

**Problem:**
Not checking for `AbortError` in error handling:

```typescript
// Lines 467-476, 562-570, etc.
catch (error) {
  const context: ServiceErrorContext = {
    endpoint: 'query',
    isRetryable: true,  // ❌ Always retryable, even if aborted!
    method: 'executeFeatureSuggestionAgent',
    // ...
  };
  throw createServiceError(context, error);
}
```

**SDK Documentation (Lines 1813-1819):**
```typescript
class AbortError extends Error {}
```

**Fix Required:**
```typescript
import { AbortError } from '@anthropic-ai/claude-agent-sdk';

catch (error) {
  // Don't retry user cancellations
  if (error instanceof AbortError) {
    throw new ActionError(
      ErrorType.USER_CANCELLED,
      'OPERATION_CANCELLED',
      'Operation was cancelled by user',
      { operation: 'feature-suggestion' },
      false, // Not retryable
    );
  }

  // Handle other errors...
}
```

---

### 6. ❌ No Working Directory Configuration
**Severity:** Medium | **Impact:** Tool access issues, path confusion

**Problem:**
Not setting `cwd` or `additionalDirectories`:

```typescript
// Line 376-384: No directory context
for await (const message of query({
  options: {
    allowedTools: ['Read', 'Glob', 'Grep'],
    // ❌ Missing cwd, additionalDirectories
  },
  prompt,
})) {
  // Agent doesn't know project root
}
```

**SDK Documentation (Lines 91, 96):**
```typescript
type Options = {
  additionalDirectories?: string[];  // Default: []
  cwd?: string;                      // Default: process.cwd()
}
```

**Impact:**
- File paths in prompts may be ambiguous
- Tools may not find files outside default scope
- Glob patterns might fail unexpectedly

**Fix Required:**
```typescript
const projectRoot = process.cwd();

for await (const message of query({
  options: {
    cwd: projectRoot,
    additionalDirectories: [
      path.join(projectRoot, 'docs'),
      path.join(projectRoot, 'tests'),
    ],
    allowedTools: ['Read', 'Glob', 'Grep'],
  },
  prompt,
})) {
  // ...
}
```

---

## Performance Issues

### 7. ⚠️ Excessive `maxTurns` Configuration
**Severity:** Medium | **Impact:** Higher costs, slower execution

**Problem:**
```typescript
// Line 379: Feature suggestion (only generates JSON)
maxTurns: agent ? 15 : 15, // Same value both branches!

// Line 514: File discovery (specialized search)
maxTurns: 15, // Too many for focused agent

// Line 614: Implementation planning
maxTurns: 15, // Could be lower for markdown generation
```

**Analysis:**
- Feature suggestion: Should be 5-8 turns (read files → generate)
- File discovery specialized agents: 5-7 turns (glob → read critical → respond)
- Implementation planning: 8-10 turns (analyze → plan)

**Why This Matters:**
- Each turn = API round trip
- More turns = higher latency
- Parallel agents compound the cost (14 agents × 15 turns = 210 potential API calls)

**Fix Required:**
```typescript
const TURN_LIMITS = {
  FEATURE_SUGGESTION: 8,
  FILE_DISCOVERY_SPECIALIZED: 6,
  FILE_DISCOVERY_LEGACY: 12,
  IMPLEMENTATION_PLANNING: 10,
  REFINEMENT: 8,
  SYNTHESIS: 5,
} as const;

// Apply appropriate limit per operation
maxTurns: TURN_LIMITS.FEATURE_SUGGESTION,
```

---

### 8. ⚠️ No Streaming for Long-Running Operations
**Severity:** Medium | **Impact:** Poor UX, perceived slowness

**Problem:**
Only refinement uses streaming:

```typescript
// Line 793: Refinement streams
includePartialMessages: !!onPartialUpdate,

// Line 376: Feature suggestion doesn't stream (takes 30-60s)
// ❌ Missing: includePartialMessages
// No UI updates during long wait

// Line 611: Implementation planning doesn't stream (takes 45-90s)
// ❌ Missing: includePartialMessages
```

**SDK Documentation (Lines 105, 471-483):**
```typescript
type Options = {
  includePartialMessages?: boolean;  // Default: false
}

type SDKPartialAssistantMessage = {
  type: 'stream_event';
  event: RawMessageStreamEvent;
  // ...
}
```

**Fix Required:**
```typescript
// Enable streaming for feature suggestion
for await (const message of query({
  options: {
    includePartialMessages: true,
    allowedTools,
    maxTurns: 8,
  },
  prompt,
})) {
  if (message.type === 'stream_event') {
    // Send partial text to UI
    onPartialUpdate?.(extractStreamText(message));
  }
}
```

---

### 9. ⚠️ No `fallbackModel` Configuration
**Severity:** Low | **Impact:** Service disruptions during model issues

**Problem:**
```typescript
// Line 367: No fallback if model unavailable
model: settings.customModel || 'claude-sonnet-4-5-20250929',
// ❌ What if this model is down or deprecated?
```

**SDK Documentation (Line 102):**
```typescript
type Options = {
  fallbackModel?: string;  // Model to use if primary fails
}
```

**Fix Required:**
```typescript
options: {
  model: settings.customModel || 'claude-sonnet-4-5-20250929',
  fallbackModel: 'claude-sonnet-4-20250929', // Older stable version
  allowedTools,
}
```

---

## Cost Optimization Issues

### 10. ⚠️ Not Using `maxThinkingTokens` Constraint
**Severity:** Medium | **Impact:** Unpredictable costs, budget overruns

**Problem:**
```typescript
// No thinking token limits anywhere in codebase
// Parallel agents can consume unlimited thinking tokens
// 14 agents × uncapped thinking = cost explosion
```

**SDK Documentation (Line 106):**
```typescript
type Options = {
  maxThinkingTokens?: number;  // Maximum tokens for thinking process
}
```

**Why This Matters:**
- Thinking tokens are billed
- Parallel execution multiplies cost
- No budget guardrails

**Fix Required:**
```typescript
const THINKING_TOKEN_LIMITS = {
  FEATURE_SUGGESTION: 2000,
  FILE_DISCOVERY: 1000,    // Focused search, less thinking
  REFINEMENT: 1500,
  IMPLEMENTATION_PLANNING: 3000,
} as const;

options: {
  maxThinkingTokens: THINKING_TOKEN_LIMITS.FILE_DISCOVERY,
  allowedTools: ['Glob', 'Grep', 'Read'],
}
```

---

### 11. ⚠️ Incomplete Token Usage Tracking
**Severity:** Low | **Impact:** Poor cost analytics

**Problem:**
```typescript
// Lines 422-428: Tracking cache tokens
tokenUsage.cacheReadTokens = validatedMessage.usage.cache_read_input_tokens ?? 0;
tokenUsage.cacheCreationTokens = validatedMessage.usage.cache_creation_input_tokens ?? 0;

// But not in all places:
// Line 505: File discovery missing cache tracking
const tokenUsage = {
  completionTokens: 0,
  promptTokens: 0,
  totalTokens: 0,
  // ❌ Missing: cacheReadTokens, cacheCreationTokens
};
```

**Fix Required:**
Standardize token usage interface across all operations:
```typescript
interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
}
```

---

## Security & Configuration Issues

### 12. ⚠️ No `permissionMode` Configuration
**Severity:** Low | **Impact:** Unnecessary permission prompts in automation

**Problem:**
```typescript
// Relying on SDK defaults for permission mode
// No explicit control over tool permissions
```

**SDK Documentation (Lines 111, 257-265):**
```typescript
type Options = {
  permissionMode?: PermissionMode;  // Default: 'default'
}

type PermissionMode =
  | 'default'           // Standard permission behavior
  | 'acceptEdits'       // Auto-accept file edits
  | 'bypassPermissions' // Bypass all permission checks
  | 'plan';             // Planning mode - no execution
```

**Use Case:**
Feature planner is a trusted automation workflow:
```typescript
options: {
  permissionMode: 'bypassPermissions', // Safe for read-only tools
  allowedTools: ['Read', 'Grep', 'Glob'], // No writes
}
```

---

### 13. ⚠️ Hardcoded Model Strings
**Severity:** Low | **Impact:** Maintenance burden, update friction

**Problem:**
```typescript
// Repeated throughout codebase
model: settings.customModel || 'claude-sonnet-4-5-20250929',
```

**Fix Required:**
```typescript
// src/lib/constants/claude-models.ts
export const CLAUDE_MODELS = {
  SONNET_4_5: 'claude-sonnet-4-5-20250929',
  SONNET_4: 'claude-sonnet-4-20250929',
  OPUS_4: 'claude-opus-4-20250514',
} as const;

// Usage
model: settings.customModel || CLAUDE_MODELS.SONNET_4_5,
```

---

### 14. ⚠️ Circuit Breaker Timeout Mismatch
**Severity:** Low | **Impact:** Premature failures

**Problem:**
```typescript
// Line 316-318: Circuit breaker timeout
const circuitBreaker = circuitBreakers.externalService('claude-agent-feature-suggestion', {
  timeoutMs: 620000, // 12 minutes
});

// But no corresponding SDK timeout configuration
// SDK might timeout earlier, triggering circuit breaker unnecessarily
```

**SDK Documentation (Line 784):**
```typescript
interface BashInput {
  timeout?: number;  // Optional timeout in milliseconds
}
// Note: SDK doesn't expose query-level timeout directly
```

**Issue:**
Circuit breaker at 12 minutes, but SDK might have different internal timeout.

---

## Missing SDK Features

### 15. ❌ Not Using Programmatic `agents` Configuration
**Severity:** Low | **Impact:** Missed orchestration opportunities

**SDK Documentation (Lines 92, 137-156):**
```typescript
type Options = {
  agents?: Record<string, AgentDefinition>;
}

type AgentDefinition = {
  description: string;
  tools?: string[];
  prompt: string;
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
}
```

**Current Approach:**
Manually building specialized agent prompts (Lines 1402-1574) instead of using SDK agent definitions.

**Potential Improvement:**
```typescript
const agents = {
  'database-schema-agent': {
    description: 'Database schemas, migrations, and ORM models',
    tools: ['Read', 'Glob', 'Grep'],
    prompt: buildSpecializedAgentPrompt(...),
    model: 'inherit',
  },
  // ... 13 more agents
};

for await (const message of query({
  options: { agents, allowedTools },
  prompt: 'Analyze this feature request...',
})) {
  // SDK handles agent orchestration
}
```

---

### 16. ⚠️ Temperature Control Not Implemented
**Severity:** Low | **Impact:** Less control over output creativity

**Problem:**
```typescript
// Line 374-375: Comment acknowledges missing feature
// Note: Temperature support is not yet available in the Claude SDK
// Will be added when SDK supports it: temperature: agent?.temperature
```

**Status:** SDK may now support this - needs verification

---

### 17. ❌ No `mcpServers` Integration
**Severity:** Low | **Impact:** Missed tool isolation opportunity

**SDK Documentation (Lines 108, 300-351):**
```typescript
type Options = {
  mcpServers?: Record<string, McpServerConfig>;
}

type McpServerConfig =
  | McpStdioServerConfig
  | McpSSEServerConfig
  | McpHttpServerConfig
  | McpSdkServerConfigWithInstance;
```

**Potential Use Case:**
Isolate file discovery tools per agent via MCP servers.

---

## Code Quality Issues

### 18. ⚠️ Fragile Stream Event Parsing
**Severity:** Medium | **Impact:** Breakage risk with SDK updates

**Problem:**
```typescript
// Lines 802-819: Type assertions for stream events
const streamEvent = message as unknown as {
  content?: Array<{ text?: string; type: string }>;
  delta?: { text?: string; type: string };
  type: 'stream_event';
};

if (streamEvent.delta?.type === 'text_delta' && streamEvent.delta.text) {
  onPartialUpdate(streamEvent.delta.text);
}
```

**Issue:**
Not using proper SDK types from documentation.

**SDK Documentation (Lines 476-482):**
```typescript
type SDKPartialAssistantMessage = {
  type: 'stream_event';
  event: RawMessageStreamEvent;
  parent_tool_use_id: string | null;
  uuid: UUID;
  session_id: string;
}
```

**Fix Required:**
Import and use SDK types instead of type assertions.

---

### 19. ⚠️ Duplicate `maxTurns` Logic
**Severity:** Low | **Impact:** Code smell, potential bugs

**Problem:**
```typescript
// Line 379: Useless ternary
maxTurns: agent ? 15 : 15, // Same value both branches!
```

**Fix:**
```typescript
maxTurns: 15, // Or TURN_LIMITS.FEATURE_SUGGESTION
```

---

## Summary

### Critical Issues (Fix Immediately)
1. ❌ Missing AbortController → Resource leaks
2. ❌ No hooks for observability → Blind debugging
3. ❌ Not using `systemPrompt` option → Poor prompt management

### High Priority (Fix Soon)
4. ❌ No session management → Higher costs
5. ❌ Missing error type discrimination → Bad error handling
6. ❌ No working directory config → Tool access issues

### Medium Priority (Optimize)
7. ⚠️ Excessive `maxTurns` → Unnecessary API calls
8. ⚠️ No streaming for long operations → Poor UX
9. ⚠️ No `maxThinkingTokens` → Unpredictable costs

### Low Priority (Technical Debt)
10-19. Various configuration, security, and code quality issues

---

## Recommended Action Plan

### Phase 1: Critical Fixes (1-2 days)
1. Add AbortController to all query calls
2. Implement hooks for PreToolUse/PostToolUse
3. Switch to systemPrompt option with Claude Code preset

### Phase 2: Performance (2-3 days)
4. Add session management with resume/forkSession
5. Optimize maxTurns per operation type
6. Implement streaming for all long-running operations
7. Add maxThinkingTokens constraints

### Phase 3: Polish (1-2 days)
8. Fix error handling with AbortError checks
9. Add cwd and additionalDirectories config
10. Implement fallbackModel
11. Add permissionMode for automation
12. Standardize token usage tracking
13. Create model constants file
14. Fix code quality issues (type assertions, duplicates)

### Total Estimate: 4-7 days
