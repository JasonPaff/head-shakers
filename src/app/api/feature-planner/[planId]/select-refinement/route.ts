import { NextResponse } from 'next/server';

import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { selectRefinementSchema } from '@/lib/validations/feature-planner.validation';
import { getUserId } from '@/utils/user-utils';

/**
 * POST /api/feature-planner/[planId]/select-refinement
 * Select a refinement and update the plan with its refined request
 */
export async function POST(request: Request, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { planId } = await params;
    const body = (await request.json()) as { refinedRequest?: string; refinementId?: string };
    const validation = selectRefinementSchema.safeParse({
      planId,
      refinedRequest: body.refinedRequest,
      refinementId: body.refinementId,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', message: validation.error.message, success: false },
        { status: 400 },
      );
    }

    const { refinedRequest, refinementId } = validation.data;

    const plan = await FeaturePlannerFacade.selectRefinementAsync(
      planId,
      refinementId,
      userId,
      undefined,
      refinedRequest,
    );

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found or refinement failed', success: false }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Refinement selected successfully',
        plan,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Select refinement error:', error);
    return NextResponse.json({ error: 'Failed to select refinement', success: false }, { status: 500 });
  }
}
