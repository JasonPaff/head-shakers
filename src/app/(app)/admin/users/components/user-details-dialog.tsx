'use client';

import type { ComponentPropsWithRef } from 'react';

import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  FolderIcon,
  Loader2Icon,
  LockIcon,
  MailCheckIcon,
  MapPinIcon,
  PackageIcon,
  ShieldIcon,
  UnlockIcon,
  UserIcon,
  XCircleIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import type { UserStats, UserWithActivity } from '@/lib/queries/users/users-query';

import { Alert } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useServerAction } from '@/hooks/use-server-action';
import {
  getUserDetailsAction,
  lockUserAction,
  unlockUserAction,
  verifyUserEmailAction,
} from '@/lib/actions/admin/admin-users.actions';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type UserDetailsData = {
  stats: UserStats;
  user: UserWithActivity;
};

type UserDetailsDialogProps = ComponentPropsWithRef<'div'> & {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId: null | string;
};

/**
 * User Details Dialog Component
 * Displays comprehensive user information for admin review
 * Includes profile info, account status, timestamps, and statistics
 */
export const UserDetailsDialog = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: UserDetailsDialogProps) => {
  // useState hooks
  const [userDetails, setUserDetails] = useState<null | UserDetailsData>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  // Server actions
  const { executeAsync: fetchUserDetails } = useServerAction(getUserDetailsAction, {
    isDisableToast: true,
  });

  const { executeAsync: lockUser, isPending: isLocking } = useServerAction(lockUserAction, {
    onSuccess: () => {
      onSuccess?.();
      void refetchUserDetails();
    },
    toastMessages: {
      error: 'Failed to lock user account',
      loading: 'Locking user account...',
      success: 'User account locked successfully',
    },
  });

  const { executeAsync: unlockUser, isPending: isUnlocking } = useServerAction(unlockUserAction, {
    onSuccess: () => {
      onSuccess?.();
      void refetchUserDetails();
    },
    toastMessages: {
      error: 'Failed to unlock user account',
      loading: 'Unlocking user account...',
      success: 'User account unlocked successfully',
    },
  });

  const { executeAsync: verifyEmail, isPending: isVerifying } = useServerAction(
    verifyUserEmailAction,
    {
      onSuccess: () => {
        onSuccess?.();
        void refetchUserDetails();
      },
      toastMessages: {
        error: 'Failed to verify user email',
        loading: 'Verifying user email...',
        success: 'User email verified successfully',
      },
    },
  );

  // useEffect hooks
  useEffect(() => {
    if (isOpen && userId) {
      void loadUserDetails();
    } else {
      setUserDetails(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  // Utility functions
  const loadUserDetails = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchUserDetails({ userId });

      // Type guard to safely access result data
      if (
        result &&
        typeof result === 'object' &&
        'data' in result &&
        result.data &&
        typeof result.data === 'object' &&
        'success' in result.data &&
        result.data.success === true &&
        'data' in result.data &&
        result.data.data
      ) {
        setUserDetails(result.data.data as UserDetailsData);
      } else {
        setError('Failed to load user details');
      }
    } catch {
      setError('An error occurred while loading user details');
    } finally {
      setIsLoading(false);
    }
  };

  const refetchUserDetails = async () => {
    if (userId) {
      await loadUserDetails();
    }
  };

  // Event handlers
  const handleClose = () => {
    if (!isLocking && !isUnlocking && !isVerifying) {
      onClose();
    }
  };

  const handleOpenChange = (isDialogOpen: boolean) => {
    if (!isDialogOpen) {
      handleClose();
    }
  };

  const handleLockUser = async () => {
    if (!userId) return;
    await lockUser({ userId });
  };

  const handleUnlockUser = async () => {
    if (!userId) return;
    await unlockUser({ userId });
  };

  const handleVerifyEmail = async () => {
    if (!userId) return;
    await verifyEmail({ userId });
  };

  // Derived variables
  const _hasUserDetails = !!userDetails;
  const _isUserLocked = userDetails?.user.lockedUntil
    ? new Date(userDetails.user.lockedUntil) > new Date()
    : false;
  const _isUserVerified = userDetails?.user.isVerified ?? false;
  const _isActionPending = isLocking || isUnlocking || isVerifying;
  const _userInitials = userDetails?.user.displayName
    ? userDetails.user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (userDetails?.user.username?.slice(0, 2).toUpperCase() ?? 'U');

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

  const _formatDate = (date: Date | null | string | undefined): string => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const _formatDateTime = (date: Date | null | string | undefined): string => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const dialogTestId = generateTestId('feature', 'dialog', 'user-details');

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogContent
        className={'max-w-2xl'}
        data-slot={'user-details-dialog'}
        testId={dialogTestId}
      >
        <DialogHeader>
          <DialogTitle
            className={'flex items-center gap-2'}
            data-slot={'user-details-dialog-title'}
          >
            <UserIcon aria-hidden className={'size-5'} />
            User Details
          </DialogTitle>
          <DialogDescription data-slot={'user-details-dialog-description'}>
            View comprehensive user information and account management options.
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        <Conditional isCondition={isLoading}>
          <UserDetailsLoadingSkeleton />
        </Conditional>

        {/* Error State */}
        <Conditional isCondition={!isLoading && !!error}>
          <Alert variant={'error'}>
            <strong>Error:</strong> {error}
          </Alert>
        </Conditional>

        {/* No User ID State */}
        <Conditional isCondition={!isLoading && !error && !userId}>
          <div
            className={'py-8 text-center text-muted-foreground'}
            data-slot={'user-details-dialog-empty'}
          >
            No user selected
          </div>
        </Conditional>

        {/* User Details Content */}
        <Conditional isCondition={!isLoading && !error && _hasUserDetails}>
          <div className={'space-y-6'} data-slot={'user-details-dialog-content'}>
            {/* Profile Info Section */}
            <section data-slot={'user-details-profile-section'}>
              <h3 className={'mb-3 text-sm font-semibold text-muted-foreground'}>Profile Info</h3>
              <div
                className={'flex items-start gap-4 rounded-lg border bg-muted/30 p-4'}
                data-slot={'user-details-profile-card'}
              >
                <Avatar className={'size-16'}>
                  <AvatarImage
                    alt={userDetails?.user.displayName ?? userDetails?.user.username ?? 'User'}
                    src={userDetails?.user.avatarUrl ?? undefined}
                  />
                  <AvatarFallback className={'text-lg'}>{_userInitials}</AvatarFallback>
                </Avatar>
                <div className={'flex-1 space-y-2'}>
                  <div>
                    <div className={'text-lg font-semibold'}>
                      {userDetails?.user.displayName ?? userDetails?.user.username}
                    </div>
                    <div className={'text-sm text-muted-foreground'}>
                      @{userDetails?.user.username}
                    </div>
                  </div>
                  <div className={'flex items-center gap-2 text-sm text-muted-foreground'}>
                    <MailCheckIcon aria-hidden className={'size-4'} />
                    {userDetails?.user.email}
                  </div>
                  <Conditional isCondition={!!userDetails?.user.location}>
                    <div className={'flex items-center gap-2 text-sm text-muted-foreground'}>
                      <MapPinIcon aria-hidden className={'size-4'} />
                      {userDetails?.user.location}
                    </div>
                  </Conditional>
                  <Conditional isCondition={!!userDetails?.user.bio}>
                    <p className={'text-sm text-muted-foreground'}>{userDetails?.user.bio}</p>
                  </Conditional>
                </div>
              </div>
            </section>

            {/* Account Status Section */}
            <section data-slot={'user-details-status-section'}>
              <h3 className={'mb-3 text-sm font-semibold text-muted-foreground'}>Account Status</h3>
              <div
                className={'grid grid-cols-3 gap-4'}
                data-slot={'user-details-status-grid'}
              >
                {/* Role */}
                <div
                  className={'flex flex-col items-center gap-2 rounded-lg border p-3'}
                  data-slot={'user-details-role'}
                >
                  <ShieldIcon aria-hidden className={'size-5 text-muted-foreground'} />
                  <span className={'text-xs text-muted-foreground'}>Role</span>
                  <Badge
                    className={cn(_getRoleBadgeClass(userDetails?.user.role ?? 'user'))}
                    variant={'secondary'}
                  >
                    {(userDetails?.user.role ?? 'user').charAt(0).toUpperCase() +
                      (userDetails?.user.role ?? 'user').slice(1)}
                  </Badge>
                </div>

                {/* Verified Status */}
                <div
                  className={'flex flex-col items-center gap-2 rounded-lg border p-3'}
                  data-slot={'user-details-verified'}
                >
                  <Conditional isCondition={_isUserVerified}>
                    <CheckCircleIcon aria-hidden className={'size-5 text-green-500'} />
                  </Conditional>
                  <Conditional isCondition={!_isUserVerified}>
                    <XCircleIcon aria-hidden className={'size-5 text-amber-500'} />
                  </Conditional>
                  <span className={'text-xs text-muted-foreground'}>Email</span>
                  <Badge variant={_isUserVerified ? 'default' : 'outline'}>
                    {_isUserVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>

                {/* Lock Status */}
                <div
                  className={'flex flex-col items-center gap-2 rounded-lg border p-3'}
                  data-slot={'user-details-lock-status'}
                >
                  <Conditional isCondition={_isUserLocked}>
                    <LockIcon aria-hidden className={'size-5 text-destructive'} />
                  </Conditional>
                  <Conditional isCondition={!_isUserLocked}>
                    <UnlockIcon aria-hidden className={'size-5 text-green-500'} />
                  </Conditional>
                  <span className={'text-xs text-muted-foreground'}>Account</span>
                  <Badge variant={_isUserLocked ? 'destructive' : 'default'}>
                    {_isUserLocked ? 'Locked' : 'Active'}
                  </Badge>
                </div>
              </div>
            </section>

            {/* Timestamps Section */}
            <section data-slot={'user-details-timestamps-section'}>
              <h3 className={'mb-3 text-sm font-semibold text-muted-foreground'}>Timestamps</h3>
              <div
                className={'grid grid-cols-2 gap-3'}
                data-slot={'user-details-timestamps-grid'}
              >
                <div
                  className={'flex items-center gap-2 text-sm'}
                  data-slot={'user-details-created-at'}
                >
                  <CalendarIcon aria-hidden className={'size-4 text-muted-foreground'} />
                  <span className={'text-muted-foreground'}>Created:</span>
                  <span>{_formatDate(userDetails?.user.createdAt)}</span>
                </div>
                <div
                  className={'flex items-center gap-2 text-sm'}
                  data-slot={'user-details-updated-at'}
                >
                  <ClockIcon aria-hidden className={'size-4 text-muted-foreground'} />
                  <span className={'text-muted-foreground'}>Updated:</span>
                  <span>{_formatDate(userDetails?.user.updatedAt)}</span>
                </div>
                <div
                  className={'flex items-center gap-2 text-sm'}
                  data-slot={'user-details-last-active'}
                >
                  <ClockIcon aria-hidden className={'size-4 text-muted-foreground'} />
                  <span className={'text-muted-foreground'}>Last Active:</span>
                  <span>{_formatDateTime(userDetails?.user.lastActiveAt)}</span>
                </div>
                <div
                  className={'flex items-center gap-2 text-sm'}
                  data-slot={'user-details-member-since'}
                >
                  <CalendarIcon aria-hidden className={'size-4 text-muted-foreground'} />
                  <span className={'text-muted-foreground'}>Member Since:</span>
                  <span>{_formatDate(userDetails?.user.memberSince)}</span>
                </div>
              </div>
            </section>

            {/* Statistics Section */}
            <section data-slot={'user-details-stats-section'}>
              <h3 className={'mb-3 text-sm font-semibold text-muted-foreground'}>Statistics</h3>
              <div
                className={'grid grid-cols-2 gap-4'}
                data-slot={'user-details-stats-grid'}
              >
                <div
                  className={'flex items-center gap-3 rounded-lg border p-3'}
                  data-slot={'user-details-collections-count'}
                >
                  <FolderIcon aria-hidden className={'size-5 text-blue-500'} />
                  <div>
                    <div className={'text-2xl font-bold'}>
                      {userDetails?.stats.collectionsCount ?? 0}
                    </div>
                    <div className={'text-xs text-muted-foreground'}>
                      Collections ({userDetails?.stats.publicCollectionsCount ?? 0} public)
                    </div>
                  </div>
                </div>
                <div
                  className={'flex items-center gap-3 rounded-lg border p-3'}
                  data-slot={'user-details-bobbleheads-count'}
                >
                  <PackageIcon aria-hidden className={'size-5 text-purple-500'} />
                  <div>
                    <div className={'text-2xl font-bold'}>
                      {userDetails?.stats.bobbleheadsCount ?? 0}
                    </div>
                    <div className={'text-xs text-muted-foreground'}>
                      Bobbleheads ({userDetails?.stats.publicBobbleheadsCount ?? 0} public)
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity Section */}
            <Conditional
              isCondition={
                !!userDetails?.user.recentActivity && userDetails.user.recentActivity.length > 0
              }
            >
              <section data-slot={'user-details-activity-section'}>
                <h3 className={'mb-3 text-sm font-semibold text-muted-foreground'}>
                  Recent Activity
                </h3>
                <div
                  className={'max-h-40 space-y-2 overflow-y-auto'}
                  data-slot={'user-details-activity-list'}
                >
                  {userDetails?.user.recentActivity?.map((activity) => (
                    <div
                      className={'flex items-center justify-between rounded border px-3 py-2 text-sm'}
                      data-slot={'user-details-activity-item'}
                      key={activity.id}
                    >
                      <span className={'capitalize'}>{activity.actionType.replace(/_/g, ' ')}</span>
                      <span className={'text-muted-foreground'}>
                        {_formatDateTime(activity.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </Conditional>
          </div>
        </Conditional>

        {/* Action Buttons */}
        <Conditional isCondition={!isLoading && !error && _hasUserDetails}>
          <DialogFooter
            className={'flex-col gap-2 sm:flex-row'}
            data-slot={'user-details-dialog-footer'}
          >
            {/* Lock/Unlock Button */}
            <Conditional isCondition={_isUserLocked}>
              <Button
                disabled={_isActionPending}
                onClick={() => {
                  void handleUnlockUser();
                }}
                variant={'outline'}
              >
                <Conditional isCondition={isUnlocking}>
                  <Loader2Icon aria-hidden className={'mr-2 size-4 animate-spin'} />
                </Conditional>
                <Conditional isCondition={!isUnlocking}>
                  <UnlockIcon aria-hidden className={'mr-2 size-4'} />
                </Conditional>
                {isUnlocking ? 'Unlocking...' : 'Unlock Account'}
              </Button>
            </Conditional>
            <Conditional isCondition={!_isUserLocked}>
              <Button
                disabled={_isActionPending}
                onClick={() => {
                  void handleLockUser();
                }}
                variant={'destructive'}
              >
                <Conditional isCondition={isLocking}>
                  <Loader2Icon aria-hidden className={'mr-2 size-4 animate-spin'} />
                </Conditional>
                <Conditional isCondition={!isLocking}>
                  <LockIcon aria-hidden className={'mr-2 size-4'} />
                </Conditional>
                {isLocking ? 'Locking...' : 'Lock Account'}
              </Button>
            </Conditional>

            {/* Verify Email Button */}
            <Conditional isCondition={!_isUserVerified}>
              <Button
                disabled={_isActionPending}
                onClick={() => {
                  void handleVerifyEmail();
                }}
                variant={'outline'}
              >
                <Conditional isCondition={isVerifying}>
                  <Loader2Icon aria-hidden className={'mr-2 size-4 animate-spin'} />
                </Conditional>
                <Conditional isCondition={!isVerifying}>
                  <MailCheckIcon aria-hidden className={'mr-2 size-4'} />
                </Conditional>
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </Button>
            </Conditional>

            <Button onClick={handleClose} variant={'outline'}>
              Close
            </Button>
          </DialogFooter>
        </Conditional>
      </DialogContent>
    </Dialog>
  );
};

UserDetailsDialog.displayName = 'UserDetailsDialog';

/**
 * Loading skeleton for user details dialog
 */
const UserDetailsLoadingSkeleton = () => {
  return (
    <div className={'space-y-6'} data-slot={'user-details-loading-skeleton'}>
      {/* Profile Info Skeleton */}
      <section>
        <Skeleton className={'mb-3 h-4 w-24'} />
        <div className={'flex items-start gap-4 rounded-lg border bg-muted/30 p-4'}>
          <Skeleton className={'size-16 rounded-full'} />
          <div className={'flex-1 space-y-2'}>
            <Skeleton className={'h-6 w-40'} />
            <Skeleton className={'h-4 w-32'} />
            <Skeleton className={'h-4 w-48'} />
          </div>
        </div>
      </section>

      {/* Account Status Skeleton */}
      <section>
        <Skeleton className={'mb-3 h-4 w-28'} />
        <div className={'grid grid-cols-3 gap-4'}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton className={'h-24 rounded-lg'} key={i} />
          ))}
        </div>
      </section>

      {/* Timestamps Skeleton */}
      <section>
        <Skeleton className={'mb-3 h-4 w-24'} />
        <div className={'grid grid-cols-2 gap-3'}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton className={'h-5 w-full'} key={i} />
          ))}
        </div>
      </section>

      {/* Statistics Skeleton */}
      <section>
        <Skeleton className={'mb-3 h-4 w-20'} />
        <div className={'grid grid-cols-2 gap-4'}>
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton className={'h-20 rounded-lg'} key={i} />
          ))}
        </div>
      </section>
    </div>
  );
};

UserDetailsLoadingSkeleton.displayName = 'UserDetailsLoadingSkeleton';
