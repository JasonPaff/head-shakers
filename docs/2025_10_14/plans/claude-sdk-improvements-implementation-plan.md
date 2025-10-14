# Claude SDK Improvements - Implementation Plan

**Date:** 2025-10-14
**Scope:** Selected fixes for feature planner service SDK integration
**Estimated Duration:** 3-4 hours
**Target File:** `src/lib/services/feature-planner.service.ts`

---

## Overview

This plan addresses 9 specific issues in the Claude Agent SDK integration:
- Configuration improvements (systemPrompt, cwd, maxTurns, maxThinkingTokens)
- Code quality fixes (hardcoded strings, duplicate logic, type safety)
- Missing features (temperature control, programmatic agents)

**Complexity:** Medium
**Risk Level:** Low (configuration changes, no business logic changes)

---

## Prerequisites

- [ ] Ensure feature planner tests are passing
- [ ] Create feature branch: `git checkout -b fix/claude-sdk-improvements`
- [ ] Review Claude SDK documentation: `docs/2025_10_12/claude-typescript-sdk.md`

---

## Implementation Steps

### Step 1: Create Claude Models Constants File

**What:** Extract hardcoded model strings into a constants file
**Why:** Improves maintainability, makes model updates easier
**Confidence:** High

**Files to Create:**
- `src/lib/constants/claude-models.ts`

**Changes:**

Create new file `src/lib/constants/claude-models.ts`:
```typescript
/**
 * Claude model identifiers for Agent SDK
 * @see {@link https://docs.anthropic.com/en/docs/about-claude/models}
 */
export const CLAUDE_MODELS = {
  SONNET_4_5: 'claude-sonnet-4-5-20250929',
  SONNET_4: 'claude-sonnet-4-20250929',
  OPUS_4: 'claude-opus-4-20250514',
  HAIKU_4: 'claude-haiku-4-20250229',
} as const;

export type ClaudeModel = (typeof CLAUDE_MODELS)[keyof typeof CLAUDE_MODELS];

/**
 * Default model for feature planner operations
 */
export const DEFAULT_FEATURE_PLANNER_MODEL = CLAUDE_MODELS.SONNET_4_5;

/**
 * Fallback model if primary model is unavailable
 */
export const FALLBACK_MODEL = CLAUDE_MODELS.SONNET_4;
```

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] File created at `src/lib/constants/claude-models.ts`
- [ ] No TypeScript errors
- [ ] Constants exported correctly

---

### Step 2: Create SDK Configuration Constants

**What:** Define maxTurns, maxThinkingTokens, and other SDK options per operation type
**Why:** Centralizes configuration, optimizes performance and costs
**Confidence:** High

**Files to Create:**
- `src/lib/constants/claude-sdk-config.ts`

**Changes:**

Create new file `src/lib/constants/claude-sdk-config.ts`:
```typescript
import type { Options } from '@anthropic-ai/claude-agent-sdk';

/**
 * Maximum conversation turns per operation type
 * Lower values = faster execution and lower costs
 */
export const TURN_LIMITS = {
  FEATURE_SUGGESTION: 8,
  FILE_DISCOVERY_SPECIALIZED: 6,
  FILE_DISCOVERY_LEGACY: 12,
  IMPLEMENTATION_PLANNING: 10,
  REFINEMENT: 8,
  SYNTHESIS: 5,
} as const;

/**
 * Maximum thinking tokens per operation type
 * Prevents cost overruns from excessive reasoning
 */
export const THINKING_TOKEN_LIMITS = {
  FEATURE_SUGGESTION: 2000,
  FILE_DISCOVERY: 1000,
  REFINEMENT: 1500,
  IMPLEMENTATION_PLANNING: 3000,
  SYNTHESIS: 1000,
} as const;

/**
 * Default temperature for creative vs deterministic outputs
 * Note: Requires SDK support - will be added when available
 */
export const TEMPERATURE_CONFIG = {
  FEATURE_SUGGESTION: 0.7, // Creative suggestions
  FILE_DISCOVERY: 0.3,     // Deterministic search
  REFINEMENT: 0.5,         // Balanced
  IMPLEMENTATION_PLANNING: 0.4, // Structured output
  SYNTHESIS: 0.6,          // Balanced creativity
} as const;

/**
 * Base SDK options for all feature planner operations
 */
export const BASE_SDK_OPTIONS: Partial<Options> = {
  cwd: process.cwd(),
  additionalDirectories: [
    'docs',
    'tests',
  ],
  settingSources: ['project'], // Load CLAUDE.md
  permissionMode: 'bypassPermissions', // Read-only tools, no prompts needed
} as const;
```

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] File created at `src/lib/constants/claude-sdk-config.ts`
- [ ] No TypeScript errors
- [ ] All constants properly typed

---

### Step 3: Import New Constants in Service File

**What:** Add imports for the new constants at top of service file
**Why:** Makes constants available for subsequent steps
**Confidence:** High

**Files to Modify:**
- `src/lib/services/feature-planner.service.ts`

**Changes:**

Add imports after existing imports (after line 1):
```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

// ADD THESE NEW IMPORTS:
import { CLAUDE_MODELS, DEFAULT_FEATURE_PLANNER_MODEL, FALLBACK_MODEL } from '@/lib/constants/claude-models';
import {
  BASE_SDK_OPTIONS,
  TEMPERATURE_CONFIG,
  THINKING_TOKEN_LIMITS,
  TURN_LIMITS,
} from '@/lib/constants/claude-sdk-config';

import type { FileDiscoveryResult, RefinementSettings } from '@/lib/db/schema/feature-planner.schema';
// ... rest of imports
```

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Imports added successfully
- [ ] No import errors
- [ ] TypeScript recognizes new types

---

### Step 4: Fix Feature Suggestion Agent - Apply SDK Options

**What:** Replace hardcoded model, add configuration options to executeFeatureSuggestionAgent
**Why:** Uses new constants, adds missing SDK features
**Confidence:** High

**Files to Modify:**
- `src/lib/services/feature-planner.service.ts` (Lines 376-384)

**Changes:**

**OLD CODE (Lines 376-384):**
```typescript
for await (const message of query({
  options: {
    allowedTools,
    maxTurns: agent ? 15 : 15, // ❌ Duplicate logic
    model: settings.customModel || 'claude-sonnet-4-5-20250929', // ❌ Hardcoded
    settingSources: ['project'],
  },
  prompt,
})) {
```

**NEW CODE:**
```typescript
const systemPrompt = agent?.systemPrompt ? {
  type: 'preset' as const,
  preset: 'claude_code' as const,
  append: agent.systemPrompt,
} : undefined;

for await (const message of query({
  options: {
    ...BASE_SDK_OPTIONS,
    allowedTools,
    maxTurns: TURN_LIMITS.FEATURE_SUGGESTION,
    maxThinkingTokens: THINKING_TOKEN_LIMITS.FEATURE_SUGGESTION,
    model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
    fallbackModel: FALLBACK_MODEL,
    systemPrompt,
    // Note: Temperature will be added when SDK supports it
    // temperature: agent?.temperature ?? TEMPERATURE_CONFIG.FEATURE_SUGGESTION,
  },
  prompt,
})) {
```

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Duplicate maxTurns logic removed
- [ ] Hardcoded model string replaced
- [ ] SDK options applied
- [ ] No TypeScript errors

---

### Step 5: Fix File Discovery Agent (Legacy) - Apply SDK Options

**What:** Update executeFileDiscoveryAgent with new configuration
**Why:** Consistency, performance optimization
**Confidence:** High

**Files to Modify:**
- `src/lib/services/feature-planner.service.ts` (Lines 510-518)

**Changes:**

**OLD CODE (Lines 510-518):**
```typescript
for await (const message of query({
  options: {
    allowedTools: ['Read', 'Grep', 'Glob'],
    maxTurns: 15,
    model: settings.customModel || 'claude-sonnet-4-5-20250929',
    settingSources: ['project'],
  },
  prompt,
})) {
```

**NEW CODE:**
```typescript
for await (const message of query({
  options: {
    ...BASE_SDK_OPTIONS,
    allowedTools: ['Read', 'Grep', 'Glob'],
    maxTurns: TURN_LIMITS.FILE_DISCOVERY_LEGACY,
    maxThinkingTokens: THINKING_TOKEN_LIMITS.FILE_DISCOVERY,
    model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
    fallbackModel: FALLBACK_MODEL,
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code',
    },
  },
  prompt,
})) {
```

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Configuration updated
- [ ] No TypeScript errors
- [ ] All new options applied

---

### Step 6: Fix Implementation Planning Agent - Apply SDK Options

**What:** Update executeImplementationPlanningAgent with new configuration
**Why:** Consistency, performance optimization
**Confidence:** High

**Files to Modify:**
- `src/lib/services/feature-planner.service.ts` (Lines 611-619)

**Changes:**

**OLD CODE (Lines 611-619):**
```typescript
for await (const message of query({
  options: {
    allowedTools: ['Read', 'Grep', 'Glob'],
    maxTurns: 15,
    model: settings.customModel || 'claude-sonnet-4-5-20250929',
    settingSources: ['project'],
  },
  prompt,
})) {
```

**NEW CODE:**
```typescript
for await (const message of query({
  options: {
    ...BASE_SDK_OPTIONS,
    allowedTools: ['Read', 'Grep', 'Glob'],
    maxTurns: TURN_LIMITS.IMPLEMENTATION_PLANNING,
    maxThinkingTokens: THINKING_TOKEN_LIMITS.IMPLEMENTATION_PLANNING,
    model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
    fallbackModel: FALLBACK_MODEL,
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code',
    },
  },
  prompt,
})) {
```

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Configuration updated
- [ ] No TypeScript errors
- [ ] All new options applied

---

### Step 7: Fix Refinement Agent - Apply SDK Options

**What:** Update executeRefinementAgent with new configuration
**Why:** Consistency, adds missing systemPrompt option
**Confidence:** High

**Files to Modify:**
- `src/lib/services/feature-planner.service.ts` (Lines 790-799)

**Changes:**

**OLD CODE (Lines 790-799):**
```typescript
for await (const message of query({
  options: {
    allowedTools,
    includePartialMessages: !!onPartialUpdate,
    maxTurns: 10,
    model: settings.customModel || 'claude-sonnet-4-5-20250929',
    settingSources: ['project'],
  },
  prompt,
})) {
```

**NEW CODE:**
```typescript
const systemPrompt = agent ? {
  type: 'preset' as const,
  preset: 'claude_code' as const,
  append: agent.systemPrompt,
} : {
  type: 'preset' as const,
  preset: 'claude_code' as const,
};

for await (const message of query({
  options: {
    ...BASE_SDK_OPTIONS,
    allowedTools,
    includePartialMessages: !!onPartialUpdate,
    maxTurns: TURN_LIMITS.REFINEMENT,
    maxThinkingTokens: THINKING_TOKEN_LIMITS.REFINEMENT,
    model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
    fallbackModel: FALLBACK_MODEL,
    systemPrompt,
    // Note: Temperature will be added when SDK supports it
    // temperature: agent?.temperature ?? TEMPERATURE_CONFIG.REFINEMENT,
  },
  prompt,
})) {
```

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Configuration updated
- [ ] systemPrompt properly configured
- [ ] No TypeScript errors

---

### Step 8: Fix Synthesis Agent - Apply SDK Options

**What:** Update executeSynthesisAgent with new configuration
**Why:** Consistency, performance optimization
**Confidence:** High

**Files to Modify:**
- `src/lib/services/feature-planner.service.ts` (Lines 940-948)

**Changes:**

**OLD CODE (Lines 940-948):**
```typescript
for await (const message of query({
  options: {
    allowedTools: [],
    maxTurns: 5,
    model: settings.customModel || 'claude-sonnet-4-5-20250929',
    settingSources: ['project'],
  },
  prompt,
})) {
```

**NEW CODE:**
```typescript
for await (const message of query({
  options: {
    ...BASE_SDK_OPTIONS,
    allowedTools: [],
    maxTurns: TURN_LIMITS.SYNTHESIS,
    maxThinkingTokens: THINKING_TOKEN_LIMITS.SYNTHESIS,
    model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
    fallbackModel: FALLBACK_MODEL,
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code',
    },
  },
  prompt,
})) {
```

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Configuration updated
- [ ] No TypeScript errors
- [ ] All new options applied

---

### Step 9: Fix Specialized File Discovery Agent - Apply SDK Options

**What:** Update executeSingleFileDiscoveryAgent with new configuration
**Why:** Consistency, performance optimization for parallel agents
**Confidence:** High

**Files to Modify:**
- `src/lib/services/feature-planner.service.ts` (Lines 1740-1748)

**Changes:**

**OLD CODE (Lines 1740-1748):**
```typescript
for await (const message of query({
  options: {
    allowedTools: ['Read', 'Grep', 'Glob'],
    maxTurns: 10,
    model: settings.customModel || 'claude-sonnet-4-5-20250929',
    settingSources: ['project'],
  },
  prompt,
})) {
```

**NEW CODE:**
```typescript
for await (const message of query({
  options: {
    ...BASE_SDK_OPTIONS,
    allowedTools: ['Read', 'Grep', 'Glob'],
    maxTurns: TURN_LIMITS.FILE_DISCOVERY_SPECIALIZED,
    maxThinkingTokens: THINKING_TOKEN_LIMITS.FILE_DISCOVERY,
    model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
    fallbackModel: FALLBACK_MODEL,
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code',
    },
  },
  prompt,
})) {
```

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Configuration updated
- [ ] Reduced maxTurns for specialized agents (10 → 6)
- [ ] No TypeScript errors

---

### Step 10: Fix Fragile Stream Event Parsing

**What:** Replace type assertion with proper SDK types
**Why:** Type safety, future-proof against SDK changes
**Confidence:** High

**Files to Modify:**
- `src/lib/services/feature-planner.service.ts` (Lines 802-819)

**Changes:**

**OLD CODE (Lines 802-819):**
```typescript
if (message.type === 'stream_event' && onPartialUpdate) {
  try {
    // Type assertion to access the stream event structure
    const streamEvent = message as unknown as {
      content?: Array<{ text?: string; type: string }>;
      delta?: { text?: string; type: string };
      type: 'stream_event';
    };

    // Handle content delta updates
    if (streamEvent.delta?.type === 'text_delta' && streamEvent.delta.text) {
      onPartialUpdate(streamEvent.delta.text);
    }
    // Handle full content updates
    else if (streamEvent.content?.[0]?.type === 'text' && streamEvent.content[0].text) {
      onPartialUpdate(streamEvent.content[0].text);
    }
  } catch (streamError) {
    console.error('[executeRefinementAgent] Error processing stream event:', streamError);
  }
}
```

**NEW CODE:**
```typescript
if (message.type === 'stream_event' && onPartialUpdate) {
  try {
    // Use SDK's built-in stream event structure
    // Access the event property which contains RawMessageStreamEvent
    const streamEvent = message.event;

    // Check for text delta events from streaming API
    if ('delta' in streamEvent && streamEvent.delta) {
      const delta = streamEvent.delta;
      if ('text' in delta && typeof delta.text === 'string') {
        onPartialUpdate(delta.text);
      }
    }
    // Check for content block events
    else if ('content_block' in streamEvent && streamEvent.content_block) {
      const block = streamEvent.content_block;
      if ('text' in block && typeof block.text === 'string') {
        onPartialUpdate(block.text);
      }
    }
  } catch (streamError) {
    console.error('[executeRefinementAgent] Error processing stream event:', streamError);
  }
}
```

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Type assertion removed
- [ ] Using SDK's event structure
- [ ] No TypeScript errors
- [ ] Stream parsing more robust

---

### Step 11: Add Temperature Configuration Support (Documentation)

**What:** Add comments explaining temperature support status
**Why:** Documents SDK limitation and future enhancement path
**Confidence:** High

**Files to Modify:**
- `src/lib/services/feature-planner.service.ts` (Multiple locations)

**Changes:**

Update comment at line 374-375:
```typescript
// Note: Temperature support is not yet available in the Claude SDK
// Will be added when SDK supports it: temperature: agent?.temperature
```

To:
```typescript
/**
 * Temperature Configuration (Future Enhancement)
 *
 * Temperature control is defined in TEMPERATURE_CONFIG constants but not yet
 * applied due to SDK API limitations. When the SDK adds temperature support:
 *
 * 1. Uncomment temperature option in query() calls
 * 2. Use: temperature: agent?.temperature ?? TEMPERATURE_CONFIG.FEATURE_SUGGESTION
 * 3. Verify temperature values are respected in API responses
 *
 * Tracking: See TEMPERATURE_CONFIG in src/lib/constants/claude-sdk-config.ts
 */
```

Add this comment block before each query() call where temperature would be used (but is commented out).

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Documentation added
- [ ] Clear path for future implementation
- [ ] No TypeScript errors

---

### Step 12: Consider Programmatic Agents Configuration (Optional)

**What:** Document how to use SDK's `agents` option for specialized file discovery
**Why:** Potential future optimization, better SDK integration
**Confidence:** Medium

**Note:** This is marked as optional because it requires refactoring the specialized agents architecture. Document the approach without implementing.

**Files to Create:**
- `docs/2025_10_14/proposals/programmatic-agents-refactoring.md`

**Changes:**

Create documentation file:
```markdown
# Programmatic Agents Configuration - Refactoring Proposal

## Current Approach

We manually build specialized agent prompts and execute them individually:
- 14 specialized agents defined in SPECIALIZED_AGENTS array
- Each agent has custom prompt building logic
- Parallel execution via Promise.all

## SDK Native Approach

The Claude SDK supports programmatic agent definitions via the `agents` option:

```typescript
const agents = {
  'database-schema-agent': {
    description: 'Database schemas, migrations, and ORM models',
    tools: ['Read', 'Glob', 'Grep'],
    prompt: 'System prompt for database agent...',
    model: 'inherit',
  },
  // ... 13 more agents
};

for await (const message of query({
  options: { agents },
  prompt: 'Analyze this feature request...',
})) {
  // SDK handles agent orchestration
}
```

## Benefits

1. **SDK Orchestration**: SDK handles agent selection and coordination
2. **Less Code**: Remove manual agent execution logic
3. **Better Caching**: SDK can optimize agent context caching
4. **Native Support**: Aligned with SDK design patterns

## Considerations

1. **Control Loss**: Less control over agent execution order
2. **Unknown Behavior**: How does SDK select which agents to use?
3. **Parallel Execution**: Does SDK run agents in parallel or sequentially?
4. **Response Format**: How are multi-agent responses aggregated?

## Recommendation

**Status:** Research Required

Before implementing:
1. Test SDK agent orchestration behavior
2. Verify parallel execution capabilities
3. Confirm response aggregation format
4. Ensure file discovery results meet requirements

**Timeline:** Future optimization (Phase 2)
```

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Documentation created
- [ ] Approach documented for future reference
- [ ] Considerations outlined

---

## Final Validation

After completing all steps, run comprehensive validation:

**Commands:**
```bash
# 1. Run linter and fix issues
npm run lint:fix

# 2. Run type checking
npm run typecheck

# 3. Run tests (if available)
npm run test

# 4. Build project to ensure no runtime issues
npm run build
```

**Success Criteria:**
- [ ] All linting issues resolved
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Project builds successfully
- [ ] No console errors in test runs

---

## Quality Gates

### Code Quality
- [ ] No hardcoded model strings remain
- [ ] All duplicate logic removed
- [ ] Type assertions replaced with proper types
- [ ] Constants used consistently across all agents

### Performance
- [ ] maxTurns reduced appropriately per operation
- [ ] maxThinkingTokens configured for all operations
- [ ] Base SDK options applied consistently

### Maintainability
- [ ] Constants centralized in dedicated files
- [ ] Configuration easily adjustable
- [ ] Temperature path documented for future
- [ ] Comments explain why certain options are disabled

---

## Rollback Plan

If issues arise after deployment:

1. **Immediate Rollback:**
   ```bash
   git revert HEAD
   npm run build
   ```

2. **Partial Rollback (per fix):**
   - Revert specific commits related to problematic changes
   - Test incrementally

3. **Configuration Rollback:**
   - Revert constant files if values cause issues
   - Keep structural improvements, adjust values only

---

## Post-Implementation Monitoring

### Metrics to Watch (First 24 Hours)

1. **Performance:**
   - Average execution time per operation type
   - Token usage (prompt + completion + thinking)
   - API error rates

2. **User Experience:**
   - Feature planner completion rates
   - User abandonment during long operations
   - Error reports from users

3. **Cost:**
   - Total token consumption
   - Cost per operation
   - Cache hit rates (if measurable)

### Success Indicators

- ✅ Execution times reduced by 10-20%
- ✅ Token usage within expected ranges
- ✅ No increase in error rates
- ✅ Improved code maintainability scores

---

## Notes

- This plan focuses on configuration and code quality improvements
- No business logic changes, reducing risk
- All changes are backwards compatible
- Temperature support documented for future implementation
- Programmatic agents marked as optional future enhancement

**Estimated Time per Step:**
- Steps 1-3: 30 minutes (setup)
- Steps 4-9: 2 hours (apply configurations)
- Step 10: 30 minutes (fix stream parsing)
- Steps 11-12: 30 minutes (documentation)
- Final validation: 30 minutes

**Total: 3.5-4 hours**
