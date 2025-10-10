import { NextResponse } from 'next/server';

import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { createServiceError } from '@/lib/utils/error-builders';
import { getUserId } from '@/utils/user-utils';

/**
 * POST /api/feature-planner/plan
 * Generate implementation plan for a feature
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          success: false,
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      customModel?: string;
      planId: string;
    };

    const { customModel, planId } = body;

    if (!planId?.trim()) {
      return NextResponse.json(
        {
          error: 'Plan ID is required',
          success: false,
        },
        { status: 400 },
      );
    }

    const generation = await FeaturePlannerFacade.runPlanGenerationAsync(planId, userId, { customModel });

    if (!generation) {
      return NextResponse.json(
        {
          error: 'Failed to generate implementation plan',
          success: false,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        data: generation,
        message: 'Implementation plan generated successfully',
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error generating implementation plan:', error);

    const context: ServiceErrorContext = {
      endpoint: '/api/feature-planner/plan',
      isRetryable: true,
      method: 'POST',
      operation: 'generate-implementation-plan',
      service: 'feature-planner',
    };

    const serviceError = createServiceError(context, error);

    return NextResponse.json(
      {
        error: serviceError.message,
        success: false,
      },
      { status: 500 },
    );
  }
}
