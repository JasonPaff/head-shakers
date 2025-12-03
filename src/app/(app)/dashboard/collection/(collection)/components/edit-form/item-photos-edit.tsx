'use client';

import type { RefObject } from 'react';

import { type AnyFormApi, useStore } from '@tanstack/react-form';
import { CameraIcon } from 'lucide-react';

import type { CloudinaryPhoto } from '@/types/cloudinary.types';

import { AnimatedMotivationalMessage } from '@/app/(app)/dashboard/collection/(collection)/components/add-form/animated-motivational-message';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CloudinaryPhotoUpload,
  type CloudinaryPhotoUploadRef,
} from '@/components/ui/cloudinary-photo-upload';
import { Conditional } from '@/components/ui/conditional';
import { Skeleton } from '@/components/ui/skeleton';

interface ItemPhotosEditProps {
  bobbleheadId: string;
  error: null | string;
  form: AnyFormApi;
  isLoading: boolean;
  onRetry: () => void;
  photoCount: number;
  photoUploadRef?: RefObject<CloudinaryPhotoUploadRef | null>;
}

export function ItemPhotosEdit({
  bobbleheadId,
  error,
  form,
  isLoading,
  onRetry,
  photoCount,
  photoUploadRef,
}: ItemPhotosEditProps) {
  const photos =
    useStore(form.store, (state) => (state.values as { photos?: Array<CloudinaryPhoto> }).photos) || [];

  const handlePhotosChange = (
    updatedPhotos: ((prevPhotos: Array<CloudinaryPhoto>) => Array<CloudinaryPhoto>) | Array<CloudinaryPhoto>,
  ) => {
    if (typeof updatedPhotos === 'function') {
      const currentPhotos = (form.getFieldValue('photos') as Array<CloudinaryPhoto>) || [];
      form.setFieldValue('photos', updatedPhotos(currentPhotos));
    } else {
      form.setFieldValue('photos', updatedPhotos);
    }
  };

  const getMotivationalMessage = () => {
    if (photos.length === 0) {
      return 'Add photos to make your bobblehead stand out!';
    }
    if (_isAtMaxPhotos) {
      return 'Perfect! You have all 8 photos. Drag to reorder or delete to replace.';
    }
    if (_isNearMaxPhotos) {
      return 'Almost there! Add 1 more photo to reach the maximum.';
    }
    if (photos.length >= 5) {
      return `${photos.length}/8 photos - looking great! Keep adding more.`;
    }
    return `${photos.length}/8 photos - drag to reorder or add more`;
  };

  const _shouldShowMessage = photos.length > 0;
  const _hasError = !!error;
  const _isAtMaxPhotos = photos.length >= 8;
  const _isNearMaxPhotos = photos.length === 7;

  return (
    <Card aria-labelledby={'photos-section-title'} role={'region'}>
      <CardHeader className={'relative'}>
        <div className={'flex items-center gap-3'}>
          <div className={'flex size-10 items-center justify-center rounded-xl bg-green-500 shadow-sm'}>
            <CameraIcon aria-hidden className={'size-5 text-white'} />
          </div>
          <div>
            <CardTitle className={'text-xl font-semibold text-foreground'}>Photos</CardTitle>
            <CardDescription className={'text-muted-foreground'}>
              Manage your bobblehead photos - delete, reorder, or add new ones
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className={'relative space-y-6'} role={'main'}>
        {/* Loading State */}
        <Conditional isCondition={isLoading}>
          <div className={'space-y-4'}>
            <div className={'text-sm text-muted-foreground'}>Loading {photoCount} photos...</div>
            <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Card className={'overflow-hidden'} key={index}>
                  <CardContent className={'p-4'}>
                    <div className={'space-y-3'}>
                      <Skeleton className={'aspect-square w-full rounded-lg'} />
                      <Skeleton className={'h-8 w-full'} />
                      <Skeleton className={'h-16 w-full'} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Conditional>

        {/* Error State */}
        <Conditional isCondition={_hasError}>
          <Alert variant={'error'}>
            <div className={'flex items-center justify-between'}>
              <div>
                <div className={'font-semibold'}>Failed to Load Photos</div>
                <div>{error}</div>
              </div>
              <Button onClick={onRetry} size={'sm'} type={'button'} variant={'outline'}>
                Retry
              </Button>
            </div>
          </Alert>
        </Conditional>

        {/* Photo Upload Area */}
        <Conditional isCondition={!isLoading && !_hasError}>
          <div aria-label={'Photo upload area'} className={'relative'} role={'region'}>
            <CloudinaryPhotoUpload
              bobbleheadId={bobbleheadId}
              maxPhotos={8}
              onPhotosChange={handlePhotosChange}
              photos={photos}
              ref={photoUploadRef}
            />
          </div>
        </Conditional>

        <Conditional isCondition={!isLoading && !_hasError}>
          <AnimatedMotivationalMessage
            className={'bg-green-100 dark:bg-green-900/40'}
            shouldShow={_shouldShowMessage}
          >
            <div className={'flex items-center gap-2 text-sm text-green-700 dark:text-green-300'}>
              <div className={'size-2 rounded-full bg-green-500'} />
              <span>{getMotivationalMessage()}</span>
            </div>
          </AnimatedMotivationalMessage>
        </Conditional>
      </CardContent>
    </Card>
  );
}
