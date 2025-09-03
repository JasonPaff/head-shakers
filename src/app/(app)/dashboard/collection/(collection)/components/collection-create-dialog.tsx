import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

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
import { createCollectionAction } from '@/lib/actions/collections.actions';

interface CollectionCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CollectionCreateDialog = ({ isOpen, onClose }: CollectionCreateDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { executeAsync, isExecuting } = useAction(createCollectionAction, {
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to create collection');
    },
    onSuccess: ({ data }) => {
      if (!data) return;
      toast.success('Collection created successfully!');
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
      toast.error('Collection name is required');
      return;
    }

    void executeAsync({
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
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Add a new collection to organize your bobbleheads. You can edit these details later.
          </DialogDescription>
        </DialogHeader>

        <div className={'grid gap-4 py-4'}>
          {/* Description */}
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
              placeholder={'e.g., Sports Legends, Marvel Heroes'}
              value={name}
            />
          </div>

          {/* Description */}
          <div className={'grid gap-2'}>
            <Label htmlFor={'description'}>Description</Label>
            <Textarea
              disabled={isExecuting}
              id={'description'}
              maxLength={500}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              placeholder={'Describe your collection...'}
              rows={3}
              value={description}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter>
          <Button disabled={isExecuting} onClick={handleClose} variant={'outline'}>
            Cancel
          </Button>
          <Button disabled={_isCreateDisabled} onClick={handleSubmit}>
            {isExecuting ? 'Creating...' : 'Create Collection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
