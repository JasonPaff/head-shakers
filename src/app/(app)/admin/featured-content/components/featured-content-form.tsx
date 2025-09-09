'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { useStore } from '@tanstack/react-form';
import { XIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { AdminFeaturedContent } from '@/lib/queries/admin/featured-content.queries';

import { ContentSearch } from '@/app/(app)/admin/featured-content/components/content-search';
import { featuredContentFormOptions } from '@/app/(app)/admin/featured-content/components/featured-content-form-options';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppForm } from '@/components/ui/form';
import {
  createFeaturedContentAction,
  getFeaturedContentByIdAction,
  updateFeaturedContentAction,
} from '@/lib/actions/admin.actions';

type FeaturedContentFormProps = {
  contentId: null | string;
  onClose: () => void;
  onSuccess: () => void;
};

export const FeaturedContentForm = ({ contentId, onClose, onSuccess }: FeaturedContentFormProps) => {
  const isEditing = !!contentId;
  const [existingData, setExistingData] = useState<AdminFeaturedContent | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);

  const form = useAppForm({
    ...featuredContentFormOptions,
    onSubmit: async ({ value }) => {
      if (isEditing) await updateFeaturedContent({ ...value, id: contentId });
      else await createFeaturedContent(value);
    },
    validationLogic: revalidateLogic({
      mode: 'blur',
      modeAfterSubmission: 'change',
    }),
  });

  const { executeAsync: getFeaturedContent } = useAction(getFeaturedContentByIdAction, {
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to load featured content');
      onClose();
    },
  });

  // fetch existing data when editing
  useEffect(() => {
    if (isEditing && contentId) {
      setIsLoading(true);
      getFeaturedContent({ id: contentId })
        .then((result) => {
          if (result?.data?.featuredContent) {
            const data = result.data.featuredContent;
            setExistingData(data);
            // populate form with existing data
            form.setFieldValue('contentType', data.contentType);
            form.setFieldValue('featureType', data.featureType);
            form.setFieldValue('contentId', data.contentId);
            form.setFieldValue('title', data.title || '');
            form.setFieldValue('description', data.description || '');
            form.setFieldValue('imageUrl', data.imageUrl || '/placeholder.jpg');
            form.setFieldValue('priority', data.priority.toString());
            form.setFieldValue('sortOrder', data.sortOrder.toString());
            form.setFieldValue('curatorNotes', data.curatorNotes || '');
            form.setFieldValue('isActive', data.isActive);
          }
        })
        .catch((error) => {
          console.error('Error fetching featured content:', error);
          toast.error('Failed to load featured content data');
          onClose();
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [contentId, isEditing, form, onClose, getFeaturedContent]);

  const { executeAsync: createFeaturedContent, isExecuting: isCreating } = useAction(
    createFeaturedContentAction,
    {
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to create featured content');
      },
      onSuccess: () => {
        toast.success('Featured content created successfully!');
        onSuccess();
      },
    },
  );

  const { executeAsync: updateFeaturedContent, isExecuting: isUpdating } = useAction(
    updateFeaturedContentAction,
    {
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to update featured content');
      },
      onSuccess: () => {
        toast.success('Featured content updated successfully!');
        onSuccess();
      },
    },
  );

  const isSubmitting = isCreating || isUpdating;

  const currentContentType = useStore(form.store, (state) => state.values.contentType);
  const currentContentId = useStore(form.store, (state) => state.values.contentId);
  const currentTitle = useStore(form.store, (state) => state.values.title);

  const handleContentSelect = (selectedContentId: string, contentName: string, imageUrl?: string) => {
    form.setFieldValue('contentId', selectedContentId);
    if (!currentTitle) form.setFieldValue('title', `Featured: ${contentName}`);
    form.setFieldValue('imageUrl', imageUrl || '/placeholder.jpg');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading featured content...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={'flex items-center justify-center p-8'}>
            <div className={'text-muted-foreground'}>Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className={'flex items-center justify-between'}>
          <CardTitle>
            {contentId ? 'Edit Featured Content' : 'Create Featured Content'}
            {existingData?.contentTitle && (
              <span className={'ml-2 text-sm font-normal text-muted-foreground'}>
                - {existingData.contentTitle}
              </span>
            )}
          </CardTitle>
          <Button onClick={onClose} size={'sm'} variant={'ghost'}>
            <XIcon aria-hidden className={'size-4'} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className={'space-y-6'}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          {/* Basic Information */}
          <div className={'space-y-4'}>
            <div className={'grid grid-cols-2 gap-4'}>
              <form.AppField
                listeners={{
                  onChange: () => {
                    // reset content selection when the content type changes
                    form.setFieldValue('contentId', '');
                  },
                }}
                name={'contentType'}
              >
                {(field) => (
                  <field.SelectField
                    label={'Content Type'}
                    options={[
                      { label: 'Collection', value: 'collection' },
                      { label: 'Bobblehead', value: 'bobblehead' },
                      { label: 'User', value: 'user' },
                    ]}
                    placeholder={'Select content type'}
                  />
                )}
              </form.AppField>

              {/* Feature Type */}
              <form.AppField name={'featureType'}>
                {(field) => (
                  <field.SelectField
                    label={'Feature Type'}
                    options={[
                      { label: 'Homepage Banner', value: 'homepage_banner' },
                      { label: 'Collection of Week', value: 'collection_of_week' },
                      { label: 'Trending', value: 'trending' },
                      { label: 'Editor Pick', value: 'editor_pick' },
                    ]}
                    placeholder={'Select feature type'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Content Selection */}
            <div>
              <h3 className={'mb-2 text-sm font-medium'}>Select Content to Feature</h3>
              <ContentSearch
                contentType={currentContentType}
                onSelect={handleContentSelect}
                selectedContentId={currentContentId}
              />
            </div>

            {/* Title */}
            <form.AppField name={'title'}>
              {(field) => <field.TextField label={'Title'} placeholder={'Enter feature title'} />}
            </form.AppField>

            {/* Description */}
            <form.AppField name={'description'}>
              {(field) => (
                <field.TextareaField label={'Description'} placeholder={'Enter feature description'} />
              )}
            </form.AppField>

            {/* Image URL */}
            <form.AppField name={'imageUrl'}>
              {(field) => (
                <field.TextField
                  label={'Image URL'}
                  placeholder={'https://example.com/image.jpg or leave empty for placeholder image'}
                />
              )}
            </form.AppField>
          </div>

          {/* Advanced Settings */}
          <div className={'space-y-4'}>
            <h3 className={'font-semibold'}>Advanced Settings</h3>

            <div className={'grid grid-cols-2 gap-4'}>
              <form.AppField name={'priority'}>
                {(field) => <field.TextField label={'Priority (0-100)'} type={'number'} />}
              </form.AppField>

              <form.AppField name={'sortOrder'}>
                {(field) => <field.TextField label={'Sort Order'} type={'number'} />}
              </form.AppField>
            </div>

            <form.AppField name={'curatorNotes'}>
              {(field) => (
                <field.TextareaField
                  label={'Curator Notes (internal only)'}
                  placeholder={'Add notes about why this content is featured...'}
                />
              )}
            </form.AppField>

            <form.AppField name={'isActive'}>
              {(field) => (
                <field.SwitchField
                  description={'Whether this featured content is currently active'}
                  label={'Active'}
                />
              )}
            </form.AppField>
          </div>

          {/* Form Actions */}
          <div className={'flex justify-end gap-3'}>
            <Button onClick={onClose} type={'button'} variant={'outline'}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type={'submit'}>
              {isSubmitting ?
                'Saving...'
              : isEditing ?
                'Update Feature'
              : 'Create Feature'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
