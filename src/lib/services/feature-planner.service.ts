import { query } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

import type { FileDiscoveryResult, RefinementSettings } from '@/lib/db/schema/feature-planner.schema';
import type { FeatureSuggestionAgent } from '@/lib/types/feature-suggestion-agent';
import type { RefinementAgent } from '@/lib/types/refinement-agent';
import type { RefinementOutput } from '@/lib/types/refinement-output';
import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { DEFAULT_FEATURE_PLANNER_MODEL, FALLBACK_MODEL } from '@/lib/constants/claude-models';
import { BASE_SDK_OPTIONS, THINKING_TOKEN_LIMITS, TURN_LIMITS } from '@/lib/constants/claude-sdk-config';
import { extractJsonFromMarkdown, parseRefinementOutput } from '@/lib/types/refinement-output';
import { circuitBreakers } from '@/lib/utils/circuit-breaker-registry';
import { createServiceError } from '@/lib/utils/error-builders';

/**
 * SDK assistant message structure
 */
interface SDKAssistantMessage {
  content: Array<SDKMessageContent>;
  usage?: SDKUsage;
}

type SDKMessageContent = SDKTextContent | SDKToolUseContent;

/**
 * SDK result message structure (final output)
 */
interface SDKResultMessage {
  duration_api_ms: number;
  duration_ms: number;
  isError: boolean; // Renamed from is_error to follow project conventions
  num_turns: number;
  permission_denials: Array<unknown>;
  result?: string; // Final text output (present in success subtype)
  session_id: string;
  subtype: 'error_during_execution' | 'error_max_turns' | 'success';
  total_cost_usd: number;
  usage: {
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
    input_tokens: number;
    output_tokens: number;
  };
  uuid: string;
}

/**
 * SDK message content types
 */
interface SDKTextContent {
  text: string;
  type: 'text';
}

interface SDKToolUseContent {
  id: string;
  input: Record<string, unknown>;
  name: string;
  type: 'tool_use';
}

/**
 * SDK usage statistics
 */
interface SDKUsage {
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  input_tokens?: number;
  output_tokens?: number;
}

/**
 * Zod schema for JSON file discovery response
 */
const fileDiscoveryJsonItemSchema = z.object({
  description: z.string().optional(),
  fileExists: z.boolean().optional(),
  filePath: z.string().optional(),
  integrationPoint: z.string().optional(),
  path: z.string().optional(),
  priority: z.string().optional(),
  reasoning: z.string().optional(),
  relevanceScore: z.union([z.number(), z.string()]).optional(),
  role: z.string().optional(),
  score: z.union([z.number(), z.string()]).optional(),
});

/**
 * Zod schema for JSON plan step
 */
const planStepJsonSchema = z.object({
  category: z.string().optional(),
  commands: z.array(z.string()).optional(),
  confidenceLevel: z.string().optional(),
  description: z.string().optional(),
  estimatedDuration: z.string().optional(),
  stepNumber: z.number().optional(),
  title: z.string().optional(),
  validationCommands: z.array(z.string()).optional(),
});

/**
 * Zod schema for JSON implementation plan response
 */
const implementationPlanJsonSchema = z.object({
  complexity: z.string().optional(),
  estimatedDuration: z.string().optional(),
  riskLevel: z.string().optional(),
  steps: z.array(planStepJsonSchema).optional(),
});

/**
 * Agent execution result with metadata
 */
export interface AgentExecutionResult<T> {
  executionTimeMs: number;
  result: T;
  retryCount: number;
  tokenUsage: {
    cacheCreationTokens?: number;
    cacheReadTokens?: number;
    completionTokens: number;
    promptTokens: number;
    totalTokens: number;
  };
}

/**
 * Implementation plan result structure
 */
export interface ImplementationPlanResult {
  complexity: 'high' | 'low' | 'medium';
  estimatedDuration: string;
  implementationPlan: string;
  riskLevel: 'high' | 'low' | 'medium';
  steps: Array<PlanStep>;
}

/**
 * Plan step structure
 */
export interface PlanStep {
  category: string;
  commands: Array<string>;
  confidenceLevel: 'high' | 'low' | 'medium';
  description: string;
  estimatedDuration: string;
  stepNumber: number;
  title: string;
  validationCommands: Array<string>;
}

/**
 * Specialized agent configuration for parallel file discovery
 */
interface SpecializedAgent {
  agentId: string;
  description: string;
  name: string;
  searchPaths: Array<string>;
}

/**
 * Feature Planner Service
 * Handles all Claude Agent SDK operations for feature planning
 */
export class FeaturePlannerService {
  /**
   * Define specialized agents for parallel file discovery
   */
  private static readonly SPECIALIZED_AGENTS: Array<SpecializedAgent> = [
    {
      agentId: 'database-schema-agent',
      description: 'Database schemas, migrations, and ORM models',
      name: 'Database Schema Agent',
      searchPaths: ['src/lib/db/schema/', 'src/lib/db/migrations/'],
    },
    {
      agentId: 'server-actions-agent',
      description: 'Server-side actions and mutations',
      name: 'Server Actions Agent',
      searchPaths: ['src/lib/actions/'],
    },
    {
      agentId: 'queries-agent',
      description: 'Database queries and data fetching logic',
      name: 'Queries Agent',
      searchPaths: ['src/lib/queries/'],
    },
    {
      agentId: 'facades-services-agent',
      description: 'Business logic facades and services',
      name: 'Facades & Services Agent',
      searchPaths: ['src/lib/facades/', 'src/lib/services/', 'src/services/'],
    },
    {
      agentId: 'ui-components-agent',
      description: 'React UI components and design system',
      name: 'UI Components Agent',
      searchPaths: ['src/components/'],
    },
    {
      agentId: 'pages-agent',
      description: 'Application pages, route layouts, and root app files',
      name: 'Pages Agent',
      searchPaths: [
        'src/app/(app)/',
        'src/app/(public)/',
        'src/app/examples/',
        'src/app/layout.tsx',
        'src/app/global-error.tsx',
        'src/app/loading.tsx',
        'src/app/globals.css',
      ],
    },
    {
      agentId: 'api-routes-agent',
      description: 'API endpoints and route handlers',
      name: 'API Routes Agent',
      searchPaths: ['src/app/api/'],
    },
    {
      agentId: 'hooks-agent',
      description: 'Custom React hooks and state management',
      name: 'Hooks Agent',
      searchPaths: ['src/hooks/'],
    },
    {
      agentId: 'types-agent',
      description: 'TypeScript type definitions and interfaces',
      name: 'Types Agent',
      searchPaths: ['src/types/'],
    },
    {
      agentId: 'validations-agent',
      description: 'Zod schemas and validation logic',
      name: 'Validations Agent',
      searchPaths: ['src/lib/validations/'],
    },
    {
      agentId: 'utils-constants-agent',
      description: 'Utility functions, constants, middleware, and helpers',
      name: 'Utils & Constants Agent',
      searchPaths: [
        'src/lib/utils/',
        'src/lib/constants/',
        'src/lib/middleware/',
        'src/utils/',
        'src/constants/',
        'src/middleware.ts',
        'src/instrumentation.ts',
        'src/instrumentation-client.ts',
      ],
    },
    {
      agentId: 'configuration-agent',
      description: 'Configuration files for TypeScript, Next.js, Tailwind, environment variables',
      name: 'Configuration Files Agent',
      searchPaths: [
        'tsconfig.json',
        'next.config.ts',
        'next.config.js',
        'next.config.mjs',
        'tailwind.config.ts',
        'tailwind.config.js',
        '.env.example',
        '.env.local.example',
        'postcss.config.js',
        'postcss.config.mjs',
      ],
    },
    {
      agentId: 'test-files-agent',
      description: 'Test files, specs, and testing utilities',
      name: 'Test Files Agent',
      searchPaths: [
        'tests/',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        'vitest.config.ts',
        'playwright.config.ts',
      ],
    },
    {
      agentId: 'build-tooling-agent',
      description: 'Build configuration, package management, and developer tooling',
      name: 'Build & Tooling Agent',
      searchPaths: [
        'package.json',
        'drizzle.config.ts',
        '.eslintrc.json',
        '.eslintrc.js',
        '.prettierrc',
        '.prettierrc.json',
        'prettier.config.js',
        'prettier.config.mjs',
      ],
    },
  ];

  /**
   * Execute feature suggestion using slash command or custom agent
   *
   * @param pageOrComponent - Page or component name for context
   * @param featureType - Type of feature (enhancement, new-capability, etc.)
   * @param priorityLevel - Priority level (low, medium, high, critical)
   * @param additionalContext - Optional additional context
   * @param settings - Agent settings
   * @param agent - Optional custom agent configuration for feature suggestions
   * @returns Feature suggestions with metadata
   */
  static async executeFeatureSuggestionAgent(
    pageOrComponent: string,
    featureType: string,
    priorityLevel: string,
    additionalContext: string | undefined,
    settings: { customModel?: string },
    agent?: FeatureSuggestionAgent,
  ): Promise<
    AgentExecutionResult<{
      context?: string;
      suggestions: Array<{
        description: string;
        implementationConsiderations?: Array<string>;
        rationale: string;
        title: string;
      }>;
    }>
  > {
    const circuitBreaker = circuitBreakers.externalService('claude-agent-feature-suggestion', {
      timeoutMs: 620000, // 12 minutes
    });
    const startTime = Date.now();

    try {
      const result = await circuitBreaker.execute(async () => {
        let suggestionResult: {
          context?: string;
          suggestions: Array<{
            description: string;
            implementationConsiderations?: Array<string>;
            rationale: string;
            title: string;
          }>;
        } = {
          suggestions: [],
        };
        const tokenUsage = {
          cacheCreationTokens: 0,
          cacheReadTokens: 0,
          completionTokens: 0,
          promptTokens: 0,
          totalTokens: 0,
        };

        // Build prompt - use custom prompt if agent provided, otherwise use direct prompt
        const prompt =
          agent ?
            this.buildCustomFeatureSuggestionPrompt(
              pageOrComponent,
              featureType,
              priorityLevel,
              additionalContext,
              agent,
            )
          : this.buildDefaultFeatureSuggestionPrompt(
              pageOrComponent,
              featureType,
              priorityLevel,
              additionalContext,
            );

        // Use agent-specific tools if agent provided, otherwise limit tools for faster execution
        const allowedTools = agent ? agent.tools : ['Read', 'Glob'];

        console.log('[executeFeatureSuggestionAgent] Starting query with:', {
          allowedTools,
          maxTurns: agent ? 10 : 5,
          model: settings.customModel || 'claude-sonnet-4-5-20250929',
          promptLength: prompt.length,
        });

        let messageCount = 0;
        let assistantMessageCount = 0;

        const systemPrompt =
          agent?.systemPrompt ?
            {
              append: agent.systemPrompt,
              preset: 'claude_code' as const,
              type: 'preset' as const,
            }
          : {
              preset: 'claude_code' as const,
              type: 'preset' as const,
            };

        for await (const message of query({
          options: {
            ...BASE_SDK_OPTIONS,
            allowedTools,
            fallbackModel: FALLBACK_MODEL,
            maxThinkingTokens: THINKING_TOKEN_LIMITS.FEATURE_SUGGESTION,
            maxTurns: TURN_LIMITS.FEATURE_SUGGESTION,
            model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
            systemPrompt,
            /**
             * Temperature Configuration (Future Enhancement)
             *
             * Temperature control is defined in TEMPERATURE_CONFIG constants but not yet
             * applied due to SDK API limitations. When the SDK adds temperature support:
             *
             * 1. Uncomment temperature option in query() calls
             * 2. Use: temperature: agent?.temperature ?? TEMPERATURE_CONFIG.FEATURE_SUGGESTION
             * 3. Verify temperature values are respected in API responses
             *
             * Tracking: See TEMPERATURE_CONFIG in src/lib/constants/claude-sdk-config.ts
             */
            // temperature: agent?.temperature ?? TEMPERATURE_CONFIG.FEATURE_SUGGESTION,
          },
          prompt,
        })) {
          messageCount++;
          console.log(`[executeFeatureSuggestionAgent] Message #${messageCount}:`, {
            hasMessage: !!message,
            type: message.type,
          });

          if (message.type === 'assistant') {
            assistantMessageCount++;
            console.log(`[executeFeatureSuggestionAgent] Assistant message #${assistantMessageCount}`);

            // Trust SDK types - use type assertion for safety
            const assistantMessage = message.message as SDKAssistantMessage;
            const textContent = assistantMessage.content.find((c): c is SDKTextContent => c.type === 'text');

            console.log('[executeFeatureSuggestionAgent] Parsed message:', {
              contentBlocks: assistantMessage.content.length,
              contentTypes: assistantMessage.content.map((c) => c.type).join(', '),
              hasTextContent: !!textContent,
              hasUsage: !!assistantMessage.usage,
            });

            if (textContent) {
              console.log(
                '[executeFeatureSuggestionAgent] Response text preview:',
                textContent.text.substring(0, 500),
              );
              suggestionResult = this.parseFeatureSuggestionResponse(textContent.text);
              console.log('[executeFeatureSuggestionAgent] Parsed suggestions:', {
                count: suggestionResult.suggestions.length,
                hasContext: !!suggestionResult.context,
              });
            }

            if (assistantMessage.usage) {
              tokenUsage.promptTokens = assistantMessage.usage.input_tokens ?? 0;
              tokenUsage.completionTokens = assistantMessage.usage.output_tokens ?? 0;
              tokenUsage.totalTokens =
                (assistantMessage.usage.input_tokens ?? 0) + (assistantMessage.usage.output_tokens ?? 0);
              tokenUsage.cacheReadTokens = assistantMessage.usage.cache_read_input_tokens ?? 0;
              tokenUsage.cacheCreationTokens = assistantMessage.usage.cache_creation_input_tokens ?? 0;

              console.log('[executeFeatureSuggestionAgent] Token usage:', tokenUsage);
            }
          }
        }

        console.log('[executeFeatureSuggestionAgent] Query loop completed:', {
          assistantMessages: assistantMessageCount,
          suggestionsFound: suggestionResult.suggestions.length,
          totalMessages: messageCount,
        });

        return { suggestionResult, tokenUsage };
      });

      const executionTimeMs = Date.now() - startTime;

      return {
        executionTimeMs,
        result: result.result.suggestionResult,
        retryCount: 0,
        tokenUsage: result.result.tokenUsage,
      };
    } catch (error) {
      const context: ServiceErrorContext = {
        endpoint: 'query',
        isRetryable: true,
        method: 'executeFeatureSuggestionAgent',
        operation: 'feature-suggestion',
        service: 'claude-agent-sdk',
      };
      throw createServiceError(context, error);
    }
  }

  /**
   * Execute feature suggestion with streaming support
   * Same as executeFeatureSuggestionAgent but with streaming callback
   *
   * @param pageOrComponent - Page or component name for context
   * @param featureType - Type of feature (enhancement, new-capability, etc.)
   * @param priorityLevel - Priority level (low, medium, high, critical)
   * @param additionalContext - Optional additional context
   * @param settings - Agent settings
   * @param agent - Optional custom agent configuration for feature suggestions
   * @param onUpdate - Optional callback for streaming text updates
   * @returns Feature suggestions with metadata
   */
  static async executeFeatureSuggestionAgentWithStreaming(
    pageOrComponent: string,
    featureType: string,
    priorityLevel: string,
    additionalContext: string | undefined,
    settings: { customModel?: string },
    agent?: FeatureSuggestionAgent,
    onUpdate?: (text: string) => void,
  ): Promise<
    AgentExecutionResult<{
      context?: string;
      suggestions: Array<{
        description: string;
        implementationConsiderations?: Array<string>;
        rationale: string;
        title: string;
      }>;
    }>
  > {
    const circuitBreaker = circuitBreakers.externalService('claude-agent-feature-suggestion', {
      timeoutMs: 620000, // 12 minutes
    });
    const startTime = Date.now();

    try {
      const result = await circuitBreaker.execute(async () => {
        let suggestionResult: {
          context?: string;
          suggestions: Array<{
            description: string;
            implementationConsiderations?: Array<string>;
            rationale: string;
            title: string;
          }>;
        } = {
          suggestions: [],
        };
        const tokenUsage = {
          cacheCreationTokens: 0,
          cacheReadTokens: 0,
          completionTokens: 0,
          promptTokens: 0,
          totalTokens: 0,
        };

        // Build prompt - use custom prompt if agent provided, otherwise use direct prompt
        const prompt =
          agent ?
            this.buildCustomFeatureSuggestionPrompt(
              pageOrComponent,
              featureType,
              priorityLevel,
              additionalContext,
              agent,
            )
          : this.buildDefaultFeatureSuggestionPrompt(
              pageOrComponent,
              featureType,
              priorityLevel,
              additionalContext,
            );

        // Use agent-specific tools if agent provided, otherwise limit tools for faster execution
        const allowedTools = agent ? agent.tools : ['Read', 'Glob'];

        console.log('[executeFeatureSuggestionAgentWithStreaming] Starting query with:', {
          allowedTools,
          hasStreamingCallback: !!onUpdate,
          maxTurns: agent ? 10 : 5,
          model: settings.customModel || 'claude-sonnet-4-5-20250929',
          promptLength: prompt.length,
        });

        let messageCount = 0;
        let assistantMessageCount = 0;

        const systemPrompt =
          agent?.systemPrompt ?
            {
              append: agent.systemPrompt,
              preset: 'claude_code' as const,
              type: 'preset' as const,
            }
          : {
              preset: 'claude_code' as const,
              type: 'preset' as const,
            };

        for await (const message of query({
          options: {
            ...BASE_SDK_OPTIONS,
            allowedTools,
            fallbackModel: FALLBACK_MODEL,
            includePartialMessages: !!onUpdate, // Enable streaming if callback provided
            maxThinkingTokens: THINKING_TOKEN_LIMITS.FEATURE_SUGGESTION,
            maxTurns: TURN_LIMITS.FEATURE_SUGGESTION,
            model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
            systemPrompt,
          },
          prompt,
        })) {
          // Handle streaming updates
          if (message.type === 'stream_event' && onUpdate) {
            try {
              // Use SDK's built-in stream event structure
              const streamEvent = message.event as unknown as {
                content_block?: { text?: string; type: string };
                delta?: { text?: string; type: string };
                type: string;
              };

              // Check for text delta events from streaming API
              if (streamEvent.delta?.text && typeof streamEvent.delta.text === 'string') {
                onUpdate(streamEvent.delta.text);
              }
              // Check for content block events
              else if (
                streamEvent.content_block?.text &&
                typeof streamEvent.content_block.text === 'string'
              ) {
                onUpdate(streamEvent.content_block.text);
              }
            } catch (streamError) {
              console.error(
                '[executeFeatureSuggestionAgentWithStreaming] Error processing stream event:',
                streamError,
              );
            }
          }

          messageCount++;
          console.log(`[executeFeatureSuggestionAgentWithStreaming] Message #${messageCount}:`, {
            hasMessage: !!message,
            type: message.type,
          });

          // DIAGNOSTIC: Check if message type is 'result'
          if (message.type === 'result') {
            console.log('[executeFeatureSuggestionAgentWithStreaming] ⚠️ RESULT MESSAGE DETECTED - about to process');
          }

          if (message.type === 'assistant') {
            assistantMessageCount++;
            console.log(
              `[executeFeatureSuggestionAgentWithStreaming] Assistant message #${assistantMessageCount}`,
            );

            // Trust SDK types - use type assertion for safety
            const assistantMessage = message.message as SDKAssistantMessage;
            const textContent = assistantMessage.content.find((c): c is SDKTextContent => c.type === 'text');

            console.log('[executeFeatureSuggestionAgentWithStreaming] Parsed message:', {
              contentBlocks: assistantMessage.content.length,
              contentTypes: assistantMessage.content.map((c) => c.type).join(', '),
              hasTextContent: !!textContent,
              hasUsage: !!assistantMessage.usage,
            });

            if (textContent) {
              console.log(
                '[executeFeatureSuggestionAgentWithStreaming] Response text preview:',
                textContent.text.substring(0, 500),
              );
              suggestionResult = this.parseFeatureSuggestionResponse(textContent.text);
              console.log('[executeFeatureSuggestionAgentWithStreaming] Parsed suggestions:', {
                count: suggestionResult.suggestions.length,
                hasContext: !!suggestionResult.context,
              });
            }

            if (assistantMessage.usage) {
              // Accumulate token usage from assistant messages
              tokenUsage.promptTokens += assistantMessage.usage.input_tokens ?? 0;
              tokenUsage.completionTokens += assistantMessage.usage.output_tokens ?? 0;
              tokenUsage.totalTokens += (assistantMessage.usage.input_tokens ?? 0) + (assistantMessage.usage.output_tokens ?? 0);
              tokenUsage.cacheReadTokens += assistantMessage.usage.cache_read_input_tokens ?? 0;
              tokenUsage.cacheCreationTokens += assistantMessage.usage.cache_creation_input_tokens ?? 0;

              console.log('[executeFeatureSuggestionAgentWithStreaming] Accumulated token usage:', tokenUsage);
            }
          }

          // Handle result message (final output from SDK)
          if (message.type === 'result') {
            console.log('[executeFeatureSuggestionAgentWithStreaming] ✅ Result message received - processing now');

            const resultMessage = message as unknown as SDKResultMessage;

            // Log turn count to help diagnose max turn issues
            const turnCount = resultMessage.num_turns;
            const turnLimit = TURN_LIMITS.FEATURE_SUGGESTION;

            console.log('[executeFeatureSuggestionAgentWithStreaming] Turn usage:', {
              turnsUsed: turnCount,
              turnLimit,
              percentUsed: Math.round((turnCount / turnLimit) * 100),
              turnsRemaining: turnLimit - turnCount,
            });

            // Warn if approaching or exceeding turn limit
            if (turnCount >= turnLimit) {
              console.error(
                `[executeFeatureSuggestionAgentWithStreaming] ⚠️ TURN LIMIT REACHED: Used ${turnCount}/${turnLimit} turns - likely hit error_max_turns`,
              );
            } else if (turnCount >= turnLimit * 0.8) {
              console.warn(
                `[executeFeatureSuggestionAgentWithStreaming] ⚠️ HIGH TURN USAGE: Used ${turnCount}/${turnLimit} turns (${Math.round((turnCount / turnLimit) * 100)}%)`,
              );
            }

            console.log('[executeFeatureSuggestionAgentWithStreaming] Result details:', {
              hasResult: !!resultMessage.result,
              hasUsage: !!resultMessage.usage,
              isError: resultMessage.isError,
              numTurns: turnCount,
              resultLength: resultMessage.result?.length,
              subtype: resultMessage.subtype,
            });

            // Extract final result text if available
            if (resultMessage.result && resultMessage.subtype === 'success') {
              console.log(
                '[executeFeatureSuggestionAgentWithStreaming] Final result text preview:',
                resultMessage.result.substring(0, 500),
              );

              suggestionResult = this.parseFeatureSuggestionResponse(resultMessage.result);
              console.log('[executeFeatureSuggestionAgentWithStreaming] Parsed suggestions from result:', {
                count: suggestionResult.suggestions.length,
                hasContext: !!suggestionResult.context,
                suggestions: suggestionResult.suggestions.map((s) => ({ title: s.title })),
              });
            } else {
              console.warn('[executeFeatureSuggestionAgentWithStreaming] ⚠️ Result message has no result text or not success:', {
                hasResult: !!resultMessage.result,
                subtype: resultMessage.subtype,
              });
            }

            // Use final token usage from result message (most accurate)
            if (resultMessage.usage) {
              tokenUsage.promptTokens = resultMessage.usage.input_tokens;
              tokenUsage.completionTokens = resultMessage.usage.output_tokens;
              tokenUsage.totalTokens = resultMessage.usage.input_tokens + resultMessage.usage.output_tokens;
              tokenUsage.cacheReadTokens = resultMessage.usage.cache_read_input_tokens;
              tokenUsage.cacheCreationTokens = resultMessage.usage.cache_creation_input_tokens;

              console.log('[executeFeatureSuggestionAgentWithStreaming] Final token usage from result:', tokenUsage);
            } else {
              console.warn('[executeFeatureSuggestionAgentWithStreaming] ⚠️ Result message has no usage data');
            }
          }
        }

        console.log('[executeFeatureSuggestionAgentWithStreaming] Query loop completed:', {
          assistantMessages: assistantMessageCount,
          suggestionsFound: suggestionResult.suggestions.length,
          totalMessages: messageCount,
        });

        return { suggestionResult, tokenUsage };
      });

      const executionTimeMs = Date.now() - startTime;

      return {
        executionTimeMs,
        result: result.result.suggestionResult,
        retryCount: 0,
        tokenUsage: result.result.tokenUsage,
      };
    } catch (error) {
      const context: ServiceErrorContext = {
        endpoint: 'query',
        isRetryable: true,
        method: 'executeFeatureSuggestionAgentWithStreaming',
        operation: 'feature-suggestion-streaming',
        service: 'claude-agent-sdk',
      };
      throw createServiceError(context, error);
    }
  }

  /**
   * Execute file discovery agent (legacy single-agent version)
   *
   * @deprecated Use executeParallelFileDiscoveryAgents instead
   * @param refinedRequest - The refined feature request
   * @param settings - Agent settings
   * @returns Discovered files with metadata
   */
  static async executeFileDiscoveryAgent(
    refinedRequest: string,
    settings: { customModel?: string },
  ): Promise<AgentExecutionResult<Array<FileDiscoveryResult>>> {
    // Use 3-minute timeout for long-running agent operations
    const circuitBreaker = circuitBreakers.externalService('claude-agent-file-discovery', {
      timeoutMs: 620000, // 12 minutes
    });
    const startTime = Date.now();

    try {
      const result = await circuitBreaker.execute(async () => {
        let discoveredFiles: Array<FileDiscoveryResult> = [];
        const tokenUsage = {
          completionTokens: 0,
          promptTokens: 0,
          totalTokens: 0,
        };

        const prompt = this.buildFileDiscoveryPrompt(refinedRequest);

        for await (const message of query({
          options: {
            ...BASE_SDK_OPTIONS,
            allowedTools: ['Read', 'Grep', 'Glob'],
            fallbackModel: FALLBACK_MODEL,
            maxThinkingTokens: THINKING_TOKEN_LIMITS.FILE_DISCOVERY,
            maxTurns: TURN_LIMITS.FILE_DISCOVERY_LEGACY,
            model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
            systemPrompt: {
              preset: 'claude_code',
              type: 'preset',
            },
          },
          prompt,
        })) {
          if (message.type === 'assistant') {
            // Trust SDK types - use type assertion for safety
            const assistantMessage = message.message as SDKAssistantMessage;
            const textContent = assistantMessage.content.find((c): c is SDKTextContent => c.type === 'text');

            if (textContent) {
              discoveredFiles = this.parseFileDiscoveryResponse(textContent.text);
            }

            if (assistantMessage.usage) {
              tokenUsage.promptTokens = assistantMessage.usage.input_tokens ?? 0;
              tokenUsage.completionTokens = assistantMessage.usage.output_tokens ?? 0;
              tokenUsage.totalTokens =
                (assistantMessage.usage.input_tokens ?? 0) + (assistantMessage.usage.output_tokens ?? 0);
            }
          }
        }

        return { discoveredFiles, tokenUsage };
      });

      const executionTimeMs = Date.now() - startTime;

      return {
        executionTimeMs,
        result: result.result.discoveredFiles,
        retryCount: 0,
        tokenUsage: result.result.tokenUsage,
      };
    } catch (error) {
      const context: ServiceErrorContext = {
        endpoint: 'query',
        isRetryable: true,
        method: 'executeFileDiscoveryAgent',
        operation: 'file-discovery',
        service: 'claude-agent-sdk',
      };
      throw createServiceError(context, error);
    }
  }

  /**
   * Execute implementation planning agent
   *
   * @param refinedRequest - The refined feature request
   * @param discoveredFiles - Files discovered in previous step
   * @param settings - Agent settings
   * @returns Implementation plan with structured steps
   */
  static async executeImplementationPlanningAgent(
    refinedRequest: string,
    discoveredFiles: Array<FileDiscoveryResult>,
    settings: { customModel?: string },
  ): Promise<AgentExecutionResult<ImplementationPlanResult>> {
    // Use 3-minute timeout for long-running agent operations
    const circuitBreaker = circuitBreakers.externalService('claude-agent-implementation-planning', {
      timeoutMs: 620000, // 3 minutes
    });
    const startTime = Date.now();

    try {
      const result = await circuitBreaker.execute(async () => {
        let planResult: ImplementationPlanResult = {
          complexity: 'medium',
          estimatedDuration: '',
          implementationPlan: '',
          riskLevel: 'medium',
          steps: [],
        };
        const tokenUsage = {
          completionTokens: 0,
          promptTokens: 0,
          totalTokens: 0,
        };

        const prompt = this.buildImplementationPlanPrompt(refinedRequest, discoveredFiles);

        for await (const message of query({
          options: {
            ...BASE_SDK_OPTIONS,
            allowedTools: ['Read', 'Grep', 'Glob'],
            fallbackModel: FALLBACK_MODEL,
            maxThinkingTokens: THINKING_TOKEN_LIMITS.IMPLEMENTATION_PLANNING,
            maxTurns: TURN_LIMITS.IMPLEMENTATION_PLANNING,
            model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
            systemPrompt: {
              preset: 'claude_code',
              type: 'preset',
            },
          },
          prompt,
        })) {
          if (message.type === 'assistant') {
            // Trust SDK types - use type assertion for safety
            const assistantMessage = message.message as SDKAssistantMessage;
            const textContent = assistantMessage.content.find((c): c is SDKTextContent => c.type === 'text');

            if (textContent) {
              planResult = this.parseImplementationPlanResponse(textContent.text);
            }

            if (assistantMessage.usage) {
              tokenUsage.promptTokens = assistantMessage.usage.input_tokens ?? 0;
              tokenUsage.completionTokens = assistantMessage.usage.output_tokens ?? 0;
              tokenUsage.totalTokens =
                (assistantMessage.usage.input_tokens ?? 0) + (assistantMessage.usage.output_tokens ?? 0);
            }
          }
        }

        return { planResult, tokenUsage };
      });

      const executionTimeMs = Date.now() - startTime;

      return {
        executionTimeMs,
        result: result.result.planResult,
        retryCount: 0,
        tokenUsage: result.result.tokenUsage,
      };
    } catch (error) {
      const context: ServiceErrorContext = {
        endpoint: 'query',
        isRetryable: true,
        method: 'executeImplementationPlanningAgent',
        operation: 'implementation-planning',
        service: 'claude-agent-sdk',
      };
      throw createServiceError(context, error);
    }
  }

  /**
   * Execute parallel file discovery with specialized agents
   *
   * @param refinedRequest - The refined feature request
   * @param settings - Agent settings
   * @returns Discovered files with metadata from all agents
   */
  static async executeParallelFileDiscoveryAgents(
    refinedRequest: string,
    settings: { customModel?: string },
  ): Promise<AgentExecutionResult<Array<FileDiscoveryResult>>> {
    const circuitBreaker = circuitBreakers.externalService('claude-agent-parallel-file-discovery', {
      timeoutMs: 620000, // 12 minutes
    });
    const startTime = Date.now();

    try {
      const result = await circuitBreaker.execute(async () => {
        // Execute all specialized agents in parallel
        const agentPromises = this.SPECIALIZED_AGENTS.map((agent) =>
          this.executeSingleFileDiscoveryAgent(refinedRequest, agent, settings),
        );

        const agentResults = await Promise.all(agentPromises);

        // Aggregate results from all agents
        const aggregatedFiles = this.aggregateDiscoveredFiles(agentResults);

        // Calculate total token usage
        const totalTokenUsage = agentResults.reduce(
          (acc, agentResult) => ({
            completionTokens: acc.completionTokens + agentResult.tokenUsage.completionTokens,
            promptTokens: acc.promptTokens + agentResult.tokenUsage.promptTokens,
            totalTokens: acc.totalTokens + agentResult.tokenUsage.totalTokens,
          }),
          { completionTokens: 0, promptTokens: 0, totalTokens: 0 },
        );

        return {
          discoveredFiles: aggregatedFiles,
          tokenUsage: totalTokenUsage,
        };
      });

      const executionTimeMs = Date.now() - startTime;

      return {
        executionTimeMs,
        result: result.result.discoveredFiles,
        retryCount: 0,
        tokenUsage: result.result.tokenUsage,
      };
    } catch (error) {
      const context: ServiceErrorContext = {
        endpoint: 'query',
        isRetryable: true,
        method: 'executeParallelFileDiscoveryAgents',
        operation: 'parallel-file-discovery',
        service: 'claude-agent-sdk',
      };
      throw createServiceError(context, error);
    }
  }

  /**
   * Execute feature refinement agent
   *
   * @param originalRequest - User's original feature request
   * @param settings - Refinement settings (length, context, etc.)
   * @param agent - Optional specialized agent configuration for role-based refinement
   * @param onPartialUpdate - Optional callback for streaming partial text updates
   * @returns Refined feature request with metadata
   */
  static async executeRefinementAgent(
    originalRequest: string,
    settings: Pick<
      RefinementSettings,
      'customModel' | 'includeProjectContext' | 'maxOutputLength' | 'minOutputLength'
    >,
    agent?: RefinementAgent,
    onPartialUpdate?: (partialText: string) => void,
  ): Promise<AgentExecutionResult<RefinementOutput | string>> {
    // Use 3-minute timeout for long-running agent operations
    const circuitBreaker = circuitBreakers.externalService('claude-agent-refinement', {
      timeoutMs: 620000, // 12 minutes
    });
    const startTime = Date.now();

    try {
      const result = await circuitBreaker.execute(async () => {
        let refinedText = '';
        let refinementOutput: null | RefinementOutput = null;
        const tokenUsage = {
          cacheCreationTokens: 0,
          cacheReadTokens: 0,
          completionTokens: 0,
          promptTokens: 0,
          totalTokens: 0,
        };

        // Build agent prompt (role-based if agent provided, otherwise generic)
        const prompt =
          agent ?
            this.buildRoleBasedRefinementPrompt(originalRequest, agent, settings)
          : this.buildRefinementPrompt(originalRequest, settings);

        // Determine tools to use (agent-specific or setting-based)
        const allowedTools =
          agent ? agent.tools
          : settings.includeProjectContext ? ['Read', 'Grep', 'Glob']
          : [];

        const systemPrompt =
          agent ?
            {
              append: agent.systemPrompt,
              preset: 'claude_code' as const,
              type: 'preset' as const,
            }
          : {
              preset: 'claude_code' as const,
              type: 'preset' as const,
            };

        // Execute agent with SDK
        for await (const message of query({
          options: {
            ...BASE_SDK_OPTIONS,
            allowedTools,
            fallbackModel: FALLBACK_MODEL,
            includePartialMessages: !!onPartialUpdate, // Enable streaming if callback provided
            maxThinkingTokens: THINKING_TOKEN_LIMITS.REFINEMENT,
            maxTurns: TURN_LIMITS.REFINEMENT,
            model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
            systemPrompt,
            /**
             * Temperature Configuration (Future Enhancement)
             *
             * Temperature control is defined in TEMPERATURE_CONFIG constants but not yet
             * applied due to SDK API limitations. When the SDK adds temperature support:
             *
             * 1. Uncomment temperature option in query() calls
             * 2. Use: temperature: agent?.temperature ?? TEMPERATURE_CONFIG.REFINEMENT
             * 3. Verify temperature values are respected in API responses
             *
             * Tracking: See TEMPERATURE_CONFIG in src/lib/constants/claude-sdk-config.ts
             */
            // temperature: agent?.temperature ?? TEMPERATURE_CONFIG.REFINEMENT,
          },
          prompt,
        })) {
          // Handle streaming updates
          if (message.type === 'stream_event' && onPartialUpdate) {
            try {
              // Use SDK's built-in stream event structure
              // Type cast to work around SDK typing limitations
              const streamEvent = message.event as unknown as {
                content_block?: { text?: string; type: string };
                delta?: { text?: string; type: string };
                type: string;
              };

              // Check for text delta events from streaming API
              if (streamEvent.delta?.text && typeof streamEvent.delta.text === 'string') {
                onPartialUpdate(streamEvent.delta.text);
              }
              // Check for content block events
              else if (
                streamEvent.content_block?.text &&
                typeof streamEvent.content_block.text === 'string'
              ) {
                onPartialUpdate(streamEvent.content_block.text);
              }
            } catch (streamError) {
              console.error('[executeRefinementAgent] Error processing stream event:', streamError);
            }
          }

          // Extract assistant response
          if (message.type === 'assistant') {
            // Trust SDK types - use type assertion for safety
            const assistantMessage = message.message as SDKAssistantMessage;
            const textContent = assistantMessage.content.find((c): c is SDKTextContent => c.type === 'text');

            if (textContent) {
              refinedText = textContent.text;

              // If using role-based agent, parse structured JSON output
              if (agent) {
                try {
                  const jsonString = extractJsonFromMarkdown(refinedText);
                  refinementOutput = parseRefinementOutput(jsonString);
                } catch (error) {
                  console.error(
                    `[executeRefinementAgent] Failed to parse JSON from ${agent.agentId}:`,
                    error,
                  );
                  // Fall back to plain text if JSON parsing fails
                  refinementOutput = null;
                }
              }
            }

            // Track token usage
            if (assistantMessage.usage) {
              tokenUsage.promptTokens = assistantMessage.usage.input_tokens ?? 0;
              tokenUsage.completionTokens = assistantMessage.usage.output_tokens ?? 0;
              tokenUsage.totalTokens =
                (assistantMessage.usage.input_tokens ?? 0) + (assistantMessage.usage.output_tokens ?? 0);
              tokenUsage.cacheReadTokens = assistantMessage.usage.cache_read_input_tokens ?? 0;
              tokenUsage.cacheCreationTokens = assistantMessage.usage.cache_creation_input_tokens ?? 0;
            }
          }
        }

        return {
          refinedText,
          refinementOutput,
          tokenUsage,
        };
      });

      const executionTimeMs = Date.now() - startTime;

      // Return structured output if available, otherwise fall back to plain text
      const finalResult = result.result.refinementOutput || result.result.refinedText;

      return {
        executionTimeMs,
        result: finalResult,
        retryCount: 0,
        tokenUsage: result.result.tokenUsage,
      };
    } catch (error) {
      const context: ServiceErrorContext = {
        endpoint: 'query',
        isRetryable: true,
        method: 'executeRefinementAgent',
        operation: 'feature-refinement',
        service: 'claude-agent-sdk',
      };
      throw createServiceError(context, error);
    }
  }

  /**
   * Execute synthesis agent to combine multiple refinements
   *
   * @param originalRequest - User's original feature request
   * @param refinements - Array of refinement outputs from specialized agents
   * @param settings - Refinement settings (length, context, etc.)
   * @returns Synthesized refinement combining best aspects from all agents
   */
  static async executeSynthesisAgent(
    originalRequest: string,
    refinements: Array<RefinementOutput>,
    settings: Pick<
      RefinementSettings,
      'customModel' | 'includeProjectContext' | 'maxOutputLength' | 'minOutputLength'
    >,
  ): Promise<AgentExecutionResult<RefinementOutput>> {
    const circuitBreaker = circuitBreakers.externalService('claude-agent-synthesis', {
      timeoutMs: 620000, // 12 minutes
    });
    const startTime = Date.now();

    try {
      const result = await circuitBreaker.execute(async () => {
        let refinementOutput: null | RefinementOutput = null;
        const tokenUsage = {
          cacheCreationTokens: 0,
          cacheReadTokens: 0,
          completionTokens: 0,
          promptTokens: 0,
          totalTokens: 0,
        };

        const prompt = this.buildSynthesisPrompt(originalRequest, refinements, settings);

        for await (const message of query({
          options: {
            ...BASE_SDK_OPTIONS,
            allowedTools: [], // Synthesis doesn't need to read files
            fallbackModel: FALLBACK_MODEL,
            maxThinkingTokens: THINKING_TOKEN_LIMITS.SYNTHESIS,
            maxTurns: TURN_LIMITS.SYNTHESIS,
            model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
            systemPrompt: {
              preset: 'claude_code',
              type: 'preset',
            },
          },
          prompt,
        })) {
          if (message.type === 'assistant') {
            // Trust SDK types - use type assertion for safety
            const assistantMessage = message.message as SDKAssistantMessage;
            const textContent = assistantMessage.content.find((c): c is SDKTextContent => c.type === 'text');

            if (textContent) {
              try {
                const jsonString = extractJsonFromMarkdown(textContent.text);
                refinementOutput = parseRefinementOutput(jsonString);
              } catch (error) {
                console.error('[executeSynthesisAgent] Failed to parse synthesis output:', error);
                throw new Error('Failed to parse synthesis agent response as JSON');
              }
            }

            if (assistantMessage.usage) {
              tokenUsage.promptTokens = assistantMessage.usage.input_tokens ?? 0;
              tokenUsage.completionTokens = assistantMessage.usage.output_tokens ?? 0;
              tokenUsage.totalTokens =
                (assistantMessage.usage.input_tokens ?? 0) + (assistantMessage.usage.output_tokens ?? 0);
              tokenUsage.cacheReadTokens = assistantMessage.usage.cache_read_input_tokens ?? 0;
              tokenUsage.cacheCreationTokens = assistantMessage.usage.cache_creation_input_tokens ?? 0;
            }
          }
        }

        if (!refinementOutput) {
          throw new Error('Synthesis agent did not return a valid refinement output');
        }

        return {
          refinementOutput,
          tokenUsage,
        };
      });

      const executionTimeMs = Date.now() - startTime;

      return {
        executionTimeMs,
        result: result.result.refinementOutput,
        retryCount: 0,
        tokenUsage: result.result.tokenUsage,
      };
    } catch (error) {
      const context: ServiceErrorContext = {
        endpoint: 'query',
        isRetryable: true,
        method: 'executeSynthesisAgent',
        operation: 'refinement-synthesis',
        service: 'claude-agent-sdk',
      };
      throw createServiceError(context, error);
    }
  }

  /**
   * Extract architecture insights from discovered files
   * Analyzes patterns, conventions, and reusable components
   *
   * @param files - Discovered files to analyze
   * @returns Architecture insights as markdown text
   */
  static extractArchitectureInsights(files: Array<FileDiscoveryResult>): string {
    const insights: Array<string> = [];

    // Identify architectural patterns
    const patterns = new Set<string>();
    const components = new Set<string>();
    const utilities = new Set<string>();

    for (const file of files) {
      // Detect patterns from file paths
      if (file.filePath.includes('/actions/')) {
        patterns.add('Server actions using Next-Safe-Action');
      }
      if (file.filePath.includes('/queries/')) {
        patterns.add('Database queries using Drizzle ORM');
      }
      if (file.filePath.includes('/facades/')) {
        patterns.add('Business logic encapsulated in facades');
      }
      if (file.filePath.includes('/schema/')) {
        patterns.add('Database schemas using Drizzle ORM');
      }
      if (file.filePath.includes('/validations/')) {
        patterns.add('Form validation using Zod schemas');
      }
      if (file.filePath.includes('/components/ui/')) {
        const componentName = file.filePath
          .split('/')
          .pop()
          ?.replace(/\.tsx?$/, '');
        if (componentName) components.add(componentName);
      }
      if (file.filePath.includes('/lib/utils/') || file.filePath.includes('/utils/')) {
        const utilityName = file.filePath
          .split('/')
          .pop()
          ?.replace(/\.tsx?$/, '');
        if (utilityName) utilities.add(utilityName);
      }
    }

    // Build insights
    if (patterns.size > 0) {
      insights.push(
        `**Architectural Patterns:**\n${Array.from(patterns)
          .map((p) => `- ${p}`)
          .join('\n')}`,
      );
    }

    if (components.size > 0 && components.size <= 10) {
      insights.push(
        `**Reusable Components:**\n${Array.from(components)
          .filter((c) => c)
          .map((c) => `- ${c}`)
          .join('\n')}`,
      );
    }

    if (utilities.size > 0 && utilities.size <= 10) {
      insights.push(
        `**Utility Functions:**\n${Array.from(utilities)
          .filter((u) => u)
          .map((u) => `- ${u}`)
          .join('\n')}`,
      );
    }

    // Identify conventions based on file structure
    const conventions: Array<string> = [];
    const hasSrcLib = files.some((f) => f.filePath.startsWith('src/lib/'));
    const hasSrcApp = files.some((f) => f.filePath.startsWith('src/app/'));

    if (hasSrcLib) {
      conventions.push('Business logic organized under src/lib/');
    }
    if (hasSrcApp) {
      conventions.push('Next.js App Router structure with route groups');
    }

    if (conventions.length > 0) {
      insights.push(`**Conventions:**\n${conventions.map((c) => `- ${c}`).join('\n')}`);
    }

    return insights.join('\n\n');
  }

  /**
   * Aggregate and deduplicate files from multiple agents
   *
   * @param agentResults - Results from all specialized agents
   * @returns Deduplicated list of discovered files
   */
  private static aggregateDiscoveredFiles(
    agentResults: Array<{
      agentId: string;
      discoveredFiles: Array<FileDiscoveryResult>;
    }>,
  ): Array<FileDiscoveryResult> {
    const fileMap = new Map<string, FileDiscoveryResult>();

    for (const agentResult of agentResults) {
      for (const file of agentResult.discoveredFiles) {
        const normalizedPath = file.filePath.trim().replace(/`\*\*/g, '');
        const existing = fileMap.get(normalizedPath);

        // Keep the file with the highest relevance score
        if (!existing || file.relevanceScore > existing.relevanceScore) {
          fileMap.set(normalizedPath, {
            ...file,
            filePath: normalizedPath,
          });
        }
      }
    }

    // Sort by relevance score (descending) and then by priority
    const priorityOrder = { critical: 0, high: 1, low: 3, medium: 2 };
    return Array.from(fileMap.values()).sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Build custom feature suggestion prompt with agent configuration
   */
  private static buildCustomFeatureSuggestionPrompt(
    pageOrComponent: string,
    featureType: string,
    priorityLevel: string,
    additionalContext: string | undefined,
    agent: FeatureSuggestionAgent,
  ): string {
    const contextStr = additionalContext ? `\n\nAdditional Context: ${additionalContext}` : '';

    return `${agent.systemPrompt}
 
FEATURE SUGGESTION CONTEXT:
- Target Area: ${pageOrComponent}
- Feature Type: ${featureType} (e.g., enhancement, new-capability, optimization, ui-improvement, integration)
- Priority Level: ${priorityLevel} (low, medium, high, critical)${contextStr}

YOUR TASK:
As a ${agent.role} with focus on ${agent.focus}, analyze the target area and generate 3-5 strategic feature suggestions.

REQUIREMENTS:
- Each suggestion must include: title, rationale, description, implementationConsiderations
- Consider the specified feature type and priority level
- Use Read/Grep/Glob tools to analyze relevant project files
- Base suggestions on actual codebase patterns and conventions

OUTPUT FORMAT:
Return ONLY a JSON object (no markdown code blocks) with this structure:

{
  "context": "Brief analysis of the target area (optional)",
  "suggestions": [
    {
      "title": "Feature name",
      "rationale": "Why this feature is valuable",
      "description": "What the feature does",
      "implementationConsiderations": ["consideration 1", "consideration 2"]
    }
  ]
}

IMPORTANT:
- Return ONLY the JSON object
- Start with { and end with }
- No markdown code blocks
- No explanatory text
- Ensure all strings are properly escaped`;
  }

  /**
   * Build default feature suggestion prompt (when no custom agent provided)
   */
  private static buildDefaultFeatureSuggestionPrompt(
    pageOrComponent: string,
    featureType: string,
    priorityLevel: string,
    additionalContext: string | undefined,
  ): string {
    const contextStr = additionalContext ? `\n\nAdditional Context: ${additionalContext}` : '';

    return `You are a product strategist helping to generate feature suggestions for a web application.

FEATURE SUGGESTION REQUEST:
- Target Area: ${pageOrComponent}
- Feature Type: ${featureType} (enhancement, new-capability, optimization, ui-improvement, integration)
- Priority Level: ${priorityLevel} (low, medium, high, critical)${contextStr}

YOUR TASK:
Generate 3-5 strategic feature suggestions for the target area that match the specified feature type and priority level.

TOOL USAGE CONSTRAINTS (CRITICAL - MAXIMUM 15 TURNS):
⚠️ WARNING: You have a HARD LIMIT of 15 conversation turns. After 15 turns, execution stops and suggestions are lost.

STRICT FILE READING RULES (FOLLOW EXACTLY):
1. Read CLAUDE.md ONLY (1 file, 1 turn)
2. Use Glob to find 1-2 relevant files (1 turn)
3. Read MAXIMUM 2 additional files (2 turns max)
4. STOP using tools after 5-6 turns
5. Generate JSON response immediately

PROHIBITED:
- Reading more than 3 files total (CLAUDE.md + 2 others)
- Using Grep (use Glob instead for faster file discovery)
- Making multiple Read calls beyond the 3-file limit
- Any tool use after reading your 3 files

CONSEQUENCES OF EXCEEDING LIMITS:
- Turn 15+ → Execution terminated, zero suggestions returned
- No second chances, no retries
- User sees "0 suggestions" as final result

REQUIRED WORKFLOW:
Turn 1: Read CLAUDE.md
Turn 2: Glob for relevant files
Turn 3-4: Read 2 most relevant files
Turn 5+: Generate JSON response (NO MORE TOOLS)

GUIDELINES:
- Focus on practical, implementable features that add clear value
- Consider the existing architecture and patterns from the files you read
- Each suggestion should be distinct and address different aspects
- Base suggestions on actual codebase context, not speculation

OUTPUT FORMAT:
Return your response as a JSON code block in this exact structure:

\`\`\`json
{
  "context": "Brief 1-2 sentence analysis of the target area based on files reviewed",
  "suggestions": [
    {
      "title": "Feature name (be specific and descriptive)",
      "rationale": "Why this feature is valuable (1-2 sentences)",
      "description": "What the feature does and how it benefits users (2-3 sentences)",
      "implementationConsiderations": ["consideration 1", "consideration 2", "consideration 3"]
    }
  ]
}
\`\`\`

CRITICAL REQUIREMENTS:
- Return ONLY the JSON code block (start with \`\`\`json and end with \`\`\`)
- NO explanatory text before or after the code block
- Generate exactly 3-5 suggestions
- Ensure all JSON strings are properly escaped
- Each suggestion must have all 4 required fields: title, rationale, description, implementationConsiderations
- implementationConsiderations must be an array with at least 2 items`;
  }

  /**
   * Build file discovery prompt (legacy version)
   */
  private static buildFileDiscoveryPrompt(refinedRequest: string): string {
    return `Find all relevant files for implementing this feature request.

FEATURE REQUEST:
${refinedRequest}

For each file, provide:
- File path (exact path from project root)
- Priority (critical/high/medium/low)
- Role (what type of file: component, service, schema, etc.)
- Integration point (how it connects to the feature)
- Reasoning (why it's relevant)
- Relevance score (0-100)

Return at least 5 relevant files, organized by priority.`;
  }

  /**
   * Build implementation plan prompt
   */
  private static buildImplementationPlanPrompt(
    refinedRequest: string,
    discoveredFiles: Array<FileDiscoveryResult>,
  ): string {
    const filesList = discoveredFiles
      .map((f) => `- ${f.filePath} (${f.priority}): ${f.description}`)
      .join('\n');

    return `Create a detailed implementation plan for this feature.

FEATURE REQUEST:
${refinedRequest}

RELEVANT FILES:
${filesList}

Create a structured markdown plan with:
1. Overview (estimated duration, complexity, risk level)
2. Quick Summary (2-3 sentences)
3. Prerequisites
4. Implementation Steps (numbered, with validation commands)
5. Quality Gates
6. Notes

IMPORTANT:
- Use markdown format (not XML)
- Include "npm run lint:fix && npm run typecheck" after code changes
- No code examples in plan (instructions only)
- Add confidence level for each step (high/medium/low)`;
  }

  /**
   * Build refinement prompt with settings
   */
  private static buildRefinementPrompt(
    originalRequest: string,
    settings: {
      includeProjectContext: boolean;
      maxOutputLength: number;
      minOutputLength: number;
    },
  ): string {
    return `Refine this feature request into a clear, detailed description.

ORIGINAL REQUEST:
${originalRequest}

REQUIREMENTS:
- Output length: ${settings.minOutputLength}-${settings.maxOutputLength} words
- Single paragraph only (no headers, bullets, or sections)
- Preserve original scope (do not add features)
- Add essential technical context
${settings.includeProjectContext ? '- Include project context from CLAUDE.md and package.json' : '- Do not read project files'}

OUTPUT:
Provide only the refined paragraph, nothing else.`;
  }

  /**
   * Build role-based refinement prompt with structured JSON output
   */
  private static buildRoleBasedRefinementPrompt(
    originalRequest: string,
    agent: RefinementAgent,
    settings: {
      includeProjectContext: boolean;
      maxOutputLength: number;
      minOutputLength: number;
    },
  ): string {
    return `${agent.systemPrompt}

ORIGINAL FEATURE REQUEST:
${originalRequest}

YOUR TASK:
Refine this feature request from your ${agent.role} perspective. Return ONLY the JSON object - no preamble, no analysis commentary, no "I will analyze" statements.

REQUIREMENTS:
- Output length: ${settings.minOutputLength}-${settings.maxOutputLength} words for refinedRequest field
- Focus on your area of expertise: ${agent.focus}
- Preserve original scope (do not add features beyond the request)
- Add technical context relevant to your role
${settings.includeProjectContext ? '- Use Read/Grep/Glob tools to analyze CLAUDE.md and relevant project files' : '- Do not read project files - analyze based on general knowledge'}

CRITICAL OUTPUT RULES:
- DO NOT write "I will analyze..." or "I'll provide..." or any meta-commentary
- DO NOT explain what you're about to do
- DO NOT write conversational responses
- IMMEDIATELY return the JSON object as your first and only output

OUTPUT FORMAT:
You MUST return ONLY a JSON object (no markdown code blocks, no extra text) with this exact structure:

{
  "refinedRequest": "Clear, detailed description (${settings.minOutputLength}-${settings.maxOutputLength} words)",
  "focus": "${agent.focus}",
  "confidence": "high|medium|low",
  "technicalComplexity": "high|medium|low",
  "keyRequirements": ["requirement 1", "requirement 2", "requirement 3"],
  "assumptions": ["assumption 1", "assumption 2"],
  "risks": ["risk 1", "risk 2"],
  "estimatedScope": "small|medium|large"
}

IMPORTANT:
- Return ONLY the JSON object
- Start your response with { and end with }
- No markdown code blocks (\`\`\`json)
- No explanatory text before or after the JSON
- Ensure all strings are properly escaped
- Arrays must contain at least 1 item`;
  }

  /**
   * Build specialized agent prompt with enhanced guidance using XML structure
   */
  private static buildSpecializedAgentPrompt(refinedRequest: string, agent: SpecializedAgent): string {
    const searchPathsStr = agent.searchPaths.join(', ');

    return `You are the ${agent.name}. Find relevant files in: ${searchPathsStr}

<feature_request>
${refinedRequest}
</feature_request>

<instructions>
<search_paths>
${searchPathsStr}
</search_paths>

<task_steps>
1. Use Glob to search for files in your assigned paths
2. Use Grep to search file contents for relevant keywords
3. Use Glob to VERIFY file existence (efficient)
4. Use Read ONLY for critical/high priority files where you need content details
5. Mark fileExists: true for files found by Glob
6. Mark fileExists: false for files that don't exist but should be created
7. Find at least 3 relevant files
</task_steps>

<file_verification_rules>
- Use Glob with exact file paths to verify existence (fast)
- Use Read ONLY when analyzing file contents for description/reasoning
- If critical/high priority: Read to provide detailed description
- If medium/low priority: Glob for existence, infer from file path
- If Glob finds file → fileExists: true
- If Glob doesn't find file → fileExists: false, describe what should be created
- DO NOT guess - always verify with Glob at minimum
</file_verification_rules>

<description_requirements>
- NO speculative language: avoid "may", "might", "potentially", "could", "should"
- State facts definitively: "Contains X" not "May contain X"
- For existing files: describe what IS in the file
- For missing files: describe what WILL BE in the file
- Be specific about contents, not vague possibilities
</description_requirements>
</instructions>
 
<critical_output_format>
<format_rules>
ABSOLUTELY CRITICAL:
- Your response MUST be ONLY a JSON code block
- NO text before the opening \`\`\`json
- NO text after the closing \`\`\`
- NO greetings, explanations, or commentary
- The FIRST THREE characters must be: \`\`\`
- The LAST THREE characters must be: \`\`\`
</format_rules>

<correct_format_example>
\`\`\`json
[
  {
    "filePath": "src/lib/db/schema/social.schema.ts",
    "priority": "critical",
    "role": "Database schema definition",
    "fileExists": true,
    "description": "Defines social features schema with likes and follows tables using Drizzle ORM.",
    "reasoning": "Core database schema that must be modified to add the favorites table",
    "integrationPoint": "Add favorites table with columns: id, userId, entityType, entityId, createdAt",
    "relevanceScore": 95
  }
]
\`\`\`
</correct_format_example>

<incorrect_format_examples>
WRONG - Has preamble:
"Here are the files I found:
\`\`\`json
[...]
\`\`\`"

WRONG - Has explanation after:
"\`\`\`json
[...]
\`\`\`
I've analyzed the codebase and found these relevant files."

WRONG - No code block:
"[{...}]"
</incorrect_format_examples>
</critical_output_format>

<examples>
<example_existing_file>
\`\`\`json
[
  {
    "filePath": "src/lib/db/schema/social.schema.ts",
    "priority": "critical",
    "role": "Database schema definition",
    "fileExists": true,
    "description": "Defines social features schema with likes and follows tables using Drizzle ORM. Contains user references, timestamps, and entity relationship patterns that the favorites table will follow. Uses pgEnum for entity types and proper foreign key constraints.",
    "reasoning": "Core database schema that must be modified to add the favorites table with polymorphic entity support",
    "integrationPoint": "Add favorites table with columns: id, userId, entityType, entityId, createdAt. Follow existing likes/follows pattern with userId foreign key to users table. Requires database migration. Affects getFavoritesByUser query and toggleFavorite action.",
    "relevanceScore": 95
  }
]
\`\`\`
</example_existing_file>

<example_missing_file>
\`\`\`json
[
  {
    "filePath": "src/hooks/use-favorite.ts",
    "priority": "high",
    "role": "React hook for favorite mutations",
    "fileExists": false,
    "description": "Custom hook that will provide useFavorite() and useUnfavorite() mutations using TanStack Query. Will handle optimistic updates, cache invalidation, and error handling for favorite operations across all entity types.",
    "reasoning": "Required new file for managing favorite state in React components with proper TypeScript types",
    "integrationPoint": "Create useFavorite() hook with toggleFavorite mutation. Will be imported and used by CollectionCard (src/components/collections/collection-card.tsx) and BobbleheadCard (src/components/bobbleheads/bobblehead-card.tsx) components (2 files). Provides optimistic UI updates before server confirmation.",
    "relevanceScore": 88
  }
]
\`\`\`
</example_missing_file>
</examples>

<priority_guidelines>
- **critical** (90-100): MUST modify for feature to work (core logic, schema)
- **high** (70-89): LIKELY modify for integration (API routes, UI components)
- **medium** (50-69): MAY modify for polish (styling, types)
- **low** (30-49): Reference only (examples, utilities)
</priority_guidelines>

<required_fields>
All objects must include:
- filePath: Exact path from project root
- priority: "critical" | "high" | "medium" | "low"
- role: Brief file type/purpose
- fileExists: boolean
- description: 2-3 definitive sentences
- reasoning: Why this file is relevant
- integrationPoint: Specific modifications needed
- relevanceScore: 0-100
</required_fields>

<integration_point_format>
Must include specific, actionable details about how the file connects to the feature.
Include: modifications needed, affected components, and impact assessment.

GOOD examples:
- "Add isFavorited boolean field to schema. Requires database migration. Affects FavoriteButton component and getFavorites query."
- "Modify useFavorite() hook to add optimistic updates. Currently used by CollectionCard and BobbleheadCard components (2 files)."
- "Create new toggleFavorite server action using Next-Safe-Action pattern. Will be called from client components via form submission."

BAD examples:
- "May need updates"
- "Related to favorites"
- "Might be useful"
</integration_point_format>

<rules>
- ONLY include files scoring 30+
- ONLY search in your assigned paths: ${searchPathsStr}
- VERIFY every file with Glob (use Read only for critical/high priority files)
- Return ONLY the JSON code block, nothing else
</rules>

<final_reminder>
START YOUR RESPONSE WITH: \`\`\`json
END YOUR RESPONSE WITH: \`\`\`
NO OTHER TEXT ALLOWED.
</final_reminder>`;
  }

  /**
   * Build synthesis prompt for aggregating multiple refinements
   */
  private static buildSynthesisPrompt(
    originalRequest: string,
    refinements: Array<RefinementOutput>,
    settings: {
      includeProjectContext: boolean;
      maxOutputLength: number;
      minOutputLength: number;
    },
  ): string {
    const refinementsText = refinements
      .map(
        (r, i) => `
### Refinement ${i + 1}: ${r.focus}
**Confidence:** ${r.confidence} | **Complexity:** ${r.technicalComplexity} | **Scope:** ${r.estimatedScope}

**Refined Request:**
${r.refinedRequest}

**Key Requirements:**
${r.keyRequirements.map((req) => `- ${req}`).join('\n')}

**Assumptions:**
${r.assumptions.map((assumption) => `- ${assumption}`).join('\n')}

**Risks:**
${r.risks.map((risk) => `- ${risk}`).join('\n')}
`,
      )
      .join('\n---\n');

    return `You are a senior technical lead synthesizing multiple expert perspectives on a feature request.

ORIGINAL FEATURE REQUEST:
${originalRequest}

EXPERT REFINEMENTS:
${refinementsText}

YOUR TASK:
Synthesize these ${refinements.length} expert refinements into a single comprehensive refinement that:
1. Combines the best insights from all perspectives
2. Resolves any contradictions or conflicts
3. Creates a complete, actionable feature specification
4. Maintains the original scope (do not add features beyond the request)
5. Captures cross-functional considerations

SYNTHESIS GUIDELINES:
- Integrate technical, product, UX, security, and testing perspectives
- Balance different confidence levels and complexity assessments
- Merge key requirements without duplication
- Combine assumptions and identify the most critical ones
- Consolidate risks and prioritize them by severity
- Preserve the best technical context from each refinement

OUTPUT FORMAT:
Return ONLY a JSON object (no markdown code blocks, no extra text) with this structure:

{
  "refinedRequest": "Comprehensive synthesis (${settings.minOutputLength}-${settings.maxOutputLength} words)",
  "focus": "Multi-perspective comprehensive analysis",
  "confidence": "high|medium|low",
  "technicalComplexity": "high|medium|low",
  "keyRequirements": ["requirement 1", "requirement 2", "requirement 3"],
  "assumptions": ["assumption 1", "assumption 2"],
  "risks": ["risk 1", "risk 2"],
  "estimatedScope": "small|medium|large"
}

CRITICAL OUTPUT RULES:
- Return ONLY the JSON object
- Start with { and end with }
- No markdown code blocks (\`\`\`json)
- No explanatory text
- Ensure all strings are properly escaped
- Arrays must contain at least 1 item`;
  }

  /**
   * Execute a single specialized file discovery agent with retry logic
   *
   * @param refinedRequest - The refined feature request
   * @param agent - The specialized agent configuration
   * @param settings - Agent settings
   * @returns Files discovered by this agent
   */
  private static async executeSingleFileDiscoveryAgent(
    refinedRequest: string,
    agent: SpecializedAgent,
    settings: { customModel?: string },
  ): Promise<{
    agentId: string;
    discoveredFiles: Array<FileDiscoveryResult>;
    tokenUsage: { completionTokens: number; promptTokens: number; totalTokens: number };
  }> {
    const maxRetries = 1; // Allow one retry if format is invalid
    let lastResponse = '';

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        let discoveredFiles: Array<FileDiscoveryResult> = [];
        const tokenUsage = {
          completionTokens: 0,
          promptTokens: 0,
          totalTokens: 0,
        };

        // Build prompt based on attempt number
        const prompt =
          attempt === 0 ?
            this.buildSpecializedAgentPrompt(refinedRequest, agent)
          : `Your previous response did not return the expected file discovery results.

<feature_request>
${refinedRequest}
</feature_request>

<your_task>
You are the ${agent.name}. Find relevant files in: ${agent.searchPaths.join(', ')}
</your_task>

<previous_response_issue>
Your previous response:
${lastResponse.substring(0, 400)}

This is incorrect. You returned a conversational response instead of file discovery results.
</previous_response_issue>

<required_format>
Return ONLY a JSON code block containing an ARRAY of file objects (not an object with a "response" field).

CORRECT format:
\`\`\`json
[
  {
    "filePath": "src/lib/db/schema/example.schema.ts",
    "priority": "critical",
    "role": "Database schema definition",
    "fileExists": true,
    "description": "Defines example schema using Drizzle ORM.",
    "reasoning": "Core schema that must be modified",
    "integrationPoint": "Add new table or modify existing schema",
    "relevanceScore": 95
  }
]
\`\`\`

WRONG format (what you returned):
\`\`\`json
{
  "response": "I understand..."
}
\`\`\`
</required_format>

<instructions>
1. Use Glob/Grep to find relevant files in your assigned paths
2. Return an ARRAY of file objects (minimum 3 files)
3. Start with \`\`\`json and end with \`\`\`
4. NO other text before or after the JSON code block
</instructions>`;

        for await (const message of query({
          options: {
            ...BASE_SDK_OPTIONS,
            allowedTools: ['Read', 'Grep', 'Glob'],
            fallbackModel: FALLBACK_MODEL,
            maxThinkingTokens: THINKING_TOKEN_LIMITS.FILE_DISCOVERY,
            maxTurns: TURN_LIMITS.FILE_DISCOVERY_SPECIALIZED,
            model: settings.customModel || DEFAULT_FEATURE_PLANNER_MODEL,
            systemPrompt: {
              preset: 'claude_code',
              type: 'preset',
            },
          },
          prompt,
        })) {
          if (message.type === 'assistant') {
            // Trust SDK types - use type assertion for safety
            const assistantMessage = message.message as SDKAssistantMessage;
            const textContent = assistantMessage.content.find((c): c is SDKTextContent => c.type === 'text');

            if (textContent) {
              lastResponse = textContent.text;
              discoveredFiles = this.parseFileDiscoveryResponse(textContent.text);
            }

            if (assistantMessage.usage) {
              tokenUsage.promptTokens = assistantMessage.usage.input_tokens ?? 0;
              tokenUsage.completionTokens = assistantMessage.usage.output_tokens ?? 0;
              tokenUsage.totalTokens =
                (assistantMessage.usage.input_tokens ?? 0) + (assistantMessage.usage.output_tokens ?? 0);
            }
          }
        }

        // If we got valid results, return them
        if (discoveredFiles.length > 0) {
          console.log(`[${agent.agentId}] Found ${discoveredFiles.length} files (attempt ${attempt + 1})`);
          return {
            agentId: agent.agentId,
            discoveredFiles,
            tokenUsage,
          };
        }

        // If no files and we have retries left, try again
        if (attempt < maxRetries) {
          console.warn(
            `[${agent.agentId}] No files found on attempt ${attempt + 1}, retrying with format correction...`,
          );
          console.warn(`[${agent.agentId}] Response preview:`, lastResponse.substring(0, 300));
          continue;
        }

        // All attempts exhausted
        console.error(`[${agent.agentId}] No valid files found after ${maxRetries + 1} attempts`);
        if (lastResponse) {
          console.error(`[${agent.agentId}] Final response preview:`, lastResponse.substring(0, 500));
        }
      } catch (error) {
        if (attempt < maxRetries) {
          console.warn(`[${agent.agentId}] Error on attempt ${attempt + 1}, retrying:`, error);
          continue;
        }
        console.error(`Error in ${agent.name} after ${maxRetries + 1} attempts:`, error);
      }
    }

    // All attempts failed - return empty results instead of failing the entire operation
    return {
      agentId: agent.agentId,
      discoveredFiles: [],
      tokenUsage: { completionTokens: 0, promptTokens: 0, totalTokens: 0 },
    };
  }

  /**
   * Normalize complexity to valid enum value
   */
  private static normalizeComplexity(value?: string): 'high' | 'low' | 'medium' {
    const normalized = value?.toLowerCase();
    if (normalized === 'high' || normalized === 'medium' || normalized === 'low') {
      return normalized;
    }
    return 'medium';
  }

  /**
   * Normalize confidence level to valid enum value
   */
  private static normalizeConfidence(value?: string): 'high' | 'low' | 'medium' {
    const normalized = value?.toLowerCase();
    if (normalized === 'high' || normalized === 'medium' || normalized === 'low') {
      return normalized;
    }
    return 'medium';
  }

  /**
   * Normalize priority to valid enum value
   */
  private static normalizePriority(value?: string): 'critical' | 'high' | 'low' | 'medium' {
    const normalized = value?.toLowerCase();
    if (
      normalized === 'critical' ||
      normalized === 'high' ||
      normalized === 'medium' ||
      normalized === 'low'
    ) {
      return normalized;
    }
    return 'medium';
  }

  /**
   * Normalize risk level to valid enum value
   */
  private static normalizeRisk(value?: string): 'high' | 'low' | 'medium' {
    const normalized = value?.toLowerCase();
    if (normalized === 'high' || normalized === 'medium' || normalized === 'low') {
      return normalized;
    }
    return 'medium';
  }

  /**
   * Normalize relevance score to 0-100 range
   */
  private static normalizeScore(value?: number | string): number {
    const num = typeof value === 'string' ? parseInt(value, 10) : (value ?? 50);
    return Math.max(0, Math.min(100, num));
  }

  /**
   * Parse feature suggestion response from agent
   * Extracts structured suggestion data from agent response
   */
  private static parseFeatureSuggestionResponse(response: string): {
    context?: string;
    suggestions: Array<{
      description: string;
      implementationConsiderations?: Array<string>;
      rationale: string;
      title: string;
    }>;
  } {
    const result: {
      context?: string;
      suggestions: Array<{
        description: string;
        implementationConsiderations?: Array<string>;
        rationale: string;
        title: string;
      }>;
    } = {
      suggestions: [],
    };

    try {
      // Try parsing as JSON first
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch?.[1]) {
        try {
          const parsed: unknown = JSON.parse(jsonMatch[1]);
          if (typeof parsed === 'object' && parsed !== null && 'suggestions' in parsed) {
            const suggestions = (parsed as { suggestions: unknown }).suggestions;
            if (Array.isArray(suggestions)) {
              result.suggestions = suggestions.map((s: unknown) => ({
                description:
                  (
                    typeof s === 'object' &&
                    s !== null &&
                    'description' in s &&
                    typeof s.description === 'string'
                  ) ?
                    s.description
                  : '',
                implementationConsiderations:
                  (
                    typeof s === 'object' &&
                    s !== null &&
                    'implementationConsiderations' in s &&
                    Array.isArray(s.implementationConsiderations)
                  ) ?
                    s.implementationConsiderations.filter((c: unknown): c is string => typeof c === 'string')
                  : undefined,
                rationale:
                  typeof s === 'object' && s !== null && 'rationale' in s && typeof s.rationale === 'string' ?
                    s.rationale
                  : '',
                title:
                  typeof s === 'object' && s !== null && 'title' in s && typeof s.title === 'string' ?
                    s.title
                  : '',
              }));
            }
            if ('context' in parsed && typeof parsed.context === 'string') {
              result.context = parsed.context;
            }
            return result;
          }
        } catch (parseError) {
          console.error('[parseFeatureSuggestionResponse] JSON parse error:', parseError);
        }
      }

      // Parse markdown-style format
      const suggestionBlocks = response.split(/\n(?=#+\s+\w+|Suggestion\s+\d+)/i);

      for (const block of suggestionBlocks) {
        const titleMatch = block.match(/(?:^|\n)#+\s*([^\n]+)/);
        const descriptionMatch = block.match(/Description:\s*([^\n]+)/i);
        const rationaleMatch = block.match(/Rationale:\s*([^\n]+)/i);
        const considerationsMatch = block.match(
          /Implementation\s+Considerations?:\s*([\s\S]*?)(?=\n#|\n\n|$)/i,
        );

        if (titleMatch?.[1] && (descriptionMatch?.[1] || rationaleMatch?.[1])) {
          const considerations: Array<string> = [];
          if (considerationsMatch?.[1]) {
            const items = considerationsMatch[1].matchAll(/[-*]\s*([^\n]+)/g);
            for (const item of items) {
              if (item[1]) considerations.push(item[1].trim());
            }
          }

          result.suggestions.push({
            description: descriptionMatch?.[1]?.trim() || titleMatch[1].trim(),
            implementationConsiderations: considerations.length > 0 ? considerations : undefined,
            rationale: rationaleMatch?.[1]?.trim() || 'Feature suggestion from AI analysis',
            title: titleMatch[1].trim(),
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Error parsing feature suggestion response:', error);
      return result;
    }
  }

  /**
   * Parse file discovery response
   * Extracts structured file data from agent response with improved error handling
   */
  private static parseFileDiscoveryResponse(response: string): Array<FileDiscoveryResult> {
    const files: Array<FileDiscoveryResult> = [];

    try {
      // IMPROVEMENT 1: Strip any preamble text before JSON code block
      const jsonBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);

      if (jsonBlockMatch?.[1]) {
        const jsonContent = jsonBlockMatch[1].trim();

        try {
          const parsed: unknown = JSON.parse(jsonContent);
          const fileArraySchema = z.array(fileDiscoveryJsonItemSchema);
          const parseResult = fileArraySchema.safeParse(parsed);

          if (parseResult.success) {
            return parseResult.data.map((file) => ({
              description: file.description ?? '',
              fileExists: file.fileExists ?? true,
              filePath: file.filePath ?? file.path ?? '',
              integrationPoint: file.integrationPoint,
              isManuallyAdded: false,
              priority: this.normalizePriority(file.priority),
              reasoning: file.reasoning,
              relevanceScore: this.normalizeScore(file.relevanceScore ?? file.score),
              role: file.role,
            }));
          } else {
            // IMPROVEMENT 2: Log Zod validation errors for debugging
            console.error(`[parseFileDiscoveryResponse] Zod validation failed:`, parseResult.error.issues);
          }
        } catch (parseError) {
          // IMPROVEMENT 3: Better error logging
          console.error(`[parseFileDiscoveryResponse] JSON parse error:`, parseError);
          console.error(`[parseFileDiscoveryResponse] Problematic JSON:`, jsonContent.substring(0, 200));
        }
      } else {
        // IMPROVEMENT 4: Try to find JSON without code block markers
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            const parsed: unknown = JSON.parse(jsonMatch[0]);
            const fileArraySchema = z.array(fileDiscoveryJsonItemSchema);
            const parseResult = fileArraySchema.safeParse(parsed);
            if (parseResult.success) {
              return parseResult.data.map((file) => ({
                description: file.description ?? '',
                fileExists: file.fileExists ?? true,
                filePath: file.filePath ?? file.path ?? '',
                integrationPoint: file.integrationPoint,
                isManuallyAdded: false,
                priority: this.normalizePriority(file.priority),
                reasoning: file.reasoning,
                relevanceScore: this.normalizeScore(file.relevanceScore ?? file.score),
                role: file.role,
              }));
            }
          } catch {
            console.error('[parseFileDiscoveryResponse] Failed to parse JSON without code block');
          }
        }

        console.error('[parseFileDiscoveryResponse] No JSON code block found in response');
        console.error('[parseFileDiscoveryResponse] Response preview:', response.substring(0, 300));
      }

      // Parse markdown-style format
      const fileBlocks = response.split(/\n(?=\d+\.|\*|-)/);

      for (const block of fileBlocks) {
        const filePathMatch = block.match(/(?:path|file):\s*[`"]?([^`"\n]+)[`"]?/i);
        const priorityMatch = block.match(/priority:\s*(\w+)/i);
        const roleMatch = block.match(/role:\s*([^\n]+)/i);
        const integrationMatch = block.match(/integration(?:\s+point)?:\s*([^\n]+)/i);
        const reasoningMatch = block.match(/reasoning:\s*([^\n]+)/i);
        const scoreMatch = block.match(/(?:relevance\s*)?score:\s*(\d+)/i);
        const descriptionMatch = block.match(/description:\s*([^\n]+)/i);

        if (filePathMatch?.[1] && priorityMatch?.[1]) {
          files.push({
            description: descriptionMatch?.[1]?.trim() || 'File discovered during analysis',
            fileExists: true,
            filePath: filePathMatch[1].trim(),
            integrationPoint: integrationMatch?.[1]?.trim(),
            isManuallyAdded: false,
            priority: this.normalizePriority(priorityMatch[1]),
            reasoning: reasoningMatch?.[1]?.trim(),
            relevanceScore: this.normalizeScore(scoreMatch?.[1]),
            role: roleMatch?.[1]?.trim(),
          });
        }
      }

      // If no structured format found, try to extract file paths with basic metadata
      if (files.length === 0) {
        const pathMatches = response.matchAll(/(?:src|lib|app|components)\/[^\s,;]+/g);
        for (const match of pathMatches) {
          files.push({
            description: 'File discovered during analysis',
            fileExists: true,
            filePath: match[0],
            isManuallyAdded: false,
            priority: 'medium',
            relevanceScore: 50,
          });
        }
      }

      return files;
    } catch (error) {
      console.error('Error parsing file discovery response:', error);
      return [];
    }
  }

  /**
   * Parse implementation plan response
   * Extracts structured plan data from agent response
   */
  private static parseImplementationPlanResponse(response: string): ImplementationPlanResult {
    const result: ImplementationPlanResult = {
      complexity: 'medium',
      estimatedDuration: '1-2 hours',
      implementationPlan: response,
      riskLevel: 'medium',
      steps: [],
    };

    try {
      // Try parsing as JSON first
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch?.[1]) {
        const parsed: unknown = JSON.parse(jsonMatch[1]);
        const parseResult = implementationPlanJsonSchema.safeParse(parsed);

        if (parseResult.success) {
          const validatedData = parseResult.data;

          if (validatedData.steps) {
            result.steps = validatedData.steps.map((step, index) => ({
              category: step.category ?? 'implementation',
              commands: step.commands ?? [],
              confidenceLevel: this.normalizeConfidence(step.confidenceLevel),
              description: step.description ?? '',
              estimatedDuration: step.estimatedDuration ?? '10-15 minutes',
              stepNumber: step.stepNumber ?? index + 1,
              title: step.title ?? `Step ${index + 1}`,
              validationCommands: step.validationCommands ?? [],
            }));
          }

          if (validatedData.complexity) {
            result.complexity = this.normalizeComplexity(validatedData.complexity);
          }
          if (validatedData.riskLevel) {
            result.riskLevel = this.normalizeRisk(validatedData.riskLevel);
          }
          if (validatedData.estimatedDuration) {
            result.estimatedDuration = validatedData.estimatedDuration;
          }

          return result;
        }
      }

      // Extract metadata from markdown
      const durationMatch = response.match(/(?:estimated\s+)?duration:\s*([^\n]+)/i);
      const complexityMatch = response.match(/complexity:\s*(\w+)/i);
      const riskMatch = response.match(/risk(?:\s+level)?:\s*(\w+)/i);

      if (durationMatch?.[1]) result.estimatedDuration = durationMatch[1].trim();
      if (complexityMatch?.[1]) result.complexity = this.normalizeComplexity(complexityMatch[1]);
      if (riskMatch?.[1]) result.riskLevel = this.normalizeRisk(riskMatch[1]);

      // Extract steps from numbered list or headers
      const stepPatterns = [
        /(?:^|\n)(?:###?\s+)?(\d+)\.\s+([^\n]+)\n([\s\S]*?)(?=\n(?:###?\s+)?\d+\.|$)/g,
        /(?:^|\n)(?:###?\s+)?Step\s+(\d+):\s+([^\n]+)\n([\s\S]*?)(?=\n(?:###?\s+)?Step\s+\d+:|$)/gi,
      ];

      for (const pattern of stepPatterns) {
        const matches = [...response.matchAll(pattern)];
        if (matches.length > 0) {
          result.steps = matches.map((match) => {
            const stepNumber = parseInt(match[1] ?? '1', 10);
            const title = match[2]?.trim() ?? 'Untitled Step';
            const content = match[3] ?? '';

            // Extract commands from code blocks
            const commands: Array<string> = [];
            const validationCommands: Array<string> = [];
            const commandMatches = content.matchAll(/```(?:bash|sh)?\s*([\s\S]*?)```/g);

            for (const cmdMatch of commandMatches) {
              const cmd = cmdMatch[1]?.trim();
              if (cmd) {
                if (cmd.includes('lint') || cmd.includes('typecheck') || cmd.includes('test')) {
                  validationCommands.push(cmd);
                } else {
                  commands.push(cmd);
                }
              }
            }

            // Extract metadata
            const categoryMatch = content.match(/category:\s*([^\n]+)/i);
            const durationMatch = content.match(/(?:estimated\s+)?duration:\s*([^\n]+)/i);
            const confidenceMatch = content.match(/confidence(?:\s+level)?:\s*(\w+)/i);

            // Clean description (remove metadata lines)
            let description = content
              .replace(/```[\s\S]*?```/g, '')
              .replace(/category:\s*[^\n]+/gi, '')
              .replace(/(?:estimated\s+)?duration:\s*[^\n]+/gi, '')
              .replace(/confidence(?:\s+level)?:\s*\w+/gi, '')
              .trim();

            if (!description) {
              description = title;
            }

            return {
              category: categoryMatch?.[1]?.trim() || 'implementation',
              commands,
              confidenceLevel: this.normalizeConfidence(confidenceMatch?.[1]),
              description,
              estimatedDuration: durationMatch?.[1]?.trim() || '10-15 minutes',
              stepNumber,
              title,
              validationCommands,
            };
          });
          break;
        }
      }

      return result;
    } catch (error) {
      console.error('Error parsing implementation plan response:', error);
      return result;
    }
  }
}
