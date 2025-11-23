'use client';

import type { ComponentPropsWithRef } from 'react';

import { Loader2Icon, ShieldIcon } from 'lucide-react';
import { useState } from 'react';

import type { AdminUserListRecord } from '@/lib/queries/users/users-query';
import type { AssignableRole } from '@/lib/validations/admin-users.validation';

import { Alert } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServerAction } from '@/hooks/use-server-action';
import { updateUserRoleAction } from '@/lib/actions/admin/admin-users.actions';
import { cn } from '@/utils/tailwind-utils';

type UserRoleDialogProps = ComponentPropsWithRef<'div'> & {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: AdminUserListRecord | null;
};

/**
 * Role options for selection - excludes 'admin' for security
 * Only 'user' and 'moderator' roles can be assigned via UI
 */
const ROLE_OPTIONS: Array<{ description: string; label: string; value: AssignableRole }> = [
  {
    description: 'Standard user with basic collection management capabilities',
    label: 'User',
    value: 'user',
  },
  {
    description: 'Can moderate content, manage reports, and assist with platform oversight',
    label: 'Moderator',
    value: 'moderator',
  },
];

export const UserRoleDialog = ({ isOpen, onClose, onSuccess, user }: UserRoleDialogProps) => {
  // useState hooks
  const [selectedRole, setSelectedRole] = useState<AssignableRole | null>(null);

  // Server action for updating user role
  const { executeAsync: updateUserRole, isPending: isExecuting } = useServerAction(updateUserRoleAction, {
    onSuccess: () => {
      onSuccess?.();
      handleClose();
    },
    toastMessages: {
      error: 'Failed to update user role',
      loading: 'Updating user role...',
      success: (data) => {
        const result = data as { data?: { message?: string } };
        return result?.data?.message ?? 'User role updated successfully';
      },
    },
  });

  // Event handlers
  const handleClose = () => {
    if (!isExecuting) {
      setSelectedRole(null);
      onClose();
    }
  };

  const handleOpenChange = (isDialogOpen: boolean) => {
    if (!isDialogOpen) {
      handleClose();
    }
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as AssignableRole);
  };

  const handleConfirm = async () => {
    if (!user || !selectedRole) return;

    await updateUserRole({
      newRole: selectedRole,
      userId: user.id,
    });
  };

  // Derived variables for conditional rendering
  const _hasUser = !!user;
  const _currentRole = user?.role ?? 'user';
  const _isCurrentRoleAdmin = _currentRole === 'admin';
  const _hasSelectedRole = !!selectedRole;
  const _isSameRole = selectedRole === _currentRole;
  const _canSubmit = _hasSelectedRole && !_isSameRole && !isExecuting && !_isCurrentRoleAdmin;
  const _isPromotingToModerator = selectedRole === 'moderator' && _currentRole === 'user';
  const _isDemotingFromModerator = selectedRole === 'user' && _currentRole === 'moderator';

  // Get role badge styling
  const _getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={isOpen}>
      <AlertDialogContent data-slot={'user-role-dialog'}>
        <AlertDialogHeader>
          <AlertDialogTitle className={'flex items-center gap-2'} data-slot={'user-role-dialog-title'}>
            <ShieldIcon aria-hidden className={'size-5'} />
            Change User Role
          </AlertDialogTitle>
          <AlertDialogDescription data-slot={'user-role-dialog-description'}>
            Modify the role and permissions for this user. This action will be logged for audit purposes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* No User State */}
        <Conditional isCondition={!_hasUser}>
          <div className={'py-8 text-center text-muted-foreground'} data-slot={'user-role-dialog-empty'}>
            No user selected
          </div>
        </Conditional>

        {/* User Content */}
        <Conditional isCondition={_hasUser}>
          <div className={'space-y-4'} data-slot={'user-role-dialog-content'}>
            {/* User Info */}
            <div
              className={'flex items-center gap-4 rounded-lg border bg-muted/50 p-4'}
              data-slot={'user-role-dialog-user-info'}
            >
              <div className={'flex-1 space-y-1'}>
                <div className={'font-medium'}>{user?.displayName ?? user?.username}</div>
                <div className={'text-sm text-muted-foreground'}>{user?.email}</div>
              </div>
              <Badge className={cn(_getRoleBadgeClass(_currentRole))} variant={'secondary'}>
                {_currentRole.charAt(0).toUpperCase() + _currentRole.slice(1)}
              </Badge>
            </div>

            {/* Admin Role Warning */}
            <Conditional isCondition={_isCurrentRoleAdmin}>
              <Alert variant={'warning'}>
                <strong>Cannot Modify Admin Role:</strong> Admin roles cannot be changed through the UI for
                security reasons. Contact a system administrator if role changes are required.
              </Alert>
            </Conditional>

            {/* Role Selection */}
            <Conditional isCondition={!_isCurrentRoleAdmin}>
              <div className={'space-y-2'} data-slot={'user-role-dialog-select-container'}>
                <label className={'text-sm font-medium'} htmlFor={'role-select'}>
                  New Role
                </label>
                <Select
                  disabled={isExecuting}
                  onValueChange={handleRoleChange}
                  value={selectedRole ?? undefined}
                >
                  <SelectTrigger className={'w-full'} id={'role-select'}>
                    <SelectValue placeholder={'Select a role...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem
                        disabled={option.value === _currentRole}
                        key={option.value}
                        value={option.value}
                      >
                        <div className={'flex flex-col'}>
                          <span className={'font-medium'}>{option.label}</span>
                          <span className={'text-xs text-muted-foreground'}>{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role Change Warning */}
              <Conditional isCondition={_isPromotingToModerator}>
                <Alert variant={'warning'}>
                  <strong>Promoting to Moderator:</strong> This user will gain moderator privileges including
                  the ability to manage reports, moderate content, and access admin tools. Ensure this user is
                  trusted before proceeding.
                </Alert>
              </Conditional>

              <Conditional isCondition={_isDemotingFromModerator}>
                <Alert variant={'info'}>
                  <strong>Demoting to User:</strong> This user will lose moderator privileges and will only
                  have standard user capabilities. They will no longer be able to access admin tools or
                  moderate content.
                </Alert>
              </Conditional>

              {/* Same Role Selection Warning */}
              <Conditional isCondition={_isSameRole && _hasSelectedRole}>
                <Alert variant={'info'}>
                  <strong>No Change Required:</strong> The selected role is the same as the user&apos;s
                  current role. Please select a different role.
                </Alert>
              </Conditional>
            </Conditional>
          </div>
        </Conditional>

        <AlertDialogFooter data-slot={'user-role-dialog-footer'}>
          <AlertDialogCancel disabled={isExecuting} onClick={handleClose}>
            Cancel
          </AlertDialogCancel>
          <Button
            asChild
            disabled={!_canSubmit}
            onClick={() => {
              void handleConfirm();
            }}
          >
            <AlertDialogAction>
              <Conditional isCondition={isExecuting}>
                <Loader2Icon aria-hidden className={'mr-2 size-4 animate-spin'} />
              </Conditional>
              {isExecuting ? 'Updating...' : 'Confirm Role Change'}
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

UserRoleDialog.displayName = 'UserRoleDialog';
