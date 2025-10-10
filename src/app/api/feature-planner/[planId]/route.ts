import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { createServiceError } from '@/lib/utils/error-builders';

/**
 * DELETE /api/feature-planner/[planId]
 * Delete a feature plan
 */
export async function DELETE(_request: Request, { params }: { params: { planId: string } }) {
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

    const { planId } = params;

    if (!planId) {
      return NextResponse.json(
        {
          error: 'Plan ID is required',
          success: false,
        },
        { status: 400 },
      );
    }

    const deletedPlan = await FeaturePlannerFacade.deleteFeaturePlanAsync(planId, userId);

    if (!deletedPlan) {
      return NextResponse.json(
        {
          error: 'Feature plan not found',
          success: false,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: 'Feature plan deleted successfully',
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting feature plan:', error);

    const context: ServiceErrorContext = {
      endpoint: '/api/feature-planner/[planId]',
      isRetryable: false,
      method: 'DELETE',
      operation: 'delete-feature-plan',
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

/**
 * GET /api/feature-planner/[planId]
 * Get a feature plan by ID with all related data
 */
export async function GET(_request: Request, { params }: { params: { planId: string } }) {
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

    const { planId } = params;

    if (!planId) {
      return NextResponse.json(
        {
          error: 'Plan ID is required',
          success: false,
        },
        { status: 400 },
      );
    }

    const plan = await FeaturePlannerFacade.getFeaturePlanByIdAsync(planId, userId);

    if (!plan) {
      return NextResponse.json(
        {
          error: 'Feature plan not found',
          success: false,
        },
        { status: 404 },
      );
    }

    // Get related data
    const [refinements, discoverySessions, planGenerations] = await Promise.all([
      FeaturePlannerFacade.getRefinementsByPlanAsync(planId, userId),
      FeaturePlannerFacade.getFileDiscoverySessionsByPlanAsync(planId, userId),
      FeaturePlannerFacade.getPlanGenerationsByPlanAsync(planId, userId),
    ]);

    return NextResponse.json(
      {
        data: {
          discoverySessions,
          plan,
          planGenerations,
          refinements,
        },
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching feature plan:', error);

    const context: ServiceErrorContext = {
      endpoint: '/api/feature-planner/[planId]',
      isRetryable: true,
      method: 'GET',
      operation: 'get-feature-plan',
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
