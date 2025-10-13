'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
import { Conditional } from '@/components/ui/conditional';
import { Spinner } from '@/components/ui/spinner';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { deleteRefinementAgentAction } from '@/lib/actions/feature-planner/manage-refinement-agents.action';

interface DeleteAgentDialogProps {
  agentId: string;
  agentName: string;
}

export function DeleteAgentDialog({ agentId, agentName }: DeleteAgentDialogProps) {
  const [isOpen, setIsOpen] = useToggle();

  const router = useRouter();

  const { executeAsync, isPending } = useServerAction(deleteRefinementAgentAction, {
    onSuccess: () => {
      setIsOpen.off();
      router.refresh();
    },
    toastMessages: {
      error: 'Failed to delete agent. Please try again.',
      loading: 'Adding the new agent...',
      success: 'Agent added successfully! 🎉',
    },
  });

  const handleDelete = async () => {
    await executeAsync({
      agentId,
    });
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
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleDelete}>
            <Conditional isCondition={isPending}>
              <Spinner className={'mr-2 size-4'} />
            </Conditional>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
