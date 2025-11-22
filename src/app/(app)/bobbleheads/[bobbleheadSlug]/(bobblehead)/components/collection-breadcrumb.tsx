'use client';

import { ChevronRightIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { generateTestId } from '@/lib/test-ids';

type CollectionBreadcrumbProps = {
  collectionName: null | string;
  collectionSlug: null | string;
  /** Maximum characters before truncation on desktop (default: 25) */
  maxLength?: number;
  /** Maximum characters for mobile truncation (default: 15) */
  maxLengthMobile?: number;
  subcollectionName?: null | string;
  subcollectionSlug?: null | string;
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
 * Shows: Collection > Subcollection with links and proper truncation.
 * On mobile: Shows only collection name (with full path tooltip if subcollection exists)
 */
export const CollectionBreadcrumb = ({
  collectionName,
  collectionSlug,
  maxLength = 25,
  maxLengthMobile = 15,
  subcollectionName,
  subcollectionSlug,
}: CollectionBreadcrumbProps) => {
  // Don't render if no collection data
  if (!collectionSlug || !collectionName) {
    return null;
  }

  const _hasSubcollection = !!subcollectionSlug && !!subcollectionName;

  // Test IDs
  const breadcrumbTestId = generateTestId('feature', 'breadcrumb', 'collection');
  const collectionLinkTestId = generateTestId('feature', 'breadcrumb', 'collection-link');
  const subcollectionLinkTestId = generateTestId('feature', 'breadcrumb', 'subcollection-link');

  // Calculate truncation for desktop and mobile
  const collectionTruncated = truncateName(collectionName, maxLength);
  const collectionTruncatedMobile = truncateName(collectionName, maxLengthMobile);
  const subcollectionTruncated = subcollectionName ? truncateName(subcollectionName, maxLength) : null;

  // Full path for mobile tooltip when subcollection exists
  const fullPath = _hasSubcollection ? `${collectionName} > ${subcollectionName}` : collectionName;

  // Determine if mobile view needs tooltip (for truncated text or hidden subcollection)
  const _needsMobileTooltip = _hasSubcollection || collectionTruncatedMobile.isTruncated;

  // Determine mobile link target
  const _shouldLinkToSubcollection = _hasSubcollection && !!subcollectionSlug;
  const mobileLinkHref = _shouldLinkToSubcollection
    ? $path({
        route: '/collections/[collectionSlug]/subcollection/[subcollectionSlug]',
        routeParams: {
          collectionSlug,
          subcollectionSlug: subcollectionSlug,
        },
      })
    : $path({
        route: '/collections/[collectionSlug]',
        routeParams: { collectionSlug },
      });

  // Mobile collection link - navigates to subcollection if present, otherwise collection
  const mobileLink = (
    <Link
      aria-label={`Go to ${_hasSubcollection ? 'subcollection' : 'collection'}: ${_hasSubcollection ? subcollectionName : collectionName}`}
      className={linkClassName}
      href={mobileLinkHref}
    >
      {/* Show collection name, truncated for mobile */}
      {collectionTruncatedMobile.displayName}
      {_hasSubcollection && <span className={'ml-1 text-muted-foreground/60'}>...</span>}
    </Link>
  );

  // Desktop collection link
  const collectionLink = (
    <Link
      aria-label={`Go to collection: ${collectionName}`}
      className={linkClassName}
      data-testid={collectionLinkTestId}
      href={$path({
        route: '/collections/[collectionSlug]',
        routeParams: { collectionSlug },
      })}
    >
      {collectionTruncated.displayName}
    </Link>
  );

  // Subcollection link element (if exists)
  const subcollectionLink =
    _hasSubcollection && subcollectionTruncated ?
      <Link
        aria-label={`Go to subcollection: ${subcollectionName}`}
        className={linkClassName}
        data-testid={subcollectionLinkTestId}
        href={$path({
          route: '/collections/[collectionSlug]/subcollection/[subcollectionSlug]',
          routeParams: {
            collectionSlug,
            subcollectionSlug: subcollectionSlug,
          },
        })}
      >
        {subcollectionTruncated.displayName}
      </Link>
    : null;

  return (
    <nav
      aria-label={"Collection breadcrumb"}
      className={'flex items-center gap-0.5 text-sm sm:gap-1.5'}
      data-slot={'collection-breadcrumb'}
      data-testid={breadcrumbTestId}
    >
      {/* Mobile: Show abbreviated path with tooltip */}
      <div className={'sm:hidden'}>
        {_needsMobileTooltip ?
          <Tooltip>
            <TooltipTrigger asChild>{mobileLink}</TooltipTrigger>
            <TooltipContent>{fullPath}</TooltipContent>
          </Tooltip>
        : mobileLink}
      </div>

      {/* Desktop: Full breadcrumb with Collection > Subcollection */}
      <div className={'hidden items-center gap-1.5 sm:flex'}>
        {/* Collection link - with tooltip if truncated */}
        {collectionTruncated.isTruncated ?
          <Tooltip>
            <TooltipTrigger asChild>{collectionLink}</TooltipTrigger>
            <TooltipContent>{collectionName}</TooltipContent>
          </Tooltip>
        : collectionLink}

        {/* Separator and subcollection - only if subcollection exists */}
        {_hasSubcollection && subcollectionLink && (
          <Fragment>
            <ChevronRightIcon aria-hidden className={'size-3.5 text-muted-foreground/60'} />
            {subcollectionTruncated?.isTruncated ?
              <Tooltip>
                <TooltipTrigger asChild>{subcollectionLink}</TooltipTrigger>
                <TooltipContent>{subcollectionName}</TooltipContent>
              </Tooltip>
            : subcollectionLink}
          </Fragment>
        )}
      </div>
    </nav>
  );
};
