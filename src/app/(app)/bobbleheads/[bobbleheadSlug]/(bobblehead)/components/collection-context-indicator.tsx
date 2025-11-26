'use client';

import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useMemo } from 'react';

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
 * Displays the collection context for bobblehead navigation.
 * Shows a badge with the collection name, truncating long names with a tooltip.
 * The badge is a link to the collection page.
 */
export const CollectionContextIndicator = ({ context, maxLength = 25 }: CollectionContextIndicatorProps) => {
  const { contextName, contextSlug } = context;
  const _isTruncated = contextName.length > maxLength;
  const displayName = _isTruncated ? `${contextName.slice(0, maxLength)}...` : contextName;
  const fullLabel = `Navigating: ${contextName}`;

  // Build the URL for the collection
  const contextUrl = useMemo(() => {
    return $path({
      route: '/collections/[collectionSlug]',
      routeParams: { collectionSlug: contextSlug },
    });
  }, [contextSlug]);

  // Test IDs - using bobblehead-nav namespace for consistency with navigation components
  const indicatorTestId = generateTestId('feature', 'bobblehead-nav', 'context');
  const badgeTestId = generateTestId('feature', 'bobblehead-nav', 'context-badge');
  const tooltipTestId = generateTestId('feature', 'bobblehead-nav', 'context-tooltip');

  const badgeContent = (
    <Link
      aria-label={`Go to Collection: ${contextName}`}
      className={'transition-opacity hover:opacity-80'}
      href={contextUrl}
    >
      <Badge
        className={'max-w-48 cursor-pointer sm:max-w-64'}
        data-slot={'collection-context-indicator-badge'}
        testId={badgeTestId}
        variant={'secondary'}
      >
        <span className={'hidden sm:inline'}>Navigating:</span>
        <span className={'truncate'}>{displayName}</span>
      </Badge>
    </Link>
  );

  // Wrap in tooltip if truncated to show full name on hover
  if (_isTruncated) {
    return (
      <div
        aria-label={`Navigating within Collection: ${contextName}`}
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
      aria-label={`Navigating within Collection: ${contextName}`}
      data-slot={'collection-context-indicator'}
      data-testid={indicatorTestId}
    >
      {badgeContent}
    </div>
  );
};
