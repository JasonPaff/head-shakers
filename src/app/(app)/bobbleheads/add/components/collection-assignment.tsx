/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useStore } from '@tanstack/react-form';
import { FolderIcon, StarIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useRef, useState } from 'react';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';

import { AnimatedMotivationalMessage } from '@/app/(app)/bobbleheads/add/components/animated-motivational-message';
import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { useMotivationalMessage } from '@/app/(app)/bobbleheads/add/hooks/use-motivational-message';
import { CollectionCreateDialog } from '@/components/feature/collections/collection-create-dialog';
import { SubcollectionCreateDialog } from '@/components/feature/subcollections/subcollection-create-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';
import { useToggle } from '@/hooks/use-toggle';
import { getSubCollectionsByCollectionAction } from '@/lib/actions/collections/subcollections.actions';

export const CollectionAssignment = withForm({
  ...addItemFormOptions,
  props: {
    collections: [] as Array<ComboboxItem>,
  },
  render: function ({ collections, form }) {
    const [isCreateCollectionDialogOpen, setIsCreateCollectionDialogOpen] = useToggle();
    const [isCreateSubCollectionDialogOpen, setIsCreateSubCollectionDialogOpen] = useToggle();
    const [isLoadingSubCollections, setIsLoadingSubCollections] = useToggle();

    const [collectionsList, setCollectionsList] = useState<Array<ComboboxItem>>(collections);
    const [subCollectionsList, setSubCollectionsList] = useState<Array<ComboboxItem>>([]);

    const collectionRef = useRef<HTMLElement | null>(null);
    const subcollectionRef = useRef<HTMLElement | null>(null);

    const collectionId = useStore(form.store, (state) => state.values.collectionId);

    const { executeAsync: getSubCollections } = useAction(getSubCollectionsByCollectionAction);

    const { shouldShowMessage } = useMotivationalMessage(form, {
      requiredFields: ['collectionId'],
    });

    // load the subcollections when the collectionId changes
    useEffect(() => {
      const loadSubCollections = async () => {
        if (!collectionId) {
          setSubCollectionsList([]);
          return;
        }

        setIsLoadingSubCollections.on();
        try {
          const result = await getSubCollections({ collectionId });
          if (result?.data) {
            setSubCollectionsList(result.data.data);
          }
        } catch (error) {
          console.error('Failed to load sub-collections:', error);
          setSubCollectionsList([]);
        } finally {
          setIsLoadingSubCollections.off();
        }
      };

      void loadSubCollections();
    }, [collectionId, getSubCollections, setIsLoadingSubCollections]);

    const handleCollectionCreated = (newCollection: ComboboxItem) => {
      setCollectionsList((prev) => [...prev, newCollection]);
      form.setFieldValue('collectionId', newCollection.id);
      form.setFieldValue('subcollectionId', '');
    };

    const handleSubCollectionCreated = (newCollection: ComboboxItem) => {
      setSubCollectionsList((prev) => [...prev, newCollection]);
      form.setFieldValue('subcollectionId', newCollection.id);
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
          <div className={'grid grid-cols-1 gap-6 md:grid-cols-2'}>
            {/* Collection */}
            <div className={'space-y-2'}>
              <form.AppField
                listeners={{
                  onChange: () => {
                    form.setFieldValue('subcollectionId', '');
                  },
                }}
                name={'collectionId'}
              >
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

            {/* Sub-Collection */}
            <div className={'space-y-2'}>
              <form.AppField name={'subcollectionId'}>
                {(field) => (
                  <field.ComboboxField
                    createNewLabel={'Create new sub-collection'}
                    description={'Optional: Further organize within your collection'}
                    focusRef={subcollectionRef}
                    isDisabled={!collectionId || isLoadingSubCollections}
                    items={subCollectionsList}
                    label={'Sub-Collection'}
                    onCreateNewSelect={setIsCreateSubCollectionDialogOpen.on}
                    placeholder={
                      isLoadingSubCollections ? 'Loading sub-collections...'
                      : !collectionId ?
                        'Select a collection first...'
                      : 'Select a sub-collection...'
                    }
                    searchPlaceholder={'Search sub-collections...'}
                  />
                )}
              </form.AppField>
            </div>
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

        <CollectionCreateDialog
          isOpen={isCreateCollectionDialogOpen}
          onClose={setIsCreateCollectionDialogOpen.off}
          onCollectionCreated={handleCollectionCreated}
        />

        <SubcollectionCreateDialog
          collectionId={collectionId}
          isOpen={isCreateSubCollectionDialogOpen}
          onClose={setIsCreateSubCollectionDialogOpen.off}
          onSubCollectionCreated={handleSubCollectionCreated}
        />
      </Card>
    );
  },
});
