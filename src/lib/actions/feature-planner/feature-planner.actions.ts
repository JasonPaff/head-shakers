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

/**
 * Configuration for agent execution
 */
interface AgentConfig {
  maxRetries: number;
  shouldFallbackToSingle: boolean;
  timeout: number;
}

/**
 * Default agent configuration
 */
const DEFAULT_AGENT_CONFIG: AgentConfig = {
  maxRetries: 3,
  shouldFallbackToSingle: true,
  timeout: 45000, // 45 seconds
};

/**
 * Interface for agent execution result with retry information
 */
interface AgentExecutionResult {
  agentId: string;
  error?: string;
  executionTimeMs: number;
  isSuccess: boolean;
  refinedRequest: string;
  retryCount?: number;
  wordCount: number;
}


/**
 * Executes a single agent with retry logic and enhanced error handling
 * @param originalRequest - The user's original feature request
 * @param agentId - Unique identifier for the agent
 * @param config - Agent configuration including retry settings
 * @returns Promise resolving to agent execution result
 */
async function executeAgentWithRetry(
  originalRequest: string,
  agentId: string,
  config: AgentConfig = DEFAULT_AGENT_CONFIG
): Promise<AgentExecutionResult> {
  const agentStartTime = Date.now();
  let lastError: Error | null = null;
  let retryCount = 0;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      retryCount = attempt;

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
        data: { agentId, attempt: attempt + 1, maxRetries: config.maxRetries + 1 },
        level: attempt === 0 ? SENTRY_LEVELS.DEBUG : SENTRY_LEVELS.INFO,
        message: `${agentId} attempt ${attempt + 1}/${config.maxRetries + 1}`,
      });

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, config.timeout);

      let refinedRequest: string = '';

      try {
        for await (const message of query({
          options: {
            abortController,
            allowedTools: ['Read', 'Task'],
            includePartialMessages: true,
            maxTurns: 3,
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
            console.log(`Agent ${agentId} attempt ${attempt + 1} raw response:`, message.result);
            refinedRequest = validateAndCleanResponse(message.result, agentId);
            console.log(`Agent ${agentId} attempt ${attempt + 1} cleaned request:`, refinedRequest);
            break;
          }
        }
      } finally {
        clearTimeout(timeoutId);
      }

      if (!refinedRequest) {
        throw new Error(`No valid response received from ${agentId}`);
      }

      const executionTime = Date.now() - agentStartTime;
      const wordCount = refinedRequest.split(/\s+/).filter((word) => word.length > 0).length;

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          agentId,
          attempt: attempt + 1,
          executionTimeMs: executionTime,
          isSuccess: true,
          retryCount,
          wordCount,
        },
        level: SENTRY_LEVELS.DEBUG,
        message: `${agentId} succeeded on attempt ${attempt + 1} in ${executionTime}ms`,
      });

      return {
        agentId,
        executionTimeMs: executionTime,
        isSuccess: true,
        refinedRequest,
        retryCount,
        wordCount,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          agentId,
          attempt: attempt + 1,
          error: lastError.message,
          willRetry: attempt < config.maxRetries,
        },
        level: attempt < config.maxRetries ? SENTRY_LEVELS.WARNING : SENTRY_LEVELS.ERROR,
        message: `${agentId} failed on attempt ${attempt + 1}: ${lastError.message}`,
      });

      // If this was the last attempt, break out of the loop
      if (attempt === config.maxRetries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // All retries failed
  const executionTime = Date.now() - agentStartTime;

  return {
    agentId,
    error: lastError?.message || 'Unknown error occurred',
    executionTimeMs: executionTime,
    isSuccess: false,
    refinedRequest: '',
    retryCount,
    wordCount: 0,
  };
}

/**
 * Validates and cleans agent response with robust error handling
 * @param rawResponse - Raw response from the agent
 * @param agentId - Agent identifier for logging
 * @returns Cleaned and validated response
 */
function validateAndCleanResponse(rawResponse: string, agentId: string): string {
  if (!rawResponse || typeof rawResponse !== 'string') {
    throw new Error(`Empty or invalid response from ${agentId}`);
  }

  let cleaned = rawResponse.trim();

  if (!cleaned) {
    throw new Error(`Empty response after trimming from ${agentId}`);
  }

  // Remove common prefixes and formatting
  cleaned = cleaned
    .replace(/^(Refined Request:|Here is the refined request:|The refined request is:)/i, '')
    .replace(/^#+\s*/gm, '') // Remove headers
    .replace(/^[-*\d.]\s*/gm, '') // Remove bullet points
    .trim();

  // Take only the first paragraph if multiple paragraphs exist
  const firstParagraph = cleaned.split('\n\n')[0] ?? '';
  const result = firstParagraph.trim();

  if (!result) {
    throw new Error(`No valid content found after cleaning response from ${agentId}`);
  }

  // Validate minimum length
  if (result.length < 10) {
    throw new Error(`Response too short from ${agentId}: ${result.length} characters`);
  }

  return result;
}

/**
 * Executes parallel feature refinement using Claude Code SDK with enhanced error handling and retry logic
 * @param originalRequest - The user's original feature request
 * @param settings - Configuration for refinement process including agent count and output preferences
 * @returns Parallel refinement results with quality scoring and retry information
 */
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
      // Single agent refinement with retry logic
      if (settings.agentCount === 1) {
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
          level: SENTRY_LEVELS.INFO,
          message: 'Starting single agent refinement with enhanced error handling',
        });

        const result = await executeAgentWithRetry(originalRequest, 'agent-1', DEFAULT_AGENT_CONFIG);

        if (!result.isSuccess) {
          throw new ActionError(
            ErrorType.EXTERNAL_SERVICE,
            ERROR_CODES.FEATURE_PLANNER.REFINEMENT_FAILED,
            ERROR_MESSAGES.FEATURE_PLANNER.REFINEMENT_FAILED,
            {
              error: result.error,
              operation: OPERATIONS.FEATURE_PLANNER.REFINE_REQUEST,
              retryCount: result.retryCount,
            },
            true,
            500,
          );
        }

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            executionTimeMs: result.executionTimeMs,
            originalLength: originalRequest.length,
            refinedLength: result.refinedRequest.length,
            retryCount: result.retryCount,
            wordCount: result.wordCount,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Single agent refinement completed in ${result.executionTimeMs}ms with ${result.retryCount} retries`,
        });

        return {
          refinedRequest: result.refinedRequest,
          retryCount: result.retryCount,
        };
      }

      // Parallel agent refinement with enhanced retry logic
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
        data: { agentCount: settings.agentCount },
        level: SENTRY_LEVELS.INFO,
        message: `Starting parallel refinement with ${settings.agentCount} agents and retry logic`,
      });

      // Execute all agents in parallel with individual retry logic
      const results = await Promise.allSettled(
        Array.from({ length: settings.agentCount }, (_, index) => {
          const agentId = `agent-${index + 1}`;
          return executeAgentWithRetry(originalRequest, agentId, DEFAULT_AGENT_CONFIG);
        })
      );

      // Process results with enhanced error information
      const processedResults = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          // Fallback for promise rejection (shouldn't happen with our retry logic)
          return {
            agentId: `agent-${index + 1}`,
            error: result.reason instanceof Error ? result.reason.message : 'Promise execution failed',
            executionTimeMs: 0,
            isSuccess: false,
            refinedRequest: '',
            retryCount: DEFAULT_AGENT_CONFIG.maxRetries,
            wordCount: 0,
          };
        }
      });

      const totalExecutionTime = Date.now() - startTime;
      const successCount = processedResults.filter((r) => r.isSuccess).length;
      const failureCount = processedResults.length - successCount;
      const totalRetries = processedResults.reduce((sum, r) => sum + (r.retryCount || 0), 0);
      const avgRetries = processedResults.length > 0 ? totalRetries / processedResults.length : 0;

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          avgRetries: Math.round(avgRetries * 100) / 100,
          executionTimeMs: totalExecutionTime,
          failureCount,
          successCount,
          totalAgents: settings.agentCount,
          totalRetries,
        },
        level: successCount > 0 ? SENTRY_LEVELS.INFO : SENTRY_LEVELS.WARNING,
        message: `Parallel refinement completed: ${successCount}/${settings.agentCount} agents succeeded with ${totalRetries} total retries`,
      });

      // Even if some agents fail, return partial results if we have at least one success
      if (successCount === 0) {
        // Collect all error messages for debugging
        const errors = processedResults
          .filter(r => !r.isSuccess && r.error)
          .map(r => `${r.agentId}: ${r.error}`)
          .join('; ');

        throw new ActionError(
          ErrorType.EXTERNAL_SERVICE,
          ERROR_CODES.FEATURE_PLANNER.REFINEMENT_FAILED,
          ERROR_MESSAGES.FEATURE_PLANNER.REFINEMENT_FAILED,
          {
            errors,
            failureCount,
            operation: OPERATIONS.FEATURE_PLANNER.PARALLEL_REFINE_REQUEST,
            totalAgents: settings.agentCount,
            totalRetries,
          },
          true,
          500,
        );
      }

      return {
        avgRetries: Math.round(avgRetries * 100) / 100,
        executionTimeMs: totalExecutionTime,
        isSuccess: successCount > 0,
        results: processedResults,
        settings,
        successCount,
        totalAgents: settings.agentCount,
        totalRetries,
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
