'use client';

import { CameraIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';

import type { AdjacentBobblehead } from '@/lib/types/bobblehead-navigation.types';

import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

type BobbleheadNavigationPreviewProps = {
  bobblehead: AdjacentBobblehead;
  className?: string;
  direction: 'next' | 'previous';
  variant?: 'card' | 'compact';
};

export const BobbleheadNavigationPreview = ({
  bobblehead,
  className,
  direction,
  variant = 'card',
}: BobbleheadNavigationPreviewProps) => {
  // Derived variables
  const _hasPhoto = !!bobblehead.photoUrl;
  const _isPrevious = direction === 'previous';
  const _isCard = variant === 'card';

  // Test IDs
  const previewTestId = generateTestId('feature', 'bobblehead-nav', 'preview');
  const imageTestId = generateTestId('feature', 'bobblehead-nav', 'preview-image');
  const nameTestId = generateTestId('feature', 'bobblehead-nav', 'preview-name');
  const placeholderTestId = generateTestId('feature', 'bobblehead-nav', 'preview-placeholder');

  // Card variant - horizontal layout with image and text side-by-side
  if (_isCard) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3',
          _isPrevious ? 'flex-row' : 'flex-row-reverse',
          className,
        )}
        data-slot={'bobblehead-navigation-preview'}
        data-testid={previewTestId}
      >
        {/* Chevron Icon */}
        {_isPrevious ?
          <ChevronLeftIcon aria-hidden className={'size-5 shrink-0 text-muted-foreground'} />
        : <ChevronRightIcon aria-hidden className={'size-5 shrink-0 text-muted-foreground'} />}

        {/* Preview Image */}
        <Conditional
          fallback={
            <div
              className={'flex size-14 shrink-0 items-center justify-center rounded-md bg-muted'}
              data-slot={'bobblehead-navigation-preview-placeholder'}
              data-testid={placeholderTestId}
            >
              <CameraIcon aria-hidden className={'size-6 text-muted-foreground'} />
            </div>
          }
          isCondition={_hasPhoto}
        >
          <div
            className={'relative size-14 shrink-0 overflow-hidden rounded-md bg-muted'}
            data-slot={'bobblehead-navigation-preview-image'}
            data-testid={imageTestId}
          >
            <CldImage
              alt={bobblehead.name}
              className={'size-full object-cover'}
              crop={'fill'}
              format={'auto'}
              height={56}
              quality={'auto:good'}
              src={extractPublicIdFromCloudinaryUrl(bobblehead.photoUrl || '')}
              width={56}
            />
          </div>
        </Conditional>

        {/* Text Content */}
        <div className={cn('flex min-w-0 flex-col gap-0.5', _isPrevious ? 'items-start' : 'items-end')}>
          {/* Direction Label */}
          <span className={'text-xs font-medium text-muted-foreground'}>
            {_isPrevious ? 'Previous' : 'Next'}
          </span>
          {/* Preview Name */}
          <p
            className={cn(
              'line-clamp-2 text-sm font-medium text-foreground',
              _isPrevious ? 'text-left' : 'text-right',
            )}
            data-slot={'bobblehead-navigation-preview-name'}
            data-testid={nameTestId}
          >
            {bobblehead.name}
          </p>
        </div>
      </div>
    );
  }

  // Compact variant - horizontal inline layout with small thumbnail (for mobile)
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1.5',
        _isPrevious ? 'flex-row' : 'flex-row-reverse',
        className,
      )}
      data-slot={'bobblehead-navigation-preview'}
      data-testid={previewTestId}
    >
      {/* Chevron Icon */}
      {_isPrevious ?
        <ChevronLeftIcon aria-hidden className={'size-4 shrink-0 text-muted-foreground'} />
      : <ChevronRightIcon aria-hidden className={'size-4 shrink-0 text-muted-foreground'} />}

      {/* Preview Image */}
      <Conditional
        fallback={
          <div
            className={'flex size-8 shrink-0 items-center justify-center rounded bg-muted'}
            data-slot={'bobblehead-navigation-preview-placeholder'}
            data-testid={placeholderTestId}
          >
            <CameraIcon aria-hidden className={'size-4 text-muted-foreground'} />
          </div>
        }
        isCondition={_hasPhoto}
      >
        <div
          className={'relative size-8 shrink-0 overflow-hidden rounded bg-muted'}
          data-slot={'bobblehead-navigation-preview-image'}
          data-testid={imageTestId}
        >
          <CldImage
            alt={bobblehead.name}
            className={'size-full object-cover'}
            crop={'fill'}
            format={'auto'}
            height={32}
            quality={'auto:good'}
            src={extractPublicIdFromCloudinaryUrl(bobblehead.photoUrl || '')}
            width={32}
          />
        </div>
      </Conditional>

      {/* Preview Name */}
      <p
        className={cn(
          'line-clamp-1 text-xs font-medium text-foreground',
          _isPrevious ? 'text-left' : 'text-right',
        )}
        data-slot={'bobblehead-navigation-preview-name'}
        data-testid={nameTestId}
      >
        {bobblehead.name}
      </p>
    </div>
  );
};
