import type { NextRequest} from 'next/server';

import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs';
import { NextResponse } from 'next/server';

import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { TrendingCalculationJob } from '@/lib/jobs/trending-calculation.job';
import { ViewAggregationJob } from '@/lib/jobs/view-aggregation.job';
import { createServiceError } from '@/lib/utils/error-builders';

/**
 * QStash webhook endpoint for processing view analytics
 * Handles batch view processing and trending calculations
 */
async function handler(request: NextRequest) {
  try {
    const requestData = await request.json() as {
      jobType: 'aggregation' | 'trending';
      payload: unknown;
    };
    const { jobType, payload } = requestData;

    switch (jobType) {
      case 'aggregation': {
        const result = await ViewAggregationJob.processViewAggregation(payload);
        return NextResponse.json(
          {
            message: 'View aggregation completed successfully',
            result,
            success: true,
          },
          { status: 200 },
        );
      }

      case 'trending': {
        const result = await TrendingCalculationJob.calculateTrending(payload);
        return NextResponse.json(
          {
            message: 'Trending calculation completed successfully',
            result,
            success: true,
          },
          { status: 200 },
        );
      }

      default: {
        return NextResponse.json(
          {
            error: 'Invalid job type',
            success: false,
          },
          { status: 400 },
        );
      }
    }
  } catch (error) {
    console.error('Error processing view analytics job:', error);

    const context: ServiceErrorContext = {
      endpoint: '/api/analytics/process-views',
      isRetryable: true,
      method: 'POST',
      operation: 'process-view-analytics',
      service: 'qstash-webhook',
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

export const POST = verifySignatureAppRouter(handler);