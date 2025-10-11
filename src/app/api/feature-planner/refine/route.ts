import { NextResponse } from 'next/server';

import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { refinementSettingsSchema } from '@/lib/db/schema/feature-planner.schema';
import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { createServiceError } from '@/lib/utils/error-builders';
import { getUserId } from '@/utils/user-utils';

/**
 * POST /api/feature-planner/refine
 * Run parallel feature refinement
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          isSuccess: false,
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      featureRequest: string;
      planId?: string;
      settings: unknown;
    };

    const { featureRequest, planId, settings } = body;

    if (!featureRequest?.trim()) {
      return NextResponse.json(
        {
          error: 'Feature request is required',
          isSuccess: false,
        },
        { status: 400 },
      );
    }

    // Validate settings
    const validatedSettings = refinementSettingsSchema.parse(settings);

    // If planId is provided, use existing plan. Otherwise create new one.
    let currentPlanId = planId;

    if (!currentPlanId) {
      // Create new plan
      const plan = await FeaturePlannerFacade.createFeaturePlanAsync(featureRequest, userId);

      if (!plan) {
        return NextResponse.json(
          {
            error: 'Failed to create feature plan',
            isSuccess: false,
          },
          { status: 500 },
        );
      }

      currentPlanId = plan.id;
    }

    // Run parallel refinement
    const refinements = await FeaturePlannerFacade.runParallelRefinementAsync(
      currentPlanId,
      userId,
      validatedSettings,
    );

    return NextResponse.json(
      {
        data: {
          planId: currentPlanId,
          refinements,
        },
        isSuccess: true,
        message: `Successfully completed ${refinements.length} refinement${refinements.length > 1 ? 's' : ''}`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error running refinement:', error);

    const context: ServiceErrorContext = {
      endpoint: '/api/feature-planner/refine',
      isRetryable: true,
      method: 'POST',
      operation: 'run-refinement',
      service: 'feature-planner',
    };

    const serviceError = createServiceError(context, error);

    return NextResponse.json(
      {
        error: serviceError.message,
        isSuccess: false,
      },
      { status: 500 },
    );
  }
}
