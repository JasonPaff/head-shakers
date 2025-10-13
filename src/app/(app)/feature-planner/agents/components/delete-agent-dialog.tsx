'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToggle } from '@/hooks/use-toggle';
import { deleteRefinementAgentAction } from '@/lib/actions/feature-planner/manage-refinement-agents.action';

interface DeleteAgentDialogProps {
  agentId: string;
  agentName: string;
}

export function DeleteAgentDialog({ agentId, agentName }: DeleteAgentDialogProps) {
  const [isOpen, setIsOpen] = useToggle();
  const [isDeleting, setIsDeleting] = useToggle();

  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting.on();

    try {
      const result = await deleteRefinementAgentAction({
        agentId,
      });

      if (result.data?.success) {
        toast.success('Agent deleted successfully');
        setIsOpen.off();
        router.refresh();
      } else {
        toast.error(typeof result.serverError === 'string' ? result.serverError : 'Failed to delete agent');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsDeleting.off();
    }
  };

  return (
    <AlertDialog onOpenChange={setIsOpen.update} open={isOpen}>
      <AlertDialogTrigger asChild>
        <Button size={'sm'} variant={'destructive'}>
          <Trash2 aria-hidden className={'size-4'} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Agent</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className={'font-semibold'}>{agentName}</span>? This action
            cannot be undone. The agent will be marked as inactive and will no longer appear in refinement
            settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
            {isDeleting && <Spinner className={'mr-2 size-4'} />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
