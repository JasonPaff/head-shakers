import type { ContentViewTargetType } from '@/lib/facades/analytics/view-tracking.facade';

import { ViewTrackingFacade } from '@/lib/facades/analytics/view-tracking.facade';
import { getUserIdAsync } from '@/utils/auth-utils';

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

  const currentUserId = await getUserIdAsync();

  const viewCount = await ViewTrackingFacade.getViewCountAsync(
    targetType,
    targetId,
    shouldIncludeAnonymous,
    currentUserId ?? undefined,
  );

  formattedCount = viewCount.toLocaleString();

  return <span>{isShowingLabel ? `${formattedCount} views` : formattedCount}</span>;
}
