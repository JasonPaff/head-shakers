'use client';

import { PlusIcon } from 'lucide-react';
import { Fragment } from 'react';

import { CollectionCreateDialog } from '@/components/feature/collections/collection-create-dialog';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { useToggle } from '@/hooks/use-toggle';

export const CollectionCreateButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useToggle();

  return (
    <Fragment>
      <Button onClick={setIsDialogOpen.on}>
        Add Collection
        <PlusIcon aria-hidden className={'size-5'} />
      </Button>

      <Conditional isCondition={isDialogOpen}>
        <CollectionCreateDialog isOpen={isDialogOpen} onClose={setIsDialogOpen.off} />
      </Conditional>
    </Fragment>
  );
};
