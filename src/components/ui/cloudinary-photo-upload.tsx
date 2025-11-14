/* eslint-disable react-snob/require-boolean-prefix-is */
'use client';

import type { CloudinaryUploadWidgetError, CloudinaryUploadWidgetResults } from 'next-cloudinary';

import { useAuth } from '@clerk/nextjs';
import * as Sentry from '@sentry/nextjs';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ImagePlusIcon,
  InfoIcon,
  MoveIcon,
  RefreshCwIcon,
  StarIcon,
  StarOffIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { CldImage, CldUploadWidget } from 'next-cloudinary';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { CloudinaryPhoto, FileUploadProgress, PhotoUploadState } from '@/types/cloudinary.types';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import * as Sortable from '@/components/ui/sortable';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useServerAction } from '@/hooks/use-server-action';
import {
  deleteBobbleheadPhotoAction,
  reorderBobbleheadPhotosAction,
  updateBobbleheadPhotoMetadataAction,
} from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { CONFIG } from '@/lib/constants';
import { transformCloudinaryResult } from '@/types/cloudinary.types';
import { cn } from '@/utils/tailwind-utils';

interface CloudinaryPhotoUploadProps {
  bobbleheadId?: string;
  isDisabled?: boolean;
  maxPhotos?: number;
  onPhotosChange: (
    photos: ((prevPhotos: Array<CloudinaryPhoto>) => Array<CloudinaryPhoto>) | Array<CloudinaryPhoto>,
  ) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  photos: Array<CloudinaryPhoto>;
}

export const CloudinaryPhotoUpload = ({
  bobbleheadId,
  isDisabled = false,
  maxPhotos = CONFIG.CONTENT.MAX_PHOTOS_PER_BOBBLEHEAD,
  onPhotosChange,
  onUploadStateChange,
  photos,
}: CloudinaryPhotoUploadProps) => {
  // useState hooks
  const [uploadState, setUploadState] = useState<PhotoUploadState>({
    fileProgress: new Map(),
    isUploading: false,
    totalCount: 0,
    uploadedCount: 0,
  });
  const [isUploadCancelled, setIsUploadCancelled] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<CloudinaryPhoto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [previousPhotosState, setPreviousPhotosState] = useState<Array<CloudinaryPhoto>>([]);
  const [savingMetadataPhotoIds, setSavingMetadataPhotoIds] = useState<Set<string>>(new Set());
  const [deletingPhotoId, setDeletingPhotoId] = useState<null | string>(null);
  const [undoTimeoutId, setUndoTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [isReorderPending, setIsReorderPending] = useState(false);
  const [reorderError, setReorderError] = useState<null | string>(null);
  const [isReorderSuccess, setIsReorderSuccess] = useState(false);
  const [isFaqExpanded, setIsFaqExpanded] = useState(false);
  const [isPrimaryChangeDialogOpen, setIsPrimaryChangeDialogOpen] = useState(false);
  const [pendingPrimaryPhotoId, setPendingPrimaryPhotoId] = useState<null | string>(null);
  const [animatingPrimaryPhotoId, setAnimatingPrimaryPhotoId] = useState<null | string>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // other hooks
  const { userId } = useAuth();

  const { executeAsync: deletePhoto, isExecuting: isDeletingPhoto } = useServerAction(
    deleteBobbleheadPhotoAction,
    {
      onAfterSuccess: () => {
        // photo already removed optimistically, just close dialog and clean up deleting state
        setIsDeleteDialogOpen(false);
        setPhotoToDelete(null);
        setDeletingPhotoId(null);

        // show undo toast with action button
        toast.success('Photo deleted successfully!', {
          action: {
            label: 'Undo',
            onClick: handleUndoDelete,
          },
          duration: 5000,
        });

        // set up undo timeout (5 seconds)
        const timeoutId = setTimeout(() => {
          setPreviousPhotosState([]);
          setUndoTimeoutId(null);
        }, 5000);

        setUndoTimeoutId(timeoutId);
      },
      onError: () => {
        // rollback optimistic update
        if (previousPhotosState.length > 0) {
          onPhotosChange(previousPhotosState);
          setPreviousPhotosState([]);
        }
        setDeletingPhotoId(null);
      },
      toastMessages: {
        error: 'Failed to delete photo. Please try again.',
        loading: 'Deleting photo...',
        success: undefined, // we'll show our own success toast with undo
      },
    },
  );

  const { executeAsync: reorderPhotos, isExecuting: isReorderingPhotos } = useServerAction(
    reorderBobbleheadPhotosAction,
    {
      isDisableToast: true,
      onAfterSuccess: () => {
        setIsReorderPending(false);
        setReorderError(null);
        setIsReorderSuccess(true);

        // hide success indicator after 2 seconds
        setTimeout(() => {
          setIsReorderSuccess(false);
        }, 2000);
      },
      onError: () => {
        setIsReorderPending(false);
        setReorderError('Failed to save photo order');
      },
    },
  );

  const { executeAsync: updatePhotoMetadata } = useServerAction(updateBobbleheadPhotoMetadataAction, {
    isDisableToast: true,
    onError: ({ input }) => {
      // remove from saving state on error
      if (
        input &&
        typeof input === 'object' &&
        'photoId' in input &&
        typeof (input as { photoId: unknown }).photoId === 'string'
      ) {
        const photoId = (input as { photoId: string }).photoId;
        setSavingMetadataPhotoIds((prev) => {
          const next = new Set(prev);
          next.delete(photoId);
          return next;
        });
      }
    },
    onSuccess: ({ input }) => {
      // remove from saving state
      if (
        input &&
        typeof input === 'object' &&
        'photoId' in input &&
        typeof (input as { photoId: unknown }).photoId === 'string'
      ) {
        const photoId = (input as { photoId: string }).photoId;
        setSavingMetadataPhotoIds((prev) => {
          const next = new Set(prev);
          next.delete(photoId);
          return next;
        });
      }
    },
  });

  // debounce timer refs
  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const metadataTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const uploadWidgetRef = useRef<null | { close: () => void }>(null);

  const handleSuccess = useCallback(
    (results: CloudinaryUploadWidgetResults) => {
      if (isUploadCancelled) return;

      try {
        const filename =
          typeof results.info === 'object' && results.info ?
            results.info.original_filename || 'unknown'
          : 'unknown';

        onPhotosChange((currentPhotos) => {
          // find the optimistic photo to replace
          const optimisticPhotoIndex = currentPhotos.findIndex(
            (p) => p.isUploading && p.originalFilename === filename,
          );

          if (optimisticPhotoIndex !== -1) {
            // replace optimistic photo with real data
            const optimisticPhoto = currentPhotos[optimisticPhotoIndex];

            // typescript safety check (should never be undefined if index !== -1)
            if (!optimisticPhoto) {
              return currentPhotos;
            }

            // cleanup blob URL
            if (optimisticPhoto.blobUrl) {
              URL.revokeObjectURL(optimisticPhoto.blobUrl);
            }

            const newPhoto = transformCloudinaryResult(results, {
              isPrimary: optimisticPhoto.isPrimary,
              sortOrder: optimisticPhoto.sortOrder,
            });

            const updatedPhotos = [...currentPhotos];
            updatedPhotos[optimisticPhotoIndex] = newPhoto;

            return updatedPhotos;
          } else {
            // fallback: no optimistic photo found, add normally
            // prevent overflow beyond maxPhotos limit
            if (currentPhotos.filter((p) => !p.isUploading).length >= maxPhotos) {
              toast.error(`Cannot add more than ${maxPhotos} photos. Please delete a photo first.`);
              return currentPhotos;
            }

            const newPhoto = transformCloudinaryResult(results, {
              isPrimary: currentPhotos.filter((p) => !p.isUploading).length === 0,
              sortOrder: currentPhotos.length,
            });
            return [...currentPhotos, newPhoto];
          }
        });

        setUploadState((prev) => {
          const newFileProgress = new Map(prev.fileProgress);

          // mark file as complete
          const existingProgress = newFileProgress.get(filename);
          if (existingProgress) {
            newFileProgress.set(filename, {
              ...existingProgress,
              isComplete: true,
              isFailed: false,
            });
          }

          return {
            ...prev,
            fileProgress: newFileProgress,
            uploadedCount: prev.uploadedCount + 1,
          };
        });

        // log successful upload to Sentry
        Sentry.captureMessage('Photo uploaded successfully', {
          extra: {
            operation: 'photo-upload-success',
            photoCount: photos.length + 1,
          },
          level: 'info',
        });
      } catch (error) {
        // catch any errors during photo processing
        Sentry.captureException(error, {
          extra: {
            operation: 'photo-upload-processing',
            results,
          },
          level: 'error',
          tags: {
            component: 'cloudinary-photo-upload',
          },
        });

        toast.error('Failed to process uploaded photo. Please try again.');
      }
    },
    [onPhotosChange, maxPhotos, isUploadCancelled, photos.length],
  );

  const handleError = useCallback(
    (error: CloudinaryUploadWidgetError) => {
      // determine error type for better logging
      const errorMessage =
        typeof error === 'string' ? error
        : error && typeof error === 'object' && 'statusText' in error ? (error.statusText ?? 'Upload failed')
        : 'Upload failed';

      const errorType =
        errorMessage.toLowerCase().includes('network') ? 'network'
        : errorMessage.toLowerCase().includes('permission') ? 'permission'
        : errorMessage.toLowerCase().includes('size') || errorMessage.toLowerCase().includes('quota') ?
          'storage'
        : 'unknown';

      // log to Sentry with enhanced context
      Sentry.captureException(error, {
        extra: {
          errorMessage,
          errorType,
          operation: 'cloudinary-upload',
          photoCount: photos.length,
        },
        level: 'error',
        tags: {
          component: 'cloudinary-photo-upload',
          errorType,
        },
      });

      // mark optimistic photos as failed
      onPhotosChange((currentPhotos) => {
        return currentPhotos.map((photo) => {
          if (photo.isUploading && !photo.uploadError) {
            return {
              ...photo,
              isUploading: false,
              uploadError: errorMessage,
            };
          }
          return photo;
        });
      });

      setUploadState((prev) => {
        const newFileProgress = new Map(prev.fileProgress);

        // mark all in-progress files as failed
        newFileProgress.forEach((fileProgress, filename) => {
          if (!fileProgress.isComplete && !fileProgress.isFailed) {
            newFileProgress.set(filename, {
              ...fileProgress,
              error: errorMessage,
              isFailed: true,
            });
          }
        });

        return {
          ...prev,
          error: errorMessage,
          fileProgress: newFileProgress,
        };
      });
    },
    [photos.length, onPhotosChange],
  );

  const handleQueuesStart = useCallback(
    (data: undefined | { files?: Array<File> }) => {
      const files = data?.files || [];
      const fileCount = files.length || 1;

      // initialize progress tracking for each file
      const fileProgress = new Map<string, FileUploadProgress>();
      files.forEach((file) => {
        fileProgress.set(file.name, {
          bytesUploaded: 0,
          filename: file.name,
          isComplete: false,
          isFailed: false,
          retryCount: 0,
          startTime: Date.now(),
          totalBytes: file.size,
        });
      });

      setIsUploadCancelled(false);
      setUploadState({
        error: undefined,
        fileProgress,
        isUploading: true,
        totalCount: fileCount,
        uploadedCount: 0,
      });

      // create optimistic photo entries for each file
      onPhotosChange((currentPhotos) => {
        // prevent overflow beyond maxPhotos limit
        const availableSlots = maxPhotos - currentPhotos.filter((p) => !p.isUploading).length;
        const filesToAdd = files.slice(0, availableSlots);

        const optimisticPhotos: Array<CloudinaryPhoto> = filesToAdd.map((file, index) => {
          const blobUrl = URL.createObjectURL(file);
          const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

          return {
            altText: '',
            blobUrl,
            bytes: file.size,
            caption: '',
            format: file.type.split('/')[1] || 'unknown',
            height: 0, // will be updated when upload completes
            id: tempId,
            isPrimary: currentPhotos.length === 0 && index === 0,
            isUploading: true,
            originalFilename: file.name,
            publicId: tempId, // temporary, will be replaced with real publicId
            sortOrder: currentPhotos.length + index,
            uploadedAt: new Date().toISOString(),
            uploadProgress: 0,
            url: blobUrl,
            width: 0, // will be updated when upload completes
          };
        });

        return [...currentPhotos, ...optimisticPhotos];
      });
    },
    [maxPhotos, onPhotosChange],
  );

  const handleQueuesEnd = useCallback(() => {
    setUploadState((prev) => ({
      ...prev,
      isUploading: false,
    }));
    setIsUploadCancelled(false);
  }, []);

  const handleCancelUpload = useCallback(() => {
    setIsUploadCancelled(true);
    if (uploadWidgetRef.current) {
      uploadWidgetRef.current.close();
    }
    setUploadState((prev) => ({
      ...prev,
      isUploading: false,
    }));
    toast.info('Upload cancelled');
  }, []);

  const removePhoto = useCallback((photo: CloudinaryPhoto) => {
    setPhotoToDelete(photo);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!photoToDelete) return;

    const isPersistedPhoto = bobbleheadId && !photoToDelete.id.startsWith('temp-');

    if (isPersistedPhoto) {
      // set deleting state for visual feedback
      setDeletingPhotoId(photoToDelete.id);

      // store complete previous state for rollback in case of server error
      onPhotosChange((currentPhotos) => {
        // store complete state including isPrimary and sortOrder for each photo
        setPreviousPhotosState([...currentPhotos]);

        // optimistically remove photo
        const updatedPhotos = currentPhotos.filter((p) => p.id !== photoToDelete.id);

        // check if we deleted the primary photo
        const wasPrimaryPhoto = photoToDelete.isPrimary;

        // reorder remaining photos and promote new primary if needed
        const reorderedPhotos = updatedPhotos.map((photo, index) => ({
          ...photo,
          isPrimary: wasPrimaryPhoto && index === 0, // first photo becomes primary if we deleted the primary
          sortOrder: index,
        }));

        return reorderedPhotos;
      });

      // persisted photo - call server action
      await deletePhoto({
        bobbleheadId: bobbleheadId,
        photoId: photoToDelete.id,
      });
      // success/failure handled by onAfterSuccess/onError callbacks
    } else {
      // temp photo - just remove from local state
      onPhotosChange((currentPhotos) => {
        const updatedPhotos = currentPhotos.filter((p) => p.id !== photoToDelete.id);

        // check if we deleted the primary photo
        const wasPrimaryPhoto = photoToDelete.isPrimary;

        // reorder remaining photos and promote new primary if needed
        const reorderedPhotos = updatedPhotos.map((photo, index) => ({
          ...photo,
          isPrimary: wasPrimaryPhoto && index === 0, // first photo becomes primary if we deleted the primary
          sortOrder: index,
        }));

        return reorderedPhotos;
      });

      // close dialog
      setIsDeleteDialogOpen(false);
      setPhotoToDelete(null);
    }
  }, [photoToDelete, bobbleheadId, deletePhoto, onPhotosChange]);

  const updatePhoto = useCallback(
    (photoId: string, updates: Partial<CloudinaryPhoto>) => {
      // update local state immediately
      onPhotosChange((currentPhotos) => {
        const updatedPhotos = currentPhotos.map((photo) =>
          photo.id === photoId ? { ...photo, ...updates } : photo,
        );
        return updatedPhotos;
      });

      // debounce server action for persisted photos only (not temp photos)
      const isPersistedPhoto = bobbleheadId && !photoId.startsWith('temp-');
      const isMetadataUpdate = 'altText' in updates || 'caption' in updates;

      if (isPersistedPhoto && isMetadataUpdate) {
        // clear existing timer for this photo
        const existingTimer = metadataTimersRef.current.get(photoId);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // add to saving state
        setSavingMetadataPhotoIds((prev) => {
          const next = new Set(prev);
          next.add(photoId);
          return next;
        });

        // set new debounced timer
        const timer = setTimeout(() => {
          void updatePhotoMetadata({
            altText: updates.altText,
            bobbleheadId: bobbleheadId,
            caption: updates.caption,
            photoId,
          });
          metadataTimersRef.current.delete(photoId);
        }, CONFIG.SEARCH.DEBOUNCE_MS);

        metadataTimersRef.current.set(photoId, timer);
      }
    },
    [bobbleheadId, onPhotosChange, updatePhotoMetadata],
  );

  const setPrimaryPhoto = useCallback(
    (photoId: string) => {
      // check if this photo is already primary
      const targetPhoto = photos.find((p) => p.id === photoId);
      if (targetPhoto?.isPrimary) return;

      // store pending primary photo id and show confirmation dialog
      setPendingPrimaryPhotoId(photoId);
      setIsPrimaryChangeDialogOpen(true);
    },
    [photos],
  );

  const handleConfirmPrimaryChange = useCallback(() => {
    if (!pendingPrimaryPhotoId) return;

    // trigger animation
    setAnimatingPrimaryPhotoId(pendingPrimaryPhotoId);

    // update primary photo
    onPhotosChange((currentPhotos) => {
      const updatedPhotos = currentPhotos.map((photo) => ({
        ...photo,
        isPrimary: photo.id === pendingPrimaryPhotoId,
      }));
      return updatedPhotos;
    });

    // close dialog and clear pending state
    setIsPrimaryChangeDialogOpen(false);

    // clear animation after 500ms
    setTimeout(() => {
      setAnimatingPrimaryPhotoId(null);
      setPendingPrimaryPhotoId(null);
    }, 500);

    toast.success('Primary photo updated');
  }, [pendingPrimaryPhotoId, onPhotosChange]);

  const handlePhotosReorder = useCallback(
    (reorderedPhotos: Array<CloudinaryPhoto>) => {
      // update local state immediately
      const photosWithUpdatedOrder = reorderedPhotos.map((photo, index) => ({
        ...photo,
        isPrimary: index === 0, // first photo is primary
        sortOrder: index,
      }));

      onPhotosChange(photosWithUpdatedOrder);

      // debounce server action call for persisted photos
      if (bobbleheadId && !isReorderingPhotos) {
        if (reorderTimeoutRef.current) {
          clearTimeout(reorderTimeoutRef.current);
        }

        // set pending state to show "Saving order..." indicator
        setIsReorderPending(true);
        setReorderError(null);
        setIsReorderSuccess(false);

        reorderTimeoutRef.current = setTimeout(() => {
          // only send persisted photos to the server
          const persistedPhotos = photosWithUpdatedOrder.filter((p) => !p.id.startsWith('temp-'));

          if (persistedPhotos.length > 0) {
            void reorderPhotos({
              bobbleheadId,
              photoOrder: persistedPhotos.map((photo) => ({
                id: photo.id,
                sortOrder: photo.sortOrder,
              })),
            });
          } else {
            // no persisted photos to reorder
            setIsReorderPending(false);
          }
        }, CONFIG.FILE_UPLOAD.PHOTO_REORDER_DEBOUNCE_MS);
      }
    },
    [bobbleheadId, isReorderingPhotos, onPhotosChange, reorderPhotos],
  );

  // retry reorder on error
  const handleRetryReorder = useCallback(() => {
    setReorderError(null);
    setIsReorderPending(true);

    // re-trigger reorder with current photos
    const persistedPhotos = photos.filter((p) => !p.id.startsWith('temp-'));

    if (persistedPhotos.length > 0 && bobbleheadId) {
      void reorderPhotos({
        bobbleheadId,
        photoOrder: persistedPhotos.map((photo) => ({
          id: photo.id,
          sortOrder: photo.sortOrder,
        })),
      });
    }
  }, [bobbleheadId, photos, reorderPhotos]);

  // retry failed upload
  const handleRetryUpload = useCallback(
    (photoId: string) => {
      // remove the failed photo
      onPhotosChange((currentPhotos) => {
        const failedPhoto = currentPhotos.find((p) => p.id === photoId);

        // cleanup blob URL if exists
        if (failedPhoto?.blobUrl) {
          URL.revokeObjectURL(failedPhoto.blobUrl);
        }

        return currentPhotos.filter((p) => p.id !== photoId);
      });

      // open upload widget to retry
      if (uploadWidgetRef.current) {
        uploadWidgetRef.current.close();
      }

      toast.info('Please select the file again to retry upload');
    },
    [onPhotosChange],
  );

  // notify parent of upload state changes
  useEffect(() => {
    onUploadStateChange?.(uploadState.isUploading);
  }, [uploadState.isUploading, onUploadStateChange]);

  // cleanup debounce timers, undo timeout, blob URLs, and widget on unmount
  useEffect(() => {
    const metadataTimers = metadataTimersRef.current;
    const reorderTimer = reorderTimeoutRef.current;
    const uploadWidget = uploadWidgetRef.current;

    return () => {
      // clear reorder timer
      if (reorderTimer) {
        clearTimeout(reorderTimer);
        reorderTimeoutRef.current = null;
      }

      // clear all metadata timers
      metadataTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      metadataTimers.clear();

      // clear undo timeout
      if (undoTimeoutId) {
        clearTimeout(undoTimeoutId);
      }

      // cleanup all blob URLs
      photos.forEach((photo) => {
        if (photo.blobUrl) {
          URL.revokeObjectURL(photo.blobUrl);
        }
      });

      // dispose of Cloudinary widget
      if (uploadWidget && typeof uploadWidget === 'object' && 'close' in uploadWidget) {
        try {
          uploadWidget.close();
        } catch {
          // ignore close errors on cleanup
        }
      }
      uploadWidgetRef.current = null;

      // reset state
      setIsReorderPending(false);
      setPreviousPhotosState([]);
    };
  }, [undoTimeoutId, photos]);

  // memory monitoring in development mode
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const memoryCheckInterval = setInterval(() => {
      if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
        const memory = (window.performance as { memory?: { usedJSHeapSize: number } }).memory;
        if (memory && memory.usedJSHeapSize > 100000000) {
          // 100MB threshold
          console.warn(
            '[CloudinaryPhotoUpload] High memory usage detected:',
            (memory.usedJSHeapSize / 1048576).toFixed(2),
            'MB',
            '| Photos loaded:',
            photos.length,
          );
        }
      }
    }, 5000); // check every 5 seconds

    return () => {
      clearInterval(memoryCheckInterval);
    };
  }, [photos.length]);

  // event handlers
  const handleUndoDelete = useCallback(() => {
    // restore previous state
    if (previousPhotosState.length > 0) {
      onPhotosChange(previousPhotosState);
      setPreviousPhotosState([]);
    }

    // clear timeout
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
      setUndoTimeoutId(null);
    }

    toast.success('Photo restored');
  }, [previousPhotosState, undoTimeoutId, onPhotosChange]);

  const handleToggleFaq = useCallback(() => {
    setIsFaqExpanded((prev) => !prev);
  }, []);

  const handleSelectAll = useCallback(() => {
    // only select persisted photos (not temp photos)
    const persistedPhotoIds = photos.filter((p) => !p.id.startsWith('temp-')).map((p) => p.id);
    setSelectedPhotoIds(new Set(persistedPhotoIds));
  }, [photos]);

  const handleClearSelection = useCallback(() => {
    setSelectedPhotoIds(new Set());
  }, []);

  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev);
    // clear selection when exiting selection mode
    if (isSelectionMode) {
      setSelectedPhotoIds(new Set());
    }
  }, [isSelectionMode]);

  const handleTogglePhotoSelection = useCallback((photoId: string) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selectedPhotoIds.size === 0) return;
    setIsBulkDeleteDialogOpen(true);
  }, [selectedPhotoIds.size]);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (selectedPhotoIds.size === 0 || !bobbleheadId) return;

    setIsBulkDeleting(true);

    // store previous state for rollback
    const previousState = [...photos];
    setPreviousPhotosState(previousState);

    // optimistically remove photos
    onPhotosChange((currentPhotos) => {
      const remainingPhotos = currentPhotos.filter((p) => !selectedPhotoIds.has(p.id));

      // check if we deleted the primary photo
      const wasPrimaryPhotoDeleted = currentPhotos.some((p) => p.isPrimary && selectedPhotoIds.has(p.id));

      // reorder remaining photos and promote new primary if needed
      const reorderedPhotos = remainingPhotos.map((photo, index) => ({
        ...photo,
        isPrimary: wasPrimaryPhotoDeleted && index === 0, // first photo becomes primary if we deleted the primary
        sortOrder: index,
      }));

      return reorderedPhotos;
    });

    // execute bulk delete
    try {
      const selectedPhotosArray = Array.from(selectedPhotoIds);
      const deletePromises = selectedPhotosArray.map((photoId) =>
        deletePhoto({
          bobbleheadId: bobbleheadId,
          photoId,
        }),
      );

      await Promise.all(deletePromises);

      // success - close dialog and clear selection
      setIsBulkDeleteDialogOpen(false);
      setSelectedPhotoIds(new Set());
      setIsSelectionMode(false);
      setPreviousPhotosState([]);
      setIsBulkDeleting(false);

      toast.success(
        `${selectedPhotoIds.size} photo${selectedPhotoIds.size === 1 ? '' : 's'} deleted successfully!`,
        {
          action: {
            label: 'Undo',
            onClick: handleUndoDelete,
          },
          duration: 5000,
        },
      );

      // set up undo timeout
      const timeoutId = setTimeout(() => {
        setPreviousPhotosState([]);
        setUndoTimeoutId(null);
      }, 5000);

      setUndoTimeoutId(timeoutId);
    } catch (error) {
      // rollback on error
      if (previousState.length > 0) {
        onPhotosChange(previousState);
        setPreviousPhotosState([]);
      }
      setIsBulkDeleting(false);

      Sentry.captureException(error, {
        extra: {
          operation: 'bulk-delete-photos',
          photoCount: selectedPhotoIds.size,
        },
        level: 'error',
        tags: {
          component: 'cloudinary-photo-upload',
        },
      });

      toast.error('Failed to delete photos. Please try again.');
    }
  }, [selectedPhotoIds, bobbleheadId, photos, deletePhoto, onPhotosChange, handleUndoDelete]);

  // keyboard shortcuts for bulk selection
  useEffect(() => {
    if (!isSelectionMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // select all: Cmd/Ctrl + A
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        handleSelectAll();
      }

      // clear selection: Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        if (selectedPhotoIds.size > 0) {
          handleClearSelection();
        } else {
          setIsSelectionMode(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelectionMode, handleSelectAll, handleClearSelection, selectedPhotoIds.size]);

  // utility functions
  const calculateUploadSpeed = useCallback((fileProgress: FileUploadProgress): number => {
    const elapsedTime = (Date.now() - fileProgress.startTime) / 1000; // seconds
    if (elapsedTime === 0) return 0;
    return fileProgress.bytesUploaded / elapsedTime; // bytes per second
  }, []);

  const calculateTimeRemaining = useCallback(
    (fileProgress: FileUploadProgress): number => {
      const speed = calculateUploadSpeed(fileProgress);
      if (speed === 0) return 0;
      const remainingBytes = fileProgress.totalBytes - fileProgress.bytesUploaded;
      return remainingBytes / speed; // seconds
    },
    [calculateUploadSpeed],
  );

  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  }, []);

  const formatSpeed = useCallback(
    (bytesPerSecond: number): string => {
      return `${formatBytes(bytesPerSecond)}/s`;
    },
    [formatBytes],
  );

  const formatTimeRemaining = useCallback((seconds: number): string => {
    if (seconds === 0 || !isFinite(seconds)) return 'Calculating...';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  }, []);

  // derived values for conditional rendering
  const _hasPhotos = photos.length > 0;
  const _isAtMaxPhotos = photos.length >= maxPhotos;
  const _isNearMaxPhotos = photos.length === maxPhotos - 1;
  const _remainingPhotoSlots = maxPhotos - photos.length;
  const _uploadingFiles = Array.from(uploadState.fileProgress.values()).filter(
    (f) => !f.isComplete && !f.isFailed,
  );
  const _failedFiles = Array.from(uploadState.fileProgress.values()).filter((f) => f.isFailed);
  const _completedFiles = Array.from(uploadState.fileProgress.values()).filter((f) => f.isComplete);
  const _hasFailedFiles = _failedFiles.length > 0;
  const _hasCompletedFiles = _completedFiles.length > 0;
  const _hasPersistedPhotos = photos.some((p) => !p.id.startsWith('temp-'));
  const _hasSelectedPhotos = selectedPhotoIds.size > 0;
  const _selectedPhotosArray = photos.filter((p) => selectedPhotoIds.has(p.id));
  const _canBulkDelete = _hasSelectedPhotos && bobbleheadId;

  return (
    <div className={'space-y-4'}>
      {/* Upload Widget */}
      <CldUploadWidget
        onError={handleError}
        onQueuesEnd={handleQueuesEnd}
        // @ts-expect-error investigate missing types after mvp
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
          maxFiles: Math.max(0, maxPhotos - photos.length),
          maxFileSize: 10485760, // 10MB
          multiple: true,
          resourceType: 'image',
          showAdvancedOptions: false,
          showCompletedButton: true,
          showPoweredBy: false,
          showSkipCropButton: true,
          sources: ['local', 'camera', 'url'],
          tags: ['bobblehead', userId ?? 'unknown', `upload-${crypto.randomUUID()}`],
        }}
        signatureEndpoint={'/api/upload/sign'}
      >
        {({ open, widget }) => {
          if (widget && !uploadWidgetRef.current && typeof widget === 'object' && 'close' in widget) {
            uploadWidgetRef.current = widget as { close: () => void };
          }

          return (
            <Button
              className={'h-32 w-full border-dashed'}
              disabled={isDisabled || uploadState.isUploading || _isAtMaxPhotos}
              onClick={() => open()}
              type={'button'}
              variant={'outline'}
            >
              <div className={'flex flex-col items-center gap-2'}>
                <ImagePlusIcon aria-hidden className={'size-8'} />
                <span>
                  {_isAtMaxPhotos ?
                    'Maximum 8 photos reached'
                  : uploadState.isUploading ?
                    'Uploading...'
                  : `Add Photos (${photos.length}/${maxPhotos})`}
                </span>
                <Conditional isCondition={uploadState.isUploading}>
                  <Progress
                    className={'w-32'}
                    value={(uploadState.uploadedCount / Math.max(uploadState.totalCount, 1)) * 100}
                  />
                </Conditional>
              </div>
            </Button>
          );
        }}
      </CldUploadWidget>

      {/* Individual File Upload Progress */}
      <Conditional isCondition={uploadState.isUploading && _uploadingFiles.length > 0}>
        <div className={'space-y-3'}>
          {/* Upload Progress Header */}
          <div className={'flex items-center justify-between'}>
            <h3 className={'text-sm font-medium'}>
              Uploading {_uploadingFiles.length} {_uploadingFiles.length === 1 ? 'file' : 'files'}
            </h3>
            <Button onClick={handleCancelUpload} size={'sm'} type={'button'} variant={'ghost'}>
              <XIcon aria-hidden className={'size-4'} />
              Cancel
            </Button>
          </div>

          {/* Individual File Progress (max 3 visible) */}
          <div className={'space-y-2'}>
            {_uploadingFiles.slice(0, 3).map((file) => {
              const progress = (file.bytesUploaded / file.totalBytes) * 100;
              const speed = calculateUploadSpeed(file);
              const timeRemaining = calculateTimeRemaining(file);

              return (
                <div
                  className={'rounded-md border bg-muted/50 p-3 text-sm transition-all'}
                  key={file.filename}
                >
                  <div className={'mb-2 flex items-center justify-between'}>
                    <span className={'truncate font-medium'}>{file.filename}</span>
                    <span className={'text-xs text-muted-foreground'}>{Math.round(progress)}%</span>
                  </div>
                  <Progress className={'mb-2 h-1.5'} value={progress} />
                  <div className={'flex items-center justify-between text-xs text-muted-foreground'}>
                    <span>
                      {formatBytes(file.bytesUploaded)} / {formatBytes(file.totalBytes)}
                    </span>
                    <div className={'flex items-center gap-2'}>
                      <span>{formatSpeed(speed)}</span>
                      <span>·</span>
                      <span>{formatTimeRemaining(timeRemaining)} remaining</span>
                    </div>
                  </div>
                  <Conditional isCondition={!!file.error && file.retryCount > 0}>
                    <div className={'mt-2 flex items-center gap-1 text-xs text-amber-600'}>
                      <RefreshCwIcon aria-hidden className={'size-3'} />
                      <span>Retrying... (Attempt {file.retryCount + 1})</span>
                    </div>
                  </Conditional>
                </div>
              );
            })}

            {/* Collapsed Files Indicator */}
            <Conditional isCondition={_uploadingFiles.length > 3}>
              <div className={'text-center text-xs text-muted-foreground'}>
                + {_uploadingFiles.length - 3} more {_uploadingFiles.length - 3 === 1 ? 'file' : 'files'}{' '}
                uploading...
              </div>
            </Conditional>
          </div>
        </div>
      </Conditional>

      {/* Upload Complete Summary */}
      <Conditional isCondition={!uploadState.isUploading && (_hasCompletedFiles || _hasFailedFiles)}>
        <div className={'space-y-2 rounded-md border p-4'}>
          <h3 className={'text-sm font-medium'}>Upload Complete</h3>

          {/* Completed Files */}
          <Conditional isCondition={_hasCompletedFiles}>
            <div className={'flex items-center gap-2 text-sm text-green-600'}>
              <CheckIcon aria-hidden className={'size-4'} />
              <span>
                {_completedFiles.length} {_completedFiles.length === 1 ? 'file' : 'files'} uploaded
                successfully
              </span>
            </div>
          </Conditional>

          {/* Failed Files */}
          <Conditional isCondition={_hasFailedFiles}>
            <div className={'space-y-2'}>
              <div className={'flex items-center gap-2 text-sm text-destructive'}>
                <AlertCircleIcon aria-hidden className={'size-4'} />
                <span>
                  {_failedFiles.length} {_failedFiles.length === 1 ? 'file' : 'files'} failed to upload
                </span>
              </div>
              <ul className={'ml-6 space-y-1 text-xs text-muted-foreground'}>
                {_failedFiles.map((file) => (
                  <li key={file.filename}>
                    <span className={'font-medium'}>{file.filename}:</span> {file.error || 'Unknown error'}
                  </li>
                ))}
              </ul>
            </div>
          </Conditional>
        </div>
      </Conditional>

      {/* Photo Progress Indicator */}
      <div className={'space-y-2'}>
        <div className={'flex items-center justify-between text-sm text-muted-foreground'}>
          <span>
            {photos.length} of {maxPhotos} photos
          </span>
          <span className={'font-medium'}>
            {_remainingPhotoSlots} {_remainingPhotoSlots === 1 ? 'slot' : 'slots'} remaining
          </span>
        </div>
        <Progress className={'h-2'} value={(photos.length / maxPhotos) * 100} />
      </div>

      {/* Info Callout - One Photo Left */}
      <Conditional isCondition={_isNearMaxPhotos && !_isAtMaxPhotos}>
        <div
          className={
            'flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30'
          }
        >
          <InfoIcon aria-hidden className={'size-5 shrink-0 text-blue-600 dark:text-blue-400'} />
          <div className={'flex-1 space-y-1'}>
            <div className={'font-medium text-blue-900 dark:text-blue-100'}>Almost at the limit!</div>
            <div className={'text-sm text-blue-700 dark:text-blue-300'}>
              You can add 1 more photo to reach the maximum of {maxPhotos} photos.
            </div>
          </div>
        </div>
      </Conditional>

      {/* Warning Callout - Maximum Reached */}
      <Conditional isCondition={_isAtMaxPhotos}>
        <div
          className={
            'flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30'
          }
        >
          <AlertCircleIcon aria-hidden className={'size-5 shrink-0 text-amber-600 dark:text-amber-400'} />
          <div className={'flex-1 space-y-1'}>
            <div className={'font-medium text-amber-900 dark:text-amber-100'}>
              Maximum photo limit reached
            </div>
            <div className={'text-sm text-amber-700 dark:text-amber-300'}>
              You have reached the maximum of {maxPhotos} photos. Delete a photo to add another.
            </div>
          </div>
        </div>
      </Conditional>

      {/* FAQ Section */}
      <div className={'rounded-md border bg-muted/50'}>
        <button
          className={
            'flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted'
          }
          onClick={handleToggleFaq}
          type={'button'}
        >
          <div className={'flex items-center gap-2'}>
            <InfoIcon aria-hidden className={'size-4 text-muted-foreground'} />
            <span className={'text-sm font-medium'}>Why is there an 8-photo limit?</span>
          </div>
          {isFaqExpanded ?
            <ChevronUpIcon aria-hidden className={'size-4 text-muted-foreground'} />
          : <ChevronDownIcon aria-hidden className={'size-4 text-muted-foreground'} />}
        </button>
        <Conditional isCondition={isFaqExpanded}>
          <div className={'border-t bg-background p-4 text-sm text-muted-foreground'}>
            <div className={'space-y-3'}>
              <p>
                The 8-photo limit helps maintain optimal performance and ensures a great browsing experience
                for all users. Here&apos;s why:
              </p>
              <ul className={'ml-4 list-disc space-y-2'}>
                <li>
                  <strong className={'text-foreground'}>Faster Loading:</strong> Fewer photos mean pages load
                  quicker, especially on mobile devices
                </li>
                <li>
                  <strong className={'text-foreground'}>Better Organization:</strong> A focused set of photos
                  encourages you to showcase your best angles
                </li>
                <li>
                  <strong className={'text-foreground'}>Storage Efficiency:</strong> Helps us keep the
                  platform sustainable and responsive for everyone
                </li>
                <li>
                  <strong className={'text-foreground'}>Quality Over Quantity:</strong> Eight photos is the
                  sweet spot to fully showcase your bobblehead without overwhelming viewers
                </li>
              </ul>
              <p className={'text-xs italic'}>
                Tip: Delete less important photos and add new ones to keep your collection fresh and relevant!
              </p>
            </div>
          </div>
        </Conditional>
      </div>

      {/* Upload In Progress Warning */}
      <Conditional isCondition={uploadState.isUploading}>
        <div
          className={
            'flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30'
          }
        >
          <InfoIcon aria-hidden className={'size-5 shrink-0 text-blue-600 dark:text-blue-400'} />
          <div className={'flex-1 space-y-1'}>
            <div className={'font-medium text-blue-900 dark:text-blue-100'}>Upload in progress</div>
            <div className={'text-sm text-blue-700 dark:text-blue-300'}>
              Please wait for all uploads to complete before submitting the form.
            </div>
          </div>
        </div>
      </Conditional>

      {/* Upload Error */}
      <Conditional isCondition={!!uploadState.error && !uploadState.isUploading}>
        <div className={'rounded-md bg-red-50 p-3 text-sm text-destructive'}>
          Upload error: {uploadState.error}
        </div>
      </Conditional>

      {/* Photo Grid */}
      <Conditional isCondition={_hasPhotos}>
        <div className={'space-y-3'}>
          {/* Selection Mode Controls */}
          <Conditional isCondition={_hasPersistedPhotos}>
            <div className={'flex items-center justify-between gap-3'}>
              <Button
                aria-label={
                  isSelectionMode ? 'Exit selection mode' : 'Enter selection mode to select multiple photos'
                }
                onClick={handleToggleSelectionMode}
                size={'sm'}
                type={'button'}
                variant={isSelectionMode ? 'default' : 'outline'}
              >
                {isSelectionMode ?
                  <Fragment>
                    <XIcon aria-hidden className={'mr-2 size-4'} />
                    Exit Selection
                  </Fragment>
                : <Fragment>
                    <CheckCircleIcon aria-hidden className={'mr-2 size-4'} />
                    Select Multiple
                  </Fragment>
                }
              </Button>

              {/* Keyboard Shortcuts Info */}
              <Conditional isCondition={isSelectionMode}>
                <div className={'flex items-center gap-2 text-xs text-muted-foreground'}>
                  <kbd className={'rounded border bg-muted px-1.5 py-0.5 font-mono'}>Ctrl+A</kbd>
                  <span>Select all</span>
                  <span>·</span>
                  <kbd className={'rounded border bg-muted px-1.5 py-0.5 font-mono'}>Esc</kbd>
                  <span>Clear</span>
                </div>
              </Conditional>
            </div>
          </Conditional>

          {/* Bulk Action Toolbar */}
          <Conditional isCondition={isSelectionMode && _hasSelectedPhotos}>
            <div
              className={cn(
                'flex items-center justify-between gap-3 rounded-md border border-primary bg-primary/10 p-3',
                'animate-in duration-200 fade-in slide-in-from-top-2',
              )}
            >
              <div className={'flex items-center gap-2'}>
                <CheckCircleIcon aria-hidden className={'size-5 text-primary'} />
                <span className={'font-medium text-primary'}>
                  {selectedPhotoIds.size} photo{selectedPhotoIds.size === 1 ? '' : 's'} selected
                </span>
              </div>

              <div className={'flex items-center gap-2'}>
                <Button
                  aria-label={`Delete ${selectedPhotoIds.size} selected photo${selectedPhotoIds.size === 1 ? '' : 's'}`}
                  disabled={!_canBulkDelete || isBulkDeleting}
                  onClick={handleBulkDelete}
                  size={'sm'}
                  type={'button'}
                  variant={'destructive'}
                >
                  <Trash2Icon aria-hidden className={'mr-2 size-4'} />
                  Delete Selected ({selectedPhotoIds.size})
                </Button>
                <Button
                  aria-label={'Clear selection'}
                  onClick={handleClearSelection}
                  size={'sm'}
                  type={'button'}
                  variant={'outline'}
                >
                  <XIcon aria-hidden className={'mr-2 size-4'} />
                  Clear Selection
                </Button>
              </div>
            </div>
          </Conditional>

          {/* Reorder Status Indicator */}
          <Conditional isCondition={isReorderPending || isReorderSuccess || !!reorderError}>
            <div className={'flex items-center justify-center gap-2 rounded-md bg-muted p-2 text-sm'}>
              <Conditional isCondition={isReorderPending}>
                <div className={'flex items-center gap-2 text-muted-foreground'}>
                  <div
                    className={
                      'size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent'
                    }
                  />
                  <span>Saving order...</span>
                </div>
              </Conditional>

              <Conditional isCondition={isReorderSuccess}>
                <div className={'flex items-center gap-2 text-green-600'}>
                  <CheckIcon aria-hidden className={'size-4'} />
                  <span>Order saved!</span>
                </div>
              </Conditional>

              <Conditional isCondition={!!reorderError}>
                <div className={'flex items-center gap-2 text-destructive'}>
                  <XIcon aria-hidden className={'size-4'} />
                  <span>{reorderError}</span>
                  <Button
                    className={'ml-2 h-6 gap-1 px-2 text-xs'}
                    onClick={handleRetryReorder}
                    size={'sm'}
                    variant={'outline'}
                  >
                    <RefreshCwIcon aria-hidden className={'size-3'} />
                    Retry
                  </Button>
                </div>
              </Conditional>
            </div>
          </Conditional>

          {/* Sortable Photo Grid */}
          <Sortable.Root
            flatCursor={isReorderingPhotos || isDisabled}
            getItemValue={(photo) => photo.id}
            onValueChange={handlePhotosReorder}
            value={photos.sort((a, b) => a.sortOrder - b.sortOrder)}
          >
            <Sortable.Content className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
              {photos
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((photo) => (
                  <Sortable.Item asChild key={photo.id} value={photo.id}>
                    <Card
                      className={cn(
                        'relative overflow-hidden transition-all duration-500',
                        isReorderPending && 'animate-pulse border-primary',
                        photo.isPrimary && 'border-2 border-yellow-500 shadow-lg shadow-yellow-500/20',
                        animatingPrimaryPhotoId === photo.id && 'animate-pulse border-yellow-500',
                        isSelectionMode &&
                          selectedPhotoIds.has(photo.id) &&
                          'border-2 border-primary ring-2 ring-primary/20',
                      )}
                    >
                      <CardContent className={'p-4'}>
                        <div className={'space-y-3'}>
                          {/* Selection Checkbox */}
                          <Conditional isCondition={isSelectionMode && !photo.id.startsWith('temp-')}>
                            <div className={'flex items-center gap-2'}>
                              <Checkbox
                                aria-label={`Select photo${photo.altText ? `: ${photo.altText}` : ''}`}
                                checked={selectedPhotoIds.has(photo.id)}
                                id={`select-${photo.id}`}
                                onCheckedChange={() => handleTogglePhotoSelection(photo.id)}
                              />
                              <Label className={'text-sm font-medium'} htmlFor={`select-${photo.id}`}>
                                {selectedPhotoIds.has(photo.id) ? 'Selected' : 'Select this photo'}
                              </Label>
                            </div>
                          </Conditional>
                          {/* Primary Photo Label */}
                          <Conditional isCondition={photo.isPrimary}>
                            <div
                              className={cn(
                                'flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-2',
                                'border border-yellow-200 dark:border-yellow-800 dark:bg-yellow-950/30',
                              )}
                            >
                              <StarIcon
                                aria-hidden
                                className={
                                  'size-4 fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400'
                                }
                              />
                              <span className={'text-sm font-semibold text-yellow-900 dark:text-yellow-100'}>
                                Primary Photo (Cover Image)
                              </span>
                            </div>
                          </Conditional>

                          {/* Image Preview */}
                          <div
                            className={cn(
                              'relative aspect-square overflow-hidden rounded-lg',
                              photo.isUploading && 'animate-pulse ring-2 ring-primary ring-offset-2',
                            )}
                          >
                            {photo.blobUrl ?
                              <img
                                alt={photo.altText || 'Uploading photo'}
                                className={'h-full w-full object-cover'}
                                src={photo.blobUrl}
                              />
                            : <CldImage
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
                            }

                            {/* Uploading Overlay */}
                            <Conditional isCondition={!!photo.isUploading && !photo.uploadError}>
                              <div
                                className={'absolute inset-0 flex items-center justify-center bg-black/70'}
                              >
                                <div className={'flex flex-col items-center gap-3 text-white'}>
                                  <div
                                    className={
                                      'size-12 animate-spin rounded-full border-4 border-white border-t-transparent'
                                    }
                                  />
                                  <div className={'text-center'}>
                                    <div className={'text-sm font-medium'}>Uploading...</div>
                                    <Conditional isCondition={typeof photo.uploadProgress === 'number'}>
                                      <div className={'mt-1 text-xs'}>{photo.uploadProgress}%</div>
                                    </Conditional>
                                  </div>
                                </div>
                              </div>
                            </Conditional>

                            {/* Upload Error Overlay */}
                            <Conditional isCondition={!!photo.uploadError}>
                              <div
                                className={'absolute inset-0 flex items-center justify-center bg-red-900/90'}
                              >
                                <div className={'flex flex-col items-center gap-3 px-4 text-white'}>
                                  <AlertCircleIcon aria-hidden className={'size-8'} />
                                  <div className={'text-center'}>
                                    <div className={'text-sm font-medium'}>Upload Failed</div>
                                    <div className={'mt-1 text-xs'}>{photo.uploadError}</div>
                                  </div>
                                  <Button
                                    className={'mt-2'}
                                    onClick={() => handleRetryUpload(photo.id)}
                                    size={'sm'}
                                    type={'button'}
                                    variant={'secondary'}
                                  >
                                    <RefreshCwIcon aria-hidden className={'mr-1 size-3'} />
                                    Retry
                                  </Button>
                                </div>
                              </div>
                            </Conditional>

                            {/* Deleting Overlay */}
                            <Conditional isCondition={deletingPhotoId === photo.id}>
                              <div
                                className={'absolute inset-0 flex items-center justify-center bg-black/70'}
                              >
                                <div className={'flex flex-col items-center gap-2 text-white'}>
                                  <div
                                    className={
                                      'size-8 animate-spin rounded-full border-4 border-white border-t-transparent'
                                    }
                                  />
                                  <span className={'text-sm font-medium'}>Deleting...</span>
                                </div>
                              </div>
                            </Conditional>

                            {/* Controls Overlay */}
                            <Conditional isCondition={!photo.isUploading && !photo.uploadError}>
                              <div
                                className={
                                  'absolute inset-0 bg-black/50 opacity-0 transition-opacity hover:opacity-100'
                                }
                              >
                                <div className={'flex h-full w-full items-center justify-center gap-2'}>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
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
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          {photo.isPrimary ?
                                            'This is your primary photo'
                                          : 'Set as primary photo / Cover image'}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  {/* Drag Handle */}
                                  <Sortable.ItemHandle
                                    aria-label={'Drag to reorder photo'}
                                    className={cn(
                                      'flex size-8 items-center justify-center',
                                      'rounded bg-secondary text-secondary-foreground',
                                      'hover:bg-secondary/80 active:scale-110',
                                      'transition-transform',
                                    )}
                                    disabled={isReorderingPhotos || isDisabled}
                                  >
                                    <MoveIcon aria-hidden className={'size-4'} />
                                  </Sortable.ItemHandle>

                                  <Button
                                    className={'size-8 p-0'}
                                    onClick={() => removePhoto(photo)}
                                    size={'sm'}
                                    type={'button'}
                                    variant={'destructive'}
                                  >
                                    <XIcon aria-hidden className={'size-4'} />
                                  </Button>
                                </div>
                              </div>
                            </Conditional>

                            {/* Primary Badge (Top Corner) */}
                            <Conditional isCondition={photo.isPrimary}>
                              <div className={'absolute top-2 left-2'}>
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1 rounded-full',
                                    'bg-yellow-500 px-2 py-1 text-xs font-semibold text-white',
                                    'shadow-md dark:bg-yellow-400 dark:text-yellow-950',
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
                              <div className={'flex items-center justify-between'}>
                                <Label className={'text-xs'} htmlFor={`alt-${photo.id}`}>
                                  Alt Text
                                </Label>
                                <Conditional isCondition={savingMetadataPhotoIds.has(photo.id)}>
                                  <div className={'flex items-center gap-1 text-xs text-muted-foreground'}>
                                    <CheckIcon aria-hidden className={'size-3'} />
                                    <span>Saving...</span>
                                  </div>
                                </Conditional>
                              </div>
                              <Input
                                className={'h-8 text-xs'}
                                disabled={photo.isUploading || !!photo.uploadError}
                                id={`alt-${photo.id}`}
                                onChange={(e) => {
                                  updatePhoto(photo.id, { altText: e.target.value });
                                }}
                                placeholder={photo.isUploading ? 'Uploading...' : 'Describe this photo'}
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
                                disabled={photo.isUploading || !!photo.uploadError}
                                id={`caption-${photo.id}`}
                                onChange={(e) => {
                                  updatePhoto(photo.id, { caption: e.target.value });
                                }}
                                placeholder={photo.isUploading ? 'Uploading...' : 'Add a caption...'}
                                rows={2}
                                value={photo.caption || ''}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Sortable.Item>
                ))}
            </Sortable.Content>
          </Sortable.Root>
        </div>
      </Conditional>

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setIsDeleteDialogOpen} open={isDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingPhoto}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isDeletingPhoto} onClick={handleConfirmDelete}>
              {isDeletingPhoto ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Primary Photo Change Confirmation Dialog */}
      <AlertDialog onOpenChange={setIsPrimaryChangeDialogOpen} open={isPrimaryChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Primary Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current cover photo. The new primary photo will be displayed on your
              bobblehead&apos;s main listing and profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPrimaryChange}>Change Primary</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setIsBulkDeleteDialogOpen} open={isBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedPhotoIds.size} Photo{selectedPhotoIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedPhotoIds.size} selected photo
              {selectedPhotoIds.size === 1 ? '' : 's'}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Preview Selected Photos */}
          <Conditional isCondition={_selectedPhotosArray.length > 0}>
            <div className={'space-y-2'}>
              <p className={'text-sm font-medium'}>Photos to be deleted:</p>
              <div className={'grid grid-cols-4 gap-2'}>
                {_selectedPhotosArray.slice(0, 8).map((photo) => (
                  <div className={'relative aspect-square overflow-hidden rounded-md border'} key={photo.id}>
                    {photo.blobUrl ?
                      <img
                        alt={photo.altText || 'Photo to delete'}
                        className={'h-full w-full object-cover'}
                        src={photo.blobUrl}
                      />
                    : <CldImage
                        alt={photo.altText || 'Photo to delete'}
                        className={'h-full w-full object-cover'}
                        crop={'fill'}
                        format={'auto'}
                        gravity={'auto'}
                        height={100}
                        quality={'auto:low'}
                        src={photo.publicId}
                        width={100}
                      />
                    }
                  </div>
                ))}
              </div>
              <Conditional isCondition={_selectedPhotosArray.length > 8}>
                <p className={'text-xs text-muted-foreground'}>
                  + {_selectedPhotosArray.length - 8} more photo
                  {_selectedPhotosArray.length - 8 === 1 ? '' : 's'}
                </p>
              </Conditional>
            </div>
          </Conditional>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isBulkDeleting} onClick={handleConfirmBulkDelete}>
              {isBulkDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
