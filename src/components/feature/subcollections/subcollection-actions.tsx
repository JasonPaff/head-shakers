'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { MoreVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { Fragment } from 'react';

import { SubcollectionDeleteDialog } from '@/components/feature/subcollections/subcollection-delete-dialog';
import { SubcollectionEditDialog } from '@/components/feature/subcollections/subcollection-edit-dialog';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToggle } from '@/hooks/use-toggle';

interface SubcollectionActionsProps {
  subcollection: {
    description: null | string;
    id: string;
    name: string;
  };
}

export const SubcollectionActions = ({ subcollection }: SubcollectionActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useToggle();

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={'sm'} variant={'ghost'}>
            <MoreVerticalIcon aria-hidden className={'size-4'} />
            <VisuallyHidden>Open menu</VisuallyHidden>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={'end'}>
          <DropdownMenuItem onClick={setIsEditDialogOpen.on}>
            <PencilIcon aria-hidden className={'mr-2 size-4'} />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={setIsDeleteDialogOpen.on} variant={'destructive'}>
            <TrashIcon aria-hidden className={'mr-2 size-4'} />
            Delete Subcollection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Subcollection Details Dialog */}
      <Conditional isCondition={isEditDialogOpen}>
        <SubcollectionEditDialog
          isOpen={isEditDialogOpen}
          onClose={setIsEditDialogOpen.off}
          subcollection={subcollection}
        />
      </Conditional>

      {/* Delete Subcollection Dialog */}
      <Conditional isCondition={isDeleteDialogOpen}>
        <SubcollectionDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={setIsDeleteDialogOpen.off}
          subcollectionId={subcollection.id}
        />
      </Conditional>
    </Fragment>
  );
};
