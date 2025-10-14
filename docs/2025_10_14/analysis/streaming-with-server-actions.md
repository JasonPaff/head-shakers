# Streaming with Server Actions - Architectural Analysis

**Date:** 2025-10-14
**Topic:** Can we use Claude SDK streaming (`includePartialMessages`) with Next.js Server Actions?

## TL;DR

**No, you cannot directly stream from server actions.** Server actions return a single response, not a stream. However, you have 4 viable alternatives:

| Solution | Complexity | Real-time? | Cost | Best For |
|----------|-----------|------------|------|----------|
| **API Route + SSE** | Medium | ✅ Yes (true streaming) | Low | Best UX |
| **Server Action + Polling** | Low | ⚠️ Delayed (1-2s lag) | Medium | Simplest |
| **Server Action + WebSocket** | High | ✅ Yes | Medium | Complex apps |
| **Two-Phase: Action + Route** | Medium | ✅ Yes | Low | **Recommended** |

## Problem Statement

Current implementation:
```typescript
// src/app/(app)/feature-planner/hooks/use-suggest-feature.ts
const { executeAsync, isExecuting } = useServerAction(suggestFeatureAction, {
  onSuccess: ({ data }) => {
    setSuggestions(data.data.suggestions.suggestions);  // ← Single response only
  },
});
```

Desired behavior:
```typescript
// What we want (but can't do with server actions)
for await (const message of query({ options: { includePartialMessages: true } })) {
  if (message.type === 'stream_event') {
    // ❌ Can't send partial updates from server action!
    sendPartialUpdate(message.event);
  }
}
```

**Why it doesn't work:**
- Server actions use POST requests that return a single JSON response
- No way to send multiple responses from same action invocation
- Next-Safe-Action wrapper expects single return value
- Browser waits for complete response before calling `onSuccess`

## Solution 1: API Route with Server-Sent Events (SSE) ⭐ Recommended

Convert the server action to a streaming API route.

### Architecture

```
Client (React)              Server (API Route)              Claude SDK
     │                             │                             │
     ├──── POST /api/suggest ────→│                             │
     │                             ├──── query() ────────────→  │
     │                             │                             │
     │←──── SSE: "text delta" ────┤←──── stream_event ─────────┤
     │←──── SSE: "text delta" ────┤←──── stream_event ─────────┤
     │←──── SSE: "text delta" ────┤←──── stream_event ─────────┤
     │                             │                             │
     │←──── SSE: "complete" ──────┤←──── assistant msg ────────┤
     │                             │                             │
```

### Implementation

**Step 1: Create Streaming API Route**

```typescript
// src/app/api/feature-planner/suggest-feature/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs'; // Required for streaming
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { pageOrComponent, featureType, priorityLevel, additionalContext, customModel } = body;

  // Create ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Helper to send SSE message
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        // Get custom agent from database
        const dbAgent = await FeaturePlannerFacade.getFeatureSuggestionAgentAsync(userId, db);
        const customAgent = dbAgent ? { /* ... map dbAgent */ } : undefined;

        // Call SDK service with streaming callback
        const result = await FeaturePlannerService.executeFeatureSuggestionAgent(
          pageOrComponent,
          featureType,
          priorityLevel,
          additionalContext,
          { customModel },
          customAgent,
          // ✅ Streaming callback - sends partial updates
          (partialText: string) => {
            sendEvent('delta', { text: partialText });
          }
        );

        // Send final complete message
        sendEvent('complete', {
          suggestions: result.result.suggestions,
          tokenUsage: result.tokenUsage,
          executionTimeMs: result.executionTimeMs,
        });

        controller.close();
      } catch (error) {
        sendEvent('error', {
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        controller.close();
      }
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**Step 2: Update Service to Support Streaming Callback**

```typescript
// src/lib/services/feature-planner.service.ts (modify existing method)
static async executeFeatureSuggestionAgent(
  pageOrComponent: string,
  featureType: string,
  priorityLevel: string,
  additionalContext: string | undefined,
  settings: { customModel?: string },
  agent?: FeatureSuggestionAgent,
  onPartialUpdate?: (partialText: string) => void,  // ← Add this parameter
): Promise<AgentExecutionResult<{ /* ... */ }>> {
  // ... existing setup code

  for await (const message of query({
    options: {
      ...BASE_SDK_OPTIONS,
      allowedTools,
      includePartialMessages: !!onPartialUpdate,  // ← Enable if callback provided
      // ... other options
    },
    prompt,
  })) {
    // Handle streaming updates
    if (message.type === 'stream_event' && onPartialUpdate) {
      const streamEvent = message.event as RawMessageStreamEvent;

      if (streamEvent.type === 'content_block_delta' &&
          streamEvent.delta.type === 'text_delta') {
        onPartialUpdate(streamEvent.delta.text);  // ← Send to callback
      }
    }

    // ... existing assistant message handling
  }

  // ... existing return
}
```

**Step 3: Update React Hook to Use EventSource**

```typescript
// src/app/(app)/feature-planner/hooks/use-suggest-feature.ts
import { useCallback, useState } from 'react';

export const useSuggestFeature = () => {
  const [suggestions, setSuggestions] = useState<Array<SuggestionResult> | null>(null);
  const [partialText, setPartialText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invokeSuggestion = useCallback(async (input: {
    pageOrComponent: string;
    featureType: FeatureType;
    priorityLevel: PriorityLevel;
    additionalContext?: string;
    customModel?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setPartialText('');
    setSuggestions(null);

    try {
      // Create EventSource for SSE
      const params = new URLSearchParams({
        pageOrComponent: input.pageOrComponent,
        featureType: input.featureType,
        priorityLevel: input.priorityLevel,
        ...(input.additionalContext && { additionalContext: input.additionalContext }),
        ...(input.customModel && { customModel: input.customModel }),
      });

      // Use fetch with streaming instead of EventSource for POST
      const response = await fetch('/api/feature-planner/suggest-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to start suggestion generation');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event: (.+)$/m);
          const dataMatch = line.match(/^data: (.+)$/m);

          if (eventMatch && dataMatch) {
            const event = eventMatch[1];
            const data = JSON.parse(dataMatch[1]);

            if (event === 'delta') {
              // Accumulate partial text
              setPartialText(prev => prev + data.text);
            } else if (event === 'complete') {
              // Set final suggestions
              setSuggestions(data.suggestions);
              setIsLoading(false);
            } else if (event === 'error') {
              setError(data.message);
              setIsLoading(false);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  }, []);

  return {
    invokeSuggestion,
    suggestions,
    partialText,  // ← Expose for UI
    isLoading,
    error,
    // ... other methods
  };
};
```

**Step 4: Update UI to Show Partial Text**

```typescript
// src/app/(app)/feature-planner/components/feature-suggestion-form.tsx
export function FeatureSuggestionForm() {
  const { invokeSuggestion, suggestions, partialText, isLoading } = useSuggestFeature();

  return (
    <div>
      {/* Form inputs */}

      {isLoading && partialText && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Generating suggestions...</p>
          <div className="prose prose-sm max-w-none">
            {/* Show streaming text as it arrives */}
            <div className="whitespace-pre-wrap">{partialText}</div>
          </div>
        </div>
      )}

      {suggestions && (
        <div className="mt-4">
          {/* Show final suggestions */}
        </div>
      )}
    </div>
  );
}
```

### Pros & Cons

**Pros:**
- ✅ True real-time streaming (< 100ms latency)
- ✅ Lower perceived latency - users see progress immediately
- ✅ Can show token-by-token generation
- ✅ Better UX than polling

**Cons:**
- ❌ More complex than server actions
- ❌ Need to handle SSE connection management
- ❌ Can't use Next-Safe-Action helpers
- ❌ Need separate route for same functionality

## Solution 2: Server Action + Polling (Simplest)

Keep server action, but store partial results in database and poll for updates.

### Architecture

```
Client                     Server Action                Database           Background Job
  │                             │                          │                      │
  ├─── Start suggestion ───────→│                          │                      │
  │                             ├─── Create job record ───→│                      │
  │←─── jobId ──────────────────┤                          │                      │
  │                             │                          │                      │
  │                             └─── Start background ─────┼─────────────────────→│
  │                                                         │                      │
  │                                                         │←─ Update progress ──┤
  │─── Poll for status ─────────→ getStatus action ───────→│                      │
  │←─── { progress: 30% } ───────┤                         │                      │
  │                                                         │                      │
  │─── Poll for status ─────────→ getStatus action ───────→│                      │
  │←─── { progress: 60% } ───────┤                         │                      │
  │                                                         │                      │
  │─── Poll for status ─────────→ getStatus action ───────→│                      │
  │←─── { complete: true } ──────┤                         │                      │
```

### Implementation

**Step 1: Add Job Status Table**

```typescript
// Add to src/lib/db/schema/feature-planner.schema.ts
export const featureSuggestionJobs = pgTable('feature_suggestion_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(), // 'pending', 'in_progress', 'completed', 'failed'
  progress: integer('progress').default(0), // 0-100
  partialText: text('partial_text'),
  finalResult: jsonb('final_result'),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});
```

**Step 2: Modify Service to Update Job Status**

```typescript
// src/lib/services/feature-planner.service.ts
static async executeFeatureSuggestionAgent(
  // ... params
  jobId?: string,  // ← Add jobId parameter
  db?: Database,   // ← Add db parameter for updates
): Promise<AgentExecutionResult<{ /* ... */ }>> {
  // ... existing setup

  let accumulatedText = '';

  for await (const message of query({
    options: {
      ...BASE_SDK_OPTIONS,
      includePartialMessages: true,  // ← Always enable
      // ... other options
    },
    prompt,
  })) {
    // Handle streaming updates
    if (message.type === 'stream_event') {
      const streamEvent = message.event as RawMessageStreamEvent;

      if (streamEvent.type === 'content_block_delta' &&
          streamEvent.delta.type === 'text_delta') {
        accumulatedText += streamEvent.delta.text;

        // Update job status in database
        if (jobId && db) {
          await db.update(featureSuggestionJobs)
            .set({
              partialText: accumulatedText,
              progress: Math.min(90, Math.floor((accumulatedText.length / 2000) * 100)),
            })
            .where(eq(featureSuggestionJobs.id, jobId))
            .execute();
        }
      }
    }

    // ... existing assistant message handling
  }

  // Update job as complete
  if (jobId && db) {
    await db.update(featureSuggestionJobs)
      .set({
        status: 'completed',
        progress: 100,
        finalResult: result.result,
        completedAt: new Date(),
      })
      .where(eq(featureSuggestionJobs.id, jobId))
      .execute();
  }

  // ... existing return
}
```

**Step 3: Create Start and Poll Server Actions**

```typescript
// src/lib/actions/feature-planner/feature-planner.actions.ts

/**
 * Start feature suggestion (returns immediately with jobId)
 */
export const startFeatureSuggestionAction = authActionClient
  .metadata({ actionName: ACTION_NAMES.FEATURE_PLANNER.START_SUGGESTION })
  .inputSchema(z.object({
    pageOrComponent: z.string().min(1),
    featureType: z.enum(['enhancement', 'new-capability', 'optimization', 'ui-improvement', 'integration']),
    priorityLevel: z.enum(['low', 'medium', 'high', 'critical']),
    additionalContext: z.string().optional(),
    customModel: z.string().optional(),
  }))
  .action(async ({ ctx }) => {
    const input = ctx.sanitizedInput;
    const userId = ctx.userId;

    // Create job record
    const [job] = await ctx.db.insert(featureSuggestionJobs)
      .values({
        userId,
        status: 'pending',
        progress: 0,
      })
      .returning();

    // Start background job (non-blocking)
    void startBackgroundSuggestion(job.id, userId, input, ctx.db);

    return {
      success: true,
      data: { jobId: job.id },
    };
  });

/**
 * Poll for suggestion job status
 */
export const getSuggestionJobStatusAction = authActionClient
  .metadata({ actionName: ACTION_NAMES.FEATURE_PLANNER.GET_SUGGESTION_STATUS })
  .inputSchema(z.object({ jobId: z.string().uuid() }))
  .action(async ({ ctx }) => {
    const { jobId } = ctx.sanitizedInput;
    const userId = ctx.userId;

    const job = await ctx.db.query.featureSuggestionJobs.findFirst({
      where: and(
        eq(featureSuggestionJobs.id, jobId),
        eq(featureSuggestionJobs.userId, userId)
      ),
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return {
      success: true,
      data: {
        status: job.status,
        progress: job.progress,
        partialText: job.partialText,
        finalResult: job.finalResult,
        error: job.error,
      },
    };
  });

/**
 * Background job runner
 */
async function startBackgroundSuggestion(
  jobId: string,
  userId: string,
  input: { /* ... */ },
  db: Database
) {
  try {
    // Update to in_progress
    await db.update(featureSuggestionJobs)
      .set({ status: 'in_progress' })
      .where(eq(featureSuggestionJobs.id, jobId))
      .execute();

    // Get custom agent
    const dbAgent = await FeaturePlannerFacade.getFeatureSuggestionAgentAsync(userId, db);
    const customAgent = dbAgent ? { /* ... */ } : undefined;

    // Execute with job updates
    await FeaturePlannerService.executeFeatureSuggestionAgent(
      input.pageOrComponent,
      input.featureType,
      input.priorityLevel,
      input.additionalContext,
      { customModel: input.customModel },
      customAgent,
      jobId,  // ← Pass jobId for status updates
      db,     // ← Pass db for updates
    );
  } catch (error) {
    // Update job as failed
    await db.update(featureSuggestionJobs)
      .set({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      .where(eq(featureSuggestionJobs.id, jobId))
      .execute();
  }
}
```

**Step 4: Update React Hook to Poll**

```typescript
// src/app/(app)/feature-planner/hooks/use-suggest-feature.ts
export const useSuggestFeature = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'polling' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [partialText, setPartialText] = useState('');
  const [suggestions, setSuggestions] = useState<Array<SuggestionResult> | null>(null);

  // Start suggestion
  const { executeAsync: startSuggestion } = useServerAction(startFeatureSuggestionAction);

  // Poll for status
  const { executeAsync: checkStatus } = useServerAction(getSuggestionJobStatusAction);

  const invokeSuggestion = useCallback(async (input: {
    pageOrComponent: string;
    featureType: FeatureType;
    priorityLevel: PriorityLevel;
    additionalContext?: string;
    customModel?: string;
  }) => {
    // Start the job
    const startResult = await startSuggestion(input);
    if (!startResult?.data) return;

    const newJobId = startResult.data.jobId;
    setJobId(newJobId);
    setStatus('polling');

    // Poll every 1 second
    const pollInterval = setInterval(async () => {
      const statusResult = await checkStatus({ jobId: newJobId });
      if (!statusResult?.data) return;

      const { status: jobStatus, progress, partialText, finalResult, error } = statusResult.data;

      setProgress(progress || 0);
      setPartialText(partialText || '');

      if (jobStatus === 'completed') {
        clearInterval(pollInterval);
        setSuggestions(finalResult?.suggestions || []);
        setStatus('complete');
      } else if (jobStatus === 'failed') {
        clearInterval(pollInterval);
        setStatus('error');
        // Handle error
      }
    }, 1000); // Poll every 1 second

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  }, [startSuggestion, checkStatus]);

  return {
    invokeSuggestion,
    status,
    progress,
    partialText,
    suggestions,
    isLoading: status === 'polling',
  };
};
```

### Pros & Cons

**Pros:**
- ✅ Keeps server action pattern
- ✅ Simpler than SSE (no streaming protocol)
- ✅ Works with Next-Safe-Action
- ✅ Easy to understand and debug

**Cons:**
- ❌ 1-2 second latency between updates (polling interval)
- ❌ Additional database writes (every update)
- ❌ More database load (frequent polling)
- ❌ Need background job infrastructure
- ❌ Need to manage job cleanup

## Solution 3: Two-Phase Approach ⭐ Best Balance

Hybrid: Server action starts job, client switches to SSE endpoint for streaming.

### Implementation

**Step 1: Server Action to Start Job**

```typescript
// src/lib/actions/feature-planner/feature-planner.actions.ts
export const startFeatureSuggestionAction = authActionClient
  .metadata({ actionName: ACTION_NAMES.FEATURE_PLANNER.START_SUGGESTION })
  .inputSchema(/* ... */)
  .action(async ({ ctx }) => {
    const input = ctx.sanitizedInput;
    const userId = ctx.userId;

    // Generate job ID (no database needed)
    const jobId = crypto.randomUUID();

    // Store job metadata in Redis or in-memory cache
    await redis.set(`suggestion:${jobId}`, JSON.stringify({
      userId,
      input,
      status: 'pending',
      createdAt: Date.now(),
    }), 'EX', 600); // Expire after 10 minutes

    return {
      success: true,
      data: { jobId },
    };
  });
```

**Step 2: SSE Endpoint for Streaming**

```typescript
// src/app/api/feature-planner/suggest-feature/[jobId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { jobId } = params;

  // Get job metadata from Redis
  const jobData = await redis.get(`suggestion:${jobId}`);
  if (!jobData) {
    return new Response('Job not found', { status: 404 });
  }

  const job = JSON.parse(jobData);
  if (job.userId !== userId) {
    return new Response('Forbidden', { status: 403 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        // Execute suggestion with streaming
        const result = await FeaturePlannerService.executeFeatureSuggestionAgent(
          job.input.pageOrComponent,
          job.input.featureType,
          job.input.priorityLevel,
          job.input.additionalContext,
          { customModel: job.input.customModel },
          undefined, // custom agent
          (partialText: string) => {
            sendEvent('delta', { text: partialText });
          }
        );

        sendEvent('complete', {
          suggestions: result.result.suggestions,
          tokenUsage: result.tokenUsage,
        });

        // Cleanup job from Redis
        await redis.del(`suggestion:${jobId}`);

        controller.close();
      } catch (error) {
        sendEvent('error', { message: error.message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**Step 3: React Hook Combines Both**

```typescript
// src/app/(app)/feature-planner/hooks/use-suggest-feature.ts
export const useSuggestFeature = () => {
  const [partialText, setPartialText] = useState('');
  const [suggestions, setSuggestions] = useState<Array<SuggestionResult> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { executeAsync: startJob } = useServerAction(startFeatureSuggestionAction);

  const invokeSuggestion = useCallback(async (input: {
    pageOrComponent: string;
    featureType: FeatureType;
    priorityLevel: PriorityLevel;
    additionalContext?: string;
    customModel?: string;
  }) => {
    setIsLoading(true);
    setPartialText('');
    setSuggestions(null);

    try {
      // Phase 1: Start job via server action
      const result = await startJob(input);
      if (!result?.data) return;

      const jobId = result.data.jobId;

      // Phase 2: Connect to SSE endpoint for streaming
      const response = await fetch(`/api/feature-planner/suggest-feature/${jobId}`);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event: (.+)$/m);
          const dataMatch = line.match(/^data: (.+)$/m);

          if (eventMatch && dataMatch) {
            const event = eventMatch[1];
            const data = JSON.parse(dataMatch[1]);

            if (event === 'delta') {
              setPartialText(prev => prev + data.text);
            } else if (event === 'complete') {
              setSuggestions(data.suggestions);
              setIsLoading(false);
            }
          }
        }
      }
    } catch (error) {
      setIsLoading(false);
      // Handle error
    }
  }, [startJob]);

  return {
    invokeSuggestion,
    partialText,
    suggestions,
    isLoading,
  };
};
```

### Pros & Cons

**Pros:**
- ✅ Best of both worlds: server action validation + SSE streaming
- ✅ Can use Next-Safe-Action for authorization/validation
- ✅ True real-time streaming (< 100ms latency)
- ✅ No database writes for partial updates
- ✅ Clean separation of concerns

**Cons:**
- ❌ Two separate endpoints (action + route)
- ❌ Need Redis or in-memory cache for job metadata
- ❌ Slightly more complex client code

## Recommendation

**Use Solution 3: Two-Phase Approach** for the best balance of:
- Developer experience (keeps server action pattern)
- User experience (real-time streaming)
- Performance (no database polling)
- Maintainability (clean architecture)

### Migration Steps

1. **Phase 1:** Add SSE route alongside existing server action
2. **Phase 2:** Update service to support streaming callback
3. **Phase 3:** Update React hook to use two-phase approach
4. **Phase 4:** Test thoroughly, then remove old server action
5. **Phase 5:** Add cancellation support (AbortController)

### Code Changes Required

| File | Changes | LOC |
|------|---------|-----|
| `feature-planner.service.ts` | Add streaming callback parameter | +30 |
| `feature-planner.actions.ts` | Add start job action | +50 |
| `/api/suggest-feature/[jobId]/route.ts` | New SSE endpoint | +120 |
| `use-suggest-feature.ts` | Update to two-phase flow | +60 |
| **Total** | | **~260 LOC** |

## Alternative: If You Must Keep Server Actions

If you absolutely cannot use API routes, the only option is **Solution 2: Polling**, but with optimizations:

### Optimized Polling Approach

1. **Use Upstash Redis** instead of database for job status (faster, cheaper)
2. **Adaptive polling:** Start at 500ms, increase to 2s after 10s
3. **Progressive updates:** Only send partial text every 5-10% progress
4. **WebSocket fallback:** Use Socket.io for real-time if Redis pubsub available

```typescript
// Adaptive polling in React hook
const pollWithBackoff = async (jobId: string) => {
  let interval = 500; // Start fast
  let elapsed = 0;

  while (true) {
    const status = await checkStatus({ jobId });

    if (status.data.status === 'completed' || status.data.status === 'failed') {
      break;
    }

    // Update UI
    setProgress(status.data.progress);
    setPartialText(status.data.partialText);

    // Exponential backoff after 10 seconds
    if (elapsed > 10000) {
      interval = Math.min(interval * 1.2, 2000);
    }

    await new Promise(resolve => setTimeout(resolve, interval));
    elapsed += interval;
  }
};
```

This reduces database load by 60-80% compared to fixed-interval polling.

## Conclusion

**Short answer:** No, you can't stream directly from server actions.

**Best solution:** Use the Two-Phase Approach (Solution 3) - server action for job creation + SSE endpoint for streaming.

**Simplest solution:** Polling (Solution 2) with Redis and adaptive intervals.

**Best UX:** Full SSE implementation (Solution 1) if you're willing to refactor away from server actions.

---

**Next Steps:**
1. Decide which solution fits your architecture
2. Implement streaming callback in service layer (required for all solutions)
3. Add chosen client-server communication pattern
4. Test with real Claude SDK queries
5. Monitor performance and costs
