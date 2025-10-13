import { existsSync } from 'fs';
import { join } from 'path';

import type { RefinementAgent } from '@/lib/config/refinement-agents';
import type {
  RefinementAgent as DbRefinementAgent,
  FeaturePlan,
  FeatureRefinement,
  FileDiscoverySession,
  ImplementationPlanGeneration,
  NewRefinementAgent,
  PlanStep,
  RefinementSettings,
} from '@/lib/db/schema/feature-planner.schema';
import type { FindOptions } from '@/lib/queries/base/query-context';
import type { RefinementOutput } from '@/lib/types/refinement-output';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { OPERATIONS } from '@/lib/constants';
import { createProtectedQueryContext, createUserQueryContext } from '@/lib/queries/base/query-context';
import { FeaturePlannerQuery } from '@/lib/queries/feature-planner/feature-planner.query';
import { FeaturePlannerService } from '@/lib/services/feature-planner.service';
import { createFacadeError } from '@/lib/utils/error-builders';

const facadeName = 'FeaturePlannerFacade';

export class FeaturePlannerFacade {
  // ============================================================================
  // REFINEMENT AGENT MANAGEMENT
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
          currentStep: 0,
          originalRequest,
          status: 'draft',
          userId,
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
   * Create a new plan step
   */
  static async createPlanStepAsync(
    stepData: {
      category?: null | string;
      commands?: Array<string>;
      confidenceLevel?: null | string;
      description: string;
      displayOrder: number;
      estimatedDuration?: null | string;
      planGenerationId: string;
      stepNumber: number;
      title: string;
      validationCommands?: Array<string>;
    },
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | PlanStep> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.createPlanStepAsync(stepData, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { stepData },
        facade: facadeName,
        method: 'createPlanStepAsync',
        operation: OPERATIONS.FEATURE_PLANNER.CREATE_PLAN_STEP,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Create a new refinement agent
   */
  static async createRefinementAgentAsync(
    agentData: NewRefinementAgent,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<DbRefinementAgent | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.createAgentAsync(agentData, context);
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { agentData },
        facade: facadeName,
        method: 'createRefinementAgentAsync',
        operation: OPERATIONS.FEATURE_PLANNER.CREATE_PLAN,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Delete feature plan
   */
  static async deleteFeaturePlanAsync(
    planId: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<FeaturePlan | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.deletePlanAsync(planId, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { planId },
        facade: facadeName,
        method: 'deleteFeaturePlanAsync',
        operation: OPERATIONS.FEATURE_PLANNER.DELETE_PLAN,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Delete a plan step
   */
  static async deletePlanStepAsync(
    stepId: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | PlanStep> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.deletePlanStepAsync(stepId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { stepId },
        facade: facadeName,
        method: 'deletePlanStepAsync',
        operation: OPERATIONS.FEATURE_PLANNER.DELETE_PLAN_STEP,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Delete a refinement agent (soft delete)
   */
  static async deleteRefinementAgentAsync(
    agentId: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<DbRefinementAgent | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.deleteAgentAsync(agentId, userId, context);
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { agentId },
        facade: facadeName,
        method: 'deleteRefinementAgentAsync',
        operation: OPERATIONS.FEATURE_PLANNER.DELETE_PLAN,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  // ============================================================================
  // PLAN MANAGEMENT
  // ============================================================================

  /**
   * Get a single refinement agent by agentId
   */
  static async getAgentByIdAsync(
    agentId: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | RefinementAgent> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      const dbAgent = await FeaturePlannerQuery.findAgentByIdAsync(agentId, context);

      return dbAgent ? dbAgentToRefinementAgent(dbAgent) : null;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { agentId },
        facade: facadeName,
        method: 'getAgentByIdAsync',
        operation: OPERATIONS.FEATURE_PLANNER.GET_PLAN,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Get multiple refinement agents by agentIds
   */
  static async getAgentsByIdsAsync(
    agentIds: Array<string>,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<RefinementAgent>> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      const dbAgents = await FeaturePlannerQuery.findAgentsByIdsAsync(agentIds, context);

      return dbAgents.map(dbAgentToRefinementAgent);
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { agentIds },
        facade: facadeName,
        method: 'getAgentsByIdsAsync',
        operation: OPERATIONS.FEATURE_PLANNER.LIST_PLANS,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Get all available refinement agents (default + user's custom agents)
   */
  static async getAvailableAgentsAsync(
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<RefinementAgent>> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      const dbAgents = await FeaturePlannerQuery.findAllActiveAgentsAsync(context);

      return dbAgents.map(dbAgentToRefinementAgent);
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: {},
        facade: facadeName,
        method: 'getAvailableAgentsAsync',
        operation: OPERATIONS.FEATURE_PLANNER.LIST_PLANS,
        userId,
      };
      throw createFacadeError(errorContext, error);
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

  // ============================================================================
  // STEP 1: REFINEMENT
  // ============================================================================

  /**
   * Get file discovery sessions for a plan
   */
  static async getFileDiscoverySessionsByPlanAsync(
    planId: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<FileDiscoverySession>> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.getFileDiscoverySessionsByPlanAsync(planId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { planId },
        facade: facadeName,
        method: 'getFileDiscoverySessionsByPlanAsync',
        operation: OPERATIONS.FEATURE_PLANNER.GET_DISCOVERED_FILES,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get plan generations for a plan
   */
  static async getPlanGenerationsByPlanAsync(
    planId: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<ImplementationPlanGeneration>> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.getPlanGenerationsByPlanAsync(planId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { planId },
        facade: facadeName,
        method: 'getPlanGenerationsByPlanAsync',
        operation: OPERATIONS.FEATURE_PLANNER.GET_PLAN_GENERATIONS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get refinements for a plan
   */
  static async getRefinementsByPlanAsync(
    planId: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<FeatureRefinement>> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.getRefinementsByPlanAsync(planId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { planId },
        facade: facadeName,
        method: 'getRefinementsByPlanAsync',
        operation: OPERATIONS.FEATURE_PLANNER.GET_REFINEMENTS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  // ============================================================================
  // STEP 2: FILE DISCOVERY
  // ============================================================================

  /**
   * Get user's feature plans
   */
  static async getUserFeaturePlansAsync(
    userId: string,
    options: FindOptions = {},
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<FeaturePlan>> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.findPlansByUserAsync(userId, options, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { options, userId },
        facade: facadeName,
        method: 'getUserFeaturePlansAsync',
        operation: OPERATIONS.FEATURE_PLANNER.LIST_PLANS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Reorder plan steps
   */
  static async reorderPlanStepsAsync(
    updates: Array<{ displayOrder: number; stepId: string }>,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<void> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.batchUpdatePlanStepsAsync(updates, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { updates },
        facade: facadeName,
        method: 'reorderPlanStepsAsync',
        operation: OPERATIONS.FEATURE_PLANNER.REORDER_PLAN_STEPS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  // ============================================================================
  // STEP 3: IMPLEMENTATION PLANNING
  // ============================================================================

  /**
   * Run file discovery
   */
  static async runFileDiscoveryAsync(
    planId: string,
    userId: string,
    settings: { customModel?: string },
    dbInstance?: DatabaseExecutor,
  ): Promise<FileDiscoverySession | null> {
    const context = createUserQueryContext(userId, { dbInstance });
    let session: FileDiscoverySession | null = null;

    try {
      // get the plan
      const plan = await FeaturePlannerQuery.findPlanByIdAsync(planId, context);
      if (!plan || !plan.refinedRequest) {
        throw new Error('Plan not found or not refined');
      }

      // update plan status
      await FeaturePlannerQuery.updatePlanAsync(
        planId,
        {
          currentStep: 2,
          status: 'discovering',
        },
        userId,
        context,
      );

      // create a file discovery session
      session = await FeaturePlannerQuery.createFileDiscoverySessionAsync(
        {
          agentId: `discovery-${Date.now()}`,
          planId,
          refinedRequest: plan.refinedRequest,
          status: 'processing',
        },
        context,
      );

      if (!session) {
        throw new Error('Failed to create discovery session');
      }

      // execute parallel file discovery agents
      const result = await FeaturePlannerService.executeParallelFileDiscoveryAgents(
        plan.refinedRequest,
        settings,
      );

      // extract architecture insights from discovered files
      const architectureInsights = FeaturePlannerService.extractArchitectureInsights(result.result);

      // update session with results
      const updatedSession = await FeaturePlannerQuery.updateFileDiscoverySessionAsync(
        session.id,
        {
          architectureInsights,
          completedAt: new Date(),
          completionTokens: result.tokenUsage.completionTokens,
          criticalPriorityCount: result.result.filter((f) => f.priority === 'critical').length,
          discoveredFiles: result.result,
          executionTimeMs: result.executionTimeMs,
          highPriorityCount: result.result.filter((f) => f.priority === 'high').length,
          lowPriorityCount: result.result.filter((f) => f.priority === 'low').length,
          mediumPriorityCount: result.result.filter((f) => f.priority === 'medium').length,
          promptTokens: result.tokenUsage.promptTokens,
          status: 'completed',
          totalFilesFound: result.result.length,
          totalTokens: result.tokenUsage.totalTokens,
        },
        context,
      );

      // create individual discovered files records
      if (result.result.length > 0 && session) {
        const sessionId = session.id; // Type narrowing
        const fileRecords = result.result.map((file) => {
          // Verify file existence on server side if agent didn't verify
          const fileExists =
            file.fileExists !== undefined ? file.fileExists : existsSync(join(process.cwd(), file.filePath));

          return {
            description: file.description,
            discoverySessionId: sessionId,
            fileExists,
            filePath: file.filePath,
            integrationPoint: file.integrationPoint,
            isManuallyAdded: file.isManuallyAdded ?? false,
            priority: file.priority,
            reasoning: file.reasoning,
            relevanceScore: file.relevanceScore,
            role: file.role,
          };
        });

        await FeaturePlannerQuery.batchCreateDiscoveredFilesAsync(fileRecords, context);
      }

      return updatedSession;
    } catch (error) {
      // Update session status to failed if it was created
      if (session) {
        try {
          await FeaturePlannerQuery.updateFileDiscoverySessionAsync(
            session.id,
            {
              completedAt: new Date(),
              errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
              status: 'failed',
            },
            context,
          );
        } catch (updateError) {
          console.error('Failed to update session status to failed:', updateError);
        }
      }

      // Revert plan status back to refining state
      try {
        await FeaturePlannerQuery.updatePlanAsync(
          planId,
          {
            currentStep: 1,
            status: 'refining',
          },
          userId,
          context,
        );
      } catch (planUpdateError) {
        console.error('Failed to revert plan status:', planUpdateError);
      }

      const errorContext: FacadeErrorContext = {
        data: { planId, settings },
        facade: facadeName,
        method: 'runFileDiscoveryAsync',
        operation: OPERATIONS.FEATURE_PLANNER.RUN_FILE_DISCOVERY,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Run parallel feature refinement
   */
  static async runParallelRefinementAsync(
    planId: string,
    userId: string,
    settings: RefinementSettings,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<FeatureRefinement>> {
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
          currentStep: 1,
          refinementSettings: settings,
          status: 'refining',
        },
        userId,
        context,
      );

      // Get specialized agents for refinement from database
      // Use selectedAgentIds if provided, otherwise fall back to agentCount
      const agents =
        settings.selectedAgentIds && settings.selectedAgentIds.length > 0 ?
          await this.getAgentsByIdsAsync(settings.selectedAgentIds, userId, dbInstance)
        : (await this.getAvailableAgentsAsync(userId, dbInstance)).slice(0, settings.agentCount);

      // Run refinements in parallel with specialized agents
      const refinementPromises = agents.map((agent) =>
        this.runSingleRefinementAsync(
          planId,
          plan.originalRequest,
          agent.agentId,
          settings,
          userId,
          dbInstance,
          agent,
        ),
      );

      const refinements = await Promise.all(refinementPromises);
      const successfulRefinements = refinements.filter((r): r is FeatureRefinement => r !== null);

      // Run synthesis agent if enabled and we have at least 2 successful refinements
      if (settings.enableSynthesis && successfulRefinements.length >= 2) {
        try {
          // Extract RefinementOutput from successful refinements
          const refinementOutputs: Array<RefinementOutput> = successfulRefinements
            .map((r): null | RefinementOutput => {
              // Check if this refinement has structured data
              if (
                r.focus &&
                r.confidence &&
                r.technicalComplexity &&
                r.estimatedScope &&
                r.keyRequirements &&
                r.assumptions &&
                r.risks &&
                r.refinedRequest
              ) {
                return {
                  assumptions: r.assumptions,
                  confidence: r.confidence,
                  estimatedScope: r.estimatedScope,
                  focus: r.focus,
                  keyRequirements: r.keyRequirements,
                  refinedRequest: r.refinedRequest,
                  risks: r.risks,
                  technicalComplexity: r.technicalComplexity,
                };
              }
              return null;
            })
            .filter((output): output is NonNullable<typeof output> => output !== null);

          // Only run synthesis if we have at least 2 structured outputs
          if (refinementOutputs.length >= 2) {
            const synthesisResult = await FeaturePlannerService.executeSynthesisAgent(
              plan.originalRequest,
              refinementOutputs,
              {
                customModel: settings.customModel,
                includeProjectContext: settings.includeProjectContext,
                maxOutputLength: settings.maxOutputLength,
                minOutputLength: settings.minOutputLength,
              },
            );

            // Create a synthesis refinement record
            const synthesisRefinement = await FeaturePlannerQuery.createRefinementAsync(
              {
                agentId: 'synthesis-agent',
                inputRequest: plan.originalRequest,
                planId,
                status: 'processing',
              },
              context,
            );

            if (synthesisRefinement) {
              const updateData: Parameters<typeof FeaturePlannerQuery.updateRefinementAsync>[1] = {
                agentName: 'Synthesis Agent',
                agentRole: 'Senior Technical Lead',
                assumptions: synthesisResult.result.assumptions,
                characterCount: synthesisResult.result.refinedRequest.length,
                completedAt: new Date(),
                completionTokens: synthesisResult.tokenUsage.completionTokens,
                confidence: synthesisResult.result.confidence,
                estimatedScope: synthesisResult.result.estimatedScope,
                executionTimeMs: synthesisResult.executionTimeMs,
                focus: synthesisResult.result.focus,
                keyRequirements: synthesisResult.result.keyRequirements,
                promptTokens: synthesisResult.tokenUsage.promptTokens,
                refinedRequest: synthesisResult.result.refinedRequest,
                retryCount: synthesisResult.retryCount,
                risks: synthesisResult.result.risks,
                status: 'completed',
                technicalComplexity: synthesisResult.result.technicalComplexity,
                totalTokens: synthesisResult.tokenUsage.totalTokens,
                wordCount: synthesisResult.result.refinedRequest.split(/\s+/).length,
              };

              const updatedSynthesis = await FeaturePlannerQuery.updateRefinementAsync(
                synthesisRefinement.id,
                updateData,
                context,
              );

              if (updatedSynthesis) {
                successfulRefinements.push(updatedSynthesis);
              }
            }
          }
        } catch (error) {
          // Log synthesis error but don't fail the entire operation
          console.error('Synthesis agent failed:', error);
        }
      }

      return successfulRefinements;
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

  // ============================================================================
  // PLAN STEP MANAGEMENT
  // ============================================================================

  /**
   * Run parallel feature refinement with streaming support
   */
  static async runParallelRefinementWithStreamingAsync(
    planId: string,
    userId: string,
    settings: RefinementSettings,
    onPartialUpdate: (agentId: string, partialText: string) => void,
    onComplete: (agentId: string, refinement: FeatureRefinement | null) => void,
    onError: (agentId: string, error: Error) => void,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<FeatureRefinement>> {
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
          currentStep: 1,
          refinementSettings: settings,
          status: 'refining',
        },
        userId,
        context,
      );

      // Get specialized agents for refinement from database
      const agents =
        settings.selectedAgentIds && settings.selectedAgentIds.length > 0 ?
          await this.getAgentsByIdsAsync(settings.selectedAgentIds, userId, dbInstance)
        : (await this.getAvailableAgentsAsync(userId, dbInstance)).slice(0, settings.agentCount);

      // Run refinements in parallel with streaming
      const refinementPromises = agents.map((agent) =>
        this.runSingleRefinementWithStreamingAsync(
          planId,
          plan.originalRequest,
          agent.agentId,
          settings,
          userId,
          dbInstance,
          agent,
          onPartialUpdate,
          onComplete,
          onError,
        ),
      );

      const refinements = await Promise.all(refinementPromises);
      const successfulRefinements = refinements.filter((r): r is FeatureRefinement => r !== null);

      // Run synthesis agent if enabled and we have at least 2 successful refinements
      if (settings.enableSynthesis && successfulRefinements.length >= 2) {
        try {
          // Extract RefinementOutput from successful refinements
          const refinementOutputs: Array<RefinementOutput> = successfulRefinements
            .map((r): null | RefinementOutput => {
              // Check if this refinement has structured data
              if (
                r.focus &&
                r.confidence &&
                r.technicalComplexity &&
                r.estimatedScope &&
                r.keyRequirements &&
                r.assumptions &&
                r.risks &&
                r.refinedRequest
              ) {
                return {
                  assumptions: r.assumptions,
                  confidence: r.confidence,
                  estimatedScope: r.estimatedScope,
                  focus: r.focus,
                  keyRequirements: r.keyRequirements,
                  refinedRequest: r.refinedRequest,
                  risks: r.risks,
                  technicalComplexity: r.technicalComplexity,
                };
              }
              return null;
            })
            .filter((output): output is NonNullable<typeof output> => output !== null);

          // Only run synthesis if we have at least 2 structured outputs
          if (refinementOutputs.length >= 2) {
            const synthesisResult = await FeaturePlannerService.executeSynthesisAgent(
              plan.originalRequest,
              refinementOutputs,
              {
                customModel: settings.customModel,
                includeProjectContext: settings.includeProjectContext,
                maxOutputLength: settings.maxOutputLength,
                minOutputLength: settings.minOutputLength,
              },
            );

            // Create a synthesis refinement record
            const synthesisRefinement = await FeaturePlannerQuery.createRefinementAsync(
              {
                agentId: 'synthesis-agent',
                inputRequest: plan.originalRequest,
                planId,
                status: 'processing',
              },
              context,
            );

            if (synthesisRefinement) {
              const updateData: Parameters<typeof FeaturePlannerQuery.updateRefinementAsync>[1] = {
                agentName: 'Synthesis Agent',
                agentRole: 'Senior Technical Lead',
                assumptions: synthesisResult.result.assumptions,
                characterCount: synthesisResult.result.refinedRequest.length,
                completedAt: new Date(),
                completionTokens: synthesisResult.tokenUsage.completionTokens,
                confidence: synthesisResult.result.confidence,
                estimatedScope: synthesisResult.result.estimatedScope,
                executionTimeMs: synthesisResult.executionTimeMs,
                focus: synthesisResult.result.focus,
                keyRequirements: synthesisResult.result.keyRequirements,
                promptTokens: synthesisResult.tokenUsage.promptTokens,
                refinedRequest: synthesisResult.result.refinedRequest,
                retryCount: synthesisResult.retryCount,
                risks: synthesisResult.result.risks,
                status: 'completed',
                technicalComplexity: synthesisResult.result.technicalComplexity,
                totalTokens: synthesisResult.tokenUsage.totalTokens,
                wordCount: synthesisResult.result.refinedRequest.split(/\s+/).length,
              };

              const updatedSynthesis = await FeaturePlannerQuery.updateRefinementAsync(
                synthesisRefinement.id,
                updateData,
                context,
              );

              if (updatedSynthesis) {
                successfulRefinements.push(updatedSynthesis);
                onComplete('synthesis-agent', updatedSynthesis);
              }
            }
          }
        } catch (error) {
          // Log synthesis error but don't fail the entire operation
          console.error('Synthesis agent failed:', error);
          onError('synthesis-agent', error instanceof Error ? error : new Error('Synthesis failed'));
        }
      }

      return successfulRefinements;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { planId, settings },
        facade: facadeName,
        method: 'runParallelRefinementWithStreamingAsync',
        operation: OPERATIONS.FEATURE_PLANNER.RUN_REFINEMENT,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Run implementation plan generation
   */
  static async runPlanGenerationAsync(
    planId: string,
    userId: string,
    settings: { customModel?: string },
    dbInstance?: DatabaseExecutor,
  ): Promise<ImplementationPlanGeneration | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      // Get the plan
      const plan = await FeaturePlannerQuery.findPlanByIdAsync(planId, context);
      if (!plan || !plan.refinedRequest) {
        throw new Error('Plan not found or not refined');
      }

      // Get selected discovery session or latest
      const sessions = await FeaturePlannerQuery.getFileDiscoverySessionsByPlanAsync(planId, context);
      const selectedSession =
        sessions.find((s) => s.id === plan.selectedDiscoverySessionId) ||
        sessions.find((s) => s.status === 'completed') ||
        sessions[0];

      if (!selectedSession) {
        throw new Error('No file discovery session found');
      }

      // Update plan status
      await FeaturePlannerQuery.updatePlanAsync(
        planId,
        {
          currentStep: 3,
          status: 'planning',
        },
        userId,
        context,
      );

      // Create plan generation
      const generation = await FeaturePlannerQuery.createPlanGenerationAsync(
        {
          agentId: `planning-${Date.now()}`,
          discoveredFiles: selectedSession.discoveredFiles,
          planId,
          refinedRequest: plan.refinedRequest,
          status: 'processing',
        },
        context,
      );

      if (!generation) {
        throw new Error('Failed to create plan generation');
      }

      // Execute implementation planning agent
      const result = await FeaturePlannerService.executeImplementationPlanningAgent(
        plan.refinedRequest,
        selectedSession.discoveredFiles || [],
        settings,
      );

      // Update generation with results
      const updatedGeneration = await FeaturePlannerQuery.updatePlanGenerationAsync(
        generation.id,
        {
          completedAt: new Date(),
          completionTokens: result.tokenUsage.completionTokens,
          complexity: result.result.complexity,
          estimatedDuration: result.result.estimatedDuration,
          executionTimeMs: result.executionTimeMs,
          hasRequiredSections: true, // TODO: Validate sections
          implementationPlan: result.result.implementationPlan,
          isValidMarkdown: true, // TODO: Validate markdown
          prerequisitesCount: result.result.steps.filter((s) => s.category === 'prerequisite').length,
          promptTokens: result.tokenUsage.promptTokens,
          qualityGatesCount: result.result.steps.filter((s) => s.category === 'quality-gate').length,
          riskLevel: result.result.riskLevel,
          status: 'completed',
          totalSteps: result.result.steps.length,
          totalTokens: result.tokenUsage.totalTokens,
        },
        context,
      );

      // Create plan steps
      if (result.result.steps.length > 0) {
        const stepRecords = result.result.steps.map((step, index) => ({
          category: step.category,
          commands: step.commands,
          confidenceLevel: step.confidenceLevel,
          description: step.description,
          displayOrder: index,
          estimatedDuration: step.estimatedDuration,
          planGenerationId: generation.id,
          stepNumber: step.stepNumber,
          title: step.title,
          validationCommands: step.validationCommands,
        }));

        await FeaturePlannerQuery.batchCreatePlanStepsAsync(stepRecords, context);
      }

      return updatedGeneration;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { planId, settings },
        facade: facadeName,
        method: 'runPlanGenerationAsync',
        operation: OPERATIONS.FEATURE_PLANNER.RUN_PLAN_GENERATION,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Select a refinement and update plan
   */
  static async selectRefinementAsync(
    planId: string,
    refinementId: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
    refinedRequest?: string,
  ): Promise<FeaturePlan | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      // if the refinedRequest is not provided, get it from the database
      let finalRefinedRequest = refinedRequest;
      if (!finalRefinedRequest) {
        const refinements = await FeaturePlannerQuery.getRefinementsByPlanAsync(planId, context);
        const selectedRefinement = refinements.find((r) => r.id === refinementId);

        if (!selectedRefinement) {
          throw new Error('Refinement not found');
        }

        finalRefinedRequest = selectedRefinement.refinedRequest || undefined;
      }

      // update plan with selected refinement
      return await FeaturePlannerQuery.updatePlanAsync(
        planId,
        {
          refinedRequest: finalRefinedRequest,
          selectedRefinementId: refinementId,
        },
        userId,
        context,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { planId, refinedRequest, refinementId },
        facade: facadeName,
        method: 'selectRefinementAsync',
        operation: OPERATIONS.FEATURE_PLANNER.SELECT_REFINEMENT,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Update a plan step
   */
  static async updatePlanStepAsync(
    stepId: string,
    updates: {
      category?: null | string;
      commands?: Array<string>;
      confidenceLevel?: null | string;
      description?: string;
      displayOrder?: number;
      estimatedDuration?: null | string;
      stepNumber?: number;
      title?: string;
      validationCommands?: Array<string>;
    },
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | PlanStep> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.updatePlanStepAsync(stepId, updates, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { stepId, updates },
        facade: facadeName,
        method: 'updatePlanStepAsync',
        operation: OPERATIONS.FEATURE_PLANNER.UPDATE_PLAN_STEP,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Update a refinement agent
   */
  static async updateRefinementAgentAsync(
    agentId: string,
    updates: Partial<NewRefinementAgent>,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<DbRefinementAgent | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      return await FeaturePlannerQuery.updateAgentAsync(agentId, updates, context);
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { agentId, updates },
        facade: facadeName,
        method: 'updateRefinementAgentAsync',
        operation: OPERATIONS.FEATURE_PLANNER.UPDATE_PLAN_STEP,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

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
    agent?: RefinementAgent,
  ): Promise<FeatureRefinement | null> {
    const context = createUserQueryContext(userId, { dbInstance });

    try {
      // Create refinement record
      const refinement = await FeaturePlannerQuery.createRefinementAsync(
        {
          agentId,
          inputRequest: originalRequest,
          planId,
          status: 'processing',
        },
        context,
      );

      if (!refinement) {
        throw new Error('Failed to create refinement record');
      }

      // Execute agent (with specialized agent config if provided)
      const result = await FeaturePlannerService.executeRefinementAgent(
        originalRequest,
        {
          customModel: settings.customModel,
          includeProjectContext: settings.includeProjectContext,
          maxOutputLength: settings.maxOutputLength,
          minOutputLength: settings.minOutputLength,
        },
        agent,
      );

      // Extract refined text and metadata (supports both string and structured output)
      let refinedText: string;
      let structuredData: {
        agentName?: string;
        agentRole?: string;
        assumptions?: Array<string>;
        confidence?: 'high' | 'low' | 'medium';
        estimatedScope?: 'large' | 'medium' | 'small';
        focus?: string;
        keyRequirements?: Array<string>;
        risks?: Array<string>;
        technicalComplexity?: 'high' | 'low' | 'medium';
      } = {};

      if (typeof result.result === 'string') {
        refinedText = result.result;
      } else {
        // Structured output from specialized agent
        refinedText = result.result.refinedRequest;
        if (agent) {
          structuredData = {
            agentName: agent.name,
            agentRole: agent.role,
            assumptions: result.result.assumptions,
            confidence: result.result.confidence,
            estimatedScope: result.result.estimatedScope,
            focus: result.result.focus,
            keyRequirements: result.result.keyRequirements,
            risks: result.result.risks,
            technicalComplexity: result.result.technicalComplexity,
          };
        }
      }

      // Build update data with all fields
      const updateData: Parameters<typeof FeaturePlannerQuery.updateRefinementAsync>[1] = {
        characterCount: refinedText.length,
        completedAt: new Date(),
        completionTokens: result.tokenUsage.completionTokens,
        executionTimeMs: result.executionTimeMs,
        promptTokens: result.tokenUsage.promptTokens,
        refinedRequest: refinedText,
        retryCount: result.retryCount,
        status: 'completed',
        totalTokens: result.tokenUsage.totalTokens,
        wordCount: refinedText.split(/\s+/).length,
        ...structuredData,
      };

      // Update refinement with result
      return await FeaturePlannerQuery.updateRefinementAsync(refinement.id, updateData, context);
    } catch (error) {
      // Log error but don't throw - parallel execution should continue
      console.error(`Refinement ${agentId} failed:`, error);
      return null;
    }
  }

  /**
   * Run single refinement with streaming support (internal)
   */
  private static async runSingleRefinementWithStreamingAsync(
    planId: string,
    originalRequest: string,
    agentId: string,
    settings: RefinementSettings,
    userId: string,
    dbInstance: DatabaseExecutor | undefined,
    agent: RefinementAgent | undefined,
    onPartialUpdate: (agentId: string, partialText: string) => void,
    onComplete: (agentId: string, refinement: FeatureRefinement | null) => void,
    onError: (agentId: string, error: Error) => void,
  ): Promise<FeatureRefinement | null> {
    const context = createUserQueryContext(userId, { dbInstance });

    try {
      // Create refinement record
      const refinement = await FeaturePlannerQuery.createRefinementAsync(
        {
          agentId,
          inputRequest: originalRequest,
          planId,
          status: 'processing',
        },
        context,
      );

      if (!refinement) {
        throw new Error('Failed to create refinement record');
      }

      // Track accumulated partial text for this agent
      let accumulatedText = '';

      // Execute agent with streaming callback
      const result = await FeaturePlannerService.executeRefinementAgent(
        originalRequest,
        {
          customModel: settings.customModel,
          includeProjectContext: settings.includeProjectContext,
          maxOutputLength: settings.maxOutputLength,
          minOutputLength: settings.minOutputLength,
        },
        agent,
        (partialText: string) => {
          // Accumulate text and send updates
          accumulatedText += partialText;
          onPartialUpdate(agentId, accumulatedText);
        },
      );

      // Extract refined text and metadata (supports both string and structured output)
      let refinedText: string;
      let structuredData: {
        agentName?: string;
        agentRole?: string;
        assumptions?: Array<string>;
        confidence?: 'high' | 'low' | 'medium';
        estimatedScope?: 'large' | 'medium' | 'small';
        focus?: string;
        keyRequirements?: Array<string>;
        risks?: Array<string>;
        technicalComplexity?: 'high' | 'low' | 'medium';
      } = {};

      if (typeof result.result === 'string') {
        refinedText = result.result;
      } else {
        // Structured output from specialized agent
        refinedText = result.result.refinedRequest;
        if (agent) {
          structuredData = {
            agentName: agent.name,
            agentRole: agent.role,
            assumptions: result.result.assumptions,
            confidence: result.result.confidence,
            estimatedScope: result.result.estimatedScope,
            focus: result.result.focus,
            keyRequirements: result.result.keyRequirements,
            risks: result.result.risks,
            technicalComplexity: result.result.technicalComplexity,
          };
        }
      }

      // Build update data with all fields
      const updateData: Parameters<typeof FeaturePlannerQuery.updateRefinementAsync>[1] = {
        characterCount: refinedText.length,
        completedAt: new Date(),
        completionTokens: result.tokenUsage.completionTokens,
        executionTimeMs: result.executionTimeMs,
        promptTokens: result.tokenUsage.promptTokens,
        refinedRequest: refinedText,
        retryCount: result.retryCount,
        status: 'completed',
        totalTokens: result.tokenUsage.totalTokens,
        wordCount: refinedText.split(/\s+/).length,
        ...structuredData,
      };

      // Update refinement with result
      const updatedRefinement = await FeaturePlannerQuery.updateRefinementAsync(
        refinement.id,
        updateData,
        context,
      );

      // Notify completion
      onComplete(agentId, updatedRefinement);

      return updatedRefinement;
    } catch (error) {
      // Log error and notify
      console.error(`Refinement ${agentId} failed:`, error);
      onError(agentId, error instanceof Error ? error : new Error('Refinement failed'));
      return null;
    }
  }
}

/**
 * Convert database RefinementAgent to config RefinementAgent interface
 */
function dbAgentToRefinementAgent(dbAgent: DbRefinementAgent): RefinementAgent {
  return {
    agentId: dbAgent.agentId,
    focus: dbAgent.focus,
    name: dbAgent.name,
    role: dbAgent.role,
    systemPrompt: dbAgent.systemPrompt,
    temperature: Number(dbAgent.temperature),
    tools: dbAgent.tools,
  };
}
