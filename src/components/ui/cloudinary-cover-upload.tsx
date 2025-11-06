/* eslint-disable react-snob/require-boolean-prefix-is */
'use client';

import type { CloudinaryUploadWidgetError, CloudinaryUploadWidgetResults } from 'next-cloudinary';

import * as Sentry from '@sentry/nextjs';
import { ImagePlusIcon, XIcon } from 'lucide-react';
import { CldImage, CldUploadWidget } from 'next-cloudinary';
import { useCallback, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';

interface CloudinaryCoverUploadProps {
  currentImageUrl?: string;
  isDisabled?: boolean;
  onRemove: () => void;
  onUploadComplete: (publicId: string, secureUrl: string) => void;
  uploadFolder: string;
}

export const CloudinaryCoverUpload = ({
  currentImageUrl,
  isDisabled = false,
  onRemove,
  onUploadComplete,
  uploadFolder,
}: CloudinaryCoverUploadProps) => {
  // useState hooks
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);

  // Event handlers
  const handleSuccess = useCallback(
    (results: CloudinaryUploadWidgetResults) => {
      if (typeof results.info === 'object' && results.info !== null && 'public_id' in results.info) {
        const publicId = results.info.public_id;
        const secureUrl = results.info.secure_url;
        onUploadComplete(publicId, secureUrl);
      }
    },
    [onUploadComplete],
  );

  const handleError = useCallback((error: CloudinaryUploadWidgetError) => {
    Sentry.captureException(error, {
      extra: { operation: 'cloudinary-cover-upload' },
      level: 'error',
    });
    setUploadError('Upload failed. Please try again.');
    setIsUploading(false);
  }, []);

  const handleUploadStart = useCallback(() => {
    setUploadError(undefined);
    setIsUploading(true);
  }, []);

  const handleUploadEnd = useCallback(() => {
    setIsUploading(false);
  }, []);

  const handleRemoveClick = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmRemove = useCallback(() => {
    onRemove();
    setIsDeleteDialogOpen(false);
  }, [onRemove]);

  // Derived variables
  const _hasCoverImage = !!currentImageUrl;
  const _canUpload = !isDisabled && !isUploading;

  return (
    <div className={'space-y-4'}>
      {/* Upload Widget */}
      <Conditional isCondition={!_hasCoverImage}>
        <CldUploadWidget
          onError={handleError}
          onQueuesEnd={handleUploadEnd}
          onQueuesStart={handleUploadStart}
          onSuccess={handleSuccess}
          options={{
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
            cropping: true,
            croppingAspectRatio: 16 / 9,
            folder: uploadFolder,
            maxFiles: 1,
            maxFileSize: 5242880, // 5MB
            multiple: false,
            resourceType: 'image',
            showAdvancedOptions: false,
            showCompletedButton: true,
            showPoweredBy: false,
            showSkipCropButton: false,
            sources: ['local', 'camera', 'url'],
          }}
          signatureEndpoint={'/api/upload/sign'}
        >
          {({ open }) => (
            <Button
              className={'h-32 w-full border-dashed'}
              disabled={!_canUpload}
              onClick={() => open()}
              type={'button'}
              variant={'outline'}
            >
              <div className={'flex flex-col items-center gap-2'}>
                <ImagePlusIcon aria-hidden className={'size-8'} />
                <span>{isUploading ? 'Uploading...' : 'Upload Cover Photo'}</span>
              </div>
            </Button>
          )}
        </CldUploadWidget>
      </Conditional>

      {/* Upload Error */}
      <Conditional isCondition={!!uploadError}>
        <div className={'rounded-md bg-red-50 p-3 text-sm text-destructive'}>
          Upload error: {uploadError}
        </div>
      </Conditional>

      {/* Cover Photo Preview */}
      <Conditional isCondition={_hasCoverImage}>
        <Card className={'relative overflow-hidden'}>
          <CardContent className={'p-4'}>
            <div className={'space-y-3'}>
              {/* Image Preview */}
              <div className={'relative aspect-video overflow-hidden rounded-lg'}>
                <CldImage
                  alt={'Cover photo'}
                  className={'h-full w-full object-cover'}
                  crop={'fill'}
                  format={'auto'}
                  gravity={'auto'}
                  height={400}
                  quality={'auto:good'}
                  src={currentImageUrl || ''}
                  width={700}
                />

                {/* Controls Overlay */}
                <div
                  className={
                    'absolute inset-0 bg-black/50 opacity-0 transition-opacity hover:opacity-100'
                  }
                >
                  <div className={'flex h-full w-full items-center justify-center'}>
                    <Button
                      className={'size-10 p-0'}
                      disabled={isDisabled}
                      onClick={handleRemoveClick}
                      size={'sm'}
                      type={'button'}
                      variant={'destructive'}
                    >
                      <XIcon aria-hidden className={'size-5'} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Conditional>

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setIsDeleteDialogOpen} open={isDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Cover Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this cover photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
