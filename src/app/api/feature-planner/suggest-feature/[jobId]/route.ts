import type { NextRequest } from 'next/server';

import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

import type { JobMetadata } from '@/lib/validations/feature-planner.validation';

import {
  OPERATIONS,
  REDIS_KEYS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { FeaturePlannerService } from '@/lib/services/feature-planner.service';
import { RedisOperations } from '@/lib/utils/redis-client';
import { jobMetadataSchema } from '@/lib/validations/feature-planner.validation';
import { getUserId } from '@/utils/user-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * SSE endpoint for streaming feature suggestions
 * Phase 2 of two-phase streaming architecture
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;

  try {
    // ========================================================================
    // AUTHENTICATION & AUTHORIZATION
    // ========================================================================

    // Check user authentication
    const userId: string = await getUserId();

    // Retrieve job metadata from Redis
    const redisKey = REDIS_KEYS.JOBS.FEATURE_SUGGESTION(jobId);
    const jobDataStr = await RedisOperations.get(redisKey);

    if (!jobDataStr) {
      return new NextResponse('Job not found or expired', { status: 404 });
    }

    // Parse and validate job metadata
    let jobMetadata: JobMetadata;
    try {
      const parsed: unknown = JSON.parse(jobDataStr);
      jobMetadata = jobMetadataSchema.parse(parsed);
    } catch (parseError) {
      console.error('[SSE] Invalid job metadata:', parseError);
      return new NextResponse('Invalid job metadata', { status: 500 });
    }

    // Verify job ownership
    if (jobMetadata.userId !== userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // ========================================================================
    // SSE STREAM SETUP
    // ========================================================================

    const encoder = new TextEncoder();

    // Helper function to send SSE events
    const sendEvent = (event: string, data: unknown): string => {
      return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    };

    const stream = new ReadableStream({
      cancel() {
        console.log('[SSE] Client disconnected');
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: { jobId },
          level: SENTRY_LEVELS.INFO,
          message: 'SSE client disconnected',
        });
      },

      async start(controller) {
        try {
          // Send connected event
          controller.enqueue(
            encoder.encode(
              sendEvent('connected', {
                jobId,
                timestamp: Date.now(),
              }),
            ),
          );

          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: { jobId, userId },
            level: SENTRY_LEVELS.INFO,
            message: 'SSE connection established',
          });

          // Update job status to in_progress
          const updatedMetadata: JobMetadata = {
            ...jobMetadata,
            status: 'in_progress',
          };
          await RedisOperations.set(redisKey, JSON.stringify(updatedMetadata), 600);

          // ========================================================================
          // STREAMING EXECUTION
          // ========================================================================

          let accumulatedText = '';
          let lastUpdateTime = Date.now();

          // Streaming callback with throttling
          const handleUpdate = (text: string) => {
            accumulatedText += text;
            const now = Date.now();

            // Throttle updates to 100ms intervals
            if (now - lastUpdateTime >= 100) {
              controller.enqueue(
                encoder.encode(
                  sendEvent('delta', {
                    text: accumulatedText,
                    totalLength: accumulatedText.length,
                  }),
                ),
              );
              lastUpdateTime = now;
            }
          };

          // Get custom agent if available
          const dbAgent = await FeaturePlannerFacade.getFeatureSuggestionAgentAsync(userId);
          const customAgent =
            dbAgent ?
              {
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
                  ['Glob', 'Grep', 'Read'].includes(tool),
                ),
                updatedAt: dbAgent.updatedAt,
              }
            : undefined;

          // Execute feature suggestion agent with streaming
          const result = await FeaturePlannerService.executeFeatureSuggestionAgentWithStreaming(
            jobMetadata.input.pageOrComponent,
            jobMetadata.input.featureType,
            jobMetadata.input.priorityLevel,
            jobMetadata.input.additionalContext,
            { customModel: jobMetadata.input.customModel },
            customAgent,
            handleUpdate,
          );

          // Send final accumulated text if different from last update
          if (accumulatedText.length > 0) {
            controller.enqueue(
              encoder.encode(
                sendEvent('delta', {
                  text: accumulatedText,
                  totalLength: accumulatedText.length,
                }),
              ),
            );
          }

          // Send completion event
          controller.enqueue(
            encoder.encode(
              sendEvent('complete', {
                executionTimeMs: result.executionTimeMs,
                suggestions: result.result,
                tokenUsage: result.tokenUsage,
              }),
            ),
          );

          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: {
              executionTimeMs: result.executionTimeMs,
              jobId,
              suggestionCount: result.result.suggestions.length,
              tokenUsage: result.tokenUsage.totalTokens,
            },
            level: SENTRY_LEVELS.INFO,
            message: 'Feature suggestion completed',
          });

          // Update job status to completed and delete from Redis
          await RedisOperations.del(redisKey);

          controller.close();
        } catch (streamError) {
          console.error('[SSE] Error during streaming:', streamError);

          Sentry.captureException(streamError, {
            contexts: {
              [SENTRY_CONTEXTS.FEATURE_PLAN_DATA]: {
                jobId,
                operation: OPERATIONS.FEATURE_PLANNER.SUGGEST_FEATURE,
                userId,
              },
            },
            level: 'error',
          });

          // Send error event
          const errorMessage = streamError instanceof Error ? streamError.message : 'Unknown error occurred';
          controller.enqueue(
            encoder.encode(
              sendEvent('error', {
                message: errorMessage,
              }),
            ),
          );

          // Update job status to failed and keep for debugging (1 hour)
          const failedMetadata: JobMetadata = {
            ...jobMetadata,
            error: errorMessage,
            status: 'failed',
          };
          await RedisOperations.set(redisKey, JSON.stringify(failedMetadata), 3600);

          controller.close();
        }
      },
    });

    // Return SSE response with proper headers
    return new NextResponse(stream, {
      headers: {
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Content-Type': 'text/event-stream',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[SSE] Unexpected error:', error);

    Sentry.captureException(error, {
      contexts: {
        [SENTRY_CONTEXTS.FEATURE_PLAN_DATA]: {
          jobId,
          operation: OPERATIONS.FEATURE_PLANNER.SUGGEST_FEATURE,
        },
      },
      level: 'error',
    });

    return new NextResponse('Internal server error', { status: 500 });
  }
}
