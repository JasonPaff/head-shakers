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
  type FeatureRefinementResponse,
  parallelRefinementRequestSchema,
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

async function buildRefinementPrompt(originalRequest: string, settings: RefinementSettings, agentVariant?: number): Promise<string> {
  // Read project context files
  let claudeMdContent = '';
  let packageJsonContent = '';

  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const projectRoot = process.cwd();

    claudeMdContent = await fs.readFile(path.join(projectRoot, 'CLAUDE.md'), 'utf-8');
    packageJsonContent = await fs.readFile(path.join(projectRoot, 'package.json'), 'utf-8');
  } catch {
    // If files can't be read, proceed without project context
    claudeMdContent = 'Project documentation not available';
    packageJsonContent = 'Package configuration not available';
  }

  const styleInstructions = {
    balanced: 'Add balanced technical context following the project patterns',
    conservative: 'Be conservative and minimal in adding technical context',
    detailed: 'Provide comprehensive technical details while preserving scope',
  };

  const detailInstructions = {
    comprehensive: 'Include detailed technology stack and architectural considerations',
    minimal: 'Include only essential technology mentions',
    moderate: 'Include key technologies and integration points',
  };

  // Different perspectives for variety in parallel agents
  const agentPerspectives = [
    {
      considerations: 'Provide balanced coverage of frontend components, backend logic, data flow, and integration points without overemphasizing any single aspect',
      emphasis: 'Focus on creating a well-rounded refinement that considers both technical implementation and user experience in equal measure',
      role: 'Balanced refinement specialist'
    },
    {
      considerations: 'Emphasize React components, form handling, state management, and user experience flows',
      emphasis: 'Focus on UI/UX implementation aspects, component structure, and user interaction patterns',
      role: 'Frontend-focused refinement specialist'
    },
    {
      considerations: 'Emphasize server actions, database schema, validation, and business logic',
      emphasis: 'Focus on server-side implementation, API design, and data persistence',
      role: 'Backend-focused refinement specialist'
    },
    {
      considerations: 'Emphasize how frontend and backend work together, authentication flows, and cross-cutting concerns',
      emphasis: 'Focus on end-to-end data flow and system integration points',
      role: 'Full-stack integration specialist'
    },
    {
      considerations: 'Emphasize caching strategies, query optimization, lazy loading, and efficient data patterns',
      emphasis: 'Focus on performance implications, optimization opportunities, and scalable architecture',
      role: 'Performance and scalability specialist'
    },
    {
      considerations: 'Emphasize authentication, authorization, input validation, and data privacy',
      emphasis: 'Focus on security considerations, data protection, and compliance requirements',
      role: 'Security and compliance specialist'
    }
  ];

  const perspective = agentVariant !== undefined && agentVariant < agentPerspectives.length
    ? agentPerspectives[agentVariant]!
    : agentPerspectives[0]!;

  return `
    You are a ${perspective.role}. Your job is to take a user's feature request
    and add MINIMAL project context to make it clearer for subsequent analysis stages.
    Output ONLY the refined paragraph - no headers, sections, or analysis.

    ## Your Perspective
    ${perspective.emphasis}

    ## Key Considerations for Your Refinement
    ${perspective.considerations}

    ## Your Task

    Take the user's original feature request and refine it by:

    1. Preserving the exact functionality requested - do not add features
    2. Mentioning key technologies that will be involved (from the project stack)
    3. Identifying which existing systems it will need to integrate with
    4. Keeping the scope exactly as the user specified
    5. **IMPORTANT**: Apply your specialist perspective to highlight relevant technical aspects

    ## Context Available

    **User's Original Request:**
    ${originalRequest}

    **Project Documentation (CLAUDE.MD):**
    ${settings.includeProjectContext ? claudeMdContent : 'Project context excluded by user preference'}

    **Project Dependencies and Configuration (package.json):**
    ${settings.includeProjectContext ? packageJsonContent : 'Project context excluded by user preference'}

    ## Refinement Guidelines

    ### Style Instructions
    ${styleInstructions[settings.refinementStyle]}

    ### Detail Level
    ${detailInstructions[settings.technicalDetailLevel]}

    ### Length Constraint
    Maximum ${settings.maxOutputLength} words.

    ### What to ADD (sparingly, with your perspective):
    - Core technology mentions relevant to your specialization
    - Essential integration points from your viewpoint
    - Database/ORM considerations if data persistence is clearly needed
    - Validation approach if user input is involved
    - Security or performance considerations if relevant to your role

    ### What NOT to do:
    - DO NOT add features or functionality not requested
    - DO NOT specify implementation details (which icons, where buttons go, etc.)
    - DO NOT assume specific UI/UX decisions
    - DO NOT add "nice to have" features like notifications, caching, etc.
    - DO NOT prescribe specific technical solutions when multiple options exist
    - DO NOT make it longer than necessary

    ### Output Format
    **CRITICAL**: Output ONLY a single paragraph (maximum ${settings.maxOutputLength} words). Keep it concise and focused.

    Based on the user request and project context provided, generate a refined feature request from your specialist perspective that will help subsequent analysis stages better understand what needs to be implemented and how it should integrate with the existing codebase.

    **REMEMBER**: Output ONLY the refined paragraph. No headers, no "Refined Request:" prefix, no analysis - just the single paragraph refinement from your specialist viewpoint.`;
}

function isResultMessage(message: QueryMessage): message is ResultMessage {
  return message.type === 'result';
}

function isStreamEventMessage(message: QueryMessage): message is StreamEventMessage {
  return message.type === 'stream_event';
}

export const parallelRefineFeatureRequestAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.PARALLEL_REFINE_REQUEST,
  })
  .inputSchema(parallelRefinementRequestSchema)
  .action(async ({ parsedInput }): Promise<ParallelRefinementResponse> => {
    const { originalRequest, settings } = parsedInput;
    const startTime = Date.now();

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
      data: {
        action: ACTION_NAMES.FEATURE_PLANNER.PARALLEL_REFINE_REQUEST,
        agentCount: settings.agentCount,
        requestLength: originalRequest.length,
        settings,
      },
      level: SENTRY_LEVELS.INFO,
      message: 'Starting parallel feature request refinement',
    });

    try {
      const results: RefinementResult[] = [];
      const agentPromises: Promise<RefinementResult>[] = [];

      // Create parallel agent executions
      for (let i = 0; i < settings.agentCount; i++) {
        const agentId = `agent-${i + 1}-${Date.now()}`;
        const agentVariant = i; // Pass the agent index to create different prompts

        agentPromises.push(
          (async (): Promise<RefinementResult> => {
            const agentStartTime = Date.now();

            try {
              console.log(`[${agentId}] Starting refinement with variant ${agentVariant}...`);

              // Build unique prompt for this agent
              const refinementPrompt = await buildRefinementPrompt(originalRequest, settings, agentVariant);

              let refinedRequest = '';
              const abortController = new AbortController();

              const timeoutId = setTimeout(() => {
                console.log(`[${agentId}] Timeout reached (${settings.agentTimeoutMs}ms)`);
                abortController.abort();
              }, settings.agentTimeoutMs);

              try {
                console.log(`[${agentId}] Starting query with prompt length: ${refinementPrompt.length}`);
                for await (const message of query({
                  options: {
                    allowedTools: [],
                    includePartialMessages: false,
                    maxTurns: 1,
                    permissionMode: 'bypassPermissions',
                  },
                  prompt: refinementPrompt,
                })) {
                  if (abortController.signal.aborted) {
                    console.log(`[${agentId}] Aborted due to timeout`);
                    break;
                  }

                  const queryMessage = message as QueryMessage;
                  console.log(`[${agentId}] Received message type: ${queryMessage.type}`);

                  // Handle assistant messages with complete text content
                  if (queryMessage.type === 'assistant') {
                    const message = queryMessage as { message?: { content?: Array<{ text?: string; type: string; }> } };
                    if (message.message?.content && Array.isArray(message.message.content)) {
                      for (const content of message.message.content) {
                        if (content.type === 'text' && typeof content.text === 'string') {
                          refinedRequest += content.text;
                        }
                      }
                    }
                  }

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
              } finally {
                clearTimeout(timeoutId);
              }

              if (!refinedRequest.trim()) {
                throw new Error('No refinement response received');
              }

              // Clean and validate the response
              const cleanedRequest = refinedRequest
                .trim()
                .replace(/^.*?refined.*?:/i, '') // remove any "refined:" prefixes
                .replace(/^#+\s*.*?\n/, '') // remove markdown headers
                .replace(/\n+/g, ' ') // normalize whitespace
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, settings.maxOutputLength * 6); // reasonable character limit

              const wordCount = cleanedRequest.split(/\s+/).length;
              const executionTimeMs = Date.now() - agentStartTime;

              return {
                agentId,
                executionTimeMs,
                isSuccess: true,
                refinedRequest: cleanedRequest,
                wordCount,
              };
            } catch (error) {
              const executionTimeMs = Date.now() - agentStartTime;
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              console.log(`[${agentId}] Error after ${executionTimeMs}ms: ${errorMessage}`);

              Sentry.addBreadcrumb({
                category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
                data: { agentId, error: errorMessage, executionTimeMs },
                level: SENTRY_LEVELS.WARNING,
                message: `Agent ${agentId} failed`,
              });

              return {
                agentId,
                error: errorMessage,
                executionTimeMs,
                isSuccess: false,
                refinedRequest: '',
                wordCount: 0,
              };
            }
          })(),
        );
      }

      // Wait for all agents to complete
      const agentResults = await Promise.all(agentPromises);
      results.push(...agentResults);

      const successCount = results.filter((r) => r.isSuccess).length;
      const executionTimeMs = Date.now() - startTime;

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
        data: {
          executionTimeMs,
          successCount,
          totalAgents: settings.agentCount,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Parallel refinement completed',
      });

      return {
        executionTimeMs,
        isSuccess: successCount > 0,
        results,
        settings,
        successCount,
        totalAgents: settings.agentCount,
      };
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown parallel refinement error';

      Sentry.captureException(error, {
        contexts: {
          [SENTRY_CONTEXTS.ACTION_METADATA]: {
            action: ACTION_NAMES.FEATURE_PLANNER.PARALLEL_REFINE_REQUEST,
            executionTimeMs,
            settings,
          },
        },
      });

      throw new ActionError(
        ErrorType.EXTERNAL_SERVICE,
        ERROR_CODES.FEATURE_PLANNER.REFINEMENT_FAILED,
        errorMessage,
        { operation: OPERATIONS.FEATURE_PLANNER.REFINE_REQUEST, parsedInput },
        true,
        500,
      );
    }
  });

export const refineFeatureRequestAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.REFINE_REQUEST,
  })
  .inputSchema(featureRefinementRequestSchema)
  .action(async ({ parsedInput }): Promise<FeatureRefinementResponse> => {
    const { options, originalRequest } = parsedInput;

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
          : await buildRefinementPrompt(originalRequest, {
              agentCount: 1,
              agentTimeoutMs: 30000,
              includeProjectContext: true,
              maxOutputLength: 250,
              refinementStyle: 'balanced',
              technicalDetailLevel: 'moderate',
            }, 0); // Explicitly use the balanced perspective (agent 0)

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
