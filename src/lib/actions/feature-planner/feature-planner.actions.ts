'use server';

import 'server-only';
import { query } from '@anthropic-ai/claude-code';
import * as Sentry from '@sentry/nextjs';
import { Realtime } from 'ably';

import { type AblyRefinementMessage, AgentThinkingStage } from '@/app/(app)/feature-planner/types/streaming';
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
 * Ably client instance for server-side message publishing
 */
let ablyClient: null | Realtime = null;

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
 * @param sessionId - Unique session identifier for real-time updates
 * @param config - Agent configuration including retry settings
 * @returns Promise resolving to agent execution result
 */
async function executeAgentWithRetry(
  originalRequest: string,
  agentId: string,
  sessionId: string,
  config: AgentConfig = DEFAULT_AGENT_CONFIG,
): Promise<AgentExecutionResult> {
  const agentStartTime = Date.now();
  let lastError: Error | null = null;
  let retryCount = 0;

  await publishAgentThinking(
    sessionId,
    agentId,
    AgentThinkingStage.INITIALIZING,
    `Starting feature request refinement with ${agentId}`,
    { progress: 0 },
  );

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      retryCount = attempt;

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
        data: { agentId, attempt: attempt + 1, maxRetries: config.maxRetries + 1 },
        level: attempt === 0 ? SENTRY_LEVELS.DEBUG : SENTRY_LEVELS.INFO,
        message: `${agentId} attempt ${attempt + 1}/${config.maxRetries + 1}`,
      });

      if (attempt > 0) {
        await publishAgentThinking(
          sessionId,
          agentId,
          AgentThinkingStage.INITIALIZING,
          `Retrying refinement (attempt ${attempt + 1}/${config.maxRetries + 1})`,
          { progress: (attempt / (config.maxRetries + 1)) * 20 },
        );
      }

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, config.timeout);

      let refinedRequest: string = '';

      await publishAgentThinking(
        sessionId,
        agentId,
        AgentThinkingStage.ANALYZING_REQUEST,
        'Analyzing the feature request and identifying key requirements',
        { progress: 25 },
      );

      try {
        let messageCount = 0;
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
          console.log(`${agentId} message:`, message.type, message);
          messageCount++;

          if (messageCount === 1) {
            await publishAgentThinking(
              sessionId,
              agentId,
              AgentThinkingStage.IDENTIFYING_TECHNOLOGIES,
              'Identifying relevant technologies from the Head Shakers project stack',
              { progress: 40 },
            );
          } else if (messageCount === 2) {
            await publishAgentThinking(
              sessionId,
              agentId,
              AgentThinkingStage.FINDING_INTEGRATION_POINTS,
              'Finding integration points and gathering project context',
              { progress: 60 },
            );
          } else if (messageCount > 2) {
            await publishAgentThinking(
              sessionId,
              agentId,
              AgentThinkingStage.GENERATING_REFINEMENT,
              'Generating refined feature request with technical context',
              { progress: 70 + Math.min(messageCount * 5, 10) },
            );
          }

          if (message.type === 'result' && message.subtype === 'success') {
            console.log(`Agent ${agentId} attempt ${attempt + 1} raw response:`, message.result);

            await publishAgentThinking(
              sessionId,
              agentId,
              AgentThinkingStage.FINALIZING,
              'Finalizing refined request and validating output',
              { progress: 95 },
            );

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

      await publishAgentThinking(
        sessionId,
        agentId,
        AgentThinkingStage.COMPLETED,
        `Successfully refined feature request (${wordCount} words, ${executionTime}ms)`,
        {
          context: { attempt: attempt + 1, wordCount },
          duration: executionTime,
          progress: 100,
        },
      );

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

      await publishAgentThinking(
        sessionId,
        agentId,
        AgentThinkingStage.ERROR,
        `Error during refinement attempt ${attempt + 1}: ${lastError.message}${attempt < config.maxRetries ? ' - Will retry' : ''}`,
        {
          context: {
            attempt: attempt + 1,
            error: lastError.message,
            willRetry: attempt < config.maxRetries,
          },
          progress: 0,
        },
      );

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

      if (attempt === config.maxRetries) {
        break;
      }

      // exponential backoff
      const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  const executionTime = Date.now() - agentStartTime;

  await publishAgentThinking(
    sessionId,
    agentId,
    AgentThinkingStage.ERROR,
    `All attempts failed for ${agentId}. Final error: ${lastError?.message || 'Unknown error occurred'}`,
    {
      context: {
        finalError: lastError?.message || 'Unknown error occurred',
        totalAttempts: config.maxRetries + 1,
      },
      duration: executionTime,
      progress: 0,
    },
  );

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
 * Get or create an Ably client instance
 */
function getAblyClient(): null | Realtime {
  if (!process.env.NEXT_PUBLIC_ABLY_API_KEY) {
    console.warn('Ably API key not configured, real-time updates disabled');
    return null;
  }

  if (!ablyClient) {
    ablyClient = new Realtime({
      clientId: 'feature-planner-server',
      key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
    });
  }

  return ablyClient;
}

/**
 * Publishes an agent thinking message to Ably channel
 * @param sessionId - Unique session identifier for the refinement process
 * @param agentId - Agent identifier
 * @param stage - Current thinking stage
 * @param content - Message content describing agent's current thinking
 * @param metadata - Optional metadata (progress, duration, context)
 */
async function publishAgentThinking(
  sessionId: string,
  agentId: string,
  stage: AgentThinkingStage,
  content: string,
  metadata?: AblyRefinementMessage['metadata'],
): Promise<void> {
  try {
    const client = getAblyClient();
    if (!client) {
      // Graceful degradation - no Ably client available
      return;
    }

    const channel = client.channels.get(`feature-planner:${sessionId}`);
    const message: AblyRefinementMessage = {
      agentId,
      content,
      messageId: `${agentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metadata,
      sessionId,
      stage,
      timestamp: new Date(),
    };

    await channel.publish('agent-thinking', message);

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
      data: {
        agentId,
        messageId: message.messageId,
        sessionId,
        stage,
      },
      level: SENTRY_LEVELS.DEBUG,
      message: `Published agent thinking message: ${stage}`,
    });
  } catch (error) {
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
      data: {
        agentId,
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
        stage,
      },
      level: SENTRY_LEVELS.WARNING,
      message: 'Failed to publish agent thinking message to Ably',
    });

    console.warn('Failed to publish agent thinking message:', error);
  }
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

  // remove common prefixes and formatting
  cleaned = cleaned
    .replace(/^(Refined Request:|Here is the refined request:|The refined request is:)/i, '')
    .replace(/^#+\s*/gm, '') // remove headers
    .replace(/^[-*\d.]\s*/gm, '') // remove bullet points
    .trim();

  // take only the first paragraph if multiple paragraphs exist
  const firstParagraph = cleaned.split('\n\n')[0] ?? '';
  const result = firstParagraph.trim();

  if (!result) {
    throw new Error(`No valid content found after cleaning response from ${agentId}`);
  }

  // validate minimum length
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
    const sessionId = `refinement-${ctx.userId}-${startTime}-${Math.random().toString(36).substr(2, 9)}`;

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
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
          level: SENTRY_LEVELS.INFO,
          message: 'Starting single agent refinement with enhanced error handling',
        });

        const result = await executeAgentWithRetry(
          originalRequest,
          'agent-1',
          sessionId,
          DEFAULT_AGENT_CONFIG,
        );

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

      // parallel agent refinement
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
        data: { agentCount: settings.agentCount },
        level: SENTRY_LEVELS.INFO,
        message: `Starting parallel refinement with ${settings.agentCount} agents and retry logic`,
      });

      const results = await Promise.allSettled(
        Array.from({ length: settings.agentCount }, (_, index) => {
          const agentId = `agent-${index + 1}`;
          return executeAgentWithRetry(originalRequest, agentId, sessionId, DEFAULT_AGENT_CONFIG);
        }),
      );

      const processedResults = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
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

      if (successCount === 0) {
        const errors = processedResults
          .filter((r) => !r.isSuccess && r.error)
          .map((r) => `${r.agentId}: ${r.error}`)
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
