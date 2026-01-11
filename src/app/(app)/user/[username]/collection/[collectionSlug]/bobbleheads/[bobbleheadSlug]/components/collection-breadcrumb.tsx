'use client';

import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { generateTestId } from '@/lib/test-ids';

type CollectionBreadcrumbProps = {
  collectionName: null | string;
  collectionSlug: string;
  /** Maximum characters before truncation on desktop (default: 25) */
  maxLength?: number;
  /** Maximum characters for mobile truncation (default: 15) */
  maxLengthMobile?: number;
  ownerUsername: string;
};

/**
 * Truncates a name if it exceeds maxLength
 */
const truncateName = (name: string, maxLength: number) => {
  if (name.length <= maxLength) {
    return { displayName: name, isTruncated: false };
  }
  return { displayName: `${name.slice(0, maxLength)}...`, isTruncated: true };
};

// Link styling - matches sticky header pattern with proper touch targets
const linkClassName =
  'min-h-[44px] min-w-[44px] inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm px-1';

/**
 * Displays collection hierarchy as navigable breadcrumbs in the header.
 * Shows: Collection with link and proper truncation.
 */
export const CollectionBreadcrumb = ({
  collectionName,
  collectionSlug,
  maxLength = 25,
  maxLengthMobile = 15,
  ownerUsername,
}: CollectionBreadcrumbProps) => {
  // Don't render if no collection data
  if (!collectionSlug || !collectionName) {
    return null;
  }

  // Test IDs
  const breadcrumbTestId = generateTestId('feature', 'breadcrumb', 'collection');
  const collectionLinkTestId = generateTestId('feature', 'breadcrumb', 'collection-link');

  // Calculate truncation for desktop and mobile
  const collectionTruncated = truncateName(collectionName, maxLength);
  const collectionTruncatedMobile = truncateName(collectionName, maxLengthMobile);

  // Determine if mobile view needs tooltip (for truncated text)
  const needsMobileTooltip = collectionTruncatedMobile.isTruncated;

  const linkHref = $path({
    route: '/user/[username]/collection/[collectionSlug]',
    routeParams: { collectionSlug, username: ownerUsername },
  });

  // Mobile collection link
  const mobileLink = (
    <Link aria-label={`Go to collection: ${collectionName}`} className={linkClassName} href={linkHref}>
      {collectionTruncatedMobile.displayName}
    </Link>
  );

  // Desktop collection link
  const collectionLink = (
    <Link
      aria-label={`Go to collection: ${collectionName}`}
      className={linkClassName}
      data-testid={collectionLinkTestId}
      href={linkHref}
    >
      {collectionTruncated.displayName}
    </Link>
  );

  return (
    <nav
      aria-label={'Collection breadcrumb'}
      className={'flex items-center gap-0.5 text-sm sm:gap-1.5'}
      data-slot={'collection-breadcrumb'}
      data-testid={breadcrumbTestId}
    >
      {/* Mobile: Show abbreviated path with tooltip */}
      <div className={'sm:hidden'}>
        {needsMobileTooltip ?
          <Tooltip>
            <TooltipTrigger asChild>{mobileLink}</TooltipTrigger>
            <TooltipContent>{collectionName}</TooltipContent>
          </Tooltip>
        : mobileLink}
      </div>

      {/* Desktop: Full breadcrumb */}
      <div className={'hidden items-center gap-1.5 sm:flex'}>
        {/* Collection link - with tooltip if truncated */}
        {collectionTruncated.isTruncated ?
          <Tooltip>
            <TooltipTrigger asChild>{collectionLink}</TooltipTrigger>
            <TooltipContent>{collectionName}</TooltipContent>
          </Tooltip>
        : collectionLink}
      </div>
    </nav>
  );
};
