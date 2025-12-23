'use client';

import type { z } from 'zod';

import * as Sentry from '@sentry/nextjs';
import { revalidateLogic } from '@tanstack/form-core';
import { CheckCircle2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQueryStates } from 'nuqs';
import { useEffect, useRef, useState } from 'react';

import type { CloudinaryPhotoUploadRef } from '@/components/ui/cloudinary-photo-upload';
import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';
import type { CloudinaryPhoto } from '@/types/cloudinary.types';

import { PhotoManagementFallback } from '@/components/feature/bobblehead/photo-management-fallback';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';
import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import {
  getBobbleheadPhotosAction,
  updateBobbleheadWithPhotosAction,
} from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { DEFAULTS } from '@/lib/constants';
import { transformDatabasePhotoToCloudinary } from '@/lib/utils/photo-transform.utils';
import { updateBobbleheadWithPhotosSchema } from '@/lib/validations/bobbleheads.validation';

import { collectionDashboardParsers } from '../../route-type';
import { AcquisitionDetails } from '../add-form/acquisition-details';
import { BasicInformation } from '../add-form/basic-information';
import { CollectionAssignment } from '../add-form/collection-assignment';
import { CustomFields } from '../add-form/custom-fields';
import { ItemSettings } from '../add-form/item-settings';
import { ItemTags } from '../add-form/item-tags';
import { PhysicalAttributes } from '../add-form/physical-attributes';
import { EditItemHeader } from '../edit-form/edit-item-header';
import { ItemPhotosEdit } from '../edit-form/item-photos-edit';

export interface BobbleheadForEdit {
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

interface EditBobbleheadFormDisplayProps {
  bobblehead: BobbleheadForEdit;
  collections: Array<ComboboxItem>;
}

export const EditBobbleheadFormDisplay = withFocusManagement(
  ({ bobblehead, collections }: EditBobbleheadFormDisplayProps) => {
    const router = useRouter();
    const { focusFirstError } = useFocusContext();
    const [, setParams] = useQueryStates({ edit: collectionDashboardParsers.edit }, { shallow: false });

    // Photo loading state
    const [isLoadingPhotos, setIsLoadingPhotos] = useToggle(true);
    const [photoFetchError, setPhotoFetchError] = useState<null | string>(null);
    const [photoCount, setPhotoCount] = useState(0);
    const [retryAttempt, setRetryAttempt] = useState(0);
    const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);

    // Refs
    const photosFetchedRef = useRef(false);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const photoUploadRef = useRef<CloudinaryPhotoUploadRef>(null);

    const handleClose = () => {
      // Cleanup
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      revokePhotoBlobUrls();
      photosFetchedRef.current = false;
      void setParams({ edit: null });
    };

    const { executeAsync, isExecuting } = useServerAction(updateBobbleheadWithPhotosAction, {
      loadingMessage: 'Updating bobblehead...',
      onAfterSuccess: () => {
        router.refresh();
        handleClose();
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
        // Flush any pending photo operations before submitting
        try {
          await photoUploadRef.current?.flushPendingOperations();
        } catch (error) {
          Sentry.captureException(error, {
            extra: {
              bobbleheadId: bobblehead.id,
              operation: 'flush-pending-operations',
            },
            level: 'warning',
          });
        }
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

    // Utility functions
    const getRetryDelay = (attempt: number): number => {
      const delays = [1000, 2000, 4000]; // 1s, 2s, 4s
      return delays[attempt] ?? delays[delays.length - 1] ?? 4000;
    };

    const revokePhotoBlobUrls = () => {
      const currentPhotos = (form.getFieldValue('photos') as Array<CloudinaryPhoto>) || [];
      currentPhotos.forEach((photo) => {
        if (photo.publicId && photo.publicId.startsWith('blob:')) {
          URL.revokeObjectURL(photo.publicId);
        }
      });
    };

    // Event handlers
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
      setPhotoFetchError(null);
      setIsLoadingPhotos.off();
      form.setFieldValue('photos', []);

      Sentry.captureMessage('User chose to continue without photos', {
        extra: {
          bobbleheadId: bobblehead.id,
          operation: 'continue-without-photos',
        },
        level: 'info',
      });
    };

    // Cleanup effect on unmount
    useEffect(() => {
      return () => {
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        revokePhotoBlobUrls();
        photosFetchedRef.current = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch existing photos on mount
    useEffect(() => {
      if (!bobblehead.id || photosFetchedRef.current) return;

      const fetchPhotos = async () => {
        photosFetchedRef.current = true;
        setIsLoadingPhotos.on();
        setPhotoFetchError(null);

        const currentAttempt = retryAttempt;
        const maxAttempts = 3;
        const timeoutDuration = 30000;

        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            fetchTimeoutRef.current = setTimeout(() => {
              reject(new Error('Photo fetch timeout after 30 seconds'));
            }, timeoutDuration);
          });

          const fetchPromise = getBobbleheadPhotosAction({ bobbleheadId: bobblehead.id });
          const result = await Promise.race([fetchPromise, timeoutPromise]);

          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = null;
          }

          const photosData = result?.data?.data;

          if (photosData && Array.isArray(photosData)) {
            const transformedPhotos = (
              photosData as Array<Parameters<typeof transformDatabasePhotoToCloudinary>[0]>
            ).map(transformDatabasePhotoToCloudinary);

            setPhotoCount(transformedPhotos.length);
            form.setFieldValue('photos', transformedPhotos);

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
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = null;
          }

          const errorMessage = error instanceof Error ? error.message : 'Failed to load photos';
          const isTimeout = errorMessage.includes('timeout');

          Sentry.captureException(error, {
            extra: {
              attempt: currentAttempt + 1,
              bobbleheadId: bobblehead.id,
              isTimeout,
              operation: 'fetch-photos',
            },
            level: 'error',
          });

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
          setIsLoadingPhotos.off();
        }
      };

      void fetchPhotos();
    }, [bobblehead.id, form, retryAttempt, setIsLoadingPhotos]);

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className={'space-y-8 p-6'}>
          <EditItemHeader bobbleheadName={bobblehead.name} />
          <CollectionAssignment collections={collections} form={form as never} />
          <BasicInformation form={form as never} />
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
            <ItemPhotosEdit
              bobbleheadId={bobblehead.id}
              error={photoFetchError}
              form={form}
              isLoading={isLoadingPhotos}
              onRetry={handleRetryPhotoFetch}
              photoCount={photoCount}
              photoUploadRef={photoUploadRef}
            />
          </ErrorBoundary>
          <AcquisitionDetails form={form as never} />
          <PhysicalAttributes form={form as never} />
          <ItemTags form={form as never} />
          <CustomFields form={form as never} />
          <ItemSettings form={form as never} />

          <form.AppForm>
            <div
              className={
                'sticky bottom-0 z-10 -mx-6 border-t border-border/50 bg-background/80 p-6 backdrop-blur-sm'
              }
            >
              <div className={'flex items-center justify-end'}>
                <div className={'flex items-center gap-4'}>
                  <Button
                    className={'min-w-25'}
                    disabled={isExecuting}
                    onClick={handleClose}
                    type={'button'}
                    variant={'outline'}
                  >
                    Cancel
                  </Button>
                  <form.SubmitButton isDisabled={isExecuting}>
                    <Conditional
                      fallback={
                        <div className={'flex items-center gap-2'}>
                          <CheckCircle2Icon aria-hidden className={'size-4'} />
                          <span>Update Bobblehead</span>
                        </div>
                      }
                      isCondition={isExecuting}
                    >
                      <div className={'flex items-center gap-2'}>
                        <div
                          className={
                            'size-4 animate-spin rounded-full border-2 border-white/20 border-t-white'
                          }
                        />
                        <span>Updating...</span>
                      </div>
                    </Conditional>
                  </form.SubmitButton>
                </div>
              </div>
            </div>
          </form.AppForm>
        </div>
      </form>
    );
  },
);
