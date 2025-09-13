'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type BobbleheadCommentsDialogProps = Children<{
  isOpen?: boolean;
  onClose?: () => void;
}>;

export function BobbleheadCommentsDialog({ children, isOpen, onClose }: BobbleheadCommentsDialogProps) {
  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>The ability to comment is coming soon!</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
