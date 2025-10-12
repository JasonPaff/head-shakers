import { and, eq, lt } from 'drizzle-orm';

import { db } from '@/lib/db';
import { fileDiscoverySessions, implementationPlanGenerations } from '@/lib/db/schema/feature-planner.schema';

/**
 * Clean up all stuck sessions across the feature planner
 *
 * @param threshold - Time in milliseconds after which a session is considered stuck (default: 10 minutes)
 * @returns Total number of sessions cleaned up
 */
export async function cleanupAllStuckSessions(
  threshold = 10 * 60 * 1000,
): Promise<{ fileDiscoverySessions: number; planGenerations: number; total: number }> {
  const fileDiscoveryCount = await cleanupStuckFileDiscoverySessions(threshold);
  const planGenerationCount = await cleanupStuckPlanGenerations(threshold);

  return {
    fileDiscoverySessions: fileDiscoveryCount,
    planGenerations: planGenerationCount,
    total: fileDiscoveryCount + planGenerationCount,
  };
}

/**
 * Mark sessions stuck in processing as failed
 * This should be run before new operations to ensure stuck sessions don't interfere
 *
 * @param threshold - Time in milliseconds after which a session is considered stuck (default: 10 minutes)
 * @returns Number of sessions marked as failed
 */
export async function cleanupStuckFileDiscoverySessions(threshold = 10 * 60 * 1000): Promise<number> {
  const stuckCutoff = new Date(Date.now() - threshold);

  try {
    const result = await db
      .update(fileDiscoverySessions)
      .set({
        completedAt: new Date(),
        errorMessage: 'Session timed out and was automatically marked as failed',
        status: 'failed',
      })
      .where(
        and(eq(fileDiscoverySessions.status, 'processing'), lt(fileDiscoverySessions.createdAt, stuckCutoff)),
      )
      .returning({ id: fileDiscoverySessions.id });

    return result.length;
  } catch (error) {
    console.error('Error cleaning up stuck file discovery sessions:', error);
    return 0;
  }
}

/**
 * Mark plan generations stuck in processing as failed
 *
 * @param threshold - Time in milliseconds after which a generation is considered stuck (default: 10 minutes)
 * @returns Number of generations marked as failed
 */
export async function cleanupStuckPlanGenerations(threshold = 10 * 60 * 1000): Promise<number> {
  const stuckCutoff = new Date(Date.now() - threshold);

  try {
    const result = await db
      .update(implementationPlanGenerations)
      .set({
        completedAt: new Date(),
        errorMessage: 'Generation timed out and was automatically marked as failed',
        status: 'failed',
      })
      .where(
        and(
          eq(implementationPlanGenerations.status, 'processing'),
          lt(implementationPlanGenerations.createdAt, stuckCutoff),
        ),
      )
      .returning({ id: implementationPlanGenerations.id });

    return result.length;
  } catch (error) {
    console.error('Error cleaning up stuck plan generations:', error);
    return 0;
  }
}
