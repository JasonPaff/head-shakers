'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { MoreVerticalIcon, PencilIcon } from 'lucide-react';
import { Fragment } from 'react';

import { SubcollectionDelete } from '@/components/feature/subcollections/subcollection-delete';
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
          <DropdownMenuItem asChild variant={'destructive'}>
            <SubcollectionDelete
              className={'w-full justify-start'}
              subcollectionId={subcollection.id}
              variant={'ghost'}
            >
              Delete Subcollection
            </SubcollectionDelete>
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
    </Fragment>
  );
};
