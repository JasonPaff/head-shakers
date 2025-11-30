'use client';

import { useAuth } from '@clerk/nextjs';

import { CloudinaryCoverUpload } from '@/components/ui/cloudinary-cover-upload';
import { Label } from '@/components/ui/label';
import { CloudinaryPathBuilder } from '@/lib/constants/cloudinary-paths';

import type { useCollectionUpsertForm } from './hooks/use-collection-upsert-form';

interface CollectionFormFieldsProps {
  coverImageUrl: string | undefined;
  form: ReturnType<typeof useCollectionUpsertForm>['form'];
  isSubmitting: boolean;
  onRemoveCover: () => void;
  onUploadComplete: (publicId: string, secureUrl: string) => void;
  testIdPrefix: string;
}

export function CollectionFormFields({
  coverImageUrl,
  form,
  isSubmitting,
  onRemoveCover,
  onUploadComplete,
  testIdPrefix,
}: CollectionFormFieldsProps) {
  const { userId } = useAuth();

  return (
    <div className={'grid gap-4 py-4'}>
      {/* Name */}
      <form.AppField name={'name'}>
        {(field) => (
          <field.TextField
            isRequired
            label={'Name'}
            placeholder={'Enter collection name'}
            testId={`${testIdPrefix}-name-field`}
          />
        )}
      </form.AppField>

      {/* Description */}
      <form.AppField name={'description'}>
        {(field) => (
          <field.TextareaField
            label={'Description'}
            placeholder={'Enter collection description'}
            testId={`${testIdPrefix}-description-field`}
          />
        )}
      </form.AppField>

      {/* Cover Photo */}
      {userId && (
        <div className={'space-y-2'}>
          <Label>Cover Photo (Optional)</Label>
          <CloudinaryCoverUpload
            currentImageUrl={coverImageUrl}
            isDisabled={isSubmitting}
            onRemove={onRemoveCover}
            onUploadComplete={onUploadComplete}
            uploadFolder={CloudinaryPathBuilder.tempPath(userId)}
          />
        </div>
      )}

      {/* Visibility */}
      <form.AppField name={'isPublic'}>
        {(field) => (
          <field.SwitchField label={'Public Collection'} testId={`${testIdPrefix}-is-public-field`} />
        )}
      </form.AppField>
    </div>
  );
}
