'use client';

import { PencilIcon } from 'lucide-react';
import { Fragment } from 'react';

import type { PublicSubcollection } from '@/lib/facades/collections/subcollections.facade';

import { SubcollectionEditDialog } from '@/components/feature/subcollections/subcollection-edit-dialog';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { useToggle } from '@/hooks/use-toggle';

interface SubcollectionEditSectionProps {
  isOwner: boolean;
  subcollection: NonNullable<PublicSubcollection>;
}

export const SubcollectionEditSection = ({ isOwner, subcollection }: SubcollectionEditSectionProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();

  return (
    <Fragment>
      <Conditional isCondition={isOwner}>
        <Button onClick={setIsEditDialogOpen.on} size={'sm'} variant={'outline'}>
          <PencilIcon aria-hidden className={'mr-2 size-4'} />
          Edit Subcollection
        </Button>
      </Conditional>

      <Conditional isCondition={isEditDialogOpen}>
        <SubcollectionEditDialog
          isOpen={isEditDialogOpen}
          onClose={setIsEditDialogOpen.off}
          subcollection={subcollection}
        />
      </Conditional>
    </Fragment>
  );
};
