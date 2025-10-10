# Feature Planner Service Layer Implementation Guide

**Date:** 2025-10-09
**Purpose:** Detailed implementation guide for Feature Planner service layer following existing project patterns
**Status:** ✅ Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Project Pattern Analysis](#project-pattern-analysis)
3. [Required Components](#required-components)
4. [Implementation Instructions](#implementation-instructions)
5. [Code Examples](#code-examples)
6. [Testing Requirements](#testing-requirements)

---

## Overview

This document provides **exact implementation instructions** for building the Feature Planner service layer. It is based on a comprehensive analysis of existing project patterns and **must be followed precisely** to ensure consistency with the codebase.

### Architecture Layers

```
Actions (Server Actions)
    ↓ calls
Facades (Business Logic Orchestration)
    ↓ calls
Queries (Database Operations)
    ↓ uses
Services (External Services & Utilities)
```

---

## Project Pattern Analysis

### 1. Service Layer Pattern

**Purpose:** Handle external service integrations (Cloudinary, Claude Agent SDK, etc.)

**Key Characteristics:**
- ✅ Static class methods (no instantiation)
- ✅ Circuit breaker protection via `circuitBreakers.externalService()` or `circuitBreakers.upload()`
- ✅ Retry logic via `withServiceRetry()` from `@/lib/utils/retry`
- ✅ Custom error classes extending `ActionError`
- ✅ ServiceErrorContext for detailed error tracking
- ✅ Error creation via `createServiceError()`

**Example Structure:**
```typescript
export class CloudinaryService {
  static async deletePhotosByUrls(urls: string[]): Promise<Result> {
    const circuitBreaker = circuitBreakers.externalService('cloudinary-delete');

    try {
      const result = await circuitBreaker.execute(async () => {
        const retryResult = await withServiceRetry(
          () => cloudinary.api.delete_resources(publicIds),
          'cloudinary',
          {
            maxAttempts: 3,
            operationName: 'cloudinary-batch-delete',
          },
        );
        return retryResult.result;
      });

      return transformResult(result);
    } catch (error) {
      console.error('Operation failed:', error);
      return handleError(error);
    }
  }
}
```

### 2. Query Layer Pattern

**Purpose:** Handle all database operations with permission filtering

**Key Characteristics:**
- ✅ Extends `BaseQuery` abstract class
- ✅ Static class methods with `Async` suffix
- ✅ All methods accept `QueryContext` parameter
- ✅ Uses `getDbInstance(context)` for transaction support
- ✅ Uses `buildBaseFilters()` for permission checks
- ✅ Uses `executeWithRetry()` for database operations
- ✅ Type-safe results using `table.$inferSelect`
- ✅ Returns `null` for not found, `[]` for empty lists

**Example Structure:**
```typescript
export class BobbleheadsQuery extends BaseQuery {
  static async findByIdAsync(
    id: string,
    context: QueryContext
  ): Promise<BobbleheadRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(bobbleheads)
      .where(
        this.combineFilters(
          eq(bobbleheads.id, id),
          this.buildBaseFilters(
            bobbleheads.isPublic,
            bobbleheads.userId,
            bobbleheads.isDeleted,
            context
          ),
        ),
      )
      .limit(1);

    return result[0] || null;
  }
}
```

### 3. Facade Layer Pattern

**Purpose:** Orchestrate business logic, combine queries/services, manage caching

**Key Characteristics:**
- ✅ Static class methods
- ✅ Uses domain language (e.g., `getBobbleheadById` not `findById`)
- ✅ Integrates `CacheService` for read operations
- ✅ Calls other facades for related operations
- ✅ Creates appropriate `QueryContext` instances
- ✅ Optional `DatabaseExecutor` parameter for transactions
- ✅ Comprehensive try-catch with `FacadeErrorContext`
- ✅ Error creation via `createFacadeError()`

**Example Structure:**
```typescript
const facadeName = 'BobbleheadsFacade';

export class BobbleheadsFacade {
  static async getBobbleheadById(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    return CacheService.bobbleheads.byId(
      () => {
        const context = viewerUserId
          ? createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });
        return BobbleheadsQuery.findByIdAsync(id, context);
      },
      id,
      {
        context: {
          entityId: id,
          entityType: 'bobblehead',
          facade: facadeName,
          operation: 'getById',
          userId: viewerUserId,
        },
      },
    );
  }

  static async deleteAsync(
    data: DeleteBobblehead,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      const deleteResult = await BobbleheadsQuery.deleteAsync(data, userId, context);

      const { bobblehead, photos } = deleteResult;
      if (!bobblehead) return null;

      // Cleanup external resources (non-blocking)
      if (photos?.length > 0) {
        try {
          await CloudinaryService.deletePhotosByUrls(photos.map(p => p.url));
        } catch (error) {
          console.error('Cloudinary cleanup failed:', error);
        }
      }

      // Clean up related data
      await TagsFacade.removeAllFromBobblehead(bobblehead.id, userId);

      return bobblehead;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId: data.bobbleheadId },
        facade: facadeName,
        method: 'deleteAsync',
        operation: OPERATIONS.BOBBLEHEADS.DELETE,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }
}
```

---

## Required Components

### Component 1: Feature Planner Service

**File:** `src/lib/services/feature-planner.service.ts`

**Purpose:** Handle Claude Agent SDK operations

**Responsibilities:**
- Execute Claude Agent SDK queries
- Manage agent invocation
- Handle streaming responses
- Apply circuit breaker and retry logic
- Track token usage

### Component 2: Feature Planner Queries

**File:** `src/lib/queries/feature-planner/feature-planner.query.ts`

**Purpose:** Handle all database operations for feature planning

**Responsibilities:**
- CRUD operations for all feature planner tables
- Permission filtering
- Transaction support
- Batch operations for parallel executions

### Component 3: Feature Planner Facade

**File:** `src/lib/facades/feature-planner/feature-planner.facade.ts`

**Purpose:** Orchestrate feature planning workflow

**Responsibilities:**
- Coordinate service and query layer
- Manage caching strategies
- Handle business logic
- Provide clean API for actions layer

---

## Implementation Instructions

### Step 1: Create Feature Planner Service

**File:** `src/lib/services/feature-planner.service.ts`

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';
import type { ServiceErrorContext } from '@/lib/utils/error-types';
import { circuitBreakers } from '@/lib/utils/circuit-breaker-registry';
import { createServiceError } from '@/lib/utils/error-builders';
import { withServiceRetry } from '@/lib/utils/retry';

/**
 * Custom error class for Claude Agent SDK operations
 */
class ClaudeAgentError extends ActionError {
  constructor(message: string, originalError?: Error) {
    super(
      ErrorType.EXTERNAL_SERVICE,
      'CLAUDE_AGENT_ERROR',
      message,
      { originalError: originalError?.message },
      true, // isRetryable
      500,
      originalError,
    );
  }
}

/**
 * Agent execution result with metadata
 */
export interface AgentExecutionResult<T> {
  result: T;
  executionTimeMs: number;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cacheReadTokens?: number;
    cacheCreationTokens?: number;
  };
  retryCount: number;
}

/**
 * Feature Planner Service
 * Handles all Claude Agent SDK operations for feature planning
 */
export class FeaturePlannerService {
  /**
   * Execute feature refinement agent
   *
   * @param originalRequest - User's original feature request
   * @param settings - Refinement settings (length, context, etc.)
   * @returns Refined feature request with metadata
   */
  static async executeRefinementAgent(
    originalRequest: string,
    settings: {
      minOutputLength: number;
      maxOutputLength: number;
      includeProjectContext: boolean;
      customModel?: string;
    },
  ): Promise<AgentExecutionResult<string>> {
    const circuitBreaker = circuitBreakers.externalService('claude-agent-refinement');
    const startTime = Date.now();

    try {
      const result = await circuitBreaker.execute(async () => {
        const retryResult = await withServiceRetry(
          async () => {
            let refinedText = '';
            let tokenUsage = {
              promptTokens: 0,
              completionTokens: 0,
              totalTokens: 0,
              cacheReadTokens: 0,
              cacheCreationTokens: 0,
            };

            // Build agent prompt
            const prompt = this.buildRefinementPrompt(originalRequest, settings);

            // Execute agent with SDK
            for await (const message of query({
              prompt,
              options: {
                maxTurns: 1,
                settingSources: ['project'], // Load .claude/agents/
                allowedTools: settings.includeProjectContext ? ['Read', 'Grep', 'Glob'] : [],
                model: settings.customModel || 'claude-sonnet-4-5-20250929',
              },
            })) {
              // Extract assistant response
              if (message.type === 'assistant') {
                const content = message.message.content[0];
                if (content?.type === 'text') {
                  refinedText = content.text;
                }

                // Track token usage
                if (message.message.usage) {
                  tokenUsage = {
                    promptTokens: message.message.usage.input_tokens || 0,
                    completionTokens: message.message.usage.output_tokens || 0,
                    totalTokens: (message.message.usage.input_tokens || 0) +
                                (message.message.usage.output_tokens || 0),
                    cacheReadTokens: message.message.usage.cache_read_input_tokens,
                    cacheCreationTokens: message.message.usage.cache_creation_input_tokens,
                  };
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
        result: result.result.refinedText,
        executionTimeMs,
        tokenUsage: result.result.tokenUsage,
        retryCount: result.attempts - 1,
      };
    } catch (error) {
      const context: ServiceErrorContext = {
        service: 'claude-agent-sdk',
        method: 'executeRefinementAgent',
        operation: 'feature-refinement',
        endpoint: 'query',
        isRetryable: true,
      };
      throw createServiceError(context, error);
    }
  }

  /**
   * Execute file discovery agent
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
            let tokenUsage = {
              promptTokens: 0,
              completionTokens: 0,
              totalTokens: 0,
            };

            const prompt = this.buildFileDiscoveryPrompt(refinedRequest);

            for await (const message of query({
              prompt,
              options: {
                maxTurns: 1,
                settingSources: ['project'],
                allowedTools: ['Read', 'Grep', 'Glob'],
                model: settings.customModel || 'claude-sonnet-4-5-20250929',
              },
            })) {
              if (message.type === 'assistant') {
                const content = message.message.content[0];
                if (content?.type === 'text') {
                  discoveredFiles = this.parseFileDiscoveryResponse(content.text);
                }

                if (message.message.usage) {
                  tokenUsage = {
                    promptTokens: message.message.usage.input_tokens || 0,
                    completionTokens: message.message.usage.output_tokens || 0,
                    totalTokens: (message.message.usage.input_tokens || 0) +
                                (message.message.usage.output_tokens || 0),
                  };
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
        result: result.result.discoveredFiles,
        executionTimeMs,
        tokenUsage: result.result.tokenUsage,
        retryCount: result.attempts - 1,
      };
    } catch (error) {
      const context: ServiceErrorContext = {
        service: 'claude-agent-sdk',
        method: 'executeFileDiscoveryAgent',
        operation: 'file-discovery',
        endpoint: 'query',
        isRetryable: true,
      };
      throw createServiceError(context, error);
    }
  }

  /**
   * Execute implementation planning agent
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
              implementationPlan: '',
              steps: [],
              estimatedDuration: '',
              complexity: 'medium',
              riskLevel: 'medium',
            };
            let tokenUsage = {
              promptTokens: 0,
              completionTokens: 0,
              totalTokens: 0,
            };

            const prompt = this.buildImplementationPlanPrompt(refinedRequest, discoveredFiles);

            for await (const message of query({
              prompt,
              options: {
                maxTurns: 1,
                settingSources: ['project'],
                allowedTools: ['Read', 'Grep', 'Glob'],
                model: settings.customModel || 'claude-sonnet-4-5-20250929',
              },
            })) {
              if (message.type === 'assistant') {
                const content = message.message.content[0];
                if (content?.type === 'text') {
                  planResult = this.parseImplementationPlanResponse(content.text);
                }

                if (message.message.usage) {
                  tokenUsage = {
                    promptTokens: message.message.usage.input_tokens || 0,
                    completionTokens: message.message.usage.output_tokens || 0,
                    totalTokens: (message.message.usage.input_tokens || 0) +
                                (message.message.usage.output_tokens || 0),
                  };
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
        result: result.result.planResult,
        executionTimeMs,
        tokenUsage: result.result.tokenUsage,
        retryCount: result.attempts - 1,
      };
    } catch (error) {
      const context: ServiceErrorContext = {
        service: 'claude-agent-sdk',
        method: 'executeImplementationPlanningAgent',
        operation: 'implementation-planning',
        endpoint: 'query',
        isRetryable: true,
      };
      throw createServiceError(context, error);
    }
  }

  /**
   * Build refinement prompt with settings
   */
  private static buildRefinementPrompt(
    originalRequest: string,
    settings: {
      minOutputLength: number;
      maxOutputLength: number;
      includeProjectContext: boolean;
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
      .map(f => `- ${f.filePath} (${f.priority}): ${f.description}`)
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
   * Parse file discovery response
   */
  private static parseFileDiscoveryResponse(response: string): FileDiscoveryResult[] {
    // TODO: Implement robust parsing logic
    // This is a placeholder - actual implementation should parse the agent's response
    // and extract structured file information
    return [];
  }

  /**
   * Parse implementation plan response
   */
  private static parseImplementationPlanResponse(response: string): ImplementationPlanResult {
    // TODO: Implement robust parsing logic
    // This is a placeholder - actual implementation should parse the agent's response
    // and extract structured plan information
    return {
      implementationPlan: response,
      steps: [],
      estimatedDuration: '',
      complexity: 'medium',
      riskLevel: 'medium',
    };
  }
}

// Type definitions
interface FileDiscoveryResult {
  filePath: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  role: string;
  integrationPoint: string;
  reasoning: string;
  relevanceScore: number;
  description: string;
}

interface ImplementationPlanResult {
  implementationPlan: string;
  steps: PlanStep[];
  estimatedDuration: string;
  complexity: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
}

interface PlanStep {
  stepNumber: number;
  title: string;
  description: string;
  category: string;
  commands: string[];
  validationCommands: string[];
  estimatedDuration: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}
```

### Step 2: Add Operations Constants

**File:** `src/lib/constants/operations.ts`

Add to the existing OPERATIONS object:

```typescript
export const OPERATIONS = {
  // ... existing operations ...

  FEATURE_PLANNER: {
    // Plan management
    CREATE_PLAN: 'create_feature_plan',
    GET_PLAN: 'get_feature_plan',
    UPDATE_PLAN: 'update_feature_plan',
    DELETE_PLAN: 'delete_feature_plan',
    LIST_PLANS: 'list_feature_plans',

    // Step 1: Refinement
    RUN_REFINEMENT: 'run_feature_refinement',
    GET_REFINEMENTS: 'get_feature_refinements',
    SELECT_REFINEMENT: 'select_feature_refinement',

    // Step 2: File Discovery
    RUN_FILE_DISCOVERY: 'run_file_discovery',
    GET_DISCOVERED_FILES: 'get_discovered_files',
    ADD_MANUAL_FILE: 'add_manual_file',
    SELECT_FILES: 'select_discovered_files',

    // Step 3: Implementation Planning
    RUN_PLAN_GENERATION: 'run_plan_generation',
    GET_PLAN_GENERATIONS: 'get_plan_generations',
    SELECT_PLAN_GENERATION: 'select_plan_generation',

    // Plan steps
    CREATE_PLAN_STEP: 'create_plan_step',
    UPDATE_PLAN_STEP: 'update_plan_step',
    DELETE_PLAN_STEP: 'delete_plan_step',
    REORDER_PLAN_STEPS: 'reorder_plan_steps',

    // Templates
    CREATE_STEP_TEMPLATE: 'create_step_template',
    GET_STEP_TEMPLATES: 'get_step_templates',
    USE_STEP_TEMPLATE: 'use_step_template',

    // Execution logs
    GET_EXECUTION_LOGS: 'get_execution_logs',
  },
} as const;
```

### Step 3: Create Feature Planner Queries

**File:** `src/lib/queries/feature-planner/feature-planner.query.ts`

```typescript
import { and, desc, eq } from 'drizzle-orm';
import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type {
  NewFeaturePlan,
  NewFeatureRefinement,
  NewFileDiscoverySession,
  NewImplementationPlanGeneration,
  NewPlanExecutionLog,
  NewPlanStep,
  FeaturePlan,
  FeatureRefinement,
  FileDiscoverySession,
  ImplementationPlanGeneration,
  PlanStep,
} from '@/lib/db/schema/feature-planner.schema';
import {
  featurePlans,
  featureRefinements,
  fileDiscoverySessions,
  discoveredFiles,
  implementationPlanGenerations,
  planSteps,
  planExecutionLogs,
} from '@/lib/db/schema/feature-planner.schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

/**
 * Feature Planner Query Service
 * Handles all database operations for feature planning workflow
 */
export class FeaturePlannerQuery extends BaseQuery {
  // ============================================================================
  // FEATURE PLANS
  // ============================================================================

  /**
   * Create a new feature plan
   */
  static async createPlanAsync(
    data: NewFeaturePlan,
    context: QueryContext,
  ): Promise<FeaturePlan | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .insert(featurePlans)
      .values(data)
      .returning();

    return result[0] || null;
  }

  /**
   * Find feature plan by ID
   */
  static async findPlanByIdAsync(
    planId: string,
    context: QueryContext,
  ): Promise<FeaturePlan | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(featurePlans)
      .where(
        this.combineFilters(
          eq(featurePlans.id, planId),
          context.userId ? eq(featurePlans.userId, context.userId) : undefined,
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find feature plans by user
   */
  static async findPlansByUserAsync(
    userId: string,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<FeaturePlan[]> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    const query = dbInstance
      .select()
      .from(featurePlans)
      .where(eq(featurePlans.userId, userId))
      .orderBy(desc(featurePlans.createdAt));

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * Update feature plan
   */
  static async updatePlanAsync(
    planId: string,
    data: Partial<NewFeaturePlan>,
    userId: string,
    context: QueryContext,
  ): Promise<FeaturePlan | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(featurePlans)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(featurePlans.id, planId),
          eq(featurePlans.userId, userId),
        ),
      )
      .returning();

    return result[0] || null;
  }

  // ============================================================================
  // FEATURE REFINEMENTS
  // ============================================================================

  /**
   * Create a refinement attempt
   */
  static async createRefinementAsync(
    data: NewFeatureRefinement,
    context: QueryContext,
  ): Promise<FeatureRefinement | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .insert(featureRefinements)
      .values(data)
      .returning();

    return result[0] || null;
  }

  /**
   * Get refinements for a plan
   */
  static async getRefinementsByPlanAsync(
    planId: string,
    context: QueryContext,
  ): Promise<FeatureRefinement[]> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(featureRefinements)
      .where(eq(featureRefinements.planId, planId))
      .orderBy(desc(featureRefinements.createdAt));
  }

  /**
   * Update refinement
   */
  static async updateRefinementAsync(
    refinementId: string,
    data: Partial<NewFeatureRefinement>,
    context: QueryContext,
  ): Promise<FeatureRefinement | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(featureRefinements)
      .set(data)
      .where(eq(featureRefinements.id, refinementId))
      .returning();

    return result[0] || null;
  }

  // ============================================================================
  // FILE DISCOVERY SESSIONS
  // ============================================================================

  /**
   * Create file discovery session
   */
  static async createFileDiscoverySessionAsync(
    data: NewFileDiscoverySession,
    context: QueryContext,
  ): Promise<FileDiscoverySession | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .insert(fileDiscoverySessions)
      .values(data)
      .returning();

    return result[0] || null;
  }

  /**
   * Get file discovery sessions for a plan
   */
  static async getFileDiscoverySessionsByPlanAsync(
    planId: string,
    context: QueryContext,
  ): Promise<FileDiscoverySession[]> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(fileDiscoverySessions)
      .where(eq(fileDiscoverySessions.planId, planId))
      .orderBy(desc(fileDiscoverySessions.createdAt));
  }

  // ============================================================================
  // IMPLEMENTATION PLAN GENERATIONS
  // ============================================================================

  /**
   * Create implementation plan generation
   */
  static async createPlanGenerationAsync(
    data: NewImplementationPlanGeneration,
    context: QueryContext,
  ): Promise<ImplementationPlanGeneration | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .insert(implementationPlanGenerations)
      .values(data)
      .returning();

    return result[0] || null;
  }

  /**
   * Get plan generations for a plan
   */
  static async getPlanGenerationsByPlanAsync(
    planId: string,
    context: QueryContext,
  ): Promise<ImplementationPlanGeneration[]> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(implementationPlanGenerations)
      .where(eq(implementationPlanGenerations.planId, planId))
      .orderBy(desc(implementationPlanGenerations.createdAt));
  }

  // ============================================================================
  // PLAN STEPS
  // ============================================================================

  /**
   * Create plan step
   */
  static async createPlanStepAsync(
    data: NewPlanStep,
    context: QueryContext,
  ): Promise<PlanStep | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .insert(planSteps)
      .values(data)
      .returning();

    return result[0] || null;
  }

  /**
   * Get plan steps for a generation
   */
  static async getPlanStepsByGenerationAsync(
    generationId: string,
    context: QueryContext,
  ): Promise<PlanStep[]> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(planSteps)
      .where(eq(planSteps.planGenerationId, generationId))
      .orderBy(planSteps.displayOrder);
  }

  /**
   * Update plan step
   */
  static async updatePlanStepAsync(
    stepId: string,
    data: Partial<NewPlanStep>,
    context: QueryContext,
  ): Promise<PlanStep | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(planSteps)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(planSteps.id, stepId))
      .returning();

    return result[0] || null;
  }

  /**
   * Batch update plan steps (for reordering)
   */
  static async batchUpdatePlanStepsAsync(
    updates: Array<{ stepId: string; displayOrder: number }>,
    context: QueryContext,
  ): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    await Promise.all(
      updates.map(({ stepId, displayOrder }) =>
        dbInstance
          .update(planSteps)
          .set({ displayOrder, updatedAt: new Date() })
          .where(eq(planSteps.id, stepId)),
      ),
    );
  }

  // ============================================================================
  // EXECUTION LOGS
  // ============================================================================

  /**
   * Create execution log
   */
  static async createExecutionLogAsync(
    data: NewPlanExecutionLog,
    context: QueryContext,
  ): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    await dbInstance.insert(planExecutionLogs).values(data);
  }

  /**
   * Get execution logs for a plan
   */
  static async getExecutionLogsByPlanAsync(
    planId: string,
    context: QueryContext,
  ) {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(planExecutionLogs)
      .where(eq(planExecutionLogs.planId, planId))
      .orderBy(planExecutionLogs.stepNumber, planExecutionLogs.createdAt);
  }
}
```

### Step 4: Create Feature Planner Facade

**File:** `src/lib/facades/feature-planner/feature-planner.facade.ts`

```typescript
import type { FindOptions } from '@/lib/queries/base/query-context';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  FeaturePlan,
  FeatureRefinement,
  FileDiscoverySession,
  ImplementationPlanGeneration,
  RefinementSettings,
} from '@/lib/db/schema/feature-planner.schema';

import { OPERATIONS } from '@/lib/constants';
import {
  createProtectedQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { FeaturePlannerQuery } from '@/lib/queries/feature-planner/feature-planner.query';
import { FeaturePlannerService } from '@/lib/services/feature-planner.service';
import { createFacadeError } from '@/lib/utils/error-builders';

const facadeName = 'FeaturePlannerFacade';

export class FeaturePlannerFacade {
  // ============================================================================
  // PLAN MANAGEMENT
  // ============================================================================

  /**
   * Create a new feature plan
   */
  static async createFeaturePlanAsync(
    originalRequest: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<FeaturePlan | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.createPlanAsync(
        {
          userId,
          originalRequest,
          status: 'draft',
          currentStep: 0,
        },
        context,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { originalRequest },
        facade: facadeName,
        method: 'createFeaturePlanAsync',
        operation: OPERATIONS.FEATURE_PLANNER.CREATE_PLAN,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get feature plan by ID
   */
  static async getFeaturePlanByIdAsync(
    planId: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<FeaturePlan | null> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.findPlanByIdAsync(planId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { planId },
        facade: facadeName,
        method: 'getFeaturePlanByIdAsync',
        operation: OPERATIONS.FEATURE_PLANNER.GET_PLAN,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get user's feature plans
   */
  static async getUserFeaturePlansAsync(
    userId: string,
    options: FindOptions = {},
    dbInstance?: DatabaseExecutor,
  ): Promise<FeaturePlan[]> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.findPlansByUserAsync(userId, options, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { userId, options },
        facade: facadeName,
        method: 'getUserFeaturePlansAsync',
        operation: OPERATIONS.FEATURE_PLANNER.LIST_PLANS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  // ============================================================================
  // STEP 1: REFINEMENT
  // ============================================================================

  /**
   * Run parallel feature refinement
   */
  static async runParallelRefinementAsync(
    planId: string,
    userId: string,
    settings: RefinementSettings,
    dbInstance?: DatabaseExecutor,
  ): Promise<FeatureRefinement[]> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      // Get the plan
      const plan = await FeaturePlannerQuery.findPlanByIdAsync(planId, context);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Update plan status
      await FeaturePlannerQuery.updatePlanAsync(
        planId,
        {
          status: 'refining',
          currentStep: 1,
          refinementSettings: settings,
        },
        userId,
        context,
      );

      // Run refinements in parallel
      const refinementPromises = Array.from(
        { length: settings.agentCount },
        (_, i) =>
          this.runSingleRefinementAsync(
            planId,
            plan.originalRequest,
            `agent-${i + 1}`,
            settings,
            userId,
            dbInstance,
          ),
      );

      const refinements = await Promise.all(refinementPromises);

      return refinements.filter((r): r is FeatureRefinement => r !== null);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { planId, settings },
        facade: facadeName,
        method: 'runParallelRefinementAsync',
        operation: OPERATIONS.FEATURE_PLANNER.RUN_REFINEMENT,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Run single refinement (internal)
   */
  private static async runSingleRefinementAsync(
    planId: string,
    originalRequest: string,
    agentId: string,
    settings: RefinementSettings,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<FeatureRefinement | null> {
    const context = createUserQueryContext(userId, { dbInstance });
    const startTime = Date.now();

    try {
      // Create refinement record
      const refinement = await FeaturePlannerQuery.createRefinementAsync(
        {
          planId,
          agentId,
          inputRequest: originalRequest,
          status: 'processing',
        },
        context,
      );

      if (!refinement) {
        throw new Error('Failed to create refinement record');
      }

      // Execute agent
      const result = await FeaturePlannerService.executeRefinementAgent(originalRequest, {
        minOutputLength: settings.minOutputLength,
        maxOutputLength: settings.maxOutputLength,
        includeProjectContext: settings.includeProjectContext,
        customModel: settings.customModel,
      });

      // Update refinement with result
      return await FeaturePlannerQuery.updateRefinementAsync(
        refinement.id,
        {
          refinedRequest: result.result,
          status: 'completed',
          executionTimeMs: result.executionTimeMs,
          wordCount: result.result.split(/\s+/).length,
          characterCount: result.result.length,
          promptTokens: result.tokenUsage.promptTokens,
          completionTokens: result.tokenUsage.completionTokens,
          totalTokens: result.tokenUsage.totalTokens,
          retryCount: result.retryCount,
          completedAt: new Date(),
        },
        context,
      );
    } catch (error) {
      // Update refinement as failed
      const context = createUserQueryContext(userId, { dbInstance });

      // Log error but don't throw - parallel execution should continue
      console.error(`Refinement ${agentId} failed:`, error);

      return null;
    }
  }

  // Add more methods following the same pattern...
  // - runFileDiscoveryAsync
  // - runPlanGenerationAsync
  // - selectRefinementAsync
  // - etc.
}
```

---

## Code Examples

### Example: Using the Facade in an Action

```typescript
'use server';

import { authActionClient } from '@/lib/utils/next-safe-action';
import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { createFeaturePlanSchema } from '@/lib/validations/feature-planner.validation';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { OPERATIONS, ACTION_NAMES } from '@/lib/constants';

export const createFeaturePlanAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.CREATE,
    isTransactionRequired: true,
  })
  .inputSchema(createFeaturePlanSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { originalRequest } = parsedInput;
    const userId = ctx.userId;

    try {
      const plan = await FeaturePlannerFacade.createFeaturePlanAsync(
        originalRequest,
        userId,
        ctx.tx,
      );

      if (!plan) {
        throw new Error('Failed to create feature plan');
      }

      return {
        success: true,
        data: plan,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.CREATE },
        operation: OPERATIONS.FEATURE_PLANNER.CREATE_PLAN,
        userId,
      });
    }
  });
```

---

## Testing Requirements

### Unit Tests

```typescript
// tests/lib/services/feature-planner.service.test.ts

describe('FeaturePlannerService', () => {
  describe('executeRefinementAgent', () => {
    it('should refine feature request successfully', async () => {
      const result = await FeaturePlannerService.executeRefinementAgent(
        'Add user authentication',
        {
          minOutputLength: 150,
          maxOutputLength: 300,
          includeProjectContext: true,
        },
      );

      expect(result.result).toBeDefined();
      expect(result.executionTimeMs).toBeGreaterThan(0);
      expect(result.tokenUsage.totalTokens).toBeGreaterThan(0);
    });

    it('should handle agent errors gracefully', async () => {
      await expect(
        FeaturePlannerService.executeRefinementAgent('', {
          minOutputLength: 150,
          maxOutputLength: 300,
          includeProjectContext: false,
        }),
      ).rejects.toThrow();
    });
  });
});
```

### Integration Tests

```typescript
// tests/lib/facades/feature-planner.facade.test.ts

describe('FeaturePlannerFacade', () => {
  describe('createFeaturePlanAsync', () => {
    it('should create plan and store in database', async () => {
      const plan = await FeaturePlannerFacade.createFeaturePlanAsync(
        'Add user authentication',
        'user-123',
      );

      expect(plan).toBeDefined();
      expect(plan?.originalRequest).toBe('Add user authentication');
      expect(plan?.status).toBe('draft');
    });
  });

  describe('runParallelRefinementAsync', () => {
    it('should run multiple refinements in parallel', async () => {
      const plan = await FeaturePlannerFacade.createFeaturePlanAsync(
        'Add user authentication',
        'user-123',
      );

      const refinements = await FeaturePlannerFacade.runParallelRefinementAsync(
        plan!.id,
        'user-123',
        {
          agentCount: 2,
          minOutputLength: 150,
          maxOutputLength: 300,
          includeProjectContext: true,
        },
      );

      expect(refinements).toHaveLength(2);
      expect(refinements[0].status).toBe('completed');
    });
  });
});
```

---

## Critical Rules

### ✅ DO

1. **Follow existing patterns exactly** - Use the same structure as BobbleheadsFacade, BobbleheadsQuery
2. **Use QueryContext everywhere** - All query methods must accept QueryContext
3. **Add proper error handling** - Use try-catch with FacadeErrorContext
4. **Use circuit breakers** - All external service calls must use circuit breakers
5. **Add retry logic** - Use withServiceRetry for all agent operations
6. **Type everything properly** - No `any` types, use proper inference
7. **Test comprehensively** - Unit, integration, and E2E tests required

### ❌ DON'T

1. **Don't skip QueryContext** - Never query database without QueryContext
2. **Don't bypass facades in actions** - Actions must use facades, not queries directly
3. **Don't ignore transactions** - Support optional DatabaseExecutor parameter
4. **Don't hardcode values** - Use constants from OPERATIONS, ERROR_CODES, etc.
5. **Don't skip validation** - All inputs must be validated with Zod
6. **Don't forget caching** - Read operations should use CacheService
7. **Don't skip logging** - Use console.error for failures, Sentry for exceptions

---

## Next Steps

1. ✅ Review this documentation
2. Create `feature-planner.service.ts` following the pattern
3. Create `feature-planner.query.ts` following the pattern
4. Create `feature-planner.facade.ts` following the pattern
5. Add validation schemas with Zod
6. Create actions using the facades
7. Write comprehensive tests
8. Add API routes
9. Build UI components

---

**Status:** ✅ Ready for Implementation
**Last Updated:** 2025-10-09
