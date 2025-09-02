'use client';

import type { ChangeEvent, DragEvent } from 'react';

import { Image as ImageIcon, StarIcon, StarOffIcon, UploadIcon, XIcon } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToggle } from '@/hooks/use-toggle';
import { CONFIG } from '@/lib/constants';
import { validatePhotosOnClient } from '@/lib/validations/photo-upload.validation';
import { cn } from '@/utils/tailwind-utils';

export interface PhotoWithMetadata {
  altText?: string;
  caption?: string;
  file: File;
  id: string;
  isPrimary: boolean;
  preview: string;
  sortOrder: number;
}

type PhotoUploadProps = ClassName<{
  maxFiles?: number;
  onPhotosChange: (photos: Array<PhotoWithMetadata>) => void;
  photos: Array<PhotoWithMetadata>;
}>;

export function PhotoUpload({
  className,
  maxFiles = CONFIG.CONTENT.MAX_PHOTOS_PER_BOBBLEHEAD,
  onPhotosChange,
  photos,
}: PhotoUploadProps) {
  const [isDragOver, setIsDragOver] = useToggle();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // create preview URL for a file
  const createPreview = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  // clean up preview URLs
  const cleanupPreviews = useCallback((photosToCleanup: Array<PhotoWithMetadata>) => {
    photosToCleanup.forEach((photo) => {
      if (photo.preview.startsWith('blob:')) {
        URL.revokeObjectURL(photo.preview);
      }
    });
  }, []);

  // add photos to the list
  const addPhotos = useCallback(
    (files: Array<File>) => {
      const { invalid, valid } = validatePhotosOnClient(files);

      if (invalid.length > 0) {
        invalid.forEach(({ errors, file }) => {
          toast.error(`${file.name}: ${errors.join(', ')}`);
        });
      }

      const remainingSlots = maxFiles - photos.length;
      const filesToAdd = valid.slice(0, remainingSlots);

      if (valid.length > remainingSlots) {
        toast.warning(`Only ${remainingSlots} more photos can be added`);
      }

      if (filesToAdd.length > 0) {
        const newPhotos: Array<PhotoWithMetadata> = filesToAdd.map((file, index) => ({
          altText: '',
          caption: '',
          file,
          id: `${Date.now()}-${index}`,
          isPrimary: photos.length === 0 && index === 0, // the first photo is primary by default
          preview: createPreview(file),
          sortOrder: photos.length + index,
        }));

        onPhotosChange([...photos, ...newPhotos]);
      }
    },
    [photos, maxFiles, onPhotosChange, createPreview],
  );

  // remove the photo
  const removePhoto = useCallback(
    (id: string) => {
      const photoToRemove = photos.find((p) => p.id === id);
      if (photoToRemove) {
        cleanupPreviews([photoToRemove]);
      }

      const updatedPhotos = photos
        .filter((p) => p.id !== id)
        .map((photo, index) => ({
          ...photo,
          isPrimary: index === 0 ? true : photo.isPrimary && photo.id !== id,
          sortOrder: index,
        }));

      onPhotosChange(updatedPhotos);
    },
    [photos, onPhotosChange, cleanupPreviews],
  );

  // set the primary photo
  const setPrimary = useCallback(
    (id: string) => {
      const updatedPhotos = photos.map((photo) => ({
        ...photo,
        isPrimary: photo.id === id,
      }));
      onPhotosChange(updatedPhotos);
    },
    [photos, onPhotosChange],
  );

  // update photo metadata
  const updatePhotoMetadata = useCallback(
    (id: string, field: 'altText' | 'caption', value: string) => {
      const updatedPhotos = photos.map((photo) => (photo.id === id ? { ...photo, [field]: value } : photo));
      onPhotosChange(updatedPhotos);
    },
    [photos, onPhotosChange],
  );

  // move the photo (for reordering)
  // const movePhoto = useCallback(
  //   (dragIndex: number, hoverIndex: number) => {
  //     const dragPhoto = photos[dragIndex];
  //     const updatedPhotos = [...photos];
  //     updatedPhotos.splice(dragIndex, 1);
  //     updatedPhotos.splice(hoverIndex, 0, dragPhoto!);
  //
  //     // update sort orders
  //     const reorderedPhotos = updatedPhotos.map((photo, index) => ({
  //       ...photo,
  //       sortOrder: index,
  //     }));
  //
  //     onPhotosChange(reorderedPhotos);
  //   },
  //   [photos, onPhotosChange],
  // );

  // handle file input change
  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length > 0) {
        addPhotos(files);
      }
      // reset input value
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [addPhotos],
  );

  // handle drag and drop
  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      setIsDragOver.off();

      const files = Array.from(event.dataTransfer.files);
      addPhotos(files);
    },
    [addPhotos, setIsDragOver],
  );

  const handleDragOver = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      setIsDragOver.on();
    },
    [setIsDragOver],
  );

  const handleDragLeave = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      setIsDragOver.off();
    },
    [setIsDragOver],
  );

  // click to upload
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const _isEmpty = photos.length === 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          'cursor-pointer border-2 border-dashed transition-colors',
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          photos.length >= maxFiles && 'cursor-not-allowed opacity-50',
        )}
        onClick={photos.length < maxFiles ? handleUploadClick : undefined}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent className={'p-8 text-center'}>
          <div className={'flex flex-col items-center space-y-4'}>
            <div className={'rounded-full bg-muted p-4'}>
              <UploadIcon aria-hidden className={'size-8 text-muted-foreground'} />
            </div>
            <div className={'space-y-2'}>
              <h3 className={'text-lg font-semibold'}>Upload Photos</h3>
              <p className={'text-sm text-muted-foreground'}>Drag and drop photos here or click to browse</p>
              <p className={'text-xs text-muted-foreground'}>
                Max {maxFiles} photos • JPG, PNG, WebP • Up to {CONFIG.FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB
                each
              </p>
              <p className={'text-xs text-muted-foreground'}>
                {photos.length}/{maxFiles} photos uploaded
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <input
        accept={CONFIG.FILE_UPLOAD.ALLOWED_TYPES.join(',')}
        className={'hidden'}
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        type={'file'}
      />

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className={'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'}>
          {photos.map((photo, index) => {
            const altImgText = photo.altText || `Photo ${index + 1}`;

            return (
              <Card className={'overflow-hidden'} key={photo.id}>
                <div className={'relative aspect-square'}>
                  <img alt={altImgText} className={'h-full w-full object-cover'} src={photo.preview} />

                  {/* Photo Controls */}
                  <div className={'absolute top-2 right-2 flex space-x-1'}>
                    <Button
                      className={'size-8 p-0'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrimary(photo.id);
                      }}
                      size={'sm'}
                      variant={photo.isPrimary ? 'default' : 'secondary'}
                    >
                      {photo.isPrimary ?
                        <StarIcon aria-hidden className={'size-4'} />
                      : <StarOffIcon aria-hidden className={'size-4'} />}
                    </Button>
                    <Button
                      className={'size-8 p-0'}
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(photo.id);
                      }}
                      size={'sm'}
                      variant={'destructive'}
                    >
                      <XIcon aria-hidden className={'size-4'} />
                    </Button>
                  </div>

                  {/* Primary Badge */}
                  {photo.isPrimary && (
                    <div className={'absolute bottom-2 left-2'}>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md bg-primary px-2 py-1',
                          'text-xs font-medium text-primary-foreground',
                        )}
                      >
                        Primary
                      </span>
                    </div>
                  )}
                </div>

                {/* Photo Metadata */}
                <CardContent className={'space-y-3 p-4'}>
                  <div className={'space-y-2'}>
                    <Label className={'text-sm font-medium'} htmlFor={`alt-${photo.id}`}>
                      Alt Text
                    </Label>
                    <Input
                      className={'text-sm'}
                      id={`alt-${photo.id}`}
                      onChange={(e) => {
                        updatePhotoMetadata(photo.id, 'altText', e.target.value);
                      }}
                      placeholder={'Describe this image...'}
                      value={photo.altText}
                    />
                  </div>

                  <div className={'space-y-2'}>
                    <Label className={'text-sm font-medium'} htmlFor={`caption-${photo.id}`}>
                      Caption
                    </Label>
                    <Textarea
                      className={'min-h-[60px] text-sm'}
                      id={`caption-${photo.id}`}
                      onChange={(e) => {
                        updatePhotoMetadata(photo.id, 'caption', e.target.value);
                      }}
                      placeholder={'Add a caption...'}
                      rows={2}
                      value={photo.caption}
                    />
                  </div>

                  <div className={'flex items-center justify-between text-xs text-muted-foreground'}>
                    <span>{photo.file.name}</span>
                    <span>{(photo.file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      <Conditional isCondition={_isEmpty}>
        <div className={'py-8 text-center text-muted-foreground'}>
          <ImageIcon aria-hidden className={'mx-auto mb-4 size-12 opacity-50'} />
          <p>No photos uploaded yet</p>
          <p className={'text-sm'}>Add some photos to showcase your bobblehead</p>
        </div>
      </Conditional>
    </div>
  );
}
