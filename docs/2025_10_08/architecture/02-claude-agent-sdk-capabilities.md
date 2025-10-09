# Claude Agent SDK Capabilities & Integration Guide

**Date:** 2025-10-08
**SDK Version:** @anthropic-ai/claude-agent-sdk ^0.1.11
**Purpose:** Document SDK capabilities for feature planner web implementation

## SDK Overview

The Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) is already installed in the project and provides programmatic access to Claude Code's agent orchestration capabilities. It's built on top of the same agent harness that powers Claude Code CLI.

## Core Capabilities

### 1. Query Function - Main Entry Point

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

const result = query({
  prompt: string | AsyncGenerator<UserMessage>,
  options?: Options
});

for await (const message of result) {
  // Process SDKMessage events
}
```

### 2. Input Modes

#### Single Message Input (Stateless)
**Best for:** API routes, one-off queries, serverless functions

```typescript
// Simple one-shot query
for await (const message of query({
  prompt: "Refine this feature request: Add user auth",
  options: {
    maxTurns: 1,
    allowedTools: ['Read', 'Grep', 'Glob']
  }
})) {
  if (message.type === 'result') {
    return message.result;
  }
}
```

**Advantages for Feature Planner:**
- Simple to implement in Next.js API routes
- Predictable execution (controlled turns)
- Easy error handling
- Works well with `continue: true` for multi-step workflows

#### Streaming Input (Interactive)
**Best for:** Real-time UIs, interactive sessions, complex workflows

```typescript
async function* generateMessages() {
  yield {
    type: 'user' as const,
    message: {
      role: 'user' as const,
      content: "Start refinement"
    }
  };

  // Can dynamically add messages based on conditions
  await someCondition();

  yield {
    type: 'user' as const,
    message: {
      role: 'user' as const,
      content: "Continue with next step"
    }
  };
}

for await (const message of query({
  prompt: generateMessages(),
  options: { maxTurns: 10 }
})) {
  // Real-time processing
}
```

**Advantages for Feature Planner:**
- Real-time progress updates to UI
- Dynamic workflow control
- Can send follow-up messages based on user input
- Image attachment support

### 3. Agent Definition (Programmatic)

**Two approaches to define agents:**

#### A. Programmatic Definition (Full Control)
```typescript
import { query, type AgentDefinition } from '@anthropic-ai/claude-agent-sdk';

const result = query({
  prompt: "Refine this request: Add OAuth",
  options: {
    agents: {
      'initial-feature-refinement': {
        description: 'Use PROACTIVELY to refine user feature requests',
        prompt: `You are a feature refinement specialist...

        Output ONLY a single paragraph with technical context.
        No headers, bullets, or sections.`,
        tools: ['Read', 'Grep', 'Glob'],
        model: 'sonnet'
      },
      'file-discovery-agent': {
        description: 'Identify all files relevant to feature implementation',
        prompt: `You are a codebase analysis expert...`,
        tools: ['Read', 'Grep', 'Glob'],
        model: 'sonnet'
      }
    }
  }
});
```

**Advantages:**
- Full TypeScript type safety
- Dynamic agent configuration
- Can customize agents per request
- No filesystem dependency

**Disadvantages:**
- Must maintain agent prompts in code
- Duplicates .claude/agents/*.md content
- Harder to share with CLI

#### B. Filesystem-Based (Reuse Existing)
```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

const result = query({
  prompt: "Refine this request: Add OAuth",
  options: {
    settingSources: ['project'], // Load from .claude/agents/
    // Filesystem agents are auto-loaded!
  }
});
```

**Advantages:**
- Reuses existing `.claude/agents/*.md` files
- Changes sync between CLI and web
- Single source of truth
- Easier maintenance

**Disadvantages:**
- Requires filesystem access
- Less flexible per-request customization

#### C. Hybrid Approach (Recommended)
```typescript
import { readFileSync } from 'fs';
import { query } from '@anthropic-ai/claude-agent-sdk';

// Load base agent definitions from filesystem
const baseAgents = {
  settingSources: ['project'] // Loads .claude/agents/*.md
};

// Override or customize specific agents
const result = query({
  prompt: "Refine this request: Add OAuth",
  options: {
    ...baseAgents,
    agents: {
      // Filesystem agents loaded automatically
      // Can override specific ones here:
      'custom-refinement': {
        description: 'Custom refinement for this specific request',
        prompt: 'Custom prompt...',
        tools: ['Read'],
        model: 'opus' // Use better model for important features
      }
    }
  }
});
```

### 4. Agent Invocation

#### Automatic Invocation (Recommended)
Agents are invoked automatically based on their `description` field:

```typescript
// Agent will be auto-selected if description matches task
const result = query({
  prompt: "I need to refine this feature request: Add OAuth",
  options: {
    agents: {
      'initial-feature-refinement': {
        description: 'Use PROACTIVELY to refine user feature requests',
        // ...
      }
    }
  }
});
```

#### Explicit Invocation via Task Tool
```typescript
// Explicitly request a specific agent
const result = query({
  prompt: `Use the initial-feature-refinement agent to refine: Add OAuth`,
  options: {
    agents: { /* ... */ },
    allowedTools: ['Task', 'Read', 'Grep']
  }
});
```

#### Slash Command Invocation
```typescript
// Can invoke custom slash commands
const result = query({
  prompt: "/plan-feature Add OAuth support",
  options: {
    settingSources: ['project'] // Loads .claude/commands/*.md
  }
});
```

**For Feature Planner:** We can invoke the entire `/plan-feature` command, or invoke individual agents step-by-step for more control.

### 5. Session Management

#### Continue Previous Conversation
```typescript
// First query
const result1 = query({
  prompt: "Refine this feature: Add OAuth",
  options: { maxTurns: 1 }
});

let sessionId;
for await (const message of result1) {
  if (message.type === 'system' && message.subtype === 'init') {
    sessionId = message.session_id;
  }
}

// Continue in same session
const result2 = query({
  prompt: "Now discover files for this feature",
  options: {
    continue: true, // Uses most recent session
    maxTurns: 1
  }
});
```

#### Resume Specific Session
```typescript
const result = query({
  prompt: "Continue where we left off",
  options: {
    resume: sessionId, // Specific session ID
    maxTurns: 1
  }
});
```

#### Fork Session
```typescript
// Create new session from existing one
const result = query({
  prompt: "Try a different approach",
  options: {
    resume: sessionId,
    forkSession: true, // New session ID, keeps history
    maxTurns: 1
  }
});
```

**For Feature Planner:**
- Use `continue: true` for multi-step workflows
- Store `session_id` in database for resumption
- Fork sessions to try different approaches

### 6. Tool Permissions & Control

#### Allow Specific Tools
```typescript
const result = query({
  prompt: "Analyze this codebase",
  options: {
    allowedTools: ['Read', 'Grep', 'Glob'], // Only these tools
    disallowedTools: ['Write', 'Edit', 'Bash'] // Extra safety
  }
});
```

#### Permission Modes
```typescript
const result = query({
  prompt: "Review code",
  options: {
    permissionMode: 'default' // 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'
  }
});
```

**For Feature Planner:**
- Step 1 (Refine): `allowedTools: ['Read']` - read-only
- Step 2 (Discover): `allowedTools: ['Read', 'Grep', 'Glob']` - search only
- Step 3 (Plan): `allowedTools: ['Read', 'Grep', 'Glob']` - no modifications

### 7. Message Types & Event Handling

```typescript
for await (const message of query({
  prompt: "Refine feature request",
  options: { maxTurns: 1 }
})) {
  switch (message.type) {
    case 'system':
      if (message.subtype === 'init') {
        console.log('Session started:', message.session_id);
        console.log('Available commands:', message.slash_commands);
      }
      break;

    case 'assistant':
      // Main agent response
      console.log('Agent response:', message.message);
      break;

    case 'user':
      // User message (in conversation)
      break;

    case 'result':
      // Final result
      console.log('Final result:', message.result);
      break;

    case 'compact_boundary':
      // Context compaction occurred
      console.log('Compacted at:', message.compact_metadata);
      break;
  }
}
```

### 8. Hooks Integration

Load hooks from settings:
```typescript
const result = query({
  prompt: "Run feature planning",
  options: {
    settingSources: ['project'], // Loads .claude/settings.json hooks
  }
});
```

**Current Project Hooks:**
- `PreToolUse`: Logger + Neon validator
- `PostToolUse`: Prettier formatter
- `Notification`: Desktop notifications

**For Feature Planner:** Hooks automatically work with SDK if we load project settings!

### 9. Error Handling

```typescript
try {
  for await (const message of query({
    prompt: "Refine request",
    options: {
      maxTurns: 1,
      timeout: 30000 // 30 second timeout
    }
  })) {
    if (message.type === 'result' && message.result.includes('error')) {
      // Handle agent-level errors
    }
  }
} catch (error) {
  if (error instanceof AbortError) {
    // User cancelled
  } else {
    // SDK-level error
  }
}
```

### 10. MCP Server Integration

```typescript
const result = query({
  prompt: "Query database",
  options: {
    mcpServers: {
      'neon-db': {
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@neon/mcp-server'],
        env: { /* ... */ }
      }
    }
  }
});
```

**For Feature Planner:** Could integrate with MCP servers for enhanced capabilities.

## Recommended Architecture for Feature Planner

### API Route Design

```typescript
// app/api/feature-planner/refine/route.ts
import { query } from '@anthropic-ai/claude-agent-sdk';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { featureRequest, settings } = await request.json();

  try {
    let refinedRequest = '';

    for await (const message of query({
      prompt: `Refine this feature request: ${featureRequest}`,
      options: {
        maxTurns: 1,
        settingSources: ['project'], // Load .claude/agents/
        allowedTools: ['Read', 'Grep', 'Glob'],
        model: 'claude-sonnet-4-5-20250929'
      }
    })) {
      if (message.type === 'result') {
        refinedRequest = message.result;
      }
    }

    return NextResponse.json({
      success: true,
      refinedRequest
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

### Service Layer Pattern

```typescript
// lib/services/feature-planner.service.ts
import { query } from '@anthropic-ai/claude-agent-sdk';

export class FeaturePlannerService {
  async refineRequest(featureRequest: string, settings: RefinementSettings) {
    const results = [];

    for await (const message of query({
      prompt: `Refine: ${featureRequest}`,
      options: {
        maxTurns: 1,
        settingSources: ['project'],
        allowedTools: ['Read']
      }
    })) {
      if (message.type === 'result') {
        results.push(message.result);
      }
    }

    return results;
  }

  async discoverFiles(refinedRequest: string) {
    // Similar pattern...
  }

  async generatePlan(refinedRequest: string, files: string[]) {
    // Similar pattern...
  }
}
```

## Key Decisions for Implementation

### 1. Agent Definition Strategy
**Recommendation:** Hybrid Approach
- Load base agents from `.claude/agents/` using `settingSources: ['project']`
- Override programmatically when needed for customization
- Single source of truth with flexibility

### 2. Input Mode Strategy
**Recommendation:** Start with Single Message, Add Streaming Later
- **Phase 1:** Use single message input for MVP (simpler, works in API routes)
- **Phase 2:** Add streaming input for real-time UI updates

### 3. Workflow Orchestration
**Recommendation:** Step-by-Step API Routes
- `/api/feature-planner/refine` - Step 1
- `/api/feature-planner/discover` - Step 2
- `/api/feature-planner/plan` - Step 3
- Allows UI control between steps
- Better error isolation
- Enables parallel experimentation

### 4. Session Management
**Recommendation:** Database-backed Sessions
- Store `session_id` in database
- Use `continue: true` for sequential steps
- Enable `forkSession` for trying alternatives
- Persist all intermediate results

### 5. Error Handling
**Recommendation:** Multi-layer Strategy
- SDK-level: try/catch around query
- Agent-level: Parse result for errors
- Retry logic: Exponential backoff
- Fallback: Store partial results

## Next Steps

1. ✅ Document SDK capabilities
2. ⏳ Design database schema
3. ⏳ Create architecture plan
4. Implement service layer
5. Build API routes
6. Create UI components
7. Add streaming support
