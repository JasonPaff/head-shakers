# Feature Refinement Parallel Agent Implementation Analysis

**Date:** October 12, 2025
**Analyzed By:** Claude (Sonnet 4.5)
**Scope:** /feature-planner Step 1 - Parallel Feature Refinement

---

## Executive Summary

The current parallel refinement implementation executes 1-5 identical agents simultaneously using `Promise.all` with proper error handling and database persistence. However, **the agents are not truly specialized** - they all run the same prompt with identical settings, producing similar outputs. This limits the value of parallel execution compared to the sophisticated file discovery system which uses 14 specialized agents with distinct roles.

**Key Finding:** The current implementation achieves *parallel execution* but not *diversity*. All agents are functionally identical, just labeled differently ("agent-1", "agent-2", etc.).

---

## Current Architecture

### 1. UI Layer
**Files:**
- `src/app/(app)/feature-planner/page.tsx`
- `src/app/(app)/feature-planner/components/refinement-settings.tsx`
- `src/app/(app)/feature-planner/components/refinement-results.tsx`

**Capabilities:**
- Settings popover with agent count selector (1-5 agents)
- Output length controls (min/max word count)
- Project context toggle (includes CLAUDE.md and package.json)
- Custom model selection
- Tabbed results interface for comparing refinements
- Agent selection mechanism with visual indicators

### 2. Hook Layer
**File:** `src/app/(app)/feature-planner/hooks/use-refinement-flow.ts`

**Key Functions:**
```typescript
onRefineRequest()          // Single agent refinement
onParallelRefineRequest()  // Parallel multi-agent refinement
onSelectRefinement()       // User selection handler
```

**State Management:**
- `isRefining` - Loading state
- `allRefinements` - All refinement results
- `selectedRefinementId` - User's choice
- `refinedRequest` - Selected text
- `currentPlanId` - Plan tracking

**Flow:**
1. Validates input
2. Makes POST to `/api/feature-planner/refine`
3. Updates state with results
4. Handles errors gracefully
5. Shows success/failure toasts

### 3. API Layer
**File:** `src/app/api/feature-planner/refine/route.ts`

**Responsibilities:**
- Authentication check
- Input validation using Zod
- Plan creation (if new) or retrieval
- Delegates to facade layer
- Returns structured JSON response

### 4. Facade Layer
**File:** `src/lib/facades/feature-planner/feature-planner.facade.ts`

**Method:** `runParallelRefinementAsync`

**Execution Pattern:**
```typescript
// Line 480-489: Creates N promises
const refinementPromises = Array.from({ length: settings.agentCount }, (_, i) =>
  this.runSingleRefinementAsync(
    planId,
    plan.originalRequest,
    `agent-${i + 1}`,  // Only difference between agents!
    settings,
    userId,
    dbInstance,
  ),
);

const refinements = await Promise.all(refinementPromises);
```

**Per-Agent Execution (`runSingleRefinementAsync`):**
1. Creates database record (status: 'processing')
2. Calls service layer
3. Updates record with result or error
4. Returns `null` on failure (doesn't throw - allows other agents to continue)
5. Calculates metadata (word count, character count)

### 5. Service Layer
**File:** `src/lib/services/feature-planner.service.ts`

**Method:** `executeRefinementAgent` (Lines 530-623)

**Implementation Details:**
```typescript
// Circuit breaker with 12-minute timeout
const circuitBreaker = circuitBreakers.externalService('claude-agent-refinement', {
  timeoutMs: 620000,
});

// Retry logic with 2 attempts
await withServiceRetry(
  async () => { /* ... */ },
  'claude-agent',
  { maxAttempts: 2, operationName: 'feature-refinement' }
);

// SDK query configuration
for await (const message of query({
  options: {
    allowedTools: settings.includeProjectContext ? ['Read', 'Grep', 'Glob'] : [],
    maxTurns: 10,
    model: settings.customModel || 'claude-sonnet-4-5-20250929',
    settingSources: ['project'],
  },
  prompt,
}))
```

**Prompt Construction (Lines 815-837):**
```typescript
private static buildRefinementPrompt(
  originalRequest: string,
  settings: { includeProjectContext, maxOutputLength, minOutputLength }
): string {
  return `Refine this feature request into a clear, detailed description.

ORIGINAL REQUEST:
${originalRequest}

REQUIREMENTS:
- Output length: ${settings.minOutputLength}-${settings.maxOutputLength} words
- Single paragraph only (no headers, bullets, or sections)
- Preserve original scope (do not add features)
- Add essential technical context
${settings.includeProjectContext ? '- Include project context from CLAUDE.md and package.json' : '- Do not read project files'}

OUTPUT:
Provide only the refined paragraph, nothing else.`;
}
```

**Token Tracking:**
- Prompt tokens
- Completion tokens
- Cache creation tokens
- Cache read tokens
- Total tokens
- Execution time (ms)

---

## Critical Analysis

### What's Working Well ✅

1. **Robust Error Handling**
   - Failed agents don't crash the entire operation
   - Proper try-catch in `runSingleRefinementAsync`
   - Returns `null` instead of throwing
   - Failed refinements tracked in database with error messages

2. **Clean Architecture**
   - Clear separation of concerns (UI → Hook → API → Facade → Service)
   - Testable layers
   - Type-safe with TypeScript
   - Follows project conventions

3. **Database Persistence**
   - All refinement attempts saved
   - Complete audit trail
   - Token usage tracked
   - Execution metadata captured

4. **Circuit Breaker & Retry**
   - 12-minute timeout protection
   - 2 retry attempts per agent
   - Prevents cascading failures

5. **UI/UX**
   - Tabbed comparison interface
   - Clear visual indicators for selection
   - Loading states
   - Success/error feedback

### Critical Limitations ⚠️

#### 1. **No Agent Specialization (Biggest Issue)**

**Problem:** All agents are functionally identical. The only difference is the `agentId` label.

**Evidence:**
```typescript
// Facade layer - Line 480
const refinementPromises = Array.from({ length: settings.agentCount }, (_, i) =>
  this.runSingleRefinementAsync(
    planId,
    plan.originalRequest,
    `agent-${i + 1}`,      // ← ONLY DIFFERENCE
    settings,              // ← SAME SETTINGS
    userId,
    dbInstance,
  ),
);
```

All agents:
- Run the **same prompt**
- Use the **same model**
- Have the **same allowedTools**
- Use the **same temperature** (default)
- Process the **same input**

**Result:** Near-duplicate outputs with minor wording variations.

#### 2. **No Diversity Mechanisms**

**Comparison with File Discovery:**

| Feature | File Discovery | Feature Refinement |
|---------|---------------|-------------------|
| Agent Count | 14 specialized | 1-5 identical |
| Specialization | Unique search paths per agent | None |
| Agent Roles | database, UI, API, hooks, types, etc. | Generic "agent-1", "agent-2" |
| Output Format | Structured JSON with validation | Plain text |
| Retry Logic | Format correction on failure | Generic retry |
| Aggregation | Deduplication + score-based merge | Side-by-side display only |

**Missing Diversity Techniques:**
- ❌ No temperature variations
- ❌ No role-based prompts
- ❌ No perspective variations (e.g., security vs UX focus)
- ❌ No instruction style variations
- ❌ No structured output formats
- ❌ No parameter sweeps

#### 3. **Simple Prompt Design**

**Current Prompt:**
- Single paragraph format
- Basic requirements list
- No chain-of-thought reasoning
- No self-critique
- No structured output
- No confidence scoring

**Advanced Techniques Not Used:**
- Chain of thought ("think step by step")
- Multi-step reasoning
- Self-evaluation
- Structured output with JSON schema
- Few-shot examples
- Role-based framing

#### 4. **No Result Aggregation**

**Current Behavior:**
- Results displayed in tabs
- User manually compares
- User manually selects one
- No "best of N" selection
- No consensus building
- No intelligent merging

**Opportunities:**
- Meta-agent to synthesize best aspects
- Automated quality scoring
- Confidence-weighted combination
- Debate/critique pattern

#### 5. **Limited SDK Feature Usage**

**From Claude SDK Docs - Unused Features:**

```typescript
// Available but NOT USED:
interface Options {
  agents?: Record<string, AgentDefinition>;  // ← Programmatic subagents!
  maxThinkingTokens?: number;                // ← Extended reasoning
  includePartialMessages?: boolean;          // ← Streaming updates
  hooks?: Record<HookEvent, HookCallback[]>; // ← Lifecycle hooks
}

type AgentDefinition = {
  description: string;
  tools?: string[];
  prompt: string;
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
};
```

**Example of What's Possible:**
```typescript
// This is NOT in the current code but COULD BE:
const result = query({
  options: {
    agents: {
      'technical-expert': {
        description: 'Technical architecture and implementation focus',
        prompt: 'You are a senior software architect. Focus on technical feasibility...',
        model: 'opus',
        tools: ['Read', 'Grep', 'Glob']
      },
      'product-manager': {
        description: 'User experience and business value focus',
        prompt: 'You are a product manager. Focus on user value and requirements...',
        model: 'sonnet',
        tools: []
      },
      'security-expert': {
        description: 'Security and compliance focus',
        prompt: 'You are a security engineer. Focus on threats and mitigation...',
        model: 'sonnet',
        tools: ['Read']
      }
    },
    maxThinkingTokens: 5000,        // Enable extended reasoning
    includePartialMessages: true    // Stream results as they arrive
  },
  prompt: originalRequest
});
```

---

## Comparison: File Discovery vs Feature Refinement

### File Discovery Architecture (Step 2)
```typescript
// Service layer defines 14 specialized agents
private static readonly SPECIALIZED_AGENTS: Array<SpecializedAgent> = [
  {
    agentId: 'database-schema-agent',
    name: 'Database Schema Agent',
    description: 'Database schemas, migrations, and ORM models',
    searchPaths: ['src/lib/db/schema/', 'src/lib/db/migrations/']
  },
  {
    agentId: 'server-actions-agent',
    name: 'Server Actions Agent',
    description: 'Server-side actions and mutations',
    searchPaths: ['src/lib/actions/']
  },
  // ... 12 more specialized agents
];

// Each agent gets a UNIQUE prompt based on its role
private static buildSpecializedAgentPrompt(
  refinedRequest: string,
  agent: SpecializedAgent
): string {
  return `You are the ${agent.name}. Find relevant files in: ${agent.searchPaths.join(', ')}

  <feature_request>${refinedRequest}</feature_request>

  <search_paths>${agent.searchPaths.join(', ')}</search_paths>
  // ... specialized instructions ...
  `;
}
```

**Result:** Each agent has a clear role, distinct search space, and specialized instructions.

### Feature Refinement Architecture (Step 1)
```typescript
// Facade creates N identical agents
const refinementPromises = Array.from({ length: settings.agentCount }, (_, i) =>
  this.runSingleRefinementAsync(
    planId,
    plan.originalRequest,
    `agent-${i + 1}`,   // ← Only difference
    settings,           // ← Same for all
    userId,
    dbInstance,
  ),
);

// ALL agents get the SAME prompt
private static buildRefinementPrompt(
  originalRequest: string,
  settings: { includeProjectContext, maxOutputLength, minOutputLength }
): string {
  // Single generic prompt for all agents
  return `Refine this feature request into a clear, detailed description.`;
}
```

**Result:** Agents are parallel but not specialized - they're clones running identical tasks.

---

## Token Usage & Performance

### Current Metrics (from CLAUDE.md)
- Step 1 (Refinement): Working well, low token usage
- Step 2 (File Discovery): 10K+ tokens (99.5% completion tokens)

### Refinement Token Breakdown
```typescript
// Service tracks:
tokenUsage: {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
}
```

**Current Cost Pattern:**
- 3 agents × ~1K tokens each = ~3K tokens per refinement
- Relatively efficient due to:
  - Simple prompt
  - Short outputs (150-250 words)
  - Prompt caching enabled (settingSources: ['project'])

**Cost vs Value Trade-off:**
- ✅ Parallel execution is fast (all agents run simultaneously)
- ❌ Similar outputs reduce value
- ❌ User still has to manually compare/select

---

## Improvement Opportunities

### 1. Agent Specialization via Roles

**Implement role-based refinement agents:**

```typescript
interface RefinementAgent {
  agentId: string;
  name: string;
  role: string;
  focus: string;
  prompt: string;
  temperature?: number;
  model?: string;
  tools?: string[];
}

const REFINEMENT_AGENTS: RefinementAgent[] = [
  {
    agentId: 'technical-architect',
    name: 'Technical Architecture Agent',
    role: 'Senior Software Architect',
    focus: 'Technical feasibility, system design, implementation patterns',
    temperature: 0.7,  // More focused
    tools: ['Read', 'Grep', 'Glob'],
    prompt: `You are a senior software architect. Refine this feature request focusing on:
- Technical implementation details
- System architecture implications
- Integration points with existing codebase
- Performance and scalability considerations`
  },
  {
    agentId: 'product-manager',
    name: 'Product Management Agent',
    role: 'Senior Product Manager',
    focus: 'User value, requirements clarity, acceptance criteria',
    temperature: 1.0,  // Balanced
    tools: [],  // No code access needed
    prompt: `You are a senior product manager. Refine this feature request focusing on:
- User value and business impact
- Clear functional requirements
- Acceptance criteria
- Edge cases and error scenarios`
  },
  {
    agentId: 'ux-designer',
    name: 'UX Design Agent',
    role: 'Senior UX Designer',
    focus: 'User experience, interactions, accessibility',
    temperature: 1.2,  // More creative
    tools: ['Read'],  // Can check UI patterns
    prompt: `You are a senior UX designer. Refine this feature request focusing on:
- User interactions and workflows
- UI/UX patterns and conventions
- Accessibility requirements (ARIA, keyboard navigation)
- Responsive design considerations`
  },
  {
    agentId: 'security-engineer',
    name: 'Security Agent',
    role: 'Security Engineer',
    focus: 'Security, authentication, data protection',
    temperature: 0.5,  // Very focused
    tools: ['Read', 'Grep'],
    prompt: `You are a security engineer. Refine this feature request focusing on:
- Security implications and threats
- Authentication and authorization requirements
- Data protection and privacy concerns
- Input validation and sanitization needs`
  },
  {
    agentId: 'test-engineer',
    name: 'Testing & Quality Agent',
    role: 'Senior Test Engineer',
    focus: 'Testability, quality assurance, edge cases',
    temperature: 0.8,
    tools: ['Read'],
    prompt: `You are a test engineer. Refine this feature request focusing on:
- Testability and test coverage
- Edge cases and error conditions
- Quality gates and acceptance criteria
- Integration and E2E test scenarios`
  }
];
```

**Benefits:**
- Each agent provides a unique perspective
- Diverse outputs with different technical focuses
- User can select based on project priorities
- Or combine insights from multiple agents

### 2. Structured Output Format

**Enforce JSON schema for consistent parsing:**

```typescript
interface RefinementOutput {
  refinedRequest: string;
  focus: string;
  confidence: 'high' | 'medium' | 'low';
  technicalComplexity: 'high' | 'medium' | 'low';
  keyRequirements: string[];
  assumptions: string[];
  risks: string[];
  estimatedScope: 'small' | 'medium' | 'large';
}
```

**Prompt Format:**
```typescript
const prompt = `${rolePrompt}

ORIGINAL REQUEST:
${originalRequest}

OUTPUT FORMAT (JSON only):
\`\`\`json
{
  "refinedRequest": "Clear, detailed description (${minWords}-${maxWords} words)",
  "focus": "Primary focus area of this refinement",
  "confidence": "high|medium|low",
  "technicalComplexity": "high|medium|low",
  "keyRequirements": ["requirement 1", "requirement 2"],
  "assumptions": ["assumption 1"],
  "risks": ["risk 1"],
  "estimatedScope": "small|medium|large"
}
\`\`\``;
```

**Benefits:**
- Consistent parsing
- Rich metadata for UI
- Enables automated quality scoring
- Facilitates result aggregation

### 3. Result Aggregation Agent

**Add a meta-agent to synthesize results:**

```typescript
async function synthesizeRefinements(
  originalRequest: string,
  refinements: RefinementOutput[]
): Promise<RefinementOutput> {
  const prompt = `You are a senior technical lead. Multiple expert agents have refined a feature request from different perspectives.

ORIGINAL REQUEST:
${originalRequest}

AGENT REFINEMENTS:
${refinements.map((r, i) => `
${i + 1}. ${r.focus} Perspective (Confidence: ${r.confidence})
${r.refinedRequest}

Key Requirements: ${r.keyRequirements.join(', ')}
Risks: ${r.risks.join(', ')}
`).join('\n\n')}

TASK:
Synthesize these perspectives into a single comprehensive refinement that:
1. Combines the best insights from all agents
2. Resolves any contradictions
3. Creates a complete, actionable feature specification
4. Maintains the original scope

OUTPUT: Same JSON format as individual agents.`;

  // Execute synthesis agent
  const result = await query({ prompt, options: { ... } });
  return parseJsonResponse(result);
}
```

**Benefits:**
- Best-of-all-worlds refinement
- Reduces user decision burden
- Captures cross-functional insights
- Can still show individual agent outputs

### 4. Progressive Refinement Pipeline

**Multi-stage refinement with iteration:**

```typescript
async function progressiveRefinement(
  originalRequest: string,
  settings: RefinementSettings
): Promise<ProgressiveRefinementResult> {
  // Stage 1: Quick parallel refinements (5 agents, short output)
  const stage1 = await runParallelRefinements(originalRequest, {
    ...settings,
    agentCount: 5,
    maxOutputLength: 150  // Quick iterations
  });

  // Stage 2: User or auto-select best 2-3
  const selected = await selectTopRefinements(stage1, 3);

  // Stage 3: Deep refinement of selected candidates
  const stage2 = await Promise.all(
    selected.map(refinement =>
      deepRefineWithCritique(refinement, {
        maxOutputLength: 350,  // More detailed
        maxThinkingTokens: 5000,  // Enable reasoning
        includeProjectContext: true
      })
    )
  );

  // Stage 4: Final synthesis
  const final = await synthesizeRefinements(originalRequest, stage2);

  return { stage1, stage2, final };
}
```

**Benefits:**
- Iterative improvement
- Balances breadth and depth
- Can show progressive evolution
- Higher quality final output

### 5. Streaming UI Updates

**Use SDK streaming capabilities:**

```typescript
// Service layer
async function executeRefinementAgentStreaming(
  originalRequest: string,
  settings: RefinementSettings,
  onUpdate: (agentId: string, partialText: string) => void
): Promise<AgentExecutionResult<string>> {
  for await (const message of query({
    options: {
      ...options,
      includePartialMessages: true  // ← Enable streaming
    },
    prompt
  })) {
    if (message.type === 'stream_event') {
      // Send partial updates to UI
      onUpdate(agentId, extractPartialText(message));
    }

    if (message.type === 'assistant') {
      // Final result
      return message;
    }
  }
}
```

**UI Benefits:**
- Real-time progress
- User sees refinements as they generate
- Reduced perceived latency
- Can cancel slow agents early

### 6. Temperature & Model Variations

**Diversify via SDK parameters:**

```typescript
const AGENT_VARIATIONS = [
  {
    agentId: 'focused-agent-1',
    temperature: 0.5,  // Very focused
    model: 'claude-sonnet-4-5-20250929'
  },
  {
    agentId: 'balanced-agent-1',
    temperature: 1.0,  // Balanced
    model: 'claude-sonnet-4-5-20250929'
  },
  {
    agentId: 'creative-agent-1',
    temperature: 1.3,  // More creative
    model: 'claude-opus-4-5-20250929'  // More powerful model
  },
  {
    agentId: 'reasoning-agent-1',
    temperature: 0.8,
    model: 'claude-sonnet-4-5-20250929',
    maxThinkingTokens: 10000  // Extended reasoning
  },
  {
    agentId: 'concise-agent-1',
    temperature: 0.6,
    model: 'claude-haiku-4-20250929',  // Faster, more concise
    maxOutputLength: 150
  }
];
```

**Benefits:**
- Output diversity from same prompt
- Different quality/cost trade-offs
- Can A/B test approaches
- User can choose style preference

### 7. Debate & Critique Pattern

**Agents critique each other's work:**

```typescript
async function debateRefinement(
  originalRequest: string,
  settings: RefinementSettings
): Promise<DebateResult> {
  // Round 1: Initial refinements
  const round1 = await runParallelRefinements(originalRequest, settings);

  // Round 2: Each agent critiques others
  const critiques = await Promise.all(
    round1.map(async (refinement, i) => {
      const othersRefinements = round1.filter((_, j) => j !== i);

      return await query({
        prompt: `You are ${AGENTS[i].name}. Review these alternative refinements and identify:
1. What they got right that you missed
2. What they got wrong that you got right
3. How to improve your original refinement

YOUR REFINEMENT:
${refinement.refinedRequest}

OTHERS' REFINEMENTS:
${othersRefinements.map(r => r.refinedRequest).join('\n\n')}

OUTPUT: Improved version incorporating the best insights.`,
        options: { ... }
      });
    })
  );

  // Round 3: Final synthesis
  const consensus = await synthesizeRefinements(originalRequest, critiques);

  return { round1, critiques, consensus };
}
```

**Benefits:**
- Self-improving system
- Captures overlooked aspects
- Builds consensus
- Higher quality output

---

## Recommended Implementation Priorities

### Phase 1: Quick Wins (1-2 days)
1. **Add 5 specialized role-based agents**
   - Technical, Product, UX, Security, Testing
   - Unique prompts per role
   - Temperature variations

2. **Implement structured JSON output**
   - Consistent parsing
   - Rich metadata
   - Quality scoring

3. **UI improvements**
   - Show agent roles/focus in tabs
   - Display confidence and complexity
   - Better comparison view

### Phase 2: Advanced Features (3-5 days)
1. **Result aggregation agent**
   - Synthesize best aspects
   - Automated quality ranking
   - Consensus building

2. **Streaming UI**
   - Real-time updates
   - Cancel slow agents
   - Progress indicators

3. **Progressive refinement**
   - Multi-stage pipeline
   - Iterative improvement
   - Quality gates

### Phase 3: Experimental (5-7 days)
1. **Debate pattern**
   - Agent critique rounds
   - Self-improvement
   - Consensus building

2. **Advanced SDK features**
   - Programmatic subagents
   - Extended reasoning (maxThinkingTokens)
   - Lifecycle hooks

3. **ML-based optimization**
   - Learn from user selections
   - Auto-tune parameters
   - Predict best agent for request type

---

## Code Examples

### Current Implementation
```typescript
// src/lib/facades/feature-planner/feature-planner.facade.ts:480-489
const refinementPromises = Array.from({ length: settings.agentCount }, (_, i) =>
  this.runSingleRefinementAsync(
    planId,
    plan.originalRequest,
    `agent-${i + 1}`,        // ← Generic label
    settings,                // ← Same settings
    userId,
    dbInstance,
  ),
);
```

### Proposed Implementation (Phase 1)
```typescript
// New: src/lib/services/feature-planner-agents.ts
export const REFINEMENT_AGENTS = [
  {
    agentId: 'technical-architect',
    name: 'Technical Architect',
    role: 'Senior Software Architect',
    temperature: 0.7,
    tools: ['Read', 'Grep', 'Glob'],
    systemPrompt: 'You are a senior software architect...'
  },
  // ... 4 more specialized agents
];

// Modified facade
const refinementPromises = REFINEMENT_AGENTS
  .slice(0, settings.agentCount)  // Use N agents based on settings
  .map(agent =>
    this.runSingleRefinementAsync(
      planId,
      plan.originalRequest,
      agent,                  // ← Pass full agent config
      settings,
      userId,
      dbInstance,
    ),
  );
```

### Proposed Service Layer (Phase 1)
```typescript
// Modified: executeRefinementAgent
static async executeRefinementAgent(
  originalRequest: string,
  agent: RefinementAgent,  // ← New parameter
  settings: RefinementSettings,
): Promise<AgentExecutionResult<RefinementOutput>> {

  const prompt = this.buildRoleBasedPrompt(originalRequest, agent, settings);

  for await (const message of query({
    options: {
      allowedTools: agent.tools || [],
      maxTurns: 10,
      model: agent.model || settings.customModel || 'claude-sonnet-4-5-20250929',
      settingSources: ['project'],
      // NEW: Pass temperature
      temperature: agent.temperature || 1.0,
    },
    prompt,
  })) {
    // Parse structured JSON output
    const result = parseRefinementOutput(message);
    return result;
  }
}
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('FeaturePlannerService', () => {
  describe('executeRefinementAgent', () => {
    it('should use agent-specific temperature', async () => {
      const agent = { temperature: 0.5, ... };
      await service.executeRefinementAgent(request, agent, settings);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({ temperature: 0.5 })
        })
      );
    });

    it('should use agent-specific tools', async () => {
      const agent = { tools: ['Read', 'Glob'], ... };
      await service.executeRefinementAgent(request, agent, settings);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({ allowedTools: ['Read', 'Glob'] })
        })
      );
    });
  });
});
```

### Integration Tests
```typescript
describe('Parallel Refinement Integration', () => {
  it('should generate diverse refinements from specialized agents', async () => {
    const result = await facade.runParallelRefinementAsync(
      planId,
      userId,
      { agentCount: 5, ... }
    );

    const refinements = result.filter(r => r.status === 'completed');

    // Check diversity
    const focuses = refinements.map(r => r.focus);
    expect(new Set(focuses).size).toBeGreaterThan(3);

    // Check role coverage
    expect(focuses).toContain('Technical feasibility');
    expect(focuses).toContain('User experience');
    expect(focuses).toContain('Security');
  });
});
```

---

## Performance Considerations

### Current Performance
- ✅ Parallel execution (all agents start simultaneously)
- ✅ Fast overall (N agents ≈ time of 1 agent)
- ⚠️ Token usage scales linearly with agent count
- ⚠️ Cost increases with specialized agents (more context)

### Optimization Strategies
1. **Prompt Caching** (already enabled)
   - `settingSources: ['project']` enables caching
   - Reduces prompt tokens on repeated requests

2. **Agent Selection Based on Request**
   - Auto-detect request type (UI, API, database, etc.)
   - Only run relevant agents
   - Reduce unnecessary executions

3. **Tiered Execution**
   - Always run 2-3 core agents
   - Optionally run specialized agents
   - User chooses breadth vs cost

4. **Result Caching**
   - Cache refinements by originalRequest hash
   - Show cached results instantly
   - Offer "regenerate" option

---

## Migration Path

### Step 1: Add Agent Definitions (No Breaking Changes)
```typescript
// New file: src/lib/config/refinement-agents.ts
export const REFINEMENT_AGENTS = [...];
```

### Step 2: Update Service Layer (Backward Compatible)
```typescript
// Overload executeRefinementAgent
static async executeRefinementAgent(
  originalRequest: string,
  settingsOrAgent: RefinementSettings | RefinementAgent,
): Promise<...> {
  // Support both old and new signatures
  const agent = isAgent(settingsOrAgent) ? settingsOrAgent : DEFAULT_AGENT;
  // ...
}
```

### Step 3: Update Facade (Backward Compatible)
```typescript
static async runParallelRefinementAsync(...) {
  // Use REFINEMENT_AGENTS if available, fallback to old behavior
  const agents = REFINEMENT_AGENTS.slice(0, settings.agentCount);
  // ...
}
```

### Step 4: Update UI (Additive)
```typescript
// Show agent role in tabs
<TabsTrigger>
  {refinement.agentRole || refinement.agentId}
  {/* New badge for role/focus */}
  <Badge>{refinement.focus}</Badge>
</TabsTrigger>
```

### Step 5: Database Migration (Non-Breaking)
```sql
-- Add new columns to feature_refinements table
ALTER TABLE feature_refinements
ADD COLUMN agent_role TEXT,
ADD COLUMN agent_focus TEXT,
ADD COLUMN refinement_metadata JSONB;
```

---

## Conclusion

The current parallel refinement implementation is **architecturally sound** with proper error handling, database persistence, and clean separation of concerns. However, it achieves *parallel execution* without *diversity*.

**The Key Gap:** All agents run the same prompt with the same settings, producing similar outputs. This contrasts sharply with the sophisticated file discovery system, which uses 14 specialized agents with distinct roles.

**The Opportunity:** By implementing role-based agent specialization, structured outputs, and result aggregation, we can transform the refinement step from "run N identical agents" to "gather N expert perspectives" - dramatically increasing the value of parallel execution.

**Recommended Next Step:** Implement Phase 1 (specialized role-based agents with structured output) as a proof of concept. This requires minimal changes to existing code and delivers immediate value by providing genuinely diverse refinement perspectives.

---

## References

**Files Analyzed:**
- `src/app/(app)/feature-planner/page.tsx` - Main page component
- `src/app/(app)/feature-planner/hooks/use-refinement-flow.ts` - React hook layer
- `src/app/(app)/feature-planner/components/refinement-settings.tsx` - Settings UI
- `src/app/(app)/feature-planner/components/refinement-results.tsx` - Results UI
- `src/app/api/feature-planner/refine/route.ts` - API endpoint
- `src/lib/facades/feature-planner/feature-planner.facade.ts` - Business logic
- `src/lib/services/feature-planner.service.ts` - Claude SDK integration
- `docs/claude-typescript-sdk.md` - SDK documentation

**Key SDK Features Referenced:**
- `query()` function (Lines 17-38)
- `Options` interface (Lines 84-118)
- `AgentDefinition` type (Lines 137-156)
- Streaming with `includePartialMessages` (Line 105)
- Extended reasoning with `maxThinkingTokens` (Line 106)
- Programmatic subagents via `agents` option (Line 92)
