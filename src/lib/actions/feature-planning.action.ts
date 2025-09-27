'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import path from 'path';

import type { FeaturePlanningResult, FeatureRefinementResult } from '@/lib/validations/feature-planning';

import { RefinementService } from '@/lib/agents/feature-planner';
import { FeaturePlannerAgent } from '@/lib/agents/feature-planner-agent';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import { featurePlanningInputSchema, featureRefinementInputSchema } from '@/lib/validations/feature-planning';

// define custom action names and operations
const FEATURE_PLANNING_ACTION_NAMES = {
  GENERATE_PLAN: 'feature-planning.generate-plan',
  REFINE_REQUEST: 'feature-planning.refine-request',
} as const;

const FEATURE_PLANNING_OPERATIONS = {
  GENERATE_PLAN: 'generate_feature_plan',
  REFINE_REQUEST: 'refine_feature_request',
} as const;

const FEATURE_PLANNING_ERROR_CODES = {
  GENERATION_FAILED: 'FEATURE_PLANNING_GENERATION_FAILED',
  REFINEMENT_FAILED: 'FEATURE_PLANNING_REFINEMENT_FAILED',
} as const;

const FEATURE_PLANNING_ERROR_MESSAGES = {
  GENERATION_FAILED: 'Failed to generate feature implementation plan',
  REFINEMENT_FAILED: 'Failed to refine feature request',
} as const;

export const generateFeaturePlanAction = authActionClient
  .metadata({
    actionName: FEATURE_PLANNING_ACTION_NAMES.GENERATE_PLAN,
    isTransactionRequired: false,
  })
  .inputSchema(featurePlanningInputSchema)
  .action(async ({ ctx }) => {
    const { featureRequest, skipRefinement } = ctx.sanitizedInput as {
      featureRequest: string;
      skipRefinement?: boolean;
    };

    Sentry.setContext('feature_planning', {
      featureRequest: featureRequest,
      skipRefinement: skipRefinement,
      userId: ctx.userId,
    });

    try {
      // create an instance of the feature planner agent
      const agent = new FeaturePlannerAgent();

      // execute the planning process
      const result = await agent.plan(featureRequest, Boolean(skipRefinement));

      if (!result.isSuccessful) {
        throw new ActionError(
          ErrorType.INTERNAL,
          FEATURE_PLANNING_ERROR_CODES.GENERATION_FAILED,
          result.error || FEATURE_PLANNING_ERROR_MESSAGES.GENERATION_FAILED,
          { ctx, operation: FEATURE_PLANNING_OPERATIONS.GENERATE_PLAN },
          true, // retryable
          500,
        );
      }

      // add success breadcrumb
      Sentry.addBreadcrumb({
        category: 'feature-planning',
        data: {
          executionTime: result.executionTime,
          fileCount: result.discoveredFiles?.length,
        },
        level: 'info',
        message: 'Feature plan generated successfully',
      });

      return {
        data: result as FeaturePlanningResult,
        isSuccessful: true,
      };
    } catch (error) {
      return handleActionError(error, {
        operation: FEATURE_PLANNING_OPERATIONS.GENERATE_PLAN,
        userId: ctx.userId,
      });
    }
  });

export const refineFeatureRequestAction = authActionClient
  .metadata({
    actionName: FEATURE_PLANNING_ACTION_NAMES.REFINE_REQUEST,
    isTransactionRequired: false,
  })
  .inputSchema(featureRefinementInputSchema)
  .action(async ({ ctx }) => {
    const { featureRequest } = ctx.sanitizedInput as { featureRequest: string };

    Sentry.setContext('feature_refinement', {
      featureRequest: featureRequest,
      userId: ctx.userId,
    });

    try {
      const refinementService = new RefinementService();

      // create a temporary orchestration directory for logging
      const tempOrchestrationDir = path.join(process.cwd(), 'temp', `refinement-${Date.now()}`);

      // execute the refinement process
      const result = await refinementService.refineFeatureRequest(
        String(featureRequest),
        tempOrchestrationDir,
      );

      if (!result.isSuccessful) {
        throw new ActionError(
          ErrorType.INTERNAL,
          FEATURE_PLANNING_ERROR_CODES.REFINEMENT_FAILED,
          result.error || FEATURE_PLANNING_ERROR_MESSAGES.REFINEMENT_FAILED,
          { ctx, operation: FEATURE_PLANNING_OPERATIONS.REFINE_REQUEST },
          true, // retryable
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: 'feature-refinement',
        level: 'info',
        message: 'Feature request refined successfully',
      });

      // validate and safely convert the result
      const refinedRequest = typeof result.data === 'string' ? result.data : undefined;
      if (!refinedRequest) {
        throw new ActionError(
          ErrorType.INTERNAL,
          FEATURE_PLANNING_ERROR_CODES.REFINEMENT_FAILED,
          'Refinement result is not a valid string',
          { ctx, operation: FEATURE_PLANNING_OPERATIONS.REFINE_REQUEST },
          true,
          500,
        );
      }

      return {
        data: {
          isSuccessful: true,
          refinedRequest,
        } as FeatureRefinementResult,
        isSuccessful: true,
      };
    } catch (error) {
      return handleActionError(error, {
        operation: FEATURE_PLANNING_OPERATIONS.REFINE_REQUEST,
        userId: ctx.userId,
      });
    }
  });
