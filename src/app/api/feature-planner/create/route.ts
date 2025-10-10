import { NextResponse } from 'next/server';

import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { createServiceError } from '@/lib/utils/error-builders';
import { getUserId } from '@/utils/user-utils';

/**
 * POST /api/feature-planner/create
 * Create a new feature plan
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
      originalRequest: string;
    };

    const { originalRequest } = body;

    if (!originalRequest?.trim()) {
      return NextResponse.json(
        {
          error: 'Feature request is required',
          success: false,
        },
        { status: 400 },
      );
    }

    const plan = await FeaturePlannerFacade.createFeaturePlanAsync(originalRequest, userId);

    if (!plan) {
      return NextResponse.json(
        {
          error: 'Failed to create feature plan',
          success: false,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        data: plan,
        message: 'Feature plan created successfully',
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error creating feature plan:', error);

    const context: ServiceErrorContext = {
      endpoint: '/api/feature-planner/create',
      isRetryable: true,
      method: 'POST',
      operation: 'create-feature-plan',
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
