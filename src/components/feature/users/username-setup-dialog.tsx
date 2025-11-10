'use client';

import { Fragment } from 'react';

import { UsernameEditForm } from '@/components/feature/users/username-edit-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { updateUsernameAction } from '@/lib/actions/users/username.actions';

interface UsernameSetupDialogProps {
  currentUsername: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UsernameSetupDialog = ({ currentUsername, isOpen, onClose }: UsernameSetupDialogProps) => {
  const [isCustomizing, setIsCustomizing] = useToggle();

  // Server action to skip username setup (keeps current username, sets timestamp)
  const { executeAsync: skipSetup, isExecuting: isSkipping } = useServerAction(updateUsernameAction, {
    onSuccess: () => {
      handleClose();
    },
    toastMessages: {
      error: 'Failed to save username',
      loading: 'Saving username...',
      success: 'Username saved successfully!',
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    handleClose();
  };

  const handleClose = () => {
    // Store dismissal in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('username-setup-dialog-dismissed', 'true');
    }

    // Wait for dialog close animation
    setTimeout(() => {
      setIsCustomizing.off();
      onClose();
    }, 300);
  };

  const handleSkip = async () => {
    // Keep current username but set usernameChangedAt timestamp
    await skipSetup({ username: currentUsername });
  };

  const handleCustomizeClick = () => {
    setIsCustomizing.on();
  };

  const handleUsernameUpdateSuccess = () => {
    handleClose();
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogContent className={'sm:max-w-md'} data-testid={'username-setup-dialog'}>
        {!isCustomizing ?
          <Fragment>
            <DialogHeader>
              <DialogTitle>Welcome to Head Shakers!</DialogTitle>
              <DialogDescription>
                We&apos;ve created an auto-generated username for you:{' '}
                <span className={'font-bold'}>@{currentUsername}</span>
              </DialogDescription>
            </DialogHeader>

            <div className={'py-4'}>
              <p className={'text-sm text-muted-foreground'}>
                You can keep this username or customize it to something unique. Once set, you can change your
                username again in 90 days.
              </p>
            </div>

            <DialogFooter className={'gap-2 sm:gap-0'}>
              <Button disabled={isSkipping} onClick={handleSkip} variant={'outline'}>
                {isSkipping ? 'Saving...' : 'Keep Current'}
              </Button>
              <Button disabled={isSkipping} onClick={handleCustomizeClick}>
                Customize
              </Button>
            </DialogFooter>
          </Fragment>
        : <Fragment>
            <DialogHeader>
              <DialogTitle>Customize Your Username</DialogTitle>
              <DialogDescription>
                Choose a unique username that represents you. You&apos;ll be able to change it again in 90
                days.
              </DialogDescription>
            </DialogHeader>

            <div className={'py-4'}>
              <UsernameEditForm
                canChange
                currentUsername={currentUsername}
                onSuccess={handleUsernameUpdateSuccess}
              />
            </div>

            <DialogFooter>
              <Button onClick={setIsCustomizing.off} variant={'outline'}>
                Back
              </Button>
            </DialogFooter>
          </Fragment>
        }
      </DialogContent>
    </Dialog>
  );
};

UsernameSetupDialog.displayName = 'UsernameSetupDialog';
