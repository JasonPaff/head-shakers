# Feature Planner Web Implementation - Comprehensive Architecture Plan

**Date:** 2025-10-08
**Status:** Design Complete
**Purpose:** Complete architectural blueprint for migrating `/plan-feature` CLI workflow to web UI

## Executive Summary

This document provides a comprehensive architecture plan for implementing a web-based feature planner that replicates and enhances the existing `/plan-feature` CLI command. The web implementation will provide:

- **Enhanced Control**: Step-by-step workflow with user control between stages
- **Parallel Execution**: Multiple refinement agents running simultaneously
- **Database Persistence**: All workflow data stored for retrieval and analysis
- **Real-time Feedback**: Streaming progress updates to UI
- **Iterative Refinement**: Ability to modify and re-run individual steps

## System Architecture

### High-Level Overview

```
┌─────────────┐
│   Browser   │
│   (React)   │
└──────┬──────┘
       │ HTTP/SSE
       ↓
┌─────────────────────────────────────────────┐
│          Next.js App Router                 │
│                                             │
│  ┌────────────┐  ┌──────────────────────┐  │
│  │  Pages     │  │   API Routes         │  │
│  │  /feature- │←→│   /api/feature-     │  │
│  │  planner   │  │   planner/*         │  │
│  └────────────┘  └──────────┬───────────┘  │
│                             │               │
│                  ┌──────────↓──────────┐    │
│                  │  Service Layer      │    │
│                  │  - Refinement       │    │
│                  │  - Discovery        │    │
│                  │  - Planning         │    │
│                  └──────────┬──────────┘    │
└─────────────────────────────┼───────────────┘
                              │
                    ┌─────────↓──────────┐
                    │   Claude Agent SDK  │
                    │   (@anthropic-ai/   │
                    │   claude-agent-sdk) │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
        ┌─────↓──────┐  ┌────↓────┐  ┌───────↓──────┐
        │ Filesystem │  │  Claude │  │  PostgreSQL  │
        │  Agents    │  │   API   │  │  (Neon)      │
        │ (.claude/) │  │         │  │              │
        └────────────┘  └─────────┘  └──────────────┘
```

## Component Architecture

### 1. Frontend Layer

#### A. Pages (`/app/(app)/feature-planner/`)

**Main Page:** `page.tsx`

- Orchestrates the 3-step workflow
- Manages state with `useState` and URL state (`nuqs`)
- Controls step progression
- Displays results and allows user interactions

**Components:**

```
/app/(app)/feature-planner/
├── page.tsx                     # Main orchestrator
├── components/
│   ├── request-input.tsx        # Step 0: Feature request input
│   ├── refinement-settings.tsx  # Configuration panel
│   ├── workflow-progress.tsx    # Progress indicator
│   ├── action-controls.tsx      # Navigation buttons
│   └── steps/
│       ├── step-orchestrator.tsx     # Step coordinator
│       ├── step-1-refinement.tsx     # Refinement display
│       ├── step-2-discovery.tsx      # File discovery display
│       └── step-3-planning.tsx       # Implementation plan display
```

#### B. State Management

**URL State (nuqs):**

```typescript
const [currentStep, setCurrentStep] = useQueryState(
  'step',
  parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
);

const [planId, setPlanId] = useQueryState('planId');
```

**Local State:**

```typescript
interface FeaturePlannerState {
  planId: string | null;
  originalRequest: string;

  // Step 1
  refinedRequest: string | null;
  refinements: RefinementResult[];
  selectedRefinementId: string | null;

  // Step 2
  discoveredFiles: FileDiscoveryResult[];
  selectedFiles: string[];

  // Step 3
  implementationPlan: string | null;

  // Workflow
  settings: RefinementSettings;
  isProcessing: boolean;
}
```

### 2. API Layer

#### A. Route Structure

```
/app/api/feature-planner/
├── create/
│   └── route.ts              # POST - Create new plan
├── refine/
│   ├── route.ts              # POST - Run refinement (single or parallel)
│   └── [refinementId]/
│       └── route.ts          # GET - Get refinement details
├── discover/
│   └── route.ts              # POST - Run file discovery
├── plan/
│   └── route.ts              # POST - Generate implementation plan
├── [planId]/
│   ├── route.ts              # GET - Get plan details
│   └── stream/
│       └── route.ts          # GET - SSE stream for real-time updates
└── list/
    └── route.ts              # GET - List user's plans
```

#### B. API Route Examples

**Create Plan:**

```typescript
// POST /api/feature-planner/create
export async function POST(request: Request) {
  const { featureRequest } = await request.json();
  const userId = await getCurrentUserId();

  const plan = await db
    .insert(featurePlans)
    .values({
      userId,
      originalRequest: featureRequest,
      status: 'draft',
      currentStep: 0,
    })
    .returning();

  return NextResponse.json({ planId: plan.id });
}
```

**Run Refinement (Parallel):**

```typescript
// POST /api/feature-planner/refine
import { query } from '@anthropic-ai/claude-agent-sdk';

export async function POST(request: Request) {
  const { planId, settings } = await request.json();

  // Update plan status
  await db
    .update(featurePlans)
    .set({ status: 'refining', currentStep: 1 })
    .where(eq(featurePlans.id, planId));

  // Run parallel refinements
  const refinements = await Promise.all(
    Array.from({ length: settings.agentCount }, (_, i) =>
      refineWithAgent(planId, `agent-${i + 1}`, settings),
    ),
  );

  return NextResponse.json({ refinements });
}

async function refineWithAgent(planId: string, agentId: string, settings: RefinementSettings) {
  const startTime = Date.now();

  // Create refinement record
  const [refinement] = await db
    .insert(featureRefinements)
    .values({
      planId,
      agentId,
      status: 'processing',
    })
    .returning();

  try {
    let refinedRequest = '';

    for await (const message of query({
      prompt: `Refine this feature request: ${originalRequest}`,
      options: {
        maxTurns: 1,
        settingSources: ['project'],
        allowedTools: ['Read'],
      },
    })) {
      if (message.type === 'result') {
        refinedRequest = message.result;
      }
    }

    // Update refinement with result
    await db
      .update(featureRefinements)
      .set({
        refinedRequest,
        status: 'completed',
        executionTimeMs: Date.now() - startTime,
        wordCount: refinedRequest.split(/\s+/).length,
      })
      .where(eq(featureRefinements.id, refinement.id));

    return refinement;
  } catch (error) {
    await db
      .update(featureRefinements)
      .set({ status: 'failed', errorMessage: error.message })
      .where(eq(featureRefinements.id, refinement.id));

    throw error;
  }
}
```

**Server-Sent Events (Real-time):**

```typescript
// GET /api/feature-planner/[planId]/stream
export async function GET(request: Request, { params }: { params: { planId: string } }) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Stream refinement progress
      for await (const message of query({
        prompt: generateRefinementPrompt(planId),
        options: { includePartialMessages: true },
      })) {
        const data = `data: ${JSON.stringify(message)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

### 3. Service Layer

#### A. Feature Planner Service

**Location:** `src/lib/services/feature-planner.service.ts`

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';
import { db } from '@/lib/db';
import { featurePlans, featureRefinements } from '@/lib/db/schema';

export class FeaturePlannerService {
  /**
   * Create a new feature plan
   */
  async createPlan(userId: string, originalRequest: string) {
    const [plan] = await db
      .insert(featurePlans)
      .values({
        userId,
        originalRequest,
        status: 'draft',
        currentStep: 0,
      })
      .returning();

    return plan;
  }

  /**
   * Run parallel refinements
   */
  async runParallelRefinement(planId: string, settings: RefinementSettings) {
    const plan = await this.getPlan(planId);

    // Update plan status
    await db
      .update(featurePlans)
      .set({ status: 'refining', refinementSettings: settings })
      .where(eq(featurePlans.id, planId));

    // Run multiple agents in parallel
    const refinementPromises = Array.from({ length: settings.agentCount }, (_, i) =>
      this.runSingleRefinement(planId, plan.originalRequest, `agent-${i + 1}`, settings),
    );

    const refinements = await Promise.all(refinementPromises);

    return refinements;
  }

  /**
   * Run single refinement with SDK
   */
  private async runSingleRefinement(
    planId: string,
    originalRequest: string,
    agentId: string,
    settings: RefinementSettings,
  ) {
    const startTime = Date.now();

    // Create refinement record
    const [refinement] = await db
      .insert(featureRefinements)
      .values({
        planId,
        agentId,
        inputRequest: originalRequest,
        status: 'processing',
      })
      .returning();

    try {
      let refinedRequest = '';
      let tokenUsage = { prompt: 0, completion: 0 };

      // Use Claude Agent SDK
      for await (const message of query({
        prompt: originalRequest,
        options: {
          maxTurns: 1,
          settingSources: ['project'], // Load .claude/agents/
          allowedTools: ['Read', 'Grep', 'Glob'],
          model: 'claude-sonnet-4-5-20250929',
        },
      })) {
        if (message.type === 'assistant') {
          refinedRequest = message.message.content[0].text;

          if (message.message.usage) {
            tokenUsage.prompt = message.message.usage.input_tokens || 0;
            tokenUsage.completion = message.message.usage.output_tokens || 0;
          }
        }

        // Log execution
        await this.logExecution(planId, 'refinement', 1, message);
      }

      // Validate and update
      const validation = this.validateRefinement(refinedRequest, originalRequest);

      await db
        .update(featureRefinements)
        .set({
          refinedRequest,
          status: 'completed',
          executionTimeMs: Date.now() - startTime,
          wordCount: refinedRequest.split(/\s+/).length,
          characterCount: refinedRequest.length,
          isValidFormat: validation.isValid,
          validationErrors: validation.errors,
          promptTokens: tokenUsage.prompt,
          completionTokens: tokenUsage.completion,
          totalTokens: tokenUsage.prompt + tokenUsage.completion,
        })
        .where(eq(featureRefinements.id, refinement.id));

      return refinement;
    } catch (error) {
      await db
        .update(featureRefinements)
        .set({
          status: 'failed',
          errorMessage: error.message,
          executionTimeMs: Date.now() - startTime,
        })
        .where(eq(featureRefinements.id, refinement.id));

      throw error;
    }
  }

  /**
   * Run file discovery
   */
  async runFileDiscovery(planId: string, refinedRequest: string) {
    // Similar pattern to refinement
    // Uses file-discovery-agent subagent
  }

  /**
   * Generate implementation plan
   */
  async generateImplementationPlan(
    planId: string,
    refinedRequest: string,
    discoveredFiles: FileDiscoveryResult[],
  ) {
    // Similar pattern to refinement
    // Uses implementation-planner subagent
  }

  /**
   * Log agent execution
   */
  private async logExecution(planId: string, step: string, stepNumber: number, message: SDKMessage) {
    await db.insert(planExecutionLogs).values({
      planId,
      step,
      stepNumber,
      agentResponse: JSON.stringify(message),
      startTime: new Date(),
    });
  }
}
```

### 4. Database Integration

**Facade Pattern:**

```typescript
// src/lib/facades/feature-planner.facade.ts

export class FeaturePlannerFacade {
  private service: FeaturePlannerService;

  constructor() {
    this.service = new FeaturePlannerService();
  }

  async createAndRefine(userId: string, featureRequest: string, settings: RefinementSettings) {
    // Create plan
    const plan = await this.service.createPlan(userId, featureRequest);

    // Run refinement
    const refinements = await this.service.runParallelRefinement(plan.id, settings);

    return { plan, refinements };
  }

  async getPlanWithDetails(planId: string) {
    const plan = await db.query.featurePlans.findFirst({
      where: eq(featurePlans.id, planId),
      with: {
        refinements: true,
        discoverySessions: {
          with: {
            files: true,
          },
        },
        planGenerations: true,
        executionLogs: true,
      },
    });

    return plan;
  }
}
```

## Implementation Phases

### Phase 1: MVP (Weeks 1-2)

**Goal:** Basic 3-step workflow with database persistence

**Tasks:**

1. ✅ Design database schema
2. Create schema file and migration
3. Build service layer with SDK integration
4. Create basic API routes (create, refine, discover, plan)
5. Build minimal UI for 3-step workflow
6. Implement single refinement (no parallel yet)
7. Basic error handling

**Deliverables:**

- Working 3-step flow
- Database persistence
- Basic UI

### Phase 2: Parallel Execution (Weeks 3-4)

**Goal:** Enable parallel refinement with comparison

**Tasks:**

1. Implement parallel refinement service
2. Update UI to display multiple refinements
3. Add refinement comparison interface
4. Implement refinement selection
5. Add execution metrics display

**Deliverables:**

- Parallel refinement working
- Comparison UI
- Selection mechanism

### Phase 3: Real-time Streaming (Weeks 5-6)

**Goal:** Add real-time progress updates

**Tasks:**

1. Implement SSE endpoint for streaming
2. Build streaming consumer in UI
3. Add progress indicators
4. Real-time log display
5. Partial message handling

**Deliverables:**

- Real-time progress updates
- Live log streaming
- Enhanced UX

### Phase 4: Advanced Features (Weeks 7-8)

**Goal:** Iteration, versioning, and polish

**Tasks:**

1. Implement plan versioning
2. Add step re-run capability
3. Build plan history view
4. Add plan export functionality
5. Implement plan sharing
6. Performance optimization
7. Comprehensive testing

**Deliverables:**

- Complete feature set
- Production-ready
- Fully tested

## Technical Decisions

### 1. Agent Invocation Strategy

**Decision:** Hybrid Approach

```typescript
// Load agents from filesystem + programmatic override
const result = query({
  prompt: refinementPrompt,
  options: {
    settingSources: ['project'], // Loads .claude/agents/
    agents: {
      // Can override specific agents programmatically
      'custom-refinement': {
        description: 'Custom refinement agent',
        prompt: customPrompt,
        tools: ['Read'],
        model: 'opus',
      },
    },
  },
});
```

**Rationale:**

- Reuses existing `.claude/agents/*.md` files
- Single source of truth with CLI
- Flexibility for web-specific customization
- Easy to maintain

### 2. Input Mode Strategy

**Decision:** Start Single Message, Add Streaming Later

**Phase 1 (MVP):** Single message input

```typescript
for await (const message of query({
  prompt: 'Refine request',
  options: { maxTurns: 1 },
})) {
  // Simple, predictable
}
```

**Phase 3 (Streaming):** Streaming input

```typescript
async function* generateMessages() {
  yield userMessage;
  // Dynamic follow-ups
}
```

**Rationale:**

- MVP is simpler with single message
- Streaming adds complexity that's not needed initially
- Can add streaming for real-time updates later

### 3. State Management

**Decision:** URL State + Server State

```typescript
// URL state for navigation
const [currentStep] = useQueryState('step');
const [planId] = useQueryState('planId');

// Server state via TanStack Query
const { data: plan } = useQuery({
  queryKey: ['plan', planId],
  queryFn: () => fetch(`/api/feature-planner/${planId}`).then((r) => r.json()),
});
```

**Rationale:**

- URL state enables deep linking
- Server state via React Query handles caching
- Clean separation of concerns

### 4. Error Handling

**Decision:** Multi-layer Strategy

```typescript
// Service layer
try {
  const result = await queryAgent();
} catch (error) {
  await logError(error);
  throw new AgentExecutionError(error);
}

// API layer
try {
  const result = await service.refine();
} catch (error) {
  if (error instanceof AgentExecutionError) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  throw error;
}

// UI layer
const { mutate, error } = useMutation({
  onError: (error) => {
    toast.error(error.message);
  },
});
```

**Rationale:**

- Clear error boundaries
- Proper logging at each layer
- User-friendly error messages

## Security Considerations

### 1. Authentication

- All API routes require authentication
- Use Clerk's `auth()` helper
- Validate user owns the plan

### 2. Authorization

```typescript
export async function GET(request: Request, { params }: { params: { planId: string } }) {
  const { userId } = auth();

  const plan = await db.query.featurePlans.findFirst({
    where: and(eq(featurePlans.id, params.planId), eq(featurePlans.userId, userId)),
  });

  if (!plan) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(plan);
}
```

### 3. Rate Limiting

- Implement rate limiting on expensive operations
- Use Upstash Redis for rate limit tracking
- Limit parallel refinement count

### 4. Input Validation

- Validate all inputs with Zod
- Sanitize user input before passing to agents
- Check file path access restrictions

## Performance Optimization

### 1. Database Queries

- Use indexes on frequently queried fields
- Implement query result caching
- Use Drizzle's query builder efficiently

### 2. API Routes

- Implement response caching where appropriate
- Use streaming for large payloads
- Optimize bundle size

### 3. SDK Usage

- Reuse Claude sessions where possible
- Implement prompt caching
- Monitor token usage

## Monitoring & Analytics

### 1. Metrics to Track

- Execution time per step
- Token usage per agent
- Success/failure rates
- User engagement
- Cost per plan generation

### 2. Logging

- All agent executions logged to `plan_execution_logs`
- Error tracking with Sentry
- Performance monitoring

### 3. Analytics Dashboard

- User plan history
- Success metrics
- Cost analysis
- Popular features

## Testing Strategy

### 1. Unit Tests

- Service layer functions
- Utility functions
- Validation logic

### 2. Integration Tests

- API routes
- Database operations
- SDK integration

### 3. E2E Tests

- Full workflow (3 steps)
- Error scenarios
- Edge cases

### 4. Performance Tests

- Load testing API routes
- Database query performance
- SDK response times

## Deployment Considerations

### 1. Environment Variables

```env
# Claude Agent SDK
ANTHROPIC_API_KEY=sk-ant-...

# Database
DATABASE_URL=postgresql://...

# Next.js
NEXT_PUBLIC_APP_URL=https://...
```

### 2. Database Migrations

```bash
npm run db:generate  # Generate migration
npm run db:migrate   # Run migration
```

### 3. Feature Flags

- Use feature flags for gradual rollout
- Enable/disable streaming
- Control parallel execution limits

## Success Metrics

### 1. Functionality

- ✅ All 3 steps working
- ✅ Database persistence
- ✅ Parallel execution
- ✅ Real-time updates

### 2. Performance

- Step 1 (Refinement): < 5 seconds
- Step 2 (Discovery): < 10 seconds
- Step 3 (Planning): < 15 seconds
- Total workflow: < 30 seconds

### 3. Quality

- 95%+ success rate for refinements
- 90%+ valid implementation plans
- < 1% error rate

### 4. User Experience

- Clear progress indication
- Helpful error messages
- Responsive UI (< 100ms interactions)

## Future Enhancements

### 1. AI Improvements

- Fine-tuned models for specific tasks
- Custom agent training
- Improved prompt engineering

### 2. Collaboration

- Share plans with team members
- Collaborative editing
- Plan templates

### 3. Integration

- CI/CD integration
- GitHub integration
- Slack notifications

### 4. Advanced Features

- Plan branching and merging
- A/B testing different approaches
- ML-powered plan optimization

## Conclusion

This architecture provides a solid foundation for migrating the `/plan-feature` CLI workflow to a powerful web application. The phased approach ensures we can deliver value incrementally while building toward a comprehensive solution.

## Next Steps

1. ✅ Complete architecture documentation
2. Review and approve architecture
3. Begin Phase 1 implementation
4. Set up project tracking
5. Create implementation tickets
