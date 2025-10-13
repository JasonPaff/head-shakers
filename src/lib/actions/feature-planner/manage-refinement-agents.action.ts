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
  deleteRefinementAgentSchema,
  getRefinementAgentsSchema,
  refinementAgentInputSchema,
  updateRefinementAgentSchema,
} from '@/lib/validations/feature-planner.validation';

/**
 * Create a new refinement agent
 */
export const createRefinementAgentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.CREATE_REFINEMENT_AGENT,
    isTransactionRequired: false,
  })
  .inputSchema(refinementAgentInputSchema)
  .action(async ({ ctx, parsedInput }) => {
    const agentData = refinementAgentInputSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { agentData });

    try {
      // Convert temperature to string for database storage
      const agentDataForDb = {
        ...agentData,
        temperature: agentData.temperature.toString(),
      };

      const agent = await FeaturePlannerFacade.createRefinementAgentAsync(agentDataForDb, userId, ctx.db);

      if (!agent) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.FEATURE_PLANNER.AGENT_CREATE_FAILED,
          ERROR_MESSAGES.FEATURE_PLAN.AGENT_CREATE_FAILED,
          { ctx, operation: OPERATIONS.FEATURE_PLANNER.CREATE_REFINEMENT_AGENT },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { agentId: agent.agentId },
        level: SENTRY_LEVELS.INFO,
        message: `Created refinement agent: ${agent.agentId}`,
      });

      return {
        data: agent,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.CREATE_REFINEMENT_AGENT },
        operation: OPERATIONS.FEATURE_PLANNER.CREATE_REFINEMENT_AGENT,
        userId,
      });
    }
  });

/**
 * Update a refinement agent
 */
export const updateRefinementAgentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.UPDATE_REFINEMENT_AGENT,
    isTransactionRequired: false,
  })
  .inputSchema(updateRefinementAgentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { agentId, updates } = updateRefinementAgentSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { agentId, updates });

    try {
      // Convert temperature to string for database storage if provided
      const updatesForDb = {
        ...(updates.focus !== undefined && { focus: updates.focus }),
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.role !== undefined && { role: updates.role }),
        ...(updates.systemPrompt !== undefined && { systemPrompt: updates.systemPrompt }),
        ...(updates.tools !== undefined && { tools: updates.tools }),
        ...(updates.temperature !== undefined && { temperature: updates.temperature.toString() }),
      };

      const agent = await FeaturePlannerFacade.updateRefinementAgentAsync(
        agentId,
        updatesForDb,
        userId,
        ctx.db,
      );

      if (!agent) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.FEATURE_PLANNER.AGENT_NOT_FOUND,
          ERROR_MESSAGES.FEATURE_PLAN.AGENT_NOT_FOUND,
          { agentId, operation: OPERATIONS.FEATURE_PLANNER.UPDATE_REFINEMENT_AGENT },
          false,
          404,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { agentId },
        level: SENTRY_LEVELS.INFO,
        message: `Updated refinement agent: ${agentId}`,
      });

      return {
        data: agent,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.UPDATE_REFINEMENT_AGENT },
        operation: OPERATIONS.FEATURE_PLANNER.UPDATE_REFINEMENT_AGENT,
        userId,
      });
    }
  });

/**
 * Delete a refinement agent (soft delete - marks as inactive)
 */
export const deleteRefinementAgentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.DELETE_REFINEMENT_AGENT,
    isTransactionRequired: false,
  })
  .inputSchema(deleteRefinementAgentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { agentId } = deleteRefinementAgentSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { agentId });

    try {
      const deletedAgent = await FeaturePlannerFacade.deleteRefinementAgentAsync(agentId, userId, ctx.db);

      if (!deletedAgent) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.FEATURE_PLANNER.AGENT_NOT_FOUND,
          ERROR_MESSAGES.FEATURE_PLAN.AGENT_NOT_FOUND,
          { agentId, operation: OPERATIONS.FEATURE_PLANNER.DELETE_REFINEMENT_AGENT },
          false,
          404,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { agentId },
        level: SENTRY_LEVELS.INFO,
        message: `Deleted refinement agent: ${agentId}`,
      });

      return {
        data: null,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.DELETE_REFINEMENT_AGENT },
        operation: OPERATIONS.FEATURE_PLANNER.DELETE_REFINEMENT_AGENT,
        userId,
      });
    }
  });

/**
 * Get all available refinement agents
 */
export const getRefinementAgentsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.GET_REFINEMENT_AGENTS,
  })
  .inputSchema(getRefinementAgentsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const userId = ctx.userId;

    try {
      const agents = await FeaturePlannerFacade.getAvailableAgentsAsync(userId, ctx.db);

      return {
        data: agents,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.GET_REFINEMENT_AGENTS },
        operation: OPERATIONS.FEATURE_PLANNER.GET_REFINEMENT_AGENTS,
        userId,
      });
    }
  });
