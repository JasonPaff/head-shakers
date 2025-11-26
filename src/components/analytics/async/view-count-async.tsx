import type { ContentViewTargetType } from '@/lib/facades/analytics/view-tracking.facade';

import { ViewTrackingFacade } from '@/lib/facades/analytics/view-tracking.facade';
import { getOptionalUserIdAsync } from '@/utils/optional-auth-utils';

export interface ViewCountAsyncProps {
  isShowingLabel?: boolean;
  shouldIncludeAnonymous?: boolean;
  targetId: string;
  targetType: ContentViewTargetType;
}

/**
 * Async wrapper component for fetching real-time view counts from ViewTrackingFacade
 * Provides error boundaries and fallback for failed view count fetches
 */
export async function ViewCountAsync({
  isShowingLabel = true,
  shouldIncludeAnonymous = true,
  targetId,
  targetType,
}: ViewCountAsyncProps) {
  let formattedCount = '--';

  try {
    const currentUserId = (await getOptionalUserIdAsync()) || undefined;

    const viewCount = await ViewTrackingFacade.getViewCountAsync(
      targetType,
      targetId,
      shouldIncludeAnonymous,
      currentUserId,
    );

    formattedCount = viewCount.toLocaleString();
  } catch (error) {
    console.warn('Failed to fetch view count:', error);
  }

  return <span>{isShowingLabel ? `${formattedCount} views` : formattedCount}</span>;
}
