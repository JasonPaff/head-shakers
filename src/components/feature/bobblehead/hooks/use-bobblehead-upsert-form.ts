'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { useStore } from '@tanstack/react-form';
import { useCallback, useMemo, useState } from 'react';

import type { CloudinaryPhoto } from '@/lib/validations/photo-upload.validation';

import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { useServerAction } from '@/hooks/use-server-action';
import {
  createBobbleheadWithPhotosAction,
  updateBobbleheadWithPhotosAction,
} from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { DEFAULTS } from '@/lib/constants';
import {
  createBobbleheadWithPhotosSchema,
  updateBobbleheadWithPhotosSchema,
} from '@/lib/validations/bobbleheads.validation';

import type {
  BobbleheadForUpsert,
  CreateBobbleheadFormValues,
  FormPhotos,
  UpdateBobbleheadFormValues,
} from '../bobblehead-upsert-form.types';

/**
 * Result type returned after successful bobblehead creation/update.
 */
export interface BobbleheadCreatedResult {
  id: string;
  name: string;
  slug: string;
}

/**
 * UI labels for form elements based on mode.
 */
export interface BobbleheadFormLabels {
  description: string;
  submitButton: string;
  submitButtonLoading: string;
  title: string;
}

/**
 * Options for the useBobbleheadUpsertForm hook.
 */
export interface UseBobbleheadUpsertFormOptions {
  /** Existing bobblehead data for edit mode. Undefined for create mode. */
  bobblehead?: BobbleheadForUpsert;
  /** The collection ID where the bobblehead will be created/lives. */
  collectionId: string;
  /** Callback fired after successful create/update. */
  onSuccess?: (result: BobbleheadCreatedResult) => void;
}

/**
 * Hook for managing bobblehead create/edit form state.
 *
 * Follows the pattern from useCollectionUpsertForm:
 * - Mode detection based on bobblehead prop presence
 * - Server action selection based on mode (create vs update)
 * - Default values from existing data or DEFAULTS constants
 * - Separate photo state management
 * - Focus context integration for error focus management
 * - Proper validation schema selection
 * - UI labels based on mode
 */
export function useBobbleheadUpsertForm({
  bobblehead,
  collectionId,
  onSuccess,
}: UseBobbleheadUpsertFormOptions) {
  const isEditMode = !!bobblehead;

  // Manage photos array separately from form state
  // This allows for more flexible photo management (add, remove, reorder)
  const [photos, setPhotos] = useState<FormPhotos>([]);

  const { focusFirstError } = useFocusContext();

  // Use separate server action hooks for create and update
  // This pattern is used when action inputs have different schemas
  const { executeAsync: createAsync, isExecuting: isCreating } = useServerAction(
    createBobbleheadWithPhotosAction,
    {
      breadcrumbContext: {
        action: 'create-bobblehead',
        component: 'BobbleheadUpsertForm',
      },
      loadingMessage: 'Creating bobblehead...',
      onAfterSuccess: (data) => {
        // Create action returns { bobblehead, collectionSlug, photos }
        onSuccess?.({
          id: data.bobblehead.id,
          name: data.bobblehead.name,
          slug: data.bobblehead.slug,
        });
      },
    },
  );

  const { executeAsync: updateAsync, isExecuting: isUpdating } = useServerAction(
    updateBobbleheadWithPhotosAction,
    {
      breadcrumbContext: {
        action: 'update-bobblehead',
        component: 'BobbleheadUpsertForm',
      },
      loadingMessage: 'Updating bobblehead...',
      onAfterSuccess: (data) => {
        // Update action returns { bobblehead, photos, tags }
        const result = data.bobblehead as { id: string; name: string; slug: string };
        onSuccess?.({
          id: result.id,
          name: result.name,
          slug: result.slug,
        });
      },
    },
  );

  const _isExecuting = isCreating || isUpdating;

  // Select appropriate schema based on mode
  const schema = isEditMode ? updateBobbleheadWithPhotosSchema : createBobbleheadWithPhotosSchema;

  // Build default values based on mode
  const defaultValues = useMemo(() => {
    if (isEditMode && bobblehead) {
      // Edit mode: populate with existing bobblehead data
      return {
        acquisitionDate:
          bobblehead.acquisitionDate ? bobblehead.acquisitionDate.toISOString().split('T')[0] : '',
        acquisitionMethod: bobblehead.acquisitionMethod || '',
        category: bobblehead.category || '',
        characterName: bobblehead.characterName || '',
        collectionId: bobblehead.collectionId,
        currentCondition: bobblehead.currentCondition || DEFAULTS.BOBBLEHEAD.CONDITION,
        customFields: bobblehead.customFields || [],
        description: bobblehead.description || '',
        height: bobblehead.height?.toString() || '',
        id: bobblehead.id,
        isFeatured: bobblehead.isFeatured ?? DEFAULTS.BOBBLEHEAD.IS_FEATURED,
        isPublic: bobblehead.isPublic ?? DEFAULTS.BOBBLEHEAD.IS_PUBLIC,
        manufacturer: bobblehead.manufacturer || '',
        material: bobblehead.material || '',
        name: bobblehead.name,
        photos: [],
        purchaseLocation: bobblehead.purchaseLocation || '',
        purchasePrice: bobblehead.purchasePrice?.toString() || '',
        series: bobblehead.series || '',
        status: bobblehead.status || DEFAULTS.BOBBLEHEAD.STATUS,
        tags: bobblehead.tags?.map((tag) => tag.name) || [],
        weight: bobblehead.weight?.toString() || '',
        year: bobblehead.year?.toString() || '',
      } as UpdateBobbleheadFormValues;
    }

    // Create mode: use default values
    return {
      acquisitionDate: '',
      acquisitionMethod: '',
      category: '',
      characterName: '',
      collectionId,
      currentCondition: DEFAULTS.BOBBLEHEAD.CONDITION,
      customFields: [],
      description: '',
      height: '',
      isFeatured: DEFAULTS.BOBBLEHEAD.IS_FEATURED,
      isPublic: DEFAULTS.BOBBLEHEAD.IS_PUBLIC,
      manufacturer: '',
      material: '',
      name: '',
      photos: [],
      purchaseLocation: '',
      purchasePrice: '',
      series: '',
      status: DEFAULTS.BOBBLEHEAD.STATUS,
      tags: [],
      weight: '',
      year: '',
    } as CreateBobbleheadFormValues;
  }, [bobblehead, collectionId, isEditMode]);

  const form = useAppForm({
    canSubmitWhenInvalid: true,
    defaultValues,
    onSubmit: async ({ value }) => {
      // Merge the photos array into the form value and call appropriate action
      if (isEditMode) {
        await updateAsync({ ...value, photos } as UpdateBobbleheadFormValues);
      } else {
        await createAsync({ ...value, photos } as CreateBobbleheadFormValues);
      }
    },
    onSubmitInvalid: ({ formApi }) => {
      focusFirstError(formApi);
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: {
      onSubmit: schema,
    },
  });

  const [isSubmitting] = useStore(form.store, (state) => [state.isSubmitting]);

  // Photo management handlers
  // Use setPhotos directly since it supports both array and function updater patterns
  // This matches the CloudinaryPhotoUpload component's onPhotosChange signature
  const handlePhotosChange = setPhotos;

  const handlePhotoAdd = useCallback((photo: CloudinaryPhoto) => {
    setPhotos((prev) => [...prev, photo]);
  }, []);

  const handlePhotoRemove = useCallback((publicId: string) => {
    setPhotos((prev) => prev.filter((p) => p.publicId !== publicId));
  }, []);

  const handlePhotosReorder = useCallback((reorderedPhotos: FormPhotos) => {
    setPhotos(reorderedPhotos);
  }, []);

  // Reset form and photos
  const resetForm = useCallback(() => {
    form.reset();
    setPhotos([]);
  }, [form]);

  // UI labels based on mode
  const labels: BobbleheadFormLabels = useMemo(
    () => ({
      description:
        isEditMode ?
          'Update the details of your bobblehead below. You can change the name, description, and other attributes.'
        : 'Add a new bobblehead to your collection. Fill in the details below and upload photos.',
      submitButton: isEditMode ? 'Update Bobblehead' : 'Create Bobblehead',
      submitButtonLoading: isEditMode ? 'Updating...' : 'Creating...',
      title: isEditMode ? 'Edit Bobblehead' : 'Add New Bobblehead',
    }),
    [isEditMode],
  );

  return {
    form,
    handlePhotoAdd,
    handlePhotoRemove,
    handlePhotosChange,
    handlePhotosReorder,
    isEditMode,
    isExecuting: _isExecuting,
    isSubmitting,
    labels,
    photos,
    resetForm,
  };
}
