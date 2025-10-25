'use client';

import { EditIcon } from 'lucide-react';
import { Fragment } from 'react';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';
import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { BobbleheadEditDialog } from '@/components/feature/bobblehead/bobblehead-edit-dialog';
import { Button } from '@/components/ui/button';
import { useToggle } from '@/hooks/use-toggle';

interface BobbleheadHeaderEditProps {
  bobblehead: BobbleheadWithRelations;
  collections: Array<ComboboxItem>;
}

export const BobbleheadHeaderEdit = ({ bobblehead, collections }: BobbleheadHeaderEditProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();

  const handleEditSuccess = () => {};

  return (
    <Fragment>
      <Button onClick={setIsEditDialogOpen.on} size={'sm'} variant={'outline'}>
        <EditIcon aria-hidden className={'mr-2 size-4'} />
        Edit
      </Button>

      <BobbleheadEditDialog
        bobblehead={bobblehead}
        collections={collections}
        isOpen={isEditDialogOpen}
        onClose={setIsEditDialogOpen.off}
        onSuccess={handleEditSuccess}
      />
    </Fragment>
  );
};
