import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { createServiceError } from '@/lib/utils/error-builders';

/**
 * GET /api/feature-planner/list
 * List all feature plans for the authenticated user
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          success: false,
        },
        { status: 401 },
      );
    }

    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const plans = await FeaturePlannerFacade.getUserFeaturePlansAsync(userId, { limit, offset });

    return NextResponse.json(
      {
        data: plans,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error listing feature plans:', error);

    const context: ServiceErrorContext = {
      endpoint: '/api/feature-planner/list',
      isRetryable: true,
      method: 'GET',
      operation: 'list-feature-plans',
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
