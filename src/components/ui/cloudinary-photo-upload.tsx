/* eslint-disable react-snob/require-boolean-prefix-is */
'use client';

import type { CloudinaryUploadWidgetError, CloudinaryUploadWidgetResults } from 'next-cloudinary';

import { useAuth } from '@clerk/nextjs';
// import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { ImagePlusIcon, MoveIcon, StarIcon, StarOffIcon, XIcon } from 'lucide-react';
import { CldImage, CldUploadWidget } from 'next-cloudinary';
import { useCallback, useState } from 'react';

import type { CloudinaryPhoto, PhotoUploadState } from '@/types/cloudinary.types';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { CONFIG } from '@/lib/constants';
import { transformCloudinaryResult } from '@/types/cloudinary.types';
import { cn } from '@/utils/tailwind-utils';

interface CloudinaryPhotoUploadProps {
  isDisabled?: boolean;
  maxPhotos?: number;
  onPhotosChange: (
    photos: ((prevPhotos: Array<CloudinaryPhoto>) => Array<CloudinaryPhoto>) | Array<CloudinaryPhoto>,
  ) => void;
  photos: Array<CloudinaryPhoto>;
}

export const CloudinaryPhotoUpload = ({
  isDisabled = false,
  maxPhotos = CONFIG.CONTENT.MAX_PHOTOS_PER_BOBBLEHEAD,
  onPhotosChange,
  photos,
}: CloudinaryPhotoUploadProps) => {
  const [uploadState, setUploadState] = useState<PhotoUploadState>({
    isUploading: false,
    totalCount: 0,
    uploadedCount: 0,
  });

  const { userId } = useAuth();

  const handleSuccess = useCallback(
    (results: CloudinaryUploadWidgetResults) => {
      onPhotosChange((currentPhotos) => {
        const newPhoto = transformCloudinaryResult(results, {
          isPrimary: currentPhotos.length === 0, // the first photo is primary
          sortOrder: currentPhotos.length,
        });
        return [...currentPhotos, newPhoto];
      });

      setUploadState((prev) => ({
        ...prev,
        uploadedCount: prev.uploadedCount + 1,
      }));
    },
    [onPhotosChange],
  );

  const handleError = useCallback((error: CloudinaryUploadWidgetError) => {
    console.error('Upload error:', error);
    setUploadState((prev) => ({
      ...prev,
      error: 'Upload failed',
    }));
  }, []);

  const handleQueuesStart = useCallback((data: undefined | { files?: Array<File> }) => {
    const fileCount = data?.files?.length || 1;
    setUploadState({
      error: undefined,
      isUploading: true,
      totalCount: fileCount,
      uploadedCount: 0,
    });
  }, []);

  const handleQueuesEnd = useCallback(() => {
    setUploadState((prev) => ({
      ...prev,
      isUploading: false,
    }));
  }, []);

  const removePhoto = useCallback(
    (photoId: string) => {
      onPhotosChange((currentPhotos) => {
        const updatedPhotos = currentPhotos.filter((p) => p.id !== photoId);
        // reorder remaining photos
        const reorderedPhotos = updatedPhotos.map((photo, index) => ({
          ...photo,
          sortOrder: index,
        }));
        return reorderedPhotos;
      });
    },
    [onPhotosChange],
  );

  const updatePhoto = useCallback(
    (photoId: string, updates: Partial<CloudinaryPhoto>) => {
      onPhotosChange((currentPhotos) => {
        const updatedPhotos = currentPhotos.map((photo) =>
          photo.id === photoId ? { ...photo, ...updates } : photo,
        );
        return updatedPhotos;
      });
    },
    [onPhotosChange],
  );

  const setPrimaryPhoto = useCallback(
    (photoId: string) => {
      onPhotosChange((currentPhotos) => {
        const updatedPhotos = currentPhotos.map((photo) => ({
          ...photo,
          isPrimary: photo.id === photoId,
        }));
        return updatedPhotos;
      });
    },
    [onPhotosChange],
  );

  // TODO: replace the any type with proper type from @hello-pangea/dnd
  // const handleDragEnd = useCallback(
  //   (result: any) => {
  //     if (!result.destination) return;
  //
  //     const items = Array.from(photos);
  //     const [reorderedItem] = items.splice(result.source.index, 1);
  //     items.splice(result.destination.index, 0, reorderedItem);
  //
  //     // update sort orders
  //     const reorderedPhotos = items.map((photo, index) => ({
  //       ...photo,
  //       sortOrder: index,
  //     }));
  //
  //     onPhotosChange(reorderedPhotos);
  //   },
  //   [photos, onPhotosChange],
  // );

  const _canUploadMore = photos.length < maxPhotos && !isDisabled;
  const _hasPhotos = photos.length > 0;

  return (
    <div className={'space-y-4'}>
      {/* Upload Widget */}
      <Conditional isCondition={_canUploadMore}>
        <CldUploadWidget
          onError={handleError}
          onQueuesEnd={handleQueuesEnd}
          onQueuesStart={handleQueuesStart}
          onSuccess={handleSuccess}
          options={{
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
            context: {
              uploadedAt: new Date().toISOString(),
              userId,
            },
            cropping: false,
            croppingAspectRatio: 1,
            folder: `users/${userId}/temp`,
            maxFiles: maxPhotos - photos.length,
            maxFileSize: 10485760, // 10MB
            multiple: true,
            resourceType: 'image',
            showAdvancedOptions: false,
            showCompletedButton: true,
            showPoweredBy: false,
            showSkipCropButton: true,
            sources: ['local', 'camera', 'url'],
            tags: ['bobblehead', userId ?? 'unknown', Date.now().toString()],
          }}
          signatureEndpoint={'/api/upload/sign'}
        >
          {({ open }) => (
            <Button
              className={'h-32 w-full border-dashed'}
              disabled={isDisabled || uploadState.isUploading}
              onClick={() => open()}
              type={'button'}
              variant={'outline'}
            >
              <div className={'flex flex-col items-center gap-2'}>
                <ImagePlusIcon aria-hidden className={'size-8'} />
                <span>
                  {uploadState.isUploading ? 'Uploading...' : `Add Photos (${photos.length}/${maxPhotos})`}
                </span>
                <Conditional isCondition={uploadState.isUploading}>
                  <Progress
                    className={'w-32'}
                    value={(uploadState.uploadedCount / Math.max(uploadState.totalCount, 1)) * 100}
                  />
                </Conditional>
              </div>
            </Button>
          )}
        </CldUploadWidget>
      </Conditional>

      {/* Upload Error */}
      <Conditional isCondition={!!uploadState.error}>
        <div className={'rounded-md bg-red-50 p-3 text-sm text-destructive'}>
          Upload error: {uploadState.error}
        </div>
      </Conditional>

      {/* Photo Grid */}
      <Conditional isCondition={_hasPhotos}>
        <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
          {photos
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((photo) => (
              <Card className={'relative overflow-hidden'} key={photo.id}>
                <CardContent className={'p-4'}>
                  <div className={'space-y-3'}>
                    {/* Image Preview */}
                    <div className={'relative aspect-square overflow-hidden rounded-lg'}>
                      <CldImage
                        alt={photo.altText || 'Bobblehead photo'}
                        className={'h-full w-full object-cover'}
                        crop={'fill'}
                        format={'auto'}
                        gravity={'auto'}
                        height={400}
                        quality={'auto:good'}
                        src={photo.publicId}
                        width={400}
                      />

                      {/* Controls Overlay */}
                      <div
                        className={
                          'absolute inset-0 bg-black/50 opacity-0 transition-opacity hover:opacity-100'
                        }
                      >
                        <div className={'flex h-full w-full items-center justify-center gap-2'}>
                          <Button
                            className={'size-8 p-0'}
                            onClick={() => setPrimaryPhoto(photo.id)}
                            size={'sm'}
                            type={'button'}
                            variant={'secondary'}
                          >
                            {photo.isPrimary ?
                              <StarIcon aria-hidden className={'size-4 fill-current'} />
                            : <StarOffIcon aria-hidden className={'size-4'} />}
                          </Button>

                          {/* TODO: Add drag handle when drag-drop is implemented */}
                          <div
                            className={cn(
                              'flex size-8 cursor-move items-center justify-center',
                              'rounded bg-secondary text-secondary-foreground',
                            )}
                          >
                            <MoveIcon aria-hidden className={'size-4'} />
                          </div>

                          <Button
                            className={'size-8 p-0'}
                            onClick={() => removePhoto(photo.id)}
                            size={'sm'}
                            type={'button'}
                            variant={'destructive'}
                          >
                            <XIcon aria-hidden className={'size-4'} />
                          </Button>
                        </div>
                      </div>

                      {/* Primary Badge */}
                      <Conditional isCondition={photo.isPrimary}>
                        <div className={'absolute top-2 left-2'}>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full bg-primary',
                              'px-2 py-1 text-xs text-primary-foreground',
                            )}
                          >
                            <StarIcon aria-hidden className={'size-3 fill-current'} />
                            Primary
                          </span>
                        </div>
                      </Conditional>
                    </div>

                    {/* Photo Metadata */}
                    <div className={'space-y-2'}>
                      <div>
                        <Label className={'text-xs'} htmlFor={`alt-${photo.id}`}>
                          Alt Text
                        </Label>
                        <Input
                          className={'h-8 text-xs'}
                          id={`alt-${photo.id}`}
                          onChange={(e) => {
                            updatePhoto(photo.id, { altText: e.target.value });
                          }}
                          placeholder={'Describe this photo'}
                          type={'text'}
                          value={photo.altText || ''}
                        />
                      </div>

                      <div>
                        <Label className={'text-xs'} htmlFor={`caption-${photo.id}`}>
                          Caption
                        </Label>
                        <Textarea
                          className={'min-h-[60px] text-xs'}
                          id={`caption-${photo.id}`}
                          onChange={(e) => {
                            updatePhoto(photo.id, { caption: e.target.value });
                          }}
                          placeholder={'Add a caption...'}
                          rows={2}
                          value={photo.caption || ''}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </Conditional>

      {/* Photo Count Info */}
      <div className={'text-center text-sm text-muted-foreground'}>
        {photos.length} of {maxPhotos} photos added
      </div>
    </div>
  );
};
