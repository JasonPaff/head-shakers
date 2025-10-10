import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createUserQueryContext } from '@/lib/queries/base/query-context';
import { FeaturePlannerQuery } from '@/lib/queries/feature-planner/feature-planner.query';

const selectDiscoverySchema = z.object({
  discoverySessionId: z.string().uuid(),
  planId: z.string().uuid(),
});

/**
 * POST /api/feature-planner/[planId]/select-discovery
 * Select a file discovery session and update the plan
 */
export async function POST(request: Request, { params }: { params: { planId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { discoverySessionId?: string };
    const validation = selectDiscoverySchema.safeParse({
      discoverySessionId: body.discoverySessionId,
      planId: params.planId,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', message: validation.error.message },
        { status: 400 },
      );
    }

    const { discoverySessionId, planId } = validation.data;
    const context = createUserQueryContext(userId);

    // Get the discovery session to verify it exists and belongs to this plan
    const sessions = await FeaturePlannerQuery.getFileDiscoverySessionsByPlanAsync(planId, context);
    const selectedSession = sessions.find((s) => s.id === discoverySessionId);

    if (!selectedSession) {
      return NextResponse.json({ error: 'Discovery session not found' }, { status: 404 });
    }

    // Update the plan with selected discovery session
    const plan = await FeaturePlannerQuery.updatePlanAsync(
      planId,
      {
        discoveredFiles: selectedSession.discoveredFiles || [],
        selectedDiscoverySessionId: discoverySessionId,
      },
      userId,
      context,
    );

    if (!plan) {
      return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: 'Discovery session selected successfully',
        plan,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Select discovery error:', error);
    return NextResponse.json({ error: 'Failed to select discovery session' }, { status: 500 });
  }
}
