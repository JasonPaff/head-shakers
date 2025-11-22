'use client';

import { CameraIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';

import type { AdjacentBobblehead } from '@/lib/types/bobblehead-navigation.types';

import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

type BobbleheadNavigationPreviewProps = {
  bobblehead: AdjacentBobblehead;
  className?: string;
};

export const BobbleheadNavigationPreview = ({ bobblehead, className }: BobbleheadNavigationPreviewProps) => {
  // Derived variables
  const _hasPhoto = !!bobblehead.photoUrl;

  // Test IDs
  const previewTestId = generateTestId('feature', 'bobblehead-nav', 'preview');
  const imageTestId = generateTestId('feature', 'bobblehead-nav', 'preview-image');
  const nameTestId = generateTestId('feature', 'bobblehead-nav', 'preview-name');
  const placeholderTestId = generateTestId('feature', 'bobblehead-nav', 'preview-placeholder');

  return (
    <div
      className={cn('flex items-center gap-3 p-1', className)}
      data-slot={'bobblehead-navigation-preview'}
      data-testid={previewTestId}
    >
      {/* Preview Image */}
      <Conditional
        fallback={
          <div
            className={cn('flex size-16 shrink-0 items-center justify-center', 'rounded-md bg-muted')}
            data-slot={'bobblehead-navigation-preview-placeholder'}
            data-testid={placeholderTestId}
          >
            <CameraIcon aria-hidden className={'size-6 text-muted-foreground'} />
          </div>
        }
        isCondition={_hasPhoto}
      >
        <div
          className={'relative size-16 shrink-0 overflow-hidden rounded-md bg-muted'}
          data-slot={'bobblehead-navigation-preview-image'}
          data-testid={imageTestId}
        >
          <CldImage
            alt={bobblehead.name}
            className={'size-full object-cover'}
            crop={'fill'}
            format={'auto'}
            height={64}
            quality={'auto:good'}
            src={extractPublicIdFromCloudinaryUrl(bobblehead.photoUrl || '')}
            width={64}
          />
        </div>
      </Conditional>

      {/* Preview Name */}
      <p
        className={'line-clamp-2 text-sm font-medium text-foreground'}
        data-slot={'bobblehead-navigation-preview-name'}
        data-testid={nameTestId}
      >
        {bobblehead.name}
      </p>
    </div>
  );
};
