'use server';

import 'server-only';
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
import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import {
  createFeaturePlanSchema,
  createPlanStepSchema,
  deleteFeaturePlanSchema,
  deletePlanStepSchema,
  getFeaturePlanSchema,
  listFeaturePlansSchema,
  reorderPlanStepsSchema,
  runFileDiscoverySchema,
  runPlanGenerationSchema,
  runRefinementSchema,
  selectRefinementSchema,
  updatePlanStepSchema,
} from '@/lib/validations/feature-planner.validation';

/**
 * Create a new feature plan
 */
export const createFeaturePlanAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.CREATE,
    isTransactionRequired: false,
  })
  .inputSchema(createFeaturePlanSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { originalRequest } = createFeaturePlanSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { originalRequest });

    try {
      const plan = await FeaturePlannerFacade.createFeaturePlanAsync(originalRequest, userId, ctx.db);

      if (!plan) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.FEATURE_PLANNER.CREATE_FAILED,
          ERROR_MESSAGES.FEATURE_PLAN.CREATE_FAILED,
          { ctx, operation: OPERATIONS.FEATURE_PLANNER.CREATE_PLAN },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { planId: plan.id },
        level: SENTRY_LEVELS.INFO,
        message: `Created feature plan: ${plan.id}`,
      });

      return {
        data: plan,
        success: true,
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

/**
 * Get a feature plan by ID
 */
export const getFeaturePlanByIdAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.GET_BY_ID,
  })
  .inputSchema(getFeaturePlanSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { planId } = getFeaturePlanSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    try {
      const plan = await FeaturePlannerFacade.getFeaturePlanByIdAsync(planId, userId, ctx.db);

      if (!plan) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.FEATURE_PLANNER.NOT_FOUND,
          ERROR_MESSAGES.FEATURE_PLAN.NOT_FOUND,
          { operation: OPERATIONS.FEATURE_PLANNER.GET_PLAN, planId },
          false,
          404,
        );
      }

      return {
        data: plan,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.GET_BY_ID },
        operation: OPERATIONS.FEATURE_PLANNER.GET_PLAN,
        userId,
      });
    }
  });

/**
 * Get user's feature plans
 */
export const getUserFeaturePlansAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.GET_USER_PLANS,
  })
  .inputSchema(listFeaturePlansSchema)
  .action(async ({ ctx, parsedInput }) => {
    const options = listFeaturePlansSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    try {
      const plans = await FeaturePlannerFacade.getUserFeaturePlansAsync(userId, options, ctx.db);

      return {
        data: plans,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.GET_USER_PLANS },
        operation: OPERATIONS.FEATURE_PLANNER.LIST_PLANS,
        userId,
      });
    }
  });

/**
 * Delete feature plan
 */
export const deleteFeaturePlanAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.DELETE,
    isTransactionRequired: false,
  })
  .inputSchema(deleteFeaturePlanSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { planId } = deleteFeaturePlanSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { planId });

    try {
      const deletedPlan = await FeaturePlannerFacade.deleteFeaturePlanAsync(planId, userId, ctx.db);

      if (!deletedPlan) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.FEATURE_PLANNER.NOT_FOUND,
          ERROR_MESSAGES.FEATURE_PLAN.NOT_FOUND,
          { operation: OPERATIONS.FEATURE_PLANNER.DELETE_PLAN, planId },
          false,
          404,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { planId },
        level: SENTRY_LEVELS.INFO,
        message: `Deleted feature plan: ${planId}`,
      });

      return {
        data: null,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.DELETE },
        operation: OPERATIONS.FEATURE_PLANNER.DELETE_PLAN,
        userId,
      });
    }
  });

/**
 * Run feature refinement (single or parallel)
 */
export const runRefinementAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.RUN_REFINEMENT,
    isTransactionRequired: false,
  })
  .inputSchema(runRefinementSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { planId, settings } = runRefinementSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { planId, settings });

    try {
      const refinements = await FeaturePlannerFacade.runParallelRefinementAsync(
        planId,
        userId,
        settings,
        ctx.db,
      );

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { count: refinements.length, planId },
        level: SENTRY_LEVELS.INFO,
        message: `Completed ${refinements.length} refinements for plan ${planId}`,
      });

      return {
        data: refinements,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.RUN_REFINEMENT },
        operation: OPERATIONS.FEATURE_PLANNER.RUN_REFINEMENT,
        userId,
      });
    }
  });

/**
 * Select a refinement for the plan
 */
export const selectRefinementAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.SELECT_REFINEMENT,
    isTransactionRequired: false,
  })
  .inputSchema(selectRefinementSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { planId, refinementId } = selectRefinementSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { planId, refinementId });

    try {
      const updatedPlan = await FeaturePlannerFacade.selectRefinementAsync(
        planId,
        refinementId,
        userId,
        ctx.db,
        undefined,
      );

      if (!updatedPlan) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.FEATURE_PLANNER.NOT_FOUND,
          ERROR_MESSAGES.FEATURE_PLAN.NOT_FOUND,
          { operation: OPERATIONS.FEATURE_PLANNER.SELECT_REFINEMENT, planId },
          false,
          404,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { planId, refinementId },
        level: SENTRY_LEVELS.INFO,
        message: `Selected refinement ${refinementId} for plan ${planId}`,
      });

      return {
        data: updatedPlan,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.SELECT_REFINEMENT },
        operation: OPERATIONS.FEATURE_PLANNER.SELECT_REFINEMENT,
        userId,
      });
    }
  });

/**
 * Run file discovery
 */
export const runFileDiscoveryAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.RUN_FILE_DISCOVERY,
    isTransactionRequired: false,
  })
  .inputSchema(runFileDiscoverySchema)
  .action(async ({ ctx, parsedInput }) => {
    const { customModel, planId } = runFileDiscoverySchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { customModel, planId });

    try {
      const session = await FeaturePlannerFacade.runFileDiscoveryAsync(
        planId,
        userId,
        { customModel },
        ctx.db,
      );

      if (!session) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.FEATURE_PLANNER.DISCOVERY_FAILED,
          ERROR_MESSAGES.FEATURE_PLAN.DISCOVERY_FAILED,
          { ctx, operation: OPERATIONS.FEATURE_PLANNER.RUN_FILE_DISCOVERY, planId },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { planId, sessionId: session.id, totalFiles: session.totalFilesFound },
        level: SENTRY_LEVELS.INFO,
        message: `Completed file discovery for plan ${planId}: ${session.totalFilesFound} files found`,
      });

      return {
        data: session,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.RUN_FILE_DISCOVERY },
        operation: OPERATIONS.FEATURE_PLANNER.RUN_FILE_DISCOVERY,
        userId,
      });
    }
  });

/**
 * Run implementation plan generation
 */
export const runPlanGenerationAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.RUN_PLAN_GENERATION,
    isTransactionRequired: false,
  })
  .inputSchema(runPlanGenerationSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { customModel, planId } = runPlanGenerationSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { customModel, planId });

    try {
      const generation = await FeaturePlannerFacade.runPlanGenerationAsync(
        planId,
        userId,
        { customModel },
        ctx.db,
      );

      if (!generation) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.FEATURE_PLANNER.PLANNING_FAILED,
          ERROR_MESSAGES.FEATURE_PLAN.PLANNING_FAILED,
          { ctx, operation: OPERATIONS.FEATURE_PLANNER.RUN_PLAN_GENERATION, planId },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { complexity: generation.complexity, generationId: generation.id, planId },
        level: SENTRY_LEVELS.INFO,
        message: `Completed plan generation for plan ${planId}`,
      });

      return {
        data: generation,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.RUN_PLAN_GENERATION },
        operation: OPERATIONS.FEATURE_PLANNER.RUN_PLAN_GENERATION,
        userId,
      });
    }
  });

/**
 * Get refinements for a plan
 */
export const getRefinementsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.GET_REFINEMENTS,
  })
  .inputSchema(getFeaturePlanSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { planId } = getFeaturePlanSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    try {
      const refinements = await FeaturePlannerFacade.getRefinementsByPlanAsync(planId, userId, ctx.db);

      return {
        data: refinements,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.GET_REFINEMENTS },
        operation: OPERATIONS.FEATURE_PLANNER.GET_REFINEMENTS,
        userId,
      });
    }
  });

/**
 * Get file discovery sessions for a plan
 */
export const getFileDiscoverySessionsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.GET_FILE_DISCOVERY_SESSIONS,
  })
  .inputSchema(getFeaturePlanSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { planId } = getFeaturePlanSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    try {
      const sessions = await FeaturePlannerFacade.getFileDiscoverySessionsByPlanAsync(planId, userId, ctx.db);

      return {
        data: sessions,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.GET_FILE_DISCOVERY_SESSIONS },
        operation: OPERATIONS.FEATURE_PLANNER.GET_DISCOVERED_FILES,
        userId,
      });
    }
  });

/**
 * Get plan generations for a plan
 */
export const getPlanGenerationsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.GET_PLAN_GENERATIONS,
  })
  .inputSchema(getFeaturePlanSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { planId } = getFeaturePlanSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    try {
      const generations = await FeaturePlannerFacade.getPlanGenerationsByPlanAsync(planId, userId, ctx.db);

      return {
        data: generations,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.GET_PLAN_GENERATIONS },
        operation: OPERATIONS.FEATURE_PLANNER.GET_PLAN_GENERATIONS,
        userId,
      });
    }
  });

// ============================================================================
// PLAN STEP CRUD OPERATIONS
// ============================================================================

/**
 * Create a new plan step
 */
export const createPlanStepAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.CREATE_PLAN_STEP,
    isTransactionRequired: false,
  })
  .inputSchema(createPlanStepSchema)
  .action(async ({ ctx, parsedInput }) => {
    const stepData = createPlanStepSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { stepData });

    try {
      const step = await FeaturePlannerFacade.createPlanStepAsync(stepData, userId, ctx.db);

      if (!step) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.FEATURE_PLANNER.CREATE_STEP_FAILED,
          ERROR_MESSAGES.FEATURE_PLAN.CREATE_STEP_FAILED,
          { ctx, operation: OPERATIONS.FEATURE_PLANNER.CREATE_PLAN_STEP },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { stepId: step.id },
        level: SENTRY_LEVELS.INFO,
        message: `Created plan step: ${step.id}`,
      });

      return {
        data: step,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.CREATE_PLAN_STEP },
        operation: OPERATIONS.FEATURE_PLANNER.CREATE_PLAN_STEP,
        userId,
      });
    }
  });

/**
 * Update a plan step
 */
export const updatePlanStepAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.UPDATE_PLAN_STEP,
    isTransactionRequired: false,
  })
  .inputSchema(updatePlanStepSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { stepId, ...updates } = updatePlanStepSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { stepId, updates });

    try {
      const step = await FeaturePlannerFacade.updatePlanStepAsync(stepId, updates, userId, ctx.db);

      if (!step) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.FEATURE_PLANNER.STEP_NOT_FOUND,
          ERROR_MESSAGES.FEATURE_PLAN.STEP_NOT_FOUND,
          { operation: OPERATIONS.FEATURE_PLANNER.UPDATE_PLAN_STEP, stepId },
          false,
          404,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { stepId },
        level: SENTRY_LEVELS.INFO,
        message: `Updated plan step: ${stepId}`,
      });

      return {
        data: step,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.UPDATE_PLAN_STEP },
        operation: OPERATIONS.FEATURE_PLANNER.UPDATE_PLAN_STEP,
        userId,
      });
    }
  });

/**
 * Delete a plan step
 */
export const deletePlanStepAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.DELETE_PLAN_STEP,
    isTransactionRequired: false,
  })
  .inputSchema(deletePlanStepSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { stepId } = deletePlanStepSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { stepId });

    try {
      const deletedStep = await FeaturePlannerFacade.deletePlanStepAsync(stepId, userId, ctx.db);

      if (!deletedStep) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.FEATURE_PLANNER.STEP_NOT_FOUND,
          ERROR_MESSAGES.FEATURE_PLAN.STEP_NOT_FOUND,
          { operation: OPERATIONS.FEATURE_PLANNER.DELETE_PLAN_STEP, stepId },
          false,
          404,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { stepId },
        level: SENTRY_LEVELS.INFO,
        message: `Deleted plan step: ${stepId}`,
      });

      return {
        data: null,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.DELETE_PLAN_STEP },
        operation: OPERATIONS.FEATURE_PLANNER.DELETE_PLAN_STEP,
        userId,
      });
    }
  });

/**
 * Reorder plan steps
 */
export const reorderPlanStepsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.REORDER_PLAN_STEPS,
    isTransactionRequired: false,
  })
  .inputSchema(reorderPlanStepsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { updates } = reorderPlanStepsSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { stepCount: updates.length });

    try {
      await FeaturePlannerFacade.reorderPlanStepsAsync(updates, userId, ctx.db);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { stepCount: updates.length },
        level: SENTRY_LEVELS.INFO,
        message: `Reordered ${updates.length} plan steps`,
      });

      return {
        data: null,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.REORDER_PLAN_STEPS },
        operation: OPERATIONS.FEATURE_PLANNER.REORDER_PLAN_STEPS,
        userId,
      });
    }
  });
