'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { MoreVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react';

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
import { generateTestId } from '@/lib/test-ids';

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

  const actionsTestId = generateTestId('feature', 'subcollection-actions', subcollection.id);
  const triggerTestId = generateTestId('feature', 'subcollection-actions-trigger', subcollection.id);
  const editMenuItemTestId = generateTestId('feature', 'subcollection-actions-edit', subcollection.id);
  const deleteMenuItemTestId = generateTestId('feature', 'subcollection-actions-delete', subcollection.id);

  return (
    <div data-slot={'subcollection-actions'} data-testid={actionsTestId}>
      {/* Actions Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={`Open actions menu for ${subcollection.name}`}
            className={'min-h-11 min-w-11'}
            size={'icon'}
            testId={triggerTestId}
            variant={'ghost'}
          >
            <MoreVerticalIcon aria-hidden className={'size-5'} />
            <VisuallyHidden>Open menu</VisuallyHidden>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={'end'}>
          <DropdownMenuItem
            className={'py-3'}
            data-testid={editMenuItemTestId}
            onClick={setIsEditDialogOpen.on}
          >
            <PencilIcon aria-hidden className={'mr-2 size-4'} />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={'py-3'}
            data-testid={deleteMenuItemTestId}
            onClick={setIsDeleteDialogOpen.on}
            variant={'destructive'}
          >
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
    </div>
  );
};
