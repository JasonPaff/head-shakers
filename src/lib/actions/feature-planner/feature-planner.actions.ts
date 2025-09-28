'use server';

import 'server-only';

import type {
  FeatureRefinementResponse,
  ParallelRefinementResponse,
} from '@/lib/validations/feature-planner.validation';

import { ACTION_NAMES } from '@/lib/constants';
import { publicActionClient } from '@/lib/utils/next-safe-action';
import {
  featureRefinementRequestSchema,
  parallelRefinementRequestSchema,
} from '@/lib/validations/feature-planner.validation';

export const parallelRefineFeatureRequestAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.PARALLEL_REFINE_REQUEST,
  })
  .inputSchema(parallelRefinementRequestSchema)
  .action(async ({ ctx }): Promise<ParallelRefinementResponse> => {
    const { originalRequest, settings } = parallelRefinementRequestSchema.parse(ctx.sanitizedInput);
    const startTime = Date.now();

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate mock results for each agent
    const results = Array.from({ length: settings.agentCount }, (_, i) => ({
      agentId: `agent-${i + 1}-${Date.now()}`,
      executionTimeMs: Math.floor(Math.random() * 3000) + 1000,
      isSuccess: true,
      refinedRequest: `${originalRequest} (This is a placeholder refinement from agent ${i + 1}. Real backend implementation needed.)`,
      wordCount: originalRequest.split(/\s+/).length + 10,
    }));

    const executionTimeMs = Date.now() - startTime;

    return {
      executionTimeMs,
      isSuccess: true,
      results,
      settings,
      successCount: results.length,
      totalAgents: settings.agentCount,
    };
  });

export const refineFeatureRequestAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.REFINE_REQUEST,
  })
  .inputSchema(featureRefinementRequestSchema)
  .action(async ({ ctx }): Promise<FeatureRefinementResponse> => {
    const { originalRequest } = featureRefinementRequestSchema.parse(ctx.sanitizedInput);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return a simple placeholder refinement
    const refinedRequest = `${originalRequest} (This is a placeholder refinement. Real backend implementation needed.)`;

    return {
      isSuccess: true,
      refinedRequest,
      retryCount: 0,
    };
  });
