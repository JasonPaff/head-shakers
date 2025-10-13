import { and, desc, eq, inArray, or } from 'drizzle-orm';

import type {
  CustomAgent,
  DiscoveredFile,
  FeaturePlan,
  FeatureRefinement,
  FileDiscoverySession,
  ImplementationPlanGeneration,
  NewCustomAgent,
  NewDiscoveredFile,
  NewFeaturePlan,
  NewFeatureRefinement,
  NewFileDiscoverySession,
  NewImplementationPlanGeneration,
  NewPlanExecutionLog,
  NewPlanStep,
  PlanExecutionLog,
  PlanStep,
} from '@/lib/db/schema/feature-planner.schema';
import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';

import {
  customAgents,
  discoveredFiles,
  featurePlans,
  featureRefinements,
  fileDiscoverySessions,
  implementationPlanGenerations,
  planExecutionLogs,
  planSteps,
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
   * Batch create discovered files
   */
  static async batchCreateDiscoveredFilesAsync(
    files: Array<NewDiscoveredFile>,
    context: QueryContext,
  ): Promise<Array<DiscoveredFile>> {
    if (files.length === 0) return [];

    const dbInstance = this.getDbInstance(context);

    return dbInstance.insert(discoveredFiles).values(files).returning();
  }

  /**
   * Batch create plan steps
   */
  static async batchCreatePlanStepsAsync(
    steps: Array<NewPlanStep>,
    context: QueryContext,
  ): Promise<Array<PlanStep>> {
    if (steps.length === 0) return [];

    const dbInstance = this.getDbInstance(context);

    return dbInstance.insert(planSteps).values(steps).returning();
  }

  /**
   * Batch update plan steps (for reordering)
   */
  static async batchUpdatePlanStepsAsync(
    updates: Array<{ displayOrder: number; stepId: string }>,
    context: QueryContext,
  ): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    await Promise.all(
      updates.map(({ displayOrder, stepId }) =>
        dbInstance
          .update(planSteps)
          .set({ displayOrder, updatedAt: new Date() })
          .where(eq(planSteps.id, stepId)),
      ),
    );
  }

  /**
   * Create refinement agent
   */
  static async createAgentAsync(
    data: NewCustomAgent,
    context: QueryContext,
  ): Promise<CustomAgent | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.insert(customAgents).values(data).returning();

    return result[0] || null;
  }

  /**
   * Create discovered file
   */
  static async createDiscoveredFileAsync(
    data: NewDiscoveredFile,
    context: QueryContext,
  ): Promise<DiscoveredFile | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.insert(discoveredFiles).values(data).returning();

    return result[0] || null;
  }

  // ============================================================================
  // FEATURE REFINEMENTS
  // ============================================================================

  /**
   * Create execution log
   */
  static async createExecutionLogAsync(data: NewPlanExecutionLog, context: QueryContext): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    await dbInstance.insert(planExecutionLogs).values(data);
  }

  /**
   * Create feature suggestion agent
   * Creates a new agent with agentType set to 'feature-suggestion'
   */
  static async createFeatureSuggestionAgent(
    agent: NewCustomAgent,
    context: QueryContext,
  ): Promise<CustomAgent | null> {
    const dbInstance = this.getDbInstance(context);

    // Ensure agentType is set to 'feature-suggestion'
    const agentData = {
      ...agent,
      agentType: 'feature-suggestion' as const,
    };

    const result = await dbInstance.insert(customAgents).values(agentData).returning();

    return result[0] || null;
  }

  /**
   * Create file discovery session
   */
  static async createFileDiscoverySessionAsync(
    data: NewFileDiscoverySession,
    context: QueryContext,
  ): Promise<FileDiscoverySession | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.insert(fileDiscoverySessions).values(data).returning();

    return result[0] || null;
  }

  // ============================================================================
  // FILE DISCOVERY SESSIONS
  // ============================================================================

  /**
   * Create a new feature plan
   */
  static async createPlanAsync(data: NewFeaturePlan, context: QueryContext): Promise<FeaturePlan | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.insert(featurePlans).values(data).returning();

    return result[0] || null;
  }

  /**
   * Create implementation plan generation
   */
  static async createPlanGenerationAsync(
    data: NewImplementationPlanGeneration,
    context: QueryContext,
  ): Promise<ImplementationPlanGeneration | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.insert(implementationPlanGenerations).values(data).returning();

    return result[0] || null;
  }

  /**
   * Create plan step
   */
  static async createPlanStepAsync(data: NewPlanStep, context: QueryContext): Promise<null | PlanStep> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.insert(planSteps).values(data).returning();

    return result[0] || null;
  }

  // ============================================================================
  // DISCOVERED FILES
  // ============================================================================

  /**
   * Create a refinement attempt
   */
  static async createRefinementAsync(
    data: NewFeatureRefinement,
    context: QueryContext,
  ): Promise<FeatureRefinement | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.insert(featureRefinements).values(data).returning();

    return result[0] || null;
  }

  /**
   * Delete refinement agent (soft delete - set isActive to false)
   */
  static async deleteAgentAsync(
    agentId: string,
    userId: string,
    context: QueryContext,
  ): Promise<CustomAgent | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(customAgents)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(customAgents.agentId, agentId),
          context.userId ? eq(customAgents.userId, userId) : undefined,
        ),
      )
      .returning();

    return result[0] || null;
  }

  /**
   * Delete feature plan
   */
  static async deletePlanAsync(
    planId: string,
    userId: string,
    context: QueryContext,
  ): Promise<FeaturePlan | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .delete(featurePlans)
      .where(and(eq(featurePlans.id, planId), eq(featurePlans.userId, userId)))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete plan step
   */
  static async deletePlanStepAsync(stepId: string, context: QueryContext): Promise<null | PlanStep> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.delete(planSteps).where(eq(planSteps.id, stepId)).returning();

    return result[0] || null;
  }

  // ============================================================================
  // IMPLEMENTATION PLAN GENERATIONS
  // ============================================================================

  /**
   * Find refinement agent by agentId
   */
  static async findAgentByIdAsync(agentId: string, context: QueryContext): Promise<CustomAgent | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(customAgents)
      .where(
        this.combineFilters(
          eq(customAgents.agentId, agentId),
          eq(customAgents.isActive, true),
          context.userId ?
            // Include default agents OR user's custom agents
            or(eq(customAgents.isDefault, true), eq(customAgents.userId, context.userId))
          : eq(customAgents.isDefault, true),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find refinement agents by multiple agentIds
   */
  static async findAgentsByIdsAsync(
    agentIds: Array<string>,
    context: QueryContext,
  ): Promise<Array<CustomAgent>> {
    if (agentIds.length === 0) return [];

    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(customAgents)
      .where(
        this.combineFilters(
          inArray(customAgents.agentId, agentIds),
          eq(customAgents.isActive, true),
          context.userId ?
            // Include default agents OR user's custom agents
            or(eq(customAgents.isDefault, true), eq(customAgents.userId, context.userId))
          : eq(customAgents.isDefault, true),
        ),
      )
      .orderBy(desc(customAgents.isDefault), customAgents.name);
  }

  /**
   * Find all active refinement agents
   */
  static async findAllActiveAgentsAsync(context: QueryContext): Promise<Array<CustomAgent>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(customAgents)
      .where(
        this.combineFilters(
          eq(customAgents.isActive, true),
          context.userId ?
            // Include default agents OR user's custom agents
            or(eq(customAgents.isDefault, true), eq(customAgents.userId, context.userId))
          : eq(customAgents.isDefault, true),
        ),
      )
      .orderBy(desc(customAgents.isDefault), customAgents.name);
  }

  // ============================================================================
  // PLAN STEPS
  // ============================================================================

  /**
   * Find feature plan by ID
   */
  static async findPlanByIdAsync(planId: string, context: QueryContext): Promise<FeaturePlan | null> {
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
  ): Promise<Array<FeaturePlan>> {
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
   * Get discovered files for a session
   */
  static async getDiscoveredFilesBySessionAsync(
    sessionId: string,
    context: QueryContext,
  ): Promise<Array<DiscoveredFile>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(discoveredFiles)
      .where(eq(discoveredFiles.discoverySessionId, sessionId))
      .orderBy(desc(discoveredFiles.priority), desc(discoveredFiles.relevanceScore));
  }

  /**
   * Get execution logs for a plan
   */
  static async getExecutionLogsByPlanAsync(
    planId: string,
    context: QueryContext,
  ): Promise<Array<PlanExecutionLog>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(planExecutionLogs)
      .where(eq(planExecutionLogs.planId, planId))
      .orderBy(planExecutionLogs.stepNumber, planExecutionLogs.createdAt);
  }

  /**
   * Get execution logs for a specific step
   */
  static async getExecutionLogsByStepAsync(
    planId: string,
    stepNumber: number,
    context: QueryContext,
  ): Promise<Array<PlanExecutionLog>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(planExecutionLogs)
      .where(and(eq(planExecutionLogs.planId, planId), eq(planExecutionLogs.stepNumber, stepNumber)))
      .orderBy(planExecutionLogs.createdAt);
  }

  /**
   * Get feature suggestion agent by user ID
   * Returns the active feature-suggestion agent for a specific user
   */
  static async getFeatureSuggestionAgentByUserId(
    userId: string,
    context: QueryContext,
  ): Promise<CustomAgent | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(customAgents)
      .where(
        this.combineFilters(
          eq(customAgents.userId, userId),
          eq(customAgents.agentType, 'feature-suggestion'),
          eq(customAgents.isActive, true),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  // ============================================================================
  // EXECUTION LOGS
  // ============================================================================

  /**
   * Get file discovery sessions for a plan
   */
  static async getFileDiscoverySessionsByPlanAsync(
    planId: string,
    context: QueryContext,
  ): Promise<Array<FileDiscoverySession>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(fileDiscoverySessions)
      .where(eq(fileDiscoverySessions.planId, planId))
      .orderBy(desc(fileDiscoverySessions.createdAt));
  }

  /**
   * Get plan generations for a plan
   */
  static async getPlanGenerationsByPlanAsync(
    planId: string,
    context: QueryContext,
  ): Promise<Array<ImplementationPlanGeneration>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(implementationPlanGenerations)
      .where(eq(implementationPlanGenerations.planId, planId))
      .orderBy(desc(implementationPlanGenerations.createdAt));
  }

  /**
   * Get plan steps for a generation
   */
  static async getPlanStepsByGenerationAsync(
    generationId: string,
    context: QueryContext,
  ): Promise<Array<PlanStep>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(planSteps)
      .where(eq(planSteps.planGenerationId, generationId))
      .orderBy(planSteps.displayOrder);
  }

  // ============================================================================
  // REFINEMENT AGENTS
  // ============================================================================

  /**
   * Get refinements for a plan
   */
  static async getRefinementsByPlanAsync(
    planId: string,
    context: QueryContext,
  ): Promise<Array<FeatureRefinement>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(featureRefinements)
      .where(eq(featureRefinements.planId, planId))
      .orderBy(desc(featureRefinements.createdAt));
  }

  /**
   * Update refinement agent
   */
  static async updateAgentAsync(
    agentId: string,
    updates: Partial<NewCustomAgent>,
    context: QueryContext,
  ): Promise<CustomAgent | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(customAgents)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eq(customAgents.agentId, agentId),
          context.userId ? eq(customAgents.userId, context.userId) : undefined,
        ),
      )
      .returning();

    return result[0] || null;
  }

  /**
   * Update discovered file
   */
  static async updateDiscoveredFileAsync(
    fileId: string,
    data: Partial<NewDiscoveredFile>,
    context: QueryContext,
  ): Promise<DiscoveredFile | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(discoveredFiles)
      .set(data)
      .where(eq(discoveredFiles.id, fileId))
      .returning();

    return result[0] || null;
  }

  /**
   * Update feature suggestion agent
   * Updates an existing feature-suggestion agent
   */
  static async updateFeatureSuggestionAgent(
    agentId: string,
    updates: Partial<NewCustomAgent>,
    context: QueryContext,
  ): Promise<CustomAgent | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(customAgents)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        this.combineFilters(
          eq(customAgents.agentId, agentId),
          eq(customAgents.agentType, 'feature-suggestion'),
          context.userId ? eq(customAgents.userId, context.userId) : undefined,
        ),
      )
      .returning();

    return result[0] || null;
  }

  /**
   * Update file discovery session
   */
  static async updateFileDiscoverySessionAsync(
    sessionId: string,
    data: Partial<NewFileDiscoverySession>,
    context: QueryContext,
  ): Promise<FileDiscoverySession | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(fileDiscoverySessions)
      .set(data)
      .where(eq(fileDiscoverySessions.id, sessionId))
      .returning();

    return result[0] || null;
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
      .where(and(eq(featurePlans.id, planId), eq(featurePlans.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // ============================================================================
  // FEATURE SUGGESTION AGENTS
  // ============================================================================

  /**
   * Update plan generation
   */
  static async updatePlanGenerationAsync(
    generationId: string,
    data: Partial<NewImplementationPlanGeneration>,
    context: QueryContext,
  ): Promise<ImplementationPlanGeneration | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(implementationPlanGenerations)
      .set(data)
      .where(eq(implementationPlanGenerations.id, generationId))
      .returning();

    return result[0] || null;
  }

  /**
   * Update plan step
   */
  static async updatePlanStepAsync(
    stepId: string,
    data: Partial<NewPlanStep>,
    context: QueryContext,
  ): Promise<null | PlanStep> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(planSteps)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(planSteps.id, stepId))
      .returning();

    return result[0] || null;
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
}
