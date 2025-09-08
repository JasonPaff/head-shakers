/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useStore } from '@tanstack/react-form';
import { XIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import { ContentSearch } from '@/app/(app)/admin/featured-content/components/content-search';
import { featuredContentFormOptions } from '@/app/(app)/admin/featured-content/components/featured-content-form-options';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';
import { createFeaturedContentAction, updateFeaturedContentAction } from '@/lib/actions/admin.actions';

export const FeaturedContentForm = withForm({
  ...featuredContentFormOptions,
  props: {
    contentId: null as null | string,
    onClose: () => {},
    onSuccess: () => {},
  },
  render: function ({ contentId, form, onClose, onSuccess }) {
    const isEditing = !!contentId;
    
    const { executeAsync: createFeaturedContent, isExecuting: isCreating } = useAction(createFeaturedContentAction, {
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to create featured content');
      },
      onSuccess: () => {
        toast.success('Featured content created successfully!');
        onSuccess();
      },
    });

    const { executeAsync: updateFeaturedContent, isExecuting: isUpdating } = useAction(updateFeaturedContentAction, {
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to update featured content');
      },
      onSuccess: () => {
        toast.success('Featured content updated successfully!');
        onSuccess();
      },
    });

    const isSubmitting = isCreating || isUpdating;

    const currentContentType = useStore(form.store, (state) => state.values.contentType);
    const currentContentId = useStore(form.store, (state) => state.values.contentId);
    const currentTitle = useStore(form.store, (state) => state.values.title);

    const handleSubmit = async () => {
      const values = form.store.state.values;
      if (isEditing) {
        await updateFeaturedContent({ ...values, id: contentId });
      } else {
        await createFeaturedContent(values);
      }
    };

    const handleContentSelect = (selectedContentId: string, contentName: string) => {
      form.setFieldValue('contentId', selectedContentId);
      // Optionally set the title to the content name if not already set
      if (!currentTitle) {
        form.setFieldValue('title', `Featured: ${contentName}`);
      }
    };

    return (
      <Card>
        <CardHeader>
          <div className={'flex items-center justify-between'}>
            <CardTitle>{contentId ? 'Edit Featured Content' : 'Create Featured Content'}</CardTitle>
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
              void handleSubmit();
            }}
          >
            {/* Basic Information */}
            <div className={'space-y-4'}>
              <div className={'grid grid-cols-2 gap-4'}>
                <form.AppField
                  listeners={{
                    onChange: () => {
                      // Reset content selection when content type changes
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

              {/* Title and Description */}
              <form.AppField name={'title'}>
                {(field) => (
                  <field.TextField
                    label={'Title'}
                    placeholder={'Enter feature title'}
                  />
                )}
              </form.AppField>

              <form.AppField name={'description'}>
                {(field) => (
                  <field.TextareaField
                    label={'Description'}
                    placeholder={'Enter feature description'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Advanced Settings */}
            <div className={'space-y-4'}>
              <h3 className={'font-semibold'}>Advanced Settings</h3>

              <div className={'grid grid-cols-2 gap-4'}>
                <form.AppField name={'priority'}>
                  {(field) => (
                    <field.TextField
                      label={'Priority (0-100)'}
                      type={'number'}
                    />
                  )}
                </form.AppField>

                <form.AppField name={'sortOrder'}>
                  {(field) => (
                    <field.TextField
                      label={'Sort Order'}
                      type={'number'}
                    />
                  )}
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
  },
});