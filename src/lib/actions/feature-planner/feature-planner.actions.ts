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
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import { parallelRefinementRequestSchema } from '@/lib/validations/feature-planner.validation';

export const refineFeatureRequestAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.PARALLEL_REFINE_REQUEST,
  })
  .inputSchema(parallelRefinementRequestSchema)
  .action(async ({ ctx }) => {
    const { originalRequest, settings } = parallelRefinementRequestSchema.parse(ctx.sanitizedInput);
    const startTime = Date.now();

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_REFINEMENT_DATA, {
      agentCount: settings.agentCount,
      includeProjectContext: settings.includeProjectContext,
      maxOutputLength: settings.maxOutputLength,
      originalRequestLength: originalRequest.length,
      userId: ctx.userId,
    });

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
      data: {
        agentCount: settings.agentCount,
        isParallelMode: settings.agentCount > 1,
        originalRequestLength: originalRequest.length,
      },
      level: SENTRY_LEVELS.INFO,
      message: `Starting feature refinement with ${settings.agentCount} agent(s)`,
    });

    try {
      // single agent refinement
      if (settings.agentCount === 1) {
        let refinedRequest: string = '';

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
          level: SENTRY_LEVELS.INFO,
          message: 'Starting single agent refinement with Claude Code SDK',
        });

        for await (const message of query({
          options: {
            abortController: new AbortController(),
            allowedTools: ['Read'],
            model: 'claude-sonnet-4-20250514',
            permissionMode: 'bypassPermissions',
          },
          prompt: `Use the initial feature refinement agent to refine the following request: "${originalRequest}"
            CRITICAL: Output ONLY the refined paragraph. No headers, no prefixes like "Refined Request:",
              no bullet points, no markdown formatting beyond the paragraph text. Just output the single
              refined paragraph that adds essential technical context from the Head Shakers project stack.`,
        })) {
          if (message.type === 'result' && message.subtype === 'success') {
            console.log('Raw agent response:', message.result);

            let cleaned = message.result.trim();

            cleaned = cleaned
              .replace(/^(Refined Request:|Here is the refined request:|The refined request is:)/i, '')
              .trim();

            // remove any headers or Markdown formatting
            cleaned = cleaned.replace(/^#+\s*/gm, '').trim();
            // remove bullet points or numbered lists at the start
            cleaned = cleaned.replace(/^[-*\d.]\s*/gm, '').trim();
            // take only the first paragraph if multiple paragraphs exist
            const firstParagraph = cleaned.split('\n\n')[0] ?? '';

            refinedRequest = firstParagraph.trim();
            console.log('Cleaned refined request:', refinedRequest);
          }
        }

        const singleAgentExecutionTime = Date.now() - startTime;
        const wordCount = refinedRequest.split(/\s+/).filter((word) => word.length > 0).length;

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            executionTimeMs: singleAgentExecutionTime,
            originalLength: originalRequest.length,
            refinedLength: refinedRequest.length,
            wordCount,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Single agent refinement completed in ${singleAgentExecutionTime}ms`,
        });

        if (refinedRequest.length === 0) {
          throw new ActionError(
            ErrorType.EXTERNAL_SERVICE,
            ERROR_CODES.FEATURE_PLANNER.REFINEMENT_FAILED,
            ERROR_MESSAGES.FEATURE_PLANNER.REFINEMENT_FAILED,
            { operation: OPERATIONS.FEATURE_PLANNER.REFINE_REQUEST },
            true,
            500,
          );
        }

        return {
          refinedRequest,
        };
      }

      // parallel agent refinement
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
        data: { agentCount: settings.agentCount },
        level: SENTRY_LEVELS.INFO,
        message: `Starting parallel refinement with ${settings.agentCount} agents`,
      });

      const results = await Promise.allSettled(
        Array.from({ length: settings.agentCount }, async (_, index) => {
          const agentId = `agent-${index + 1}`;
          const agentStartTime = Date.now();

          try {
            let refinedRequest: string = '';

            Sentry.addBreadcrumb({
              category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
              data: { agentId, agentIndex: index + 1 },
              level: SENTRY_LEVELS.DEBUG,
              message: `Starting refinement for ${agentId}`,
            });

            for await (const message of query({
              options: {
                abortController: new AbortController(),
                allowedTools: ['Read'],
                model: 'claude-sonnet-4-20250514',
                permissionMode: 'bypassPermissions',
              },
              prompt: `Use the initial feature refinement agent to refine the following request: "${originalRequest}"
                CRITICAL: Output ONLY the refined paragraph. No headers, no prefixes like "Refined Request:",
                  no bullet points, no markdown formatting beyond the paragraph text. Just output the single
                  refined paragraph that adds essential technical context from the Head Shakers project stack.

                Agent ID: ${agentId} - Provide a unique perspective while maintaining consistency with the project context.`,
            })) {
              if (message.type === 'result' && message.subtype === 'success') {
                console.log(`Agent ${agentId} raw response:`, message.result);

                let cleaned = message.result.trim();

                cleaned = cleaned
                  .replace(/^(Refined Request:|Here is the refined request:|The refined request is:)/i, '')
                  .trim();

                // remove any headers or Markdown formatting
                cleaned = cleaned.replace(/^#+\s*/gm, '').trim();
                // remove bullet points or numbered lists at the start
                cleaned = cleaned.replace(/^[-*\d.]\s*/gm, '').trim();
                // take only the first paragraph if multiple paragraphs exist
                const firstParagraph = cleaned.split('\n\n')[0] ?? '';

                refinedRequest = firstParagraph.trim();
                console.log(`Agent ${agentId} cleaned request:`, refinedRequest);
              }
            }

            const executionTime = Date.now() - agentStartTime;
            const wordCount = refinedRequest.split(/\s+/).filter((word) => word.length > 0).length;

            Sentry.addBreadcrumb({
              category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
              data: {
                agentId,
                executionTimeMs: executionTime,
                isSuccess: true,
                wordCount,
              },
              level: SENTRY_LEVELS.DEBUG,
              message: `${agentId} completed successfully in ${executionTime}ms`,
            });

            return {
              agentId,
              executionTimeMs: executionTime,
              isSuccess: true,
              refinedRequest,
              wordCount,
            };
          } catch (error) {
            const executionTime = Date.now() - agentStartTime;
            console.error(`Agent ${agentId} failed:`, error);

            Sentry.addBreadcrumb({
              category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
              data: {
                agentId,
                error: error instanceof Error ? error.message : 'Unknown error',
                executionTimeMs: executionTime,
                isSuccess: false,
              },
              level: SENTRY_LEVELS.WARNING,
              message: `${agentId} failed after ${executionTime}ms`,
            });

            return {
              agentId,
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              executionTimeMs: executionTime,
              isSuccess: false,
              refinedRequest: '',
              wordCount: 0,
            };
          }
        }),
      );

      const processedResults = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            agentId: `agent-${index + 1}`,
            error: result.reason instanceof Error ? result.reason.message : 'Agent execution failed',
            executionTimeMs: 0,
            isSuccess: false,
            refinedRequest: '',
            wordCount: 0,
          };
        }
      });

      const totalExecutionTime = Date.now() - startTime;
      const successCount = processedResults.filter((r) => r.isSuccess).length;
      const failureCount = processedResults.length - successCount;

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          executionTimeMs: totalExecutionTime,
          failureCount,
          successCount,
          totalAgents: settings.agentCount,
        },
        level: successCount > 0 ? SENTRY_LEVELS.INFO : SENTRY_LEVELS.WARNING,
        message: `Parallel refinement completed: ${successCount}/${settings.agentCount} agents succeeded`,
      });

      if (successCount === 0) {
        throw new ActionError(
          ErrorType.EXTERNAL_SERVICE,
          ERROR_CODES.FEATURE_PLANNER.REFINEMENT_FAILED,
          ERROR_MESSAGES.FEATURE_PLANNER.REFINEMENT_FAILED,
          {
            failureCount,
            operation: OPERATIONS.FEATURE_PLANNER.PARALLEL_REFINE_REQUEST,
            totalAgents: settings.agentCount,
          },
          true,
          500,
        );
      }

      return {
        executionTimeMs: totalExecutionTime,
        isSuccess: successCount > 0,
        results: processedResults,
        settings,
        successCount,
        totalAgents: settings.agentCount,
      };
    } catch (error) {
      handleActionError(error, {
        input: { originalRequest, settings },
        metadata: {
          actionName: ACTION_NAMES.FEATURE_PLANNER.PARALLEL_REFINE_REQUEST,
        },
        operation:
          settings.agentCount === 1 ?
            OPERATIONS.FEATURE_PLANNER.REFINE_REQUEST
          : OPERATIONS.FEATURE_PLANNER.PARALLEL_REFINE_REQUEST,
        userId: ctx.userId,
      });
    }
  });
