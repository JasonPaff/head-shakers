/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useStore } from '@tanstack/react-form';
import { CameraIcon } from 'lucide-react';

import type { CloudinaryPhoto } from '@/types/cloudinary.types';

import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudinaryPhotoUpload } from '@/components/ui/cloudinary-photo-upload';
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

    return (
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <CameraIcon aria-hidden className={'size-5'} />
            Photos
          </CardTitle>
          <CardDescription>Upload photos of your bobblehead (up to 8 photos)</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <CloudinaryPhotoUpload maxPhotos={8} onPhotosChange={handlePhotosChange} photos={photos} />
        </CardContent>
      </Card>
    );
  },
});
