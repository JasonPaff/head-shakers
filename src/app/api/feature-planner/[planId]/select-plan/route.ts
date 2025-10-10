import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { createUserQueryContext } from '@/lib/queries/base/query-context';
import { FeaturePlannerQuery } from '@/lib/queries/feature-planner/feature-planner.query';
import { selectPlanGenerationSchema } from '@/lib/validations/feature-planner.validation';

/**
 * POST /api/feature-planner/[planId]/select-plan
 * Select an implementation plan generation and update the plan
 */
export async function POST(request: Request, { params }: { params: { planId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { generationId?: string };
    const validation = selectPlanGenerationSchema.safeParse({
      generationId: body.generationId,
      planId: params.planId,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', message: validation.error.message },
        { status: 400 },
      );
    }

    const { generationId, planId } = validation.data;
    const context = createUserQueryContext(userId);

    // Get the plan generation to verify it exists and belongs to this plan
    const generations = await FeaturePlannerQuery.getPlanGenerationsByPlanAsync(planId, context);
    const selectedGeneration = generations.find((g) => g.id === generationId);

    if (!selectedGeneration) {
      return NextResponse.json({ error: 'Plan generation not found' }, { status: 404 });
    }

    // Update the plan with selected generation
    const plan = await FeaturePlannerQuery.updatePlanAsync(
      planId,
      {
        complexity: selectedGeneration.complexity ?? undefined,
        estimatedDuration: selectedGeneration.estimatedDuration ?? undefined,
        implementationPlan: selectedGeneration.implementationPlan ?? undefined,
        riskLevel: selectedGeneration.riskLevel ?? undefined,
        selectedPlanGenerationId: generationId,
      },
      userId,
      context,
    );

    if (!plan) {
      return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: 'Plan generation selected successfully',
        plan,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Select plan error:', error);
    return NextResponse.json({ error: 'Failed to select plan generation' }, { status: 500 });
  }
}
