'use client';

import type { NavigationContext } from '@/lib/types/bobblehead-navigation.types';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { generateTestId } from '@/lib/test-ids';

type CollectionContextIndicatorProps = {
  context: NavigationContext;
  /** Maximum characters before truncation (default: 25) */
  maxLength?: number;
};

/**
 * Displays the collection or subcollection context for bobblehead navigation.
 * Shows a badge with the context name, truncating long names with a tooltip.
 */
export const CollectionContextIndicator = ({ context, maxLength = 25 }: CollectionContextIndicatorProps) => {
  const { contextName, contextType } = context;
  const _isTruncated = contextName.length > maxLength;
  const displayName = _isTruncated ? `${contextName.slice(0, maxLength)}...` : contextName;
  const typeLabel = contextType === 'subcollection' ? 'Subcollection' : 'Collection';
  const fullLabel = `Navigating: ${contextName}`;

  // Test IDs - using bobblehead-nav namespace for consistency with navigation components
  const indicatorTestId = generateTestId('feature', 'bobblehead-nav', 'context');
  const badgeTestId = generateTestId('feature', 'bobblehead-nav', 'context-badge');
  const tooltipTestId = generateTestId('feature', 'bobblehead-nav', 'context-tooltip');

  const badgeContent = (
    <Badge
      aria-label={fullLabel}
      className={'max-w-48 sm:max-w-64'}
      data-context-type={contextType}
      data-slot={'collection-context-indicator-badge'}
      testId={badgeTestId}
      variant={'secondary'}
    >
      <span className={'hidden sm:inline'}>Navigating:</span>
      <span className={'truncate'}>{displayName}</span>
    </Badge>
  );

  // Wrap in tooltip if truncated to show full name on hover
  if (_isTruncated) {
    return (
      <div
        aria-label={`Navigating within ${typeLabel}: ${contextName}`}
        data-slot={'collection-context-indicator'}
        data-testid={indicatorTestId}
      >
        <Tooltip testId={tooltipTestId}>
          <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
          <TooltipContent>{fullLabel}</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      aria-label={`Navigating within ${typeLabel}: ${contextName}`}
      data-slot={'collection-context-indicator'}
      data-testid={indicatorTestId}
    >
      {badgeContent}
    </div>
  );
};
