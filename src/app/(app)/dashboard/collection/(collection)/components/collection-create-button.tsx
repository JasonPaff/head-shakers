'use client';

import { PlusIcon } from 'lucide-react';
import { Fragment } from 'react';

import { CollectionCreateDialog } from '@/app/(app)/dashboard/collection/(collection)/components/collection-create-dialog';
import { Button } from '@/components/ui/button';
import { useToggle } from '@/hooks/use-toggle';

export const CollectionCreateButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useToggle();

  return (
    <Fragment>
      <Button onClick={setIsDialogOpen.on}>
        Add Collection
        <PlusIcon aria-hidden className={'size-5'} />
      </Button>

      <CollectionCreateDialog isOpen={isDialogOpen} onClose={setIsDialogOpen.off} />
    </Fragment>
  );
};
