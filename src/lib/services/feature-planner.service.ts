import { query } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

import type { FileDiscoveryResult, RefinementSettings } from '@/lib/db/schema/feature-planner.schema';
import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { circuitBreakers } from '@/lib/utils/circuit-breaker-registry';
import { createServiceError } from '@/lib/utils/error-builders';
import { withServiceRetry } from '@/lib/utils/retry';

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
 * Zod schema for Claude SDK message content
 */
const sdkMessageContentSchema = z.object({
  text: z.string(),
  type: z.literal('text'),
});

/**
 * Zod schema for Claude SDK usage stats
 */
const sdkUsageSchema = z.object({
  cache_creation_input_tokens: z.number().optional(),
  cache_read_input_tokens: z.number().optional(),
  input_tokens: z.number().optional(),
  output_tokens: z.number().optional(),
});

/**
 * Zod schema for Claude SDK assistant message
 */
const sdkAssistantMessageSchema = z.object({
  content: z.array(sdkMessageContentSchema),
  usage: sdkUsageSchema.optional(),
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
                const parseResult = sdkAssistantMessageSchema.safeParse(message.message);
                if (parseResult.success) {
                  const validatedMessage = parseResult.data;
                  const content = validatedMessage.content[0];
                  if (content?.type === 'text') {
                    discoveredFiles = this.parseFileDiscoveryResponse(content.text);
                  }

                  if (validatedMessage.usage) {
                    tokenUsage.promptTokens = validatedMessage.usage.input_tokens ?? 0;
                    tokenUsage.completionTokens = validatedMessage.usage.output_tokens ?? 0;
                    tokenUsage.totalTokens =
                      (validatedMessage.usage.input_tokens ?? 0) +
                      (validatedMessage.usage.output_tokens ?? 0);
                  }
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
                const parseResult = sdkAssistantMessageSchema.safeParse(message.message);
                if (parseResult.success) {
                  const validatedMessage = parseResult.data;
                  const content = validatedMessage.content[0];
                  if (content?.type === 'text') {
                    planResult = this.parseImplementationPlanResponse(content.text);
                  }

                  if (validatedMessage.usage) {
                    tokenUsage.promptTokens = validatedMessage.usage.input_tokens ?? 0;
                    tokenUsage.completionTokens = validatedMessage.usage.output_tokens ?? 0;
                    tokenUsage.totalTokens =
                      (validatedMessage.usage.input_tokens ?? 0) +
                      (validatedMessage.usage.output_tokens ?? 0);
                  }
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
                const parseResult = sdkAssistantMessageSchema.safeParse(message.message);
                if (parseResult.success) {
                  const validatedMessage = parseResult.data;
                  const content = validatedMessage.content[0];
                  if (content?.type === 'text') {
                    refinedText = content.text;
                  }

                  // Track token usage
                  if (validatedMessage.usage) {
                    tokenUsage.promptTokens = validatedMessage.usage.input_tokens ?? 0;
                    tokenUsage.completionTokens = validatedMessage.usage.output_tokens ?? 0;
                    tokenUsage.totalTokens =
                      (validatedMessage.usage.input_tokens ?? 0) +
                      (validatedMessage.usage.output_tokens ?? 0);
                    tokenUsage.cacheReadTokens = validatedMessage.usage.cache_read_input_tokens ?? 0;
                    tokenUsage.cacheCreationTokens =
                      validatedMessage.usage.cache_creation_input_tokens ?? 0;
                  }
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
   * Parse file discovery response
   * Extracts structured file data from agent response
   */
  private static parseFileDiscoveryResponse(response: string): FileDiscoveryResult[] {
    const files: FileDiscoveryResult[] = [];

    try {
      // Try parsing as JSON first (if agent returns structured JSON)
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch?.[1]) {
        const parsed: unknown = JSON.parse(jsonMatch[1]);
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
            const commands: string[] = [];
            const validationCommands: string[] = [];
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
