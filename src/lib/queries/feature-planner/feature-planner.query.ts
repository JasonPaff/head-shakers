import { and, desc, eq } from 'drizzle-orm';

import type {
  DiscoveredFile,
  FeaturePlan,
  FeatureRefinement,
  FileDiscoverySession,
  ImplementationPlanGeneration,
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

  /**
   * Create execution log
   */
  static async createExecutionLogAsync(data: NewPlanExecutionLog, context: QueryContext): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    await dbInstance.insert(planExecutionLogs).values(data);
  }

  // ============================================================================
  // FEATURE REFINEMENTS
  // ============================================================================

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

  // ============================================================================
  // FILE DISCOVERY SESSIONS
  // ============================================================================

  /**
   * Create plan step
   */
  static async createPlanStepAsync(data: NewPlanStep, context: QueryContext): Promise<null | PlanStep> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.insert(planSteps).values(data).returning();

    return result[0] || null;
  }

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

  // ============================================================================
  // DISCOVERED FILES
  // ============================================================================

  /**
   * Delete plan step
   */
  static async deletePlanStepAsync(stepId: string, context: QueryContext): Promise<null | PlanStep> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.delete(planSteps).where(eq(planSteps.id, stepId)).returning();

    return result[0] || null;
  }

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

  // ============================================================================
  // IMPLEMENTATION PLAN GENERATIONS
  // ============================================================================

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

  // ============================================================================
  // PLAN STEPS
  // ============================================================================

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
  // EXECUTION LOGS
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
