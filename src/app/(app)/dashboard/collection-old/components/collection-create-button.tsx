'use client';

import { PlusIcon } from 'lucide-react';
import { Fragment } from 'react';

import { CollectionCreateDialog } from '@/components/feature/collections/collection-create-dialog';
import { Button } from '@/components/ui/button';
import { useToggle } from '@/hooks/use-toggle';

export const CollectionCreateButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useToggle();

  return (
    <Fragment>
      <Button onClick={setIsDialogOpen.on}>
        <PlusIcon aria-hidden className={'mr-2 size-5'} />
        Add Collection
      </Button>

      <CollectionCreateDialog isOpen={isDialogOpen} onClose={setIsDialogOpen.off} />
    </Fragment>
  );
};
