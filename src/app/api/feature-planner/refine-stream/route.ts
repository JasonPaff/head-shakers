import type { FeatureRefinement } from '@/lib/db/schema/feature-planner.schema';

import { refinementSettingsSchema } from '@/lib/db/schema/feature-planner.schema';
import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { getUserId } from '@/utils/user-utils';

/**
 * SSE event types for streaming refinement
 */
type StreamEvent =
  | {
      agentId: string;
      data: FeatureRefinement;
      type: 'complete';
    }
  | {
      agentId: string;
      data: string;
      type: 'partial';
    }
  | {
      agentId: string;
      data: { error: string };
      type: 'error';
    }
  | {
      data: { planId: string; refinements: Array<FeatureRefinement> };
      type: 'done';
    };

/**
 * POST /api/feature-planner/refine-stream
 * Run parallel feature refinement with real-time streaming updates
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const body = (await request.json()) as {
      featureRequest: string;
      planId?: string;
      settings: unknown;
    };

    const { featureRequest, planId, settings } = body;

    if (!featureRequest?.trim()) {
      return new Response(JSON.stringify({ error: 'Feature request is required' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Validate settings
    const validatedSettings = refinementSettingsSchema.parse(settings);

    // Create or get plan ID
    let currentPlanId = planId;
    if (!currentPlanId) {
      const plan = await FeaturePlannerFacade.createFeaturePlanAsync(featureRequest, userId);
      if (!plan) {
        return new Response(JSON.stringify({ error: 'Failed to create feature plan' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      currentPlanId = plan.id;
    }

    // Set up SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: StreamEvent) => {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        };

        try {
          // Run parallel refinement with streaming callbacks
          const refinements = await FeaturePlannerFacade.runParallelRefinementWithStreamingAsync(
            currentPlanId,
            userId,
            validatedSettings,
            // Streaming callback
            (agentId: string, partialText: string) => {
              sendEvent({
                agentId,
                data: partialText,
                type: 'partial',
              });
            },
            // Completion callback
            (agentId: string, refinement: FeatureRefinement | null) => {
              if (refinement) {
                sendEvent({
                  agentId,
                  data: refinement,
                  type: 'complete',
                });
              }
            },
            // Error callback
            (agentId: string, error: Error) => {
              sendEvent({
                agentId,
                data: { error: error.message },
                type: 'error',
              });
            },
          );

          // Send final done event
          sendEvent({
            data: {
              planId: currentPlanId,
              refinements,
            },
            type: 'done',
          });

          controller.close();
        } catch (error) {
          console.error('Error in streaming refinement:', error);
          sendEvent({
            agentId: 'system',
            data: {
              error: error instanceof Error ? error.message : 'Unknown error occurred',
            },
            type: 'error',
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Content-Type': 'text/event-stream',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('Error setting up streaming refinement:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to start streaming refinement',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
}
