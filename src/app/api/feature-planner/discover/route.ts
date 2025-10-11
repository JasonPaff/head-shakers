import { NextResponse } from 'next/server';

import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { createServiceError } from '@/lib/utils/error-builders';
import { getUserId } from '@/utils/user-utils';

export const maxDuration = 180;

/**
 * POST /api/feature-planner/discover
 * Run file discovery for a feature plan
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

    const session = await FeaturePlannerFacade.runFileDiscoveryAsync(planId, userId, { customModel });

    if (!session) {
      return NextResponse.json(
        {
          error: 'Failed to run file discovery',
          success: false,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        data: session,
        message: `File discovery completed: ${session.totalFilesFound} files found`,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error running file discovery:', error);

    const context: ServiceErrorContext = {
      endpoint: '/api/feature-planner/discover',
      isRetryable: true,
      method: 'POST',
      operation: 'run-file-discovery',
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
