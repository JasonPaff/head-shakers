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
  featureSuggestionAgentInputSchema,
  getFeatureSuggestionAgentSchema,
  updateFeatureSuggestionAgentSchema,
} from '@/lib/validations/feature-planner.validation';

/**
 * Get the user's feature suggestion agent
 */
export const getFeatureSuggestionAgentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.GET_SUGGESTION_AGENT,
  })
  .inputSchema(getFeatureSuggestionAgentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const userId = ctx.userId;

    try {
      const agent = await FeaturePlannerFacade.getFeatureSuggestionAgentAsync(userId, ctx.db);

      return {
        data: agent,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.GET_SUGGESTION_AGENT },
        operation: OPERATIONS.FEATURE_PLANNER.GET_SUGGESTION_AGENT,
        userId,
      });
    }
  });

/**
 * Create a new feature suggestion agent
 */
export const createFeatureSuggestionAgentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.CREATE_SUGGESTION_AGENT,
    isTransactionRequired: false,
  })
  .inputSchema(featureSuggestionAgentInputSchema)
  .action(async ({ ctx, parsedInput }) => {
    const agentData = featureSuggestionAgentInputSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURE_PLAN_DATA, { agentData });

    try {
      // Convert temperature to string for database storage
      const agentDataForDb = {
        ...agentData,
        agentType: 'feature-suggestion' as const,
        isActive: true,
        isDefault: false,
        temperature: agentData.temperature.toString(),
      };

      const agent = await FeaturePlannerFacade.createFeatureSuggestionAgentAsync(
        agentDataForDb,
        userId,
        ctx.db,
      );

      if (!agent) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.FEATURE_PLANNER.AGENT_CREATE_FAILED,
          ERROR_MESSAGES.FEATURE_PLAN.AGENT_CREATE_FAILED,
          { ctx, operation: OPERATIONS.FEATURE_PLANNER.CREATE_SUGGESTION_AGENT },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { agentId: agent.agentId },
        level: SENTRY_LEVELS.INFO,
        message: `Created feature suggestion agent: ${agent.agentId}`,
      });

      return {
        data: agent,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.CREATE_SUGGESTION_AGENT },
        operation: OPERATIONS.FEATURE_PLANNER.CREATE_SUGGESTION_AGENT,
        userId,
      });
    }
  });

/**
 * Update a feature suggestion agent
 */
export const updateFeatureSuggestionAgentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.UPDATE_SUGGESTION_AGENT,
    isTransactionRequired: false,
  })
  .inputSchema(updateFeatureSuggestionAgentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { agentId, updates } = updateFeatureSuggestionAgentSchema.parse(ctx.sanitizedInput);
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

      const agent = await FeaturePlannerFacade.updateFeatureSuggestionAgentAsync(
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
          { agentId, operation: OPERATIONS.FEATURE_PLANNER.UPDATE_SUGGESTION_AGENT },
          false,
          404,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { agentId },
        level: SENTRY_LEVELS.INFO,
        message: `Updated feature suggestion agent: ${agentId}`,
      });

      return {
        data: agent,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.FEATURE_PLANNER.UPDATE_SUGGESTION_AGENT },
        operation: OPERATIONS.FEATURE_PLANNER.UPDATE_SUGGESTION_AGENT,
        userId,
      });
    }
  });
