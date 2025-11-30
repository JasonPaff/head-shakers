'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { useStore } from '@tanstack/react-form';
import { useCallback, useMemo, useState } from 'react';

import type { InsertCollectionInput, UpdateCollectionInput } from '@/lib/validations/collections.validation';

import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { useServerAction } from '@/hooks/use-server-action';
import {
  createCollectionAction,
  updateCollectionAction,
} from '@/lib/actions/collections/collections.actions';
import { DEFAULTS } from '@/lib/constants';
import { insertCollectionSchema, updateCollectionSchema } from '@/lib/validations/collections.validation';

import type { CollectionForUpsert } from '../collection-upsert-dialog.types';

export interface UseCollectionUpsertFormLabels {
  description: string;
  submitButton: string;
  submitButtonLoading: string;
  title: string;
}

export interface UseCollectionUpsertFormOptions {
  collection?: CollectionForUpsert;
  onSuccess?: (result: { id: string; name: string }) => void;
}

export function useCollectionUpsertForm({ collection, onSuccess }: UseCollectionUpsertFormOptions) {
  const isEditMode = !!collection;

  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(
    collection?.coverImageUrl ?? undefined,
  );

  const { focusFirstError } = useFocusContext();

  // Select appropriate action based on mode
  const action = isEditMode ? updateCollectionAction : createCollectionAction;
  const schema = isEditMode ? updateCollectionSchema : insertCollectionSchema;

  const { executeAsync } = useServerAction(action, {
    breadcrumbContext: {
      action: isEditMode ? 'update-collection' : 'create-collection',
      component: 'CollectionUpsertDialog',
    },
    loadingMessage: isEditMode ? 'Updating collection...' : 'Creating collection...',
    onAfterSuccess: (data) => {
      onSuccess?.({ id: data.id, name: data.name });
    },
  });

  // Build default values based on mode
  const defaultValues = useMemo(() => {
    if (isEditMode && collection) {
      return {
        collectionId: collection.id,
        coverImageUrl: collection.coverImageUrl || undefined,
        description: collection.description || '',
        isPublic: collection.isPublic,
        name: collection.name,
      } as UpdateCollectionInput;
    }
    return {
      coverImageUrl: undefined,
      description: '',
      isPublic: DEFAULTS.COLLECTION.IS_PUBLIC,
      name: '',
    } as InsertCollectionInput;
  }, [collection, isEditMode]);

  const form = useAppForm({
    canSubmitWhenInvalid: true,
    defaultValues,
    onSubmit: async ({ value }) => {
      await executeAsync({ ...value, coverImageUrl });
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

  const handleUploadComplete = useCallback((_publicId: string, secureUrl: string) => {
    setCoverImageUrl(secureUrl);
  }, []);

  const handleRemoveCover = useCallback(() => {
    setCoverImageUrl(undefined);
  }, []);

  const resetForm = useCallback(() => {
    form.reset();
    setCoverImageUrl(collection?.coverImageUrl ?? undefined);
  }, [form, collection]);

  // UI labels based on mode
  const labels = useMemo(
    () => ({
      description:
        isEditMode ?
          'Update the details of your collection below. You can change the name, description, and visibility.'
        : 'Add a new collection to organize your bobbleheads. You can edit these details later.',
      submitButton: isEditMode ? 'Update Collection' : 'Create Collection',
      submitButtonLoading: isEditMode ? 'Updating...' : 'Creating...',
      title: isEditMode ? 'Update Existing Collection' : 'Create New Collection',
    }),
    [isEditMode],
  );

  return {
    coverImageUrl,
    form,
    handleRemoveCover,
    handleUploadComplete,
    isEditMode,
    isSubmitting,
    labels,
    resetForm,
  };
}
