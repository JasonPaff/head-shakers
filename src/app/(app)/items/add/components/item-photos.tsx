/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useStore } from '@tanstack/react-form';
import { Camera } from 'lucide-react';

import type { PhotoWithMetadata } from '@/components/ui/photo-upload';

import { addItemFormOptions } from '@/app/(app)/items/add/components/add-item-form-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';
import { PhotoUpload } from '@/components/ui/photo-upload';

export const ItemPhotos = withForm({
  ...addItemFormOptions,
  render: function ({ form }) {
    const photos = useStore(form.store, (state) => state.values.photos);

    const photosWithMetadata: Array<PhotoWithMetadata> = (photos || []).map((file, index) => ({
      altText: '',
      caption: '',
      file,
      id: `temp-${index}`,
      isPrimary: index === 0,
      preview: URL.createObjectURL(file),
      sortOrder: index,
    }));

    const handlePhotosChange = (updatedPhotos: Array<PhotoWithMetadata>) => {
      const files = updatedPhotos.map((photo) => photo.file);
      form.setFieldValue('photos', files);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <Camera aria-hidden className={'size-5'} />
            Photos
          </CardTitle>
          <CardDescription>Upload photos of your bobblehead (up to 10 photos)</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <PhotoUpload onPhotosChange={handlePhotosChange} photos={photosWithMetadata} />
        </CardContent>
      </Card>
    );
  },
});
