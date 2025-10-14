# Two-Phase Streaming Solution - Deep Dive

**Date:** 2025-10-14
**Topic:** Detailed explanation of the Two-Phase approach for streaming with server actions

## Overview

The Two-Phase approach combines the best aspects of server actions (authentication, validation) with SSE streaming (real-time updates) by splitting the operation into two distinct phases:

**Phase 1:** Server action validates input, creates ephemeral job, returns immediately
**Phase 2:** Client connects to SSE endpoint using job ID, receives streaming updates

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Job Creation (Server Action)                                       │
└─────────────────────────────────────────────────────────────────────────────┘

User clicks          React Hook              Server Action              Redis/Memory
"Generate"               │                          │                          │
     │                   │                          │                          │
     ├─ onSubmit() ─────→│                          │                          │
     │                   ├─ executeAsync() ────────→│                          │
     │                   │                          ├─ Auth check (Clerk)      │
     │                   │                          ├─ Validate input (Zod)    │
     │                   │                          ├─ Generate jobId          │
     │                   │                          │    (crypto.randomUUID)   │
     │                   │                          │                          │
     │                   │                          ├─ Store metadata ────────→│
     │                   │                          │    key: "suggestion:uuid"│
     │                   │                          │    value: {              │
     │                   │                          │      userId,             │
     │                   │                          │      input,              │
     │                   │                          │      status: "pending",  │
     │                   │                          │      createdAt           │
     │                   │                          │    }                     │
     │                   │                          │    ttl: 600 seconds      │
     │                   │                          │                          │
     │                   │←─ { success, jobId } ────┤                          │
     │                   │                          │                          │
     │←─ setJobId() ─────┤                          │                          │
     │                   │                          │                          │
     │                   │    ⏱️ Response time: 50-100ms                        │


┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Streaming Execution (SSE Endpoint)                                 │
└─────────────────────────────────────────────────────────────────────────────┘

React Hook           SSE Endpoint                 Claude SDK           Redis/Memory
     │                    │                            │                     │
     ├─ fetch() ─────────→│                            │                     │
     │  GET /api/         │                            │                     │
     │  suggest/[jobId]   │                            │                     │
     │                    ├─ Auth check (Clerk)        │                     │
     │                    ├─ Get metadata ────────────→│                     │
     │                    │←─ job data ────────────────┤                     │
     │                    ├─ Verify userId match       │                     │
     │                    │                            │                     │
     │                    ├─ Create ReadableStream     │                     │
     │                    ├─ query() ─────────────────→│                     │
     │                    │    with callback           │                     │
     │                    │                            │                     │
     │←─ SSE: connected ──┤                            │                     │
     │                    │                            │                     │
     │                    │                            ├─ Read CLAUDE.md     │
     │                    │                            ├─ Read files         │
     │                    │                            ├─ Process request    │
     │                    │                            │                     │
     │                    │←─ stream_event ────────────┤                     │
     │                    │    { delta: "Add a " }     │                     │
     │←─ event: delta ────┤                            │                     │
     │  data: "Add a "    │                            │                     │
     │                    │                            │                     │
     │                    │←─ stream_event ────────────┤                     │
     │                    │    { delta: "favorites " } │                     │
     │←─ event: delta ────┤                            │                     │
     │  data: "favorites "│                            │                     │
     │                    │                            │                     │
     │ (repeats 50-100x)  │                            │                     │
     │                    │                            │                     │
     │                    │←─ assistant message ───────┤                     │
     │                    │    { final result }        │                     │
     │←─ event: complete ─┤                            │                     │
     │  data: {           │                            │                     │
     │    suggestions,    │                            │                     │
     │    tokenUsage      │                            │                     │
     │  }                 │                            │                     │
     │                    │                            │                     │
     │                    ├─ Delete job ──────────────→│                     │
     │                    ├─ Close stream              │                     │
     │←─ connection close ┤                            │                     │
     │                    │                            │                     │
     │                    │    ⏱️ Total time: 30-45 seconds                  │


┌─────────────────────────────────────────────────────────────────────────────┐
│ UI STATE TRANSITIONS                                                         │
└─────────────────────────────────────────────────────────────────────────────┘

Timeline    State              UI Display
─────────────────────────────────────────────────────────────────────────────
t=0s        idle              [Generate Suggestions] button enabled
            │
t=0.05s     creating          "Creating job..." (brief flash)
            │
t=0.1s      connecting        "Connecting to AI..." spinner
            │
t=0.5s      streaming         "Generating suggestions..."
            partialText=""    │
            │                 ├─ Progressive text display:
t=2s        streaming         │   "Add a favorites feature..."
            partialText=      │
            "Add a..."        │
            │                 │
t=5s        streaming         ├─ "Add a favorites feature that
            partialText=      │    allows users to bookmark..."
            "Add a fav..."    │
            │                 │
t=30s       complete          ✓ Final suggestions display:
            suggestions=[...] │
                              ├─ Suggestion 1: Favorites Feature
                              ├─ Suggestion 2: Quick Actions
                              └─ Suggestion 3: Bulk Operations
```

## Detailed Implementation

### Phase 1: Server Action (Job Creation)

**Purpose:** Validate, authorize, and create ephemeral job metadata

#### File: `src/lib/actions/feature-planner/feature-planner.actions.ts`

```typescript
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Redis } from '@upstash/redis';

// Initialize Redis client (or use in-memory Map for development)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface JobMetadata {
  userId: string;
  input: {
    pageOrComponent: string;
    featureType: string;
    priorityLevel: string;
    additionalContext?: string;
    customModel?: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: number;
}

/**
 * Phase 1: Create feature suggestion job
 * Returns immediately with jobId for client to connect to SSE endpoint
 */
export const startFeatureSuggestionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.START_SUGGESTION,
    isTransactionRequired: false,
  })
  .inputSchema(
    z.object({
      pageOrComponent: z.string().min(1).max(200),
      featureType: z.enum(['enhancement', 'new-capability', 'optimization', 'ui-improvement', 'integration']),
      priorityLevel: z.enum(['low', 'medium', 'high', 'critical']),
      additionalContext: z.string().max(1000).optional(),
      customModel: z.string().optional(),
    })
  )
  .action(async ({ ctx }) => {
    const input = ctx.sanitizedInput;
    const userId = ctx.userId;

    try {
      // Generate unique job ID
      const jobId = crypto.randomUUID();

      // Create job metadata
      const jobMetadata: JobMetadata = {
        userId,
        input,
        status: 'pending',
        createdAt: Date.now(),
      };

      // Store in Redis with 10-minute expiration
      // This ensures cleanup even if client disconnects
      await redis.set(
        `suggestion:${jobId}`,
        JSON.stringify(jobMetadata),
        { ex: 600 } // Expire after 10 minutes
      );

      // Log for monitoring
      console.log(`[startFeatureSuggestion] Created job ${jobId} for user ${userId}`);

      // Track in Sentry for analytics
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { jobId, featureType: input.featureType },
        level: SENTRY_LEVELS.INFO,
        message: `Created suggestion job: ${jobId}`,
      });

      // Return immediately - client will connect to SSE endpoint
      return {
        success: true,
        data: { jobId },
      };
    } catch (error) {
      return handleActionError(error, {
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.START_SUGGESTION },
        operation: OPERATIONS.FEATURE_PLANNER.START_SUGGESTION,
        userId,
      });
    }
  });
```

**Key Points:**
- ✅ Returns in 50-100ms (no AI execution)
- ✅ Uses server action for authentication/validation
- ✅ Works with Next-Safe-Action helpers
- ✅ Job metadata stored in Redis
- ✅ Auto-expires after 30 minutes (cleanup)

### Phase 2: SSE Endpoint (Streaming Execution)

**Purpose:** Execute Claude SDK query with real-time streaming updates

#### File: `src/app/api/feature-planner/suggest-feature/[jobId]/route.ts`

```typescript
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { FeaturePlannerService } from '@/lib/services/feature-planner.service';
import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { db } from '@/lib/db';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const runtime = 'nodejs'; // Required for streaming
export const dynamic = 'force-dynamic'; // Disable caching

/**
 * Phase 2: Stream feature suggestions via SSE
 * GET /api/feature-planner/suggest-feature/[jobId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  // ─────────────────────────────────────────────────────────────
  // STEP 1: Authentication & Authorization
  // ─────────────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { jobId } = params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(jobId)) {
    return new Response('Invalid job ID format', { status: 400 });
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 2: Retrieve & Verify Job Metadata
  // ─────────────────────────────────────────────────────────────
  const jobDataStr = await redis.get<string>(`suggestion:${jobId}`);
  if (!jobDataStr) {
    return new Response('Job not found or expired', { status: 404 });
  }

  const jobData = JSON.parse(jobDataStr) as JobMetadata;

  // Verify job belongs to requesting user
  if (jobData.userId !== userId) {
    console.warn(`[SSE] User ${userId} attempted to access job ${jobId} owned by ${jobData.userId}`);
    return new Response('Forbidden', { status: 403 });
  }

  // Check if job already completed
  if (jobData.status === 'completed' || jobData.status === 'failed') {
    return new Response('Job already completed', { status: 410 });
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 3: Create SSE Stream
  // ─────────────────────────────────────────────────────────────
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Helper function to send SSE events
      const sendEvent = (event: string, data: unknown) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial connection confirmation
      sendEvent('connected', { jobId, timestamp: Date.now() });

      try {
        // Update job status to in_progress
        await redis.set(
          `suggestion:${jobId}`,
          JSON.stringify({ ...jobData, status: 'in_progress' }),
          { ex: 600 }
        );

        // ─────────────────────────────────────────────────────────
        // STEP 4: Get Custom Agent (if configured)
        // ─────────────────────────────────────────────────────────
        const dbAgent = await FeaturePlannerFacade.getFeatureSuggestionAgentAsync(userId, db);
        const customAgent = dbAgent
          ? {
              agentId: dbAgent.agentId,
              agentType: 'feature-suggestion' as const,
              createdAt: dbAgent.createdAt,
              focus: dbAgent.focus,
              isActive: dbAgent.isActive,
              name: dbAgent.name,
              role: dbAgent.role,
              systemPrompt: dbAgent.systemPrompt,
              temperature: Number(dbAgent.temperature),
              tools: dbAgent.tools.filter((tool): tool is 'Glob' | 'Grep' | 'Read' =>
                ['Glob', 'Grep', 'Read'].includes(tool)
              ),
              updatedAt: dbAgent.updatedAt,
            }
          : undefined;

        // ─────────────────────────────────────────────────────────
        // STEP 5: Execute Claude SDK with Streaming Callback
        // ─────────────────────────────────────────────────────────
        let lastUpdateTime = Date.now();
        let accumulatedText = '';

        const result = await FeaturePlannerService.executeFeatureSuggestionAgent(
          jobData.input.pageOrComponent,
          jobData.input.featureType,
          jobData.input.priorityLevel,
          jobData.input.additionalContext,
          { customModel: jobData.input.customModel },
          customAgent,
          // ✅ Streaming callback - called for each text delta
          (partialText: string) => {
            accumulatedText += partialText;

            // Throttle updates to every 100ms (avoid overwhelming client)
            const now = Date.now();
            if (now - lastUpdateTime >= 100) {
              sendEvent('delta', {
                text: partialText,
                totalLength: accumulatedText.length,
                timestamp: now,
              });
              lastUpdateTime = now;
            }
          }
        );

        // ─────────────────────────────────────────────────────────
        // STEP 6: Send Final Complete Event
        // ─────────────────────────────────────────────────────────
        sendEvent('complete', {
          suggestions: result.result.suggestions,
          context: result.result.context,
          tokenUsage: result.tokenUsage,
          executionTimeMs: result.executionTimeMs,
          retryCount: result.retryCount,
          timestamp: Date.now(),
        });

        // ─────────────────────────────────────────────────────────
        // STEP 7: Cleanup
        // ─────────────────────────────────────────────────────────
        // Delete job from Redis (completed successfully)
        await redis.del(`suggestion:${jobId}`);

        // Log success
        console.log(`[SSE] Completed job ${jobId} for user ${userId}`, {
          suggestionsCount: result.result.suggestions.length,
          executionTimeMs: result.executionTimeMs,
          tokenUsage: result.tokenUsage,
        });

        // Close stream
        controller.close();
      } catch (error) {
        // ─────────────────────────────────────────────────────────
        // STEP 8: Error Handling
        // ─────────────────────────────────────────────────────────
        console.error(`[SSE] Error in job ${jobId}:`, error);

        // Send error event to client
        sendEvent('error', {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'EXECUTION_ERROR',
          timestamp: Date.now(),
        });

        // Update job status to failed
        await redis.set(
          `suggestion:${jobId}`,
          JSON.stringify({
            ...jobData,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
          { ex: 3600 } // Keep failed jobs for 1 hour for debugging
        );

        // Close stream
        controller.close();
      }
    },

    // Handle client disconnect
    cancel() {
      console.log(`[SSE] Client disconnected from job ${jobId}`);
      // Cleanup could happen here if needed
    },
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 9: Return SSE Response
  // ─────────────────────────────────────────────────────────────
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
```

**Key Points:**
- ✅ Authenticates every connection (no session hijacking)
- ✅ Verifies job ownership (security)
- ✅ Throttles updates to 100ms intervals (performance)
- ✅ Handles errors gracefully
- ✅ Auto-cleanup on completion
- ✅ Supports client disconnect

### React Hook Implementation

**Purpose:** Coordinate both phases and manage UI state

#### File: `src/app/(app)/feature-planner/hooks/use-suggest-feature.ts`

```typescript
'use client';

import { useCallback, useRef, useState } from 'react';
import { useServerAction } from '@/hooks/use-server-action';
import { startFeatureSuggestionAction } from '@/lib/actions/feature-planner/feature-planner.actions';

interface SuggestionResult {
  title: string;
  rationale: string;
  description: string;
  implementationConsiderations?: string[];
}

interface UseSuggestFeatureReturn {
  invokeSuggestion: (input: SuggestionInput) => Promise<void>;
  cancelSuggestion: () => void;
  suggestions: SuggestionResult[] | null;
  partialText: string;
  progress: number;
  status: 'idle' | 'creating' | 'connecting' | 'streaming' | 'complete' | 'error';
  error: string | null;
  tokenUsage: TokenUsage | null;
}

export const useSuggestFeature = (): UseSuggestFeatureReturn => {
  // ─────────────────────────────────────────────────────────────
  // State Management
  // ─────────────────────────────────────────────────────────────
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'creating' | 'connecting' | 'streaming' | 'complete' | 'error'>('idle');
  const [partialText, setPartialText] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<SuggestionResult[] | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ref to track reader for cancellation
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Phase 1: Create Job via Server Action
  // ─────────────────────────────────────────────────────────────
  const { executeAsync: createJob } = useServerAction(startFeatureSuggestionAction, {
    onError: ({ error }) => {
      setStatus('error');
      setError(
        typeof error.serverError === 'string'
          ? error.serverError
          : 'Failed to start suggestion generation'
      );
    },
  });

  // ─────────────────────────────────────────────────────────────
  // Phase 2: Connect to SSE Endpoint
  // ─────────────────────────────────────────────────────────────
  const connectToStream = useCallback(async (jobId: string) => {
    setStatus('connecting');

    try {
      const response = await fetch(`/api/feature-planner/suggest-feature/${jobId}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Get reader for streaming
      const reader = response.body.getReader();
      readerRef.current = reader;

      const decoder = new TextDecoder();
      let buffer = '';

      // Update status to streaming
      setStatus('streaming');

      // Read stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[SSE] Stream ended');
          break;
        }

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages (separated by \n\n)
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || ''; // Keep incomplete message in buffer

        for (const message of messages) {
          if (!message.trim()) continue;

          // Parse SSE format: "event: xxx\ndata: {...}"
          const eventMatch = message.match(/^event:\s*(.+)$/m);
          const dataMatch = message.match(/^data:\s*(.+)$/m);

          if (!eventMatch || !dataMatch) {
            console.warn('[SSE] Invalid message format:', message.substring(0, 100));
            continue;
          }

          const event = eventMatch[1].trim();
          const data = JSON.parse(dataMatch[1]);

          // Handle different event types
          switch (event) {
            case 'connected':
              console.log('[SSE] Connected to stream:', data);
              break;

            case 'delta':
              // Accumulate partial text
              setPartialText((prev) => prev + data.text);

              // Estimate progress based on text length
              // Typical suggestion is ~2000 characters
              const estimatedProgress = Math.min(
                95,
                Math.floor((data.totalLength / 2000) * 100)
              );
              setProgress(estimatedProgress);
              break;

            case 'complete':
              // Final suggestions received
              console.log('[SSE] Suggestions complete:', data);
              setSuggestions(data.suggestions);
              setTokenUsage(data.tokenUsage);
              setProgress(100);
              setStatus('complete');
              break;

            case 'error':
              console.error('[SSE] Error event:', data);
              setError(data.message);
              setStatus('error');
              break;

            default:
              console.warn('[SSE] Unknown event type:', event);
          }
        }
      }
    } catch (err) {
      console.error('[SSE] Stream error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Streaming failed');
    } finally {
      readerRef.current = null;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Public API: Invoke Suggestion
  // ─────────────────────────────────────────────────────────────
  const invokeSuggestion = useCallback(
    async (input: SuggestionInput) => {
      // Reset state
      setStatus('creating');
      setJobId(null);
      setPartialText('');
      setProgress(0);
      setSuggestions(null);
      setTokenUsage(null);
      setError(null);

      try {
        // Phase 1: Create job via server action
        const result = await createJob(input);

        if (!result?.data?.jobId) {
          throw new Error('Failed to create job');
        }

        const newJobId = result.data.jobId;
        setJobId(newJobId);

        // Phase 2: Connect to SSE stream
        await connectToStream(newJobId);
      } catch (err) {
        console.error('[useSuggestFeature] Error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [createJob, connectToStream]
  );

  // ─────────────────────────────────────────────────────────────
  // Public API: Cancel Suggestion
  // ─────────────────────────────────────────────────────────────
  const cancelSuggestion = useCallback(() => {
    if (readerRef.current) {
      console.log('[useSuggestFeature] Cancelling stream');
      readerRef.current.cancel();
      readerRef.current = null;
    }

    setStatus('idle');
    setPartialText('');
    setProgress(0);
  }, []);

  return {
    invokeSuggestion,
    cancelSuggestion,
    suggestions,
    partialText,
    progress,
    status,
    error,
    tokenUsage,
  };
};
```

**Key Points:**
- ✅ Manages complex state machine (idle → creating → connecting → streaming → complete)
- ✅ Handles SSE message parsing
- ✅ Supports cancellation
- ✅ Estimates progress from text length
- ✅ Proper cleanup on unmount

### UI Component

**Purpose:** Display streaming updates with progressive enhancement

#### File: `src/app/(app)/feature-planner/components/feature-suggestion-form.tsx`

```typescript
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSuggestFeature } from '../hooks/use-suggest-feature';

export function FeatureSuggestionForm() {
  const {
    invokeSuggestion,
    cancelSuggestion,
    suggestions,
    partialText,
    progress,
    status,
    error,
  } = useSuggestFeature();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    invokeSuggestion({
      pageOrComponent: 'Collections page',
      featureType: 'enhancement',
      priorityLevel: 'high',
    });
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* ... form inputs ... */}

        <Button type="submit" disabled={status !== 'idle' && status !== 'complete'}>
          {status === 'idle' || status === 'complete' ? 'Generate Suggestions' : 'Generating...'}
        </Button>

        {(status === 'creating' || status === 'connecting' || status === 'streaming') && (
          <Button type="button" variant="outline" onClick={cancelSuggestion}>
            Cancel
          </Button>
        )}
      </form>

      {/* Status Display */}
      {status === 'creating' && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Creating job...</p>
          </CardContent>
        </Card>
      )}

      {status === 'connecting' && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Connecting to AI...</p>
            <Progress value={0} className="mt-2" />
          </CardContent>
        </Card>
      )}

      {/* Streaming Display */}
      {status === 'streaming' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generating suggestions...</span>
              <span className="text-sm font-normal text-muted-foreground">
                {progress}%
              </span>
            </CardTitle>
            <CardDescription>
              AI is analyzing your request and generating tailored suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />

            {/* Show partial text as it streams */}
            {partialText && (
              <div className="rounded-lg bg-muted p-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap font-mono text-xs">
                    {partialText}
                    <span className="animate-pulse">▋</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {status === 'error' && error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Final Results */}
      {status === 'complete' && suggestions && (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{suggestion.title}</CardTitle>
                <CardDescription>{suggestion.rationale}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{suggestion.description}</p>
                {suggestion.implementationConsiderations && (
                  <ul className="mt-4 space-y-2">
                    {suggestion.implementationConsiderations.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {item}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Security Considerations

### 1. Authentication at Both Phases

**Phase 1 (Server Action):**
```typescript
// Automatic via Next-Safe-Action + Clerk
const userId = ctx.userId; // Guaranteed authenticated
```

**Phase 2 (SSE Endpoint):**
```typescript
// Must authenticate again - different HTTP request
const { userId } = await auth();
if (!userId) return new Response('Unauthorized', { status: 401 });
```

### 2. Job Ownership Verification

```typescript
// Verify job belongs to requesting user
if (jobData.userId !== userId) {
  console.warn(`User ${userId} attempted to access job ${jobId} owned by ${jobData.userId}`);
  return new Response('Forbidden', { status: 403 });
}
```

### 3. Job Expiration

```typescript
// Auto-expire jobs after 10 minutes
await redis.set(`suggestion:${jobId}`, data, { ex: 600 });
```

**Why this matters:**
- Prevents accumulation of orphaned jobs
- Limits time window for potential replay attacks
- Automatic cleanup

### 4. Rate Limiting

Add rate limiting at both phases:

```typescript
// Phase 1: Server action (via middleware)
// Allow 10 jobs per user per minute

// Phase 2: SSE endpoint
// Allow 5 concurrent connections per user
```

## Performance Optimizations

### 1. Update Throttling

```typescript
// Only send updates every 100ms
let lastUpdateTime = Date.now();

const onUpdate = (text: string) => {
  const now = Date.now();
  if (now - lastUpdateTime >= 100) {
    sendEvent('delta', { text });
    lastUpdateTime = now;
  }
};
```

**Why:** Prevents overwhelming client with 100+ updates per second

### 2. Redis vs In-Memory

**Development:**
```typescript
// Use in-memory Map (simple, no dependencies)
const jobStore = new Map<string, JobMetadata>();
```

**Production:**
```typescript
// Use Redis (distributed, persistent)
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL });
```

**Tradeoffs:**

| Aspect | In-Memory | Redis |
|--------|-----------|-------|
| Speed | Faster (no network) | Slightly slower |
| Scalability | Single server only | Multi-server support |
| Persistence | Lost on restart | Persists |
| Cost | Free | $3-10/month |

### 3. Connection Pooling

SSE connections are long-lived (30-45 seconds). Ensure your server can handle concurrent connections:

**Next.js Config:**
```javascript
// next.config.js
module.exports = {
  experimental: {
    // Increase max event loop lag for long-running requests
    workerThreads: false,
    cpus: 1,
  },
};
```

## Error Handling

### Client Disconnect

```typescript
// In ReadableStream
cancel() {
  console.log('[SSE] Client disconnected');
  // Optional: Mark job as cancelled in Redis
  await redis.set(
    `suggestion:${jobId}`,
    JSON.stringify({ ...jobData, status: 'cancelled' }),
    { ex: 3600 }
  );
}
```

### Network Errors

```typescript
// In React hook
try {
  await connectToStream(jobId);
} catch (err) {
  if (err.name === 'AbortError') {
    // User cancelled - not an error
    return;
  }

  setError('Network error. Please check your connection.');
}
```

### Timeout Handling

```typescript
// Add timeout to SSE connection
const timeout = setTimeout(() => {
  if (readerRef.current) {
    readerRef.current.cancel();
    setError('Request timed out after 2 minutes');
  }
}, 120000); // 2 minutes

// Clear timeout on completion
clearTimeout(timeout);
```

## Testing Strategy

### Unit Tests

```typescript
// Test job creation
describe('startFeatureSuggestionAction', () => {
  it('should create job with valid input', async () => {
    const result = await startFeatureSuggestionAction({
      pageOrComponent: 'Collections',
      featureType: 'enhancement',
      priorityLevel: 'high',
    });

    expect(result.success).toBe(true);
    expect(result.data.jobId).toMatch(UUID_REGEX);
  });

  it('should reject invalid feature type', async () => {
    const result = await startFeatureSuggestionAction({
      pageOrComponent: 'Collections',
      featureType: 'invalid',
      priorityLevel: 'high',
    });

    expect(result.success).toBe(false);
  });
});
```

### Integration Tests

```typescript
// Test complete flow
describe('Two-Phase Suggestion Flow', () => {
  it('should stream suggestions successfully', async () => {
    // Phase 1: Create job
    const { jobId } = await createJob({ /* ... */ });

    // Phase 2: Connect to stream
    const events: Array<{ event: string; data: unknown }> = [];

    await fetch(`/api/suggest-feature/${jobId}`, {
      onMessage: (event, data) => {
        events.push({ event, data });
      },
    });

    // Verify event sequence
    expect(events[0].event).toBe('connected');
    expect(events.slice(1, -1).every(e => e.event === 'delta')).toBe(true);
    expect(events[events.length - 1].event).toBe('complete');
  });
});
```

### E2E Tests

```typescript
// Using Playwright
test('should generate suggestions with streaming', async ({ page }) => {
  await page.goto('/feature-planner');

  // Fill form
  await page.fill('[name="pageOrComponent"]', 'Collections');
  await page.selectOption('[name="featureType"]', 'enhancement');

  // Start generation
  await page.click('button:has-text("Generate Suggestions")');

  // Verify streaming UI
  await expect(page.locator('text=Generating suggestions...')).toBeVisible();
  await expect(page.locator('.progress-bar')).toBeVisible();

  // Wait for completion
  await expect(page.locator('text=Suggestion 1')).toBeVisible({ timeout: 60000 });

  // Verify results
  const suggestions = await page.locator('.suggestion-card').count();
  expect(suggestions).toBeGreaterThanOrEqual(3);
});
```

## Comparison with Alternatives

| Aspect | Two-Phase (Recommended) | Pure SSE | Polling | WebSocket |
|--------|-------------------------|----------|---------|-----------|
| Setup Complexity | Medium | Medium | Low | High |
| Authentication | ✅ Both phases | ⚠️ SSE only | ✅ Both phases | ⚠️ Complex |
| Real-time Updates | ✅ Yes (< 100ms) | ✅ Yes (< 100ms) | ⚠️ Delayed (1-2s) | ✅ Yes |
| Server Action Support | ✅ Yes (Phase 1) | ❌ No | ✅ Yes | ❌ No |
| Database Load | ✅ Minimal | ✅ None | ❌ High | ✅ None |
| Cancellation | ✅ Easy | ✅ Easy | ⚠️ Complex | ✅ Easy |
| Infrastructure | Redis optional | None | Database required | Socket server |
| Production Ready | ✅ Yes | ✅ Yes | ⚠️ Needs optimization | ⚠️ Complex |

## Summary

The Two-Phase approach provides the optimal balance of:

1. **Developer Experience:** Keep server actions for validation
2. **User Experience:** Real-time streaming updates
3. **Security:** Authentication at both phases
4. **Performance:** No database polling, minimal overhead
5. **Maintainability:** Clear separation of concerns

**Total implementation:** ~260 lines of code
**Response time:** 50-100ms (Phase 1) + 30-45s (Phase 2)
**Infrastructure:** Next.js + Redis (optional)

---

**Next Steps:**
1. Implement Phase 1 (server action)
2. Implement Phase 2 (SSE endpoint)
3. Update React hook for two-phase flow
4. Add cancellation support
5. Deploy and monitor performance
