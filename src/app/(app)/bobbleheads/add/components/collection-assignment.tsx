/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useStore } from '@tanstack/react-form';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';

import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { CollectionCreateDialog } from '@/components/feature/collections/collection-create-dialog';
import { SubcollectionCreateDialog } from '@/components/feature/subcollections/subcollection-create-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';
import { useToggle } from '@/hooks/use-toggle';
import { getSubCollectionsByCollectionAction } from '@/lib/actions/collections.actions';

// TODO: replace server action with tanstack query

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

    const collectionId = useStore(form.store, (state) => state.values.collectionId);

    const { executeAsync: getSubCollections } = useAction(getSubCollectionsByCollectionAction);

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
          <CardTitle>Collection Assignment</CardTitle>
          <CardDescription>Choose which collection this bobblehead belongs to</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
            {/* Collection */}
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
                  isRequired
                  items={collectionsList}
                  label={'Collection'}
                  onCreateNewSelect={setIsCreateCollectionDialogOpen.on}
                  placeholder={'Select a collection...'}
                  searchPlaceholder={'Search collections...'}
                />
              )}
            </form.AppField>

            {/* Sub-Collection */}
            <form.AppField name={'subcollectionId'}>
              {(field) => (
                <field.ComboboxField
                  createNewLabel={'Create new sub-collection'}
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
