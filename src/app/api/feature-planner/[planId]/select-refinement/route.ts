import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { selectRefinementSchema } from '@/lib/validations/feature-planner.validation';

/**
 * POST /api/feature-planner/[planId]/select-refinement
 * Select a refinement and update the plan with its refined request
 */
export async function POST(request: Request, { params }: { params: { planId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { refinementId?: string };
    const validation = selectRefinementSchema.safeParse({
      planId: params.planId,
      refinementId: body.refinementId,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', message: validation.error.message },
        { status: 400 },
      );
    }

    const { planId, refinementId } = validation.data;

    const plan = await FeaturePlannerFacade.selectRefinementAsync(planId, refinementId, userId);

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found or refinement failed' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Refinement selected successfully',
        plan,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Select refinement error:', error);
    return NextResponse.json({ error: 'Failed to select refinement' }, { status: 500 });
  }
}
