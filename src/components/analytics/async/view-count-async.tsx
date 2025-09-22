import type { ContentViewTargetType } from '@/lib/facades/analytics/view-tracking.facade';

import { ViewTrackingFacade } from '@/lib/facades/analytics/view-tracking.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

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
  try {
    const currentUserId = (await getOptionalUserId()) || undefined;

    const viewCount = await ViewTrackingFacade.getViewCountAsync(
      targetType,
      targetId,
      shouldIncludeAnonymous,
      currentUserId,
    );

    const formattedCount = viewCount.toLocaleString();
    return <span>{isShowingLabel ? `${formattedCount} views` : formattedCount}</span>;
  } catch (error) {
    console.warn('Failed to fetch view count:', error);
    return <span>{isShowingLabel ? '-- views' : '--'}</span>;
  }
}
