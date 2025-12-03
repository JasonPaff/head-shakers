/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { FolderIcon, StarIcon } from 'lucide-react';
import { useRef, useState } from 'react';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';

import { CollectionUpsertDialog } from '@/components/feature/collections/collection-upsert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';
import { useToggle } from '@/hooks/use-toggle';

import { addItemFormOptions } from './add-item-form-options';
import { AnimatedMotivationalMessage } from './animated-motivational-message';
import { useMotivationalMessage } from './hooks/use-motivational-message';

export const CollectionAssignment = withForm({
  ...addItemFormOptions,
  props: {
    collections: [] as Array<ComboboxItem>,
  },
  render: function ({ collections, form }) {
    const [isCreateCollectionDialogOpen, setIsCreateCollectionDialogOpen] = useToggle();

    const [collectionsList, setCollectionsList] = useState<Array<ComboboxItem>>(collections);

    const collectionRef = useRef<HTMLElement | null>(null);

    const { shouldShowMessage } = useMotivationalMessage(form, {
      requiredFields: ['collectionId'],
    });

    const handleCollectionCreated = (newCollection: ComboboxItem) => {
      setCollectionsList((prev) => [...prev, newCollection]);
      form.setFieldValue('collectionId', newCollection.id);
      if (!form.getFieldMeta('collectionId')?.isValid) {
        void form.validateField('collectionId', 'change');
      }
    };

    return (
      <Card>
        <CardHeader>
          {/* Title / Description */}
          <div className={'flex items-center gap-3'}>
            <div className={'flex size-10 items-center justify-center rounded-xl bg-purple-500 shadow-sm'}>
              <FolderIcon aria-hidden className={'size-5 text-white'} />
            </div>
            <div>
              <CardTitle className={'text-xl font-semibold text-foreground'}>Collection Assignment</CardTitle>
              <CardDescription className={'text-muted-foreground'}>
                Organize your bobblehead by placing it in the right collection
              </CardDescription>
            </div>
          </div>

          {/* Info tip */}
          <div className={'flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400'}>
            <StarIcon className={'size-3 fill-current'} />
            <span>Collections help you organize and showcase related bobbleheads together</span>
          </div>
        </CardHeader>

        <CardContent className={'space-y-6'}>
          {/* Collection */}
          <div className={'space-y-2'}>
            <form.AppField name={'collectionId'}>
              {(field) => (
                <field.ComboboxField
                  createNewLabel={'Create new collection'}
                  description={'Choose an existing collection or create a new one'}
                  focusRef={collectionRef}
                  isRequired
                  items={collectionsList}
                  label={'Collection'}
                  onCreateNewSelect={setIsCreateCollectionDialogOpen.on}
                  placeholder={'Select a collection...'}
                  searchPlaceholder={'Search collections...'}
                />
              )}
            </form.AppField>
          </div>

          {/* Progress indicator */}
          <AnimatedMotivationalMessage
            className={'bg-purple-100 dark:bg-purple-950/40'}
            shouldShow={shouldShowMessage}
          >
            <div className={'flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300'}>
              <div className={'size-2 rounded-full bg-purple-500'} />
              <span>Perfect! Your bobblehead now has a home in your collection.</span>
            </div>
          </AnimatedMotivationalMessage>
        </CardContent>

        <CollectionUpsertDialog
          isOpen={isCreateCollectionDialogOpen}
          onClose={setIsCreateCollectionDialogOpen.off}
          onSuccess={handleCollectionCreated}
        />
      </Card>
    );
  },
});
