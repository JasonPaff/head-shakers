'use client';

import { PlusIcon } from 'lucide-react';
import { Fragment } from 'react';

import { SubcollectionCreateDialog } from '@/components/feature/subcollections/subcollection-create-dialog';
import { Button } from '@/components/ui/button';
import { useToggle } from '@/hooks/use-toggle';

interface CollectionSubcollectionsAddProps {
  collectionId: string;
}

export const CollectionSubcollectionsAdd = ({ collectionId }: CollectionSubcollectionsAddProps) => {
  const [isOpen, setIsOpen] = useToggle();

  return (
    <Fragment>
      <Button onClick={setIsOpen.on} size={'sm'} variant={'outline'}>
        <PlusIcon aria-hidden className={'mr-2 size-4'} />
        Add Subcollection
      </Button>

      <SubcollectionCreateDialog collectionId={collectionId} isOpen={isOpen} onClose={setIsOpen.off} />
    </Fragment>
  );
};
