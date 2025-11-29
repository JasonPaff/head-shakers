'use client';

import type { z } from 'zod';

import * as Sentry from '@sentry/nextjs';
import { revalidateLogic } from '@tanstack/form-core';
import { type AnyFormApi, useStore } from '@tanstack/react-form';
import { CameraIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';
import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { CloudinaryPhoto } from '@/types/cloudinary.types';

interface BobbleheadEditDialogProps extends ComponentTestIdProps {
  bobblehead: BobbleheadForEdit;
  collections: Array<ComboboxItem>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

import { AcquisitionDetails } from '@/app/(app)/bobbleheads/add/components/acquisition-details';
import { AnimatedMotivationalMessage } from '@/app/(app)/bobbleheads/add/components/animated-motivational-message';
import { BasicInformation } from '@/app/(app)/bobbleheads/add/components/basic-information';
import { CollectionAssignment } from '@/app/(app)/bobbleheads/add/components/collection-assignment';
import { CustomFields } from '@/app/(app)/bobbleheads/add/components/custom-fields';
import { ItemSettings } from '@/app/(app)/bobbleheads/add/components/item-settings';
import { ItemTags } from '@/app/(app)/bobbleheads/add/components/item-tags';
import { PhysicalAttributes } from '@/app/(app)/bobbleheads/add/components/physical-attributes';
import { PhotoManagementFallback } from '@/components/feature/bobblehead/photo-management-fallback';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CloudinaryPhotoUpload,
  type CloudinaryPhotoUploadRef,
} from '@/components/ui/cloudinary-photo-upload';
import { Conditional } from '@/components/ui/conditional';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';
import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { Skeleton } from '@/components/ui/skeleton';
import { useServerAction } from '@/hooks/use-server-action';
import {
  getBobbleheadPhotosAction,
  updateBobbleheadWithPhotosAction,
} from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { DEFAULTS } from '@/lib/constants';
import { generateTestId } from '@/lib/test-ids';
import { transformDatabasePhotoToCloudinary } from '@/lib/utils/photo-transform.utils';
import { updateBobbleheadWithPhotosSchema } from '@/lib/validations/bobbleheads.validation';

interface BobbleheadForEdit {
  acquisitionDate: Date | null;
  acquisitionMethod: null | string;
  category: null | string;
  characterName: null | string;
  collectionId: string;
  currentCondition: null | string;
  customFields: Array<Record<string, string>> | null;
  description: null | string;
  height: null | number;
  id: string;
  isFeatured: boolean;
  isPublic: boolean;
  manufacturer: null | string;
  material: null | string;
  name: null | string;
  purchaseLocation: null | string;
  purchasePrice: null | number;
  series: null | string;
  status: null | string;
  tags?: Array<{ id: string; name: string }>;
  weight: null | number;
  year: null | number;
}

// Custom ItemPhotos component for editing with bobblehead support
interface ItemPhotosEditProps {
  bobbleheadId: string;
  error: null | string;
  form: AnyFormApi;
  isLoading: boolean;
  onRetry: () => void;
  photoCount: number;
  photoUploadRef?: React.RefObject<CloudinaryPhotoUploadRef | null>;
}

function ItemPhotosEditComponent({
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

export const BobbleheadEditDialog = withFocusManagement(
  ({ bobblehead, collections, isOpen, onClose, onSuccess, testId }: BobbleheadEditDialogProps) => {
    const dialogTestId = testId || generateTestId('feature', 'bobblehead-edit-dialog');
    const formTestId = generateTestId('feature', 'bobblehead-edit-form');
    const cancelButtonTestId = generateTestId('feature', 'bobblehead-edit-cancel');
    const submitButtonTestId = generateTestId('feature', 'bobblehead-edit-submit');

    // useState hooks
    const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
    const [photoFetchError, setPhotoFetchError] = useState<null | string>(null);
    const [photoCount, setPhotoCount] = useState(0);
    const [retryAttempt, setRetryAttempt] = useState(0);
    const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);

    // other hooks
    const router = useRouter();
    const { focusFirstError } = useFocusContext();

    // refs
    const photosFetchedRef = useRef(false);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const formResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const serverActionAbortRef = useRef(false);
    const photoUploadRef = useRef<CloudinaryPhotoUploadRef>(null);

    const { executeAsync, isExecuting } = useServerAction(updateBobbleheadWithPhotosAction, {
      loadingMessage: 'Updating bobblehead...',
      onAfterSuccess: () => {
        if (serverActionAbortRef.current) return; // skip if dialog closed
        router.refresh();
        handleClose();
        onSuccess?.();
      },
    });

    const form = useAppForm({
      canSubmitWhenInvalid: true,
      defaultValues: {
        acquisitionDate:
          bobblehead.acquisitionDate ? new Date(bobblehead.acquisitionDate).toISOString().split('T')[0] : '',
        acquisitionMethod: bobblehead.acquisitionMethod || '',
        category: bobblehead.category || '',
        characterName: bobblehead.characterName || '',
        collectionId: bobblehead.collectionId,
        currentCondition: bobblehead.currentCondition || DEFAULTS.BOBBLEHEAD.CONDITION,
        customFields: bobblehead.customFields || [],
        description: bobblehead.description || '',
        height: bobblehead.height?.toString() || '',
        id: bobblehead.id,
        isFeatured: bobblehead.isFeatured,
        isPublic: bobblehead.isPublic,
        manufacturer: bobblehead.manufacturer || '',
        material: bobblehead.material || '',
        name: bobblehead.name || '',
        photos: [],
        purchaseLocation: bobblehead.purchaseLocation || '',
        purchasePrice: bobblehead.purchasePrice?.toString() || '',
        series: bobblehead.series || '',
        status: bobblehead.status || DEFAULTS.BOBBLEHEAD.STATUS,
        tags: bobblehead.tags?.map((tag) => tag.name) || [],
        weight: bobblehead.weight?.toString() || '',
        year: bobblehead.year?.toString() || '',
      } as z.input<typeof updateBobbleheadWithPhotosSchema>,
      onSubmit: async ({ value }) => {
        // flush any pending photo operations before submitting
        console.log('[BobbleheadEditDialog] About to flush pending operations');
        try {
          await photoUploadRef.current?.flushPendingOperations();
          console.log('[BobbleheadEditDialog] Flush completed successfully');
        } catch (error) {
          console.error('[BobbleheadEditDialog] Flush failed:', error);
          Sentry.captureException(error, {
            extra: {
              bobbleheadId: bobblehead.id,
              operation: 'flush-pending-operations',
            },
            level: 'warning',
          });
        }

        console.log('[BobbleheadEditDialog] Proceeding with main update');
        await executeAsync(value);
      },
      onSubmitInvalid: ({ formApi }) => {
        focusFirstError(formApi);
      },
      validationLogic: revalidateLogic({
        mode: 'submit',
        modeAfterSubmission: 'change',
      }),
      validators: {
        onSubmit: updateBobbleheadWithPhotosSchema,
      },
    });

    // utility functions
    const getRetryDelay = (attempt: number): number => {
      const delays = [1000, 2000, 4000]; // 1s, 2s, 4s
      return delays[attempt] ?? delays[delays.length - 1] ?? 4000;
    };

    const revokePhotoBlobUrls = () => {
      const currentPhotos = (form.getFieldValue('photos') as Array<CloudinaryPhoto>) || [];
      currentPhotos.forEach((photo) => {
        // revoke blob URLs if they exist
        if (photo.publicId && photo.publicId.startsWith('blob:')) {
          URL.revokeObjectURL(photo.publicId);
        }
      });
    };

    // event handlers
    const handleClose = () => {
      // abort any pending server actions
      serverActionAbortRef.current = true;

      // cleanup all timeouts
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      if (formResetTimeoutRef.current) {
        clearTimeout(formResetTimeoutRef.current);
        formResetTimeoutRef.current = null;
      }

      // revoke all photo blob URLs to prevent memory leaks
      revokePhotoBlobUrls();

      // reset state immediately (no setTimeout)
      photosFetchedRef.current = false;
      setPhotoFetchError(null);
      setRetryAttempt(0);
      setPhotoCount(0);
      form.reset();

      onClose();
    };

    const handleRetryPhotoFetch = () => {
      setRetryAttempt(0);
      setPhotoFetchError(null);
      photosFetchedRef.current = false;
    };

    const handlePhotoErrorBoundaryReset = () => {
      setErrorBoundaryKey((prev) => prev + 1);
      setRetryAttempt(0);
      setPhotoFetchError(null);
      photosFetchedRef.current = false;

      Sentry.captureMessage('Photo error boundary reset triggered', {
        extra: {
          bobbleheadId: bobblehead.id,
          operation: 'error-boundary-reset',
        },
        level: 'info',
      });
    };

    const handleContinueWithoutPhotos = () => {
      // clear photo-related errors and continue with form editing
      setPhotoFetchError(null);
      setIsLoadingPhotos(false);
      form.setFieldValue('photos', []);

      Sentry.captureMessage('User chose to continue without photos', {
        extra: {
          bobbleheadId: bobblehead.id,
          operation: 'continue-without-photos',
        },
        level: 'info',
      });
    };

    // cleanup effect on dialog close or unmount
    useEffect(() => {
      return () => {
        // cleanup all timers on unmount
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        if (formResetTimeoutRef.current) {
          clearTimeout(formResetTimeoutRef.current);
        }

        // revoke all blob URLs
        revokePhotoBlobUrls();

        // abort server actions
        serverActionAbortRef.current = true;

        // reset refs
        photosFetchedRef.current = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // fetch existing photos when the dialog opens
    useEffect(() => {
      if (!isOpen || !bobblehead.id || photosFetchedRef.current) return;

      const fetchPhotos = async () => {
        photosFetchedRef.current = true;
        setIsLoadingPhotos(true);
        setPhotoFetchError(null);

        const currentAttempt = retryAttempt;
        const maxAttempts = 3;
        const timeoutDuration = 30000; // 30 seconds

        try {
          // create timeout promise
          const timeoutPromise = new Promise<never>((_, reject) => {
            fetchTimeoutRef.current = setTimeout(() => {
              reject(new Error('Photo fetch timeout after 30 seconds'));
            }, timeoutDuration);
          });

          // create fetch promise
          const fetchPromise = getBobbleheadPhotosAction({ bobbleheadId: bobblehead.id });

          // race between fetch and timeout
          const result = await Promise.race([fetchPromise, timeoutPromise]);

          // clear timeout if fetch completed
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = null;
          }

          // next-safe-action wraps the result in { data: { data: photos, success: true } }
          // so we need to check result?.data?.data for the actual photos array
          const photosData = result?.data?.data;

          if (photosData && Array.isArray(photosData)) {
            // transform database photos to CloudinaryPhoto format
            const transformedPhotos = (
              photosData as Array<Parameters<typeof transformDatabasePhotoToCloudinary>[0]>
            ).map(transformDatabasePhotoToCloudinary);

            setPhotoCount(transformedPhotos.length);

            // update form field with existing photos
            form.setFieldValue('photos', transformedPhotos);

            // log success
            Sentry.captureMessage('Photos fetched successfully', {
              extra: {
                attempt: currentAttempt + 1,
                bobbleheadId: bobblehead.id,
                operation: 'fetch-photos',
                photoCount: transformedPhotos.length,
              },
              level: 'info',
            });
          }
        } catch (error) {
          // clear timeout on error
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = null;
          }

          const errorMessage = error instanceof Error ? error.message : 'Failed to load photos';
          const isTimeout = errorMessage.includes('timeout');

          // log attempt
          Sentry.captureException(error, {
            extra: {
              attempt: currentAttempt + 1,
              bobbleheadId: bobblehead.id,
              isTimeout,
              operation: 'fetch-photos',
            },
            level: 'error',
          });

          // retry logic with exponential backoff
          if (currentAttempt < maxAttempts - 1) {
            const delay = getRetryDelay(currentAttempt);

            Sentry.captureMessage('Retrying photo fetch', {
              extra: {
                attempt: currentAttempt + 1,
                bobbleheadId: bobblehead.id,
                delay,
                operation: 'fetch-photos-retry',
              },
              level: 'info',
            });

            setTimeout(() => {
              setRetryAttempt((prev) => prev + 1);
              photosFetchedRef.current = false;
            }, delay);
          } else {
            // max attempts reached, show error
            setPhotoFetchError(
              isTimeout ?
                'Photo loading timed out. Please check your connection and try again.'
              : 'Unable to load photos. Please try again.',
            );

            Sentry.captureMessage('Photo fetch failed after max retries', {
              extra: {
                attempts: maxAttempts,
                bobbleheadId: bobblehead.id,
                operation: 'fetch-photos-failed',
              },
              level: 'error',
            });
          }
        } finally {
          setIsLoadingPhotos(false);
        }
      };

      void fetchPhotos();
    }, [isOpen, bobblehead.id, form, retryAttempt]);

    return (
      <Dialog
        onOpenChange={(open) => {
          if (open) return;
          handleClose();
        }}
        open={isOpen}
      >
        <DialogContent
          className={'flex max-h-[95vh] !grid-cols-1 flex-col overflow-hidden sm:max-w-[1000px]'}
          testId={dialogTestId}
        >
          {/* Header */}
          <DialogHeader className={'shrink-0'}>
            <DialogTitle>Edit Bobblehead Details</DialogTitle>
            <DialogDescription>
              Update the details of your bobblehead below. Add photos, update information, and manage tags.
            </DialogDescription>
          </DialogHeader>

          {/* Form Fields - Scrollable */}
          <div className={'min-h-0 flex-1 overflow-y-auto pr-4'}>
            <form
              className={'space-y-6 py-4'}
              data-testid={formTestId}
              id={'edit-bobblehead-form'}
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
            >
              {/*
                Note: Form sections are typed for addItemFormOptions but work with updateBobbleheadWithPhotosSchema
                because both schemas have compatible field structures. Using 'as never' to bypass the type check
                since the forms are structurally compatible at runtime.
              */}
              <BasicInformation form={form as never} />
              <CollectionAssignment collections={collections} form={form as never} />
              <ErrorBoundary
                fallback={(error, reset) => (
                  <PhotoManagementFallback
                    error={error}
                    onContinueWithoutPhotos={handleContinueWithoutPhotos}
                    onReset={() => {
                      reset();
                      handlePhotoErrorBoundaryReset();
                    }}
                  />
                )}
                key={errorBoundaryKey}
                name={'photo-management'}
              >
                <ItemPhotosEditComponent
                  bobbleheadId={bobblehead.id}
                  error={photoFetchError}
                  form={form}
                  isLoading={isLoadingPhotos}
                  onRetry={handleRetryPhotoFetch}
                  photoCount={photoCount}
                  photoUploadRef={photoUploadRef}
                />
              </ErrorBoundary>
              <PhysicalAttributes form={form as never} />
              <AcquisitionDetails form={form as never} />
              <ItemTags form={form as never} />
              <CustomFields form={form as never} />
              <ItemSettings form={form as never} />
            </form>
          </div>

          {/* Action Buttons */}
          <DialogFooter className={'shrink-0'}>
            <Button
              disabled={isExecuting}
              onClick={handleClose}
              testId={cancelButtonTestId}
              type={'button'}
              variant={'outline'}
            >
              Cancel
            </Button>
            <Button
              disabled={isExecuting}
              form={'edit-bobblehead-form'}
              testId={submitButtonTestId}
              type={'submit'}
            >
              {isExecuting ? 'Updating...' : 'Update Bobblehead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);
