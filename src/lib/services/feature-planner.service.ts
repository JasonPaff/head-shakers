/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
import { query } from '@anthropic-ai/claude-agent-sdk';

import type {
  FileDiscoveryResult,
  RefinementSettings,
} from '@/lib/db/schema/feature-planner.schema';
import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { circuitBreakers } from '@/lib/utils/circuit-breaker-registry';
import { createServiceError } from '@/lib/utils/error-builders';
import { withServiceRetry } from '@/lib/utils/retry';

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
  steps: PlanStep[];
}

/**
 * Plan step structure
 */
export interface PlanStep {
  category: string;
  commands: string[];
  confidenceLevel: 'high' | 'low' | 'medium';
  description: string;
  estimatedDuration: string;
  stepNumber: number;
  title: string;
  validationCommands: string[];
}

/**
 * Feature Planner Service
 * Handles all Claude Agent SDK operations for feature planning
 */
export class FeaturePlannerService {
  /**
   * Execute file discovery agent
   *
   * @param refinedRequest - The refined feature request
   * @param settings - Agent settings
   * @returns Discovered files with metadata
   */
  static async executeFileDiscoveryAgent(
    refinedRequest: string,
    settings: { customModel?: string },
  ): Promise<AgentExecutionResult<FileDiscoveryResult[]>> {
    const circuitBreaker = circuitBreakers.externalService('claude-agent-file-discovery');
    const startTime = Date.now();

    try {
      const result = await circuitBreaker.execute(async () => {
        const retryResult = await withServiceRetry(
          async () => {
            let discoveredFiles: FileDiscoveryResult[] = [];
            const tokenUsage = {
              completionTokens: 0,
              promptTokens: 0,
              totalTokens: 0,
            };

            const prompt = this.buildFileDiscoveryPrompt(refinedRequest);

            for await (const message of query({
              options: {
                allowedTools: ['Read', 'Grep', 'Glob'],
                maxTurns: 1,
                model: settings.customModel || 'claude-sonnet-4-5-20250929',
                settingSources: ['project'],
              },
              prompt,
            })) {
              if (message.type === 'assistant') {
                const content = message.message.content[0];
                if (content?.type === 'text') {
                  discoveredFiles = this.parseFileDiscoveryResponse(content.text);
                }

                if (message.message.usage) {
                  tokenUsage.promptTokens = message.message.usage.input_tokens || 0;
                  tokenUsage.completionTokens = message.message.usage.output_tokens || 0;
                  tokenUsage.totalTokens =
                    (message.message.usage.input_tokens || 0) + (message.message.usage.output_tokens || 0);
                }
              }
            }

            return { discoveredFiles, tokenUsage };
          },
          'claude-agent',
          {
            maxAttempts: 2,
            operationName: 'file-discovery',
          },
        );

        return retryResult;
      });

      const executionTimeMs = Date.now() - startTime;

      return {
        executionTimeMs,
        result: result.result.result.discoveredFiles,
        retryCount: result.result.attempts - 1,
        tokenUsage: result.result.result.tokenUsage,
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
    discoveredFiles: FileDiscoveryResult[],
    settings: { customModel?: string },
  ): Promise<AgentExecutionResult<ImplementationPlanResult>> {
    const circuitBreaker = circuitBreakers.externalService('claude-agent-implementation-planning');
    const startTime = Date.now();

    try {
      const result = await circuitBreaker.execute(async () => {
        const retryResult = await withServiceRetry(
          async () => {
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
                allowedTools: ['Read', 'Grep', 'Glob'],
                maxTurns: 1,
                model: settings.customModel || 'claude-sonnet-4-5-20250929',
                settingSources: ['project'],
              },
              prompt,
            })) {
              if (message.type === 'assistant') {
                const content = message.message.content[0];
                if (content?.type === 'text') {
                  planResult = this.parseImplementationPlanResponse(content.text);
                }

                if (message.message.usage) {
                  tokenUsage.promptTokens = message.message.usage.input_tokens || 0;
                  tokenUsage.completionTokens = message.message.usage.output_tokens || 0;
                  tokenUsage.totalTokens =
                    (message.message.usage.input_tokens || 0) + (message.message.usage.output_tokens || 0);
                }
              }
            }

            return { planResult, tokenUsage };
          },
          'claude-agent',
          {
            maxAttempts: 2,
            operationName: 'implementation-planning',
          },
        );

        return retryResult;
      });

      const executionTimeMs = Date.now() - startTime;

      return {
        executionTimeMs,
        result: result.result.result.planResult,
        retryCount: result.result.attempts - 1,
        tokenUsage: result.result.result.tokenUsage,
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
   * Execute feature refinement agent
   *
   * @param originalRequest - User's original feature request
   * @param settings - Refinement settings (length, context, etc.)
   * @returns Refined feature request with metadata
   */
  static async executeRefinementAgent(
    originalRequest: string,
    settings: Pick<
      RefinementSettings,
      'customModel' | 'includeProjectContext' | 'maxOutputLength' | 'minOutputLength'
    >,
  ): Promise<AgentExecutionResult<string>> {
    const circuitBreaker = circuitBreakers.externalService('claude-agent-refinement');
    const startTime = Date.now();

    try {
      const result = await circuitBreaker.execute(async () => {
        const retryResult = await withServiceRetry(
          async () => {
            let refinedText = '';
            const tokenUsage = {
              cacheCreationTokens: 0,
              cacheReadTokens: 0,
              completionTokens: 0,
              promptTokens: 0,
              totalTokens: 0,
            };

            // Build agent prompt
            const prompt = this.buildRefinementPrompt(originalRequest, settings);

            // Execute agent with SDK
            for await (const message of query({
              options: {
                allowedTools: settings.includeProjectContext ? ['Read', 'Grep', 'Glob'] : [],
                maxTurns: 1,
                model: settings.customModel || 'claude-sonnet-4-5-20250929',
                settingSources: ['project'], // Load .claude/agents/
              },
              prompt,
            })) {
              // Extract assistant response
              if (message.type === 'assistant') {
                const content = message.message.content[0];
                if (content?.type === 'text') {
                  refinedText = content.text;
                }

                // Track token usage
                if (message.message.usage) {
                  tokenUsage.promptTokens = message.message.usage.input_tokens || 0;
                  tokenUsage.completionTokens = message.message.usage.output_tokens || 0;
                  tokenUsage.totalTokens =
                    (message.message.usage.input_tokens || 0) + (message.message.usage.output_tokens || 0);
                  tokenUsage.cacheReadTokens = message.message.usage.cache_read_input_tokens;
                  tokenUsage.cacheCreationTokens = message.message.usage.cache_creation_input_tokens;
                }
              }
            }

            return { refinedText, tokenUsage };
          },
          'claude-agent',
          {
            maxAttempts: 2,
            operationName: 'feature-refinement',
          },
        );

        return retryResult;
      });

      const executionTimeMs = Date.now() - startTime;

      return {
        executionTimeMs,
        result: result.result.result.refinedText,
        retryCount: result.result.attempts - 1,
        tokenUsage: result.result.result.tokenUsage,
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
   * Build file discovery prompt
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
    discoveredFiles: FileDiscoveryResult[],
  ): string {
    const filesList = discoveredFiles.map((f) => `- ${f.filePath} (${f.priority}): ${f.description}`).join('\n');

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
   * Parse file discovery response
   * TODO: Implement robust parsing logic
   */
  private static parseFileDiscoveryResponse(response: string): FileDiscoveryResult[] {
    // Placeholder implementation - will be enhanced in future iterations
    console.log('File discovery response:', response);
    return [];
  }

  /**
   * Parse implementation plan response
   * TODO: Implement robust parsing logic
   */
  private static parseImplementationPlanResponse(response: string): ImplementationPlanResult {
    // Placeholder implementation - will be enhanced in future iterations
    console.log('Implementation plan response:', response);
    return {
      complexity: 'medium',
      estimatedDuration: '',
      implementationPlan: response,
      riskLevel: 'medium',
      steps: [],
    };
  }
}
