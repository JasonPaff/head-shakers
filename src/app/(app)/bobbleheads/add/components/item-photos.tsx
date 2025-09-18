/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useStore } from '@tanstack/react-form';
import { CameraIcon, ImageIcon, StarIcon, UploadIcon } from 'lucide-react';

import type { CloudinaryPhoto } from '@/types/cloudinary.types';

import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { AnimatedMotivationalMessage } from '@/app/(app)/bobbleheads/add/components/animated-motivational-message';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudinaryPhotoUpload } from '@/components/ui/cloudinary-photo-upload';
import { Conditional } from '@/components/ui/conditional';
import { withForm } from '@/components/ui/form';

export const ItemPhotos = withForm({
  ...addItemFormOptions,
  render: function ({ form }) {
    const photos = (useStore(form.store, (state) => state.values.photos) as Array<CloudinaryPhoto>) || [];

    const handlePhotosChange = (
      updatedPhotos:
        | ((prevPhotos: Array<CloudinaryPhoto>) => Array<CloudinaryPhoto>)
        | Array<CloudinaryPhoto>,
    ) => {
      if (typeof updatedPhotos === 'function') {
        const currentPhotos = (form.getFieldValue('photos') as Array<CloudinaryPhoto>) || [];
        form.setFieldValue('photos', updatedPhotos(currentPhotos));
      } else {
        form.setFieldValue('photos', updatedPhotos);
      }
    };

    const shouldShowMessage = photos.length > 0;

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
                Show off your bobblehead with high-quality photos that collectors will love
              </CardDescription>
            </div>
          </div>

          {/* Photo tips */}
          <div className={'mt-2 space-y-2'}>
            <div className={'flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400'}>
              <StarIcon aria-hidden className={'size-3 fill-current'} />
              <span>Great photos increase collection engagement by 3x</span>
            </div>
            <div className={'grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-3'}>
              <div className={'flex items-center gap-1'}>
                <ImageIcon aria-hidden className={'size-3'} />
                <span>Front, back, side views</span>
              </div>
              <div className={'flex items-center gap-1'}>
                <UploadIcon aria-hidden className={'size-3'} />
                <span>Up to 8 high-res photos</span>
              </div>
              <div className={'flex items-center gap-1'}>
                <CameraIcon aria-hidden className={'size-3'} />
                <span>Good lighting preferred</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className={'relative space-y-6'} role={'main'}>
          {/* Photo Upload Area */}
          <div
            aria-describedby={'photo-upload-description'}
            aria-label={'Photo upload area'}
            className={'relative'}
            role={'region'}
          >
            <CloudinaryPhotoUpload maxPhotos={8} onPhotosChange={handlePhotosChange} photos={photos} />

            <div className={'sr-only'} id={'photo-upload-description'}>
              Upload up to 8 photos of your bobblehead. Accepted formats are JPEG, PNG, and WebP. Maximum file
              size is 10MB per photo.
            </div>
          </div>

          {/* Photo Guidelines */}
          <div className={'rounded-lg bg-green-100 p-4 dark:bg-green-900/40'}>
            <h4 className={'mb-2 font-medium text-green-800 dark:text-green-200'}>
              📸 Photo Tips for Best Results
            </h4>
            <ul className={'space-y-1 text-sm text-green-700 dark:text-green-300'}>
              <li>• Use natural lighting or a well-lit room</li>
              <li>• Include front, back, and side angles</li>
              <li>• Show any unique details or manufacturer markings</li>
              <li>• Capture the bobblehead in action if possible</li>
              <li>• Keep backgrounds simple and uncluttered</li>
            </ul>
          </div>

          {/* Progress indicator */}
          <AnimatedMotivationalMessage
            className={'bg-green-100 dark:bg-green-900/40'}
            shouldShow={shouldShowMessage}
          >
            <div className={'flex items-center gap-2 text-sm text-green-700 dark:text-green-300'}>
              <div className={'size-2 rounded-full bg-green-500'} />
              <Conditional
                fallback={`${photos.length}/8 photos uploaded - looking great!`}
                isCondition={photos.length === 0}
              >
                <span>Add photos to make your bobblehead stand out!</span>
              </Conditional>
            </div>
          </AnimatedMotivationalMessage>
        </CardContent>
      </Card>
    );
  },
});
