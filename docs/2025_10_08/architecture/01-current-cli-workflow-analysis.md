# Current CLI Workflow Analysis

**Date:** 2025-10-08
**Purpose:** Document the existing `/plan-feature` CLI workflow to inform web-based implementation

## Overview

The `/plan-feature` slash command orchestrates a 3-step workflow that transforms a simple feature request into a detailed implementation plan. This document analyzes the current CLI implementation to guide the migration to a web-based UI.

## Current Architecture

### Workflow Steps

#### Step 1: Feature Request Refinement
**Location:** `.claude/agents/initial-feature-refinement.md`

**Process:**
1. Takes user's original feature request
2. Reads `CLAUDE.md` and `package.json` for project context
3. Invokes `initial-feature-refinement` subagent via Task tool
4. Subagent outputs a single refined paragraph (150-300 words)
5. Saves log to `docs/{YYYY_MM_DD}/orchestration/{feature-name}/01-feature-refinement.md`

**Input:**
- Original feature request (user-provided)
- Project context (CLAUDE.md, package.json)

**Output:**
- Single paragraph refined request (2-3x original length)
- Execution metadata (timestamps, duration, validation results)

**Critical Requirements:**
- Output MUST be single paragraph (no headers/bullets/sections)
- Length: 150-300 words, 2-3x original (not 10x+)
- Preserve original scope (no feature creep)
- Add only essential technical context

#### Step 2: File Discovery
**Location:** `.claude/agents/file-discovery-agent.md`

**Process:**
1. Takes refined request from Step 1
2. Uses AI to intelligently discover relevant files
3. Analyzes codebase structure and content
4. Categorizes files by priority (High/Medium/Low)
5. Saves log to `docs/{YYYY_MM_DD}/orchestration/{feature-name}/02-file-discovery.md`

**Input:**
- Refined feature request (from Step 1)
- Project structure access

**Output:**
- Discovered files list with categorization
- File relevance descriptions
- Architecture insights
- Minimum 5 relevant files required

**Capabilities:**
- Pattern-based searches
- Content analysis (reads files for validation)
- Integration point identification
- Priority categorization

#### Step 3: Implementation Planning
**Location:** `.claude/agents/implementation-planner.md`

**Process:**
1. Takes refined request and discovered files
2. Invokes `implementation-planner` subagent
3. Generates structured markdown implementation plan
4. Validates plan format and content
5. Saves to `docs/{YYYY_MM_DD}/plans/{feature-name}-implementation-plan.md`

**Input:**
- Refined feature request (from Step 1)
- Discovered files analysis (from Step 2)
- Project context

**Output:**
- Markdown implementation plan with sections:
  - Overview (duration, complexity, risk)
  - Quick Summary
  - Prerequisites
  - Implementation Steps (with validation commands)
  - Quality Gates
  - Notes

**Critical Requirements:**
- MUST be markdown format (not XML)
- Every code step includes `npm run lint:fix && npm run typecheck`
- No code examples in plan (instructions only)
- Confidence levels for each step

### Data Flow

```
User Input (Feature Request)
    ↓
Step 1: Refinement Agent
    → Reads: CLAUDE.md, package.json
    → Outputs: Refined paragraph + log
    ↓
Step 2: File Discovery Agent
    → Reads: Refined request, codebase
    → Outputs: File list + analysis + log
    ↓
Step 3: Implementation Planner Agent
    → Reads: Refined request, discovered files
    → Outputs: Implementation plan + log
    ↓
Final Output: Implementation plan + 3 orchestration logs
```

### Orchestration Logging

**Directory Structure:**
```
docs/{YYYY_MM_DD}/
├── orchestration/{feature-name}/
│   ├── 00-orchestration-index.md
│   ├── 01-feature-refinement.md
│   ├── 02-file-discovery.md
│   └── 03-implementation-planning.md
└── plans/
    └── {feature-name}-implementation-plan.md
```

**Log Contents:**
- Complete agent prompts (input)
- Full agent responses (output)
- Execution metadata (timestamps, duration, status)
- Validation results and warnings
- Error handling and retry information

## Key Capabilities

### 1. Agent Invocation via Task Tool
The CLI uses the `Task` tool to invoke custom subagents:

```typescript
// Conceptual - actual implementation is in slash command markdown
Task({
  description: "Refine feature request",
  prompt: "Refine this request: {feature request}",
  subagent_type: "initial-feature-refinement"
})
```

### 2. Filesystem-Based Agent Configuration
Agents are defined in `.claude/agents/*.md` files with YAML frontmatter:

```yaml
---
name: initial-feature-refinement
description: Use PROACTIVELY to refine user feature requests
model: sonnet
color: blue
---
Agent system prompt here...
```

### 3. Error Handling & Validation
- Retry strategies (max 2 attempts with exponential backoff)
- Output format validation
- Automatic conversion (XML → Markdown if needed)
- Fallback strategies for failures
- Complete error logging

### 4. Quality Gates
- **Step 1:** Length checks, format validation, scope preservation
- **Step 2:** Minimum file count, content validation, path verification
- **Step 3:** Template compliance, validation command presence, no code examples

## CLI Limitations (Why Web UI is Needed)

### 1. Limited User Control
- Cannot adjust settings between steps
- No way to modify refined request before Step 2
- Cannot select specific discovered files
- No ability to customize agent parameters

### 2. No Persistence
- Results saved to markdown files only
- No database storage
- Cannot easily retrieve past plans
- No version control of iterations

### 3. Sequential-Only Execution
- Cannot parallelize refinement attempts
- Cannot compare multiple agent outputs
- No A/B testing of approaches

### 4. Poor Visibility
- Must read markdown logs to see progress
- No real-time status updates
- Limited error feedback to user

### 5. No Iteration Support
- Cannot refine and re-run specific steps
- Must start over if something fails
- No ability to save partial progress

## Insights for Web Implementation

### What Works Well (Keep)
1. **3-step workflow structure** - Clear separation of concerns
2. **Agent specialization** - Each agent has focused responsibility
3. **Comprehensive logging** - Complete audit trail of execution
4. **Quality validation** - Built-in checks at each step
5. **File discovery intelligence** - AI-powered relevance detection

### What to Improve (Web UI Advantages)
1. **Settings customization** - UI controls for agent parameters
2. **Step control** - Ability to pause/modify/resume between steps
3. **Parallel execution** - Run multiple refinement agents simultaneously
4. **Result comparison** - Side-by-side view of different approaches
5. **Database persistence** - Store all execution data for retrieval
6. **Real-time feedback** - Progress indicators and streaming results
7. **Iterative refinement** - Modify and re-run individual steps
8. **File selection** - User can choose from discovered files or add more
9. **Plan editing** - Modify implementation plan before saving

## Technical Considerations

### Agent Invocation Methods

The CLI uses **slash commands** to invoke agents:
```
/plan-feature "feature description"
```

For web implementation, we have two options:

#### Option 1: Invoke Slash Command via SDK
```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const message of query({
  prompt: "/plan-feature Add user authentication",
  options: { /* ... */ }
})) {
  // Process results
}
```

**Pros:** Reuses existing command logic
**Cons:** Less control over individual steps

#### Option 2: Programmatically Invoke Agents Directly
```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

// Define agents programmatically
const result = query({
  prompt: "Refine this feature request: ...",
  options: {
    agents: {
      'initial-feature-refinement': {
        description: '...',
        prompt: '... agent system prompt ...',
        tools: ['Read', 'Grep', 'Glob'],
        model: 'sonnet'
      }
    }
  }
});
```

**Pros:** Granular control, can customize per execution
**Cons:** Must replicate agent definitions from markdown

#### Option 3: Hybrid Approach (Recommended)
- Use filesystem agents for stable definitions
- Load with `settingSources: ['project']`
- Invoke via Task tool with custom prompts
- Gives us reusability + control

### SDK Modes for Web Implementation

**Single Message Input (Current API Route Pattern):**
```typescript
// API Route: /api/feature-planner/refine
for await (const message of query({
  prompt: "Refine this request: ...",
  options: {
    maxTurns: 1,
    settingSources: ['project'],
    agents: { /* loaded from .claude/agents */ }
  }
})) {
  // Return result
}
```

**Streaming Input (For Real-time UI):**
```typescript
// For interactive UI with real-time updates
async function* generateMessages() {
  yield { type: 'user', message: { role: 'user', content: refinementPrompt } };
  // Can send follow-up messages based on UI interactions
}

for await (const message of query({
  prompt: generateMessages(),
  options: { maxTurns: 10 }
})) {
  // Stream results to UI in real-time
}
```

## Recommendations

### Phase 1: Basic Web Migration
1. Create API routes for each step (refine, discover, plan)
2. Use single message input mode for simplicity
3. Store results in database
4. Provide basic UI for input and viewing results

### Phase 2: Enhanced Control
1. Add settings customization UI
2. Implement step-by-step workflow with pauses
3. Allow editing of outputs between steps
4. Add file selection interface

### Phase 3: Advanced Features
1. Implement parallel refinement (multiple agents)
2. Add streaming for real-time progress
3. Support plan iteration and versioning
4. Build comparison views for different approaches

## Next Steps

1. ✅ Analyze current CLI implementation
2. ⏳ Design database schema for persistence
3. ⏳ Create architecture plan for web implementation
4. Design API routes and service layer
5. Build UI components for workflow
6. Implement SDK integration
7. Add real-time streaming support
