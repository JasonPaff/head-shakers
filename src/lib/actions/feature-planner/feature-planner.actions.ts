'use server';

import 'server-only';
import { query } from '@anthropic-ai/claude-code';
import * as Sentry from '@sentry/nextjs';

import {
  ACTION_NAMES,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { publicActionClient } from '@/lib/utils/next-safe-action';
import {
  featureRefinementRequestSchema,
  parallelRefinementRequestSchema,
  type FeatureRefinementResponse,
  type ParallelRefinementResponse,
  type RefinementResult,
  type RefinementSettings,
} from '@/lib/validations/feature-planner.validation';

type QueryMessage = ResultMessage | StreamEventMessage | { type: string };

interface ResultMessage {
  subtype?: string;
  type: 'result';
}

interface StreamEventMessage {
  event?: {
    delta?: {
      text?: string;
      type: string;
    };
    type: string;
  };
  type: 'stream_event';
}

function isResultMessage(message: QueryMessage): message is ResultMessage {
  return message.type === 'result';
}

function isStreamEventMessage(message: QueryMessage): message is StreamEventMessage {
  return message.type === 'stream_event';
}

export const refineFeatureRequestAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.REFINE_REQUEST,
  })
  .inputSchema(featureRefinementRequestSchema)
  .action(async ({ ctx, parsedInput }): Promise<FeatureRefinementResponse> => {
    const { options, originalRequest } = featureRefinementRequestSchema.parse(ctx.sanitizedInput);

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
      data: {
        action: ACTION_NAMES.FEATURE_PLANNER.REFINE_REQUEST,
        options,
        requestLength: originalRequest.length,
      },
      level: SENTRY_LEVELS.INFO,
      message: 'Starting feature request refinement',
    });

    const { maxRetries = 2, shouldFallbackToSimplePrompt = true, timeoutMs = 30000 } = options || {};

    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        Sentry.setContext(SENTRY_CONTEXTS.ACTION_METADATA, {
          attempt,
          isRetry: attempt > 1,
          maxRetries,
        });

        const isRetry = attempt > 1;
        const shouldUseSimplePrompt = shouldFallbackToSimplePrompt && isRetry;

        // Choose a prompt based on the attempt and options
        const refinementPrompt =
          shouldUseSimplePrompt ?
            `Please refine this feature request for a Next.js TypeScript application by adding relevant technical context while preserving the original scope:

"${originalRequest}"

Output only a single enhanced paragraph (100-250 words) that includes:
- Specific technologies that should be used
- Integration points with existing systems
- Implementation approach

Enhanced request:`
          : `You are a feature request refinement specialist working on the Head Shakers bobblehead collection platform. Your job is to take a user's feature request and add MINIMAL project context to make it clearer for subsequent analysis stages.

## Project Context
The Head Shakers platform is built with:
- **Next.js 15.5.3** with App Router and TypeScript
- **Authentication**: Clerk with themes support
- **Database**: PostgreSQL with Neon serverless and Drizzle ORM
- **UI**: Radix UI components with Tailwind CSS 4
- **Forms**: TanStack React Form with Next-Safe-Action server actions
- **Validation**: Zod schemas throughout the stack
- **State**: TanStack Query for server state, Nuqs for URL state

## Your Task
Refine this user request by adding essential technical context while preserving the exact functionality requested:

**Original Request:** ${originalRequest}

## Refinement Guidelines
- Preserve the exact functionality requested - do not add features
- Mention relevant technologies from the project stack
- Identify integration points with existing systems
- Keep scope exactly as specified
- Output ONLY a refined paragraph (100-250 words)
- No headers, bullet points, or analysis - just the enhanced request

Generate a refined feature request that helps subsequent analysis understand what needs to be implemented and how it integrates with the existing Head Shakers codebase.`;

        let refinedRequest = '';
        const abortController = new AbortController();

        // create timeout with proper cleanup
        const timeoutId = setTimeout(() => {
          abortController.abort();
        }, timeoutMs);

        try {
          // execute the query with abort signal
          const queryPromise = (async () => {
            try {
              for await (const message of query({
                options: {
                  allowedTools: [],
                  includePartialMessages: true,
                  maxTurns: 1,
                  permissionMode: 'bypassPermissions',
                },
                prompt: refinementPrompt,
              })) {
                // check for abort signal
                if (abortController.signal.aborted) {
                  break;
                }

                const queryMessage = message as QueryMessage;

                if (isStreamEventMessage(queryMessage)) {
                  const event = queryMessage.event;
                  if (
                    event?.type === 'content_block_delta' &&
                    event.delta?.type === 'text_delta' &&
                    typeof event.delta.text === 'string'
                  ) {
                    refinedRequest += event.delta.text;
                  }
                }

                if (isResultMessage(queryMessage)) {
                  if (queryMessage.subtype === 'success') {
                    break;
                  } else {
                    throw new Error(`Refinement failed: ${queryMessage.subtype}`);
                  }
                }
              }
            } catch (error) {
              if (abortController.signal.aborted) {
                throw new ActionError(
                  ErrorType.EXTERNAL_SERVICE,
                  ERROR_CODES.FEATURE_PLANNER.REFINEMENT_TIMEOUT,
                  ERROR_MESSAGES.FEATURE_PLANNER.REFINEMENT_TIMEOUT,
                  { attempt, operation: OPERATIONS.FEATURE_PLANNER.REFINE_REQUEST, parsedInput },
                  true,
                  408,
                );
              }

              // Wrap unknown errors with context
              const errorMessage = error instanceof Error ? error.message : 'Unknown SDK error';
              throw new ActionError(
                ErrorType.EXTERNAL_SERVICE,
                ERROR_CODES.FEATURE_PLANNER.SDK_ERROR,
                `SDK query failed: ${errorMessage}`,
                { attempt, operation: OPERATIONS.FEATURE_PLANNER.REFINE_REQUEST, parsedInput },
                true,
                500,
              );
            }
          })();

          await queryPromise;
        } finally {
          // always clean up timeout
          clearTimeout(timeoutId);
        }

        if (!refinedRequest.trim()) {
          throw new ActionError(
            ErrorType.EXTERNAL_SERVICE,
            ERROR_CODES.FEATURE_PLANNER.SDK_ERROR,
            'No refinement response received from Claude',
            { operation: OPERATIONS.FEATURE_PLANNER.REFINE_REQUEST, parsedInput },
            true,
            500,
          );
        }

        // validation logic
        const wordCount = refinedRequest.trim().split(/\s+/).length;
        if (wordCount < 20) {
          throw new ActionError(
            ErrorType.VALIDATION,
            ERROR_CODES.FEATURE_PLANNER.REFINEMENT_TOO_SHORT,
            ERROR_MESSAGES.FEATURE_PLANNER.REFINEMENT_TOO_SHORT,
            { operation: OPERATIONS.FEATURE_PLANNER.REFINE_REQUEST, parsedInput },
            true,
            400,
          );
        }

        if (wordCount > 300) {
          const words = refinedRequest.trim().split(/\s+/);
          const trimmedRequest = words.slice(0, 250).join(' ') + '...';

          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
            data: { originalWordCount: wordCount, trimmedWordCount: 250 },
            level: SENTRY_LEVELS.INFO,
            message: 'Refinement longer than recommended, trimmed',
          });

          return {
            isSuccess: true,
            refinedRequest: trimmedRequest,
          };
        }

        // clean up and sanitize the refinement
        const cleanedRequest = refinedRequest
          .trim()
          .replace(/^\*\*.*?\*\*:?\s*/, '') // remove any markdown headers
          .replace(/^#+\s*.*?\n/, '') // remove any markdown headers
          .replace(/\n+/g, ' ') // replace newlines with spaces
          .replace(/\s+/g, ' ') // normalize whitespace
          .replace(/<[^>]*>/g, '') // remove any HTML tags
          .split('')
          .filter((char) => {
            const code = char.charCodeAt(0);
            return !(code >= 0 && code <= 31) && code !== 127;
          })
          .join('')
          .substring(0, 1000);

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
          data: {
            attempt,
            originalLength: originalRequest.length,
            refinedLength: cleanedRequest.length,
            wordCount,
          },
          level: SENTRY_LEVELS.INFO,
          message: 'Feature request refinement completed successfully',
        });

        return {
          isSuccess: true,
          refinedRequest: cleanedRequest,
          retryCount: attempt - 1,
        };
      } catch (err) {
        lastError = err;
        const errorInstance = err instanceof Error ? err : new Error('Unknown error occurred');

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
          data: {
            attempt,
            error: errorInstance.message,
            willRetry: attempt <= maxRetries,
          },
          level: SENTRY_LEVELS.WARNING,
          message: `Refinement attempt ${attempt} failed`,
        });

        if (attempt > maxRetries) {
          // all retries exhausted, rethrow if it's an ActionError, otherwise wrap it
          if (lastError instanceof ActionError) {
            throw lastError;
          }

          throw new ActionError(
            ErrorType.EXTERNAL_SERVICE,
            ERROR_CODES.FEATURE_PLANNER.REFINEMENT_FAILED,
            ERROR_MESSAGES.FEATURE_PLANNER.REFINEMENT_FAILED,
            { operation: OPERATIONS.FEATURE_PLANNER.REFINE_REQUEST, parsedInput },
            true,
            500,
          );
        }

        // exponential backoff: wait 1s, 2s, 4s, etc.
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    const errorMessage =
      lastError instanceof Error ? lastError.message : 'Unknown error occurred after all retries';
    throw new ActionError(
      ErrorType.INTERNAL,
      ERROR_CODES.FEATURE_PLANNER.REFINEMENT_FAILED,
      errorMessage,
      { operation: OPERATIONS.FEATURE_PLANNER.REFINE_REQUEST, parsedInput },
      false,
      500,
    );
  });
