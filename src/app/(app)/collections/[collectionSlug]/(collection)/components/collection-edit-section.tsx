'use client';

import { PencilIcon } from 'lucide-react';
import { Fragment } from 'react';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionUpsertDialog } from '@/components/feature/collections/collection-upsert-dialog';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { useToggle } from '@/hooks/use-toggle';

interface CollectionEditSectionProps {
  collection: NonNullable<PublicCollection>;
  isOwner: boolean;
}

export const CollectionEditSection = ({ collection, isOwner }: CollectionEditSectionProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();

  return (
    <Fragment>
      <Conditional isCondition={isOwner}>
        <Button onClick={setIsEditDialogOpen.on} size={'sm'} variant={'outline'}>
          <PencilIcon aria-hidden className={'mr-2 size-4'} />
          Edit Collection
        </Button>
      </Conditional>

      <Conditional isCondition={isEditDialogOpen}>
        <CollectionUpsertDialog
          collection={collection}
          isOpen={isEditDialogOpen}
          onClose={setIsEditDialogOpen.off}
        />
      </Conditional>
    </Fragment>
  );
};
