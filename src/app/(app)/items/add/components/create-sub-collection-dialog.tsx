'use client';

import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createSubCollectionAction } from '@/lib/actions/collections.actions';

interface CreateSubCollectionDialogProps {
  collectionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubCollectionCreated: (subCollection: ComboboxItem) => void;
}

export const CreateSubCollectionDialog = ({
  collectionId,
  isOpen,
  onClose,
  onSubCollectionCreated,
}: CreateSubCollectionDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { executeAsync, isExecuting } = useAction(createSubCollectionAction, {
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to create subcollection');
    },
    onSuccess: ({ data }) => {
      if (!data) return;
      toast.success('Subcollection created successfully!');
      onSubCollectionCreated({
        id: data.data!.id,
        name: data.data!.name,
      });
      handleClose();
    },
  });

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Subcollection name is required');
      return;
    }

    void executeAsync({
      collectionId,
      description: description.trim(),
      name: name.trim(),
    });
  };

  const _isCreateDisabled = isExecuting || !name.trim();

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) return;
        handleClose();
      }}
      open={isOpen}
    >
      <DialogContent className={'sm:max-w-[425px]'}>
        <DialogHeader>
          <DialogTitle>Create New Sub-Collection</DialogTitle>
          <DialogDescription>
            Add a new sub-collection to organize items within this collection. You can edit these details
            later.
          </DialogDescription>
        </DialogHeader>
        <div className={'grid gap-4 py-4'}>
          <div className={'grid gap-2'}>
            <Label htmlFor={'name'}>
              Name <span className={'text-destructive'}>*</span>
            </Label>
            <Input
              disabled={isExecuting}
              id={'name'}
              maxLength={100}
              onChange={(e) => {
                setName(e.target.value);
              }}
              placeholder={'e.g., Rookies, Hall of Fame'}
              value={name}
            />
          </div>
          <div className={'grid gap-2'}>
            <Label htmlFor={'description'}>Description</Label>
            <Textarea
              disabled={isExecuting}
              id={'description'}
              maxLength={500}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              placeholder={'Describe your sub-collection...'}
              rows={3}
              value={description}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isExecuting} onClick={handleClose} variant={'outline'}>
            Cancel
          </Button>
          <Button disabled={_isCreateDisabled} onClick={handleSubmit}>
            {isExecuting ? 'Creating...' : 'Create Sub-Collection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
